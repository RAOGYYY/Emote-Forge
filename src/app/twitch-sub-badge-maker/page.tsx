import type { Metadata } from "next";
import ToolPage from "@/components/ToolPage";

export const metadata: Metadata = {
  title: "Twitch Sub Badge Maker — Free 18, 36, 72 px Generator",
  description:
    "Create Twitch subscriber badges for free in all required sizes (18, 36, 72 px). Transparent PNG under 25 KB, private and instant.",
  alternates: { canonical: "/twitch-sub-badge-maker" },
};

export default function Page() {
  return (
    <ToolPage
      specId="twitch-sub-badge"
      title="Twitch Sub Badge Maker"
      subtitle="Generate subscriber badges in the three required sizes — 18×18, 36×36 and 72×72 — as transparent PNGs that stay under Twitch's 25 KB limit."
      intro="Twitch subscriber badges must be provided in 18×18, 36×36 and 72×72 pixels as transparent PNGs, each under 25 KB. Because badges appear tiny next to usernames, clarity at 18px matters most. EmoteForge shows you a real-size preview next to a chat username and automatically optimizes each badge to fit the 25 KB limit without you touching an image editor."
      faq={[
        {
          q: "What size are Twitch sub badges?",
          a: "Twitch subscriber badges are 18×18, 36×36 and 72×72 pixels, uploaded as transparent PNG files under 25 KB each.",
        },
        {
          q: "How do I keep badges under 25 KB?",
          a: "EmoteForge automatically reduces colors when a badge exceeds 25 KB, so the exported files always meet Twitch's limit while staying as sharp as possible.",
        },
        {
          q: "Should badges have transparent backgrounds?",
          a: "Yes. Badges sit directly next to usernames in chat, so a transparent background looks cleanest. Keep the toggle on Transparent.",
        },
      ]}
    />
  );
}
