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
  // Experimental features
  experimental: {
    // Optimize for faster builds
    optimizePackageImports: ['@supabase/supabase-js', 'lucide-react'],
  },
  // Turbopack configuration (new stable property)
  turbopack: {},
  // Set build timeout
  staticPageGenerationTimeout: 60,
  // Disable build trace collection to prevent hanging
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Optimize for faster builds
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    }
    
    // Reduce bundle analysis time
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
}

module.exports = nextConfig;
