import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com", // Pinterest
      },
      {
        protocol: "https",
        hostname: "xxxx.supabase.co", // cuando conectes Supabase
      },
      {
        protocol: "https",
        hostname: "ffippkblrlgsmzlhretb.supabase.co",
      },
    ],
  },
};

export default nextConfig;
