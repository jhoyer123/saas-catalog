import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com", // Pinterest
      },
      {
        protocol: "https",
        hostname: "xxxx.supabase.co", // cuando conectes Supabase
      },
    ],
  },
};

export default nextConfig;
