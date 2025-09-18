'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Monitor, Smartphone, Eye, EyeOff } from 'lucide-react'

interface Slider {
  _id?: string
  id?: string
  title: string
  subtitle?: string
  image_url: string
  button_text?: string
  button_link?: string
  device_type: 'desktop' | 'mobile'
  order_index: number
  is_active: boolean
  created_at?: string
}

export default function AdminSliders() {
  const [sliders, setSliders] = useState<Slider[]>([])
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSliders()
  }, [])

  const fetchSliders = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/sliders')
      if (res.ok) {
        const data = await res.json()
        setSliders(data)
      }
    } catch (error) {
      console.error('Error fetching sliders:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteSlider = async (id: string) => {
    if (!confirm('Delete this slider?')) return

    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:8000/api/sliders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        fetchSliders()
      }
    } catch (error) {
      console.error('Error deleting slider:', error)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:8000/api/sliders/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (res.ok) {
        fetchSliders()
      }
    } catch (error) {
      console.error('Error toggling slider:', error)
    }
  }

  const filteredSliders = sliders.filter(s => s.device_type === activeTab)
    .sort((a, b) => a.order_index - b.order_index)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading sliders...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1d2e', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Home Slider Management</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/admin/sliders/add-desktop">
                <button style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Monitor style={{ width: '1rem', height: '1rem' }} />
                  Add Desktop Slider
                </button>
              </Link>
              <Link href="/admin/sliders/add-mobile">
                <button style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10B981',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Smartphone style={{ width: '1rem', height: '1rem' }} />
                  Add Mobile Slider
                </button>
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('desktop')}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: activeTab === 'desktop' ? '#3B82F6' : '#1a1d2e',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Monitor style={{ width: '1rem', height: '1rem' }} />
              Desktop Sliders
            </button>
            <button
              onClick={() => setActiveTab('mobile')}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: activeTab === 'mobile' ? '#10B981' : '#1a1d2e',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Smartphone style={{ width: '1rem', height: '1rem' }} />
              Mobile Sliders
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredSliders.map((slider) => (
            <div key={slider.id || slider._id} style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', overflow: 'hidden' }}>
              {/* Image Preview */}
              <div style={{ position: 'relative', aspectRatio: activeTab === 'desktop' ? '16/9' : '9/16', backgroundColor: '#1a1d2e' }}>
                <img
                  src={slider.image_url}
                  alt={slider.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: slider.is_active ? '#10B981' : '#EF4444',
                  color: 'white',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem'
                }}>
                  {slider.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.5rem' }}>{slider.title}</h3>
                {slider.subtitle && (
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{slider.subtitle}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Order: {slider.order_index}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => toggleActive(slider.id || slider._id || '', slider.is_active)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: slider.is_active ? '#10B981' : '#6B7280',
                        color: 'white',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {slider.is_active ? <Eye style={{ width: '1rem', height: '1rem' }} /> : <EyeOff style={{ width: '1rem', height: '1rem' }} />}
                    </button>
                    <Link href={`/admin/sliders/edit/${slider.id || slider._id}`}>
                      <button style={{
                        padding: '0.5rem',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        <Edit style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </Link>
                    <button
                      onClick={() => deleteSlider(slider.id || slider._id || '')}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#EF4444',
                        color: 'white',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSliders.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '3rem' }}>
            No {activeTab} sliders found. Add your first slider!
          </div>
        )}
      </div>
    </div>
  )
}