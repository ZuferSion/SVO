'use client'

import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ShoppingCart, Package } from 'lucide-react'
import type { Sale } from '@/types'

interface PurchaseHistoryProps {
  sales: any[]
}

export function PurchaseHistory({ sales }: PurchaseHistoryProps) {
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
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Historial de Compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Sin compras registradas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Historial de Compras ({sales.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
            >
              {/* Header de la venta */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-slate-500">
                    {formatDateTime(sale.sale_date)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {sale.payment_type === 'cash' ? 'Contado' : 'Crédito'}
                  </p>
                </div>
                <Badge variant={getStatusColor(sale.status)}>
                  {getStatusLabel(sale.status)}
                </Badge>
              </div>

              {/* Productos */}
              <div className="mb-3 space-y-2">
                {sale.sale_items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1">
                      <span className="text-slate-900">
                        {item.quantity}x {item.products?.name}
                      </span>
                      {item.products?.brand && (
                        <span className="text-slate-500 text-xs ml-2">
                          ({item.products.brand})
                        </span>
                      )}
                    </div>
                    <span className="text-slate-600 font-medium">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total y deuda */}
              <div className="pt-3 border-t border-slate-200 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(sale.total_amount)}
                  </span>
                </div>
                {sale.paid_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Pagado:</span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(sale.paid_amount)}
                    </span>
                  </div>
                )}
                {sale.remaining_debt > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Debe:</span>
                    <span className="text-red-600 font-bold">
                      {formatCurrency(sale.remaining_debt)}
                    </span>
                  </div>
                )}
              </div>

              {sale.notes && (
                <div className="mt-2 text-xs text-slate-500 italic">
                  Nota: {sale.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}