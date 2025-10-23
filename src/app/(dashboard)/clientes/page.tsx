'use client'

import { useState } from 'react'
import { Plus, Search, Users as UsersIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CustomerList } from '@/components/customers/CustomerList'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useCustomers } from '@/hooks/useCustomers'
import { formatCurrency } from '@/lib/utils/formatters'
import type { Customer } from '@/types'

export default function CustomersPage() {
  const {
    customers,
    loading,
    searchTerm,
    setSearchTerm,
    debtFilter,
    setDebtFilter,
  } = useCustomers()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedCustomer(null)
  }

  const debtOptions = [
    { value: 'all', label: 'Todos los clientes' },
    { value: 'with_debt', label: 'Con deuda' },
    { value: 'no_debt', label: 'Sin deuda' },
  ]

  // Calcular estadísticas
  const totalDebt = customers.reduce((sum, c) => sum + c.current_debt, 0)
  const customersWithDebt = customers.filter(c => c.current_debt > 0).length

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Clientes
          </h1>
          <p className="text-slate-600 mt-1">
            Gestiona tu cartera de clientes
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-5 w-5" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-5 w-5" />}
        />
        <Select
          value={debtFilter}
          onChange={(e) => setDebtFilter(e.target.value)}
          options={debtOptions}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Clientes</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {customers.length}
              </p>
            </div>
            <div className="bg-primary-50 p-3 rounded-full">
              <UsersIcon className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Deuda Total</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {formatCurrency(totalDebt)}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Con Deuda</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">
                {customersWithDebt}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {customers.length > 0 
                  ? `${((customersWithDebt / customers.length) * 100).toFixed(0)}% del total`
                  : '0% del total'
                }
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-full">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <CustomerList customers={customers} onEdit={handleEdit} />

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        customer={selectedCustomer}
      />
    </div>
  )
}