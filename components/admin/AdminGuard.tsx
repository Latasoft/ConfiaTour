'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const ADMIN_EMAILS = [
  'admin@confiatour.com',
  'benjatorrealba2001@gmail.com',
]

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children, fallback }) => {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      const userEmail = user?.emailAddresses[0]?.emailAddress
      const adminStatus = userEmail ? ADMIN_EMAILS.includes(userEmail) : false
      
      setIsAdmin(adminStatus)
      
      if (!adminStatus && user) {
        // Si está autenticado pero no es admin, redirigir
        router.push('/')
      }
    }
  }, [isLoaded, user, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23A69A]"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
            <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder a esta área.</p>
            <button
              onClick={() => router.push('/sign-in')}
              className="bg-[#23A69A] text-white px-6 py-3 rounded-lg hover:bg-[#1e8a7e] transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      )
    )
  }

  if (!isAdmin) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Acceso Denegado</h2>
            <p className="text-gray-600 mb-2">No tienes permisos para acceder al panel de administración.</p>
            <p className="text-sm text-gray-500 mb-6">Tu email: {user.emailAddresses[0]?.emailAddress}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#23A69A] text-white px-6 py-3 rounded-lg hover:bg-[#1e8a7e] transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

/**
 * Hook para verificar si el usuario actual es admin
 */
export const useIsAdmin = () => {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded || !user) {
    return false
  }
  
  const userEmail = user.emailAddresses[0]?.emailAddress
  return userEmail ? ADMIN_EMAILS.includes(userEmail) : false
}
