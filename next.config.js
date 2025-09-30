/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 should handle NextAuth automatically
  // No custom webpack configuration needed
  transpilePackages: ['swiper'],
  experimental: {
    optimizePackageImports: ['swiper']
  }
}

module.exports = nextConfig
