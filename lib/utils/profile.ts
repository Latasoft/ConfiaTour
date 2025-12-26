import { currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '../db/supabase'

/**
 * Asegura que el perfil del usuario existe en Supabase
 * Si no existe, lo crea automáticamente con tipo 'viajero'
 */
export async function ensureUserProfile(clerkUserId: string): Promise<void> {
  try {
    // Verificar si el perfil ya existe por clerk_user_id
    const { data: existingProfile, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('clerk_user_id, email')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle()

    if (existingProfile) {
      // Perfil ya existe
      return
    }

    // Obtener datos del usuario de Clerk
    const user = await currentUser()
    if (!user) {
      console.warn('[WARN] No se pudo obtener usuario de Clerk para crear perfil')
      return
    }

    const userEmail = user.emailAddresses[0]?.emailAddress
    if (!userEmail) {
      console.warn('[WARN] Usuario sin email, no se puede crear perfil')
      return
    }

    // Verificar si ya existe un perfil con ese email (podría ser de una sesión anterior)
    const { data: profileByEmail } = await supabaseAdmin
      .from('profiles')
      .select('clerk_user_id, email')
      .eq('email', userEmail)
      .maybeSingle()

    if (profileByEmail) {
      // Ya existe un perfil con este email, actualizar el clerk_user_id
      console.log(`🔄 Actualizando clerk_user_id para email: ${userEmail}`)
      
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ clerk_user_id: clerkUserId })
        .eq('email', userEmail)

      if (updateError) {
        console.error('[ERROR] Error actualizando clerk_user_id:', updateError)
        throw updateError
      }

      console.log('✅ Perfil actualizado exitosamente')
      return
    }

    // Crear perfil nuevo
    console.log(`👤 Creando perfil para usuario: ${clerkUserId}`)
    
    const { error } = await supabaseAdmin
      .from('profiles')
      .insert({
        clerk_user_id: clerkUserId,
        email: userEmail,
        full_name: user.fullName || user.firstName || 'Usuario',
        avatar_url: user.imageUrl || null,
        user_type: 'viajero', // Por defecto todos son viajeros
        verified: false
      })

    if (error) {
      // Si es error de duplicado, ignorar (race condition)
      if (error.code === '23505') {
        console.log('[INFO] Perfil ya existe (race condition), continuando...')
        return
      }
      
      console.error('[ERROR] Error creando perfil:', error)
      throw error
    }

    console.log('✅ Perfil creado exitosamente')
  } catch (error) {
    console.error('[ERROR] Error en ensureUserProfile:', error)
    // No lanzamos el error para no bloquear la operación principal
  }
}

/**
 * Obtiene el perfil completo de un usuario
 * Si no existe, lo crea
 */
export async function getUserProfile(clerkUserId: string) {
  // Asegurar que existe
  await ensureUserProfile(clerkUserId)

  // Obtener perfil
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Actualiza el tipo de usuario
 * Solo debe usarse desde endpoints admin o procesos de verificación
 */
export async function updateUserType(
  clerkUserId: string, 
  userType: 'viajero' | 'guia' | 'admin'
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ user_type: userType })
      .eq('clerk_user_id', clerkUserId)

    if (error) {
      console.error('Error actualizando user_type:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error en updateUserType:', error)
    return false
  }
}
