"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ───
type AgreementStatus = "expert-draft" | "under-review" | "approved" | "customizing" | "delivered";
type ReviewStep = "submitted" | "ai-review" | "lawyer-review" | "approved";
type Tab = "agreements" | "review" | "messages" | "customizations";

interface Agreement {
  id: string;
  title: string;
  type: string;
  status: AgreementStatus;
  datePurchased: string;
  tier: "expert-draft" | "counsel-review";
  reviewStep?: ReviewStep;
  estimatedCompletion?: string;
  reviewedBy?: string;
}

interface Message {
  id: string;
  sender: "lawyer" | "client";
  senderName: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  agreementName: string;
  lawyerName: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  messages: Message[];
}

interface Customization {
  id: string;
  agreementTitle: string;
  modificationType: string;
  description: string;
  status: "pending-ai" | "in-progress" | "awaiting-review" | "completed";
  complexityTier: "Simple" | "Moderate" | "Complex";
  price: string;
}

// ─── Demo Data ───
const DEMO_AGREEMENTS: Agreement[] = [
  {
    id: "agr-1",
    title: "Shareholder Agreement — 2-Party Equal Split",
    type: "Shareholder Agreement",
    status: "under-review",
    datePurchased: "2026-03-28",
    tier: "counsel-review",
    reviewStep: "lawyer-review",
    estimatedCompletion: "Apr 7, 2026",
  },
  {
    id: "agr-2",
    title: "Standard Employment Agreement",
    type: "Employment Agreement",
    status: "approved",
    datePurchased: "2026-03-20",
    tier: "counsel-review",
    reviewStep: "approved",
    reviewedBy: "Sarah Chen, Barrister & Solicitor",
  },
  {
    id: "agr-3",
    title: "SAFE Agreement — Post-Money",
    type: "SAFE Agreement",
    status: "expert-draft",
    datePurchased: "2026-04-01",
    tier: "expert-draft",
  },
  {
    id: "agr-4",
    title: "Privacy Policy (CASL Compliant)",
    type: "Privacy Policy",
    status: "approved",
    datePurchased: "2026-03-10",
    tier: "counsel-review",
    reviewStep: "approved",
    reviewedBy: "Marc Dubois, Avocat",
  },
  {
    id: "agr-5",
    title: "Influencer / Creator Agreement",
    type: "Creator Agreement",
    status: "customizing",
    datePurchased: "2026-04-02",
    tier: "counsel-review",
    reviewStep: "submitted",
  },
  {
    id: "agr-6",
    title: "Founders Agreement — 3-Party",
    type: "Founders Agreement",
    status: "delivered",
    datePurchased: "2026-02-15",
    tier: "counsel-review",
    reviewStep: "approved",
    reviewedBy: "Sarah Chen, Barrister & Solicitor",
  },
];

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    agreementName: "Shareholder Agreement — 2-Party Equal Split",
    lawyerName: "Sarah Chen",
    preview: "I've completed the redline markup and attached my memo. Two clauses need your input before we finalize the drag-along provisions.",
    timestamp: "2 hours ago",
    unread: true,
    messages: [
      { id: "m1-1", sender: "client", senderName: "You", text: "Hi Sarah, I just submitted my Shareholder Agreement for Counsel Review. We're splitting 50/50 between two co-founders. One concern — we want strong drag-along protections.", timestamp: "Mar 29, 2026 at 10:15 AM" },
      { id: "m1-2", sender: "lawyer", senderName: "Sarah Chen", text: "Thanks for the context. I'll pay special attention to the drag-along and tag-along provisions. I'll also review the vesting and founder departure clauses — these are often underspecified in 50/50 splits. Expect my redline within 3 business days.", timestamp: "Mar 29, 2026 at 2:30 PM" },
      { id: "m1-3", sender: "client", senderName: "You", text: "That sounds great. We're also planning to bring on an advisor — should we add an advisor equity section?", timestamp: "Mar 31, 2026 at 9:00 AM" },
      { id: "m1-4", sender: "lawyer", senderName: "Sarah Chen", text: "I've completed the redline markup and attached my memo. Two clauses need your input before we finalize the drag-along provisions. Re: the advisor — I'd recommend a separate Advisor Agreement rather than embedding it here. I can add that as a Layer 2 customization if you'd like.", timestamp: "Apr 4, 2026 at 11:45 AM" },
    ],
  },
  {
    id: "conv-2",
    agreementName: "Standard Employment Agreement",
    lawyerName: "Sarah Chen",
    preview: "Your Employment Agreement has been reviewed and approved. Download the final version from the My Agreements tab.",
    timestamp: "1 day ago",
    unread: true,
    messages: [
      { id: "m2-1", sender: "client", senderName: "You", text: "Sarah, we need this employment agreement finalized before our new hire starts on April 10th. Is that feasible?", timestamp: "Mar 20, 2026 at 3:00 PM" },
      { id: "m2-2", sender: "lawyer", senderName: "Sarah Chen", text: "Absolutely. I'll prioritize this one. I noticed the non-compete clause is quite broad — I'll tighten the geographic and temporal scope to ensure enforceability under Ontario law.", timestamp: "Mar 21, 2026 at 10:00 AM" },
      { id: "m2-3", sender: "lawyer", senderName: "Sarah Chen", text: "Your Employment Agreement has been reviewed and approved. I narrowed the non-compete to 12 months / 50km radius which is defensible in Ontario courts. Download the final version from the My Agreements tab.", timestamp: "Apr 3, 2026 at 4:15 PM" },
    ],
  },
  {
    id: "conv-3",
    agreementName: "Privacy Policy (CASL Compliant)",
    lawyerName: "Marc Dubois",
    preview: "Given the Quebec audience, I added a French-language disclosure addendum per Charter of the French Language requirements. All good to go.",
    timestamp: "3 days ago",
    unread: false,
    messages: [
      { id: "m3-1", sender: "client", senderName: "You", text: "Marc, our SaaS product serves customers across Canada but we have a large Quebec user base. Do we need anything beyond standard CASL compliance?", timestamp: "Mar 10, 2026 at 11:00 AM" },
      { id: "m3-2", sender: "lawyer", senderName: "Marc Dubois", text: "Good question. For Quebec specifically, the Charter of the French Language requires that consumer-facing documents be available in French. I'll add a French-language disclosure addendum. I'll also ensure PIPEDA alignment for the federal requirements.", timestamp: "Mar 11, 2026 at 9:30 AM" },
      { id: "m3-3", sender: "lawyer", senderName: "Marc Dubois", text: "Given the Quebec audience, I added a French-language disclosure addendum per Charter of the French Language requirements. All good to go. The policy is now approved and ready for download.", timestamp: "Apr 1, 2026 at 2:00 PM" },
    ],
  },
  {
    id: "conv-4",
    agreementName: "Influencer / Creator Agreement",
    lawyerName: "Sarah Chen",
    preview: "I've received your customization request for the exclusivity clause. I'll draft the geographic limitation provisions and have it back to you by mid-week.",
    timestamp: "1 day ago",
    unread: false,
    messages: [
      { id: "m4-1", sender: "client", senderName: "You", text: "We'd like to add an exclusivity clause to our creator agreement but limited to North America only. The creator works with brands in Europe and we don't want to restrict that.", timestamp: "Apr 2, 2026 at 10:30 AM" },
      { id: "m4-2", sender: "lawyer", senderName: "Sarah Chen", text: "I've received your customization request for the exclusivity clause. I'll draft the geographic limitation provisions and have it back to you by mid-week. I'll make sure the carve-out for non-North American territories is clearly defined.", timestamp: "Apr 3, 2026 at 9:15 AM" },
    ],
  },
];

