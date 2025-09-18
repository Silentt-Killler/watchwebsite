const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const getToken = () => localStorage.getItem('token')

interface ProductFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
}

interface ProductData {
  name: string
  description: string
  price: number
  original_price?: number
  category: string
  brand: string
  stock: number
  images: string[]
  model?: string
  movement?: string
  case_size?: string
  water_resistance?: string
  warranty?: string
  is_featured: boolean
  is_active: boolean
}

export const productAPI = {
  // Get all products
  getProducts: async (filters?: ProductFilters) => {
    const params = new URLSearchParams(filters as Record<string, string>)
    const res = await fetch(`${API_URL}/products?${params}`)
    if (!res.ok) throw new Error('Failed to fetch products')
    return res.json()
  },

  // Get single product
  getProduct: async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}`)
    if (!res.ok) throw new Error('Product not found')
    return res.json()
  },

  // Admin: Create product
  createProduct: async (data: ProductData) => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to create product')
    return res.json()
  },

  // Admin: Update product
  updateProduct: async (id: string, data: Partial<ProductData>) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('Failed to update product')
    return res.json()
  },

  // Admin: Delete product
  deleteProduct: async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    if (!res.ok) throw new Error('Failed to delete product')
    return res.json()
  }
}