/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
    experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
    allowedDevOrigins: [
      "https://mistyped-determinedly-jaylen.ngrok-free.dev",
      "https://localhost:3000"
    ],
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
