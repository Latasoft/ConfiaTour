import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    // Verificar autenticación con Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { files, carpeta = 'experiencias' } = await request.json()

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron archivos' },
        { status: 400 }
      )
    }

    // Crear cliente de Supabase con service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const uploadedImages = []

    for (const fileData of files) {
      try {
        // Validar tipo de archivo
        if (!fileData.type.startsWith('image/')) {
          throw new Error(`${fileData.name} no es una imagen válida`)
        }

        // Convertir base64 a Buffer
        const base64Data = fileData.data.split(',')[1]
        const buffer = Buffer.from(base64Data, 'base64')

        // Validar tamaño (5MB máximo)
        if (buffer.length > 5 * 1024 * 1024) {
          throw new Error(`${fileData.name} excede el tamaño máximo de 5MB`)
        }

        // Generar nombre único
        const fileExt = fileData.name.split('.').pop()
        const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${carpeta}/${fileName}`

        // Subir a Supabase Storage usando service role
        const { data, error } = await supabaseAdmin.storage
          .from('Fotos')
          .upload(filePath, buffer, {
            contentType: fileData.type,
            upsert: false
          })

        if (error) {
          console.error('Error subiendo a Supabase:', error)
          throw new Error(`Error subiendo ${fileData.name}: ${error.message}`)
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('Fotos')
          .getPublicUrl(filePath)

        uploadedImages.push({
          path: data.path,
          url: publicUrl
        })

      } catch (fileError) {
        console.error(`Error procesando ${fileData.name}:`, fileError)
        throw fileError
      }
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages
    })

  } catch (error) {
    console.error('Error en upload:', error)
    return NextResponse.json(
      { error: error.message || 'Error al subir imágenes' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    // Verificar autenticación
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { path } = await request.json()

    if (!path) {
      return NextResponse.json(
        { error: 'No se proporcionó la ruta del archivo' },
        { status: 400 }
      )
    }

    // Crear cliente de Supabase con service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Eliminar archivo
    const { error } = await supabaseAdmin.storage
      .from('Fotos')
      .remove([path])

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    })

  } catch (error) {
    console.error('Error eliminando imagen:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar imagen' },
      { status: 500 }
    )
  }
}
