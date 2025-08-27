import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseWithClerk } from '../lib/useSupabaseWithClerk'

export const useUserProfile = () => {
  const { user, isLoaded } = useUser()
  const supabase = useSupabaseWithClerk()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [needsRolSelection, setNeedsRolSelection] = useState(false)

  useEffect(() => {
    const checkUserProfile = async () => {
      // Esperar a que Clerk esté completamente cargado
      if (!isLoaded) {
        setLoading(true)
        return
      }

      // Si no hay usuario logueado, limpiar estado
      if (!user) {
        setLoading(false)
        setProfile(null)
        setNeedsRolSelection(false)
        return
      }

      // Esperar a que Supabase esté disponible
      if (!supabase) {
        setLoading(true)
        return
      }

      try {
        console.log('🔍 Verificando si existe perfil para:', user.id)
        
        // Buscar si ya existe un perfil para este usuario de Clerk
        const { data: existingProfile, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          // Error real de base de datos
          console.error('❌ Error al buscar perfil:', error)
        }

        if (!existingProfile) {
          // Usuario nuevo detectado - necesita seleccionar rol
          console.log('🆕 USUARIO NUEVO DETECTADO - Mostrando selector de rol')
          setNeedsRolSelection(true)
          setProfile(null)
        } else {
          // Usuario existente con perfil
          console.log('✅ Usuario existente con perfil:', existingProfile)
          setProfile(existingProfile)
          setNeedsRolSelection(false)
        }
      } catch (error) {
        console.error('❌ Error inesperado:', error)
        // En caso de error, mostrar selector para que el usuario pueda intentar crear perfil
        setNeedsRolSelection(true)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    checkUserProfile()
  }, [user, isLoaded, supabase])

  // Función para actualizar el perfil después de crearlo
  const updateProfile = (newProfile) => {
    console.log('✅ Perfil creado y actualizado:', newProfile)
    setProfile(newProfile)
    setNeedsRolSelection(false)
  }

  // Helpers para determinar el tipo de usuario
  const isViajero = profile?.rol === 'viajero'
  const isEmprendedor = profile?.rol === 'emprendedor'
  const isAdmin = profile?.rol === 'admin'

  return {
    profile,
    loading,
    needsRolSelection,
    updateProfile,
    isViajero,
    isEmprendedor,
    isAdmin,
    hasProfile: !!profile
  }
}