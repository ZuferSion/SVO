/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deshabilitar errores de TypeScript y ESLint durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [],
  },
}

module.exports = nextConfig