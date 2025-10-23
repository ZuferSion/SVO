'use client'

import { useState } from 'react'
import { Edit, Trash2, Users, Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useCustomersStore } from '@/store/customersStore'
import type { Customer } from '@/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CustomerListProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
}

export function CustomerList({ customers, onEdit }: CustomerListProps) {
  const router = useRouter()
  const { deleteCustomer } = useCustomersStore()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    const { error } = await deleteCustomer(deleteId)

    if (error) {
      toast.error('Error al eliminar', {
        description: error,
      })
    } else {
      toast.success('Cliente eliminado correctamente')
    }

    setDeleting(false)
    setDeleteId(null)
  }

  const getDebtBadge = (debt: number) => {
    if (debt === 0) {
      return <Badge variant="success">Sin deuda</Badge>
    }
    if (debt < 100) {
      return <Badge variant="warning">Deuda baja</Badge>
    }
    return <Badge variant="danger">Con deuda</Badge>
  }

  if (customers.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="No hay clientes"
          description="No se encontraron clientes con los filtros aplicados."
        />
      </Card>
    )
  }

  return (
    <>
      <Card padding={false}>
        {/* Vista Desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead align="right">Deuda Actual</TableHead>
                <TableHead align="center">Estado</TableHead>
                <TableHead align="right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">
                        {customer.full_name}
                      </p>
                      {customer.address && (
                        <p className="text-sm text-slate-500">
                          {customer.address}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {customer.phone && (
                        <p className="text-slate-900">{customer.phone}</p>
                      )}
                      {customer.email && (
                        <p className="text-slate-500">{customer.email}</p>
                      )}
                      {!customer.phone && !customer.email && (
                        <p className="text-slate-400">Sin contacto</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <span className={`font-bold ${customer.current_debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(customer.current_debt)}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    {getDebtBadge(customer.current_debt)}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/clientes/${customer.id}`)}
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(customer)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(customer.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Vista Mobile */}
        <div className="md:hidden divide-y divide-slate-200">
          {customers.map((customer) => (
            <div key={customer.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {customer.full_name}
                  </p>
                  {customer.phone && (
                    <p className="text-sm text-slate-600">{customer.phone}</p>
                  )}
                  {customer.email && (
                    <p className="text-xs text-slate-500">{customer.email}</p>
                  )}
                </div>
                {getDebtBadge(customer.current_debt)}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Deuda Actual</p>
                  <p className={`text-lg font-bold ${customer.current_debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(customer.current_debt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/clientes/${customer.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(customer.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        description="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
        loading={deleting}
      />
    </>
  )
}