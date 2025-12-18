import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'
import { requireAdmin } from '@/lib/utils/auth'

export const dynamic = 'force-dynamic'

// GET: Obtener solicitudes de verificación
export async function GET(request: Request) {
  try {
    // Verificar que es admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('verification_requests')
      .select(`
        *,
        profiles:clerk_user_id (
          full_name,
          email,
          user_type
        )
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching verification requests:', error)
      return NextResponse.json(
        { error: 'Error al obtener solicitudes de verificación' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/admin/verificaciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener solicitudes de verificación' },
      { status: 500 }
    )
  }
}

// PUT: Aprobar o rechazar solicitud de verificación
export async function PUT(request: Request) {
  try {
    // Verificar que es admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const body = await request.json()
    const { id, status, rejection_reason, clerk_user_id } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID y status son requeridos' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status debe ser approved o rejected' },
        { status: 400 }
      )
    }

    // Actualizar solicitud de verificación
    const { error: updateError } = await supabaseAdmin
      .from('verification_requests')
      .update({
        status,
        rejection_reason: rejection_reason || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating verification request:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar solicitud' },
        { status: 500 }
      )
    }

    // Si se aprueba, actualizar el perfil del usuario para que sea guía verificado
    if (status === 'approved' && clerk_user_id) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          verified: true,
          user_type: 'guia'  // Cambiar automáticamente a guía al aprobar
        })
        .eq('clerk_user_id', clerk_user_id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        // No retornamos error porque la verificación ya se actualizó
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/admin/verificaciones:', error)
    return NextResponse.json(
      { error: 'Error al actualizar solicitud' },
      { status: 500 }
    )
  }
}
