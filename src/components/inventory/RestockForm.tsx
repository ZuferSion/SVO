'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import type { Product } from '@/types'
import { toast } from 'sonner'

interface RestockFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preselectedProduct?: Product | null
}

interface FormData {
  product_id: string
  quantity: string
  reason: string
}

export function RestockForm({
  isOpen,
  onClose,
  onSuccess,
  preselectedProduct,
}: RestockFormProps) {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      product_id: preselectedProduct?.id || '',
      quantity: '',
      reason: '',
    },
  })

  const watchedProductId = watch('product_id')

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen])

  useEffect(() => {
    if (preselectedProduct) {
      setSelectedProduct(preselectedProduct)
      reset({
        product_id: preselectedProduct.id,
        quantity: '',
        reason: '',
      })
    }
  }, [preselectedProduct, reset])

  useEffect(() => {
    const product = products.find((p) => p.id === watchedProductId)
    setSelectedProduct(product || null)
  }, [watchedProductId, products])

  const fetchProducts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name')

    setProducts(data || [])
  }

  const onSubmit = async (data: FormData) => {
    if (!selectedProduct) return

    setLoading(true)
    const supabase = createClient()

    try {
      const quantity = parseInt(data.quantity)
      const previousStock = selectedProduct.stock_quantity
      const newStock = previousStock + quantity

      // Actualizar stock del producto
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', data.product_id)

      if (updateError) throw updateError

      // Registrar movimiento de inventario
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert([
          {
            product_id: data.product_id,
            movement_type: 'purchase',
            quantity: quantity,
            previous_stock: previousStock,
            new_stock: newStock,
            reason: data.reason || 'Reabastecimiento manual',
            created_by: user?.id,
          },
        ])

      if (movementError) throw movementError

      toast.success('Inventario actualizado', {
        description: `Se agregaron ${quantity} unidades`,
      })

      handleClose()
      onSuccess()
    } catch (error: any) {
      toast.error('Error al actualizar inventario', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setSelectedProduct(null)
    onClose()
  }

  const productOptions = [
    { value: '', label: 'Selecciona un producto' },
    ...products.map((p) => ({
      value: p.id,
      label: `${p.name} ${p.brand ? `- ${p.brand}` : ''}`,
    })),
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reabastecer Inventario"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Producto *"
          options={productOptions}
          error={errors.product_id?.message}
          disabled={!!preselectedProduct}
          {...register('product_id', {
            required: 'Selecciona un producto',
          })}
        />

        {selectedProduct && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600 mb-1">Stock Actual</p>
                <p className="text-2xl font-bold text-slate-900">
                  {selectedProduct.stock_quantity}
                </p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Stock Mínimo</p>
                <p className="text-2xl font-bold text-slate-600">
                  {selectedProduct.min_stock_alert}
                </p>
              </div>
            </div>
          </div>
        )}

        <Input
          label="Cantidad a Agregar *"
          type="number"
          placeholder="0"
          error={errors.quantity?.message}
          {...register('quantity', {
            required: 'La cantidad es requerida',
            min: { value: 1, message: 'La cantidad debe ser mayor a 0' },
          })}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Motivo (opcional)
          </label>
          <textarea
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="Ej: Compra de proveedor, ajuste de inventario..."
            {...register('reason')}
          />
        </div>

        {selectedProduct && watch('quantity') && (
          <div className="bg-primary-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Nuevo Stock</p>
            <p className="text-3xl font-bold text-primary-600">
              {selectedProduct.stock_quantity + parseInt(watch('quantity') || '0')}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            Reabastecer
          </Button>
        </div>
      </form>
    </Modal>
  )
}