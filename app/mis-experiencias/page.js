'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '../../lib/supabaseClient'
import { getImageUrl } from '../../lib/uploadImages'
import Link from 'next/link'
import Image from 'next/image'
import { EditExperienciaGuiaModal } from '../../components/guia/EditExperienciaGuiaModal'
import { ReservasListView } from '../../components/guia/ReservasListView'
import { ExperienciaStats } from '../../components/guia/ExperienciaStats'
import { CalendarioReservas } from '../../components/guia/CalendarioReservas'
import { BloqueoFechas } from '../../components/guia/BloqueoFechas'

export const dynamic = 'force-dynamic'

export default function MisExperienciasPage() {
  const [experiencias, setExperiencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [experienciaToEdit, setExperienciaToEdit] = useState(null)
  const [showReservasModal, setShowReservasModal] = useState(false)
  const [experienciaReservas, setExperienciaReservas] = useState(null)
  const [showCalendarioModal, setShowCalendarioModal] = useState(false)
  const [experienciaCalendario, setExperienciaCalendario] = useState(null)
  const [showBloqueosModal, setShowBloqueosModal] = useState(false)
  const [experienciaBloqueos, setExperienciaBloqueos] = useState(null)
  
  const { user, isLoaded: userLoaded } = useUser()

  useEffect(() => {
    if (user) {
      console.log('Clerk User ID:', user.id)
    }
  }, [user])

  useEffect(() => {
    if (!user || !userLoaded) return

    async function loadExperiencias() {
      setLoading(true)
      setError(null)
      
      try {
        console.log('Loading experiencias for user:', user.id)
        
        const { data, error } = await supabase
          .from('experiencias')
          .select('*')
          .eq('usuario_id', user.id)
          .order('creado_en', { ascending: false })
        
        if (error) {
          console.error('Supabase error:', error)
          setError(`Error loading experiencias: ${error.message}`)
        } else {
          console.log('Experiencias loaded:', data)
          setExperiencias(data || [])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError(`Unexpected error: ${err.message}`)
      }
      
      setLoading(false)
    }

    loadExperiencias()
  }, [user, userLoaded])

  // Función para parsear imágenes
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

  // Función para eliminar experiencia
  const handleEliminarExperiencia = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta experiencia?')) return

    try {
      const { error } = await supabase
        .from('experiencias')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user.id) // Seguridad adicional

      if (error) throw error

      // Actualizar lista local
      setExperiencias(prev => prev.filter(exp => exp.id !== id))
      alert('Experiencia eliminada exitosamente')
    } catch (error) {
      console.error('Error eliminando experiencia:', error)
      alert('Error al eliminar la experiencia')
    }
  }

  // Función para abrir modal de edición
  const handleEditarExperiencia = (experiencia) => {
    setExperienciaToEdit(experiencia)
    setShowEditModal(true)
  }

  // Función de callback cuando se edita exitosamente
  const handleEditSuccess = (experienciaActualizada) => {
    setExperiencias(prev => 
      prev.map(exp => exp.id === experienciaActualizada.id ? experienciaActualizada : exp)
    )
  }

  // Función para ver reservas
  const handleVerReservas = (experiencia) => {
    setExperienciaReservas(experiencia)
    setShowReservasModal(true)
  }

  // Función para ver calendario
  const handleVerCalendario = (experiencia) => {
    setExperienciaCalendario(experiencia)
    setShowCalendarioModal(true)
  }

  // Función para gestionar bloqueos
  const handleGestionarBloqueos = (experiencia) => {
    setExperienciaBloqueos(experiencia)
    setShowBloqueosModal(true)
  }

  // Función para cambiar disponibilidad
  const handleToggleDisponibilidad = async (experiencia) => {
    try {
      const nuevoEstado = !experiencia.disponible

      const { error } = await supabase
        .from('experiencias')
        .update({ disponible: nuevoEstado })
        .eq('id', experiencia.id)
        .eq('usuario_id', user.id) // Seguridad: solo el dueño

      if (error) throw error

      // Actualizar lista local
      setExperiencias(prev =>
        prev.map(exp => 
          exp.id === experiencia.id 
            ? { ...exp, disponible: nuevoEstado }
            : exp
        )
      )

      alert(`Experiencia ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`)
    } catch (error) {
      console.error('Error cambiando disponibilidad:', error)
      alert('Error al cambiar la disponibilidad')
    }
  }

  // Show loading while Clerk is initializing
  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23A69A]"></div>
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

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">          
          {/* Error display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <h1 className="text-4xl text-black font-bold mb-4 md:mb-0">Mis Experiencias</h1>

            <Link href="/experiencias/crear">
              <button className="bg-[#23A69A] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors flex items-center gap-2">
                <span className="text-xl">+</span>
                Crear Experiencia
              </button>
            </Link>
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23A69A] mb-4"></div>
              <div className="text-xl">Cargando experiencias...</div>
            </div>
          )}

          {/* Experiencias Grid */}
          {!loading && !error && experiencias.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiencias.map((exp) => {
                const imagenes = parseImagenes(exp.imagenes)
                const imagenPrincipal = imagenes.length > 0 ? getImageUrl(imagenes[0]) : null

                return (
                  <div key={exp.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative h-48">
                      {imagenPrincipal ? (
                        <Image
                          src={imagenPrincipal}
                          alt={exp.titulo}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-4xl">📸</span>
                        </div>
                      )}
                      
                      {/* Badge de estado */}
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleToggleDisponibilidad(exp)
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            exp.disponible 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title={`Click para ${exp.disponible ? 'desactivar' : 'activar'}`}
                        >
                          {exp.disponible ? '✓ Disponible' : '✕ No disponible'}
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Estadísticas */}
                      <ExperienciaStats 
                        experienciaId={exp.id} 
                        moneda={exp.moneda}
                      />

                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          {exp.categoria}
                        </span>
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm ml-1">{exp.rating_promedio || 'N/A'}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{exp.titulo}</h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{exp.descripcion}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {exp.ubicacion}
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-[#23A69A]">
                          ${exp.precio} {exp.moneda}
                        </span>
                        <span className="text-sm text-gray-500">
                          {exp.capacidad} personas
                        </span>
                      </div>

                      {/* Botón Ver Reservas */}
                      <button
                        onClick={() => handleVerReservas(exp)}
                        className="w-full mb-2 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Ver Reservas
                      </button>

                      {/* Botón Ver Calendario */}
                      <button
                        onClick={() => handleVerCalendario(exp)}
                        className="w-full mb-2 bg-purple-50 text-purple-700 py-2 px-4 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Ver Calendario
                      </button>

                      {/* Botón Gestionar Bloqueos */}
                      <button
                        onClick={() => handleGestionarBloqueos(exp)}
                        className="w-full mb-2 bg-red-50 text-red-700 py-2 px-4 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Bloquear Fechas
                      </button>

                      <div className="flex gap-2">
                        <Link 
                          href={`/experiencias/${exp.id}`}
                          className="flex-1 bg-[#23A69A] text-white py-2 px-4 rounded-lg font-medium text-center hover:bg-[#1e8a7e] transition-colors"
                        >
                          Ver Detalle
                        </Link>
                        <button
                          onClick={() => handleEditarExperiencia(exp)}
                          className="px-3 py-2 border border-[#23A69A] text-[#23A69A] rounded-lg hover:bg-teal-50 transition-colors"
                          title="Editar experiencia"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEliminarExperiencia(exp.id)}
                          className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar experiencia"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && experiencias.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                <svg className="w-24 h-24 mx-auto text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">No tienes experiencias creadas</h2>
              <p className="text-gray-600 mb-8">¡Crea tu primera experiencia y compártela con el mundo!</p>
              <Link href="/experiencias/crear">
                <button className="bg-[#23A69A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors">
                  Crear Primera Experiencia
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Modal de edición */}
      <EditExperienciaGuiaModal
        isOpen={showEditModal}
        experiencia={experienciaToEdit}
        onClose={() => {
          setShowEditModal(false)
          setExperienciaToEdit(null)
        }}
        onSuccess={handleEditSuccess}
      />

      {/* Modal de reservas */}
      {showReservasModal && experienciaReservas && (
        <ReservasListView
          experienciaId={experienciaReservas.id}
          onClose={() => {
            setShowReservasModal(false)
            setExperienciaReservas(null)
          }}
        />
      )}

      {/* Modal de calendario */}
      {showCalendarioModal && experienciaCalendario && (
        <CalendarioReservas
          experienciaId={experienciaCalendario.id}
          onClose={() => {
            setShowCalendarioModal(false)
            setExperienciaCalendario(null)
          }}
        />
      )}

      {/* Modal de bloqueos */}
      {showBloqueosModal && experienciaBloqueos && (
        <BloqueoFechas
          experienciaId={experienciaBloqueos.id}
          onClose={() => {
            setShowBloqueosModal(false)
            setExperienciaBloqueos(null)
          }}
        />
      )}
    </div>
  )
}
