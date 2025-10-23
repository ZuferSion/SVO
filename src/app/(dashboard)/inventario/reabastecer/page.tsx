'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { RestockForm } from '@/components/inventory/RestockForm'
import { Badge } from '@/components/ui/badge'
import { useInventory } from '@/hooks/useInventory'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Product } from '@/types'

export default function RestockPage() {
  const router = useRouter()
  const { lowStockProducts, outOfStockProducts, loading, refresh } = useInventory()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleRestock = (product: Product) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedProduct(null)
  }

  const handleSuccess = () => {
    refresh()
  }

  const allLowProducts = [...outOfStockProducts, ...lowStockProducts]

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/inventario')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Reabastecer Inventario
          </h1>
          <p className="text-slate-600 mt-1">
            Productos que requieren reabastecimiento
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          Reabastecer Manualmente
        </Button>
      </div>

      {/* Alert si no hay productos con stock bajo */}
      {allLowProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                ¡Inventario en buen estado!
              </h3>
              <p className="text-slate-600 mb-6">
                No hay productos con stock bajo o agotados
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/inventario')}
              >
                Ver Inventario Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Productos Agotados */}
          {outOfStockProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Productos Agotados ({outOfStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outOfStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {product.name}
                        </p>
                        {product.brand && (
                          <p className="text-sm text-slate-500">{product.brand}</p>
                        )}
                        <Badge variant="danger" className="mt-2">
                          Stock: 0
                        </Badge>
                      </div>
                      <Button onClick={() => handleRestock(product)}>
                        Reabastecer
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Productos con Stock Bajo */}
          {lowStockProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-amber-600">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Stock Bajo ({lowStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {product.name}
                        </p>
                        {product.brand && (
                          <p className="text-sm text-slate-500">{product.brand}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="warning">
                            Stock: {product.stock_quantity}
                          </Badge>
                          <span className="text-sm text-slate-600">
                            Mínimo: {product.min_stock_alert}
                          </span>
                        </div>
                      </div>
                      <Button onClick={() => handleRestock(product)}>
                        Reabastecer
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Restock Form */}
      <RestockForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        preselectedProduct={selectedProduct}
      />
    </div>
  )
}