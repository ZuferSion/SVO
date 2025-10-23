'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { ROUTES, APP_NAME } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuthStore()
  const { loading: authLoading } = useAuth(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = 'El correo es requerido'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo inválido'
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        toast.error('Error al iniciar sesión', {
          description: error,
        })
      } else {
        toast.success('¡Bienvenido!', {
          description: 'Inicio de sesión exitoso',
        })
        router.push(ROUTES.DASHBOARD)
      }
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Por favor intenta de nuevo',
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-600 p-4 rounded-full">
              <Store className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{APP_NAME}</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Correo Electrónico"
              placeholder="admin@svo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="h-5 w-5" />}
              disabled={loading}
              autoComplete="email"
            />

            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="h-5 w-5" />}
              disabled={loading}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>👋 Usuario de prueba:</p>
            <p className="font-mono text-xs mt-1">
              Crea tu usuario en Supabase Authentication
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}