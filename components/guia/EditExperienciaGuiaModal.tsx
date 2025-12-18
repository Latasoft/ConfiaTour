'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { ImageUploader, ImageData } from '../admin/ImageUploader'
import { Experiencia } from '@/types'
import { supabase } from '@/lib/supabaseClient'

interface EditExperienciaGuiaModalProps {
  isOpen: boolean
  experiencia: Experiencia | null
  onClose: () => void
  onSuccess: (experiencia: Experiencia) => void
}

const CATEGORIAS = [
  'turismo',
  'gastronomia',
  'aventura',
  'naturaleza',
  'cultura',
  'deportes',
  'alojamiento',
  'transporte',
  'tours'
]

const MONEDAS = [
  { code: 'CLP', name: 'Peso Chileno' },
  { code: 'USD', name: 'Dólar Estadounidense' },
  { code: 'ARS', name: 'Peso Argentino' },
  { code: 'BRL', name: 'Real Brasileño' },
  { code: 'PYG', name: 'Guaraní Paraguayo' },
]

export const EditExperienciaGuiaModal: React.FC<EditExperienciaGuiaModalProps> = ({
  isOpen,
  experiencia,
  onClose,
  onSuccess
}) => {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<ImageData[]>([])
  const [formData, setFormData] = useState<Partial<Experiencia>>({})

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && experiencia) {
      // Validar que el usuario sea el dueño
      if (experiencia.usuario_id !== user?.id) {
        alert('No tienes permiso para editar esta experiencia')
        onClose()
        return
      }

      setFormData({
        titulo: experiencia.titulo,
        descripcion: experiencia.descripcion,
        categoria: experiencia.categoria,
        ubicacion: experiencia.ubicacion,
        precio: experiencia.precio,
        moneda: experiencia.moneda,
        capacidad: experiencia.capacidad,
        duracion: experiencia.duracion,
        fecha_inicio: experiencia.fecha_inicio || '',
        fecha_fin: experiencia.fecha_fin || '',
      })

      // Convertir imágenes existentes
      const imagenesArray = Array.isArray(experiencia.imagenes) 
        ? experiencia.imagenes 
        : []
      
      setImages(imagenesArray.map(url => ({ url })))
    }
  }, [isOpen, experiencia, user, onClose])

  const handleChange = (field: keyof Experiencia, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!experiencia || !user) return

    try {
      setLoading(true)

      const imageUrls = images.map(img => img.url)

      const updateData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        ubicacion: formData.ubicacion,
        precio: Number(formData.precio),
        moneda: formData.moneda,
        capacidad: Number(formData.capacidad),
        duracion: formData.duracion,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null,
        imagenes: imageUrls,
        actualizado_en: new Date().toISOString()
      }

      // Actualizar usando Supabase directamente con validación de usuario
      const { data, error } = await supabase
        .from('experiencias')
        .update(updateData)
        .eq('id', experiencia.id)
        .eq('usuario_id', user.id) // Seguridad: solo el dueño puede actualizar
        .select()
        .single()

      if (error) {
        console.error('Error actualizando experiencia:', error)
        throw new Error(error.message)
      }

      alert('Experiencia actualizada exitosamente')
      onSuccess(data)
      onClose()

    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al actualizar la experiencia')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Editar Experiencia</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo || ''}
              onChange={(e) => handleChange('titulo', e.target.value)}
              disabled={loading}
              required
              minLength={5}
              maxLength={200}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] text-gray-900 disabled:bg-gray-100"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion || ''}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              disabled={loading}
              required
              minLength={20}
              maxLength={5000}
              rows={4}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] text-gray-900 disabled:bg-gray-100"
            />
          </div>

          {/* Categoría y Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                value={formData.categoria || ''}
                onChange={(e) => handleChange('categoria', e.target.value)}
                disabled={loading}
                required
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] text-gray-900 disabled:bg-gray-100"
              >
                <option value="">Selecciona categoría</option>
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                value={formData.ubicacion || ''}
                onChange={(e) => handleChange('ubicacion', e.target.value)}
                disabled={loading}
                required
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] text-gray-900 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Precio, Moneda y Capacidad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                value={formData.precio || 0}
                onChange={(e) => handleChange('precio', parseFloat(e.target.value))}
                disabled={loading}
                required
                min={0}
                step={0.01}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] text-gray-900 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Moneda *
              </label>
              <select
                value={formData.moneda || 'CLP'}
                onChange={(e) => handleChange('moneda', e.target.value)}
                disabled={loading}
                required
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] text-gray-900 disabled:bg-gray-100"
              >
                {MONEDAS.map(moneda => (
                  <option key={moneda.code} value={moneda.code}>
                    {moneda.code} - {moneda.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Capacidad *
              </label>
              <input
                type="number"
                value={formData.capacidad || 1}
                onChange={(e) => handleChange('capacidad', parseInt(e.target.value))}
                disabled={loading}
                required
                min={1}
                max={100}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] text-gray-900 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Duración *
            </label>
            <input
              type="text"
              value={formData.duracion || ''}
              onChange={(e) => handleChange('duracion', e.target.value)}
              disabled={loading}
              required
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] text-gray-900 disabled:bg-gray-100"
              placeholder="Ej: 3 horas, 1 día, 2 días 1 noche"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Inicio (Opcional)
              </label>
              <input
                type="date"
                value={formData.fecha_inicio || ''}
                onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                disabled={loading}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] text-gray-900 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Fin (Opcional)
              </label>
              <input
                type="date"
                value={formData.fecha_fin || ''}
                onChange={(e) => handleChange('fecha_fin', e.target.value)}
                disabled={loading}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] text-gray-900 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imágenes
            </label>
            <ImageUploader
              images={images}
              onChange={setImages}
              userId={user?.id || 'guest'}
              disabled={loading}
              maxImages={10}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#23A69A] text-white rounded-lg hover:bg-[#1e8c82] disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
