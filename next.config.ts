import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',
  trailingSlash: true,
  
  // Image optimization (temporarily disabled for debugging)
  images: {
    unoptimized: true, // Disable optimization to fix URL issues
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600, // 1 hour
  },
  
  // Enable experimental features for better caching
  experimental: {
    // Enable better caching
    staleTimes: {
      dynamic: 30,     // 30 seconds for dynamic pages
      static: 180,     // 3 minutes for static pages  
    },
  },
  
  // Headers for better caching
  async headers() {
    return [
      // Never cache auth endpoints
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      // Never cache admin endpoints (user/role-scoped)
      {
        source: '/api/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      // Cache public product endpoints
      {
        source: '/api/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1800, stale-while-revalidate=3600',
          },
        ],
      },
      // Cache static assets long-term
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
