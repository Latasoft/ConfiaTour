import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'

/**
 * ENDPOINT DE DIAGNÓSTICO - Ver exactamente qué reservas existen
 * GET /api/debug/disponibilidad?experiencia_id=XXX&fecha=YYYY-MM-DD
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const experienciaId = searchParams.get('experiencia_id')
    const fecha = searchParams.get('fecha')

    if (!experienciaId || !fecha) {
      return NextResponse.json(
        { error: 'Parámetros experiencia_id y fecha requeridos' },
        { status: 400 }
      )
    }

    // 1. Obtener capacidad total
    const { data: experiencia } = await supabaseAdmin
      .from('experiencias')
      .select('capacidad, titulo')
      .eq('id', experienciaId)
      .single()

    // 2. Obtener TODAS las reservas para esa experiencia/fecha (sin filtros)
    const { data: todasReservas } = await supabaseAdmin
      .from('reservas')
      .select('*')
      .eq('experiencia_id', experienciaId)
      .filter('fecha_experiencia', 'eq', fecha)

    const now = new Date().toISOString()

    // 3. Analizar cada reserva
    const analisis = todasReservas?.map(r => {
      const deberiaContar = (
        (r.estado === 'confirmada') ||
        (r.pagado === true) ||
        (r.estado === 'pendiente_pago' && r.expires_at >= now)
      ) && r.estado !== 'cancelada'

      return {
        id: r.id,
        cantidad_personas: r.cantidad_personas,
        estado: r.estado,
        pagado: r.pagado,
        expires_at: r.expires_at,
        fecha_experiencia: r.fecha_experiencia,
        creado_en: r.creado_en,
        // Análisis
        deberia_contar: deberiaContar,
        razon_no_cuenta: !deberiaContar ? [
          r.estado === 'cancelada' ? 'CANCELADA' : null,
          r.estado !== 'confirmada' && !r.pagado && r.estado !== 'pendiente_pago' ? 'ESTADO_NO_VALIDO' : null,
          r.estado === 'pendiente_pago' && r.expires_at < now ? 'EXPIRADA' : null
        ].filter(Boolean).join(', ') : null
      }
    }) || []

    const personasQueCuentan = analisis
      .filter(a => a.deberia_contar)
      .reduce((sum, a) => sum + a.cantidad_personas, 0)

    const disponible = Math.max(0, (experiencia?.capacidad || 0) - personasQueCuentan)

    // 4. Query con el filtro actual (para comparar)
    const { data: reservasFiltradas } = await supabaseAdmin
      .from('reservas')
      .select('id, cantidad_personas, estado, pagado, fecha_experiencia, expires_at')
      .eq('experiencia_id', experienciaId)
      .filter('fecha_experiencia', 'eq', fecha)
      .neq('estado', 'cancelada')
      .or(`estado.eq.confirmada,and(estado.eq.pendiente_pago,expires_at.gte.${now}),pagado.eq.true`)

    const personasConQuery = reservasFiltradas?.reduce(
      (sum, r) => sum + r.cantidad_personas,
      0
    ) || 0

    return NextResponse.json({
      experiencia: {
        id: experienciaId,
        titulo: experiencia?.titulo,
        capacidad_total: experiencia?.capacidad
      },
      fecha,
      fecha_hora_servidor: now,
      
      // Todas las reservas sin filtros
      total_reservas_en_bd: todasReservas?.length || 0,
      todas_reservas: analisis,
      
      // Cálculo manual
      calculo_manual: {
        personas_que_deberian_contar: personasQueCuentan,
        disponible: disponible
      },
      
      // Query actual
      query_actual: {
        reservas_encontradas: reservasFiltradas?.length || 0,
        reservas_detalle: reservasFiltradas,
        personas_contadas: personasConQuery,
        disponible: Math.max(0, (experiencia?.capacidad || 0) - personasConQuery)
      },
      
      // Comparación
      discrepancia: personasQueCuentan !== personasConQuery,
      diferencia: personasQueCuentan - personasConQuery
    })

  } catch (error: any) {
    console.error('Error en debug:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
