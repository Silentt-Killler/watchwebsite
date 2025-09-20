'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/products/ProductCard'
import { Filter } from 'lucide-react'
import BrandPills from '@/components/products/BrandPills'
import ProductFilter from '@/components/products/ProductFilter'

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
interface FilterState {
  brands: string[]
  priceRange: { min: number; max: number }
  priceSort: '' | 'low-to-high' | 'high-to-low'
  strapMaterial: string[]
}

const [filterState, setFilterState] = useState<FilterState>({
  brands: [],
  priceRange: { min: 0, max: 500000 },
  priceSort: '',
  strapMaterial: []
})

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

  const applyFilters = (products: Product[]) => {
  let filtered = [...products]

  if (filterState.brands.length > 0) {
    filtered = filtered.filter(p => filterState.brands.includes(p.brand))
  }

  if (filterState.priceSort === 'low-to-high') {
    filtered.sort((a, b) => a.price - b.price)
  } else if (filterState.priceSort === 'high-to-low') {
    filtered.sort((a, b) => b.price - a.price)
  }

  return filtered
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
  <div className="min-h-screen bg-black">
    {/* Brand Pills */}
    <BrandPills onBrandSelect={(brands) => setFilterState({...filterState, brands})} />

    <div className="container-custom py-8">
      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block">
          <ProductFilter onFilterChange={setFilterState} />
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4 flex justify-end">
            <ProductFilter onFilterChange={setFilterState} isMobile />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8 text-white">Loading...</div>
            ) : applyFilters(filteredProducts).length > 0 ? (
              applyFilters(filteredProducts).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                No products found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)
}