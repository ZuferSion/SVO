import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Customer, CustomerWithStats } from '@/types'

interface CustomersState {
  customers: Customer[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchCustomers: () => Promise<void>
  createCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'current_debt'>) => Promise<{ error: string | null }>
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<{ error: string | null }>
  deleteCustomer: (id: string) => Promise<{ error: string | null }>
  getCustomerById: (id: string) => Customer | undefined
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  customers: [],
  loading: false,
  error: null,

  fetchCustomers: async () => {
    set({ loading: true, error: null })
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error

      set({ customers: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createCustomer: async (customer) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('customers')
        .insert([customer])

      if (error) throw error

      // Refrescar lista
      await get().fetchCustomers()
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  updateCustomer: async (id, customer) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id)

      if (error) throw error

      // Refrescar lista
      await get().fetchCustomers()
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  deleteCustomer: async (id) => {
    const supabase = createClient()

    try {
      // Soft delete
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      // Refrescar lista
      await get().fetchCustomers()
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  getCustomerById: (id) => {
    return get().customers.find((c) => c.id === id)
  },
}))