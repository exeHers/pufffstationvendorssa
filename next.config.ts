import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 85, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "supabase.co",
      },
      {
        protocol: "https",
        hostname: "i.provape.com",
      },
    ],
  },
};

export default nextConfig;