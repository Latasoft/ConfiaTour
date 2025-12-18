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
        hostname: 'dftpkkwumfhxdfwdwohh.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wallpapers.com',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
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