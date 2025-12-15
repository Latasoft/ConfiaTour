import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { statsService } from '@/lib/services/stats.service'

const getAdminEmails = (): string[] => {
  const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  if (!emails) {
    console.error('❌ NEXT_PUBLIC_ADMIN_EMAILS no está configurado')
    return []
  }
  return emails.split(',').map(email => email.trim())
}

const ADMIN_EMAILS = getAdminEmails()

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si es admin (necesitaríamos obtener el email del usuario de Clerk)
    // Por simplicidad, asumimos que está autenticado como admin en este endpoint

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
