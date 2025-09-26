// utils/tracking.ts
// Google Tag Manager & Facebook Pixel Tracking Setup

interface TrackingEvent {
  event: string
  ecommerce?: any
  value?: number
  currency?: string
  [key: string]: any
}

// Google Tag Manager Data Layer Push
export const pushToDataLayer = (data: TrackingEvent) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data)
  }
}

// Facebook Pixel Events
export const trackFacebookEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters)
  }
}

// Google Analytics 4 Events
export const trackGA4Event = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters)
  }
}

// Ecommerce Tracking Events
export const trackingEvents = {
  // Page View
  pageView: (pagePath: string, pageTitle: string) => {
    pushToDataLayer({
      event: 'page_view',
      page_path: pagePath,
      page_title: pageTitle
    })

    trackFacebookEvent('PageView')
  },

  // View Item (Product Page)
  viewItem: (product: any) => {
    const eventData = {
      event: 'view_item',
      ecommerce: {
        currency: 'BDT',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          item_category: product.category,
          item_brand: product.brand,
          quantity: 1
        }]
      }
    }

    pushToDataLayer(eventData)

    trackFacebookEvent('ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_category: product.category,
      content_type: 'product',
      value: product.price,
      currency: 'BDT'
    })

    trackGA4Event('view_item', eventData.ecommerce)
  },

  // Add to Cart
  addToCart: (product: any, quantity: number = 1) => {
    const eventData = {
      event: 'add_to_cart',
      ecommerce: {
        currency: 'BDT',
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          item_category: product.category,
          item_brand: product.brand,
          quantity: quantity
        }]
      }
    }

    pushToDataLayer(eventData)

    trackFacebookEvent('AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price * quantity,
      currency: 'BDT'
    })

    trackGA4Event('add_to_cart', eventData.ecommerce)
  },

  // Begin Checkout
  beginCheckout: (cartItems: any[], totalValue: number) => {
    const items = cartItems.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      item_category: item.category,
      item_brand: item.brand,
      quantity: item.quantity
    }))

    const eventData = {
      event: 'begin_checkout',
      ecommerce: {
        currency: 'BDT',
        value: totalValue,
        items: items
      }
    }

    pushToDataLayer(eventData)

    trackFacebookEvent('InitiateCheckout', {
      content_ids: cartItems.map(item => item.id),
      contents: cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity
      })),
      num_items: cartItems.length,
      value: totalValue,
      currency: 'BDT'
    })

    trackGA4Event('begin_checkout', eventData.ecommerce)
  },

  // Add Shipping Info
  addShippingInfo: (cartItems: any[], totalValue: number, shippingTier: string) => {
    const eventData = {
      event: 'add_shipping_info',
      ecommerce: {
        currency: 'BDT',
        value: totalValue,
        shipping_tier: shippingTier,
        items: cartItems.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      }
    }

    pushToDataLayer(eventData)
    trackGA4Event('add_shipping_info', eventData.ecommerce)
  },

  // Add Payment Info
  addPaymentInfo: (cartItems: any[], totalValue: number, paymentMethod: string) => {
    const eventData = {
      event: 'add_payment_info',
      ecommerce: {
        currency: 'BDT',
        value: totalValue,
        payment_type: paymentMethod,
        items: cartItems.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      }
    }

    pushToDataLayer(eventData)
    trackGA4Event('add_payment_info', eventData.ecommerce)
  },

  // Purchase
  purchase: (orderData: any) => {
    const eventData = {
      event: 'purchase',
      ecommerce: {
        transaction_id: orderData.order_id,
        value: orderData.total_amount,
        tax: 0,
        shipping: orderData.delivery_charge,
        currency: 'BDT',
        items: orderData.items.map((item: any) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_category: item.category,
          item_brand: item.brand,
          quantity: item.quantity
        }))
      }
    }

    pushToDataLayer(eventData)

    trackFacebookEvent('Purchase', {
      content_ids: orderData.items.map((item: any) => item.id),
      contents: orderData.items.map((item: any) => ({
        id: item.id,
        quantity: item.quantity
      })),
      num_items: orderData.items.length,
      value: orderData.total_amount,
      currency: 'BDT'
    })

    trackGA4Event('purchase', eventData.ecommerce)
  },

  // Search
  search: (searchTerm: string) => {
    const eventData = {
      event: 'search',
      search_term: searchTerm
    }

    pushToDataLayer(eventData)

    trackFacebookEvent('Search', {
      search_string: searchTerm
    })

    trackGA4Event('search', {
      search_term: searchTerm
    })
  },

  // View Cart
  viewCart: (cartItems: any[], totalValue: number) => {
    const eventData = {
      event: 'view_cart',
      ecommerce: {
        currency: 'BDT',
        value: totalValue,
        items: cartItems.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      }
    }

    pushToDataLayer(eventData)
    trackGA4Event('view_cart', eventData.ecommerce)
  },

  // Custom Events for Remarketing
  customEvent: (eventName: string, parameters: any) => {
    pushToDataLayer({
      event: eventName,
      ...parameters
    })

    if (window.fbq) {
      window.fbq('trackCustom', eventName, parameters)
    }
  }
}

