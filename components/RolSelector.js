'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSupabaseWithClerk } from '../lib/useSupabaseWithClerk'

export default function RolSelector({ onRolSelected }) {
  const [selectedRol, setSelectedRol] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  const supabase = useSupabaseWithClerk()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedRol) {
      alert('Por favor selecciona un tipo de usuario')
      return
    }
    
    if (!user) {
      alert('Error: No se detectó usuario logueado')
      return
    }
    
    if (!supabase) {
      alert('Error: Problema de conexión con la base de datos')
      return
    }

    setLoading(true)
    console.log('🚀 CREANDO NUEVO PERFIL')
    console.log('Usuario Clerk ID:', user.id)
    console.log('Rol seleccionado:', selectedRol)

    try {
      // Preparar datos del perfil
      const profileData = {
        id: user.id,
        nombre: user.firstName || 'Usuario',
        apellido: user.lastName || '',
        email: user.emailAddresses[0]?.emailAddress || '',
        rol: selectedRol,
        avatar_url: user.imageUrl || null,
        telefono: user.phoneNumbers[0]?.phoneNumber || null,
        pais: null // Se puede agregar después
      }

      console.log('📝 Datos a insertar:', profileData)

      // Insertar en la tabla perfiles
      const { data, error } = await supabase
        .from('perfiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error al crear perfil:', error)
        
        // Manejar errores específicos
        if (error.code === '23505') {
          alert('Ya existe un perfil para este usuario. Recarga la página.')
        } else {
          alert(`Error al crear perfil: ${error.message}`)
        }
        return
      }

      console.log('✅ Perfil creado exitosamente:', data)
      
      // Mostrar mensaje de bienvenida
      alert(`¡Bienvenido a ConfiaTour como ${selectedRol}! 🎉`)
      
      // Actualizar el estado del perfil
      onRolSelected(data)

    } catch (error) {
      console.error('❌ Error inesperado al crear perfil:', error)
      alert(`Error inesperado: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 text-black">¡Bienvenido a ConfiaTour! 🎉</h2>
          <p className="text-gray-600">
            Hola, para completar tu registro necesitamos saber:
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-8">
            
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${
              selectedRol === 'viajero' 
                ? 'border-[#23A69A] bg-[#23A69A]/10 shadow-md' 
                : 'border-gray-200 hover:border-[#23A69A]/50'
            }`}>
              <input
                type="radio"
                name="rol"
                value="viajero"
                checked={selectedRol === 'viajero'}
                onChange={(e) => setSelectedRol(e.target.value)}
                className="mr-4 w-4 h-4 text-[#23A69A]"
              />
              <div className="flex-1">
                <div className="font-bold text-lg text-black flex items-center">
                  <span className="mr-2">🧳</span>
                  Soy Viajero
                </div>
                <div className="text-gray-600 text-sm">
                  Quiero explorar y reservar experiencias únicas
                </div>
              </div>
            </label>

            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${
              selectedRol === 'emprendedor' 
                ? 'border-[#23A69A] bg-[#23A69A]/10 shadow-md' 
                : 'border-gray-200 hover:border-[#23A69A]/50'
            }`}>
              <input
                type="radio"
                name="rol"
                value="emprendedor"
                checked={selectedRol === 'emprendedor'}
                onChange={(e) => setSelectedRol(e.target.value)}
                className="mr-4 w-4 h-4 text-[#23A69A]"
              />
              <div className="flex-1">
                <div className="font-bold text-lg text-black flex items-center">
                  <span className="mr-2">🏪</span>
                  Soy Emprendedor
                </div>
                <div className="text-gray-600 text-sm">
                  Quiero ofrecer y vender mis experiencias turísticas
                </div>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={!selectedRol || loading}
            className="w-full bg-[#23A69A] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#23A69A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando tu perfil...
              </>
            ) : (
              'Continuar'
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Tu información será guardada de forma segura y podrás cambiar tu rol más tarde.
        </p>
      </div>
    </div>
  )
}