'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product, InventoryMovement } from '@/types'

interface InventoryData {
  products: Product[]
  movements: any[]
  lowStockProducts: Product[]
  outOfStockProducts: Product[]
}

export function useInventory() {
  const [data, setData] = useState<InventoryData>({
    products: [],
    movements: [],
    lowStockProducts: [],
    outOfStockProducts: [],
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState<string>('all')

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      // Obtener productos
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

      // Obtener movimientos recientes
      const { data: movementsData } = await supabase
        .from('inventory_movements')
        .select(`
          *,
          products (
            id,
            name,
            brand
          ),
          profiles (
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      const products = productsData || []
      const lowStock = products.filter(
        (p) => p.stock_quantity <= p.min_stock_alert && p.stock_quantity > 0
      )
      const outOfStock = products.filter((p) => p.stock_quantity === 0)

      setData({
        products,
        movements: movementsData || [],
        lowStockProducts: lowStock,
        outOfStockProducts: outOfStock,
      })
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = data.products.filter((product) => {
    // Filtro de búsqueda
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de stock
    let matchesStock = true
    if (stockFilter === 'low') {
      matchesStock =
        product.stock_quantity <= product.min_stock_alert &&
        product.stock_quantity > 0
    } else if (stockFilter === 'out') {
      matchesStock = product.stock_quantity === 0
    } else if (stockFilter === 'available') {
      matchesStock = product.stock_quantity > product.min_stock_alert
    }

    return matchesSearch && matchesStock
  })

  return {
    products: filteredProducts,
    allProducts: data.products,
    movements: data.movements,
    lowStockProducts: data.lowStockProducts,
    outOfStockProducts: data.outOfStockProducts,
    loading,
    searchTerm,
    setSearchTerm,
    stockFilter,
    setStockFilter,
    refresh: fetchInventoryData,
  }
}