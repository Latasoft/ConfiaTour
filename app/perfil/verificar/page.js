"use client";
import { useState } from 'react';
import { useUser, useSession } from '@clerk/nextjs';
import { supabase, createClerkSupabaseClient } from '../../../lib/supabaseClient';
import { uploadVerificationImage } from '../../../lib/uploadImages';
import Navbar from '../../../components/Navbar';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic'

export default function VerificarPage() {
  const { user, isLoaded } = useUser();
  const { session } = useSession(); // Hook para obtener sesión de Clerk
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    business_description: ''
  });
  const [idDocument, setIdDocument] = useState(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState(null);
  const [additionalDocs, setAdditionalDocs] = useState([]);
  const [additionalDocsPreview, setAdditionalDocsPreview] = useState([]);
  const [errors, setErrors] = useState({});

  const handleIdDocumentChange = (file) => {
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
        setErrors(prev => ({
          ...prev,
          idDocument: 'Solo se permiten imágenes o PDF'
        }));
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          idDocument: 'El archivo debe ser menor a 5MB'
        }));
        return;
      }

      // Limpiar errores
      setErrors(prev => ({
        ...prev,
        idDocument: null
      }));

      setIdDocument(file);

      // Crear preview solo para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setIdDocumentPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setIdDocumentPreview(null);
      }
    }
  };

  const handleAdditionalDocsChange = (files) => {
    const fileArray = Array.from(files);
    
    // Validar cada archivo
    for (const file of fileArray) {
      if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
        setErrors(prev => ({
          ...prev,
          additionalDocs: 'Solo se permiten imágenes o PDF'
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          additionalDocs: 'Cada archivo debe ser menor a 5MB'
        }));
        return;
      }
    }

    // Limpiar errores
    setErrors(prev => ({
      ...prev,
      additionalDocs: null
    }));

    setAdditionalDocs(fileArray);

    // Crear previews solo para imágenes
    const previews = [];
    fileArray.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push({ name: file.name, url: e.target.result, type: 'image' });
          if (previews.length === fileArray.filter(f => f.type.startsWith('image/')).length) {
            setAdditionalDocsPreview(previews);
          }
        };
        reader.readAsDataURL(file);
      } else {
        previews.push({ name: file.name, type: 'pdf' });
      }
    });
    
    if (fileArray.filter(f => !f.type.startsWith('image/')).length === fileArray.length) {
      setAdditionalDocsPreview(previews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.full_name || !formData.phone || !formData.business_description) {
      setErrors({
        general: 'Todos los campos son obligatorios'
      });
      return;
    }

    if (!idDocument) {
      setErrors({
        general: 'Debes subir tu documento de identidad'
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('👤 Current user:', user);
      console.log('🆔 User ID:', user.id);
      console.log('🔐 Session:', session);

      // Crear cliente de Supabase autenticado con Clerk
      const authenticatedSupabase = createClerkSupabaseClient(session);
      console.log('✅ Cliente autenticado creado');

      // Verificar si ya existe una solicitud pendiente
      const { data: existingRequest, error: checkError } = await supabase
        .from('verification_requests')
        .select('id, status')
        .eq('clerk_user_id', user.id)
        .in('status', ['pending', 'approved'])
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❗ Check error:', checkError);
        throw checkError;
      }

      if (existingRequest) {
        if (existingRequest.status === 'approved') {
          setErrors({
            general: 'Tu cuenta ya está verificada.'
          });
        } else {
          setErrors({
            general: 'Ya tienes una solicitud de verificación pendiente. Espera la revisión del equipo.'
          });
        }
        setLoading(false);
        return;
      }

      // Subir documento de identidad con cliente autenticado
      console.log('📤 Subiendo documento de identidad...');
      const userFolder = user.id;
      const timestamp = Date.now();
      
      const idDocResult = await uploadVerificationImage(
        idDocument, 
        `${userFolder}/id_document_${timestamp}`,
        authenticatedSupabase  // ✅ Pasar cliente autenticado
      );

      console.log('✅ Documento de identidad subido:', idDocResult);

      // Subir documentos adicionales si existen
      let additionalDocsUrls = [];
      if (additionalDocs.length > 0) {
        console.log('📤 Subiendo documentos adicionales...');
        const uploadPromises = additionalDocs.map((doc, index) => 
          uploadVerificationImage(
            doc, 
            `${userFolder}/additional_${timestamp}_${index}`,
            authenticatedSupabase  // ✅ Pasar cliente autenticado
          )
        );
        const results = await Promise.all(uploadPromises);
        additionalDocsUrls = results.map(r => r.path);
        console.log('✅ Documentos adicionales subidos:', additionalDocsUrls);
      }

      // Guardar la solicitud de verificación
      const insertData = {
        clerk_user_id: user.id,
        full_name: formData.full_name,
        phone: formData.phone,
        id_document_url: idDocResult.path,
        additional_docs_urls: additionalDocsUrls.length > 0 ? additionalDocsUrls : null,
        business_description: formData.business_description,
        status: 'pending',
        created_at: new Date().toISOString()
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
      
      let errorMessage = 'Error al enviar la verificación. ';
      
      if (error.message?.includes('Bucket not found')) {
        errorMessage += 'El almacenamiento no está configurado. Por favor contacta al administrador para crear el bucket "Fotos" en Supabase Storage.';
      } else {
        errorMessage += error.message || 'Inténtalo de nuevo.';
      }
      
      setErrors({
        general: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const removeIdDocument = () => {
    setIdDocument(null);
    setIdDocumentPreview(null);
    setErrors(prev => ({
      ...prev,
      idDocument: null
    }));
  };

  const removeAdditionalDoc = (index) => {
    setAdditionalDocs(prev => prev.filter((_, i) => i !== index));
    setAdditionalDocsPreview(prev => prev.filter((_, i) => i !== index));
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitar Verificación como Guía</h1>
            <p className="text-gray-600">
              Completa el formulario y sube los documentos requeridos para convertirte en guía verificado.
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Personal */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Información Personal
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                  placeholder="Juan Pérez González"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>
            </div>

            {/* Documento de Identidad */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">
                Documento de Identidad
              </h2>
              
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Cédula de Identidad o Pasaporte *
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Sube una foto clara de tu documento de identidad (puedes combinar ambos lados en una sola imagen)
              </p>

              {!idDocument ? (
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
                          accept="image/*,application/pdf"
                          onChange={(e) => handleIdDocumentChange(e.target.files[0])}
                        />
                      </label>
                      <p className="text-sm">PNG, JPG, PDF hasta 5MB</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative max-w-md mx-auto">
                  {idDocumentPreview ? (
                    <img
                      src={idDocumentPreview}
                      alt="Documento de identidad"
                      className="w-full rounded-lg border-2 border-gray-200"
                    />
                  ) : (
                    <div className="p-8 bg-gray-100 rounded-lg text-center">
                      <svg className="mx-auto h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">{idDocument.name}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeIdDocument}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}

              {errors.idDocument && (
                <p className="mt-2 text-sm text-red-600">{errors.idDocument}</p>
              )}
            </div>

            {/* Documentos Adicionales */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">
                Certificados y Licencias (Opcional)
              </h2>
              
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Certificados de Turismo, Licencias Profesionales, etc.
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Puedes subir certificados que respalden tu experiencia como guía turístico
              </p>

              {additionalDocs.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-gray-600">
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500 font-medium">Subir archivos</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          multiple
                          onChange={(e) => handleAdditionalDocsChange(e.target.files)}
                        />
                      </label>
                      <p className="text-sm">PNG, JPG, PDF hasta 5MB cada uno</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {additionalDocsPreview.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        {doc.type === 'image' ? (
                          <img src={doc.url} alt={doc.name} className="h-16 w-16 object-cover rounded" />
                        ) : (
                          <svg className="h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="text-sm text-gray-700">{doc.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAdditionalDoc(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <label className="cursor-pointer inline-block">
                    <span className="text-sm text-blue-600 hover:text-blue-500 font-medium">+ Agregar más archivos</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf"
                      multiple
                      onChange={(e) => handleAdditionalDocsChange([...additionalDocs, ...Array.from(e.target.files)])}
                    />
                  </label>
                </div>
              )}

              {errors.additionalDocs && (
                <p className="mt-2 text-sm text-red-600">{errors.additionalDocs}</p>
              )}
            </div>

            {/* Descripción del Servicio */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2 mb-4">
                Información del Servicio
              </h2>
              
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Descripción de tu Servicio como Guía *
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Cuéntanos sobre tu experiencia, especialidades y qué tipo de tours ofreces
              </p>
              <textarea
                value={formData.business_description}
                onChange={(e) => setFormData(prev => ({ ...prev, business_description: e.target.value }))}
                rows={6}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                placeholder="Ejemplo: Soy guía turístico con 5 años de experiencia en tours por Santiago. Especializado en historia colonial y gastronomía local. Ofrezco tours personalizados en español e inglés..."
                required
              />
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
                      <li>La información debe ser veraz y coincidir con tu documento</li>
                      <li>El proceso de verificación puede tomar 1-3 días hábiles</li>
                      <li>Una vez aprobado, podrás crear y publicar experiencias</li>
                      <li>Recibirás un email cuando tu solicitud sea revisada</li>
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
                disabled={loading || !formData.full_name || !formData.phone || !formData.business_description || !idDocument}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}