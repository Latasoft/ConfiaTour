import { EmailService } from '@/lib/services/email.service'
import { Resend } from 'resend'

// Mock Resend
jest.mock('resend')

describe('EmailService', () => {
  let emailService: EmailService
  let mockSend: jest.Mock

  beforeEach(() => {
    mockSend = jest.fn().mockResolvedValue({ id: 'test-email-id' })
    ;(Resend as jest.MockedClass<typeof Resend>).mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    } as any))

    emailService = new EmailService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('sendReservaConfirmation', () => {
    it('should send confirmation email with correct data', async () => {
      const reservaData = {
        reservaId: 'res-123',
        userName: 'Juan Pérez',
        userEmail: 'juan@example.com',
        experienciaTitulo: 'Tour por Santiago',
        fechaExperiencia: '2024-12-25',
        cantidadPersonas: 2,
        precioTotal: 50000,
        moneda: 'CLP' as const,
      }

      await emailService.sendReservaConfirmation(reservaData)

      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledWith({
        from: expect.any(String),
        to: reservaData.userEmail,
        subject: expect.stringContaining('Confirmación'),
        html: expect.stringContaining(reservaData.experienciaTitulo),
      })
    })

    it('should handle email sending errors', async () => {
      mockSend.mockRejectedValueOnce(new Error('Email service error'))

      const reservaData = {
        reservaId: 'res-123',
        userName: 'Juan Pérez',
        userEmail: 'juan@example.com',
        experienciaTitulo: 'Tour por Santiago',
        fechaExperiencia: '2024-12-25',
        cantidadPersonas: 2,
        precioTotal: 50000,
        moneda: 'CLP' as const,
      }

      await expect(emailService.sendReservaConfirmation(reservaData)).rejects.toThrow(
        'Email service error'
      )
    })
  })

  describe('sendReservaCancellation', () => {
    it('should send cancellation email', async () => {
      const cancelData = {
        reservaId: 'res-123',
        userName: 'Juan Pérez',
        userEmail: 'juan@example.com',
        experienciaTitulo: 'Tour por Santiago',
        fechaExperiencia: '2024-12-25',
        moneda: 'CLP' as const,
      }

      await emailService.sendReservaCancellation(cancelData)

      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledWith({
        from: expect.any(String),
        to: cancelData.userEmail,
        subject: expect.stringContaining('Cancelación'),
        html: expect.stringContaining(cancelData.experienciaTitulo),
      })
    })
  })

  describe('sendPaymentReceipt', () => {
    it('should send payment receipt email', async () => {
      const receiptData = {
        reservaId: 'res-123',
        userName: 'Juan Pérez',
        userEmail: 'juan@example.com',
        experienciaTitulo: 'Tour por Santiago',
        fechaPago: '2024-12-01',
        monto: 50000,
        moneda: 'CLP' as const,
        metodoPago: 'Transbank' as const,
        numeroTransaccion: 'TBK-123456',
      }

      await emailService.sendPaymentReceipt(receiptData)

      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledWith({
        from: expect.any(String),
        to: receiptData.userEmail,
        subject: expect.stringContaining('Comprobante'),
        html: expect.stringContaining(receiptData.numeroTransaccion),
      })
    })
  })

  describe('sendNewReservaToProvider', () => {
    it('should send notification to provider', async () => {
      const providerData = {
        providerName: 'María López',
        providerEmail: 'maria@example.com',
        experienciaTitulo: 'Tour por Santiago',
        clienteNombre: 'Juan Pérez',
        fechaExperiencia: '2024-12-25',
        cantidadPersonas: 2,
      }

      await emailService.sendNewReservaToProvider(providerData)

      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledWith({
        from: expect.any(String),
        to: providerData.providerEmail,
        subject: expect.stringContaining('Nueva Reserva'),
        html: expect.stringContaining(providerData.clienteNombre),
      })
    })
  })

  describe('HTML generation', () => {
    it('should generate HTML with proper structure', async () => {
      const reservaData = {
        reservaId: 'res-123',
        userName: 'Juan Pérez',
        userEmail: 'juan@example.com',
        experienciaTitulo: 'Tour por Santiago',
        fechaExperiencia: '2024-12-25',
        cantidadPersonas: 2,
        precioTotal: 50000,
        moneda: 'CLP' as const,
      }

      await emailService.sendReservaConfirmation(reservaData)

      const htmlContent = mockSend.mock.calls[0][0].html

      expect(htmlContent).toContain('<!DOCTYPE html>')
      expect(htmlContent).toContain('<html')
      expect(htmlContent).toContain('ConfiaTour')
      expect(htmlContent).toContain(reservaData.experienciaTitulo)
      expect(htmlContent).toContain(reservaData.reservaId)
    })
  })
})
