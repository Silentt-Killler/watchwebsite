'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/products/ProductCard'
import { Filter } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  images: string[]
  category: string
  brand: string
  is_featured: boolean
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const brandParam = searchParams.get('brand')
  const categoryParam = searchParams.get('category')

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all')
  const [selectedBrand, setSelectedBrand] = useState(brandParam || 'all')

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Seiko Prospex Diver',
      price: 165000,
      original_price: 185000,
      images: ['/images/products/watch1.jpg', '/images/products/watch2.jpg'],
      brand: 'Seiko',
      category: 'men',
      is_featured: true
    },
    {
      id: '2',
      name: 'Casio G-Shock',
      price: 8599,
      original_price: 9999,
      images: ['/images/products/watch2.jpg', '/images/products/watch3.jpg'],
      brand: 'Casio',
      category: 'men',
      is_featured: false
    },
    {
      id: '3',
      name: 'Titan Raga',
      price: 12500,
      original_price: 14999,
      images: ['/images/products/watch3.jpg', '/images/products/watch4.jpg'],
      brand: 'Titan',
      category: 'women',
      is_featured: true
    },
    {
      id: '4',
      name: 'Citizen Eco-Drive',
      price: 25999,
      images: ['/images/products/watch4.jpg', '/images/products/watch1.jpg'],
      brand: 'Citizen',
      category: 'couple',
      is_featured: false
    }
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, selectedCategory, selectedBrand])

  useEffect(() => {
    if (brandParam) setSelectedBrand(brandParam)
    if (categoryParam) setSelectedCategory(categoryParam)
  }, [brandParam, categoryParam])

  const fetchProducts = async () => {
    try {
      // Try backend first
      try {
        const res = await fetch('http://localhost:8000/api/products')
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        } else {
          throw new Error('Backend not available')
        }
      } catch {
        // Use mock data
        setProducts(mockProducts)
      }
    } catch (error) {
      console.error('Error:', error)
      setProducts(mockProducts)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    if (selectedBrand !== 'all') {
      filtered = filtered.filter(p => p.brand === selectedBrand)
    }

    setFilteredProducts(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-light mb-8">
          {categoryParam ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)}'s Watches` :
           brandParam ? `${brandParam} Watches` : 'All Products'}
        </h1>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-64 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Category</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={selectedCategory === 'all'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-2"
                  />
                  All Categories
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="men"
                    checked={selectedCategory === 'men'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-2"
                  />
                  Men
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="women"
                    checked={selectedCategory === 'women'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-2"
                  />
                  Women
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="couple"
                    checked={selectedCategory === 'couple'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="mr-2"
                  />
                  Couple
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Brand</h3>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2"
              >
                <option value="all">All Brands</option>
                <option value="Seiko">Seiko</option>
                <option value="Casio">Casio</option>
                <option value="Citizen">Citizen</option>
                <option value="Titan">Titan</option>
              </select>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <p className="text-gray-400 mb-4">{filteredProducts.length} products found</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No products found matching your filters</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}