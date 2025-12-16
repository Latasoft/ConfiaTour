import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { TransbankWebpayPlus } from '@/lib/transbank'
import { validateData, transbankCreateSchema } from '@/lib/schemas'
import { AppError } from '@/lib/utils/errors'

/**
 * POST /api/transbank/create
 * Crea una transacción de Transbank
 * Requiere autenticación
 */
export async function POST(req: NextRequest) {
  try {
    console.log('🏦 API: Creando transacción Transbank...')

    // 1. Autenticación
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Parsear y validar body
    const body = await req.json()
    console.log('📊 Datos recibidos:', {
      amount: body.amount,
      buyOrder: body.buyOrder,
      returnUrl: body.returnUrl,
    })

    const validation = validateData(transbankCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validación fallida', details: validation.errors },
        { status: 400 }
      )
    }

    const { amount, buyOrder, returnUrl, sessionId } = body

    // 3. Crear instancia de Transbank
    const transbank = new TransbankWebpayPlus()

    // 4. Validar parámetros (seguridad adicional)
    const validationErrors = transbank.validateTransactionParams(
      amount,
      buyOrder,
      returnUrl,
      sessionId
    )

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Errores de validación', details: validationErrors },
        { status: 400 }
      )
    }

    // 5. Crear transacción
    const result = await transbank.createTransaction(
      amount,
      buyOrder,
      returnUrl,
      sessionId
    )

    console.log('✅ Transacción creada:', {
      token: result.token,
      buyOrder: buyOrder,
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('💥 Error creando transacción:', error)

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
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
