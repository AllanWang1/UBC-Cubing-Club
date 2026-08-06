import type { NextConfig } from "next";

const localSupabasePattern = {
  protocol: "http" as const,
  hostname: "127.0.0.1",
  port: "54321",
};

// Allows configurations for next.js
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aprxkjdevkzpsbjumkmm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      ...(process.env.NODE_ENV === "development"
        ? [localSupabasePattern]
        : []),

    ],
  },
};

export default nextConfig;
