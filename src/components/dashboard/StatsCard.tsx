import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/formatters'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  isCurrency?: boolean
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  isCurrency = false,
}: StatsCardProps) {
  const variantStyles = {
    default: 'bg-primary-50 text-primary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
  }

  const displayValue = isCurrency && typeof value === 'number' 
    ? formatCurrency(value) 
    : value

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {displayValue}
          </p>
          {trend && (
            <div className="mt-2 flex items-center text-sm">
              <span
                className={`font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="ml-2 text-slate-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${variantStyles[variant]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </Card>
  )
}