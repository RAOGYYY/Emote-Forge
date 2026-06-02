// Browser-side static image processing engine (Canvas based).
// All processing happens locally; nothing is uploaded.

export type FitMode = "contain" | "cover" | "stretch";

export interface TextOverlay {
  text: string;
  fontSize: number; // fraction of canvas size (e.g. 0.2)
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number; // fraction of font size (0 = no stroke)
  position: "top" | "center" | "bottom";
  bold: boolean;
}

export const DEFAULT_TEXT_OVERLAY: TextOverlay = {
  text: "",
  fontSize: 0.18,
  fontFamily: "sans-serif",
  color: "#ffffff",
  strokeColor: "#000000",
  strokeWidth: 0.15,
  position: "bottom",
  bold: true,
};

export interface CropRect {
  x: number; // fraction 0-1
  y: number;
  w: number;
  h: number;
}

export const FULL_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 };

export interface Shadow {
  enabled: boolean;
  color: string;
  /** Blur radius as a fraction of canvas size. */
  blur: number;
  /** Horizontal offset as a fraction of canvas size. */
  offsetX: number;
  /** Vertical offset as a fraction of canvas size. */
  offsetY: number;
}

export const DEFAULT_SHADOW: Shadow = {
  enabled: false,
  color: "#000000",
  blur: 0.08,
  offsetX: 0.02,
  offsetY: 0.03,
};

export interface ProcessOptions {
  /** How the source is fitted into the square canvas. */
  fit: FitMode;
  /** Inner padding as a fraction of the target size (0–0.4). */
  padding: number;
  /** Background color. null/transparent keeps alpha. */
  background: string | null;
  /** Outline (sticker-style) thickness as a fraction of size (0 = none). */
  outline: number;
  /** Outline color. */
  outlineColor: string;
  /** Trim fully-transparent borders from the source before fitting. */
  trim: boolean;
  /** Rotation in degrees (multiples of 90). */
  rotate: number;
  /** Mirror horizontally. */
  flipH: boolean;
  /** Mirror vertically. */
  flipV: boolean;
  /** Brightness multiplier (1 = unchanged). */
  brightness: number;
  /** Contrast multiplier (1 = unchanged). */
  contrast: number;
  /** Saturation multiplier (1 = unchanged). */
  saturate: number;
  /** Clip the output to a circle (great for badges / avatars). */
  circle: boolean;
  /** Stamp a small free-tier watermark on the output. */
  watermark?: boolean;
  /** Text overlay rendered on top. */
  textOverlay: TextOverlay;
  /** Crop rectangle (fractions 0-1 of source). */
  crop: CropRect;
  /** Hue rotation in degrees (0-360). Used for badge color variants. */
  hueRotate: number;
  /** Drop shadow / glow cast by the artwork silhouette. */
  shadow: Shadow;
}

export const DEFAULT_OPTIONS: ProcessOptions = {
  fit: "contain",
  padding: 0.04,
  background: null,
  outline: 0,
  outlineColor: "#ffffff",
  trim: true,
  rotate: 0,
  flipH: false,
  flipV: false,
  brightness: 1,
  contrast: 1,
  saturate: 1,
  circle: false,
  watermark: false,
  textOverlay: { ...DEFAULT_TEXT_OVERLAY },
  crop: { ...FULL_CROP },
  hueRotate: 0,
  shadow: { ...DEFAULT_SHADOW },
};

export interface RenderedSize {
  size: number;
  blob: Blob;
  url: string;
  bytes: number;
}

/** Decode a File/Blob into an ImageBitmap. */
export async function decodeImage(file: Blob): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

