'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Archive,
  BarChart3,
  Settings,
  Store,
} from 'lucide-react'
import { ROUTES, APP_NAME } from '@/lib/constants'

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Productos', href: ROUTES.PRODUCTS, icon: Package },
  { name: 'Clientes', href: ROUTES.CUSTOMERS, icon: Users },
  { name: 'Ventas', href: ROUTES.SALES, icon: ShoppingCart },
  { name: 'Inventario', href: ROUTES.INVENTORY, icon: Archive },
  { name: 'Reportes', href: ROUTES.REPORTS, icon: BarChart3 },
  { name: 'Configuración', href: ROUTES.SETTINGS, icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-slate-200 pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <div className="bg-primary-600 p-2 rounded-lg">
            <Store className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-slate-900">SVO</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <Icon
                  className={`
                    mr-3 flex-shrink-0 h-5 w-5
                    ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}
                  `}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            {APP_NAME} © 2025
          </p>
        </div>
      </div>
    </div>
  )
}