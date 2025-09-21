'use client'

import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  brand: string
  category: string
}

export default function InlineSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isMobileSearchOpen) {
      inputRef.current?.focus()
    }
  }, [isMobileSearchOpen])

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`)
      setSearchTerm('')
      setIsFocused(false)
      setIsMobileSearchOpen(false)
    }
  }

  return (
    <>
      {/* Desktop Search Bar */}
      <div ref={searchRef} className="hidden md:block relative">
        <form onSubmit={handleSearch} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search"
            className="w-48 lg:w-64 px-4 py-2 pr-20 bg-gray-900 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-200 text-black px-3 py-1 rounded-full text-sm font-medium"
          >
            Search
          </button>
        </form>

        {/* Desktop Results Dropdown */}
        {isFocused && searchTerm.length >= 2 && (
          <div className="absolute top-full mt-2 w-full bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-50 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
              </div>
            ) : results.length > 0 ? (
              <div>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={() => {
                      setSearchTerm('')
                      setIsFocused(false)
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-800"
                  >
                    <Image
                      src={product.images?.[0] || '/images/products/placeholder.jpg'}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm line-clamp-1">{product.name}</p>
                      <p className="text-gray-400 text-xs">{product.brand}</p>
                    </div>
                    <p className="text-white font-bold text-sm">৳{product.price.toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="p-4 text-center text-gray-400">No products found</p>
            )}
          </div>
        )}
      </div>

      {/* Mobile Search Icon Button */}
      <button
        onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
        className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <SearchIcon className="w-5 h-5 text-white" />
      </button>

      {/* Mobile Search Bar - Shows when icon clicked */}
      {isMobileSearchOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black border-t border-gray-800 p-3 z-50">
          <form onSubmit={handleSearch} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 pr-10 bg-gray-900 text-white rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5"
            >
              <SearchIcon className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}