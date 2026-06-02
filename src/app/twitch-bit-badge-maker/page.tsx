import type { Metadata } from "next";
import ToolPage from "@/components/ToolPage";

export const metadata: Metadata = {
  title: "Twitch Bits Badge Maker — Free Cheer Badge Generator",
  description:
    "Create Twitch Bits (cheer) badges for free in all required sizes (18, 36, 72 px). Transparent PNG under 25 KB, browser-based and private.",
  alternates: { canonical: "/twitch-bit-badge-maker" },
};

export default function Page() {
  return (
    <ToolPage
      specId="twitch-bit-badge"
      title="Twitch Bits Badge Maker"
      subtitle="Make Bits (cheer) badges in 18×18, 36×36 and 72×72 — transparent PNGs optimized to stay under Twitch's 25 KB limit."
      intro="Bits badges reward viewers for cheering and follow the same technical rules as subscriber badges: 18×18, 36×36 and 72×72 pixel transparent PNGs under 25 KB each. EmoteForge generates all three sizes at once, previews them at true chat scale, and compresses automatically so every file is ready to upload to your Twitch dashboard."
      faq={[
        {
          q: "What size are Twitch Bits badges?",
          a: "Bits (cheer) badges use the same sizes as sub badges: 18×18, 36×36 and 72×72 pixels, transparent PNG, under 25 KB each.",
        },
        {
          q: "What's the difference between Bits and sub badges?",
          a: "They share identical dimensions and file rules. Bits badges unlock by cheering with Bits, while sub badges unlock through subscription tenure.",
        },
        {
          q: "Can I batch several badge tiers?",
          a: "Yes — process each tier and download them, or use the ZIP export to keep all sizes organized per badge.",
        },
      ]}
    />
  );
}
