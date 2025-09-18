'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Tag, X } from 'lucide-react'

interface ShippingForm {
  full_name: string
  phone: string
  email: string
  address_line1: string
  address_line2: string
  city: string
  district: string
  postal_code: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items: cartItems, totalAmount: cartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // Coupon states
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  interface CheckoutItem {
    product_id: string
    product_name: string
    price: number
    quantity: number
    image: string
  }

  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([])
  const [checkoutTotal, setCheckoutTotal] = useState(0)
  const [isBuyNow, setIsBuyNow] = useState(false)
  const shippingCost = 100

  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    full_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    district: '',
    postal_code: ''
  })

  useEffect(() => {
    // Check for buy-now data
    const buyNowData = sessionStorage.getItem('buyNowData')
    if (buyNowData) {
      const data = JSON.parse(buyNowData)
      setCheckoutItems(data.items)
      setCheckoutTotal(data.total)
      setIsBuyNow(true)
      sessionStorage.removeItem('buyNowData')
    } else {
      // Use cart items
      setCheckoutItems(cartItems)
      setCheckoutTotal(cartTotal)
      setIsBuyNow(false)
    }

    // Get user info from token if available
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login to continue')
      router.push('/login')
    }
  }, [cartItems, cartTotal, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingForm({
      ...shippingForm,
      [e.target.name]: e.target.value
    })
  }

  // Apply Coupon Function
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code')
      return
    }

    setApplyingCoupon(true)
    setCouponMessage('')

    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://localhost:8000/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          order_amount: checkoutTotal
        })
      })

      const data = await res.json()

      if (res.ok) {
        setDiscount(data.discount_amount)
        setCouponMessage(data.message || `Coupon applied! You saved ৳${data.discount_amount}`)
        setCouponApplied(true)
      } else {
        setCouponMessage(data.detail || 'Invalid coupon code')
        setDiscount(0)
        setCouponApplied(false)
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      setCouponMessage('Failed to apply coupon')
      setDiscount(0)
      setCouponApplied(false)
    } finally {
      setApplyingCoupon(false)
    }
  }

  // Remove Coupon
  const removeCoupon = () => {
    setCouponCode('')
    setDiscount(0)
    setCouponMessage('')
    setCouponApplied(false)
  }

  // Calculate final total
  const finalTotal = checkoutTotal + shippingCost - discount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const orderData = {
        shipping_address: shippingForm,
        payment_method: paymentMethod,
        items: checkoutItems,
        subtotal: checkoutTotal,
        shipping_cost: shippingCost,
        coupon_code: couponApplied ? couponCode : null,
        discount_amount: discount,
        total_amount: finalTotal,
        notes: isBuyNow ? 'Buy Now Order' : 'Cart Order'
      }

      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const result = await response.json()

        // Clear cart if it's not buy-now
        if (!isBuyNow) {
          clearCart()
        }

        // Redirect to success page
        router.push(`/order-success?order_id=${result.order_id}`)
      } else {
        alert('Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-light text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6">
              <h2 className="text-xl font-light text-white mb-6">Shipping Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={shippingForm.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingForm.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-light text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={shippingForm.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-light text-gray-300 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="address_line1"
                    value={shippingForm.address_line1}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-light text-gray-300 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="address_line2"
                    value={shippingForm.address_line2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingForm.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-300 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={shippingForm.district}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-300 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={shippingForm.postal_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-black border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <h3 className="text-lg font-light text-white mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center text-gray-300">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Cash on Delivery
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input
                      type="radio"
                      name="payment_method"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                      disabled
                    />
                    Online Payment (Coming Soon)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || checkoutItems.length === 0}
                className="w-full mt-6 bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:text-gray-400 font-medium"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6 sticky top-4">
              <h2 className="text-xl font-light text-white mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {checkoutItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Image
                      src={item.image || '/images/products/placeholder.jpg'}
                      alt={item.product_name}
                      width={48}
                      height={48}
                      className="object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-light text-white">{item.product_name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-light text-white">৳{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="border-t border-gray-800 pt-4 mb-4">
                <label className="block text-sm font-light text-gray-300 mb-2">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Have a coupon code?
                </label>
                {!couponApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 bg-black border border-gray-700 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={applyingCoupon}
                      className="px-4 py-2 bg-white text-black rounded-md text-sm hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-900/30 border border-green-800 p-2 rounded">
                    <span className="text-sm text-green-400">
                      {couponCode} applied
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {couponMessage && (
                  <p className={`text-xs mt-2 ${couponApplied ? 'text-green-400' : 'text-red-400'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Subtotal</span>
                  <span>৳{checkoutTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Shipping</span>
                  <span>৳{shippingCost}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Discount</span>
                    <span>-৳{discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-800 text-white">
                  <span>Total</span>
                  <span>৳{finalTotal}</span>
                </div>
              </div>

              {/* Security & Trust Badges */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="space-y-2 text-xs text-gray-400">
                  <p className="flex items-center gap-1">
                    ✓ 100% Secure Checkout
                  </p>
                  <p className="flex items-center gap-1">
                    ✓ Free Shipping on All Orders
                  </p>
                  <p className="flex items-center gap-1">
                    ✓ 2 Years Warranty
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}