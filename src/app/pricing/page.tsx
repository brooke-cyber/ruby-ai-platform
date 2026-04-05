'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AGREEMENTS, CATEGORY_META, Category } from '@/data/agreements';

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openCategory, setOpenCategory] = useState<Category | null>('employment');

  const categories: Category[] = ['employment', 'corporate', 'investment', 'commercial', 'platform', 'creator'];

  const bundles = [
    {
      name: 'Founders Bundle',
      price: 1999,
      description: 'Incorporate, structure equity, and raise your first round.',
      includes: ['Incorporation & Formation', 'Shareholder Agreement', 'SAFE Agreement', 'IP Assignment'],
      agreementIds: ['articles-of-incorporation', 'two-party-sha', 'safe-agreement', 'ip-assignment'],
      popular: true,
    },
    {
      name: 'Creators Bundle',
      price: 1799,
      description: 'Protect your brand, land the deal, and own your content.',
      includes: ['Influencer Agreement', 'SaaS Agreement', 'Contractor Agreement', 'IP Assignment', 'Privacy & Terms'],
      agreementIds: ['influencer-agreement', 'saas-sla', 'contractor', 'ip-assignment', 'privacy-policy', 'terms-and-conditions'],
    },
    {
      name: 'Growing Teams',
      price: 1499,
      description: 'Hire your first team with airtight employment agreements.',
      includes: ['Standard Employment', 'Executive Employment', 'Contractor', 'Non-Compete', 'IP Assignment'],
      agreementIds: ['standard-employment', 'executive-employment', 'contractor', 'non-compete', 'ip-assignment'],
    },
    {
      name: 'Seed Round',
      price: 1999,
      description: 'Raise your seed round with investor-ready documents.',
      includes: ['SAFE Agreement', 'Shareholder Agreement', 'Confidentiality & IP'],
      agreementIds: ['safe-agreement', 'two-party-sha', 'standard-nda'],
    },
    {
      name: 'Enterprise',
      price: 3499,
      description: 'Full legal infrastructure for scaling companies.',
      includes: ['Terms & Conditions', 'Privacy Policy', 'MSA', 'SaaS SLA', 'Enterprise SLA', 'IP Assignment'],
      agreementIds: ['terms-and-conditions', 'privacy-policy', 'master-services-agreement', 'saas-sla', 'enterprise-licensing-sla', 'ip-assignment'],
    },
    {
      name: 'SaaS Teams',
      price: 1999,
      description: 'Enterprise-grade service agreements for SaaS companies.',
      includes: ['SaaS SLA', 'Enterprise SLA', 'Managed Services SLA', 'IP Assignment'],
      agreementIds: ['saas-sla', 'enterprise-licensing-sla', 'managed-services-sla', 'ip-assignment'],
    },
  ];

  const faqItems = [
    {
      question: 'What is included in Expert Draft?',
      answer: 'A production-ready agreement built from our proprietary clause library and Canadian compliance database. Every clause is jurisdiction-specific and enforceable. You receive a downloadable document ready to execute.',
    },
    {
      question: 'What does Lawyer Review add?',
      answer: 'A licensed Canadian lawyer personally reviews your agreement. You get a plain-language memo, redline markup, enforceability advice, and a formal sign-off.',
    },
    {
      question: 'Can I customize my contract after purchase?',
      answer: 'Yes. After your base contract is generated, you can request modifications through the Ruby Drafting Engine. Each modification is priced by complexity. Volume discounts apply automatically.',
    },
    {
      question: 'Do bundles include lawyer review?',
      answer: 'Yes. Every bundle includes counsel-level review with a formal approval for every document.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Expert Draft documents are generated in minutes. Lawyer Review is delivered within 3-5 business days, or 24 hours with Priority Review.',
    },
  ];

  const CheckIcon = ({ className = '' }: { className?: string }) => (
    <svg className={`h-4 w-4 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="px-6 pt-32 pb-16 md:pt-44 md:pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#be123c] mb-5">
            Pricing
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] tracking-tight text-gray-900">
            Know the price{' '}
            <span className="text-[#be123c]">before you start.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Fixed pricing. No billable hours. No retainers. Every agreement is priced upfront.
          </p>
        </div>
      </section>

      {/* How It Works: 3-Step Visual */}
      <section className="px-4 sm:px-6 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              {
                step: '1',
                title: 'Choose Your Agreement',
                desc: 'Pick from 27 agreement types. Answer the wizard questions to configure your deal.',
                highlight: 'From $99',
              },
              {
                step: '2',
                title: 'Add Customizations',
                desc: 'Need changes beyond the wizard? Request modifications priced by complexity.',
                highlight: 'From $49/mod',
              },
              {
                step: '3',
                title: 'Add Lawyer Review',
                desc: 'A licensed Canadian lawyer reviews, redlines, and signs off on your agreement.',
                highlight: 'Optional',
              },
            ].map((item, idx) => (
              <div key={item.step} className="relative flex flex-col items-center text-center px-6 sm:px-8 py-8 sm:py-10">
                {/* Vertical divider between steps (desktop only) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gray-200" />
                )}
                {/* Horizontal divider between steps (mobile only) */}
                {idx < 2 && (
                  <div className="md:hidden absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-16 bg-gray-200" />
                )}
                <div className="h-10 w-10 rounded-full bg-[#be123c] text-white flex items-center justify-center text-sm font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3 max-w-[260px]">{item.desc}</p>
                <span className="text-[14px] font-semibold text-[#be123c] uppercase tracking-wider">{item.highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two-Tier Comparison */}
      <section className="px-4 sm:px-6 py-16 md:py-24 bg-[#faf9f7]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-3">Two tiers. You choose.</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">Every agreement is available as Expert Draft or with Lawyer Review.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expert Draft */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Expert Draft</h3>
              <p className="text-sm text-gray-500 mb-6">Production-ready. Instant delivery.</p>
              <div className="space-y-3 mb-8">
                {[
                  'Lawyer-engineered clause library',
                  'Canadian compliance built in',
                  'Three-position risk allocation',
                  'Downloadable in minutes',
                  'Customization engine available',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckIcon className="text-[#be123c] mt-0.5" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-5">
                <p className="text-[13px] uppercase tracking-wider text-gray-400 mb-1">Starting at</p>
                <p className="text-3xl font-bold text-gray-900">$99 <span className="text-sm font-normal text-gray-400">CAD</span></p>
              </div>
            </div>

            {/* Expert Draft + Lawyer Review */}
            <div className="rounded-xl border-2 border-[#be123c]/20 bg-white p-6 sm:p-8 relative transition-all duration-300 hover:shadow-lg hover:border-[#be123c]/40">
              <div className="absolute -top-3 left-6">
                <span className="inline-block bg-[#be123c] text-white text-[11px] sm:text-[13px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  Recommended
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 mt-1">Expert Draft + Lawyer Review</h3>
              <p className="text-sm text-gray-500 mb-6">Everything above, plus licensed counsel.</p>
              <div className="space-y-3 mb-8">
                {[
                  'Everything in Expert Draft',
                  'Licensed Canadian lawyer review',
                  'Redline markup & annotations',
                  'Plain-language legal memo',
                  'Formal approval or advice on what to change',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckIcon className="text-[#be123c] mt-0.5" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-5">
                <p className="text-[13px] uppercase tracking-wider text-gray-400 mb-1">Starting at</p>
                <p className="text-3xl font-bold text-[#be123c]">$199 <span className="text-sm font-normal text-gray-400">CAD</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agreement Pricing by Category */}
      <section className="px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-3">Agreement pricing</h2>
            <p className="text-gray-500 text-sm sm:text-base">Every agreement, one clear price. Click a category to see pricing.</p>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto mb-8">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const isActive = openCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setOpenCategory(isActive ? null : cat)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Pricing table for selected category -- desktop table, mobile cards */}
          {openCategory && (() => {
            const agreements = AGREEMENTS.filter(
              (a) => a.category === openCategory || a.crossListedIn?.includes(openCategory!)
            );
            return (
              <div className="animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#faf9f7] border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Agreement</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Expert Draft</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">+ Lawyer Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agreements.map((agreement, idx) => (
                        <tr
                          key={agreement.id}
                          className={`border-b border-gray-50 transition-colors duration-150 hover:bg-[#be123c]/[0.02] ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-[#faf9f7]/30'
                          }`}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{agreement.title}</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">${agreement.price}</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-[#be123c]">${agreement.counselPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {agreements.map((agreement) => (
                    <div
                      key={agreement.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 transition-colors duration-150"
                    >
                      <p className="text-sm font-semibold text-gray-900 mb-3">{agreement.title}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-0.5">Expert Draft</p>
                          <p className="text-sm font-bold text-gray-900">${agreement.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-0.5">+ Lawyer Review</p>
                          <p className="text-sm font-bold text-[#be123c]">${agreement.counselPrice}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="mt-6 text-center">
            <Link href="/documents" className="text-sm font-medium text-[#be123c] hover:underline inline-flex items-center gap-1 transition-colors duration-200 hover:text-[#9f1239]">
              Browse all 27 agreements
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Customization Add-On */}
      <section className="px-4 sm:px-6 py-16 md:py-24 bg-[#faf9f7]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#be123c] mb-3">Optional Add-On</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-3">Customize after purchase</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">Need changes beyond the wizard? Request modifications through the Ruby Drafting Engine, priced by complexity.</p>
          </div>

          {/* 3 complexity tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { tier: 'Simple', price: '$49', examples: 'Threshold changes, single-clause removal, wording tweaks' },
              { tier: 'Standard', price: '$129', examples: 'New clauses, custom schedules, adding or removing parties' },
              { tier: 'Complex', price: '$299', examples: 'Novel provisions, multi-clause changes, regulatory implications' },
            ].map((t) => (
              <div key={t.tier} className="rounded-xl border border-gray-200 bg-white p-6 text-center transition-all duration-300 hover:shadow-md hover:border-gray-300">
                <p className="text-sm font-bold text-gray-900 mb-1">{t.tier}</p>
                <p className="text-2xl font-bold text-[#be123c] mb-3">{t.price}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t.examples}</p>
              </div>
            ))}
          </div>

          {/* Volume + Review */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-sm font-bold text-gray-900 mb-3">Volume Discounts</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">1st modification</span>
                  <span className="font-medium text-gray-900">Full price</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">2nd modification</span>
                  <span className="font-medium text-[#be123c]">20% off</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">3rd+ modifications</span>
                  <span className="font-medium text-[#be123c]">40% off</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-sm font-bold text-gray-900 mb-3">Add Lawyer Review</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Standard (3-5 days)</span>
                  <span className="font-medium text-gray-900">+$149</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Priority (24 hours)</span>
                  <span className="font-medium text-gray-900">+$349</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundles */}
      <section className="px-4 sm:px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#be123c] mb-3">Bundles</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-3">Save with bundles</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">Every bundle includes lawyer review for all documents.</p>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.map((bundle) => (
              <div
                key={bundle.name}
                className={`group relative rounded-xl border bg-white p-6 sm:p-7 transition-all duration-300 hover:shadow-lg flex flex-col ${
                  bundle.popular
                    ? 'border-[#be123c]/30 shadow-md ring-1 ring-[#be123c]/10 hover:border-[#be123c]/50'
                    : 'border-gray-200 shadow-sm hover:border-gray-300'
                }`}
              >
                {bundle.popular && (
                  <div className="absolute -top-3 left-5">
                    <span className="inline-block bg-[#be123c] text-white text-[10px] sm:text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`mb-4 ${bundle.popular ? 'pt-1' : ''}`}>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{bundle.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{bundle.description}</p>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-[#be123c]">${bundle.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-400 ml-1">CAD</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {bundle.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckIcon className="text-[#be123c] mt-0.5" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (bundle.agreementIds.length > 0) {
                      sessionStorage.setItem('ruby-selected', JSON.stringify(bundle.agreementIds));
                      sessionStorage.setItem('ruby-tier', 'counsel');
                      window.location.href = '/wizard';
                    } else {
                      window.location.href = '/documents';
                    }
                  }}
                  className={`block w-full text-center rounded-lg px-5 py-3 font-medium text-sm transition-all duration-200 ${
                    bundle.popular
                      ? 'bg-[#be123c] text-white hover:bg-[#9f1239] hover:shadow-md active:translate-y-0'
                      : 'border border-gray-200 text-gray-700 hover:border-gray-400 hover:text-gray-900'
                  }`}
                >
                  Choose Bundle
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              Need a custom combination?{' '}
              <Link href="/documents" className="font-medium text-[#be123c] hover:underline">
                Select any agreements
              </Link>
              {' '}&mdash; bundle discounts apply automatically (10% for 2, 15% for 3+).
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 py-16 md:py-24 bg-[#faf9f7]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">Common questions</h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-all duration-200 hover:border-gray-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left transition-colors duration-150 hover:bg-gray-50/50"
                >
                  <span className="text-sm sm:text-[15px] font-semibold text-gray-900 pr-4 leading-snug">{item.question}</span>
                  <svg
                    className={`w-4 h-4 text-[#be123c] flex-shrink-0 transition-transform duration-300 ease-out ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    openFaq === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="border-t border-gray-100 px-5 sm:px-6 py-4 sm:py-5">
                    <p className="text-sm text-gray-500 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/faq" className="text-sm font-medium text-[#be123c] hover:underline inline-flex items-center gap-1 transition-colors duration-200 hover:text-[#9f1239]">
              View all FAQs
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-3">Ready to start?</h2>
          <p className="text-base sm:text-lg text-gray-500 mb-8 leading-relaxed max-w-md mx-auto">
            Pick your agreement, answer a few questions, and get a production-ready document in minutes.
          </p>
          <Link href="/documents" className="btn-primary !px-8 !py-4 !text-base inline-flex items-center gap-2">
            Browse Agreements
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
