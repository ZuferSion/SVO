'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/formatters'
import { Package } from 'lucide-react'

interface TopProductsChartProps {
  products: {
    id: string
    name: string
    brand: string | null
    totalQuantity: number
    totalRevenue: number
  }[]
}

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#14b8a6',
  '#8b5cf6',
  '#6366f1',
]

export function TopProductsChart({ products }: TopProductsChartProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Top 10 Productos Más Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No hay datos disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5" />
          Top 10 Productos Más Vendidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Gráfica de barras */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={products} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'totalQuantity') {
                    return [value, 'Cantidad vendida']
                  }
                  return [formatCurrency(value), 'Ingresos']
                }}
              />
              <Bar dataKey="totalQuantity" radius={[0, 8, 8, 0]}>
                {products.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lista detallada */}
        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{product.name}</p>
                  {product.brand && (
                    <p className="text-sm text-slate-500">{product.brand}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">
                  {product.totalQuantity} unidades
                </p>
                <p className="text-sm text-slate-600">
                  {formatCurrency(product.totalRevenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}