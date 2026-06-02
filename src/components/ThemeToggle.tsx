"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    queueMicrotask(() => {
      setDark(isDark);
      setMounted(true);
    });
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("ef_theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light mode" : "Dark mode"}
      className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800/70 hover:text-zinc-100"
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch */}
      <span className="block text-base leading-none">
        {mounted ? (dark ? "☀️" : "🌙") : "🌙"}
      </span>
    </button>
  );
}
