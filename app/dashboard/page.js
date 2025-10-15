"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabaseClient';
import { getVerificationImageUrl } from '../../lib/uploadImages';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'admin@confiatour.com',
  'benjatorrealba2001@gmail.com', // Agrega tu email aquí
];

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [imageUrls, setImageUrls] = useState({});
  const [filter, setFilter] = useState('pending');

  // Debug: Log user info
  console.log('🔍 User loaded:', isLoaded);
  console.log('👤 User object:', user);
  console.log('📧 User email:', user?.emailAddresses[0]?.emailAddress);
  console.log('✅ Admin emails list:', ADMIN_EMAILS);

  // Verificar si el usuario es admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.emailAddresses[0]?.emailAddress);
  console.log('🔐 Is admin?', isAdmin);

  useEffect(() => {
    console.log('🎯 useEffect triggered - isLoaded:', isLoaded, 'user:', !!user, 'isAdmin:', isAdmin);
    
    if (isLoaded && user) {
      if (!isAdmin) {
        console.log('❌ User is not admin, redirecting...');
        router.push('/');
        return;
      }
      console.log('✅ User is admin, fetching requests...');
      fetchVerificationRequests();
    }
  }, [isLoaded, user, isAdmin, filter]);

  const fetchVerificationRequests = async () => {
    try {
      console.log('📡 Starting to fetch verification requests...');
      console.log('🔍 Current filter:', filter);
      
      setLoading(true);
      
      // Primero, obtener las solicitudes de verificación sin el join
      let query = supabase
        .from('verification_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      console.log('🚀 Executing verification requests query...');
      const { data: requests, error: requestsError } = await query;

      console.log('📊 Verification requests result - data:', requests);
      console.log('❗ Verification requests error:', requestsError);

      if (requestsError) {
        console.error('💥 Error in verification requests query:', requestsError);
        throw requestsError;
      }

      if (!requests || requests.length === 0) {
        console.log('📋 No verification requests found');
        setVerificationRequests([]);
        return;
      }

      console.log('✅ Raw verification requests:', requests);
      
      // Ahora obtener los perfiles por separado
      console.log('👥 Fetching profiles for users...');
      
      const userIds = requests.map(req => req.clerk_user_id);
      console.log('🆔 User IDs to fetch:', userIds);
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('clerk_user_id, full_name, email, user_type')
        .in('clerk_user_id', userIds);
        
      console.log('👤 Profiles data:', profiles);
      console.log('❗ Profiles error:', profileError);
      
      if (profileError) {
        console.error('💥 Error fetching profiles:', profileError);
        // No lanzamos el error, solo usamos los datos de requests sin profiles
      }
      
      // Combinar los datos
      const requestsWithProfiles = requests.map(request => {
        const profile = profiles?.find(p => p.clerk_user_id === request.clerk_user_id);
        return {
          ...request,
          profiles: profile || null
        };
      });
      
      console.log('🔗 Requests with profiles:', requestsWithProfiles);
      setVerificationRequests(requestsWithProfiles);

    } catch (error) {
      console.error('💥 Error fetching verification requests:', error);
      console.error('💥 Error details:', error.message, error.code, error.details);
      
      // Intentar una consulta más simple como fallback
      try {
        console.log('🔄 Trying fallback query...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('verification_requests')
          .select('*')
          .limit(10);
          
        if (!fallbackError) {
          console.log('✅ Fallback data:', fallbackData);
          setVerificationRequests(fallbackData.map(req => ({ ...req, profiles: null })));
        } else {
          console.error('💥 Fallback query also failed:', fallbackError);
        }
      } catch (fallbackErr) {
        console.error('💥 Fallback query error:', fallbackErr);
      }
    } finally {
      setLoading(false);
      console.log('✅ Finished fetching verification requests');
    }
  };

  const loadImageUrls = async (request) => {
    try {
      console.log('🖼️ Loading image URLs for request:', request.id);
      
      const [carnetFrontalUrl, carnetTraseroUrl, fotoCaraUrl] = await Promise.all([
        getVerificationImageUrl(request.carnet_frontal_path),
        getVerificationImageUrl(request.carnet_trasero_path),
        getVerificationImageUrl(request.foto_cara_path)
      ]);

      console.log('🖼️ Image URLs loaded:', {
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

  const openModal = async (request) => {
    console.log('🔍 Opening modal for request:', request);
    setSelectedRequest(request);
    setModalOpen(true);
    setRejectReason('');
    await loadImageUrls(request);
  };

  const closeModal = () => {
    console.log('❌ Closing modal');
    setModalOpen(false);
    setSelectedRequest(null);
    setImageUrls({});
    setRejectReason('');
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    console.log('✅ Approving request:', selectedRequest.id);
    setActionLoading(true);
    try {
      // Actualizar la solicitud de verificación
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.emailAddresses[0]?.emailAddress,
          admin_notes: 'Solicitud aprobada'
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      // Actualizar el perfil del usuario para marcarlo como verificado
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verified: true })
        .eq('clerk_user_id', selectedRequest.clerk_user_id);

      if (profileError) throw profileError;

      // Actualizar la lista
      await fetchVerificationRequests();
      closeModal();

      alert('Solicitud aprobada exitosamente');
    } catch (error) {
      console.error('💥 Error approving request:', error);
      alert('Error al aprobar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert('Por favor ingresa una razón para el rechazo');
      return;
    }

    console.log('❌ Rejecting request:', selectedRequest.id, 'Reason:', rejectReason);
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.emailAddresses[0]?.emailAddress,
          admin_notes: rejectReason
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Actualizar la lista
      await fetchVerificationRequests();
      closeModal();

      alert('Solicitud rechazada');
    } catch (error) {
      console.error('💥 Error rejecting request:', error);
      alert('Error al rechazar la solicitud');
    } finally {
      setActionLoading(false);
    }
  };

  // Debug: Log current state
  console.log('📊 Current state:', {
    isLoaded,
    isAdmin,
    loading,
    verificationRequestsCount: verificationRequests.length,
    filter
  });

  if (!isLoaded) {
    console.log('⏳ Still loading user...');
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-black">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('🚫 Access denied - not admin');
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">
            Acceso denegado. Solo para administradores.
            <br />
            <small>Tu email: {user?.emailAddresses[0]?.emailAddress}</small>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  console.log('🎨 Rendering dashboard with', verificationRequests.length, 'requests');

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Administrador</h1>
          <p className="text-gray-600">Gestiona las solicitudes de verificación de usuarios</p>
          <div className="mt-2 text-sm text-gray-500">
            Debug: {verificationRequests.length} solicitudes encontradas | Filtro: {filter}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                console.log('🔄 Changing filter to: pending');
                setFilter('pending');
              }}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'pending' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => {
                console.log('🔄 Changing filter to: approved');
                setFilter('approved');
              }}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'approved' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aprobadas
            </button>
            <button
              onClick={() => {
                console.log('🔄 Changing filter to: rejected');
                setFilter('rejected');
              }}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'rejected' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rechazadas
            </button>
            <button
              onClick={() => {
                console.log('🔄 Changing filter to: all');
                setFilter('all');
              }}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                fetchVerificationRequests();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Actualizar
            </button>
          </div>
        </div>


        {/* Tabla de solicitudes */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-lg">Cargando solicitudes...</div>
            </div>
          ) : verificationRequests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">
                No hay solicitudes para mostrar con el filtro "{filter}"
              </div>
              <button 
                onClick={() => {
                  console.log('🔄 Testing database connection...');
                  fetchVerificationRequests();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de envío
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {verificationRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.profiles?.full_name || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.profiles?.email || request.clerk_user_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.profiles?.user_type === 'guia' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.profiles?.user_type === 'guia' ? 'Guía' : request.profiles?.user_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.submitted_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openModal(request)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal sin cambios */}
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Solicitud de Verificación
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Información del usuario */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-lg mb-2">Información del Usuario</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Nombre:</strong> {selectedRequest.profiles?.full_name || 'Sin nombre'}</p>
                    <p><strong>Email:</strong> {selectedRequest.profiles?.email || 'No disponible'}</p>
                  </div>
                  <div>
                    <p><strong>Tipo:</strong> {selectedRequest.profiles?.user_type || 'No especificado'}</p>
                    <p><strong>Estado actual:</strong> {getStatusBadge(selectedRequest.status)}</p>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Documentos Subidos</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Carnet Frontal */}
                  <div>
                    <h4 className="font-medium mb-2">Carnet Frontal</h4>
                    {imageUrls.carnet_frontal ? (
                      <img
                        src={imageUrls.carnet_frontal}
                        alt="Carnet frontal"
                        className="w-full rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400"
                        onClick={() => window.open(imageUrls.carnet_frontal, '_blank')}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">Cargando...</span>
                      </div>
                    )}
                  </div>

                  {/* Carnet Trasero */}
                  <div>
                    <h4 className="font-medium mb-2">Carnet Trasero</h4>
                    {imageUrls.carnet_trasero ? (
                      <img
                        src={imageUrls.carnet_trasero}
                        alt="Carnet trasero"
                        className="w-full rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400"
                        onClick={() => window.open(imageUrls.carnet_trasero, '_blank')}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">Cargando...</span>
                      </div>
                    )}
                  </div>

                  {/* Foto de Cara */}
                  <div>
                    <h4 className="font-medium mb-2">Foto de Rostro</h4>
                    {imageUrls.foto_cara ? (
                      <img
                        src={imageUrls.foto_cara}
                        alt="Foto de cara"
                        className="w-full rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400"
                        onClick={() => window.open(imageUrls.foto_cara, '_blank')}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">Cargando...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notas del admin (si existen) */}
              {selectedRequest.admin_notes && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium mb-2">Notas del Administrador:</h4>
                  <p className="text-gray-700">{selectedRequest.admin_notes}</p>
                </div>
              )}

              {/* Acciones (solo para solicitudes pendientes) */}
              {selectedRequest.status === 'pending' && (
                <div className="mt-8 space-y-4">
                  <h3 className="font-semibold text-lg">Acciones</h3>
                  
                  {/* Campo para razón de rechazo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razón de rechazo (opcional para aprobación, requerido para rechazo):
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Explica por qué se rechaza la solicitud..."
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Procesando...' : 'Rechazar'}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Procesando...' : 'Aprobar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}