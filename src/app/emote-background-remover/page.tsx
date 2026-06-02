import type { Metadata } from "next";
import ToolPage from "@/components/ToolPage";

export const metadata: Metadata = {
  title: "Free Emote Background Remover — Make Transparent Emotes",
  description:
    "Remove the background from any image and export a clean, transparent emote in every required size. 100% in-browser, private and free.",
  alternates: { canonical: "/emote-background-remover" },
};

export default function Page() {
  return (
    <ToolPage
      specId="generic-emote"
      title="Emote Background Remover"
      subtitle="Erase the background and export a transparent emote — no Photoshop, nothing uploaded."
      intro="Upload any image and remove its background instantly in your browser. EmoteForge cuts out the subject, lets you add a sticker outline, and exports clean transparent PNGs at standard emote sizes (28, 56 and 112 px). Everything runs locally, so your artwork never leaves your device."
      faq={[
        {
          q: "Is the background remover free?",
          a: "Yes, removing backgrounds and exporting transparent emotes is free. Background removal runs entirely in your browser.",
        },
        {
          q: "Does my image get uploaded?",
          a: "No. All processing happens locally on your device — nothing is sent to a server.",
        },
        {
          q: "What sizes do I get?",
          a: "Standard emote sizes of 28, 56 and 112 px, ready for Twitch or Kick.",
        },
      ]}
    />
  );
}
