import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { reservaService } from '@/lib/services/reserva.service'
import { ensureUserProfile } from '@/lib/utils/profile'
import { AppError } from '@/lib/utils/errors'

/**
 * POST /api/reservas
 * Crea una nueva reserva (autenticado)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Autenticación
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // 2. Asegurar que el perfil existe
    await ensureUserProfile(userId)

    // 2. Asegurar que el perfil existe
    await ensureUserProfile(userId)

    // 3. Parsear body
    const body = await req.json()
    console.log('📦 Body recibido:', JSON.stringify(body, null, 2))

    // 4. FORZAR usuario_id desde sesión (seguridad)
    const reservaData = {
      ...body,
      usuario_id: userId, // ✅ Siempre desde sesión autenticada
    }

    console.log('📝 Datos de reserva (con usuario_id):', JSON.stringify(reservaData, null, 2))
    console.log('📝 Creando reserva para usuario:', userId)

    // 5. Crear reserva (con validación automática)
    const reserva = await reservaService.crearReserva(reservaData)

    console.log('✅ Reserva creada:', reserva.id)

    // 6. Responder
    return NextResponse.json(
      {
        success: true,
        reserva,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error creando reserva:', error)
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack')
    console.error('❌ Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))

    // Manejo de errores tipados
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    // Error genérico con más info en desarrollo
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/reservas
 * Obtiene las reservas del usuario autenticado
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Autenticación
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    console.log('📋 Obteniendo reservas de usuario:', userId)

    // 2. Obtener reservas
    const reservas = await reservaService.getReservasByUsuario(userId)

    return NextResponse.json({
      success: true,
      reservas,
    })
  } catch (error) {
    console.error('❌ Error obteniendo reservas:', error)

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
