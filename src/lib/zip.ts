import JSZip from "jszip";
import type { RenderedSize } from "./imageEngine";

export interface ZipEntry {
  folder: string;
  baseName: string;
  ext: string;
  sizes: RenderedSize[];
}

/**
 * Build a Twitch-ready ZIP. Files are named like `emote_112.png`
 * inside a per-asset folder so creators can upload directly.
 */
export async function buildZip(entries: ZipEntry[]): Promise<Blob> {
  const zip = new JSZip();
  for (const entry of entries) {
    const folder = zip.folder(entry.folder)!;
    for (const s of entry.sizes) {
      folder.file(`${entry.baseName}_${s.size}.${entry.ext}`, s.blob);
    }
  }
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
