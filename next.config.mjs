/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
    // 🔥 ISSO AQUI resolve o erro de 10MB
    api: {
      bodyParser: {
        sizeLimit: "20mb",
      },
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
