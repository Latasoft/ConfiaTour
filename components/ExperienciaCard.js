import Link from 'next/link'
import Image from 'next/image'

export default function ExperienciaCard({ experiencia }) {
  // Función segura para parsear imágenes
  const parseImagenes = (imagenesData) => {
    if (!imagenesData) return []
    
    try {
      if (Array.isArray(imagenesData)) return imagenesData
      
      if (typeof imagenesData === 'string') {
        if (imagenesData.trim() === '') return []
        return JSON.parse(imagenesData)
      }
      
      return []
    } catch (error) {
      console.warn('Error parseando imágenes:', error)
      return []
    }
  }

  // Función para validar y convertir URLs de imágenes
  const validarImagenUrl = (imagenUrl) => {
    if (!imagenUrl || typeof imagenUrl !== 'string') return null
    
    // Si ya es una URL completa (http/https), devolverla
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
      return imagenUrl
    }
    
    // Si empieza con /, es una ruta válida
    if (imagenUrl.startsWith('/')) {
      return imagenUrl
    }
    
    // Si es solo un nombre de archivo, convertirlo a ruta válida o usar placeholder
    // Puedes cambiar esta lógica según donde tengas las imágenes
    if (imagenUrl.includes('.')) {
      // Es un archivo, usar placeholder ya que no sabemos la ruta completa
      return null
    }
    
    return null
  }

  const imagenes = parseImagenes(experiencia.imagenes)
  const imagenValida = imagenes.length > 0 ? validarImagenUrl(imagenes[0]) : null
  
  // Imagen por defecto
  const imagenPlaceholder = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        {imagenValida ? (
          <Image
            src={imagenValida}
            alt={experiencia.titulo}
            fill
            className="object-cover"
            onError={(e) => {
              e.target.src = imagenPlaceholder
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">Sin imagen</p>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg">
          <span className="text-sm font-medium text-[#23A69A]">
            ${experiencia.precio} {experiencia.moneda}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {experiencia.categoria}
          </span>
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="text-sm ml-1">{experiencia.rating_promedio || 'N/A'}</span>
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