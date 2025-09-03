import { supabase } from './supabaseClient'

export async function uploadImage(file, userId, carpeta = 'experiencias') {
  try {
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}_${Date.now()}.${fileExt}`
    const filePath = `${carpeta}/${fileName}`

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen')
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen no puede ser mayor a 5MB')
    }

    const { data, error } = await supabase.storage
      .from('Fotos')
      .upload(filePath, file)

    if (error) throw error

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('Fotos')
      .getPublicUrl(filePath)

    return {
      path: data.path,
      url: publicUrl
    }
  } catch (error) {
    console.error('Error subiendo imagen:', error)
    throw error
  }
}

export async function uploadMultipleImages(files, userId, carpeta = 'experiencias') {
  try {
    const uploadPromises = Array.from(files).map(file => 
      uploadImage(file, userId, carpeta)
    )
    
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.error('Error subiendo múltiples imágenes:', error)
    throw error
  }
}

export async function deleteImage(filePath) {
  try {
    const { error } = await supabase.storage
      .from('Fotos')
      .remove([filePath])

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error eliminando imagen:', error)
    throw error
  }
}

export function getImageUrl(imagePath) {
  if (!imagePath) return null
  
  // Si ya es una URL completa, devolverla
  if (imagePath.startsWith('http')) return imagePath
  
  // Obtener URL pública del storage
  const { data: { publicUrl } } = supabase.storage
    .from('Fotos')
    .getPublicUrl(imagePath)
  
  return publicUrl
}