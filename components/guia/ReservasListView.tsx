'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Reserva } from '@/types'

interface ReservasListViewProps {
  experienciaId: string
  onClose: () => void
}

type EstadoFilter = 'todas' | 'confirmada' | 'pendiente_pago' | 'cancelada'

const ESTADOS_CONFIG = {
  confirmada: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  pendiente_pago: { label: 'Pendiente Pago', color: 'bg-yellow-100 text-yellow-800' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  completada: { label: 'Completada', color: 'bg-blue-100 text-blue-800' },
}

export const ReservasListView: React.FC<ReservasListViewProps> = ({ 
  experienciaId, 
  onClose 
}) => {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<EstadoFilter>('todas')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReservas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienciaId])

  const loadReservas = async () => {
    try {
      setLoading(true)
      setError(null)

      // Consultar reservas de esta experiencia con información del usuario
      const { data, error: queryError } = await supabase
        .from('reservas')
        .select(`
          *,
          usuario:usuarios!reservas_usuario_id_fkey (
            nombre_completo,
            email
          )
        `)
        .eq('experiencia_id', experienciaId)
        .order('fecha_experiencia', { ascending: false })

      if (queryError) {
        console.error('Error loading reservas:', queryError)
        throw new Error(queryError.message)
      }

      setReservas(data || [])
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  const reservasFiltradas = reservas.filter(reserva => {
    if (filtroEstado === 'todas') return true
    return reserva.estado === filtroEstado
  })

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatearPrecio = (precio: number, moneda: string) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: moneda
    }).format(precio)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reservas de la Experiencia</h2>
            <p className="text-sm text-gray-500 mt-1">
              {reservas.length} {reservas.length === 1 ? 'reserva' : 'reservas'} en total
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFiltroEstado('todas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroEstado === 'todas'
                  ? 'bg-[#23A69A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({reservas.length})
            </button>
            <button
              onClick={() => setFiltroEstado('confirmada')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroEstado === 'confirmada'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Confirmadas ({reservas.filter(r => r.estado === 'confirmada').length})
            </button>
            <button
              onClick={() => setFiltroEstado('pendiente_pago')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroEstado === 'pendiente_pago'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              Pendientes ({reservas.filter(r => r.estado === 'pendiente_pago').length})
            </button>
            <button
              onClick={() => setFiltroEstado('cancelada')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroEstado === 'cancelada'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Canceladas ({reservas.filter(r => r.estado === 'cancelada').length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23A69A]"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!loading && !error && reservasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg">
                {filtroEstado === 'todas' 
                  ? 'No hay reservas para esta experiencia' 
                  : `No hay reservas ${filtroEstado === 'confirmada' ? 'confirmadas' : filtroEstado === 'pendiente_pago' ? 'pendientes' : 'canceladas'}`
                }
              </p>
            </div>
          )}

          {!loading && !error && reservasFiltradas.length > 0 && (
            <div className="space-y-4">
              {reservasFiltradas.map((reserva) => (
                <div 
                  key={reserva.id} 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#23A69A] transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Cliente */}
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">CLIENTE</p>
                      <p className="font-semibold text-gray-900">
                        {reserva.usuario?.nombre_completo || 'Usuario desconocido'}
                      </p>
                      <p className="text-sm text-gray-600">{reserva.usuario?.email || 'N/A'}</p>
                    </div>

                    {/* Fecha de la experiencia */}
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">FECHA EXPERIENCIA</p>
                      <p className="font-semibold text-gray-900">
                        {formatearFecha(reserva.fecha_experiencia)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {reserva.cantidad_personas} {reserva.cantidad_personas === 1 ? 'persona' : 'personas'}
                      </p>
                    </div>

                    {/* Estado y precio */}
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">ESTADO</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        ESTADOS_CONFIG[reserva.estado as keyof typeof ESTADOS_CONFIG]?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {ESTADOS_CONFIG[reserva.estado as keyof typeof ESTADOS_CONFIG]?.label || reserva.estado}
                      </span>
                      <p className="text-lg font-bold text-[#23A69A] mt-1">
                        {formatearPrecio(reserva.precio_total, reserva.moneda)}
                      </p>
                    </div>

                    {/* Fecha de reserva */}
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">RESERVADO EL</p>
                      <p className="font-semibold text-gray-900">
                        {formatearFecha(reserva.creado_en)}
                      </p>
                      {reserva.mensaje_usuario && (
                        <p className="text-sm text-gray-600 mt-1 italic line-clamp-2">
                          &ldquo;{reserva.mensaje_usuario}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ID de reserva */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                      ID: {reserva.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con estadísticas */}
        {!loading && !error && reservasFiltradas.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">TOTAL PERSONAS</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservasFiltradas.reduce((sum, r) => sum + r.cantidad_personas, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">INGRESOS TOTALES</p>
                <p className="text-2xl font-bold text-[#23A69A]">
                  {formatearPrecio(
                    reservasFiltradas
                      .filter(r => r.estado === 'confirmada')
                      .reduce((sum, r) => sum + r.precio_total, 0),
                    reservasFiltradas[0]?.moneda || 'CLP'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">CONFIRMADAS</p>
                <p className="text-2xl font-bold text-green-600">
                  {reservasFiltradas.filter(r => r.estado === 'confirmada').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">PENDIENTES</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reservasFiltradas.filter(r => r.estado === 'pendiente_pago').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
