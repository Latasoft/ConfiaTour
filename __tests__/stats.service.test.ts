import { StatsService } from '@/lib/services/stats.service'
import { supabase } from '@/lib/supabaseClient'

// Mock Supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('StatsService', () => {
  let statsService: StatsService

  beforeEach(() => {
    statsService = new StatsService()
    jest.clearAllMocks()
  })

  describe('getReservasStats', () => {
    it('should return reservas statistics', async () => {
      const mockReservas = [
        { estado: 'confirmada' },
        { estado: 'confirmada' },
        { estado: 'pendiente' },
        { estado: 'cancelada' },
      ]

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockReservas,
          error: null,
        }),
      })

      const stats = await statsService.getReservasStats()

      expect(stats.total).toBe(4)
      expect(stats.confirmadas).toBe(2)
      expect(stats.pendientes).toBe(1)
      expect(stats.canceladas).toBe(1)
      expect(stats.completadas).toBe(0)
    })

    it('should handle empty reservas', async () => {
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })

      const stats = await statsService.getReservasStats()

      expect(stats.total).toBe(0)
      expect(stats.confirmadas).toBe(0)
    })

    it('should handle database errors', async () => {
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      })

      await expect(statsService.getReservasStats()).rejects.toThrow('Database error')
    })
  })

  describe('getExperienciasStats', () => {
    it('should return experiencias statistics with category breakdown', async () => {
      const mockExperiencias = [
        { categoria: 'turismo', disponible: true },
        { categoria: 'turismo', disponible: false },
        { categoria: 'gastronomia', disponible: true },
        { categoria: 'alojamiento', disponible: true },
      ]

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockExperiencias,
          error: null,
        }),
      })

      const stats = await statsService.getExperienciasStats()

      expect(stats.total).toBe(4)
      expect(stats.disponibles).toBe(3)
      expect(stats.nodisponibles).toBe(1)
      expect(stats.porCategoria.turismo).toBe(2)
      expect(stats.porCategoria.gastronomia).toBe(1)
      expect(stats.porCategoria.alojamiento).toBe(1)
    })
  })

  describe('getUsersStats', () => {
    it('should return users statistics', async () => {
      const mockProfiles = [
        { user_type: 'viajero', verified: true },
        { user_type: 'viajero', verified: false },
        { user_type: 'guia', verified: true },
        { user_type: 'admin', verified: true },
      ]

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockProfiles,
          error: null,
        }),
      })

      const stats = await statsService.getUsersStats()

      expect(stats.total).toBe(4)
      expect(stats.viajeros).toBe(2)
      expect(stats.guias).toBe(1)
      expect(stats.admins).toBe(1)
      expect(stats.verificados).toBe(3)
      expect(stats.noVerificados).toBe(1)
    })
  })

  describe('getRevenueStats', () => {
    it('should calculate revenue by month', async () => {
      const mockReservas = [
        {
          fecha_reserva: '2024-01-15',
          precio_total: 50000,
          estado: 'completada',
          experiencias: { moneda: 'CLP' },
        },
        {
          fecha_reserva: '2024-01-20',
          precio_total: 30000,
          estado: 'completada',
          experiencias: { moneda: 'CLP' },
        },
        {
          fecha_reserva: '2024-02-10',
          precio_total: 40000,
          estado: 'completada',
          experiencias: { moneda: 'CLP' },
        },
        {
          fecha_reserva: '2024-02-15',
          precio_total: 25000,
          estado: 'cancelada',
          experiencias: { moneda: 'CLP' },
        },
      ]

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockReservas,
          error: null,
        }),
      })

      const stats = await statsService.getRevenueStats()

      expect(stats.totalCLP).toBeGreaterThan(0)
      expect(stats.porMes).toHaveLength(12)
      
      const enero = stats.porMes.find(m => m.month === 'Enero')
      expect(enero?.CLP).toBe(80000)
      
      const febrero = stats.porMes.find(m => m.month === 'Febrero')
      expect(febrero?.CLP).toBe(40000)
    })

    it('should handle multiple currencies', async () => {
      const mockReservas = [
        {
          fecha_reserva: '2024-01-15',
          precio_total: 100,
          estado: 'completada',
          experiencias: { moneda: 'USD' },
        },
        {
          fecha_reserva: '2024-01-20',
          precio_total: 50000,
          estado: 'completada',
          experiencias: { moneda: 'CLP' },
        },
      ]

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockReservas,
          error: null,
        }),
      })

      const stats = await statsService.getRevenueStats()

      expect(stats.totalUSD).toBe(100)
      expect(stats.totalCLP).toBe(50000)
    })
  })

  describe('getAllStats', () => {
    it('should aggregate all statistics', async () => {
      // Mock all queries
      const selectMock = jest.fn()
        .mockResolvedValueOnce({ data: [{ estado: 'confirmada' }], error: null })
        .mockResolvedValueOnce({ data: [{ categoria: 'turismo', disponible: true }], error: null })
        .mockResolvedValueOnce({ data: [{ user_type: 'viajero', verified: true }], error: null })
        .mockResolvedValueOnce({
          data: [{
            fecha_reserva: '2024-01-15',
            precio_total: 50000,
            estado: 'completada',
            experiencias: { moneda: 'CLP' },
          }],
          error: null,
        })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: selectMock,
      })

      const allStats = await statsService.getAllStats()

      expect(allStats).toHaveProperty('reservas')
      expect(allStats).toHaveProperty('experiencias')
      expect(allStats).toHaveProperty('users')
      expect(allStats).toHaveProperty('revenue')
    })
  })
})
