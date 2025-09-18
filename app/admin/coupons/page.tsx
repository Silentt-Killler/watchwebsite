'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag, Copy, Calendar } from 'lucide-react'

interface Coupon {
  _id?: string
  id?: string
  code: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount?: number
  max_discount?: number  // For percentage discounts
  usage_limit?: number
  used_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at?: string
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '',
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8000/api/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCoupons(data)
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      const url = editingCoupon
        ? `http://localhost:8000/api/coupons/${editingCoupon.id || editingCoupon._id}`
        : 'http://localhost:8000/api/coupons'

      const method = editingCoupon ? 'PUT' : 'POST'

      const couponData = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(couponData)
      })

      if (res.ok) {
        fetchCoupons()
        resetForm()
        setShowAddModal(false)
      } else {
        alert('Failed to save coupon')
      }
    } catch (error) {
      console.error('Error saving coupon:', error)
    }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return

    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:8000/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        fetchCoupons()
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
    }
  }

  const generateCouponCode = () => {
    const code = 'TIMORA' + Math.random().toString(36).substring(2, 8).toUpperCase()
    setFormData(prev => ({ ...prev, code }))
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    alert(`Coupon code ${code} copied!`)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '',
      max_discount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      is_active: true
    })
    setEditingCoupon(null)
  }

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_amount: coupon.min_order_amount?.toString() || '',
      max_discount: coupon.max_discount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      valid_from: coupon.valid_from,
      valid_until: coupon.valid_until,
      is_active: coupon.is_active
    })
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading coupons...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1d2e', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Tag style={{ width: '2rem', height: '2rem', color: '#10B981' }} />
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Coupon Management</h1>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10B981',
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
              Add Coupon
            </button>
          </div>
        </div>

        {/* Coupons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {coupons.map((coupon) => (
            <div key={coupon.id || coupon._id} style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>{coupon.code}</h3>
                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      style={{
                        padding: '0.25rem',
                        backgroundColor: '#374151',
                        color: 'white',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Copy style={{ width: '0.875rem', height: '0.875rem' }} />
                    </button>
                  </div>
                  {coupon.description && (
                    <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{coupon.description}</p>
                  )}
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: coupon.is_active ? '#10B981' : '#6B7280',
                  color: 'white',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem'
                }}>
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: '#9CA3AF' }}>Discount: </span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}%`
                      : `৳${coupon.discount_value}`}
                  </span>
                </div>

                {coupon.min_order_amount && (
                  <div>
                    <span style={{ color: '#9CA3AF' }}>Min Order: </span>
                    <span style={{ color: 'white' }}>৳{coupon.min_order_amount}</span>
                  </div>
                )}

                {coupon.max_discount && (
                  <div>
                    <span style={{ color: '#9CA3AF' }}>Max Discount: </span>
                    <span style={{ color: 'white' }}>৳{coupon.max_discount}</span>
                  </div>
                )}

                <div>
                  <span style={{ color: '#9CA3AF' }}>Used: </span>
                  <span style={{ color: 'white' }}>
                    {coupon.used_count}/{coupon.usage_limit || '∞'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#9CA3AF', fontSize: '0.75rem' }}>
                <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                <span>Valid: {new Date(coupon.valid_from).toLocaleDateString()} - {new Date(coupon.valid_until).toLocaleDateString()}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => openEditModal(coupon)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Edit style={{ width: '1rem', height: '1rem', margin: '0 auto' }} />
                </button>
                <button
                  onClick={() => deleteCoupon(coupon.id || coupon._id || '')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#EF4444',
                    color: 'white',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 style={{ width: '1rem', height: '1rem', margin: '0 auto' }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {coupons.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '3rem' }}>
            No coupons found. Create your first coupon!
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: '#2a2d47',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Coupon Code *
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      required
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: '#1a1d2e',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: 'white'
                      }}
                      placeholder="e.g. SAVE20"
                    />
                    <button
                      type="button"
                      onClick={generateCouponCode}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#374151',
                        color: 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#1a1d2e',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: 'white'
                    }}
                    placeholder="e.g. 20% off on all watches"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Discount Type *
                    </label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({...formData, discount_type: e.target.value as 'percentage' | 'fixed'})}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: '#1a1d2e',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: 'white'
                      }}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (৳)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
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
                      placeholder={formData.discount_type === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Min Order Amount
                    </label>
                    <input
                      type="number"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: '#1a1d2e',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: 'white'
                      }}
                      placeholder="e.g. 1000"
                    />
                  </div>

                  {formData.discount_type === 'percentage' && (
                    <div>
                      <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Max Discount Amount
                      </label>
                      <input
                        type="number"
                        value={formData.max_discount}
                        onChange={(e) => setFormData({...formData, max_discount: e.target.value})}
                        min="0"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: '#1a1d2e',
                          border: '1px solid #374151',
                          borderRadius: '0.5rem',
                          color: 'white'
                        }}
                        placeholder="e.g. 1000"
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Usage Limit (Leave empty for unlimited)
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#1a1d2e',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: 'white'
                    }}
                    placeholder="e.g. 100"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Valid From *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                      required
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

                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Valid Until *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                      required
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
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    Active
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: '0.5rem 1.5rem',
                      backgroundColor: '#374151',
                      color: 'white',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.5rem 1.5rem',
                      backgroundColor: '#10B981',
                      color: 'white',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {editingCoupon ? 'Update' : 'Add'} Coupon
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