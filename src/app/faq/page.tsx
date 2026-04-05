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
        onClick={onToggle}
        className="w-full py-5 sm:py-6 flex items-start justify-between text-left group"
      >
        <span className="text-[15px] sm:text-[16px] font-medium text-neutral-900 pr-6 leading-snug group-hover:text-[#be123c] transition-colors">
          {item.question}
        </span>
        <div className="shrink-0 mt-0.5 h-6 w-6 rounded-full border border-neutral-200 flex items-center justify-center group-hover:border-[#be123c]/30 transition-all">
          <svg
            className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-[#be123c] transition-all duration-300 ${isOpen ? 'rotate-45' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="text-[14px] sm:text-[15px] text-neutral-500 leading-[1.75] pb-6 pr-12">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqCategories: FAQCategory[] = [
    {
      title: 'General',
      description: 'What Ruby Law is and how it works',
      items: [
        {
          question: 'What is Ruby Law?',
          answer:
            'Ruby Law is Canada\u2019s first AI-native law firm built on a two-layer model. Layer 1 is a deterministic contract wizard \u2014 you answer questions, select clause positions, and we generate a production-ready base contract with Canadian compliance built in. Layer 2 is the Ruby Customization Wizard \u2014 after purchasing your base contract, you can modify, add, or remove clauses through an AI-powered conversation. Every counsel-tier document is reviewed by a licensed Canadian lawyer.',
        },
        {
          question: 'How is this different from a template service?',
          answer:
            'Templates give you a generic document with blanks to fill in. We build each agreement from scratch based on your specific deal \u2014 your parties, your terms, your jurisdiction. Every clause is tailored and compliance-checked for Canadian law. It\u2019s the difference between a form letter and a custom-drafted agreement.',
        },
        {
          question: 'Is this a real law firm?',
          answer:
            'Yes. Ruby Law is a licensed Canadian law practice. Every counsel-tier document is reviewed and signed off by a licensed lawyer before delivery.',
        },
      ],
    },
    {
      title: 'Documents & Turnaround',
      description: 'Speed, scope, and what you receive',
      items: [
        {
          question: 'How long does it take to get my document?',
          answer:
            'Expert Draft documents are generated in minutes. Counsel-tier documents \u2014 which include a plain-language memo, redline markup, specific legal advice, and a formal sign-off from a licensed Canadian lawyer \u2014 are typically delivered within 1\u20134 hours depending on complexity.',
        },
        {
          question: 'What documents can you generate?',
          answer:
            'We cover six categories: Hiring & Team (7 types), Equity & Governance (8 types including five shareholder agreement structures), Raising Capital (5 types including SAFE and convertible note), Software & Services (3 types), Platform & Business (3 types), and Creator & Influencer (1 type). 27 agreement types in total.',
        },
        {
          question: 'What if I need changes after delivery?',
          answer:
            'Expert Draft documents can be re-generated with updated parameters at no additional cost. For counsel-tier documents, your lawyer provides specific guidance on any changes needed. You can also use our Customization Wizard to make modifications at any time.',
        },
        {
          question: 'What is the Customization Wizard?',
          answer:
            'After purchasing your base contract, you can optionally customize it through our AI-powered Customization Wizard. Describe what you need, Ruby drafts the modification through a conversation, and you choose between Expert Draft delivery (instant) or Expert Draft + Lawyer Review (3\u20135 days standard, 24 hours priority).',
        },
        {
          question: 'Can I customize my contract after purchase?',
          answer:
            'Yes. Every base contract includes a \u2018Customize This Contract\u2019 option. You can modify, add, or remove clauses through an AI conversation. You shape the modification interactively, then pay to unlock the final text.',
        },
      ],
    },
    {
      title: 'Pricing & Bundles',
      description: 'Costs, discounts, and what\u2019s included',
      items: [
        {
          question: 'Why does pricing vary between agreements?',
          answer:
            'More complex agreements require more clauses, more compliance checks, and more legal reasoning. A simple offer letter costs less than a shareholder agreement with deadlock resolution and exit mechanics. Every price is transparent \u2014 you know the cost before you start.',
        },
        {
          question: 'Do bundles save money?',
          answer:
            'Yes. Our bundles \u2014 Formation, Seed Round, Employment, Creator, and Growth \u2014 package commonly-needed documents together at a significant discount versus buying individually. Every bundle includes counsel-level lawyer review.',
        },
        {
          question: 'How much does customization cost?',
          answer:
            'Customization is priced by complexity: Simple modifications start at $49, standard modifications are $129, and complex modifications are $299. Volume discounts apply: 20% off the 2nd modification, 40% off the 3rd and beyond.',
        },
        {
          question: 'Is there a free tier?',
          answer:
            'Not currently. Every document includes AI generation with full compliance analysis, which requires significant computational and legal infrastructure. What you get is a real, enforceable legal document \u2014 not a draft or template.',
        },
      ],
    },
    {
      title: 'Quality & Compliance',
      description: 'Trust, security, and legal standards',
      items: [
        {
          question: 'Can I trust AI-generated legal documents?',
          answer:
            'Ruby drafts the agreement. A licensed Canadian lawyer reviews it. For counsel-tier documents, you receive a formal approval to proceed \u2014 or specific advice on what to change before signing. You get the speed of AI with the accountability of a real lawyer who puts their name on it.',
        },
        {
          question: 'How do you handle Canadian compliance?',
          answer:
            'Every document is built with Canadian law baked in \u2014 securities rules for investment docs, employment standards for hiring agreements, corporate governance for shareholder agreements, and privacy law for commercial contracts. Our system detects which rules apply to your deal and builds them in automatically.',
        },
        {
          question: 'Where is my data stored?',
          answer:
            'All data is stored in Canadian data centers. We never transfer client data outside of Canada. Everything is encrypted in transit and at rest.',
        },
      ],
    },
  ];

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const trustBadges = [
    { icon: 'shield', title: 'Licensed Practice', description: 'Regulated Canadian law firm' },
    { icon: 'server', title: 'Canadian Data', description: 'Hosted in Canada, always' },
    { icon: 'document', title: 'Securities Compliant', description: 'Investment docs covered' },
    { icon: 'lock', title: 'Privacy Compliant', description: 'Canadian privacy law built in' },
    { icon: 'currency', title: 'Transparent Pricing', description: 'Know the cost upfront' },
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-6 pt-32 pb-16 md:pt-44 md:pb-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#be123c] mb-4">
            Frequently Asked Questions
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.08] tracking-tight text-neutral-900 mb-5">
            Questions?{' '}
            <span className="text-[#be123c]">We&apos;ve got answers.</span>
          </h1>
          <p className="text-[16px] sm:text-[17px] text-neutral-500 leading-[1.7] max-w-xl">
            Everything you need to know about Ruby Law, our documents, pricing, and how we work.
          </p>
        </div>
      </section>

      {/* Category navigation pills */}
      <section className="px-6 pb-8 md:pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {faqCategories.map((cat) => (
              <a
                key={cat.title}
                href={`#${cat.title.toLowerCase().replace(/[^a-z]/g, '-')}`}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-medium text-neutral-500 bg-neutral-50 border border-neutral-100 hover:border-[#be123c]/20 hover:text-[#be123c] hover:bg-[#be123c]/[0.03] transition-all"
              >
                {cat.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto space-y-14">
          {faqCategories.map((category, categoryIndex) => {
            const globalOffset = faqCategories
              .slice(0, categoryIndex)
              .reduce((sum, cat) => sum + cat.items.length, 0);

            return (
              <div key={categoryIndex} id={category.title.toLowerCase().replace(/[^a-z]/g, '-')}>
                <div className="mb-1">
                  <h2 className="text-[18px] sm:text-[20px] font-semibold text-neutral-900 tracking-tight">
                    {category.title}
                  </h2>
                  <p className="text-[13px] text-neutral-400 mt-1">{category.description}</p>
                </div>
                <div className="mt-4">
                  {category.items.map((item, itemIndex) => {
                    const globalIndex = globalOffset + itemIndex;
                    return (
                      <AccordionItem
                        key={itemIndex}
                        item={item}
                        isOpen={openIndex === globalIndex}
                        onToggle={() => toggleOpen(globalIndex)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-6 py-16 md:py-20 border-t border-neutral-100 bg-neutral-50/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#be123c] text-center mb-10">
            Why founders trust Ruby Law
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
            {trustBadges.map((badge) => (
              <div key={badge.title} className="text-center">
                <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center shadow-sm">
                  <svg className="h-4.5 w-4.5 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
          <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-neutral-900 mb-3">
            Still have questions?
          </h2>
          <p className="text-[15px] text-neutral-500 leading-relaxed mb-8">
            Reach out directly or start building your first agreement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:hello@rubylegal.ai"
              className="inline-flex items-center justify-center gap-2 border border-neutral-200 hover:border-neutral-300 text-neutral-700 text-[14px] font-medium px-7 py-3 transition-colors"
            >
              <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Contact Us
            </a>
            <Link
              href="/documents"
              className="inline-flex items-center justify-center gap-2 bg-[#be123c] hover:bg-[#9f1239] text-white text-[14px] font-medium px-7 py-3 transition-colors"
            >
              Draft Your Agreement
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
