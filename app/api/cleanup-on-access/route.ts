import { NextResponse } from 'next/server'
import { ReservaRepository } from '@/lib/repositories/reserva.repository'

// Variable en memoria para trackear última limpieza
let lastCleanup = 0
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutos en milisegundos

/**
 * Endpoint de limpieza on-access (sin autenticación)
 * Se ejecuta cuando hay tráfico en la app
 * Throttling: solo ejecuta si pasaron 5+ minutos desde la última limpieza
 */
export async function GET() {
  const now = Date.now()
  
  // Throttling: solo ejecutar si pasaron 5 minutos
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    const nextCleanupIn = Math.round((CLEANUP_INTERVAL - (now - lastCleanup)) / 1000)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cleanup no necesario aún',
      next_cleanup_in_seconds: nextCleanupIn,
      last_cleanup: new Date(lastCleanup).toISOString()
    })
  }
  
  try {
    const repository = new ReservaRepository()
    const count = await repository.cleanupExpiredReservas()
    
    lastCleanup = now
    
    return NextResponse.json({
      success: true,
      message: count > 0 ? `${count} reserva(s) expirada(s) limpiada(s)` : 'Sin reservas expiradas',
      reservas_expiradas: count,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[ERROR] Error en cleanup on-access:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error en cleanup de reservas'
      },
      { status: 500 }
    )
  }
}

// Alias para POST (por si se llama desde cron)
export async function POST() {
  return GET()
}
