'use client'


import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Package, ShoppingBag, Users, Tag, LogOut, Image, Shield } from 'lucide-react'


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const res = await fetch('http://localhost:8000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (res.ok) {
          const user = await res.json()
          if (!user.is_admin) {
            alert('Admin access required')
            router.push('/')
          }
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      }
    }

    checkAdmin()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/admin//login')
  }

  return (
    <div className="flex h-screen bg-[#1a1d2e]">
      {/* Sidebar */}
      <div className="w-64 bg-[#2a2d47] flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-white text-xl font-bold">TIMORA ADMIN</h2>
        </div>

        <nav className="flex-1 p-4">
          <Link href="/admin/dashboard">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white mb-2">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </div>
          </Link>

           <Link href="/admin/sliders">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white mb-2">
                <Image className="w-5 h-5" />
                <span>Home Sliders</span>
              </div>
          </Link>

          <Link href="/admin/products">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white mb-2">
              <Package className="w-5 h-5" />
              <span>Products</span>
            </div>
          </Link>

          <Link href="/admin/orders">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white mb-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Orders</span>
            </div>
          </Link>

          <Link href="/admin/customers">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white mb-2">
              <Users className="w-5 h-5" />
              <span>Customers</span>
            </div>
          </Link>

          {/* BRAND LINK - NEW */}
          <Link href="/admin/brands">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white mb-2">
              <Tag className="w-5 h-5" />
              <span>Brands</span>
            </div>
          </Link>

          <Link href="/admin/coupons">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white mb-2">
              <Tag className="w-5 h-5" />
              <span>Coupons</span>
            </div>
          </Link>


          <Link href="/admin/roles">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white mb-2">
              <Shield className="w-5 h-5" />
              <span>Admin Roles</span>
            </div>
          </Link>


        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}