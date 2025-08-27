'use client'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { useUserProfile } from '../hooks/useUserProfile'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const { user, isLoaded } = useUser()
  const { profile, isViajero, isEmprendedor } = useUserProfile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Agregar más enlaces de navegación
  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/experiencias', label: 'Experiencias' },
    { href: '/como-funciona', label: 'Cómo Funciona' },
    { href: '/sobre-nosotros', label: 'Sobre Nosotros' }
  ]

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-40">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#23A69A]">
            ConfiaTour
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/experiencias" className="text-gray-700 hover:text-[#23A69A] transition-colors">
              Experiencias
            </Link>
            
            {/* Enlaces específicos para emprendedores */}
            {isEmprendedor && (
              <>
                <Link href="/experiencias/crear" className="text-gray-700 hover:text-[#23A69A] transition-colors">
                  Crear Experiencia
                </Link>
                <Link href="/mis-experiencias" className="text-gray-700 hover:text-[#23A69A] transition-colors">
                  Mis Experiencias
                </Link>
              </>
            )}
            
            {/* Enlaces específicos para viajeros */}
            {isViajero && (
              <Link href="/mis-reservas" className="text-gray-700 hover:text-[#23A69A] transition-colors">
                Mis Reservas
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {!isLoaded && (
              <div className="text-gray-500">Cargando...</div>
            )}
            
            {isLoaded && !user && (
              <>
                <SignInButton mode="modal">
                  <button className="text-gray-700 hover:text-[#23A69A] transition-colors">
                    Iniciar sesión
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-[#23A69A] text-white px-4 py-2 rounded-lg hover:bg-[#23A69A]/90 transition-colors">
                    Registrarse
                  </button>
                </SignUpButton>
              </>
            )}
            
            {isLoaded && user && (
              <div className="flex items-center space-x-3">
                {profile && (
                  <span className="text-sm text-gray-600">
                    {isViajero ? '🧳' : isEmprendedor ? '🏪' : ''} {profile.nombre}
                  </span>
                )}
                <UserButton afterSignOutUrl="/" />
              </div>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-black/5 mt-4">
            <div className="flex flex-col gap-2 pt-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[#1C1C1C] font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}