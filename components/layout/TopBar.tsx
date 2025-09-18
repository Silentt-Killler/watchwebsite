'use client'

import { topBarContent } from '@/lib/constants/navigation'

export default function TopBar() {
  return (
    <div className="bg-black text-white py-2 text-center text-base md:text-lg">
      <div className="container-custom">
        <p className="flex items-center justify-center gap-2 md:gap-4">
          {topBarContent.messages.map((message, index) => (
            <span key={index} className="flex items-center">
              {message}
              {index < topBarContent.messages.length - 1 && (
                <span className="mx-2 md:mx-4 text-gray-500">|</span>
              )}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