// Server Side Tracking API Calls
export const serverSideTracking = {
  // Facebook Conversions API
  sendToFacebookCAPI: async (eventData: any) => {
    try {
      const response = await fetch('/api/tracking/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [{
            event_name: eventData.event_name,
            event_time: Math.floor(Date.now() / 1000),
            user_data: {
              client_ip_address: eventData.ip_address,
              client_user_agent: eventData.user_agent,
              fbc: eventData.fbc, // Facebook Click ID from cookie
              fbp: eventData.fbp, // Facebook Pixel ID from cookie
              email_hash: eventData.email_hash,
              phone_hash: eventData.phone_hash,
            },
            custom_data: eventData.custom_data,
            action_source: 'website',
            event_source_url: eventData.source_url,
          }]
        })
      })

      return response.json()
    } catch (error) {
      console.error('Facebook CAPI Error:', error)
    }
  },

  // Google Analytics Measurement Protocol
  sendToGoogleMP: async (eventData: any) => {
    try {
      const response = await fetch('/api/tracking/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: eventData.client_id,
          events: [{
            name: eventData.event_name,
            params: eventData.parameters
          }]
        })
      })

      return response.json()
    } catch (error) {
      console.error('Google MP Error:', error)
    }
  }
}

// Initialize Tracking (Add to _app.tsx or layout.tsx)
export const initializeTracking = () => {
  // Google Tag Manager
  const gtmScript = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-XXXXXX');
  `

  // Facebook Pixel
  const fbPixelScript = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'YOUR_PIXEL_ID');
  `

  return { gtmScript, fbPixelScript }
}

// Helper Functions
export const hashUserData = (data: string): string => {
  // Use SHA-256 hashing for user data (email, phone)
  // Implementation depends on your crypto library
  return data.toLowerCase().trim()
}

export const getCookieValue = (name: string): string | null => {
  if (typeof window === 'undefined') return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }

  return null
}

// Enhanced Checkout Tracking with Server Side
export const trackCheckoutWithServerSide = async (
  step: number,
  formData: any,
  cartItems: any[],
  totalValue: number
) => {
  // Client Side Tracking
  if (step === 1) {
    trackingEvents.beginCheckout(cartItems, totalValue)
  } else if (step === 2) {
    trackingEvents.addShippingInfo(
      cartItems,
      totalValue,
      formData.deliveryOption
    )
    trackingEvents.addPaymentInfo(
      cartItems,
      totalValue,
      formData.paymentMethod
    )
  } else if (step === 3) {
    trackingEvents.purchase({
      order_id: formData.order_id,
      total_amount: totalValue,
      delivery_charge: formData.delivery_charge,
      items: cartItems
    })
  }

  // Server Side Tracking
  const serverData = {
    event_name: step === 3 ? 'Purchase' : 'InitiateCheckout',
    ip_address: '', // Get from request headers in API
    user_agent: navigator.userAgent,
    fbc: getCookieValue('_fbc'),
    fbp: getCookieValue('_fbp'),
    email_hash: hashUserData(formData.email || ''),
    phone_hash: hashUserData(formData.mobile || ''),
    source_url: window.location.href,
    custom_data: {
      value: totalValue,
      currency: 'BDT',
      content_ids: cartItems.map(item => item.id),
      num_items: cartItems.length
    }
  }

  // Send to server-side endpoints
  await serverSideTracking.sendToFacebookCAPI(serverData)
  await serverSideTracking.sendToGoogleMP({
    client_id: getCookieValue('_ga')?.replace('GA1.1.', '') || '',
    event_name: step === 3 ? 'purchase' : 'begin_checkout',
    parameters: {
      value: totalValue,
      currency: 'BDT',
      items: cartItems
    }
  })
}

// Export types for TypeScript
export interface WindowWithDataLayer extends Window {
  dataLayer: any[]
  gtag: (...args: any[]) => void
  fbq: (...args: any[]) => void
}

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
    fbq: (...args: any[]) => void
  }
}