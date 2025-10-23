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
import { Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TopCustomersChartProps {
  customers: {
    id: string
    full_name: string
    totalPurchases: number
    totalSpent: number
    currentDebt: number
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

export function TopCustomersChart({ customers }: TopCustomersChartProps) {
  const router = useRouter()

  if (customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Top 10 Mejores Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-2" />
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
          <Users className="mr-2 h-5 w-5" />
          Top 10 Mejores Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Gráfica de barras */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={customers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis
                type="category"
                dataKey="full_name"
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
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="totalSpent" name="Total Gastado" radius={[0, 8, 8, 0]}>
                {customers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lista detallada */}
        <div className="space-y-3">
          {customers.map((customer, index) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              onClick={() => router.push(`/clientes/${customer.id}`)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{customer.full_name}</p>
                  <p className="text-sm text-slate-500">
                    {customer.totalPurchases} compra(s)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">
                  {formatCurrency(customer.totalSpent)}
                </p>
                {customer.currentDebt > 0 && (
                  <p className="text-sm text-red-600">
                    Debe: {formatCurrency(customer.currentDebt)}
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