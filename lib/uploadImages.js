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

// Función específica para subir imágenes de verificación
export const uploadVerificationImage = async (file, path) => {
  try {
    console.log('🔄 Starting upload for:', path);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    console.log('📁 Full file path:', filePath);

    // Subir al bucket privado "verificacion"
    const { data, error } = await supabase.storage
      .from('verificacion')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    console.log('📤 Upload result:', { data, error });

    if (error) {
      console.error('💥 Upload error:', error);
      throw error;
    }

    // Para buckets privados, devolvemos solo el path
    // No necesitamos URL firmada aquí, se generará cuando se necesite
    return {
      path: data.path,
      fullPath: data.fullPath
    };
  } catch (error) {
    console.error('💥 Error uploading verification image:', error);
    throw error;
  }
};

// Función para obtener URLs firmadas de imágenes de verificación
export const getVerificationImageUrl = async (path) => {
  try {
    console.log('🔗 Getting signed URL for:', path);
    
    const { data, error } = await supabase.storage
      .from('verificacion')
      .createSignedUrl(path, 60 * 60 * 24 * 7); // URL válida por 1 semana

    if (error) {
      console.error('💥 Error getting signed URL:', error);
      throw error;
    }
    
    console.log('✅ Signed URL generated:', data.signedUrl);
    return data.signedUrl;
  } catch (error) {
    console.error('💥 Error getting verification image URL:', error);
    throw error;
  }
};