import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-dark-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,26,26,0.15),transparent)]" />
        <div className="relative container-wide py-32 md:py-44">
          <div className="max-w-3xl">
            <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-neutral-500 mb-8">
              For Founders Law
            </p>
            <h1 className="font-display text-display-xl text-white text-balance">
              Draft agreements with confidence
            </h1>
            <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-xl">
              AI-powered contract drafting with real-time Canadian regulatory
              compliance. Employment, corporate governance, investment, and
              commercial practice areas.
            </p>
            <div className="mt-12 flex items-center gap-5">
              <Link href="/agreements" className="btn-ruby">
                Browse Agreements
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-neutral-400 hover:text-white transition-colors duration-200"
              >
                How it works
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-neutral-200/60 bg-white">
        <div className="container-wide py-10">
          <div className="grid grid-cols-4 gap-8">
            {[
              { value: "20", label: "Agreement Types" },
              { value: "4", label: "Practice Areas" },
              { value: "13", label: "Jurisdictions" },
              { value: "33", label: "Compliance Modules" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-display-sm text-dark-900">{stat.value}</p>
                <p className="text-[13px] text-neutral-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center max-w-xl mx-auto mb-18">
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-ruby-700 mb-4">
              Practice Areas
            </p>
            <h2 className="font-display text-display-md text-dark-900">
              Four areas of expertise
            </h2>
            <p className="mt-4 text-neutral-500 leading-relaxed">
              Select a category to browse available agreements across our full practice.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {[
              {
                category: "employment",
                title: "Employment",
                count: 7,
                description: "Employment agreements, restrictive covenants, IP assignments, and contractor engagements for Canadian workplaces.",
              },
              {
                category: "corporate",
                title: "Corporate Governance",
                count: 7,
                description: "Shareholder agreements, articles of incorporation, and governance documents under CBCA and provincial statutes.",
              },
              {
                category: "investment",
                title: "Investment",
                count: 3,
                description: "SAFE agreements for pre-seed, seed, and bridge financing with NI 45-106 prospectus exemption compliance.",
              },
              {
                category: "commercial",
                title: "Commercial",
                count: 3,
                description: "Service level agreements for SaaS, managed services, and enterprise licensing with PIPEDA and CASL compliance.",
              },
            ].map((cat) => (
              <Link
                key={cat.category}
                href={`/agreements?category=${cat.category}`}
                className="card card-hover p-10 group"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                    {cat.title}
                  </span>
                  <span className="text-[13px] text-neutral-400">{cat.count} agreements</span>
                </div>
                <h3 className="font-display text-[1.75rem] text-dark-900 group-hover:text-ruby-700 transition-colors duration-300 leading-tight">
                  {cat.title}
                </h3>
                <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-8 flex items-center gap-2 text-[13px] font-medium text-ruby-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Browse agreements
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-padding bg-dark-950">
        <div className="container-wide">
          <div className="text-center max-w-xl mx-auto mb-22">
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-neutral-500 mb-4">
              Process
            </p>
            <h2 className="font-display text-display-md text-white">
              Three steps to your draft
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-16">
            {[
              {
                step: "01",
                title: "Select",
                description: "Browse 20 agreement types across 4 practice areas. Bundle multiple for volume pricing. Choose self-serve or counsel review.",
              },
              {
                step: "02",
                title: "Configure",
                description: "Complete the guided intake with party information, jurisdiction, compliance triggers, and clause position preferences.",
              },
              {
                step: "03",
                title: "Generate",
                description: "AI generates your draft with full regulatory compliance. Self-serve delivers instantly. Counsel tier includes review by Brooke Ash, J.D.",
              },
            ].map((s) => (
              <div key={s.step}>
                <span className="font-display text-[5rem] leading-none text-dark-700">{s.step}</span>
                <h3 className="mt-6 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-3 text-sm text-neutral-500 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-wide text-center">
          <h2 className="font-display text-display-md text-dark-900 text-balance">
            Ready to draft your agreement?
          </h2>
          <p className="text-neutral-500 mt-4 max-w-md mx-auto leading-relaxed">
            Start with the agreement library and generate a compliance-verified
            draft in minutes.
          </p>
          <div className="mt-10">
            <Link href="/agreements" className="btn-primary">
              Browse Agreements
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
