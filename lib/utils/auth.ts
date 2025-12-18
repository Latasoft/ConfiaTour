import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { UnauthorizedError, ForbiddenError } from './errors'
import { supabase } from '../supabaseClient'

/**
 * Lista de emails autorizados como admin
 */
const getAdminEmails = (): string[] => {
  const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  if (!emails) {
    console.warn('[WARN] NEXT_PUBLIC_ADMIN_EMAILS no está configurado')
    return []
  }
  return emails.split(',').map((email) => email.trim())
}

export const ADMIN_EMAILS = getAdminEmails()

/**
 * Tipos de usuario válidos
 */
export type UserType = 'viajero' | 'guia' | 'admin'

/**
 * Obtiene el user_type de un usuario desde la base de datos
 */
export async function getUserType(clerkUserId: string): Promise<UserType | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error || !data) {
      console.warn(`[WARN] No se pudo obtener user_type para ${clerkUserId}`)
      return null
    }

    return data.user_type as UserType
  } catch (error) {
    console.error('Error obteniendo user_type:', error)
    return null
  }
}

/**
 * Verifica si un email es admin
 */
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Verifica si un usuario tiene un rol específico
 */
export async function hasRole(clerkUserId: string, role: UserType): Promise<boolean> {
  const userType = await getUserType(clerkUserId)
  return userType === role
}

/**
 * Verifica si un usuario es guía (verificado o no)
 */
export async function isGuia(clerkUserId: string): Promise<boolean> {
  return await hasRole(clerkUserId, 'guia')
}

/**
 * Verifica si un usuario es guía verificado
 */
export async function isGuiaVerificado(clerkUserId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_type, verified')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error || !data) return false

    return data.user_type === 'guia' && data.verified === true
  } catch (error) {
    console.error('Error verificando guía:', error)
    return false
  }
}

/**
 * Middleware para proteger rutas de admin
 * Uso en API routes:
 * 
 * const adminCheck = await requireAdmin()
 * if (adminCheck instanceof NextResponse) return adminCheck
 * 
 * // Continuar con lógica de admin
 */
export async function requireAdmin(): Promise<NextResponse | { userId: string; email: string }> {
  try {
    // 1. Verificar autenticación
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // 2. Obtener usuario completo
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      )
    }

    // 3. Verificar email
    const userEmail = user.emailAddresses[0]?.emailAddress
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email no encontrado' },
        { status: 401 }
      )
    }

    // 4. Verificar rol de admin
    if (!isAdmin(userEmail)) {
      console.warn(`[WARN] Intento de acceso admin no autorizado: ${userEmail}`)
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      )
    }

    console.log(`✅ Admin autenticado: ${userEmail}`)
    return { userId, email: userEmail }
  } catch (error) {
    console.error('Error en requireAdmin:', error)
    return NextResponse.json(
      { error: 'Error de autenticación' },
      { status: 500 }
    )
  }
}

/**
 * Versión que lanza excepciones (para usar con try-catch)
 */
export async function verifyAdmin(): Promise<{ userId: string; email: string }> {
  const { userId } = await auth()
  if (!userId) {
    throw new UnauthorizedError()
  }

  const user = await currentUser()
  if (!user) {
    throw new UnauthorizedError('Usuario no encontrado')
  }

  const userEmail = user.emailAddresses[0]?.emailAddress
  if (!userEmail) {
    throw new UnauthorizedError('Email no encontrado')
  }

  if (!isAdmin(userEmail)) {
    throw new ForbiddenError('Se requieren permisos de administrador')
  }

  return { userId, email: userEmail }
}
