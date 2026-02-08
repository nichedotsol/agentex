/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure static files are properly served
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
