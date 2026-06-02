// Single source of truth for all platform asset specifications.
// Update here if Twitch/Kick change their requirements.

export type AssetFormat = "png" | "gif";

export interface AssetSpec {
  /** Unique slug used in routes and state. */
  id: string;
  /** Human readable label. */
  label: string;
  /** Platform grouping. */
  platform: "twitch" | "kick" | "generic";
  /** Short marketing/utility description. */
  description: string;
  /** Required output square sizes in px. */
  sizes: number[];
  /** Allowed output formats; first is the default. */
  formats: AssetFormat[];
  /** Max file size per exported size, in bytes. undefined = no hard limit. */
  maxBytes?: number;
  /** Whether transparency is expected/recommended. */
  transparent: boolean;
  /** Folder name used inside the downloadable ZIP. */
  zipFolder: string;
  /** Whether animated input (GIF/APNG/video) is supported for this asset. */
  animatedSupported: boolean;
}

const KB = 1024;
const MB = 1024 * 1024;

export const ASSET_SPECS: Record<string, AssetSpec> = {
  "twitch-emote": {
    id: "twitch-emote",
    label: "Twitch Emote",
    platform: "twitch",
    description:
      "Static Twitch emote in all three required sizes (28, 56, 112 px), transparent PNG, under 1 MB each.",
    sizes: [28, 56, 112],
    formats: ["png", "gif"],
    maxBytes: 1 * MB,
    transparent: true,
    zipFolder: "twitch-emote",
    animatedSupported: true,
  },
  "twitch-sub-badge": {
    id: "twitch-sub-badge",
    label: "Twitch Sub Badge",
    platform: "twitch",
    description:
      "Subscriber badges in all three required sizes (18, 36, 72 px), transparent PNG, under 25 KB each.",
    sizes: [18, 36, 72],
    formats: ["png"],
    maxBytes: 25 * KB,
    transparent: true,
    zipFolder: "twitch-sub-badge",
    animatedSupported: false,
  },
  "twitch-bit-badge": {
    id: "twitch-bit-badge",
    label: "Twitch Bits Badge",
    platform: "twitch",
    description:
      "Bits (cheer) badges in all three required sizes (18, 36, 72 px), transparent PNG, under 25 KB each.",
    sizes: [18, 36, 72],
    formats: ["png"],
    maxBytes: 25 * KB,
    transparent: true,
    zipFolder: "twitch-bit-badge",
    animatedSupported: false,
  },
  "kick-emote": {
    id: "kick-emote",
    label: "Kick Emote",
    platform: "kick",
    description:
      "Kick emote exported in 28, 56 and 112 px, transparent PNG, optimized for Kick chat.",
    sizes: [28, 56, 112],
    formats: ["png", "gif"],
    maxBytes: 1 * MB,
    transparent: true,
    zipFolder: "kick-emote",
    animatedSupported: true,
  },
  "generic-emote": {
    id: "generic-emote",
    label: "Emote Resizer",
    platform: "generic",
    description:
      "Resize any image into standard emote sizes (28, 56, 112 px) with transparent PNG output.",
    sizes: [28, 56, 112],
    formats: ["png", "gif"],
    maxBytes: undefined,
    transparent: true,
    zipFolder: "emote",
    animatedSupported: true,
  },
  "7tv-emote": {
    id: "7tv-emote",
    label: "7TV Emote",
    platform: "generic",
    description:
      "7TV emotes in 1x (32), 2x (64), 3x (96), 4x (128) sizes. Transparent PNG/GIF, max 2.5 MB.",
    sizes: [32, 64, 96, 128],
    formats: ["png", "gif"],
    maxBytes: 2.5 * MB,
    transparent: true,
    zipFolder: "7tv-emote",
    animatedSupported: true,
  },
  "bttv-emote": {
    id: "bttv-emote",
    label: "BTTV / FFZ Emote",
    platform: "generic",
    description:
      "BetterTTV and FrankerFaceZ emotes in 1x (28), 2x (56), 4x (112) sizes. PNG/GIF, max 2.5 MB.",
    sizes: [28, 56, 112],
    formats: ["png", "gif"],
    maxBytes: 2.5 * MB,
    transparent: true,
    zipFolder: "bttv-emote",
    animatedSupported: true,
  },
  "discord-sticker": {
    id: "discord-sticker",
    label: "Discord Sticker",
    platform: "generic",
    description:
      "Discord stickers at 320×320 px. Transparent PNG or APNG, max 512 KB.",
    sizes: [320],
    formats: ["png", "gif"],
    maxBytes: 512 * KB,
    transparent: true,
    zipFolder: "discord-sticker",
    animatedSupported: true,
  },
};

export const ASSET_LIST = Object.values(ASSET_SPECS);

export function getSpec(id: string): AssetSpec {
  const spec = ASSET_SPECS[id];
  if (!spec) throw new Error(`Unknown asset spec: ${id}`);
  return spec;
}

export function formatBytes(bytes: number): string {
  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(2)} MB`;
}
