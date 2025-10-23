'use client'

import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SaleWithDetails } from '@/types'

interface RecentSalesProps {
  sales: SaleWithDetails[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'partial':
        return 'warning'
      case 'pending':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado'
      case 'partial':
        return 'Parcial'
      case 'pending':
        return 'Pendiente'
      default:
        return status
    }
  }

  if (sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-slate-500">No hay ventas registradas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-slate-900">
                    {sale.customers?.full_name || 'Cliente general'}
                  </p>
                  <Badge variant={getStatusColor(sale.status)}>
                    {getStatusLabel(sale.status)}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">
                  {formatDateTime(sale.sale_date)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {sale.sale_items.length} producto(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(sale.total_amount)}
                </p>
                {sale.remaining_debt > 0 && (
                  <p className="text-sm text-red-600">
                    Debe: {formatCurrency(sale.remaining_debt)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}