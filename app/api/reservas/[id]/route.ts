import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { reservaService } from '@/lib/services/reserva.service'
import { AppError } from '@/lib/utils/errors'

/**
 * GET /api/reservas/[id]
 * Obtiene una reserva específica
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: reservaId } = await params
    const reserva = await reservaService.getReservaById(reservaId)

    // Verificar que la reserva pertenece al usuario
    if (reserva.usuario_id !== userId) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta reserva' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, reserva })
  } catch (error) {
    console.error('Error obteniendo reserva:', error)

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/reservas/[id]
 * Actualiza una reserva (principalmente para cancelación)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await currentUser()
    const { id: reservaId } = await params
    const body = await req.json()

    // Solo permitir cancelación por ahora
    if (body.action === 'cancel') {
      const reserva = await reservaService.cancelarReserva(
        reservaId,
        userId,
        user?.emailAddresses[0]?.emailAddress,
        user?.fullName || user?.firstName || 'Usuario'
      )

      return NextResponse.json({
        success: true,
        reserva,
        message: 'Reserva cancelada exitosamente',
      })
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error actualizando reserva:', error)

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
