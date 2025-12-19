'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface ExperienciaStatsProps {
  experienciaId: string
  moneda: string
}

interface Stats {
  total_reservas: number
  reservas_confirmadas: number
  reservas_pendientes: number
  ingresos_totales: number
  proximas_reservas: number
  rating_promedio: number | null
  total_resenas: number
}

export const ExperienciaStats: React.FC<ExperienciaStatsProps> = ({ 
  experienciaId, 
  moneda 
}) => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienciaId])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const hoy = new Date().toISOString().split('T')[0]

      // Consultar todas las reservas
      const { data: reservasData, error: reservasError } = await supabase
        .from('reservas')
        .select('*')
        .eq('experiencia_id', experienciaId)

      if (reservasError) throw reservasError

      // Consultar reseñas para rating promedio
      const { data: resenasData, error: resenasError } = await supabase
        .from('resenas')
        .select('rating')
        .eq('experiencia_id', experienciaId)

      if (resenasError) throw resenasError

      // Calcular estadísticas
      const reservas = reservasData || []
      const reservasConfirmadas = reservas.filter(r => r.estado === 'confirmada')
      const reservasPendientes = reservas.filter(r => r.estado === 'pendiente_pago')
      const ingresosConfirmados = reservasConfirmadas.reduce((sum, r) => sum + r.precio_total, 0)
      const proximasReservas = reservas.filter(r => 
        r.fecha_experiencia >= hoy && 
        (r.estado === 'confirmada' || r.estado === 'pendiente_pago')
      ).length

      // Calcular rating promedio
      const resenas = resenasData || []
      const ratingPromedio = resenas.length > 0
        ? resenas.reduce((sum, r) => sum + r.rating, 0) / resenas.length
        : null

      setStats({
        total_reservas: reservas.length,
        reservas_confirmadas: reservasConfirmadas.length,
        reservas_pendientes: reservasPendientes.length,
        ingresos_totales: ingresosConfirmados,
        proximas_reservas: proximasReservas,
        rating_promedio: ratingPromedio,
        total_resenas: resenas.length
      })

    } catch (err: any) {
      console.error('Error loading stats:', err)
      setError(err.message || 'Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: moneda
    }).format(precio)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border-2 border-gray-100 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-gray-200 rounded-lg w-9 h-9"></div>
              <div className="h-8 w-12 bg-gray-200 rounded"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
            <div className="pt-2 border-t border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <p className="text-red-700 text-sm">{error || 'Error al cargar estadísticas'}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {/* Total Reservas */}
      <div className="bg-white rounded-lg p-3 border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-md group">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-blue-100 group-hover:bg-blue-200 transition-colors rounded-lg p-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-3xl font-bold text-blue-600">{stats.total_reservas}</span>
        </div>
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Reservas Total</p>
        <div className="mt-2 pt-2 border-t border-blue-100">
          <p className="text-xs text-gray-600">
            <span className="font-semibold text-green-600">{stats.reservas_confirmadas}</span> confirmadas · {' '}
            <span className="font-semibold text-yellow-600">{stats.reservas_pendientes}</span> pendientes
          </p>
        </div>
      </div>

      {/* Ingresos */}
      <div className="bg-white rounded-lg p-3 border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-md group">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-green-100 group-hover:bg-green-200 transition-colors rounded-lg p-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-green-600 truncate">
            {formatearPrecio(stats.ingresos_totales).split(',')[0]}
          </span>
        </div>
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Ingresos</p>
        <div className="mt-2 pt-2 border-t border-green-100">
          <p className="text-xs text-gray-600">
            De {stats.reservas_confirmadas} {stats.reservas_confirmadas === 1 ? 'reserva confirmada' : 'reservas confirmadas'}
          </p>
        </div>
      </div>

      {/* Próximas Reservas */}
      <div className="bg-white rounded-lg p-3 border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-md group">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-purple-100 group-hover:bg-purple-200 transition-colors rounded-lg p-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-3xl font-bold text-purple-600">{stats.proximas_reservas}</span>
        </div>
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Próximas</p>
        <div className="mt-2 pt-2 border-t border-purple-100">
          <p className="text-xs text-gray-600">
            Reservas futuras por realizar
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="bg-white rounded-lg p-3 border-2 border-amber-100 hover:border-amber-300 transition-all hover:shadow-md group">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-amber-100 group-hover:bg-amber-200 transition-colors rounded-lg p-2">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-amber-500">
              {stats.rating_promedio ? stats.rating_promedio.toFixed(1) : '-'}
            </span>
            <span className="text-lg text-gray-400">/5</span>
          </div>
        </div>
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Calificación</p>
        <div className="mt-2 pt-2 border-t border-amber-100">
          <p className="text-xs text-gray-600">
            {stats.total_resenas === 0 ? 'Sin reseñas aún' : 
             `${stats.total_resenas} ${stats.total_resenas === 1 ? 'reseña' : 'reseñas'}`}
          </p>
        </div>
      </div>
    </div>
  )
}
