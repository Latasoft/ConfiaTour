import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { ReservaService } from '@/lib/services/reserva.service'
import { ReservaRepository } from '@/lib/repositories/reserva.repository'
import { ValidationError, ConflictError } from '@/lib/utils/errors'
import type { Reserva } from '@/types'

// Mock del repositorio
jest.mock('@/lib/repositories/reserva.repository')

describe('ReservaService', () => {
  let reservaService: ReservaService
  let mockRepository: jest.Mocked<ReservaRepository>

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Crear instancia del servicio con repositorio mockeado
    mockRepository = new ReservaRepository() as jest.Mocked<ReservaRepository>
    reservaService = new ReservaService(mockRepository)
  })

  describe('crearReserva', () => {
    test('debe crear una reserva con datos válidos', async () => {
      // Arrange
      const reservaData = {
        experiencia_id: '123e4567-e89b-12d3-a456-426614174000',
        usuario_id: 'user_abc123',
        fecha_experiencia: '2024-12-25',
        cantidad_personas: 2,
        precio_total: 100000,
        metodo_pago: 'transbank' as const
      }

      const reservaEsperada: Partial<Reserva> = {
        ...reservaData,
        id: '987e6543-e89b-12d3-a456-426614174000',
        estado: 'pendiente_pago',
        pagado: false
      }

      mockRepository.create = jest.fn().mockResolvedValue(reservaEsperada)

      // Act
      const resultado = await reservaService.crearReserva(reservaData)

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(reservaData)
      expect(resultado).toEqual(reservaEsperada)
    })

    test('debe lanzar ValidationError con datos inválidos', async () => {
      // Arrange
      const datosInvalidos = {
        experiencia_id: 'invalid-uuid', // UUID inválido
        usuario_id: 'user_123',
        fecha_experiencia: '2024-12-25',
        cantidad_personas: -1, // Cantidad negativa
        precio_total: 0,
        metodo_pago: 'transbank' as const
      }

      // Act & Assert
      await expect(
        reservaService.crearReserva(datosInvalidos)
      ).rejects.toThrow(ValidationError)
    })

    test('debe lanzar error si falta usuario_id', async () => {
      // Arrange
      const datosSinUsuario = {
        experiencia_id: '123e4567-e89b-12d3-a456-426614174000',
        usuario_id: '', // Vacío
        fecha_experiencia: '2024-12-25',
        cantidad_personas: 2,
        precio_total: 100000,
        metodo_pago: 'transbank' as const
      }

      // Act & Assert
      await expect(
        reservaService.crearReserva(datosSinUsuario)
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('cancelarReserva', () => {
    test('debe cancelar una reserva con más de 24 horas de anticipación', async () => {
      // Arrange
      const reservaId = '123e4567-e89b-12d3-a456-426614174000'
      const userId = 'user_abc123'
      
      // Fecha más de 24h en el futuro
      const fechaFutura = new Date()
      fechaFutura.setDate(fechaFutura.getDate() + 3)

      const reservaMock: Partial<Reserva> = {
        id: reservaId,
        usuario_id: userId,
        fecha_experiencia: fechaFutura.toISOString(),
        estado: 'confirmada'
      }

      mockRepository.canCancel = jest.fn().mockResolvedValue(true)
      mockRepository.cancel = jest.fn().mockResolvedValue({
        ...reservaMock,
        estado: 'cancelada'
      })

      // Act
      const resultado = await reservaService.cancelarReserva(reservaId, userId)

      // Assert
      expect(mockRepository.canCancel).toHaveBeenCalledWith(reservaId, userId)
      expect(mockRepository.cancel).toHaveBeenCalledWith(reservaId, userId)
      expect(resultado.estado).toBe('cancelada')
    })

    test('debe lanzar ConflictError con menos de 24 horas de anticipación', async () => {
      // Arrange
      const reservaId = '123e4567-e89b-12d3-a456-426614174000'
      const userId = 'user_abc123'

      mockRepository.canCancel = jest.fn().mockResolvedValue(false)
      const cancelSpy = jest.fn() // Crear spy para verificar que NO se llama
      mockRepository.cancel = cancelSpy

      // Act & Assert
      await expect(
        reservaService.cancelarReserva(reservaId, userId)
      ).rejects.toThrow(ConflictError)

      expect(mockRepository.canCancel).toHaveBeenCalledWith(reservaId, userId)
      expect(cancelSpy).not.toHaveBeenCalled() // Usar el spy
    })

    test('no debe permitir cancelar reserva de otro usuario', async () => {
      // Arrange
      const reservaId = '123e4567-e89b-12d3-a456-426614174000'
      const userId = 'user_abc123'

      // canCancel retorna false porque no es el dueño
      mockRepository.canCancel = jest.fn().mockResolvedValue(false)

      // Act & Assert
      await expect(
        reservaService.cancelarReserva(reservaId, userId)
      ).rejects.toThrow(ConflictError)
    })
  })

  describe('getReservasByUsuario', () => {
    test('debe obtener todas las reservas de un usuario', async () => {
      // Arrange
      const userId = 'user_abc123'
      const reservasMock: Partial<Reserva>[] = [
        {
          id: '1',
          usuario_id: userId,
          estado: 'confirmada',
          precio_total: 50000
        },
        {
          id: '2',
          usuario_id: userId,
          estado: 'pendiente_pago',
          precio_total: 75000
        }
      ]

      mockRepository.getByUserId = jest.fn().mockResolvedValue(reservasMock)

      // Act
      const resultado = await reservaService.getReservasByUsuario(userId)

      // Assert
      expect(mockRepository.getByUserId).toHaveBeenCalledWith(userId)
      expect(resultado).toHaveLength(2)
      expect(resultado[0].usuario_id).toBe(userId)
    })

    test('debe retornar array vacío si no hay reservas', async () => {
      // Arrange
      const userId = 'user_sin_reservas'
      mockRepository.getByUserId = jest.fn().mockResolvedValue([])

      // Act
      const resultado = await reservaService.getReservasByUsuario(userId)

      // Assert
      expect(resultado).toEqual([])
      expect(resultado).toHaveLength(0)
    })
  })

  describe('confirmarReserva', () => {
    test('debe confirmar una reserva y actualizar su estado', async () => {
      // Arrange
      const reservaId = '123e4567-e89b-12d3-a456-426614174000'
      const paymentDetails = {
        codigo_autorizacion: 'AUTH123456',
        detalles_pago: { 
          amount: 100000,
          cardType: 'Visa'
        }
      }

      const reservaConfirmada: Partial<Reserva> = {
        id: reservaId,
        estado: 'confirmada',
        pagado: true,
        codigo_autorizacion: 'AUTH123456'
      }

      mockRepository.updateStatus = jest.fn().mockResolvedValue(reservaConfirmada)

      // Act
      const resultado = await reservaService.confirmarReserva(
        reservaId,
        paymentDetails
      )

      // Assert
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        reservaId,
        'confirmada',
        expect.objectContaining({
          pagado: true,
          ...paymentDetails
        })
      )
      expect(resultado.estado).toBe('confirmada')
      expect(resultado.pagado).toBe(true)
    })
  })

  describe('calcularTotal', () => {
    test('debe convertir USD a CLP correctamente', async () => {
      // Arrange
      const precio = 100 // USD
      const cantidad = 2

      // Act
      const resultado = await reservaService.calcularTotal(precio, 'USD', cantidad)

      // Assert
      expect(resultado.totalOriginal).toBe(200) // 100 * 2
      expect(resultado.totalCLP).toBeGreaterThan(0)
      // Debería ser aproximadamente 200 * 950 = 190,000 CLP
      expect(resultado.totalCLP).toBeGreaterThan(180000)
    })

    test('CLP debe mantener el mismo valor', async () => {
      // Arrange
      const precio = 50000 // CLP
      const cantidad = 1

      // Act
      const resultado = await reservaService.calcularTotal(precio, 'CLP', cantidad)

      // Assert
      expect(resultado.totalOriginal).toBe(50000)
      expect(resultado.totalCLP).toBe(50000)
    })
  })
})
