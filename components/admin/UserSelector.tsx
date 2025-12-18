'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export interface UserOption {
  clerk_user_id: string
  full_name: string | null
  email: string
  user_type: string
  verified: boolean
}

interface UserSelectorProps {
  value: string
  onChange: (userId: string) => void
  disabled?: boolean
  filterByType?: 'guia' | 'viajero' | null
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  filterByType = 'guia'
}) => {
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('profiles')
        .select('clerk_user_id, full_name, email, user_type, verified')
        .order('full_name', { ascending: true })

      // Filtrar por tipo si se especifica
      if (filterByType) {
        query = query.eq('user_type', filterByType)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setUsers(data || [])
    } catch (err: any) {
      console.error('Error cargando usuarios:', err)
      setError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterByType])

  if (loading) {
    return (
      <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
        <span className="text-sm text-gray-500">Cargando usuarios...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 border border-red-300 rounded-lg bg-red-50">
        <span className="text-sm text-red-600">{error}</span>
        <button
          onClick={loadUsers}
          className="ml-2 text-xs text-red-700 underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || users.length === 0}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23A69A] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      required
    >
      <option value="">Selecciona un usuario</option>
      {users.map((user) => (
        <option key={user.clerk_user_id} value={user.clerk_user_id}>
          {user.full_name || 'Sin nombre'} ({user.email})
          {user.verified && ' [Verificado]'}
          {user.user_type && ` - ${user.user_type}`}
        </option>
      ))}
    </select>
  )
}
