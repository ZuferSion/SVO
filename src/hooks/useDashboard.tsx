'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product, SaleWithDetails } from '@/types'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface DashboardStats {
  todaySales: number
  totalDebt: number
  lowStockCount: number
  totalCustomers: number
}

interface SalesChartData {
  date: string
  total: number
  paid: number
  pending: number
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalDebt: 0,
    lowStockCount: 0,
    totalCustomers: 0,
  })
  const [recentSales, setRecentSales] = useState<SaleWithDetails[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [chartData, setChartData] = useState<SalesChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const today = new Date()
      const startToday = startOfDay(today)
      const endToday = endOfDay(today)

      // Ventas de hoy
      const { data: todaySalesData } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('sale_date', startToday.toISOString())
        .lte('sale_date', endToday.toISOString())

      const todaySales = todaySalesData?.reduce(
        (sum, sale) => sum + sale.total_amount,
        0
      ) || 0

      // Total de deuda
      const { data: customersData } = await supabase
        .from('customers')
        .select('current_debt')
        .eq('is_active', true)

      const totalDebt = customersData?.reduce(
        (sum, customer) => sum + customer.current_debt,
        0
      ) || 0

      // Productos con stock bajo - comparar con min_stock_alert
      const { data: allProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)

      const lowStockData = allProducts?.filter(
        (p) => p.stock_quantity <= p.min_stock_alert
      ) || []

      setLowStockProducts(lowStockData)

      // Total de clientes activos
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Ventas recientes
      const { data: salesData } = await supabase
        .from('sales')
        .select(`
          *,
          customers (
            id,
            full_name
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
        .order('sale_date', { ascending: false })
        .limit(5)

      setRecentSales(salesData as any || [])

      // Datos para gráfica (últimos 7 días)
      const chartDataPromises = Array.from({ length: 7 }, async (_, i) => {
        const date = subDays(today, 6 - i)
        const startDate = startOfDay(date)
        const endDate = endOfDay(date)

        const { data: daySales } = await supabase
          .from('sales')
          .select('total_amount, paid_amount')
          .gte('sale_date', startDate.toISOString())
          .lte('sale_date', endDate.toISOString())

        const total = daySales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
        const paid = daySales?.reduce((sum, sale) => sum + sale.paid_amount, 0) || 0
        const pending = total - paid

        return {
          date: format(date, 'EEE dd', { locale: es }),
          total,
          paid,
          pending,
        }
      })

      const chartDataResult = await Promise.all(chartDataPromises)
      setChartData(chartDataResult)

      setStats({
        todaySales,
        totalDebt,
        lowStockCount: lowStockData.length,
        totalCustomers: customersCount || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    recentSales,
    lowStockProducts,
    chartData,
    loading,
    refresh: fetchDashboardData,
  }
}