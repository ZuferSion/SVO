'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function Header() {
  const router = useRouter()
  const { profile, signOut } = useAuthStore()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
          <Menu className="h-6 w-6" />
        </button>

        {/* Title - Hidden on mobile */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-slate-900">
            Bienvenido, {profile?.full_name || 'Usuario'}
          </h1>
        </div>

        {/* User Menu */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">
                {profile?.full_name}
              </p>
              <p className="text-xs text-slate-500">{profile?.email}</p>
            </div>
            <div className="bg-primary-100 p-2 rounded-full">
              <User className="h-5 w-5 text-primary-700" />
            </div>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}