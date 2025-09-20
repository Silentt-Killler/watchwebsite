import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import TopBar from '@/components/layout/TopBar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Timora - Premium Watch Collection',
  description: 'Discover our exclusive collection of premium watches with COD available, free shipping, and 2 years warranty.',
  keywords: 'watches, premium watches, luxury watches, men watches, women watches, couple watches',
  authors: [{ name: 'Timora' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
return (
  <html lang="en" className={inter.className} suppressHydrationWarning>
    <body className="min-h-screen bg-white" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <TopBar />
            <Navbar />
            <main>{children}</main>
            <Footer />
             <MobileBottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}