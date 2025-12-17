// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode'u kapat (hydration sorunlarını azaltır)
  reactStrictMode: false,
  
  // Turbopack config (Next.js 16 gereksinimi)
  turbopack: {},
  
  // Experimental features
  experimental: {
    // Server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig