'use client'
import Link from 'next/link'
import { useState } from 'react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Enlaces de navegación públicos
  const publicNavLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/experiencias', label: 'Experiencias' },
    { href: '/como-funciona', label: 'Cómo Funciona' },
    { href: '/sobre-nosotros', label: 'Sobre Nosotros' }
  ]

  // Enlaces de navegación para usuarios autenticados
  const authNavLinks = [
    { href: '/mis-experiencias', label: 'Mis Experiencias' },
    { href: '/experiencias/crear', label: 'Crear Experiencia' },
    { href: '/mis-reservas', label: 'Mis Reservas' }
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
            <Link href="/como-funciona" className="text-gray-700 hover:text-[#23A69A] transition-colors">
              Cómo Funciona
            </Link>
            <Link href="/sobre-nosotros" className="text-gray-700 hover:text-[#23A69A] transition-colors">
              Sobre Nosotros
            </Link>
            
            {/* Enlaces solo para usuarios autenticados */}
            <SignedIn>
              <Link href="/mis-experiencias" className="text-gray-700 hover:text-[#23A69A] transition-colors">
                Mis Experiencias
              </Link>
              <Link href="/experiencias/crear" className="text-gray-700 hover:text-[#23A69A] transition-colors">
                Crear Experiencia
              </Link>
            </SignedIn>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton>
                <button className="text-gray-700 hover:text-[#23A69A] transition-colors font-medium">
                  Iniciar Sesión
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-[#23A69A] text-white rounded-full font-medium text-sm px-4 py-2 hover:bg-[#1d8a80] transition-colors">
                  Registrarse
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-black/5 mt-4">
            <div className="flex flex-col gap-2 pt-4">
              {/* Enlaces públicos */}
              {publicNavLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[#1C1C1C] font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Enlaces para usuarios autenticados */}
              <SignedIn>
                {authNavLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[#1C1C1C] font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </SignedIn>
              
              {/* Auth options for mobile */}
              <div className="flex flex-col gap-2 mt-4 px-3">
                <SignedOut>
                  <SignInButton>
                    <button className="text-left py-2 text-gray-700 hover:text-[#23A69A] transition-colors font-medium">
                      Iniciar Sesión
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-[#23A69A] text-white rounded-full font-medium text-sm px-4 py-2 hover:bg-[#1d8a80] transition-colors">
                      Registrarse
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <div className="py-2">
                    <UserButton />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}