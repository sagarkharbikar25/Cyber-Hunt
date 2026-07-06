import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  distDir: "../../../../next-builds/cyberhunt",
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;

