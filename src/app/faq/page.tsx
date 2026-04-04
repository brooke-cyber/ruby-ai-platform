'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqCategories: FAQCategory[] = [
    {
      title: 'General',
      items: [
        {
          question: 'What is Ruby Law?',
          answer:
            'Ruby Law is Canada\u2019s first AI-native law firm built on a two-layer model. Layer 1 is a deterministic contract wizard — you answer questions, select clause positions, and we generate a production-ready base contract with Canadian compliance built in. Layer 2 is the AI Customization Wizard — after purchasing your base contract, you can modify, add, or remove clauses through an AI-powered conversation. Every counsel-tier document is reviewed by a licensed Canadian lawyer.',
        },
        {
          question: 'How is this different from a template service?',
          answer:
            'Templates give you a generic document with blanks to fill in. We build each agreement from scratch based on your specific deal — your parties, your terms, your jurisdiction. Every clause is tailored and compliance-checked for Canadian law. It\u2019s the difference between a form letter and a custom-drafted agreement.',
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
      items: [
        {
          question: 'How long does it take to get my document?',
          answer:
            'Self-serve documents are generated in minutes. Counsel-tier documents — which include a plain-language memo, redline markup, specific legal advice, and a formal sign-off from a licensed Canadian lawyer — are typically delivered within 1-4 hours depending on complexity.',
        },
        {
          question: 'What documents can you generate?',
          answer:
            'We cover six categories: Hiring & Team (7 types — standard, executive, fixed-term, contractor, non-compete, IP assignment, offer letters), Equity & Governance (8 types — five shareholder agreement structures, articles of incorporation and amendment, partnership), Raising Capital (5 types — SAFE, convertible note, bilateral loan, demand note, revolving credit), Software & Services (3 types — SaaS, managed services, and enterprise SLAs), Platform & Business (3 types — terms & conditions, privacy policy, MSA), and Creator & Influencer (1 type — influencer/brand partnership). 27 agreement types in total.',
        },
        {
          question: 'What if I need changes after delivery?',
          answer:
            'Expert Draft documents can be re-generated with updated parameters at no additional cost. For counsel-tier documents, your lawyer provides specific guidance on any changes needed. You can also use our Customization Wizard to make modifications at any time.',
        },
        {
          question: 'What is the Customization Wizard?',
          answer:
            'After purchasing your base contract, you can optionally customize it through our AI-powered Customization Wizard. Describe what you need, our AI drafts the modification through a conversation, and you choose between AI-Only delivery (instant) or AI + Lawyer Review (3-5 days standard, 24 hours priority).',
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
      items: [
        {
          question: 'Why does pricing vary between agreements?',
          answer:
            'More complex agreements require more clauses, more compliance checks, and more legal reasoning. A simple offer letter costs less than a shareholder agreement with deadlock resolution and exit mechanics. Every price is transparent — you know the cost before you start.',
        },
        {
          question: 'Do bundles save money?',
          answer:
            'Yes. Our bundles — Formation, Seed Round, Employment, Creator, and Growth — package commonly-needed documents together at a significant discount versus buying individually. Every bundle includes counsel-level lawyer review.',
        },
        {
          question: 'How much does customization cost?',
          answer:
            'Customization is priced by complexity: Simple modifications (threshold changes, single-clause removals) start at $49. Standard modifications (new language, custom schedules, party additions) are $129. Complex modifications (novel provisions, multi-clause changes, regulatory implications) are $299. Volume discounts apply: 20% off the 2nd modification, 40% off the 3rd and beyond.',
        },
        {
          question: 'Is there a free tier?',
          answer:
            'Not currently. Every document includes AI generation with full compliance analysis, which requires significant computational and legal infrastructure. What you get is a real, enforceable legal document — not a draft or template.',
        },
      ],
    },
    {
      title: 'Quality & Compliance',
      items: [
        {
          question: 'Can I trust AI-generated legal documents?',
          answer:
            'Our AI drafts the agreement. A licensed Canadian lawyer reviews it. For counsel-tier documents, you receive a formal approval to proceed — or specific advice on what to change before signing. You get the speed of AI with the accountability of a real lawyer who puts their name on it.',
        },
        {
          question: 'How do you handle Canadian compliance?',
          answer:
            'Every document is built with Canadian law baked in — securities rules for investment docs, employment standards for hiring agreements, corporate governance for shareholder agreements, and privacy law for commercial contracts. Our system detects which rules apply to your deal and builds them in automatically.',
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
    { title: 'Licensed Practice', description: 'Regulated Canadian law firm' },
    { title: 'Canadian Data', description: 'Hosted in Canada, always' },
    { title: 'Securities Compliant', description: 'Investment docs covered' },
    { title: 'Privacy Compliant', description: 'Canadian privacy law built in' },
    { title: 'Transparent Pricing', description: 'Know the cost upfront' },
    { title: 'Lawyer-Reviewed', description: 'Every counsel document' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="px-6 pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="max-w-4xl mx-auto">
          <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#be123c] mb-5">
            FAQ
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] tracking-tight text-gray-900">
            Questions?{' '}
            <span className="text-[#be123c]">
              We&apos;ve got answers.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed">
            Everything you need to know about Ruby Law, our documents, pricing, and how we work.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto space-y-16">
          {faqCategories.map((category, categoryIndex) => {
            const globalOffset = faqCategories
              .slice(0, categoryIndex)
              .reduce((sum, cat) => sum + cat.items.length, 0);

            return (
              <div key={categoryIndex}>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  {category.title}
                </h2>
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => {
                    const globalIndex = globalOffset + itemIndex;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div
                        key={itemIndex}
                        className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:border-gray-200 transition-colors"
                      >
                        <button
                          onClick={() => toggleOpen(globalIndex)}
                          className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                        >
                          <span className="text-base md:text-lg font-semibold text-gray-900 pr-4">
                            {item.question}
                          </span>
                          <div className="flex-shrink-0">
                            <svg
                              className={`w-5 h-5 text-[#be123c] transition-transform duration-300 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </button>
                        {isOpen && (
                          <div className="border-t border-gray-100 px-6 md:px-8 py-5 md:py-6 bg-[#faf9f7]">
                            <p className="text-gray-500 leading-relaxed">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-16 md:py-24 bg-[#faf9f7]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-[15px] font-semibold uppercase tracking-[0.2em] text-[#be123c] mb-3">Why Trust Us</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">Built for confidence</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-3 mx-auto h-10 w-10 rounded-full bg-neutral-50 flex items-center justify-center">
                  <svg className="h-5 w-5 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-0.5">{badge.title}</p>
                <p className="text-xs text-gray-500">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-4 py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-3">Still have questions?</h2>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            We&apos;re here to help. Reach out directly or start generating your first document.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@rubylegal.ai"
              className="btn-secondary !px-8 !py-4 !text-base inline-flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Contact Us
            </a>
            <Link href="/documents" className="btn-primary !px-8 !py-4 !text-base inline-flex items-center justify-center gap-2">
              Start Building
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
