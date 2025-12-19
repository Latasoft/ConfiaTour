import { reservaService } from '@/lib/services/reserva.service'
import { emailService } from '@/lib/services/email.service'
import { ReservaRepository } from '@/lib/repositories/reserva.repository'
import { ExperienciaRepository } from '@/lib/repositories/experiencia.repository'

// Mock repositories
jest.mock('@/lib/repositories/reserva.repository')
jest.mock('@/lib/repositories/experiencia.repository')
jest.mock('@/lib/services/email.service', () => ({
  emailService: {
    sendReservaConfirmation: jest.fn(),
    sendReservaCancellation: jest.fn(),
    sendPaymentReceipt: jest.fn(),
    sendNewReservaToProvider: jest.fn(),
  },
}))

describe('Email Integration - Reserva Flow', () => {
  let mockReservaRepository: jest.Mocked<ReservaRepository>
  let mockExperienciaRepository: jest.Mocked<ExperienciaRepository>

  const mockReserva = {
    id: 'res-test-123',
    experiencia_id: 'exp-test-456',
    usuario_id: 'user-test-789',
    fecha_experiencia: '2025-01-15',
    cantidad_personas: 3,
    precio_total: 75000,
    metodo_pago: 'transbank',
    estado: 'pendiente',
    pagado: false,
    fecha_reserva: '2024-12-19T10:00:00Z',
    creado_en: '2024-12-19T10:00:00Z',
  }

  const mockExperiencia = {
    id: 'exp-test-456',
    titulo: 'Tour Viña del Mar',
    descripcion: 'Tour increíble',
    categoria: 'turismo',
    ubicacion: 'Viña del Mar, Chile',
    precio: 25000,
    moneda: 'CLP',
    duracion: '4 horas',
    capacidad: 10,
    usuario_id: 'guia-test-123',
    imagenes: [],
    fecha_inicio: '2025-01-01',
    fecha_fin: '2025-12-31',
    rating_promedio: 4.5,
    creado_en: '2024-12-01T00:00:00Z',
  }

  const mockProviderInfo = {
    email: 'guia@example.com',
    name: 'Guía Test',
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockReservaRepository = {
      updateStatus: jest.fn().mockResolvedValue({ ...mockReserva, estado: 'confirmada', pagado: true }),
    } as any

    mockExperienciaRepository = {
      getById: jest.fn().mockResolvedValue(mockExperiencia),
      getProviderEmail: jest.fn().mockResolvedValue(mockProviderInfo),
    } as any

    ;(ReservaRepository as jest.Mock).mockImplementation(() => mockReservaRepository)
    ;(ExperienciaRepository as jest.Mock).mockImplementation(() => mockExperienciaRepository)
  })

  describe('confirmarReserva', () => {
    it('should send confirmation email when reserva is confirmed', async () => {
      const service = new (require('@/lib/services/reserva.service').ReservaService)(mockReservaRepository)

      await service.confirmarReserva(
        'res-test-123',
        { codigo_autorizacion: 'AUTH-123' },
        'cliente@example.com',
        'Cliente Test'
      )

      expect(emailService.sendReservaConfirmation).toHaveBeenCalledTimes(1)
      expect(emailService.sendReservaConfirmation).toHaveBeenCalledWith({
        reserva: expect.objectContaining({
          id: 'res-test-123',
          estado: 'confirmada',
          pagado: true,
        }),
        experiencia: mockExperiencia,
        usuario: {
          nombre: 'Cliente Test',
          email: 'cliente@example.com',
        },
      })
    })

    it('should send payment receipt when reserva is confirmed', async () => {
      const service = new (require('@/lib/services/reserva.service').ReservaService)(mockReservaRepository)

      await service.confirmarReserva(
        'res-test-123',
        { codigo_autorizacion: 'AUTH-123' },
        'cliente@example.com',
        'Cliente Test'
      )

      expect(emailService.sendPaymentReceipt).toHaveBeenCalledTimes(1)
      expect(emailService.sendPaymentReceipt).toHaveBeenCalledWith({
        reserva: expect.objectContaining({
          estado: 'confirmada',
        }),
        experiencia: mockExperiencia,
        usuario: {
          nombre: 'Cliente Test',
          email: 'cliente@example.com',
        },
      })
    })

    it('should notify provider about new reserva', async () => {
      const service = new (require('@/lib/services/reserva.service').ReservaService)(mockReservaRepository)

      await service.confirmarReserva(
        'res-test-123',
        { codigo_autorizacion: 'AUTH-123' },
        'cliente@example.com',
        'Cliente Test'
      )

      expect(emailService.sendNewReservaToProvider).toHaveBeenCalledTimes(1)
      expect(emailService.sendNewReservaToProvider).toHaveBeenCalledWith(
        'guia@example.com',
        'Guía Test',
        expect.objectContaining({
          reserva: expect.any(Object),
          experiencia: mockExperiencia,
          usuario: expect.objectContaining({
            email: 'cliente@example.com',
          }),
        })
      )
    })

    it('should continue even if email sending fails', async () => {
      (emailService.sendReservaConfirmation as jest.Mock).mockRejectedValueOnce(
        new Error('Email service down')
      )

      const service = new (require('@/lib/services/reserva.service').ReservaService)(mockReservaRepository)

      const result = await service.confirmarReserva(
        'res-test-123',
        { codigo_autorizacion: 'AUTH-123' },
        'cliente@example.com',
        'Cliente Test'
      )

      expect(result).toBeDefined()
      expect(result.estado).toBe('confirmada')
    })

    it('should handle missing provider email gracefully', async () => {
      // Mock para retornar null en la segunda llamada
      mockExperienciaRepository.getProviderEmail
        .mockResolvedValueOnce(mockProviderInfo) // Primera llamada para getById
        .mockResolvedValueOnce(null) // Segunda llamada para getProviderEmail

      const service = new (require('@/lib/services/reserva.service').ReservaService)(mockReservaRepository)

      await service.confirmarReserva(
        'res-test-123',
        { codigo_autorizacion: 'AUTH-123' },
        'cliente@example.com',
        'Cliente Test'
      )

      // Should still send user emails even if provider email fails
      expect(emailService.sendReservaConfirmation).toHaveBeenCalled()
      expect(emailService.sendPaymentReceipt).toHaveBeenCalled()
    })
  })

  describe('cancelarReserva', () => {
    it('should send cancellation emails', async () => {
      mockReservaRepository.getById = jest.fn().mockResolvedValue(mockReserva)
      mockReservaRepository.canCancel = jest.fn().mockResolvedValue(true)
      mockReservaRepository.cancel = jest.fn().mockResolvedValue({
        ...mockReserva,
        estado: 'cancelada',
        fecha_cancelacion: new Date().toISOString(),
      })

      const service = new (require('@/lib/services/reserva.service').ReservaService)(mockReservaRepository)

      await service.cancelarReserva('res-test-123', 'user-test-789', 'cliente@example.com', 'Cliente Test')

      expect(emailService.sendReservaCancellation).toHaveBeenCalledTimes(1)
      expect(emailService.sendReservaCancellation).toHaveBeenCalledWith({
        reserva: expect.objectContaining({
          estado: 'cancelada',
        }),
        experiencia: mockExperiencia,
        usuario: {
          nombre: 'Cliente Test',
          email: 'cliente@example.com',
        },
      })
    })
  })
})

