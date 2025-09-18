'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import CategoryCard from '@/components/categories/CategoryCard'


const categories = [
  {
    id: 'men',
    name: 'MEN',
    href: '/men',
    image: '/images/categories/men.jpg',
  },
  {
    id: 'women',
    name: 'WOMEN',
    href: '/women',
    image: '/images/categories/women.jpg',
  },
  {
    id: 'couple',
    name: 'COUPLE',
    href: '/couple',
    image: '/images/categories/couple.jpg',
  },
]

export default function CategorySection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-8 md:py-12 bg-black relative z-10">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-white/80 mb-2 text-base md:text-lg">
            Define Your Moment
          </p>
          <h2 className="text-4xl md:text-6xl font-light mb-4 text-white">
            Categories To Explore
          </h2>
          <p className="text-white/80 text-base md:text-lg">
            Exclusive collections crafted for him, her, and every bond in between.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all duration-300"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                <h3 className="text-white text-2xl md:text-3xl font-light tracking-wider">
                  {category.name}
                </h3>
                <p className="text-gray-300 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore Collection →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="flex-shrink-0 w-[300px] snap-center"
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-xl font-light tracking-wider">
                      {category.name}
                    </h3>
                    <p className="text-gray-300 text-sm mt-1">
                      Tap to explore →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Scroll Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {categories.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-gray-600"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
