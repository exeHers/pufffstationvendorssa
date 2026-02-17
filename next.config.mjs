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
  productionBrowserSourceMaps: true,
}

export default nextConfig;