const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface RegisterData {
  full_name: string
  email: string
  phone: string
  password: string
  confirm_password: string
}

interface LoginData {
  email_or_phone: string
  password: string
}

export const authAPI = {
  register: async (data: RegisterData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.detail || 'Registration failed')
    return result
  },

  login: async (data: LoginData) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.detail || 'Login failed')

    if (result.access_token) {
      localStorage.setItem('token', result.access_token)
    }
    return result
  },

  logout: () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
}