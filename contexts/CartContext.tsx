'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  product_id: string
  product_name: string
  price: number
  quantity: number
  image: string
}

interface Product {
  id: string
  name: string
  price: number
  description: string
  images: string[]
  category: string
  stock: number
}

interface CartContextType {
  items: CartItem[]
  totalAmount: number
  itemCount: number
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => void
  fetchCart: () => Promise<void>
  toast: { message: string; type: 'success' | 'error' } | null
  setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchCart = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('http://localhost:8000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
        setTotalAmount(data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const addToCart = async (product: Product, quantity = 1) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setToast({ message: 'Please login to add items to cart', type: 'error' })
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      return
    }

    try {
      const res = await fetch('http://localhost:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity
        })
      })

      if (res.ok) {
        await fetchCart()
        setToast({
          message: `${product.name} added to cart successfully!`,
          type: 'success'
        })
      } else {
        const error = await res.json()
        console.error('Cart error:', error)
        if (res.status === 401) {
          localStorage.removeItem('token')
          setToast({
            message: 'Session expired. Please login again',
            type: 'error'
          })
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
        } else {
          setToast({
            message: error.detail || 'Failed to add item to cart',
            type: 'error'
          })
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      setToast({
        message: 'Network error. Please try again',
        type: 'error'
      })
    }
  }

  const removeFromCart = async (productId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`http://localhost:8000/api/cart/item/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        await fetchCart()
        setToast({
          message: 'Item removed from cart',
          type: 'success'
        })
      }
    } catch (error) {
      console.error('Error removing item:', error)
      setToast({
        message: 'Failed to remove item',
        type: 'error'
      })
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`http://localhost:8000/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity
        })
      })

      if (res.ok) {
        await fetchCart()
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      setToast({
        message: 'Failed to update quantity',
        type: 'error'
      })
    }
  }

  const clearCart = () => {
    setItems([])
    setTotalAmount(0)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchCart()
    }
  }, [])

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      items,
      totalAmount,
      itemCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      fetchCart,
      toast,
      setToast
    }}>
      {children}
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}