'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ProductSelector } from '@/components/sales/ProductSelector'
import { CustomerSelector } from '@/components/sales/CustomerSelector'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/formatters'
import { toast } from 'sonner'
import { CartItem } from '@/components/sales/CarItem'

export default function NewSalePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const {
    items,
    customerId,
    paymentType,
    setPaymentType,
    getTotal,
    getItemCount,
    clearCart,
  } = useCartStore()

  const [loading, setLoading] = useState(false)
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false)

  const total = getTotal()
  const itemCount = getItemCount()

  const handleProcessSale = async () => {
    // Validaciones
    if (items.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    // CORRECCIÓN: Cliente es requerido siempre
    if (!customerId) {
      toast.error('Selecciona un cliente para la venta')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // Crear la venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([
          {
            customer_id: customerId, // Ahora siempre requerido
            total_amount: total,
            paid_amount: paymentType === 'cash' ? total : 0,
            status: paymentType === 'cash' ? 'paid' : 'pending',
            payment_type: paymentType,
            created_by: user?.id,
          },
        ])
        .select()
        .single()

      if (saleError) throw saleError

      // Crear los items de la venta
      const saleItems = items.map((item) => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError

      // Si es venta de contado, registrar el pago
      if (paymentType === 'cash') {
        await supabase.from('payments').insert([
          {
            customer_id: customerId,
            sale_id: sale.id,
            amount: total,
            payment_method: 'cash',
            notes: 'Pago de contado',
            created_by: user?.id,
          },
        ])
      }

      toast.success('Venta registrada exitosamente', {
        description: `Total: ${formatCurrency(total)}`,
      })

      clearCart()
      router.push('/ventas')
    } catch (error: any) {
      toast.error('Error al procesar la venta', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/ventas')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Nueva Venta
          </h1>
          <p className="text-slate-600 mt-1">
            Registra una venta en tiempo real
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Productos */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-16rem)]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Productos Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)]">
              <ProductSelector />
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Carrito y Checkout */}
        <div className="space-y-4">
          {/* Tipo de Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tipo de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={paymentType === 'cash' ? 'primary' : 'outline'}
                  onClick={() => setPaymentType('cash')}
                  className="w-full"
                >
                  Contado
                </Button>
                <Button
                  variant={paymentType === 'credit' ? 'primary' : 'outline'}
                  onClick={() => setPaymentType('credit')}
                  className="w-full"
                >
                  Crédito
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Selector de Cliente */}
          {/* Selector de Cliente - SIEMPRE VISIBLE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cliente *</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerSelector
                onCreateNew={() => setIsCustomerFormOpen(true)}
              />
            </CardContent>
          </Card>

          {/* Carrito */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Carrito</span>
                <span className="text-sm font-normal text-slate-600">
                  {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">El carrito está vacío</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Agrega productos para continuar
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <CartItem key={item.product.id} item={item} />
                  ))}
                </div>
              )}

              {/* Total */}
              {items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-slate-900">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatCurrency(total)}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleProcessSale}
                    loading={loading}
                    disabled={loading || items.length === 0}
                  >
                    <DollarSign className="mr-2 h-5 w-5" />
                    Procesar Venta
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => clearCart()}
                    disabled={loading}
                  >
                    Limpiar Carrito
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={isCustomerFormOpen}
        onClose={() => setIsCustomerFormOpen(false)}
      />
    </div>
  )
}