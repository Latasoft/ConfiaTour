import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Session } from '@clerk/nextjs/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Cliente público de Supabase para operaciones sin autenticación
 * Usar solo para lectura de datos públicos
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
