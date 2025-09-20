'use client'

import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  brand: string
  category: string
}

export default function InlineSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchProducts()
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const searchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8000/api/products/search?q=${encodeURIComponent(searchTerm)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = () => {
    setIsOpen(false)
    setSearchTerm('')
    setResults([])
  }

  return (
    <div ref={searchRef} className="relative">
      {/* Search Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <SearchIcon className="w-5 h-5 text-white" />
      </button>

      {/* Search Dropdown - Different positioning for mobile/desktop */}
      {isOpen && (
        <>
          {/* Mobile Version - Centered */}
          <div className="md:hidden fixed left-1/2 -translate-x-1/2 top-20 w-[90vw] bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-50">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-800">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2 bg-black text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-white text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setResults([])
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Results for Mobile */}
            <div className="max-h-[50vh] overflow-y-auto">
              {renderResults()}
            </div>
          </div>

          {/* Desktop Version - Right aligned */}
          <div className="hidden md:block absolute right-0 top-full mt-2 w-[400px] bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-50">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2 bg-black text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setResults([])
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Results for Desktop */}
            <div className="max-h-[400px] overflow-y-auto">
              {renderResults()}
            </div>
          </div>
        </>
      )}
    </div>
  )

  function renderResults() {
    if (loading) {
      return (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      )
    }

    if (!loading && results.length > 0) {
      return (
        <div className="p-2">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              onClick={handleProductClick}
              className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Image
                src={product.images?.[0] || '/images/products/placeholder.jpg'}
                alt={product.name}
                width={50}
                height={50}
                className="object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-white text-sm font-medium line-clamp-1">{product.name}</p>
                <p className="text-gray-400 text-xs">{product.brand}</p>
                <p className="text-white font-bold text-sm">৳{product.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
          {results.length > 0 && (
            <div className="p-3 border-t border-gray-800">
              <Link
                href={`/products?search=${searchTerm}`}
                onClick={handleProductClick}
                className="block text-center text-sm text-white hover:text-gray-300"
              >
                View all results →
              </Link>
            </div>
          )}
        </div>
      )
    }

    if (!loading && searchTerm.length >= 2 && results.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-400">No products found</p>
        </div>
      )
    }

    if (!loading && searchTerm.length === 0) {
      return (
        <div className="p-6">
          <p className="text-gray-400 text-sm text-center">Type to search products</p>
        </div>
      )
    }

    return null
  }
}