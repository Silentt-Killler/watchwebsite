'use client'

import { useState, useEffect } from 'react'

export default function TopBar() {
  const [discountMessage, setDiscountMessage] = useState('')
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    fetchRamadanDiscount()
  }, [])

  const fetchRamadanDiscount = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/settings/ramadan-discount')
      if (res.ok) {
        const data = await res.json()
        if (data.active) {
          setDiscountMessage(data.message)
          setIsActive(true)
        }
      }
    } catch (error) {
      console.error('Error fetching discount:', error)
    }
  }

  // Show Ramadan discount when active
  if (isActive && discountMessage) {
    return (
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-3">
        <div className="container-custom">
          <div className="relative overflow-hidden">
            <p className="animate-scroll text-center text-lg font-semibold">
              {discountMessage}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show normal content when no discount
  return (
    <div className="bg-black text-white py-2 text-center">
      <div className="container-custom">
        <p className="flex items-center justify-center gap-2 md:gap-4 text-base md:text-lg">
          <span>Timora</span>
          <span className="text-gray-500">|</span>
          <span>COD Available</span>
          <span className="text-gray-500">|</span>
          <span>Free Shipping</span>
          <span className="text-gray-500">|</span>
          <span>2 years Warranty</span>
        </p>
      </div>
    </div>
  )
}