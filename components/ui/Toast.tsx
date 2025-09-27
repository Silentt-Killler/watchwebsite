'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X, AlertCircle } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  const Icon = type === 'success' ? CheckCircle : AlertCircle

  return (
    <div className={`fixed top-20 right-4 z-50 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}>
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      <button onClick={onClose}>
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}