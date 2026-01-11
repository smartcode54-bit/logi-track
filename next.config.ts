import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups", // Allow popups for Firebase auth
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none", // Allow embedding for Firebase popup
          },
        ],
      },
    ];
  },
};

export default nextConfig;
