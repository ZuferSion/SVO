'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Archive,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'

const mobileNavigation = [
  { name: 'Inicio', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Productos', href: ROUTES.PRODUCTS, icon: Package },
  { name: 'Ventas', href: ROUTES.SALES, icon: ShoppingCart },
  { name: 'Clientes', href: ROUTES.CUSTOMERS, icon: Users },
  { name: 'Inventario', href: ROUTES.INVENTORY, icon: Archive },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="grid grid-cols-5 h-16">
        {mobileNavigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center space-y-1 transition-colors
                ${isActive ? 'text-primary-600' : 'text-slate-500'}
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}