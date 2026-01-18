/** @type {import('next').NextConfig} */
const SUPABASE_HOST = 'jtpifraxtevpxqyryacg.supabase.co'

const nextConfig = {
  images: {
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
