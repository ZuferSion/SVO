'use client'

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/formatters'

interface SalesTrendChartProps {
  data: { date: string; total: number; count: number }[]
  period: string
}

export function SalesTrendChart({ data, period }: SalesTrendChartProps) {
  const getTitle = () => {
    switch (period) {
      case 'today':
        return 'Ventas de Hoy'
      case 'week':
        return 'Ventas de la Última Semana'
      case 'month':
        return 'Ventas del Mes'
      case 'year':
        return 'Ventas del Año'
      default:
        return 'Ventas'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                  if (name === 'total') {
                    return [formatCurrency(value), 'Monto']
                  }
                  return [value, 'Ventas']
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                name="Monto"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Cantidad"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}