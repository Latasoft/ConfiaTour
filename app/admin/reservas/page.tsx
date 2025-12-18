'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Reserva } from '@/types'

export const dynamic = 'force-dynamic'

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
      const response = await fetch('/api/admin/reservas')
      
      if (!response.ok) {
        throw new Error('Error al cargar reservas')
      }

      const data = await response.json()
      setReservas(data || [])
    } catch (error) {
      console.error('Error cargando reservas:', error)
      alert('Error al cargar reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    if (!confirm(`¿Cambiar estado de la reserva a "${nuevoEstado}"?`)) return

    try {
      const response = await fetch('/api/admin/reservas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar estado')
      }

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
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#23A69A] to-[#1e8a7e] px-6 py-5 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Detalles de Reserva</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Código de Reserva */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Código de Reserva</h3>
                <p className="font-mono text-sm text-gray-900 bg-white px-3 py-2 rounded border border-gray-200">
                  {selectedReserva.id}
                </p>
              </div>

              {/* Experiencia */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Experiencia</h3>
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  {(selectedReserva.experiencias as any)?.titulo}
                </p>
                <p className="text-sm text-gray-600 capitalize flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {(selectedReserva.experiencias as any)?.categoria}
                  <span className="mx-1">•</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {(selectedReserva.experiencias as any)?.ubicacion}
                </p>
              </div>

              {/* Detalles de la Reserva */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Fecha Experiencia</h3>
                  <p className="text-lg font-semibold text-blue-900">
                    {new Date(selectedReserva.fecha_experiencia).toLocaleDateString('es-CL', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Personas</h3>
                  <p className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {selectedReserva.cantidad_personas}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Monto Total</h3>
                  <p className="text-lg font-bold text-green-700">
                    ${selectedReserva.precio_total.toLocaleString()} CLP
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Estado Actual</h3>
                  <StatusBadge status={selectedReserva.estado} />
                </div>
              </div>

              {/* Información de Pago */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Información de Pago
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Método de pago:</span>
                    <span className="font-semibold text-gray-900 capitalize">{selectedReserva.metodo_pago}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Estado de pago:</span>
                    <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                      selectedReserva.pagado 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedReserva.pagado ? '✓ Pagado' : '✗ Pendiente'}
                    </span>
                  </div>
                  {selectedReserva.codigo_autorizacion && (
                    <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Código Autorización:</span>
                      <span className="font-mono text-sm font-semibold text-gray-900">{selectedReserva.codigo_autorizacion}</span>
                    </div>
                  )}
                  {selectedReserva.fecha_pago && (
                    <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Fecha de Pago:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedReserva.fecha_pago).toLocaleString('es-CL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cambiar Estado */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Cambiar Estado de Reserva
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {['confirmada', 'completada', 'cancelada'].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => {
                        handleCambiarEstado(selectedReserva.id, estado)
                        setShowModal(false)
                      }}
                      disabled={selectedReserva.estado === estado}
                      className={`px-4 py-3 rounded-lg text-sm font-semibold capitalize transition-all ${
                        selectedReserva.estado === estado
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300'
                          : estado === 'confirmada'
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg border-2 border-blue-600'
                          : estado === 'completada'
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg border-2 border-green-600'
                          : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg border-2 border-red-600'
                      }`}
                    >
                      {estado.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
