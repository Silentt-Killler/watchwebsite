'use client'

import { useState, useEffect } from 'react'
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react'

interface FilterState {
  brands: string[]
  priceRange: { min: number; max: number }
  priceSort: '' | 'low-to-high' | 'high-to-low'
  strapMaterial: string[]
}

interface FilterProps {
  onFilterChange: (filters: FilterState) => void
  isMobile?: boolean
}

export default function ProductFilter({ onFilterChange, isMobile = false }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [brands, setBrands] = useState<string[]>([])
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    strap: true
  })

  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    priceRange: { min: 0, max: 500000 },
    priceSort: '',
    strapMaterial: []
  })

  const strapMaterials = ['Leather', 'Stainless Steel', 'Rubber', 'Fabric', 'Ceramic', 'Titanium']

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/brands/active')
      if (res.ok) {
        const data = await res.json()
        setBrands(data.map((b: any) => b.name))
      }
    } catch (error) {
      // Fallback brands if API fails
      setBrands(['Seiko', 'Casio', 'Titan', 'Citizen', 'Fossil', 'Timex', 'Orient', 'Samsung', 'Apple'])
    }
  }

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand]

    const newFilters = { ...filters, brands: newBrands }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

const handlePriceSort = (sort: '' | 'low-to-high' | 'high-to-low') => {
  const newFilters = { ...filters, priceSort: sort }
  setFilters(newFilters)
  onFilterChange(newFilters)
}

  const handleStrapToggle = (material: string) => {
    const newStraps = filters.strapMaterial.includes(material)
      ? filters.strapMaterial.filter(s => s !== material)
      : [...filters.strapMaterial, material]

    const newFilters = { ...filters, strapMaterial: newStraps }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

const clearFilters = () => {
  const newFilters: FilterState = {
    brands: [],
    priceRange: { min: 0, max: 500000 },
    priceSort: '',
    strapMaterial: []
  }
  setFilters(newFilters)
  onFilterChange(newFilters)
}
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }))
  }

  // Mobile Filter Modal
  if (isMobile) {
    return (
      <>
        {/* Filter Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
          {(filters.brands.length > 0 || filters.strapMaterial.length > 0 || filters.priceSort) && (
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* Mobile Filter Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="fixed bottom-0 left-0 right-0 bg-black rounded-t-2xl max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-black p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-lg font-medium text-white">Filters</h2>
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Filter Content */}
              <div className="p-4 space-y-4">
                {/* Price Sort */}
                <div className="border-b border-gray-800 pb-4">
                  <h3 className="text-white font-medium mb-3">Sort by Price</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-300">
                      <input
                        type="radio"
                        name="priceSort"
                        checked={filters.priceSort === 'low-to-high'}
                        onChange={() => handlePriceSort('low-to-high')}
                      />
                      Price: Low to High
                    </label>
                    <label className="flex items-center gap-2 text-gray-300">
                      <input
                        type="radio"
                        name="priceSort"
                        checked={filters.priceSort === 'high-to-low'}
                        onChange={() => handlePriceSort('high-to-low')}
                      />
                      Price: High to Low
                    </label>
                  </div>
                </div>

                {/* Strap Material */}
                <div className="pb-4">
                  <h3 className="text-white font-medium mb-3">Strap Material</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {strapMaterials.map(material => (
                      <label key={material} className="flex items-center gap-2 text-gray-300">
                        <input
                          type="checkbox"
                          checked={filters.strapMaterial.includes(material)}
                          onChange={() => handleStrapToggle(material)}
                        />
                        {material}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Apply/Clear Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-3 border border-gray-700 text-white rounded-lg"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 bg-white text-black rounded-lg"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop Filter Sidebar
  return (
    <div className="w-64 bg-gray-900 rounded-lg p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-white">Filters</h2>
        {(filters.brands.length > 0 || filters.strapMaterial.length > 0 || filters.priceSort) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-white"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price Section */}
      <div className="border-b border-gray-800 pb-4 mb-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex justify-between items-center w-full text-white font-medium mb-3"
        >
          <span>Price</span>
          {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedSections.price && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input
                type="radio"
                name="priceSort"
                checked={filters.priceSort === ''}
                onChange={() => handlePriceSort('')}
              />
              Default
            </label>
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input
                type="radio"
                name="priceSort"
                checked={filters.priceSort === 'low-to-high'}
                onChange={() => handlePriceSort('low-to-high')}
              />
              Low to High
            </label>
            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input
                type="radio"
                name="priceSort"
                checked={filters.priceSort === 'high-to-low'}
                onChange={() => handlePriceSort('high-to-low')}
              />
              High to Low
            </label>
          </div>
        )}
      </div>

      {/* Strap Material Section */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection('strap')}
          className="flex justify-between items-center w-full text-white font-medium mb-3"
        >
          <span>Strap Material</span>
          {expandedSections.strap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedSections.strap && (
          <div className="space-y-2">
            {strapMaterials.map(material => (
              <label key={material} className="flex items-center gap-2 text-gray-300 text-sm">
                <input
                  type="checkbox"
                  checked={filters.strapMaterial.includes(material)}
                  onChange={() => handleStrapToggle(material)}
                  className="rounded"
                />
                {material}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}