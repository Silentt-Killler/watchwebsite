// app/checkout/page.tsx
'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  category?: string
  brand?: string
}

interface FormData {
  fullName: string
  mobile: string
  email: string
  addressLine1: string
  addressLine2: string
  city: string
  postalCode: string
  note: string
  paymentMethod: 'bkash' | 'nagad' | 'upay'
  paymentOption: 'advance' | 'full'
}

interface FormErrors {
  fullName?: string
  mobile?: string
  email?: string
  addressLine1?: string
  city?: string
}

const CITIES = [
  { name: 'Dhaka', isInsideDhaka: true },
  { name: 'Gazipur', isInsideDhaka: false },
  { name: 'Narayanganj', isInsideDhaka: false },
  { name: 'Chittagong', isInsideDhaka: false },
  { name: 'Sylhet', isInsideDhaka: false },
  { name: 'Rajshahi', isInsideDhaka: false },
  { name: 'Khulna', isInsideDhaka: false },
  { name: 'Barisal', isInsideDhaka: false },
  { name: 'Rangpur', isInsideDhaka: false },
  { name: 'Mymensingh', isInsideDhaka: false },
  { name: 'Comilla', isInsideDhaka: false }
]

export default function CheckoutPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState<number>(0)
  const [deliveryCharge, setDeliveryCharge] = useState<number>(60)

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Dhaka',
    postalCode: '',
    note: '',
    paymentMethod: 'bkash',
    paymentOption: 'advance'
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Load cart data on mount
  useEffect(() => {
    loadCartData()
  }, [])

  const loadCartData = (): void => {
    try {
      const storedCart = localStorage.getItem('cart')
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart)
        const cartArray = Array.isArray(parsedCart) ? parsedCart : []

        if (cartArray.length === 0) {
          alert('Your cart is empty!')
          router.push('/')
          return
        }

        setCartItems(cartArray)

        const total = cartArray.reduce((sum: number, item: CartItem) => {
          return sum + (item.price * item.quantity)
        }, 0)

        setSubtotal(total)
      } else {
        alert('Your cart is empty!')
        router.push('/')
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      alert('Error loading cart data')
      router.push('/')
    }
  }

  // Update delivery charge based on city
  useEffect(() => {
    const selectedCity = CITIES.find(c => c.name === formData.city)
    setDeliveryCharge(selectedCity?.isInsideDhaka ? 60 : 120)
  }, [formData.city])

  const validateAddress = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required'
    }
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required'
    } else if (!/^01[3-9]\d{8}$/.test(formData.mobile)) {
      newErrors.mobile = 'Invalid Bangladesh mobile number'
    }
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.addressLine1) {
      newErrors.addressLine1 = 'Address is required'
    }
    if (!formData.city) {
      newErrors.city = 'City is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = (): void => {
    if (currentStep === 1) {
      if (validateAddress()) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      processOrder()
    }
  }

  const handlePrevStep = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const processOrder = async (): Promise<void> => {
    setLoading(true)

    try {
      let paymentAmount = 0
      if (formData.paymentOption === 'full') {
        paymentAmount = subtotal + deliveryCharge
      } else {
        paymentAmount = Math.max(200, Math.floor(subtotal * 0.2))
      }

      const orderData = {
        items: cartItems,
        shipping_address: {
          full_name: formData.fullName,
          phone: formData.mobile,
          email: formData.email,
          address_line1: formData.addressLine1,
          address_line2: formData.addressLine2,
          city: formData.city,
          postal_code: formData.postalCode,
        },
        delivery_charge: deliveryCharge,
        payment_method: formData.paymentMethod,
        payment_option: formData.paymentOption,
        payment_amount: paymentAmount,
        subtotal: subtotal,
        total_amount: subtotal + deliveryCharge,
        note: formData.note
      }

      console.log('Order data:', orderData)

      // API call would go here
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.removeItem('cart')
        window.dispatchEvent(new Event('cartUpdated'))
        router.push(`/payment/${data.order_id}`)
      } else {
        alert('Failed to create order. Please try again.')
      }
    } catch (error) {
      console.error('Order failed:', error)
      alert('Failed to create order. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const getPaymentAmount = (): number => {
    if (formData.paymentOption === 'full') {
      return subtotal + deliveryCharge
    }
    return Math.max(200, Math.floor(subtotal * 0.2))
  }

  if (cartItems.length === 0 && subtotal === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading cart data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-white text-black' : 'bg-gray-700'
              }`}>
                1
              </div>
              <span className="ml-2">Address</span>
            </div>

            <div className={`w-32 h-0.5 ${
              currentStep >= 2 ? 'bg-white' : 'bg-gray-700'
            }`} />

            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-white text-black' : 'bg-gray-700'
              }`}>
                2
              </div>
              <span className="ml-2">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-2xl font-light mb-6">Shipping Address</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-black border ${
                        errors.fullName ? 'border-red-500' : 'border-gray-700'
                      } rounded-lg focus:border-white outline-none`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Mobile Number *</label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-black border ${
                          errors.mobile ? 'border-red-500' : 'border-gray-700'
                        } rounded-lg focus:border-white outline-none`}
                        placeholder="01XXXXXXXXX"
                      />
                      {errors.mobile && (
                        <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-black border ${
                          errors.email ? 'border-red-500' : 'border-gray-700'
                        } rounded-lg focus:border-white outline-none`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Full Address *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-black border ${
                        errors.addressLine1 ? 'border-red-500' : 'border-gray-700'
                      } rounded-lg focus:border-white outline-none`}
                      placeholder="House no, Road no, Area"
                    />
                    {errors.addressLine1 && (
                      <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">City *</label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:border-white outline-none"
                      >
                        {CITIES.map(city => (
                          <option key={city.name} value={city.name}>
                            {city.name} ({city.isInsideDhaka ? '৳60' : '৳120'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:border-white outline-none"
                        placeholder="1234"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Note (Optional)</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:border-white outline-none"
                      placeholder="Any special instructions..."
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-black rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Delivery Charge</span>
                    <span className="font-medium">৳ {deliveryCharge}</span>
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full mt-6 bg-white hover:bg-gray-200 text-black py-4 rounded-lg font-medium"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-2xl font-light mb-6">Payment Method</h2>

                <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                  <p className="text-sm">
                    <strong>গুরুত্বপূর্ণ:</strong> অর্ডার কনফার্ম করার জন্য মিনিমাম ২০০ টাকা এডভ্যান্স অথবা ফুল পেমেন্ট করতে হবে।
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg mb-4">Payment Option</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 bg-black border border-gray-700 rounded-lg cursor-pointer hover:border-white">
                      <input
                        type="radio"
                        name="paymentOption"
                        value="advance"
                        checked={formData.paymentOption === 'advance'}
                        onChange={handleInputChange}
                        className="w-5 h-5"
                      />
                      <div className="ml-4">
                        <p className="font-medium">Advance Payment</p>
                        <p className="text-sm text-gray-400">Pay ৳{getPaymentAmount()} now, rest on delivery</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 bg-black border border-gray-700 rounded-lg cursor-pointer hover:border-white">
                      <input
                        type="radio"
                        name="paymentOption"
                        value="full"
                        checked={formData.paymentOption === 'full'}
                        onChange={handleInputChange}
                        className="w-5 h-5"
                      />
                      <div className="ml-4">
                        <p className="font-medium">Full Payment</p>
                        <p className="text-sm text-gray-400">Pay ৳{subtotal + deliveryCharge} now</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg mb-4">Select Payment Method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 bg-black border border-gray-700 rounded-lg cursor-pointer hover:border-white">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bkash"
                        checked={formData.paymentMethod === 'bkash'}
                        onChange={handleInputChange}
                        className="w-5 h-5"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-medium">bKash</p>
                        <p className="text-sm text-gray-400">Pay with bKash</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 bg-black border border-gray-700 rounded-lg cursor-pointer hover:border-white">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="nagad"
                        checked={formData.paymentMethod === 'nagad'}
                        onChange={handleInputChange}
                        className="w-5 h-5"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-medium">Nagad</p>
                        <p className="text-sm text-gray-400">Pay with Nagad</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 bg-black border border-gray-700 rounded-lg cursor-pointer hover:border-white">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upay"
                        checked={formData.paymentMethod === 'upay'}
                        onChange={handleInputChange}
                        className="w-5 h-5"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-medium">Upay</p>
                        <p className="text-sm text-gray-400">Pay with Upay</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-black rounded-lg">
                  <h4 className="text-sm text-gray-400 mb-2">Payment Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Product Total</span>
                      <span>৳ {subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Charge</span>
                      <span>৳ {deliveryCharge}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-800">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount</span>
                        <span>৳ {subtotal + deliveryCharge}</span>
                      </div>
                      <div className="flex justify-between text-green-500 mt-2">
                        <span>Pay Now</span>
                        <span className="font-bold">৳ {getPaymentAmount()}</span>
                      </div>
                      {formData.paymentOption === 'advance' && (
                        <div className="flex justify-between text-gray-400 text-sm mt-1">
                          <span>Due on Delivery</span>
                          <span>৳ {(subtotal + deliveryCharge) - getPaymentAmount()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 border border-gray-700 hover:border-gray-600 text-white py-4 rounded-lg font-medium"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={loading}
                    className="flex-1 bg-white hover:bg-gray-200 text-black py-4 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Complete Payment'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 sticky top-4">
              <h3 className="text-xl font-light mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 pb-3 border-b border-gray-800">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm">৳ {item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 py-4 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span>৳ {subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery</span>
                  <span>৳ {deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-800">
                  <span>Total</span>
                  <span>৳ {subtotal + deliveryCharge}</span>
                </div>

                {currentStep === 2 && (
                  <div className="pt-2 mt-2 border-t border-gray-800">
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Pay Now</span>
                      <span className="font-bold">৳ {getPaymentAmount()}</span>
                    </div>
                    {formData.paymentOption === 'advance' && (
                      <div className="flex justify-between text-sm text-gray-400 mt-1">
                        <span>Due on Delivery</span>
                        <span>৳ {(subtotal + deliveryCharge) - getPaymentAmount()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-black rounded-lg text-center">
                <p className="text-xs text-gray-400">🔒 Secure Checkout</p>
                <p className="text-xs text-gray-500 mt-1">Your information is safe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}