'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

interface SalesReport {
  totalSales: number
  totalRevenue: number
  totalDebt: number
  averageTicket: number
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

export function useReports() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)
  const [salesReport, setSalesReport] = useState<SalesReport>({
    totalSales: 0,
    totalRevenue: 0,
    totalDebt: 0,
    averageTicket: 0,
  })
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [customersWithDebt, setCustomersWithDebt] = useState<TopCustomer[]>([])
  const [salesByPeriod, setSalesByPeriod] = useState<SalesByPeriod[]>([])

  useEffect(() => {
    fetchReports()
  }, [period])

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

      // Reporte de ventas del período
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount, paid_amount, remaining_debt, sale_date')
        .gte('sale_date', startDate.toISOString())
        .lte('sale_date', endDate.toISOString())

      const totalSales = salesData?.length || 0
      const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
      const totalDebt = salesData?.reduce((sum, sale) => sum + sale.remaining_debt, 0) || 0
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

      setSalesReport({
        totalSales,
        totalRevenue,
        totalDebt,
        averageTicket,
      })

      // Top productos más vendidos
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

      // Agrupar por producto
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

      // Top clientes por compras
      const { data: customersData } = await supabase
        .from('customers')
        .select(`
          id,
          full_name,
          current_debt
        `)
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

      // Clientes con mayor deuda
      const customersWithDebtArray = customersWithSales
        .filter((c) => c.currentDebt > 0)
        .sort((a, b) => b.currentDebt - a.currentDebt)
        .slice(0, 10)

      setCustomersWithDebt(customersWithDebtArray)

      // Ventas por día (para gráficas)
      const salesByDay = new Map<string, { total: number; count: number }>()
      salesData?.forEach((sale) => {
        const date = new Date(sale.sale_date).toLocaleDateString('es-MX')
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
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

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
    loading,
    salesReport,
    topProducts,
    topCustomers,
    customersWithDebt,
    salesByPeriod,
    refresh: fetchReports,
  }
}