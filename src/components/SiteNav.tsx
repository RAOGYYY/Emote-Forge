"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70">
      {/* Row 1 — brand + utility */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Logo />

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/blog"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800/70 hover:text-zinc-100 sm:block"
          >
            Blog
          </Link>
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-1 rounded-lg p-2 text-zinc-300 hover:bg-zinc-800 md:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Row 2 — tools cloud (all visible, wrapping) */}
      <div className="hidden border-t border-zinc-800/70 bg-zinc-900/30 md:block">
        <nav className="mx-auto flex max-w-6xl items-center justify-center gap-1 px-4 pt-2 pb-1">
          {TOOL_BAR.slice(0, 6).map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition ${
                  active
                    ? "bg-violet-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                <span className="text-base leading-none">{t.icon}</span>
                {t.short}
                {t.badge && <Badge kind={t.badge} />}
              </Link>
            );
          })}
        </nav>
        <nav className="mx-auto flex max-w-6xl items-center justify-center gap-1 px-4 pb-2 pt-0.5">
          {TOOL_BAR.slice(6).map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition ${
                  active
                    ? "bg-violet-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                <span className="text-base leading-none">{t.icon}</span>
                {t.short}
                {t.badge && <Badge kind={t.badge} />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-3 md:hidden">
          <div className="grid grid-cols-2 gap-1">
            {TOOL_BAR.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                    active ? "bg-violet-600 text-white" : "text-zinc-300 hover:text-zinc-100"
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.short}
                  {t.badge && <Badge kind={t.badge} />}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-zinc-800 pt-3">
            <Link href="/blog" className="text-sm text-zinc-300">Blog</Link>
          </div>
        </div>
      )}
    </header>
  );
}
