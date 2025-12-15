/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Render
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
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
  // Excluir librerías de email del bundle para evitar errores de React Email
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      // Excluir React Email y Resend del bundle del servidor durante pre-rendering
      config.externals.push('resend', '@react-email/components', '@react-email/render')
    }
    return config
  },
}

module.exports = nextConfig