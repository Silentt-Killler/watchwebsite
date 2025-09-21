'use client'

import { use, useState, useEffect } from 'react'
import ProductCard from '@/components/products/ProductCard'
import BrandPills from '@/components/products/BrandPills'
import ProductFilter from '@/components/products/ProductFilter'

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

interface FilterState {
  brands: string[]
  priceRange: { min: number; max: number }
  priceSort: '' | 'low-to-high' | 'high-to-low'
  strapMaterial: string[]
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
  const [filterState, setFilterState] = useState<FilterState>({
    brands: [],
    priceRange: { min: 0, max: 500000 },
    priceSort: '',
    strapMaterial: []
  })

  useEffect(() => {
    fetchProducts()
  }, [category])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log('Fetching products for category:', category)

      const response = await fetch(`http://localhost:8000/api/products`)
      if (response.ok) {
        const data = await response.json()
        // Filter by category on frontend
        const categoryProducts = data.filter((p: Product) => p.category === category)
        console.log('Products found:', categoryProducts.length)
        setProducts(categoryProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (products: Product[]) => {
    let filtered = [...products]

    // Brand filter
    if (filterState.brands.length > 0) {
      filtered = filtered.filter(p => filterState.brands.includes(p.brand))
    }

    // Price sort
    if (filterState.priceSort === 'low-to-high') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (filterState.priceSort === 'high-to-low') {
      filtered.sort((a, b) => b.price - a.price)
    }

    return filtered
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-8">
        {/* Header - Centered */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-light text-white mb-2">
            {category === 'men' ? "Men's Collection" :
             category === 'women' ? "Women's Collection" :
             "Couple Collection"}
          </h1>
          <p className="text-gray-400">
            Premium watches for {category === 'couple' ? 'couples' : category}
          </p>
        </div>

        {/* Brand Pills */}
        <div className="mb-8">
          <BrandPills onBrandSelect={(brands) => setFilterState({...filterState, brands})} />
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Desktop Filter */}
          <div className="hidden lg:block">
            <ProductFilter onFilterChange={setFilterState} />
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Mobile Filter */}
            <div className="lg:hidden mb-4 flex justify-between items-center">
              <p className="text-white">{applyFilters(products).length} products</p>
              <ProductFilter onFilterChange={setFilterState} isMobile />
            </div>

            {/* Products Grid or Coming Soon */}
            {applyFilters(products).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {applyFilters(products).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-white mb-4">Coming Soon</h2>
                  <p className="text-gray-400 text-lg">
                    {category === 'women' ? "Women's watch collection" :
                     category === 'couple' ? "Couple watch collection" :
                     "Men's watch collection"} launching soon!
                  </p>
                  <div className="mt-8">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-full">
                      <span className="text-yellow-500">🚀</span>
                      <span className="text-white">Launching Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}