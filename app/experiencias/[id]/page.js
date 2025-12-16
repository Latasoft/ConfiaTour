'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { getExperienciaById, getResenasByExperiencia, crearResena } from '../../../lib/experiencias'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { ReservasAPI } from '../../../lib/api/reservas'

export const dynamic = 'force-dynamic'

// Tasas de conversión simples a CLP
const RATES_TO_CLP = {
  USD: 950,   // 1 USD = 950 CLP
  ARS: 1.1,   // 1 ARS = 1.1 CLP  
  CLP: 1,     // 1 CLP = 1 CLP
  BRL: 180,   // 1 BRL = 180 CLP
  PYG: 0.13   // 1 PYG = 0.13 CLP
}

// Función simple para convertir a CLP
const convertToCLP = (amount, currency) => {
  const rate = RATES_TO_CLP[currency] || 1
  return Math.round(amount * rate)
}

export default function DetalleExperienciaPage() {

  initMercadoPago('APP_USR-042e0ef9-c8c0-4b1b-bdf7-de8f207b5fbf')
  const { id } = useParams()
  const { user } = useUser()
  const router = useRouter()
  const [experiencia, setExperiencia] = useState(null)
  const [resenas, setResenas] = useState([])
  const [loading, setLoading] = useState(true)
  const [cantidadPersonas, setCantidadPersonas] = useState(1)
  const [fechaReserva, setFechaReserva] = useState('') // Nueva fecha de reserva
  const [showReservaModal, setShowReservaModal] = useState(false)
  const [procesandoPago, setProcesandoPago] = useState(false)
  
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

    // Validar que se seleccionó una fecha
    if (!fechaReserva) {
      alert('Por favor selecciona una fecha para tu reserva')
      return
    }

    try {
      setProcesandoPago(true)

      // Convertir TODO a CLP automáticamente
      const precioOriginal = experiencia.precio
      const monedaOriginal = experiencia.moneda
      const precioCLP = convertToCLP(precioOriginal, monedaOriginal)
      const totalCLP = precioCLP * cantidadPersonas
      
      console.log('💰 Pago automático en CLP:', {
        original: `${precioOriginal} ${monedaOriginal}`,
        convertido: `${precioCLP} CLP`,
        total: `${totalCLP} CLP`
      })

      // Generar IDs únicos
      const buyOrder = `ORD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      const sessionId = `SES${Date.now()}${Math.random().toString(36).substring(2, 15).toUpperCase()}`

      // ✅ Crear reserva usando la nueva API segura
      // El usuario_id se obtiene automáticamente de la sesión de Clerk en el servidor
      console.log('📝 Creando reserva vía API segura...')
      console.log('📋 Datos a enviar:', {
        experiencia_id: id, // Usar el ID de la URL (useParams)
        fecha_experiencia: fechaReserva,
        cantidad_personas: cantidadPersonas,
        precio_total: totalCLP,
        metodo_pago: 'transbank',
        buy_order: buyOrder,
        session_id: sessionId
      })
      
      const reservaCreada = await ReservasAPI.crear({
        experiencia_id: id, // ✅ ID de la URL (siempre es UUID válido)
        fecha_experiencia: fechaReserva, // Usar la fecha seleccionada por el usuario
        cantidad_personas: cantidadPersonas,
        precio_total: totalCLP, // Todo en CLP
        metodo_pago: 'transbank',
        buy_order: buyOrder,
        session_id: sessionId
      })
      
      console.log('✅ Reserva creada:', reservaCreada.id)
      
      const returnUrl = `${window.location.origin}/transbank/return?reserva_id=${reservaCreada.id}&experiencia_id=${id}`

      // Crear transacción en CLP
      console.log('🏦 Creando transacción con Transbank...')
      const response = await fetch('/api/transbank/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalCLP, // Siempre en CLP
          buyOrder: buyOrder,
          returnUrl: returnUrl,
          sessionId: sessionId
        })
      })

      const transactionResult = await response.json()

      if (!response.ok) {
        throw new Error(transactionResult.error || 'Error creando transacción')
      }

      console.log('✅ Transacción creada en CLP:', transactionResult)

      // Redirigir a Transbank
      window.location.href = `${transactionResult.url}?token_ws=${transactionResult.token}`

    } catch (error) {
      console.error('💥 Error procesando pago:', error)
      
      // Manejo de errores mejorado
      let errorMessage = 'Error al procesar el pago'
      if (error.message.includes('No autorizado')) {
        errorMessage = 'Debes iniciar sesión para hacer una reserva'
        window.location.href = '/sign-in'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setProcesandoPago(false)
      setShowReservaModal(false)
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
  const yaDeJoResena = user && resenas.some(resena => resena.usuario_id_id === user.id)

  // Función segura para parsear imágenes
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

  // Función para validar y convertir URLs de imágenes
  const validarImagenUrl = (imagenUrl) => {
    if (!imagenUrl || typeof imagenUrl !== 'string') return null
    
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
      return imagenUrl
    }
    
    if (imagenUrl.startsWith('/')) {
      return imagenUrl
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

  // Convertir precio a CLP para mostrar
  const precioCLP = convertToCLP(experiencia.precio, experiencia.moneda)

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          {/* Galería de imágenes - sin cambios */}
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
            {/* Información principal - sin cambios */}
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

              {/* Reseñas - CORREGIDO */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Reseñas ({resenas.length})</h3>
                  {user && !yaDeJoResena && ( // ← CORREGIDO: era yaDeJoResena
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

            {/* Panel de reserva - ACTUALIZADO para mostrar solo CLP */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-[#23A69A]">
                    ${precioCLP.toLocaleString()}
                  </span>
                  <span className="text-gray-600"> CLP por persona</span>
                  {experiencia.moneda !== 'CLP' && (
                    <div className="text-sm text-gray-500 mt-1">
                      (Convertido desde {experiencia.precio} {experiencia.moneda})
                    </div>
                  )}
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

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Fecha de la experiencia
                  </label>
                  <input
                    type="date"
                    value={fechaReserva}
                    onChange={(e) => setFechaReserva(e.target.value)}
                    min={experiencia.fecha_inicio}
                    max={experiencia.fecha_fin}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Disponible desde {new Date(experiencia.fecha_inicio).toLocaleDateString()} hasta {new Date(experiencia.fecha_fin).toLocaleDateString()}
                  </p>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold">
                      ${(precioCLP * cantidadPersonas).toLocaleString()} CLP
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowReservaModal(true)}
                  disabled={procesandoPago || !fechaReserva}
                  className="w-full bg-[#23A69A] text-white py-3 rounded-lg hover:bg-[#1e8a7e] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {procesandoPago ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : !fechaReserva ? (
                    'Selecciona una fecha'
                  ) : (
                    'Reservar Ahora'
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-2 text-center">
                  Pago seguro con Transbank 🔒
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de confirmación - ACTUALIZADO */}
      {showReservaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirmar Reserva</h3>
            <p className="mb-4">
              ¿Estás seguro de que quieres reservar esta experiencia para {cantidadPersonas} persona{cantidadPersonas > 1 ? 's' : ''}?
            </p>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p><strong>Experiencia:</strong> {experiencia.titulo}</p>
              <p><strong>Fecha:</strong> {fechaReserva ? new Date(fechaReserva).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No seleccionada'}</p>
              <p><strong>Cantidad:</strong> {cantidadPersonas} persona{cantidadPersonas > 1 ? 's' : ''}</p>
              <p><strong>Total a pagar:</strong> ${(precioCLP * cantidadPersonas).toLocaleString()} CLP</p>
              <p className="text-sm text-gray-600 mt-2">Pago procesado con Transbank</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowReservaModal(false)}
                disabled={procesandoPago}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReservar}
                disabled={procesandoPago}
                className="flex-1 px-4 py-2 bg-[#23A69A] text-white rounded-lg hover:bg-[#1e8a7e] disabled:opacity-50"
              >
                {procesandoPago ? 'Procesando...' : 'Pagar con Transbank'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear reseña - sin cambios */}
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