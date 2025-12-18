import { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../db/supabase'
import { Experiencia, FiltrosExperiencias } from '@/types'
import { ValidationError, NotFoundError } from '../utils/errors'

export class ExperienciaRepository {
  private client: SupabaseClient

  constructor(client: SupabaseClient = supabase) {
    this.client = client
  }

  /**
   * Obtiene todas las experiencias con filtros opcionales
   */
  async getAll(filtros?: FiltrosExperiencias): Promise<Experiencia[]> {
    let query = this.client
      .from('experiencias')
      .select('*')
      .eq('disponible', true)

    if (filtros?.categoria) {
      query = query.eq('categoria', filtros.categoria)
    }
    
    if (filtros?.ubicacion) {
      query = query.ilike('ubicacion', `%${filtros.ubicacion}%`)
    }
    
    if (filtros?.precioMin) {
      query = query.gte('precio', filtros.precioMin)
    }
    
    if (filtros?.precioMax) {
      query = query.lte('precio', filtros.precioMax)
    }
    
    if (filtros?.fechaInicio) {
      query = query.gte('fecha_inicio', filtros.fechaInicio)
    }
    
    if (filtros?.busqueda) {
      query = query.or(`titulo.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`)
    }

    const { data, error } = await query.order('creado_en', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  /**
   * Obtiene una experiencia por ID
   */
  async getById(id: string): Promise<Experiencia> {
    const { data, error } = await this.client
      .from('experiencias')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      throw new NotFoundError('Experiencia')
    }
    
    return data
  }

  /**
   * Obtiene experiencias por usuario
   */
  async getByUserId(userId: string): Promise<Experiencia[]> {
    const { data, error } = await this.client
      .from('experiencias')
      .select('*')
      .eq('usuario_id', userId)
      .order('creado_en', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  /**
   * Crea una nueva experiencia
   */
  async create(experiencia: Partial<Experiencia>): Promise<Experiencia> {
    const experienciaData = {
      ...experiencia,
      disponible: true,
      rating_promedio: 0,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    }

    const { data, error } = await this.client
      .from('experiencias')
      .insert([experienciaData])
      .select()
      .single()

    if (error) throw error
    if (!data) throw new ValidationError('No se pudo crear la experiencia')
    
    return data
  }

  /**
   * Actualiza una experiencia
   */
  async update(id: string, experiencia: Partial<Experiencia>): Promise<Experiencia> {
    const { data, error } = await this.client
      .from('experiencias')
      .update({
        ...experiencia,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new NotFoundError('Experiencia')
    
    return data
  }

  /**
   * Elimina una experiencia
   */
  async delete(id: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('experiencias')
      .delete()
      .eq('id', id)
      .eq('usuario_id', userId)

    if (error) throw error
  }

  /**
   * Actualiza el rating promedio de una experiencia
   */
  async updateRating(id: string, newRating: number): Promise<void> {
    const { error } = await this.client
      .from('experiencias')
      .update({ rating_promedio: newRating })
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Obtiene el email del proveedor/guía de una experiencia
   */
  async getProviderEmail(experienciaId: string): Promise<{ email: string; name: string } | null> {
    // 1. Obtener la experiencia y su usuario_id
    const { data: experiencia, error: expError } = await this.client
      .from('experiencias')
      .select('usuario_id')
      .eq('id', experienciaId)
      .single()
    
    if (expError || !experiencia) {
      console.error('[ERROR] No se encontró la experiencia:', expError)
      return null
    }

    // 2. Obtener el email del perfil usando clerk_user_id
    const { data: profile, error: profileError } = await this.client
      .from('profiles')
      .select('email, full_name')
      .eq('clerk_user_id', experiencia.usuario_id)
      .single()
    
    if (profileError || !profile) {
      console.error('[ERROR] No se encontró el perfil del usuario:', profileError)
      return null
    }

    return {
      email: profile.email,
      name: profile.full_name || 'Guía'
    }
  }
}
