import { emailService } from '@/lib/services/email.service'
import nodemailer from 'nodemailer'

// Mock de nodemailer
jest.mock('nodemailer')

// Mock de supabase
jest.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: null, error: null })
    }))
  }
}))

describe('Email Service - Sistema de Retry', () => {
  let mockTransporter: any
  let mockSendMail: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock del transporter de nodemailer
    mockSendMail = jest.fn()
    mockTransporter = {
      sendMail: mockSendMail
    }
    
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter)
  })

  describe('Retry Automático', () => {
    it('debe enviar email exitosamente en el primer intento', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: '123' })

      const emailData = {
        reserva: {
          id: 'reserva-1',
          cantidad_personas: 2,
          precio_total: 50000,
          fecha_experiencia: '2025-12-25',
          metodo_pago: 'transbank',
          estado: 'confirmada',
          pagado: true
        },
        experiencia: {
          id: 'exp-1',
          titulo: 'Tour Valparaíso',
          ubicacion: 'Valparaíso',
          categoria: 'tours',
          duracion: '4 horas'
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com'
        }
      }

      await emailService.sendReservaConfirmation(emailData as any)

      expect(mockSendMail).toHaveBeenCalledTimes(1)
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'juan@example.com',
          subject: expect.stringContaining('Reserva Confirmada')
        })
      )
    })

    it('debe reintentar hasta 3 veces si falla', async () => {
      // Simular 2 fallos y luego éxito
      mockSendMail
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockResolvedValueOnce({ messageId: '123' })

      const emailData = {
        reserva: {
          id: 'reserva-1',
          cantidad_personas: 2,
          precio_total: 50000,
          fecha_experiencia: '2025-12-25',
          metodo_pago: 'transbank',
          estado: 'confirmada',
          pagado: true
        },
        experiencia: {
          id: 'exp-1',
          titulo: 'Tour Valparaíso',
          ubicacion: 'Valparaíso',
          categoria: 'tours',
          duracion: '4 horas'
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com'
        }
      }

      await emailService.sendReservaConfirmation(emailData as any)

      // Debe haber intentado 3 veces
      expect(mockSendMail).toHaveBeenCalledTimes(3)
    }, 10000) // Timeout mayor por los delays

    it('debe guardar en failed_emails después de 3 fallos', async () => {
      const { supabase } = require('@/lib/db/supabase')
      
      // Simular 3 fallos consecutivos
      mockSendMail
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockRejectedValueOnce(new Error('SMTP error'))

      const emailData = {
        reserva: {
          id: 'reserva-1',
          cantidad_personas: 2,
          precio_total: 50000,
          fecha_experiencia: '2025-12-25',
          metodo_pago: 'transbank',
          estado: 'confirmada',
          pagado: true
        },
        experiencia: {
          id: 'exp-1',
          titulo: 'Tour Valparaíso',
          ubicacion: 'Valparaíso',
          categoria: 'tours',
          duracion: '4 horas'
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com'
        }
      }

      await emailService.sendReservaConfirmation(emailData as any)

      // Verificar que se intentó 3 veces
      expect(mockSendMail).toHaveBeenCalledTimes(3)

      // Verificar que se guardó en failed_emails
      expect(supabase.from).toHaveBeenCalledWith('failed_emails')
    }, 15000)

    it('no debe bloquear el flujo si todos los reintentos fallan', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'))

      const emailData = {
        reserva: {
          id: 'reserva-1',
          cantidad_personas: 2,
          precio_total: 50000,
          fecha_experiencia: '2025-12-25',
          metodo_pago: 'transbank',
          estado: 'confirmada',
          pagado: true
        },
        experiencia: {
          id: 'exp-1',
          titulo: 'Tour Valparaíso',
          ubicacion: 'Valparaíso',
          categoria: 'tours',
          duracion: '4 horas'
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com'
        }
      }

      // No debe lanzar error
      await expect(
        emailService.sendReservaConfirmation(emailData as any)
      ).resolves.not.toThrow()

      expect(mockSendMail).toHaveBeenCalledTimes(3)
    }, 15000)
  })

  describe('Exponential Backoff', () => {
    it('debe esperar tiempos crecientes entre reintentos', async () => {
      const delays: number[] = []
      const startTimes: number[] = []

      mockSendMail.mockImplementation(async () => {
        startTimes.push(Date.now())
        throw new Error('Test error')
      })

      const emailData = {
        reserva: {
          id: 'reserva-1',
          cantidad_personas: 2,
          precio_total: 50000,
          fecha_experiencia: '2025-12-25',
          metodo_pago: 'transbank',
          estado: 'confirmada',
          pagado: true
        },
        experiencia: {
          id: 'exp-1',
          titulo: 'Tour Valparaíso',
          ubicacion: 'Valparaíso',
          categoria: 'tours',
          duracion: '4 horas'
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com'
        }
      }

      await emailService.sendReservaConfirmation(emailData as any)

      // Calcular delays entre intentos
      for (let i = 1; i < startTimes.length; i++) {
        delays.push(startTimes[i] - startTimes[i - 1])
      }

      // Verificar que cada delay es mayor o igual al anterior
      // (exponential backoff)
      expect(delays.length).toBe(2) // 2 delays (entre 3 intentos)
      expect(delays[0]).toBeGreaterThanOrEqual(800) // ~1s con margen
      expect(delays[1]).toBeGreaterThanOrEqual(1500) // ~2s con margen
    }, 15000)
  })

  describe('Comprobante de Pago con Retry', () => {
    it('debe enviar comprobante con retry', async () => {
      mockSendMail
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({ messageId: '456' })

      const emailData = {
        reserva: {
          id: 'reserva-1',
          cantidad_personas: 2,
          precio_total: 50000,
          fecha_experiencia: '2025-12-25',
          metodo_pago: 'transbank',
          estado: 'confirmada',
          pagado: true,
          fecha_pago: new Date().toISOString(),
          codigo_autorizacion: 'AUTH123'
        },
        experiencia: {
          id: 'exp-1',
          titulo: 'Tour Valparaíso',
          ubicacion: 'Valparaíso',
          categoria: 'tours',
          duracion: '4 horas'
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com'
        }
      }

      await emailService.sendPaymentReceipt(emailData as any)

      expect(mockSendMail).toHaveBeenCalledTimes(2)
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Comprobante')
        })
      )
    }, 10000)
  })

  describe('Cancelación con Retry', () => {
    it('debe enviar email de cancelación con retry', async () => {
      // Primer email (usuario) falla una vez, luego éxito
      // Segundo email (admin) éxito directo
      mockSendMail
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ messageId: '789' })
        .mockResolvedValueOnce({ messageId: '790' })

      const emailData = {
        reserva: {
          id: 'reserva-1',
          cantidad_personas: 2,
          precio_total: 50000,
          fecha_experiencia: '2025-12-25',
          metodo_pago: 'transbank',
          estado: 'cancelada',
          pagado: true,
          fecha_cancelacion: new Date().toISOString()
        },
        experiencia: {
          id: 'exp-1',
          titulo: 'Tour Valparaíso',
          ubicacion: 'Valparaíso',
          categoria: 'tours',
          duracion: '4 horas'
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com'
        }
      }

      await emailService.sendReservaCancellation(emailData as any)

      // 3 llamadas: 1 fallo + 1 éxito (usuario) + 1 éxito (admin)
      expect(mockSendMail).toHaveBeenCalledTimes(3)
    }, 10000)
  })

  describe('Logging de Emails Fallidos', () => {
    it('debe guardar detalles completos en failed_emails', async () => {
      const { supabase } = require('@/lib/db/supabase')
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null })
      
      supabase.from.mockReturnValue({
        insert: mockInsert
      })

      mockSendMail.mockRejectedValue(new Error('SMTP connection failed'))

      const emailData = {
        reserva: {
          id: 'reserva-123',
          cantidad_personas: 2,
          precio_total: 50000,
          fecha_experiencia: '2025-12-25',
          metodo_pago: 'transbank',
          estado: 'confirmada',
          pagado: true
        },
        experiencia: {
          id: 'exp-456',
          titulo: 'Tour Valparaíso',
          ubicacion: 'Valparaíso',
          categoria: 'tours',
          duracion: '4 horas'
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com'
        }
      }

      await emailService.sendReservaConfirmation(emailData as any)

      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          email_type: 'confirmacion',
          reserva_id: 'reserva-123',
          recipient_email: 'juan@example.com',
          recipient_name: 'Juan Pérez',
          experiencia_id: 'exp-456',
          error_message: 'SMTP connection failed',
          retry_count: 3
        })
      ])
    }, 15000)
  })
})
