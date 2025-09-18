'use client'

import { use } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Order {
  order_id: string
  payment_method: string
  total_amount: number
  order_status: string
  items: Array<{
    product_id: string
    product_name: string
    quantity: number
    price: number
  }>
  shipping_address: {
    full_name: string
    phone: string
    address_line1: string
    city: string
    district: string
  }
  created_at: string
}

export default function OrderConfirmationPage({
  params
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = use(params)  // Unwrap params
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      setOrder(data)
    }
  }

  // Rest remains same...

  if (!order) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container-custom text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-light mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your order. Your order ID is:
          </p>
          <p className="text-2xl font-medium mb-8">{order.order_id}</p>

          <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
            <h3 className="font-medium mb-4">Order Details:</h3>
            <p>Payment Method: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
            <p>Total Amount: ৳{order.total_amount}</p>
            <p>Status: {order.order_status}</p>
          </div>

          <div className="space-x-4">
            <Link href="/" className="inline-block bg-black text-white px-8 py-3 rounded-lg">
              Continue Shopping
            </Link>
            <Link href="/profile/orders" className="inline-block border border-black px-8 py-3 rounded-lg">
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}