'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Profile } from '@/types'

export const dynamic = 'force-dynamic'

interface UserWithStats extends Profile {
  total_experiencias?: number
  total_reservas?: number
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [filtroVerificado, setFiltroVerificado] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (filtroTipo) params.append('tipo', filtroTipo)
      if (filtroVerificado) params.append('verificado', filtroVerificado)

      const response = await fetch(`/api/admin/usuarios${params.toString() ? `?${params}` : ''}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios')
      }

      const data = await response.json()
      setUsuarios(data || [])
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      alert('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerificacion = async (clerkUserId: string, currentVerified: boolean) => {
    if (!confirm(`¿${currentVerified ? 'Desverificar' : 'Verificar'} a este usuario?`)) return

    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerk_user_id: clerkUserId,
          verified: !currentVerified,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar verificación')
      }

      setUsuarios(prev =>
        prev.map(user =>
          user.clerk_user_id === clerkUserId ? { ...user, verified: !currentVerified } : user
        )
      )

      alert('Usuario actualizado exitosamente')
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      alert('Error al actualizar el usuario')
    }
  }

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(user => {
    if (filtroTipo && user.user_type !== filtroTipo) return false
    if (filtroVerificado === 'verificado' && !user.verified) return false
    if (filtroVerificado === 'no_verificado' && user.verified) return false
    return true
  })

  const columns = [
    {
      key: 'full_name',
      label: 'Nombre',
      sortable: true,
      render: (value: string, row: UserWithStats) => (
        <div>
          <div className="font-medium text-gray-900">{value || 'Sin nombre'}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'user_type',
      label: 'Tipo',
      sortable: true,
      render: (value: string) => (
        <span className="capitalize px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
          {value}
        </span>
      ),
    },
    {
      key: 'verified',
      label: 'Verificado',
      render: (value: boolean) => (
        <StatusBadge status={value ? 'verificado' : 'no_verificado'} size="sm" />
      ),
    },
    {
      key: 'total_experiencias',
      label: 'Experiencias',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'total_reservas',
      label: 'Reservas',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Registro',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString('es-CL')}
        </span>
      ),
    },
    {
      key: 'clerk_user_id',
      label: 'Acciones',
      render: (_: any, row: UserWithStats) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedUser(row)
              setShowModal(true)
            }}
            className="px-3 py-1 text-xs rounded bg-[#23A69A] text-white hover:bg-[#1e8a7e]"
          >
            Ver
          </button>
          <button
            onClick={() => handleToggleVerificacion(row.clerk_user_id, row.verified)}
            className={`px-3 py-1 text-xs rounded ${
              row.verified
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {row.verified ? 'Desverificar' : 'Verificar'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-2">Administra todos los usuarios de la plataforma</p>
      </div>

      {/* Filtros y Estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-6">
        {/* Filtros */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-4">Filtros</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuario</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A69A]"
              >
                <option value="">Todos los tipos</option>
                <option value="viajero">Viajeros</option>
                <option value="guia">Guías</option>
                <option value="admin">Administradores</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verificación</label>
              <select
                value={filtroVerificado}
                onChange={(e) => setFiltroVerificado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A69A]"
              >
                <option value="">Todos</option>
                <option value="verificado">Verificados</option>
                <option value="no_verificado">No Verificados</option>
              </select>
            </div>

            <button
              onClick={() => {
                setFiltroTipo('')
                setFiltroVerificado('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Stats Rápidas */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: usuarios.length, color: 'bg-blue-50 text-blue-700' },
            { label: 'Viajeros', value: usuarios.filter(u => u.user_type === 'viajero').length, color: 'bg-green-50 text-green-700' },
            { label: 'Guías', value: usuarios.filter(u => u.user_type === 'guia').length, color: 'bg-purple-50 text-purple-700' },
            { label: 'Verificados', value: usuarios.filter(u => u.verified).length, color: 'bg-[#e8f5f4] text-[#23A69A]' },
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
        data={usuariosFiltrados}
        columns={columns}
        loading={loading}
        emptyMessage="No se encontraron usuarios"
        pageSize={15}
      />

      {/* Modal de Detalles */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#23A69A] to-[#1e8a7e] px-6 py-5 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Detalles de Usuario</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Información Personal */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Información Personal
                </h3>
                <div className="space-y-3">
                  <div className="bg-white px-4 py-3 rounded-lg border border-blue-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Nombre Completo</span>
                    <span className="text-gray-900 font-medium">{selectedUser.full_name || 'No especificado'}</span>
                  </div>
                  <div className="bg-white px-4 py-3 rounded-lg border border-blue-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Email</span>
                    <span className="text-gray-900 font-medium">{selectedUser.email}</span>
                  </div>
                  <div className="bg-white px-4 py-3 rounded-lg border border-blue-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Teléfono</span>
                    <span className="text-gray-900 font-medium">{selectedUser.phone || 'No especificado'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white px-4 py-3 rounded-lg border border-blue-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Tipo de Usuario</span>
                      <span className="text-gray-900 font-medium capitalize">{selectedUser.user_type}</span>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-lg border border-blue-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Estado</span>
                      <div className="mt-1">
                        <StatusBadge status={selectedUser.verified ? 'verificado' : 'no_verificado'} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biografía */}
              {selectedUser.bio && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Biografía
                  </h3>
                  <div className="bg-white px-4 py-3 rounded-lg border border-purple-100">
                    <p className="text-gray-800 leading-relaxed">{selectedUser.bio}</p>
                  </div>
                </div>
              )}

              {/* Estadísticas */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Actividad en la Plataforma
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-5">
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Experiencias Publicadas</div>
                    <div className="text-3xl font-bold text-blue-900 flex items-center gap-2">
                      {selectedUser.total_experiencias}
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-5">
                    <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Reservas Realizadas</div>
                    <div className="text-3xl font-bold text-green-900 flex items-center gap-2">
                      {selectedUser.total_reservas}
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Cuenta */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Información de Cuenta
                </h3>
                <div className="space-y-3">
                  <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Fecha de Registro:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(selectedUser.created_at).toLocaleDateString('es-CL', { 
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {selectedUser.updated_at && (
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Última Actualización:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date(selectedUser.updated_at).toLocaleDateString('es-CL', { 
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">ID de Clerk</span>
                    <span className="font-mono text-xs text-gray-900 break-all">{selectedUser.clerk_user_id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  handleToggleVerificacion(selectedUser.clerk_user_id, selectedUser.verified)
                  setShowModal(false)
                }}
                className={`flex-1 px-5 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                  selectedUser.verified
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {selectedUser.verified ? 'Desverificar Usuario' : 'Verificar Usuario'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors"
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
