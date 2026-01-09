import type { NextConfig } from 'next'

const SUPABASE_HOST = 'jtpifraxtevpxqyryacg.supabase.co'

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: SUPABASE_HOST,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
