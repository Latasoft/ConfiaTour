'use client'

import { useState, useEffect } from 'react'
import { experienciaAdminAPI } from '@/lib/api/admin-experiencias'
import { ImageUploader, ImageData } from './ImageUploader'
import { Experiencia } from '@/types'

interface EditExperienciaModalProps {
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

export const EditExperienciaModal: React.FC<EditExperienciaModalProps> = ({
  isOpen,
  experiencia,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<ImageData[]>([])
  const [formData, setFormData] = useState<Partial<Experiencia>>({})

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && experiencia) {
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
        disponible: experiencia.disponible
      })

      // Convertir imágenes existentes
      const imagenesArray = Array.isArray(experiencia.imagenes) 
        ? experiencia.imagenes 
        : []
      
      setImages(imagenesArray.map(url => ({ url })))
    }
  }, [isOpen, experiencia])

  const handleChange = (field: keyof Experiencia, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!experiencia) return

    try {
      setLoading(true)

      const imageUrls = images.map(img => img.url)

      const updateData = {
        ...formData,
        precio: Number(formData.precio),
        capacidad: Number(formData.capacidad),
        imagenes: imageUrls,
        fecha_inicio: formData.fecha_inicio || undefined,
        fecha_fin: formData.fecha_fin || undefined,
      }

      const experienciaActualizada = await experienciaAdminAPI.actualizar(
        experiencia.id,
        updateData
      )

      alert('Experiencia actualizada exitosamente')
      onSuccess(experienciaActualizada)
      handleClose()

    } catch (error: any) {
      console.error('Error actualizando experiencia:', error)
      alert('[ERROR] ' + (error.message || 'Error al actualizar experiencia'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setFormData({})
    setImages([])
    onClose()
  }

  if (!isOpen || !experiencia) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#23A69A] to-[#1e8a7e] px-6 py-5 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Editar Experiencia</h2>
            <p className="text-sm text-white/80 mt-1">ID: {experiencia.id}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Info del Usuario */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-gray-800">
              <strong className="text-blue-900">Asignado a:</strong> <span className="font-mono text-xs">{experiencia.usuario_id}</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              No se puede cambiar el propietario de una experiencia existente
            </p>
          </div>

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

          {/* Disponibilidad */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex items-center gap-3">
            <input
              type="checkbox"
              id="disponible-edit"
              checked={formData.disponible || false}
              onChange={(e) => handleChange('disponible', e.target.checked)}
              disabled={loading}
              className="w-5 h-5 text-[#23A69A] border-gray-300 rounded focus:ring-[#23A69A]"
            />
            <label htmlFor="disponible-edit" className="text-sm font-semibold text-gray-800">
              Experiencia disponible para reservas
            </label>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imágenes
            </label>
            <ImageUploader
              images={images}
              onChange={setImages}
              userId={experiencia.usuario_id}
              disabled={loading}
              maxImages={10}
            />
          </div>

          {/* Rating (solo lectura) */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <strong className="text-yellow-900">Rating Promedio:</strong> 
              <span className="text-yellow-800 font-bold">{experiencia.rating_promedio?.toFixed(1) || '0.0'}</span>
            </p>
            <p className="text-xs text-gray-600 mt-1 ml-7">
              El rating se actualiza automáticamente con las reseñas de los usuarios
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#23A69A] text-white font-semibold rounded-lg hover:bg-[#1e8a7e] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
