// Types para Experiencias
export interface Experiencia {
  id: string
  usuario_id: string
  titulo: string
  descripcion: string
  categoria: Categoria
  ubicacion: string
  precio: number
  moneda: Moneda
  capacidad: number
  duracion: string
  fecha_inicio?: string
  fecha_fin?: string
  imagenes: string[]
  disponible: boolean
  rating_promedio: number
  creado_en: string
  actualizado_en: string
}

export type Categoria = 
  | 'turismo' 
  | 'gastronomia' 
  | 'aventura' 
  | 'naturaleza' 
  | 'cultura' 
  | 'deportes'
  | 'alojamiento'
  | 'transporte'
  | 'tours'

export type Moneda = 'USD' | 'ARS' | 'CLP' | 'BRL' | 'PYG'

// Types para Reservas
export interface Reserva {
  id: string
  experiencia_id: string
  usuario_id: string
  fecha_reserva: string
  fecha_experiencia: string
  cantidad_personas: number
  precio_total: number
  estado: EstadoReserva
  metodo_pago: MetodoPago
  pagado: boolean
  buy_order?: string
  session_id?: string
  codigo_autorizacion?: string
  fecha_pago?: string
  fecha_cancelacion?: string
  detalles_pago?: any
  creado_en: string
  experiencias?: Experiencia
}

export type EstadoReserva = 'pendiente_pago' | 'confirmada' | 'cancelada' | 'completada'
export type MetodoPago = 'transbank' | 'mercadopago'

// Types para Perfil de Usuario
export interface Profile {
  id: string
  clerk_user_id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  bio?: string
  verified: boolean
  user_type: UserType
  created_at: string
  updated_at?: string
}

export type UserType = 'viajero' | 'guia' | 'admin'

// Types para Reseñas
export interface Resena {
  id: string
  experiencia_id: string
  usuario_id: string
  rating: number
  comentario: string
  creado_en: string
}

// Types para Filtros
export interface FiltrosExperiencias {
  categoria?: Categoria
  ubicacion?: string
  precioMin?: number
  precioMax?: number
  fechaInicio?: string
  busqueda?: string
}

// Types para Transbank
export interface TransbankTransaction {
  token: string
  url: string
  buyOrder: string
  sessionId: string
  amount: number
  returnUrl: string
}

export interface TransbankConfirmation {
  status: string
  statusDescription: string
  amount: number
  authorizationCode: string
  paymentTypeCode: string
  responseCode: number
  installmentsAmount?: number
  installmentsNumber?: number
  balance?: number
  cardDetail?: any
  accountingDate: string
  transactionDate: string
  vci?: string
  buyOrder: string
  sessionId: string
}

// Types para Mercado Pago
export interface MercadoPagoPreference {
  productId: string
  productName: string
  productDescription: string
  productPrice: number
  userEmail: string
}

// Types para Conversión de Monedas
export interface ExchangeRate {
  id: string
  from_currency: Moneda
  to_currency: Moneda
  rate: number
  updated_at: string
}

// Types para Upload de Imágenes
export interface UploadedImage {
  path: string
  url: string
}

export interface ImageValidationResult {
  valid: boolean
  error?: string
  width?: number
  height?: number
}

// Types para Estadísticas de Admin
export interface ReservasStats {
  total: number
  confirmadas: number
  canceladas: number
  pendientes: number
  completadas: number
  ingresos_totales: number
  ingreso_promedio: number
}

export interface ExperienciasStats {
  total: number
  activas: number
  inactivas: number
  por_categoria: Record<Categoria, number>
  rating_promedio: number
  mas_reservadas: Array<{
    id: string
    titulo: string
    total_reservas: number
    ingresos: number
  }>
}

export interface UsersStats {
  total: number
  viajeros: number
  guias: number
  verificados: number
  no_verificados: number
}

export interface RevenueStats {
  total: number
  por_mes: Array<{
    mes: string
    ingresos: number
    reservas: number
  }>
  por_experiencia: Array<{
    experiencia_id: string
    titulo: string
    ingresos: number
  }>
}

export interface AdminStats {
  reservas: ReservasStats
  experiencias: ExperienciasStats
  usuarios: UsersStats
  ingresos: RevenueStats
}

// Types para Emails
export interface EmailTemplate {
  to: string
  subject: string
  html: string
  from?: string
}

export interface ReservaEmailData {
  reserva: Reserva
  experiencia: Experiencia
  usuario: {
    nombre: string
    email: string
  }
}
