'use client'

import Link from 'next/link'
import { AlertTriangle, Package } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import type { Product } from '@/types'

interface LowStockAlertProps {
  products: Product[]
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const getStockLevel = (quantity: number, minAlert: number) => {
    if (quantity === 0) return { label: 'Agotado', variant: 'danger' as const }
    if (quantity <= minAlert / 2) return { label: 'Crítico', variant: 'danger' as const }
    if (quantity <= minAlert) return { label: 'Bajo', variant: 'warning' as const }
    return { label: 'Normal', variant: 'success' as const }
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-green-600" />
            Inventario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-green-600 font-medium">✓ Todo el inventario está bien</p>
            <p className="text-sm text-slate-500 mt-1">
              No hay productos con stock bajo
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-amber-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Alertas de Inventario
          </CardTitle>
          <Badge variant="warning">{products.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.slice(0, 5).map((product) => {
            const stockLevel = getStockLevel(
              product.stock_quantity,
              product.min_stock_alert
            )

            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-500">{product.brand}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {product.stock_quantity}
                    </p>
                    <p className="text-xs text-slate-500">unidades</p>
                  </div>
                  <Badge variant={stockLevel.variant}>{stockLevel.label}</Badge>
                </div>
              </div>
            )
          })}

          {products.length > 5 && (
            <p className="text-sm text-slate-500 text-center pt-2">
              +{products.length - 5} productos más con stock bajo
            </p>
          )}

          <Link href={ROUTES.INVENTORY}>
            <Button variant="outline" className="w-full mt-4">
              Ver Inventario Completo
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}