import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/auth'
import { statsService } from '@/lib/services/stats.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verificar que es admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const stats = await statsService.getAllStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
