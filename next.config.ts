import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

// Wires Cloudflare bindings (env vars, KV, R2, etc.) into `next dev`
// so local dev mirrors production. Safe no-op outside dev.
initOpenNextCloudflareForDev();

export default nextConfig;
