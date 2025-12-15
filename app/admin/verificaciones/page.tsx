'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { getVerificationImageUrl } from '@/lib/uploadImages'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'

export const dynamic = 'force-dynamic'

interface VerificationRequest {
  id: string
  clerk_user_id: string
  carnet_frontal_path: string
  carnet_trasero_path: string
  foto_cara_path: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  admin_notes?: string
  profiles?: {
    full_name: string
    email: string
    user_type: string
  } | null
}

export default function AdminVerificacionesPage() {
  const { user } = useUser()
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<string>('pending')

  useEffect(() => {
    fetchVerificationRequests()
  }, [filter])

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('verification_requests')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data: requests, error: requestsError } = await query

      if (requestsError) throw requestsError

      if (!requests || requests.length === 0) {
        setVerificationRequests([])
        return
      }

      // Obtener perfiles de los usuarios
      const userIds = requests.map(req => req.clerk_user_id)
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('clerk_user_id, full_name, email, user_type')
        .in('clerk_user_id', userIds)
      
      if (profileError) {
        console.error('Error fetching profiles:', profileError)
      }
      
      // Combinar datos
      const requestsWithProfiles = requests.map(request => {
        const profile = profiles?.find(p => p.clerk_user_id === request.clerk_user_id)
        return {
          ...request,
          profiles: profile || null
        }
      })
      
      setVerificationRequests(requestsWithProfiles)

    } catch (error) {
      console.error('Error fetching verification requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadImageUrls = async (request: VerificationRequest) => {
    try {
      const [carnetFrontalUrl, carnetTraseroUrl, fotoCaraUrl] = await Promise.all([
        getVerificationImageUrl(request.carnet_frontal_path),
        getVerificationImageUrl(request.carnet_trasero_path),
        getVerificationImageUrl(request.foto_cara_path)
      ])

      setImageUrls({
        carnet_frontal: carnetFrontalUrl,
        carnet_trasero: carnetTraseroUrl,
        foto_cara: fotoCaraUrl
      })
    } catch (error) {
      console.error('Error loading image URLs:', error)
    }
  }

  const openModal = async (request: VerificationRequest) => {
    setSelectedRequest(request)
    setModalOpen(true)
    setRejectReason('')
    await loadImageUrls(request)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedRequest(null)
    setImageUrls({})
    setRejectReason('')
  }

  const handleApprove = async () => {
    if (!selectedRequest || !user) return

    setActionLoading(true)
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
        .eq('id', selectedRequest.id)

      if (requestError) throw requestError

      // Actualizar el perfil del usuario para marcarlo como verificado
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verified: true })
        .eq('clerk_user_id', selectedRequest.clerk_user_id)

      if (profileError) throw profileError

      await fetchVerificationRequests()
      closeModal()

      alert('Solicitud aprobada exitosamente')
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Error al aprobar la solicitud')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert('Por favor ingresa una razón para el rechazo')
      return
    }

    if (!user) return

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.emailAddresses[0]?.emailAddress,
          admin_notes: rejectReason
        })
        .eq('id', selectedRequest.id)

      if (error) throw error

      await fetchVerificationRequests()
      closeModal()

      alert('Solicitud rechazada')
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Error al rechazar la solicitud')
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    {
      key: 'profiles.full_name',
      label: 'Usuario',
      sortable: true,
      render: (_: any, row: VerificationRequest) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.profiles?.full_name || 'Sin nombre'}
          </div>
          <div className="text-xs text-gray-500">
            {row.profiles?.email || row.clerk_user_id}
          </div>
        </div>
      ),
    },
    {
      key: 'profiles.user_type',
      label: 'Tipo',
      render: (_: any, row: VerificationRequest) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.profiles?.user_type === 'guia' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {row.profiles?.user_type === 'guia' ? 'Guía' : row.profiles?.user_type || 'N/A'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (value: string) => <StatusBadge status={value as any} size="sm" />,
    },
    {
      key: 'submitted_at',
      label: 'Fecha de envío',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Acciones',
      render: (_: any, row: VerificationRequest) => (
        <button
          onClick={() => openModal(row)}
          className="px-3 py-1 text-xs rounded bg-[#23A69A] text-white hover:bg-[#1e8a7e]"
        >
          Ver detalles
        </button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Verificaciones de Usuarios</h1>
        <p className="text-gray-600 mt-2">Gestiona las solicitudes de verificación de identidad</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-3">
          {[
            { value: 'pending', label: 'Pendientes' },
            { value: 'approved', label: 'Aprobadas' },
            { value: 'rejected', label: 'Rechazadas' },
            { value: 'all', label: 'Todas' },
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === filterOption.value
                  ? 'bg-[#23A69A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pendientes', value: verificationRequests.filter(r => r.status === 'pending').length, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Aprobadas', value: verificationRequests.filter(r => r.status === 'approved').length, color: 'bg-green-50 text-green-700' },
          { label: 'Rechazadas', value: verificationRequests.filter(r => r.status === 'rejected').length, color: 'bg-red-50 text-red-700' },
          { label: 'Total', value: verificationRequests.length, color: 'bg-blue-50 text-blue-700' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-lg p-4`}>
            <div className="text-sm font-medium opacity-80">{stat.label}</div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <DataTable
        data={verificationRequests}
        columns={columns}
        loading={loading}
        emptyMessage="No hay solicitudes de verificación"
        pageSize={10}
      />

      {/* Modal de Detalles */}
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Solicitud de Verificación</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">
                  ×
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
                    <p><strong>Estado:</strong> <StatusBadge status={selectedRequest.status} size="sm" /></p>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Documentos Subidos</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {['carnet_frontal', 'carnet_trasero', 'foto_cara'].map((key) => (
                    <div key={key}>
                      <h4 className="font-medium mb-2 capitalize">
                        {key.replace(/_/g, ' ')}
                      </h4>
                      {imageUrls[key] ? (
                        <img
                          src={imageUrls[key]}
                          alt={key}
                          className="w-full rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400"
                          onClick={() => window.open(imageUrls[key], '_blank')}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">Cargando...</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas del admin */}
              {selectedRequest.admin_notes && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium mb-2">Notas del Administrador:</h4>
                  <p className="text-gray-700">{selectedRequest.admin_notes}</p>
                </div>
              )}

              {/* Acciones para solicitudes pendientes */}
              {selectedRequest.status === 'pending' && (
                <div className="mt-8 space-y-4">
                  <h3 className="font-semibold text-lg">Acciones</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razón de rechazo (requerido para rechazar):
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent"
                      placeholder="Explica por qué se rechaza la solicitud..."
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Procesando...' : 'Rechazar'}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
  )
}
