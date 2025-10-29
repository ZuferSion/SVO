'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/formatters'

interface PaymentsChartProps {
  data: {
    date: string
    total: number
    count: number
    cash: number
    transfer: number
  }[]
  period: string
}

export function PaymentsChart({ data, period }: PaymentsChartProps) {
  const getTitle = () => {
    switch (period) {
      case 'today':
        return 'Ingresos de Hoy'
      case 'week':
        return 'Ingresos de la Última Semana'
      case 'month':
        return 'Ingresos del Mes'
      case 'year':
        return 'Ingresos del Año'
      case 'custom':
        return 'Ingresos del Período Seleccionado'
      default:
        return 'Ingresos'
    }
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-slate-500">No hay ingresos en este período</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => {
                  const labels: any = {
                    cash: 'Efectivo',
                    transfer: 'Transferencia',
                    total: 'Total',
                    count: 'Pagos',
                  }
                  return [
                    name === 'count' ? value : formatCurrency(value),
                    labels[name] || name
                  ]
                }}
              />
              <Legend />
              <Bar
                dataKey="cash"
                name="Efectivo"
                stackId="a"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="transfer"
                name="Transferencia"
                stackId="a"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resumen */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-slate-600">Efectivo</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(data.reduce((sum, d) => sum + d.cash, 0))}
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-slate-600">Transferencia</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(data.reduce((sum, d) => sum + d.transfer, 0))}
            </p>
          </div>
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <p className="text-sm text-slate-600">Total Pagos</p>
            <p className="text-lg font-bold text-primary-600">
              {data.reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}