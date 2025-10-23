import { Database } from './database.types'

// Tipos convenientes
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Tipos específicos
export type Role = Tables<'roles'>
export type Profile = Tables<'profiles'>
export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type Customer = Tables<'customers'>
export type Sale = Tables<'sales'>
export type SaleItem = Tables<'sale_items'>
export type Payment = Tables<'payments'>
export type InventoryMovement = Tables<'inventory_movements'>

// Tipos extendidos para el frontend
export type ProductWithCategory = Product & {
  categories: Category | null
}

export type SaleWithDetails = Sale & {
  customers: Customer | null
  sale_items: (SaleItem & {
    products: Product
  })[]
}

export type CustomerWithStats = Customer & {
  total_sales: number
  total_purchases: number
}

// Tipos extendidos adicionales
export type SaleWithItems = Sale & {
  sale_items: (SaleItem & {
    products: Product
  })[]
}