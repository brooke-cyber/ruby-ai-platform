'use client';

import Link from 'next/link';

export default function AboutPage() {
  const differentiators = [
    {
      title: 'Deterministic Contract Wizard',
      description:
        'Our contract wizard is built on deep Canadian legal workflows — not generic templates. Every unique permutation is pre-certified by a lawyer at the template level, meaning your base contract is production-ready the moment it\u2019s generated.',
      icon: (
        <svg className="h-6 w-6 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      ),
    },
    {
      title: 'AI-Powered Customization',
      description:
        'For modifications beyond the standard options, our AI-powered Customization Wizard drafts custom provisions through a conversational interface, with optional lawyer review for added confidence.',
      icon: (
        <svg className="h-6 w-6 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      title: 'Outcome Based Pricing',
      description:
        'You know the price before we start. No billable hours, no surprise invoices, no retainers. One price for everything — drafting, review, revisions, and compliance.',
      icon: (
        <svg className="h-6 w-6 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const audiences = [
    {
      title: 'For Founders',
      description:
        'You\u2019re moving fast — raising capital, hiring your first team, structuring equity. You need real legal agreements, not a three-week wait and a five-figure invoice. We handle shareholder agreements, SAFEs, employment contracts, and governance so you can focus on building.',
      tags: ['Shareholder Agreements', 'SAFEs', 'Employment', 'IP Protection'],
    },
    {
      title: 'For Creators',
      description:
        'Brand deals, content licensing, platform terms — the legal side of your business shouldn\u2019t cost more than the deal itself. We build service contracts, privacy policies, and SaaS agreements designed for how digital businesses actually operate.',
      tags: ['Service Contracts', 'Privacy Policies', 'SaaS Agreements', 'Licensing'],
    },
    {
      title: 'For Developers & SaaS',
      description:
        'You\u2019re shipping product, not drafting contracts. We handle SLAs, enterprise licensing, IP assignment, and privacy compliance so your legal infrastructure scales with your codebase.',
      tags: ['SaaS SLAs', 'Enterprise Licensing', 'IP Assignment', 'Privacy Compliance'],
    },
    {
      title: 'For Growing Teams',
      description:
        'Your first ten hires set the tone for your company. We draft employment agreements, contractor terms, non-competes, and IP assignments that protect your business without slowing down your hiring.',
      tags: ['Employment Agreements', 'Contractor Terms', 'Non-Competes', 'Offer Letters'],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="px-6 pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="max-w-4xl mx-auto">
          <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#be123c] mb-5">
            About
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] tracking-tight text-gray-900">
            Canada&apos;s first{' '}
            <span className="text-[#be123c]">
              AI-native law firm.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed">
            We built Ruby Law because the legal industry charges founders like they&apos;re Fortune 500 companies. You deserve big-law rigor at a price that makes sense for your stage.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="px-4 py-16 md:py-24 bg-[#faf9f7]">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6 text-gray-500 leading-relaxed text-lg">
            <p>
              We spent years at institutional firms working on complex corporate, M&amp;A, and securities matters. We watched
              founders pay $8,000+ for shareholder agreements drafted from the same precedent every time. We watched
              startups delay fundraises because their lawyer took three weeks to turn a SAFE. We knew there was a better way.
            </p>
            <p>
              <span className="text-gray-900 font-medium">Ruby Law is Canada&apos;s first AI-native law firm</span> — licensed
              and built from the ground up to serve founders and creators across Canada. The result: big-law quality, startup speed, and a price you actually know before we start.
            </p>
            <p>
              Our platform operates on a two-layer model. Layer 1 is our deterministic contract wizard — every unique permutation is pre-certified by a lawyer at the template level, meaning your base contract is production-ready the moment it&apos;s generated. Layer 2 is our AI-powered Customization Wizard — for modifications beyond the standard options, our AI drafts custom provisions through a conversational interface, with optional lawyer review.
            </p>
            <p>
              This isn&apos;t legal automation. It&apos;s a law firm that uses technology the way it should be used — to
              eliminate the busywork so your lawyer can focus on judgment, strategy, and protecting your interests.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-[15px] font-semibold uppercase tracking-[0.2em] text-[#be123c] mb-3">Our Approach</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">What makes us different</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-5 h-12 w-12 rounded-xl bg-neutral-50 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="px-4 py-16 md:py-24 bg-[#faf9f7]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-[15px] font-semibold uppercase tracking-[0.2em] text-[#be123c] mb-3">Clients</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">Who we serve</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-all"
              >
                <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">{audience.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-6">{audience.description}</p>
                <div className="flex flex-wrap gap-2">
                  {audience.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-neutral-50 text-[#be123c]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 md:py-24 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your legal shouldn&apos;t hold you back.</h2>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            Generate your first agreement in minutes. See why founders are switching from traditional firms.
          </p>
          <Link href="/documents" className="btn-primary !px-8 !py-4 !text-base inline-flex items-center gap-2">
            Start Building
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
