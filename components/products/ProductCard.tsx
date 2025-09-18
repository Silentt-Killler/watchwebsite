'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'

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
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button className="bg-white text-black p-3 rounded-full transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button className="bg-white text-black p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
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