'use client'

import { useState, useEffect } from 'react'
import { FiltrosExperiencias, Categoria } from '@/types'

interface FiltrosExperienciasProps {
  onFiltrosChange: (filtros: FiltrosExperiencias) => void
  filtrosIniciales?: FiltrosExperiencias
}

const categorias: Categoria[] = [
  'turismo', 
  'gastronomia', 
  'aventura', 
  'naturaleza', 
  'cultura', 
  'deportes',
  'alojamiento',
  'transporte',
  'tours'
]

export default function FiltrosExperienciasComponent({ onFiltrosChange, filtrosIniciales = {} }: FiltrosExperienciasProps) {
  const [filtros, setFiltros] = useState<FiltrosExperiencias>(filtrosIniciales)

  // Actualizar filtros cuando cambien los filtros iniciales (desde URL)
  useEffect(() => {
    if (Object.keys(filtrosIniciales).length > 0) {
      setFiltros(filtrosIniciales)
    }
  }, [filtrosIniciales])

  const handleInputChange = (campo: keyof FiltrosExperiencias, valor: any) => {
    const nuevosFiltros = { ...filtros, [campo]: valor || undefined }
    setFiltros(nuevosFiltros)
    onFiltrosChange(nuevosFiltros)
  }

  const limpiarFiltros = () => {
    const filtrosVacios: FiltrosExperiencias = {}
    setFiltros(filtrosVacios)
    onFiltrosChange(filtrosVacios)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">Filtrar Experiencias</h3>
      
      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar experiencias..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A69A]"
          value={filtros.busqueda || ''}
          onChange={(e) => handleInputChange('busqueda', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium mb-2">Categoría</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A69A]"
            value={filtros.categoria || ''}
            onChange={(e) => handleInputChange('categoria', e.target.value as Categoria)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-medium mb-2">Ubicación</label>
          <input
            type="text"
            placeholder="Ej: Buenos Aires"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A69A]"
            value={filtros.ubicacion || ''}
            onChange={(e) => handleInputChange('ubicacion', e.target.value)}
          />
        </div>

        {/* Precio Mínimo */}
        <div>
          <label className="block text-sm font-medium mb-2">Precio Mín (USD)</label>
          <input
            type="number"
            placeholder="0"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A69A]"
            value={filtros.precioMin || ''}
            onChange={(e) => handleInputChange('precioMin', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        {/* Precio Máximo */}
        <div>
          <label className="block text-sm font-medium mb-2">Precio Máx (USD)</label>
          <input
            type="number"
            placeholder="1000"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A69A]"
            value={filtros.precioMax || ''}
            onChange={(e) => handleInputChange('precioMax', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Fecha */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Fecha desde</label>
        <input
          type="date"
          className="w-full md:w-auto p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A69A]"
          value={filtros.fechaInicio || ''}
          onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
        />
      </div>

      <button
        onClick={limpiarFiltros}
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        Limpiar Filtros
      </button>
    </div>
  )
}
