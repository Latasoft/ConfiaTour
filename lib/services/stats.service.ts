import { supabase } from '../db/supabase'
import { 
  ReservasStats, 
  ExperienciasStats, 
  UsersStats, 
  RevenueStats,
  AdminStats,
  Categoria 
} from '@/types'

export class StatsService {
  /**
   * Obtiene estadísticas de reservas
   */
  async getReservasStats(): Promise<ReservasStats> {
    try {
      // Obtener todas las reservas
      const { data: reservas, error } = await supabase
        .from('reservas')
        .select('estado, precio_total')

      if (error) throw error

      const total = reservas?.length || 0
      const confirmadas = reservas?.filter(r => r.estado === 'confirmada').length || 0
      const canceladas = reservas?.filter(r => r.estado === 'cancelada').length || 0
      const pendientes = reservas?.filter(r => r.estado === 'pendiente_pago').length || 0
      const completadas = reservas?.filter(r => r.estado === 'completada').length || 0

      // Calcular ingresos totales (solo reservas confirmadas y completadas)
      const ingresos_totales = reservas
        ?.filter(r => r.estado === 'confirmada' || r.estado === 'completada')
        .reduce((sum, r) => sum + (r.precio_total || 0), 0) || 0

      const ingreso_promedio = confirmadas + completadas > 0 
        ? ingresos_totales / (confirmadas + completadas) 
        : 0

      return {
        total,
        confirmadas,
        canceladas,
        pendientes,
        completadas,
        ingresos_totales,
        ingreso_promedio,
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de reservas:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de experiencias
   */
  async getExperienciasStats(): Promise<ExperienciasStats> {
    try {
      const { data: experiencias, error } = await supabase
        .from('experiencias')
        .select('disponible, categoria, rating_promedio, id, titulo')

      if (error) throw error

      const total = experiencias?.length || 0
      const activas = experiencias?.filter(e => e.disponible).length || 0
      const inactivas = total - activas

      // Contar por categoría
      const por_categoria: Record<Categoria, number> = {
        turismo: 0,
        gastronomia: 0,
        aventura: 0,
        naturaleza: 0,
        cultura: 0,
        deportes: 0,
        alojamiento: 0,
        transporte: 0,
        tours: 0,
      }

      experiencias?.forEach(exp => {
        if (exp.categoria in por_categoria) {
          por_categoria[exp.categoria as Categoria]++
        }
      })

      // Rating promedio
      const ratings = experiencias?.map(e => e.rating_promedio || 0).filter(r => r > 0) || []
      const rating_promedio = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0

      // Experiencias más reservadas
      const { data: reservasPorExp, error: resError } = await supabase
        .from('reservas')
        .select('experiencia_id, precio_total')
        .in('estado', ['confirmada', 'completada'])

      if (resError) throw resError

      // Agrupar por experiencia
      const expMap = new Map<string, { count: number; ingresos: number }>()
      reservasPorExp?.forEach(r => {
        const current = expMap.get(r.experiencia_id) || { count: 0, ingresos: 0 }
        expMap.set(r.experiencia_id, {
          count: current.count + 1,
          ingresos: current.ingresos + (r.precio_total || 0),
        })
      })

      // Top 5 experiencias más reservadas
      const mas_reservadas = Array.from(expMap.entries())
        .map(([id, data]) => {
          const exp = experiencias?.find(e => e.id === id)
          return {
            id,
            titulo: exp?.titulo || 'Desconocida',
            total_reservas: data.count,
            ingresos: data.ingresos,
          }
        })
        .sort((a, b) => b.total_reservas - a.total_reservas)
        .slice(0, 5)

      return {
        total,
        activas,
        inactivas,
        por_categoria,
        rating_promedio,
        mas_reservadas,
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de experiencias:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getUsersStats(): Promise<UsersStats> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_type, verified')

      if (error) throw error

      const total = profiles?.length || 0
      const viajeros = profiles?.filter(p => p.user_type === 'viajero').length || 0
      const guias = profiles?.filter(p => p.user_type === 'guia').length || 0
      const verificados = profiles?.filter(p => p.verified).length || 0
      const no_verificados = total - verificados

      return {
        total,
        viajeros,
        guias,
        verificados,
        no_verificados,
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de usuarios:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de ingresos
   */
  async getRevenueStats(): Promise<RevenueStats> {
    try {
      const { data: reservas, error } = await supabase
        .from('reservas')
        .select('precio_total, fecha_pago, experiencia_id, experiencias(titulo)')
        .in('estado', ['confirmada', 'completada'])
        .not('fecha_pago', 'is', null)

      if (error) throw error

      const total = reservas?.reduce((sum, r) => sum + (r.precio_total || 0), 0) || 0

      // Ingresos por mes (últimos 12 meses)
      const now = new Date()
      const por_mes: Array<{ mes: string; ingresos: number; reservas: number }> = []

      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const mesNombre = date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
        
        const reservasMes = reservas?.filter(r => {
          if (!r.fecha_pago) return false
          const fechaPago = new Date(r.fecha_pago)
          return fechaPago.getMonth() === date.getMonth() && 
                 fechaPago.getFullYear() === date.getFullYear()
        }) || []

        por_mes.push({
          mes: mesNombre,
          ingresos: reservasMes.reduce((sum, r) => sum + (r.precio_total || 0), 0),
          reservas: reservasMes.length,
        })
      }

      // Ingresos por experiencia (top 10)
      const expMap = new Map<string, { titulo: string; ingresos: number }>()
      
      reservas?.forEach(r => {
        if (!r.experiencia_id) return
        
        const current = expMap.get(r.experiencia_id) || { 
          titulo: (r.experiencias as any)?.titulo || 'Desconocida', 
          ingresos: 0 
        }
        
        expMap.set(r.experiencia_id, {
          ...current,
          ingresos: current.ingresos + (r.precio_total || 0),
        })
      })

      const por_experiencia = Array.from(expMap.entries())
        .map(([experiencia_id, data]) => ({
          experiencia_id,
          titulo: data.titulo,
          ingresos: data.ingresos,
        }))
        .sort((a, b) => b.ingresos - a.ingresos)
        .slice(0, 10)

      return {
        total,
        por_mes,
        por_experiencia,
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de ingresos:', error)
      throw error
    }
  }

  /**
   * Obtiene todas las estadísticas del admin
   */
  async getAllStats(): Promise<AdminStats> {
    try {
      const [reservas, experiencias, usuarios, ingresos] = await Promise.all([
        this.getReservasStats(),
        this.getExperienciasStats(),
        this.getUsersStats(),
        this.getRevenueStats(),
      ])

      return {
        reservas,
        experiencias,
        usuarios,
        ingresos,
      }
    } catch (error) {
      console.error('Error obteniendo todas las estadísticas:', error)
      throw error
    }
  }
}

// Instancia singleton
export const statsService = new StatsService()
