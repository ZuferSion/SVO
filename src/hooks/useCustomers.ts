'use client'

import { useEffect, useState } from 'react'
import { useCustomersStore } from '@/store/customersStore'
import type { Customer } from '@/types'

export function useCustomers() {
  const { customers, loading, error, fetchCustomers } = useCustomersStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [debtFilter, setDebtFilter] = useState<string>('all')

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const filteredCustomers = customers.filter((customer) => {
    // Filtro de búsqueda
    const matchesSearch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de deuda
    let matchesDebt = true
    if (debtFilter === 'with_debt') {
      matchesDebt = customer.current_debt > 0
    } else if (debtFilter === 'no_debt') {
      matchesDebt = customer.current_debt === 0
    }

    return matchesSearch && matchesDebt
  })

  // Ordenar por deuda (mayor a menor) y luego por nombre
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (a.current_debt !== b.current_debt) {
      return b.current_debt - a.current_debt
    }
    return a.full_name.localeCompare(b.full_name)
  })

  return {
    customers: sortedCustomers,
    allCustomers: customers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    debtFilter,
    setDebtFilter,
    refresh: fetchCustomers,
  }
}