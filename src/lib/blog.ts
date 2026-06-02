// Blog content store. Posts are structured as typed blocks so they render
// with consistent styling and can emit Article JSON-LD for SEO.

export type Block =
  | { t: "h2"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "table"; head: string[]; rows: string[][] };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readMinutes: number;
  tag: string;
  hero: string; // emoji
  body: Block[];
  faq?: { q: string; a: string }[];
  cta?: { label: string; href: string };
}

export const POSTS: BlogPost[] = [
  {
    slug: "twitch-emote-sizes-guide",
    title: "Twitch Emote Sizes in 2026: The Complete Guide",
    description:
      "Exact Twitch emote dimensions, file size limits and format rules for emotes, sub badges and bits badges — plus how to export every size in one click.",
    date: "2026-01-12",
    readMinutes: 6,
    tag: "Guides",
    hero: "📐",
    body: [
      {
        t: "p",
        text: "Twitch requires you to upload your emote at three exact pixel sizes. If even one is the wrong size or too heavy, the upload is rejected. This guide lists every requirement for 2026 and shows the fastest way to hit them.",
      },
      { t: "h2", text: "Twitch emote sizes" },
      {
        t: "p",
        text: "A standard Twitch emote must be supplied at 28×28, 56×56 and 112×112 pixels as a transparent PNG. Each file must stay under 1 MB.",
      },
      {
        t: "table",
        head: ["Asset", "Sizes (px)", "Format", "Max size"],
        rows: [
          ["Emote", "28, 56, 112", "PNG (transparent)", "1 MB each"],
          ["Animated emote", "28, 56, 112", "GIF", "1 MB each"],
          ["Sub badge", "18, 36, 72", "PNG (transparent)", "25 KB each"],
          ["Bits badge", "18, 36, 72", "PNG (transparent)", "25 KB each"],
        ],
      },
      { t: "h2", text: "Why the smallest size matters most" },
      {
        t: "p",
        text: "Your emote is shown at 28×28 the vast majority of the time. Fine details, thin lines and small text disappear at that size. Design for 28px first, then scale up — not the other way around.",
      },
      {
        t: "ul",
        items: [
          "Use bold shapes and a clear silhouette.",
          "Add a 2–4px outline so the emote pops on both dark and light chat.",
          "Keep important elements away from the edges.",
          "Test on a real chat background before exporting.",
        ],
      },
      { t: "h2", text: "Export all sizes in one click" },
      {
        t: "p",
        text: "Instead of resizing each file by hand in Photoshop, drop one high-resolution image into the EmoteForge Twitch Emote Maker. It generates all three sizes, checks them against Twitch's limits, shows a live 28px chat preview, and exports a ready-to-upload ZIP — entirely in your browser, with nothing uploaded to a server.",
      },
    ],
    faq: [
      {
        q: "What size should I design my Twitch emote at?",
        a: "Create the artwork at 112×112 px (or larger and scale down). Twitch needs 28, 56 and 112 px versions, and EmoteForge generates all three automatically.",
      },
      {
        q: "What is the Twitch emote file size limit?",
        a: "Each PNG emote must be under 1 MB. Sub and bits badges must be under 25 KB each.",
      },
    ],
    cta: { label: "Open the Twitch Emote Maker", href: "/twitch-emote-maker" },
  },
  {
    slug: "how-to-make-animated-twitch-emotes",
    title: "How to Make Animated Twitch Emotes (No Software)",
    description:
      "Turn a GIF or short video into a looping, Twitch-ready animated emote at 28, 56 and 112 px — without After Effects, right in your browser.",
    date: "2026-02-03",
    readMinutes: 5,
    tag: "Tutorials",
    hero: "🎞️",
    body: [
      {
        t: "p",
        text: "Animated emotes are a Tier 1/2/3 sub perk and a great way to make your channel feel premium. The hard part is hitting Twitch's strict size limits while keeping the animation smooth. Here's how to do it without paid software.",
      },
      { t: "h2", text: "Animated emote requirements" },
      {
        t: "ul",
        items: [
          "Sizes: 28×28, 56×56 and 112×112 px.",
          "Format: animated GIF.",
          "File size: under 1 MB per size.",
          "Frame rate: keep it at or below 60 fps; lower fps helps you fit the size limit.",
        ],
      },
      { t: "h2", text: "Step by step" },
      {
        t: "ul",
        items: [
          "Start from a short GIF or video clip (1–3 seconds works best).",
          "Open the Twitch Emote Maker and switch to the animated tab.",
          "Trim, add padding and pick a fit mode so the subject is centred.",
          "Export — the tool reduces colours and frame rate just enough to stay under 1 MB.",
        ],
      },
      { t: "h2", text: "Tips for smooth, small GIFs" },
      {
        t: "ul",
        items: [
          "Shorter loops compress far better than long ones.",
          "Solid or transparent backgrounds shrink the file dramatically.",
          "Avoid heavy gradients and noise — they bloat GIF size.",
          "If a size is over the limit, drop the fps to 24 or 30.",
        ],
      },
      {
        t: "p",
        text: "EmoteForge processes everything locally with a WebAssembly build of FFmpeg, so your clip never leaves your device and there are no upload queues.",
      },
    ],
    faq: [
      {
        q: "Do I need After Effects to make animated emotes?",
        a: "No. You can convert a GIF or short video directly in the browser with EmoteForge — no installs, no account.",
      },
      {
        q: "Why is my animated emote rejected by Twitch?",
        a: "Usually it is over the 1 MB limit or not exactly 28/56/112 px. EmoteForge auto-optimises frame rate and colours to fit the limit at every size.",
      },
    ],
    cta: { label: "Make an animated emote", href: "/twitch-emote-maker" },
  },
  {
    slug: "twitch-vs-kick-emote-specs",
    title: "Twitch vs Kick Emotes: Sizes, Limits and How to Reuse Art",
    description:
      "A side-by-side comparison of Twitch and Kick emote specifications, and how to export one piece of art for both platforms in seconds.",
    date: "2026-03-09",
    readMinutes: 4,
    tag: "Guides",
    hero: "🟢",
    body: [
      {
        t: "p",
        text: "Streaming on both Twitch and Kick? You can reuse the same artwork — you just need the right sizes for each platform. Here's how they compare.",
      },
      { t: "h2", text: "Side-by-side specs" },
      {
        t: "table",
        head: ["Spec", "Twitch", "Kick"],
        rows: [
          ["Emote sizes", "28, 56, 112 px", "28, 56, 112 px"],
          ["Format", "PNG / GIF", "PNG / GIF"],
          ["Transparency", "Yes", "Yes"],
          ["Max size", "1 MB", "Optimised for chat"],
        ],
      },
      { t: "h2", text: "Reusing one design for both" },
      {
        t: "p",
        text: "Because both platforms use the same 28/56/112 px sizes, a single transparent PNG export works almost everywhere. Design once, export the standard set, and upload to each platform's creator dashboard.",
      },
      {
        t: "ul",
        items: [
          "Keep a transparent background so the emote sits cleanly on any chat colour.",
          "Use the live preview to confirm it reads at 28px.",
          "Export a ZIP so you have every size organised and ready.",
        ],
      },
      {
        t: "p",
        text: "Use the Kick Emote Maker for Kick-tuned output, or the Twitch Emote Maker for Twitch — both run fully in your browser.",
      },
    ],
    faq: [
      {
        q: "Can I use the same emote on Twitch and Kick?",
        a: "Yes. Both use 28, 56 and 112 px transparent emotes, so the same export works on both platforms.",
      },
    ],
    cta: { label: "Open the Kick Emote Maker", href: "/kick-emote-maker" },
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export const POSTS_SORTED = [...POSTS].sort((a, b) =>
  a.date < b.date ? 1 : -1,
);
