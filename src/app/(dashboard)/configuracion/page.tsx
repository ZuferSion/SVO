'use client'

import { useState } from 'react'
import { User, Shield, Bell, Database } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ProfileForm {
  full_name: string
  email: string
}

export default function ConfigurationPage() {
  const { profile, user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      full_name: profile?.full_name || '',
      email: profile?.email || '',
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          email: data.email,
        })
        .eq('id', user?.id)

      if (error) throw error

      toast.success('Perfil actualizado correctamente')
    } catch (error: any) {
      toast.error('Error al actualizar perfil', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Configuración
        </h1>
        <p className="text-slate-600 mt-1">
          Gestiona las preferencias del sistema
        </p>
      </div>

      {/* Perfil de Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Información del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nombre Completo"
              placeholder="Tu nombre"
              error={errors.full_name?.message}
              {...register('full_name', {
                required: 'El nombre es requerido',
              })}
            />

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'El correo es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Correo inválido',
                },
              })}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" loading={loading} disabled={loading}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Rol y Permisos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Rol y Permisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">Rol Actual</p>
              <div className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg">
                <Shield className="h-5 w-5 text-primary-600 mr-2" />
                <span className="font-medium text-primary-900">Administrador</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Permisos</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-slate-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Acceso completo al sistema
                </li>
                <li className="flex items-center text-sm text-slate-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Gestión de productos e inventario
                </li>
                <li className="flex items-center text-sm text-slate-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Gestión de clientes y ventas
                </li>
                <li className="flex items-center text-sm text-slate-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Visualización de reportes
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Versión</p>
              <p className="font-medium text-slate-900">SVO v1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Base de Datos</p>
              <p className="font-medium text-slate-900">Supabase PostgreSQL</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Framework</p>
              <p className="font-medium text-slate-900">Next.js 15</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Última Actualización</p>
              <p className="font-medium text-slate-900">Octubre 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acerca de */}
      <Card>
        <CardHeader>
          <CardTitle>Acerca de SVO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-700">
              <strong>Sistema de Ventas Oscarín (SVO)</strong> es una plataforma
              completa para la gestión de ventas de productos snacks, diseñada
              para facilitar el control de inventario, clientes y finanzas.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">📦</div>
                <p className="text-sm text-slate-600 mt-2">Productos</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">👥</div>
                <p className="text-sm text-slate-600 mt-2">Clientes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">🛒</div>
                <p className="text-sm text-slate-600 mt-2">Ventas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">📊</div>
                <p className="text-sm text-slate-600 mt-2">Reportes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}