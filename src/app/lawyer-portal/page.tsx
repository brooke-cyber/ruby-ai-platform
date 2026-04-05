'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════
   DEMO DATA
   ═══════════════════════════════════════════════════════ */

const PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
];

const DESIGNATIONS = ['Barrister & Solicitor', 'Avocat(e)'];

const PRACTICE_AREAS = [
  'Corporate/Commercial', 'Employment', 'Privacy/Data', 'Securities',
  'IP', 'Lending', 'Real Estate', 'Litigation',
];

const CONTRACT_TYPES = [
  'All Types', 'Convertible Note', 'Shareholder Agreement', 'Executive Employment',
  'SAFE Agreement', 'IP Assignment Agreement', 'Subscription Agreement',
];

interface QueueCase {
  id: string;
  title: string;
  modRef: string;
  priority: boolean;
  submitted: string;
  complexity: 'Simple' | 'Standard' | 'Complex';
  modCount: number;
  province: string;
  agentSummary: string;
  confidence: number;
  slaHours: number;
  slaMax: number;
  contractType: string;
}

const QUEUE_CASES: QueueCase[] = [
  {
    id: 'q1',
    title: 'Convertible Note',
    modRef: '#MOD-2026-0847',
    priority: true,
    submitted: '2026-04-04',
    complexity: 'Complex',
    modCount: 3,
    province: 'Ontario',
    agentSummary: 'Valuation cap reduced from $8M to $5M with new MFN clause. Review Agent flagged potential dilution conflict with existing SAFE holders.',
    confidence: 87,
    slaHours: 6,
    slaMax: 24,
    contractType: 'Convertible Note',
  },
  {
    id: 'q2',
    title: 'Shareholder Agreement',
    modRef: '#MOD-2026-0851',
    priority: true,
    submitted: '2026-04-04',
    complexity: 'Complex',
    modCount: 5,
    province: 'British Columbia',
    agentSummary: 'Drag-along threshold lowered to 60%. New shotgun clause added. Review Agent notes BC-specific regulatory considerations.',
    confidence: 72,
    slaHours: 11,
    slaMax: 24,
    contractType: 'Shareholder Agreement',
  },
  {
    id: 'q3',
    title: 'Executive Employment',
    modRef: '#MOD-2026-0839',
    priority: false,
    submitted: '2026-04-03',
    complexity: 'Standard',
    modCount: 2,
    province: 'Alberta',
    agentSummary: 'Non-compete period extended to 24 months. Termination clause modified to include change-of-control trigger.',
    confidence: 94,
    slaHours: 38,
    slaMax: 72,
    contractType: 'Executive Employment',
  },
  {
    id: 'q4',
    title: 'SAFE Agreement',
    modRef: '#MOD-2026-0855',
    priority: false,
    submitted: '2026-04-03',
    complexity: 'Simple',
    modCount: 1,
    province: 'Ontario',
    agentSummary: 'Standard post-money SAFE with $3M cap. Single modification to discount rate (20% to 25%). No regulatory flags.',
    confidence: 98,
    slaHours: 52,
    slaMax: 72,
    contractType: 'SAFE Agreement',
  },
  {
    id: 'q5',
    title: 'IP Assignment Agreement',
    modRef: '#MOD-2026-0860',
    priority: false,
    submitted: '2026-04-02',
    complexity: 'Standard',
    modCount: 2,
    province: 'Quebec',
    agentSummary: 'Moral rights waiver added per Quebec Civil Code requirements. Scope of assigned IP broadened to include future works.',
    confidence: 91,
    slaHours: 44,
    slaMax: 72,
    contractType: 'IP Assignment Agreement',
  },
];

interface MyCase {
  id: string;
  title: string;
  modRef: string;
  priority: boolean;
  submitted: string;
  complexity: 'Simple' | 'Standard' | 'Complex';
  modCount: number;
  province: string;
  agentSummary: string;
  confidence: number;
  slaHours: number;
  slaMax: number;
  status: 'in-review' | 'awaiting-client';
  claimedAt: string;
  progress: number; // 0-100
}

const INITIAL_MY_CASES: MyCase[] = [
  {
    id: 'm1',
    title: 'Convertible Note',
    modRef: '#MOD-2026-0832',
    priority: true,
    submitted: '2026-04-02',
    complexity: 'Complex',
    modCount: 4,
    province: 'Ontario',
    agentSummary: 'Interest rate changed from 5% to 8% with new qualified financing threshold at $1M. Maturity date shortened.',
    confidence: 79,
    slaHours: 3,
    slaMax: 24,
    status: 'in-review',
    claimedAt: '2026-04-03',
    progress: 65,
  },
  {
    id: 'm2',
    title: 'Shareholder Agreement',
    modRef: '#MOD-2026-0818',
    priority: false,
    submitted: '2026-04-01',
    complexity: 'Standard',
    modCount: 2,
    province: 'British Columbia',
    agentSummary: 'Pre-emptive rights modified for Series A round. Board composition clause updated.',
    confidence: 92,
    slaHours: 28,
    slaMax: 72,
    status: 'awaiting-client',
    claimedAt: '2026-04-02',
    progress: 80,
  },
  {
    id: 'm3',
    title: 'Executive Employment',
    modRef: '#MOD-2026-0805',
    priority: false,
    submitted: '2026-03-31',
    complexity: 'Simple',
    modCount: 1,
    province: 'Alberta',
    agentSummary: 'Equity vesting schedule changed from 4-year to 3-year with 1-year cliff maintained.',
    confidence: 96,
    slaHours: 46,
    slaMax: 72,
    status: 'in-review',
    claimedAt: '2026-04-01',
    progress: 30,
  },
];

interface MessageThread {
  sender: string;
  text: string;
  timestamp: string;
  isLawyer: boolean;
}

interface Message {
  id: string;
  agreementName: string;
  clientName: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  thread: MessageThread[];
}

