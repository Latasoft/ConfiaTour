import { SupabaseClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '../db/supabase'
import { Reserva, EstadoReserva } from '@/types'
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors'

export class ReservaRepository {
  private client: SupabaseClient

  constructor(client: SupabaseClient = supabaseAdmin) {
    this.client = client
  }

  /**
   * Obtiene todas las reservas de un usuario (excluyendo expiradas)
   */
  async getByUserId(userId: string): Promise<Reserva[]> {
    const { data, error } = await this.client
      .from('reservas')
      .select(`
        *,
        experiencias (
          id,
          titulo,
          descripcion,
          categoria,
          ubicacion,
          precio,
          moneda,
          imagenes,
          duracion
        )
      `)
      .eq('usuario_id', userId)
      .or(`estado.neq.pendiente_pago,and(estado.eq.pendiente_pago,expires_at.gte.${new Date().toISOString()})`)
      .order('fecha_reserva', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Obtiene una reserva por ID
   */
  async getById(id: string): Promise<Reserva> {
    const { data, error } = await this.client
      .from('reservas')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      throw new NotFoundError('Reserva')
    }
    
    return data
  }

  /**
   * Crea una nueva reserva con tiempo de expiración de 5 minutos
   * VERSIÓN ATÓMICA: Usa función SQL con row-level locking para prevenir double booking
   */
  async create(reserva: Partial<Reserva>): Promise<Reserva> {
    // Usar función SQL atómica que previene race conditions
    const { data, error } = await this.client.rpc('create_reserva_atomic', {
      p_experiencia_id: reserva.experiencia_id,
      p_usuario_id: reserva.usuario_id,
      p_fecha_experiencia: reserva.fecha_experiencia,
      p_cantidad_personas: reserva.cantidad_personas,
      p_precio_total: reserva.precio_total,
      p_metodo_pago: reserva.metodo_pago,
      p_buy_order: reserva.buy_order,
      p_session_id: reserva.session_id
    })

    if (error) {
      console.error('[ERROR] Repository: Error en función atómica:', error)
      throw error
    }

    // La función retorna un array con un objeto
    const result = Array.isArray(data) ? data[0] : data

    if (!result || !result.success) {
      console.error('[ERROR] Repository: Capacidad insuficiente:', result?.message)
      throw new ValidationError(result?.message || 'No hay cupos disponibles')
    }

    // Obtener la reserva creada
    const { data: reservaCreada, error: fetchError } = await this.client
      .from('reservas')
      .select('*')
      .eq('id', result.reserva_id)
      .single()

    if (fetchError || !reservaCreada) {
      console.error('[ERROR] Repository: Error obteniendo reserva creada:', fetchError)
      throw fetchError || new Error('No se pudo obtener la reserva creada')
    }
    
    console.log('✅ Repository: Reserva creada atómicamente:', {
      id: reservaCreada.id,
      cupos_restantes: result.disponibles_restantes
    })

    return reservaCreada
  }

  /**
   * Actualiza el estado de una reserva
   */
  async updateStatus(
    id: string,
    estado: EstadoReserva,
    additionalData?: Partial<Reserva>
  ): Promise<Reserva> {
    const updateData: any = {
      estado,
      ...additionalData
    }

    // Agregar fecha de pago si se confirma
    if (estado === 'confirmada' && !updateData.fecha_pago) {
      updateData.fecha_pago = new Date().toISOString()
      updateData.pagado = true
    }

    // Agregar fecha de cancelación si se cancela
    if (estado === 'cancelada' && !updateData.fecha_cancelacion) {
      updateData.fecha_cancelacion = new Date().toISOString()
    }

    const { data, error } = await this.client
      .from('reservas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new NotFoundError('Reserva')
    
    return data
  }

  /**
   * Cancela una reserva
   */
  async cancel(id: string, userId: string): Promise<Reserva> {
    // Verificar que la reserva pertenezca al usuario
    const reserva = await this.getById(id)
    
    if (reserva.usuario_id !== userId) {
      throw new ConflictError('No tienes permiso para cancelar esta reserva')
    }

    if (reserva.estado === 'cancelada') {
      throw new ConflictError('La reserva ya está cancelada')
    }

    return this.updateStatus(id, 'cancelada', {
      fecha_cancelacion: new Date().toISOString()
    })
  }

  /**
   * Limpia reservas pendientes expiradas
   */
  async cleanupExpiredReservas(): Promise<number> {
    const now = new Date().toISOString()
    
    const { data, error } = await this.client
      .from('reservas')
      .update({ 
        estado: 'cancelada' as EstadoReserva,
        fecha_cancelacion: now
      })
      .eq('estado', 'pendiente_pago')
      .lt('expires_at', now)
      .select()

    if (error) {
      console.error('[ERROR] Error limpiando reservas expiradas:', error)
      return 0
    }

    const count = data?.length || 0
    if (count > 0) {
      console.log(`🧹 Limpiadas ${count} reservas expiradas`)
    }
    return count
  }

  /**
   * Verifica si una reserva se puede cancelar
   */
  async canCancel(id: string, userId: string): Promise<boolean> {
    try {
      const reserva = await this.getById(id)
      
      if (reserva.usuario_id !== userId) return false
      if (reserva.estado === 'cancelada') return false
      
      // Verificar que falten al menos 24 horas para la experiencia
      const fechaExperiencia = new Date(reserva.fecha_experiencia)
      const ahora = new Date()
      const horasHasta = (fechaExperiencia.getTime() - ahora.getTime()) / (1000 * 60 * 60)
      
      return horasHasta >= 24
    } catch {
      return false
    }
  }

  /**
   * Obtiene reservas por experiencia
   */
  async getByExperienciaId(experienciaId: string): Promise<Reserva[]> {
    const { data, error } = await this.client
      .from('reservas')
      .select('*')
      .eq('experiencia_id', experienciaId)
      .order('fecha_reserva', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Actualiza detalles de pago de una reserva
   */
  async updatePaymentDetails(
    id: string,
    paymentDetails: {
      codigo_autorizacion?: string
      detalles_pago?: any
    }
  ): Promise<Reserva> {
    const { data, error } = await this.client
      .from('reservas')
      .update(paymentDetails)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new NotFoundError('Reserva')
    
    return data
  }
}
