'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, User, Package } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function MobileBottomNav() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()
  const { itemCount } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Don't show on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16 md:hidden" />

      {/* Bottom Navigation - Mobile Only */}
      <div className={`fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-40 md:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="grid grid-cols-4 h-16">
          {/* Products */}
          <Link
            href="/products"
            className="flex flex-col items-center justify-center"
          >
            <Package className={`w-6 h-6 ${pathname === '/products' ? 'text-white' : 'text-gray-400'}`} />
            <span className={`text-xs mt-1 ${pathname === '/products' ? 'text-white' : 'text-gray-400'}`}>
              Products
            </span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="flex flex-col items-center justify-center relative"
          >
            <div className="relative">
              <ShoppingCart className={`w-6 h-6 ${pathname === '/cart' ? 'text-white' : 'text-gray-400'}`} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className={`text-xs mt-1 ${pathname === '/cart' ? 'text-white' : 'text-gray-400'}`}>
              Cart
            </span>
          </Link>

          {/* Home - Center with special styling */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center relative"
          >
            <div className="absolute -top-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Home className={`w-7 h-7 ${pathname === '/' ? 'text-black' : 'text-gray-600'}`} />
            </div>
            <span className={`text-xs mt-6 ${pathname === '/' ? 'text-white' : 'text-gray-400'}`}>
              Home
            </span>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className="flex flex-col items-center justify-center"
          >
            <User className={`w-6 h-6 ${pathname === '/profile' ? 'text-white' : 'text-gray-400'}`} />
            <span className={`text-xs mt-1 ${pathname === '/profile' ? 'text-white' : 'text-gray-400'}`}>
              Profile
            </span>
          </Link>
        </div>
      </div>
    </>
  )
}