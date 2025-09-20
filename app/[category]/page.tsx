'use client'

import { use, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Filter, Grid, List } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import BrandPills from '@/components/products/BrandPills'
import ProductFilter from '@/components/products/ProductFilter'



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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
const [filterState, setFilterState] = useState<FilterState>({
  brands: [],
  priceRange: { min: 0, max: 500000 },
  priceSort: '',
  strapMaterial: []
})


  useEffect(() => {
    fetchProducts()
  }, [category, sortBy])

const fetchProducts = async () => {
  try {
    setLoading(true)

    // Debug: Check what category is being used
    console.log('Fetching products for category:', category)

    const response = await fetch(`http://localhost:8000/api/products?category=${category}`)

    if (response.ok) {
      const data = await response.json()
      console.log('Products received:', data)
      setProducts(data)
    } else {
      console.error('Failed to fetch products')
      setProducts([])
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    setProducts([])
  } finally {
    setLoading(false)
  }
}

  const applyFilters = (products: Product[]) => {
  let filtered = [...products]

  // Brand filter from pills
  if (filterState.brands.length > 0) {
    filtered = filtered.filter(p => filterState.brands.includes(p.brand))
  }

  // Price sort
  if (filterState.priceSort === 'low-to-high') {
    filtered.sort((a, b) => a.price - b.price)
  } else if (filterState.priceSort === 'high-to-low') {
    filtered.sort((a, b) => b.price - a.price)
  }

  // Existing brand filter
  if (selectedBrands.length > 0) {
    filtered = filtered.filter(p => selectedBrands.includes(p.brand))
  }

  // Price range
  filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max)

  return filtered
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
  <div className="min-h-screen bg-black">
    <div className="container-custom py-8">
      {/* Header - Center aligned */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-light text-white capitalize mb-2">
          {category === 'men' ? "Men's Collection" :
           category === 'women' ? "Women's Collection" :
           "Couple Collection"}
        </h1>
        <p className="text-gray-400">
          Premium watches for {category === 'couple' ? 'couples' : category}
        </p>
      </div>

      {/* Brand Pills - After Title */}
      <BrandPills onBrandSelect={(brands) => setFilterState({...filterState, brands})} />

      {/* Main Content */}
      <div className="flex gap-6 mt-8">
        {/* Desktop Filter Sidebar */}
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

          {/* Rest of the code remains same */}
        </div>
      </div>
    </div>
  </div>
)
}