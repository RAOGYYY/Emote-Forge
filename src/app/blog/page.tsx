import type { Metadata } from "next";
import Link from "next/link";
import { POSTS_SORTED } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Emote Guides & Tutorials — Blog",
  description:
    "Guides, specs and tutorials for making Twitch and Kick emotes and badges: exact sizes, animated emotes, file-size limits and more.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          Emote guides &amp; tutorials
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
          Everything you need to know about emote sizes, badges, animation and
          getting your art approved on Twitch and Kick.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {POSTS_SORTED.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-violet-500 hover:bg-zinc-900"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-zinc-800 text-2xl">
                {post.hero}
              </span>
              <span className="rounded-full bg-violet-600/15 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                {post.tag}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-100 group-hover:text-violet-300">
              {post.title}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
              {post.description}
            </p>
            <div className="mt-4 text-xs text-zinc-500">
              {formatDate(post.date)} · {post.readMinutes} min read
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
