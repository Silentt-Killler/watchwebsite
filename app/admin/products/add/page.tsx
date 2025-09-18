'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Plus, X } from 'lucide-react'
import Link from 'next/link'

interface Brand {
  id: string
  name: string
  slug: string
}

export default function AddProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'men',
    brand: '',
    stock: '',
    images: [''],
    is_featured: false,
    is_active: true,
    specifications: {
      movement: '',
      case_material: '',
      case_size: '',
      water_resistance: '',
      strap_material: '',
      dial_color: ''
    }
  })

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/brands?is_active=true')
      if (res.ok) {
        const data = await res.json()
        setBrands(data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))
  }

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login')
      router.push('/login')
      return
    }

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: formData.images.filter(img => img !== '')
      }

      const res = await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      })

      if (res.ok) {
        alert('Product added successfully!')
        router.push('/admin/products')
      } else {
        const error = await res.json()
        alert(error.detail || 'Failed to add product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1d2e', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/admin/products">
            <ArrowLeft style={{ width: '1.5rem', height: '1.5rem', color: 'white', cursor: 'pointer' }} />
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Add New Product</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
              Basic Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {/* Product Name */}
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                  placeholder="e.g. Seiko Presage Automatic"
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="couple">Couple</option>
                </select>
              </div>

              {/* Brand */}
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Brand *
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.slug}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Price (৳) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                  placeholder="e.g. 15000"
                />
              </div>

              {/* Stock */}
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                  placeholder="e.g. 50"
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1a1d2e',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}
                placeholder="Product description..."
              />
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF' }}>
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                />
                Featured Product
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF' }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>
          </div>

          {/* Images */}
          <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Product Images</h2>
              <button
                type="button"
                onClick={addImageField}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Plus style={{ width: '1rem', height: '1rem' }} />
                Add Image
              </button>
            </div>

            {formData.images.map((image, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                  placeholder="Image URL"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#EF4444',
                      color: 'white',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <X style={{ width: '1rem', height: '1rem' }} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Specifications */}
          <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
              Specifications (Optional)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Movement
                </label>
                <input
                  type="text"
                  name="specifications.movement"
                  value={formData.specifications.movement}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                  placeholder="e.g. Automatic"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Case Material
                </label>
                <input
                  type="text"
                  name="specifications.case_material"
                  value={formData.specifications.case_material}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                  placeholder="e.g. Stainless Steel"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Case Size
                </label>
                <input
                  type="text"
                  name="specifications.case_size"
                  value={formData.specifications.case_size}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                  placeholder="e.g. 42mm"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Water Resistance
                </label>
                <input
                  type="text"
                  name="specifications.water_resistance"
                  value={formData.specifications.water_resistance}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1d2e',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                  placeholder="e.g. 100m"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href="/admin/products">
              <button
                type="button"
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#374151',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: loading ? '#6B7280' : '#3B82F6',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}