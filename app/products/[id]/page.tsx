'use client'

import { use, useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Heart, Minus, Plus, MessageCircle, Shield, Package, RefreshCw, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import ProductCard from '@/components/products/ProductCard'

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
  model?: string
  movement?: string
  case_size?: string
  water_resistance?: string
  warranty?: string
  is_featured: boolean
  is_active: boolean
  // Additional specifications
  series?: string
  gender?: string
  brand_origin?: string
  upc?: string
  case_thickness?: string
  lug_to_lug?: string
  case_material?: string
  case_color?: string
  case_back?: string
  case_shape?: string
  dial_color?: string
  crystal?: string
  crystal_coating?: string
  crown?: string
  bezel?: string
  bezel_color?: string
  bezel_material?: string
  lumibrite?: string
  movement_source?: string
  engine?: string
  jewels?: string
  power_reserve?: string
  magnetic_resistance?: string
  band_material?: string
  band_type?: string
  band_width?: string
  band_color?: string
  clasp?: string
  functions?: string
  calendar?: string
  watch_style?: string
  weight?: string
  also_known_as?: string
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
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showFullSpecs, setShowFullSpecs] = useState(false)
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
      setLoading(true)

      // Mock data with all specifications
      const mockProduct: Product = {
        id: productId,
        name: 'Seiko Prospex Sea Diver\'s 1968 Heritage GMT Green Dial Men\'s Watch',
        price: 165000,
        original_price: 185000,
        description: 'The Seiko Prospex Sea Diver\'s 1968 Heritage GMT is a premium diving watch that combines classic design with modern functionality.',
        images: [
          '/images/products/watch1.jpg',
          '/images/products/watch2.jpg',
          '/images/products/watch3.jpg',
          '/images/products/watch4.jpg'
        ],
        category: 'men',
        stock: 5,
        brand: 'Seiko',
        model: 'SPB381J1 / SBEJ009',
        series: 'Prospex Diver\'s 1968 Heritage',
        gender: 'Men\'s',
        brand_origin: 'Japan',
        upc: '4954628249982',
        movement: 'Automatic with manual winding',
        movement_source: 'Japan',
        engine: 'Seiko Caliber 6R54',
        jewels: '24',
        power_reserve: 'Approx. 72 Hours',
        magnetic_resistance: '4,800 A/m',
        case_size: '42mm',
        case_thickness: '12.9mm',
        lug_to_lug: '48.6mm',
        case_material: 'Stainless Steel',
        case_color: 'Silver-tone',
        case_back: 'Solid',
        case_shape: 'Round',
        dial_color: 'Green',
        crystal: 'Scratch Resistant Sapphire',
        crystal_coating: 'Anti-reflective coating on inner surface',
        crown: 'Screw Down',
        bezel: 'Unidirectional Rotating',
        bezel_color: 'Green-Black',
        bezel_material: 'Ceramic',
        lumibrite: 'LumiBrite on hands, index(es) and bezel',
        band_material: 'Stainless Steel',
        band_type: 'Bracelet',
        band_width: '20mm',
        band_color: 'Silver-tone',
        clasp: 'Three-fold clasp with secure lock, push button release',
        water_resistance: '200 Meters / 660 Feet',
        functions: 'GMT, Date, Hour, Minute, Second',
        calendar: 'Date display between 4 and 5 o\'clock position',
        watch_style: 'Diver, Fashion',
        weight: '176g',
        warranty: '2 Years',
        also_known_as: 'SPB381J1 / SBEJ009',
        is_featured: true,
        is_active: true
      }

      setProduct(mockProduct)

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    // Mock related products
    const mockRelated: Product[] = [
      {
        id: '2',
        name: 'Seiko Prospex Diver SPB143',
        price: 145000,
        original_price: 165000,
        images: ['/images/products/watch2.jpg', '/images/products/watch3.jpg'],
        brand: 'Seiko',
        category: 'men',
        stock: 3,
        description: '',
        is_featured: true,
        is_active: true
      },
      {
        id: '3',
        name: 'Seiko Prospex Solar',
        price: 85000,
        images: ['/images/products/watch3.jpg', '/images/products/watch4.jpg'],
        brand: 'Seiko',
        category: 'men',
        stock: 5,
        description: '',
        is_featured: false,
        is_active: true
      },
      {
        id: '4',
        name: 'Seiko Presage Cocktail',
        price: 55000,
        images: ['/images/products/watch4.jpg', '/images/products/watch1.jpg'],
        brand: 'Seiko',
        category: 'men',
        stock: 8,
        description: '',
        is_featured: false,
        is_active: true
      }
    ]
    setRelatedProducts(mockRelated)
  }

  const handleBuyNow = () => {
    if (!product) return
    const buyNowData = {
      items: [{
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images?.[0] || '/images/products/placeholder.jpg'
      }],
      total: product.price * quantity,
      buyNow: true
    }
    sessionStorage.setItem('buyNowData', JSON.stringify(buyNowData))
    router.push('/checkout')
  }

  const handleAddToCart = async () => {
    if (!product) return
    await addToCart(product, quantity)
  }

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase' && quantity < (product?.stock || 0)) {
      setQuantity(quantity + 1)
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Product not found</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-white text-black px-6 py-2 rounded"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  const discountPercentage = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/products" className="hover:text-white">Products</Link>
          <span className="mx-2">›</span>
          <Link href={`/products?brand=${product.brand}`} className="hover:text-white">{product.brand}</Link>
          <span className="mx-2">›</span>
          <span className="text-white">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded z-10">
                  SALE -{discountPercentage}%
                </div>
              )}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-4 right-4 bg-white/10 backdrop-blur p-2 rounded-full z-10 hover:bg-white/20"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gray-900 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-white' : 'border-transparent'
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
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-light mb-4">{product.name}</h1>
              <div className="flex items-baseline gap-3">
                {product.original_price && (
                  <span className="text-2xl text-gray-500 line-through">৳{product.original_price.toLocaleString()}</span>
                )}
                <span className="text-3xl font-bold text-white">৳{product.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="space-y-3 py-6 border-t border-gray-800">
              <div className="flex">
                <span className="text-gray-400 w-40">Brand:</span>
                <span className="text-white font-medium">{product.brand}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-40">Model:</span>
                <span className="text-white">{product.model || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-40">Movement:</span>
                <span className="text-white">{product.movement || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-40">Case Size:</span>
                <span className="text-white">{product.case_size || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-40">Water Resistance:</span>
                <span className="text-white">{product.water_resistance || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-40">Warranty:</span>
                <span className="text-white">{product.warranty || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-40">Availability:</span>
                <span className={product.stock > 0 ? 'text-green-500' : 'text-red-500'}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Quantity & Buttons */}
            <div className="space-y-4 py-6 border-t border-gray-800">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Quantity:</span>
                <div className="flex items-center gap-1 bg-gray-900 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    className="p-2 hover:bg-gray-800 rounded-l-lg transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-2 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    className="p-2 hover:bg-gray-800 rounded-r-lg transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                  ADD TO CART
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  disabled={product.stock === 0}
                >
                  BUY NOW
                </button>
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="py-6 border-t border-gray-800">
              <p className="text-gray-400 mb-4">For more live images and videos, Contact us now</p>
              <a
                href="https://wa.me/8801934764333"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">WhatsApp</span>
                <span className="font-bold">01934-764333</span>
              </a>
            </div>
          </div>
        </div>

        {/* Guarantees Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 py-8 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-white font-medium">Authenticity</p>
              <p className="text-gray-400 text-sm">Guaranteed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-white font-medium">1-5 Year</p>
              <p className="text-gray-400 text-sm">Warranty</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-white font-medium">Brand New</p>
              <p className="text-gray-400 text-sm">Condition</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-white font-medium">7 Days</p>
              <p className="text-gray-400 text-sm">Exchange Policy</p>
            </div>
          </div>
        </div>


{/* Detailed Specifications */}
<div className="mt-12">
  <h2 className="text-2xl font-light mb-8 text-white">Product Specifications</h2>

  {/* Desktop: 2 columns with proper alignment */}
  <div className="hidden md:grid grid-cols-2 gap-x-16 gap-y-12">
    {/* Column 1 */}
    <div className="space-y-10">
      {/* Item Section - Always show header if section exists */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-700 pb-2">Item</h3>
        <div className="space-y-3">
          {product.brand ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Brand:</span>
              <span className="text-white">{product.brand}</span>
            </div>
          ) : null}
          {product.series ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Series:</span>
              <span className="text-white">{product.series}</span>
            </div>
          ) : null}
          {product.gender ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Gender:</span>
              <span className="text-white">{product.gender}</span>
            </div>
          ) : null}
          {product.model ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Model:</span>
              <span className="text-white">{product.model}</span>
            </div>
          ) : null}
          {product.brand_origin ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Brand Origin:</span>
              <span className="text-white">{product.brand_origin}</span>
            </div>
          ) : null}
          {product.upc ? (
            <div className="flex">
              <span className="text-gray-400 w-40">UPC:</span>
              <span className="text-white">{product.upc}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Case Section */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-700 pb-2">Case</h3>
        <div className="space-y-3">
          {product.case_size ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Case Size:</span>
              <span className="text-white">{product.case_size}</span>
            </div>
          ) : null}
          {product.case_thickness ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Case Thickness:</span>
              <span className="text-white">{product.case_thickness}</span>
            </div>
          ) : null}
          {product.lug_to_lug ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Lug-to-lug:</span>
              <span className="text-white">{product.lug_to_lug}</span>
            </div>
          ) : null}
          {product.case_material ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Case Material:</span>
              <span className="text-white">{product.case_material}</span>
            </div>
          ) : null}
          {product.case_color ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Case Color:</span>
              <span className="text-white">{product.case_color}</span>
            </div>
          ) : null}
          {product.case_back ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Case Back:</span>
              <span className="text-white">{product.case_back}</span>
            </div>
          ) : null}
          {product.case_shape ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Case Shape:</span>
              <span className="text-white">{product.case_shape}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Movement Section */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-700 pb-2">Movement</h3>
        <div className="space-y-3">
          {product.movement ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Movement:</span>
              <span className="text-white">{product.movement}</span>
            </div>
          ) : null}
          {product.movement_source ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Movement Source:</span>
              <span className="text-white">{product.movement_source}</span>
            </div>
          ) : null}
          {product.engine ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Engine:</span>
              <span className="text-white">{product.engine}</span>
            </div>
          ) : null}
          {product.jewels ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Jewels:</span>
              <span className="text-white">{product.jewels}</span>
            </div>
          ) : null}
          {product.power_reserve ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Power Reserve:</span>
              <span className="text-white">{product.power_reserve}</span>
            </div>
          ) : null}
          {product.magnetic_resistance ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Magnetic Resistance:</span>
              <span className="text-white">{product.magnetic_resistance}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>

    {/* Column 2 */}
    <div className="space-y-10">
      {/* Dial Section */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-700 pb-2">Dial</h3>
        <div className="space-y-3">
          {product.dial_color ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Dial Color:</span>
              <span className="text-white">{product.dial_color}</span>
            </div>
          ) : null}
          {product.crystal ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Crystal:</span>
              <span className="text-white">{product.crystal}</span>
            </div>
          ) : null}
          {product.crystal_coating ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Crystal Coating:</span>
              <span className="text-white">{product.crystal_coating}</span>
            </div>
          ) : null}
          {product.crown ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Crown:</span>
              <span className="text-white">{product.crown}</span>
            </div>
          ) : null}
          {product.bezel ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Bezel:</span>
              <span className="text-white">{product.bezel}</span>
            </div>
          ) : null}
          {product.bezel_color ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Bezel Color:</span>
              <span className="text-white">{product.bezel_color}</span>
            </div>
          ) : null}
          {product.bezel_material ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Bezel Material:</span>
              <span className="text-white">{product.bezel_material}</span>
            </div>
          ) : null}
          {product.lumibrite ? (
            <div className="flex">
              <span className="text-gray-400 w-40">LumiBrite:</span>
              <span className="text-white">{product.lumibrite}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Band Section */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-700 pb-2">Band</h3>
        <div className="space-y-3">
          {product.band_material ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Band Material:</span>
              <span className="text-white">{product.band_material}</span>
            </div>
          ) : null}
          {product.band_type ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Band Type:</span>
              <span className="text-white">{product.band_type}</span>
            </div>
          ) : null}
          {product.band_width ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Band Width:</span>
              <span className="text-white">{product.band_width}</span>
            </div>
          ) : null}
          {product.band_color ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Band Color:</span>
              <span className="text-white">{product.band_color}</span>
            </div>
          ) : null}
          {product.clasp ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Clasp:</span>
              <span className="text-white">{product.clasp}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-700 pb-2">Additional Information</h3>
        <div className="space-y-3">
          {product.water_resistance ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Water Resistance:</span>
              <span className="text-white">{product.water_resistance}</span>
            </div>
          ) : null}
          {product.functions ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Functions:</span>
              <span className="text-white">{product.functions}</span>
            </div>
          ) : null}
          {product.calendar ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Calendar:</span>
              <span className="text-white">{product.calendar}</span>
            </div>
          ) : null}
          {product.watch_style ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Watch Style:</span>
              <span className="text-white">{product.watch_style}</span>
            </div>
          ) : null}
          {product.weight ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Weight:</span>
              <span className="text-white">{product.weight}</span>
            </div>
          ) : null}
          {product.warranty ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Warranty:</span>
              <span className="text-white">{product.warranty}</span>
            </div>
          ) : null}
          {product.also_known_as ? (
            <div className="flex">
              <span className="text-gray-400 w-40">Also Known As:</span>
              <span className="text-white">{product.also_known_as}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </div>

  {/* Mobile Collapsible */}
  <div className="md:hidden">
    <button
      onClick={() => setShowFullSpecs(!showFullSpecs)}
      className="flex items-center justify-between w-full text-lg font-medium text-white mb-4 py-2"
    >
      <span>View Specifications</span>
      {showFullSpecs ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </button>

    {showFullSpecs && (
        <div className="space-y-6">
          {/* All sections in single column for mobile */}
          {/* Item Section */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-800 pb-2">Item</h3>
            <div className="space-y-3">
              {product.brand && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Brand</span>
                    <span className="text-white">{product.brand}</span>
                  </div>
              )}
              {product.series && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Series</span>
                    <span className="text-white">{product.series}</span>
                  </div>
              )}
              {product.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gender</span>
                    <span className="text-white">{product.gender}</span>
                  </div>
              )}
              {product.model && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Model</span>
                    <span className="text-white">{product.model}</span>
                  </div>
              )}
              {product.brand_origin && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Brand Origin</span>
                    <span className="text-white">{product.brand_origin}</span>
                  </div>
              )}
              {product.upc && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">UPC</span>
                    <span className="text-white">{product.upc}</span>
                  </div>
              )}
            </div>
          </div>

         {/* Case Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-800 pb-2">Case</h3>
              <div className="space-y-3">
                {product.case_size && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Case Size</span>
                    <span className="text-white">{product.case_size}</span>
                  </div>
                )}
                {product.case_thickness && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Case Thickness</span>
                    <span className="text-white">{product.case_thickness}</span>
                  </div>
                )}
                {product.lug_to_lug && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lug-to-lug</span>
                    <span className="text-white">{product.lug_to_lug}</span>
                  </div>
                )}
                {product.case_material && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Case Material</span>
                    <span className="text-white">{product.case_material}</span>
                  </div>
                )}
                {product.case_color && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Case Color</span>
                    <span className="text-white">{product.case_color}</span>
                  </div>
                )}
                {product.case_back && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Case Back</span>
                    <span className="text-white">{product.case_back}</span>
                  </div>
                )}
                {product.case_shape && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Case Shape</span>
                    <span className="text-white">{product.case_shape}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dial Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-800 pb-2">Dial</h3>
              <div className="space-y-3">
                {product.dial_color && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dial Color</span>
                    <span className="text-white">{product.dial_color}</span>
                  </div>
                )}
                {product.crystal && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Crystal</span>
                    <span className="text-white">{product.crystal}</span>
                  </div>
                )}
                {product.crystal_coating && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Crystal Coating</span>
                    <span className="text-white text-right">{product.crystal_coating}</span>
                  </div>
                )}
                {product.crown && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Crown</span>
                    <span className="text-white">{product.crown}</span>
                  </div>
                )}
                {product.bezel && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bezel</span>
                    <span className="text-white">{product.bezel}</span>
                  </div>
                )}
                {product.bezel_color && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bezel Color</span>
                    <span className="text-white">{product.bezel_color}</span>
                  </div>
                )}
                {product.bezel_material && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bezel Material</span>
                    <span className="text-white">{product.bezel_material}</span>
                  </div>
                )}
                {product.lumibrite && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">LumiBrite</span>
                    <span className="text-white text-right">{product.lumibrite}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Movement Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-800 pb-2">Movement</h3>
              <div className="space-y-3">
                {product.movement && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Movement</span>
                    <span className="text-white">{product.movement}</span>
                  </div>
                )}
                {product.movement_source && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Movement Source</span>
                    <span className="text-white">{product.movement_source}</span>
                  </div>
                )}
                {product.engine && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Engine</span>
                    <span className="text-white">{product.engine}</span>
                  </div>
                )}
                {product.jewels && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jewels</span>
                    <span className="text-white">{product.jewels}</span>
                  </div>
                )}
                {product.power_reserve && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Power Reserve</span>
                    <span className="text-white">{product.power_reserve}</span>
                  </div>
                )}
                {product.magnetic_resistance && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Magnetic Resistance</span>
                    <span className="text-white">{product.magnetic_resistance}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Band Section */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-800 pb-2">Band</h3>
              <div className="space-y-3">
                {product.band_material && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Band Material</span>
                    <span className="text-white">{product.band_material}</span>
                  </div>
                )}
                {product.band_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Band Type</span>
                    <span className="text-white">{product.band_type}</span>
                  </div>
                )}
                {product.band_width && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Band Width</span>
                    <span className="text-white">{product.band_width}</span>
                  </div>
                )}
                {product.band_color && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Band Color</span>
                    <span className="text-white">{product.band_color}</span>
                  </div>
                )}
                {product.clasp && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clasp</span>
                    <span className="text-white text-right">{product.clasp}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-white border-b border-gray-800 pb-2">Additional Information</h3>
              <div className="space-y-3">
                {product.water_resistance && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Water Resistance</span>
                    <span className="text-white">{product.water_resistance}</span>
                  </div>
                )}
                {product.functions && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Functions</span>
                    <span className="text-white text-right">{product.functions}</span>
                  </div>
                )}
                {product.calendar && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Calendar</span>
                    <span className="text-white text-right">{product.calendar}</span>
                  </div>
                )}
                {product.watch_style && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Watch Style</span>
                    <span className="text-white">{product.watch_style}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Weight</span>
                    <span className="text-white">{product.weight}</span>
                  </div>
                )}
                {product.warranty && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Warranty</span>
                    <span className="text-white">{product.warranty}</span>
                  </div>
                )}
                {product.also_known_as && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Also Known As</span>
                    <span className="text-white">{product.also_known_as}</span>
                  </div>
                )}
              </div>
            </div>

          {/* Add all other sections similarly */}
        </div>
    )}
  </div>
