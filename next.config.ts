import type { NextConfig } from "next";

// The prototype is fully client-side (state lives in localStorage), so Cache Components
// and Partial Prefetching are left off; there is no server data to cache.
const nextConfig: NextConfig = {
  // the floating dev badge sits over the phone UI's bottom controls; errors still surface as overlays
  devIndicators: false,
  // the service worker must always be revalidated so updates reach installed PWAs
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
