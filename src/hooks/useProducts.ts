'use client'

import { useEffect, useState } from 'react'
import { useProductsStore } from '@/store/productsStore'
import type { ProductWithCategory } from '@/types'

export function useProducts() {
  const { products, loading, error, fetchProducts } = useProductsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = products.filter((product) => {
    // Filtro de búsqueda
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de categoría
    const matchesCategory = 
      categoryFilter === 'all' || 
      product.category_id === categoryFilter

    // Filtro de stock
    let matchesStock = true
    if (stockFilter === 'low') {
      matchesStock = product.stock_quantity <= product.min_stock_alert
    } else if (stockFilter === 'out') {
      matchesStock = product.stock_quantity === 0
    } else if (stockFilter === 'available') {
      matchesStock = product.stock_quantity > product.min_stock_alert
    }

    return matchesSearch && matchesCategory && matchesStock && product.is_active
  })

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    refresh: fetchProducts,
  }
}