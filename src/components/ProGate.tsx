"use client";

import Link from "next/link";
import { useState } from "react";
import { usePro } from "@/lib/pro";

export function ProGate({
  open,
  onClose,
  feature,
}: {
  open: boolean;
  onClose: () => void;
  feature: string;
}) {
  const { activate } = usePro();
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit() {
    setBusy(true);
    setError("");
    const res = await activate(key);
    setBusy(false);
    if (res.ok) {
      onClose();
    } else {
      setError(res.error ?? "Activation failed.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-violet-400">
          Pro feature
        </div>
        <h3 className="mt-1 text-xl font-bold text-zinc-50">{feature} is a Pro feature</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Unlock bulk packs, animated emotes, one-click ZIP exports and watermark-free
          downloads with a one-time EmoteForge Pro purchase.
        </p>

        <Link
          href="/pricing"
          className="mt-4 block rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500"
        >
          Get EmoteForge Pro — $29 lifetime
        </Link>

        <div className="my-5 flex items-center gap-3 text-xs text-zinc-600">
          <div className="h-px flex-1 bg-zinc-800" />
          already purchased?
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <label className="text-xs font-medium text-zinc-400">License key</label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          className="input mt-1"
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={submit} disabled={busy} className="btn-primary">
            {busy ? "Activating…" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
