'use client'

import { useState } from 'react'
import { Edit, Trash2, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useProductsStore } from '@/store/productsStore'
import type { ProductWithCategory } from '@/types'
import { toast } from 'sonner'

interface ProductListProps {
  products: ProductWithCategory[]
  onEdit: (product: ProductWithCategory) => void
}

export function ProductList({ products, onEdit }: ProductListProps) {
  const { deleteProduct } = useProductsStore()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    const { error } = await deleteProduct(deleteId)

    if (error) {
      toast.error('Error al eliminar', {
        description: error,
      })
    } else {
      toast.success('Producto eliminado correctamente')
    }

    setDeleting(false)
    setDeleteId(null)
  }

  const getStockBadge = (product: ProductWithCategory) => {
    if (product.stock_quantity === 0) {
      return <Badge variant="danger">Agotado</Badge>
    }
    if (product.stock_quantity <= product.min_stock_alert) {
      return <Badge variant="warning">Stock Bajo</Badge>
    }
    return <Badge variant="success">Disponible</Badge>
  }

  if (products.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Package}
          title="No hay productos"
          description="No se encontraron productos con los filtros aplicados."
        />
      </Card>
    )
  }

  return (
    <>
      <Card padding={false}>
        {/* Vista Desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead align="right">Precio</TableHead>
                <TableHead align="center">Stock</TableHead>
                <TableHead align="center">Estado</TableHead>
                <TableHead align="right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      {product.brand && (
                        <p className="text-sm text-slate-500">{product.brand}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600">
                      {product.categories?.name || 'Sin categoría'}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span className="font-medium">
                      {formatCurrency(product.price)}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <span className="font-semibold">{product.stock_quantity}</span>
                  </TableCell>
                  <TableCell align="center">
                    {getStockBadge(product)}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Vista Mobile */}
        <div className="md:hidden divide-y divide-slate-200">
          {products.map((product) => (
            <div key={product.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{product.name}</p>
                  {product.brand && (
                    <p className="text-sm text-slate-500">{product.brand}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {product.categories?.name || 'Sin categoría'}
                  </p>
                </div>
                {getStockBadge(product)}
              </div>

              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(product.price)}
                  </p>
                  <p className="text-sm text-slate-600">
                    Stock: <span className="font-semibold">{product.stock_quantity}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(product.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Producto"
        description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        loading={deleting}
      />
    </>
  )
}