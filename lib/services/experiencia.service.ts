import { ExperienciaRepository } from '../repositories/experiencia.repository'
import { Experiencia, FiltrosExperiencias } from '@/types'
import { validateData, experienciaCreateSchema, filtrosSchema } from '../schemas'
import { ValidationError } from '../utils/errors'
import { parseImagenes } from '../utils/image.utils'

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
}

// Instancia singleton para usar en toda la app
export const experienciaService = new ExperienciaService()
