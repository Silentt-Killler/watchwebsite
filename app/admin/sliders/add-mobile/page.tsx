'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Smartphone } from 'lucide-react'   // ✅ Monitor → Smartphone
import Link from 'next/link'

export default function AddMobileSlider() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    button_text: '',
    button_link: '',
    order_index: 1,
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem('token')
    try {
      const sliderData = {
        title: formData.title || null,
        subtitle: formData.subtitle || null,
        image_url: formData.image_url,
        button_text: formData.button_text || null,
        button_link: formData.button_link || null,
        device_type: 'mobile',   // ✅ desktop → mobile
        order_index: formData.order_index,
        is_active: formData.is_active
      }

      const res = await fetch('http://localhost:8000/api/sliders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sliderData)
      })

      if (res.ok) {
        alert('Mobile slider added successfully!')   // ✅ Text update
        router.push('/admin/sliders')
      } else {
        const error = await res.json()
        alert(error.detail || 'Failed to add slider')
      }
    } catch (error) {
      console.error('Error adding slider:', error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1d2e', padding: '1.5rem' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/admin/sliders">
            <ArrowLeft style={{ width: '1.5rem', height: '1.5rem', color: 'white', cursor: 'pointer' }} />
          </Link>
          <Smartphone style={{ width: '1.5rem', height: '1.5rem', color: '#3B82F6' }} />  {/* ✅ Icon change */}
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Add Mobile Slider</h1> {/* ✅ Title change */}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
               {/* Image URL - REQUIRED */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Image URL * (Required - 1920x1080 recommended)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1a1d2e',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}
                placeholder="https://example.com/slider-image.jpg"
              />
            </div>

            {/* Title - OPTIONAL */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Title (Optional - Leave empty for image only)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1a1d2e',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}
                placeholder="e.g. Premium Watches Collection (Optional)"
              />
            </div>

            {/* Subtitle - OPTIONAL */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Subtitle (Optional)
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1a1d2e',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}
                placeholder="e.g. Discover our exclusive collection (Optional)"
              />
            </div>

            {/* Button Text - OPTIONAL */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Button Text (Optional)
              </label>
              <input
                type="text"
                value={formData.button_text}
                onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1a1d2e',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}
                placeholder="e.g. Shop Now (Optional)"
              />
            </div>

            {/* Button Link - OPTIONAL */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Button Link (Optional)
              </label>
              <input
                type="text"
                value={formData.button_link}
                onChange={(e) => setFormData({...formData, button_link: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1a1d2e',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}
                placeholder="e.g. /products or /men (Optional)"
              />
            </div>

            {/* Order Index */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Display Order *
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                required
                min="1"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#1a1d2e',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}
              />
            </div>

            {/* Active Checkbox */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                Active (Show on homepage)
              </label>
            </div>

            {/* Preview */}
            {formData.image_url && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Preview:</p>
                <div style={{ aspectRatio: '9/16', backgroundColor: '#1a1d2e', borderRadius: '0.5rem', overflow: 'hidden', position: 'relative' }}>
                  {/* ✅ aspectRatio 16/9 → 9/16 */}
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
                    }}
                  />
                  {(formData.title || formData.subtitle) && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        {formData.title && (
                          <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {formData.title}
                          </h2>
                        )}
                        {formData.subtitle && (
                          <p style={{ color: 'white', fontSize: '1rem' }}>{formData.subtitle}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p style={{ color: '#10B981', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  ✓ Image only slider is supported - text fields are optional
                </p>
              </div>
            )}

            {/* Submit Buttons (same as before) */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Link href="/admin/sliders">
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
                {loading ? 'Adding...' : 'Add Slider'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
