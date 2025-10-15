"use client";
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../../lib/supabaseClient';
import { uploadVerificationImage } from '../../../lib/uploadImages';
import Navbar from '../../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function VerificarPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({
    carnet_frontal: null,
    carnet_trasero: null,
    foto_cara: null
  });
  const [previews, setPreviews] = useState({
    carnet_frontal: null,
    carnet_trasero: null,
    foto_cara: null
  });
  const [errors, setErrors] = useState({});

  const handleFileChange = (type, file) => {
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          [type]: 'Solo se permiten archivos de imagen'
        }));
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [type]: 'El archivo debe ser menor a 5MB'
        }));
        return;
      }

      // Limpiar errores
      setErrors(prev => ({
        ...prev,
        [type]: null
      }));

      // Actualizar archivo
      setFiles(prev => ({
        ...prev,
        [type]: file
      }));

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({
          ...prev,
          [type]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que todos los archivos estén presentes
    if (!files.carnet_frontal || !files.carnet_trasero || !files.foto_cara) {
      setErrors({
        general: 'Debes subir todas las imágenes requeridas'
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('👤 Current user:', user);
      console.log('🆔 User ID:', user.id);

      // Verificar si ya existe una solicitud pendiente
      const { data: existingRequest, error: checkError } = await supabase
        .from('verification_requests')
        .select('id, status')
        .eq('clerk_user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❗ Check error:', checkError);
        throw checkError;
      }

      if (existingRequest) {
        setErrors({
          general: 'Ya tienes una solicitud de verificación pendiente. Espera la revisión del equipo.'
        });
        setLoading(false);
        return;
      }

      // Subir las tres imágenes al bucket privado "verificacion"
      console.log('📤 Subiendo imágenes...');
      
      // Usar el user.id de Clerk directamente
      const userFolder = user.id;
      
      const uploadPromises = [
        uploadVerificationImage(files.carnet_frontal, `${userFolder}/carnet_frontal`),
        uploadVerificationImage(files.carnet_trasero, `${userFolder}/carnet_trasero`),
        uploadVerificationImage(files.foto_cara, `${userFolder}/foto_cara`)
      ];
      
      const [carnetFrontal, carnetTrasero, fotoCara] = await Promise.all(uploadPromises);

      console.log('✅ Imágenes subidas:', { carnetFrontal, carnetTrasero, fotoCara });

      // Guardar la solicitud de verificación en la base de datos
      const insertData = {
        clerk_user_id: user.id,
        carnet_frontal_path: carnetFrontal.path,
        carnet_trasero_path: carnetTrasero.path,
        foto_cara_path: fotoCara.path,
        status: 'pending',
        submitted_at: new Date().toISOString()
      };

      console.log('💾 Datos a insertar:', insertData);

      const { data: newRequest, error } = await supabase
        .from('verification_requests')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('💥 Database error:', error);
        throw error;
      }

      console.log('✅ Solicitud guardada:', newRequest);

      // Redirigir de vuelta al perfil con mensaje de éxito
      router.push('/perfil?verification=submitted');

    } catch (error) {
      console.error('💥 Error submitting verification:', error);
      setErrors({
        general: `Error al enviar la verificación: ${error.message || 'Inténtalo de nuevo.'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (type) => {
    setFiles(prev => ({
      ...prev,
      [type]: null
    }));
    setPreviews(prev => ({
      ...prev,
      [type]: null
    }));
    setErrors(prev => ({
      ...prev,
      [type]: null
    }));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verificar Cuenta</h1>
            <p className="text-gray-600">
              Para verificar tu cuenta, necesitamos que subas los siguientes documentos:
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Carnet Frontal */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                📄 Carnet de Identidad (Frontal)
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Sube una foto clara del frente de tu carnet de identidad
              </p>
              
              {!files.carnet_frontal ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-gray-600">
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500 font-medium">Subir archivo</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange('carnet_frontal', e.target.files[0])}
                        />
                      </label>
                      <p className="text-sm">PNG, JPG hasta 5MB</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative max-w-md mx-auto">
                  <img
                    src={previews.carnet_frontal}
                    alt="Carnet frontal"
                    className="w-full rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile('carnet_frontal')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              {errors.carnet_frontal && (
                <p className="mt-2 text-sm text-red-600">{errors.carnet_frontal}</p>
              )}
            </div>

            {/* Carnet Trasero */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                📄 Carnet de Identidad (Trasero)
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Sube una foto clara del reverso de tu carnet de identidad
              </p>
              
              {!files.carnet_trasero ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-gray-600">
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500 font-medium">Subir archivo</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange('carnet_trasero', e.target.files[0])}
                        />
                      </label>
                      <p className="text-sm">PNG, JPG hasta 5MB</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative max-w-md mx-auto">
                  <img
                    src={previews.carnet_trasero}
                    alt="Carnet trasero"
                    className="w-full rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile('carnet_trasero')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              {errors.carnet_trasero && (
                <p className="mt-2 text-sm text-red-600">{errors.carnet_trasero}</p>
              )}
            </div>

            {/* Foto de cara */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                📸 Foto de tu Rostro
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Sube una selfie clara donde se vea tu rostro completo
              </p>
              
              {!files.foto_cara ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-gray-600">
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500 font-medium">Subir archivo</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange('foto_cara', e.target.files[0])}
                        />
                      </label>
                      <p className="text-sm">PNG, JPG hasta 5MB</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative max-w-md mx-auto">
                  <img
                    src={previews.foto_cara}
                    alt="Foto de cara"
                    className="w-full rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile('foto_cara')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              {errors.foto_cara && (
                <p className="mt-2 text-sm text-red-600">{errors.foto_cara}</p>
              )}
            </div>

            {/* Información importante */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc space-y-1 pl-5">
                      <li>Asegúrate de que todas las fotos sean claras y legibles</li>
                      <li>La información del carnet debe coincidir con tu perfil</li>
                      <li>El proceso de verificación puede tomar 1-3 días hábiles</li>
                      <li>Una vez enviado, no podrás modificar los documentos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading || !files.carnet_frontal || !files.carnet_trasero || !files.foto_cara}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Verificación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}