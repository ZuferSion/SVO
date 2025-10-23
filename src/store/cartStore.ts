import { create } from 'zustand'
import type { Product } from '@/types'

interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

interface CartState {
  items: CartItem[]
  customerId: string | null
  paymentType: 'cash' | 'credit'
  
  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setCustomer: (customerId: string | null) => void
  setPaymentType: (type: 'cash' | 'credit') => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  paymentType: 'credit',

  addItem: (product, quantity = 1) => {
    const items = get().items
    const existingItem = items.find((item) => item.product.id === product.id)

    if (existingItem) {
      // Si ya existe, aumentar cantidad
      set({
        items: items.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.product.price,
              }
            : item
        ),
      })
    } else {
      // Si no existe, agregar nuevo
      set({
        items: [
          ...items,
          {
            product,
            quantity,
            subtotal: quantity * product.price,
          },
        ],
      })
    }
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter((item) => item.product.id !== productId),
    })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }

    set({
      items: get().items.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.product.price,
            }
          : item
      ),
    })
  },

  setCustomer: (customerId) => {
    set({ customerId })
  },

  setPaymentType: (type) => {
    set({ paymentType: type })
  },

  clearCart: () => {
    set({
      items: [],
      customerId: null,
      paymentType: 'credit',
    })
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0)
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))