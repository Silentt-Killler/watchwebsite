// app/components/tracking/GTMScript.tsx
'use client'

import Script from 'next/script'

export default function GTMScript() {
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ''

  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
    </>
  )
}

// app/components/tracking/GTMNoscript.tsx
export function GTMNoscript() {
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || ''

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}

// app/layout.tsx - Updated with GTM
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import TopBar from '@/components/layout/TopBar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import GTMScript from '@/components/tracking/GTMScript'
import { GTMNoscript } from '@/components/tracking/GTMNoscript'
import { TrackingProvider } from '@/contexts/TrackingContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Timora - Premium Watch Collection',
  description: 'Discover our exclusive collection of premium watches with COD available, free shipping, and 2 years warranty.',
  keywords: 'watches, premium watches, luxury watches, men watches, women watches, couple watches',
  authors: [{ name: 'Timora' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <GTMScript />
      </head>
      <body className="min-h-screen bg-black text-white" suppressHydrationWarning>
        <GTMNoscript />
        <AuthProvider>
          <CartProvider>
            <TrackingProvider>
              <TopBar />
              <Navbar />
              <main>{children}</main>
              <Footer />
            </TrackingProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

// contexts/TrackingContext.tsx
'use client'

import { createContext, useContext, useEffect } from 'react'
import { trackingEvents, trackCheckoutWithServerSide } from '@/utils/tracking'
import { usePathname } from 'next/navigation'

interface TrackingContextType {
  trackEvent: (eventName: string, data?: any) => void
  trackPageView: (pagePath?: string, pageTitle?: string) => void
  trackEcommerce: (eventType: string, data: any) => void
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined)

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Track page views on route change
  useEffect(() => {
    trackingEvents.pageView(pathname, document.title)
  }, [pathname])

  const trackEvent = (eventName: string, data?: any) => {
    trackingEvents.customEvent(eventName, data)
  }

  const trackPageView = (pagePath?: string, pageTitle?: string) => {
    trackingEvents.pageView(
      pagePath || window.location.pathname,
      pageTitle || document.title
    )
  }

  const trackEcommerce = (eventType: string, data: any) => {
    switch (eventType) {
      case 'view_item':
        trackingEvents.viewItem(data)
        break
      case 'add_to_cart':
        trackingEvents.addToCart(data.product, data.quantity)
        break
      case 'begin_checkout':
        trackingEvents.beginCheckout(data.items, data.total)
        break
      case 'purchase':
        trackingEvents.purchase(data)
        break
      case 'search':
        trackingEvents.search(data.searchTerm)
        break
      default:
        trackingEvents.customEvent(eventType, data)
    }
  }

  return (
    <TrackingContext.Provider value={{ trackEvent, trackPageView, trackEcommerce }}>
      {children}
    </TrackingContext.Provider>
  )
}

export const useTracking = () => {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider')
  }
  return context
}

// Enhanced Product Page with Tracking
// app/products/[id]/page.tsx (Updated with tracking)
'use client'

import { useEffect } from 'react'
import { useTracking } from '@/contexts/TrackingContext'

export default function ProductPage({ params }: { params: { id: string } }) {
  const { trackEcommerce } = useTracking()
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    if (product) {
      // Track product view
      trackEcommerce('view_item', {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        brand: product.brand
      })
    }
  }, [product])

  const handleAddToCart = () => {
    // Add to cart logic
    addToCart(product)

    // Track add to cart
    trackEcommerce('add_to_cart', {
      product: product,
      quantity: quantity
    })
  }

  // Rest of your component...
}

// Enhanced Checkout with Complete Tracking
// app/checkout/page.tsx (Updated section)
import { useTracking } from '@/contexts/TrackingContext'

