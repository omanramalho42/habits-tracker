/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
    experimental: {
    allowedDevOrigins: [
      "https://mistyped-determinedly-jaylen.ngrok-free.dev",
    ],
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
