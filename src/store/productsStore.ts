import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Product, ProductWithCategory } from '@/types'

interface ProductsState {
  products: ProductWithCategory[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchProducts: () => Promise<void>
  createProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>
  updateProduct: (id: string, product: Partial<Product>) => Promise<{ error: string | null }>
  deleteProduct: (id: string) => Promise<{ error: string | null }>
  getProductById: (id: string) => ProductWithCategory | undefined
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null })
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .order('name')

      if (error) throw error

      set({ products: data as any, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createProduct: async (product) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('products')
        .insert([product])

      if (error) throw error

      // Refrescar lista
      await get().fetchProducts()
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  updateProduct: async (id, product) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)

      if (error) throw error

      // Refrescar lista
      await get().fetchProducts()
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  deleteProduct: async (id) => {
    const supabase = createClient()

    try {
      // En lugar de eliminar, desactivamos el producto
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      // Refrescar lista
      await get().fetchProducts()
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id)
  },
}))