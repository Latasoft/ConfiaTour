import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { TransbankWebpayPlus } from '@/lib/transbank'
import { reservaService } from '@/lib/services/reserva.service'
import { validateData, transbankConfirmSchema } from '@/lib/schemas'
import { AppError } from '@/lib/utils/errors'

/**
 * POST /api/transbank/confirm
 * Confirma una transacción de Transbank y actualiza la reserva
 */
export async function POST(req: NextRequest) {
  console.log('🚀 API: Iniciando confirmación de transacción...')

  try {
    // 1. Autenticación
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await currentUser()

    // 2. Validar body
    const body = await req.json()
    const validation = validateData(transbankConfirmSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validación fallida', details: validation.errors },
        { status: 400 }
      )
    }

    const { token } = body
    console.log('📊 Token recibido:', token)

    // 3. Confirmar con Transbank
    console.log('🏦 Creando instancia de Transbank...')
    const transbank = new TransbankWebpayPlus()

    console.log('📞 Confirmando transacción con token:', token)
    const confirmResult = await transbank.confirmTransaction(token)
    console.log('✅ Confirmación exitosa:', confirmResult)

    // 4. Obtener estado
    const statusResult = await transbank.getTransactionStatus(token)
    console.log('📊 Estado obtenido:', statusResult)

    // 5. Parsear estado
    const estadoParsed = transbank.parseTransactionStatus(statusResult)
    console.log('🔍 Estado parseado:', estadoParsed)

    // 6. Buscar la reserva por buy_order
    const buyOrder = estadoParsed.buyOrder

    if (!buyOrder) {
      throw new Error('Buy order no encontrado en respuesta de Transbank')
    }

    // 7. Actualizar reserva según resultado
    if (estadoParsed.status === 'AUTHORIZED') {
      console.log('✅ Pago autorizado, confirmando reserva...')

      // Buscar reserva por buy_order
      const { supabaseAdmin } = await import('@/lib/db/supabase')
      console.log('🔍 Buscando reserva con buy_order:', buyOrder)
      
      const { data: reserva, error: findError } = await supabaseAdmin
        .from('reservas')
        .select('*')
        .eq('buy_order', buyOrder)
        .single()

      console.log('📊 Resultado de búsqueda:', { reserva, findError })

      if (findError || !reserva) {
        console.error('❌ Reserva no encontrada con buy_order:', buyOrder)
        
        // Debug: Buscar todas las reservas recientes
        const { data: todasReservas } = await supabaseAdmin
          .from('reservas')
          .select('id, buy_order, session_id, creado_en')
          .order('creado_en', { ascending: false })
          .limit(5)
        
        console.log('🔍 Últimas 5 reservas en BD:', JSON.stringify(todasReservas, null, 2))
        throw new Error('Reserva no encontrada')
      }

      // Verificar que la reserva pertenece al usuario
      if (reserva.usuario_id !== userId) {
        console.error('❌ Reserva no pertenece al usuario')
        return NextResponse.json(
          { error: 'No autorizado para esta reserva' },
          { status: 403 }
        )
      }

      // Confirmar reserva usando el servicio
      const reservaConfirmada = await reservaService.confirmarReserva(
        reserva.id,
        {
          codigo_autorizacion: estadoParsed.authorizationCode,
          detalles_pago: estadoParsed,
        },
        user?.emailAddresses[0]?.emailAddress,
        user?.fullName || user?.firstName || 'Usuario'
      )

      console.log('✅ Reserva confirmada:', reservaConfirmada.id)

      return NextResponse.json(
        {
          success: true,
          confirmation: confirmResult,
          status: statusResult,
          parsed: estadoParsed,
          reserva: reservaConfirmada,
        },
        { status: 200 }
      )
    } else {
      console.log('❌ Pago no autorizado:', estadoParsed.status)

      return NextResponse.json(
        {
          success: false,
          confirmation: confirmResult,
          status: statusResult,
          parsed: estadoParsed,
          message: 'Pago no autorizado',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('💥 Error completo:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error confirmando transacción',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido. Usa POST.' },
    { status: 405 }
  )
}
