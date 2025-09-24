'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  description: string
  images: string[]
  category: string
  stock: number
  brand: string
  model?: string
  movement?: string
  case_size?: string
  water_resistance?: string
  warranty?: string
  is_featured: boolean
  is_active: boolean
  // Additional specifications
  series?: string
  gender?: string
  brand_origin?: string
  upc?: string
  case_thickness?: string
  lug_to_lug?: string
  case_material?: string
  case_color?: string
  case_back?: string
  case_shape?: string
  dial_color?: string
  crystal?: string
  crystal_coating?: string
  crown?: string
  bezel?: string
  bezel_color?: string
  bezel_material?: string
  lumibrite?: string
  movement_source?: string
  engine?: string
  jewels?: string
  power_reserve?: string
  magnetic_resistance?: string
  band_material?: string
  band_type?: string
  band_width?: string
  band_color?: string
  clasp?: string
  functions?: string
  calendar?: string
  watch_style?: string
  weight?: string
  also_known_as?: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const productId = resolvedParams.id
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<string[]>([''])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    category: 'men',
    stock: 0,
    brand: '',
    is_featured: false,
    is_active: true,
    // Specifications
    series: '',
    gender: '',
    model: '',
    brand_origin: '',
    upc: '',
    case_size: '',
    case_thickness: '',
    lug_to_lug: '',
    case_material: '',
    case_color: '',
    case_back: '',
    case_shape: '',
    dial_color: '',
    crystal: '',
    crystal_coating: '',
    crown: '',
    bezel: '',
    bezel_color: '',
    bezel_material: '',
    lumibrite: '',
    movement: '',
    movement_source: '',
    engine: '',
    jewels: '',
    power_reserve: '',
    magnetic_resistance: '',
    band_material: '',
    band_type: '',
    band_width: '',
    band_color: '',
    clasp: '',
    water_resistance: '',
    functions: '',
    calendar: '',
    watch_style: '',
    weight: '',
    warranty: '',
    also_known_as: ''
  })

  useEffect(() => {
    if (productId) {
      fetchProduct(productId)
    }
  }, [productId])

  const fetchProduct = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:8000/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        setProduct(data)
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          original_price: data.original_price || 0,
          category: data.category || 'men',
          stock: data.stock || 0,
          brand: data.brand || '',
          is_featured: data.is_featured || false,
          is_active: data.is_active !== undefined ? data.is_active : true,
          // All specifications
          series: data.series || '',
          gender: data.gender || '',
          model: data.model || '',
          brand_origin: data.brand_origin || '',
          upc: data.upc || '',
          case_size: data.case_size || '',
          case_thickness: data.case_thickness || '',
          lug_to_lug: data.lug_to_lug || '',
          case_material: data.case_material || '',
          case_color: data.case_color || '',
          case_back: data.case_back || '',
          case_shape: data.case_shape || '',
          dial_color: data.dial_color || '',
          crystal: data.crystal || '',
          crystal_coating: data.crystal_coating || '',
          crown: data.crown || '',
          bezel: data.bezel || '',
          bezel_color: data.bezel_color || '',
          bezel_material: data.bezel_material || '',
          lumibrite: data.lumibrite || '',
          movement: data.movement || '',
          movement_source: data.movement_source || '',
          engine: data.engine || '',
          jewels: data.jewels || '',
          power_reserve: data.power_reserve || '',
          magnetic_resistance: data.magnetic_resistance || '',
          band_material: data.band_material || '',
          band_type: data.band_type || '',
          band_width: data.band_width || '',
          band_color: data.band_color || '',
          clasp: data.clasp || '',
          water_resistance: data.water_resistance || '',
          functions: data.functions || '',
          calendar: data.calendar || '',
          watch_style: data.watch_style || '',
          weight: data.weight || '',
          warranty: data.warranty || '',
          also_known_as: data.also_known_as || ''
        })
        setImages(data.images?.length > 0 ? data.images : [''])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    setImages(newImages)
  }

  const addImageField = () => {
    setImages([...images, ''])
  }

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const submitData = {
        ...formData,
        images: images.filter(img => img !== '')
      }

      const res = await fetch(`http://localhost:8000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      if (res.ok) {
        alert('Product updated successfully!')
        router.push('/admin/products')
      } else {
        alert('Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      const token = localStorage.getItem('token')

      try {
        const res = await fetch(`http://localhost:8000/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (res.ok) {
          alert('Product deleted successfully!')
          router.push('/admin/products')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1d2e', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/admin/products">
              <ArrowLeft style={{ width: '1.5rem', height: '1.5rem', color: 'white', cursor: 'pointer' }} />
            </Link>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Edit Product</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Basic Information */}
              <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Basic Information</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white', resize: 'vertical' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Price (৳)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Original Price (৳)
                      </label>
                      <input
                        type="number"
                        value={formData.original_price}
                        onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value))}
                        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                      >
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="unisex">Unisex</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Stock
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
                        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Brand
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Specifications */}
              <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Item Specifications</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { key: 'series', label: 'Series' },
                    { key: 'gender', label: 'Gender' },
                    { key: 'model', label: 'Model' },
                    { key: 'brand_origin', label: 'Brand Origin' },
                    { key: 'upc', label: 'UPC' },
                    { key: 'also_known_as', label: 'Also Known As' }
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={(formData as any)[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Specifications */}
              <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Case Specifications</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { key: 'case_size', label: 'Case Size' },
                    { key: 'case_thickness', label: 'Case Thickness' },
                    { key: 'lug_to_lug', label: 'Lug to Lug' },
                    { key: 'case_material', label: 'Case Material' },
                    { key: 'case_color', label: 'Case Color' },
                    { key: 'case_back', label: 'Case Back' },
                    { key: 'case_shape', label: 'Case Shape' },
                    { key: 'bezel', label: 'Bezel' },
                    { key: 'bezel_color', label: 'Bezel Color' },
                    { key: 'bezel_material', label: 'Bezel Material' }
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={(formData as any)[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dial & Crystal */}
              <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Dial & Crystal</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { key: 'dial_color', label: 'Dial Color' },
                    { key: 'crystal', label: 'Crystal' },
                    { key: 'crystal_coating', label: 'Crystal Coating' },
                    { key: 'crown', label: 'Crown' },
                    { key: 'lumibrite', label: 'LumiBrite' }
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={(formData as any)[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Movement */}
              <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Movement</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { key: 'movement', label: 'Movement' },
                    { key: 'movement_source', label: 'Movement Source' },
                    { key: 'engine', label: 'Engine' },
                    { key: 'jewels', label: 'Jewels' },
                    { key: 'power_reserve', label: 'Power Reserve' },
                    { key: 'magnetic_resistance', label: 'Magnetic Resistance' }
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={(formData as any)[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Band */}
              <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Band</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { key: 'band_material', label: 'Band Material' },
                    { key: 'band_type', label: 'Band Type' },
                    { key: 'band_width', label: 'Band Width' },
                    { key: 'band_color', label: 'Band Color' },
                    { key: 'clasp', label: 'Clasp' }
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={(formData as any)[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Additional Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { key: 'water_resistance', label: 'Water Resistance' },
                    { key: 'functions', label: 'Functions' },
                    { key: 'calendar', label: 'Calendar' },
                    { key: 'watch_style', label: 'Watch Style' },
                    { key: 'weight', label: 'Weight' },
                    { key: 'warranty', label: 'Warranty' }
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={(formData as any)[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Images */}
              <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h3 style={{ color: 'white', fontSize: '1.125rem', marginBottom: '1rem' }}>Product Images</h3>
                {images.map((image, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="Image URL"
                      style={{ flex: 1, padding: '0.5rem', backgroundColor: '#1a1d2e', border: '1px solid #374151', borderRadius: '0.5rem', color: 'white' }}
                    />
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        style={{ padding: '0.5rem', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Plus size={16} /> Add Image
                </button>
              </div>

              {/* Status */}
              <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h3 style={{ color: 'white', fontSize: '1.125rem', marginBottom: '1rem' }}>Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    <span>Featured Product</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h3 style={{ color: 'white', fontSize: '1.125rem', marginBottom: '1rem' }}>Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: loading ? '#6B7280' : '#3B82F6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={deleteProduct}
                    style={{ padding: '0.75rem', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Trash2 size={16} /> Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}