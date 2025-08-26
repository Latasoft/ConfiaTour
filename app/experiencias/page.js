'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

export default function ExperienciasPage() {
  const { user, isLoaded } = useUser()
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // Agregar filtros y búsqueda
  const [filters, setFilters] = useState({
    region: '',
    tipo: '',
    precio: ''
  })

  useEffect(() => {
    const fetchExperiencias = async () => {
      try {
        const { data: experiencias, error: fetchError } = await supabase
          .from('experiencias')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) {
          setError(fetchError)
        } else {
          setData(experiencias || [])
        }
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchExperiencias()
  }, [])

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <Navbar />
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          {/* Header con título y botón crear */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <h1 className="text-4xl text-black font-bold mb-4 md:mb-0">Experiencias</h1>
            
            {/* Botón Crear Experiencia - solo visible para usuarios autenticados */}
            {isLoaded && user && (
              <Link href="/experiencias/crear">
                <button className="bg-[#23A69A] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors flex items-center gap-2">
                  <span className="text-xl">+</span>
                  Crear Experiencia
                </button>
              </Link>
            )}
          </div>
          
          {loading && (
            <div className="text-center">
              <p>Cargando experiencias...</p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error.message}
            </div>
          )}
          
          {/* Componente de filtros */}
          <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select value={filters.region} onChange={(e) => setFilters({...filters, region: e.target.value})}>
                <option value="">Todas las regiones</option>
                <option value="salta">Salta</option>
                <option value="jujuy">Jujuy</option>
                <option value="antofagasta">Antofagasta</option>
              </select>
              {/* Más filtros */}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.map((exp) => (
              <div key={exp.id} className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-xl mb-2">{exp.titulo || exp.nombre}</h3>
                <p className="text-gray-600 mb-4">{exp.descripcion}</p>
                {exp.precio && (
                  <p className="font-bold text-[#23A69A] text-lg">
                    ${exp.precio}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {data?.length === 0 && !error && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">No hay experiencias disponibles.</p>
              {isLoaded && user && (
                <Link href="/experiencias/crear">
                  <button className="bg-[#23A69A] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors">
                    Crear la primera experiencia
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

