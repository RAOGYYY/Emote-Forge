"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOL_BAR } from "@/lib/nav";
import ThemeToggle from "@/components/ThemeToggle";

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-base shadow-sm shadow-violet-900/40">
        🔥
      </span>
      <span className="text-[15px] font-bold tracking-tight text-zinc-50">
        Emote<span className="text-violet-400">Forge</span>
      </span>
    </Link>
  );
}

function Badge({ kind }: { kind: "Pro" | "New" }) {
  return (
    <span
      className={`rounded px-1 py-px text-[9px] font-bold uppercase ${
        kind === "Pro"
          ? "bg-violet-600/20 text-violet-300"
          : "bg-emerald-600/20 text-emerald-300"
      }`}
    >
      {kind}
    </span>
  );
}

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="md:sticky md:top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70">
        {/* Row 1 — brand + utility */}
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Logo />

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/blog"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-800/70 hover:text-zinc-100"
            >
              Blog
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Row 2 — tools cloud (all visible, wrapping) — Ezgif-style layout for mobile and desktop */}
        <div className="border-t border-zinc-800/75 bg-zinc-900/30">
          <nav className="mx-auto max-w-6xl px-3 py-2">
            <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
              {TOOL_BAR.map((t) => {
                const active = pathname === t.href;
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-1.5 rounded border px-2 md:px-2.5 py-1 text-[11px] md:text-[13px] font-semibold transition cursor-pointer ${
                      active
                        ? "bg-violet-600 border-violet-500 text-white shadow-sm"
                        : "border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-105"
                    }`}
                  >
                    <span className="text-xs md:text-sm leading-none shrink-0">{t.icon}</span>
                    <span className="whitespace-nowrap">{t.short}</span>
                    {t.badge && <Badge kind={t.badge} />}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
