'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Youtube, Linkedin, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function Footer() {
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({})

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      {/* Desktop Footer */}
      <div className="hidden md:block container-custom py-16">
        <div className="grid grid-cols-4 gap-8">
          {/* Logo & Social Section */}
          <div className="col-span-1">
            <div className="mb-6">
              <Image 
                src="/images/logo.png" 
                alt="Timora" 
                width={120} 
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <div className="flex gap-3">
              <Link href="https://facebook.com" target="_blank" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="https://instagram.com" target="_blank" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="https://youtube.com" target="_blank" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
              <Link href="https://linkedin.com" target="_blank" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* About Us Section */}
          <div className="col-span-1">
            <h3 className="text-xl font-light mb-4">About Us</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Trade License Number: TRD/DNCC/</p>
              <p>DBID Number: 123456</p>
              <p className="mt-4">TIMORA is a premium and Luxury watch shop.</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="col-span-1">
            <h3 className="text-xl font-light mb-4">Contact Us</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Mail: info@timora.com</p>
              <p>Hotline: (+88) 0123456789</p>
              <p>Address: Bangla Motor, Dhaka</p>
            </div>
          </div>

          {/* Policies Section */}
          <div className="col-span-1">
            <h3 className="text-xl font-light mb-4">Policies</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/order-policy" className="hover:text-white transition-colors">Order Policy</Link></li>
              <li><Link href="/payment-policy" className="hover:text-white transition-colors">Payment Policy</Link></li>
              <li><Link href="/warranty-policy" className="hover:text-white transition-colors">Warranty Policy</Link></li>
              <li><Link href="/delivery-policy" className="hover:text-white transition-colors">Delivery Policy</Link></li>
              <li><Link href="/exchange-policy" className="hover:text-white transition-colors">Exchange Policy</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>© 2024 TIMORA. All rights reserved.</p>
        </div>
      </div>

      {/* Mobile Footer - Accordion Version */}
      <div className="md:hidden">
        <div className="px-4 py-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image 
              src="/images/logo.png" 
              alt="Timora" 
              width={120} 
              height={40}
              className="h-10 w-auto mx-auto"
            />
          </div>

          {/* Accordion Sections */}
          <div className="space-y-4">
            {/* About Us Section */}
            <div className="border-b border-gray-800 pb-4">
              <button
                onClick={() => toggleSection('about')}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="text-lg font-light">ABOUT US</span>
                {openSections.about ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openSections.about && (
                <div className="mt-4 space-y-2 text-sm text-gray-300">
                  <p>Trade License: TRD/DNCC/</p>
                  <p>DBID Number: 123456</p>
                  <p className="mt-2">TIMORA is a premium and Luxury watch shop.</p>
                </div>
              )}
            </div>

            {/* Contact Section */}
            <div className="border-b border-gray-800 pb-4">
              <button
                onClick={() => toggleSection('contact')}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="text-lg font-light">CONTACT US</span>
                {openSections.contact ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openSections.contact && (
                <div className="mt-4 space-y-2 text-sm text-gray-300">
                  <p>Mail: info@timora.com</p>
                  <p>Hotline: (+88) 0123456789</p>
                  <p>Address: Bangla Motor, Dhaka</p>
                </div>
              )}
            </div>

            {/* Policies Section */}
            <div className="border-b border-gray-800 pb-4">
              <button
                onClick={() => toggleSection('policies')}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="text-lg font-light">POLICIES</span>
                {openSections.policies ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openSections.policies && (
                <div className="mt-4 space-y-2 text-sm text-gray-300">
                  <p><Link href="/order-policy" className="hover:text-white">Order Policy</Link></p>
                  <p><Link href="/payment-policy" className="hover:text-white">Payment Policy</Link></p>
                  <p><Link href="/warranty-policy" className="hover:text-white">Warranty Policy</Link></p>
                  <p><Link href="/delivery-policy" className="hover:text-white">Delivery Policy</Link></p>
                  <p><Link href="/exchange-policy" className="hover:text-white">Exchange Policy</Link></p>
                  <p><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></p>
                </div>
              )}
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-4 mt-8">
            <Link href="https://facebook.com" target="_blank" className="bg-white text-black p-3 rounded-full">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="bg-white text-black p-3 rounded-full">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="https://youtube.com" target="_blank" className="bg-white text-black p-3 rounded-full">
              <Youtube className="w-5 h-5" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="bg-white text-black p-3 rounded-full">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-4 border-t border-gray-800 text-center text-xs text-gray-400">
            <p>© 2024 TIMORA. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
