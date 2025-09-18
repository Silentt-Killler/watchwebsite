'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-400 mb-4">Order ID: {orderId}</p>
        <Link href="/" className="bg-white text-black px-6 py-3 rounded-lg inline-block">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}