import type { Metadata } from "next";
import ToolPage from "@/components/ToolPage";

export const metadata: Metadata = {
  title: "Discord Sticker Maker — Free 320×320 Sticker Generator",
  description:
    "Create Discord stickers for free at 320×320 px. Transparent PNG under 512 KB, instant and private — no upload, no signup.",
  alternates: { canonical: "/discord-sticker-maker" },
};

export default function Page() {
  return (
    <ToolPage
      specId="discord-sticker"
      title="Discord Sticker Maker"
      subtitle="Upload one image and get a Discord-ready sticker at 320×320 px, transparent PNG under 512 KB. Perfect for server custom stickers."
      faq={[
        {
          q: "What size are Discord stickers?",
          a: "Discord stickers must be exactly 320×320 pixels, transparent PNG or APNG, and under 512 KB.",
        },
        {
          q: "Can I make animated Discord stickers?",
          a: "Yes — upload a GIF or short video and this tool will produce an animated version within the size limit.",
        },
        {
          q: "Is my image uploaded anywhere?",
          a: "No. All processing happens in your browser. Your sticker never leaves your device.",
        },
      ]}
    />
  );
}
