import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Session } from '@clerk/nextjs/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Logging para debug (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔍 Supabase config:', {
    url: supabaseUrl ? '✅' : '❌',
    anonKey: supabaseAnonKey ? '✅' : '❌',
    serviceKey: supabaseServiceKey ? '✅ CONFIGURADA' : '❌ FALTA'
  })
}

/**
 * Cliente público de Supabase para operaciones sin autenticación
 * Usar solo para lectura de datos públicos
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Cliente de servicio con privilegios completos (bypasea RLS)
 * ⚠️ SOLO USAR EN SERVIDOR - Tiene acceso total a la BD
 * Usar para operaciones server-side después de validar autenticación con Clerk
 */
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // Fallback al cliente público si no hay service key

/**
 * Crea un cliente de Supabase con autenticación de Clerk
 * Usar para todas las operaciones que requieren autenticación
 */
export function createAuthSupabaseClient(session: Session | null): SupabaseClient {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        fetch: async (url, options = {}) => {
          // Obtener token de Clerk si existe sesión
          // @ts-ignore - Clerk session type compatibility
          const clerkToken = await session?.getToken({
            template: 'supabase',
          })
          
          const headers = new Headers(options?.headers)
          
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`)
          }
          
          return fetch(url, {
            ...options,
            headers,
          })
        },
      },
    },
  )
}

/**
 * Helper para operaciones con Row Level Security (RLS)
 * Usa este cliente cuando necesites que las policies de RLS se apliquen
 */
export async function withAuthClient<T>(
  session: Session | null,
  callback: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  const client = createAuthSupabaseClient(session)
  return callback(client)
}
