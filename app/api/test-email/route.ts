import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/services/email.service'

/**
 * POST /api/test-email
 * Endpoint de prueba para verificar configuración de emails
 * 
 * Body: { email: string, tipo?: 'confirmacion' | 'cancelacion' | 'comprobante' }
 */
export async function POST(req: NextRequest) {
  try {
    const { email, tipo = 'confirmacion' } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Datos de prueba
    const mockReserva = {
      id: 'test-123-456',
      experiencia_id: 'exp-test',
      usuario_id: 'user-test',
      fecha_experiencia: new Date().toISOString(),
      cantidad_personas: 2,
      precio_total: 50000,
      metodo_pago: 'transbank' as const,
      codigo_autorizacion: 'AUTH-12345',
      buy_order: 'ORD-TEST-001',
      estado: 'confirmada' as const,
      fecha_reserva: new Date().toISOString(),
      fecha_cancelacion: undefined,
      moneda: 'CLP' as const,
      pagado: true,
      creado_en: new Date().toISOString(),
    }

    const mockExperiencia = {
      id: 'exp-test',
      titulo: 'Tour de Prueba - Valparaíso',
      descripcion: 'Una experiencia increíble de prueba',
      categoria: 'aventura' as const,
      ubicacion: 'Valparaíso, Chile',
      precio: 25000,
      moneda: 'CLP' as const,
      duracion: '3 horas',
      capacidad: 10,
      usuario_id: 'guia-test',
      imagenes: [],
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date().toISOString(),
      rating_promedio: 4.5,
      disponible: true,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    }

    const mockUsuario = {
      id: 'user-test',
      nombre: 'Usuario de Prueba',
      email: email,
    }

    const emailData = {
      reserva: mockReserva,
      experiencia: mockExperiencia,
      usuario: mockUsuario,
    }

    // Enviar email según tipo
    switch (tipo) {
      case 'confirmacion':
        await emailService.sendReservaConfirmation(emailData)
        break
      case 'cancelacion':
        await emailService.sendReservaCancellation(emailData)
        break
      case 'comprobante':
        await emailService.sendPaymentReceipt(emailData)
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de email no válido' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Email de ${tipo} enviado exitosamente a ${email}`,
      config: {
        gmailConfigured: !!process.env.GMAIL_USER,
        fromEmail: process.env.GMAIL_USER,
      },
    })
  } catch (error) {
    console.error('Error enviando email de prueba:', error)
    return NextResponse.json(
      { 
        error: 'Error enviando email',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/test-email
 * Verifica la configuración de emails
 */
export async function GET() {
  const config = {
    configured: !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD,
    gmailUser: process.env.GMAIL_USER || 'No configurado',
    hasPassword: !!process.env.GMAIL_APP_PASSWORD,
  }

  return NextResponse.json({
    success: true,
    message: 'Sistema de emails',
    config,
    usage: {
      testEndpoint: 'POST /api/test-email',
      body: {
        email: 'destinatario@example.com',
        tipo: 'confirmacion | cancelacion | comprobante',
      },
    },
  })
}
