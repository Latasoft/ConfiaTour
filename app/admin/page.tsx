'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '@/components/admin/StatCard'
import { statsService } from '@/lib/services/stats.service'
import { AdminStats } from '@/types'

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await statsService.getAllStats()
      setStats(data)
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err)
      setError(err.message || 'Error cargando estadísticas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#23A69A]"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-bold mb-2">Error</h3>
        <p className="text-red-600">{error || 'No se pudieron cargar las estadísticas'}</p>
        <button
          onClick={loadStats}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-2">Resumen general de la plataforma ConfiaTour</p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Reservas"
          value={stats.reservas.total}
          icon="📅"
          subtitle={`${stats.reservas.confirmadas} confirmadas`}
          color="info"
        />
        <StatCard
          title="Ingresos Totales"
          value={`$${stats.ingresos.total.toLocaleString()}`}
          icon="💰"
          subtitle="CLP"
          color="success"
        />
        <StatCard
          title="Experiencias Activas"
          value={stats.experiencias.activas}
          icon="🎯"
          subtitle={`de ${stats.experiencias.total} totales`}
          color="primary"
        />
        <StatCard
          title="Usuarios Totales"
          value={stats.usuarios.total}
          icon="👥"
          subtitle={`${stats.usuarios.verificados} verificados`}
          color="info"
        />
      </div>

      {/* Estadísticas Detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reservas por Estado */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Reservas por Estado</h3>
          <div className="space-y-3">
            {[
              { label: 'Confirmadas', value: stats.reservas.confirmadas, color: 'bg-green-500' },
              { label: 'Pendientes', value: stats.reservas.pendientes, color: 'bg-yellow-500' },
              { label: 'Completadas', value: stats.reservas.completadas, color: 'bg-blue-500' },
              { label: 'Canceladas', value: stats.reservas.canceladas, color: 'bg-red-500' },
            ].map((item) => {
              const percentage = stats.reservas.total > 0 
                ? (item.value / stats.reservas.total) * 100 
                : 0
              
              return (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm text-gray-600">{item.value} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Categorías Populares */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Experiencias por Categoría</h3>
          <div className="space-y-3">
            {Object.entries(stats.experiencias.por_categoria)
              .filter(([_, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([categoria, count]) => {
                const percentage = stats.experiencias.total > 0
                  ? (count / stats.experiencias.total) * 100
                  : 0
                
                return (
                  <div key={categoria}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{categoria}</span>
                      <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#23A69A] h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Experiencias Más Populares */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-bold mb-4">Top 5 Experiencias Más Reservadas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Experiencia</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Reservas</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.experiencias.mas_reservadas.map((exp, index) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{exp.titulo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">{exp.total_reservas}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">
                    ${exp.ingresos.toLocaleString()} CLP
                  </td>
                </tr>
              ))}
              {stats.experiencias.mas_reservadas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingresos por Mes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Ingresos de los Últimos 12 Meses</h3>
        <div className="space-y-2">
          {stats.ingresos.por_mes.slice(-6).map((mes) => {
            const maxIngresos = Math.max(...stats.ingresos.por_mes.map(m => m.ingresos), 1)
            const percentage = (mes.ingresos / maxIngresos) * 100
            
            return (
              <div key={mes.mes}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{mes.mes}</span>
                  <div className="text-sm text-right">
                    <span className="font-medium text-green-600">${mes.ingresos.toLocaleString()}</span>
                    <span className="text-gray-500 ml-2">({mes.reservas} reservas)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#23A69A] to-[#1e8a7f] h-3 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