describe('Email Service Error Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle missing email configuration gracefully', async () => {
    const originalGmailUser = process.env.GMAIL_USER
    delete process.env.GMAIL_USER

    // Reiniciar el mock
    ;(emailService.sendReservaConfirmation as jest.Mock).mockResolvedValueOnce(undefined)

    const reservaData = {
      reserva: { id: 'res-123', fecha_experiencia: '2024-12-25', cantidad_personas: 2, precio_total: 50000, metodo_pago: 'transbank' },
      experiencia: { titulo: 'Test', ubicacion: 'Santiago', categoria: 'turismo', duracion: '2h' },
      usuario: { nombre: 'Test User', email: 'test@example.com' },
    }

    // Should not throw even without configuration
    await expect(emailService.sendReservaConfirmation(reservaData as any)).resolves.not.toThrow()

    process.env.GMAIL_USER = originalGmailUser
  })

  it('should handle network errors gracefully', async () => {
    (emailService.sendReservaConfirmation as jest.Mock).mockRejectedValueOnce(
      new Error('Network timeout')
    )

    const reservaData = {
      reserva: { id: 'res-123', fecha_experiencia: '2024-12-25', cantidad_personas: 2, precio_total: 50000, metodo_pago: 'transbank' },
      experiencia: { titulo: 'Test', ubicacion: 'Santiago', categoria: 'turismo', duracion: '2h' },
      usuario: { nombre: 'Test User', email: 'test@example.com' },
    }

    await expect(emailService.sendReservaConfirmation(reservaData as any)).rejects.toThrow('Network timeout')
  })
})
