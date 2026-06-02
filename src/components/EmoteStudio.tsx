"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSpec, formatBytes, type AssetSpec } from "@/lib/specs";
import {
  processStatic,
  revokeResult,
  DEFAULT_OPTIONS,
  FULL_CROP,
  BADGE_TIER_PRESETS,
  generateBadgeTiers,
  type ProcessOptions,
  type ProcessResult,
  type FitMode,
  type CropRect,
} from "@/lib/imageEngine";
import {
  processAnimated,
  isAnimatedFile,
  DEFAULT_ANIMATED,
  type AnimatedOptions,
} from "@/lib/animatedEngine";
import { removeBackground } from "@/lib/bgRemoval";
import { buildZip, downloadBlob } from "@/lib/zip";
import { track, trackView } from "@/lib/analytics";
import { saveRecent, listRecent, recentToFile, type RecentFile } from "@/lib/recentFiles";
import { makeAnimated, type AnimationPreset } from "@/lib/makeAnimated";

interface Props {
  specId: string;
}

export default function EmoteStudio({ specId }: Props) {
  const spec: AssetSpec = getSpec(specId);

  const [file, setFile] = useState<File | null>(null);
  const [working, setWorking] = useState<Blob | null>(null);
  const [animated, setAnimated] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [bgRemoved, setBgRemoved] = useState(false);

  const [opts, setOpts] = useState<ProcessOptions>(DEFAULT_OPTIONS);
  const [animOpts, setAnimOpts] = useState<AnimatedOptions>(DEFAULT_ANIMATED);
  const [darkPreview, setDarkPreview] = useState(true);

  // Badge tier variants
  const isBadgeSpec = spec.id.includes("badge");
  const [tierResults, setTierResults] = useState<{ label: string; result: ProcessResult }[] | null>(null);

  // Crop/zoom state
  const [showCrop, setShowCrop] = useState(false);
  const [cropDraft, setCropDraft] = useState<CropRect>({ ...FULL_CROP });

  const dropRef = useRef<HTMLDivElement>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [recent, setRecent] = useState<RecentFile[]>([]);

  // Stable preview URL for uploaded file (avoids object URL leaks)
  const filePreviewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);
  useEffect(() => {
    return () => { if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl); };
  }, [filePreviewUrl]);

  // Track tool view once on mount.
  useEffect(() => {
    trackView("tool", { spec: spec.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load recent-files list on mount.
  useEffect(() => {
    listRecent().then(setRecent);
  }, []);

  // Synchronize chat mockup theme with the site theme on load
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    queueMicrotask(() => {
      setDarkPreview(isDark);
    });
  }, []);

  // Load a shared preset from the URL (?p=...) on first mount.
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("p");
      if (!p) return;
      const data = JSON.parse(decodeURIComponent(atob(p))) as {
        o?: Partial<ProcessOptions>;
        a?: Partial<AnimatedOptions>;
      };
      queueMicrotask(() => {
        if (data.o) setOpts((cur) => ({ ...cur, ...data.o }));
        if (data.a) setAnimOpts((cur) => ({ ...cur, ...data.a }));
      });
    } catch {
      /* ignore malformed preset */
    }
  }, []);

  const copyShareLink = useCallback(async () => {
    try {
      const payload = btoa(encodeURIComponent(JSON.stringify({ o: opts, a: animOpts })));
      const url = `${window.location.origin}${window.location.pathname}?p=${payload}`;
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
      track("share_preset", { spec: spec.id });
    } catch {
      /* clipboard blocked */
    }
  }, [opts, animOpts, spec.id]);

  const reset = useCallback(() => {
    setResult((prev) => {
      revokeResult(prev);
      return null;
    });
    setError("");
  }, [setResult, setError]);

  const loadFile = useCallback(
    (f: File, remember = true) => {
      reset();
      setFile(f);
      setWorking(f);
      setBgRemoved(false);
      const anim = isAnimatedFile(f) && spec.animatedSupported;
      setAnimated(anim);
      if (remember) {
        saveRecent(f).then(() => listRecent().then(setRecent));
      }
    },
    [reset, spec.animatedSupported, setFile, setWorking, setBgRemoved, setAnimated, setRecent],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) loadFile(f);
    },
    [loadFile],
  );

  const runProcess = useCallback(async () => {
    if (!working) return;
    const showLoading = animated;
    if (showLoading) {
      setBusy(true);
    }
    setError("");
    try {
      if (animated) {
        const res = await processAnimated(
          working,
          spec.sizes,
          animOpts,
          spec.maxBytes,
          setProgress,
        );
        setResult((prev) => {
          if (prev) revokeResult(prev);
          return res;
        });
      } else {
        const res = await processStatic(
          working,
          spec.sizes,
          { ...opts },
          "png",
          spec.maxBytes,
        );
        setResult((prev) => {
          if (prev) revokeResult(prev);
          return res;
        });
      }
    } catch (err) {
      setError((err as Error).message || "Processing failed.");
    } finally {
      if (showLoading) {
        setBusy(false);
      }
      setProgress("");
    }
  }, [working, animated, animOpts, opts, spec, setBusy, setError, setResult, setProgress]);

  // Auto-process when file/options change (static is fast).
  useEffect(() => {
    if (working && !animated) {
      queueMicrotask(() => {
        runProcess();
      });
    }
  }, [working, animated, opts, runProcess]);

  const handleRemoveBg = useCallback(async () => {
    if (!file || animated) return;
    setBusy(true);
    setProgress("Loading AI model… (first run downloads ~10 MB)");
    try {
      const out = await removeBackground(file, (p) => {
        setProgress(`Removing background… ${Math.round(p * 100)}%`);
      });
      setWorking(out);
      setBgRemoved(true);
    } catch (err) {
      setError(
        "Background removal failed: " +
          ((err as Error)?.message || "try a clearer image or a different format."),
      );
    } finally {
      setBusy(false);
      setProgress("");
    }
  }, [file, animated, setBusy, setProgress, setWorking, setBgRemoved, setError]);

  const restoreOriginal = useCallback(() => {
    if (file) {
      setWorking(file);
      setBgRemoved(false);
      const anim = isAnimatedFile(file) && spec.animatedSupported;
      setAnimated(anim);
    }
  }, [file, spec.animatedSupported, setWorking, setBgRemoved, setAnimated]);

  const downloadZip = useCallback(async () => {
    if (!result) return;
    const ext = animated ? "gif" : "png";
    const zip = await buildZip([
      { folder: spec.zipFolder, baseName: spec.id, ext, sizes: result.sizes },
    ]);
    downloadBlob(zip, `${spec.id}-pack.zip`);
    track("download_zip", { spec: spec.id, animated });
  }, [result, animated, spec]);

  useEffect(() => () => revokeResult(result), [result]);

  const allValid =
    result && spec.maxBytes
      ? result.sizes.every((s) => s.bytes <= spec.maxBytes!)
      : true;

  return (
    <>
    <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
      {/* ---- Controls ---- */}
      <div className="space-y-5">
        {/* Mobile-only sticky live preview so edits are visible while scrolling controls */}
        {result && (
          <div className="sticky top-16 z-20 -mx-1 rounded-xl border border-zinc-800 bg-zinc-950/95 px-3 py-2 backdrop-blur lg:hidden">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-zinc-400">Live</span>
              <div className="checker flex items-center gap-2 rounded px-2 py-1">
                {result.sizes.map((s) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={s.size}
                    src={s.url}
                    alt={`${s.size}px`}
                    style={{ width: s.size, height: s.size }}
                  />
                ))}
              </div>
              {busy && <span className="text-[11px] text-violet-400">…</span>}
            </div>
          </div>
        )}
        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-center transition hover:border-violet-500"
        >
          <input
            id="file"
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
          <label htmlFor="file" className="cursor-pointer">
            <div className="text-sm text-zinc-300">
              <span className="font-semibold text-violet-400">Click to upload</span> or drag an
              image{spec.animatedSupported ? " / GIF / video" : ""} here
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              100% private — your file never leaves this device.
            </p>
          </label>
          {file && (
            <p className="mt-3 truncate text-xs text-zinc-400">
              {file.name} {animated && <span className="text-violet-400">· animated</span>}
            </p>
          )}
        </div>

        {recent.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="mb-2 text-xs font-medium text-zinc-400">Recent files</div>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <button
                  key={r.id}
                  onClick={() => loadFile(recentToFile(r), false)}
                  title={r.name}
                  className="checker h-12 w-12 overflow-hidden rounded-lg border border-zinc-700 transition hover:border-violet-500"
                >
                  {r.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumb} alt={r.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-base">🎞️</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {file && (
          <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            {!animated && (
              <>
                <Field label="Fit">
                  <select
                    value={opts.fit}
                    onChange={(e) =>
                      setOpts((o) => ({ ...o, fit: e.target.value as FitMode }))
                    }
                    className="input"
                  >
                    <option value="contain">Contain (no crop)</option>
                    <option value="cover">Cover (fill, crop)</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </Field>

                <Field label={`Padding: ${Math.round(opts.padding * 100)}%`}>
                  <input
                    type="range"
                    min={0}
                    max={0.4}
                    step={0.01}
                    value={opts.padding}
                    onChange={(e) =>
                      setOpts((o) => ({ ...o, padding: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                </Field>

                <Field label="Background">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOpts((o) => ({ ...o, background: null }))}
                      className={`chip ${opts.background === null ? "chip-on" : ""}`}
                    >
                      Transparent
                    </button>
                    <input
                      type="color"
                      value={opts.background ?? "#ffffff"}
                      onChange={(e) =>
                        setOpts((o) => ({ ...o, background: e.target.value }))
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
                    />
                  </div>
                </Field>

                <Field label={`Sticker outline: ${Math.round(opts.outline * 100)}%`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={0.12}
                      step={0.01}
                      value={opts.outline}
                      onChange={(e) =>
                        setOpts((o) => ({ ...o, outline: Number(e.target.value) }))
                      }
                      className="w-full"
                    />
                    <input
                      type="color"
                      value={opts.outlineColor}
                      onChange={(e) =>
                        setOpts((o) => ({ ...o, outlineColor: e.target.value }))
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
                    />
                  </div>
                </Field>

                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={opts.trim}
                    onChange={(e) => setOpts((o) => ({ ...o, trim: e.target.checked }))}
                  />
                  Auto-trim transparent edges
                </label>

                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={opts.circle}
                    onChange={(e) => setOpts((o) => ({ ...o, circle: e.target.checked }))}
                  />
                  Circle mask (round badge / avatar)
                </label>

                {/* Transform */}
                <Field label="Transform">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setOpts((o) => ({ ...o, rotate: (o.rotate - 90 + 360) % 360 }))}
                      className="chip"
                      title="Rotate left"
                    >
                      ↺ Left
                    </button>
                    <button
                      onClick={() => setOpts((o) => ({ ...o, rotate: (o.rotate + 90) % 360 }))}
                      className="chip"
                      title="Rotate right"
                    >
                      ↻ Right
                    </button>
                    <button
                      onClick={() => setOpts((o) => ({ ...o, flipH: !o.flipH }))}
                      className={`chip ${opts.flipH ? "chip-on" : ""}`}
                    >
                      ⇋ Flip H
                    </button>
                    <button
                      onClick={() => setOpts((o) => ({ ...o, flipV: !o.flipV }))}
                      className={`chip ${opts.flipV ? "chip-on" : ""}`}
                    >
                      ⇅ Flip V
                    </button>
                  </div>
                </Field>

                {/* Colour adjustments */}
                <Field label={`Brightness: ${Math.round(opts.brightness * 100)}%`}>
                  <input
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.01}
                    value={opts.brightness}
                    onChange={(e) =>
                      setOpts((o) => ({ ...o, brightness: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                </Field>
                <Field label={`Contrast: ${Math.round(opts.contrast * 100)}%`}>
                  <input
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.01}
                    value={opts.contrast}
                    onChange={(e) =>
                      setOpts((o) => ({ ...o, contrast: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                </Field>
                <Field label={`Saturation: ${Math.round(opts.saturate * 100)}%`}>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.01}
                    value={opts.saturate}
                    onChange={(e) =>
                      setOpts((o) => ({ ...o, saturate: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                </Field>

                <button
                  onClick={() => setOpts(DEFAULT_OPTIONS)}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Reset all adjustments
                </button>

                {/* Crop / Zoom */}
                <Field label="Crop / Zoom">
                  {!showCrop ? (
                    <button onClick={() => { setCropDraft({ ...opts.crop }); setShowCrop(true); }} className="btn-secondary w-full text-xs">
                      Open crop editor
                    </button>
                  ) : (
                    <div className="space-y-2 rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label>
                          X: {Math.round(cropDraft.x * 100)}%
                          <input type="range" min={0} max={0.9} step={0.01} value={cropDraft.x}
                            onChange={(e) => setCropDraft((c) => ({ ...c, x: Number(e.target.value) }))} className="w-full" />
                        </label>
                        <label>
                          Y: {Math.round(cropDraft.y * 100)}%
                          <input type="range" min={0} max={0.9} step={0.01} value={cropDraft.y}
                            onChange={(e) => setCropDraft((c) => ({ ...c, y: Number(e.target.value) }))} className="w-full" />
                        </label>
                        <label>
                          Width: {Math.round(cropDraft.w * 100)}%
                          <input type="range" min={0.1} max={1} step={0.01} value={cropDraft.w}
                            onChange={(e) => setCropDraft((c) => ({ ...c, w: Number(e.target.value) }))} className="w-full" />
                        </label>
                        <label>
                          Height: {Math.round(cropDraft.h * 100)}%
                          <input type="range" min={0.1} max={1} step={0.01} value={cropDraft.h}
                            onChange={(e) => setCropDraft((c) => ({ ...c, h: Number(e.target.value) }))} className="w-full" />
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setOpts((o) => ({ ...o, crop: cropDraft })); setShowCrop(false); }} className="btn-primary flex-1 text-xs">
                          Apply crop
                        </button>
                        <button onClick={() => { setCropDraft({ ...FULL_CROP }); setOpts((o) => ({ ...o, crop: { ...FULL_CROP } })); setShowCrop(false); }} className="btn-secondary flex-1 text-xs">
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </Field>

                {/* Text overlay */}
                <Field label="Text overlay">
                  <input
                    type="text"
                    placeholder="Your text here…"
                    value={opts.textOverlay.text}
                    onChange={(e) => setOpts((o) => ({ ...o, textOverlay: { ...o.textOverlay, text: e.target.value } }))}
                    className="input"
                    maxLength={30}
                  />
                  {opts.textOverlay.text && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-zinc-400">Size: {Math.round(opts.textOverlay.fontSize * 100)}%</label>
                        <input type="range" min={0.08} max={0.4} step={0.01} value={opts.textOverlay.fontSize}
                          onChange={(e) => setOpts((o) => ({ ...o, textOverlay: { ...o.textOverlay, fontSize: Number(e.target.value) } }))}
                          className="flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-zinc-400">Color</label>
                        <input type="color" value={opts.textOverlay.color}
                          onChange={(e) => setOpts((o) => ({ ...o, textOverlay: { ...o.textOverlay, color: e.target.value } }))}
                          className="h-7 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent" />
                        <label className="text-xs text-zinc-400">Stroke</label>
                        <input type="color" value={opts.textOverlay.strokeColor}
                          onChange={(e) => setOpts((o) => ({ ...o, textOverlay: { ...o.textOverlay, strokeColor: e.target.value } }))}
                          className="h-7 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent" />
                      </div>
                      <div className="flex gap-1">
                        {(["top", "center", "bottom"] as const).map((pos) => (
                          <button key={pos} onClick={() => setOpts((o) => ({ ...o, textOverlay: { ...o.textOverlay, position: pos } }))}
                            className={`chip text-[10px] ${opts.textOverlay.position === pos ? "chip-on" : ""}`}>
                            {pos}
                          </button>
                        ))}
                        <button onClick={() => setOpts((o) => ({ ...o, textOverlay: { ...o.textOverlay, bold: !o.textOverlay.bold } }))}
                          className={`chip text-[10px] ${opts.textOverlay.bold ? "chip-on" : ""}`}>
                          Bold
                        </button>
                      </div>
                    </div>
                  )}
                </Field>

                {/* Drop shadow / glow */}
                <Field label="Drop shadow / glow">
                  <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={opts.shadow.enabled}
                      onChange={(e) => setOpts((o) => ({ ...o, shadow: { ...o.shadow, enabled: e.target.checked } }))}
                    />
                    Enable shadow / glow
                  </label>
                  {opts.shadow.enabled && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-zinc-400">Color</label>
                        <input type="color" value={opts.shadow.color}
                          onChange={(e) => setOpts((o) => ({ ...o, shadow: { ...o.shadow, color: e.target.value } }))}
                          className="h-7 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent" />
                        <button
                          onClick={() => setOpts((o) => ({ ...o, shadow: { ...o.shadow, offsetX: 0, offsetY: 0, blur: 0.12 } }))}
                          className="chip text-[10px]"
                          title="Center the shadow for an even glow"
                        >
                          Glow preset
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-16 text-xs text-zinc-400">Blur {Math.round(opts.shadow.blur * 100)}%</label>
                        <input type="range" min={0} max={0.25} step={0.01} value={opts.shadow.blur}
                          onChange={(e) => setOpts((o) => ({ ...o, shadow: { ...o.shadow, blur: Number(e.target.value) } }))}
                          className="flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-16 text-xs text-zinc-400">X {Math.round(opts.shadow.offsetX * 100)}%</label>
                        <input type="range" min={-0.15} max={0.15} step={0.01} value={opts.shadow.offsetX}
                          onChange={(e) => setOpts((o) => ({ ...o, shadow: { ...o.shadow, offsetX: Number(e.target.value) } }))}
                          className="flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-16 text-xs text-zinc-400">Y {Math.round(opts.shadow.offsetY * 100)}%</label>
                        <input type="range" min={-0.15} max={0.15} step={0.01} value={opts.shadow.offsetY}
                          onChange={(e) => setOpts((o) => ({ ...o, shadow: { ...o.shadow, offsetY: Number(e.target.value) } }))}
                          className="flex-1" />
                      </div>
                    </div>
                  )}
                </Field>

                {/* Badge tier color variants */}
                {isBadgeSpec && (
                  <Field label="Badge tier color">
                    <div className="flex flex-wrap gap-1">
                      {BADGE_TIER_PRESETS.map((t) => (
                        <button key={t.label} onClick={() => setOpts((o) => ({ ...o, hueRotate: t.hueRotate }))}
                          className={`chip text-[10px] ${opts.hueRotate === t.hueRotate ? "chip-on" : ""}`}>
                          {t.label.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={async () => {
                        if (!working) return;
                        setBusy(true);
                        try {
                          const tiers = await generateBadgeTiers(working, spec.sizes, opts, "png", spec.maxBytes);
                          setTierResults(tiers);
                        } finally { setBusy(false); }
                      }}
                      disabled={busy || !working}
                      className="btn-secondary mt-2 w-full text-xs"
                    >
                      Generate all tier variants
                    </button>
                  </Field>
                )}

                <div className="flex gap-2">
                  {!animated && !bgRemoved && (
                    <button onClick={handleRemoveBg} disabled={busy} className="btn-secondary flex-1">
                      {busy && progress.toLowerCase().includes("background")
                        ? "Removing…"
                        : busy && progress.toLowerCase().includes("model")
                          ? "Loading AI…"
                          : "Remove background"}
                    </button>
                  )}
                  {(bgRemoved || (animated && file && !isAnimatedFile(file))) && (
                    <button onClick={restoreOriginal} className="btn-secondary flex-1">
                      Restore original
                    </button>
                  )}
                </div>

                {/* Make it animated */}
                {spec.animatedSupported && (
                  <Field label="✨ Make it animated">
                    <div className="flex flex-wrap gap-1">
                      {(["bounce", "shake", "pulse", "rainbow", "spin"] as AnimationPreset[]).map((p) => (
                        <button
                          key={p}
                          disabled={busy}
                          onClick={async () => {
                            if (!working) return;
                            setBusy(true);
                            try {
                              const res = await makeAnimated(working, spec.sizes, p, setProgress);
                              setResult((prev) => {
                                if (prev) revokeResult(prev);
                                return res;
                              });
                              setAnimated(true);
                              track("make_animated", { preset: p, spec: spec.id });
                            } catch (e) {
                              setError((e as Error).message || "Animation failed.");
                            } finally {
                              setBusy(false);
                              setProgress("");
                            }
                          }}
                          className="chip text-[10px]"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </Field>
                )}
              </>
            )}

            {animated && (
              <>
                <div className="rounded-lg bg-violet-500/10 px-3 py-2 text-xs text-violet-300">
                  Animated mode · powered by in-browser ffmpeg
                </div>
                <Field label={`Frame rate: ${animOpts.fps} fps`}>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={1}
                    value={animOpts.fps}
                    onChange={(e) =>
                      setAnimOpts((o) => ({ ...o, fps: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                </Field>
                <Field label="Background">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAnimOpts((o) => ({ ...o, background: null }))}
                      className={`chip ${animOpts.background === null ? "chip-on" : ""}`}
                    >
                      Transparent
                    </button>
                    <input
                      type="color"
                      value={animOpts.background ?? "#ffffff"}
                      onChange={(e) =>
                        setAnimOpts((o) => ({ ...o, background: e.target.value }))
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
                    />
                  </div>
                </Field>
                <Field label={`Brightness: ${Math.round(animOpts.brightness * 100)}%`}>
                  <input type="range" min={0.5} max={1.5} step={0.05} value={animOpts.brightness}
                    onChange={(e) => setAnimOpts((o) => ({ ...o, brightness: Number(e.target.value) }))}
                    className="w-full" />
                </Field>
                <Field label={`Contrast: ${Math.round(animOpts.contrast * 100)}%`}>
                  <input type="range" min={0.5} max={2} step={0.05} value={animOpts.contrast}
                    onChange={(e) => setAnimOpts((o) => ({ ...o, contrast: Number(e.target.value) }))}
                    className="w-full" />
                </Field>
                <Field label={`Saturation: ${Math.round(animOpts.saturate * 100)}%`}>
                  <input type="range" min={0} max={3} step={0.05} value={animOpts.saturate}
                    onChange={(e) => setAnimOpts((o) => ({ ...o, saturate: Number(e.target.value) }))}
                    className="w-full" />
                </Field>
                <Field label={`Hue shift: ${animOpts.hueRotate}°`}>
                  <input type="range" min={0} max={360} step={5} value={animOpts.hueRotate}
                    onChange={(e) => setAnimOpts((o) => ({ ...o, hueRotate: Number(e.target.value) }))}
                    className="w-full" />
                </Field>

                {/* Render the presets inside animated mode ONLY if the uploaded file is static (so they can switch styles!) */}
                {spec.animatedSupported && file && !isAnimatedFile(file) && (
                  <Field label="✨ Change animation style">
                    <div className="flex flex-wrap gap-1">
                      {(["bounce", "shake", "pulse", "rainbow", "spin"] as AnimationPreset[]).map((p) => (
                        <button
                          key={p}
                          disabled={busy}
                          onClick={async () => {
                            if (!working) return;
                            setBusy(true);
                            try {
                              const res = await makeAnimated(working, spec.sizes, p, setProgress);
                              setResult((prev) => {
                                if (prev) revokeResult(prev);
                                return res;
                              });
                              setAnimated(true);
                              track("make_animated", { preset: p, spec: spec.id });
                            } catch (e) {
                              setError((e as Error).message || "Animation failed.");
                            } finally {
                              setBusy(false);
                              setProgress("");
                            }
                          }}
                          className="chip text-[10px]"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </Field>
                )}

                {/* Revert to static option if the original file is static */}
                {file && !isAnimatedFile(file) && (
                  <button onClick={restoreOriginal} className="btn-secondary w-full text-xs">
                    ↩ Revert to static mode
                  </button>
                )}

                <button
                  onClick={() => runProcess()}
                  disabled={busy}
                  className="btn-primary w-full"
                >
                  {busy ? "Processing…" : "Generate animated emote"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ---- Right column: Preview + Downloads (sticky) ---- */}
      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-red-700 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {!file && <EmptyState spec={spec} />}

          {result && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Live preview — actual size in chat
                </h3>
                <button
                  onClick={() => setDarkPreview((v) => !v)}
                  className="chip"
                >
                  {darkPreview ? "Dark chat" : "Light chat"}
                </button>
              </div>
              <ChatMockup
                url={result.sizes.find((s) => s.size === Math.max(...spec.sizes))?.url ?? ""}
                smallUrl={result.sizes[0]?.url ?? ""}
                dark={darkPreview}
                isBadge={spec.id.includes("badge")}
              />
            </div>
          )}

          {/* File preview fallback when processing (no result yet) */}
          {!result && filePreviewUrl && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="checker mx-auto flex h-44 items-center justify-center rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={filePreviewUrl} alt="Uploaded" className="max-h-40 max-w-full rounded object-contain" />
              </div>
            </div>
          )}

          {/* Progress indicator — BELOW the photo */}
          {busy && (
            <div className="rounded-xl border border-violet-700 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-violet-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>{progress || "Processing…"}</span>
              </div>
              {progress.match(/(\d+)%/) && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-violet-900/40">
                  <div className="h-full bg-violet-400 transition-all" style={{ width: `${progress.match(/(\d+)%/)![1]}%` }} />
                </div>
              )}
            </div>
          )}

          {/* ---- Downloads & sizes ---- */}
          {result && (
            <div className="space-y-4">
        {/* Per-size cards */}
        <div className="grid gap-3 grid-cols-3">
              {result.sizes.map((s) => {
                const ok = !spec.maxBytes || s.bytes <= spec.maxBytes;
                return (
                  <div
                    key={s.size}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-center"
                  >
                    <div className="checker mx-auto mb-2 flex h-20 items-center justify-center rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.url}
                        alt={`${s.size}px`}
                        style={{ width: Math.min(s.size, 64), height: Math.min(s.size, 64), imageRendering: "auto" }}
                      />
                    </div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {s.size} × {s.size}
                    </div>
                    <div
                      className={`text-[10px] ${ok ? "text-emerald-400" : "text-amber-400"}`}
                    >
                      {formatBytes(s.bytes)} {ok ? "✓" : "⚠ over"}
                    </div>
                    <button
                      onClick={() => {
                        downloadBlob(s.blob, `${spec.id}_${s.size}.${animated ? "gif" : "png"}`);
                        track("download_size", { spec: spec.id, size: s.size, animated });
                      }}
                      className="btn-secondary mt-2 w-full text-[10px]"
                    >
                      ↓ {s.size}px
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Original size download — available after bg removal */}
            {bgRemoved && working && (
              <div className="rounded-xl border border-emerald-700/50 bg-emerald-500/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-emerald-300">
                      🖼️ Original Size (HD)
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Full resolution transparent PNG
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      downloadBlob(working, `${spec.id}_original_nobg.png`);
                      track("download_original_hd", { spec: spec.id });
                    }}
                    className="btn-primary text-sm"
                  >
                    Download Original PNG
                  </button>
                </div>
              </div>
            )}

            {/* ZIP + validation */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <div className="text-xs">
                {spec.maxBytes ? (
                  allValid ? (
                    <span className="text-emerald-400">
                      ✓ All sizes meet {spec.label} limits
                    </span>
                  ) : (
                    <span className="text-amber-400">
                      ⚠ Some sizes over {formatBytes(spec.maxBytes)} limit
                    </span>
                  )
                ) : (
                  <span className="text-zinc-400">Ready to download.</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={downloadZip} className="btn-primary text-xs">
                  Download ZIP
                </button>
                <button onClick={copyShareLink} className="btn-secondary text-xs">
                  {shareCopied ? "✓ Copied" : "🔗 Share"}
                </button>
              </div>
            </div>

            {/* Badge tier variants grid */}
            {tierResults && tierResults.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <h3 className="mb-3 text-sm font-semibold text-zinc-200">Badge tier variants</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tierResults.map((tier) => (
                    <div key={tier.label} className="rounded-lg border border-zinc-700 p-3 text-center">
                      <div className="text-xs font-medium text-zinc-300 mb-2">{tier.label}</div>
                      <div className="flex justify-center gap-1">
                        {tier.result.sizes.map((s) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={s.size} src={s.url} alt={`${tier.label} ${s.size}px`}
                            className="checker rounded" style={{ width: s.size, height: s.size }} />
                        ))}
                      </div>
                      <button
                        onClick={async () => {
                          const zip = await buildZip([{ folder: `${spec.zipFolder}-${tier.label.split(" ")[0].toLowerCase()}`, baseName: spec.id, ext: "png", sizes: tier.result.sizes }]);
                          downloadBlob(zip, `${spec.id}-${tier.label.split(" ")[0].toLowerCase()}.zip`);
                        }}
                        className="btn-secondary mt-2 w-full text-[10px]"
                      >
                        Download {tier.label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          )}
      </div>
    </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-zinc-400">{label}</div>
      {children}
    </div>
  );
}

function ChatMockup({
  url,
  smallUrl,
  dark,
  isBadge,
}: {
  url: string;
  smallUrl: string;
  dark: boolean;
  isBadge: boolean;
}) {
  const size = isBadge ? 18 : 28;
  return (
    <div
      className={`space-y-2 rounded-lg p-4 text-sm transition-colors duration-200 ${
        dark ? "bg-[#0e0e10] text-[#efeff1]" : "bg-[#f7f7f8] text-[#0f0f0f]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${dark ? "text-[#a970ff]" : "text-[#9146ff]"}`}>
          streamer_fan
        </span>
        <span className={dark ? "text-[#adadb8]" : "text-[#53535f]"}>nice clutch</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={smallUrl} alt="" className="inline-block align-middle" style={{ width: size, height: size }} />
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${dark ? "text-[#00f593]" : "text-[#008048]"}`}>
          mod_jane
        </span>
        <span className={dark ? "text-[#adadb8]" : "text-[#53535f]"}>GG</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="inline-block align-middle" style={{ width: size, height: size }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={smallUrl} alt="" className="inline-block align-middle" style={{ width: size, height: size }} />
      </div>
    </div>
  );
}

function EmptyState({ spec }: { spec: AssetSpec }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
      <div className="text-lg font-semibold text-zinc-200">{spec.label} Generator</div>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">{spec.description}</p>
      <p className="mt-4 text-xs text-zinc-500">
        Outputs: {spec.sizes.map((s) => `${s}px`).join(" · ")}
        {spec.maxBytes ? ` · under ${formatBytes(spec.maxBytes)} each` : ""}
      </p>
    </div>
  );
}
