'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Reserva } from '@/types'
import { supabase } from '@/lib/supabaseClient'

export default function AdminReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadReservas()
  }, [])

  const loadReservas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          experiencias (
            id,
            titulo,
            categoria,
            ubicacion
          )
        `)
        .order('fecha_reserva', { ascending: false })

      if (error) throw error
      setReservas(data || [])
    } catch (error) {
      console.error('Error cargando reservas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    if (!confirm(`¿Cambiar estado de la reserva a "${nuevoEstado}"?`)) return

    try {
      const { error } = await supabase
        .from('reservas')
        .update({ estado: nuevoEstado })
        .eq('id', id)

      if (error) throw error

      setReservas(prev =>
        prev.map(res => (res.id === id ? { ...res, estado: nuevoEstado as any } : res))
      )

      alert('Estado actualizado exitosamente')
    } catch (error) {
      console.error('Error actualizando estado:', error)
      alert('Error al actualizar el estado')
    }
  }

  // Filtrar reservas
  const reservasFiltradas = reservas.filter(res => {
    if (filtroEstado && res.estado !== filtroEstado) return false
    return true
  })

  const columns = [
    {
      key: 'id',
      label: 'Código',
      render: (value: string) => (
        <span className="font-mono text-xs text-gray-600">{value.substring(0, 8)}...</span>
      ),
    },
    {
      key: 'experiencias',
      label: 'Experiencia',
      render: (exp: any) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{exp?.titulo || 'N/A'}</div>
          <div className="text-xs text-gray-500 capitalize">{exp?.categoria}</div>
        </div>
      ),
    },
    {
      key: 'fecha_experiencia',
      label: 'Fecha',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString('es-CL')}
        </span>
      ),
    },
    {
      key: 'cantidad_personas',
      label: 'Personas',
      render: (value: number) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'precio_total',
      label: 'Total',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium text-green-600">
          ${value.toLocaleString()} CLP
        </span>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value: string) => <StatusBadge status={value} size="sm" />,
    },
    {
      key: 'metodo_pago',
      label: 'Pago',
      render: (value: string) => (
        <span className="text-xs capitalize bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Acciones',
      render: (_: any, row: Reserva) => (
        <button
          onClick={() => {
            setSelectedReserva(row)
            setShowModal(true)
          }}
          className="px-3 py-1 text-xs rounded bg-[#23A69A] text-white hover:bg-[#1e8a7e]"
        >
          Ver Detalles
        </button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
        <p className="text-gray-600 mt-2">Administra todas las reservas del sistema</p>
      </div>

      {/* Filtros y Estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Filtro */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-4">Filtrar por Estado</h3>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A69A]"
          >
            <option value="">Todos los estados</option>
            <option value="confirmada">Confirmadas</option>
            <option value="pendiente_pago">Pendiente Pago</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
          <button
            onClick={() => setFiltroEstado('')}
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Limpiar Filtro
          </button>
        </div>

        {/* Stats Rápidas */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: reservas.length, color: 'bg-blue-50 text-blue-700' },
            { label: 'Confirmadas', value: reservas.filter(r => r.estado === 'confirmada').length, color: 'bg-green-50 text-green-700' },
            { label: 'Pendientes', value: reservas.filter(r => r.estado === 'pendiente_pago').length, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Completadas', value: reservas.filter(r => r.estado === 'completada').length, color: 'bg-purple-50 text-purple-700' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-lg p-4`}>
              <div className="text-sm font-medium opacity-80">{stat.label}</div>
              <div className="text-2xl font-bold mt-1">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <DataTable
        data={reservasFiltradas}
        columns={columns}
        loading={loading}
        emptyMessage="No se encontraron reservas"
        pageSize={15}
      />

      {/* Modal de Detalles */}
      {showModal && selectedReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Detalles de Reserva</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Código de Reserva */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Código de Reserva</h3>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedReserva.id}</p>
                </div>

                {/* Experiencia */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Experiencia</h3>
                  <p className="font-medium">{(selectedReserva.experiencias as any)?.titulo}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {(selectedReserva.experiencias as any)?.categoria} - {(selectedReserva.experiencias as any)?.ubicacion}
                  </p>
                </div>

                {/* Detalles de la Reserva */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Fecha Experiencia</h3>
                    <p>{new Date(selectedReserva.fecha_experiencia).toLocaleDateString('es-CL')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Personas</h3>
                    <p>{selectedReserva.cantidad_personas}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Total</h3>
                    <p className="font-medium text-green-600">${selectedReserva.precio_total.toLocaleString()} CLP</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Estado</h3>
                    <StatusBadge status={selectedReserva.estado} />
                  </div>
                </div>

                {/* Información de Pago */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Información de Pago</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Método:</span>
                      <span className="font-medium capitalize">{selectedReserva.metodo_pago}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pagado:</span>
                      <span className={selectedReserva.pagado ? 'text-green-600' : 'text-red-600'}>
                        {selectedReserva.pagado ? 'Sí' : 'No'}
                      </span>
                    </div>
                    {selectedReserva.codigo_autorizacion && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Código Autorización:</span>
                        <span className="font-mono">{selectedReserva.codigo_autorizacion}</span>
                      </div>
                    )}
                    {selectedReserva.fecha_pago && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de Pago:</span>
                        <span>{new Date(selectedReserva.fecha_pago).toLocaleString('es-CL')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cambiar Estado */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Cambiar Estado</h3>
                  <div className="flex gap-2 flex-wrap">
                    {['confirmada', 'completada', 'cancelada'].map((estado) => (
                      <button
                        key={estado}
                        onClick={() => {
                          handleCambiarEstado(selectedReserva.id, estado)
                          setShowModal(false)
                        }}
                        disabled={selectedReserva.estado === estado}
                        className={`px-4 py-2 rounded-lg text-sm capitalize ${
                          selectedReserva.estado === estado
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-[#23A69A] text-white hover:bg-[#1e8a7e]'
                        }`}
                      >
                        {estado.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
