/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Enable compression
  compress: true,
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize for production
      config.optimization.splitChunks.chunks = 'all'
      
      // Tree shaking for better performance
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }
    return config
  },
}

module.exports = nextConfig
