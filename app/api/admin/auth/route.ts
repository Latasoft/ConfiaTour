import { NextRequest, NextResponse } from 'next/server'
import { validateAdminCredentials } from '@/lib/utils/auth'
import { SignJWT, jwtVerify } from 'jose'

// Secret para JWT (debe estar en variables de entorno)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

/**
 * POST /api/admin/auth - Login de admin con credenciales
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username y password son requeridos' },
        { status: 400 }
      )
    }

    // Validar credenciales
    const isValid = validateAdminCredentials(username, password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Crear JWT token
    const token = await new SignJWT({ 
      username, 
      role: 'admin',
      type: 'admin-credentials'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    // Devolver token
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: { username, role: 'admin' }
    })

    // Establecer cookie httpOnly
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error en login de admin:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/auth - Logout de admin
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logout exitoso' })
  
  response.cookies.delete('admin-token')
  
  return response
}

/**
 * GET /api/admin/auth - Verificar sesión de admin
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Verificar token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    return NextResponse.json({
      authenticated: true,
      user: {
        username: payload.username,
        role: payload.role,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Token inválido' },
      { status: 401 }
    )
  }
}
