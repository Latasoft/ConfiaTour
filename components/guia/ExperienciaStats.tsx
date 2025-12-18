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
        .select('calificacion')
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
        ? resenas.reduce((sum, r) => sum + r.calificacion, 0) / resenas.length
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {/* Total Reservas */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-xs font-medium text-blue-700">RESERVAS</p>
        </div>
        <p className="text-2xl font-bold text-blue-900">{stats.total_reservas}</p>
        <p className="text-xs text-blue-600 mt-1">
          {stats.reservas_confirmadas} confirmadas
        </p>
      </div>

      {/* Ingresos */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-medium text-green-700">INGRESOS</p>
        </div>
        <p className="text-lg font-bold text-green-900">
          {formatearPrecio(stats.ingresos_totales)}
        </p>
        <p className="text-xs text-green-600 mt-1">
          Solo confirmadas
        </p>
      </div>

      {/* Próximas Reservas */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs font-medium text-purple-700">PRÓXIMAS</p>
        </div>
        <p className="text-2xl font-bold text-purple-900">{stats.proximas_reservas}</p>
        <p className="text-xs text-purple-600 mt-1">
          Por realizar
        </p>
      </div>

      {/* Rating */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <p className="text-xs font-medium text-yellow-700">RATING</p>
        </div>
        <p className="text-2xl font-bold text-yellow-900">
          {stats.rating_promedio ? stats.rating_promedio.toFixed(1) : 'N/A'}
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          {stats.total_resenas} {stats.total_resenas === 1 ? 'reseña' : 'reseñas'}
        </p>
      </div>
    </div>
  )
}
