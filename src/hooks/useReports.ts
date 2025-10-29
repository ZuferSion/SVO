'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns'

interface SalesReport {
  totalSales: number
  totalRevenue: number
  totalCollected: number // NUEVO: Dinero real cobrado
  totalPending: number // NUEVO: Dinero por cobrar
  averageTicket: number
  cashPayments: number // NUEVO: Pagos en efectivo
  transferPayments: number // NUEVO: Pagos por transferencia
}

interface TopProduct {
  id: string
  name: string
  brand: string | null
  totalQuantity: number
  totalRevenue: number
}

interface TopCustomer {
  id: string
  full_name: string
  totalPurchases: number
  totalSpent: number
  currentDebt: number
}

interface SalesByPeriod {
  date: string
  total: number
  count: number
}

interface PaymentsByPeriod {
  date: string
  total: number
  count: number
  cash: number
  transfer: number
}

export function useReports() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month')
  const [customStartDate, setCustomStartDate] = useState<Date>(startOfMonth(new Date()))
  const [customEndDate, setCustomEndDate] = useState<Date>(endOfDay(new Date()))
  const [loading, setLoading] = useState(true)
  const [salesReport, setSalesReport] = useState<SalesReport>({
    totalSales: 0,
    totalRevenue: 0,
    totalCollected: 0,
    totalPending: 0,
    averageTicket: 0,
    cashPayments: 0,
    transferPayments: 0,
  })
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [customersWithDebt, setCustomersWithDebt] = useState<TopCustomer[]>([])
  const [salesByPeriod, setSalesByPeriod] = useState<SalesByPeriod[]>([])
  const [paymentsByPeriod, setPaymentsByPeriod] = useState<PaymentsByPeriod[]>([])

  useEffect(() => {
    fetchReports()
  }, [period, customStartDate, customEndDate])

  const getDateRange = () => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case 'today':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        break
      case 'week':
        startDate = startOfDay(subDays(now, 7))
        endDate = endOfDay(now)
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'year':
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      case 'custom':
        startDate = startOfDay(customStartDate)
        endDate = endOfDay(customEndDate)
        break
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    return { startDate, endDate }
  }

  const fetchReports = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { startDate, endDate } = getDateRange()

      // ========================================
      // 1. VENTAS DEL PERÍODO
      // ========================================
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount, paid_amount, remaining_debt, sale_date')
        .gte('sale_date', startDate.toISOString())
        .lte('sale_date', endDate.toISOString())

      const totalSales = salesData?.length || 0
      const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0

      // ========================================
      // 2. PAGOS REALES RECIBIDOS (NUEVO)
      // ========================================
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, payment_method, payment_date')
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString())

      const totalCollected = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0
      const cashPayments = paymentsData?.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + p.amount, 0) || 0
      const transferPayments = paymentsData?.filter(p => p.payment_method === 'transfer').reduce((sum, p) => sum + p.amount, 0) || 0
      const totalPending = totalRevenue - totalCollected

      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

      setSalesReport({
        totalSales,
        totalRevenue,
        totalCollected,
        totalPending,
        averageTicket,
        cashPayments,
        transferPayments,
      })

      // ========================================
      // 3. PAGOS POR DÍA (NUEVO)
      // ========================================
      const paymentsByDay = new Map<string, { total: number; count: number; cash: number; transfer: number }>()
      paymentsData?.forEach((payment) => {
        const date = format(new Date(payment.payment_date), 'dd/MM')
        if (paymentsByDay.has(date)) {
          const existing = paymentsByDay.get(date)!
          existing.total += payment.amount
          existing.count += 1
          if (payment.payment_method === 'cash') existing.cash += payment.amount
          if (payment.payment_method === 'transfer') existing.transfer += payment.amount
        } else {
          paymentsByDay.set(date, {
            total: payment.amount,
            count: 1,
            cash: payment.payment_method === 'cash' ? payment.amount : 0,
            transfer: payment.payment_method === 'transfer' ? payment.amount : 0,
          })
        }
      })

      const paymentsByPeriodArray = Array.from(paymentsByDay.entries())
        .map(([date, data]) => ({
          date,
          total: data.total,
          count: data.count,
          cash: data.cash,
          transfer: data.transfer,
        }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split('/').map(Number)
          const [dayB, monthB] = b.date.split('/').map(Number)
          return monthA === monthB ? dayA - dayB : monthA - monthB
        })

      setPaymentsByPeriod(paymentsByPeriodArray)

      // ========================================
      // 4. TOP PRODUCTOS (igual que antes)
      // ========================================
      const { data: productsData } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          unit_price,
          subtotal,
          products (
            id,
            name,
            brand
          ),
          sales!inner (
            sale_date
          )
        `)
        .gte('sales.sale_date', startDate.toISOString())
        .lte('sales.sale_date', endDate.toISOString())

      const productsMap = new Map<string, TopProduct>()
      productsData?.forEach((item: any) => {
        if (!item.products) return
        
        const productId = item.products.id
        if (productsMap.has(productId)) {
          const existing = productsMap.get(productId)!
          existing.totalQuantity += item.quantity
          existing.totalRevenue += item.subtotal
        } else {
          productsMap.set(productId, {
            id: item.products.id,
            name: item.products.name,
            brand: item.products.brand,
            totalQuantity: item.quantity,
            totalRevenue: item.subtotal,
          })
        }
      })

      const topProductsArray = Array.from(productsMap.values())
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10)

      setTopProducts(topProductsArray)

      // ========================================
      // 5. TOP CLIENTES (igual que antes)
      // ========================================
      const { data: customersData } = await supabase
        .from('customers')
        .select('id, full_name, current_debt')
        .eq('is_active', true)

      const customersWithSales = await Promise.all(
        (customersData || []).map(async (customer) => {
          const { data: customerSales } = await supabase
            .from('sales')
            .select('total_amount')
            .eq('customer_id', customer.id)
            .gte('sale_date', startDate.toISOString())
            .lte('sale_date', endDate.toISOString())

          const totalPurchases = customerSales?.length || 0
          const totalSpent = customerSales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0

          return {
            id: customer.id,
            full_name: customer.full_name,
            totalPurchases,
            totalSpent,
            currentDebt: customer.current_debt,
          }
        })
      )

      const topCustomersArray = customersWithSales
        .filter((c) => c.totalPurchases > 0)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10)

      setTopCustomers(topCustomersArray)

      const customersWithDebtArray = customersWithSales
        .filter((c) => c.currentDebt > 0)
        .sort((a, b) => b.currentDebt - a.currentDebt)
        .slice(0, 10)

      setCustomersWithDebt(customersWithDebtArray)

      // ========================================
      // 6. VENTAS POR DÍA (para comparar)
      // ========================================
      const salesByDay = new Map<string, { total: number; count: number }>()
      salesData?.forEach((sale) => {
        const date = format(new Date(sale.sale_date), 'dd/MM')
        if (salesByDay.has(date)) {
          const existing = salesByDay.get(date)!
          existing.total += sale.total_amount
          existing.count += 1
        } else {
          salesByDay.set(date, { total: sale.total_amount, count: 1 })
        }
      })

      const salesByPeriodArray = Array.from(salesByDay.entries())
        .map(([date, data]) => ({
          date,
          total: data.total,
          count: data.count,
        }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split('/').map(Number)
          const [dayB, monthB] = b.date.split('/').map(Number)
          return monthA === monthB ? dayA - dayB : monthA - monthB
        })

      setSalesByPeriod(salesByPeriodArray)

    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    period,
    setPeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    loading,
    salesReport,
    topProducts,
    topCustomers,
    customersWithDebt,
    salesByPeriod,
    paymentsByPeriod,
    refresh: fetchReports,
  }
}