/** Draw a source bitmap onto a square canvas of `size` using the given options. */
function drawSquare(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  size: number,
  opts: ProcessOptions,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (opts.background) {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, size, size);
  }

  const pad = Math.round(size * clamp(opts.padding, 0, 0.4));
  const box = size - pad * 2;

  let dw = box;
  let dh = box;
  const ratio = srcW / srcH;

  if (opts.fit === "contain") {
    if (ratio > 1) {
      dw = box;
      dh = box / ratio;
    } else {
      dh = box;
      dw = box * ratio;
    }
  } else if (opts.fit === "cover") {
    if (ratio > 1) {
      dh = box;
      dw = box * ratio;
    } else {
      dw = box;
      dh = box / ratio;
    }
  }
  // stretch leaves dw = dh = box

  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;

  // Colour adjustments via canvas filter (reset right after the draw).
  const filter = buildFilter(opts);

  if (opts.fit === "cover") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad, pad, box, box);
    ctx.clip();
    ctx.filter = filter;
    if (opts.shadow.enabled) setShadow(ctx, size, opts.shadow);
    ctx.drawImage(source, dx, dy, dw, dh);
    ctx.restore();
  } else {
    ctx.save();
    ctx.filter = filter;
    if (opts.shadow.enabled) setShadow(ctx, size, opts.shadow);
    ctx.drawImage(source, dx, dy, dw, dh);
    ctx.restore();
  }

  // Circular mask (keep only pixels inside the padded circle).
  if (opts.circle) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, box / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (opts.outline > 0) {
    applyOutline(canvas, ctx, Math.max(1, Math.round(size * opts.outline)), opts.outlineColor);
  }



  // Text overlay (rendered last so it's on top of everything).
  if (opts.textOverlay.text.trim()) {
    drawTextOverlay(ctx, size, opts.textOverlay);
  }

  return canvas;
}

/** Apply drop-shadow / glow context state (cleared by surrounding save/restore). */
function setShadow(ctx: CanvasRenderingContext2D, size: number, s: Shadow): void {
  ctx.shadowColor = s.color;
  ctx.shadowBlur = Math.max(0, Math.round(size * s.blur));
  ctx.shadowOffsetX = Math.round(size * s.offsetX);
  ctx.shadowOffsetY = Math.round(size * s.offsetY);
}

/** Build a CSS/canvas filter string from the colour-adjustment options. */
function buildFilter(opts: ProcessOptions): string {
  const parts: string[] = [];
  if (opts.brightness !== 1) parts.push(`brightness(${opts.brightness})`);
  if (opts.contrast !== 1) parts.push(`contrast(${opts.contrast})`);
  if (opts.saturate !== 1) parts.push(`saturate(${opts.saturate})`);
  if (opts.hueRotate !== 0) parts.push(`hue-rotate(${opts.hueRotate}deg)`);
  return parts.length ? parts.join(" ") : "none";
}

