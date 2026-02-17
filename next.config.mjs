/** @type {import('next').NextConfig} */

// Your Supabase host for image optimization
const SUPABASE_HOST = 'jtpifraxtevpxqyryacg.supabase.co';

const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: SUPABASE_HOST,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // 1. Handle External Modules that crash on Edge
    if (isServer) {
      // 2. The "Nuclear Option" for Node internals
      // This forces Webpack to ignore these modules during the server/edge build
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // 3. Absolute Alias for async_hooks
    // This catches any imports that try to sneak past the fallback
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    return config;
  },
  productionBrowserSourceMaps: true,
  experimental: {
    // This helps with build stability on your i3-7100
    webpackBuildWorker: true,
  },
}

export default nextConfig;