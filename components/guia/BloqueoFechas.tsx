'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'

interface BloqueoFechasProps {
  experienciaId: string
  onClose: () => void
}

interface BloqueoFecha {
  id: string
  fecha_bloqueada: string
  motivo: string | null
  creado_en: string
}

export const BloqueoFechas: React.FC<BloqueoFechasProps> = ({ 
  experienciaId, 
  onClose 
}) => {
  const { user } = useUser()
  const [bloqueos, setBloqueos] = useState<BloqueoFecha[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fechaNueva, setFechaNueva] = useState('')
  const [motivoNuevo, setMotivoNuevo] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBloqueos()
  }, [experienciaId])

  const loadBloqueos = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('bloques_fechas')
        .select('*')
        .eq('experiencia_id', experienciaId)
        .order('fecha_bloqueada', { ascending: true })

      if (queryError) {
        console.error('Error loading bloqueos:', queryError)
        throw new Error(queryError.message)
      }

      setBloqueos(data || [])
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Error al cargar los bloqueos')
    } finally {
      setLoading(false)
    }
  }

  const handleAgregarBloqueo = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fechaNueva || !user) return

    try {
      setSaving(true)
      setError(null)

      // Verificar que la fecha no esté en el pasado
      const hoy = new Date().toISOString().split('T')[0]
      if (fechaNueva < hoy) {
        throw new Error('No puedes bloquear fechas pasadas')
      }

      // Verificar si ya existe un bloqueo para esta fecha
      const yaExiste = bloqueos.some(b => b.fecha_bloqueada === fechaNueva)
      if (yaExiste) {
        throw new Error('Esta fecha ya está bloqueada')
      }

      const { data, error: insertError } = await supabase
        .from('bloques_fechas')
        .insert({
          experiencia_id: experienciaId,
          fecha_bloqueada: fechaNueva,
          motivo: motivoNuevo || null,
          creado_por: user.id
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting bloqueo:', insertError)
        throw new Error(insertError.message)
      }

      setBloqueos(prev => [...prev, data].sort((a, b) => 
        a.fecha_bloqueada.localeCompare(b.fecha_bloqueada)
      ))
      
      setFechaNueva('')
      setMotivoNuevo('')
      alert('Fecha bloqueada exitosamente')

    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Error al bloquear la fecha')
      alert(err.message || 'Error al bloquear la fecha')
    } finally {
      setSaving(false)
    }
  }

  const handleEliminarBloqueo = async (bloqueoId: string) => {
    if (!confirm('¿Deseas desbloquear esta fecha?')) return

    try {
      const { error: deleteError } = await supabase
        .from('bloques_fechas')
        .delete()
        .eq('id', bloqueoId)

      if (deleteError) {
        console.error('Error deleting bloqueo:', deleteError)
        throw new Error(deleteError.message)
      }

      setBloqueos(prev => prev.filter(b => b.id !== bloqueoId))
      alert('Fecha desbloqueada exitosamente')

    } catch (err: any) {
      console.error('Error:', err)
      alert(err.message || 'Error al desbloquear la fecha')
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Separar bloqueos pasados y futuros
  const hoy = new Date().toISOString().split('T')[0]
  const bloqueosFuturos = bloqueos.filter(b => b.fecha_bloqueada >= hoy)
  const bloqueosPasados = bloqueos.filter(b => b.fecha_bloqueada < hoy)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bloqueo de Fechas</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona las fechas en las que no quieres aceptar reservas
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

        {/* Form para agregar bloqueo */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-lg mb-3">Bloquear Nueva Fecha</h3>
          <form onSubmit={handleAgregarBloqueo} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha a Bloquear *
                </label>
                <input
                  type="date"
                  value={fechaNueva}
                  onChange={(e) => setFechaNueva(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={saving}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo (Opcional)
                </label>
                <input
                  type="text"
                  value={motivoNuevo}
                  onChange={(e) => setMotivoNuevo(e.target.value)}
                  placeholder="Ej: Vacaciones, Mantenimiento..."
                  disabled={saving}
                  maxLength={100}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] disabled:bg-gray-100"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving || !fechaNueva}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Bloqueando...' : '🚫 Bloquear Fecha'}
            </button>
          </form>
        </div>

        {/* Lista de bloqueos */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23A69A]"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && bloqueos.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-lg">No hay fechas bloqueadas</p>
              <p className="text-gray-400 text-sm mt-2">
                Puedes bloquear fechas cuando no quieras aceptar reservas
              </p>
            </div>
          )}

          {!loading && bloqueos.length > 0 && (
            <div className="space-y-6">
              {/* Bloqueos futuros */}
              {bloqueosFuturos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">
                    Fechas Bloqueadas ({bloqueosFuturos.length})
                  </h3>
                  <div className="space-y-2">
                    {bloqueosFuturos.map(bloqueo => (
                      <div 
                        key={bloqueo.id}
                        className="flex items-center justify-between bg-red-50 border border-red-200 p-4 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {formatearFecha(bloqueo.fecha_bloqueada)}
                          </p>
                          {bloqueo.motivo && (
                            <p className="text-sm text-gray-600 mt-1">
                              Motivo: {bloqueo.motivo}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleEliminarBloqueo(bloqueo.id)}
                          className="ml-4 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Desbloquear
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bloqueos pasados (solo informativo) */}
              {bloqueosPasados.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-500">
                    Historial de Bloqueos ({bloqueosPasados.length})
                  </h3>
                  <div className="space-y-2">
                    {bloqueosPasados.map(bloqueo => (
                      <div 
                        key={bloqueo.id}
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-lg opacity-60"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-700">
                            {formatearFecha(bloqueo.fecha_bloqueada)}
                          </p>
                          {bloqueo.motivo && (
                            <p className="text-sm text-gray-500 mt-1">
                              Motivo: {bloqueo.motivo}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">Pasado</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
