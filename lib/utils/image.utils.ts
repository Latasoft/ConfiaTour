/**
 * Utilidades para manejo de imágenes
 */

/**
 * Parsea datos de imágenes de diferentes formatos a un array de strings
 */
export function parseImagenes(imagenesData: any): string[] {
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

/**
 * Valida que una URL de imagen sea válida
 */
export function validarImagenUrl(imagenUrl: any): string | null {
  if (!imagenUrl || typeof imagenUrl !== 'string') return null
  
  // Si ya es una URL completa (http/https), devolverla
  if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
    return imagenUrl
  }
  
  // Si empieza con /, es una ruta válida
  if (imagenUrl.startsWith('/')) {
    return imagenUrl
  }
  
  return null
}

/**
 * Obtiene la primera imagen válida de un array o un placeholder
 */
export function getPrimeraImagenOPlaceholder(imagenes: any, placeholder = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'): string {
  const imagenesArray = parseImagenes(imagenes)
  const primeraImagen = imagenesArray.length > 0 ? validarImagenUrl(imagenesArray[0]) : null
  return primeraImagen || placeholder
}

/**
 * Valida el tipo MIME de una imagen
 */
export function validarTipoImagen(file: File): boolean {
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  return tiposPermitidos.includes(file.type)
}

/**
 * Valida el tamaño de una imagen
 */
export function validarTamanoImagen(file: File, maxSizeMB = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Valida dimensiones de imagen
 */
export async function validarDimensionesImagen(file: File, maxWidth = 4096, maxHeight = 4096): Promise<{ valid: boolean; width?: number; height?: number; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const valid = img.width <= maxWidth && img.height <= maxHeight
      resolve({
        valid,
        width: img.width,
        height: img.height,
        error: valid ? undefined : `Dimensiones excedidas: ${img.width}x${img.height} (máximo ${maxWidth}x${maxHeight})`
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({
        valid: false,
        error: 'No se pudo cargar la imagen'
      })
    }
    
    img.src = objectUrl
  })
}

/**
 * Validación completa de imagen
 */
export async function validarImagen(file: File): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []
  
  // Validar tipo
  if (!validarTipoImagen(file)) {
    errors.push('Tipo de archivo no permitido. Use JPG, PNG, WebP o GIF')
  }
  
  // Validar tamaño
  if (!validarTamanoImagen(file, 5)) {
    errors.push('El archivo no puede ser mayor a 5MB')
  }
  
  // Validar dimensiones
  const dimensiones = await validarDimensionesImagen(file)
  if (!dimensiones.valid && dimensiones.error) {
    errors.push(dimensiones.error)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
