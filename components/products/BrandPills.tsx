'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BrandPillsProps {
  onBrandSelect: (brands: string[]) => void
}

export default function BrandPills({ onBrandSelect }: BrandPillsProps) {
  const [brands, setBrands] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    checkScroll()
  }, [brands])

  const fetchBrands = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/brands/active')
      if (res.ok) {
        const data = await res.json()
        setBrands(data.map((b: any) => b.name))
      }
    } catch (error) {
      // Fallback brands
      setBrands(['All', 'Seiko', 'Casio', 'Titan', 'Citizen', 'Fossil', 'Timex', 'Orient', 'Rolex', 'Omega', 'TAG Heuer'])
    }
  }

  const handleBrandClick = (brand: string) => {
    let newSelection: string[] = []

    if (brand === 'All') {
      newSelection = []
    } else {
      newSelection = selectedBrands.includes(brand)
        ? selectedBrands.filter(b => b !== brand)
        : [...selectedBrands, brand]
    }

    setSelectedBrands(newSelection)
    onBrandSelect(newSelection)
  }

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <div className="relative bg-black py-3 border-b border-gray-800">
      <div className="container-custom">
        <div className="relative flex items-center">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 z-10 p-1 bg-black rounded-full shadow-lg md:hidden"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Brands Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-8 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* All Button */}
            <button
              onClick={() => handleBrandClick('All')}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-all ${
                selectedBrands.length === 0
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>

            {/* Brand Pills */}
            {brands.filter(b => b !== 'All').map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandClick(brand)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  selectedBrands.includes(brand)
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 z-10 p-1 bg-black rounded-full shadow-lg md:hidden"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}