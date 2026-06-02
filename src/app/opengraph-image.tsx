import { ImageResponse } from "next/og";

export const alt = "EmoteForge — Free Twitch & Kick Emote and Badge Maker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1030 60%, #2a1a4a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, display: "flex", alignItems: "center", gap: 16 }}>
          <span>🔥</span>
          <span style={{ fontWeight: 700 }}>EmoteForge</span>
        </div>
        <div
          style={{
            marginTop: 30,
            display: "flex",
            flexDirection: "column",
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          <span>Make perfect Twitch &amp;</span>
          <span>Kick emotes in seconds</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#c4b5fd" }}>
          Free · Private · All sizes &amp; badges, instantly
        </div>
      </div>
    ),
    { ...size },
  );
}
