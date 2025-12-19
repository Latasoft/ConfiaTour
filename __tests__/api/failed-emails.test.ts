import { GET, POST } from '@/app/api/admin/failed-emails/route'
import { NextRequest } from 'next/server'

// Mock de supabase
jest.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}))

// Mock de emailService
jest.mock('@/lib/services/email.service', () => ({
  emailService: {
    sendReservaConfirmation: jest.fn(),
    sendPaymentReceipt: jest.fn(),
    sendReservaCancellation: jest.fn()
  }
}))

describe('API /api/admin/failed-emails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET - Listar emails fallidos', () => {
    it('debe retornar lista de emails fallidos pendientes', async () => {
      const { supabase } = require('@/lib/db/supabase')
      
      const mockFailedEmails = [
        {
          id: 'email-1',
          email_type: 'confirmacion',
          reserva_id: 'reserva-1',
          recipient_email: 'user@example.com',
          recipient_name: 'Juan Pérez',
          error_message: 'SMTP timeout',
          failed_at: '2025-12-19T10:00:00Z',
          resolved: false
        },
        {
          id: 'email-2',
          email_type: 'comprobante',
          reserva_id: 'reserva-2',
          recipient_email: 'maria@example.com',
          recipient_name: 'María López',
          error_message: 'Connection refused',
          failed_at: '2025-12-19T11:00:00Z',
          resolved: false
        }
      ]

      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()
      const mockLimit = jest.fn().mockResolvedValue({
        data: mockFailedEmails,
        error: null
      })

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit
      })

      const request = new NextRequest('http://localhost/api/admin/failed-emails?limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.failed_emails).toHaveLength(2)
      expect(data.count).toBe(2)
      expect(data.failed_emails[0].email_type).toBe('confirmacion')
      
      expect(supabase.from).toHaveBeenCalledWith('failed_emails')
      expect(mockEq).toHaveBeenCalledWith('resolved', false)
      expect(mockLimit).toHaveBeenCalledWith(10)
    })

    it('debe filtrar por emails resueltos', async () => {
      const { supabase } = require('@/lib/db/supabase')
      
      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()
      const mockLimit = jest.fn().mockResolvedValue({
        data: [],
        error: null
      })

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit
      })

      const request = new NextRequest('http://localhost/api/admin/failed-emails?resolved=true')
      await GET(request)

      expect(mockEq).toHaveBeenCalledWith('resolved', true)
    })

    it('debe manejar errores de base de datos', async () => {
      const { supabase } = require('@/lib/db/supabase')
      
      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockReturnThis()
      const mockLimit = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit
      })

      const request = new NextRequest('http://localhost/api/admin/failed-emails')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })

  describe('POST - Reintentar email fallido', () => {
    it('debe reintentar email de confirmación exitosamente', async () => {
      const { supabase } = require('@/lib/db/supabase')
      const { emailService } = require('@/lib/services/email.service')
      
      const mockFailedEmail = {
        id: 'email-1',
        email_type: 'confirmacion',
        reserva_id: 'reserva-1',
        recipient_email: 'user@example.com',
        recipient_name: 'Juan Pérez',
        reservas: {
          id: 'reserva-1',
          cantidad_personas: 2,
          precio_total: 50000
        },
        experiencias: {
          id: 'exp-1',
          titulo: 'Tour Valparaíso'
        }
      }

      // Mock select single
      const mockSelectSingle = jest.fn().mockResolvedValue({
        data: mockFailedEmail,
        error: null
      })
      
      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn(() => mockSelectSingle())

      // Mock update
      const mockUpdate = jest.fn().mockReturnThis()
      const mockEqUpdate = jest.fn().mockResolvedValue({
        data: null,
        error: null
      })

      supabase.from.mockImplementation((table: string) => {
        if (table === 'failed_emails') {
          return {
            select: mockSelect,
            eq: mockEq,
            single: mockSingle,
            update: mockUpdate
          }
        }
      })

      mockEq.mockReturnValue({
        single: mockSingle
      })

      mockUpdate.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      })

      emailService.sendReservaConfirmation.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost/api/admin/failed-emails', {
        method: 'POST',
        body: JSON.stringify({ failed_email_id: 'email-1' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('reenviado exitosamente')
      expect(data.email_type).toBe('confirmacion')
      
      expect(emailService.sendReservaConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: expect.objectContaining({
            email: 'user@example.com'
          })
        })
      )
    })

    it('debe reintentar email de comprobante', async () => {
      const { supabase } = require('@/lib/db/supabase')
      const { emailService } = require('@/lib/services/email.service')
      
      const mockFailedEmail = {
        id: 'email-2',
        email_type: 'comprobante',
        recipient_email: 'user@example.com',
        recipient_name: 'Juan Pérez',
        reservas: { id: 'reserva-1' },
        experiencias: { id: 'exp-1' }
      }

      const mockSelectSingle = jest.fn().mockResolvedValue({
        data: mockFailedEmail,
        error: null
      })

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => mockSelectSingle()),
        update: jest.fn().mockReturnThis()
      })

      emailService.sendPaymentReceipt.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost/api/admin/failed-emails', {
        method: 'POST',
        body: JSON.stringify({ failed_email_id: 'email-2' })
      })

      await POST(request)

      expect(emailService.sendPaymentReceipt).toHaveBeenCalled()
    })

    it('debe reintentar email de cancelación', async () => {
      const { supabase } = require('@/lib/db/supabase')
      const { emailService } = require('@/lib/services/email.service')
      
      const mockFailedEmail = {
        id: 'email-3',
        email_type: 'cancelacion',
        recipient_email: 'user@example.com',
        recipient_name: 'Juan Pérez',
        reservas: { id: 'reserva-1' },
        experiencias: { id: 'exp-1' }
      }

      const mockSelectSingle = jest.fn().mockResolvedValue({
        data: mockFailedEmail,
        error: null
      })

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => mockSelectSingle()),
        update: jest.fn().mockReturnThis()
      })

      emailService.sendReservaCancellation.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost/api/admin/failed-emails', {
        method: 'POST',
        body: JSON.stringify({ failed_email_id: 'email-3' })
      })

      await POST(request)

      expect(emailService.sendReservaCancellation).toHaveBeenCalled()
    })

    it('debe retornar 400 si falta failed_email_id', async () => {
      const request = new NextRequest('http://localhost/api/admin/failed-emails', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('requerido')
    })

    it('debe retornar 404 si email fallido no existe', async () => {
      const { supabase } = require('@/lib/db/supabase')
      
      const mockSelectSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      })

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => mockSelectSingle())
      })

      const request = new NextRequest('http://localhost/api/admin/failed-emails', {
        method: 'POST',
        body: JSON.stringify({ failed_email_id: 'invalid-id' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })

    it('debe retornar 500 si falla el reenvío', async () => {
      const { supabase } = require('@/lib/db/supabase')
      const { emailService } = require('@/lib/services/email.service')
      
      const mockFailedEmail = {
        id: 'email-1',
        email_type: 'confirmacion',
        recipient_email: 'user@example.com',
        recipient_name: 'Juan Pérez',
        reservas: { id: 'reserva-1' },
        experiencias: { id: 'exp-1' }
      }

      const mockSelectSingle = jest.fn().mockResolvedValue({
        data: mockFailedEmail,
        error: null
      })

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => mockSelectSingle()),
        update: jest.fn().mockReturnThis()
      })

      emailService.sendReservaConfirmation.mockRejectedValue(
        new Error('SMTP still down')
      )

      const request = new NextRequest('http://localhost/api/admin/failed-emails', {
        method: 'POST',
        body: JSON.stringify({ failed_email_id: 'email-1' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Error al reenviar')
    })
  })
})
