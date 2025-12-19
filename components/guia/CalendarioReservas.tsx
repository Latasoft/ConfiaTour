'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface CalendarioReservasProps {
  experienciaId: string
  onClose: () => void
}

interface ReservaCalendario {
  id: string
  fecha_experiencia: string
  cantidad_personas: number
  estado: string
  profiles?: {
    full_name: string
  } | { full_name: string }[]
}

export const CalendarioReservas: React.FC<CalendarioReservasProps> = ({ 
  experienciaId, 
  onClose 
}) => {
  const [reservas, setReservas] = useState<ReservaCalendario[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    loadReservas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienciaId, currentDate])

  const loadReservas = async () => {
    try {
      setLoading(true)

      // Obtener primer y último día del mes actual
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0]
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('reservas')
        .select(`
          id,
          fecha_experiencia,
          cantidad_personas,
          estado,
          profiles!reservas_usuario_id_fkey (
            full_name
          )
        `)
        .eq('experiencia_id', experienciaId)
        .gte('fecha_experiencia', firstDay)
        .lte('fecha_experiencia', lastDay)
        .in('estado', ['confirmada', 'pendiente_pago'])

      if (error) throw error

      // Fix type: profiles comes as array from Supabase join, get first element
      const fixedData = (data || []).map(r => ({
        ...r,
        profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
      }))
      setReservas(fixedData as ReservaCalendario[])
    } catch (err: any) {
      console.error('Error loading reservas:', err)
    } finally {
      setLoading(false)
    }
  }

  // Generar días del calendario
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = firstDay.getDay() // 0 = domingo, 1 = lunes, etc
    
    const days = []
    
    // Días del mes anterior (para completar semana)
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({
        day,
        dateStr,
        reservas: reservas.filter(r => r.fecha_experiencia === dateStr)
      })
    }
    
    return days
  }

  const cambiarMes = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + offset)
      return newDate
    })
  }

  const reservasDelDia = selectedDate 
    ? reservas.filter(r => r.fecha_experiencia === selectedDate)
    : []

  const nombreMes = currentDate.toLocaleDateString('es-CL', { 
    month: 'long', 
    year: 'numeric' 
  })

  const days = getDaysInMonth()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Calendario de Reservas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Controles de navegación */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => cambiarMes(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-xl font-bold capitalize">{nombreMes}</h3>
            
            <button
              onClick={() => cambiarMes(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
              <div key={dia} className="text-center text-sm font-semibold text-gray-600 py-2">
                {dia}
              </div>
            ))}
          </div>

          {/* Calendario */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23A69A]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {days.map((dayData, index) => {
                if (!dayData) {
                  return <div key={`empty-${index}`} className="aspect-square"></div>
                }

                const { day, dateStr, reservas: reservasDelDia } = dayData
                const totalPersonas = reservasDelDia.reduce((sum, r) => sum + r.cantidad_personas, 0)
                const hasReservas = reservasDelDia.length > 0
                const isSelected = selectedDate === dateStr
                const isToday = dateStr === new Date().toISOString().split('T')[0]

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`aspect-square p-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-[#23A69A] bg-[#23A69A] text-white'
                        : isToday
                        ? 'border-blue-400 bg-blue-50'
                        : hasReservas
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-semibold">{day}</div>
                    {hasReservas && (
                      <div className={`text-xs mt-1 ${isSelected ? 'text-white' : 'text-green-700'}`}>
                        {reservasDelDia.length} reserva{reservasDelDia.length > 1 ? 's' : ''}
                        <br />
                        {totalPersonas} {totalPersonas === 1 ? 'persona' : 'personas'}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Detalles del día seleccionado */}
          {selectedDate && reservasDelDia.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-bold text-lg mb-3">
                Reservas del {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-CL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </h4>
              <div className="space-y-2">
                {reservasDelDia.map(reserva => (
                  <div 
                    key={reserva.id} 
                    className="flex items-center justify-between bg-white p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">
                        {(Array.isArray(reserva.profiles) ? reserva.profiles[0]?.full_name : reserva.profiles?.full_name) || 'Usuario desconocido'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {reserva.cantidad_personas} {reserva.cantidad_personas === 1 ? 'persona' : 'personas'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reserva.estado === 'confirmada'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reserva.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leyenda */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400 bg-blue-50 rounded"></div>
              <span>Hoy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-green-300 bg-green-50 rounded"></div>
              <span>Con reservas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#23A69A] bg-[#23A69A] rounded"></div>
              <span>Seleccionado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
