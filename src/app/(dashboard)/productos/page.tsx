'use client'

import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ProductList } from '@/components/products/ProductList'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useProducts } from '@/hooks/useProducts'
import { createClient } from '@/lib/supabase/client'
import type { ProductWithCategory, Category } from '@/types'
import { useEffect } from 'react'
import { ProductForm } from '@/components/products/ProductForm'

export default function ProductsPage() {
  const {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
  } = useProducts()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (data) {
      setCategories(data)
    }
  }

  const handleEdit = (product: ProductWithCategory) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedProduct(null)
  }

  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ]

  const stockOptions = [
    { value: 'all', label: 'Todo el stock' },
    { value: 'available', label: 'Disponible' },
    { value: 'low', label: 'Stock bajo' },
    { value: 'out', label: 'Agotado' },
  ]

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Productos
          </h1>
          <p className="text-slate-600 mt-1">
            Gestiona tu catálogo de productos
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-5 w-5" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-5 w-5" />}
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={categoryOptions}
        />
        <Select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          options={stockOptions}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Total Productos</p>
          <p className="text-2xl font-bold text-slate-900">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Disponibles</p>
          <p className="text-2xl font-bold text-green-600">
            {products.filter(p => p.stock_quantity > p.min_stock_alert).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Stock Bajo</p>
          <p className="text-2xl font-bold text-amber-600">
            {products.filter(p => p.stock_quantity <= p.min_stock_alert && p.stock_quantity > 0).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">Agotados</p>
          <p className="text-2xl font-bold text-red-600">
            {products.filter(p => p.stock_quantity === 0).length}
          </p>
        </div>
      </div>

      {/* Product List */}
      <ProductList products={products} onEdit={handleEdit} />

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        product={selectedProduct}
      />
    </div>
  )
}