/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip static page generation when building with invalid Clerk keys
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  eslint: {
    // En producción, permitir que el build continúe incluso con warnings de ESLint
    // Solo los errores bloquearán el build
    ignoreDuringBuilds: false, // Mantener false para ver errores
  },
  typescript: {
    // Ignorar errores de TypeScript durante el build (útil para deployment)
    ignoreBuildErrors: false, // Cambiar a true si hay problemas de types en producción
  },
  // Deshabilitar generación estática para páginas de error
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Deshabilitar static optimization para evitar errores con Clerk dummy keys
  experimental: {
    // Render proporcionará las variables de entorno en tiempo de ejecución
    isrMemoryCacheSize: 0, // Disable ISR caching
  },
  // Forzar renderizado dinámico para todas las páginas
  reactStrictMode: true,
  // Webpack config para excluir templates de email del bundle de páginas
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@react-email/components': 'commonjs @react-email/components',
      })
    }
    return config
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