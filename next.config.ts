import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sharper photos: allow quality 90 and serve AVIF where the browser supports it.
  images: { qualities: [75, 90], formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [{ source: "/admin", destination: "/keystatic", permanent: false }];
  },
};

export default nextConfig;
