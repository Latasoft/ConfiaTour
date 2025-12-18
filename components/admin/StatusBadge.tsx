import React from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon, CreditCardIcon } from '@/components/icons'

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

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  // Estados de reserva
  confirmada: {
    label: 'Confirmada',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircleIcon,
  },
  pendiente: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: ClockIcon,
  },
  pendiente_pago: {
    label: 'Pendiente Pago',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: CreditCardIcon,
  },
  cancelada: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircleIcon,
  },
  completada: {
    label: 'Completada',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: CheckCircleIcon,
  },
  
  // Estados de experiencia
  activa: {
    label: 'Activa',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircleIcon,
  },
  inactiva: {
    label: 'Inactiva',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: XCircleIcon,
  },
  
  // Estados de verificación
  approved: {
    label: 'Aprobado',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircleIcon,
  },
  rejected: {
    label: 'Rechazado',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircleIcon,
  },
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: ClockIcon,
  },
  
  // Estados de usuario
  verificado: {
    label: 'Verificado',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: CheckCircleIcon,
  },
  no_verificado: {
    label: 'No Verificado',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: ClockIcon,
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
    icon: ClockIcon,
  }

  const IconComponent = config.icon
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.color} ${sizeClasses[size]}`}
    >
      <IconComponent className={iconSize} />
      <span>{config.label}</span>
    </span>
  )
}
