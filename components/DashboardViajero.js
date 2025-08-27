'use client'
import Link from 'next/link'

export default function DashboardViajero({ profile }) {
  return (
    <div className="bg-blue-50 p-6 rounded-xl mb-8">
      <h2 className="text-2xl font-bold mb-4">
        ¡Hola {profile.nombre}! 🧳
      </h2>
      <p className="text-gray-600 mb-4">
        Explora experiencias increíbles y vive aventuras únicas
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/experiencias" className="bg-white p-4 rounded-lg hover:shadow-lg transition-shadow">
          <h3 className="font-bold">🔍 Explorar Experiencias</h3>
          <p className="text-sm text-gray-600">Descubre nuevas aventuras</p>
        </Link>
        <Link href="/mis-reservas" className="bg-white p-4 rounded-lg hover:shadow-lg transition-shadow">
          <h3 className="font-bold">📅 Mis Reservas</h3>
          <p className="text-sm text-gray-600">Ver mis próximos viajes</p>
        </Link>
        <Link href="/perfil" className="bg-white p-4 rounded-lg hover:shadow-lg transition-shadow">
          <h3 className="font-bold">👤 Mi Perfil</h3>
          <p className="text-sm text-gray-600">Actualizar información</p>
        </Link>
      </div>
    </div>
  )
}