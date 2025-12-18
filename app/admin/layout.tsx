'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AdminGuard } from '@/components/admin/AdminGuard'
import Navbar from '@/components/Navbar'
import { ChartBarIcon, TargetIcon, CalendarIcon, UserGroupIcon, BadgeCheckIcon } from '@/components/icons'

const adminRoutes = [
  { path: '/admin', label: 'Dashboard', icon: ChartBarIcon },
  { path: '/admin/experiencias', label: 'Experiencias', icon: TargetIcon },
  { path: '/admin/reservas', label: 'Reservas', icon: CalendarIcon },
  { path: '/admin/usuarios', label: 'Usuarios', icon: UserGroupIcon },
  { path: '/admin/verificaciones', label: 'Verificaciones', icon: BadgeCheckIcon },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <div className="flex">
          {/* Sidebar */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-white shadow-md min-h-screen pt-20
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#23A69A] mb-6">Panel Admin</h2>
              <nav className="space-y-2">
                {adminRoutes.map((route) => {
                  const isActive = pathname === route.path
                  const IconComponent = route.icon
                  return (
                    <Link
                      key={route.path}
                      href={route.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#23A69A] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{route.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">←</span>
                <span className="font-medium">Volver al Sitio</span>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24 lg:ml-0">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