</div>

        {/* Product Description */}
        <div className="mt-12 py-8 border-t border-gray-800">
          <h2 className="text-2xl font-light mb-6">Product Description</h2>
          <p className="text-gray-300 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Related Products */}
        <div className="mt-12 py-8 border-t border-gray-800">
          <h2 className="text-2xl font-light mb-6">Related Products</h2>

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct}/>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
              {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="flex-shrink-0 w-[75vw] snap-center">
                    <Link href={`/products/${relatedProduct.id}`}>
                      <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="relative aspect-square bg-gray-800">
                          <Image
                              src={relatedProduct.images[0] || '/images/products/placeholder.jpg'}
                              alt={relatedProduct.name}
                              fill
                              className="object-cover"
                          />
                          {relatedProduct.original_price && (
                              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs rounded">
                                -{Math.round(((relatedProduct.original_price - relatedProduct.price) / relatedProduct.original_price) * 100)}%
                              </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-gray-400 text-xs">{relatedProduct.brand}</p>
                <h3 className="text-white text-sm font-medium line-clamp-2 mt-1">
                  {relatedProduct.name}
                </h3>
                <div className="flex items-baseline gap-2 mt-2">
                  {relatedProduct.original_price && (
                    <span className="text-gray-500 line-through text-xs">
                      ৳{relatedProduct.original_price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-white font-bold">
                    ৳{relatedProduct.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>

    {/* Scroll Indicators */}
    <div className="flex justify-center gap-2 mt-4">
      {relatedProducts.map((_, index) => (
        <div
          key={index}
          className="w-2 h-2 rounded-full bg-gray-600"
        />
      ))}
    </div>
  </div>
</div>
      </div>
    </div>
  )
}
