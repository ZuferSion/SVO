import React from 'react'

interface TableProps {
  children: React.ReactNode
  className?: string
  onClick?: React.MouseEventHandler<HTMLTableRowElement>

}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>{children}</table>
    </div>
  )
}

export function TableHeader({ children, className = '' }: TableProps) {
  return (
    <thead className={`bg-slate-50 ${className}`}>{children}</thead>
  )
}

export function TableBody({ children, className = '' }: TableProps) {
  return <tbody className={`divide-y divide-slate-200 ${className}`}>{children}</tbody>
}

export function TableRow({ children, className = '', onClick }: TableProps) {
  return <tr onClick={onClick} className={className}>{children}</tr>
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function TableHead({ children, className = '', align = 'left' }: TableCellProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <th
      className={`px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider ${alignClasses[align]} ${className}`}
    >
      {children}
    </th>
  )
}

export function TableCell({ children, className = '', align = 'left' }: TableCellProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <td className={`px-4 py-4 text-sm text-slate-900 ${alignClasses[align]} ${className}`}>
      {children}
    </td>
  )
}