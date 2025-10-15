"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function PerfilPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    user_type: 'viajero'
  });

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile();
    }
  }, [isLoaded, user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

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
  };

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
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          phone: formData.phone,
          user_type: formData.user_type,
          updated_at: new Date().toISOString()
        })
        .eq('clerk_user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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
              <div className="relative">
                <img
                  src={user?.imageUrl || '/default-avatar.png'}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
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
                    {profile?.user_type === 'guia' ? '🏛️ Guía Turístico' : '🎒 Viajero'}
                  </span>
                  
                  {profile?.verified && (
                    <span className="px-3 py-1 bg-green-400 text-green-900 rounded-full text-sm font-medium">
                      ✓ Verificado
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
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Estado de Verificación</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile?.verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {profile?.verified ? 'Verificado' : 'Pendiente'}
                        </span>
                      </div>
                      
                      {!profile?.verified && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-900">Verifica tu cuenta</p>
                              <p className="text-xs text-blue-700 mt-1">
                                Sube tu identificación para obtener la verificación
                              </p>
                            </div>
                            <Link
                              href="/perfil/verificar"
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Verificar
                            </Link>
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
                    Tipo de Usuario
                  </label>
                  <select
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="viajero">Viajero</option>
                    <option value="guia">Guía Turístico</option>
                  </select>
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