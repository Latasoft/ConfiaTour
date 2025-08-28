'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

export default function CrearExperienciaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { user, isLoaded: userLoaded } = useUser()
  const { session, isLoaded: sessionLoaded } = useSession()
  
  const [formData, setFormData] = useState({
    nombre: '', // Cambiado de titulo a nombre
    precio: '',
    imagen: '', // Cambiado de imagen_url a imagen
    ubicacion: '' // Este campo no existe en tu tabla, lo eliminaremos
  })

  // Cambia la función createClerkSupabaseClient por un cliente simple:
  function createClerkSupabaseClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }

  const client = createClerkSupabaseClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      console.log('Enviando datos:', {
        nombre: formData.nombre,
        precio: parseInt(formData.precio), // Convertir a entero
        imagen: formData.imagen || null,
        user_id: user.id
      })

      // Insertar experiencia en Supabase con los nombres correctos de columna
      const { data, error } = await client.from('experiencias').insert({
        nombre: formData.nombre, // Usar 'nombre' en lugar de 'titulo'
        precio: formData.precio ? parseInt(formData.precio) : null, // Convertir a bigint
        imagen: formData.imagen || null, // Usar 'imagen' en lugar de 'imagen_url'
        user_id: user.id
        // Eliminar descripcion y ubicacion ya que no existen en tu tabla
      }).select()

      if (error) {
        console.error('Error detallado de Supabase:', error)
        alert('Error al crear la experiencia: ' + error.message)
      } else {
        console.log('Experiencia creada exitosamente:', data)
        alert('Experiencia creada exitosamente!')
        // Limpiar formulario
        setFormData({
          nombre: '',
          precio: '',
          imagen: ''
        })
        router.push('/test')
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      alert('Error inesperado al crear la experiencia: ' + err.message)
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!userLoaded || !sessionLoaded) {
    return <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
      <div>Loading Clerk...</div>
    </div>
  }

  if (!user) {
    return <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
      <div>Please sign in to continue</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-5">
          <h1 className="text-4xl font-bold text-center mb-12">Crear Nueva Experiencia</h1>
          
          <div className="bg-white p-4 rounded-xl mb-6 shadow-lg">
            <p className="text-sm text-gray-600">
              Creando como: <strong>{user.firstName || user.emailAddresses[0].emailAddress}</strong>
            </p>
            <p className="text-xs text-gray-500">User ID: {user.id}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Nombre de la experiencia *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="Ej: Tour gastronómico por Salta"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Precio *</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">URL de imagen</label>
                <input
                  type="url"
                  name="imagen"
                  value={formData.imagen}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/test')}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600 transition-colors"
              >
                Ver Experiencias
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#23A69A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Experiencia'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}