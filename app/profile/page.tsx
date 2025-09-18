'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Package, LogOut, Settings, ShoppingBag, ChevronRight } from 'lucide-react'

interface UserData {
  id: string
  full_name: string
  email: string
  phone: string
  is_admin: boolean
  created_at: string
}

interface Order {
  order_id: string
  total_amount: number
  order_status: string
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchUserOrders()
  }, [])

  const fetchUserData = async () => {
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
        const data = await res.json()
        setUser(data)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserOrders = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('http://localhost:8000/api/user/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'confirmed': 'text-blue-600 bg-blue-100',
      'processing': 'text-purple-600 bg-purple-100',
      'shipped': 'text-indigo-600 bg-indigo-100',
      'delivered': 'text-green-600 bg-green-100',
      'cancelled': 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6">
              {/* User Info */}
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">{user?.full_name}</h2>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
              </div>

              {/* Menu */}
              <nav className="space-y-2">
                <Link href="/profile" className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-3" />
                    <span>Profile Info</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link href="/orders" className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 mr-3" />
                    <span>My Orders</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link href="/cart" className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-3" />
                    <span>My Cart</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link href="/settings" className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-3" />
                    <span>Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                {user?.is_admin && (
                  <Link href="/admin/dashboard" className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg border border-yellow-600">
                    <div className="flex items-center text-yellow-500">
                      <Settings className="w-5 h-5 mr-3" />
                      <span>Admin Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-yellow-500" />
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-between p-3 hover:bg-red-900/20 rounded-lg w-full text-red-500"
                >
                  <div className="flex items-center">
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Profile Information */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Profile Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Full Name</label>
                  <p className="text-lg">{user?.full_name}</p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-lg">{user?.email}</p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <p className="text-lg">{user?.phone}</p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Member Since</label>
                  <p className="text-lg">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <button className="mt-6 px-6 py-2 bg-white text-black rounded hover:bg-gray-200">
                Edit Profile
              </button>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recent Orders</h3>
                <Link href="/orders" className="text-blue-500 hover:underline">
                  View All
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.order_id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{order.order_id}</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span>৳{order.total_amount}</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}