'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSession } from '@clerk/nextjs'
import { uploadMultipleImages, deleteImage } from '@/lib/uploadImages'
import { createClerkSupabaseClient } from '@/lib/supabaseClient'

export interface ImageData {
  url: string
  path?: string
}

interface ImageUploaderProps {
  images: ImageData[]
  onChange: (images: ImageData[]) => void
  userId: string
  maxImages?: number
  disabled?: boolean
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  userId,
  maxImages = 10,
  disabled = false
}) => {
  const { session } = useSession()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Validar cantidad máxima
    if (images.length + files.length > maxImages) {
      alert(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    try {
      setUploading(true)
      setUploadProgress(`Subiendo ${files.length} imagen(es)...`)

      // Validar que haya sesión
      if (!session) {
        throw new Error('No hay sesión activa')
      }

      // Crear cliente autenticado de Supabase con token de Clerk
      const authenticatedSupabase = await createClerkSupabaseClient(session)

      const uploadedImages = await uploadMultipleImages(files, userId, 'experiencias', authenticatedSupabase as any)
      
      const newImages: ImageData[] = uploadedImages.map(img => ({
        url: img.url,
        path: img.path
      }))
      
      onChange([...images, ...newImages])
      setUploadProgress('')
      
    } catch (error: any) {
      console.error('Error subiendo imágenes:', error)
      alert('Error al subir las imágenes: ' + error.message)
      setUploadProgress('')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleRemoveImage = async (index: number) => {
    try {
      const imageToRemove = images[index]
      
      // Si tiene path, eliminar del storage
      if (imageToRemove.path) {
        await deleteImage(imageToRemove.path)
      }
      
      const updatedImages = images.filter((_, i) => i !== index)
      onChange(updatedImages)
      
    } catch (error) {
      console.error('Error eliminando imagen:', error)
      alert('Error al eliminar la imagen')
    }
  }

  return (
    <div className="space-y-4">
      {/* Input de archivo */}
      <div>
        <label
          className={`block w-full p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
            disabled || uploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-[#23A69A] hover:bg-[#23A69A]/5'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading || images.length >= maxImages}
            className="hidden"
          />
          <div className="text-sm">
            {uploading ? (
              <span className="text-gray-600">{uploadProgress}</span>
            ) : (
              <>
                <span className="text-[#23A69A] font-medium">Haz clic para subir</span>
                <span className="text-gray-500"> o arrastra imágenes aquí</span>
                <div className="text-xs text-gray-400 mt-1">
                  {images.length}/{maxImages} imágenes
                </div>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={image.url}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                disabled={disabled}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600"
                title="Eliminar imagen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje de ayuda */}
      {images.length === 0 && !uploading && (
        <p className="text-sm text-gray-500 text-center">
          No hay imágenes. La primera imagen será la principal.
        </p>
      )}
    </div>
  )
}
