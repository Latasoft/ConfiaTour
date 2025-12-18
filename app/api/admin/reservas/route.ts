import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'
import { requireAdmin } from '@/lib/utils/auth'
import { AppError } from '@/lib/utils/errors'

// GET - Listar reservas con filtros (solo admin)
export async function GET(req: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { searchParams } = new URL(req.url)
    const estado = searchParams.get('estado')

    console.log('[DEBUG] Admin obteniendo reservas, estado:', estado)

    let query = supabaseAdmin
      .from('reservas')
      .select(`
        *,
        experiencias (
          titulo,
          categoria,
          usuario_id
        )
      `)
      .order('fecha_reserva', { ascending: false })

    if (estado) {
      query = query.eq('estado', estado)
    }

    const { data, error } = await query

    console.log('[DEBUG] Reservas obtenidas:', data?.length, 'error:', error)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('[ERROR] Error fetching reservas:', error)
    return NextResponse.json(
      { error: 'Error al obtener reservas' },
      { status: 500 }
    )
  }
}

// PUT - Cambiar estado de reserva (solo admin)
export async function PUT(req: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const body = await req.json()
    const { id, estado } = body

    if (!id || !estado) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    // Validar estado
    const estadosValidos = ['pendiente_pago', 'confirmada', 'cancelada', 'completada']
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      )
    }

    console.log(`[DEBUG] Admin ${adminCheck.email} actualizando reserva ${id} a estado: ${estado}`)

    const { data, error } = await supabaseAdmin
      .from('reservas')
      .update({ estado })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[ERROR] Error updating reserva:', error)

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar reserva' },
      { status: 500 }
    )
  }
}
