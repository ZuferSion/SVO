'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
import type { Sale } from '@/types'

export default function SalesPage() {
  const router = useRouter()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data } = await supabase
      .from('sales')
      .select(`
        *,
        customers (
          id,
          full_name
        )
      `)
      .order('sale_date', { ascending: false })

    setSales(data || [])
    setLoading(false)
  }

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.customers?.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || sale.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'paid', label: 'Pagado' },
    { value: 'partial', label: 'Parcial' },
    { value: 'pending', label: 'Pendiente' },
  ]

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

  // Estadísticas
  const totalSales = filteredSales.reduce((sum, s) => sum + s.total_amount, 0)
  const totalPending = filteredSales
    .filter((s) => s.status !== 'paid')
    .reduce((sum, s) => sum + s.remaining_debt, 0)

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Ventas
          </h1>
          <p className="text-slate-600 mt-1">Gestiona el historial de ventas</p>
        </div>
        <Button onClick={() => router.push('/ventas/nueva')}>
          <Plus className="mr-2 h-5 w-5" />
          Nueva Venta
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Buscar por cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-5 w-5" />}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-slate-600">Total Ventas</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {filteredSales.length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-600">Monto Total</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">
            {formatCurrency(totalSales)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-600">Pendiente</p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            {formatCurrency(totalPending)}
          </p>
        </Card>
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShoppingCart}
            title="No hay ventas"
            description="No se encontraron ventas con los filtros aplicados."
            action={{
              label: 'Nueva Venta',
              onClick: () => router.push('/ventas/nueva'),
            }}
          />
        </Card>
      ) : (
        <Card padding={false}>
          {/* Vista Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead align="right">Total</TableHead>
                  <TableHead align="right">Pagado</TableHead>
                  <TableHead align="right">Debe</TableHead>
                  <TableHead align="center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow
                    key={sale.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => router.push(`/ventas/${sale.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">
                          {formatDateTime(sale.sale_date).split(' ')[0]}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDateTime(sale.sale_date).split(' ')[1]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-900">
                        {sale.customers?.full_name || 'Cliente general'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {sale.payment_type === 'cash' ? 'Contado' : 'Crédito'}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="font-medium text-slate-900">
                        {formatCurrency(sale.total_amount)}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="text-green-600 font-medium">
                        {formatCurrency(sale.paid_amount)}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span
                        className={`font-medium ${
                          sale.remaining_debt > 0
                            ? 'text-red-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {formatCurrency(sale.remaining_debt)}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <Badge variant={getStatusColor(sale.status)}>
                        {getStatusLabel(sale.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Vista Mobile */}
          <div className="md:hidden divide-y divide-slate-200">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => router.push(`/ventas/${sale.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {sale.customers?.full_name || 'Cliente general'}
                    </p>
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

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(sale.total_amount)}
                      </span>
                    </div>
                    {sale.remaining_debt > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600">Debe:</span>
                        <span className="font-bold text-red-600">
                          {formatCurrency(sale.remaining_debt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}