import { ExperienciaRepository } from '../repositories/experiencia.repository'
import { Experiencia, FiltrosExperiencias } from '@/types'
import { validateData, experienciaCreateSchema, filtrosSchema } from '../schemas'
import { ValidationError } from '../utils/errors'
import { parseImagenes } from '../utils/image.utils'
import { supabaseAdmin } from '../db/supabase' // Usar admin para bypasear RLS

export class ExperienciaService {
  private repository: ExperienciaRepository

  constructor(repository?: ExperienciaRepository) {
    this.repository = repository || new ExperienciaRepository()
  }

  /**
   * Obtiene experiencias con filtros validados
   */
  async getExperiencias(filtros?: FiltrosExperiencias): Promise<Experiencia[]> {
    // Validar filtros si existen
    if (filtros) {
      const validation = validateData(filtrosSchema, filtros)
      if (!validation.success) {
        throw new ValidationError(validation.errors.join(', '))
      }
    }

    const experiencias = await this.repository.getAll(filtros)
    
    // Parsear imágenes antes de devolver
    return experiencias.map(exp => ({
      ...exp,
      imagenes: parseImagenes(exp.imagenes)
    }))
  }

  /**
   * Obtiene una experiencia por ID
   */
  async getExperienciaById(id: string): Promise<Experiencia> {
    const experiencia = await this.repository.getById(id)
    
    return {
      ...experiencia,
      imagenes: parseImagenes(experiencia.imagenes)
    }
  }

  /**
   * Obtiene experiencias de un usuario
   */
  async getExperienciasByUsuario(userId: string): Promise<Experiencia[]> {
    const experiencias = await this.repository.getByUserId(userId)
    
    return experiencias.map(exp => ({
      ...exp,
      imagenes: parseImagenes(exp.imagenes)
    }))
  }

  /**
   * Crea una nueva experiencia con validación
   */
  async crearExperiencia(data: Partial<Experiencia>): Promise<Experiencia> {
    // Validar datos
    const validation = validateData(experienciaCreateSchema, data)
    if (!validation.success) {
      throw new ValidationError(validation.errors.join(', '))
    }

    // Asegurar que imagenes sea un array
    const experienciaData = {
      ...data,
      imagenes: Array.isArray(data.imagenes) 
        ? data.imagenes 
        : (typeof data.imagenes === 'string' ? [data.imagenes] : [])
    }

    return this.repository.create(experienciaData)
  }

  /**
   * Actualiza una experiencia
   */
  async actualizarExperiencia(
    id: string,
    userId: string,
    data: Partial<Experiencia>
  ): Promise<Experiencia> {
    // Verificar que pertenezca al usuario
    const experiencia = await this.repository.getById(id)
    
    if (experiencia.usuario_id !== userId) {
      throw new ValidationError('No tienes permiso para editar esta experiencia')
    }

    // Asegurar que imagenes sea un array si está presente
    const updateData = {
      ...data,
      imagenes: data.imagenes 
        ? (Array.isArray(data.imagenes) 
            ? data.imagenes 
            : (typeof data.imagenes === 'string' ? [data.imagenes] : undefined))
        : undefined
    }

    return this.repository.update(id, updateData)
  }

  /**
   * Elimina una experiencia
   */
  async eliminarExperiencia(id: string, userId: string): Promise<void> {
    await this.repository.delete(id, userId)
  }

  /**
   * Recalcula y actualiza el rating de una experiencia
   */
  async recalcularRating(experienciaId: string, resenas: Array<{ rating: number }>): Promise<void> {
    if (resenas.length === 0) {
      await this.repository.updateRating(experienciaId, 0)
      return
    }

    const totalRating = resenas.reduce((sum, resena) => sum + resena.rating, 0)
    const avgRating = totalRating / resenas.length
    
    await this.repository.updateRating(experienciaId, Math.round(avgRating * 10) / 10)
  }