const DEMO_CUSTOMIZATIONS: Customization[] = [
  {
    id: "cust-1",
    agreementTitle: "Influencer / Creator Agreement",
    modificationType: "Add exclusivity clause with geographic limitation",
    description: "Adding North America-only exclusivity provisions with clear carve-outs for non-competing European brand partnerships.",
    status: "in-progress",
    complexityTier: "Moderate",
    price: "$175",
  },
  {
    id: "cust-2",
    agreementTitle: "Shareholder Agreement — 2-Party Equal Split",
    modificationType: "Custom vesting schedule (4-year cliff with acceleration)",
    description: "Implementing a 4-year vesting schedule with 1-year cliff and double-trigger acceleration on change of control events.",
    status: "pending-ai",
    complexityTier: "Complex",
    price: "$295",
  },
  {
    id: "cust-3",
    agreementTitle: "Standard Employment Agreement",
    modificationType: "Modified non-compete radius and duration",
    description: "Narrowed non-compete to 12-month duration and 50km geographic radius to ensure enforceability under Ontario employment law.",
    status: "completed",
    complexityTier: "Simple",
    price: "$95",
  },
  {
    id: "cust-4",
    agreementTitle: "Founders Agreement — 3-Party",
    modificationType: "IP assignment and pre-existing IP carve-out",
    description: "Adding comprehensive IP assignment clause with schedule of pre-existing IP that each founder retains ownership of.",
    status: "awaiting-review",
    complexityTier: "Moderate",
    price: "$195",
  },
];

