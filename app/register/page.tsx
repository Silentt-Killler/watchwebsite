'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { authAPI } from '@/lib/api/auth'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Sending data:', formData)

    try {
      const result = await authAPI.register(formData)
      alert('Registration successful! Please login.')
      window.location.href = '/login'
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      console.error('Error details:', error)
      alert(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Timora"
                width={120}
                height={40}
                className="h-10 w-auto mx-auto"
              />
            </Link>
          </div>

          {/* Mobile Tabs */}
          <div className="flex lg:hidden mb-6 bg-gray-900 rounded-lg p-1">
            <Link href="/login" className="flex-1 text-center py-2 px-4 rounded-md text-gray-400">
              Login
            </Link>
            <button className="flex-1 text-center py-2 px-4 bg-white text-black rounded-md font-medium">
              Signup
            </button>
          </div>

          {/* Headers */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light text-white mb-2">
              Get Started Now
            </h1>
            <p className="text-gray-400 text-sm">
              Join our exclusive circle and explore timeless luxury.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
              required
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4"
                required
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-400">
                I agree to the{' '}
                <Link href="/terms" className="text-white hover:underline">
                  Terms & Conditions
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Unlock Luxury
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-gray-400">OR</span>
            </div>
          </div>

          {/* Google Login */}
          <button className="w-full py-3 bg-gray-900 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Sign In Link */}
          <p className="text-center text-gray-400 mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image (Desktop only) - LOGIN PAGE ER MOTO */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/auth-bg.jpg"
          alt="Luxury Watch"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
    </div>
  )
}