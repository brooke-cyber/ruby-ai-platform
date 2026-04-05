'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

/* ── Three-phase product demo animation ── */
function ProductDemo() {
  const [phase, setPhase] = useState(0); // 0=intake, 1=drafting, 2=complete
  const [progress, setProgress] = useState(0);
  const [activeArticle, setActiveArticle] = useState(0);
  const [checks, setChecks] = useState(0);
  const [demoIndex, setDemoIndex] = useState(0);

  const demos = [
    {
      type: 'SAFE Agreement',
      badge: 'Pre-Seed',
      fields: [
        { label: 'Company', value: 'Northvale Technologies Inc.' },
        { label: 'Investor', value: 'Briar Capital Partners LP' },
        { label: 'Jurisdiction', value: 'Ontario (OBCA)' },
        { label: 'Investment', value: '$500,000 CAD' },
        { label: 'Valuation Cap', value: '$5,000,000' },
      ],
      articles: [
        { num: '1', title: 'Definitions', snippet: '"Safe", "Equity Financing", "Dissolution Event", "Liquidity Event"...' },
        { num: '2', title: 'Investment Amount', snippet: '$500,000 CAD wired within 5 business days of execution...' },
        { num: '3', title: 'Conversion Mechanics', snippet: 'Valuation cap $5M, 20% discount, automatic on qualified financing...' },
        { num: '4', title: 'Investor Protections', snippet: 'Pro rata rights at 5% threshold, quarterly financial reporting...' },
        { num: '5', title: 'MFN & Information', snippet: 'Broad MFN with amendment rights, P&L and balance sheet access...' },
        { num: '6', title: 'Dissolution & Liquidity', snippet: 'Investor paid before common on wind-down, change of control...' },
        { num: '7', title: 'Representations', snippet: 'Authority, valid issuance, no conflicts, capitalization table...' },
        { num: '8', title: 'General Provisions', snippet: 'Governing law (Ontario), entire agreement, counterparts...' },
      ],
      checks: [
        'Ontario Securities Act — Exemption provisions verified',
        'Conversion mechanics — Cap and discount validated',
        'Investor rights — Pro rata confirmed',
        'OBCA — Corporate authority met',
        'Tax — Canadian implications addressed',
      ],
      stats: '8 articles \u00b7 34 clauses \u00b7 8,200 words',
      footer: 'Northvale Technologies / Briar Capital Partners',
    },
    {
      type: 'Executive Employment',
      badge: 'VP Engineering',
      fields: [
        { label: 'Employer', value: 'Cedarwood Labs Inc.' },
        { label: 'Executive', value: 'Sarah Chen' },
        { label: 'Jurisdiction', value: 'British Columbia (ESA)' },
        { label: 'Base Salary', value: '$185,000 CAD' },
        { label: 'Equity', value: '0.75% over 4 years' },
      ],
      articles: [
        { num: '1', title: 'Definitions', snippet: '"Employer", "Executive", "Compensation", "Confidential Information"...' },
        { num: '2', title: 'Compensation', snippet: '$185,000 base + 20% target bonus + 0.75% equity vesting 4 years...' },
        { num: '3', title: 'Benefits & Perks', snippet: 'Extended health, dental, $5K annual professional development...' },
        { num: '4', title: 'Restrictive Covenants', snippet: '12-month non-solicit clients, 18-month confidentiality survival...' },
        { num: '5', title: 'IP Assignment', snippet: 'All work product assigned to Employer, moral rights waived...' },
        { num: '6', title: 'Termination', snippet: 'Without cause: 2 weeks per year. Change of control: 12 months...' },
        { num: '7', title: 'Representations', snippet: 'No prior conflicts, authority to enter, accurate background...' },
        { num: '8', title: 'General Provisions', snippet: 'Governing law (BC), entire agreement, independent legal advice...' },
      ],
      checks: [
        'BC Employment Standards — Minimum provisions met',
        'Restrictive covenants — Shafron test passed',
        'Termination — Waksdale holistic test validated',
        'IP assignment — Moral rights addressed',
        'Privacy — PIPA compliance confirmed',
      ],
      stats: '8 articles \u00b7 41 clauses \u00b7 10,600 words',
      footer: 'Cedarwood Labs Inc. / Sarah Chen',
    },
    {
      type: 'Shareholder Agreement',
      badge: 'Two-Party USA',
      fields: [
        { label: 'Party A', value: 'Atlas Foundry Corp.' },
        { label: 'Party B', value: 'Peak Horizon Ventures' },
        { label: 'Jurisdiction', value: 'Ontario (CBCA)' },
        { label: 'Equity Split', value: '60% / 40%' },
        { label: 'Board Size', value: '3 directors' },
      ],
      articles: [
        { num: '1', title: 'Definitions', snippet: '"Shares", "Fair Market Value", "Transfer", "Reserved Matters"...' },
        { num: '2', title: 'Share Structure', snippet: 'Class A (60%) / Class B (40%), voting pari passu, no preference...' },
        { num: '3', title: 'Board Composition', snippet: '3 directors: 2 appointed by Atlas Foundry, 1 by Peak Horizon...' },
        { num: '4', title: 'Transfer Restrictions', snippet: 'ROFR 30-day exercise, tag-along at 50% threshold, drag-along 75%...' },
        { num: '5', title: 'Deadlock Resolution', snippet: 'Mediation \u2192 Arbitration \u2192 Shotgun buy-sell cascade...' },
        { num: '6', title: 'Distributions & Exit', snippet: 'Annual distribution, shotgun exit mechanism, valuation formula...' },
        { num: '7', title: 'Representations', snippet: 'Authority, capacity, no conflicts, accurate disclosure...' },
        { num: '8', title: 'General Provisions', snippet: 'Governing law (Ontario), entire agreement, severability...' },
      ],
      checks: [
        'Corporate governance — Shareholder provisions verified',
        'Transfer restrictions — ROFR enforceability validated',
        'Deadlock — Resolution cascade confirmed',
        'CBCA — Federal compliance requirements met',
        'Tax — Shareholder distribution implications addressed',
      ],
      stats: '8 articles \u00b7 47 clauses \u00b7 12,400 words',
      footer: 'Atlas Foundry Corp. / Peak Horizon Ventures',
    },
  ];

  const demo = demos[demoIndex];

  useEffect(() => {
    // Phase 0: Intake (0-3s) → Phase 1: Drafting (3-8s) → Phase 2: Complete (8-12s) → Reset with next demo
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setPhase(1), 3000));
    timers.push(setTimeout(() => setPhase(2), 9000));
    timers.push(setTimeout(() => {
      setPhase(0);
      setProgress(0);
      setActiveArticle(0);
      setChecks(0);
      setDemoIndex((prev) => (prev + 1) % demos.length);
    }, 13000));

    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 0 ? demoIndex : -1]);

  // Progress bar during drafting phase
  useEffect(() => {
    if (phase !== 1) return;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 1.8, 100));
      setActiveArticle((a) => Math.min(a + 0.12, 8));
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  // Compliance checks during complete phase
  useEffect(() => {
    if (phase !== 2) return;
    setProgress(100);
    setActiveArticle(8);
    const interval = setInterval(() => {
      setChecks((c) => {
        if (c >= 5) { clearInterval(interval); return 5; }
        return c + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [phase]);

  const phaseLabels = ['Intake', 'Drafting', 'Complete'];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.07)] overflow-hidden">
      {/* Top bar */}
      <div className="px-4 sm:px-5 py-3 border-b border-neutral-100 bg-neutral-50/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {phaseLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5 shrink-0">
                <div className={`h-5 w-5 rounded-full text-[10px] font-semibold flex items-center justify-center transition-all duration-500 ${
                  phase > i ? 'bg-[#be123c] text-white' :
                  phase === i ? 'border-2 border-[#be123c] text-[#be123c]' :
                  'border border-neutral-200 text-neutral-300'
                }`}>
                  {phase > i ? (
                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : i + 1}
                </div>
                <span className={`text-[12px] sm:text-[13px] font-medium transition-colors duration-300 ${phase >= i ? 'text-neutral-700' : 'text-neutral-300'}`}>{label}</span>
                {i < 2 && <div className={`w-4 sm:w-6 h-px transition-colors duration-500 ${phase > i ? 'bg-[#be123c]' : 'bg-neutral-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {phase === 1 && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-[#be123c] opacity-40" />
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#be123c]" />
                </span>
                <span className="text-[11px] sm:text-[12px] text-[#be123c] font-medium whitespace-nowrap">Drafting</span>
              </>
            )}
            {phase === 2 && <span className="text-[12px] text-[#be123c] font-medium">Ready</span>}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-neutral-100">
        <div className="h-full bg-[#be123c] transition-all duration-200 ease-out" style={{ width: `${phase === 0 ? 0 : progress}%` }} />
      </div>

      {/* Content area — fixed height with smooth phase transitions */}
      <div className="h-[340px] relative">
        {/* Phase 0: Intake form */}
        <div className={`absolute inset-0 p-5 transition-all duration-500 ${phase === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] uppercase tracking-[0.12em] text-neutral-400 font-medium">Deal Parameters</p>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#be123c] bg-[#be123c]/5 px-2 py-0.5 rounded-full whitespace-nowrap">{demo.type} — {demo.badge}</span>
          </div>
          <div className="space-y-2">
            {demo.fields.map((field, i) => (
              <div
                key={field.label}
                className="flex items-center justify-between py-2 px-3.5 rounded-lg bg-neutral-50/80 border border-neutral-100"
                style={{ animation: phase === 0 ? `fadeSlideIn 0.3s ease-out ${i * 0.08}s both` : 'none' }}
              >
                <span className="text-[13px] text-neutral-400">{field.label}</span>
                <span className="text-[13px] text-neutral-800 font-medium">{field.value}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 flex justify-end">
            <div className="inline-flex items-center gap-1.5 text-[12px] text-[#be123c] font-medium">
              <span className="animate-pulse">Analyzing deal structure</span>
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 2v4m0 12v4m-7.07-2.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-2.93 7.07l-2.83-2.83M6.34 6.34L3.51 3.51" strokeLinecap="round" /></svg>
            </div>
          </div>
        </div>

        {/* Phase 1: Drafting — articles building */}
        <div className={`absolute inset-0 p-5 overflow-y-auto transition-all duration-500 ${phase === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] uppercase tracking-[0.12em] text-neutral-400 font-medium">Ruby Engine — Drafting</p>
            <span className="text-[12px] text-neutral-400 tabular-nums">{Math.floor(activeArticle)}/8 articles</span>
          </div>
          <div className="space-y-1">
            {demo.articles.map((article, i) => {
              const visible = i < activeArticle;
              const active = i === Math.floor(activeArticle) && i < 8;
              if (!visible && !active) return null;
              return (
                <div
                  key={article.num}
                  className={`rounded-lg px-3.5 py-2 transition-all duration-400 ${
                    visible ? 'bg-white border border-neutral-100' :
                    'bg-[#be123c]/[0.03] border border-[#be123c]/20'
                  }`}
                  style={{ animation: 'fadeSlideIn 0.3s ease-out both' }}
                >
                  <div className="flex items-center gap-2">
                    {visible ? (
                      <svg className="h-3 w-3 text-[#be123c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className="relative flex h-3 w-3 items-center justify-center shrink-0">
                        <span className="animate-ping absolute h-2.5 w-2.5 rounded-full bg-[#be123c] opacity-20" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#be123c]" />
                      </span>
                    )}
                    <span className={`text-[13px] font-semibold ${active ? 'text-[#be123c]' : 'text-neutral-800'}`}>
                      Art. {article.num} — {article.title}
                    </span>
                  </div>
                  <p className={`text-[12px] mt-0.5 ml-5 leading-snug ${active ? 'text-[#be123c]/50' : 'text-neutral-400'}`}>
                    {article.snippet}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase 2: Complete — compliance verified */}
        <div className={`absolute inset-0 p-5 transition-all duration-500 ${phase === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#be123c]/10 mb-2">
              <svg className="h-4.5 w-4.5 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-[14px] font-semibold text-neutral-900">Agreement Ready</p>
            <p className="text-[12px] text-neutral-400 mt-0.5">{demo.stats}</p>
          </div>

          <p className="text-[12px] uppercase tracking-[0.12em] text-neutral-400 font-medium mb-2">Compliance Verification</p>
          <div className="space-y-1.5">
            {demo.checks.slice(0, checks).map((check) => (
              <div key={check} className="flex items-start gap-2 animate-[fadeSlideIn_0.3s_ease-out]">
                <svg className="h-3.5 w-3.5 text-[#be123c] shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span className="text-[12px] text-neutral-600 leading-snug">{check}</span>
              </div>
            ))}
          </div>

          {checks >= 5 && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 bg-[#be123c] text-white text-[13px] font-medium px-4 py-1.5 rounded-lg animate-[fadeSlideIn_0.4s_ease-out]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Download Agreement
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
        <span className="text-[10px] text-neutral-400 truncate mr-3">{demo.footer}</span>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex gap-1.5">
            {demos.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === demoIndex ? 'w-4 bg-[#be123c]' : 'w-1.5 bg-neutral-200'}`} />
            ))}
          </div>
          <span className="text-[10px] text-neutral-400 hidden sm:inline">Canadian Compliance</span>
        </div>
      </div>
    </div>
  );
}

/* ── Scroll fade-in hook ── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, className: `transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}` };
}

function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const fade = useFadeIn();
  return <div ref={fade.ref} className={`${fade.className} ${className}`}>{children}</div>;
}

/* ══════════════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      {/* ═══ HERO ═══ */}
      <section className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#be123c]/[0.02] blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left — Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#be123c]/[0.06] border border-[#be123c]/10 rounded-full px-3.5 py-1.5 mb-7">
                <span className="h-1.5 w-1.5 rounded-full bg-[#be123c] animate-pulse shrink-0" />
                <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-[#be123c] whitespace-nowrap">Canada&rsquo;s First AI-Native Law Firm</span>
              </div>

              <h1 className="font-serif text-[2.25rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] leading-[1.06] tracking-tight text-neutral-900">
                Your lawyer is{' '}
                <span className="text-[#be123c]">already here.</span>
              </h1>

              <p className="text-[15px] sm:text-[17px] text-neutral-500 leading-[1.7] mt-7 max-w-md">
                Ruby Law is a licensed Canadian law firm that drafts production-ready legal agreements in minutes, not weeks. Choose your agreement, answer guided questions, and download a contract built to the same standard as Canada&rsquo;s top firms &mdash; at a fraction of the cost.
              </p>

              <div className="flex flex-wrap gap-4 mt-10">
                <Link href="/documents" className="inline-flex items-center gap-2.5 bg-[#be123c] hover:bg-[#9f1239] text-white text-[14px] sm:text-[15px] font-medium tracking-wide px-6 sm:px-8 py-3.5 rounded-md transition-all duration-200 hover:shadow-[0_4px_16px_rgba(190,18,60,0.2)] hover:-translate-y-px active:translate-y-0">
                  Draft Your Agreement
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="/pricing" className="inline-flex items-center gap-2 border border-neutral-200 hover:border-neutral-400 text-neutral-600 text-[14px] sm:text-[15px] font-medium tracking-wide px-6 sm:px-8 py-3.5 rounded-md transition-all duration-200">
                  See Pricing
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-10">
                <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-neutral-500">
                  <svg className="h-3.5 w-3.5 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Licensed &amp; regulated
                </div>
                <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-neutral-500">
                  <svg className="h-3.5 w-3.5 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  27 agreement types
                </div>
                <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-neutral-500">
                  <svg className="h-3.5 w-3.5 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Optional lawyer review
                </div>
              </div>
            </div>

            {/* Right — Product Demo */}
            <div className="relative lg:pl-4">
              <ProductDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THE PROBLEM ═══ */}
      <section className="px-6 py-20 sm:py-28 md:py-36">
        <FadeIn>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#be123c] mb-5">The Problem</p>
            <h2 className="font-serif text-3xl md:text-[2.75rem] leading-[1.12] tracking-tight text-neutral-900 mb-6">
              You&rsquo;re paying $850/hr for a<br className="hidden md:block" /> copy-paste job.
            </h2>
            <p className="text-[15px] sm:text-[16px] text-neutral-500 leading-[1.7] max-w-xl mx-auto mb-14 sm:mb-20">
              Top firms bill 8&ndash;15 hours for a first draft &mdash; $6,800&ndash;$12,750 for a shareholder agreement built from the same precedent they used last time. We built the system that does it in under a minute, with the same legal rigor, for a fixed price you know before you start.
            </p>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
              {[
                { value: '$850', sub: 'Average hourly rate', sub2: 'Top tier law firm' },
                { value: '8–15 hrs', sub: 'Typical drafting time', sub2: 'for a single agreement' },
                { value: 'Minutes', sub: 'Not weeks', sub2: 'same compliance standard', accent: true },
              ].map((s) => (
                <div key={s.value} className="text-center">
                  <div className={`font-serif text-2xl sm:text-3xl md:text-4xl mb-2 ${s.accent ? 'text-[#be123c]' : 'text-neutral-900'}`}>{s.value}</div>
                  <p className="text-[12px] sm:text-[14px] text-neutral-400 leading-relaxed">{s.sub}<br className="hidden sm:block" /><span className="hidden sm:inline"> </span>{s.sub2}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="px-6 py-20 sm:py-28 md:py-36 bg-[#fafaf9]">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#be123c] mb-5">How It Works</p>
            <h2 className="font-serif text-3xl md:text-[2.75rem] leading-[1.12] tracking-tight text-neutral-900 mb-6">
              Four steps. Minutes, not weeks.
            </h2>
            <p className="text-[15px] sm:text-[16px] text-neutral-500 leading-[1.7] max-w-xl mb-14 sm:mb-20">
              No intake calls. No retainers. No waiting weeks. Pick your agreement, answer the questions, and download a production-ready contract.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
            {[
              {
                num: '01',
                title: 'Choose your agreement',
                desc: 'Select from 27 agreement types across 6 practice areas — employment, equity, capital raising, software, platform, and creator agreements.',
              },
              {
                num: '02',
                title: 'Answer guided questions',
                desc: 'Our wizard captures your deal terms, parties, jurisdiction, and preferences — same questions a senior corporate lawyer would ask.',
              },
              {
                num: '03',
                title: 'Get your base contract',
                desc: 'AI generates your agreement in minutes. Download it immediately or add counsel review. Every permutation is pre-certified by a lawyer.',
              },
              {
                num: '04',
                title: 'Customize beyond the standard',
                desc: 'Need something the wizard doesn\u2019t cover? Our Customization Wizard lets you modify, add, or remove clauses through an AI conversation. Optional lawyer review available.',
              },
            ].map((step) => (
              <FadeIn key={step.num}>
                <span className="text-[13px] font-medium tracking-[0.2em] text-[#be123c]">{step.num}</span>
                <h3 className="font-serif text-xl text-neutral-900 mt-3 mb-4">{step.title}</h3>
                <p className="text-[14px] text-neutral-500 leading-[1.75]">{step.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TWO LAYERS ═══ */}
      <section className="px-6 py-20 sm:py-28 md:py-36">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#be123c] mb-5">Two Layers</p>
            <h2 className="font-serif text-3xl md:text-[2.75rem] leading-[1.12] tracking-tight text-neutral-900 mb-6">
              Standard when you can. Custom when you need to.
            </h2>
            <p className="text-[15px] sm:text-[16px] text-neutral-500 leading-[1.7] max-w-xl mb-12 sm:mb-16">
              Most agreements are covered by our pre-certified base contracts. When your deal needs something more, Ruby&apos;s customization layer handles it.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn>
              <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-10 h-full hover:border-[#be123c]/40 hover:shadow-md transition-all duration-300">
                <span className="text-[13px] font-medium tracking-[0.2em] text-[#be123c] uppercase">Layer 1</span>
                <h3 className="font-serif text-xl sm:text-2xl text-neutral-900 mt-3 mb-4">Bulletproof Base Contracts</h3>
                <ul className="space-y-3">
                  {[
                    'Lawyer-engineered from a proprietary clause library',
                    'Every permutation pre-certified by a licensed Canadian lawyer',
                    'Same legal standard as agreements from Canada\'s top firms',
                    'Instant delivery in minutes — not weeks, not months',
                  ].map((item) => (
                    <li key={item} className="text-[14px] text-neutral-500 leading-[1.75] flex items-start gap-3">
                      <svg className="h-4 w-4 text-[#be123c] shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <FadeIn>
              <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-10 h-full hover:border-[#be123c]/40 hover:shadow-md transition-all duration-300">
                <span className="text-[13px] font-medium tracking-[0.2em] text-[#be123c] uppercase">Layer 2</span>
                <h3 className="font-serif text-xl sm:text-2xl text-neutral-900 mt-3 mb-4">AI-Powered Customization</h3>
                <ul className="space-y-3">
                  {[
                    'For modifications beyond the standard options',
                    'Ruby drafts custom clauses through a guided conversation',
                    'Optional lawyer review on every customization',
                    'From $49 per modification',
                  ].map((item) => (
                    <li key={item} className="text-[14px] text-neutral-500 leading-[1.75] flex items-start gap-3">
                      <svg className="h-4 w-4 text-[#be123c] shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ WHY FOUNDERS TRUST US ═══ */}
      <section className="px-6 py-20 sm:py-28 md:py-36">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <FadeIn>
              <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#be123c] mb-5">Why Founders Trust Us</p>
              <h2 className="font-serif text-3xl md:text-[2.75rem] leading-[1.12] tracking-tight text-neutral-900 mb-6">
                Not a template generator.<br className="hidden md:block" /> A real law firm.
              </h2>
              <p className="text-[16px] text-neutral-500 leading-[1.75]">
                Ruby Law is licensed and regulated in Canada. Every agreement is drafted from our proprietary clause library &mdash; the same legal methodology as top-tier firms, with AI that enforces compliance automatically. You get the quality of a $50,000 retainer without the retainer.
              </p>
            </FadeIn>

            <FadeIn>
              <div className="space-y-8">
                {[
                  { title: 'Built for your deal, not from a template', desc: 'Every clause is tailored to your specific parties, terms, and jurisdiction. You choose from three negotiating positions — client-favorable, balanced, or counter-party — based on your deal dynamics.' },
                  { title: 'Every clause tested for enforceability', desc: 'Ruby applies the same enforceability standards that top Canadian courts require. Restrictive covenants, termination clauses, transfer restrictions — all validated before you see them.' },
                  { title: 'Canadian compliance, handled automatically', desc: 'Securities exemptions, employment standards, corporate governance, privacy law — our system detects which rules apply to your deal and builds them in. You don\u2019t have to ask.' },
                ].map((item) => (
                  <div key={item.title} className="border-l-2 border-neutral-100 pl-6 hover:border-[#be123c]/40 transition-colors duration-300">
                    <h3 className="text-[14px] font-semibold text-neutral-900 mb-1.5">{item.title}</h3>
                    <p className="text-[15px] text-neutral-500 leading-[1.75]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ TRUST / RISK REVERSAL ═══ */}
      <section className="px-6 py-20 border-y border-neutral-100">
        <FadeIn>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
              {[
                {
                  icon: <svg className="h-6 w-6 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>,
                  title: 'A real, licensed law firm',
                  desc: 'Licensed and regulated in Canada. Your documents carry the same legal weight as any top-tier firm.',
                },
                {
                  icon: <svg className="h-6 w-6 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
                  title: 'Approval or advice to change',
                  desc: 'Every counsel-tier document gets a formal sign-off from your lawyer — or specific, actionable feedback on what to fix before signing.',
                },
                {
                  icon: <svg className="h-6 w-6 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
                  title: 'Your data stays in Canada',
                  desc: 'All data hosted in Canadian data centers. Encrypted in transit and at rest. We never move your information outside the country.',
                },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-neutral-50 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-[14px] font-semibold text-neutral-900 mb-2">{item.title}</h3>
                  <p className="text-[15px] text-neutral-500 leading-[1.7]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══ AGREEMENT TYPES ═══ */}
      <section className="px-6 py-20 sm:py-28 md:py-36 bg-[#fafaf9]">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[13px] font-medium uppercase tracking-[0.25em] text-[#be123c] mb-5">Agreements</p>
            <h2 className="font-serif text-3xl md:text-[2.75rem] leading-[1.12] tracking-tight text-neutral-900 mb-16">
              Six practice areas. Full coverage.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { category: 'Hiring & Team', href: '/documents', items: ['Employment Agreements (Standard & Executive)', 'Fixed-Term & Project-Based Contracts', 'Independent Contractor Agreements', 'Non-Compete & Non-Solicitation', 'Confidentiality & IP Protection', 'Offer Letters'], from: 'From $99', tag: '7 agreement types' },
              { category: 'Equity & Governance', href: '/documents', items: ['Co-Founder & Shareholder Agreements', 'Incorporation & Corporate Formation', 'Joint Venture & Investor Agreements', '50/50 Partnership & Deadlock Resolution', 'Partnership Agreements'], from: 'From $149', tag: '9 agreement types' },
              { category: 'Raising Capital', href: '/documents', items: ['SAFE Agreements (Canadian)', 'Convertible Note Agreements', 'Bilateral Loan Agreements', 'Demand Promissory Notes', 'Revolving Credit Facilities'], from: 'From $199', tag: '5 agreement types' },
              { category: 'Software & Services', href: '/documents', items: ['Service Level Agreements (SaaS)', 'Managed Services Agreements', 'Enterprise Licensing Agreements', 'Terms & Conditions', 'Privacy Policies', 'Master Services Agreements'], from: 'From $199', tag: '6 agreement types' },
              { category: 'Platform & Business', href: '/documents', items: ['Website Terms & Conditions', 'Privacy Policies', 'Partnership Agreements', 'Master Services Agreements'], from: 'From $199', tag: '4 agreement types' },
              { category: 'Creator & Influencer', href: '/documents', items: ['Influencer & Brand Partnership Agreements', 'Privacy Policies for Campaigns', 'Confidentiality & IP Protection', 'Contractor Agreements for Creators', 'Exclusivity & Non-Compete'], from: 'From $149', tag: '5 agreement types' },
            ].map((group) => (
              <FadeIn key={group.category}>
                <Link href={group.href} className="block bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 h-full hover:border-[#be123c]/40 hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="font-serif text-lg text-neutral-900 group-hover:text-[#be123c] transition-colors">{group.category}</h3>
                    <span className="text-[15px] font-medium text-[#be123c]">{group.from}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {group.items.map((item) => (
                      <li key={item} className="text-[14px] sm:text-[15px] text-neutral-500 flex items-center gap-3">
                        <span className="w-1 h-1 rounded-full bg-neutral-300 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-neutral-400 tracking-wide uppercase">{group.tag}</p>
                    <svg className="h-4 w-4 text-neutral-300 group-hover:text-[#be123c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="px-6 py-20">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
              {[
                { stat: 'Minutes', label: 'Not weeks', href: '/documents' },
                { stat: '27', label: 'Agreement types', href: '/documents' },
                { stat: '100%', label: 'Canadian compliant', href: '/about' },
                { stat: 'From $49', label: 'Per customization', href: '/pricing' },
              ].map((item, i) => (
                <Link key={i} href={item.href} className="text-center group">
                  <div className="font-serif text-2xl sm:text-3xl text-neutral-900 mb-1 group-hover:text-[#be123c] transition-colors">{item.stat}</div>
                  <p className="text-[13px] text-neutral-400 tracking-wide uppercase">{item.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="px-6 py-20 sm:py-28 md:py-36 border-t border-neutral-100">
        <FadeIn>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-[2.75rem] text-neutral-900 tracking-tight leading-[1.1] mb-6">
              Stop waiting weeks.<br />Start drafting now.
            </h2>
            <p className="text-[15px] sm:text-[16px] text-neutral-500 mb-10 leading-[1.7]">
              27 agreement types. Six practice areas. Instant delivery.<br className="hidden md:block" /> Add a licensed Canadian lawyer review for any agreement.
            </p>
            <Link href="/documents" className="inline-flex items-center gap-2.5 bg-[#be123c] hover:bg-[#9f1239] text-white text-[14px] sm:text-[15px] font-medium tracking-wide px-8 sm:px-10 py-4 rounded-md transition-all duration-200 hover:shadow-[0_4px_16px_rgba(190,18,60,0.2)] hover:-translate-y-px active:translate-y-0">
              Draft Your First Agreement
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <p className="text-[13px] text-neutral-400 mt-6 tracking-wide uppercase">Canada&rsquo;s first AI-native law firm · Licensed &amp; regulated · No retainer required</p>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
