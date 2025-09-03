'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { getExperienciaById, getResenasByExperiencia, crearReserva, crearResena } from '../../../lib/experiencias'

export default function DetalleExperienciaPage() {
  const { id } = useParams()
  const { user } = useUser()
  const [experiencia, setExperiencia] = useState(null)
  const [resenas, setResenas] = useState([])
  const [loading, setLoading] = useState(true)
  const [cantidadPersonas, setCantidadPersonas] = useState(1)
  const [showReservaModal, setShowReservaModal] = useState(false)
  
  // Estados para reseñas
  const [showResenaModal, setShowResenaModal] = useState(false)
  const [nuevaResena, setNuevaResena] = useState({
    rating: 5,
    comentario: ''
  })
  const [creandoResena, setCreandoResena] = useState(false)

  useEffect(() => {
    if (id) {
      cargarDatos()
    }
  }, [id])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [experienciaData, resenasData] = await Promise.all([
        getExperienciaById(id),
        getResenasByExperiencia(id)
      ])
      setExperiencia(experienciaData)
      setResenas(resenasData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReservar = async () => {
    if (!user) {
      window.location.href = '/sign-in'
      return
    }

    try {
      const reservaData = {
        experiencia_id: experiencia.id,
        usuario_id: user.id,
        fecha_reserva: new Date().toISOString(),
        fecha_experiencia: experiencia.fecha_inicio,
        cantidad_personas: cantidadPersonas,
        precio_total: experiencia.precio * cantidadPersonas,
        estado: 'pendiente',
        metodo_pago: 'pendiente',
        pagado: false
      }

      await crearReserva(reservaData)
      alert('¡Reserva creada exitosamente!')
      setShowReservaModal(false)
    } catch (error) {
      console.error('Error creando reserva:', error)
      alert('Error al crear la reserva')
    }
  }

  const handleCrearResena = async () => {
    if (!user) {
      window.location.href = '/sign-in'
      return
    }

    if (!nuevaResena.comentario.trim()) {
      alert('Por favor escribe un comentario')
      return
    }

    try {
      setCreandoResena(true)
      const resenaData = {
        experiencia_id: experiencia.id,
        usuario_id: user.id,
        rating: nuevaResena.rating,
        comentario: nuevaResena.comentario.trim(),
        creado_en: new Date().toISOString()
      }

      await crearResena(resenaData)
      
      const resenasActualizadas = await getResenasByExperiencia(id)
      setResenas(resenasActualizadas)
      
      setNuevaResena({ rating: 5, comentario: '' })
      setShowResenaModal(false)
      
      alert('¡Reseña creada exitosamente!')
    } catch (error) {
      console.error('Error creando reseña:', error)
      alert('Error al crear la reseña')
    } finally {
      setCreandoResena(false)
    }
  }

  // Verificar si el usuario ya dejó una reseña
  const yaDejoResena = user && resenas.some(resena => resena.usuario_id_id === user.id)

  // Función segura para parsear imágenes (igual que en ExperienciaCard)
  const parseImagenes = (imagenesData) => {
    if (!imagenesData) return []
    
    try {
      if (Array.isArray(imagenesData)) return imagenesData
      
      if (typeof imagenesData === 'string') {
        if (imagenesData.trim() === '') return []
        return JSON.parse(imagenesData)
      }
      
      return []
    } catch (error) {
      console.warn('Error parseando imágenes:', error)
      return []
    }
  }

  // Función para validar y convertir URLs de imágenes (igual que en ExperienciaCard)
  const validarImagenUrl = (imagenUrl) => {
    if (!imagenUrl || typeof imagenUrl !== 'string') return null
    
    // Si ya es una URL completa (http/https), devolverla
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
      return imagenUrl
    }
    
    // Si empieza con /, es una ruta válida
    if (imagenUrl.startsWith('/')) {
      return imagenUrl
    }
    
    // Si es solo un nombre de archivo, usar placeholder
    if (imagenUrl.includes('.')) {
      return null
    }
    
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23A69A]"></div>
      </div>
    )
  }

  if (!experiencia) {
    return (
      <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
        <p>Experiencia no encontrada</p>
      </div>
    )
  }

  const imagenes = parseImagenes(experiencia.imagenes)
  const imagenesValidas = imagenes.map(validarImagenUrl).filter(Boolean)

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          {/* Galería de imágenes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {imagenesValidas.length > 0 ? (
              imagenesValidas.map((imagen, index) => (
                <div key={index} className="relative h-64 md:h-80">
                  <Image
                    src={imagen}
                    alt={`${experiencia.titulo} - imagen ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop'
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2">
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p>Sin imágenes disponibles</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información principal */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                    {experiencia.categoria}
                  </span>
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-xl">★</span>
                    <span className="ml-1 font-medium">
                      {experiencia.rating_promedio || 'Sin calificar'}
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-4">{experiencia.titulo}</h1>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {experiencia.ubicacion}
                </div>

                <p className="text-gray-700 mb-6">{experiencia.descripcion}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duración:</span> {experiencia.duracion}
                  </div>
                  <div>
                    <span className="font-medium">Capacidad:</span> {experiencia.capacidad} personas
                  </div>
                  <div>
                    <span className="font-medium">Disponible desde:</span> {new Date(experiencia.fecha_inicio).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Disponible hasta:</span> {new Date(experiencia.fecha_fin).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Reseñas */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Reseñas ({resenas.length})</h3>
                  {user && !yaDejoResena && (
                    <button
                      onClick={() => setShowResenaModal(true)}
                      className="bg-[#23A69A] text-white px-4 py-2 rounded-lg hover:bg-[#1e8a7e] transition-colors"
                    >
                      Escribir Reseña
                    </button>
                  )}
                </div>

                {resenas.length > 0 ? (
                  <div className="space-y-4">
                    {resenas.map((resena) => (
                      <div key={resena.id} className="border-b pb-4">
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>
                                {i < resena.rating ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {new Date(resena.creado_en).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{resena.comentario}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aún no hay reseñas para esta experiencia.</p>
                )}
              </div>
            </div>

            {/* Panel de reserva */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-[#23A69A]">
                    ${experiencia.precio}
                  </span>
                  <span className="text-gray-600"> {experiencia.moneda} por persona</span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Cantidad de personas
                  </label>
                  <select
                    value={cantidadPersonas}
                    onChange={(e) => setCantidadPersonas(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {[...Array(experiencia.capacidad)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} persona{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold">
                      ${(experiencia.precio * cantidadPersonas).toFixed(2)} {experiencia.moneda}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowReservaModal(true)}
                  className="w-full bg-[#23A69A] text-white py-3 rounded-lg hover:bg-[#1e8a7e] transition-colors font-medium"
                >
                  Reservar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de confirmación de reserva */}
      {showReservaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirmar Reserva</h3>
            <p className="mb-4">
              ¿Estás seguro de que quieres reservar esta experiencia para {cantidadPersonas} persona{cantidadPersonas > 1 ? 's' : ''}?
            </p>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p><strong>Total a pagar:</strong> ${(experiencia.precio * cantidadPersonas).toFixed(2)} {experiencia.moneda}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowReservaModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReservar}
                className="flex-1 px-4 py-2 bg-[#23A69A] text-white rounded-lg hover:bg-[#1e8a7e]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear reseña */}
      {showResenaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Escribir Reseña</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Calificación</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNuevaResena({ ...nuevaResena, rating: star })}
                    className={`text-2xl ${star <= nuevaResena.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Comentario</label>
              <textarea
                value={nuevaResena.comentario}
                onChange={(e) => setNuevaResena({ ...nuevaResena, comentario: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows="4"
                placeholder="Comparte tu experiencia..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowResenaModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={creandoResena}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearResena}
                disabled={creandoResena}
                className="flex-1 px-4 py-2 bg-[#23A69A] text-white rounded-lg hover:bg-[#1e8a7e] disabled:opacity-50"
              >
                {creandoResena ? 'Enviando...' : 'Enviar Reseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}