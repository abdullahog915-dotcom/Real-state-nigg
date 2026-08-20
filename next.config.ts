import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { SITE_ASSET_API_BODY_LIMIT } from "./lib/api-request-size";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'",
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Cloudflare compatibility
  images: {
    unoptimized: true, // Cloudflare doesn't support Vercel Image Optimization
  },

  // Experimental features
  experimental: {
    // Proxy/middleware must be able to forward the largest site-asset multipart envelope.
    // Per-route middleware and upload validation still enforce the smaller API/file limits.
    proxyClientMaxBodySize: SITE_ASSET_API_BODY_LIMIT,
    // Enable for better performance
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
