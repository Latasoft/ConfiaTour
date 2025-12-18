"use client";
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/lib/context/ToastContext';

export const dynamic = 'force-dynamic'

export default function PerfilPage() {
  const { user, isLoaded } = useUser();
  const { success } = useToast();
  const [profile, setProfile] = useState(null);
  const [verificationRequest, setVerificationRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    user_type: 'viajero'
  });

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        await createProfile();
      } else {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          phone: data.phone || '',
          user_type: data.user_type || 'viajero'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchVerificationStatus = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching verification:', error);
        return;
      }

      setVerificationRequest(data);
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile();
      fetchVerificationStatus();
      
      // Mostrar mensaje de éxito si viene de enviar verificación
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('verification') === 'submitted') {
          success('Solicitud de verificación enviada correctamente. Te notificaremos cuando sea revisada.');
          // Limpiar el parámetro de la URL
          window.history.replaceState({}, '', '/perfil');
        }
      }
    }
  }, [isLoaded, user, success, fetchProfile, fetchVerificationStatus]);

  const createProfile = async () => {
    const newProfile = {
      clerk_user_id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      full_name: user.fullName || '',
      avatar_url: user.imageUrl,
      verified: false,
      user_type: 'viajero',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return;
    }
    
    setProfile(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Primero verificar que el perfil existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Si no existe, crear el perfil primero
        await createProfile();
        return;
      }

      // Actualizar el perfil existente
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('clerk_user_id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating profile:', error);
        alert('Error al actualizar el perfil: ' + error.message);
        return;
      }

      if (data) {
        setProfile(data);
        setEditing(false);
        success('Perfil actualizado correctamente');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header del perfil */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative w-24 h-24">
                <Image
                  src={user?.imageUrl || '/default-avatar.png'}
                  alt="Avatar"
                  fill
                  className="rounded-full border-4 border-white shadow-lg object-cover"
                />
                {profile?.verified && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-3xl font-bold text-white">
                    {profile?.full_name || user?.fullName || 'Usuario'}
                  </h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile?.user_type === 'guia' 
                      ? 'bg-yellow-400 text-yellow-900' 
                      : 'bg-blue-400 text-blue-900'
                  }`}>
                    {profile?.user_type === 'guia' ? 'Guía Turístico' : 'Viajero'}
                  </span>
                  
                  {profile?.verified && (
                    <span className="px-3 py-1 bg-green-400 text-green-900 rounded-full text-sm font-medium">
                      Verificado
                    </span>
                  )}
                </div>
                
                <p className="text-blue-100 mt-2">{profile?.email}</p>
              </div>
            </div>
          </div>

          {/* Contenido del perfil */}
          <div className="p-6">
            {!editing ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Personal</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                        <p className="mt-1 text-gray-900">{profile?.full_name || 'No especificado'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <p className="mt-1 text-gray-900">{profile?.phone || 'No especificado'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Usuario</label>
                        <p className="mt-1 text-gray-900 capitalize">{profile?.user_type}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Estado de la Cuenta</h3>
                    
                    <div className="space-y-3">
                      {/* Estado de verificación para guías verificados */}
                      {profile?.user_type === 'guia' && profile?.verified && (
                        <div className="p-4 rounded-lg border-l-4 bg-green-50 border-green-500">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <h4 className="text-sm font-semibold text-green-900">
                                ✅ Guía Verificado
                              </h4>
                              <p className="text-sm mt-1 text-green-800">
                                Tu cuenta está verificada. Puedes crear y publicar experiencias.
                              </p>
                              <Link
                                href="/experiencias/crear"
                                className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                Crear Experiencia
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Estado de verificación pendiente */}
                      {profile?.user_type === 'guia' && !profile?.verified && verificationRequest?.status === 'pending' && (
                        <div className="p-4 rounded-lg border-l-4 bg-yellow-50 border-yellow-500">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <h4 className="text-sm font-semibold text-yellow-900">
                                ⏳ Verificación en Proceso
                              </h4>
                              <p className="text-sm mt-1 text-yellow-800">
                                Tu solicitud de verificación está siendo revisada por nuestro equipo. Te notificaremos cuando esté lista.
                              </p>
                              <p className="text-xs text-yellow-700 mt-2">
                                Enviada el {new Date(verificationRequest.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Verificación rechazada */}
                      {verificationRequest?.status === 'rejected' && (
                        <div className="p-4 rounded-lg border-l-4 bg-red-50 border-red-500">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <h4 className="text-sm font-semibold text-red-900">
                                ❌ Verificación Rechazada
                              </h4>
                              <p className="text-sm mt-1 text-red-800">
                                Lamentablemente, tu solicitud no pudo ser aprobada.
                              </p>
                              {verificationRequest.rejection_reason && (
                                <div className="mt-2 p-2 bg-white rounded border border-red-200">
                                  <p className="text-xs font-semibold text-red-900 mb-1">Razón:</p>
                                  <p className="text-xs text-red-800">{verificationRequest.rejection_reason}</p>
                                </div>
                              )}
                              <Link
                                href="/perfil/verificar"
                                className="inline-block mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                              >
                                Enviar Nueva Solicitud
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CTA para convertirse en guía (viajeros sin solicitud) */}
                      {profile?.user_type === 'viajero' && !verificationRequest && (
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <h4 className="text-sm font-semibold text-blue-900">
                                ¿Quieres ofrecer experiencias?
                              </h4>
                              <p className="text-sm text-blue-800 mt-1">
                                Conviértete en guía verificado y comparte tus servicios turísticos con viajeros de todo el mundo.
                              </p>
                              <Link
                                href="/perfil/verificar"
                                className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                Solicitar Verificación como Guía
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Miembro desde</span>
                        <span className="text-sm text-gray-900">
                          {new Date(profile?.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Biografía</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {profile?.bio || 'No has agregado una biografía. ¡Cuéntanos sobre ti!'}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Editar Perfil
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Editar Perfil</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografía
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cuéntanos sobre ti, tus intereses en viajes, experiencia como guía, etc."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        full_name: profile?.full_name || '',
                        bio: profile?.bio || '',
                        phone: profile?.phone || '',
                        user_type: profile?.user_type || 'viajero'
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}