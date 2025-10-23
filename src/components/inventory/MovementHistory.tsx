'use client'

import { formatDateTime } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowUp, ArrowDown, Edit3 } from 'lucide-react'

interface MovementHistoryProps {
  movements: any[]
}

export function MovementHistory({ movements }: MovementHistoryProps) {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ArrowUp className="h-5 w-5 text-green-600" />
      case 'sale':
        return <ArrowDown className="h-5 w-5 text-red-600" />
      case 'adjustment':
        return <Edit3 className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Compra'
      case 'sale':
        return 'Venta'
      case 'adjustment':
        return 'Ajuste'
      default:
        return type
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'success'
      case 'sale':
        return 'danger'
      case 'adjustment':
        return 'info'
      default:
        return 'default'
    }
  }

  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-500">No hay movimientos registrados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Movimientos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg"
            >
              <div className="flex-shrink-0 mt-1">
                {getMovementIcon(movement.movement_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {movement.products?.name}
                    </p>
                    {movement.products?.brand && (
                      <p className="text-sm text-slate-500">
                        {movement.products.brand}
                      </p>
                    )}
                  </div>
                  <Badge variant={getMovementColor(movement.movement_type)}>
                    {getMovementLabel(movement.movement_type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                  <span>
                    Cantidad:{' '}
                    <span
                      className={`font-semibold ${
                        movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {movement.quantity > 0 ? '+' : ''}
                      {movement.quantity}
                    </span>
                  </span>
                  <span>
                    Stock: {movement.previous_stock} → {movement.new_stock}
                  </span>
                </div>
                {movement.reason && (
                  <p className="text-sm text-slate-500 mt-2 italic">
                    {movement.reason}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                  <span>{formatDateTime(movement.created_at)}</span>
                  {movement.profiles && (
                    <span>Por: {movement.profiles.full_name}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}