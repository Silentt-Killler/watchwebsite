'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Filter, Grid, List } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'

interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  category: string
  brand: string
  images: string[]
  is_featured: boolean
  stock: number
}

export default function CategoryPage({ category }: { category: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 })
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  // Mock products for fallback
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Seiko Prospex Diver',
      price: 165000,
      original_price: 185000,
      images: ['/images/products/watch1.jpg'],
      brand: 'Seiko',
      category: category,
      is_featured: true,
      stock: 5
    },
    {
      id: '2',
      name: 'Casio G-Shock',
      price: 8599,
      original_price: 9999,
      images: ['/images/products/watch2.jpg'],
      brand: 'Casio',
      category: category,
      is_featured: false,
      stock: 10
    },
    {
      id: '3',
      name: 'Titan Raga',
      price: 12500,
      original_price: 14999,
      images: ['/images/products/watch3.jpg'],
      brand: 'Titan',
      category: category,
      is_featured: true,
      stock: 3
    },
    {
      id: '4',
      name: 'Citizen Eco-Drive',
      price: 25999,
      images: ['/images/products/watch4.jpg'],
      brand: 'Citizen',
      category: category,
      is_featured: false,
      stock: 0
    }
  ]

  useEffect(() => {
    fetchProducts()
  }, [category])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, sortBy, priceRange, selectedBrands])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8000/api/products?category=${category}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.length > 0 ? data : mockProducts)
      } else {
        setProducts(mockProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts(mockProducts)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Filter by brand
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand))
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    )

    // Sort products
    filtered.sort((a, b) => {
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

    setFilteredProducts(filtered)
  }

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
            {category === 'couple' ? 'Couple' : category.charAt(0).toUpperCase() + category.slice(1)} Collection
          </h1>
          <p className="text-gray-400">
            Premium watches for {category === 'couple' ? 'couples' : category}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
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
                    className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-gray-500"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-black text-white border border-gray-700 rounded focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="text-white font-medium mb-3">Brands</h3>
                <div className="space-y-2">
                  {availableBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
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
                        className="rounded border-gray-600 text-white focus:ring-gray-500"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setPriceRange({ min: 0, max: 500000 })
                setSelectedBrands([])
              }}
              className="mt-4 text-sm text-gray-400 hover:text-white underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Results count */}
        <p className="text-gray-400 mb-4">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
        </p>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No products found with current filters</p>
            <button
              onClick={() => {
                setPriceRange({ min: 0, max: 500000 })
                setSelectedBrands([])
              }}
              className="mt-4 text-white underline hover:text-gray-300"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex gap-4 bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                  >
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
                    <div className="flex-1">
                      <h3 className="text-white font-light text-lg">{product.name}</h3>
                      <p className="text-gray-400 text-sm">{product.brand}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-white text-xl">৳{product.price.toLocaleString()}</p>
                        {product.original_price && (
                          <p className="text-gray-500 line-through text-sm">
                            ৳{product.original_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      {product.stock > 0 && product.stock < 5 && (
                        <p className="text-yellow-500 text-sm mt-1">Only {product.stock} left</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}