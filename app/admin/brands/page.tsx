// ========== 1. app/admin/brands/page.tsx (NEW) ==========
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react'

interface Brand {
  _id?: string
  id?: string
  name: string
  slug: string
  image: string
  description?: string
  is_active: boolean
  created_at?: string
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    description: '',
    is_active: true
  })

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/brands')
      if (res.ok) {
        const data = await res.json()
        setBrands(data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      const url = editingBrand
        ? `http://localhost:8000/api/brands/${editingBrand.id || editingBrand._id}`
        : 'http://localhost:8000/api/brands'

      const method = editingBrand ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchBrands()
        resetForm()
        setShowAddModal(false)
      } else {
        alert('Failed to save brand')
      }
    } catch (error) {
      console.error('Error saving brand:', error)
    }
  }

  const deleteBrand = async (id: string) => {
    if (!confirm('Delete this brand?')) return

    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:8000/api/brands/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        fetchBrands()
      }
    } catch (error) {
      console.error('Error deleting brand:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      image: '',
      description: '',
      is_active: true
    })
    setEditingBrand(null)
  }

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      slug: brand.slug,
      image: brand.image,
      description: brand.description || '',
      is_active: brand.is_active
    })
    setShowAddModal(true)
  }

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !editingBrand) {
      setFormData(prev => ({
        ...prev,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-')
      }))
    }
  }, [formData.name, editingBrand])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d2e] flex items-center justify-center">
        <div className="text-white text-xl">Loading brands...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1d2e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#2a2d47] rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Brand Management</h1>
            <button
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Add Brand
            </button>
          </div>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <div key={brand.id || brand._id} className="bg-[#2a2d47] rounded-xl p-6 relative">
              <div className="aspect-square relative mb-4 bg-white rounded-lg overflow-hidden">
                <img
                  src={brand.image || '/images/placeholder.jpg'}
                  alt={brand.name}
                  className="w-full h-full object-contain p-4"
                />
              </div>

              <h3 className="text-white font-bold text-lg mb-1">{brand.name}</h3>
              <p className="text-gray-400 text-sm mb-2">/{brand.slug}</p>

              {brand.description && (
                <p className="text-gray-300 text-sm mb-3">{brand.description}</p>
              )}

              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-xs ${
                  brand.is_active 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {brand.is_active ? 'Active' : 'Inactive'}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(brand)}
                    className="p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBrand(brand.id || brand._id || '')}
                    className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {brands.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            No brands found. Add your first brand!
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2d47] rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Brand Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#1a1d2e] text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Seiko"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full bg-[#1a1d2e] text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                      placeholder="e.g. seiko"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Brand Logo URL</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full bg-[#1a1d2e] text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                      placeholder="https://example.com/logo.png"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1">Enter image URL or upload to cloud storage</p>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Description (Optional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-[#1a1d2e] text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                      rows={3}
                      placeholder="Brand description..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-400">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="rounded"
                      />
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingBrand ? 'Update Brand' : 'Add Brand'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

