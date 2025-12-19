import { ReservaRepository } from '../repositories/reserva.repository'
import { Reserva, EstadoReserva } from '@/types'
import { validateData, reservaSchema } from '../schemas'
import { ValidationError, ConflictError } from '../utils/errors'
import { CurrencyService } from './currency.service'
import { experienciaService } from './experiencia.service'
import { ExperienciaRepository } from '../repositories/experiencia.repository'

// Import dinámico de emailService solo en servidor
const getEmailService = async () => {
  if (typeof window === 'undefined') {
    const { emailService } = await import('./email.service')
    return emailService
  }
  return null
}

const experienciaRepository = new ExperienciaRepository()

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
    console.log('[DEBUG] Service: Datos recibidos para crear reserva:', JSON.stringify(data, null, 2))
    
    // Validar datos
    const validation = validateData(reservaSchema, data)
    if (!validation.success) {
      console.error('[ERROR] Service: Validación fallida:', validation.errors)
      throw new ValidationError(validation.errors.join(', '))
    }

    console.log('✅ Service: Datos validados:', JSON.stringify(validation.data, null, 2))

    // VALIDACIÓN DE CAPACIDAD DISPONIBLE
    const disponible = await experienciaService.getCapacidadDisponible(
      validation.data.experiencia_id,
      validation.data.fecha_experiencia
    )

    if (validation.data.cantidad_personas > disponible) {
      throw new ValidationError(
        `Solo quedan ${disponible} cupos disponibles para esta fecha. ` +
        `Solicitaste ${validation.data.cantidad_personas} persona${validation.data.cantidad_personas > 1 ? 's' : ''}.`
      )
    }

    // Usar los datos validados (Zod los limpia y transforma)
    const reserva = await this.repository.create(validation.data)
    
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

    // 🚀 OPTIMIZACIÓN: Enviar emails de forma async (no bloquear respuesta)
    this.sendConfirmationEmailsAsync(reserva, userEmail, userName)
      .catch(error => {
        console.error('[ERROR] Error en envío async de emails:', error)
        // No afecta el flujo principal
      })
    
    return reserva
  }

  /**
   * Envía todos los emails de confirmación en background
   * Se ejecuta en paralelo sin bloquear la respuesta al usuario
   */
  private async sendConfirmationEmailsAsync(
    reserva: Reserva,
    userEmail?: string,
    userName?: string
  ): Promise<void> {
    if (!userEmail || !userName) return

    const emailService = await getEmailService()
    if (!emailService) return

    const experiencia = await experienciaService.getExperienciaById(reserva.experiencia_id)
    if (!experiencia) return

    // Ejecutar todos los emails EN PARALELO
    const [confirmResult, receiptResult, providerResult] = await Promise.allSettled([
      // 1. Email de confirmación al usuario
      emailService.sendReservaConfirmation({
        reserva,
        experiencia,
        usuario: {
          nombre: userName,
          email: userEmail
        }
      }),

      // 2. Comprobante de pago al usuario
      emailService.sendPaymentReceipt({
        reserva,
        experiencia,
        usuario: {
          nombre: userName,
          email: userEmail
        }
      }),

      // 3. Notificar al guía/proveedor
      (async () => {
        try {
          const providerInfo = await experienciaRepository.getProviderEmail(reserva.experiencia_id)
          
          if (providerInfo?.email) {
            await emailService.sendNewReservaToProvider(
              providerInfo.email,
              providerInfo.name,
              {
                reserva,
                experiencia,
                usuario: {
                  nombre: userName,
                  email: userEmail
                }
              }
            )
          }
        } catch (error) {
          console.warn('[WARN] Error enviando notificación al guía:', error)
        }
      })()
    ])

    // Log de resultados (opcional, para debugging)
    if (confirmResult.status === 'fulfilled') {
      console.log('✅ Email de confirmación enviado')
    } else {
      console.error('❌ Error en email de confirmación:', confirmResult.reason)
    }

    if (receiptResult.status === 'fulfilled') {
      console.log('✅ Comprobante de pago enviado')
    } else {
      console.error('❌ Error en comprobante:', receiptResult.reason)
    }

    if (providerResult.status === 'fulfilled') {
      console.log('✅ Notificación al proveedor enviada')
    } else {
      console.error('❌ Error en notificación proveedor:', providerResult.reason)
    }
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
      const emailService = await getEmailService()
      const experiencia = await experienciaService.getExperienciaById(reserva.experiencia_id)
      
      if (emailService && userEmail && userName && experiencia) {
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
      console.error('[WARN] Error enviando email de cancelación:', error)
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
