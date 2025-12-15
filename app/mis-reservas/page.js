'use client'
import { useState, useEffect, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { getReservasByUsuario, cancelarReserva, puedecancelarReserva } from '../../lib/experiencias'

export const dynamic = 'force-dynamic'

function MisReservasContent() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelando, setCancelando] = useState(null)
  const [filtro, setFiltro] = useState('todas') // todas, activas, completadas, canceladas
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [reservaACancelar, setReservaACancelar] = useState(null)

  // Mostrar mensaje de confirmación si viene de pago exitoso
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get('verification') === 'submitted') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    if (user) {
      cargarReservas()
    }
  }, [user])

  const cargarReservas = async () => {
    try {
      setLoading(true)
      const reservasData = await getReservasByUsuario(user.id)
      setReservas(reservasData)
    } catch (error) {
      console.error('Error cargando reservas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelarReserva = async () => {
    if (!reservaACancelar) return

    try {
      setCancelando(reservaACancelar.id)
      await cancelarReserva(reservaACancelar.id, user.id)
      
      // Recargar reservas
      await cargarReservas()
      
      setShowCancelModal(false)
      setReservaACancelar(null)
    } catch (error) {
      console.error('Error cancelando reserva:', error)
      alert(`Error al cancelar la reserva: ${error.message}`)
    } finally {
      setCancelando(null)
    }
  }

  const abrirModalCancelacion = (reserva) => {
    setReservaACancelar(reserva)
    setShowCancelModal(true)
  }

  // Filtrar reservas
  const reservasFiltradas = reservas.filter(reserva => {
    switch (filtro) {
      case 'activas':
        return reserva.estado === 'confirmada' && new Date(reserva.fecha_experiencia) >= new Date()
      case 'completadas':
        return reserva.estado === 'confirmada' && new Date(reserva.fecha_experiencia) < new Date()
      case 'canceladas':
        return reserva.estado === 'cancelada'
      case 'pendientes':
        return reserva.estado === 'pendiente_pago'
      default:
        return true
    }
  })

  // Función para obtener el estado visual
  const getEstadoInfo = (reserva) => {
    const fechaExp = new Date(reserva.fecha_experiencia)
    const ahora = new Date()

    switch (reserva.estado) {
      case 'confirmada':
        if (fechaExp < ahora) {
          return { texto: 'Completada', color: 'bg-gray-100 text-gray-800', icon: '✓' }
        } else {
          return { texto: 'Activa', color: 'bg-green-100 text-green-800', icon: '✓' }
        }
      case 'cancelada':
        return { texto: 'Cancelada', color: 'bg-red-100 text-red-800', icon: '✕' }
      case 'pendiente_pago':
        return { texto: 'Pendiente Pago', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' }
      default:
        return { texto: reserva.estado, color: 'bg-gray-100 text-gray-800', icon: '?' }
    }
  }

  // Función para parsear imágenes
  const parseImagenes = (imagenesData) => {
    if (!imagenesData) return []
    try {
      if (Array.isArray(imagenesData)) return imagenesData
      if (typeof imagenesData === 'string') {
        return imagenesData.trim() === '' ? [] : JSON.parse(imagenesData)
      }
      return []
    } catch (error) {
      return []
    }
  }

  const validarImagenUrl = (imagenUrl) => {
    if (!imagenUrl || typeof imagenUrl !== 'string') return null
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) return imagenUrl
    if (imagenUrl.startsWith('/')) return imagenUrl
    return null
  }

  // Mostrar loading mientras Clerk se inicializa
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23A69A]"></div>
      </div>
    )
  }

  // Redirigir a login si no está autenticado
  if (!user) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          {/* Mensaje de éxito */}
          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <strong>¡Reserva confirmada!</strong> Tu pago fue procesado exitosamente.
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">Mis Reservas</h1>
            
            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltro('todas')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filtro === 'todas' 
                    ? 'bg-[#23A69A] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Todas ({reservas.length})
              </button>
              <button
                onClick={() => setFiltro('activas')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filtro === 'activas' 
                    ? 'bg-[#23A69A] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setFiltro('completadas')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filtro === 'completadas' 
                    ? 'bg-[#23A69A] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Completadas
              </button>
              <button
                onClick={() => setFiltro('canceladas')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filtro === 'canceladas' 
                    ? 'bg-[#23A69A] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Canceladas
              </button>
              <button
                onClick={() => setFiltro('pendientes')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filtro === 'pendientes' 
                    ? 'bg-[#23A69A] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Pendientes
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23A69A]"></div>
            </div>
          ) : reservasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {filtro === 'todas' ? 'No tienes reservas aún' : `No tienes reservas ${filtro}`}
              </h3>
              <p className="text-gray-500 mb-6">
                {filtro === 'todas' 
                  ? 'Explora nuestras experiencias y haz tu primera reserva'
                  : 'Cambia el filtro para ver otras reservas'
                }
              </p>
              {filtro === 'todas' && (
                <button
                  onClick={() => router.push('/experiencias')}
                  className="bg-[#23A69A] text-white px-6 py-3 rounded-lg hover:bg-[#1e8a7e] transition-colors"
                >
                  Explorar Experiencias
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {reservasFiltradas.map((reserva) => {
                const experiencia = reserva.experiencias
                const imagenes = parseImagenes(experiencia?.imagenes)
                const imagenPrincipal = imagenes.length > 0 
                  ? validarImagenUrl(imagenes[0]) 
                  : null
                const estadoInfo = getEstadoInfo(reserva)
                
                // CORREGIDO: Eliminar la referencia circular y arreglar el nombre de la función
                const puedeCancel = reserva.estado === 'confirmada' 
                  && puedecancelarReserva(reserva.fecha_experiencia, reserva.fecha_reserva)

                return (
                  <div key={reserva.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="md:flex">
                      {/* Imagen */}
                      <div className="md:w-48 h-48 md:h-auto relative bg-gray-200">
                        {imagenPrincipal ? (
                          <Image
                            src={imagenPrincipal}
                            alt={experiencia?.titulo || 'Experiencia'}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-2">{experiencia?.titulo}</h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {experiencia?.ubicacion}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.color}`}>
                            {estadoInfo.icon} {estadoInfo.texto}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Fecha experiencia:</span>
                            <p className="font-medium">{new Date(reserva.fecha_experiencia).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Personas:</span>
                            <p className="font-medium">{reserva.cantidad_personas}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total pagado:</span>
                            <p className="font-medium">${reserva.precio_total?.toLocaleString()} CLP</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Reservado:</span>
                            <p className="font-medium">{new Date(reserva.fecha_reserva).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => router.push(`/experiencias/${experiencia.id}`)}
                            className="px-4 py-2 border border-[#23A69A] text-[#23A69A] rounded-lg hover:bg-[#23A69A] hover:text-white transition-colors"
                          >
                            Ver Detalles
                          </button>
                          
                          {reserva.estado === 'pendiente_pago' && (
                            <button
                              onClick={() => router.push(`/experiencias/${experiencia.id}`)}
                              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                              Completar Pago
                            </button>
                          )}

                          {puedeCancel && (
                            <button
                              onClick={() => abrirModalCancelacion(reserva)}
                              disabled={cancelando === reserva.id}
                              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                            >
                              {cancelando === reserva.id ? 'Cancelando...' : 'Cancelar Reserva'}
                            </button>
                          )}

                          {reserva.codigo_autorizacion && (
                            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                              Código: {reserva.codigo_autorizacion}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal de cancelación */}
      {showCancelModal && reservaACancelar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Cancelar Reserva</h3>
            <p className="mb-4">
              ¿Estás seguro de que quieres cancelar tu reserva para &quot;{reservaACancelar.experiencias?.titulo}&quot;?
            </p>
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ Una vez cancelada, no podrás recuperar esta reserva. El reembolso (si aplica) se procesará según nuestras políticas.
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setReservaACancelar(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                No, Mantener Reserva
              </button>
              <button
                onClick={handleCancelarReserva}
                disabled={cancelando}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelando ? 'Cancelando...' : 'Sí, Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MisReservasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center"><div className="text-[#23A69A]">Cargando...</div></div>}>
      <MisReservasContent />
    </Suspense>
  )
}