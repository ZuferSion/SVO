'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Customer, Sale, Payment } from '@/types'

interface CustomerDetail extends Customer {
  sales: Sale[]
  payments: Payment[]
  totalPurchases: number
  totalPaid: number
}

export function useCustomerDetail(customerId: string) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetail()
    }
  }, [customerId])

  const fetchCustomerDetail = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Obtener datos del cliente
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

      if (customerError) throw customerError

      // Obtener ventas del cliente
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
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
        .eq('customer_id', customerId)
        .order('sale_date', { ascending: false })

      if (salesError) throw salesError

      // Obtener pagos del cliente
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('customer_id', customerId)
        .order('payment_date', { ascending: false })

      if (paymentsError) throw paymentsError

      // Calcular totales
      const totalPurchases = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
      const totalPaid = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      setCustomer({
        ...customerData,
        sales: salesData || [],
        payments: paymentsData || [],
        totalPurchases,
        totalPaid,
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    customer,
    loading,
    error,
    refresh: fetchCustomerDetail,
  }
}