/** Apply rotation (multiples of 90°) and mirroring to a source, returning an oriented canvas. */
function orientSource(
  source: CanvasImageSource,
  w: number,
  h: number,
  rotate: number,
  flipH: boolean,
  flipV: boolean,
): { source: CanvasImageSource; w: number; h: number } {
  const rot = (((rotate % 360) + 360) % 360);
  if (rot === 0 && !flipH && !flipV) return { source, w, h };
  const swap = rot === 90 || rot === 270;
  const cw = swap ? h : w;
  const ch = swap ? w : h;
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(cw / 2, ch / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(source, -w / 2, -h / 2, w, h);
  return { source: c, w: cw, h: ch };
}



/** Render a text label overlay onto the emote canvas. */
function drawTextOverlay(ctx: CanvasRenderingContext2D, size: number, t: TextOverlay): void {
  const fontSize = Math.max(6, Math.round(size * clamp(t.fontSize, 0.05, 0.5)));
  const weight = t.bold ? "bold" : "normal";
  ctx.save();
  ctx.font = `${weight} ${fontSize}px ${t.fontFamily}`;
  ctx.textAlign = "center";

  let y: number;
  if (t.position === "top") {
    ctx.textBaseline = "top";
    y = Math.round(size * 0.06);
  } else if (t.position === "center") {
    ctx.textBaseline = "middle";
    y = size / 2;
  } else {
    ctx.textBaseline = "bottom";
    y = size - Math.round(size * 0.06);
  }

  const x = size / 2;

  if (t.strokeWidth > 0) {
    ctx.strokeStyle = t.strokeColor;
    ctx.lineWidth = Math.max(1, Math.round(fontSize * t.strokeWidth));
    ctx.lineJoin = "round";
    ctx.strokeText(t.text, x, y);
  }

  ctx.fillStyle = t.color;
  ctx.fillText(t.text, x, y);
  ctx.restore();
}

/** Sticker-style outline by dilating the alpha silhouette. */
function applyOutline(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  thickness: number,
  color: string,
): void {
  const { width, height } = canvas;
  const original = ctx.getImageData(0, 0, width, height);

  const outline = document.createElement("canvas");
  outline.width = width;
  outline.height = height;
  const octx = outline.getContext("2d")!;

  // Stamp the silhouette around the original in all directions.
  const silhouette = document.createElement("canvas");
  silhouette.width = width;
  silhouette.height = height;
  const sctx = silhouette.getContext("2d")!;
  sctx.drawImage(canvas, 0, 0);
  sctx.globalCompositeOperation = "source-in";
  sctx.fillStyle = color;
  sctx.fillRect(0, 0, width, height);

  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
    const ox = Math.cos(angle) * thickness;
    const oy = Math.sin(angle) * thickness;
    octx.drawImage(silhouette, ox, oy);
  }

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(outline, 0, 0);
  ctx.putImageData(original, 0, 0);
  // Composite original on top of the outline.
  const composed = document.createElement("canvas");
  composed.width = width;
  composed.height = height;
  const cctx = composed.getContext("2d")!;
  cctx.drawImage(outline, 0, 0);
  cctx.drawImage(canvas, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(composed, 0, 0);
}

/** Find the tight bounding box of non-transparent pixels. */
function getTrimBounds(bitmap: ImageBitmap): { x: number; y: number; w: number; h: number } {
  const c = document.createElement("canvas");
  c.width = bitmap.width;
  c.height = bitmap.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  let minX = c.width;
  let minY = c.height;
  let maxX = 0;
  let maxY = 0;
  let found = false;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const alpha = data[(y * c.width + x) * 4 + 3];
      if (alpha > 8) {
        found = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) return { x: 0, y: 0, w: bitmap.width, h: bitmap.height };
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      quality,
    );
  });
}

/** Posterize (reduce color precision) to shrink PNG size while keeping alpha. */
function posterize(canvas: HTMLCanvasElement, levels: number): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  const step = 255 / (levels - 1);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.round(Math.round(d[i] / step) * step);
    d[i + 1] = Math.round(Math.round(d[i + 1] / step) * step);
    d[i + 2] = Math.round(Math.round(d[i + 2] / step) * step);
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * Render one square size, then optimize to fit maxBytes if needed.
 * For PNG: try lossless first, then progressive posterization.
 */
async function renderSize(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  size: number,
  opts: ProcessOptions,
  format: "png" | "webp",
  maxBytes?: number,
): Promise<RenderedSize> {
  const type = format === "png" ? "image/png" : "image/webp";
  let canvas = drawSquare(source, srcW, srcH, size, opts);
  let blob = await canvasToBlob(canvas, type);

  if (maxBytes && blob.size > maxBytes) {
    if (format === "webp") {
      // WebP supports quality directly.
      for (let q = 0.92; q >= 0.4 && blob.size > maxBytes; q -= 0.1) {
        blob = await canvasToBlob(canvas, type, q);
      }
    } else {
      // PNG: posterize progressively (32 -> 6 levels).
      for (const levels of [32, 24, 16, 12, 8, 6]) {
        canvas = drawSquare(source, srcW, srcH, size, opts);
        posterize(canvas, levels);
        blob = await canvasToBlob(canvas, type);
        if (blob.size <= maxBytes) break;
      }
    }
  }

  return { size, blob, url: URL.createObjectURL(blob), bytes: blob.size };
}

