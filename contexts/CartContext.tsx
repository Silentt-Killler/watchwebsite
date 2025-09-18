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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)

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
      alert('Please login to add items to cart')
      window.location.href = '/login'
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
        alert('Item added to cart!')
      } else {
        const error = await res.json()
        console.error('Cart error:', error)
        if (res.status === 401) {
          localStorage.removeItem('token')
          alert('Session expired. Please login again')
          window.location.href = '/login'
        } else {
          alert(error.detail || 'Failed to add item to cart')
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Network error. Please try again')
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
      }
    } catch (error) {
      console.error('Error removing item:', error)
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
      fetchCart
    }}>
      {children}
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