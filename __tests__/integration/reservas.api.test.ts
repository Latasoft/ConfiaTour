import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { POST, GET } from '@/app/api/reservas/route'
import { NextRequest } from 'next/server'

// Mock de Clerk auth ANTES de importar
const mockAuth = jest.fn()
const mockCurrentUser = jest.fn()

jest.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser
}))

// Mock de ReservaService
const mockCrearReserva = jest.fn()
const mockGetReservasByUsuario = jest.fn()

jest.mock('@/lib/services/reserva.service', () => ({
  reservaService: {
    crearReserva: mockCrearReserva,
    getReservasByUsuario: mockGetReservasByUsuario
  }
}))

describe('API /api/reservas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/reservas', () => {
    test('debe retornar 401 si no está autenticado', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: null })
      
      const request = new NextRequest('http://localhost:3000/api/reservas', {
        method: 'POST',
        body: JSON.stringify({})
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data.error).toBe('No autorizado')
    })

    test('debe crear reserva si está autenticado con datos válidos', async () => {
      // Arrange
      const userId = 'user_abc123'
      const userEmail = 'test@example.com'

      mockAuth.mockResolvedValue({ userId })
      mockCurrentUser.mockResolvedValue({
        id: userId,
        emailAddresses: [{ emailAddress: userEmail }]
      })

      const reservaData = {
        experiencia_id: '123e4567-e89b-12d3-a456-426614174000',
        fecha_experiencia: '2024-12-25',
        cantidad_personas: 2,
        precio_total: 100000,
        metodo_pago: 'transbank',
        buy_order: 'ORDER123',
        session_id: 'SESSION123'
      }

      const reservaCreada = {
        ...reservaData,
        id: '987e6543-e89b-12d3-a456-426614174000',
        usuario_id: userId,
        estado: 'pendiente_pago',
        pagado: false
      }

      mockCrearReserva.mockResolvedValue(reservaCreada)

      const request = new NextRequest('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservaData)
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.reserva.id).toBe(reservaCreada.id)
      expect(data.reserva.usuario_id).toBe(userId) // Forzado desde sesión
      
      // Verificar que se llamó con usuario_id del servidor
      expect(mockCrearReserva).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario_id: userId, // ✅ Del servidor, no del cliente
          experiencia_id: reservaData.experiencia_id
        })
      )
    })

    test('debe retornar 400 con datos inválidos', async () => {
      // Arrange
      const userId = 'user_abc123'

      mockAuth.mockResolvedValue({ userId })
      mockCurrentUser.mockResolvedValue({
        id: userId,
        emailAddresses: [{ emailAddress: 'test@example.com' }]
      })

      const datosInvalidos = {
        experiencia_id: 'invalid-uuid', // UUID inválido
        cantidad_personas: -1 // Cantidad inválida
      }

      const { ValidationError } = await import('@/lib/utils/errors')
      mockCrearReserva.mockRejectedValue(
        new ValidationError('Datos inválidos')
      )

      const request = new NextRequest('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosInvalidos)
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.error).toContain('Datos inválidos')
    })

    test('no debe permitir enviar usuario_id desde el cliente', async () => {
      // Arrange
      const realUserId = 'user_real_abc123'
      const fakeUserId = 'user_fake_xyz789' // Intento de suplantación

      mockAuth.mockResolvedValue({ userId: realUserId })
      mockCurrentUser.mockResolvedValue({
        id: realUserId,
        emailAddresses: [{ emailAddress: 'test@example.com' }]
      })

      const reservaData = {
        experiencia_id: '123e4567-e89b-12d3-a456-426614174000',
        usuario_id: fakeUserId, // ⚠️ Intento de enviar otro usuario_id
        fecha_experiencia: '2024-12-25',
        cantidad_personas: 2,
        precio_total: 100000,
        metodo_pago: 'transbank',
        buy_order: 'ORDER123'
      }

      mockCrearReserva.mockImplementation((data) => {
        return Promise.resolve({
          ...data,
          id: '987e6543-e89b-12d3-a456-426614174000',
          estado: 'pendiente_pago'
        })
      })

      const request = new NextRequest('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservaData)
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(201)
      
      // ✅ Verificar que se usó el usuario_id REAL de la sesión, no el fake
      expect(mockCrearReserva).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario_id: realUserId, // El del servidor
          // NO debe ser fakeUserId
        })
      )
      
      const callArgs = mockCrearReserva.mock.calls[0][0]
      expect(callArgs.usuario_id).toBe(realUserId)
      expect(callArgs.usuario_id).not.toBe(fakeUserId)
    })
  })

  describe('GET /api/reservas', () => {
    test('debe retornar 401 si no está autenticado', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: null })
      
      const request = new NextRequest('http://localhost:3000/api/reservas', {
        method: 'GET'
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data.error).toBe('No autorizado')
    })

    test('debe retornar solo las reservas del usuario autenticado', async () => {
      // Arrange
      const userId = 'user_abc123'

      mockAuth.mockResolvedValue({ userId })

      const reservasDelUsuario = [
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

      mockGetReservasByUsuario.mockResolvedValue(reservasDelUsuario)

      const request = new NextRequest('http://localhost:3000/api/reservas', {
        method: 'GET'
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.reservas).toHaveLength(2)
      expect(data.reservas[0].usuario_id).toBe(userId)
      expect(data.reservas[1].usuario_id).toBe(userId)

      // Verificar que se llamó con el usuario correcto
      expect(mockGetReservasByUsuario).toHaveBeenCalledWith(userId)
    })

    test('debe retornar array vacío si no hay reservas', async () => {
      // Arrange
      const userId = 'user_sin_reservas'

      mockAuth.mockResolvedValue({ userId })
      mockGetReservasByUsuario.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/reservas', {
        method: 'GET'
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.reservas).toEqual([])
      expect(data.reservas).toHaveLength(0)
    })
  })
})
