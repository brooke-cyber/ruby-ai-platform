'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AGREEMENTS, CATEGORY_META, calculatePricing, type Category, type Agreement } from '@/data/agreements';

type FilterTab = 'all' | Category;

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All Agreements' },
  { id: 'employment', label: 'Hiring & Team' },
  { id: 'corporate', label: 'Equity & Governance' },
  { id: 'investment', label: 'Raising Capital' },
  { id: 'commercial', label: 'Software & Services' },
  { id: 'platform', label: 'Platform & Business' },
  { id: 'creator', label: 'Creator & Influencer' },
];

const CATEGORY_STYLES: Record<Category, string> = {
  employment: 'bg-violet-50 text-violet-700',
  corporate: 'bg-rose-50 text-rose-700',
  investment: 'bg-amber-50 text-amber-700',
  commercial: 'bg-emerald-50 text-emerald-700',
  platform: 'bg-sky-50 text-sky-700',
  creator: 'bg-rose-50 text-rose-700',
};

const COMPLEXITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: '~5 min', color: 'text-emerald-600' },
  medium: { label: '~8 min', color: 'text-amber-600' },
  high: { label: '~12 min', color: 'text-rose-600' },
  'very-high': { label: '~15 min', color: 'text-rose-700' },
};

function AgreementCard({ doc, isSelected, onToggle }: { doc: Agreement; isSelected: boolean; onToggle: (id: string) => void }) {
  const meta = CATEGORY_META[doc.category];
  const time = COMPLEXITY_LABELS[doc.complexity] || COMPLEXITY_LABELS.medium;
  return (
    <button
      type="button"
      onClick={() => onToggle(doc.id)}
      className={`group flex flex-col text-left bg-white border rounded-xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'border-[#be123c] border-2 shadow-lg shadow-rose-50 ring-1 ring-rose-100'
          : 'border-neutral-200 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-50'
      }`}
    >
      <div className="px-6 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block px-3 py-1 text-[13px] font-semibold rounded-full ${CATEGORY_STYLES[doc.category]}`}>
            {meta?.label || doc.category}
          </span>
          {(doc.complexity === 'high' || doc.complexity === 'very-high') && (
            <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-neutral-100 text-neutral-500">Complex</span>
          )}
        </div>
        {/* Checkbox */}
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          isSelected ? 'bg-[#be123c] border-[#be123c]' : 'border-neutral-300 bg-white group-hover:border-rose-300'
        }`}>
          {isSelected && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          )}
        </div>
      </div>
      <div className="px-6 pb-6 flex-1 flex flex-col">
        <h3 className={`font-serif text-lg font-semibold mb-2 leading-snug transition-colors ${isSelected ? 'text-rose-700' : 'text-neutral-900 group-hover:text-rose-700'}`}>
          {doc.title}
        </h3>
        <p className="text-neutral-500 text-sm mb-3 flex-1 leading-relaxed">
          {doc.description}
        </p>
        <p className="text-[13px] text-neutral-400 mb-4 leading-relaxed">
          {doc.typicalUseCase}
        </p>
        <div className="flex items-center gap-4 py-3 border-t border-neutral-100">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-0.5">Expert Draft</div>
            <div className="text-base font-bold text-neutral-900">
              ${doc.price} <span className="text-xs font-normal text-neutral-400">CAD</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-0.5">+ Lawyer Review</div>
            <div className="text-sm font-semibold text-neutral-600">
              ${doc.counselPrice}
            </div>
          </div>
          <div className="flex-1 text-right">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-0.5">Est. Time</div>
            <div className={`text-sm font-medium ${time.color}`}>{time.label}</div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [showSelectedPanel, setShowSelectedPanel] = useState(false);
  const [tier, setTier] = useState<'self-serve' | 'counsel'>('self-serve');

  function toggleAgreement(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  function handleContinue() {
    sessionStorage.setItem('ruby-selected', JSON.stringify(selected));
    sessionStorage.setItem('ruby-tier', tier);
    window.location.href = '/wizard';
  }

  function matchesCategory(doc: Agreement, cat: Category): boolean {
    return doc.category === cat || (doc.crossListedIn?.includes(cat) ?? false);
  }

  const filtered = AGREEMENTS.filter((doc) => {
    if (activeFilter !== 'all' && !matchesCategory(doc, activeFilter as Category)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return doc.title.toLowerCase().includes(q) || doc.description.toLowerCase().includes(q) || doc.typicalUseCase.toLowerCase().includes(q);
    }
    return true;
  });

  const grouped = activeFilter === 'all'
    ? (['employment', 'corporate', 'investment', 'commercial', 'platform', 'creator'] as Category[]).map((cat) => ({
        category: cat,
        meta: CATEGORY_META[cat],
        docs: filtered.filter((d) => matchesCategory(d, cat)),
      })).filter((g) => g.docs.length > 0)
    : [{ category: activeFilter as Category, meta: CATEGORY_META[activeFilter as Category], docs: filtered }];

  const basePricing = calculatePricing(selected, 'self-serve');
  const counselPricing = calculatePricing(selected, 'counsel');
  const pricing = tier === 'counsel' ? counselPricing : basePricing;
  const lawyerReviewCost = counselPricing.total - basePricing.total;
  const selectedItems = AGREEMENTS.filter((a) => selected.includes(a.id));

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-4 pt-24 pb-12 sm:pt-32 sm:pb-16 max-w-5xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-rose-700 mb-4">
          Agreement Library
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-neutral-900 mb-6 leading-tight">
          Every agreement your startup needs.
        </h1>
        <p className="text-lg text-neutral-500 max-w-2xl mx-auto mb-2">
          Select one or multiple — bundle pricing kicks in automatically. Customize any agreement after purchase with our legal modification engine.
        </p>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto mb-8">
          Expert-drafted. Reviewed by licensed Canadian lawyers in your province. Ready to sign in minutes.
        </p>
        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search — e.g. 'shareholder', 'SaaS', 'contractor'"
            className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-[rgba(190,18,60,0.1)] focus:border-[#be123c] outline-none transition-all"
          />
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-neutral-600">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Licensed Canadian law firm
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Lawyers across every province
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Ready in minutes, not weeks
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
            Built on Canadian law
          </span>
        </div>
      </section>

      {/* Customization Note */}
      <div className="max-w-5xl mx-auto px-4 py-3 text-center">
        <p className="text-xs text-neutral-400">
          Every agreement includes access to our Customization Wizard for modifications beyond the standard options.
        </p>
      </div>

      {/* Filter Tabs */}
      <section className="px-4 pt-10 pb-2">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === tab.id
                    ? 'bg-rose-700 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                }`}
              >
                {tab.label}
                {tab.id !== 'all' && (
                  <span className="ml-1.5 text-[13px] opacity-70">
                    ({AGREEMENTS.filter((a) => matchesCategory(a, tab.id as Category)).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Agreements — grouped by category */}
      <section className={`px-4 py-8 sm:py-12 ${selected.length > 0 ? 'pb-32' : ''}`}>
        <div className="max-w-5xl mx-auto space-y-12">
          {grouped.map((group) => (
            <div key={group.category}>
              {activeFilter === 'all' && (
                <div className="mb-6">
                  <h2 className="font-serif text-2xl font-normal text-neutral-900">{group.meta.label}</h2>
                  <p className="text-sm text-neutral-500 mt-1">{group.meta.description}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.docs.map((doc) => (
                  <AgreementCard key={doc.id} doc={doc} isSelected={selected.includes(doc.id)} onToggle={toggleAgreement} />
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-neutral-400 text-lg">No agreements match your search.</p>
              <button onClick={() => { setSearchQuery(''); setActiveFilter('all'); }} className="mt-3 text-rose-700 hover:text-rose-800 text-sm font-medium">Clear filters</button>
            </div>
          )}
        </div>
      </section>

      {/* Flex Lawyers CTA */}
      {selected.length === 0 && (
        <section className="bg-neutral-50 border-y border-neutral-200">
          <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-rose-700 mb-3">
                  Real lawyers. Real review.
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-900 mb-4">
                  A licensed lawyer in your province reviews every agreement.
                </h2>
                <p className="text-neutral-500 leading-relaxed mb-6">
                  Our network of lawyers across Canada means your agreement is reviewed by someone who knows your provincial laws, your regulatory landscape, and the specific compliance requirements that apply to your business.
                </p>
                <p className="text-neutral-500 leading-relaxed">
                  This isn&apos;t a template download. It&apos;s a legal document backed by a real law firm.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-5 text-center">
                  <div className="text-2xl font-bold text-neutral-900 mb-1">10+</div>
                  <div className="text-xs text-neutral-500">Provinces covered</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-5 text-center">
                  <div className="text-2xl font-bold text-neutral-900 mb-1">24hr</div>
                  <div className="text-xs text-neutral-500">Avg. review time</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-5 text-center">
                  <div className="text-2xl font-bold text-neutral-900 mb-1">100%</div>
                  <div className="text-xs text-neutral-500">Canadian-licensed</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-5 text-center">
                  <div className="text-2xl font-bold text-neutral-900 mb-1">$0</div>
                  <div className="text-xs text-neutral-500">Hidden fees</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bundles Teaser */}
      {selected.length === 0 && (
        <section className="px-4 py-16 sm:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-rose-700 mb-3">
              Save with bundles
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-900 mb-4">
              Need multiple agreements?
            </h2>
            <p className="text-neutral-500 text-lg mb-8">
              Select multiple agreements above and bundle pricing kicks in automatically — 10% off two, 15% off three or more.
            </p>
            <Link
              href="/pricing#bundles"
              className="inline-flex items-center gap-2 text-rose-700 hover:text-rose-800 font-medium transition-colors"
            >
              View pre-built bundles
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      {selected.length === 0 && (
        <section className="bg-neutral-50 border-t border-neutral-200">
          <div className="max-w-2xl mx-auto text-center px-4 py-16 sm:py-20">
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-900 mb-4">
              Don&apos;t see what you need?
            </h2>
            <p className="text-neutral-500 text-lg mb-8">
              We build custom agreements for founders with unique needs. Tell us what you&apos;re working on.
            </p>
            <a
              href="mailto:hello@rubylegal.ai"
              className="inline-block px-8 py-3 bg-rose-700 hover:bg-rose-800 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Contact Us
            </a>
          </div>
        </section>
      )}

      {/* ─── Floating Action Bar ─── */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {/* Expandable selected items panel */}
          {showSelectedPanel && (
            <div className="max-w-5xl mx-auto px-4 pt-4 pb-2 border-b border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[14px] font-semibold text-neutral-500 uppercase tracking-wide">Selected Agreements</p>
                <button type="button" onClick={() => setShowSelectedPanel(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-neutral-900 truncate">{item.title}</p>
                      <p className="text-[10px] text-neutral-400">${item.price} CAD</p>
                    </div>
                    <button type="button" onClick={() => setSelected(selected.filter(id => id !== item.id))} className="shrink-0 text-neutral-400 hover:text-red-500 active:text-red-600 transition-colors p-1.5 -mr-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex flex-col gap-3">
            {/* Top row: selected items, tier toggle, pricing, actions */}
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* Selected items — tap to expand */}
              <div className="flex-1 min-w-0">
                <button type="button" onClick={() => setShowSelectedPanel(!showSelectedPanel)} className="flex items-center gap-2 text-left w-full">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900">
                      {selected.length} agreement{selected.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-[13px] text-neutral-400 truncate">
                      {selectedItems.map((i) => i.title.split(' ').slice(0, 2).join(' ')).join(', ')}
                    </p>
                  </div>
                  <svg className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${showSelectedPanel ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              {/* Tier Selector */}
              <div className="hidden sm:flex items-center bg-neutral-100 rounded-lg p-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setTier('self-serve')}
                  className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                    tier === 'self-serve'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  Expert Draft
                </button>
                <button
                  type="button"
                  onClick={() => setTier('counsel')}
                  className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                    tier === 'counsel'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  Expert Draft + Lawyer Review
                </button>
              </div>

              {/* Pricing */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-baseline gap-1.5 justify-end">
                  <span className="text-xl font-bold text-neutral-900">${pricing.total}</span>
                  <span className="text-xs text-neutral-400">CAD</span>
                </div>
                {tier === 'counsel' && (
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    ${basePricing.total} base + ${lawyerReviewCost} review
                  </p>
                )}
                {pricing.discount > 0 && (
                  <p className="text-[10px] text-emerald-600 font-medium">{Math.round(pricing.discount * 100)}% bundle savings</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={() => setSelected([])}
                  className="hidden sm:block px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleContinue}
                  className="px-4 sm:px-6 py-2.5 bg-[#be123c] hover:bg-[#9f1239] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            {/* Customizations note */}
            <div className="text-center sm:text-left">
              <p className="text-[10px] text-neutral-400">Customizations available after purchase — from $49/modification</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
