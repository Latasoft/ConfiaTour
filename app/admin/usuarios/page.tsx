'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Profile } from '@/types'
import { supabase } from '@/lib/supabaseClient'

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
      
      // Obtener perfiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Para cada usuario, obtener estadísticas
      const usuariosConStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Contar experiencias del usuario
          const { count: expCount } = await supabase
            .from('experiencias')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', profile.clerk_user_id)

          // Contar reservas del usuario
          const { count: resCount } = await supabase
            .from('reservas')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', profile.clerk_user_id)

          return {
            ...profile,
            total_experiencias: expCount || 0,
            total_reservas: resCount || 0,
          }
        })
      )

      setUsuarios(usuariosConStats)
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerificacion = async (clerkUserId: string, currentVerified: boolean) => {
    if (!confirm(`¿${currentVerified ? 'Desverificar' : 'Verificar'} a este usuario?`)) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified: !currentVerified })
        .eq('clerk_user_id', clerkUserId)

      if (error) throw error

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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Detalles de Usuario</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Información Personal */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Información Personal</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium">{selectedUser.full_name || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teléfono:</span>
                      <span className="font-medium">{selectedUser.phone || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium capitalize">{selectedUser.user_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <StatusBadge status={selectedUser.verified ? 'verificado' : 'no_verificado'} />
                    </div>
                  </div>
                </div>

                {/* Biografía */}
                {selectedUser.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Biografía</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedUser.bio}</p>
                    </div>
                  </div>
                )}

                {/* Estadísticas */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Actividad en la Plataforma</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1">Experiencias Publicadas</div>
                      <div className="text-2xl font-bold text-blue-700">{selectedUser.total_experiencias}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">Reservas Realizadas</div>
                      <div className="text-2xl font-bold text-green-700">{selectedUser.total_reservas}</div>
                    </div>
                  </div>
                </div>

                {/* Fechas */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Información de Cuenta</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Registro:</span>
                      <span>{new Date(selectedUser.created_at).toLocaleDateString('es-CL', { dateStyle: 'long' })}</span>
                    </div>
                    {selectedUser.updated_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Última Actualización:</span>
                        <span>{new Date(selectedUser.updated_at).toLocaleDateString('es-CL', { dateStyle: 'long' })}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID de Clerk:</span>
                      <span className="font-mono text-xs">{selectedUser.clerk_user_id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex gap-3">
                <button
                  onClick={() => {
                    handleToggleVerificacion(selectedUser.clerk_user_id, selectedUser.verified)
                    setShowModal(false)
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    selectedUser.verified
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {selectedUser.verified ? 'Desverificar Usuario' : 'Verificar Usuario'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
