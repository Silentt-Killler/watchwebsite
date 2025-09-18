'use client'

import { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

// Define Order interface
interface Order {
  _id?: string
  order_id: string
  user_id?: string
  user_email?: string
  items: any[]
  total_amount: number
  order_status: string
  payment_method: string
  shipping_address?: {
    full_name: string
    phone: string
    email: string
    address_line1: string
    address_line2?: string
    city: string
    district: string
    postal_code: string
  }
  created_at: string
  updated_at?: string
}

interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  pages: number
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]) // Type the state
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found')
      return
    }

    try {
      const url = filter === 'all'
        ? 'http://localhost:8000/api/admin/orders'
        : `http://localhost:8000/api/admin/orders?status=${filter}`

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data: OrdersResponse = await res.json()
        setOrders(data.orders || [])
      } else {
        console.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        fetchOrders()
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d2e] flex items-center justify-center">
        <div className="text-white text-xl">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1d2e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#2a2d47] rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">Orders Management</h1>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {['all', 'pending', 'processing', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  filter === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#1a1d2e] text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#2a2d47] rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Payment</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.order_id} className="border-b border-gray-700">
                      <td className="py-4 px-4 text-white">{order.order_id}</td>
                      <td className="py-4 px-4 text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-white">
                        {order.shipping_address?.full_name || 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-white">৳{order.total_amount}</td>
                      <td className="py-4 px-4 text-gray-400">{order.payment_method}</td>
                      <td className="py-4 px-4">
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                          className="bg-[#1a1d2e] text-white px-3 py-1 rounded border border-gray-600"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-blue-500 hover:text-blue-400">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}