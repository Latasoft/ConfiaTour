import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Cliente básico (sin autenticación) - Solo para lectura pública
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Crea un cliente de Supabase autenticado con el token de Clerk
 * Úsalo cuando necesites hacer operaciones que requieren autenticación (RLS)
 * @param {Object} session - Sesión de Clerk obtenida con useSession()
 * @returns {Object} Cliente de Supabase autenticado
 */
export function createClerkSupabaseClient(session) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: async (url, options = {}) => {
          // Obtener token JWT de Clerk para Supabase
          const clerkToken = await session?.getToken({
            template: 'supabase',
          })
          
          // Insertar token en headers de autorización
          const headers = new Headers(options?.headers)
          headers.set('Authorization', `Bearer ${clerkToken}`)
          
          return fetch(url, {
            ...options,
            headers,
          })
        },
      },
    },
  )
}

// Exportar como default para compatibilidad
export default supabase
