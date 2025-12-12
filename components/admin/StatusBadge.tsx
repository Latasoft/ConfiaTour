import React from 'react'

export type StatusType = 
  | 'confirmada' 
  | 'pendiente' 
  | 'pendiente_pago'
  | 'cancelada' 
  | 'completada'
  | 'activa'
  | 'inactiva'
  | 'approved'
  | 'rejected'
  | 'pending'
  | 'verificado'
  | 'no_verificado'

interface StatusBadgeProps {
  status: StatusType | string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  // Estados de reserva
  confirmada: {
    label: 'Confirmada',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: '✓',
  },
  pendiente: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: '⏳',
  },
  pendiente_pago: {
    label: 'Pendiente Pago',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: '💳',
  },
  cancelada: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: '✕',
  },
  completada: {
    label: 'Completada',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '✓✓',
  },
  
  // Estados de experiencia
  activa: {
    label: 'Activa',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: '●',
  },
  inactiva: {
    label: 'Inactiva',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: '○',
  },
  
  // Estados de verificación
  approved: {
    label: 'Aprobado',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: '✓',
  },
  rejected: {
    label: 'Rechazado',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: '✕',
  },
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: '⏳',
  },
  
  // Estados de usuario
  verificado: {
    label: 'Verificado',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '✓',
  },
  no_verificado: {
    label: 'No Verificado',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: '○',
  },
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-2',
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: '•',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${config.color} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}
