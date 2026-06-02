// Animated emote engine using ffmpeg.wasm (lazy-loaded).
// Converts an input GIF/video into resized, size-limited animated GIFs.

import type { RenderedSize } from "./imageEngine";

type FFmpegModule = {
  load: (config?: { coreURL?: string; wasmURL?: string }) => Promise<void>;
  writeFile: (path: string, data: Uint8Array) => Promise<void>;
  readFile: (path: string) => Promise<Uint8Array>;
  deleteFile: (path: string) => Promise<void>;
  exec: (args: string[]) => Promise<number>;
};

let ffmpegInstance: FFmpegModule | null = null;
let loadingPromise: Promise<FFmpegModule> | null = null;

/** Lazily create and load a single ffmpeg.wasm instance. */
async function getFFmpeg(): Promise<FFmpegModule> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");
    const ffmpeg = new FFmpeg() as unknown as FFmpegModule;
    const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return loadingPromise;
}

export interface AnimatedOptions {
  fps: number;
  /** Square fit; animated path uses pad-to-square with contain. */
  background: string | null;
  maxColors: number;
  /** Brightness multiplier (1 = unchanged). Passed to ffmpeg eq filter. */
  brightness: number;
  /** Contrast multiplier (-1000..1000, 1 = unchanged). */
  contrast: number;
  /** Saturation multiplier (0..3, 1 = unchanged). */
  saturate: number;
  /** Hue rotation in degrees (0-360). */
  hueRotate: number;
}

export const DEFAULT_ANIMATED: AnimatedOptions = {
  fps: 24,
  background: null,
  maxColors: 256,
  brightness: 1,
  contrast: 1,
  saturate: 1,
  hueRotate: 0,
};

async function fileToUint8(file: Blob): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/**
 * Render a single animated size. Uses a generated palette for quality and
 * reduces colors/fps progressively to respect maxBytes.
 */
async function renderAnimatedSize(
  ff: FFmpegModule,
  input: string,
  size: number,
  opts: AnimatedOptions,
  maxBytes?: number,
): Promise<RenderedSize> {
  const attempts: Array<{ fps: number; colors: number }> = [
    { fps: opts.fps, colors: opts.maxColors },
    { fps: opts.fps, colors: 128 },
    { fps: Math.max(12, Math.round(opts.fps * 0.75)), colors: 128 },
    { fps: 15, colors: 64 },
    { fps: 12, colors: 32 },
  ];

  let lastBlob: Blob | null = null;

  for (const a of attempts) {
    const out = `out_${size}.gif`;
    const pad = opts.background
      ? `,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2:color=${opts.background.replace("#", "0x")}`
      : `,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`;
    const scale = `scale=${size}:${size}:force_original_aspect_ratio=decrease:flags=lanczos${pad}`;

    // Colour adjustments via eq and hue filters.
    const eqParts: string[] = [];
    if (opts.brightness !== 1) eqParts.push(`brightness=${(opts.brightness - 1).toFixed(2)}`);
    if (opts.contrast !== 1) eqParts.push(`contrast=${opts.contrast.toFixed(2)}`);
    if (opts.saturate !== 1) eqParts.push(`saturation=${opts.saturate.toFixed(2)}`);
    const eqFilter = eqParts.length ? `,eq=${eqParts.join(":")}` : "";
    const hueFilter = opts.hueRotate !== 0 ? `,hue=h=${opts.hueRotate}` : "";

    const vf =
      `fps=${a.fps},${scale}${eqFilter}${hueFilter},split[s0][s1];` +
      `[s0]palettegen=max_colors=${a.colors}:reserve_transparent=1[p];` +
      `[s1][p]paletteuse=dither=bayer:bayer_scale=5:alpha_threshold=128`;

    await ff.exec(["-i", input, "-vf", vf, "-loop", "0", out]);
    const data = await ff.readFile(out);
    await ff.deleteFile(out).catch(() => {});
    const bytes = new Uint8Array(data.length);
    bytes.set(data);
    const blob = new Blob([bytes], { type: "image/gif" });
    lastBlob = blob;
    if (!maxBytes || blob.size <= maxBytes) break;
  }

  const blob = lastBlob!;
  return { size, blob, url: URL.createObjectURL(blob), bytes: blob.size };
}

export async function processAnimated(
  file: Blob,
  targetSizes: number[],
  opts: AnimatedOptions,
  maxBytes?: number,
  onProgress?: (msg: string) => void,
): Promise<{ sizes: RenderedSize[] }> {
  onProgress?.("Loading processor…");
  const ff = await getFFmpeg();
  const input = "input_src";
  await ff.writeFile(input, await fileToUint8(file));

  const sizes: RenderedSize[] = [];
  for (const size of targetSizes) {
    onProgress?.(`Rendering ${size}px…`);
    sizes.push(await renderAnimatedSize(ff, input, size, opts, maxBytes));
  }
  await ff.deleteFile(input).catch(() => {});
  return { sizes };
}

export function isAnimatedFile(file: File): boolean {
  return (
    file.type === "image/gif" ||
    file.type === "image/apng" ||
    file.type.startsWith("video/")
  );
}
