'use client'
import Link from 'next/link'

export default function DashboardEmprendedor({ profile }) {
  return (
    <div className="bg-green-50 p-6 rounded-xl mb-8">
      <h2 className="text-2xl font-bold mb-4">
        ¡Hola {profile.nombre}! 🏪
      </h2>
      <p className="text-gray-600 mb-4">
        Gestiona tus experiencias y haz crecer tu negocio
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/experiencias/crear" className="bg-white p-4 rounded-lg hover:shadow-lg transition-shadow">
          <h3 className="font-bold">➕ Crear Experiencia</h3>
          <p className="text-sm text-gray-600">Publica una nueva experiencia</p>
        </Link>
        <Link href="/mis-experiencias" className="bg-white p-4 rounded-lg hover:shadow-lg transition-shadow">
          <h3 className="font-bold">📊 Mis Experiencias</h3>
          <p className="text-sm text-gray-600">Gestionar mis publicaciones</p>
        </Link>
        <Link href="/ventas" className="bg-white p-4 rounded-lg hover:shadow-lg transition-shadow">
          <h3 className="font-bold">💰 Ventas</h3>
          <p className="text-sm text-gray-600">Ver mis ingresos</p>
        </Link>
      </div>
    </div>
  )
}