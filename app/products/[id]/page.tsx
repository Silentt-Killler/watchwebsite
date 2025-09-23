'use client'

import { use, useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Minus, Plus, Shield, Package, RefreshCw, Truck } from 'lucide-react'
import Link from 'next/link'
import ProductCard from '@/components/products/ProductCard'

interface ProductSpecifications {
  item?: Record<string, string>
  dial?: Record<string, string>
  case?: Record<string, string>
  band?: Record<string, string>
  movement?: Record<string, string>
  additional?: Record<string, string>
}

interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  description: string
  images: string[]
  category: string
  stock: number
  brand: string

  // Product Details Fields
  sku?: string
  model?: string
  movement?: string
  case_size?: string
  water_resistance?: string
  warranty?: string

  // Dynamic Specifications
  specifications?: ProductSpecifications
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProductPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const productId = resolvedParams.id

  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const { addToCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchRelatedProducts()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/products/${productId}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/products?limit=4`)
      if (res.ok) {
        const data = await res.json()
        setRelatedProducts(data.filter((p: Product) => p.id !== productId).slice(0, 4))
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
    }
  }

  const handleBuyNow = () => {
    if (product) {
      const buyNowData = {
        items: [{
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.images[0] || '/images/products/placeholder.jpg'
        }],
        total: product.price * quantity
      }
      sessionStorage.setItem('buyNowData', JSON.stringify(buyNowData))
      router.push('/checkout')
    }
  }

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in ${product?.name} (SKU: ${product?.sku || 'N/A'})`;
    const phone = '8801934764333';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Product not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/products" className="text-gray-400 hover:text-white">Products</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-white">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
              {product.original_price && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                  SALE {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                </div>
              )}
              <Image
                src={product.images[selectedImage] || '/images/products/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-white' : 'border-gray-700'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-light text-white mb-4">{product.name}</h1>
              <div className="flex items-baseline gap-3">
                {product.original_price && (
                  <span className="text-2xl text-gray-500 line-through">৳{product.original_price.toLocaleString()}</span>
                )}
                <span className="text-3xl font-bold text-white">৳{product.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Product Details Table */}
            <div className="space-y-2 text-sm">
              {product.sku && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-400">SKU:</span>
                  <span className="col-span-2 text-white">{product.sku}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-400">Product Name:</span>
                <span className="col-span-2 text-white">{product.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-400">Price:</span>
                <span className="col-span-2 text-white">৳{product.price.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-400">Brand:</span>
                <span className="col-span-2 text-white">{product.brand}</span>
              </div>
              {product.model && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-400">Model:</span>
                  <span className="col-span-2 text-white">{product.model}</span>
                </div>
              )}
              {product.movement && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-400">Movement:</span>
                  <span className="col-span-2 text-white">{product.movement}</span>
                </div>
              )}
              {product.case_size && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-400">Case Size:</span>
                  <span className="col-span-2 text-white">{product.case_size}</span>
                </div>
              )}
              {product.water_resistance && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-400">Water Resistance:</span>
                  <span className="col-span-2 text-white">{product.water_resistance}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-400">Warranty:</span>
                <span className="col-span-2 text-white">{product.warranty || '2 Years'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-400">Category:</span>
                <span className="col-span-2 text-white capitalize">{product.category}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-400">Availability:</span>
                <span className={`col-span-2 ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-4">
                <span className="text-white">Quantity:</span>
                <div className="flex items-center border border-gray-700 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-800 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-white" />
                  </button>
                  <span className="px-4 text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-gray-800 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                  ADD TO CART
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-white hover:bg-gray-200 text-black py-3 rounded-lg font-medium transition-colors"
                  disabled={product.stock === 0}
                >
                  BUY NOW
                </button>
              </div>

              <button
                onClick={handleWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                WhatsApp 01934-764333
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white text-sm font-medium">Authenticity</p>
                  <p className="text-gray-400 text-xs">Guaranteed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white text-sm font-medium">Brand New</p>
                  <p className="text-gray-400 text-xs">Condition</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white text-sm font-medium">1-5 Year</p>
                  <p className="text-gray-400 text-xs">Warranty</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white text-sm font-medium">Fastest Delivery</p>
                  <p className="text-gray-400 text-xs">Exchange Policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-12 bg-gray-900 rounded-lg p-8">
            <h2 className="text-2xl font-light text-white mb-8">Product Specifications</h2>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Item Section */}
              {product.specifications.item && Object.keys(product.specifications.item).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-gray-700">Item</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications.item).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-4">
                        <span className="text-gray-400 text-sm">{key}:</span>
                        <span className="text-white text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dial Section */}
              {product.specifications.dial && Object.keys(product.specifications.dial).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-gray-700">Dial</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications.dial).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-4">
                        <span className="text-gray-400 text-sm">{key}:</span>
                        <span className="text-white text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Case Section */}
              {product.specifications.case && Object.keys(product.specifications.case).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-gray-700">Case</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications.case).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-4">
                        <span className="text-gray-400 text-sm">{key}:</span>
                        <span className="text-white text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Band Section */}
              {product.specifications.band && Object.keys(product.specifications.band).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-gray-700">Band</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications.band).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-4">
                        <span className="text-gray-400 text-sm">{key}:</span>
                        <span className="text-white text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Movement Section */}
              {product.specifications.movement && Object.keys(product.specifications.movement).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-gray-700">Movement</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications.movement).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-4">
                        <span className="text-gray-400 text-sm">{key}:</span>
                        <span className="text-white text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {product.specifications.additional && Object.keys(product.specifications.additional).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-gray-700">Additional Information</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications.additional).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-4">
                        <span className="text-gray-400 text-sm">{key}:</span>
                        <span className="text-white text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="mt-12">
            <h2 className="text-2xl font-light text-white mb-4">Description</h2>
            <p className="text-gray-300 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-light text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}