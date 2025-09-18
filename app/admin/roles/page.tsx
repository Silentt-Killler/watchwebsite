'use client'

import { useState, useEffect } from 'react'
import { Shield, UserCheck, UserX, Edit, Trash2, Plus } from 'lucide-react'

interface AdminUser {
  _id?: string
  id?: string
  full_name: string
  email: string
  phone: string
  role: string
  permissions: string[]
  is_active: boolean
  created_at?: string
}

const PERMISSIONS = [
  { key: 'products', label: 'Manage Products' },
  { key: 'orders', label: 'Manage Orders' },
  { key: 'customers', label: 'View Customers' },
  { key: 'brands', label: 'Manage Brands' },
  { key: 'sliders', label: 'Manage Sliders' },
  { key: 'analytics', label: 'View Analytics' },
  { key: 'settings', label: 'System Settings' },
  { key: 'admins', label: 'Manage Admins' }
]

export default function AdminRoles() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
    role: 'moderator',
    permissions: [] as string[],
    is_active: true
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://localhost:8000/api/admin/users?admins_only=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAdmins(data)
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      const res = await fetch('http://localhost:8000/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        alert('Admin user created successfully!')
        fetchAdmins()
        setShowAddModal(false)
        resetForm()
      } else {
        alert('Failed to create admin user')
      }
    } catch (error) {
      console.error('Error creating admin:', error)
    }
  }

  const deleteAdmin = async (id: string) => {
    if (!confirm('Remove admin privileges from this user?')) return

    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${id}/revoke`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        fetchAdmins()
      }
    } catch (error) {
      console.error('Error revoking admin:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      password: '',
      role: 'moderator',
      permissions: [],
      is_active: true
    })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1d2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading admin users...</div>
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
              <Shield style={{ width: '2rem', height: '2rem', color: '#F59E0B' }} />
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>Admin Role Management</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
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
              Add Admin User
            </button>
          </div>
        </div>

        {/* Admin Users Table */}
        <div style={{ backgroundColor: '#2a2d47', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9CA3AF' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9CA3AF' }}>Contact</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9CA3AF' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', color: '#9CA3AF' }}>Permissions</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem', color: '#9CA3AF' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem', color: '#9CA3AF' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id || admin._id} style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div>
                        <p style={{ color: 'white', fontWeight: 'bold' }}>{admin.full_name}</p>
                        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>ID: {admin.id || admin._id}</p>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <p style={{ color: 'white', fontSize: '0.875rem' }}>{admin.email}</p>
                      <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{admin.phone}</p>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: admin.role === 'super_admin' ? '#DC2626' : '#3B82F6',
                        color: 'white',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem'
                      }}>
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Moderator'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {admin.permissions?.map(perm => (
                          <span key={perm} style={{
                            padding: '0.125rem 0.5rem',
                            backgroundColor: '#374151',
                            color: '#9CA3AF',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem'
                          }}>
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {admin.is_active ? (
                        <UserCheck style={{ width: '1.25rem', height: '1.25rem', color: '#10B981', margin: '0 auto' }} />
                      ) : (
                        <UserX style={{ width: '1.25rem', height: '1.25rem', color: '#EF4444', margin: '0 auto' }} />
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button style={{
                          padding: '0.25rem',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          borderRadius: '0.25rem',
                          border: 'none',
                          cursor: 'pointer'
                        }}>
                          <Edit style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        {admin.role !== 'super_admin' && (
                          <button
                            onClick={() => deleteAdmin(admin.id || admin._id || '')}
                            style={{
                              padding: '0.25rem',
                              backgroundColor: '#EF4444',
                              color: 'white',
                              borderRadius: '0.25rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 style={{ width: '1rem', height: '1rem' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Admin Modal */}
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
                Add Admin User
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Form fields */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
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

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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

                {/* Permissions */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Permissions
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {PERMISSIONS.map(perm => (
                      <label key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF' }}>
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.key)}
                          onChange={() => handlePermissionToggle(perm.key)}
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
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
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Add Admin
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