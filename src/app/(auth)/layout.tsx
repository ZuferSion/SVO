import { Inter } from 'next/font/google'
import '@/app/globals.css'
import type { Metadata } from 'next'
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `Login - ${APP_NAME}`,
  description: APP_DESCRIPTION,
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
          {children}
        </div>
      </body>
    </html>
  )
}