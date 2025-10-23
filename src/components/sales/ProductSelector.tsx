'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatters'
import { useCartStore } from '@/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import type { ProductWithCategory } from '@/types'
import { toast } from 'sonner'

export function ProductSelector() {
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('is_active', true)
      .order('name')

    setProducts((data as any) || [])
    setLoading(false)
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddToCart = (product: ProductWithCategory) => {
    if (product.stock_quantity <= 0) {
      toast.error('Producto agotado', {
        description: 'No hay stock disponible',
      })
      return
    }

    addItem(product as any, 1)
    toast.success('Agregado al carrito', {
      description: product.name,
    })
  }

  const getStockBadge = (product: ProductWithCategory) => {
    if (product.stock_quantity === 0) {
      return <Badge variant="danger">Agotado</Badge>
    }
    if (product.stock_quantity <= product.min_stock_alert) {
      return <Badge variant="warning">Bajo</Badge>
    }
    return null
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <Input
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-5 w-5" />}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No se encontraron productos</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card
              key={product.id}
              className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
                product.stock_quantity === 0 ? 'opacity-50' : ''
              }`}
              onClick={() => handleAddToCart(product)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-900">
                      {product.name}
                    </h3>
                    {getStockBadge(product)}
                  </div>
                  {product.brand && (
                    <p className="text-sm text-slate-500">{product.brand}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-sm text-slate-500">
                      Stock: {product.stock_quantity}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToCart(product)
                  }}
                  disabled={product.stock_quantity === 0}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}