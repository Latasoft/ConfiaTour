/**
 * Cliente API para Reservas
 * Proporciona métodos limpios para interactuar con los endpoints de reservas
 * 
 * @ejemplo
 * import { ReservasAPI } from '@/lib/api/reservas'
 * const reserva = await ReservasAPI.crear({ ... })
 */

import type { Reserva } from '@/types'

export class ReservasAPI {
  /**
   * Crea una nueva reserva
   * El usuario_id se obtiene automáticamente de la sesión de Clerk en el servidor
   */
  static async crear(data: {
    experiencia_id: string
    fecha_experiencia: string
    cantidad_personas: number
    precio_total: number
    metodo_pago: 'transbank' | 'mercadopago'
    buy_order: string
    session_id?: string
  }): Promise<Reserva> {
    const response = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Error creando reserva')
    }

    return result.reserva
  }

  /**
   * Obtiene las reservas del usuario autenticado
   */
  static async obtenerMias(): Promise<Reserva[]> {
    const response = await fetch('/api/reservas')

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error obteniendo reservas')
    }

    const { reservas } = await response.json()
    return reservas
  }

  /**
   * Cancela una reserva
   * Solo el dueño de la reserva puede cancelarla
   * Debe hacerse con al menos 24 horas de anticipación
   */
  static async cancelar(reservaId: string): Promise<Reserva> {
    const response = await fetch(`/api/reservas/${reservaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Error cancelando reserva')
    }

    return result.reserva
  }

  /**
   * Obtiene una reserva específica por ID
   */
  static async obtenerPorId(reservaId: string): Promise<Reserva> {
    const response = await fetch(`/api/reservas/${reservaId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error obteniendo reserva')
    }

    const { reserva } = await response.json()
    return reserva
  }
}
