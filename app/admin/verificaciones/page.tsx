'use client'

import { useState, useEffect } from 'react'
import { getVerificationImageUrl } from '@/lib/uploadImages'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { useToast } from '@/lib/context/ToastContext'

export const dynamic = 'force-dynamic'

interface VerificationRequest {
  id: string
  clerk_user_id: string
  full_name: string
  phone: string
  id_document_url: string
  additional_docs_urls?: any[]
  business_description?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
  profiles?: {
    full_name: string
    email: string
    user_type: string
  } | null
}

export default function AdminVerificacionesPage() {
  const { success, error: showError } = useToast()
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
      
      const params = new URLSearchParams()
      if (filter) params.append('status', filter)

      const response = await fetch(`/api/admin/verificaciones${params.toString() ? `?${params}` : ''}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar verificaciones')
      }

      const data = await response.json()
      setVerificationRequests(data || [])
    } catch (error) {
      console.error('Error fetching verification requests:', error)
      showError('Error al cargar solicitudes de verificación')
    } finally {
      setLoading(false)
    }
  }

  const loadImageUrls = async (request: VerificationRequest) => {
    try {
      const documentUrl = await getVerificationImageUrl(request.id_document_url)
      
      const urls: Record<string, string> = {
        id_document: documentUrl
      }

      // Cargar documentos adicionales si existen
      if (request.additional_docs_urls && request.additional_docs_urls.length > 0) {
        const additionalUrls = await Promise.all(
          request.additional_docs_urls.map(async (path, index) => ({
            [`additional_${index}`]: await getVerificationImageUrl(path)
          }))
        )
        additionalUrls.forEach(urlObj => Object.assign(urls, urlObj))
      }

      setImageUrls(urls)
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
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/verificaciones', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedRequest.id,
          status: 'approved',
          clerk_user_id: selectedRequest.clerk_user_id,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al aprobar solicitud')
      }

      await fetchVerificationRequests()
      closeModal()
      success('✅ Solicitud aprobada exitosamente. El usuario es ahora un guía verificado.')
    } catch (error) {
      console.error('Error approving request:', error)
      showError('Error al aprobar la solicitud')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      showError('Por favor ingresa una razón para el rechazo')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/verificaciones', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedRequest.id,
          status: 'rejected',
          rejection_reason: rejectReason,
          clerk_user_id: selectedRequest.clerk_user_id,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al rechazar solicitud')
      }

      await fetchVerificationRequests()
      closeModal()
      success('Solicitud rechazada correctamente')
    } catch (error) {
      console.error('Error rejecting request:', error)
      showError('Error al rechazar la solicitud')
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
      key: 'created_at',
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
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#23A69A] to-[#1e8a7e] px-6 py-5 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Solicitud de Verificación</h2>
              <button 
                onClick={closeModal} 
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Información del usuario */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Información del Usuario
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="bg-white px-3 py-2 rounded border border-blue-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</span>
                      <p className="text-gray-900 font-medium">{selectedRequest.full_name || selectedRequest.profiles?.full_name || 'Sin nombre'}</p>
                    </div>
                    <div className="bg-white px-3 py-2 rounded border border-blue-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</span>
                      <p className="text-gray-900 font-medium">{selectedRequest.profiles?.email || 'No disponible'}</p>
                    </div>
                    <div className="bg-white px-3 py-2 rounded border border-blue-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</span>
                      <p className="text-gray-900 font-medium">{selectedRequest.phone || 'No disponible'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white px-3 py-2 rounded border border-blue-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de Usuario</span>
                      <p className="text-gray-900 font-medium capitalize">{selectedRequest.profiles?.user_type || 'No especificado'}</p>
                    </div>
                    <div className="bg-white px-3 py-2 rounded border border-blue-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</span>
                      <div className="mt-1">
                        <StatusBadge status={selectedRequest.status} size="sm" />
                      </div>
                    </div>
                    <div className="bg-white px-3 py-2 rounded border border-blue-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha de Solicitud</span>
                      <p className="text-gray-900 font-medium">
                        {new Date(selectedRequest.created_at).toLocaleDateString('es-CL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedRequest.business_description && (
                  <div className="mt-4 bg-white px-4 py-3 rounded border border-blue-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Descripción del Negocio</span>
                    <p className="text-gray-800 leading-relaxed">{selectedRequest.business_description}</p>
                  </div>
                )}
              </div>

              {/* Documentos */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documentos Subidos
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Documento de identidad principal */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      Documento de Identidad
                    </h4>
                    {imageUrls.id_document ? (
                      <img
                        src={imageUrls.id_document}
                        alt="Documento de identidad"
                        className="w-full rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-500 transition-colors shadow-sm"
                        onClick={() => window.open(imageUrls.id_document, '_blank')}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600">Cargando...</span>
                      </div>
                    )}
                  </div>

                  {/* Documentos adicionales */}
                  {selectedRequest.additional_docs_urls && selectedRequest.additional_docs_urls.length > 0 && 
                    selectedRequest.additional_docs_urls.map((_, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Documento Adicional {index + 1}
                        </h4>
                        {imageUrls[`additional_${index}`] ? (
                          <img
                            src={imageUrls[`additional_${index}`]}
                            alt={`Documento adicional ${index + 1}`}
                            className="w-full rounded-lg border-2 border-gray-300 cursor-pointer hover:border-green-500 transition-colors shadow-sm"
                            onClick={() => window.open(imageUrls[`additional_${index}`], '_blank')}
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-600">Cargando...</span>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Razón de rechazo si existe */}
              {selectedRequest.rejection_reason && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <h4 className="font-semibold mb-2 text-red-800 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Razón de Rechazo
                  </h4>
                  <p className="text-gray-800">{selectedRequest.rejection_reason}</p>
                </div>
              )}

              {/* Acciones para solicitudes pendientes */}
              {selectedRequest.status === 'pending' && (
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Acciones de Verificación
                  </h3>

                  {/* Advertencia de lo que pasará al aprobar */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Al aprobar esta solicitud:</h4>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                          <li>El usuario será promovido automáticamente a <strong>&quot;Guía Turístico&quot;</strong></li>
                          <li>Su cuenta quedará marcada como <strong>&quot;Verificada&quot;</strong></li>
                          <li>Podrá crear y publicar experiencias en la plataforma</li>
                          <li>Esta acción no se puede revertir automáticamente</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Razón de rechazo (requerido para rechazar):
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-[#23A69A] text-gray-900"
                      placeholder="Explica por qué se rechaza la solicitud..."
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                    >
                      {actionLoading ? 'Procesando...' : 'Rechazar'}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                    >
                      {actionLoading ? 'Procesando...' : '✓ Aprobar y Promover a Guía'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={closeModal}
                className="w-full px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
