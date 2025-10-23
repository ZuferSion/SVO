'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { createClient } from '@/lib/supabase/client'
import { useProductsStore } from '@/store/productsStore'
import type { ProductWithCategory, Category } from '@/types'
import { toast } from 'sonner'

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  product?: ProductWithCategory | null
}

interface FormData {
  name: string
  brand: string
  category_id: string
  price: string
  stock_quantity: string
  min_stock_alert: string
}

export function ProductForm({ isOpen, onClose, product }: ProductFormProps) {
  const { createProduct, updateProduct } = useProductsStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: product ? {
      name: product.name,
      brand: product.brand || '',
      category_id: product.category_id || '',
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      min_stock_alert: product.min_stock_alert.toString(),
    } : {
      name: '',
      brand: '',
      category_id: '',
      price: '',
      stock_quantity: '0',
      min_stock_alert: '5',
    }
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        brand: product.brand || '',
        category_id: product.category_id || '',
        price: product.price.toString(),
        stock_quantity: product.stock_quantity.toString(),
        min_stock_alert: product.min_stock_alert.toString(),
      })
    } else {
      reset({
        name: '',
        brand: '',
        category_id: '',
        price: '',
        stock_quantity: '0',
        min_stock_alert: '5',
      })
    }
  }, [product, reset])

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

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    const productData = {
      name: data.name,
      brand: data.brand || null,
      category_id: data.category_id || null,
      price: parseFloat(data.price),
      stock_quantity: parseInt(data.stock_quantity),
      min_stock_alert: parseInt(data.min_stock_alert),
      is_active: true,
    }

    let error
    if (product) {
      const result = await updateProduct(product.id, productData)
      error = result.error
    } else {
      const result = await createProduct(productData)
      error = result.error
    }

    if (error) {
      toast.error('Error al guardar', {
        description: error,
      })
    } else {
      toast.success(
        product ? 'Producto actualizado' : 'Producto creado',
        {
          description: 'Los cambios se guardaron correctamente',
        }
      )
      handleClose()
    }

    setLoading(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const categoryOptions = [
    { value: '', label: 'Sin categoría' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={product ? 'Editar Producto' : 'Nuevo Producto'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del Producto *"
            placeholder="Ej: Sabritas Adobadas"
            error={errors.name?.message}
            {...register('name', {
              required: 'El nombre es requerido',
            })}
          />

          <Input
            label="Marca"
            placeholder="Ej: Sabritas"
            {...register('brand')}
          />
        </div>

        <Select
          label="Categoría"
          options={categoryOptions}
          {...register('category_id')}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Precio *"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.price?.message}
            {...register('price', {
              required: 'El precio es requerido',
              min: { value: 0, message: 'El precio debe ser mayor a 0' },
            })}
          />

          <Input
            label="Stock Inicial *"
            type="number"
            placeholder="0"
            error={errors.stock_quantity?.message}
            {...register('stock_quantity', {
              required: 'El stock es requerido',
              min: { value: 0, message: 'El stock debe ser mayor o igual a 0' },
            })}
          />

          <Input
            label="Alerta de Stock Mínimo"
            type="number"
            placeholder="5"
            {...register('min_stock_alert', {
              min: { value: 0, message: 'Debe ser mayor o igual a 0' },
            })}
          />
        </div>

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
            {product ? 'Actualizar' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}