import { EmailService } from '@/lib/services/email.service'
import nodemailer from 'nodemailer'

// Mock Nodemailer
jest.mock('nodemailer')

describe('EmailService', () => {
  let emailService: EmailService
  let mockSendMail: jest.Mock

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-email-id' })
    
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    })

    emailService = new EmailService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('sendReservaConfirmation', () => {
    it('should send confirmation email with correct data', async () => {
      const reservaData = {
        reserva: {
          id: 'res-123',
          fecha_experiencia: '2024-12-25',
          cantidad_personas: 2,
          precio_total: 50000,
          metodo_pago: 'transbank',
          codigo_autorizacion: 'AUTH123',
        },
        experiencia: {
          titulo: 'Tour por Santiago',
          ubicacion: 'Santiago Centro',
          categoria: 'turismo',
          duracion: '3 horas',
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
        },
      }

      await emailService.sendReservaConfirmation(reservaData as any)

      expect(mockSendMail).toHaveBeenCalledTimes(1)
      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: reservaData.usuario.email,
        subject: expect.stringContaining('Confirmada'),
        html: expect.stringContaining(reservaData.experiencia.titulo),
      })
    })

    it('should handle email sending errors gracefully', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('Email service error'))

      const reservaData = {
        reserva: {
          id: 'res-123',
          fecha_experiencia: '2024-12-25',
          cantidad_personas: 2,
          precio_total: 50000,
          metodo_pago: 'transbank',
        },
        experiencia: {
          titulo: 'Tour por Santiago',
          ubicacion: 'Santiago Centro',
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
        },
      }

      // El servicio no debe lanzar errores
      await expect(emailService.sendReservaConfirmation(reservaData as any)).resolves.not.toThrow()
    })
  })

  describe('sendReservaCancellation', () => {
    it('should send cancellation email', async () => {
      const cancelData = {
        reserva: {
          id: 'res-123',
          fecha_experiencia: '2024-12-25',
          cantidad_personas: 2,
          precio_total: 50000,
          metodo_pago: 'transbank',
        },
        experiencia: {
          titulo: 'Tour por Santiago',
          ubicacion: 'Santiago Centro',
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
        },
      }

      await emailService.sendReservaCancellation(cancelData as any)

      // Debería enviar 2 emails: uno al usuario y otro al admin
      expect(mockSendMail).toHaveBeenCalledTimes(2)
      expect(mockSendMail).toHaveBeenNthCalledWith(1, {
        from: expect.any(String),
        to: cancelData.usuario.email,
        subject: expect.stringContaining('Cancelada'),
        html: expect.stringContaining(cancelData.experiencia.titulo),
      })
    })
  })

  describe('sendPaymentReceipt', () => {
    it('should send payment receipt email', async () => {
      const receiptData = {
        reserva: {
          id: 'res-123',
          fecha_experiencia: '2024-12-25',
          cantidad_personas: 2,
          precio_total: 50000,
          metodo_pago: 'transbank',
          codigo_autorizacion: 'TBK-123456',
          fecha_pago: '2024-12-01',
        },
        experiencia: {
          titulo: 'Tour por Santiago',
          ubicacion: 'Santiago Centro',
          categoria: 'turismo',
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
        },
      }

      await emailService.sendPaymentReceipt(receiptData as any)

      expect(mockSendMail).toHaveBeenCalledTimes(1)
      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: receiptData.usuario.email,
        subject: expect.stringContaining('Comprobante'),
        html: expect.stringContaining('TBK-123456'),
      })
    })
  })

  describe('sendNewReservaToProvider', () => {
    it('should send notification to provider', async () => {
      const providerEmail = 'maria@example.com'
      const providerName = 'María López'
      const reservaData = {
        reserva: {
          id: 'res-123',
          fecha_experiencia: '2024-12-25',
          cantidad_personas: 2,
          precio_total: 50000,
        },
        experiencia: {
          titulo: 'Tour por Santiago',
          ubicacion: 'Santiago Centro',
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
        },
      }

      await emailService.sendNewReservaToProvider(providerEmail, providerName, reservaData as any)

      expect(mockSendMail).toHaveBeenCalledTimes(1)
      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: providerEmail,
        subject: expect.stringContaining('Nueva Reserva'),
        html: expect.stringContaining('Juan Pérez'),
      })
    })
  })

  describe('HTML generation', () => {
    it('should generate HTML with proper structure', async () => {
      const reservaData = {
        reserva: {
          id: 'res-123',
          fecha_experiencia: '2024-12-25',
          cantidad_personas: 2,
          precio_total: 50000,
          metodo_pago: 'transbank',
        },
        experiencia: {
          titulo: 'Tour por Santiago',
          ubicacion: 'Santiago Centro',
          categoria: 'turismo',
          duracion: '3 horas',
        },
        usuario: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
        },
      }

      await emailService.sendReservaConfirmation(reservaData as any)

      const htmlContent = mockSendMail.mock.calls[0][0].html

      expect(htmlContent).toContain('<!DOCTYPE html>')
      expect(htmlContent).toContain('<html')
      expect(htmlContent).toContain('ConfiaTour')
      expect(htmlContent).toContain(reservaData.experiencia.titulo)
      expect(htmlContent).toContain(reservaData.reserva.id)
    })
  })
})
