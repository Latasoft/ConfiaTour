import { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../db/supabase'
import { Reserva, EstadoReserva } from '@/types'
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors'

export class ReservaRepository {
  private client: SupabaseClient

  constructor(client: SupabaseClient = supabase) {
    this.client = client
  }

  /**
   * Obtiene todas las reservas de un usuario
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
   * Crea una nueva reserva
   */
  async create(reserva: Partial<Reserva>): Promise<Reserva> {
    const reservaData = {
      ...reserva,
      estado: 'pendiente_pago' as EstadoReserva,
      pagado: false,
      creado_en: new Date().toISOString()
    }

    const { data, error } = await this.client
      .from('reservas')
      .insert([reservaData])
      .select()
      .single()

    if (error) throw error
    if (!data) throw new ValidationError('No se pudo crear la reserva')
    
    return data
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
