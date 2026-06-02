import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — EmoteForge is 100% Free",
  description:
    "EmoteForge is completely free. Every tool — emotes, badges, animated GIFs, background removal, bulk packs and ZIP export — with no subscription and no signup. Supported by ads.",
  alternates: { canonical: "/pricing" },
};

const features = [
  "All required sizes for every platform",
  "Animated emote export (GIF)",
  "One-click background removal",
  "Bulk packs — a whole set at once",
  "Twitch-ready ZIP downloads",
  "No watermark, ever",
  "Real-size chat preview",
  "100% private — runs in your browser",
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center">
        <span className="inline-block rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Free forever
        </span>
        <h1 className="mt-4 text-3xl font-bold text-zinc-50 sm:text-4xl">
          Everything is free
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-400">
          No subscription, no signup, no Pro tier. EmoteForge is kept free for
          everyone and supported by a few unobtrusive ads. That&apos;s it.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl font-bold text-zinc-50">$0</span>
          <span className="text-sm text-zinc-500">/ forever</span>
        </div>
        <ul className="mx-auto mt-8 grid max-w-md gap-2 text-sm text-zinc-300 sm:grid-cols-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span> {f}
            </li>
          ))}
        </ul>
        <Link
          href="/twitch-emote-maker"
          className="mx-auto mt-8 block w-full max-w-xs rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500"
        >
          Start creating
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-zinc-500">
        Like the tools? The best way to support EmoteForge is to share it with
        other streamers and keep the ads enabled. 🙌
      </p>
    </div>
  );
}
