import { NextResponse } from 'next/server'
import { ReservaRepository } from '@/lib/repositories/reserva.repository'

/**
 * CRON endpoint para limpiar reservas expiradas
 * 
 * Configuración en Render:
 * 1. Dashboard > Cron Jobs > New Cron Job
 * 2. Name: cleanup-reservas
 * 3. Schedule: cada 5 minutos (cron expression)
 * 4. Command: curl con Authorization header
 * 
 * Ver GUIA_IMPLEMENTACION_EXPIRACION.md para detalles completos
 */
export async function GET(req: Request) {
  try {
    // Validar autenticación (opcional pero recomendado)
    const authHeader = req.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const repository = new ReservaRepository()
    const count = await repository.cleanupExpiredReservas()

    return NextResponse.json({
      success: true,
      message: `Limpieza completada`,
      reservas_expiradas: count,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[ERROR] Error en cleanup de reservas:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error en cleanup de reservas'
      },
      { status: 500 }
    )
  }
}

// POST endpoint para testing manual
export async function POST(req: Request) {
  return GET(req)
}
