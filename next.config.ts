import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: cacheComponents / partialPrefetching from the scaffold are intentionally OFF.
  // This is a client-heavy animated site and they force Suspense boundaries everywhere.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: { formats: ["image/avif", "image/webp"], qualities: [75, 80, 85, 90] },
  // /public/img/* are content-addressed by name and loaded raw (canvas sampling, unoptimised portraits):
  // let the browser keep them for a day and revalidate in the background instead of refetching per visit.
  async headers() {
    return [
      {
        source: "/img/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
