import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente de Supabase con autenticación de Clerk
export const createClerkSupabaseClient = (clerkToken) => {
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
          'app-current-user-id': '', // Se establecerá dinámicamente
        },
      },
      auth: {
        persistSession: false,
      },
    }
  )
}

// Función helper para crear perfil
export const createUserProfile = async (supabaseClient, userData) => {
  const { data, error } = await supabaseClient
    .from('perfiles')
    .insert({
      id: userData.id,
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      rol: userData.rol || 'viajero',
      telefono: userData.telefono,
      pais: userData.pais,
      avatar_url: userData.avatar_url,
    })
    .select()
    .single()

  return { data, error }
}