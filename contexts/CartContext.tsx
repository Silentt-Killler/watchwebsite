// contexts/CartContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  category?: string
  brand?: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart)
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error)
      } finally {
        setIsLoaded(true)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems))
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('cartUpdated'))
      } catch (error) {
        console.error('Error saving cart:', error)
      }
    }
  }, [cartItems, isLoaded])

  // Listen for cart clear events from other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleCartClear = () => {
        setCartItems([])
      }

      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'cart') {
          const newCart = e.newValue ? JSON.parse(e.newValue) : []
          setCartItems(newCart)
        }
      }

      window.addEventListener('cartCleared', handleCartClear)
      window.addEventListener('storage', handleStorage)

      return () => {
        window.removeEventListener('cartCleared', handleCartClear)
        window.removeEventListener('storage', handleStorage)
      }
    }
  }, [])

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id)
      if (existingItem) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        )
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cartCleared'))
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(String(item.price)) || 0
      const quantity = parseInt(String(item.quantity)) || 0
      return total + (price * quantity)
    }, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}