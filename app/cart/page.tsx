'use client'

import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus } from 'lucide-react'

export default function CartPage() {
  const { items, totalAmount, removeFromCart, updateQuantity } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-light mb-8">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some premium watches to your collection</p>
          <Link
            href="/products"
            className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-light mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg p-6">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-4 mb-6 pb-6 border-b last:border-0">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.image || '/images/products/placeholder.jpg'}
                      alt={item.product_name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="font-medium text-lg">{item.product_name}</h3>
                    <p className="text-gray-600">৳{item.price} BDT</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-1 border rounded">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-1 border rounded hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="text-right">
                    <p className="font-medium text-lg">৳{(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-500 hover:text-red-700 mt-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-medium mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>৳100.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-medium">
                  <span>Total</span>
                  <span>৳{(totalAmount + 100).toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-black text-white text-center py-3 rounded-lg hover:bg-gray-800"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="block w-full text-center py-3 mt-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}