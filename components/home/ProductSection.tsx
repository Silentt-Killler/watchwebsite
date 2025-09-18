'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/products/ProductCard'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  images: string[]
  brand: string
  category: string
}

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Titan Raga Viva Silver Dial',
          price: 12500,
          original_price: 14999,
          images: ['/images/products/watch1.jpg', '/images/products/watch2.jpg'],
          brand: 'Titan',
          category: 'women'
        },
        {
          id: '2',
          name: 'Seiko Prospex Diver',
          price: 165000,
          original_price: 185000,
          images: ['/images/products/watch2.jpg', '/images/products/watch3.jpg'],
          brand: 'Seiko',
          category: 'men'
        },
        {
          id: '3',
          name: 'Casio G-Shock',
          price: 8599,
          original_price: 9999,
          images: ['/images/products/watch3.jpg', '/images/products/watch4.jpg'],
          brand: 'Casio',
          category: 'men'
        },
        {
          id: '4',
          name: 'Citizen Eco-Drive',
          price: 25999,
          images: ['/images/products/watch4.jpg', '/images/products/watch1.jpg'],
          brand: 'Citizen',
          category: 'couple'
        }
      ]
      setProducts(mockProducts)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-black">
        <div className="container-custom">
          <div className="text-center text-white">Loading...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-20 bg-black">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-2">
              Featured Collection
            </h2>
            <p className="text-gray-400">Handpicked timepieces for the discerning individual</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="hidden md:grid grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[85vw] snap-center">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}