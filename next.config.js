/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Ensure static files are properly served
  images: {
    unoptimized: true,
  },
  // Disable static optimization for now to debug
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
