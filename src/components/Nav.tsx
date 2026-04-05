'use client'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Logo from './Logo'

const navLinks = [
  { href: '/documents', label: 'Agreements' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/portal', label: 'Client Portal' },
  { href: '/lawyer-portal', label: 'Lawyer Portal' },
]

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMobileMenu = useCallback(() => setIsOpen(false), [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
            : 'bg-white border-b border-neutral-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-[68px]">

            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Logo size="default" />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[12px] lg:text-[13px] uppercase tracking-[0.1em] lg:tracking-[0.12em] transition-colors duration-200 font-semibold whitespace-nowrap relative ${
                    isActive(link.href)
                      ? 'text-[#be123c]'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-[#be123c] rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block flex-shrink-0">
              <Link
                href="/documents"
                className="inline-block bg-[#be123c] hover:bg-[#9f1239] text-white text-[12px] font-medium uppercase tracking-[0.06em] px-5 py-2.5 rounded-sm transition-all duration-200 hover:shadow-[0_2px_8px_rgba(190,18,60,0.25)]"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 -mr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#be123c] focus-visible:ring-offset-2 rounded-sm"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              <div className="w-5 flex flex-col gap-[5px]">
                <span
                  className={`block h-[1.5px] bg-neutral-800 transition-all duration-300 ease-in-out origin-center ${
                    isOpen ? 'rotate-45 translate-y-[6.5px]' : ''
                  }`}
                />
                <span
                  className={`block h-[1.5px] bg-neutral-800 transition-all duration-200 ease-in-out ${
                    isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                  }`}
                />
                <span
                  className={`block h-[1.5px] bg-neutral-800 transition-all duration-300 ease-in-out origin-center ${
                    isOpen ? '-rotate-45 -translate-y-[6.5px]' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu — slides down from nav */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? 'max-h-[calc(100vh-68px)] opacity-100 visible'
              : 'max-h-0 opacity-0 invisible'
          } overflow-y-auto bg-white border-t border-neutral-100`}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block text-[15px] uppercase tracking-[0.06em] transition-colors duration-200 font-medium py-3.5 px-2 border-b border-neutral-50 last:border-b-0 ${
                    isActive(link.href)
                      ? 'text-[#be123c]'
                      : 'text-neutral-600 hover:text-[#be123c]'
                  }`}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pb-6 pt-2">
              <Link
                href="/documents"
                className="block bg-[#be123c] hover:bg-[#9f1239] text-white text-[15px] font-medium uppercase tracking-[0.06em] px-6 py-3.5 text-center rounded-sm transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop overlay when mobile menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  )
}
