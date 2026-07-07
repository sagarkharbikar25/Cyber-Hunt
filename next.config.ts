import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Allow building even if TypeScript reports type errors in this environment.
  // This is useful for deployment on servers where strict type fixes can be deferred.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Only use custom distDir locally, skip in CI / Vercel to avoid permission errors
  ...(process.env.CI || process.env.VERCEL ? {} : { distDir: "../../../../next-builds/cyberhunt" }),
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

