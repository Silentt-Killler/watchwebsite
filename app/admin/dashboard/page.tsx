'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Eye
} from 'lucide-react'

interface DashboardStats {
  total_users: number
  total_products: number
  total_orders: number
  total_revenue: number
}

interface RecentOrder {
  _id?: string
  order_id: string
  user_email?: string
  customer_name?: string
  total_amount: number
  order_status: string
  created_at: string
  shipping_address?: any
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_products: 0,
    total_orders: 0,
    total_revenue: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAndFetchData()
  }, [])

  const checkAdminAndFetchData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('http://localhost:8000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.status === 403) {
        alert('Admin access required')
        router.push('/')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || {
          total_users: 0,
          total_products: 0,
          total_orders: 0,
          total_revenue: 0
        })
        setRecentOrders(data.recent_orders || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1d2e', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'white' }}>
          Admin Dashboard
        </h1>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Total Users */}
          <div style={{ backgroundColor: '#2a2d47', padding: '1.5rem', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Total Users</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.total_users}</p>
              </div>
              <Users style={{ width: '2.5rem', height: '2.5rem', color: '#3B82F6' }} />
            </div>
          </div>

          {/* Total Products */}
          <div style={{ backgroundColor: '#2a2d47', padding: '1.5rem', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Total Products</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.total_products}</p>
              </div>
              <Package style={{ width: '2.5rem', height: '2.5rem', color: '#10B981' }} />
            </div>
          </div>

          {/* Total Orders */}
          <div style={{ backgroundColor: '#2a2d47', padding: '1.5rem', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Total Orders</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stats.total_orders}</p>
              </div>
              <ShoppingBag style={{ width: '2.5rem', height: '2.5rem', color: '#8B5CF6' }} />
            </div>
          </div>

          {/* Total Revenue */}
          <div style={{ backgroundColor: '#2a2d47', padding: '1.5rem', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Total Revenue</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                  ৳{stats.total_revenue.toLocaleString()}
                </p>
              </div>
              <DollarSign style={{ width: '2.5rem', height: '2.5rem', color: '#F59E0B' }} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/admin/products" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#2a2d47',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3B82F6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent'
            }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>Manage Products</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Add, edit, or remove products</p>
            </div>
          </Link>

          <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#2a2d47',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3B82F6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent'
            }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>View Orders</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Track and manage customer orders</p>
            </div>
          </Link>

          <Link href="/admin/inventory" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#2a2d47',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3B82F6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent'
            }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>Inventory</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Check stock levels</p>
            </div>
          </Link>
        </div>

        {/* Revenue Chart Placeholder */}
        <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Revenue Overview</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981' }}>
              <TrendingUp style={{ width: '1rem', height: '1rem' }} />
              <span style={{ fontSize: '0.875rem' }}>+15% from last month</span>
            </div>
          </div>

          {/* Simple Chart Bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', gap: '1rem' }}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
              const heights = [60, 80, 70, 90, 75, 85]
              return (
                <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '100%',
                    backgroundColor: '#3B82F6',
                    borderRadius: '0.25rem',
                    height: `${heights[index]}%`,
                    minHeight: '20px'
                  }}></div>
                  <span style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '0.5rem' }}>{month}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
            Recent Orders
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>Order ID</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.slice(0, 5).map((order) => (
                    <tr key={order.order_id} style={{ borderBottom: '1px solid #374151' }}>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'white' }}>{order.order_id}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'white' }}>
                        {order.shipping_address?.full_name || order.user_email || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'white' }}>৳{order.total_amount}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          backgroundColor: order.order_status === 'delivered' ? '#10B98133' :
                                         order.order_status === 'pending' ? '#F59E0B33' : '#EF444433',
                          color: order.order_status === 'delivered' ? '#10B981' :
                                order.order_status === 'pending' ? '#F59E0B' : '#EF4444'
                        }}>
                          {order.order_status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#9CA3AF' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <Link href={`/admin/orders/${order.order_id}`}>
                          <Eye style={{ width: '1.25rem', height: '1.25rem', color: '#3B82F6', cursor: 'pointer' }} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
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