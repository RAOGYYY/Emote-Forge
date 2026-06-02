"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  processStatic,
  DEFAULT_OPTIONS,
  revokeResult,
  type ProcessResult,
} from "@/lib/imageEngine";
import { buildZip, downloadBlob, type ZipEntry } from "@/lib/zip";
import { getSpec, formatBytes, ASSET_LIST } from "@/lib/specs";

interface Item {
  id: string;
  file: File;
  baseName: string;
  result?: ProcessResult;
  status: "queued" | "processing" | "done" | "error";
  error?: string;
}

const STATIC_SPECS = ASSET_LIST.filter((s) => s.platform !== "generic");

export default function BulkStudio() {
  const [specId, setSpecId] = useState(STATIC_SPECS[0].id);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;

  const spec = getSpec(specId);

  const addFiles = useCallback((files: FileList | File[]) => {
    const next: Item[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        baseName: f.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]/gi, "_").toLowerCase(),
        status: "queued" as const,
      }));
    setItems((prev) => [...prev, ...next]);
  }, []);

  const clearAll = useCallback(() => {
    itemsRef.current.forEach((i) => revokeResult(i.result ?? null));
    setItems([]);
    setDone(0);
  }, []);

  const processAll = useCallback(async () => {
    setBusy(true);
    setDone(0);
    const current = itemsRef.current;
    for (let i = 0; i < current.length; i++) {
      const item = current[i];
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "processing" } : p)),
      );
      try {
        const result = await processStatic(
          item.file,
          spec.sizes,
          { ...DEFAULT_OPTIONS, watermark: false },
          "png",
          spec.maxBytes,
        );
        setItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, result, status: "done" } : p)),
        );
      } catch (e) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? { ...p, status: "error", error: (e as Error).message }
              : p,
          ),
        );
      }
      setDone(i + 1);
    }
    setBusy(false);
  }, [spec]);

  const downloadPack = useCallback(async () => {
    const entries: ZipEntry[] = itemsRef.current
      .filter((i) => i.result)
      .map((i) => ({
        folder: `${spec.zipFolder}/${i.baseName}`,
        baseName: i.baseName,
        ext: "png",
        sizes: i.result!.sizes,
      }));
    if (!entries.length) return;
    const zip = await buildZip(entries);
    downloadBlob(zip, `${spec.id}-bulk-pack.zip`);
  }, [spec]);

  useEffect(() => {
    return () => itemsRef.current.forEach((i) => revokeResult(i.result ?? null));
  }, []);

  const allDone = items.length > 0 && items.every((i) => i.status === "done");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={specId}
          onChange={(e) => setSpecId(e.target.value)}
          className="input max-w-xs"
        >
          {STATIC_SPECS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} ({s.sizes.join("/")} px)
            </option>
          ))}
        </select>
      </div>

      <div
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center transition hover:border-violet-500"
      >
        <input
          id="bulk"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <label htmlFor="bulk" className="cursor-pointer">
          <div className="text-sm text-zinc-300">
            <span className="font-semibold text-violet-400">Click to upload</span> or drag many
            images here
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Process a whole emote set at once. All files stay on your device.
          </p>
        </label>
      </div>

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-zinc-400">
              {items.length} image{items.length > 1 ? "s" : ""}
              {busy && ` · processing ${done}/${items.length}`}
            </div>
            <div className="flex gap-2">
              <button onClick={clearAll} className="btn-secondary" disabled={busy}>
                Clear
              </button>
              {!allDone ? (
                <button onClick={processAll} className="btn-primary" disabled={busy}>
                  {busy ? "Processing…" : "Process all"}
                </button>
              ) : (
                <button onClick={downloadPack} className="btn-primary">
                  Download pack ZIP
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3"
              >
                <div className="checker flex h-14 w-14 shrink-0 items-center justify-center rounded-lg">
                  {item.result ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.result.sizes[item.result.sizes.length - 1].url}
                      alt=""
                      className="max-h-12 max-w-12"
                    />
                  ) : (
                    <span className="text-xs text-zinc-600">…</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-zinc-200">{item.baseName}</div>
                  <div className="text-xs text-zinc-500">
                    {item.status === "done" && item.result
                      ? item.result.sizes
                          .map((s) => `${s.size}:${formatBytes(s.bytes)}`)
                          .join("  ")
                      : item.status === "error"
                        ? "Failed"
                        : item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
