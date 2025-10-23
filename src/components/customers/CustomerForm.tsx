'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useCustomersStore } from '@/store/customersStore'
import type { Customer } from '@/types'
import { toast } from 'sonner'
import { useState } from 'react'

interface CustomerFormProps {
  isOpen: boolean
  onClose: () => void
  customer?: Customer | null
}

interface FormData {
  full_name: string
  phone: string
  email: string
  address: string
  notes: string
}

export function CustomerForm({ isOpen, onClose, customer }: CustomerFormProps) {
  const { createCustomer, updateCustomer } = useCustomersStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: customer ? {
      full_name: customer.full_name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
    } : {
      full_name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    }
  })

  useEffect(() => {
    if (customer) {
      reset({
        full_name: customer.full_name,
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        notes: customer.notes || '',
      })
    } else {
      reset({
        full_name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      })
    }
  }, [customer, reset])

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    const customerData = {
      full_name: data.full_name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
      is_active: true,
    }

    let error
    if (customer) {
      const result = await updateCustomer(customer.id, customerData)
      error = result.error
    } else {
      const result = await createCustomer(customerData)
      error = result.error
    }

    if (error) {
      toast.error('Error al guardar', {
        description: error,
      })
    } else {
      toast.success(
        customer ? 'Cliente actualizado' : 'Cliente creado',
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={customer ? 'Editar Cliente' : 'Nuevo Cliente'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre Completo *"
          placeholder="Ej: Juan Pérez García"
          error={errors.full_name?.message}
          {...register('full_name', {
            required: 'El nombre es requerido',
          })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            type="tel"
            placeholder="9931234567"
            {...register('phone')}
          />

          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="cliente@ejemplo.com"
            error={errors.email?.message}
            {...register('email', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Correo inválido',
              },
            })}
          />
        </div>

        <Input
          label="Dirección"
          placeholder="Calle, Número, Colonia"
          {...register('address')}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notas
          </label>
          <textarea
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="Notas adicionales sobre el cliente..."
            {...register('notes')}
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
            {customer ? 'Actualizar' : 'Crear Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}