'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Proper interface for Slider
interface Slider {
  _id?: string
  id?: string
  title?: string  // Optional
  subtitle?: string  // Optional
  image_url: string  // Required
  button_text?: string  // Optional
  button_link?: string  // Optional
  device_type: 'desktop' | 'mobile'
  order_index: number
  is_active: boolean
}

export default function HeroSlider() {
  const [sliders, setSliders] = useState<Slider[]>([])  // Type the state properly
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check device type
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)

    // Fetch sliders
    fetchSliders()

    return () => window.removeEventListener('resize', checkDevice)
  }, [isMobile])

  const fetchSliders = async () => {
    const deviceType = isMobile ? 'mobile' : 'desktop'
    try {
      const res = await fetch(`http://localhost:8000/api/sliders?device_type=${deviceType}&is_active=true`)
      if (res.ok) {
        const data = await res.json()
        setSliders(data)
      }
    } catch (error) {
      console.error('Error fetching sliders:', error)
      // Fallback sliders if API fails
      setSliders([
        {
          id: '1',
          image_url: '/images/hero-1.jpg',
          title: 'Premium Watches',
          device_type: 'desktop',
          order_index: 1,
          is_active: true
        }
      ])
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length)
  }

  useEffect(() => {
    if (sliders.length > 1) {
      const interval = setInterval(nextSlide, 5000)
      return () => clearInterval(interval)
    }
  }, [sliders.length, currentSlide])

  if (sliders.length === 0) {
    return (
      <div className="relative w-full h-[400px] md:h-[600px] bg-gray-900">
        <div className="flex items-center justify-center h-full">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-black">
      {sliders.map((slider, index) => (
        <div
          key={slider.id || slider._id || index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slider.image_url}
            alt={slider.title || 'Slider Image'}
            className="w-full h-full object-cover"
          />

          {/* Only show overlay if there's text content */}
          {(slider.title || slider.subtitle || slider.button_text) && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white px-4">
                {slider.title && (
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                    {slider.title}
                  </h1>
                )}
                {slider.subtitle && (
                  <p className="text-lg md:text-xl lg:text-2xl mb-8">
                    {slider.subtitle}
                  </p>
                )}
                {slider.button_text && slider.button_link && (
                  <Link
                    href={slider.button_link}
                    className="inline-block bg-white text-black px-6 md:px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {slider.button_text}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Navigation Buttons */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {sliders.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}