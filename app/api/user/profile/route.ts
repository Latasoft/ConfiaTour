import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserProfile, ensureUserProfile } from '@/lib/utils/profile'
import { supabaseAdmin } from '@/lib/db/supabase'

/**
 * GET - Obtener perfil del usuario autenticado
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No autorizado' 
        },
        { status: 401 }
      )
    }

    // Asegurar que el perfil existe y obtenerlo
    const profile = await getUserProfile(userId)

    if (!profile) {
      return NextResponse.json({
        success: true,
        clerk_user_id: userId,
        user_type: 'viajero',
        verified: false,
        exists: false
      })
    }

    return NextResponse.json({
      success: true,
      ...profile,
      exists: true
    })

  } catch (error: any) {
    console.error('Error obteniendo perfil:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al obtener perfil' 
      },
      { status: 500 }
    )
  }
}

/**
 * PUT - Actualizar perfil del usuario
 */
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No autorizado' 
        },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Asegurar que el perfil existe
    await ensureUserProfile(userId)

    // Actualizar perfil (ya sabemos que existe) usando supabaseAdmin
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(body)
      .eq('clerk_user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Perfil actualizado exitosamente'
    })

  } catch (error: any) {
    console.error('Error actualizando perfil:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error al actualizar perfil' 
      },
      { status: 500 }
    )
  }
}
