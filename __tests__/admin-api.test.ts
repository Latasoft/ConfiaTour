import { GET as getStats } from '@/app/api/admin/stats/route'
import { GET as getExperiencias, PUT as updateExperiencia } from '@/app/api/admin/experiencias/route'
import { auth } from '@clerk/nextjs/server'
import { statsService } from '@/lib/services/stats.service'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/services/stats.service')

describe('Admin API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/stats', () => {
    it('should return stats for authenticated admin', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ userId: 'user-123' })
      ;(statsService.getAllStats as jest.Mock).mockResolvedValue({
        reservas: { total: 10 },
        experiencias: { total: 5 },
        users: { total: 20 },
        revenue: { totalCLP: 100000 },
      })

      const request = new NextRequest('http://localhost:3000/api/admin/stats')
      const response = await getStats(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('reservas')
      expect(data).toHaveProperty('experiencias')
      expect(data.reservas.total).toBe(10)
    })

    it('should return 401 for unauthenticated requests', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ userId: null })

      const request = new NextRequest('http://localhost:3000/api/admin/stats')
      const response = await getStats(request)

      expect(response.status).toBe(401)
    })

    it('should handle service errors', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ userId: 'user-123' })
      ;(statsService.getAllStats as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/admin/stats')
      const response = await getStats(request)

      expect(response.status).toBe(500)
    })
  })

  describe('GET /api/admin/experiencias', () => {
    it('should return filtered experiencias', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ userId: 'user-123' })

      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [{ id: '1', titulo: 'Tour' }],
                error: null,
              }),
            }),
          }),
        }),
      }

      jest.doMock('@/lib/supabaseClient', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/admin/experiencias?categoria=turismo')
      const response = await getExperiencias(request)

      expect(response.status).toBe(200)
    })
  })

  describe('PUT /api/admin/experiencias', () => {
    it('should update experiencia availability', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ userId: 'user-123' })

      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: '1', disponible: false },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }

      jest.doMock('@/lib/supabaseClient', () => ({ supabase: mockSupabase }))

      const request = new NextRequest('http://localhost:3000/api/admin/experiencias', {
        method: 'PUT',
        body: JSON.stringify({ id: '1', disponible: false }),
      })

      const response = await updateExperiencia(request)
      expect(response.status).toBe(200)
    })

    it('should return 400 for missing parameters', async () => {
      ;(auth as jest.Mock).mockResolvedValue({ userId: 'user-123' })

      const request = new NextRequest('http://localhost:3000/api/admin/experiencias', {
        method: 'PUT',
        body: JSON.stringify({ id: '1' }), // Missing disponible
      })

      const response = await updateExperiencia(request)
      expect(response.status).toBe(400)
    })
  })
})
