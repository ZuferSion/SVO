'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/formatters'

const modalAnimationStyles = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-in {
    animation: slideIn 0.2s ease-out;
  }
`

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
  currentDebt: number
  saleId?: string // Si viene de detalle de venta específica
  onSuccess: () => void
}

interface FormData {
  amount: string
  payment_method: 'cash' | 'transfer'
  notes: string
}

interface PendingSale {
  id: string
  sale_date: string
  total_amount: number
  remaining_debt: number
}

export function PaymentModal({
  isOpen,
  onClose,
  customerId,
  currentDebt,
  saleId,
  onSuccess,
}: PaymentModalProps) {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([])
  const [loadingSales, setLoadingSales] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      amount: currentDebt.toString(),
      payment_method: 'cash',
      notes: '',
    },
  })

  const amount = watch('amount')

  // Cargar ventas pendientes del cliente
  useEffect(() => {
    if (isOpen && !saleId) {
      fetchPendingSales()
    }
  }, [isOpen, saleId, customerId])

  const fetchPendingSales = async () => {
    setLoadingSales(true)
    const supabase = createClient()

    const { data } = await supabase
      .from('sales')
      .select('id, sale_date, total_amount, remaining_debt')
      .eq('customer_id', customerId)
      .neq('status', 'paid')
      .gt('remaining_debt', 0)
      .order('sale_date', { ascending: true })

    setPendingSales(data || [])
    setLoadingSales(false)
  }

  const simulateDistribution = () => {
    const paymentAmount = parseFloat(amount || '0')
    if (paymentAmount <= 0 || !pendingSales.length) return []

    let remaining = paymentAmount
    const distribution: Array<{
      saleId: string
      date: string
      amountApplied: number
      previousDebt: number
      newDebt: number
    }> = []

    for (const sale of pendingSales) {
      if (remaining <= 0) break

      const amountToApply = Math.min(remaining, sale.remaining_debt)
      distribution.push({
        saleId: sale.id,
        date: sale.sale_date,
        amountApplied: amountToApply,
        previousDebt: sale.remaining_debt,
        newDebt: sale.remaining_debt - amountToApply,
      })

      remaining -= amountToApply
    }

    return distribution
  }

  const distribution = simulateDistribution()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const supabase = createClient()

    try {
      const paymentAmount = parseFloat(data.amount)

      if (paymentAmount <= 0) {
        toast.error('El monto debe ser mayor a 0')
        setLoading(false)
        return
      }

      if (paymentAmount > currentDebt) {
        toast.error('El monto no puede ser mayor a la deuda actual')
        setLoading(false)
        return
      }

      // CASO 1: Pago directo a una venta específica
      if (saleId) {
        const { error: paymentError } = await supabase.from('payments').insert([
          {
            customer_id: customerId,
            sale_id: saleId,
            amount: paymentAmount,
            payment_method: data.payment_method,
            notes: data.notes || null,
            created_by: user?.id,
          },
        ])

        if (paymentError) throw paymentError

        toast.success('Pago registrado correctamente', {
          description: `Se registró un pago de ${formatCurrency(paymentAmount)}`,
        })
      }
      // CASO 2: Pago general - distribuir entre ventas pendientes
      else {
        // 1. Insertar el pago general (sin sale_id)
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert([
            {
              customer_id: customerId,
              sale_id: null, // Pago general
              amount: paymentAmount,
              payment_method: data.payment_method,
              notes: data.notes || 'Pago general aplicado a múltiples ventas',
              created_by: user?.id,
            },
          ])
          .select()
          .single()

        if (paymentError) throw paymentError

        // 2. Llamar a la función que distribuye el pago
        const { data: distributionResult, error: distError } = await supabase.rpc(
          'distribute_payment_to_sales',
          {
            p_customer_id: customerId,
            p_payment_amount: paymentAmount,
          }
        )

        if (distError) throw distError

        // 3. Registrar el detalle de la distribución
        if (distributionResult && distributionResult.length > 0) {
          const distributionRecords = distributionResult.map((dist: any) => ({
            payment_id: paymentData.id,
            sale_id: dist.sale_id,
            amount_applied: dist.amount_applied,
            previous_debt: dist.previous_debt,
            new_debt: dist.new_debt,
          }))

          await supabase.from('payment_distributions').insert(distributionRecords)
        }

        // Mensaje de éxito detallado
        const salesAffected = distributionResult?.length || 0
        toast.success('Pago distribuido correctamente', {
          description: `${formatCurrency(paymentAmount)} aplicado a ${salesAffected} venta(s)`,
        })
      }

      handleClose()
      onSuccess()
    } catch (error: any) {
      console.error('Error completo:', error)
      toast.error('Error al registrar el pago', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset({
      amount: '',
      payment_method: 'cash',
      notes: '',
    })
    onClose()
  }

  const handlePayFullDebt = () => {
    setValue('amount', currentDebt.toString())
  }

  const paymentMethodOptions = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'transfer', label: 'Transferencia' },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={saleId ? 'Registrar Pago a Venta' : 'Registrar Pago General'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600 mb-1">Deuda Total</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(currentDebt)}
          </p>
          {saleId ? (
            <p className="text-xs text-slate-500 mt-2">
              ✓ Pago directo a esta venta específica
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-2">
              💡 El pago se distribuirá automáticamente (más antiguo primero)
            </p>
          )}
        </div>

        <Input
          label="Monto a Pagar *"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount', {
            required: 'El monto es requerido',
            min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
            max: {
              value: currentDebt,
              message: 'El monto no puede ser mayor a la deuda',
            },
          })}
        />

        {currentDebt > 0 && parseFloat(amount || '0') < currentDebt && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handlePayFullDebt}
          >
            Pagar Deuda Completa ({formatCurrency(currentDebt)})
          </Button>
        )}

        <Select
          label="Método de Pago *"
          options={paymentMethodOptions}
          {...register('payment_method')}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={2}
            placeholder="Ej: Pago parcial, abono..."
            {...register('notes')}
          />
        </div>

        {/* Simulación de distribución */}
        {!saleId && distribution.length > 0 && parseFloat(amount || '0') > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-slide-in">
            <p className="text-sm font-medium text-blue-900 mb-3">
              📋 Distribución del Pago:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {distribution.map((dist, index) => (
                <div
                  key={dist.saleId}
                  className="flex items-center justify-between text-sm bg-white p-2 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      Venta #{index + 1}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(dist.date).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(dist.amountApplied)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {dist.newDebt === 0 ? (
                        <Badge variant="success" className="text-xs">
                          Pagada
                        </Badge>
                      ) : (
                        `Queda: ${formatCurrency(dist.newDebt)}`
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ventas pendientes (solo si no es pago directo) */}
        {!saleId && pendingSales.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">
              Ventas Pendientes ({pendingSales.length}):
            </p>
            <div className="space-y-1 text-xs text-slate-600 max-h-32 overflow-y-auto">
              {pendingSales.map((sale, index) => (
                <div key={sale.id} className="flex justify-between">
                  <span>
                    {index + 1}. {new Date(sale.sale_date).toLocaleDateString('es-MX')}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(sale.remaining_debt)}
                  </span>
                </div>
              ))}
            </div>
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
            Registrar Pago
          </Button>
        </div>
      </form>
    </Modal>
  )
}