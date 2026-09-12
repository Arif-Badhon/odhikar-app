import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api_proxy/:path*",
        destination: "http://api:8000/:path*", // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
