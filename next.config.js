/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mongodb"],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
    EVOLUTION_TOKEN: process.env.EVOLUTION_TOKEN,
    EVOLUTION_INSTANCE: process.env.EVOLUTION_INSTANCE,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
