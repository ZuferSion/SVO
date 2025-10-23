'use client'

import { formatCurrency } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { Package, TrendingUp, TrendingDown } from 'lucide-react'
import type { Product } from '@/types'

interface InventoryListProps {
  products: Product[]
}

export function InventoryList({ products }: InventoryListProps) {
  const getStockBadge = (product: Product) => {
    if (product.stock_quantity === 0) {
      return <Badge variant="danger">Agotado</Badge>
    }
    if (product.stock_quantity <= product.min_stock_alert / 2) {
      return <Badge variant="danger">Crítico</Badge>
    }
    if (product.stock_quantity <= product.min_stock_alert) {
      return <Badge variant="warning">Bajo</Badge>
    }
    return <Badge variant="success">Disponible</Badge>
  }

  const getStockIcon = (product: Product) => {
    if (product.stock_quantity <= product.min_stock_alert) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return <TrendingUp className="h-4 w-4 text-green-600" />
  }

  const getStockPercentage = (product: Product) => {
    const percentage = (product.stock_quantity / (product.min_stock_alert * 3)) * 100
    return Math.min(percentage, 100)
  }

  if (products.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Package}
          title="No hay productos"
          description="No se encontraron productos con los filtros aplicados."
        />
      </Card>
    )
  }

  return (
    <Card padding={false}>
      {/* Vista Desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead align="center">Stock Actual</TableHead>
              <TableHead align="center">Stock Mínimo</TableHead>
              <TableHead align="center">Estado</TableHead>
              <TableHead align="right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    {product.brand && (
                      <p className="text-sm text-slate-500">{product.brand}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell align="center">
                  <div className="flex items-center justify-center gap-2">
                    {getStockIcon(product)}
                    <span className="text-lg font-bold text-slate-900">
                      {product.stock_quantity}
                    </span>
                  </div>
                  {/* Barra de progreso */}
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        product.stock_quantity <= product.min_stock_alert
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${getStockPercentage(product)}%` }}
                    />
                  </div>
                </TableCell>
                <TableCell align="center">
                  <span className="text-slate-600">{product.min_stock_alert}</span>
                </TableCell>
                <TableCell align="center">{getStockBadge(product)}</TableCell>
                <TableCell align="right">
                  <span className="font-medium text-slate-900">
                    {formatCurrency(product.price * product.stock_quantity)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Vista Mobile */}
      <div className="md:hidden divide-y divide-slate-200">
        {products.map((product) => (
          <div key={product.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{product.name}</p>
                {product.brand && (
                  <p className="text-sm text-slate-500">{product.brand}</p>
                )}
              </div>
              {getStockBadge(product)}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Actual</p>
                <p className="text-lg font-bold text-slate-900">
                  {product.stock_quantity}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Mínimo</p>
                <p className="text-lg font-bold text-slate-600">
                  {product.min_stock_alert}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Valor</p>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(product.price * product.stock_quantity)}
                </p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  product.stock_quantity <= product.min_stock_alert
                    ? 'bg-red-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${getStockPercentage(product)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}