import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { UnauthorizedError, ForbiddenError } from './errors'

/**
 * Lista de emails autorizados como admin
 */
const getAdminEmails = (): string[] => {
  const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  if (!emails) {
    console.warn('⚠️ NEXT_PUBLIC_ADMIN_EMAILS no está configurado')
    return []
  }
  return emails.split(',').map((email) => email.trim())
}

export const ADMIN_EMAILS = getAdminEmails()

/**
 * Verifica si un email es admin
 */
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
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
      console.warn(`⚠️ Intento de acceso admin no autorizado: ${userEmail}`)
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
