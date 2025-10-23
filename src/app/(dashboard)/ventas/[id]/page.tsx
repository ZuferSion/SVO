'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  CreditCard,
  Edit,
  Trash2,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PaymentModal } from '@/components/customers/PaymentModal'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
import { toast } from 'sonner'

export default function SaleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sale, setSale] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchSale()
    }
  }, [params.id])

  const fetchSale = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data } = await supabase
      .from('sales')
      .select(`
        *,
        customers (
          id,
          full_name,
          phone,
          email,
          current_debt
        ),
        sale_items (
          id,
          quantity,
          unit_price,
          subtotal,
          products (
            id,
            name,
            brand
          )
        )
      `)
      .eq('id', params.id)
      .single()

    setSale(data)
    setLoading(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()

    try {
      // Eliminar sale_items primero (por la relación)
      const { error: itemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', sale.id)

      if (itemsError) throw itemsError

      // Eliminar la venta
      const { error: saleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', sale.id)

      if (saleError) throw saleError

      toast.success('Venta eliminada correctamente')
      router.push('/ventas')
    } catch (error: any) {
      toast.error('Error al eliminar', {
        description: error.message,
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'partial':
        return 'warning'
      case 'pending':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado'
      case 'partial':
        return 'Parcial'
      case 'pending':
        return 'Pendiente'
      default:
        return status
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Venta no encontrada
        </h2>
        <p className="text-slate-600 mb-6">
          La venta que buscas no existe o fue eliminada
        </p>
        <Button onClick={() => router.push('/ventas')}>Volver a Ventas</Button>
      </div>
    )
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
            Detalle de Venta
          </h1>
          <p className="text-slate-600 mt-1">
            {formatDateTime(sale.sale_date)}
          </p>
        </div>
        <div className="flex gap-2">
          {sale.remaining_debt > 0 && sale.customers && (
            <Button onClick={() => setPaymentModalOpen(true)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Registrar Pago
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sale.customers ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Nombre</p>
                  <p className="font-medium text-slate-900">
                    {sale.customers.full_name}
                  </p>
                </div>
                {sale.customers.phone && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Teléfono</p>
                    <p className="text-slate-900">{sale.customers.phone}</p>
                  </div>
                )}
                {sale.customers.email && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Email</p>
                    <p className="text-slate-900 text-sm break-all">
                      {sale.customers.email}
                    </p>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      router.push(`/clientes/${sale.customers.id}`)
                    }
                  >
                    Ver Perfil Completo
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Venta sin cliente asociado</p>
            )}
          </CardContent>
        </Card>

        {/* Información de Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Información de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 mb-1">Tipo de Pago</p>
              <Badge variant={sale.payment_type === 'cash' ? 'success' : 'info'}>
                {sale.payment_type === 'cash' ? 'Contado' : 'Crédito'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Estado</p>
              <Badge variant={getStatusColor(sale.status)}>
                {getStatusLabel(sale.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Fecha de Venta</p>
              <div className="flex items-center gap-2 text-slate-900">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(sale.sale_date)}</span>
              </div>
            </div>
            {sale.notes && (
              <div>
                <p className="text-sm text-slate-600 mb-1">Notas</p>
                <p className="text-slate-900 text-sm">{sale.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de Montos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Resumen de Montos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total:</span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(sale.total_amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pagado:</span>
              <span className="text-lg font-medium text-green-600">
                {formatCurrency(sale.paid_amount)}
              </span>
            </div>
            {sale.remaining_debt > 0 && (
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-slate-600">Debe:</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(sale.remaining_debt)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Productos ({sale.sale_items?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sale.sale_items?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {item.products?.name}
                  </p>
                  {item.products?.brand && (
                    <p className="text-sm text-slate-500">
                      {item.products.brand}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 mt-1">
                    {item.quantity} x {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t-2 border-slate-200">
              <span className="text-lg font-medium text-slate-900">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(sale.total_amount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Venta"
        description="¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer y afectará el inventario."
        loading={deleting}
      />

      {sale.customers && sale.remaining_debt > 0 && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          customerId={sale.customers.id}
          currentDebt={sale.remaining_debt}
          saleId={sale.id}
          onSuccess={() => {
            fetchSale()
            setPaymentModalOpen(false)
          }}
        />
      )}
    </div>
  )
}