import type { NextConfig } from "next";

// Generated Studio images are served from Supabase Storage.
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;

const nextConfig: NextConfig = {
  images: {
    // WebP only: AVIF encoding is several times slower per image and the sources are already WebP.
    formats: ["image/webp"],
    remotePatterns: supabase ? [{ protocol: "https", hostname: supabase, pathname: "/storage/v1/object/**" }] : [],
  },
};

export default nextConfig;
