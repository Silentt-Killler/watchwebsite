// app/admin/customers/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  Eye,
  Download,
  Filter,
  ChevronDown
} from 'lucide-react'

interface Customer {
  _id: string
  id: string
  full_name: string
  email: string
  phone: string
  address?: {
    address_line1?: string
    address_line2?: string
    city?: string
    district?: string
    postal_code?: string
  }
  total_orders: number
  total_spent: number
  last_order_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CustomerDetails {
  customer: Customer
  orders: Order[]
  addresses: Address[]
}

interface Order {
  order_id: string
  total_amount: number
  order_status: string
  created_at: string
  items: any[]
}

interface Address {
  address_line1: string
  address_line2?: string
  city: string
  district: string
  postal_code: string
  is_default?: boolean
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterBy, setFilterBy] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [stats, setStats] = useState({
    total_customers: 0,
    active_customers: 0,
    total_revenue: 0,
    avg_order_value: 0
  })

  useEffect(() => {
    fetchCustomers()
    fetchStats()
  }, [])

  const fetchCustomers = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      // Fetch all users
      const usersRes = await fetch('http://localhost:8000/api/admin/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (usersRes.ok) {
        const data = await usersRes.json()
        setCustomers(data.customers || data) // Handle different response formats
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('http://localhost:8000/api/admin/customers/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchCustomerDetails = async (customerId: string) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:8000/api/admin/customers/${customerId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setSelectedCustomer(data)
        setShowDetailsModal(true)
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Joined Date'].join(','),
      ...customers.map(c => [
        c.full_name,
        c.email,
        c.phone,
        c.total_orders,
        c.total_spent,
        new Date(c.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Filter and sort customers
  const processedCustomers = customers
    .filter(customer => {
      const matchesSearch =
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)

      const matchesFilter =
        filterBy === 'all' ||
        (filterBy === 'active' && customer.is_active) ||
        (filterBy === 'inactive' && !customer.is_active) ||
        (filterBy === 'with_orders' && customer.total_orders > 0) ||
        (filterBy === 'no_orders' && customer.total_orders === 0)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'orders':
          return b.total_orders - a.total_orders
        case 'spent':
          return b.total_spent - a.total_spent
        case 'name':
          return a.full_name.localeCompare(b.full_name)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d2e] flex items-center justify-center">
        <div className="text-white text-xl">Loading customers...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1d2e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#2a2d47] rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Customers Management</h1>
            <button
              onClick={exportToCSV}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1a1d2e] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total Customers</p>
                  <p className="text-white text-xl font-bold">{stats.total_customers}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1d2e] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Active Customers</p>
                  <p className="text-white text-xl font-bold">{stats.active_customers}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1d2e] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total Revenue</p>
                  <p className="text-white text-xl font-bold">৳{(stats.total_revenue/1000).toFixed(1)}K</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1d2e] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Avg Order Value</p>
                  <p className="text-white text-xl font-bold">৳{stats.avg_order_value.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1d2e] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="bg-[#1a1d2e] text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Customers</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
              <option value="with_orders">With Orders</option>
              <option value="no_orders">No Orders</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1a1d2e] text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recently Joined</option>
              <option value="orders">Most Orders</option>
              <option value="spent">Highest Spent</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-[#2a2d47] rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-700">
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Address</th>
                  <th className="text-center py-3 px-4">Orders</th>
                  <th className="text-center py-3 px-4">Total Spent</th>
                  <th className="text-center py-3 px-4">Joined</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {processedCustomers.length > 0 ? (
                  processedCustomers.map((customer) => (
                    <tr key={customer.id || customer._id} className="border-b border-gray-700 hover:bg-[#1a1d2e]/50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{customer.full_name}</p>
                          <p className="text-gray-400 text-sm">ID: {customer.id || customer._id}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{customer.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-300 text-sm">
                          {customer.address ? (
                            <>
                              <p>{customer.address.address_line1}</p>
                              {customer.address.address_line2 && <p>{customer.address.address_line2}</p>}
                              <p>{customer.address.city}, {customer.address.district}</p>
                              {customer.address.postal_code && <p>ZIP: {customer.address.postal_code}</p>}
                            </>
                          ) : (
                            <span className="text-gray-500">No address</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <ShoppingBag className="w-4 h-4 text-blue-500" />
                          <span className="text-white font-medium">{customer.total_orders || 0}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-white font-medium">৳{(customer.total_spent || 0).toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="text-gray-300 text-sm">
                          <p>{new Date(customer.created_at).toLocaleDateString()}</p>
                          <p className="text-gray-500 text-xs">
                            {Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          customer.is_active 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            customer.is_active ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => fetchCustomerDetails(customer.id || customer._id)}
                          className="text-blue-500 hover:text-blue-400"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="mt-4 flex justify-between items-center text-sm">
            <p className="text-gray-400">
              Showing {processedCustomers.length} of {customers.length} customers
            </p>
            {/* Add pagination controls here if needed */}
          </div>
        </div>

        {/* Customer Details Modal */}
        {showDetailsModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2d47] rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Customer Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#1a1d2e] rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-400">Name: <span className="text-white">{selectedCustomer.customer.full_name}</span></p>
                    <p className="text-gray-400">Email: <span className="text-white">{selectedCustomer.customer.email}</span></p>
                    <p className="text-gray-400">Phone: <span className="text-white">{selectedCustomer.customer.phone}</span></p>
                    <p className="text-gray-400">Member Since: <span className="text-white">{new Date(selectedCustomer.customer.created_at).toLocaleDateString()}</span></p>
                  </div>
                </div>

                <div className="bg-[#1a1d2e] rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Order Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-400">Total Orders: <span className="text-white">{selectedCustomer.customer.total_orders}</span></p>
                    <p className="text-gray-400">Total Spent: <span className="text-white">৳{selectedCustomer.customer.total_spent.toLocaleString()}</span></p>
                    <p className="text-gray-400">Average Order: <span className="text-white">৳{(selectedCustomer.customer.total_spent / (selectedCustomer.customer.total_orders || 1)).toFixed(0)}</span></p>
                    <p className="text-gray-400">Last Order: <span className="text-white">{selectedCustomer.customer.last_order_date ? new Date(selectedCustomer.customer.last_order_date).toLocaleDateString() : 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-[#1a1d2e] rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Recent Orders</h3>
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.orders.slice(0, 5).map((order) => (
                      <div key={order.order_id} className="flex justify-between items-center py-2 border-b border-gray-700">
                        <div>
                          <p className="text-white">#{order.order_id}</p>
                          <p className="text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">৳{order.total_amount.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.order_status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                            order.order_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}