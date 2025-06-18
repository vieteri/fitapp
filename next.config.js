/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add Supabase image domains for next/image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Ensure TypeScript checking during build
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable strict mode for better development
  reactStrictMode: true,
  // Disable x-powered-by header
  poweredByHeader: false,
}

module.exports = nextConfig;
