'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, User, Menu, LogOut, Settings, Package } from 'lucide-react'
import { navigationItems } from '@/lib/constants/navigation'
import MobileMenu from './MobileMenu'
import { cn } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import InlineSearch from '@/components/search/InlineSearch'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  interface UserData {
    id: string
    full_name: string
    email: string
    phone: string
    is_admin: boolean
  }

  const [user, setUser] = useState<UserData | null>(null)
  const { itemCount } = useCart()
  const dropdownRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    checkAuth()

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const res = await fetch('http://localhost:8000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth check failed')
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsUserMenuOpen(false)
    window.location.href = '/login'
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black border-b border-gray-800">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
           {/* Logo */}
<Link href="/" className="flex items-center">
  <Image
    src="/images/logo.png"
    alt="Timora"
    width={140}
    height={50}
    className="h-10 md:h-12 w-auto"
    priority
  />
</Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex items-center gap-12">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-base font-medium text-white hover:text-gray-300 transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* Desktop Icons */}
                <div className="hidden md:flex items-center gap-5">
                    <InlineSearch />

                    {/* Replace the cart button with proper Link */}
                    <Link href="/cart" className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative">
                        <ShoppingCart className="w-5 h-5 text-white"/>
                        {itemCount > 0 && (
                            <span
                                className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-xs rounded-full flex items-center justify-center">
      {itemCount}
    </span>
                        )}
                    </Link>

                    {/* User Menu */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <User className="w-5 h-5 text-white"/>
                        </button>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                                {user ? (
                                    <>
                                        <div className="px-4 py-2 border-b">
                                            <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>

                                        <Link href="/profile"
                                              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                            <User className="w-4 h-4 mr-3"/>
                                            My Profile
                                        </Link>

                                        <Link href="/orders"
                                              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                            <Package className="w-4 h-4 mr-3"/>
                                            My Orders
                                        </Link>

                                        <Link href="/settings"
                                              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                            <Settings className="w-4 h-4 mr-3"/>
                                            Settings
                                        </Link>

                                        {user.is_admin && (
                                            <>
                                                <div className="border-t my-2"></div>
                                                <Link href="/admin/dashboard"
                                                      className="flex items-center px-4 py-2 text-yellow-600 hover:bg-yellow-50">
                                                    <Settings className="w-4 h-4 mr-3"/>
                                                    Admin Dashboard
                                                </Link>
                                            </>
                                        )}

                                        <div className="border-t my-2"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                                        >
                                            <LogOut className="w-4 h-4 mr-3"/>
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                            Login
                                        </Link>
                                        <Link href="/register"
                                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Warranty Check - Desktop */}
              <Link
                href="/warranty-check"
                className="hidden md:inline-flex items-center px-4 py-2 bg-white text-black text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                Warranty Check
              </Link>

              {/* Mobile Icons - Only Search and Menu */}
              <div className="flex md:hidden items-center gap-3">
                <InlineSearch />

                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />


    </>
  )
}