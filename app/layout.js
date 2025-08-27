'use client'
import { ClerkProvider } from '@clerk/nextjs'
import { useUserProfile } from '../hooks/useUserProfile'
import RolSelector from '../components/RolSelector'
import { checkSupabaseConfig } from '../lib/supabase-config'
import './globals.css'
import { useEffect, useState } from 'react'

function AppContent({ children }) {
  const [configError, setConfigError] = useState(null)
  const { profile, loading, needsRolSelection, updateProfile } = useUserProfile()

  useEffect(() => {
    try {
      checkSupabaseConfig()
    } catch (error) {
      setConfigError(error.message)
    }
  }, [])

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error de Configuración</h2>
          <p className="text-gray-700 mb-4">{configError}</p>
          <p className="text-sm text-gray-500">
            Verifica que tengas configuradas las variables de entorno en .env.local
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <>
      {needsRolSelection && (
        <RolSelector onRolSelected={updateProfile} />
      )}
      {children}
    </>
  )
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>
          <AppContent>{children}</AppContent>
        </body>
      </html>
    </ClerkProvider>
  )
}

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
