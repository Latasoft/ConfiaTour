import { useAuth } from '@clerk/nextjs'
import { createClerkSupabaseClient } from './supabase'
import { useEffect, useState } from 'react'

export const useSupabaseWithClerk = () => {
  const { getToken, userId } = useAuth()
  const [supabaseClient, setSupabaseClient] = useState(null)

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const token = await getToken({ template: 'supabase' })
        
        if (token) {
          const client = createClerkSupabaseClient(token)
          setSupabaseClient(client)
        }
      } catch (error) {
        console.error('Error initializing Supabase with Clerk:', error)
      }
    }

    if (userId) {
      initializeSupabase()
    }
  }, [getToken, userId])

  return supabaseClient
}