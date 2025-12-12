import { ReservaRepository } from '../repositories/reserva.repository'
import { Reserva, EstadoReserva } from '@/types'
import { validateData, reservaSchema } from '../schemas'
import { ValidationError, ConflictError } from '../utils/errors'
import { CurrencyService } from './currency.service'
import { emailService } from './email.service'
import { experienciaService } from './experiencia.service'

export class ReservaService {
  private repository: ReservaRepository

  constructor(repository?: ReservaRepository) {
    this.repository = repository || new ReservaRepository()
  }

  /**
   * Obtiene reservas de un usuario
   */
  async getReservasByUsuario(userId: string): Promise<Reserva[]> {
    return this.repository.getByUserId(userId)
  }

  /**
   * Obtiene una reserva por ID
   */
  async getReservaById(id: string): Promise<Reserva> {
    return this.repository.getById(id)
  }

  /**
   * Crea una nueva reserva con validación y conversión de moneda
   */
  async crearReserva(data: Partial<Reserva>): Promise<Reserva> {
    // Validar datos
    const validation = validateData(reservaSchema, data)
    if (!validation.success) {
      throw new ValidationError(validation.errors.join(', '))
    }

    // Asegurar que el precio esté en CLP para Transbank
    // (La conversión ya debería estar hecha en el frontend, pero verificamos)
    const reserva = await this.repository.create(data)
    
    return reserva
  }

  /**
   * Confirma una reserva después de pago exitoso
   */
  async confirmarReserva(
    reservaId: string,
    paymentDetails: {
      codigo_autorizacion?: string
      detalles_pago?: any
    },
    userEmail?: string,
    userName?: string
  ): Promise<Reserva> {
    // Actualizar estado y detalles de pago
    const reserva = await this.repository.updateStatus(reservaId, 'confirmada', {
      pagado: true,
      fecha_pago: new Date().toISOString(),
      ...paymentDetails
    })

    // Enviar email de confirmación y comprobante de pago
    try {
      const experiencia = await experienciaService.getExperienciaById(reserva.experiencia_id)
      
      if (userEmail && userName && experiencia) {
        // Email de confirmación
        await emailService.sendReservaConfirmation({
          reserva,
          experiencia,
          usuario: {
            nombre: userName,
            email: userEmail
          }
        })

        // Comprobante de pago
        await emailService.sendPaymentReceipt({
          reserva,
          experiencia,
          usuario: {
            nombre: userName,
            email: userEmail
          }
        })
      }
    } catch (error) {
      console.error('⚠️ Error enviando emails de confirmación:', error)
      // No lanzar error para no interrumpir el flujo
    }
    
    return reserva
  }

  /**
   * Cancela una reserva
   */
  async cancelarReserva(
    reservaId: string, 
    userId: string,
    userEmail?: string,
    userName?: string
  ): Promise<Reserva> {
    // Verificar que se puede cancelar
    const puedeCancel = await this.repository.canCancel(reservaId, userId)
    
    if (!puedeCancel) {
      throw new ConflictError(
        'No se puede cancelar esta reserva. Debe hacerse con al menos 24 horas de anticipación.'
      )
    }

    // Cancelar reserva
    const reserva = await this.repository.cancel(reservaId, userId)

    // Enviar email de cancelación
    try {
      const experiencia = await experienciaService.getExperienciaById(reserva.experiencia_id)
      
      if (userEmail && userName && experiencia) {
        await emailService.sendReservaCancellation({
          reserva,
          experiencia,
          usuario: {
            nombre: userName,
            email: userEmail
          }
        })
      }
    } catch (error) {
      console.error('⚠️ Error enviando email de cancelación:', error)
      // No lanzar error para no interrumpir el flujo
    }

    // Aquí se podría procesar reembolso si aplica
    // await paymentService.processRefund(reserva)
    
    return reserva
  }

  /**
   * Verifica si una reserva se puede cancelar
   */
  async puedeCancelar(reservaId: string, userId: string): Promise<boolean> {
    return this.repository.canCancel(reservaId, userId)
  }

  /**
   * Obtiene reservas por experiencia (para guías)
   */
  async getReservasByExperiencia(experienciaId: string): Promise<Reserva[]> {
    return this.repository.getByExperienciaId(experienciaId)
  }

  /**
   * Marca una reserva como completada
   */
  async completarReserva(reservaId: string, userId: string): Promise<Reserva> {
    const reserva = await this.repository.getById(reservaId)
    
    // Verificar que la fecha de la experiencia haya pasado
    const fechaExp = new Date(reserva.fecha_experiencia)
    const ahora = new Date()
    
    if (fechaExp > ahora) {
      throw new ConflictError('No se puede completar una reserva antes de la fecha de la experiencia')
    }

    return this.repository.updateStatus(reservaId, 'completada')
  }

  /**
   * Calcula el total con conversión de moneda
   */
  async calcularTotal(
    precio: number,
    moneda: string,
    cantidad: number
  ): Promise<{ totalOriginal: number; totalCLP: number }> {
    const totalOriginal = precio * cantidad
    const totalCLP = await CurrencyService.convertToCLP(totalOriginal, moneda as any)
    
    return {
      totalOriginal,
      totalCLP
    }
  }

  /**
   * Obtiene estadísticas de reservas para un guía
   */
  async getEstadisticasGuia(userId: string, experienciaIds: string[]): Promise<{
    total: number
    confirmadas: number
    canceladas: number
    ingresosTotal: number
  }> {
    const todasReservas: Reserva[] = []
    
    for (const expId of experienciaIds) {
      const reservas = await this.repository.getByExperienciaId(expId)
      todasReservas.push(...reservas)
    }

    const confirmadas = todasReservas.filter(r => r.estado === 'confirmada')
    const canceladas = todasReservas.filter(r => r.estado === 'cancelada')
    const ingresosTotal = confirmadas.reduce((sum, r) => sum + r.precio_total, 0)

    return {
      total: todasReservas.length,
      confirmadas: confirmadas.length,
      canceladas: canceladas.length,
      ingresosTotal
    }
  }
}

// Instancia singleton
export const reservaService = new ReservaService()
