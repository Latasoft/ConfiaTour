'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CreateExperienciaModal } from '@/components/admin/CreateExperienciaModal'
import { EditExperienciaModal } from '@/components/admin/EditExperienciaModal'
import { Experiencia } from '@/types'
import { experienciaAdminAPI } from '@/lib/api/admin-experiencias'

export const dynamic = 'force-dynamic'

export default function AdminExperienciasPage() {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [experienciaToEdit, setExperienciaToEdit] = useState<Experiencia | null>(null)

  useEffect(() => {
    loadExperiencias()
  }, [])

  const loadExperiencias = async () => {
    try {
      setLoading(true)
      const data = await experienciaAdminAPI.getAll()
      setExperiencias(data)
    } catch (error: any) {
      console.error('Error cargando experiencias:', error)
      alert(error.message || 'Error al cargar experiencias')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDisponibilidad = async (id: string, disponible: boolean) => {
    try {
      await experienciaAdminAPI.actualizarDisponibilidad(id, !disponible)

      // Actualizar estado local
      setExperiencias(prev =>
        prev.map(exp => (exp.id === id ? { ...exp, disponible: !disponible } : exp))
      )

      alert(`Experiencia ${!disponible ? 'activada' : 'desactivada'} exitosamente`)
    } catch (error: any) {
      console.error('Error actualizando experiencia:', error)
      alert(error.message || 'Error al actualizar la experiencia')
    }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta experiencia? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await experienciaAdminAPI.eliminar(id)
      setExperiencias(prev => prev.filter(exp => exp.id !== id))
      alert('Experiencia eliminada exitosamente')
    } catch (error: any) {
      console.error('Error eliminando experiencia:', error)
      alert(error.message || 'Error al eliminar la experiencia')
    }
  }

  const handleEdit = (experiencia: Experiencia) => {
    setExperienciaToEdit(experiencia)
    setShowEditModal(true)
  }

  const handleCreateSuccess = (nuevaExperiencia: Experiencia) => {
    setExperiencias(prev => [nuevaExperiencia, ...prev])
  }

  const handleEditSuccess = (experienciaActualizada: Experiencia) => {
    setExperiencias(prev =>
      prev.map(exp => exp.id === experienciaActualizada.id ? experienciaActualizada : exp)
    )
  }

  // Filtrar experiencias
  const experienciasFiltradas = experiencias.filter(exp => {
    if (filtroCategoria && exp.categoria !== filtroCategoria) return false
    if (filtroEstado === 'activa' && !exp.disponible) return false
    if (filtroEstado === 'inactiva' && exp.disponible) return false
    return true
  })

  const columns = [
    {
      key: 'titulo',
      label: 'Título',
      sortable: true,
      render: (value: string) => (
        <div className="font-medium text-gray-900 max-w-xs truncate">{value}</div>
      ),
    },
    {
      key: 'categoria',
      label: 'Categoría',
      sortable: true,
      render: (value: string) => (
        <span className="capitalize text-gray-700">{value}</span>
      ),
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      render: (value: string) => (
        <span className="text-gray-600">{value}</span>
      ),
    },
    {
      key: 'precio',
      label: 'Precio',
      sortable: true,
      render: (value: number, row: Experiencia) => (
        <span className="font-medium">${value} {row.moneda}</span>
      ),
    },
    {
      key: 'rating_promedio',
      label: 'Rating',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <span>{value.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: 'disponible',
      label: 'Estado',
      render: (value: boolean) => (
        <StatusBadge status={value ? 'activa' : 'inactiva'} size="sm" />
      ),
    },
    {
      key: 'id',
      label: 'Acciones',
      render: (_: any, row: Experiencia) => (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-2 sm:px-3 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200 whitespace-nowrap"
            title="Editar"
          >
            Editar
          </button>
          <button
            onClick={() => handleToggleDisponibilidad(row.id, row.disponible)}
            className={`px-2 sm:px-3 py-1 text-xs rounded whitespace-nowrap ${
              row.disponible
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title={row.disponible ? 'Desactivar' : 'Activar'}
          >
            {row.disponible ? 'Desactivar' : 'Activar'}
          </button>
          <button
            onClick={() => handleEliminar(row.id)}
            className="px-2 sm:px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 whitespace-nowrap"
            title="Eliminar"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* Modales */}
      <CreateExperienciaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
      
      <EditExperienciaModal
        isOpen={showEditModal}
        experiencia={experienciaToEdit}
        onClose={() => {
          setShowEditModal(false)
          setExperienciaToEdit(null)
        }}
        onSuccess={handleEditSuccess}
      />

      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Experiencias</h1>
          <p className="text-gray-600 mt-2">Administra todas las experiencias de la plataforma</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-[#23A69A] text-white rounded-lg hover:bg-[#1e8a7e] transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Experiencia
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <h3 className="font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A69A]"
            >
              <option value="">Todas las categorías</option>
              <option value="turismo">Turismo</option>
              <option value="gastronomia">Gastronomía</option>
              <option value="aventura">Aventura</option>
              <option value="naturaleza">Naturaleza</option>
              <option value="cultura">Cultura</option>
              <option value="deportes">Deportes</option>
              <option value="alojamiento">Alojamiento</option>
              <option value="transporte">Transporte</option>
              <option value="tours">Tours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A69A]"
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activas</option>
              <option value="inactiva">Inactivas</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroCategoria('')
                setFiltroEstado('')
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm">Total</div>
          <div className="text-2xl font-bold">{experiencias.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm">Activas</div>
          <div className="text-2xl font-bold text-green-600">
            {experiencias.filter(e => e.disponible).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm">Inactivas</div>
          <div className="text-2xl font-bold text-gray-400">
            {experiencias.filter(e => !e.disponible).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm">Rating Promedio</div>
          <div className="text-2xl font-bold text-[#23A69A]">
            {experiencias.length > 0
              ? (experiencias.reduce((sum, e) => sum + e.rating_promedio, 0) / experiencias.length).toFixed(1)
              : '0.0'}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <DataTable
        data={experienciasFiltradas}
        columns={columns}
        loading={loading}
        emptyMessage="No se encontraron experiencias"
        pageSize={15}
      />
    </div>
  )
}
