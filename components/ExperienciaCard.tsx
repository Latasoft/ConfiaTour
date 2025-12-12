'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Experiencia } from '@/types'
import { getPrimeraImagenOPlaceholder } from '@/lib/utils/image.utils'
import { formatearMoneda } from '@/lib/utils/format.utils'

interface ExperienciaCardProps {
  experiencia: Experiencia
}

export default function ExperienciaCard({ experiencia }: ExperienciaCardProps) {
  const imagenUrl = getPrimeraImagenOPlaceholder(experiencia.imagenes)
  const precioFormateado = formatearMoneda(experiencia.precio, experiencia.moneda)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={imagenUrl}
          alt={experiencia.titulo}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
          }}
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg">
          <span className="text-sm font-medium text-[#23A69A]">
            {precioFormateado}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full capitalize">
            {experiencia.categoria}
          </span>
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="text-sm ml-1">
              {experiencia.rating_promedio > 0 ? experiencia.rating_promedio.toFixed(1) : 'N/A'}
            </span>
          </div>
        </div>
        
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{experiencia.titulo}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{experiencia.descripcion}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {experiencia.ubicacion}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span>Duración: {experiencia.duracion}</span>
          </div>
          <Link
            href={`/experiencias/${experiencia.id}`}
            className="bg-[#23A69A] text-white px-4 py-2 rounded-lg hover:bg-[#1e8a7e] transition-colors"
          >
            Ver Detalle
          </Link>
        </div>
      </div>
    </div>
  )
}