  /**
   * Busca experiencias por texto
   */
  async buscarExperiencias(query: string): Promise<Experiencia[]> {
    return this.getExperiencias({ busqueda: query })
  }

  /**
   * Obtiene experiencias destacadas (mejor rating)
   */
  async getExperienciasDestacadas(limit: number = 6): Promise<Experiencia[]> {
    const experiencias = await this.repository.getAll()
    
    return experiencias
      .sort((a, b) => (b.rating_promedio || 0) - (a.rating_promedio || 0))
      .slice(0, limit)
      .map(exp => ({
        ...exp,
        imagenes: parseImagenes(exp.imagenes)
      }))
  }

  /**
   * Calcula la capacidad disponible para una experiencia en una fecha específica
   * Resta las reservas confirmadas/pendientes de la capacidad total
   */
  async getCapacidadDisponible(
    experienciaId: string, 
    fecha: string
  ): Promise<number> {
    // 🚀 OPTIMIZACIÓN: Limpieza on-demand de reservas expiradas
    // Ejecutar ANTES de calcular disponibilidad para asegurar datos actualizados
    await this.cleanupExpiredForExperience(experienciaId, fecha)

    // 1. Obtener capacidad total de la experiencia
    const experiencia = await this.repository.getById(experienciaId)
    const capacidadTotal = experiencia.capacidad

    const now = new Date().toISOString()

    // 2. Sumar personas ya reservadas para esa fecha
    // Incluir: confirmadas, pendiente_pago NO expiradas, o cualquier reserva pagada
    // IMPORTANTE: neq debe ir ANTES de or() para que se aplique correctamente
    // CRÍTICO: Usar cast para comparar DATE correctamente (no timestamp)
    // CRÍTICO: Usar supabaseAdmin para bypasear RLS (esta es operación interna)
    const { data: reservas, error } = await supabaseAdmin
      .from('reservas')
      .select('id, cantidad_personas, estado, pagado, fecha_experiencia, expires_at, creado_en')
      .eq('experiencia_id', experienciaId)
      .filter('fecha_experiencia', 'eq', fecha) // ✅ Usar filter para DATE
      .neq('estado', 'cancelada') // ✅ Excluir canceladas ANTES del OR
      .or(`estado.eq.confirmada,and(estado.eq.pendiente_pago,expires_at.gte.${now}),pagado.eq.true`)

    if (error) {
      console.error('❌ Error consultando reservas:', error)
      throw new Error('Error al calcular capacidad disponible')
    }

    const personasReservadas = reservas?.reduce(
      (total, r) => total + r.cantidad_personas, 
      0
    ) || 0

    // 3. Retornar cupos disponibles (nunca negativo)
    const disponible = Math.max(0, capacidadTotal - personasReservadas)
    
    return disponible
  }

  /**
   * Limpia reservas expiradas para una experiencia/fecha específica
   * Más eficiente que limpiar todas las reservas
   * Se ejecuta automáticamente antes de consultar disponibilidad
   */
  private async cleanupExpiredForExperience(
    experienciaId: string,
    fecha: string
  ): Promise<void> {
    const now = new Date().toISOString()
    
    try {
      const { data, error } = await supabaseAdmin
        .from('reservas')
        .update({ 
          estado: 'cancelada',
          fecha_cancelacion: now
        })
        .eq('experiencia_id', experienciaId)
        .eq('fecha_experiencia', fecha)
        .eq('estado', 'pendiente_pago')
        .lt('expires_at', now)
        .select()

      if (error) {
        console.warn('[WARN] Error en limpieza on-demand:', error)
        // No lanzar error, continuar con el flujo
        return
      }

      const count = data?.length || 0
      if (count > 0) {
        console.log(`🧹 Limpieza on-demand: ${count} reserva(s) expirada(s) cancelada(s)`)
      }
    } catch (error) {
      console.warn('[WARN] Error ejecutando limpieza on-demand:', error)
      // No interrumpir el flujo principal
    }
  }
}

// Instancia singleton para usar en toda la app
export const experienciaService = new ExperienciaService()
