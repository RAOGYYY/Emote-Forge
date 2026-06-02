import EmoteStudio from "@/components/EmoteStudio";
import AdSlot from "@/components/AdSlot";

export interface FaqItem {
  q: string;
  a: string;
}

interface Props {
  specId: string;
  title: string;
  subtitle: string;
  /** Kept for SEO copy on callers; no longer rendered as a wall of text. */
  intro?: string;
  faq: FaqItem[];
}

export default function ToolPage({ specId, title, subtitle, faq }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-400">{subtitle}</p>
      </div>

      <EmoteStudio specId={specId} />

      <AdSlot slot="1234567890" />

      {/* Compact FAQ — the only supporting text we keep below the tool. */}
      <section className="mx-auto mt-14 max-w-3xl">
        <h2 className="mb-4 text-center text-lg font-semibold text-zinc-100">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {faq.map((f) => (
            <details
              key={f.q}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <summary className="cursor-pointer text-sm font-medium text-zinc-200">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-zinc-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

