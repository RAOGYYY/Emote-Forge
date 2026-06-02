"use client";

import { useCallback, useState } from "react";
import {
  processStatic,
  revokeResult,
  DEFAULT_OPTIONS,
  type ProcessOptions,
  type ProcessResult,
} from "@/lib/imageEngine";
import { buildZip, downloadBlob } from "@/lib/zip";
import { track } from "@/lib/analytics";

interface BoardItem {
  id: string;
  name: string;
  file: File;
  opts: ProcessOptions;
  result: ProcessResult | null;
  processing: boolean;
}

const SIZES = [28, 56, 112];

export default function EmoteBoard() {
  const [selected, setSelected] = useState<string | null>(null);

  // Undo/redo using state
  const [history, setHistory] = useState<BoardItem[][]>([[]]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const items = history[historyIdx];

  const pushHistory = useCallback((nextItems: BoardItem[]) => {
    setHistory((prevHistory) => {
      const truncated = prevHistory.slice(0, historyIdx + 1);
      return [...truncated, nextItems];
    });
    setHistoryIdx((prevIdx) => prevIdx + 1);
  }, [historyIdx]);

  const undo = useCallback(() => {
    if (historyIdx <= 0) return;
    setHistoryIdx((prev) => prev - 1);
    setSelected(null);
  }, [historyIdx]);

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    setHistoryIdx((prev) => prev + 1);
    setSelected(null);
  }, [historyIdx, history.length]);

  const canUndo = historyIdx > 0;
  const canRedo = historyIdx < history.length - 1;

  const processItem = useCallback(async (item: BoardItem): Promise<BoardItem> => {
    try {
      const result = await processStatic(item.file, SIZES, item.opts, "png");
      return { ...item, result, processing: false };
    } catch {
      return { ...item, result: null, processing: false };
    }
  }, []);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const newItems: BoardItem[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      const item: BoardItem = {
        id: crypto.randomUUID(),
        name: f.name.replace(/\.[^.]+$/, ""),
        file: f,
        opts: { ...DEFAULT_OPTIONS },
        result: null,
        processing: true,
      };
      newItems.push(item);
    }
    // Process all in parallel
    const processed = await Promise.all(newItems.map(processItem));
    const nextItems = [...items, ...processed];
    pushHistory(nextItems);
    // Auto-select the first newly added item so editing panel shows immediately
    if (processed.length > 0) {
      setSelected(processed[0].id);
    }
  }, [items, processItem, pushHistory]);

  const updateItem = useCallback(async (id: string, newOpts: ProcessOptions) => {
    // Immediately show loading state by replacing items in the current index
    setHistory((prev) => {
      const next = [...prev];
      next[historyIdx] = next[historyIdx].map((i) => i.id === id ? { ...i, opts: newOpts, processing: true } : i);
      return next;
    });

    // Find and reprocess
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const updated = await processItem({ ...item, opts: newOpts });
    const nextItems = items.map((i) => i.id === id ? updated : i);
    pushHistory(nextItems);
  }, [items, historyIdx, processItem, pushHistory]);

  const removeItem = useCallback((id: string) => {
    const item = items.find((i) => i.id === id);
    if (item?.result) revokeResult(item.result);
    const nextItems = items.filter((i) => i.id !== id);
    pushHistory(nextItems);
    if (selected === id) setSelected(null);
  }, [items, selected, pushHistory]);

  const downloadAll = useCallback(async () => {
    const packs = items
      .filter((i) => i.result)
      .map((i) => ({
        folder: i.name,
        baseName: i.name,
        ext: "png" as const,
        sizes: i.result!.sizes,
      }));
    if (!packs.length) return;
    const zip = await buildZip(packs);
    downloadBlob(zip, "emote-board-pack.zip");
    track("download_board", { count: packs.length });
  }, [items]);

  const downloadItemZip = useCallback(async (item: BoardItem) => {
    if (!item.result) return;
    const zip = await buildZip([
      { folder: item.name, baseName: item.name, ext: "png", sizes: item.result.sizes },
    ]);
    downloadBlob(zip, `${item.name}.zip`);
    track("download_board_item", { name: item.name });
  }, []);

  const selectedItem = items.find((i) => i.id === selected);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-50">Emote Board</h1>
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={!canUndo} className="btn-secondary text-xs" title="Undo">
            ↩ Undo
          </button>
          <button onClick={redo} disabled={!canRedo} className="btn-secondary text-xs" title="Redo">
            ↪ Redo
          </button>
          <button onClick={downloadAll} disabled={!items.some((i) => i.result)} className="btn-primary text-xs">
            Download all as ZIP
          </button>
        </div>
      </div>

      {/* Upload area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
        className="mb-6 cursor-pointer rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-center transition hover:border-violet-500"
        onClick={() => {
          const inp = document.createElement("input");
          inp.type = "file"; inp.multiple = true; inp.accept = "image/*";
          inp.onchange = () => { if (inp.files?.length) addFiles(inp.files); };
          inp.click();
        }}
      >
        <div className="text-sm text-zinc-300">Drop images here or click to add emotes to your board</div>
        <p className="mt-1 text-xs text-zinc-500">Add multiple images — edit all at once, download as one pack.</p>
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <div className="text-lg font-semibold text-zinc-200">Your emote board is empty</div>
          <p className="mt-2 text-sm text-zinc-400">Upload images to start building your emote set. Undo/redo supported.</p>
        </div>
      )}

      {/* Board grid */}
      <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item.id)}
            className={`cursor-pointer rounded-xl border p-3 text-center transition ${
              selected === item.id ? "border-violet-500 bg-violet-600/10" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"
            }`}
          >
            {item.processing ? (
              <div className="flex h-20 items-center justify-center text-xs text-zinc-500">Processing…</div>
            ) : item.result ? (
              <div className="checker mx-auto flex h-20 items-center justify-center rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.result.sizes[item.result.sizes.length - 1].url} alt={item.name}
                  className="max-h-16 max-w-16" />
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center text-xs text-red-400">Error</div>
            )}
            <div className="mt-2 truncate text-xs font-medium text-zinc-200">{item.name}</div>
            <div className="mt-1 flex items-center justify-center gap-2">
              {item.result && (
                <button onClick={(e) => { e.stopPropagation(); downloadItemZip(item); }}
                  className="text-[10px] text-violet-500 hover:text-violet-400">
                  ↓ ZIP
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                className="text-[10px] text-zinc-600 hover:text-red-400">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected item editor */}
      {selectedItem && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-200">
            Editing: {selectedItem.name}
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-3">
              <label className="block text-xs text-zinc-400">
                Padding: {Math.round(selectedItem.opts.padding * 100)}%
                <input type="range" min={0} max={0.4} step={0.01} value={selectedItem.opts.padding}
                  onChange={(e) => updateItem(selectedItem.id, { ...selectedItem.opts, padding: Number(e.target.value) })}
                  className="w-full" />
              </label>
              <label className="block text-xs text-zinc-400">
                Brightness: {Math.round(selectedItem.opts.brightness * 100)}%
                <input type="range" min={0.5} max={1.5} step={0.01} value={selectedItem.opts.brightness}
                  onChange={(e) => updateItem(selectedItem.id, { ...selectedItem.opts, brightness: Number(e.target.value) })}
                  className="w-full" />
              </label>
              <label className="block text-xs text-zinc-400">
                Hue rotate: {selectedItem.opts.hueRotate}°
                <input type="range" min={0} max={360} step={1} value={selectedItem.opts.hueRotate}
                  onChange={(e) => updateItem(selectedItem.id, { ...selectedItem.opts, hueRotate: Number(e.target.value) })}
                  className="w-full" />
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-300">
                <input type="checkbox" checked={selectedItem.opts.circle}
                  onChange={(e) => updateItem(selectedItem.id, { ...selectedItem.opts, circle: e.target.checked })} />
                Circle mask
              </label>
            </div>
            <div className="sm:col-span-2">
              {selectedItem.result && (
                <>
                  <div className="flex flex-wrap items-end gap-3">
                    {selectedItem.result.sizes.map((s) => (
                      <div key={s.size} className="text-center">
                        <div className="checker inline-block rounded">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.url} alt={`${s.size}px`} style={{ width: s.size, height: s.size }} />
                        </div>
                        <div className="mt-1 text-[10px] text-zinc-500">{s.size}px</div>
                        <button
                          onClick={() => {
                            downloadBlob(s.blob, `${selectedItem.name}_${s.size}.png`);
                            track("download_board_size", { size: s.size });
                          }}
                          className="btn-secondary mt-1 w-full px-2 py-1 text-[10px]"
                        >
                          ↓ {s.size}px
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => downloadItemZip(selectedItem)}
                    className="btn-primary mt-3 text-xs"
                  >
                    Download this emote (ZIP)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
