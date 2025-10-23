import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setProfile: (profile) => set({ profile }),
  
  setLoading: (loading) => set({ loading }),

  signIn: async (email: string, password: string) => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        // Obtener perfil del usuario
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, roles(*)')
          .eq('id', data.user.id)
          .single()

        set({ 
          user: data.user, 
          profile,
          isAuthenticated: true 
        })
      }

      return { error: null }
    } catch (error) {
      return { error: 'Error al iniciar sesión' }
    }
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ 
      user: null, 
      profile: null, 
      isAuthenticated: false 
    })
  },

  checkAuth: async () => {
    const supabase = createClient()
    set({ loading: true })

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Obtener perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, roles(*)')
          .eq('id', user.id)
          .single()

        set({ 
          user, 
          profile,
          isAuthenticated: true,
          loading: false 
        })
      } else {
        set({ 
          user: null, 
          profile: null,
          isAuthenticated: false,
          loading: false 
        })
      }
    } catch (error) {
      set({ 
        user: null, 
        profile: null,
        isAuthenticated: false,
        loading: false 
      })
    }
  },
}))