'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AdminGuard } from '@/components/admin/AdminGuard'
import Navbar from '@/components/Navbar'

const adminRoutes = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/experiencias', label: 'Experiencias', icon: '🎯' },
  { path: '/admin/reservas', label: 'Reservas', icon: '📅' },
  { path: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
  { path: '/admin/verificaciones', label: 'Verificaciones', icon: '✓' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-md min-h-screen pt-20">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#23A69A] mb-6">Panel Admin</h2>
              <nav className="space-y-2">
                {adminRoutes.map((route) => {
                  const isActive = pathname === route.path
                  return (
                    <Link
                      key={route.path}
                      href={route.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#23A69A] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{route.icon}</span>
                      <span className="font-medium">{route.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">←</span>
                <span className="font-medium">Volver al Sitio</span>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 pt-24">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
