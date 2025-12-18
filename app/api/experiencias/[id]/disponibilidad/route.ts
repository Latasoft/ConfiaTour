import { NextRequest, NextResponse } from 'next/server'
import { experienciaService } from '@/lib/services/experiencia.service'

/**
 * GET /api/experiencias/[id]/disponibilidad?fecha=YYYY-MM-DD
 * Obtiene la capacidad disponible para una experiencia en una fecha específica
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const fecha = searchParams.get('fecha')

    if (!fecha) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Parámetro "fecha" requerido (formato: YYYY-MM-DD)' 
        },
        { status: 400 }
      )
    }

    // Validar formato de fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!fechaRegex.test(fecha)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Formato de fecha inválido. Usar YYYY-MM-DD' 
        },
        { status: 400 }
      )
    }

    const disponible = await experienciaService.getCapacidadDisponible(
      params.id,
      fecha
    )

    return NextResponse.json({
      success: true,
      disponible,
      fecha,
      experiencia_id: params.id
    })

  } catch (error: any) {
    console.error('Error consultando disponibilidad:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error al consultar disponibilidad' 
      },
      { status: 500 }
    )
  }
}
