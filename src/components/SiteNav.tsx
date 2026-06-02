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
  const [fabOpen, setFabOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setFabOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70">
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

        {/* Row 2 — tools cloud (all visible, wrapping) — Desktop Only */}
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
      </header>

      {/* Floating Action Button (FAB) for mobile view */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <button
          type="button"
          onClick={() => setFabOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-950/50 transition-transform active:scale-95 duration-200"
          aria-label="Toggle Emote Tools"
          title="Select Emote Tool"
        >
          <span className="text-lg leading-none transition-transform duration-300" style={{ transform: fabOpen ? 'rotate(135deg)' : 'none', display: 'inline-block' }}>
            ➕
          </span>
        </button>
      </div>

      {/* Backdrop blur & overlay for bottom drawer */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* Glassmorphic Bottom Drawer / Bottom Sheet */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 rounded-t-3xl border-t border-zinc-800/80 bg-zinc-950/90 p-5 pb-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out md:hidden ${
          fabOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Drawer Header */}
        <div className="mb-4 flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">🛠️ EmoteForge Tools</h3>
            <p className="text-[10px] text-zinc-500">Pick a generator to get started</p>
          </div>
          <button
            onClick={() => setFabOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {TOOL_BAR.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setFabOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold transition ${
                  active
                    ? "border-violet-500 bg-violet-600/10 text-violet-400"
                    : "border-zinc-900 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800/70"
                }`}
              >
                <span className="text-base leading-none">{t.icon}</span>
                <span className="truncate">{t.short}</span>
                {t.badge && <Badge kind={t.badge} />}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
