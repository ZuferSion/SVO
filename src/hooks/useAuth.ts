'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/lib/constants'

export function useAuth(requireAuth = true) {
  const router = useRouter()
  const { user, profile, loading, isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.push(ROUTES.LOGIN)
      } else if (!requireAuth && isAuthenticated) {
        router.push(ROUTES.DASHBOARD)
      }
    }
  }, [loading, isAuthenticated, requireAuth, router])

  return {
    user,
    profile,
    loading,
    isAuthenticated,
  }
}