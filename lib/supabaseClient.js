import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para crear cliente con autenticación de Clerk (para usar cuando necesites auth)
export function createClerkSupabaseClient(session) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await session?.getToken({
            template: 'supabase',
          })
          
          const headers = new Headers(options?.headers)
          headers.set('Authorization', `Bearer ${clerkToken}`)
          
          return fetch(url, {
            ...options,
            headers,
          })
        },
      },
    },
  )
}

export default function Home() {
	// The `useSession()` hook will be used to get the Clerk `session` object
	const { session } = useSession()
	
	// Create a custom supabase client that injects the Clerk Supabase token into the request headers
	function createClerkSupabaseClient() {
	  return createClient(
	    process.env.NEXT_PUBLIC_SUPABASE_URL,
	    process.env.NEXT_PUBLIC_SUPABASE_KEY,
	    {
	      global: {
	        // Get the custom Supabase token from Clerk
	        fetch: async (url, options = {}) => {
		        // The Clerk `session` object has the getToken() method      
	          const clerkToken = await session?.getToken({
		          // Pass the name of the JWT template you created in the Clerk Dashboard
		          // For this tutorial, you named it 'supabase'
	            template: 'supabase',
	          })
	          
	          // Insert the Clerk Supabase token into the headers
		        const headers = new Headers(options?.headers)
	          headers.set('Authorization', `Bearer ${clerkToken}`)
	          
	          // Call the default fetch
	          return fetch(url, {
	            ...options,
	            headers,
	          })
	        },
	      },
	    },
	  )
	}
	
	//... The rest of the code is removed for brevity
}
