import type { Metadata } from "next";
import ToolPage from "@/components/ToolPage";

export const metadata: Metadata = {
  title: "Twitch Emote Maker — Free 28x28, 56x56, 112x112 Generator",
  description:
    "Make Twitch emotes for free in all three required sizes (28, 56, 112 px). Transparent PNG, under 1 MB, instant and private. No upload, no signup.",
  alternates: { canonical: "/twitch-emote-maker" },
};

export default function Page() {
  return (
    <ToolPage
      specId="twitch-emote"
      title="Twitch Emote Maker"
      subtitle="Upload one image and instantly get all three Twitch emote sizes — 28×28, 56×56 and 112×112 — as transparent PNGs that pass Twitch's requirements."
      intro="Twitch requires every emote to be uploaded in three exact sizes: 28×28, 56×56 and 112×112 pixels, as transparent PNG files under 1 MB each. Resizing these by hand in Photoshop is tedious and easy to get wrong. EmoteForge does it in one step — entirely inside your browser, so your artwork is never uploaded to a server. Drop your image, preview how it looks at real chat size, fine-tune padding and background, and download a Twitch-ready ZIP."
      faq={[
        {
          q: "What size do Twitch emotes need to be?",
          a: "Twitch emotes must be uploaded in 28×28, 56×56 and 112×112 pixels as transparent PNG files, each under 1 MB.",
        },
        {
          q: "Why is my Twitch emote blurry?",
          a: "Blurriness usually happens when a small image is scaled up. Start from the highest-resolution artwork you have; EmoteForge downscales with high-quality smoothing to keep edges crisp at every size.",
        },
        {
          q: "Is my image uploaded anywhere?",
          a: "No. All processing happens locally in your browser using the Canvas API. Your file never leaves your device.",
        },
        {
          q: "Can I make animated Twitch emotes?",
          a: "Yes — upload a GIF or short video and EmoteForge switches to animated mode, exporting animated emotes in all required sizes.",
        },
      ]}
    />
  );
}
