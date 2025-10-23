export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: Json
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          role_id: string | null
          full_name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role_id?: string | null
          full_name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_id?: string | null
          full_name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          brand: string | null
          category_id: string | null
          price: number
          stock_quantity: number
          min_stock_alert: number
          is_active: boolean
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          category_id?: string | null
          price: number
          stock_quantity?: number
          min_stock_alert?: number
          is_active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          category_id?: string | null
          price?: number
          stock_quantity?: number
          min_stock_alert?: number
          is_active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          email: string | null
          address: string | null
          current_debt: number
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          current_debt?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          current_debt?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          customer_id: string | null
          sale_date: string
          total_amount: number
          paid_amount: number
          remaining_debt: number
          status: 'pending' | 'partial' | 'paid'
          payment_type: 'cash' | 'credit'
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          sale_date?: string
          total_amount: number
          paid_amount?: number
          status?: 'pending' | 'partial' | 'paid'
          payment_type?: 'cash' | 'credit'
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          sale_date?: string
          total_amount?: number
          paid_amount?: number
          status?: 'pending' | 'partial' | 'paid'
          payment_type?: 'cash' | 'credit'
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          customer_id: string
          sale_id: string | null
          amount: number
          payment_date: string
          payment_method: 'cash' | 'transfer'
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          sale_id?: string | null
          amount: number
          payment_date?: string
          payment_method?: 'cash' | 'transfer'
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          sale_id?: string | null
          amount?: number
          payment_date?: string
          payment_method?: 'cash' | 'transfer'
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      inventory_movements: {
        Row: {
          id: string
          product_id: string
          movement_type: 'purchase' | 'sale' | 'adjustment'
          quantity: number
          previous_stock: number
          new_stock: number
          reason: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          movement_type: 'purchase' | 'sale' | 'adjustment'
          quantity: number
          previous_stock: number
          new_stock: number
          reason?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          movement_type?: 'purchase' | 'sale' | 'adjustment'
          quantity?: number
          previous_stock?: number
          new_stock?: number
          reason?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
    }
  }
}