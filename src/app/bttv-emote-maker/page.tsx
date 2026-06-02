import type { Metadata } from "next";
import ToolPage from "@/components/ToolPage";

export const metadata: Metadata = {
  title: "BTTV / FFZ Emote Maker — Free 28, 56, 112 px Generator",
  description:
    "Create BetterTTV and FrankerFaceZ emotes for free in 28, 56 and 112 px. Transparent PNG/GIF, under 2.5 MB, private and instant.",
  alternates: { canonical: "/bttv-emote-maker" },
};

export default function Page() {
  return (
    <ToolPage
      specId="bttv-emote"
      title="BTTV / FFZ Emote Maker"
      subtitle="Upload one image and get all three BetterTTV & FrankerFaceZ emote sizes — 28×28, 56×56 and 112×112 — as transparent PNGs or animated GIFs."
      faq={[
        {
          q: "What size do BTTV emotes need to be?",
          a: "BTTV (and FFZ) emotes need a 1x (28px), 2x (56px) and 4x (112px) version, each under 2.5 MB.",
        },
        {
          q: "Can I make animated BTTV emotes?",
          a: "Yes — upload a GIF or video and this tool generates animated versions in every size.",
        },
        {
          q: "Is my image uploaded anywhere?",
          a: "No. Everything happens in your browser locally.",
        },
      ]}
    />
  );
}
