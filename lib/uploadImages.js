import { supabase } from './supabaseClient'

/**
 * Sube una imagen al storage de Supabase
 * @param {File} file - Archivo a subir
 * @param {string} userId - ID del usuario
 * @param {string} carpeta - Carpeta destino (experiencias, verificacion)
 * @param {Object} supabaseClient - Cliente de Supabase autenticado (opcional)
 * @returns {Promise<{path: string, url: string}>}
 */
export async function uploadImage(file, userId, carpeta = 'experiencias', supabaseClient = null) {
  try {
    // Usar cliente autenticado si se proporciona, sino usar el cliente básico
    const client = supabaseClient || supabase;
    
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

    const { data, error } = await client.storage
      .from('Fotos')
      .upload(filePath, file)

    if (error) throw error

    // Obtener URL pública
    const { data: { publicUrl } } = client.storage
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

export async function uploadMultipleImages(files, userId, carpeta = 'experiencias', supabaseClient = null) {
  try {
    const uploadPromises = Array.from(files).map(file => 
      uploadImage(file, userId, carpeta, supabaseClient)
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
export const uploadVerificationImage = async (file, path, supabaseClient = null) => {
  try {
    // Usar cliente autenticado si se proporciona, sino usar el cliente básico
    const client = supabaseClient || supabase;
    
    console.log('🔄 Starting verification upload for:', path);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `verificacion/${path}/${fileName}`;

    console.log('📁 Full file path:', filePath);

    // Usar el bucket 'Fotos' que ya funciona
    const { data, error } = await client.storage
      .from('Fotos') // Cambiar de 'verificacion' a 'Fotos'
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    console.log('📤 Upload result:', { data, error });

    if (error) {
      console.error('💥 Upload error:', error);
      throw error;
    }

    // Obtener URL pública ya que es bucket público
    const { data: { publicUrl } } = supabase.storage
      .from('Fotos')
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: publicUrl
    };
  } catch (error) {
    console.error('💥 Error uploading verification image:', error);
    throw error;
  }
};

// Función para obtener URLs de verificación
export const getVerificationImageUrl = async (path) => {
  try {
    console.log('🔗 Getting verification URL for:', path);
    
    const { data: { publicUrl } } = supabase.storage
      .from('Fotos') // Cambiar de 'verificacion' a 'Fotos'
      .getPublicUrl(path);
    
    console.log('✅ Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('💥 Error getting verification image URL:', error);
    throw error;
  }
};

const loadImageUrls = async (request) => {
  try {
    console.log('[DEBUG] Loading image URLs for request:', request.id);
    
    // Usar el bucket 'Fotos' para obtener URLs públicas
    const { data: { publicUrl: carnetFrontalUrl } } = supabase.storage
      .from('Fotos')
      .getPublicUrl(request.carnet_frontal_path);
      
    const { data: { publicUrl: carnetTraseroUrl } } = supabase.storage
      .from('Fotos')
      .getPublicUrl(request.carnet_trasero_path);
      
    const { data: { publicUrl: fotoCaraUrl } } = supabase.storage
      .from('Fotos')
      .getPublicUrl(request.foto_cara_path);

    console.log('[DEBUG] Image URLs loaded:', {
      carnet_frontal: carnetFrontalUrl,
      carnet_trasero: carnetTraseroUrl,
      foto_cara: fotoCaraUrl
    });

    setImageUrls({
      carnet_frontal: carnetFrontalUrl,
      carnet_trasero: carnetTraseroUrl,
      foto_cara: fotoCaraUrl
    });
  } catch (error) {
    console.error('💥 Error loading image URLs:', error);
  }
};