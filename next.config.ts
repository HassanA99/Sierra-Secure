import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@privy-io/react-auth', '@solana/web3.js'],
  },

  // Turbopack configuration (replaces webpack config when using --turbopack)
  turbopack: {
    resolveAlias: {
      // Add any module aliases here if needed
    },
  },
};

export default nextConfig;
