import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabaseClient'

const ADMIN_EMAILS = [
  'admin@confiatour.com',
  'benjatorrealba2001@gmail.com',
]

// GET - Listar experiencias con filtros
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const categoria = searchParams.get('categoria')
    const estado = searchParams.get('estado')

    let query = supabase
      .from('experiencias')
      .select('*')
      .order('created_at', { ascending: false })

    if (categoria) {
      query = query.eq('categoria', categoria)
    }

    if (estado) {
      query = query.eq('estado', estado)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching experiencias:', error)
    return NextResponse.json(
      { error: 'Error al obtener experiencias' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar disponibilidad de experiencia
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { id, disponible } = body

    if (!id || disponible === undefined) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('experiencias')
      .update({ disponible })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating experiencia:', error)
    return NextResponse.json(
      { error: 'Error al actualizar experiencia' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar experiencia
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de experiencia requerido' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('experiencias')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting experiencia:', error)
    return NextResponse.json(
      { error: 'Error al eliminar experiencia' },
      { status: 500 }
    )
  }
}
