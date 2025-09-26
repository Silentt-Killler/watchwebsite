// components/products/ProductCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    original_price?: number
    images: string[]
    brand: string
    category: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)

  // Add these hooks
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (product.images.length > 1) {
      setImageIndex(1)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setImageIndex(0)
  }

  // Add to cart handler
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Stop event bubbling

    setIsAdding(true)

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '/images/products/placeholder.jpg',
      category: product.category,
      brand: product.brand
    }

    addToCart(cartItem)
    showToast(`${product.name} added to cart!`, 'success')

    // Visual feedback
    setTimeout(() => {
      setIsAdding(false)
    }, 600)
  }

  // Quick view handler
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // You can implement quick view modal here
    console.log('Quick view:', product.id)
  }

  const discountPercentage = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className="group relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-800">
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 text-sm rounded z-10">
              -{discountPercentage}%
            </div>
          )}

          <Image
            src={product.images[imageIndex] || '/images/products/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`${
                isAdding ? 'bg-green-500 scale-110' : 'bg-white hover:scale-110'
              } text-black p-3 rounded-full transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300`}
            >
              {isAdding ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleQuickView}
              className="bg-white text-black p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:scale-110"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <p className="text-gray-400 text-sm">{product.brand}</p>
          <h3 className="text-white font-medium line-clamp-2 group-hover:text-gray-200 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            {product.original_price && (
              <span className="text-gray-500 line-through text-sm">
                ৳{product.original_price.toLocaleString()}
              </span>
            )}
            <span className="text-white text-lg font-bold">
              ৳{product.price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}