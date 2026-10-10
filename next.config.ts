import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WebP only: AVIF encoding is several times slower per image and the sources are already WebP.
  images: { formats: ["image/webp"] },
};

export default nextConfig;
