'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_or_phone: formData.email,
          password: formData.password
        })
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('token', data.access_token)

        // Verify if user is admin
        const userRes = await fetch('http://localhost:8000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${data.access_token}` }
        })

        if (userRes.ok) {
          const userData = await userRes.json()
          if (userData.is_admin) {
            router.push('/admin/dashboard')
          } else {
            localStorage.removeItem('token')
            setError('Access denied. Admin privileges required.')
          }
        }
      } else {
        setError(data.detail || 'Invalid credentials')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Admin Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-4">
            <Lock className="w-8 h-8 text-gray-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Authorized Personnel Only</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white px-4 py-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="admin@timora.com"
                  required
                />
                <Mail className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white px-4 py-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-gray-900 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-gray-400 text-xs text-center">
              This is a secure area. All login attempts are monitored and logged.
              Unauthorized access attempts will be reported.
            </p>
          </div>

          {/* Back to User Login */}
          <div className="mt-6 text-center">
           <Link
  href="/login"
  className="text-gray-400 hover:text-white text-sm transition-colors"
>
  ← Back to User Login
</Link>
          </div>
        </div>

        {/* Demo Credentials (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-yellow-500 text-xs font-semibold mb-2">Demo Credentials:</p>
            <p className="text-gray-400 text-xs">Email: admin@timora.com</p>
            <p className="text-gray-400 text-xs">Password: admin123</p>
          </div>
        )}
      </div>
    </div>
  )
}