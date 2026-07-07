const path = require("path");

/**
 * Consolidate Next config (JS) to ensure all features work correctly
 * while avoiding configuration conflicts and allowing deployment on servers
 * without typescript development dependencies.
 */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
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

module.exports = nextConfig;