const MESSAGES: Message[] = [
  {
    id: 'msg1',
    agreementName: 'Convertible Note — #MOD-2026-0832',
    clientName: 'James T.',
    preview: 'Thanks for the quick turnaround. One question about the valuation cap language in Section 3.2 — can we adjust the...',
    timestamp: '2 hours ago',
    unread: true,
    thread: [
      { sender: 'You', text: 'I\'ve completed the initial review of the modifications to Section 3.2. The valuation cap change from $8M to $5M is within market range, but I wanted to flag the potential dilution impact on existing SAFE holders. I\'ve added a note to the clause delta.', timestamp: 'Apr 4, 10:15 AM', isLawyer: true },
      { sender: 'James T.', text: 'Thanks for the quick turnaround. One question about the valuation cap language in Section 3.2 — can we adjust the anti-dilution protection to be broad-based weighted average instead of full ratchet? Our lead investor is pushing for this.', timestamp: 'Apr 4, 12:30 PM', isLawyer: false },
    ],
  },
  {
    id: 'msg2',
    agreementName: 'Shareholder Agreement — #MOD-2026-0818',
    clientName: 'Priya M.',
    preview: 'We discussed the drag-along changes with our board and would like to proceed with the 75% threshold instead of...',
    timestamp: '5 hours ago',
    unread: true,
    thread: [
      { sender: 'You', text: 'The drag-along threshold at 60% is lower than standard. I recommend keeping it at 75% to protect minority shareholders per BC Business Corporations Act best practices.', timestamp: 'Apr 3, 3:00 PM', isLawyer: true },
      { sender: 'Priya M.', text: 'We discussed the drag-along changes with our board and would like to proceed with the 75% threshold instead of 60%. Can you also review the shotgun clause timeline? 90 days feels too short for our situation.', timestamp: 'Apr 4, 9:45 AM', isLawyer: false },
    ],
  },
  {
    id: 'msg3',
    agreementName: 'SAFE Agreement — #MOD-2026-0791',
    clientName: 'David K.',
    preview: 'All looks good on our end. Please proceed with the final version. We will coordinate signing with the investor next...',
    timestamp: 'Yesterday',
    unread: false,
    thread: [
      { sender: 'You', text: 'The discount rate change from 20% to 25% has been reviewed and approved. All regulatory checks passed. I\'ve finalized the document.', timestamp: 'Apr 3, 11:00 AM', isLawyer: true },
      { sender: 'David K.', text: 'All looks good on our end. Please proceed with the final version. We will coordinate signing with the investor next Tuesday.', timestamp: 'Apr 3, 2:15 PM', isLawyer: false },
    ],
  },
];

interface HistoryEntry {
  id: string;
  agreementName: string;
  client: string;
  complexity: 'Simple' | 'Standard' | 'Complex';
  decision: 'Approved' | 'Approved with Edit';
  reviewTime: string;
  date: string;
}

const HISTORY: HistoryEntry[] = [
  { id: 'h1', agreementName: 'SAFE Agreement — #MOD-2026-0791', client: 'David K.', complexity: 'Simple', decision: 'Approved', reviewTime: '1h 12m', date: '2026-04-03' },
  { id: 'h2', agreementName: 'Executive Employment — #MOD-2026-0780', client: 'Nadia S.', complexity: 'Standard', decision: 'Approved with Edit', reviewTime: '2h 45m', date: '2026-04-02' },
  { id: 'h3', agreementName: 'Convertible Note — #MOD-2026-0775', client: 'Liam C.', complexity: 'Complex', decision: 'Approved with Edit', reviewTime: '4h 18m', date: '2026-04-02' },
  { id: 'h4', agreementName: 'IP Assignment — #MOD-2026-0762', client: 'Sarah L.', complexity: 'Simple', decision: 'Approved', reviewTime: '0h 48m', date: '2026-04-01' },
  { id: 'h5', agreementName: 'Shareholder Agreement — #MOD-2026-0758', client: 'Michael R.', complexity: 'Complex', decision: 'Approved with Edit', reviewTime: '5h 02m', date: '2026-03-31' },
  { id: 'h6', agreementName: 'SAFE Agreement — #MOD-2026-0749', client: 'Emma W.', complexity: 'Standard', decision: 'Approved', reviewTime: '1h 35m', date: '2026-03-30' },
];

/* Case review detail data */
const REVIEW_DETAIL = {
  recommendation: 'APPROVE' as const,
  confidence: 79,
  escalationReason: null as string | null,
  slaCountdown: '3h 12m remaining',
  clauseTitle: 'Section 4.2 — Interest Rate',
  before: `4.2 Interest Rate. The Note shall bear simple interest at the rate of five percent (5%) per annum from the date of issuance until converted or repaid, calculated on the basis of a 365-day year.`,
  after: `4.2 Interest Rate. The Note shall bear simple interest at the rate of eight percent (8%) per annum from the date of issuance until converted or repaid, calculated on the basis of a 365-day year. Interest shall compound annually on each anniversary of the issuance date.`,
  clauseLibrary: {
    variantName: 'Standard Convertible Note Interest — Variant B (Compounding)',
    similarity: 91,
    source: 'Ruby Clause Library v2.4',
    note: 'Matches 14 of 16 tokens. Compounding anniversary language is standard. Rate of 8% is above the 75th percentile for Ontario convertible notes.',
  },
  regulatoryChecklist: [
    { item: 'Ontario Securities Act — Prospectus Exemption', status: 'green' as const },
    { item: 'OBCA — Corporate Authority & Capacity', status: 'green' as const },
    { item: 'Income Tax Act — Interest Deductibility', status: 'amber' as const },
    { item: 'Anti-Avoidance (GAAR) — No Concerns', status: 'green' as const },
    { item: 'Consumer Protection Act — N/A', status: 'green' as const },
  ],
  conversationSummary: 'Client requested interest rate increase from 5% to 8% following investor negotiations. Maturity date shortened from 24 to 18 months. Client confirmed understanding of compounding impact. Investor counsel has reviewed and approved the modified terms.',
  fullTranscript: [
    { role: 'Client', text: 'We need to update the interest rate on our convertible note from 5% to 8%. Our lead investor is requesting this change.', time: 'Apr 2, 2:30 PM' },
    { role: 'Ruby AI', text: 'I can help with that modification. Just to confirm — you want to change Section 4.2 Interest Rate from 5% to 8% per annum. Would you also like to add compounding interest language?', time: 'Apr 2, 2:31 PM' },
    { role: 'Client', text: 'Yes, please add annual compounding. The investor also wants us to shorten the maturity from 24 to 18 months.', time: 'Apr 2, 2:35 PM' },
    { role: 'Ruby AI', text: 'Understood. I\'ve prepared the modifications. Please note that the 8% rate with compounding exceeds the median rate for comparable Ontario convertible notes (median: 6%). The shortened maturity may also have tax implications under CRA guidelines. These will be flagged for lawyer review.', time: 'Apr 2, 2:36 PM' },
    { role: 'Client', text: 'That\'s fine, we\'re comfortable with the rate. Our investor counsel has reviewed and is okay with these terms.', time: 'Apr 2, 3:00 PM' },
    { role: 'Ruby AI', text: 'Great. I\'ve submitted the modifications for lawyer review. You\'ll hear back within the SLA window.', time: 'Apr 2, 3:01 PM' },
  ],
  riskFlags: [
    { flag: 'Interest rate exceeds market median for comparable convertible notes in Ontario (median: 6%)', severity: 'medium' as const, source: 'Market Analysis Agent' },
    { flag: 'Compounding interest clause added without explicit pre-payment discount mechanism', severity: 'medium' as const, source: 'Review Agent' },
    { flag: 'Shortened maturity may trigger accelerated tax recognition under CRA guidelines', severity: 'low' as const, source: 'Regulatory Agent' },
  ],
  promotionLog: {
    similarPatterns: [
      { description: 'Interest rate increase (5% to 7%) on convertible note', outcome: 'Approved', date: '2026-03-15' },
      { description: 'Compounding interest added to promissory note', outcome: 'Approved with Edit', date: '2026-02-28' },
      { description: 'Interest rate increase (4% to 9%) with shortened maturity', outcome: 'Approved with Edit', date: '2026-02-10' },
    ],
    approvalRate: 94,
    avgReviewTime: '2h 15m',
  },
};

