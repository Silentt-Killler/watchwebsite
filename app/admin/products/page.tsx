'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

// Define Product interface
interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  brand: string
  stock: number
  images: string[]
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]) // Type the state
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

const fetchProducts = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found')
      setLoading(false)
      return
    }

    const res = await fetch('http://localhost:8000/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.error('Network error:', err)
      return null
    })

    if (res && res.ok) {
      const data = await res.json()
      setProducts(data)
    } else {
      console.error('Failed to fetch products')
      setProducts([])
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    setProducts([])
  } finally {
    setLoading(false)
  }
}

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return

    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login')
      return
    }

    try {
      const res = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        fetchProducts()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d2e] flex items-center justify-center">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1d2e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#2a2d47] rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Products Management</h1>
            <Link
              href="/admin/products/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1d2e] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-[#2a2d47] rounded-xl p-6">
              <img
                src={product.images?.[0] || '/images/placeholder.jpg'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-white font-bold mb-2">{product.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{product.brand}</p>
              <p className="text-white text-xl font-bold mb-4">৳{product.price}</p>

              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-xs ${
                  product.stock > 10 ? 'bg-green-500/20 text-green-500' : 
                  product.stock > 0 ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  Stock: {product.stock}
                </span>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            No products found
          </div>
        )}
      </div>
    </div>
  )
}
