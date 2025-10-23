'use client'

import { useState, useEffect } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/formatters'
import type { Customer } from '@/types'

interface CustomerSelectorProps {
  onCreateNew: () => void
}

export function CustomerSelector({ onCreateNew }: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const { customerId, setCustomer } = useCartStore()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('full_name')

    setCustomers(data || [])
    setLoading(false)
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCustomer = customers.find((c) => c.id === customerId)

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-5 w-5" />}
        />
        <Button variant="outline" onClick={onCreateNew}>
          <UserPlus className="h-5 w-5" />
        </Button>
      </div>

      {selectedCustomer ? (
        <Card className="p-4 bg-primary-50 border-primary-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-slate-900">
                {selectedCustomer.full_name}
              </p>
              {selectedCustomer.phone && (
                <p className="text-sm text-slate-600">{selectedCustomer.phone}</p>
              )}
              {selectedCustomer.current_debt > 0 && (
                <div className="mt-2">
                  <Badge variant="warning">
                    Deuda: {formatCurrency(selectedCustomer.current_debt)}
                  </Badge>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCustomer(null)}
            >
              Cambiar
            </Button>
          </div>
        </Card>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-3">No hay clientes</p>
              <Button size="sm" onClick={onCreateNew}>
                Crear Cliente
              </Button>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <Card
                key={customer.id}
                className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setCustomer(customer.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {customer.full_name}
                    </p>
                    {customer.phone && (
                      <p className="text-sm text-slate-500">{customer.phone}</p>
                    )}
                  </div>
                  {customer.current_debt > 0 && (
                    <Badge variant="warning" className="text-xs">
                      {formatCurrency(customer.current_debt)}
                    </Badge>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}