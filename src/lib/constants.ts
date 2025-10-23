export const APP_NAME = 'SVO - Sistema de Ventas Oscarín'
export const APP_DESCRIPTION = 'Sistema de gestión de ventas de snacks'
export const APP_VERSION = '1.0.0'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/',
  PRODUCTS: '/productos',
  CUSTOMERS: '/clientes',
  SALES: '/ventas',
  NEW_SALE: '/ventas/nueva',
  INVENTORY: '/inventario',
  RESTOCK: '/inventario/reabastecer',
  REPORTS: '/reportes',
  SETTINGS: '/configuracion',
} as const

export const PAYMENT_METHODS = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
} as const

export const SALE_STATUS = {
  PENDING: 'Pendiente',
  PARTIAL: 'Parcial',
  PAID: 'Pagado',
} as const

export const PAYMENT_TYPES = {
  CASH: 'Contado',
  CREDIT: 'Crédito',
} as const

export const STOCK_LEVELS = {
  HIGH: 20,
  MEDIUM: 10,
  LOW: 5,
  CRITICAL: 2,
} as const

export const MOVEMENT_TYPES = {
  PURCHASE: 'Compra',
  SALE: 'Venta',
  ADJUSTMENT: 'Ajuste',
} as const

// Colores para gráficas
export const CHART_COLORS = {
  PRIMARY: '#6366f1',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
} as const