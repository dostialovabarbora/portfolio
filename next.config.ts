import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/admin", destination: "/keystatic", permanent: false }];
  },
};

export default nextConfig;
