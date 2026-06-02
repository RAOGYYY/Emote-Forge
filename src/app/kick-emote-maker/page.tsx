import type { Metadata } from "next";
import ToolPage from "@/components/ToolPage";

export const metadata: Metadata = {
  title: "Kick Emote Maker — Free Emote Generator for Kick",
  description:
    "Create Kick emotes for free in 28, 56 and 112 px. Transparent PNG, private and instant — no upload, no signup.",
  alternates: { canonical: "/kick-emote-maker" },
};

export default function Page() {
  return (
    <ToolPage
      specId="kick-emote"
      title="Kick Emote Maker"
      subtitle="Turn any image into Kick-ready emotes in 28×28, 56×56 and 112×112 — transparent PNGs, generated entirely in your browser."
      intro="Kick is one of the fastest-growing streaming platforms, but there are very few tools built specifically for its emotes. EmoteForge exports clean, transparent emotes in the standard 28, 56 and 112 pixel sizes, with a live preview that shows exactly how your emote reads in chat. Everything runs locally in your browser — no account, no upload, no waiting."
      faq={[
        {
          q: "What size are Kick emotes?",
          a: "Kick emotes work best exported at 28×28, 56×56 and 112×112 pixels as transparent PNGs, matching common chat emote standards.",
        },
        {
          q: "Is there a free Kick emote maker?",
          a: "Yes — EmoteForge is free and runs entirely in your browser, so you can create and download Kick emotes without an account.",
        },
        {
          q: "Can I make animated Kick emotes?",
          a: "Upload a GIF or short clip and EmoteForge switches to animated mode to export looping emotes in each size.",
        },
      ]}
    />
  );
}