export interface ProcessResult {
  sizes: RenderedSize[];
}

/** Process a static image into all target sizes. */
export async function processStatic(
  file: Blob,
  targetSizes: number[],
  opts: ProcessOptions,
  format: "png" | "webp" = "png",
  maxBytes?: number,
): Promise<ProcessResult> {
  const bitmap = await decodeImage(file);

  let source: CanvasImageSource = bitmap;
  let srcW = bitmap.width;
  let srcH = bitmap.height;

  if (opts.trim) {
    const b = getTrimBounds(bitmap);
    const trimmed = document.createElement("canvas");
    trimmed.width = b.w;
    trimmed.height = b.h;
    trimmed.getContext("2d")!.drawImage(bitmap, b.x, b.y, b.w, b.h, 0, 0, b.w, b.h);
    source = trimmed;
    srcW = b.w;
    srcH = b.h;
  }

  // Apply crop (fractions of source dimensions).
  const c = opts.crop;
  if (c.x !== 0 || c.y !== 0 || c.w !== 1 || c.h !== 1) {
    const cx = Math.round(srcW * clamp(c.x, 0, 1));
    const cy = Math.round(srcH * clamp(c.y, 0, 1));
    const cw = Math.max(1, Math.round(srcW * clamp(c.w, 0.01, 1)));
    const ch = Math.max(1, Math.round(srcH * clamp(c.h, 0.01, 1)));
    const cropped = document.createElement("canvas");
    cropped.width = cw;
    cropped.height = ch;
    cropped.getContext("2d")!.drawImage(source, cx, cy, cw, ch, 0, 0, cw, ch);
    source = cropped;
    srcW = cw;
    srcH = ch;
  }

  // Apply rotation / mirroring before fitting into the square.
  const oriented = orientSource(source, srcW, srcH, opts.rotate, opts.flipH, opts.flipV);
  source = oriented.source;
  srcW = oriented.w;
  srcH = oriented.h;

  // Convert canvas source to ImageBitmap to bypass Safari filter drawImage bug
  let tempBitmap: ImageBitmap | null = null;
  if (source instanceof HTMLCanvasElement) {
    tempBitmap = await createImageBitmap(source);
    source = tempBitmap;
  }

  const sizes: RenderedSize[] = [];
  for (const size of targetSizes) {
    sizes.push(await renderSize(source, srcW, srcH, size, opts, format, maxBytes));
  }
  if (tempBitmap) {
    tempBitmap.close();
  }
  bitmap.close?.();
  return { sizes };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function revokeResult(result: ProcessResult | null): void {
  result?.sizes.forEach((s) => URL.revokeObjectURL(s.url));
}

/** Badge tier presets (hue-rotate values) for common sub-badge tiers. */
export const BADGE_TIER_PRESETS: { label: string; hueRotate: number }[] = [
  { label: "Original", hueRotate: 0 },
  { label: "1-month (Bronze)", hueRotate: 25 },
  { label: "3-month (Silver)", hueRotate: 180 },
  { label: "6-month (Gold)", hueRotate: 45 },
  { label: "12-month (Platinum)", hueRotate: 260 },
  { label: "24-month (Diamond)", hueRotate: 300 },
];

/**
 * Generate a full set of badge tier variants from a single source.
 * Returns one ProcessResult per tier preset (each with all sizes).
 */
export async function generateBadgeTiers(
  file: Blob,
  targetSizes: number[],
  baseOpts: ProcessOptions,
  format: "png" | "webp" = "png",
  maxBytes?: number,
): Promise<{ label: string; result: ProcessResult }[]> {
  const results: { label: string; result: ProcessResult }[] = [];
  for (const tier of BADGE_TIER_PRESETS) {
    const tierOpts = { ...baseOpts, hueRotate: tier.hueRotate };
    const result = await processStatic(file, targetSizes, tierOpts, format, maxBytes);
    results.push({ label: tier.label, result });
  }
  return results;
}
