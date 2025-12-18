'use client'

import { useState } from 'react'
import { experienciaAdminAPI, CrearExperienciaData } from '@/lib/api/admin-experiencias'
import { ImageUploader, ImageData } from './ImageUploader'
import { UserSelector } from './UserSelector'
import { Experiencia } from '@/types'

interface CreateExperienciaModalProps {
  isOpen: boolean
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

export const CreateExperienciaModal: React.FC<CreateExperienciaModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<ImageData[]>([])
  const [formData, setFormData] = useState<Partial<CrearExperienciaData>>({
    usuario_id: '',
    titulo: '',
    descripcion: '',
    categoria: '',
    ubicacion: '',
    precio: 0,
    moneda: 'CLP',
    capacidad: 1,
    duracion: '',
    fecha_inicio: '',
    fecha_fin: '',
    disponible: true
  })

  const handleChange = (field: keyof CrearExperienciaData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.usuario_id) {
      alert('Debes seleccionar un usuario')
      return
    }

    if (images.length === 0) {
      if (!confirm('No has agregado imágenes. ¿Deseas continuar sin imágenes?')) {
        return
      }
    }

    try {
      setLoading(true)

      const imageUrls = images.map(img => img.url)

      const data: CrearExperienciaData = {
        usuario_id: formData.usuario_id!,
        titulo: formData.titulo!,
        descripcion: formData.descripcion!,
        categoria: formData.categoria!,
        ubicacion: formData.ubicacion!,
        precio: Number(formData.precio!),
        moneda: formData.moneda!,
        capacidad: Number(formData.capacidad!),
        duracion: formData.duracion!,
        fecha_inicio: formData.fecha_inicio || undefined,
        fecha_fin: formData.fecha_fin || undefined,
        imagenes: imageUrls,
        disponible: formData.disponible
      }

      const nuevaExperiencia = await experienciaAdminAPI.crear(data)

      alert('Experiencia creada exitosamente')
      onSuccess(nuevaExperiencia)
      handleClose()

    } catch (error: any) {
      console.error('Error creando experiencia:', error)
      alert('[ERROR] ' + (error.message || 'Error al crear experiencia'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setFormData({
      usuario_id: '',
      titulo: '',
      descripcion: '',
      categoria: '',
      ubicacion: '',
      precio: 0,
      moneda: 'CLP',
      capacidad: 1,
      duracion: '',
      fecha_inicio: '',
      fecha_fin: '',
      disponible: true
    })
    setImages([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Experiencia</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Usuario Asignado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asignar a Usuario (Guía) *
            </label>
            <UserSelector
              value={formData.usuario_id || ''}
              onChange={(userId) => handleChange('usuario_id', userId)}
              disabled={loading}
              filterByType="guia"
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo se muestran usuarios tipo &quot;guía&quot;
            </p>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              disabled={loading}
              required
              minLength={5}
              maxLength={200}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent text-gray-900"
              placeholder="Ej: Tour por el Casco Antiguo"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              disabled={loading}
              required
              minLength={20}
              maxLength={5000}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent text-gray-900"
              placeholder="Describe la experiencia en detalle..."
            />
          </div>

          {/* Categoría y Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
                disabled={loading}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent text-gray-900"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => handleChange('ubicacion', e.target.value)}
                disabled={loading}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent text-gray-900"
                placeholder="Ej: Centro Histórico, Santiago"
              />
            </div>
          </div>

          {/* Precio, Moneda y Capacidad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio *
              </label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => handleChange('precio', parseFloat(e.target.value))}
                disabled={loading}
                required
                min={0}
                step={0.01}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda *
              </label>
              <select
                value={formData.moneda}
                onChange={(e) => handleChange('moneda', e.target.value)}
                disabled={loading}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent text-gray-900"
              >
                {MONEDAS.map(moneda => (
                  <option key={moneda.code} value={moneda.code}>
                    {moneda.code} - {moneda.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad *
              </label>
              <input
                type="number"
                value={formData.capacidad}
                onChange={(e) => handleChange('capacidad', parseInt(e.target.value))}
                disabled={loading}
                required
                min={1}
                max={100}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración *
            </label>
            <input
              type="text"
              value={formData.duracion}
              onChange={(e) => handleChange('duracion', e.target.value)}
              disabled={loading}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent text-gray-900"
              placeholder="Ej: 3 horas, 1 día, 2 días 1 noche"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio (Opcional)
              </label>
              <input
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                disabled={loading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin (Opcional)
              </label>
              <input
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => handleChange('fecha_fin', e.target.value)}
                disabled={loading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) => handleChange('disponible', e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-[#23A69A] border-gray-300 rounded focus:ring-[#23A69A]"
            />
            <label htmlFor="disponible" className="text-sm font-medium text-gray-700">
              Disponible inmediatamente
            </label>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes
            </label>
            <ImageUploader
              images={images}
              onChange={setImages}
              userId={formData.usuario_id || 'admin'}
              disabled={loading || !formData.usuario_id}
              maxImages={10}
            />
            {!formData.usuario_id && (
              <p className="text-xs text-amber-600 mt-2">
                Selecciona un usuario antes de subir imágenes
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#23A69A] text-white rounded-lg hover:bg-[#1e8a7e] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Experiencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
