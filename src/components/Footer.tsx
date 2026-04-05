import Link from 'next/link'
import Logo from './Logo'

const footerColumns = [
  {
    heading: 'Services',
    links: [
      { href: '/documents', label: 'Agreements' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/documents', label: 'Get Started', key: 'get-started' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: 'mailto:hello@rubylegal.ai?subject=Privacy%20Policy', label: 'Privacy Policy' },
      { href: 'mailto:hello@rubylegal.ai?subject=Terms%20of%20Service', label: 'Terms of Service' },
    ],
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#FAFAF8] border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Main Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10 md:gap-8 pt-14 pb-12 md:pt-16 md:pb-14">

          {/* Brand Column — full width on mobile, sits above link columns */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-5">
            <Link href="/" className="inline-block">
              <Logo size="default" />
            </Link>
            <p className="mt-4 text-[14px] leading-[1.65] text-neutral-500 max-w-xs">
              AI-powered legal documents for Canadian companies. Lawyer-engineered agreements, delivered in minutes.
            </p>
          </div>

          {/* Link Columns — 2-column grid on small mobile, then 3 across on md+ */}
          {footerColumns.map((col) => (
            <div key={col.heading} className="col-span-1 md:col-span-2 lg:col-span-2">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-4 md:mb-5">
                {col.heading}
              </h3>
              <ul className="space-y-2.5 md:space-y-3">
                {col.links.map((link) => (
                  <li key={'key' in link ? (link as { key: string }).key : link.href}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-neutral-600 hover:text-[#be123c] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Row */}
        <div className="border-t border-neutral-200 py-8 md:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-2">
                Contact
              </h3>
              <a
                href="mailto:hello@rubylegal.ai"
                className="text-[14px] text-neutral-600 hover:text-[#be123c] transition-colors duration-200"
              >
                hello@rubylegal.ai
              </a>
            </div>
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-2">
                Location
              </h3>
              <p className="text-[14px] text-neutral-600">Serving companies across Canada</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-200 py-6 md:py-8">
          <p className="text-[13px] text-neutral-400 text-center">
            &copy; {currentYear} Ruby Law Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
