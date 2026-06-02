import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cross-origin isolation enables SharedArrayBuffer, required by ffmpeg.wasm.
  // `credentialless` still allows loading cross-origin CDN assets (wasm core,
  // background-removal model) without them needing CORP headers.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
