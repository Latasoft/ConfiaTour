'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'

export default function ExperienciasPage() {
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

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
    <div className="min-h-screen bg-[#f6f4f2]">
      <Navbar />
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-4xl font-bold text-center mb-12">Experiencias</h1>
          
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
            <p className="text-center text-gray-600">No hay experiencias disponibles.</p>
          )}
        </div>
      </main>
    </div>
  )
}