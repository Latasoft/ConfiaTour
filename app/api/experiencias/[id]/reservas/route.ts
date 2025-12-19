import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/db/supabase'

/**
 * GET /api/experiencias/[id]/reservas
 * Obtiene las reservas de una experiencia (solo si eres el dueño)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Autenticación
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id: experienciaId } = await params

    // 2. Verificar que la experiencia pertenece al usuario
    const { data: experiencia, error: expError } = await supabaseAdmin
      .from('experiencias')
      .select('usuario_id')
      .eq('id', experienciaId)
      .single()

    if (expError || !experiencia) {
      return NextResponse.json(
        { error: 'Experiencia no encontrada' },
        { status: 404 }
      )
    }

    if (experiencia.usuario_id !== userId) {
      return NextResponse.json(
        { error: 'No tienes permiso para ver estas reservas' },
        { status: 403 }
      )
    }

    // 3. Obtener reservas con información del usuario
    console.log(`📋 Obteniendo reservas para experiencia: ${experienciaId}`)
    
    const { data: reservas, error: reservasError } = await supabaseAdmin
      .from('reservas')
      .select(`
        *,
        profiles (
          full_name,
          email,
          phone
        )
      `)
      .eq('experiencia_id', experienciaId)
      .order('fecha_experiencia', { ascending: false })

    if (reservasError) {
      console.error('❌ Error obteniendo reservas:', reservasError)
      console.error('Detalles:', JSON.stringify(reservasError, null, 2))
      return NextResponse.json(
        { 
          error: 'Error al obtener reservas',
          details: reservasError.message 
        },
        { status: 500 }
      )
    }

    console.log(`✅ Reservas encontradas: ${reservas?.length || 0}`)

    return NextResponse.json({
      success: true,
      reservas: reservas || []
    })

  } catch (error: any) {
    console.error('Error en GET /api/experiencias/[id]/reservas:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
