const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface LoginData {
  email_or_phone: string
  password: string
}

interface RegisterData {
  full_name: string
  email: string
  phone: string
  password: string
}

interface ProductParams {
  category?: string
  brand?: string
  is_featured?: boolean
  skip?: number
  limit?: number
}

interface OrderData {
  shipping_address: any
  payment_method: string
  items: any[]
  subtotal: number
  shipping_cost: number
  total_amount: number
  notes?: string
}

export const api = {
  // Auth endpoints
  register: async (data: RegisterData) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Registration failed')
    return res.json()
  },

  login: async (data: LoginData) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Login failed')
    return res.json()
  },

  getMe: async (token: string) => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Auth check failed')
    return res.json()
  },

  // Product endpoints
  getProducts: async (params?: ProductParams) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }

    const res = await fetch(`${API_URL}/api/products?${queryParams}`)
    if (!res.ok) throw new Error('Failed to fetch products')
    return res.json()
  },

  getProduct: async (id: string) => {
    const res = await fetch(`${API_URL}/api/products/${id}`)
    if (!res.ok) throw new Error('Product not found')
    return res.json()
  },

  createProduct: async (data: any, token: string) => {
    const res = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to create product')
    return res.json()
  },

  updateProduct: async (id: string, data: any, token: string) => {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to update product')
    return res.json()
  },

  deleteProduct: async (id: string, token: string) => {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to delete product')
    return res.json()
  },

  // Order endpoints
  createOrder: async (data: OrderData, token: string) => {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to create order')
    return res.json()
  },

  getOrders: async (token: string) => {
    const res = await fetch(`${API_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch orders')
    return res.json()
  },

  getOrder: async (orderId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Order not found')
    return res.json()
  },

  // Cart endpoints
  getCart: async (token: string) => {
    const res = await fetch(`${API_URL}/api/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to fetch cart')
    return res.json()
  },

  addToCart: async (productId: string, quantity: number, token: string) => {
    const res = await fetch(`${API_URL}/api/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity })
    })
    if (!res.ok) throw new Error('Failed to add to cart')
    return res.json()
  },

  updateCartItem: async (productId: string, quantity: number, token: string) => {
    const res = await fetch(`${API_URL}/api/cart/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity })
    })
    if (!res.ok) throw new Error('Failed to update cart')
    return res.json()
  },

  removeFromCart: async (productId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/cart/remove/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to remove from cart')
    return res.json()
  },

  clearCart: async (token: string) => {
    const res = await fetch(`${API_URL}/api/cart/clear`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to clear cart')
    return res.json()
  }
}