// ─── Helpers ───
const STATUS_CONFIG: Record<AgreementStatus, { label: string; color: string; bg: string; border: string }> = {
  "expert-draft": { label: "Expert Draft", color: "text-neutral-600", bg: "bg-neutral-100", border: "border-neutral-200" },
  "under-review": { label: "Under Review", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  approved: { label: "Approved", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  customizing: { label: "Customizing", color: "text-rose-800", bg: "bg-rose-50", border: "border-rose-200" },
  delivered: { label: "Delivered", color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200" },
};

const CUSTOMIZATION_STATUS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "pending-ai": { label: "Pending Ruby Draft", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  "in-progress": { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  "awaiting-review": { label: "Awaiting Review", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
};

const REVIEW_STEPS: { key: ReviewStep; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "ai-review", label: "AI Review" },
  { key: "lawyer-review", label: "Lawyer Review" },
  { key: "approved", label: "Approved" },
];

function getStepIndex(step: ReviewStep): number {
  return REVIEW_STEPS.findIndex((s) => s.key === step);
}

export default function PortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("agreements");
  const [agreements] = useState<Agreement[]>(DEMO_AGREEMENTS);
  const [conversations] = useState<Conversation[]>(DEMO_CONVERSATIONS);
  const [customizations] = useState<Customization[]>(DEMO_CUSTOMIZATIONS);
  const [expandedConv, setExpandedConv] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState<Record<string, string>>({});
  const [expandedCust, setExpandedCust] = useState<string | null>(null);

  // Stat counts
  const activeCount = agreements.length;
  const underReviewCount = agreements.filter((a) => a.status === "under-review").length;
  const readyCount = agreements.filter((a) => a.status === "approved" || a.status === "delivered").length;
  const customizationCount = customizations.filter((c) => c.status !== "completed").length;
  const unreadCount = conversations.filter((c) => c.unread).length;

  // Agreements with review data for Review Status tab
  const reviewableAgreements = agreements.filter((a) => a.tier === "counsel-review" && a.reviewStep);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "agreements", label: "My Agreements", count: activeCount },
    { id: "review", label: "Review Status" },
    { id: "messages", label: "Messages", count: unreadCount || undefined },
    { id: "customizations", label: "Customizations", count: customizationCount || undefined },
  ];

  // ─── Auth Gate ───
  const inputClass = "w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] transition-all";

  if (!isAuthenticated) {
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
            <h1 className="font-serif text-3xl font-bold text-neutral-900">Ruby Client Portal</h1>
            <p className="text-neutral-500 mt-1 text-sm">Manage your agreements and communicate with your lawyer</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
            {!isRegistering ? (
              <>
                <h2 className="font-serif text-xl font-semibold text-neutral-900 mb-6">Sign In</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsAuthenticated(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                    <input type="email" placeholder="you@company.com" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                    <input type="password" placeholder="Enter password" className={inputClass} />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#be123c] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#9f1239] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    Sign In
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="text-sm text-[#be123c] hover:text-[#9f1239] font-medium transition-colors"
                  >
                    Create Account &rarr;
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setIsRegistering(false)} className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <h2 className="font-serif text-xl font-semibold text-neutral-900">Create Account</h2>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsAuthenticated(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
                    <input type="text" placeholder="Jane Smith" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Company Name</label>
                    <input type="text" placeholder="Acme Inc." className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                    <input type="email" placeholder="you@company.com" className={inputClass} />
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
                    className="w-full bg-[#be123c] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#9f1239] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    Create Account
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsRegistering(false)}
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

  return (
    <main className="min-h-screen bg-[#FFFBF5]">
      {/* ─── Header ─── */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-8 sm:pt-28">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-rose-800 mb-2">
                Client Portal
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-900">
                Welcome Back
              </h1>
              <p className="text-neutral-500 mt-2 max-w-lg">
                Track your agreements, monitor lawyer reviews, and download approved documents.
              </p>
            </div>
            <Link
              href="/documents"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-rose-800 hover:bg-rose-900 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Agreement
            </Link>
          </div>

          {/* ─── Stat Cards Row ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <button
              onClick={() => setActiveTab("agreements")}
              className="bg-[#FFFBF5] rounded-xl p-5 border border-neutral-200 text-left cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-rose-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-rose-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">{activeCount}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Active Agreements</div>
            </button>

            <button
              onClick={() => setActiveTab("review")}
              className="bg-[#FFFBF5] rounded-xl p-5 border border-neutral-200 text-left cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-amber-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">{underReviewCount}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Under Review</div>
            </button>

            <button
              onClick={() => setActiveTab("agreements")}
              className="bg-[#FFFBF5] rounded-xl p-5 border border-neutral-200 text-left cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">{readyCount}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Ready for Download</div>
            </button>

            <button
              onClick={() => setActiveTab("customizations")}
              className="bg-[#FFFBF5] rounded-xl p-5 border border-neutral-200 text-left cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-rose-200 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-rose-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">{customizationCount}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Customizations</div>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Tab Bar ─── */}
      <section className="bg-white border-b border-neutral-200 sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-rose-800 text-rose-800"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      activeTab === tab.id
                        ? "bg-rose-100 text-rose-800"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Content ─── */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* ═══ My Agreements Tab ═══ */}
        {activeTab === "agreements" && (
          <div className="space-y-3">
            {agreements.map((agr) => {
              const status = STATUS_CONFIG[agr.status];
              return (
                <div
                  key={agr.id}
                  className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <h3 className="font-serif text-base font-semibold text-neutral-900 group-hover:text-rose-800 transition-colors">
                          {agr.title}
                        </h3>
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status.color} ${status.bg} border ${status.border} flex-shrink-0`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[12px] text-neutral-400 flex-wrap">
                        <span>{agr.type}</span>
                        <span className="hidden sm:inline">|</span>
                        <span>Purchased {agr.datePurchased}</span>
                        <span className="hidden sm:inline">|</span>
                        <span className={agr.tier === "counsel-review" ? "text-rose-700 font-medium" : ""}>
                          {agr.tier === "counsel-review" ? "Counsel Review" : "Expert Draft"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(agr.status === "approved" || agr.status === "delivered") && (
                        <a
                          href={`/api/download/${agr.id}`}
                          download
                          className="px-4 py-2 text-[12px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:shadow-md active:scale-95"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      )}
                      {agr.status === "under-review" && (
                        <button
                          onClick={() => setActiveTab("review")}
                          className="px-4 py-2 text-[12px] font-medium text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-50 transition-all duration-200 flex items-center gap-1.5 hover:shadow-md active:scale-95"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Track Review
                        </button>
                      )}
                      {agr.status === "expert-draft" && (
                        <a
                          href={`/api/download/${agr.id}`}
                          download
                          className="px-4 py-2 text-[12px] font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all duration-200 flex items-center gap-1.5 hover:shadow-md active:scale-95"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      )}
                      {agr.status === "customizing" && (
                        <button
                          onClick={() => setActiveTab("customizations")}
                          className="px-4 py-2 text-[12px] font-medium text-rose-800 border border-rose-200 rounded-lg hover:bg-rose-50 transition-all duration-200 flex items-center gap-1.5 hover:shadow-md active:scale-95"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          View Customization
                        </button>
                      )}
                      {/* Customize button for all non-customizing agreements */}
                      {agr.status !== "customizing" && (
                        <Link
                          href="/customize"
                          className="px-4 py-2 text-[12px] font-medium text-rose-800 border border-rose-200 rounded-lg hover:bg-rose-50 transition-all duration-200 flex items-center gap-1.5 hover:shadow-md active:scale-95"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Customize
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ Review Status Tab ═══ */}
        {activeTab === "review" && (
          <div className="space-y-4">
            {reviewableAgreements.map((agr) => {
              const currentIdx = getStepIndex(agr.reviewStep!);
              const isComplete = agr.reviewStep === "approved";
              return (
                <div
                  key={agr.id}
                  className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="font-serif text-base font-semibold text-neutral-900">
                        {agr.title}
                      </h3>
                      <p className="text-[12px] text-neutral-400 mt-0.5">
                        Purchased {agr.datePurchased}
                      </p>
                    </div>
                    {!isComplete && agr.estimatedCompletion && (
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                          Est. Completion
                        </p>
                        <p className="text-sm font-medium text-neutral-700">
                          {agr.estimatedCompletion}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Review Timeline */}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      {REVIEW_STEPS.map((step, idx) => {
                        const isPast = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        const isFuture = idx > currentIdx;
                        return (
                          <div key={step.key} className="flex flex-col items-center flex-1 relative">
                            {/* Connector line */}
                            {idx > 0 && (
                              <div
                                className={`absolute top-3.5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                                  isPast || isCurrent ? "bg-emerald-500" : "bg-neutral-200"
                                }`}
                                style={{ zIndex: 0 }}
                              />
                            )}
                            {/* Step dot */}
                            <div
                              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isPast || (isCurrent && isComplete)
                                  ? "bg-emerald-500 border-emerald-500"
                                  : isCurrent
                                  ? "bg-white border-rose-800 ring-4 ring-rose-100"
                                  : "bg-white border-neutral-200"
                              }`}
                            >
                              {isPast && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {isCurrent && !isComplete && (
                                <div className="relative w-2.5 h-2.5">
                                  <div className="absolute inset-0 rounded-full bg-rose-800 animate-ping opacity-40" />
                                  <div className="relative w-2.5 h-2.5 rounded-full bg-rose-800" />
                                </div>
                              )}
                              {isCurrent && isComplete && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {isFuture && (
                                <div className="w-2 h-2 rounded-full bg-neutral-200" />
                              )}
                            </div>
                            <p
                              className={`text-[11px] mt-2 font-medium text-center ${
                                isPast
                                  ? "text-emerald-600"
                                  : isCurrent
                                  ? "text-rose-800 font-semibold"
                                  : "text-neutral-400"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Approved stamp */}
                  {isComplete && (
                    <div className="mt-6 pt-5 border-t border-emerald-100">
                      <div className="flex items-center gap-4 bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-emerald-700">
                            Reviewed & Approved by a Licensed Lawyer
                          </p>
                          {agr.reviewedBy && (
                            <p className="text-[12px] text-neutral-500 mt-0.5">{agr.reviewedBy}</p>
                          )}
                        </div>
                        <a
                          href={`/api/download/${agr.id}`}
                          download
                          className="ml-auto px-5 py-2.5 text-[12px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-md active:scale-95"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Approved Document
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {reviewableAgreements.length === 0 && (
              <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
                <p className="text-neutral-400 text-sm">No agreements currently under lawyer review.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ Messages Tab ═══ */}
        {activeTab === "messages" && (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const isExpanded = expandedConv === conv.id;
              return (
                <div
                  key={conv.id}
                  className={`bg-white border rounded-xl transition-all duration-200 overflow-hidden ${
                    conv.unread ? "border-rose-200" : "border-neutral-200"
                  } ${isExpanded ? "shadow-md" : "hover:border-neutral-300 hover:shadow-sm"}`}
                >
                  {/* Thread header — always visible */}
                  <button
                    onClick={() => setExpandedConv(isExpanded ? null : conv.id)}
                    className="w-full p-5 text-left cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-serif text-sm font-bold ${
                          conv.unread
                            ? "bg-rose-100 text-rose-800"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {conv.lawyerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-0.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className={`text-sm truncate ${conv.unread ? "font-semibold text-neutral-900" : "text-neutral-700"}`}>
                              {conv.lawyerName}
                            </p>
                            {conv.unread && (
                              <span className="inline-flex w-2 h-2 rounded-full bg-rose-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[11px] text-neutral-400">
                              {conv.timestamp}
                            </span>
                            <svg className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-[12px] text-rose-800/70 font-medium mb-1 truncate">
                          Re: {conv.agreementName}
                        </p>
                        {!isExpanded && (
                          <p className="text-[13px] text-neutral-500 line-clamp-2">{conv.preview}</p>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded thread */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100">
                      {/* Message list */}
                      <div className="px-5 py-4 space-y-4 max-h-[400px] overflow-y-auto">
                        {conv.messages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.sender === "client" ? "flex-row-reverse" : ""}`}>
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                                msg.sender === "lawyer"
                                  ? "bg-rose-100 text-rose-800 font-serif"
                                  : "bg-neutral-100 text-neutral-500"
                              }`}
                            >
                              {msg.sender === "lawyer"
                                ? msg.senderName.split(" ").map((n) => n[0]).join("")
                                : "You"}
                            </div>
                            <div className={`flex-1 max-w-[80%] ${msg.sender === "client" ? "text-right" : ""}`}>
                              <div className={`flex items-center gap-2 mb-1 ${msg.sender === "client" ? "justify-end" : ""}`}>
                                <span className="text-[12px] font-medium text-neutral-700">{msg.senderName}</span>
                                <span className="text-[10px] text-neutral-400">{msg.timestamp}</span>
                              </div>
                              <div
                                className={`inline-block px-4 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                                  msg.sender === "lawyer"
                                    ? "bg-neutral-50 text-neutral-700 rounded-tl-sm"
                                    : "bg-rose-800 text-white rounded-tr-sm"
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reply input */}
                      <div className="px-5 py-3 bg-neutral-50/50 border-t border-neutral-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder={`Reply to ${conv.lawyerName}...`}
                            value={messageInput[conv.id] || ""}
                            onChange={(e) =>
                              setMessageInput((prev) => ({ ...prev, [conv.id]: e.target.value }))
                            }
                            className="flex-1 px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 bg-white placeholder:text-neutral-400 transition-all"
                          />
                          <button className="px-4 py-2.5 bg-rose-800 hover:bg-rose-900 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 active:scale-95 hover:shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ Customizations Tab ═══ */}
        {activeTab === "customizations" && (
          <div className="space-y-3">
            {/* New Customization button */}
            <div className="flex justify-end mb-2">
              <Link
                href="/customize"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-800 hover:bg-rose-900 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Customization
              </Link>
            </div>

            {customizations.map((cust) => {
              const custStatus = CUSTOMIZATION_STATUS[cust.status];
              const isExpanded = expandedCust === cust.id;
              const CUST_STEPS = [
                { key: "pending-ai", label: "Pending Ruby Draft" },
                { key: "in-progress", label: "In Progress" },
                { key: "awaiting-review", label: "Awaiting Review" },
                { key: "completed", label: "Completed" },
              ];
              const custStepIdx = CUST_STEPS.findIndex((s) => s.key === cust.status);
              return (
                <div
                  key={cust.id}
                  className={`bg-white border rounded-xl transition-all duration-200 overflow-hidden ${
                    isExpanded ? "border-rose-200 shadow-md" : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                          <h3 className="font-serif text-base font-semibold text-neutral-900">
                            {cust.agreementTitle}
                          </h3>
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${custStatus.color} ${custStatus.bg} ${custStatus.border} flex-shrink-0`}
                          >
                            {custStatus.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-neutral-700 mb-1">{cust.modificationType}</p>
                        <p className="text-[13px] text-neutral-500 mb-2">{cust.description}</p>
                        <div className="flex items-center gap-4 text-[12px] text-neutral-400">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {cust.complexityTier} Complexity
                          </span>
                          <span className="font-semibold text-neutral-600">{cust.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setExpandedCust(isExpanded ? null : cust.id)}
                          className="px-4 py-2 text-[12px] font-medium text-rose-800 border border-rose-200 rounded-lg hover:bg-rose-50 transition-all duration-200 hover:shadow-md active:scale-95"
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail with progress timeline */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-neutral-100">
                      <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-3 mt-3">
                        Modification Progress
                      </p>
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          {CUST_STEPS.map((step, idx) => {
                            const isPast = idx < custStepIdx;
                            const isCurrent = idx === custStepIdx;
                            const isFuture = idx > custStepIdx;
                            const isDone = cust.status === "completed";
                            return (
                              <div key={step.key} className="flex flex-col items-center flex-1 relative">
                                {idx > 0 && (
                                  <div
                                    className={`absolute top-3 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                                      isPast || isCurrent ? "bg-emerald-500" : "bg-neutral-200"
                                    }`}
                                    style={{ zIndex: 0 }}
                                  />
                                )}
                                <div
                                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                    isPast || (isCurrent && isDone)
                                      ? "bg-emerald-500 border-emerald-500"
                                      : isCurrent
                                      ? "bg-white border-rose-800 ring-4 ring-rose-100"
                                      : "bg-white border-neutral-200"
                                  }`}
                                >
                                  {(isPast || (isCurrent && isDone)) && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  {isCurrent && !isDone && (
                                    <div className="relative w-2 h-2">
                                      <div className="absolute inset-0 rounded-full bg-rose-800 animate-ping opacity-40" />
                                      <div className="relative w-2 h-2 rounded-full bg-rose-800" />
                                    </div>
                                  )}
                                  {isFuture && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                                  )}
                                </div>
                                <p
                                  className={`text-[10px] mt-1.5 font-medium text-center ${
                                    isPast || (isCurrent && isDone)
                                      ? "text-emerald-600"
                                      : isCurrent
                                      ? "text-rose-800 font-semibold"
                                      : "text-neutral-400"
                                  }`}
                                >
                                  {step.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Upgrade CTA Banner ─── */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 rounded-2xl p-8 sm:p-10 relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
          </div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-rose-200">
                    Upgrade Available
                  </p>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-normal text-white mb-3">
                  Get Your Agreements Reviewed by a Licensed Canadian Lawyer
                </h2>
                <p className="text-rose-200 text-sm max-w-xl mb-5">
                  Expert Draft agreements are production-ready but unreviewed. Upgrade to Counsel Review
                  starting at <span className="text-white font-semibold">$149/agreement</span> and get the professional
                  sign-off your business deserves.
                </p>

                {/* Benefits list */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 lg:mb-0">
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-rose-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <div>
                      <p className="text-white text-sm font-medium">Redline Markup</p>
                      <p className="text-rose-300 text-[11px]">Tracked changes with lawyer annotations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-rose-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <div>
                      <p className="text-white text-sm font-medium">Enforceability Opinion</p>
                      <p className="text-rose-300 text-[11px]">Jurisdiction-specific legal analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-rose-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <div>
                      <p className="text-white text-sm font-medium">Direct Communication</p>
                      <p className="text-rose-300 text-[11px]">Message your reviewing lawyer directly</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-rose-50 text-rose-900 text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Upgrade to Counsel Review
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <p className="text-rose-300 text-[11px]">Starting at $149 per agreement</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
