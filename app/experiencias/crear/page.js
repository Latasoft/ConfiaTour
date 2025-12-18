'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/context/ToastContext'
import { uploadMultipleImages, deleteImage } from '../../../lib/uploadImages'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function CrearExperienciaPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { success, error: showErrorToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [roleError, setRoleError] = useState(null)
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    ubicacion: '',
    precio: '',
    moneda: 'USD',
    capacidad: '',
    duracion: '',
    fecha_inicio: '',
    fecha_fin: ''
  })

  // Verificar rol del usuario al cargar
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setCheckingRole(false)
        return
      }

      try {
        setCheckingRole(true)
        const response = await fetch('/api/user/profile')
        
        if (!response.ok) {
          throw new Error('Error obteniendo perfil')
        }

        const data = await response.json()
        setUserRole(data.user_type)

        // Verificar que sea guía O admin
        if (data.user_type !== 'guia' && data.user_type !== 'admin') {
          setRoleError('Solo los guías pueden crear experiencias. Solicita verificación como guía en tu perfil.')
        }
        // Verificar que esté verificado (solo aplica a guías)
        else if (data.user_type === 'guia' && !data.verified) {
          setRoleError('Tu cuenta de guía aún no está verificada. Espera la aprobación del equipo o completa el proceso de verificación.')
        }
      } catch (error) {
        console.error('Error verificando rol:', error)
        setRoleError('Error verificando permisos. Por favor, intenta más tarde.')
      } finally {
        setCheckingRole(false)
      }
    }

    if (isLoaded) {
      checkUserRole()
    }
  }, [user, isLoaded])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingImages(true)
      // Usar user.id para las imágenes
      const uploadedImages = await uploadMultipleImages(files, user.id)
      
      const newImages = uploadedImages.map(img => ({
        url: img.url,
        path: img.path
      }))
      
      setImages(prev => [...prev, ...newImages])
      
    } catch (error) {
      console.error('Error subiendo imágenes:', error)
      alert('Error al subir las imágenes: ' + error.message)
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = async (index) => {
    try {
      const imageToRemove = images[index]
      
      // Si tiene path, eliminar del storage
      if (imageToRemove.path) {
        await deleteImage(imageToRemove.path)
      }
      
      const updatedImages = images.filter((_, i) => i !== index)
      setImages(updatedImages)
      
    } catch (error) {
      console.error('Error eliminando imagen:', error)
      alert('Error al eliminar la imagen')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('Debes estar autenticado para crear una experiencia')
      return
    }

    // Debug: Ver el user ID
    console.log('Clerk User ID:', user.id)
    console.log('Clerk User object:', user)

    // Validaciones básicas
    if (!formData.titulo.trim()) {
      alert('El título es requerido')
      return
    }

    if (!formData.descripcion.trim()) {
      alert('La descripción es requerida')
      return
    }

    if (!formData.categoria) {
      alert('La categoría es requerida')
      return
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      alert('El precio debe ser mayor a 0')
      return
    }

    if (!formData.capacidad || parseInt(formData.capacidad) <= 0) {
      alert('La capacidad debe ser mayor a 0')
      return
    }

    try {
      setLoading(true)
      
      // Preparar URLs de imágenes para la base de datos
      const imageUrls = images.map(img => img.url)
      
      const experienciaData = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: formData.categoria,
        ubicacion: formData.ubicacion.trim(),
        precio: parseFloat(formData.precio),
        moneda: formData.moneda,
        capacidad: parseInt(formData.capacidad),
        duracion: formData.duracion.trim(),
        fecha_inicio: formData.fecha_inicio || undefined,
        fecha_fin: formData.fecha_fin || undefined,
        imagenes: imageUrls
      }

      console.log('Creando experiencia:', experienciaData)

      // Usar API que valida el rol
      const response = await fetch('/api/experiencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experienciaData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear experiencia')
      }

      console.log('Experiencia creada:', result.data)
      success('¡Experiencia creada exitosamente!')
      router.push('/mis-experiencias')
      
    } catch (error) {
      console.error('Error creando experiencia:', error)
      setError(error.message || 'Error al crear la experiencia')
      console.error('Error creando experiencia:', error)
    } finally {
      setLoading(false)
    }
  }

  const categorias = [
    'turismo', 'gastronomia', 'aventura', 'naturaleza', 'cultura', 'deportes',
    'alojamiento', 'transporte', 'tours'
  ]

  // Show loading while Clerk is initializing
  if (!isLoaded || checkingRole) {
    return (
      <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23A69A]"></div>
          <p className="mt-4 text-gray-600">
            {!isLoaded ? 'Cargando...' : 'Verificando permisos...'}
          </p>
        </div>
      </div>
    )
  }

  // Redirect to sign in if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Debes iniciar sesión</h2>
          <Link href="/sign-in" className="bg-[#23A69A] text-white px-6 py-3 rounded-lg hover:bg-[#1e8a7e]">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  // Mostrar error si no tiene permisos
  if (roleError) {
    return (
      <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
        <div className="max-w-md mx-auto px-5">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="mb-4 flex justify-center">
              <svg className="w-24 h-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Acceso Restringido</h2>
            <p className="text-gray-700 mb-6">{roleError}</p>
            <div className="space-y-3">
              <Link 
                href="/perfil/verificar"
                className="block bg-[#23A69A] text-white px-6 py-3 rounded-lg hover:bg-[#1e8a7e] transition-colors"
              >
                Solicitar Verificación como Guía
              </Link>
              <Link 
                href="/"
                className="block text-gray-600 hover:text-[#23A69A] transition-colors"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Crear Nueva Experiencia</h1>
            <Link 
              href="/mis-experiencias"
              className="text-gray-600 hover:text-[#23A69A] transition-colors"
            >
              ← Volver a Mis Experiencias
            </Link>
          </div>

          {/* Debug info - quitar en producción */}
          {user && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm">
                <strong>Usuario logueado:</strong> {user.firstName} {user.lastName} <br/>
                <strong>User ID:</strong> {user.id} <br/>
                <strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          )}
          
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium mb-2">Título *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                  placeholder="Ej: Tour por el Casco Antiguo"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium mb-2">Descripción *</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                  placeholder="Describe tu experiencia en detalle..."
                  required
                />
              </div>

              {/* Categoría y Ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría *</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ubicación *</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                    placeholder="Ej: Centro Histórico, Buenos Aires"
                    required
                  />
                </div>
              </div>

              {/* Precio y Capacidad */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Moneda</label>
                  <select
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="ARS">ARS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Capacidad *</label>
                  <input
                    type="number"
                    min="1"
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                    placeholder="Máx. personas"
                    required
                  />
                </div>
              </div>

              {/* Duración y Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duración *</label>
                  <input
                    type="text"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleInputChange}
                    placeholder="Ej: 2 horas, 1 día"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Disponible desde *</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Disponible hasta *</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Subir imágenes */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Imágenes de la experiencia
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingImages}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Puedes subir múltiples imágenes (máximo 5MB cada una)
                  </p>
                </div>

                {uploadingImages && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#23A69A]"></div>
                    <p className="text-sm text-gray-500 mt-2">Subiendo imágenes...</p>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-32 w-full">
                          <Image
                            src={image.url}
                            alt={`Imagen ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón submit */}
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="w-full bg-[#23A69A] text-white py-3 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando experiencia...' : 'Crear Experiencia'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}