/* ═══════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════ */

/* Checkmark icon */
function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ── Auth Gate ── */
function AuthGate({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin();
    }, 800);
  };

  const inputClass = "w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] transition-all";
  const selectClass = "w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] bg-white transition-all";

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#faf9f7]">
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#be123c]/10 mb-4">
            <svg className="h-6 w-6 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">Ruby Lawyer Portal</h1>
          <p className="text-neutral-500 mt-1 text-sm">Review pipeline for licensed Canadian lawyers</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
          {mode === 'login' ? (
            <>
              <h2 className="font-serif text-xl font-semibold text-neutral-900 mb-6">Sign In</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                  <input type="email" placeholder="counsel@lawfirm.ca" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                  <input type="password" placeholder="Enter password" className={inputClass} />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#be123c] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#9f1239] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode('register')}
                  className="text-sm text-[#be123c] hover:text-[#9f1239] font-medium transition-colors"
                >
                  Register as a Reviewer &rarr;
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setMode('login')} className="text-neutral-400 hover:text-neutral-700 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <h2 className="font-serif text-xl font-semibold text-neutral-900">Register as a Reviewer</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Legal Name</label>
                  <input type="text" placeholder="e.g. Jane Doe, B.A., J.D." className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                  <input type="email" placeholder="counsel@lawfirm.ca" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Law Society Number</label>
                  <input type="text" placeholder="e.g. 12345A" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jurisdiction</label>
                  <select
                    value={selectedJurisdiction}
                    onChange={(e) => setSelectedJurisdiction(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select province or territory</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Designation</label>
                  <select
                    value={selectedDesignation}
                    onChange={(e) => setSelectedDesignation(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select designation</option>
                    {DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Practice Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {PRACTICE_AREAS.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleArea(area)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                          selectedAreas.includes(area)
                            ? 'bg-[#be123c] text-white border-[#be123c] shadow-sm'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#be123c]/40 hover:bg-[#be123c]/5'
                        }`}
                      >
                        {selectedAreas.includes(area) && (
                          <span className="mr-1">&#10003;</span>
                        )}
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                  <input type="password" placeholder="Create password (min. 10 characters)" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm Password</label>
                  <input type="password" placeholder="Re-enter password" className={inputClass} />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#be123c] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#9f1239] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Creating account...
                    </span>
                  ) : 'Create Account'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode('login')}
                  className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </>
          )}
        </div>

          {/* Demo hint */}
          <p className="text-center text-xs text-neutral-400 mt-6">
            Demo mode — click Sign In or Create Account to continue.
          </p>
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, accent, icon }: { label: string; value: number; accent: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-neutral-500">{label}</span>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

/* ── SLA Badge with color coding ── */
function SlaBadge({ hours, maxHours }: { hours: number; maxHours: number }) {
  const pct = maxHours > 0 ? (hours / maxHours) * 100 : 0;
  const color = pct > 50 ? 'bg-green-50 text-green-700' : pct > 25 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';
  const iconColor = pct > 50 ? 'text-green-500' : pct > 25 ? 'text-amber-500' : 'text-red-500';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      <svg className={`h-3 w-3 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {hours}h remaining
    </span>
  );
}

/* ── Priority Badge ── */
function PriorityBadge({ priority }: { priority: boolean }) {
  if (priority) {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#be123c]/10 text-[#be123c]">
        Priority 24h
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
      Standard
    </span>
  );
}

/* ── Complexity Badge ── */
function ComplexityBadge({ complexity }: { complexity: string }) {
  const styles: Record<string, string> = {
    Simple: 'bg-green-50 text-green-700',
    Standard: 'bg-blue-50 text-blue-700',
    Complex: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[complexity] || 'bg-neutral-100 text-neutral-500'}`}>
      {complexity}
    </span>
  );
}

/* ── Progress Bar ── */
function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  const color = value >= 75 ? 'bg-green-500' : value >= 40 ? 'bg-amber-500' : 'bg-[#be123c]';
  return (
    <div className={`w-full bg-neutral-100 rounded-full h-1.5 ${className}`}>
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ── Queue Filters ── */
function QueueFilters({
  turnaround, setTurnaround, complexity, setComplexity, contractType, setContractType,
}: {
  turnaround: string; setTurnaround: (v: string) => void;
  complexity: string; setComplexity: (v: string) => void;
  contractType: string; setContractType: (v: string) => void;
}) {
  const pillClass = (active: boolean) =>
    `text-xs px-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer ${
      active
        ? 'bg-[#be123c] text-white border-[#be123c]'
        : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#be123c]/40 hover:bg-[#be123c]/5'
    }`;
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm mb-4">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Turnaround</span>
          {['All', 'Priority', 'Standard'].map((v) => (
            <button key={v} onClick={() => setTurnaround(v)} className={pillClass(turnaround === v)}>{v}</button>
          ))}
        </div>
        <div className="h-5 w-px bg-neutral-200" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Complexity</span>
          {['All', 'Simple', 'Standard', 'Complex'].map((v) => (
            <button key={v} onClick={() => setComplexity(v)} className={pillClass(complexity === v)}>{v}</button>
          ))}
        </div>
        <div className="h-5 w-px bg-neutral-200" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Type</span>
          <select
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
            className="text-xs rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] transition-all"
          >
            {CONTRACT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/* ── Queue Card ── */
function QueueCard({ c, onClaim, claiming }: { c: QueueCase; onClaim: () => void; claiming: boolean }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-serif text-lg font-semibold text-neutral-900">
            {c.title} <span className="text-neutral-400 font-normal text-sm">{c.modRef}</span>
          </h3>
        </div>
        <PriorityBadge priority={c.priority} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-neutral-500">
        <span>Submitted {c.submitted}</span>
        <span className="text-neutral-300">|</span>
        <ComplexityBadge complexity={c.complexity} />
        <span className="text-neutral-300">|</span>
        <span>{c.modCount} modification{c.modCount !== 1 ? 's' : ''}</span>
        <span className="text-neutral-300">|</span>
        <span>{c.province}</span>
      </div>

      <div className="bg-neutral-50 rounded-lg p-3 mb-4 border border-neutral-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Review Agent Summary</p>
        <p className="text-sm text-neutral-600 leading-relaxed">{c.agentSummary}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SlaBadge hours={c.slaHours} maxHours={c.slaMax} />
          <span className="text-xs text-neutral-400">
            Confidence: <span className="font-semibold text-neutral-700">{c.confidence}%</span>
          </span>
        </div>
        <button
          onClick={onClaim}
          disabled={claiming}
          className="bg-[#be123c] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#9f1239] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.97]"
        >
          {claiming ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Claiming...
            </span>
          ) : 'Claim This Case'}
        </button>
      </div>
    </div>
  );
}

/* ── My Case Card ── */
function MyCaseCard({ c, onOpenReview, onRelease }: { c: MyCase; onOpenReview: () => void; onRelease: () => void }) {
  const isAwaiting = c.status === 'awaiting-client';
  return (
    <div className={`border rounded-xl p-6 shadow-sm transition-all duration-200 ${
      isAwaiting
        ? 'bg-neutral-50/80 border-neutral-200/80 opacity-80'
        : 'bg-white border-neutral-200 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-serif text-lg font-semibold ${isAwaiting ? 'text-neutral-500' : 'text-neutral-900'}`}>
            {c.title} <span className="text-neutral-400 font-normal text-sm">{c.modRef}</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isAwaiting && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-500">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg>
              Awaiting Client
            </span>
          )}
          <PriorityBadge priority={c.priority} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-neutral-500">
        <span>Claimed {c.claimedAt}</span>
        <span className="text-neutral-300">|</span>
        <ComplexityBadge complexity={c.complexity} />
        <span className="text-neutral-300">|</span>
        <span>{c.modCount} modification{c.modCount !== 1 ? 's' : ''}</span>
        <span className="text-neutral-300">|</span>
        <span>{c.province}</span>
      </div>

      <p className={`text-sm mb-3 leading-relaxed ${isAwaiting ? 'text-neutral-400' : 'text-neutral-600'}`}>{c.agentSummary}</p>

      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-neutral-400">Review progress</span>
          <span className="text-xs font-medium text-neutral-500">{c.progress}%</span>
        </div>
        <ProgressBar value={c.progress} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SlaBadge hours={c.slaHours} maxHours={c.slaMax} />
          <span className="text-xs text-neutral-400">
            Confidence: <span className="font-semibold text-neutral-700">{c.confidence}%</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRelease}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-all duration-150"
          >
            Release Case
          </button>
          <button
            onClick={onOpenReview}
            className={`text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-150 active:scale-[0.97] ${
              isAwaiting
                ? 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
                : 'bg-[#be123c] text-white hover:bg-[#9f1239]'
            }`}
          >
            Open Review
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Messages Tab ── */
function MessagesTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sentReplies, setSentReplies] = useState<Record<string, MessageThread[]>>({});

  const handleSendReply = (msgId: string) => {
    const text = replyTexts[msgId]?.trim();
    if (!text) return;
    const newReply: MessageThread = {
      sender: 'You',
      text,
      timestamp: 'Just now',
      isLawyer: true,
    };
    setSentReplies((prev) => ({
      ...prev,
      [msgId]: [...(prev[msgId] || []), newReply],
    }));
    setReplyTexts((prev) => ({ ...prev, [msgId]: '' }));
  };

  return (
    <div className="space-y-3">
      {MESSAGES.map((m) => {
        const isExpanded = expandedId === m.id;
        const extraReplies = sentReplies[m.id] || [];
        const fullThread = [...m.thread, ...extraReplies];
        return (
          <div key={m.id} className="bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            {/* Header — always visible */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : m.id)}
              className="w-full p-5 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="pt-1.5 shrink-0">
                  {m.unread ? (
                    <span className="block h-2.5 w-2.5 rounded-full bg-[#be123c] animate-pulse" />
                  ) : (
                    <span className="block h-2.5 w-2.5 rounded-full bg-neutral-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-semibold ${m.unread ? 'text-neutral-900' : 'text-neutral-600'}`}>{m.agreementName}</h3>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className="text-xs text-neutral-400">{m.timestamp}</span>
                      <svg className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                  <p className={`text-sm mb-1 ${m.unread ? 'font-medium text-neutral-700' : 'text-neutral-500'}`}>{m.clientName}</p>
                  {!isExpanded && <p className="text-sm text-neutral-500 truncate">{m.preview}</p>}
                </div>
              </div>
            </button>

            {/* Expanded thread */}
            {isExpanded && (
              <div className="border-t border-neutral-100 px-5 pb-5">
                {/* Agreement context badge */}
                <div className="mt-4 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-neutral-100 text-neutral-500">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    {m.agreementName}
                  </span>
                </div>

                {/* Thread messages */}
                <div className="space-y-3 mb-4">
                  {fullThread.map((t, i) => (
                    <div key={i} className={`flex ${t.isLawyer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        t.isLawyer
                          ? 'bg-[#be123c]/5 border border-[#be123c]/10'
                          : 'bg-neutral-50 border border-neutral-100'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold ${t.isLawyer ? 'text-[#be123c]' : 'text-neutral-700'}`}>{t.sender}</span>
                          <span className="text-xs text-neutral-400">{t.timestamp}</span>
                        </div>
                        <p className="text-sm text-neutral-700 leading-relaxed">{t.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply input */}
                <div className="flex items-end gap-2">
                  <textarea
                    value={replyTexts[m.id] || ''}
                    onChange={(e) => setReplyTexts((prev) => ({ ...prev, [m.id]: e.target.value }))}
                    placeholder="Type your reply..."
                    rows={2}
                    className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] resize-none transition-all"
                  />
                  <button
                    onClick={() => handleSendReply(m.id)}
                    disabled={!(replyTexts[m.id]?.trim())}
                    className="shrink-0 bg-[#be123c] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#9f1239] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.97]"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── History Tab ── */
function HistoryTab() {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<keyof HistoryEntry>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterDecision, setFilterDecision] = useState('All');

  const handleSort = (col: keyof HistoryEntry) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    let list = [...HISTORY];
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (h) => h.agreementName.toLowerCase().includes(s) || h.client.toLowerCase().includes(s)
      );
    }
    if (filterDecision !== 'All') {
      list = list.filter((h) => h.decision === filterDecision);
    }
    list.sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [search, sortCol, sortDir, filterDecision]);

  const SortHeader = ({ col, label }: { col: keyof HistoryEntry; label: string }) => (
    <th
      onClick={() => handleSort(col)}
      className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-400 px-6 py-4 cursor-pointer hover:text-neutral-600 transition-colors select-none"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortCol === col && (
          <svg className={`h-3 w-3 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </span>
    </th>
  );

  return (
    <div>
      {/* Search & filter bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm mb-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agreements or clients..."
              className="w-full rounded-lg border border-neutral-200 pl-10 pr-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Decision</span>
          {['All', 'Approved', 'Approved with Edit'].map((v) => (
            <button
              key={v}
              onClick={() => setFilterDecision(v)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                filterDecision === v
                  ? 'bg-[#be123c] text-white border-[#be123c]'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#be123c]/40'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <SortHeader col="agreementName" label="Agreement" />
                <SortHeader col="client" label="Client" />
                <SortHeader col="complexity" label="Complexity" />
                <SortHeader col="decision" label="Decision" />
                <SortHeader col="reviewTime" label="Review Time" />
                <SortHeader col="date" label="Date" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-400">No results found.</td></tr>
              ) : (
                filtered.map((h) => (
                  <tr key={h.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">{h.agreementName}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{h.client}</td>
                    <td className="px-6 py-4"><ComplexityBadge complexity={h.complexity} /></td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        h.decision === 'Approved'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {h.decision}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{h.reviewTime}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500">{h.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Case Review Screen ── */
const DEMO_AGREEMENT_LINES = [
  "CONVERTIBLE NOTE AGREEMENT", "",
  "BETWEEN:", "NORTHVALE TECHNOLOGIES INC. (the \"Company\")", "AND:", "BRIAR CAPITAL PARTNERS LP (the \"Investor\")", "",
  "DATED as of the 15th day of March, 2026", "",
  "WHEREAS the Company wishes to raise capital for business development and operations;", "",
  "WHEREAS the Investor wishes to make an investment in the Company by way of a convertible promissory note;", "",
  "NOW THEREFORE in consideration of the mutual covenants and agreements herein contained, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:", "",
  "ARTICLE 1 \u2014 INTERPRETATION AND DEFINITIONS", "",
  "1.1 In this Agreement, the following terms shall have the following meanings:", "",
  "(a) \"Agreement\" means this Convertible Note Agreement, including all schedules attached hereto;",
  "(b) \"Business Day\" means any day other than a Saturday, Sunday, or statutory holiday in the Province of Ontario;",
  "(c) \"Conversion Price\" means the price per share at which the Principal Amount converts into Equity Securities;",
  "(d) \"Equity Securities\" means common shares or preferred shares of the Company;",
  "(e) \"Maturity Date\" means eighteen (18) months from the date of issuance;",
  "(f) \"Principal Amount\" means $500,000 CAD;",
  "(g) \"Qualified Financing\" means an equity financing of at least $1,000,000 CAD.", "",
  "ARTICLE 2 \u2014 THE NOTE", "",
  "2.1 Principal Amount. The Investor agrees to lend to the Company, and the Company agrees to borrow from the Investor, the Principal Amount of Five Hundred Thousand Canadian Dollars ($500,000 CAD).", "",
  "2.2 Funding. The Principal Amount shall be advanced by the Investor to the Company by wire transfer within five (5) Business Days of the execution of this Agreement.", "",
  "ARTICLE 3 \u2014 INTEREST", "",
  "3.1 Interest Rate. The Note shall bear simple interest at the rate of five percent (5%) per annum from the date of issuance until converted or repaid, calculated on the basis of a 365-day year.", "",
  "3.2 Payment of Interest. Accrued and unpaid interest shall be due and payable on the earlier of: (a) the Maturity Date; (b) a Conversion Event; or (c) prepayment of the Note.", "",
  "ARTICLE 4 \u2014 CONVERSION", "",
  "4.1 Automatic Conversion. Upon the closing of a Qualified Financing, the outstanding Principal Amount plus accrued interest shall automatically convert into Equity Securities at the Conversion Price.", "",
  "4.2 Conversion Price. The Conversion Price shall be the lesser of: (a) the price per share paid by investors in the Qualified Financing, multiplied by 0.80 (the \"Discount Rate\"); and (b) the price per share determined by dividing the Valuation Cap of $5,000,000 by the Company\u2019s fully diluted capitalization.", "",
  "ARTICLE 5 \u2014 REPRESENTATIONS AND WARRANTIES", "",
  "5.1 The Company represents and warrants to the Investor that the Company is a corporation duly organized and validly existing under the laws of the Province of Ontario.", "",
  "5.2 The Investor represents and warrants to the Company that the Investor is an \"accredited investor\" as defined in NI 45-106.", "",
  "ARTICLE 6 \u2014 GENERAL PROVISIONS", "",
  "6.1 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein.", "",
  "6.2 Entire Agreement. This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof.", "",
  "IN WITNESS WHEREOF the parties have executed this Agreement as of the date first written above.", "",
  "NORTHVALE TECHNOLOGIES INC.", "Per: ________________", "Name:", "Title:", "Date:", "",
  "BRIAR CAPITAL PARTNERS LP", "Per: ________________", "Name:", "Title:", "Date:",
];
const DEMO_AGREEMENT_TEXT = DEMO_AGREEMENT_LINES.join("\n");

function CaseReviewScreen({ caseData, onBack }: { caseData: MyCase; onBack: () => void }) {
  const d = REVIEW_DETAIL;
  const [showTranscript, setShowTranscript] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [isEditingAgreement, setIsEditingAgreement] = useState(false);
  const [agreementText, setAgreementText] = useState(DEMO_AGREEMENT_TEXT);
  const [reviewTab, setReviewTab] = useState<'summary' | 'agreement'>('summary');

  const handleAction = (action: string) => {
    setActionDone(action);
    setShowMoreMenu(false);
    setTimeout(() => setActionDone(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to My Cases
      </button>

      {/* Action confirmation toast */}
      {actionDone && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <span className="inline-flex items-center gap-2">
            <CheckIcon className="h-4 w-4" />
            {actionDone}
          </span>
        </div>
      )}

      {/* Decision Header */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-1">
              {caseData.title} <span className="text-neutral-400 font-normal text-lg">{caseData.modRef}</span>
            </h2>
            <p className="text-sm text-neutral-500">{caseData.province} &middot; {caseData.complexity} complexity &middot; {caseData.modCount} modifications</p>
          </div>
          <div className="flex items-center gap-4">
            <SlaBadge hours={caseData.slaHours} maxHours={caseData.slaMax} />
            <div className={`px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide ${
              d.recommendation === 'APPROVE'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {d.recommendation}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm">
          <span className="text-neutral-500">
            AI Confidence: <span className="font-bold text-neutral-900">{d.confidence}%</span>
          </span>
          <div className="w-24">
            <ProgressBar value={d.confidence} />
          </div>
          <span className="text-neutral-500">
            SLA: <span className="font-semibold text-amber-600">{d.slaCountdown}</span>
          </span>
          {d.escalationReason && (
            <span className="text-red-600 font-medium">Escalation: {d.escalationReason}</span>
          )}
        </div>
      </div>

      {/* Review Tab Toggle */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg w-fit">
        <button
          onClick={() => setReviewTab('summary')}
          className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${reviewTab === 'summary' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
        >
          Review Summary
        </button>
        <button
          onClick={() => setReviewTab('agreement')}
          className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${reviewTab === 'agreement' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
        >
          Full Agreement
        </button>
      </div>

      {/* Full Agreement View/Edit Panel */}
      {reviewTab === 'agreement' && (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <h3 className="font-serif text-lg font-semibold text-neutral-900">Agreement Document</h3>
              <span className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {isEditingAgreement ? 'Editing' : 'Viewing'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isEditingAgreement ? (
                <>
                  <button
                    onClick={() => setIsEditingAgreement(false)}
                    className="text-sm font-medium px-4 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setIsEditingAgreement(false); handleAction('Edits saved to agreement'); }}
                    className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#be123c] text-white hover:bg-[#9f1239] transition-all"
                  >
                    Save Edits
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditingAgreement(true)}
                    className="text-sm font-medium px-4 py-2 rounded-lg border border-[#be123c] text-[#be123c] hover:bg-[#be123c]/5 transition-all inline-flex items-center gap-1.5"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Edit Agreement
                  </button>
                  <button
                    onClick={() => handleAction('Published to client portal')}
                    className="text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all inline-flex items-center gap-1.5"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Publish for Client
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Highlight legend */}
          <div className="px-6 py-3 border-b border-neutral-100 flex items-center gap-4 bg-neutral-50/30">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Highlights:</span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-amber-700">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-200" /> Modified
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-blue-700">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-200" /> Needs Review
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-neutral-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-neutral-100" /> Standard
            </span>
          </div>

          {/* Agreement content */}
          <div className="max-h-[65vh] overflow-y-auto">
            {isEditingAgreement ? (
              <textarea
                value={agreementText}
                onChange={(e) => setAgreementText(e.target.value)}
                className="w-full min-h-[65vh] px-8 py-8 text-sm text-neutral-800 leading-relaxed font-mono focus:outline-none resize-none"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '13.5px', lineHeight: '1.8' }}
              />
            ) : (
              <div className="px-8 py-8" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '13.5px', lineHeight: '1.8', color: '#1a1a1a' }}>
                {agreementText.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  // Determine if this line is in a highlighted section
                  let highlightClass = '';
                  if (trimmed.includes('Interest Rate') || trimmed.includes('5%') || trimmed.includes('8%') || trimmed.includes('interest') || trimmed.includes('ARTICLE 3')) {
                    highlightClass = 'bg-amber-50 border-l-3 border-l-amber-400 pl-3 -ml-3';
                  } else if (trimmed.includes('Conversion Price') || trimmed.includes('Valuation Cap') || trimmed.includes('Discount Rate') || trimmed.includes('4.2')) {
                    highlightClass = 'bg-blue-50 border-l-3 border-l-blue-400 pl-3 -ml-3';
                  }

                  if (!trimmed) return <div key={i} className="h-3" />;
                  if (trimmed.startsWith('ARTICLE') || trimmed === 'CONVERTIBLE NOTE AGREEMENT') {
                    return <p key={i} className={`font-bold text-[14px] uppercase tracking-wide mt-6 mb-2 ${highlightClass}`}>{line}</p>;
                  }
                  if (trimmed.startsWith('BETWEEN') || trimmed.startsWith('AND:') || trimmed.startsWith('DATED')) {
                    return <p key={i} className="text-center text-neutral-600 mb-1">{line}</p>;
                  }
                  if (trimmed.startsWith('WHEREAS') || trimmed.startsWith('NOW THEREFORE')) {
                    return <p key={i} className="italic text-neutral-700 mb-1">{line}</p>;
                  }
                  if (trimmed.startsWith('IN WITNESS')) {
                    return <p key={i} className="font-semibold mt-6 pt-4 border-t-2 border-neutral-900">{line}</p>;
                  }
                  if (trimmed.startsWith('Per:')) {
                    return <p key={i} className="text-neutral-500 mt-3">{line}</p>;
                  }
                  if (trimmed.match(/^\d+\.\d+/)) {
                    return <p key={i} className={`mb-1 ${highlightClass}`}>{line}</p>;
                  }
                  if (trimmed.startsWith('(')) {
                    return <p key={i} className="pl-6 mb-0.5 text-neutral-700">{line}</p>;
                  }
                  return <p key={i} className={`mb-1 ${highlightClass}`}>{line}</p>;
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {reviewTab === 'summary' && (
      <div className="space-y-6">
      {/* Clause Delta Panel */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-serif text-lg font-semibold text-neutral-900 mb-4">
          Clause Delta &mdash; {d.clauseTitle}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">Before (Removed)</p>
            <p className="text-sm text-neutral-700 leading-relaxed">
              <span>4.2 Interest Rate. The Note shall bear simple interest at the rate of </span>
              <span className="bg-red-200/60 text-red-900 px-0.5 rounded line-through">five percent (5%)</span>
              <span> per annum from the date of issuance until converted or repaid, calculated on the basis of a 365-day year.</span>
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-500 mb-2">After (Added)</p>
            <p className="text-sm text-neutral-700 leading-relaxed">
              <span>4.2 Interest Rate. The Note shall bear simple interest at the rate of </span>
              <span className="bg-green-200/60 text-green-900 px-0.5 rounded font-medium">eight percent (8%)</span>
              <span> per annum from the date of issuance until converted or repaid, calculated on the basis of a 365-day year. </span>
              <span className="bg-green-200/60 text-green-900 px-0.5 rounded font-medium">Interest shall compound annually on each anniversary of the issuance date.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Clause Library Reference */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-serif text-lg font-semibold text-neutral-900 mb-4">Clause Library Reference</h3>
        <div className="bg-neutral-50 rounded-lg border border-neutral-100 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-neutral-900">{d.clauseLibrary.variantName}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{d.clauseLibrary.source}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Similarity</span>
              <span className="text-sm font-bold text-[#be123c]">{d.clauseLibrary.similarity}%</span>
            </div>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 mb-3">
            <div className="bg-[#be123c] h-1.5 rounded-full transition-all" style={{ width: `${d.clauseLibrary.similarity}%` }} />
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">{d.clauseLibrary.note}</p>
        </div>
      </div>

      {/* Regulatory Checklist */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-serif text-lg font-semibold text-neutral-900 mb-4">Regulatory Checklist</h3>
        <div className="space-y-2.5">
          {d.regulatoryChecklist.map((item) => {
            const statusStyles = {
              green: { dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', label: 'PASS' },
              amber: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', label: 'REVIEW' },
              red: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', label: 'FAIL' },
            };
            const s = statusStyles[item.status];
            return (
              <div key={item.item} className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-neutral-50/80 border border-neutral-100">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                  <span className="text-sm text-neutral-700">{item.item}</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${s.bg} ${s.text}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversation Summary */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg font-semibold text-neutral-900">Conversation Summary</h3>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-xs font-medium text-[#be123c] hover:text-[#9f1239] transition-colors inline-flex items-center gap-1"
          >
            {showTranscript ? 'Hide Transcript' : 'View Full Transcript'}
            <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${showTranscript ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-neutral-600 leading-relaxed">{d.conversationSummary}</p>

        {/* Full transcript */}
        {showTranscript && (
          <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
            {d.fullTranscript.map((entry, i) => (
              <div key={i} className={`flex ${entry.role === 'Client' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-lg px-4 py-3 ${
                  entry.role === 'Client'
                    ? 'bg-neutral-50 border border-neutral-100'
                    : 'bg-[#be123c]/5 border border-[#be123c]/10'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${entry.role === 'Client' ? 'text-neutral-700' : 'text-[#be123c]'}`}>{entry.role}</span>
                    <span className="text-xs text-neutral-400">{entry.time}</span>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed">{entry.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Flags */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-serif text-lg font-semibold text-neutral-900 mb-4">Risk Flags</h3>
        <div className="space-y-3">
          {d.riskFlags.map((rf, i) => {
            const severityStyles = {
              low: { badge: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
              medium: { badge: 'bg-amber-50 text-amber-700', border: 'border-amber-200' },
              high: { badge: 'bg-red-50 text-red-700', border: 'border-red-200' },
            };
            const s = severityStyles[rf.severity];
            return (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border ${s.border} bg-white`}>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${s.badge} shrink-0 mt-0.5`}>
                  {rf.severity}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-neutral-700">{rf.flag}</p>
                  <p className="text-xs text-neutral-400 mt-1">Source: {rf.source}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promotion Log Context */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-serif text-lg font-semibold text-neutral-900 mb-4">Promotion Log Context</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-neutral-50 rounded-lg border border-neutral-100 p-4 text-center">
            <p className="text-2xl font-bold text-[#be123c]">{d.promotionLog.approvalRate}%</p>
            <p className="text-xs text-neutral-500 mt-1">Historical Approval Rate</p>
          </div>
          <div className="bg-neutral-50 rounded-lg border border-neutral-100 p-4 text-center">
            <p className="text-2xl font-bold text-neutral-900">{d.promotionLog.avgReviewTime}</p>
            <p className="text-xs text-neutral-500 mt-1">Avg. Review Time</p>
          </div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Similar Patterns</p>
        <div className="space-y-2">
          {d.promotionLog.similarPatterns.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <span className="text-sm text-neutral-700">{p.description}</span>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  p.outcome === 'Approved' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {p.outcome}
                </span>
                <span className="text-xs text-neutral-400">{p.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      </div>
      )}

      {/* Action Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm sticky bottom-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">Choose an action for this case</p>
          <div className="flex items-center gap-3">
            {/* Send Question */}
            {showQuestionInput ? (
              <div className="flex items-center gap-2">
                <input
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Type your question..."
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && questionText.trim()) {
                      handleAction('Question sent to client');
                      setShowQuestionInput(false);
                      setQuestionText('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (questionText.trim()) {
                      handleAction('Question sent to client');
                      setShowQuestionInput(false);
                      setQuestionText('');
                    }
                  }}
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all"
                >
                  Send
                </button>
                <button
                  onClick={() => { setShowQuestionInput(false); setQuestionText(''); }}
                  className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowQuestionInput(true)}
                className="text-sm font-semibold px-5 py-2.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all duration-150 active:scale-[0.97]"
              >
                Send Question
              </button>
            )}

            <button
              onClick={() => handleAction('Approved with edits')}
              className="text-sm font-semibold px-5 py-2.5 rounded-lg border border-[#be123c] text-[#be123c] hover:bg-[#be123c]/5 transition-all duration-150 active:scale-[0.97]"
            >
              Approve With Edit
            </button>

            <button
              onClick={() => handleAction('Case approved')}
              className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-[#be123c] text-white hover:bg-[#9f1239] transition-all duration-150 active:scale-[0.97] shadow-sm"
            >
              Approve As-Is
            </button>

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="text-sm font-semibold px-3 py-2.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-all duration-150"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => { handleAction('Case released back to queue'); onBack(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Release Case
                  </button>
                  <button
                    onClick={() => handleAction('Flagged for admin review')}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Flag for Admin
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */

export default function LawyerPortalPage() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'my-cases' | 'messages' | 'history'>('queue');
  const [reviewingCase, setReviewingCase] = useState<MyCase | null>(null);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [myCases, setMyCases] = useState<MyCase[]>(INITIAL_MY_CASES);
  const [, setReleasedIds] = useState<string[]>([]);

  // Queue filters
  const [qTurnaround, setQTurnaround] = useState('All');
  const [qComplexity, setQComplexity] = useState('All');
  const [qContractType, setQContractType] = useState('All Types');

  /* Not authenticated — show gate */
  if (!authed) {
    return <AuthGate onLogin={() => setAuthed(true)} />;
  }

  /* Reviewing a specific case */
  if (reviewingCase) {
    return (
      <div className="min-h-screen bg-[#faf9f7]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <CaseReviewScreen caseData={reviewingCase} onBack={() => setReviewingCase(null)} />
        </div>
      </div>
    );
  }

  /* Claim handler */
  const handleClaim = (c: QueueCase) => {
    setClaimingId(c.id);
    setTimeout(() => {
      setClaimedIds((prev) => [...prev, c.id]);
      const newCase: MyCase = {
        id: c.id,
        title: c.title,
        modRef: c.modRef,
        priority: c.priority,
        submitted: c.submitted,
        complexity: c.complexity,
        modCount: c.modCount,
        province: c.province,
        agentSummary: c.agentSummary,
        confidence: c.confidence,
        slaHours: c.slaHours,
        slaMax: c.slaMax,
        status: 'in-review',
        claimedAt: '2026-04-04',
        progress: 0,
      };
      setMyCases((prev) => [newCase, ...prev]);
      setClaimingId(null);
    }, 600);
  };

  /* Release handler */
  const handleRelease = (caseId: string) => {
    setMyCases((prev) => prev.filter((c) => c.id !== caseId));
    setReleasedIds((prev) => [...prev, caseId]);
    setClaimedIds((prev) => prev.filter((id) => id !== caseId));
  };

  /* Filter queue cases */
  const filteredQueue = QUEUE_CASES.filter((c) => {
    if (claimedIds.includes(c.id)) return false;
    if (qTurnaround === 'Priority' && !c.priority) return false;
    if (qTurnaround === 'Standard' && c.priority) return false;
    if (qComplexity !== 'All' && c.complexity !== qComplexity) return false;
    if (qContractType !== 'All Types' && c.contractType !== qContractType) return false;
    return true;
  });

  const hasPriority = QUEUE_CASES.some((c) => c.priority && !claimedIds.includes(c.id));
  const approachingSla = myCases.some((c) => c.slaHours <= 12);

  const tabs = [
    { id: 'queue' as const, label: 'Queue', count: QUEUE_CASES.filter((c) => !claimedIds.includes(c.id)).length },
    { id: 'my-cases' as const, label: 'My Cases', count: myCases.length },
    { id: 'messages' as const, label: 'Messages', count: MESSAGES.filter((m) => m.unread).length },
    { id: 'history' as const, label: 'History', count: null },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#be123c] mb-2">Lawyer Portal</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">Review Pipeline</h1>
            <p className="text-neutral-500 mt-1 text-sm">Review pipeline for licensed Canadian lawyers</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
              &larr; Ruby Law
            </Link>
            <button
              onClick={() => setAuthed(false)}
              className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Available Cases"
            value={QUEUE_CASES.filter((c) => !claimedIds.includes(c.id)).length}
            accent={hasPriority ? 'bg-[#be123c]/10' : 'bg-neutral-100'}
            icon={
              <svg className={`h-4 w-4 ${hasPriority ? 'text-[#be123c]' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            }
          />
          <StatCard
            label="My Active Cases"
            value={myCases.filter((c) => c.status === 'in-review').length}
            accent={approachingSla ? 'bg-amber-50' : 'bg-neutral-100'}
            icon={
              <svg className={`h-4 w-4 ${approachingSla ? 'text-amber-600' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            }
          />
          <StatCard
            label="Awaiting Client"
            value={myCases.filter((c) => c.status === 'awaiting-client').length}
            accent="bg-neutral-100"
            icon={
              <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Completed This Week"
            value={HISTORY.filter((h) => h.date >= '2026-03-30').length}
            accent="bg-green-50"
            icon={<CheckIcon className="h-4 w-4 text-green-600" />}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200 mb-8">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3 text-sm font-medium transition-all duration-150 ${
                  activeTab === tab.id
                    ? 'text-[#be123c] border-b-2 border-[#be123c]'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-[#be123c]/10 text-[#be123c]'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div>
            <QueueFilters
              turnaround={qTurnaround} setTurnaround={setQTurnaround}
              complexity={qComplexity} setComplexity={setQComplexity}
              contractType={qContractType} setContractType={setQContractType}
            />
            <div className="space-y-4">
              {filteredQueue.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-sm">
                  <p className="text-neutral-400 text-sm">No cases match your filters. Try adjusting the criteria above.</p>
                </div>
              ) : (
                filteredQueue.map((c) => (
                  <QueueCard
                    key={c.id}
                    c={c}
                    claiming={claimingId === c.id}
                    onClaim={() => handleClaim(c)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* My Cases Tab */}
        {activeTab === 'my-cases' && (
          <div className="space-y-4">
            {myCases.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-sm">
                <p className="text-neutral-400 text-sm">No active cases. Claim a case from the Queue tab.</p>
              </div>
            ) : (
              myCases.map((c) => (
                <MyCaseCard
                  key={c.id}
                  c={c}
                  onOpenReview={() => setReviewingCase(c)}
                  onRelease={() => handleRelease(c.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && <MessagesTab />}

        {/* History Tab */}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
}
