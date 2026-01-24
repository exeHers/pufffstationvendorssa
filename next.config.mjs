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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        'resend',
        'html-to-text',
        'parseley',
        'selderee',
        '@react-email/render'
      )
    }
    return config
  },
}

export default nextConfig
