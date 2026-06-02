import type { Metadata } from "next";
import ToolPage from "@/components/ToolPage";

export const metadata: Metadata = {
  title: "7TV Emote Maker — Free 32, 64, 96, 128 px Generator",
  description:
    "Create 7TV emotes for free in all four sizes (32, 64, 96, 128 px). Transparent PNG, under 2.5 MB, instant and private.",
  alternates: { canonical: "/7tv-emote-maker" },
};

export default function Page() {
  return (
    <ToolPage
      specId="7tv-emote"
      title="7TV Emote Maker"
      subtitle="Upload one image and instantly get all four 7TV emote sizes — 32×32, 64×64, 96×96 and 128×128 — as transparent PNGs ready to upload."
      faq={[
        {
          q: "What size are 7TV emotes?",
          a: "7TV emotes are displayed at 1x (32px), 2x (64px), 3x (96px) and 4x (128px). Each must be under 2.5 MB as a transparent PNG or GIF.",
        },
        {
          q: "Can I upload animated 7TV emotes?",
          a: "Yes — upload a GIF or short video and this tool will export animated versions in all required sizes.",
        },
        {
          q: "Is my image uploaded anywhere?",
          a: "No. All processing happens locally in your browser. Your file never leaves your device.",
        },
      ]}
    />
  );
}
