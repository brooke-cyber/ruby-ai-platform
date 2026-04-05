'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  description: string;
  items: FAQItem[];
}

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className="w-full py-6 flex items-center justify-between text-left group cursor-pointer"
      >
        <span className="text-[15px] sm:text-[16px] font-medium text-neutral-900 pr-8 leading-snug group-hover:text-[#be123c] transition-colors duration-200">
          {item.question}
        </span>
        <div className={`shrink-0 h-7 w-7 rounded-full border flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-[#be123c] border-[#be123c] rotate-45'
            : 'border-neutral-200 group-hover:border-[#be123c]/40'
        }`}>
          <svg
            className={`w-3.5 h-3.5 transition-colors duration-300 ${isOpen ? 'text-white' : 'text-neutral-400 group-hover:text-[#be123c]'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="pb-6 pr-14">
          <p className="text-[14px] sm:text-[15px] text-neutral-500 leading-[1.8]">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const faqCategories: FAQCategory[] = [
    {
      title: 'General',
      description: 'What Ruby Law is and how it works',
      items: [
        {
          question: 'What is Ruby Law?',
          answer:
            'Ruby Law is Canada\u2019s first AI-native law firm. We combine a deterministic contract wizard with AI-powered customization to produce production-ready legal agreements in minutes \u2014 not weeks. Layer 1: you answer targeted questions, select clause positions, and we generate a base contract with Canadian compliance built in. Layer 2: after purchase, you can modify any clause through a guided conversation with Ruby, our AI legal assistant. Every counsel-tier document is reviewed and signed off by a licensed Canadian lawyer.',
        },
        {
          question: 'How is this different from a template service?',
          answer:
            'Templates give you a generic document with blanks. Ruby builds each agreement from scratch based on your specific deal \u2014 your parties, your terms, your jurisdiction, your risk tolerance. Every clause is tailored and compliance-checked against current Canadian law. A template doesn\u2019t know about Waksdale. Ruby does.',
        },
        {
          question: 'Is Ruby Law a real law firm?',
          answer:
            'Yes. Ruby Law is a licensed Canadian law practice. Every counsel-tier document is reviewed, approved, and signed off by a practicing Canadian lawyer before delivery. You get the speed of AI with the accountability of a real firm that puts its name on every document.',
        },
        {
          question: 'Who is Ruby Law built for?',
          answer:
            'Founders raising capital, hiring their first team, and structuring their company. Startups that need real legal documents but don\u2019t want to spend $15,000 on a Bay Street firm for a shareholder agreement. Companies that move fast and need their legal to keep up.',
        },
      ],
    },
    {
      title: 'Documents & Turnaround',
      description: 'Speed, scope, and what you receive',
      items: [
        {
          question: 'How fast do I get my document?',
          answer:
            'Base Draft: minutes. You answer the wizard, we generate a full agreement instantly. Counsel-tier documents \u2014 which include a plain-language memo, redline markup, specific legal advice, and a formal sign-off \u2014 are typically delivered within 1\u20134 hours depending on complexity.',
        },
        {
          question: 'What types of agreements do you cover?',
          answer:
            'Over 40 agreement types across six categories: Hiring & Team (employment, contractor, non-compete, IP assignment, offer letters), Equity & Governance (shareholder agreements, voting agreements, bylaws, resolutions, ESOP plans), Raising Capital (SAFEs, convertible notes, term sheets, subscription agreements, Series A/B/C financing), Software & Services (SaaS, vendor, consulting, licensing, SOW), Platform & Business (terms of service, privacy policy, DPA, cookie policy), and Creator & Influencer (content licenses, talent agreements, production contracts, sync licenses). We add new agreement types every month.',
        },
        {
          question: 'What exactly do I receive?',
          answer:
            'Every agreement comes as a clean, formatted document ready to sign. Base Draft tier: the full agreement with all your selected terms and compliance checks built in. Counsel tier: everything in Base Draft plus a plain-language summary memo, a redline markup showing key decision points, specific legal advice tailored to your situation, and a formal sign-off from a licensed Canadian lawyer.',
        },
        {
          question: 'What is the Customization Wizard?',
          answer:
            'After purchasing your base contract, you can customize it through our 5-step Customization Wizard. Select a modification category, describe what you need, review it with Ruby in a guided conversation, then order the final version. Simple modifications start at $49. It\u2019s like having a junior associate on call \u2014 except faster and with perfect recall of Canadian case law.',
        },
        {
          question: 'Can I re-generate my document with changes?',
          answer:
            'Yes. Base Draft documents can be re-generated with updated parameters at no additional cost \u2014 change your jurisdiction, swap a clause position, adjust a term. For counsel-tier documents, your lawyer provides specific guidance on any changes. You can also use the Customization Wizard for more complex modifications.',
        },
      ],
    },
    {
      title: 'Pricing',
      description: 'Transparent costs, no surprises',
      items: [
        {
          question: 'How does pricing work?',
          answer:
            'Every agreement has a fixed, transparent price \u2014 you see the cost before you start. Base Draft pricing ranges from $99\u2013$599 depending on complexity. Counsel tier (with lawyer review) ranges from $199\u2013$999. No hourly billing, no surprise invoices, no scope creep.',
        },
        {
          question: 'Why do prices vary between agreements?',
          answer:
            'Complexity. A simple offer letter has fewer moving parts than a multi-party shareholder agreement with deadlock resolution, drag-along mechanics, and three share classes. More clauses, more compliance checks, more legal reasoning \u2014 higher price. But even our most complex agreements cost a fraction of what a traditional firm would charge.',
        },
        {
          question: 'Do you offer bundle discounts?',
          answer:
            'Yes. Our bundles \u2014 Formation, Seed Round, Employment, Creator, and Growth \u2014 package commonly-needed documents together at significant savings versus buying individually. Every bundle includes counsel-level lawyer review. Most founders save 25\u201340% compared to purchasing agreements separately.',
        },
        {
          question: 'How much does customization cost?',
          answer:
            'Customization is priced by complexity: Simple modifications start at $49, standard modifications are $129, and complex modifications are $299. Volume discounts apply \u2014 20% off the 2nd modification, 40% off the 3rd and beyond. Still cheaper than one hour with most law firms.',
        },
      ],
    },
    {
      title: 'Quality & Compliance',
      description: 'Trust, security, and legal standards',
      items: [
        {
          question: 'Can I actually trust AI-generated legal documents?',
          answer:
            'You\u2019re not trusting the AI alone. Ruby drafts. A licensed Canadian lawyer reviews. For counsel-tier documents, you receive a formal sign-off \u2014 or specific advice on what to change before signing. Every agreement references current Canadian case law and statutory requirements. You get the speed of AI with the judgment of a real lawyer who puts their name on it.',
        },
        {
          question: 'How does Canadian compliance work?',
          answer:
            'Compliance is built into the generation process, not bolted on after. Our system detects which regulations apply to your deal and weaves them in automatically \u2014 ESA and Waksdale for employment agreements, NI 45-106 for securities documents, CBCA for corporate governance, PIPEDA and CASL for commercial contracts, Quebec Law 25 for privacy. Provincial variations are handled at the clause level.',
        },
        {
          question: 'Where is my data stored?',
          answer:
            'All data is stored in Canadian data centers. We never transfer client data outside of Canada. Everything is encrypted in transit (TLS 1.3) and at rest (AES-256). We don\u2019t train AI models on your data. Your agreements are yours.',
        },
        {
          question: 'What happens if the law changes?',
          answer:
            'Our legal team continuously updates our clause library and compliance rules. When a significant case is decided or legislation changes \u2014 like the Waksdale decision that rewrote termination clause law in Ontario \u2014 we update our drafting logic. Your next agreement always reflects current law.',
        },
      ],
    },
    {
      title: 'For Lawyers',
      description: 'Join the Ruby Law network',
      items: [
        {
          question: 'How does the lawyer portal work?',
          answer:
            'Licensed Canadian lawyers can join our review network through the Lawyer Portal. You receive pre-drafted agreements matched to your expertise and jurisdiction. Review, provide your sign-off or specific advice, and earn a commission on every completed case. Cases are tiered by complexity \u2014 Standard, Intermediate, Complex, and Expert \u2014 so you only see work that matches your experience level.',
        },
        {
          question: 'How much do lawyers earn?',
          answer:
            'Lawyers earn 65% of the counsel review fee on every case. Fees range based on agreement complexity and tier. Top lawyers on our platform earn $8,000\u2013$12,000+ per month. Payouts are biweekly via direct deposit.',
        },
        {
          question: 'What qualifications do I need?',
          answer:
            'You must be a licensed lawyer in good standing with a Canadian law society. We require demonstrated expertise in at least one of our practice areas (corporate/commercial, employment, securities, IP, privacy). New lawyers complete two qualification reviews before being matched with live cases.',
        },
      ],
    },
  ];

  const toggleOpen = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const trustBadges = [
    { icon: 'shield', title: 'Licensed Practice', description: 'Regulated Canadian law firm' },
    { icon: 'server', title: 'Canadian Data', description: 'Stored in Canada, always' },
    { icon: 'document', title: 'Securities Compliant', description: 'NI 45-106 built in' },
    { icon: 'lock', title: 'Privacy First', description: 'PIPEDA & Law 25 compliant' },
    { icon: 'currency', title: 'Fixed Pricing', description: 'No hourly billing, ever' },
    { icon: 'check', title: 'Lawyer-Reviewed', description: 'Every counsel document' },
  ];

  const iconMap: Record<string, React.ReactNode> = {
    shield: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.765 11.765 0 0112 2.25a11.764 11.764 0 018.306 3.464m-8.306-3.464A11.764 11.764 0 003.694 5.714M12 2.25c-3.252 0-6.19 1.321-8.306 3.464m16.612 0A11.736 11.736 0 0121.75 12c0 3.252-1.321 6.19-3.444 8.286m0 0A11.764 11.764 0 0112 21.75a11.764 11.764 0 01-8.306-3.464m16.612 0L12 12m-8.306 8.286A11.736 11.736 0 012.25 12c0-3.252 1.321-6.19 3.444-8.286m0 0L12 12" />,
    server: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />,
    document: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
    lock: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />,
    currency: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };

  let globalIndex = 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-6 pt-32 pb-16 md:pt-44 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#be123c] mb-6 font-medium">
            Common Questions
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.08] tracking-tight text-neutral-900 mb-6">
            Everything you need to know
          </h1>
          <p className="text-[16px] text-neutral-500 leading-[1.7] max-w-lg">
            How Ruby Law works, what you get, and why founders trust us with their most important legal documents.
          </p>
        </div>
      </section>

      {/* Category navigation pills */}
      <section className="px-6 pb-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {faqCategories.map((cat) => (
              <a
                key={cat.title}
                href={`#${cat.title.toLowerCase().replace(/[^a-z]/g, '-')}`}
                className="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium text-neutral-600 bg-neutral-50 border border-neutral-100 hover:border-[#be123c]/30 hover:text-[#be123c] hover:bg-[#be123c]/[0.03] transition-all duration-200"
              >
                {cat.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto space-y-16">
          {faqCategories.map((category, categoryIndex) => {
            const sectionStart = globalIndex;

            const section = (
              <div key={categoryIndex} id={category.title.toLowerCase().replace(/[^a-z]/g, '-')}>
                <div className="mb-2">
                  <h2 className="font-serif text-[22px] sm:text-[24px] text-neutral-900 tracking-tight">
                    {category.title}
                  </h2>
                  <p className="text-[13px] text-neutral-400 mt-1">{category.description}</p>
                </div>
                <div className="mt-4 border-t border-neutral-100">
                  {category.items.map((item, itemIndex) => {
                    const thisIndex = sectionStart + itemIndex;
                    return (
                      <AccordionItem
                        key={itemIndex}
                        item={item}
                        isOpen={openItems.has(thisIndex)}
                        onToggle={() => toggleOpen(thisIndex)}
                      />
                    );
                  })}
                </div>
              </div>
            );

            globalIndex += category.items.length;
            return section;
          })}
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-6 py-16 md:py-20 border-t border-neutral-100 bg-neutral-50/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#be123c] text-center mb-10 font-medium">
            Why founders trust Ruby Law
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
            {trustBadges.map((badge) => (
              <div key={badge.title} className="text-center">
                <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center shadow-sm">
                  <svg className="h-[18px] w-[18px] text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {iconMap[badge.icon]}
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-neutral-900 mb-0.5">{badge.title}</p>
                <p className="text-[11px] text-neutral-400">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-neutral-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-[15px] text-neutral-500 leading-relaxed mb-8">
            We\u2019re real lawyers. Reach out directly, or start building your first agreement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:hello@rubylegal.ai"
              className="inline-flex items-center justify-center gap-2 border border-neutral-200 hover:border-neutral-300 text-neutral-700 text-[14px] font-medium px-7 py-3 rounded-lg transition-colors duration-200"
            >
              <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Contact Us
            </a>
            <Link
              href="/agreements"
              className="inline-flex items-center justify-center gap-2 bg-[#be123c] hover:bg-[#9f1239] text-white text-[14px] font-medium px-7 py-3 rounded-lg transition-colors duration-200"
            >
              Browse Agreements
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
