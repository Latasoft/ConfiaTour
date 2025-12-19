'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { usePathname } from 'next/navigation'

// Obtener emails de admin desde variable de entorno
const getAdminEmails = () => {
  const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  if (!emails) return []
  return emails.split(',').map(email => email.trim().toLowerCase())
}

const ADMIN_EMAILS = getAdminEmails()

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const { user, isLoaded } = useUser()
  const pathname = usePathname()

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, verified')
        .eq('clerk_user_id', user.id)
        .maybeSingle()

      if (data) {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }, [user?.id])

  // Detectar scroll para efecto glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Verificar si el usuario es admin y obtener perfil
  useEffect(() => {
    if (isLoaded && user) {
      const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase()
      setIsAdmin(userEmail ? ADMIN_EMAILS.includes(userEmail) : false)
      
      // Obtener perfil del usuario
      fetchUserProfile()
    } else {
      setIsAdmin(false)
      setUserProfile(null)
    }
  }, [isLoaded, user, fetchUserProfile])

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const isVerifiedGuide = userProfile?.user_type === 'guia' && userProfile?.verified

  // Helper para determinar si un link está activo
  const isActiveLink = (href) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-100' 
        : 'bg-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo con animación */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="relative">
              <span className="text-3xl font-bold bg-gradient-to-r from-[#23A69A] to-[#1d8a80] bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                ConfiaTour
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#23A69A] to-[#1d8a80] group-hover:w-full transition-all duration-300"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/experiencias" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActiveLink('/experiencias')
                  ? 'text-[#23A69A] bg-[#23A69A]/10'
                  : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
              }`}
            >
              Experiencias
            </Link>
            <Link 
              href="/como-funciona" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActiveLink('/como-funciona')
                  ? 'text-[#23A69A] bg-[#23A69A]/10'
                  : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
              }`}
            >
              Cómo Funciona
            </Link>
            <Link 
              href="/sobre-nosotros" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActiveLink('/sobre-nosotros')
                  ? 'text-[#23A69A] bg-[#23A69A]/10'
                  : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
              }`}
            >
              Sobre Nosotros
            </Link>

            {/* Enlaces autenticados */}
            <SignedIn>
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              
              <Link 
                href="/mis-reservas" 
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActiveLink('/mis-reservas')
                    ? 'text-[#23A69A] bg-[#23A69A]/10'
                    : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
                }`}
              >
                Mis Reservas
              </Link>
              
              {/* Botón "Ser Guía" para viajeros */}
              {userProfile?.user_type === 'viajero' && (
                <Link 
                  href="/perfil/verificar" 
                  className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ser Guía
                  </span>
                </Link>
              )}
              
              {/* Enlaces de guía verificado */}
              {isVerifiedGuide && (
                <>
                  <Link 
                    href="/mis-experiencias" 
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActiveLink('/mis-experiencias')
                        ? 'text-[#23A69A] bg-[#23A69A]/10'
                        : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
                    }`}
                  >
                    Mis Experiencias
                  </Link>
                  <Link 
                    href="/experiencias/crear" 
                    className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#23A69A] to-[#1d8a80] text-white font-medium hover:from-[#1d8a80] hover:to-[#167368] transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Crear Experiencia
                    </span>
                  </Link>
                </>
              )}
              
              {/* Panel Admin */}
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </span>
                </Link>
              )}
            </SignedIn>
          </div>

          {/* Auth Section Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <SignedOut>
              <SignInButton>
                <button className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:text-[#23A69A] hover:bg-gray-50 transition-all duration-200">
                  Iniciar Sesión
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#23A69A] to-[#1d8a80] text-white font-medium hover:from-[#1d8a80] hover:to-[#167368] transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                  Registrarse
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3">
                <Link 
                  href="/perfil" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActiveLink('/perfil')
                      ? 'text-[#23A69A] bg-[#23A69A]/10'
                      : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
                  }`}
                >
                  Mi Perfil
                </Link>
                <div className="scale-110">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 ring-2 ring-[#23A69A]/20 hover:ring-[#23A69A]/40 transition-all"
                      }
                    }}
                  />
                </div>
              </div>
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg 
              className={`w-6 h-6 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-1 border-t border-gray-100">
            {/* Enlaces públicos */}
            <Link
              href="/experiencias"
              className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActiveLink('/experiencias')
                  ? 'text-[#23A69A] bg-[#23A69A]/10'
                  : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
              }`}
            >
              Experiencias
            </Link>
            <Link
              href="/como-funciona"
              className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActiveLink('/como-funciona')
                  ? 'text-[#23A69A] bg-[#23A69A]/10'
                  : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
              }`}
            >
              Cómo Funciona
            </Link>
            <Link
              href="/sobre-nosotros"
              className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActiveLink('/sobre-nosotros')
                  ? 'text-[#23A69A] bg-[#23A69A]/10'
                  : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
              }`}
            >
              Sobre Nosotros
            </Link>

            {/* Sección autenticada */}
            <SignedIn>
              <div className="h-px bg-gray-200 my-3"></div>
              
              <Link
                href="/mis-reservas"
                className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActiveLink('/mis-reservas')
                    ? 'text-[#23A69A] bg-[#23A69A]/10'
                    : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
                }`}
              >
                Mis Reservas
              </Link>

              <Link
                href="/perfil"
                className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActiveLink('/perfil')
                    ? 'text-[#23A69A] bg-[#23A69A]/10'
                    : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
                }`}
              >
                Mi Perfil
              </Link>
              
              {/* Botón "Ser Guía" */}
              {userProfile?.user_type === 'viajero' && (
                <Link
                  href="/perfil/verificar"
                  className="block mx-4 my-2 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm text-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ser Guía
                  </span>
                </Link>
              )}
              
              {/* Enlaces de guía */}
              {isVerifiedGuide && (
                <>
                  <div className="h-px bg-gray-200 my-3"></div>
                  <Link
                    href="/mis-experiencias"
                    className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActiveLink('/mis-experiencias')
                        ? 'text-[#23A69A] bg-[#23A69A]/10'
                        : 'text-gray-700 hover:text-[#23A69A] hover:bg-gray-50'
                    }`}
                  >
                    Mis Experiencias
                  </Link>
                  <Link
                    href="/experiencias/crear"
                    className="block mx-4 my-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#23A69A] to-[#1d8a80] text-white font-medium hover:from-[#1d8a80] hover:to-[#167368] transition-all duration-200 shadow-sm text-center"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Crear Experiencia
                    </span>
                  </Link>
                </>
              )}
              
              {/* Panel Admin */}
              {isAdmin && (
                <>
                  <div className="h-px bg-gray-200 my-3"></div>
                  <Link
                    href="/admin"
                    className="block mx-4 my-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm text-center"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Panel Admin
                    </span>
                  </Link>
                </>
              )}
            </SignedIn>

            {/* Auth para mobile */}
            <SignedOut>
              <div className="h-px bg-gray-200 my-3"></div>
              <div className="px-4 py-2 space-y-3">
                <SignInButton>
                  <button className="w-full px-4 py-3 rounded-lg font-medium text-gray-700 hover:text-[#23A69A] hover:bg-gray-50 transition-all duration-200 text-center border border-gray-200">
                    Iniciar Sesión
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#23A69A] to-[#1d8a80] text-white font-medium hover:from-[#1d8a80] hover:to-[#167368] transition-all duration-200 shadow-sm text-center">
                    Registrarse
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="h-px bg-gray-200 my-3"></div>
              <div className="px-4 py-3 flex items-center justify-between bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 font-medium">Mi cuenta</span>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-[#23A69A]/20"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}