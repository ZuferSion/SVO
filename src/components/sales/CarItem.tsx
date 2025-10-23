'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/formatters'
import { useCartStore } from '@/store/cartStore'

interface CartItemProps {
  item: {
    product: any
    quantity: number
    subtotal: number
  }
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1)
    } else {
      removeItem(item.product.id)
    }
  }

  const handleIncrease = () => {
    if (item.quantity < item.product.stock_quantity) {
      updateQuantity(item.product.id, item.quantity + 1)
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">
          {item.product.name}
        </p>
        {item.product.brand && (
          <p className="text-sm text-slate-500">{item.product.brand}</p>
        )}
        <p className="text-sm text-slate-600 mt-1">
          {formatCurrency(item.product.price)} c/u
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDecrease}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="font-bold text-slate-900 w-8 text-center">
          {item.quantity}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleIncrease}
          className="h-8 w-8 p-0"
          disabled={item.quantity >= item.product.stock_quantity}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-right min-w-[80px]">
        <p className="font-bold text-slate-900">
          {formatCurrency(item.subtotal)}
        </p>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => removeItem(item.product.id)}
        className="h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  )
}