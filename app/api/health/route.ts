import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar que las variables de entorno críticas existen
    const checks = {
      clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      gmail: !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD,
      timestamp: new Date().toISOString(),
    }

    const isHealthy = checks.clerk && checks.supabase

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        checks,
        version: '1.0.0',
      },
      { status: isHealthy ? 200 : 503 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
