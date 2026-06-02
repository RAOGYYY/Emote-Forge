import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-200">
          <span>🔥</span> EmoteForge
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <Link href="/blog" className="hover:text-zinc-200">Blog</Link>
          <Link href="/pricing" className="hover:text-zinc-200">Pricing</Link>
        </div>
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} EmoteForge · Not affiliated with Twitch or Kick.
        </p>
      </div>
    </footer>
  );
}

