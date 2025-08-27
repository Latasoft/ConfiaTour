'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useUserProfile } from '../hooks/useUserProfile'
import { useSupabaseWithClerk } from '../lib/useSupabaseWithClerk'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import CorredorSection from '../components/CorredorSection'
import DashboardViajero from '../components/DashboardViajero'
import DashboardEmprendedor from '../components/DashboardEmprendedor'

export default function Home() {
  const { user, isLoaded } = useUser()
  const { profile, isViajero, isEmprendedor, hasProfile } = useUserProfile()
  const supabase = useSupabaseWithClerk()
  const [experiencias, setExperiencias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExperiencias = async () => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('experiencias')
            .select(`
              *,
              perfiles!experiencias_emprendedor_id_fkey (
                nombre,
                apellido
              )
            `)
            .eq('activa', true)
            .order('created_at', { ascending: false })
            .limit(6)

          if (!error) {
            setExperiencias(data || [])
          }
        } catch (err) {
          console.error('Error fetching experiencias:', err)
        } finally {
          setLoading(false)
        }
      }
    }

    if (isLoaded && supabase) {
      fetchExperiencias()
    }
  }, [isLoaded, supabase])

  return (
    <div className="min-h-screen bg-[#f6f4f2] text-black">
      <Navbar />
      
      {/* Hero Section solo para usuarios no logueados */}
      {!user && <HeroSection />}
      
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          
          {/* Dashboard específico para usuarios logueados */}
          {user && hasProfile && (
            <>
              {isViajero && <DashboardViajero profile={profile} />}
              {isEmprendedor && <DashboardEmprendedor profile={profile} />}
            </>
          )}
          
          {/* Corredor Section */}
          <CorredorSection />
          
          {/* Experiencias destacadas */}
          <section className="py-20">
            <h2 className="text-4xl font-bold text-center mb-12">
              {isViajero ? 'Experiencias para ti' : 
               isEmprendedor ? 'Experiencias de otros emprendedores' : 
               'Experiencias Destacadas'}
            </h2>
            
            {loading ? (
              <p className="text-center">Cargando experiencias...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {experiencias.map((experiencia) => (
                  <div key={experiencia.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {experiencia.imagen_url && (
                      <img
                        src={experiencia.imagen_url}
                        alt={experiencia.titulo}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{experiencia.titulo}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{experiencia.descripcion}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-[#23A69A]">
                          ${experiencia.precio}
                        </span>
                        <span className="text-sm text-gray-500">
                          📍 {experiencia.ubicacion}
                        </span>
                      </div>
                      <button className="w-full bg-[#23A69A] text-white py-2 rounded-xl font-bold hover:bg-[#23A69A]/90 transition-colors">
                        {isViajero ? 'Reservar' : 'Ver Detalles'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
