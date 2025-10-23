'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  ShoppingCart,
  Edit,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PurchaseHistory } from '@/components/customers/PurchaseHistory'
import { PaymentHistory } from '@/components/customers/PaymentHistory'
import { PaymentModal } from '@/components/customers/PaymentModal'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { useCustomerDetail } from '@/hooks/useCustomerDetail'
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { customer, loading, refresh } = useCustomerDetail(resolvedParams.id)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Cliente no encontrado
        </h2>
        <p className="text-slate-600 mb-6">
          El cliente que buscas no existe o fue eliminado
        </p>
        <Button onClick={() => router.push('/clientes')}>
          Volver a Clientes
        </Button>
      </div>
    )
  }

  const averagePurchase =
    customer.sales.length > 0
      ? customer.totalPurchases / customer.sales.length
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/clientes')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            {customer.full_name}
          </h1>
          <p className="text-slate-600 mt-1">Información del cliente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          {customer.current_debt > 0 && (
            <Button onClick={() => setIsPaymentModalOpen(true)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Registrar Pago
            </Button>
          )}
        </div>
      </div>

      {/* Información del Cliente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.phone ? (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Teléfono</p>
                  <p className="font-medium text-slate-900">{customer.phone}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-slate-300 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-400">Sin teléfono</p>
                </div>
              </div>
            )}

            {customer.email ? (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Correo</p>
                  <p className="font-medium text-slate-900 break-all">
                    {customer.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-300 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-400">Sin correo</p>
                </div>
              </div>
            )}

            {customer.address ? (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">Dirección</p>
                  <p className="font-medium text-slate-900">{customer.address}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-300 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-400">Sin dirección</p>
                </div>
              </div>
            )}

            {customer.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-slate-600 mb-2">Notas</p>
                <p className="text-slate-900 text-sm">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Deuda Actual</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {formatCurrency(customer.current_debt)}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-full">
                  <DollarSign className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Compras</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {formatCurrency(customer.totalPurchases)}
                  </p>
                </div>
                <div className="bg-primary-50 p-3 rounded-full">
                  <ShoppingCart className="h-8 w-8 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Pagado</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {formatCurrency(customer.totalPaid)}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Ticket Promedio</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {formatCurrency(averagePurchase)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {customer.sales.length} compra(s)
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-full">
                  <TrendingUp className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PurchaseHistory sales={customer.sales} />
        <PaymentHistory payments={customer.payments} />
      </div>

      {/* Sección de Ventas Pendientes (Opcional) */}
      {customer.sales.filter(s => s.status !== 'paid').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-amber-600">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ventas Pendientes de Pago ({customer.sales.filter(s => s.status !== 'paid').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {customer.sales
                .filter(s => s.status !== 'paid')
                .sort((a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime())
                .map((sale, index) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        Venta #{index + 1}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatDateTime(sale.sale_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {formatCurrency(sale.remaining_debt)}
                      </p>
                      <Badge variant={sale.status === 'partial' ? 'warning' : 'danger'}>
                        {sale.status === 'partial' ? 'Parcial' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        customerId={customer.id}
        currentDebt={customer.current_debt}
        onSuccess={refresh}
      />

      <CustomerForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
      />
    </div>
  )
}