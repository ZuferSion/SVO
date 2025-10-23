'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Package, Plus, TrendingUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { InventoryList } from '@/components/inventory/InventoryList'
import { MovementHistory } from '@/components/inventory/MovementHistory'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useInventory } from '@/hooks/useInventory'
import { formatCurrency } from '@/lib/utils/formatters'

export default function InventoryPage() {
  const router = useRouter()
  const {
    products,
    allProducts,
    movements,
    lowStockProducts,
    outOfStockProducts,
    loading,
    searchTerm,
    setSearchTerm,
    stockFilter,
    setStockFilter,
  } = useInventory()

  const stockOptions = [
    { value: 'all', label: 'Todo el inventario' },
    { value: 'available', label: 'Stock disponible' },
    { value: 'low', label: 'Stock bajo' },
    { value: 'out', label: 'Agotado' },
  ]

  // Calcular valor total del inventario
  const totalInventoryValue = allProducts.reduce(
    (sum, p) => sum + p.price * p.stock_quantity,
    0
  )

  const totalProducts = allProducts.length

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Inventario
          </h1>
          <p className="text-slate-600 mt-1">
            Control y gestión de stock de productos
          </p>
        </div>
        <Button onClick={() => router.push('/inventario/reabastecer')}>
          <Plus className="mr-2 h-5 w-5" />
          Reabastecer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Productos</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {totalProducts}
              </p>
            </div>
            <div className="bg-primary-50 p-3 rounded-full">
              <Package className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Valor Total</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">
                {formatCurrency(totalInventoryValue)}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Stock Bajo</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">
                {lowStockProducts.length}
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Agotados</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {outOfStockProducts.length}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-full">
              <Package className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-5 w-5" />}
        />
        <Select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          options={stockOptions}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryList products={products} />
        </div>
        <div>
          <MovementHistory movements={movements} />
        </div>
      </div>
    </div>
  )
}