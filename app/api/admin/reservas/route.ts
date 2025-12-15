import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabaseClient'

const getAdminEmails = (): string[] => {
  const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  if (!emails) {
    console.error('❌ NEXT_PUBLIC_ADMIN_EMAILS no está configurado')
    return []
  }
  return emails.split(',').map(email => email.trim())
}

const ADMIN_EMAILS = getAdminEmails()

// GET - Listar reservas con filtros
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const estado = searchParams.get('estado')

    let query = supabase
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

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching reservas:', error)
    return NextResponse.json(
      { error: 'Error al obtener reservas' },
      { status: 500 }
    )
  }
}

// PUT - Cambiar estado de reserva
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { id, estado } = body

    if (!id || !estado) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('reservas')
      .update({ estado })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating reserva:', error)
    return NextResponse.json(
      { error: 'Error al actualizar reserva' },
      { status: 500 }
    )
  }
}
