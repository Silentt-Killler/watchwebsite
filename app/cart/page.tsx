// app/cart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

export default function CartPage() {
  const router = useRouter()
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Wait for client-side mounting to access localStorage
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  const subtotal = getCartTotal()
  const deliveryCharge = 60 // Default delivery charge

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      alert('Your cart is empty!')
      return
    }
    router.push('/checkout')
  }

  // Check if cartItems exists and has items
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light mb-2">Your Cart is Empty</h2>
            <p className="text-gray-400 mb-6">Looks like you haven't added anything to your cart yet</p>
            <Link
              href="/"
              className="inline-block bg-white text-black px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-light mb-8">Shopping Cart ({cartItems.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-900 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Product Image */}
                  <img
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <p className="text-gray-400">৳ {item.price}</p>
                    {item.category && (
                      <p className="text-sm text-gray-500">{item.category}</p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 bg-gray-800 rounded hover:bg-gray-700 flex items-center justify-center transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-800 rounded hover:bg-gray-700 flex items-center justify-center transition-colors"
                      aria-label="Increase quantity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-medium text-lg">৳ {item.price * item.quantity}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    aria-label="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="mt-6">
              <button
                onClick={clearCart}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-light mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal ({cartItems.length} items)</span>
                  <span>৳ {subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Delivery</span>
                  <span>৳ {deliveryCharge}</span>
                </div>
                <div className="pt-3 border-t border-gray-800">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-lg font-medium">৳ {subtotal + deliveryCharge}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/"
                className="block w-full text-center mt-3 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Continue Shopping
              </Link>

              {/* Security Note */}
              <div className="mt-6 p-3 bg-black rounded text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secure Checkout
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Your information is safe with us
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}