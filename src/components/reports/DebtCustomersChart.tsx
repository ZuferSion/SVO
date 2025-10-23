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
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatters'
import { AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DebtCustomersChartProps {
  customers: {
    id: string
    full_name: string
    totalPurchases: number
    totalSpent: number
    currentDebt: number
  }[]
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#fbbf24']

export function DebtCustomersChart({ customers }: DebtCustomersChartProps) {
  const router = useRouter()

  if (customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Clientes con Deuda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              ¡Excelente!
            </h3>
            <p className="text-slate-600">
              No hay clientes con deuda pendiente
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalDebt = customers.reduce((sum, c) => sum + c.currentDebt, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Clientes con Mayor Deuda
          </CardTitle>
          <Badge variant="danger" className="text-lg px-3 py-1">
            {formatCurrency(totalDebt)}
          </Badge>
        </div>
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
              <Bar dataKey="currentDebt" name="Deuda Actual" radius={[0, 8, 8, 0]}>
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
              className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
              onClick={() => router.push(`/clientes/${customer.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm bg-red-600">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{customer.full_name}</p>
                  <p className="text-sm text-slate-600">
                    {customer.totalPurchases} compra(s) · Total: {formatCurrency(customer.totalSpent)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600 text-lg">
                  {formatCurrency(customer.currentDebt)}
                </p>
                <p className="text-xs text-slate-500">
                  {((customer.currentDebt / customer.totalSpent) * 100).toFixed(0)}% pendiente
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}