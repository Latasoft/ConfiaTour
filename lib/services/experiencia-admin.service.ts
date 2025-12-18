import { ExperienciaRepository } from '../repositories/experiencia.repository'
import { Experiencia, FiltrosExperiencias } from '@/types'
import { validateData, experienciaSchema } from '../schemas'
import { ValidationError } from '../utils/errors'
import { parseImagenes } from '../utils/image.utils'
import { supabaseAdmin } from '../db/supabase'

/**
 * Servicio especializado para operaciones administrativas en experiencias.
 * A diferencia del servicio regular, no valida permisos de usuario_id
 * ya que los admin pueden gestionar todas las experiencias.
 * USA supabaseAdmin para bypasear RLS.
 */
export class ExperienciaAdminService {
  private repository: ExperienciaRepository

  constructor(repository?: ExperienciaRepository) {
    // Pasar supabaseAdmin al repository para bypasear RLS
    this.repository = repository || new ExperienciaRepository(supabaseAdmin)
  }

  /**
   * Obtiene todas las experiencias sin filtro de disponibilidad
   * (Admin puede ver experiencias inactivas)
   */
  async getAllExperiencias(filtros?: {
    categoria?: string
    disponible?: boolean
    usuario_id?: string
  }): Promise<Experiencia[]> {
    let query = supabaseAdmin
      .from('experiencias')
      .select('*')
      .order('creado_en', { ascending: false })

    if (filtros?.categoria) {
      query = query.eq('categoria', filtros.categoria)
    }

    if (filtros?.disponible !== undefined) {
      query = query.eq('disponible', filtros.disponible)
    }

    if (filtros?.usuario_id) {
      query = query.eq('usuario_id', filtros.usuario_id)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map(exp => ({
      ...exp,
      imagenes: parseImagenes(exp.imagenes)
    }))
  }

  /**
   * Obtiene una experiencia por ID (sin restricciones)
   */
  async getExperienciaById(id: string): Promise<Experiencia> {
    const experiencia = await this.repository.getById(id)
    
    return {
      ...experiencia,
      imagenes: parseImagenes(experiencia.imagenes)
    }
  }

  /**
   * Crea una nueva experiencia como admin
   * Permite asignar la experiencia a cualquier usuario
   */
  async crearExperiencia(data: Partial<Experiencia>): Promise<Experiencia> {
    // Validar datos básicos (sin usuario_id todavía)
    const validation = validateData(experienciaSchema, {
      titulo: data.titulo,
      descripcion: data.descripcion,
      categoria: data.categoria,
      ubicacion: data.ubicacion,
      precio: data.precio,
      moneda: data.moneda,
      capacidad: data.capacidad,
      duracion: data.duracion,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      imagenes: data.imagenes,
    })

    if (!validation.success) {
      throw new ValidationError(validation.errors.join(', '))
    }

    // Validar usuario_id
    if (!data.usuario_id) {
      throw new ValidationError('usuario_id es requerido')
    }

    // Asegurar que imagenes sea un array
    const experienciaData = {
      ...data,
      imagenes: Array.isArray(data.imagenes) 
        ? data.imagenes 
        : (typeof data.imagenes === 'string' ? [data.imagenes] : []),
      disponible: data.disponible !== undefined ? data.disponible : true,
      rating_promedio: 0,
    }

    return this.repository.create(experienciaData)
  }

  /**
   * Actualiza una experiencia completamente (sin validar propiedad)
   */
  async actualizarExperiencia(
    id: string,
    data: Partial<Experiencia>
  ): Promise<Experiencia> {
    // Validar que la experiencia existe
    await this.repository.getById(id)

    // Si se actualiza alguno de los campos validables, validarlos
    if (data.titulo || data.descripcion || data.categoria || 
        data.precio || data.capacidad || data.duracion) {
      
      const fieldsToValidate: any = {}
      
      if (data.titulo !== undefined) fieldsToValidate.titulo = data.titulo
      if (data.descripcion !== undefined) fieldsToValidate.descripcion = data.descripcion
      if (data.categoria !== undefined) fieldsToValidate.categoria = data.categoria
      if (data.ubicacion !== undefined) fieldsToValidate.ubicacion = data.ubicacion
      if (data.precio !== undefined) fieldsToValidate.precio = data.precio
      if (data.moneda !== undefined) fieldsToValidate.moneda = data.moneda
      if (data.capacidad !== undefined) fieldsToValidate.capacidad = data.capacidad
      if (data.duracion !== undefined) fieldsToValidate.duracion = data.duracion
      if (data.fecha_inicio !== undefined) fieldsToValidate.fecha_inicio = data.fecha_inicio
      if (data.fecha_fin !== undefined) fieldsToValidate.fecha_fin = data.fecha_fin
      if (data.imagenes !== undefined) fieldsToValidate.imagenes = data.imagenes

      const validation = validateData(experienciaSchema.partial(), fieldsToValidate)
      
      if (!validation.success) {
        throw new ValidationError(validation.errors.join(', '))
      }
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

    // Eliminar campos undefined
    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
    )

    return this.repository.update(id, updateData)
  }

  /**
   * Elimina una experiencia (sin validar propiedad)
   */
  async eliminarExperiencia(id: string): Promise<void> {
    // Validar que existe primero
    const { data: existe } = await supabaseAdmin
      .from('experiencias')
      .select('id')
      .eq('id', id)
      .single()

    if (!existe) {
      throw new ValidationError('Experiencia no encontrada')
    }

    console.log('[DEBUG] Eliminando experiencia:', id)

    // Eliminar usando supabaseAdmin para bypasear RLS
    const { data, error } = await supabaseAdmin
      .from('experiencias')
      .delete()
      .eq('id', id)
      .select()

    console.log('[DEBUG] Resultado delete:', { data, error })

    if (error) {
      console.error('[ERROR] Error en delete de BD:', error)
      throw error
    }
  }

  /**
   * Actualiza solo la disponibilidad de una experiencia
   */
  async actualizarDisponibilidad(id: string, disponible: boolean): Promise<Experiencia> {
    return this.repository.update(id, { disponible })
  }

  /**
   * Obtiene estadísticas de experiencias
   */
  async getEstadisticas() {
    const { data, error } = await supabaseAdmin
      .from('experiencias')
      .select('id, disponible, rating_promedio, categoria')

    if (error) throw error

    const experiencias = data || []
    
    return {
      total: experiencias.length,
      activas: experiencias.filter(e => e.disponible).length,
      inactivas: experiencias.filter(e => !e.disponible).length,
      ratingPromedio: experiencias.length > 0
        ? experiencias.reduce((sum, e) => sum + (e.rating_promedio || 0), 0) / experiencias.length
        : 0,
      porCategoria: experiencias.reduce((acc, e) => {
        acc[e.categoria] = (acc[e.categoria] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }
}

// Instancia singleton
export const experienciaAdminService = new ExperienciaAdminService()
