'use client'
import { useEffect, useState } from 'react'
import { useSupabaseWithClerk } from '../lib/useSupabaseWithClerk'
import { useUser } from '@clerk/nextjs'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import BenefitsSection from '../components/BenefitsSection'
import CorredorSection from '../components/CorredorSection'

export default function Home() {
  const { user, isLoaded } = useUser()
  const supabase = useSupabaseWithClerk()
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExperiencias = async () => {
      if (supabase) {
        try {
          setLoading(true)
          setError(null)
          
          const { data: experiencias, error: fetchError } = await supabase
            .from('experiencias') // Asume que tienes una tabla llamada 'experiencias'
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
    }

    if (isLoaded && supabase) {
      fetchExperiencias()
    }
  }, [supabase, isLoaded])



  return (
    <div className="min-h-screen bg-[#f6f4f2]">
      <Navbar />
      <HeroSection />
      <BenefitsSection />
      <CorredorSection />
      



    </div>
  )
}
