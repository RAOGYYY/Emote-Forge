import Link from "next/link";
import { ASSET_LIST } from "@/lib/specs";

const toolLinks: Record<string, string> = {
  "twitch-emote": "/twitch-emote-maker",
  "twitch-sub-badge": "/twitch-sub-badge-maker",
  "twitch-bit-badge": "/twitch-bit-badge-maker",
  "kick-emote": "/kick-emote-maker",
  "generic-emote": "/emote-resizer",
  "7tv-emote": "/7tv-emote-maker",
  "bttv-emote": "/bttv-emote-maker",
  "discord-sticker": "/discord-sticker-maker",
};

const features = [
  { icon: "🔒", title: "100% private", text: "Everything runs in your browser. Your artwork is never uploaded to a server." },
  { icon: "👁️", title: "Real-size preview", text: "See exactly how your emote looks at 28px in a live chat mockup before you export." },
  { icon: "📦", title: "All sizes at once", text: "One image in, every required size out — plus a platform-ready ZIP." },
  { icon: "✅", title: "Auto-validated", text: "We check every file against the platform's size limits and optimize to fit." },
  { icon: "🎞️", title: "Animated support", text: "Drop a GIF or video to export looping animated emotes." },
  { icon: "✂️", title: "Background removal", text: "Remove backgrounds and add sticker outlines without an editor." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="py-20 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs text-zinc-400">
          🔥 Free · Private · No signup
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          Make perfect Twitch &amp; Kick emotes in seconds
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
          Upload one image and get every required size — emotes and badges — instantly.
          Processed entirely in your browser, so nothing ever leaves your device.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/twitch-emote-maker" className="btn-primary px-6 py-3 text-base">
            Make a Twitch emote
          </Link>
          <Link href="/kick-emote-maker" className="btn-secondary px-6 py-3 text-base">
            Make a Kick emote
          </Link>
        </div>
      </section>

      {/* Tools grid */}
      <section className="py-8">
        <h2 className="mb-6 text-center text-2xl font-semibold text-zinc-100">
          Pick a tool
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ASSET_LIST.map((spec) => (
            <Link
              key={spec.id}
              href={toolLinks[spec.id]}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-violet-500 hover:bg-zinc-900"
            >
              <div className="text-sm font-semibold text-violet-400">{spec.platform.toUpperCase()}</div>
              <div className="mt-1 text-lg font-semibold text-zinc-100">{spec.label}</div>
              <p className="mt-2 text-sm text-zinc-400">{spec.description}</p>
              <div className="mt-4 text-sm font-medium text-zinc-300 group-hover:text-violet-400">
                Open tool →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold text-zinc-100">
          Why EmoteForge
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
            >
              <div className="text-2xl">{f.icon}</div>
              <div className="mt-3 font-semibold text-zinc-100">{f.title}</div>
              <p className="mt-1 text-sm text-zinc-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
