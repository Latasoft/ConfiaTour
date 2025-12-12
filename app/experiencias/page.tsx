'use client'

import { useState, useEffect } from 'react'
import FiltrosExperienciasComponent from '@/components/FiltrosExperiencias'
import ExperienciaCard from '@/components/ExperienciaCard'
import { getExperiencias } from '@/lib/experiencias'
import { FiltrosExperiencias, Experiencia } from '@/types'
import { useToast } from '@/lib/context/ToastContext'

export default function ExperienciasPage() {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosExperiencias>({})
  const { error: showError } = useToast()

  const cargarExperiencias = async () => {
    try {
      setLoading(true)
      const data = await getExperiencias(filtros)
      setExperiencias(data)
    } catch (error) {
      console.error('Error cargando experiencias:', error)
      showError('Error al cargar las experiencias. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarExperiencias()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros])

  const handleFiltrosChange = (nuevosFiltros: FiltrosExperiencias) => {
    setFiltros(nuevosFiltros)
  }

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-5">
          <h1 className="text-4xl font-bold text-center mb-8">Explorar Experiencias</h1>
          
          <FiltrosExperienciasComponent onFiltrosChange={handleFiltrosChange} />
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#23A69A]"></div>
              <p className="mt-2">Cargando experiencias...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
                  Se encontraron {experiencias.length} {experiencias.length === 1 ? 'experiencia' : 'experiencias'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiencias.map((experiencia) => (
                  <ExperienciaCard key={experiencia.id} experiencia={experiencia} />
                ))}
              </div>
              
              {experiencias.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron experiencias con estos filtros.</p>
                  <button
                    onClick={() => setFiltros({})}
                    className="mt-4 text-[#23A69A] hover:underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
