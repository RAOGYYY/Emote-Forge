import type { Metadata } from "next";
import ToolPage from "@/components/ToolPage";

export const metadata: Metadata = {
  title: "Emote Resizer — Resize Images to 28, 56, 112 px Free",
  description:
    "Resize any image into standard emote sizes (28, 56, 112 px) with transparent PNG output. Free, private, and instant in your browser.",
  alternates: { canonical: "/emote-resizer" },
};

export default function Page() {
  return (
    <ToolPage
      specId="generic-emote"
      title="Emote Resizer"
      subtitle="Resize any image into clean 28×28, 56×56 and 112×112 emotes with transparent backgrounds — no editor required."
      intro="Sometimes you just need a quick, high-quality resize into emote dimensions. The Emote Resizer takes any image and outputs sharp, square, transparent PNGs at 28, 56 and 112 pixels. Use it for Twitch, Kick, Discord or anywhere small chat icons are needed. Like every EmoteForge tool, it runs fully in your browser with nothing uploaded."
      faq={[
        {
          q: "What are standard emote sizes?",
          a: "Most platforms use 28×28, 56×56 and 112×112 pixels for emotes. This resizer outputs all three from a single image.",
        },
        {
          q: "Does resizing keep transparency?",
          a: "Yes. Output is transparent PNG by default, and you can auto-trim transparent edges before resizing for tighter framing.",
        },
        {
          q: "Will small images look pixelated?",
          a: "Upscaling a tiny source can soften edges. For the best result, start from the largest, cleanest version of your artwork.",
        },
      ]}
    />
  );
}
