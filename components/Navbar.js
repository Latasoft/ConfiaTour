'use client'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const { user, isLoaded } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f6f4f2]/90 border-b border-black/5">
      <div className="max-w-6xl mx-auto px-5">
        <nav className="flex items-center justify-between py-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-gradient-to-br from-[#F2C14E] via-[#C4533D] to-[#23A69A] shadow-inner border-2 border-black/10">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <h1 className="text-xl font-extrabold text-[#1C1C1C] tracking-wide">
              ConfiaTour
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#explorar" className="px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[#1C1C1C] font-medium">
              Explorar
            </a>
            <a href="#corredor" className="px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[#1C1C1C] font-medium">
              Corredor
            </a>
            <a href="#comunidades" className="px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[#1C1C1C] font-medium">
              Comunidades
            </a>
            <Link href="/experiencias" className="px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[#1C1C1C] font-medium">
              Experiencias
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isLoaded ? (
              user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden sm:block text-sm text-[#6C3C2D] font-medium">
                    ¡Hola, {user.firstName}!
                  </span>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="bg-[#C4533D] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#C4533D]/90 transition-colors">
                    Iniciar Sesión
                  </button>
                </SignInButton>
              )
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
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
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-black/5 mt-4">
            <div className="flex flex-col gap-2 pt-4">
              <a href="#explorar" className="px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[#1C1C1C] font-medium">
                Explorar
              </a>
              <a href="#corredor" className="px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[#1C1C1C] font-medium">
                Corredor
              </a>
              <a href="#comunidades" className="px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[#1C1C1C] font-medium">
                Comunidades
              </a>
              <Link href="/experiencias" className="px-3 py-2 rounded-xl hover:bg-black/5 transition-colors text-[#1C1C1C] font-medium">
                Experiencias
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}