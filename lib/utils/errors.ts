/**
 * Manejo centralizado de errores
 */

export class AppError extends Error {
  statusCode: number
  code: string
  isOperational: boolean

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

/**
 * Formatea un error para mostrar al usuario
 */
export function formatErrorForUser(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'Ha ocurrido un error inesperado'
}

/**
 * Log de errores (puede conectarse a Sentry, LogRocket, etc.)
 */
export function logError(error: unknown, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error:', error)
    if (context) {
      console.error('📋 Context:', context)
    }
  }
  
  // TODO: Conectar a servicio de logging (Sentry, etc.)
  // Sentry.captureException(error, { extra: context })
}

/**
 * Maneja errores de forma segura
 */
export async function handleError<T>(
  promise: Promise<T>,
  errorMessage?: string
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise
    return [data, null]
  } catch (error) {
    logError(error, { customMessage: errorMessage })
    return [null, error as Error]
  }
}

/**
 * Wrapper para funciones async con manejo de errores
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error, { function: fn.name, errorMessage })
      throw error
    }
  }) as T
}
