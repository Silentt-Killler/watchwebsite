'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { navigationItems } from '@/lib/constants/navigation'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed right-0 top-0 h-full w-[80%] max-w-sm bg-white z-50 shadow-2xl md:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-medium">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-6">
          <ul className="space-y-6">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="text-lg font-medium text-black hover:text-gray-600 transition-colors block"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Warranty Check */}
          <div className="mt-8 pt-8 border-t">
            <Link
              href="/warranty-check"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Warranty Check
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}