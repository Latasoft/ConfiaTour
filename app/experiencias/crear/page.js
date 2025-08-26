'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { supabase } from '../../../lib/supabase'
import Navbar from '../../../components/Navbar'

export default function CrearExperienciaPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    region: '',
    tipo: '',
    ubicacion: '',
    duracion: '',
    incluye: '',
    noIncluye: '',
    requisitos: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('experiencias')
        .insert([
          {
            ...formData,
            precio: formData.precio ? parseFloat(formData.precio) : null,
            usuario_id: user.id,
            created_at: new Date().toISOString()
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

              {/* Región */}
              <div>
                <label className="block text-sm font-bold mb-2">Región *</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                >
                  <option value="">Selecciona una región</option>
                  <option value="salta">Salta</option>
                  <option value="jujuy">Jujuy</option>
                  <option value="antofagasta">Antofagasta</option>
                  <option value="chaco">Chaco</option>
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-bold mb-2">Tipo de experiencia *</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="cultural">Cultural</option>
                  <option value="naturaleza">Naturaleza</option>
                  <option value="gastronomia">Gastronomía</option>
                  <option value="comunitaria">Comunitaria</option>
                  <option value="aventura">Aventura</option>
                </select>
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-bold mb-2">Precio (USD)</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="100.00"
                />
              </div>

              {/* Duración */}
              <div>
                <label className="block text-sm font-bold mb-2">Duración</label>
                <input
                  type="text"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="Ej: 3 horas, 2 días"
                />
              </div>

              {/* Ubicación */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Ubicación específica</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="Ej: Centro histórico de Salta"
                />
              </div>

              {/* Incluye */}
              <div>
                <label className="block text-sm font-bold mb-2">¿Qué incluye?</label>
                <textarea
                  name="incluye"
                  value={formData.incluye}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="Ej: Guía local, comidas, transporte..."
                />
              </div>

              {/* No incluye */}
              <div>
                <label className="block text-sm font-bold mb-2">¿Qué NO incluye?</label>
                <textarea
                  name="noIncluye"
                  value={formData.noIncluye}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="Ej: Vuelos, seguro de viaje..."
                />
              </div>

              {/* Requisitos */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Requisitos</label>
                <textarea
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#23A69A] focus:border-transparent outline-none"
                  placeholder="Ej: Buen estado físico, ropa cómoda..."
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#23A69A] text-white rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors disabled:opacity-50"
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