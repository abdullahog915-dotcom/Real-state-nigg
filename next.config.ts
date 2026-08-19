import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

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
    // Enable for better performance
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
