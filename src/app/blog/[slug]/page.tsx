import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, POSTS, type Block } from "@/lib/blog";

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

function renderBlock(block: Block, i: number) {
  switch (block.t) {
    case "h2":
      return (
        <h2 key={i} className="mt-10 text-xl font-semibold text-zinc-100">
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p key={i} className="mt-4 leading-relaxed text-zinc-300">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={i} className="mt-4 space-y-2">
          {block.items.map((it, j) => (
            <li key={j} className="flex gap-2 text-zinc-300">
              <span className="mt-0.5 text-violet-400">•</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div
          key={i}
          className="mt-6 overflow-hidden rounded-xl border border-zinc-800"
        >
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                {block.head.map((h) => (
                  <th key={h} className="px-4 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "EmoteForge" },
    publisher: { "@type": "Organization", name: "EmoteForge" },
  };

  const faqJsonLd = post.faq && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Link href="/blog" className="text-sm text-violet-400 hover:underline">
        ← All guides
      </Link>

      <header className="mt-6">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="rounded-full bg-violet-600/15 px-2.5 py-0.5 font-medium text-violet-300">
            {post.tag}
          </span>
          <span>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            · {post.readMinutes} min read
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-zinc-400">{post.description}</p>
      </header>

      <div className="mt-6">{post.body.map(renderBlock)}</div>

      {post.faq && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-zinc-100">FAQ</h2>
          <div className="mt-4 space-y-4">
            {post.faq.map((f) => (
              <div
                key={f.q}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <div className="font-medium text-zinc-100">{f.q}</div>
                <p className="mt-1 text-sm text-zinc-400">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {post.cta && (
        <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-600/10 p-8 text-center">
          <div className="text-lg font-semibold text-zinc-100">
            Ready to make yours?
          </div>
          <Link href={post.cta.href} className="btn-primary px-6 py-3 text-base">
            {post.cta.label}
          </Link>
        </div>
      )}
    </article>
  );
}
