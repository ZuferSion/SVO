'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DollarSign, Receipt, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Payment } from '@/types'

interface PaymentHistoryProps {
  payments: Payment[]
  customerId?: string
}

interface PaymentDistribution {
  sale_id: string
  amount_applied: number
  previous_debt: number
  new_debt: number
}

export function PaymentHistory({ payments, customerId }: PaymentHistoryProps) {
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(new Set())
  const [distributions, setDistributions] = useState<Map<string, PaymentDistribution[]>>(new Map())

  useEffect(() => {
    if (customerId) {
      fetchDistributions()
    }
  }, [customerId, payments])

  const fetchDistributions = async () => {
    const supabase = createClient()
    const paymentIds = payments.map(p => p.id)

    const { data } = await supabase
      .from('payment_distributions')
      .select('*')
      .in('payment_id', paymentIds)

    if (data) {
      const distMap = new Map<string, PaymentDistribution[]>()
      data.forEach((dist: any) => {
        if (!distMap.has(dist.payment_id)) {
          distMap.set(dist.payment_id, [])
        }
        distMap.get(dist.payment_id)!.push(dist)
      })
      setDistributions(distMap)
    }
  }

  const toggleExpanded = (paymentId: string) => {
    const newExpanded = new Set(expandedPayments)
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId)
    } else {
      newExpanded.add(paymentId)
    }
    setExpandedPayments(newExpanded)
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo'
      case 'transfer':
        return 'Transferencia'
      default:
        return method
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'success'
      case 'transfer':
        return 'info'
      default:
        return 'default'
    }
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Historial de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Sin pagos registrados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Historial de Pagos ({payments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map((payment) => {
            const paymentDist = distributions.get(payment.id) || []
            const isExpanded = expandedPayments.has(payment.id)
            const hasDistribution = paymentDist.length > 0

            return (
              <div
                key={payment.id}
                className="border border-green-200 rounded-lg overflow-hidden"
              >
                {/* Header del pago */}
                <div className="flex items-center justify-between p-4 bg-green-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-900">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {formatDateTime(payment.payment_date)}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-slate-500 mt-1 italic">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPaymentMethodColor(payment.payment_method)}>
                      {getPaymentMethodLabel(payment.payment_method)}
                    </Badge>
                    {hasDistribution && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(payment.id)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Detalle de distribución */}
                {hasDistribution && isExpanded && (
                  <div className="bg-white p-4 border-t border-green-200">
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Distribución del pago:
                    </p>
                    <div className="space-y-2">
                      {paymentDist.map((dist, index) => (
                        <div
                          key={dist.sale_id}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                        >
                          <div>
                            <span className="font-medium text-slate-900">
                              Venta #{index + 1}
                            </span>
                            <p className="text-xs text-slate-500">
                              Deuda: {formatCurrency(dist.previous_debt)} → {formatCurrency(dist.new_debt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {formatCurrency(dist.amount_applied)}
                            </p>
                            {dist.new_debt === 0 && (
                              <Badge variant="success" className="text-xs mt-1">
                                Liquidada
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}