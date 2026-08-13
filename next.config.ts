import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare compatibility
  images: {
    unoptimized: true, // Cloudflare doesn't support Vercel Image Optimization
  },

  // Ensure output compatible with Cloudflare Workers
  output: 'standalone',

  // Experimental features
  experimental: {
    // Enable for better performance
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
};

export default nextConfig;
