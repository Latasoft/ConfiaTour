'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useSupabaseWithClerk } from '../../../lib/useSupabaseWithClerk'
import Navbar from '../../../components/Navbar'

export default function CrearExperienciaPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const supabase = useSupabaseWithClerk()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    ubicacion: '',
    imagen_url: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || !supabase) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('experiencias')
        .insert([
          {
            ...formData,
            precio: formData.precio ? parseFloat(formData.precio) : null,
            emprendedor_id: user.id, // Cambié de usuario_id a emprendedor_id
          }
        ])

      if (error) {
        console.error('Error:', error)
        alert('Error al crear la experiencia')
      } else {
        alert('Experiencia creada exitosamente!')
        router.push('/experiencias')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear la experiencia')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!isLoaded) {
    return <div>Cargando...</div>
  }

  if (!user) {
    router.push('/experiencias')
    return null
  }

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <Navbar />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-5">
          <h1 className="text-4xl font-bold text-center mb-12">Crear Nueva Experiencia</h1>
          
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Título de la experiencia *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="Ej: Tour gastronómico por Salta"
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Descripción *</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="Describe tu experiencia..."
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-bold mb-2">Precio *</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="100.00"
                />
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-bold mb-2">Ubicación</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="Ej: Centro histórico de Salta"
                />
              </div>

              {/* URL de imagen */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">URL de imagen</label>
                <input
                  type="url"
                  name="imagen_url"
                  value={formData.imagen_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
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