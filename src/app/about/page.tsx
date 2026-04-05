'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="px-6 pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] text-[#be123c] mb-6">
            About Ruby Law
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-neutral-900">
            Canada&apos;s first{' '}
            <span className="text-[#be123c]">AI-native law firm.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-neutral-500 max-w-2xl leading-relaxed">
            We built Ruby Law because the legal industry charges founders like they&apos;re Fortune 500 companies. You deserve big-law rigor at a price that makes sense for your stage.
          </p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="px-6 py-16 md:py-20 border-y border-neutral-100 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
          {[
            { number: '27+', label: 'Agreement types' },
            { number: 'Minutes', label: 'Not weeks' },
            { number: '100%', label: 'Licensed & regulated' },
            { number: '$0', label: 'Surprise invoices' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900">
                {stat.number}
              </p>
              <p className="mt-2 text-sm sm:text-base text-neutral-500 tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Ruby Law Exists ── */}
      <section className="px-6 py-28 md:py-36 bg-[#faf9f7]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] text-[#be123c] mb-5">
            Why We Exist
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight mb-10">
            The legal industry wasn&apos;t{' '}
            <br className="hidden md:block" />
            built for founders.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <div className="space-y-6 text-neutral-500 leading-relaxed text-[15px] sm:text-base md:text-lg">
              <p>
                We spent years at institutional firms working on complex corporate, M&amp;A, and securities matters. We watched founders pay <span className="text-neutral-900 font-medium">$8,000+ for shareholder agreements</span> drafted from the same precedent every time.
              </p>
              <p>
                We watched companies delay fundraises because their lawyer took three weeks to turn a SAFE. We watched early-stage teams spend more on legal than on product.
              </p>
            </div>
            <div className="space-y-6 text-neutral-500 leading-relaxed text-[15px] sm:text-base md:text-lg">
              <p>
                The problem isn&apos;t bad lawyers. It&apos;s a broken model. Billable hours punish efficiency. Flat fees still mean slow turnaround. And DIY templates leave you exposed.
              </p>
              <p>
                <span className="text-neutral-900 font-medium">So we started from scratch.</span> We built a law firm where the technology and the legal practice are one thing — not a law firm that bolted AI onto a legacy process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How We're Different ── */}
      <section className="px-6 py-28 md:py-36">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] text-[#be123c] mb-5">
              How We&apos;re Different
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
              Not a template engine.{' '}
              <br className="hidden md:block" />
              A real law firm.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: 'Lawyer-certified at the architecture level',
                description:
                  'Every unique permutation of every agreement is pre-certified by a licensed lawyer. Your contract is production-ready the moment it generates — not after a review cycle.',
                icon: (
                  <svg className="h-6 w-6 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
              {
                title: 'AI-powered customization, not guesswork',
                description:
                  'Need something beyond standard options? The Ruby Customization Wizard drafts custom provisions conversationally. Add optional lawyer review for anything high-stakes.',
                icon: (
                  <svg className="h-6 w-6 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
              },
              {
                title: 'Outcome-based pricing, always',
                description:
                  'You know the price before we start. No billable hours. No surprise invoices. No retainers. One price for drafting, review, revisions, and compliance.',
                icon: (
                  <svg className="h-6 w-6 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-neutral-100 bg-white p-8 sm:p-10 hover:border-neutral-200 hover:shadow-sm transition-all"
              >
                <div className="mb-5 h-12 w-12 rounded-xl bg-neutral-50 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-3 leading-snug">{item.title}</h3>
                <p className="text-[15px] sm:text-base text-neutral-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Approach: Layer 1 + Layer 2 ── */}
      <section className="px-6 py-28 md:py-36 bg-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] text-[#f9a8c9] mb-5">
              Our Approach
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Two layers.{' '}
              <br className="hidden md:block" />
              Zero compromises.
            </h2>
            <p className="mt-6 text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed">
              Most legal tech makes you choose between speed and quality. We engineered a system that gives you both.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Layer 1 */}
            <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-8 sm:p-10">
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#be123c] bg-[#be123c]/10 px-3 py-1 rounded-full">
                  Layer 1
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
                Deterministic Contract Wizard
              </h3>
              <p className="text-[15px] sm:text-base text-neutral-400 leading-relaxed mb-6">
                Built on deep Canadian legal workflows — not generic templates. Every unique permutation of every agreement is <span className="text-white font-medium">pre-certified by a lawyer at the architecture level</span>.
              </p>
              <ul className="space-y-3">
                {[
                  'Production-ready the moment it generates',
                  'Every clause tested against Canadian law',
                  'Provincial regulatory modules built in',
                  'No AI hallucination risk on base contracts',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm sm:text-[15px] text-neutral-300">
                    <svg className="h-5 w-5 text-[#be123c] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Layer 2 */}
            <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-8 sm:p-10">
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#be123c] bg-[#be123c]/10 px-3 py-1 rounded-full">
                  Layer 2
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4 leading-snug">
                AI Customization Wizard
              </h3>
              <p className="text-[15px] sm:text-base text-neutral-400 leading-relaxed mb-6">
                For modifications beyond standard options, Ruby drafts custom provisions through a <span className="text-white font-medium">conversational interface</span> — with optional lawyer review for added confidence.
              </p>
              <ul className="space-y-3">
                {[
                  'Natural language customization requests',
                  'Provisions drafted in your agreement\u2019s style',
                  'Optional lawyer review on any clause',
                  'Full audit trail of every change',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm sm:text-[15px] text-neutral-300">
                    <svg className="h-5 w-5 text-[#be123c] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who We Serve ── */}
      <section className="px-6 py-28 md:py-36">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] text-[#be123c] mb-5">
              Who We Serve
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
              Built for people{' '}
              <br className="hidden md:block" />
              who build things.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                title: 'Founders & Startups',
                description:
                  'Raising capital, hiring your first team, structuring equity. You need real legal agreements, not a three-week wait and a five-figure invoice.',
                tags: ['Shareholder Agreements', 'SAFEs', 'Employment', 'IP Protection'],
              },
              {
                title: 'Creators & Agencies',
                description:
                  'Brand deals, content licensing, platform terms — the legal side of your business shouldn\u2019t cost more than the deal itself.',
                tags: ['Service Contracts', 'Privacy Policies', 'SaaS Agreements', 'Licensing'],
              },
              {
                title: 'Developers & SaaS',
                description:
                  'You\u2019re shipping product, not drafting contracts. We handle SLAs, enterprise licensing, IP assignment, and privacy compliance so legal scales with your codebase.',
                tags: ['SaaS SLAs', 'Enterprise Licensing', 'IP Assignment', 'Privacy'],
              },
              {
                title: 'Growing Teams',
                description:
                  'Your first ten hires set the tone. We draft employment agreements, contractor terms, and IP assignments that protect your business without slowing hiring.',
                tags: ['Employment', 'Contractor Terms', 'Non-Competes', 'Offer Letters'],
              },
            ].map((audience) => (
              <div
                key={audience.title}
                className="rounded-xl border border-neutral-100 bg-white p-8 sm:p-10 hover:border-neutral-200 hover:shadow-sm transition-all"
              >
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 mb-3">{audience.title}</h3>
                <p className="text-[15px] sm:text-base text-neutral-500 leading-relaxed mb-6">{audience.description}</p>
                <div className="flex flex-wrap gap-2">
                  {audience.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-full bg-neutral-50 text-[#be123c] border border-neutral-100"
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

      {/* ── The Team ── */}
      <section className="px-6 py-28 md:py-36 bg-[#faf9f7]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] text-[#be123c] mb-5">
            The Team
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight mb-10">
            Lawyers who code.{' '}
            <br className="hidden md:block" />
            Engineers who read case law.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <div className="space-y-6 text-neutral-500 leading-relaxed text-[15px] sm:text-base md:text-lg">
              <p>
                Ruby Law was founded by <span className="text-neutral-900 font-medium">Brooke Shang</span>, a corporate and securities lawyer who spent years at leading Canadian firms advising on M&amp;A, private placements, and corporate governance.
              </p>
              <p>
                After watching the same inefficiency play out hundreds of times — founders waiting weeks and paying thousands for agreements drafted from the same precedent — she decided to build the firm she wished existed.
              </p>
            </div>
            <div className="space-y-6 text-neutral-500 leading-relaxed text-[15px] sm:text-base md:text-lg">
              <p>
                Ruby Law is not a legal tech startup that hired a lawyer as an afterthought. It&apos;s a <span className="text-neutral-900 font-medium">licensed Canadian law firm</span> that was engineered from day one to deliver legal work faster, better, and at a fraction of the cost.
              </p>
              <p>
                Every agreement on our platform reflects real legal expertise — structured into deterministic workflows, tested against Canadian statute, and backed by lawyers who stand behind the work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Signals ── */}
      <section className="px-6 py-28 md:py-36">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] text-[#be123c] mb-5">
              Why Trust Us
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
              The guardrails that{' '}
              <br className="hidden md:block" />
              make this real.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: 'Licensed & Regulated',
                description: 'Ruby Law is a licensed Canadian law firm, subject to the same professional standards, ethics rules, and regulatory oversight as any national firm.',
              },
              {
                title: 'Lawyer-Solicitor Privilege',
                description: 'Your communications with Ruby Law are protected by solicitor-client privilege. We are your lawyers — not a software vendor.',
              },
              {
                title: 'Pre-Certified Agreements',
                description: 'Every agreement permutation is reviewed and certified by a licensed lawyer at the architecture level before it ever reaches a client.',
              },
              {
                title: 'Provincial Compliance',
                description: 'Built-in regulatory modules for Ontario, BC, Alberta, Quebec, and all Canadian jurisdictions. We handle the compliance so you don\u2019t have to.',
              },
              {
                title: 'Optional Lawyer Review',
                description: 'Any AI-customized provision can be reviewed by a licensed lawyer before finalization. You choose the level of oversight that fits your deal.',
              },
              {
                title: 'Full Audit Trail',
                description: 'Every decision, every clause selection, every customization is logged. Complete transparency on how your agreement was built.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-neutral-100 bg-white p-8 hover:border-neutral-200 hover:shadow-sm transition-all"
              >
                <div className="h-2 w-8 bg-[#be123c] rounded-full mb-5" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2 leading-snug">{item.title}</h3>
                <p className="text-sm sm:text-[15px] text-neutral-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-28 md:py-36 bg-neutral-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Your legal shouldn&apos;t{' '}
            <br className="hidden sm:block" />
            hold you back.
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-neutral-400 mb-12 leading-relaxed max-w-xl mx-auto">
            Generate your first agreement in minutes. See why founders are switching from traditional firms to Ruby Law.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/documents"
              className="inline-flex items-center gap-2.5 bg-[#be123c] hover:bg-[#9f1239] text-white text-base font-medium tracking-wide px-10 py-4 rounded-lg transition-colors w-full sm:w-auto justify-center"
            >
              Start Building
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-neutral-600 hover:border-neutral-400 text-neutral-300 hover:text-white text-base font-medium tracking-wide px-10 py-4 rounded-lg transition-colors w-full sm:w-auto justify-center"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
