import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'
import { useMemo } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function useSupabaseWithClerk() {
  const { isLoaded } = useAuth()

  return useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey || !isLoaded) {
      return null
    }

    // Por ahora usar cliente básico sin JWT hasta resolver la autenticación
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  }, [isLoaded])
}