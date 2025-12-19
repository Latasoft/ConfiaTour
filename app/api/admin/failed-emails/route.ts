import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'
import { emailService } from '@/lib/services/email.service'

/**
 * API para gestión de emails fallidos
 * 
 * GET: Listar emails fallidos pendientes
 * POST: Reintentar envío de un email fallido
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const resolved = searchParams.get('resolved') === 'true'

    const { data, error } = await supabase
      .from('failed_emails')
      .select('*')
      .eq('resolved', resolved)
      .order('failed_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({
      success: true,
      failed_emails: data,
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('[ERROR] Error obteniendo emails fallidos:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error al obtener emails fallidos'
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { failed_email_id } = body

    if (!failed_email_id) {
      return NextResponse.json(
        { success: false, error: 'failed_email_id requerido' },
        { status: 400 }
      )
    }

    // 1. Obtener el email fallido
    const { data: failedEmail, error: fetchError } = await supabase
      .from('failed_emails')
      .select('*, reservas(*), experiencias(*)')
      .eq('id', failed_email_id)
      .single()

    if (fetchError || !failedEmail) {
      return NextResponse.json(
        { success: false, error: 'Email fallido no encontrado' },
        { status: 404 }
      )
    }

    // 2. Reintentar envío según el tipo
    try {
      const reserva = failedEmail.reservas
      const experiencia = failedEmail.experiencias
      
      const emailData = {
        reserva,
        experiencia,
        usuario: {
          nombre: failedEmail.recipient_name,
          email: failedEmail.recipient_email
        }
      }

      switch (failedEmail.email_type) {
        case 'confirmacion':
          await emailService.sendReservaConfirmation(emailData)
          break
        case 'comprobante':
          await emailService.sendPaymentReceipt(emailData)
          break
        case 'cancelacion':
          await emailService.sendReservaCancellation(emailData)
          break
        default:
          throw new Error(`Tipo de email desconocido: ${failedEmail.email_type}`)
      }

      // 3. Marcar como resuelto
      const { error: updateError } = await supabase
        .from('failed_emails')
        .update({
          resolved: true,
          retried_at: new Date().toISOString()
        })
        .eq('id', failed_email_id)

      if (updateError) {
        console.error('[ERROR] Error marcando email como resuelto:', updateError)
      }

      return NextResponse.json({
        success: true,
        message: 'Email reenviado exitosamente',
        email_type: failedEmail.email_type,
        recipient: failedEmail.recipient_email
      })

    } catch (retryError: any) {
      // Fallo en el retry
      return NextResponse.json(
        {
          success: false,
          error: 'Error al reenviar email',
          details: retryError.message
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('[ERROR] Error en retry de email:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error procesando retry'
      },
      { status: 500 }
    )
  }
}
