import Link from 'next/link'

const footerColumns = [
  {
    heading: 'Services',
    links: [
      { href: '/documents', label: 'Agreements' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/documents', label: 'Get Started' },
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
    <footer className="bg-[#F9F8F6] border-t border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pt-16 pb-14">

          {/* Brand Column */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link href="/" className="inline-block">
              <span className="font-serif text-[19px] font-semibold text-[#1A1A1A] tracking-[-0.01em]">
                Ruby Law
              </span>
            </Link>
            <p className="mt-4 text-[14px] leading-relaxed text-[#8A847D] max-w-xs">
              AI-powered legal documents for Canadian startups and founders. Professional-grade agreements, delivered in minutes.
            </p>
          </div>

          {/* Link Columns */}
          {footerColumns.map((col) => (
            <div key={col.heading} className="md:col-span-2 lg:col-span-2">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#A09A93] mb-5">
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13.5px] text-[#6B6560] hover:text-[#be123c] transition-colors duration-200"
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
        <div className="border-t border-[#e5e5e5] py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#A09A93] mb-2.5">
                Contact
              </h3>
              <p className="text-[13.5px] text-[#6B6560]">
                <a
                  href="mailto:hello@rubylegal.ai"
                  className="hover:text-[#be123c] transition-colors duration-200"
                >
                  hello@rubylegal.ai
                </a>
              </p>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#A09A93] mb-2.5">
                Location
              </h3>
              <p className="text-[13.5px] text-[#6B6560]">Serving founders across Canada</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#e5e5e5] py-8">
          <p className="text-[14px] text-[#A09A93] text-center">
            &copy; {currentYear} Ruby Law Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
