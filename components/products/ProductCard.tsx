'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  original_price?: number
  images: string[]
  category: string
  is_featured?: boolean
  stock: number
  description: string
  free_shipping?: boolean
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const { addToCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Add to cart first
    await addToCart(product)

    // Then redirect to checkout
    router.push('/checkout')
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/products/${product.id}`)
  }

  const handleCardClick = () => {
    router.push(`/products/${product.id}`)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    // Change to second image if available
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex(1)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setCurrentImageIndex(0)
  }

  const discountPercentage = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  // Get current image
  const currentImage = product.images[currentImageIndex] || product.images[0] || '/images/products/placeholder.jpg'

  return (
    <div
      className="group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {/* Sale Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 text-xs font-bold rounded-full shadow-lg">
            -{discountPercentage}%
          </div>
        )}

        {/* Free Shipping Badge - Top of Image */}
        {product.free_shipping && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 text-xs font-bold rounded-full shadow-lg">
            FREE SHIPPING
          </div>
        )}

        {/* Wishlist Button - Adjusted Position */}
        <button
          onClick={handleWishlist}
          className={`absolute ${product.free_shipping ? 'top-14' : 'top-3'} right-3 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
            isWishlisted 
              ? 'bg-red-500 shadow-lg scale-110' 
              : 'bg-white/20 hover:bg-white/30 hover:shadow-lg hover:scale-110'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-white text-white' : 'text-gray-100 hover:text-red-400'
            }`}
          />
        </button>

        {/* Product Image with Hover Change */}
        <Image
          src={currentImage}
          alt={product.name}
          fill
          className={`object-cover transition-all duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />

        {/* Quick Actions Overlay - Desktop Only */}
        {!isMobile && (
          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-4 gap-3 transition-all duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <button
              onClick={handleQuickView}
              className="p-3 bg-gray-100 text-gray-900 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-110 shadow-lg"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4 bg-gray-900">
        {/* Brand */}
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
          {product.brand}
        </p>

        {/* Product Name - Bigger Text */}
        <h3 className="text-base md:text-lg font-semibold text-gray-100 mb-1 line-clamp-2 min-h-[2.5rem] hover:text-yellow-400 transition-colors">
          {product.name}
        </h3>

        {/* Price Section - Minimal Gap */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl md:text-2xl font-bold text-yellow-400">
            ৳{product.price.toLocaleString()}
          </span>
          {product.original_price && (
            <>
              <span className="text-sm text-gray-500 line-through">
                ৳{product.original_price.toLocaleString()}
              </span>
              <span className="text-xs text-green-400 font-semibold">
                Save ৳{(product.original_price - product.price).toLocaleString()}
              </span>
            </>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between mb-3">
          {product.stock > 0 ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">In Stock</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-xs text-red-400">Out of Stock</span>
            </div>
          )}

          {product.stock > 0 && product.stock < 10 && (
            <span className="text-xs text-orange-400 font-semibold">
              Only {product.stock} left!
            </span>
          )}
        </div>

        {/* Buy Now Button - Always visible on mobile, on hover for desktop */}
        <div className={`${isMobile || isHovered ? 'block' : 'hidden'}`}>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-sm font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {product.stock > 0 ? 'BUY NOW' : 'OUT OF STOCK'}
          </button>
        </div>
      </div>
    </div>
  )
}