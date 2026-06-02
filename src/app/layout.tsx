import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Providers from "@/components/Providers";
import ClientInit from "@/components/ClientInit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL("https://emoteforge.app"),
  title: {
    default: "EmoteForge — Free Twitch & Kick Emote and Badge Maker",
    template: "%s | EmoteForge",
  },
  description:
    "Create perfectly-sized Twitch and Kick emotes and sub badges for free. 100% browser-based, private, and instant. Auto-export all required sizes.",
  keywords: [
    "twitch emote maker",
    "twitch sub badge maker",
    "kick emote maker",
    "emote resizer",
    "twitch emote size",
  ],
  openGraph: {
    title: "EmoteForge — Free Twitch & Kick Emote and Badge Maker",
    description:
      "Create perfectly-sized Twitch and Kick emotes and badges for free. 100% browser-based and private.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="flex min-h-full flex-col bg-zinc-950 text-zinc-100">
        <ClientInit />
        <Providers>
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
        {ADSENSE_CLIENT && (
          <Script
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
