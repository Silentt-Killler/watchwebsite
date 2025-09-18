'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Brand {
  id: string
  name: string
  slug: string
  image: string
}

export default function BrandSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/brands?is_active=true')
      if (res.ok) {
        const data = await res.json()
        setBrands(data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
      // Fallback to static brands if API fails
      setBrands([
        { id: '1', name: 'Seiko', slug: 'seiko', image: '/images/brands/seiko.jpg' },
        { id: '2', name: 'Casio', slug: 'casio', image: '/images/brands/casio.jpg' },
        { id: '3', name: 'Citizen', slug: 'citizen', image: '/images/brands/citizen.jpg' },
      ])
    }
  }

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const container = scrollRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      checkScroll()
    }
    return () => container?.removeEventListener('scroll', checkScroll)
  }, [brands])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      const currentScroll = scrollRef.current.scrollLeft

      scrollRef.current.scrollTo({
        left: direction === 'left'
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (brands.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-black relative z-10">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="text-white/80 mb-2 text-base md:text-lg">
            Explore the finest timepieces by your favorite brands.
          </p>
          <h2 className="text-4xl md:text-6xl font-light mb-4 text-white">
            Our Premium Brands
          </h2>
        </div>

        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 text-white p-2 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.slug}`}
                className="flex-shrink-0 group"
              >
                <div className="w-48 h-48 bg-white rounded-lg p-8 flex items-center justify-center hover:shadow-xl transition-shadow">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <p className="text-center text-white mt-4 text-lg">{brand.name}</p>
              </Link>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 text-white p-2 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}