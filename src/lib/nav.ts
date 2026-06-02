// Shared navigation data — single source for header mega-menu + footer.

export interface NavTool {
  href: string;
  label: string;
  desc: string;
  icon: string;
  badge?: "Pro" | "New";
}

export interface NavGroup {
  heading: string;
  tools: NavTool[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Twitch",
    tools: [
      {
        href: "/twitch-emote-maker",
        label: "Twitch Emote Maker",
        desc: "28 / 56 / 112 px, transparent PNG, under 1 MB.",
        icon: "😀",
      },
      {
        href: "/twitch-sub-badge-maker",
        label: "Sub Badge Maker",
        desc: "18 / 36 / 72 px subscriber badges under 25 KB.",
        icon: "🏅",
      },
      {
        href: "/twitch-bit-badge-maker",
        label: "Bits Badge Maker",
        desc: "Cheer / bits badges in all required sizes.",
        icon: "💎",
      },
    ],
  },
  {
    heading: "Kick & general",
    tools: [
      {
        href: "/kick-emote-maker",
        label: "Kick Emote Maker",
        desc: "Kick-ready emotes in every chat size.",
        icon: "🟢",
      },
      {
        href: "/emote-resizer",
        label: "Emote Resizer",
        desc: "Resize any image into standard emote sizes.",
        icon: "📐",
      },
      {
        href: "/7tv-emote-maker",
        label: "7TV Emote Maker",
        desc: "7TV emotes in 32/64/96/128 px, under 2.5 MB.",
        icon: "7️⃣",
        badge: "New",
      },
      {
        href: "/bttv-emote-maker",
        label: "BTTV / FFZ Emote Maker",
        desc: "BetterTTV & FrankerFaceZ emotes in all sizes.",
        icon: "🟣",
        badge: "New",
      },
      {
        href: "/discord-sticker-maker",
        label: "Discord Sticker Maker",
        desc: "320×320 Discord stickers under 512 KB.",
        icon: "💬",
        badge: "New",
      },
      {
        href: "/emote-background-remover",
        label: "Background Remover",
        desc: "Erase backgrounds in your browser, no editor.",
        icon: "✂️",
        badge: "New",
      },
    ],
  },
  {
    heading: "Workflow",
    tools: [
      {
        href: "/emote-board",
        label: "Emote Board",
        desc: "Edit many emotes side by side, download each or all.",
        icon: "🎨",
        badge: "New",
      },
      {
        href: "/bulk-emote-pack",
        label: "Bulk Emote Pack",
        desc: "Upload many images, export one tidy ZIP.",
        icon: "📦",
      },
      {
        href: "/blog",
        label: "Guides & blog",
        desc: "Sizes, specs and emote-making tutorials.",
        icon: "📚",
      },
    ],
  },
];

// Flat list for compact menus / footer.
export const NAV_TOOLS_FLAT: NavTool[] = NAV_GROUPS.flatMap((g) => g.tools);

// Compact, ordered tool bar shown directly in the header (short labels).
export interface ToolBarItem {
  href: string;
  short: string;
  icon: string;
  badge?: "Pro" | "New";
}

export const TOOL_BAR: ToolBarItem[] = [
  { href: "/twitch-emote-maker", short: "Twitch Emote", icon: "😀" },
  { href: "/twitch-sub-badge-maker", short: "Sub Badge", icon: "🏅" },
  { href: "/twitch-bit-badge-maker", short: "Bits Badge", icon: "💎" },
  { href: "/kick-emote-maker", short: "Kick Emote", icon: "🟢" },
  { href: "/7tv-emote-maker", short: "7TV", icon: "7️⃣", badge: "New" },
  { href: "/bttv-emote-maker", short: "BTTV/FFZ", icon: "🟣", badge: "New" },
  { href: "/discord-sticker-maker", short: "Discord", icon: "💬", badge: "New" },
  { href: "/emote-resizer", short: "Resizer", icon: "📐" },
  { href: "/emote-background-remover", short: "Bg Remover", icon: "✂️" },
  { href: "/emote-board", short: "Board", icon: "🎨" },
  { href: "/bulk-emote-pack", short: "Bulk Pack", icon: "📦" },
];
