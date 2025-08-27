// Verificar configuración de Supabase
export const checkSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Supabase URL:', url ? 'Configurado' : 'FALTANTE')
  console.log('Supabase Key:', key ? 'Configurado' : 'FALTANTE')
  
  if (!url || !key) {
    throw new Error('Faltan variables de entorno de Supabase. Verifica .env.local')
  }
  
  return { url, key }
}