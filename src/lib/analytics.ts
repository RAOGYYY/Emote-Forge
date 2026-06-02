"use client";

// Lightweight, privacy-respecting analytics via Supabase REST.
// No-ops automatically when env vars are absent (local dev / self-host).
//
// Supabase setup (run once in the SQL editor):
//
//   create table if not exists events (
//     id          bigint generated always as identity primary key,
//     created_at  timestamptz not null default now(),
//     event       text not null,
//     path        text,
//     session_id  text,
//     props       jsonb default '{}'::jsonb
//   );
//   alter table events enable row level security;
//   -- allow anonymous inserts only (no read), so the anon key can log events:
//   create policy "anon insert events" on events
//     for insert to anon with check (true);
//
// Then set in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

type EventProps = Record<string, string | number | boolean | null | undefined>;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const enabled = Boolean(SUPABASE_URL && SUPABASE_ANON);

let cachedSession: string | null = null;

function sessionId(): string {
  if (cachedSession) return cachedSession;
  try {
    const key = "ef_sid";
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(key, sid);
    }
    cachedSession = sid;
  } catch {
    cachedSession = "anon";
  }
  return cachedSession;
}

/** Fire-and-forget event tracking. Safe to call anywhere on the client. */
export function track(event: string, props: EventProps = {}): void {
  if (!enabled || typeof window === "undefined") return;
  try {
    const body = JSON.stringify([
      {
        event,
        path: window.location.pathname,
        session_id: sessionId(),
        props,
      },
    ]);
    fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON as string,
        Authorization: `Bearer ${SUPABASE_ANON as string}`,
        Prefer: "return=minimal",
      },
      body,
      keepalive: true,
    }).catch(() => {
      /* analytics must never break the app */
    });
  } catch {
    /* ignore */
  }
}

/** Track a page/tool view once on mount. */
export function trackView(name: string, props: EventProps = {}): void {
  track("view", { name, ...props });
}
