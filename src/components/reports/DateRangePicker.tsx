'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface DateRangePickerProps {
  startDate: Date
  endDate: Date
  onStartDateChange: (date: Date) => void
  onEndDateChange: (date: Date) => void
  onApply: () => void
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: DateRangePickerProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Rango:</span>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={format(startDate, 'yyyy-MM-dd')}
            onChange={(e) => onStartDateChange(new Date(e.target.value))}
            className="w-40"
          />
          <span className="text-slate-500">-</span>
          <Input
            type="date"
            value={format(endDate, 'yyyy-MM-dd')}
            onChange={(e) => onEndDateChange(new Date(e.target.value))}
            className="w-40"
          />
        </div>

        <Button onClick={onApply} size="sm">
          Aplicar
        </Button>
      </div>
    </Card>
  )
}