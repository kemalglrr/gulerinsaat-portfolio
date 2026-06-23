'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  const navItems = [
    { label: 'Hakkımızda', id: 'hakkimizda' },
    { label: 'Projeler', id: 'projeler' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-xl border-b border-gray-200 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button 
            onClick={() => scrollToSection('hero')}
            className="flex items-center hover:opacity-80 transition-opacity duration-200 py-2"
          >
            <Image
              src="/logo.png"
              alt="Güler Yapı Proje Logo"
              width={64}
              height={64}
              className="object-contain h-16 w-auto"
            />
          </button>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-6 py-2 text-gray-600 hover:text-orange-500 rounded-lg font-medium transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('iletisim')}
              className="ml-2 px-6 py-2.5 text-gray-600 hover:text-orange-500 font-semibold transition-all duration-200"
            >
              Teklif Alın
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-4 py-3 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg font-medium transition-all"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('iletisim')}
              className="block w-full text-left px-4 py-3 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg font-semibold transition-all"
            >
              Teklif Alın
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

