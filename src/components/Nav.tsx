'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const navLinks = [
  { href: '/documents', label: 'Agreements' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/portal', label: 'Client Portal' },
]

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#e5e5e5]'
          : 'bg-white border-b border-[#f0f0ee]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-[68px]">

          {/* Wordmark */}
          <Link href="/" className="flex items-center">
            <span className="font-serif text-[19px] font-semibold text-[#1A1A1A] tracking-[-0.01em]">
              Ruby Law
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] lg:text-[14px] uppercase tracking-[0.08em] text-neutral-500 hover:text-[#be123c] transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/documents"
              className="inline-block bg-[#be123c] hover:bg-[#9f1239] text-white text-[15px] font-medium uppercase tracking-[0.06em] px-6 py-2.5 transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 -mr-2 focus:outline-none"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="w-5 flex flex-col gap-[5px]">
              <span
                className={`block h-[1.5px] bg-[#1A1A1A] transition-all duration-300 origin-center ${
                  isOpen ? 'rotate-45 translate-y-[6.5px]' : ''
                }`}
              />
              <span
                className={`block h-[1.5px] bg-[#1A1A1A] transition-all duration-200 ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`block h-[1.5px] bg-[#1A1A1A] transition-all duration-300 origin-center ${
                  isOpen ? '-rotate-45 -translate-y-[6.5px]' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-[#f0f0ee] pt-5 pb-6">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[14px] uppercase tracking-[0.06em] text-neutral-500 hover:text-[#be123c] transition-colors duration-200 font-medium py-3 px-1"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Link
              href="/documents"
              className="block mt-5 bg-[#be123c] hover:bg-[#9f1239] text-white text-[15px] font-medium uppercase tracking-[0.06em] px-6 py-3 text-center transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
