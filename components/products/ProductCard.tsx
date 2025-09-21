'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye, Zap } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'

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
  const { addToCart } = useCart()
  const router = useRouter()

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

  const discountPercentage = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

const handleAddToCart = (e: React.MouseEvent) => {
  e.preventDefault()

  // Call addToCart with the Product object and quantity
  addToCart(product, 1)
}

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    const buyNowData = {
      items: [{
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0] || '/images/products/placeholder.jpg'
      }],
      total: product.price
    }
    sessionStorage.setItem('buyNowData', JSON.stringify(buyNowData))
    router.push('/checkout')
  }

  return (
    <div
      className="group relative bg-gray-900 rounded-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/products/${product.id}`}>
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
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
  <button
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      router.push(`/products/${product.id}`)
    }}
    className="bg-white text-black p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
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
      </Link>

      {/* Action Buttons */}
      <div className="p-4 pt-0 flex gap-2">
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Add to Cart</span>
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-white hover:bg-gray-200 text-black py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Buy Now</span>
        </button>
      </div>
    </div>
  )
}