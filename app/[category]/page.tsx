'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Filter, Grid, List } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  category: string
  brand: string
  images: string[]
  is_featured: boolean
  stock: number
}

interface PageProps {
  params: Promise<{ category: string }>
}

export default function CategoryPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const rawCategory = resolvedParams.category

  // Validate category
  const validCategories = ['men', 'women', 'couple']
  const category = validCategories.includes(rawCategory) ? rawCategory : 'men'

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
  }, [category, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8000/api/products?category=${category}`)
      if (response.ok) {
        const data = await response.json()

        // Sort products
        const sorted = [...data].sort((a: Product, b: Product) => {
          switch(sortBy) {
            case 'price-low':
              return a.price - b.price
            case 'price-high':
              return b.price - a.price
            case 'name':
            default:
              return a.name.localeCompare(b.name)
          }
        })

        setProducts(sorted)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on selected filters
 const filteredProducts = products.filter(product => {
  if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
    return false
  }
   {/* price range filter*/}
  if (product.price < priceRange.min || product.price > priceRange.max) {
    return false
  }
  return true
})


  // Get unique brands from products
  const availableBrands = Array.from(new Set(products.map(p => p.brand)))

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-white capitalize mb-2">
            {category} Collection
          </h1>
          <p className="text-gray-400">
            Premium watches for {category === 'couple' ? 'couples' : category}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-white hover:text-gray-300"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-900 text-white px-4 py-2 rounded border border-gray-800 focus:outline-none focus:border-gray-600"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-gray-900 rounded-lg">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Price Range */}
              <div>
                <h3 className="text-white font-medium mb-3">Price Range</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded"
                  />
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="text-white font-medium mb-3">Brands</h3>
                <div className="space-y-2">
                  {availableBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand])
                          } else {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand))
                          }
                        }}
                        className="rounded"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No products found with current filters</p>
            <button
              onClick={() => {
                setPriceRange({ min: 0, max: 100000 })
                setSelectedBrands([])
              }}
              className="mt-4 text-white underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className={viewMode === 'grid'
                  ? 'group'
                  : 'flex gap-4 bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors'
                }
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <div>
                    <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={product.images?.[0] || '/images/products/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-medium">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-white font-light line-clamp-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm">{product.brand}</p>
                    <p className="text-white text-lg mt-1">৳{product.price.toFixed(2)}</p>
                  </div>
                ) : (
                  // List View
                  <>
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={product.images?.[0] || '/images/products/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                        sizes="96px"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                          <span className="text-white text-xs">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-white font-light">{product.name}</h3>
                      <p className="text-gray-400 text-sm">{product.brand}</p>
                      <p className="text-white text-lg mt-2">৳{product.price.toFixed(2)}</p>
                      {product.stock > 0 && product.stock < 10 && (
                        <p className="text-yellow-500 text-sm">Only {product.stock} left</p>
                      )}
                    </div>
                  </>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Back to All Products */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-white hover:text-gray-300"
          >
            ← View All Products
          </Link>
        </div>
      </div>
    </div>
  )
}