import { supabase } from '../db/supabase'
import { Moneda, ExchangeRate } from '@/types'
import { logError } from '../utils/errors'

const CACHE_DURATION_HOURS = 24

/**
 * Servicio para conversión de monedas
 */
export class CurrencyService {
  /**
   * Obtiene la tasa de cambio desde la base de datos (con caché)
   */
  static async getRate(fromCurrency: Moneda, toCurrency: Moneda): Promise<number> {
    if (fromCurrency === toCurrency) return 1

    try {
      // Intentar obtener desde caché en BD
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('from_currency', fromCurrency)
        .eq('to_currency', toCurrency)
        .single()

      if (!error && data && this.isCacheValid(data.updated_at)) {
        return data.rate
      }

      // Si no hay caché válido, obtener de API y guardar
      const rate = await this.fetchRateFromAPI(fromCurrency, toCurrency)
      await this.saveRate(fromCurrency, toCurrency, rate)
      
      return rate
    } catch (error) {
      logError(error, { fromCurrency, toCurrency })
      // Usar tasas de fallback si falla
      return this.getFallbackRate(fromCurrency, toCurrency)
    }
  }

  /**
   * Convierte un monto a CLP
   */
  static async convertToCLP(amount: number, fromCurrency: Moneda): Promise<number> {
    if (fromCurrency === 'CLP') return Math.round(amount)
    
    const rate = await this.getRate(fromCurrency, 'CLP')
    return Math.round(amount * rate)
  }

  /**
   * Convierte un monto desde CLP a otra moneda
   */
  static async convertFromCLP(amount: number, toCurrency: Moneda): Promise<number> {
    if (toCurrency === 'CLP') return Math.round(amount)
    
    const rate = await this.getRate('CLP', toCurrency)
    return Math.round(amount * rate)
  }

  /**
   * Convierte entre dos monedas cualesquiera
   */
  static async convert(amount: number, fromCurrency: Moneda, toCurrency: Moneda): Promise<number> {
    if (fromCurrency === toCurrency) return amount
    
    const rate = await this.getRate(fromCurrency, toCurrency)
    return Math.round(amount * rate)
  }

  /**
   * Obtiene tasa de API externa (usar exchangerate-api.com o similar)
   * Por ahora usa tasas simuladas para desarrollo
   */
  private static async fetchRateFromAPI(fromCurrency: Moneda, toCurrency: Moneda): Promise<number> {
    // TODO: Implementar llamada a API real
    // const apiKey = process.env.EXCHANGE_RATE_API_KEY
    // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
    // const data = await response.json()
    // return data.rates[toCurrency]
    
    // Por ahora, usar tasas de fallback
    return this.getFallbackRate(fromCurrency, toCurrency)
  }

  /**
   * Guarda una tasa en la base de datos
   */
  private static async saveRate(fromCurrency: Moneda, toCurrency: Moneda, rate: number): Promise<void> {
    try {
      await supabase
        .from('exchange_rates')
        .upsert({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'from_currency,to_currency'
        })
    } catch (error) {
      logError(error, { fromCurrency, toCurrency, rate })
    }
  }

  /**
   * Verifica si el caché es válido
   */
  private static isCacheValid(updatedAt: string): boolean {
    const cacheTime = new Date(updatedAt).getTime()
    const now = new Date().getTime()
    const hoursSinceUpdate = (now - cacheTime) / (1000 * 60 * 60)
    return hoursSinceUpdate < CACHE_DURATION_HOURS
  }

  /**
   * Tasas de fallback (actualizar periódicamente)
   * Tasas aproximadas a noviembre 2025
   */
  private static getFallbackRate(fromCurrency: Moneda, toCurrency: Moneda): number {
    const ratesToCLP: Record<Moneda, number> = {
      USD: 950,
      ARS: 1.1,
      CLP: 1,
      BRL: 180,
      PYG: 0.13
    }

    if (toCurrency === 'CLP') {
      return ratesToCLP[fromCurrency]
    }

    // Convertir a través de CLP
    const toClpRate = ratesToCLP[fromCurrency]
    const fromClpRate = ratesToCLP[toCurrency]
    return toClpRate / fromClpRate
  }

  /**
   * Actualiza todas las tasas desde la API
   */
  static async updateAllRates(): Promise<void> {
    const currencies: Moneda[] = ['USD', 'ARS', 'CLP', 'BRL', 'PYG']
    
    for (const from of currencies) {
      for (const to of currencies) {
        if (from !== to) {
          try {
            const rate = await this.fetchRateFromAPI(from, to)
            await this.saveRate(from, to, rate)
          } catch (error) {
            logError(error, { from, to })
          }
        }
      }
    }
  }
}
