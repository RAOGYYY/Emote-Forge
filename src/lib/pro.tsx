"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { track } from "@/lib/analytics";

const STORAGE_KEY = "ef_pro_license";

interface StoredLicense {
  key: string;
  activatedAt: number;
}

interface ProContextValue {
  isPro: boolean;
  loading: boolean;
  licenseKey: string | null;
  activate: (key: string) => Promise<{ ok: boolean; error?: string }>;
  deactivate: () => void;
}

const ProContext = createContext<ProContextValue | null>(null);

export function ProProvider({ children }: { children: ReactNode }) {
  const [license, setLicense] = useState<StoredLicense | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore persisted license on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as StoredLicense) : null;
      queueMicrotask(() => {
        if (parsed) setLicense(parsed);
        setLoading(false);
      });
    } catch {
      queueMicrotask(() => {
        setLoading(false);
      });
    }
  }, []);

  const activate = useCallback(async (key: string) => {
    const trimmed = key.trim();
    if (!trimmed) return { ok: false, error: "Enter a license key." };
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: trimmed }),
      });
      const data = (await res.json()) as { valid: boolean; error?: string };
      if (!res.ok || !data.valid) {
        return { ok: false, error: data.error ?? "Invalid or expired license key." };
      }
      const stored: StoredLicense = { key: trimmed, activatedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      setLicense(stored);
      track("pro_activate", {});
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not reach the activation server. Try again." };
    }
  }, []);

  const deactivate = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLicense(null);
  }, []);

  const value = useMemo<ProContextValue>(
    () => ({
      isPro: !!license,
      loading,
      licenseKey: license?.key ?? null,
      activate,
      deactivate,
    }),
    [license, loading, activate, deactivate],
  );

  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}

export function usePro(): ProContextValue {
  const ctx = useContext(ProContext);
  if (!ctx) throw new Error("usePro must be used within ProProvider");
  return ctx;
}
