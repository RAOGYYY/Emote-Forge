import type { Metadata } from "next";
import BulkStudio from "@/components/BulkStudio";

export const metadata: Metadata = {
  title: "Bulk Emote Pack Maker — Resize a Whole Emote Set at Once",
  description:
    "Upload your entire emote set and export every required size for all of them in one ZIP. Fast, private, browser-based bulk emote and badge processing.",
  alternates: { canonical: "/bulk-emote-pack" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          Bulk Emote Pack Maker
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
          Drop your whole emote set, pick the platform, and export every required size for
          every image into one organized ZIP — all in your browser.
        </p>
      </div>

      <BulkStudio />

      <section className="mx-auto mt-16 max-w-3xl space-y-4 text-zinc-300">
        <h2 className="text-xl font-semibold text-zinc-100">
          Process an entire emote set in one go
        </h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          Creating a full set of Twitch or Kick emotes one image at a time is slow. The bulk
          pack maker takes any number of images, resizes each to all required sizes, optimizes
          them to meet platform file-size limits, and packages everything into a tidy ZIP with
          one folder per emote. Nothing is uploaded — all processing happens locally on your
          device, so even large sets stay completely private.
        </p>
      </section>
    </div>
  );
}
