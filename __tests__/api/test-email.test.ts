import { POST, GET } from '@/app/api/test-email/route'
import { NextRequest } from 'next/server'
import { emailService } from '@/lib/services/email.service'

jest.mock('@/lib/services/email.service', () => ({
  emailService: {
    sendReservaConfirmation: jest.fn(),
    sendReservaCancellation: jest.fn(),
    sendPaymentReceipt: jest.fn(),
  },
}))

describe('POST /api/test-email', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.GMAIL_USER = 'test@gmail.com'
    process.env.GMAIL_APP_PASSWORD = 'test-password'
  })

  it('should send confirmation email successfully', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/test-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        tipo: 'confirmacion',
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('confirmacion')
    expect(data.message).toContain('test@example.com')
    expect(emailService.sendReservaConfirmation).toHaveBeenCalledTimes(1)
  })

  it('should send cancellation email successfully', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/test-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        tipo: 'cancelacion',
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(emailService.sendReservaCancellation).toHaveBeenCalledTimes(1)
  })

  it('should send payment receipt email successfully', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/test-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        tipo: 'comprobante',
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(emailService.sendPaymentReceipt).toHaveBeenCalledTimes(1)
  })

  it('should default to confirmacion type when not specified', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/test-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(emailService.sendReservaConfirmation).toHaveBeenCalledTimes(1)
  })

  it('should return 400 when email is missing', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/test-email', {
      method: 'POST',
      body: JSON.stringify({
        tipo: 'confirmacion',
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email es requerido')
  })

  it('should return 400 for invalid email type', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/test-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        tipo: 'invalid-type',
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('no válido')
  })

  it('should handle email service errors', async () => {
    ;(emailService.sendReservaConfirmation as jest.Mock).mockRejectedValueOnce(
      new Error('SMTP connection failed')
    )

    const mockRequest = new NextRequest('http://localhost:3000/api/test-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        tipo: 'confirmacion',
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Error enviando email')
    expect(data.details).toContain('SMTP connection failed')
  })

  it('should include mock data in email call', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/test-email', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        tipo: 'confirmacion',
      }),
    })

    await POST(mockRequest)

    const callArgs = (emailService.sendReservaConfirmation as jest.Mock).mock.calls[0][0]
    
    expect(callArgs.reserva).toBeDefined()
    expect(callArgs.experiencia).toBeDefined()
    expect(callArgs.usuario).toBeDefined()
    expect(callArgs.usuario.email).toBe('test@example.com')
    expect(callArgs.experiencia.titulo).toContain('Prueba')
    expect(callArgs.reserva.precio_total).toBe(50000)
  })
})

describe('GET /api/test-email', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return configuration when Gmail is configured', async () => {
    process.env.GMAIL_USER = 'test@gmail.com'
    process.env.GMAIL_APP_PASSWORD = 'test-password'

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.config.configured).toBe(true)
    expect(data.config.gmailUser).toBe('test@gmail.com')
    expect(data.config.hasPassword).toBe(true)
  })

  it('should indicate when Gmail is not configured', async () => {
    delete process.env.GMAIL_USER
    delete process.env.GMAIL_APP_PASSWORD

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.config.configured).toBe(false)
    expect(data.config.gmailUser).toBe('No configurado')
    expect(data.config.hasPassword).toBe(false)
  })

  it('should include usage documentation', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.usage).toBeDefined()
    expect(data.usage.testEndpoint).toBe('POST /api/test-email')
    expect(data.usage.body).toBeDefined()
    expect(data.usage.body.email).toBeDefined()
    expect(data.usage.body.tipo).toContain('confirmacion')
  })
})
