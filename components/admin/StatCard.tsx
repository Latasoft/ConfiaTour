import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const colorClasses = {
  primary: 'bg-blue-50 text-blue-600 border-blue-200',
  success: 'bg-green-50 text-green-600 border-green-200',
  warning: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  danger: 'bg-red-50 text-red-600 border-red-200',
  info: 'bg-[#e8f5f4] text-[#23A69A] border-[#23A69A]',
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'info',
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#23A69A] hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium uppercase">{title}</h3>
        <span className="text-3xl">{icon}</span>
      </div>
      
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      
      {subtitle && (
        <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
      )}
      
      {trend && (
        <div className="flex items-center">
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
        </div>
      )}
    </div>
  )
}
