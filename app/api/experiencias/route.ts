import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { experienciaService } from '@/lib/services/experiencia.service'
import { getUserType, isGuiaVerificado } from '@/lib/utils/auth'
import { ensureUserProfile } from '@/lib/utils/profile'
import { ValidationError } from '@/lib/utils/errors'

/**
 * POST - Crear nueva experiencia (solo guías)
 * A diferencia de /api/admin/experiencias, este valida que el usuario sea guía
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticación
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No autorizado. Debes iniciar sesión.' 
        },
        { status: 401 }
      )
    }

    // 2. Asegurar que el perfil existe
    await ensureUserProfile(userId)

    // 3. Verificar que el usuario sea guía
    const userType = await getUserType(userId)
    
    if (!userType) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Perfil de usuario no encontrado. Por favor, recarga la página e intenta nuevamente.' 
        },
        { status: 403 }
      )
    }

    if (userType !== 'guia' && userType !== 'admin') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los guías pueden crear experiencias. Solicita verificación como guía en tu perfil.',
          userType 
        },
        { status: 403 }
      )
    }

    // 3. Opcional: Verificar que el guía esté verificado (comentado por ahora)
    // const esVerificado = await isGuiaVerificado(userId)
    // if (!esVerificado) {
    //   return NextResponse.json(
    //     { 
    //       success: false,
    //       error: 'Debes estar verificado como guía para crear experiencias. Solicita verificación en tu perfil.' 
    //     },
    //     { status: 403 }
    //   )
    // }

    // 4. Obtener datos del body
    const body = await req.json()

    // 5. Asegurarse que usuario_id sea el del usuario autenticado
    const experienciaData = {
      ...body,
      usuario_id: userId // Forzar que sea el usuario autenticado
    }

    // 6. Crear experiencia usando el servicio
    const experiencia = await experienciaService.crearExperiencia(experienciaData)

    console.log(`✅ Guía ${userId} creó experiencia ${experiencia.id}`)

    return NextResponse.json({
      success: true,
      data: experiencia,
      message: 'Experiencia creada exitosamente'
    }, { status: 201 })

  } catch (error: any) {
    console.error('[ERROR] Error en POST /api/experiencias:', error)
    
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
        error: error.message || 'Error al crear experiencia' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET - Obtener experiencias del usuario autenticado
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

    const experiencias = await experienciaService.getExperienciasByUsuario(userId)

    return NextResponse.json({
      success: true,
      data: experiencias,
      count: experiencias.length
    })

  } catch (error: any) {
    console.error('[ERROR] Error en GET /api/experiencias:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al obtener experiencias' 
      },
      { status: 500 }
    )
  }
}

/**
 * PUT - Actualizar experiencia propia
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

    // El servicio valida que la experiencia pertenezca al usuario
    const experiencia = await experienciaService.actualizarExperiencia(
      id,
      userId,
      updateData
    )

    console.log(`✅ Usuario ${userId} actualizó experiencia ${id}`)

    return NextResponse.json({
      success: true,
      data: experiencia,
      message: 'Experiencia actualizada exitosamente'
    })

  } catch (error: any) {
    console.error('[ERROR] Error en PUT /api/experiencias:', error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: error.message.includes('permiso') ? 403 : 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error al actualizar experiencia' 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Eliminar experiencia propia
 */
export async function DELETE(req: NextRequest) {
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

    // El servicio valida que la experiencia pertenezca al usuario
    await experienciaService.eliminarExperiencia(id, userId)

    console.log(`✅ Usuario ${userId} eliminó experiencia ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Experiencia eliminada exitosamente'
    })

  } catch (error: any) {
    console.error('[ERROR] Error en DELETE /api/experiencias:', error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error al eliminar experiencia' 
      },
      { status: 500 }
    )
  }
}
