import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/auth'
import { experienciaAdminService } from '@/lib/services/experiencia-admin.service'
import { ValidationError, NotFoundError } from '@/lib/utils/errors'

/**
 * GET - Listar todas las experiencias (solo admin)
 * Query params: categoria, disponible, usuario_id
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar permisos de admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { searchParams } = new URL(req.url)
    const categoria = searchParams.get('categoria') || undefined
    const disponibleParam = searchParams.get('disponible')
    const usuario_id = searchParams.get('usuario_id') || undefined

    // Parsear disponible como boolean
    const disponible = disponibleParam === 'true' 
      ? true 
      : disponibleParam === 'false' 
      ? false 
      : undefined

    const filtros = {
      categoria,
      disponible,
      usuario_id,
    }

    const experiencias = await experienciaAdminService.getAllExperiencias(filtros)

    return NextResponse.json({
      success: true,
      data: experiencias,
      count: experiencias.length
    })

  } catch (error: any) {
    console.error('❌ Error en GET /api/admin/experiencias:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error al obtener experiencias' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST - Crear nueva experiencia (solo admin)
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar permisos de admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const body = await req.json()

    // Validar que tenga los campos requeridos
    if (!body.usuario_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'usuario_id es requerido' 
        },
        { status: 400 }
      )
    }

    const experiencia = await experienciaAdminService.crearExperiencia(body)

    console.log(`✅ Admin ${adminCheck.email} creó experiencia ${experiencia.id}`)

    return NextResponse.json({
      success: true,
      data: experiencia,
      message: 'Experiencia creada exitosamente'
    }, { status: 201 })

  } catch (error: any) {
    console.error('❌ Error en POST /api/admin/experiencias:', error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Error al crear experiencia' 
      },
      { status: 500 }
    )
  }
}

/**
 * PUT - Actualizar experiencia completa (solo admin)
 * Body debe incluir: { id, ...campos a actualizar }
 */
export async function PUT(req: NextRequest) {
  try {
    // Verificar permisos de admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID de experiencia requerido' 
        },
        { status: 400 }
      )
    }

    // Si solo se está actualizando disponibilidad, usar método específico
    if (Object.keys(updateData).length === 1 && 'disponible' in updateData) {
      const experiencia = await experienciaAdminService.actualizarDisponibilidad(
        id, 
        updateData.disponible
      )
      
      console.log(`✅ Admin ${adminCheck.email} actualizó disponibilidad de ${id}`)
      
      return NextResponse.json({
        success: true,
        data: experiencia,
        message: 'Disponibilidad actualizada'
      })
    }

    // Actualización completa
    const experiencia = await experienciaAdminService.actualizarExperiencia(id, updateData)

    console.log(`✅ Admin ${adminCheck.email} actualizó experiencia ${id}`)

    return NextResponse.json({
      success: true,
      data: experiencia,
      message: 'Experiencia actualizada exitosamente'
    })

  } catch (error: any) {
    console.error('❌ Error en PUT /api/admin/experiencias:', error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 400 }
      )
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Experiencia no encontrada' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Error al actualizar experiencia' 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Eliminar experiencia (solo admin)
 * Query param: id
 */
export async function DELETE(req: NextRequest) {
  try {
    // Verificar permisos de admin
    const adminCheck = await requireAdmin()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID de experiencia requerido' 
        },
        { status: 400 }
      )
    }

    await experienciaAdminService.eliminarExperiencia(id)

    console.log(`✅ Admin ${adminCheck.email} eliminó experiencia ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Experiencia eliminada exitosamente'
    })

  } catch (error: any) {
    console.error('❌ Error en DELETE /api/admin/experiencias:', error)
    
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Experiencia no encontrada' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Error al eliminar experiencia' 
      },
      { status: 500 }
    )
  }
}
