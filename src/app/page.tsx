'use client'

import { DollarSign, Users, AlertTriangle, TrendingUp } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RecentSales } from '@/components/dashboard/RecentSales'
import { LowStockAlert } from '@/components/dashboard/LowStockAlert'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useDashboard } from '@/hooks/useDashboard'
import DashboardLayout from './(dashboard)/layout'

function DashboardContent() {
  const { stats, recentSales, lowStockProducts, chartData, loading } = useDashboard()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="text-slate-600 mt-1">
          Resumen general de tu negocio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Ventas de Hoy"
          value={stats.todaySales}
          icon={DollarSign}
          variant="success"
          isCurrency
        />
        <StatsCard
          title="Deuda Total"
          value={stats.totalDebt}
          icon={TrendingUp}
          variant="warning"
          isCurrency
        />
        <StatsCard
          title="Stock Bajo"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          variant={stats.lowStockCount > 0 ? 'danger' : 'default'}
        />
        <StatsCard
          title="Clientes Activos"
          value={stats.totalCustomers}
          icon={Users}
          variant="default"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={chartData} />
        </div>
        <div>
          <LowStockAlert products={lowStockProducts} />
        </div>
      </div>

      {/* Recent Sales */}
      <RecentSales sales={recentSales} />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  )
}