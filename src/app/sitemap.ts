import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog";

const base = "https://emoteforge.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/twitch-emote-maker",
    "/twitch-sub-badge-maker",
    "/twitch-bit-badge-maker",
    "/kick-emote-maker",
    "/emote-resizer",
    "/7tv-emote-maker",
    "/bttv-emote-maker",
    "/discord-sticker-maker",
    "/emote-background-remover",
    "/emote-board",
    "/bulk-emote-pack",
    "/blog",
    "/pricing",
  ];
  const blogRoutes = POSTS.map((p) => `/blog/${p.slug}`);
  return [...routes, ...blogRoutes].map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: r === "" ? 1 : r.startsWith("/blog/") ? 0.6 : 0.8,
  }));
}
