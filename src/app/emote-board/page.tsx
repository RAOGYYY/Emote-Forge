import type { Metadata } from "next";
import EmoteBoard from "@/components/EmoteBoard";

export const metadata: Metadata = {
  title: "Emote Board — Work on Your Full Emote Set",
  description:
    "Upload multiple emotes, edit them all at once with undo/redo, and download your complete emote pack as one ZIP. Free and browser-based.",
};

export default function EmoteBoardPage() {
  return <EmoteBoard />;
}
