'use client'

import { DollarSign, ShoppingCart, TrendingUp, CreditCard, Wallet, ArrowRightLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { SalesTrendChart } from '@/components/reports/SalesTrendChart'
import { PaymentsChart } from '@/components/reports/PaymentsChart'
import { TopProductsChart } from '@/components/reports/TopProductsChart'
import { TopCustomersChart } from '@/components/reports/TopCustomersChart'
import { DebtCustomersChart } from '@/components/reports/DebtCustomersChart'
import { DateRangePicker } from '@/components/reports/DateRangePicker'
import { useReports } from '@/hooks/useReports'
import { formatCurrency } from '@/lib/utils/formatters'

export default function ReportsPage() {
  const {
    period,
    setPeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    loading,
    salesReport,
    topProducts,
    topCustomers,
    customersWithDebt,
    salesByPeriod,
    paymentsByPeriod,
    refresh,
  } = useReports()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  const periodButtons = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'year', label: 'Año' },
    { value: 'custom', label: 'Personalizado' },
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Reportes y Análisis
          </h1>
          <p className="text-slate-600 mt-1">
            Analiza el rendimiento de tu negocio
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {periodButtons.map((btn) => (
            <Button
              key={btn.value}
              variant={period === btn.value ? 'primary' : 'outline'}
              onClick={() => setPeriod(btn.value)}
              size="sm"
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Selector de rango personalizado */}
      {period === 'custom' && (
        <DateRangePicker
          startDate={customStartDate}
          endDate={customEndDate}
          onStartDateChange={setCustomStartDate}
          onEndDateChange={setCustomEndDate}
          onApply={refresh}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Ventas</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {salesReport.totalSales}
              </p>
            </div>
            <div className="bg-primary-50 p-3 rounded-full">
              <ShoppingCart className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Vendido</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {formatCurrency(salesReport.totalRevenue)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Monto total</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">💰 Cobrado</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {formatCurrency(salesReport.totalCollected)}
              </p>
              <p className="text-xs text-green-600 mt-1">Ingresos reales</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Por Cobrar</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {formatCurrency(salesReport.totalPending)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Pendiente</p>
            </div>
            <div className="bg-red-50 p-3 rounded-full">
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Métodos de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Efectivo</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(salesReport.cashPayments)}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Transferencia</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency(salesReport.transferPayments)}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <ArrowRightLeft className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Ticket Promedio</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(salesReport.averageTicket)}
              </p>
            </div>
            <div className="bg-primary-50 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficas de Ventas e Ingresos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesTrendChart data={salesByPeriod} period={period} />
        <PaymentsChart data={paymentsByPeriod} period={period} />
      </div>

      {/* Top Productos y Top Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsChart products={topProducts} />
        <TopCustomersChart customers={topCustomers} />
      </div>

      {/* Clientes con Deuda */}
      <DebtCustomersChart customers={customersWithDebt} />
    </div>
  )
}