export default function CheckoutPage() {
  const { trackEcommerce } = useTracking()

  // Track checkout begin
  useEffect(() => {
    if (cartItems.length > 0) {
      trackEcommerce('begin_checkout', {
        items: cartItems,
        total: subtotal + deliveryCharge
      })
    }
  }, [cartItems])

  const processOrder = async () => {
    setLoading(true)

    try {
      const orderData = {
        // ... your order data
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const data = await response.json()

        // Track purchase
        trackEcommerce('purchase', {
          order_id: data.order_id,
          total_amount: orderData.total_amount,
          delivery_charge: orderData.delivery_charge,
          items: cartItems
        })

        localStorage.removeItem('cart')

        // Redirect logic...
      }
    } catch (error) {
      console.error('Order failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Rest of your component...
}

// GTM Variables & Triggers Configuration (JSON)
// Save this as gtm-config.json and import to GTM
const gtmConfiguration = {
  "containerVersion": {
    "tag": [
      {
        "name": "GA4 Configuration",
        "tagId": "1",
        "type": "gaawc",
        "parameter": [
          {
            "key": "measurementId",
            "value": "{{GA4 Measurement ID}}"
          },
          {
            "key": "sendPageView",
            "value": "true"
          }
        ]
      },
      {
        "name": "Facebook Pixel",
        "tagId": "2",
        "type": "html",
        "parameter": [
          {
            "key": "html",
            "value": "<script>\n!function(f,b,e,v,n,t,s)\n{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\nif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\nn.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];\ns.parentNode.insertBefore(t,s)}(window, document,'script',\n'https://connect.facebook.net/en_US/fbevents.js');\nfbq('init', '{{FB Pixel ID}}');\nfbq('track', 'PageView');\n</script>"
          }
        ]
      },
      {
        "name": "GA4 Purchase Event",
        "tagId": "3",
        "type": "gaawe",
        "parameter": [
          {
            "key": "eventName",
            "value": "purchase"
          },
          {
            "key": "measurementId",
            "value": "{{GA4 Measurement ID}}"
          },
          {
            "key": "eventParameters",
            "list": [
              {
                "map": [
                  {"key": "name", "value": "transaction_id"},
                  {"key": "value", "value": "{{DLV - Transaction ID}}"}
                ]
              },
              {
                "map": [
                  {"key": "name", "value": "value"},
                  {"key": "value", "value": "{{DLV - Order Value}}"}
                ]
              },
              {
                "map": [
                  {"key": "name", "value": "currency"},
                  {"key": "value", "value": "BDT"}
                ]
              },
              {
                "map": [
                  {"key": "name", "value": "items"},
                  {"key": "value", "value": "{{DLV - Items}}"}
                ]
              }
            ]
          }
        ],
        "trigger": [{"triggerId": "purchase_trigger"}]
      }
    ],
    "trigger": [
      {
        "name": "All Pages",
        "triggerId": "all_pages",
        "type": "pageview"
      },
      {
        "name": "Purchase Event",
        "triggerId": "purchase_trigger",
        "type": "customEvent",
        "customEventFilter": [
          {
            "type": "equals",
            "parameter": [
              {"key": "arg0", "value": "{{_event}}"},
              {"key": "arg1", "value": "purchase"}
            ]
          }
        ]
      }
    ],
    "variable": [
      {
        "name": "GA4 Measurement ID",
        "variableId": "1",
        "type": "c",
        "parameter": [
          {"key": "value", "value": "G-XXXXXXXXXX"}
        ]
      },
      {
        "name": "FB Pixel ID",
        "variableId": "2",
        "type": "c",
        "parameter": [
          {"key": "value", "value": "YOUR_PIXEL_ID"}
        ]
      },
      {
        "name": "DLV - Transaction ID",
        "variableId": "3",
        "type": "dlv",
        "parameter": [
          {"key": "dataLayerVersion", "value": "2"},
          {"key": "name", "value": "ecommerce.transaction_id"}
        ]
      },
      {
        "name": "DLV - Order Value",
        "variableId": "4",
        "type": "dlv",
        "parameter": [
          {"key": "dataLayerVersion", "value": "2"},
          {"key": "name", "value": "ecommerce.value"}
        ]
      },
      {
        "name": "DLV - Items",
        "variableId": "5",
        "type": "dlv",
        "parameter": [
          {"key": "dataLayerVersion", "value": "2"},
          {"key": "name", "value": "ecommerce.items"}
        ]
      }
    ]
  }
}

export default gtmConfiguration