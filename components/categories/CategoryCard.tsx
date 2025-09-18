'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    href: string
    image: string
    hoverImage?: string
  }
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={category.href}
      className="group relative block overflow-hidden rounded-lg bg-gray-900 border border-gray-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[3/4] relative">
        <Image
          src={isHovered && category.hoverImage ? category.hoverImage : category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <h3 className="text-white text-2xl md:text-3xl font-light tracking-wider uppercase">
          {category.name}
        </h3>
        <p className="text-gray-300 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Explore Collection →
        </p>
      </div>
    </Link>
  )
}