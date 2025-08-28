'use client'
import { useEffect, useState } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export default function Home() {
  const [experiencias, setExperiencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { user, isLoaded: userLoaded } = useUser()
  const { session, isLoaded: sessionLoaded } = useSession()

  useEffect(() => {
    if (user) {
      console.log('Clerk User ID:', user.id)
    }
  }, [user])

  // Crear cliente simple de Supabase (sin token de Clerk)
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    if (!user || !userLoaded || !sessionLoaded) return

    async function loadExperiencias() {
      setLoading(true)
      setError(null)
      
      try {
        console.log('Loading experiencias for user:', user.id)
        
        // Filtrar por user_id manualmente ya que RLS está deshabilitado
        const { data, error } = await client
          .from('experiencias')
          .select('*')
          .eq('user_id', user.id) // Filtrar por el user_id
        
        if (error) {
          console.error('Supabase error:', error)
          setError(`Error loading experiencias: ${error.message}`)
        } else {
          console.log('Experiencias loaded:', data)
          setExperiencias(data || [])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError(`Unexpected error: ${err.message}`)
      }
      
      setLoading(false)
    }

    loadExperiencias()
  }, [user, userLoaded, sessionLoaded])

  // Show loading while Clerk is initializing
  if (!userLoaded || !sessionLoaded) {
    return (
      <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
        <div className="text-xl">Loading Clerk...</div>
      </div>
    )
  }

  // Redirect to sign in if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f4f2] flex items-center justify-center">
        <div className="text-xl">Please sign in to continue</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">          
          {/* Error display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <h1 className="text-4xl text-black font-bold mb-4 md:mb-0">Mis Experiencias</h1>
            
            <Link href="/test/crear">
              <button className="bg-[#23A69A] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors flex items-center gap-2">
                <span className="text-xl">+</span>
                Crear Experiencia
              </button>
            </Link>
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-xl">Cargando experiencias...</div>
            </div>
          )}

          {/* Experiencias Grid */}
          {!loading && !error && experiencias.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiencias.map((exp) => (
                <div key={exp.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {exp.imagen && (
                    <img
                      src={exp.imagen}
                      alt={exp.nombre}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  )}
                  {!exp.imagen && (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📸</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{exp.nombre}</h3>
                    <div className="flex justify-between items-center mb-4">
                      {exp.precio && (
                        <span className="text-lg font-bold text-[#23A69A]">
                          ${exp.precio}
                        </span>
                      )}
                    </div>
                    <button className="w-full bg-[#23A69A] text-white py-2 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && experiencias.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-4">No tienes experiencias creadas</h2>
              <p className="text-gray-600 mb-8">¡Crea tu primera experiencia y compártela con el mundo!</p>
              <Link href="/test/crear">
                <button className="bg-[#23A69A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors">
                  Crear Primera Experiencia
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
