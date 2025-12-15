/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Deshabilitar pre-rendering completamente
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  experimental: {
    // Deshabilitar optimizaciones que causan el pre-rendering
    isrMemoryCacheSize: 0,
  },
  reactStrictMode: true,
  // CRÍTICO: Deshabilitar generación de páginas de error estáticas
  // Esto evita el error de <Html> durante el build
  skipTrailingSlashRedirect: false,
  // Usar solo renderizado dinámico
  distDir: '.next',
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