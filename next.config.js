/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // En producción, permitir que el build continúe incluso con warnings de ESLint
    // Solo los errores bloquearán el build
    ignoreDuringBuilds: false, // Mantener false para ver errores
  },
  typescript: {
    // Ignorar errores de TypeScript durante el build (útil para deployment)
    ignoreBuildErrors: false, // Cambiar a true si hay problemas de types en producción
  },
  // Experimental: Permitir que el build continúe sin variables de entorno
  experimental: {
    // Render proporcionará las variables de entorno en tiempo de ejecución
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuración para Render
  output: 'standalone',
}

module.exports = nextConfig