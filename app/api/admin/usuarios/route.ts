import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'
import { requireAdmin } from '@/lib/utils/auth'

// GET - Listar usuarios con estadísticas (solo admin)
export async function GET(req: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get('tipo')
    const verificado = searchParams.get('verificado')

    console.log('[DEBUG] Admin obteniendo usuarios')

    // Obtener perfiles
    let query = supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (tipo) {
      query = query.eq('user_type', tipo)
    }

    if (verificado !== null && verificado !== '') {
      query = query.eq('verified', verificado === 'true')
    }

    const { data: profiles, error: profilesError } = await query

    if (profilesError) throw profilesError

    // Para cada usuario, obtener estadísticas
    const usuariosConStats = await Promise.all(
      (profiles || []).map(async (profile) => {
        // Contar experiencias del usuario
        const { count: expCount } = await supabaseAdmin
          .from('experiencias')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', profile.clerk_user_id)

        // Contar reservas del usuario
        const { count: resCount } = await supabaseAdmin
          .from('reservas')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', profile.clerk_user_id)

        return {
          ...profile,
          total_experiencias: expCount || 0,
          total_reservas: resCount || 0,
        }
      })
    )

    console.log('[DEBUG] Usuarios obtenidos:', usuariosConStats.length)

    return NextResponse.json(usuariosConStats)
  } catch (error) {
    console.error('[ERROR] Error fetching usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar verificación de usuario (solo admin)
export async function PUT(req: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const body = await req.json()
    const { clerk_user_id, verified } = body

    if (!clerk_user_id || verified === undefined) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    console.log(`[DEBUG] Admin ${adminCheck.email} actualizando verificación de usuario ${clerk_user_id} a: ${verified}`)

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ verified })
      .eq('clerk_user_id', clerk_user_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[ERROR] Error updating usuario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}
