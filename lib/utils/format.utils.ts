/**
 * Utilidades para formateo y parseo de datos
 */

/**
 * Parseo seguro de JSON
 */
export function safeJSONParse<T = any>(data: any, fallback: T | null = null): T | null {
  if (!data) return fallback
  
  try {
    if (typeof data === 'string') {
      return JSON.parse(data)
    }
    return data
  } catch (error) {
    console.warn('Error parseando JSON:', error)
    return fallback
  }
}

/**
 * Formatea un número como moneda
 */
export function formatearMoneda(cantidad: number, moneda: string = 'USD'): string {
  const simbolos: Record<string, string> = {
    USD: '$',
    ARS: '$',
    CLP: '$',
    BRL: 'R$',
    PYG: '₲'
  }
  
  const simbolo = simbolos[moneda] || moneda
  
  return `${simbolo}${cantidad.toLocaleString('es-ES', {
    minimumFractionDigits: moneda === 'CLP' || moneda === 'PYG' ? 0 : 2,
    maximumFractionDigits: moneda === 'CLP' || moneda === 'PYG' ? 0 : 2
  })}`
}

/**
 * Formatea una fecha en formato legible
 */
export function formatearFecha(fecha: string | Date, incluirHora = false): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  
  const opciones: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  
  if (incluirHora) {
    opciones.hour = '2-digit'
    opciones.minute = '2-digit'
  }
  
  return date.toLocaleDateString('es-ES', opciones)
}

/**
 * Formatea fecha relativa (hace 2 días, etc.)
 */
export function formatearFechaRelativa(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  const ahora = new Date()
  const diferencia = ahora.getTime() - date.getTime()
  
  const segundos = Math.floor(diferencia / 1000)
  const minutos = Math.floor(segundos / 60)
  const horas = Math.floor(minutos / 60)
  const dias = Math.floor(horas / 24)
  const meses = Math.floor(dias / 30)
  const anos = Math.floor(dias / 365)
  
  if (segundos < 60) return 'hace un momento'
  if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
  if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`
  if (dias < 30) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`
  if (meses < 12) return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`
  return `hace ${anos} ${anos === 1 ? 'año' : 'años'}`
}

/**
 * Trunca un texto a un número máximo de caracteres
 */
export function truncarTexto(texto: string, maxLength: number, sufijo = '...'): string {
  if (texto.length <= maxLength) return texto
  return texto.substring(0, maxLength - sufijo.length) + sufijo
}

/**
 * Capitaliza la primera letra de un string
 */
export function capitalize(texto: string): string {
  if (!texto) return ''
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}

/**
 * Genera un ID único simple
 */
export function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Valida un email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Limpia un string de caracteres especiales
 */
export function limpiarString(texto: string): string {
  return texto.replace(/[^a-zA-Z0-9\s]/g, '').trim()
}

/**
 * Convierte un string a slug
 */
export function stringToSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
