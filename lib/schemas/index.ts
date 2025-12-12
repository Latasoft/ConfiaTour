import { z } from 'zod'

// Schema para Experiencias
export const experienciaSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  descripcion: z.string().min(20, 'La descripción debe tener al menos 20 caracteres').max(5000),
  categoria: z.enum(['turismo', 'gastronomia', 'aventura', 'naturaleza', 'cultura', 'deportes', 'alojamiento', 'transporte', 'tours']),
  ubicacion: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres'),
  precio: z.number().positive('El precio debe ser mayor a 0').max(1000000),
  moneda: z.enum(['USD', 'ARS', 'CLP', 'BRL', 'PYG']),
  capacidad: z.number().int().positive().min(1).max(100),
  duracion: z.string().min(1),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  imagenes: z.array(z.string().url()).optional(),
})

export const experienciaCreateSchema = experienciaSchema.extend({
  usuario_id: z.string().min(1, 'Usuario ID requerido'),
})

// Schema para Reservas
export const reservaSchema = z.object({
  experiencia_id: z.string().uuid('ID de experiencia inválido'),
  usuario_id: z.string().min(1, 'Usuario ID requerido'),
  fecha_experiencia: z.string(),
  cantidad_personas: z.number().int().positive().min(1).max(50),
  precio_total: z.number().positive(),
  metodo_pago: z.enum(['transbank', 'mercadopago']),
})

export const reservaCancelSchema = z.object({
  reserva_id: z.string().uuid(),
  usuario_id: z.string().min(1),
})

// Schema para Reseñas
export const resenaSchema = z.object({
  experiencia_id: z.string().uuid(),
  usuario_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comentario: z.string().min(10, 'El comentario debe tener al menos 10 caracteres').max(1000),
})

// Schema para Perfil
export const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Teléfono inválido').optional(),
  bio: z.string().max(500).optional(),
  user_type: z.enum(['viajero', 'guia']).optional(),
})

// Schema para Filtros
export const filtrosSchema = z.object({
  categoria: z.enum(['turismo', 'gastronomia', 'aventura', 'naturaleza', 'cultura', 'deportes', 'alojamiento', 'transporte', 'tours']).optional(),
  ubicacion: z.string().optional(),
  precioMin: z.number().positive().optional(),
  precioMax: z.number().positive().optional(),
  fechaInicio: z.string().optional(),
  busqueda: z.string().optional(),
})

// Schema para Transbank
export const transbankCreateSchema = z.object({
  amount: z.number().positive().max(999999999),
  buyOrder: z.string().regex(/^[a-zA-Z0-9]{1,26}$/, 'Buy order debe ser alfanumérico, máximo 26 caracteres'),
  returnUrl: z.string().url('URL de retorno inválida'),
  sessionId: z.string().regex(/^[a-zA-Z0-9]{1,61}$/, 'Session ID debe ser alfanumérico, máximo 61 caracteres').optional(),
})

export const transbankConfirmSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
})

// Schema para Upload de Imágenes
export const imageUploadSchema = z.object({
  file: z.any(),
  userId: z.string().min(1),
  folder: z.string().default('experiencias'),
})

// Helper para validar datos
// Schema para Acciones de Admin
export const adminActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'toggle_disponibilidad', 'change_estado']),
  entityType: z.enum(['experiencia', 'reserva', 'usuario', 'verificacion']),
  entityId: z.string().uuid(),
  reason: z.string().optional(),
  newValue: z.any().optional(),
})

export const adminStatsFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoria: z.enum(['turismo', 'gastronomia', 'aventura', 'naturaleza', 'cultura', 'deportes', 'alojamiento', 'transporte', 'tours']).optional(),
  userType: z.enum(['viajero', 'guia', 'admin']).optional(),
})

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
      }
    }
    return {
      success: false,
      errors: ['Error de validación desconocido']
    }
  }
}
