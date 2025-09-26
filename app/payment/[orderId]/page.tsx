// app/payment/[orderId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, CheckCircle, XCircle, AlertCircle, CreditCard } from 'lucide-react'

interface PaymentPageProps {
  params: {
    orderId: string
  }
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paymentUrl, setPaymentUrl] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchOrderDetails()
  }, [])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrder(data)
        setPaymentMethod(data.payment_method)

        // If payment method is COD, redirect to success page
        if (data.payment_method === 'cod') {
          router.push(`/order-success/${params.orderId}`)
        }
      } else {
        setError('Order not found')
      }
    } catch (err) {
      setError('Failed to fetch order details')
    }
  }

  const initiatePayment = async () => {
    setLoading(true)
    setError('')
    setPaymentStatus('processing')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          order_id: params.orderId,
          amount: order.total_amount,
          payment_method: paymentMethod,
          customer_name: order.shipping_address.full_name,
          customer_phone: order.shipping_address.phone,
          customer_email: order.shipping_address.email
        })
      })

      if (response.ok) {
        const data = await response.json()

        if (data.payment_url) {
          setPaymentUrl(data.payment_url)
          // Redirect to payment gateway
          window.location.href = data.payment_url
        }
      } else {
        setError('Failed to initiate payment')
        setPaymentStatus('failed')
      }
    } catch (err) {
      setError('Payment initiation failed')
      setPaymentStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    // This would be called after returning from payment gateway
    const urlParams = new URLSearchParams(window.location.search)
    const status = urlParams.get('status')
    const paymentId = urlParams.get('payment_id')

    if (status && paymentId) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/status/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          const data = await response.json()

          if (data.payment.status === 'completed') {
            setPaymentStatus('success')
            setTimeout(() => {
              router.push(`/order-success/${params.orderId}`)
            }, 2000)
          } else {
            setPaymentStatus('failed')
          }
        }
      } catch (err) {
        setError('Failed to verify payment status')
      }
    }
  }

  useEffect(() => {
    checkPaymentStatus()
  }, [])

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Payment Status */}
        {paymentStatus === 'success' && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <h3 className="text-xl font-semibold">Payment Successful!</h3>
                <p className="text-gray-400 mt-1">Redirecting to order confirmation...</p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <h3 className="text-xl font-semibold">Payment Failed</h3>
                <p className="text-gray-400 mt-1">Please try again or choose a different payment method</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Card */}
        <div className="bg-gray-900 rounded-lg p-8">
          {/* Header */}
          <div className="flex items-center mb-6 pb-6 border-b border-gray-800">
            <CreditCard className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <h1 className="text-2xl font-light">Complete Payment</h1>
              <p className="text-gray-400 text-sm mt-1">Order #{params.orderId}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-8">
            <h3 className="text-lg mb-4">Order Summary</h3>
            <div className="bg-black rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span>৳ {order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery Charge</span>
                <span>৳ {order.delivery_charge}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-800">
                <span className="font-semibold">Total Amount</span>
                <span className="text-orange-500 font-semibold">৳ {order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Display */}
          <div className="mb-8">
            <h3 className="text-lg mb-4">Payment Method</h3>
            <div className="bg-black rounded-lg p-4">
              {paymentMethod === 'bkash' && (
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-pink-600 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">bKash</span>
                  </div>
                  <div>
                    <p className="font-medium">bKash Mobile Banking</p>
                    <p className="text-sm text-gray-400">Pay securely with your bKash account</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'nagad' && (
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">Nagad</span>
                  </div>
                  <div>
                    <p className="font-medium">Nagad Mobile Banking</p>
                    <p className="text-sm text-gray-400">Pay securely with your Nagad account</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'upay' && (
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">Upay</span>
                  </div>
                  <div>
                    <p className="font-medium">Upay Mobile Banking</p>
                    <p className="text-sm text-gray-400">Pay securely with your Upay account</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'full_payment' && (
                <div className="flex items-center">
                  <CreditCard className="w-16 h-16 text-green-500 mr-4" />
                  <div>
                    <p className="font-medium">Full Payment</p>
                    <p className="text-sm text-gray-400">Complete payment now</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Instructions */}
          {paymentStatus === 'pending' && (
            <div className="mb-8">
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm">
                      You will be redirected to the secure payment gateway.
                      Please complete the payment within 5 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 border border-gray-700 hover:border-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={initiatePayment}
              disabled={loading || paymentStatus !== 'pending'}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>

          {/* Security Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center text-xs text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure Payment Gateway
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// app/order-success/[orderId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Package, Truck, Home, Copy, Download } from 'lucide-react'
import confetti from 'canvas-confetti'

interface OrderSuccessPageProps {
  params: {
    orderId: string
  }
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    fetchOrderDetails()
  }, [])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err)
    }
  }

  const copyOrderId = () => {
    navigator.clipboard.writeText(params.orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadInvoice = async () => {
    // Implement invoice download logic
    console.log('Downloading invoice...')
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading order details...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Card */}
        <div className="bg-gray-900 rounded-lg p-8 text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-light mb-4">Order Placed Successfully!</h1>

          <p className="text-gray-400 mb-6">
            Thank you for your order. We've sent a confirmation email to {order.shipping_address.email}
          </p>

          <div className="bg-black rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-400 mb-2">Order Number</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-mono text-orange-500">{params.orderId}</p>
              <button
                onClick={copyOrderId}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy order ID"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-sm mt-2">Copied!</p>
            )}
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-light mb-6">What's Next?</h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Order Confirmed</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Your order has been received and is being processed
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-400">Preparing Your Order</h3>
                <p className="text-sm text-gray-500 mt-1">
                  We'll carefully pack your items (1-2 business days)
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-gray-400" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-400">On The Way</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Your order will be shipped and tracking info will be provided
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-gray-400" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-400">Delivered</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Estimated delivery: {order.delivery_option === 'inside_dhaka' ? '2-3 days' : '4-5 days'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Delivery Address */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-light mb-4">Delivery Address</h3>
            <div className="space-y-2 text-sm">
              <p>{order.shipping_address.full_name}</p>
              <p className="text-gray-400">{order.shipping_address.phone}</p>
              <p className="text-gray-400">{order.shipping_address.address_line1}</p>
              <p className="text-gray-400">{order.shipping_address.city}, {order.shipping_address.district}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-light mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>৳ {order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Delivery</span>
                <span>৳ {order.delivery_charge}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-800">
                <span className="font-medium">Total Paid</span>
                <span className="text-orange-500 font-medium">৳ {order.total_amount}</span>
              </div>
              <div className="pt-2">
                <span className="text-xs text-gray-500">
                  Payment Method: {order.payment_method.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/account/orders')}
            className="flex-1 border border-gray-700 hover:border-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={downloadInvoice}
            className="flex-1 border border-gray-700 hover:border-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Invoice
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}