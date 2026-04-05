"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */

type AgreementStatus = "expert-draft" | "under-review" | "approved" | "customizing" | "delivered";
type ReviewStep = "submitted" | "ai-review" | "lawyer-review" | "approved";
type Tab = "agreements" | "review" | "messages" | "customizations" | "account";

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
  assignedLawyer?: string;
  price: number;
  rating?: number;
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

interface BillingRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "Paid" | "Pending" | "Refunded";
  type: "Agreement" | "Customization" | "Counsel Review";
}

/* ═══════════════════════════════════════════════════════
   DEMO DATA
   ═══════════════════════════════════════════════════════ */

const DEMO_CLIENT = {
  name: "Alex Rivera",
  email: "alex@techstartup.ca",
  company: "NovaTech Solutions Inc.",
  phone: "+1 (416) 555-0192",
  joinDate: "January 2026",
  plan: "Growth",
};

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
    assignedLawyer: "Sarah Chen, Barrister & Solicitor",
    price: 449,
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
    assignedLawyer: "Sarah Chen, Barrister & Solicitor",
    price: 349,
    rating: 5,
  },
  {
    id: "agr-3",
    title: "SAFE Agreement — Post-Money",
    type: "SAFE Agreement",
    status: "expert-draft",
    datePurchased: "2026-04-01",
    tier: "expert-draft",
    price: 149,
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
    assignedLawyer: "Marc Dubois, Avocat",
    price: 299,
    rating: 4,
  },
  {
    id: "agr-5",
    title: "Influencer / Creator Agreement",
    type: "Creator Agreement",
    status: "customizing",
    datePurchased: "2026-04-02",
    tier: "counsel-review",
    reviewStep: "submitted",
    assignedLawyer: "Sarah Chen, Barrister & Solicitor",
    price: 349,
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
    assignedLawyer: "Sarah Chen, Barrister & Solicitor",
    price: 549,
    rating: 5,
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

interface CustomizationOption {
  id: string;
  label: string;
  description: string;
  tier: "Simple" | "Moderate" | "Complex";
  price: number;
}

const CUSTOMIZATION_OPTIONS: CustomizationOption[] = [
  { id: "custom-clause", label: "Add Custom Clause", description: "Add a bespoke clause drafted to your specific requirements", tier: "Moderate", price: 175 },
  { id: "jurisdiction-adapt", label: "Multi-Province Adaptation", description: "Adapt your agreement for additional Canadian provinces", tier: "Simple", price: 95 },
  { id: "schedule-append", label: "Custom Schedule / Exhibit", description: "Add a tailored schedule (e.g., IP list, vesting schedule, restrictive covenants)", tier: "Simple", price: 95 },
  { id: "negotiation-markup", label: "Counter-Party Negotiation Markup", description: "We'll redline the agreement from the other side's perspective so you know what to expect", tier: "Moderate", price: 195 },
  { id: "compliance-addon", label: "Additional Compliance Module", description: "Layer on PIPEDA, CASL, securities, or industry-specific compliance provisions", tier: "Moderate", price: 175 },
  { id: "plain-language", label: "Plain Language Summary", description: "A non-legal summary explaining every section in everyday language", tier: "Simple", price: 75 },
  { id: "french-translation", label: "French Language Version", description: "Professional French translation for Quebec compliance (Charter of the French Language)", tier: "Complex", price: 395 },
  { id: "board-resolution", label: "Board Resolution Package", description: "Companion board resolutions authorizing the agreement", tier: "Simple", price: 125 },
  { id: "amendment-template", label: "Future Amendment Template", description: "Pre-drafted amendment template for common future changes", tier: "Simple", price: 75 },
  { id: "counsel-upgrade", label: "Upgrade to Counsel Review", description: "Have a licensed Canadian lawyer review and redline your agreement", tier: "Complex", price: 250 },
];

function generateMockDraft(title: string): string {
  return `${title.toUpperCase()}

THIS AGREEMENT is made as of the _____ day of __________, 2026

BETWEEN:

    NOVATECH SOLUTIONS INC., a corporation incorporated under
    the laws of the Province of Ontario
    (hereinafter referred to as the "Company")

                                                          — AND —

    [COUNTERPARTY NAME], a [corporation/individual] of the
    [Province of ___________]
    (hereinafter referred to as the "Party")

    (collectively, the "Parties")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECITALS

WHEREAS the Company is engaged in the business of developing
and commercializing software technology solutions;

WHEREAS the Party desires to enter into this Agreement with
the Company on the terms and conditions set forth herein;

WHEREAS the Parties wish to set out their respective rights,
obligations, and responsibilities in connection with the
subject matter of this Agreement;

AND WHEREAS the Parties have agreed to be bound by the
provisions contained herein;

NOW THEREFORE, in consideration of the mutual covenants and
agreements herein contained, and for other good and valuable
consideration, the receipt and sufficiency of which are hereby
acknowledged, the Parties agree as follows:


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARTICLE 1 — DEFINITIONS

1.1  In this Agreement, unless the context otherwise requires:

     (a)  "Affiliate" means any entity that directly or
          indirectly controls, is controlled by, or is under
          common control with a Party;

     (b)  "Business Day" means any day other than a Saturday,
          Sunday, or statutory holiday in the Province of Ontario;

     (c)  "Confidential Information" has the meaning ascribed
          thereto in Article 5;

     (d)  "Effective Date" means the date first written above;

     (e)  "Intellectual Property" means all patents, copyrights,
          trademarks, trade secrets, and other proprietary rights;

     (f)  "Term" has the meaning ascribed thereto in Article 2.


ARTICLE 2 — TERM AND RENEWAL

2.1  This Agreement shall commence on the Effective Date and
     shall continue for an initial term of twenty-four (24)
     months (the "Initial Term").

2.2  Upon expiration of the Initial Term, this Agreement shall
     automatically renew for successive twelve (12) month
     periods (each a "Renewal Term"), unless either Party
     provides written notice of non-renewal at least sixty (60)
     days prior to the expiration of the then-current term.

2.3  The Initial Term and any Renewal Terms are collectively
     referred to as the "Term."


ARTICLE 3 — COMPENSATION AND PAYMENT

3.1  In consideration of the services and obligations set forth
     herein, the Company shall pay the Party in accordance with
     Schedule "A" attached hereto.

3.2  All payments shall be made in Canadian dollars within
     thirty (30) days of receipt of a proper invoice.

3.3  The Company shall be entitled to withhold from any amounts
     payable hereunder such amounts as may be required to be
     withheld under applicable federal, provincial, or
     municipal tax legislation.

3.4  Late payments shall bear interest at a rate of 1.5% per
     month, compounded monthly, from the due date until paid.


ARTICLE 4 — INTELLECTUAL PROPERTY ASSIGNMENT

4.1  The Party hereby irrevocably assigns to the Company all
     right, title, and interest in and to any Intellectual
     Property created, developed, or conceived by the Party
     in connection with this Agreement.

4.2  The Party shall execute all documents and take all actions
     reasonably requested by the Company to perfect the
     Company's ownership of such Intellectual Property.

4.3  Notwithstanding the foregoing, any Intellectual Property
     owned by the Party prior to the Effective Date, as set
     forth in Schedule "B," shall remain the property of the
     Party (the "Pre-Existing IP").

4.4  The Party hereby grants to the Company a non-exclusive,
     royalty-free, perpetual license to use any Pre-Existing
     IP incorporated into deliverables under this Agreement.


ARTICLE 5 — CONFIDENTIALITY

5.1  "Confidential Information" means all information disclosed
     by one Party to the other, whether orally, in writing,
     or in electronic form, that is designated as confidential
     or that reasonably should be understood to be confidential
     given the nature of the information.

5.2  Each Party agrees to hold the other Party's Confidential
     Information in strict confidence and not to disclose such
     information to any third party without the prior written
     consent of the disclosing Party.

5.3  The obligations of confidentiality shall survive the
     termination of this Agreement for a period of five (5)
     years.

5.4  The foregoing obligations shall not apply to information
     that: (a) is or becomes publicly available; (b) was known
     to the receiving Party prior to disclosure; (c) is
     independently developed; or (d) is required to be
     disclosed by law.


ARTICLE 6 — TERMINATION

6.1  Either Party may terminate this Agreement:

     (a)  for convenience, upon ninety (90) days' prior
          written notice to the other Party;

     (b)  immediately upon written notice if the other Party
          commits a material breach of this Agreement and
          fails to cure such breach within thirty (30) days
          after receipt of written notice thereof;

     (c)  immediately upon written notice if the other Party
          becomes insolvent, makes an assignment for the
          benefit of creditors, or is subject to proceedings
          under any bankruptcy or insolvency legislation.

6.2  Upon termination, each Party shall promptly return or
     destroy all Confidential Information of the other Party.


ARTICLE 7 — NON-COMPETITION AND NON-SOLICITATION

7.1  During the Term and for a period of twelve (12) months
     following termination (the "Restricted Period"), the
     Party shall not, directly or indirectly, engage in any
     business that competes with the Company within a fifty
     (50) kilometre radius of the Company's principal place
     of business.

7.2  During the Restricted Period, the Party shall not solicit,
     recruit, or hire any employee or contractor of the
     Company.

7.3  The Parties acknowledge that the restrictions contained in
     this Article are reasonable and necessary for the
     protection of the Company's legitimate business interests.


ARTICLE 8 — GOVERNING LAW AND JURISDICTION

8.1  This Agreement shall be governed by and construed in
     accordance with the laws of the Province of Ontario and
     the federal laws of Canada applicable therein.

8.2  The Parties hereby irrevocably attorn to the exclusive
     jurisdiction of the courts of the Province of Ontario.


ARTICLE 9 — DISPUTE RESOLUTION

9.1  The Parties shall attempt to resolve any dispute arising
     out of or in connection with this Agreement through
     good-faith negotiation.

9.2  If the dispute is not resolved within thirty (30) days,
     either Party may submit the dispute to mediation in
     accordance with the mediation rules of the ADR Institute
     of Ontario.

9.3  If mediation is unsuccessful within sixty (60) days, the
     dispute shall be finally resolved by binding arbitration
     in Toronto, Ontario, in accordance with the Arbitration
     Act, 1991 (Ontario).


ARTICLE 10 — GENERAL PROVISIONS

10.1 Entire Agreement. This Agreement, including all Schedules,
     constitutes the entire agreement between the Parties and
     supersedes all prior negotiations, representations, and
     agreements relating to the subject matter hereof.

10.2 Amendment. No amendment to this Agreement shall be
     effective unless made in writing and signed by both
     Parties.

10.3 Waiver. The failure of either Party to enforce any
     provision of this Agreement shall not constitute a waiver
     of such provision or of the right to enforce it at a
     later time.

10.4 Severability. If any provision of this Agreement is held
     to be invalid or unenforceable, such provision shall be
     severed and the remaining provisions shall continue in
     full force and effect.

10.5 Assignment. Neither Party may assign this Agreement
     without the prior written consent of the other Party,
     except to an Affiliate or in connection with a merger,
     acquisition, or sale of substantially all of its assets.

10.6 Notices. All notices shall be in writing and shall be
     deemed to have been duly given when delivered personally,
     sent by registered mail, or sent by email with
     confirmation of receipt.

10.7 Counterparts. This Agreement may be executed in any
     number of counterparts, each of which shall be deemed an
     original, and all of which together shall constitute one
     and the same instrument.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IN WITNESS WHEREOF the Parties have executed this Agreement
as of the date first written above.


NOVATECH SOLUTIONS INC.


Per: _________________________________
     Name:  Alex Rivera
     Title: Chief Executive Officer

I have authority to bind the corporation.


[COUNTERPARTY NAME]


Per: _________________________________
     Name:
     Title:

I have authority to bind the corporation.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCHEDULE "A" — COMPENSATION
[To be completed]

SCHEDULE "B" — PRE-EXISTING INTELLECTUAL PROPERTY
[To be completed]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Simple: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Moderate: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Complex: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

/* ── Draft Modal Component ── */

function DraftModal({
  agreement,
  selectedCustomizations,
  onToggleCustomization,
  onClose,
  scrollToCustomizations,
}: {
  agreement: Agreement;
  selectedCustomizations: Set<string>;
  onToggleCustomization: (id: string) => void;
  onClose: () => void;
  scrollToCustomizations?: boolean;
}) {
  const customizationsRef = React.useRef<HTMLDivElement>(null);
  const draftContent = generateMockDraft(agreement.title);
  const selectedTotal = CUSTOMIZATION_OPTIONS.filter((o) => selectedCustomizations.has(o.id)).reduce((sum, o) => sum + o.price, 0);

  React.useEffect(() => {
    if (scrollToCustomizations && customizationsRef.current) {
      setTimeout(() => {
        customizationsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [scrollToCustomizations]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-6xl mx-4 my-8 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-lg font-bold text-neutral-900 truncate">{agreement.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_CONFIG[agreement.status].color} ${STATUS_CONFIG[agreement.status].bg} border ${STATUS_CONFIG[agreement.status].border}`}>
                {STATUS_CONFIG[agreement.status].label}
              </span>
              <span className="text-[12px] text-neutral-400">Purchased {agreement.datePurchased}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={`/api/download/${agreement.id}`}
              download
              className="px-4 py-2 text-[12px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1.5 hover:shadow-md active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download PDF
            </a>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Under review banner */}
        {agreement.status === "under-review" && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <p className="text-sm text-amber-800 font-medium">This draft is currently under lawyer review — changes may be pending</p>
          </div>
        )}

        {/* Body: Document + Sidebar */}
        <div className="flex flex-col lg:flex-row">
          {/* Document Preview (70%) */}
          <div className="lg:w-[70%] border-r border-neutral-100">
            <div className="p-6 lg:p-8">
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 lg:p-8 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-serif text-[13px] leading-relaxed text-neutral-800">{draftContent}</pre>
              </div>
            </div>
          </div>

          {/* Customization Sidebar (30%) */}
          <div ref={customizationsRef} className="lg:w-[30%] bg-neutral-50/50">
            <div className="p-6">
              <div className="mb-5">
                <h3 className="font-serif text-base font-semibold text-neutral-900 mb-1">Available Customizations</h3>
                <p className="text-[12px] text-neutral-500">Enhance your agreement with professional add-ons</p>
              </div>

              <div className="space-y-2.5 max-h-[50vh] lg:max-h-[55vh] overflow-y-auto pr-1">
                {CUSTOMIZATION_OPTIONS.map((opt) => {
                  const isSelected = selectedCustomizations.has(opt.id);
                  const tierColor = TIER_COLORS[opt.tier];
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onToggleCustomization(opt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-[#be123c] bg-rose-50/50 shadow-sm"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          isSelected ? "bg-[#be123c] border-[#be123c]" : "border-neutral-300 bg-white"
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-semibold text-neutral-900">{opt.label}</span>
                            <span className="text-sm font-bold text-neutral-900 flex-shrink-0">${opt.price}</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mb-1.5 leading-relaxed">{opt.description}</p>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tierColor.text} ${tierColor.bg} ${tierColor.border}`}>
                            {opt.tier}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Running total + CTA */}
              <div className="mt-5 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-neutral-500">
                    {selectedCustomizations.size} selected
                  </span>
                  <span className="text-lg font-bold text-neutral-900">${selectedTotal} <span className="text-[11px] font-normal text-neutral-400">CAD</span></span>
                </div>
                <button
                  disabled={selectedCustomizations.size === 0}
                  className={`w-full py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    selectedCustomizations.size > 0
                      ? "bg-[#be123c] hover:bg-[#9f1239] text-white hover:shadow-md active:scale-[0.98]"
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {selectedCustomizations.size > 0
                    ? `Add Selected Customizations — $${selectedTotal} CAD`
                    : "Select customizations to continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEMO_BILLING: BillingRecord[] = [
  { id: "bill-1", date: "2026-04-02", description: "Influencer / Creator Agreement — Counsel Review", amount: 349, status: "Paid", type: "Agreement" },
  { id: "bill-2", date: "2026-04-01", description: "SAFE Agreement — Base Draft", amount: 149, status: "Paid", type: "Agreement" },
  { id: "bill-3", date: "2026-03-28", description: "Shareholder Agreement — Counsel Review", amount: 449, status: "Paid", type: "Agreement" },
  { id: "bill-4", date: "2026-03-28", description: "Custom vesting schedule modification", amount: 295, status: "Pending", type: "Customization" },
  { id: "bill-5", date: "2026-03-20", description: "Standard Employment Agreement — Counsel Review", amount: 349, status: "Paid", type: "Agreement" },
  { id: "bill-6", date: "2026-03-10", description: "Privacy Policy — Counsel Review", amount: 299, status: "Paid", type: "Agreement" },
  { id: "bill-7", date: "2026-03-10", description: "Non-compete modification", amount: 95, status: "Paid", type: "Customization" },
  { id: "bill-8", date: "2026-02-15", description: "Founders Agreement — Counsel Review", amount: 549, status: "Paid", type: "Agreement" },
  { id: "bill-9", date: "2026-02-15", description: "IP assignment carve-out modification", amount: 195, status: "Paid", type: "Customization" },
  { id: "bill-10", date: "2026-04-02", description: "Exclusivity clause modification", amount: 175, status: "Pending", type: "Customization" },
];

/* ═══════════════════════════════════════════════════════
   HELPERS & CONFIG
   ═══════════════════════════════════════════════════════ */

const STATUS_CONFIG: Record<AgreementStatus, { label: string; color: string; bg: string; border: string }> = {
  "expert-draft": { label: "Base Draft", color: "text-neutral-600", bg: "bg-neutral-100", border: "border-neutral-200" },
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

const inputClass = "w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] transition-all";

/* ═══════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════ */

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${sizeClass} ${star <= Math.round(rating) ? "text-amber-400" : "text-neutral-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = "bg-[#be123c]" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function SpinnerIcon() {
  return <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>;
}

function BillingStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Refunded: "bg-neutral-50 text-neutral-600 border-neutral-200",
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors[status] || "bg-neutral-50 text-neutral-600 border-neutral-200"}`}>{status}</span>;
}

/* ═══════════════════════════════════════════════════════
   AUTH GATE
   ═══════════════════════════════════════════════════════ */

function AuthGate({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); onLogin(); }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#faf9f7]">
      <div className="w-full max-w-md">
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
          {mode === "login" ? (
            <>
              <h2 className="font-serif text-xl font-semibold text-neutral-900 mb-6">Sign In</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                  <input type="email" placeholder="you@company.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                  <input type="password" placeholder="Enter password" className={inputClass} />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#be123c] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#9f1239] disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                  {isSubmitting ? <span className="inline-flex items-center gap-2"><SpinnerIcon /> Signing in...</span> : "Sign In"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => setMode("register")} className="text-sm text-[#be123c] hover:text-[#9f1239] font-medium transition-colors">
                  Create Account &rarr;
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setMode("login")} className="text-neutral-400 hover:text-neutral-700 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <h2 className="font-serif text-xl font-semibold text-neutral-900">Create Account</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#be123c] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#9f1239] disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                  {isSubmitting ? <span className="inline-flex items-center gap-2"><SpinnerIcon /> Creating account...</span> : "Create Account"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => setMode("login")} className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
                  Already have an account? Sign in
                </button>
              </div>
            </>
          )}
        </div>
        <p className="text-center text-xs text-neutral-400 mt-6">
          Demo mode — click Sign In or Create Account to continue.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════ */

export default function PortalPage() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("agreements");
  const [agreements] = useState<Agreement[]>(DEMO_AGREEMENTS);
  const [conversations] = useState<Conversation[]>(DEMO_CONVERSATIONS);
  const [customizations] = useState<Customization[]>(DEMO_CUSTOMIZATIONS);
  const [expandedConv, setExpandedConv] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState<Record<string, string>>({});
  const [expandedCust, setExpandedCust] = useState<string | null>(null);
  const [viewingAgreement, setViewingAgreement] = useState<Agreement | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Set<string>>(new Set());
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [scrollToCustomizationsOnOpen, setScrollToCustomizationsOnOpen] = useState(false);

  const openDraftModal = (agr: Agreement, scrollToCustomize = false) => {
    setViewingAgreement(agr);
    setSelectedCustomizations(new Set());
    setScrollToCustomizationsOnOpen(scrollToCustomize);
    setShowDraftModal(true);
  };

  const closeDraftModal = () => {
    setShowDraftModal(false);
    setViewingAgreement(null);
    setScrollToCustomizationsOnOpen(false);
  };

  const toggleCustomization = (id: string) => {
    setSelectedCustomizations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Auth gate
  if (!authed) return <AuthGate onLogin={() => setAuthed(true)} />;

  // Computed stats
  const activeCount = agreements.filter((a) => a.status === "under-review" || a.status === "customizing" || a.status === "expert-draft").length;
  const completedCount = agreements.filter((a) => a.status === "approved" || a.status === "delivered").length;
  const reviewsCompleted = agreements.filter((a) => a.reviewStep === "approved").length;
  const reviewsPending = agreements.filter((a) => a.tier === "counsel-review" && a.reviewStep && a.reviewStep !== "approved").length;
  const totalInvested = agreements.reduce((sum, a) => sum + a.price, 0);
  const avgTurnaround = "4.2 days";

  const unreadCount = conversations.filter((c) => c.unread).length;
  const customizationPendingCount = customizations.filter((c) => c.status !== "completed").length;
  const reviewableAgreements = agreements.filter((a) => a.tier === "counsel-review" && a.reviewStep);

  const TABS: { key: Tab; label: string; count?: number; dot?: boolean }[] = [
    { key: "agreements", label: "My Agreements", count: agreements.length },
    { key: "review", label: "In Review", count: reviewsPending || undefined },
    { key: "messages", label: "Messages", dot: unreadCount > 0, count: unreadCount || undefined },
    { key: "customizations", label: "Customizations", count: customizationPendingCount || undefined },
    { key: "account", label: "Account & Billing" },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* ── Top Nav ── */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#be123c]/10 flex items-center justify-center">
              <svg className="h-4 w-4 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
            </div>
            <span className="font-serif text-lg font-bold text-neutral-900">Ruby <span className="text-[#be123c]">Portal</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/documents" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#be123c] hover:bg-[#9f1239] text-white text-xs font-semibold rounded-lg transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Agreement
            </Link>
            <div className="h-8 w-8 rounded-full bg-[#be123c] flex items-center justify-center text-white text-xs font-bold">AR</div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-neutral-900">{DEMO_CLIENT.name}</p>
              <p className="text-xs text-neutral-500">{DEMO_CLIENT.company}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── 5 Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {/* Active Agreements */}
          <button onClick={() => setActiveTab("agreements")} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Active</span>
              <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#be123c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{activeCount}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">In progress</p>
          </button>

          {/* Completed */}
          <button onClick={() => setActiveTab("agreements")} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Completed</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{completedCount}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Delivered</p>
          </button>

          {/* Lawyer Reviews */}
          <button onClick={() => setActiveTab("review")} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Reviews</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{reviewsCompleted}<span className="text-sm font-normal text-neutral-400">/{reviewsCompleted + reviewsPending}</span></p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Completed / pending</p>
          </button>

          {/* Avg Turnaround */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Turnaround</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{avgTurnaround}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Avg. delivery time</p>
          </div>

          {/* Total Invested */}
          <button onClick={() => setActiveTab("account")} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Invested</span>
              <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#be123c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">${totalInvested.toLocaleString()}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">All agreements</p>
          </button>
        </div>

        {/* ── Tab Bar ── */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm mb-6">
          <div className="flex gap-0 overflow-x-auto border-b border-neutral-100">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-5 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-[#be123c] text-[#be123c]"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      activeTab === tab.key
                        ? "bg-rose-100 text-[#be123c]"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.dot && activeTab !== tab.key && (
                  <span className="absolute top-2.5 right-2 w-2 h-2 rounded-full bg-[#be123c]" />
                )}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <div className="p-6">

            {/* ═══════════════════════════════════════
               TAB 1: MY AGREEMENTS
               ═══════════════════════════════════════ */}
            {activeTab === "agreements" && (
              <div className="space-y-3">
                {agreements.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-12 h-12 text-neutral-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="text-neutral-500 mb-4">No agreements yet</p>
                    <Link href="/documents" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#be123c] hover:bg-[#9f1239] text-white text-sm font-semibold rounded-lg transition-all">
                      Browse our library &rarr;
                    </Link>
                  </div>
                ) : (
                  agreements.map((agr) => {
                    const status = STATUS_CONFIG[agr.status];
                    const stepIdx = agr.reviewStep ? getStepIndex(agr.reviewStep) : -1;
                    const progressPct = agr.tier === "counsel-review" && agr.reviewStep
                      ? Math.round(((stepIdx + 1) / REVIEW_STEPS.length) * 100)
                      : agr.status === "expert-draft" ? 100 : agr.status === "delivered" ? 100 : 50;

                    return (
                      <div key={agr.id} className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 hover:shadow-sm transition-all group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                              <h3 className="font-serif text-base font-semibold text-neutral-900 group-hover:text-[#be123c] transition-colors">
                                {agr.title}
                              </h3>
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status.color} ${status.bg} border ${status.border} flex-shrink-0`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-[12px] text-neutral-400 flex-wrap mb-3">
                              <span>{agr.type}</span>
                              <span className="hidden sm:inline">|</span>
                              <span>Purchased {agr.datePurchased}</span>
                              <span className="hidden sm:inline">|</span>
                              <span className={agr.tier === "counsel-review" ? "text-[#be123c] font-medium" : ""}>
                                {agr.tier === "counsel-review" ? "Counsel Review" : "Base Draft"}
                              </span>
                              {agr.estimatedCompletion && (
                                <>
                                  <span className="hidden sm:inline">|</span>
                                  <span>Est. {agr.estimatedCompletion}</span>
                                </>
                              )}
                            </div>

                            {/* Progress bar */}
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex-1 max-w-xs">
                                <ProgressBar
                                  value={progressPct}
                                  color={agr.status === "approved" || agr.status === "delivered" ? "bg-emerald-500" : "bg-[#be123c]"}
                                />
                              </div>
                              <span className="text-[11px] font-medium text-neutral-400">{progressPct}%</span>
                            </div>

                            {/* Assigned lawyer */}
                            {agr.assignedLawyer && (
                              <div className="flex items-center gap-2 text-[12px] text-neutral-500">
                                <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[9px] font-bold text-[#be123c]">
                                  {agr.assignedLawyer.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                                </div>
                                <span>{agr.assignedLawyer}</span>
                              </div>
                            )}

                            {/* Rating display for completed reviews */}
                            {agr.rating && (
                              <div className="flex items-center gap-2 mt-2">
                                <Stars rating={agr.rating} size="sm" />
                                <span className="text-[11px] text-neutral-400">Your rating</span>
                              </div>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                            {(agr.status === "approved" || agr.status === "delivered" || agr.status === "expert-draft") && (
                              <a href={`/api/download/${agr.id}`} download className="px-4 py-2 text-[12px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:shadow-md active:scale-95">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download
                              </a>
                            )}
                            {(agr.status === "expert-draft" || agr.status === "under-review" || agr.status === "approved" || agr.status === "delivered") && (
                              <button onClick={() => openDraftModal(agr)} className={`px-4 py-2 text-[12px] font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:shadow-md active:scale-95 ${
                                agr.status === "under-review"
                                  ? "text-amber-700 border border-amber-200 hover:bg-amber-50"
                                  : "text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                              }`}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                View Draft
                              </button>
                            )}
                            {agr.status === "under-review" && (
                              <button onClick={() => openDraftModal(agr, true)} className="px-4 py-2 text-[12px] font-medium text-[#be123c] border border-rose-200 rounded-lg hover:bg-rose-50 transition-all duration-200 flex items-center gap-1.5 hover:shadow-md active:scale-95">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Request Changes
                              </button>
                            )}
                            {agr.assignedLawyer && agr.status !== "delivered" && agr.status !== "expert-draft" && agr.status !== "under-review" && (
                              <button onClick={() => setActiveTab("messages")} className="px-4 py-2 text-[12px] font-medium text-[#be123c] border border-rose-200 rounded-lg hover:bg-rose-50 transition-all duration-200 flex items-center gap-1.5 hover:shadow-md active:scale-95">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                Message Lawyer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════
               TAB 2: IN REVIEW
               ═══════════════════════════════════════ */}
            {activeTab === "review" && (
              <div className="space-y-4">
                {reviewableAgreements.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-12 h-12 text-neutral-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <p className="text-neutral-500 mb-2">No agreements currently under review</p>
                    <p className="text-neutral-400 text-sm">Upgrade a Base Draft to Counsel Review to get started.</p>
                  </div>
                ) : (
                  reviewableAgreements.map((agr) => {
                    const currentIdx = getStepIndex(agr.reviewStep!);
                    const isComplete = agr.reviewStep === "approved";
                    const timeInStep = agr.status === "under-review" ? "2 days" : agr.status === "customizing" ? "1 day" : "";
                    return (
                      <div key={agr.id} className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            <h3 className="font-serif text-base font-semibold text-neutral-900">{agr.title}</h3>
                            <p className="text-[12px] text-neutral-400 mt-0.5">Purchased {agr.datePurchased}</p>
                            {agr.assignedLawyer && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-[10px] font-bold text-[#be123c]">
                                  {agr.assignedLawyer.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                                </div>
                                <span className="text-sm text-neutral-600">{agr.assignedLawyer}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            {!isComplete && agr.estimatedCompletion && (
                              <div>
                                <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Est. Completion</p>
                                <p className="text-sm font-medium text-neutral-700">{agr.estimatedCompletion}</p>
                              </div>
                            )}
                            {timeInStep && !isComplete && (
                              <p className="text-[11px] text-neutral-400">{timeInStep} in current step</p>
                            )}
                          </div>
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
                                  {idx > 0 && (
                                    <div
                                      className={`absolute top-3.5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                                        isPast || isCurrent ? "bg-emerald-500" : "bg-neutral-200"
                                      }`}
                                      style={{ zIndex: 0 }}
                                    />
                                  )}
                                  <div
                                    className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                      isPast || (isCurrent && isComplete)
                                        ? "bg-emerald-500 border-emerald-500"
                                        : isCurrent
                                        ? "bg-white border-[#be123c] ring-4 ring-rose-100"
                                        : "bg-white border-neutral-200"
                                    }`}
                                  >
                                    {isPast && (
                                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    )}
                                    {isCurrent && !isComplete && (
                                      <div className="relative w-2.5 h-2.5">
                                        <div className="absolute inset-0 rounded-full bg-[#be123c] animate-ping opacity-40" />
                                        <div className="relative w-2.5 h-2.5 rounded-full bg-[#be123c]" />
                                      </div>
                                    )}
                                    {isCurrent && isComplete && (
                                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    )}
                                    {isFuture && (
                                      <div className="w-2 h-2 rounded-full bg-neutral-200" />
                                    )}
                                  </div>
                                  <p className={`text-[11px] mt-2 font-medium text-center ${
                                    isPast ? "text-emerald-600" : isCurrent ? "text-[#be123c] font-semibold" : "text-neutral-400"
                                  }`}>
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
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-emerald-700">Reviewed & Approved by a Licensed Lawyer</p>
                                {agr.reviewedBy && <p className="text-[12px] text-neutral-500 mt-0.5">{agr.reviewedBy}</p>}
                                {agr.rating && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Stars rating={agr.rating} size="sm" />
                                    <span className="text-[11px] text-neutral-400">{agr.rating}.0 rating</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <a href={`/api/download/${agr.id}`} download className="px-4 py-2 text-[12px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:shadow-md active:scale-95">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                  Download PDF
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quick actions for non-complete */}
                        {!isComplete && (
                          <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-3">
                            <button onClick={() => setActiveTab("messages")} className="px-4 py-2 text-[12px] font-medium text-[#be123c] border border-rose-200 rounded-lg hover:bg-rose-50 transition-all flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              Message Lawyer
                            </button>
                            <button onClick={() => openDraftModal(agr)} className="px-4 py-2 text-[12px] font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              View Draft
                            </button>
                            <button onClick={() => openDraftModal(agr, true)} className="px-4 py-2 text-[12px] font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              Request Changes
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════
               TAB 3: MESSAGES
               ═══════════════════════════════════════ */}
            {activeTab === "messages" && (
              <div className="space-y-3">
                {conversations.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-12 h-12 text-neutral-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <p className="text-neutral-500">No messages yet. Start a Counsel Review to connect with a lawyer.</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isExpanded = expandedConv === conv.id;
                    return (
                      <div
                        key={conv.id}
                        className={`bg-white border rounded-xl transition-all duration-200 overflow-hidden ${
                          conv.unread ? "border-rose-200" : "border-neutral-200"
                        } ${isExpanded ? "shadow-md" : "hover:border-neutral-300 hover:shadow-sm"}`}
                      >
                        {/* Thread header */}
                        <button
                          onClick={() => setExpandedConv(isExpanded ? null : conv.id)}
                          className="w-full p-5 text-left cursor-pointer"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-serif text-sm font-bold ${
                              conv.unread ? "bg-rose-100 text-[#be123c]" : "bg-neutral-100 text-neutral-500"
                            }`}>
                              {conv.lawyerName.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3 mb-0.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <p className={`text-sm truncate ${conv.unread ? "font-semibold text-neutral-900" : "text-neutral-700"}`}>
                                    {conv.lawyerName}
                                  </p>
                                  {conv.unread && <span className="inline-flex w-2 h-2 rounded-full bg-[#be123c] flex-shrink-0" />}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-[11px] text-neutral-400">{conv.timestamp}</span>
                                  <svg className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                              </div>
                              <p className="text-[12px] text-[#be123c]/70 font-medium mb-1 truncate">Re: {conv.agreementName}</p>
                              {!isExpanded && <p className="text-[13px] text-neutral-500 line-clamp-2">{conv.preview}</p>}
                            </div>
                          </div>
                        </button>

                        {/* Expanded thread */}
                        {isExpanded && (
                          <div className="border-t border-neutral-100">
                            <div className="px-5 py-4 space-y-4 max-h-[400px] overflow-y-auto">
                              {conv.messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.sender === "client" ? "flex-row-reverse" : ""}`}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                                    msg.sender === "lawyer" ? "bg-rose-100 text-[#be123c] font-serif" : "bg-neutral-100 text-neutral-500"
                                  }`}>
                                    {msg.sender === "lawyer" ? msg.senderName.split(" ").map((n) => n[0]).join("") : "You"}
                                  </div>
                                  <div className={`flex-1 max-w-[80%] ${msg.sender === "client" ? "text-right" : ""}`}>
                                    <div className={`flex items-center gap-2 mb-1 ${msg.sender === "client" ? "justify-end" : ""}`}>
                                      <span className="text-[12px] font-medium text-neutral-700">{msg.senderName}</span>
                                      <span className="text-[10px] text-neutral-400">{msg.timestamp}</span>
                                    </div>
                                    <div className={`inline-block px-4 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                                      msg.sender === "lawyer" ? "bg-neutral-50 text-neutral-700 rounded-tl-sm" : "bg-[#be123c] text-white rounded-tr-sm"
                                    }`}>
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
                                  onChange={(e) => setMessageInput((prev) => ({ ...prev, [conv.id]: e.target.value }))}
                                  className="flex-1 px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 bg-white placeholder:text-neutral-400 transition-all"
                                />
                                <button className="px-4 py-2.5 bg-[#be123c] hover:bg-[#9f1239] text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 active:scale-95 hover:shadow-md">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                  Send
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════
               TAB 4: CUSTOMIZATIONS
               ═══════════════════════════════════════ */}
            {activeTab === "customizations" && (
              <div className="space-y-3">
                <div className="flex justify-end mb-2">
                  <Link href="/customize" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#be123c] hover:bg-[#9f1239] text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md active:scale-95">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Customization
                  </Link>
                </div>

                {customizations.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-12 h-12 text-neutral-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <p className="text-neutral-500 mb-2">No customization requests yet</p>
                    <Link href="/customize" className="text-[#be123c] text-sm font-medium hover:text-[#9f1239]">Request a modification &rarr;</Link>
                  </div>
                ) : (
                  customizations.map((cust) => {
                    const custStatus = CUSTOMIZATION_STATUS[cust.status];
                    const isExpanded = expandedCust === cust.id;
                    const CUST_STEPS = [
                      { key: "pending-ai", label: "Pending AI" },
                      { key: "in-progress", label: "In Progress" },
                      { key: "awaiting-review", label: "Awaiting Review" },
                      { key: "completed", label: "Completed" },
                    ];
                    const custStepIdx = CUST_STEPS.findIndex((s) => s.key === cust.status);

                    return (
                      <div key={cust.id} className={`bg-white border rounded-xl transition-all duration-200 overflow-hidden ${isExpanded ? "border-rose-200 shadow-md" : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"}`}>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                <h3 className="font-serif text-base font-semibold text-neutral-900">{cust.agreementTitle}</h3>
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${custStatus.color} ${custStatus.bg} ${custStatus.border} flex-shrink-0`}>
                                  {custStatus.label}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-neutral-700 mb-1">{cust.modificationType}</p>
                              <p className="text-[13px] text-neutral-500 mb-2">{cust.description}</p>
                              <div className="flex items-center gap-4 text-[12px] text-neutral-400">
                                <span className="flex items-center gap-1.5">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                  {cust.complexityTier} Complexity
                                </span>
                                <span className="font-semibold text-neutral-600">{cust.price}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setExpandedCust(isExpanded ? null : cust.id)}
                              className="px-4 py-2 text-[12px] font-medium text-[#be123c] border border-rose-200 rounded-lg hover:bg-rose-50 transition-all duration-200 hover:shadow-md active:scale-95 flex-shrink-0"
                            >
                              {isExpanded ? "Hide Details" : "View Details"}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 border-t border-neutral-100">
                            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-3 mt-3">Modification Progress</p>
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
                                        <div className={`absolute top-3 right-1/2 w-full h-0.5 -translate-y-1/2 ${isPast || isCurrent ? "bg-emerald-500" : "bg-neutral-200"}`} style={{ zIndex: 0 }} />
                                      )}
                                      <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                        isPast || (isCurrent && isDone) ? "bg-emerald-500 border-emerald-500" : isCurrent ? "bg-white border-[#be123c] ring-4 ring-rose-100" : "bg-white border-neutral-200"
                                      }`}>
                                        {(isPast || (isCurrent && isDone)) && (
                                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                        {isCurrent && !isDone && (
                                          <div className="relative w-2 h-2">
                                            <div className="absolute inset-0 rounded-full bg-[#be123c] animate-ping opacity-40" />
                                            <div className="relative w-2 h-2 rounded-full bg-[#be123c]" />
                                          </div>
                                        )}
                                        {isFuture && <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />}
                                      </div>
                                      <p className={`text-[10px] mt-1.5 font-medium text-center ${
                                        isPast || (isCurrent && isDone) ? "text-emerald-600" : isCurrent ? "text-[#be123c] font-semibold" : "text-neutral-400"
                                      }`}>
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
                  })
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════
               TAB 5: ACCOUNT & BILLING
               ═══════════════════════════════════════ */}
            {activeTab === "account" && (
              <div className="space-y-8">
                {/* Account Info */}
                <div>
                  <h3 className="font-serif text-lg font-semibold text-neutral-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-[#be123c] flex items-center justify-center text-white text-lg font-bold font-serif">
                          {DEMO_CLIENT.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-neutral-900">{DEMO_CLIENT.name}</p>
                          <p className="text-sm text-neutral-500">{DEMO_CLIENT.company}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">Email</span>
                          <span className="text-sm font-medium text-neutral-900">{DEMO_CLIENT.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">Phone</span>
                          <span className="text-sm font-medium text-neutral-900">{DEMO_CLIENT.phone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">Member since</span>
                          <span className="text-sm font-medium text-neutral-900">{DEMO_CLIENT.joinDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                      <h4 className="text-sm font-semibold text-neutral-900 mb-4">Payment Method</h4>
                      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-neutral-200 mb-4">
                        <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">VISA</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900">**** **** **** 4242</p>
                          <p className="text-xs text-neutral-400">Expires 09/2028</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Default</span>
                      </div>
                      <button className="w-full py-2.5 text-sm font-medium text-[#be123c] border border-rose-200 rounded-lg hover:bg-rose-50 transition-all">
                        Update Payment Method
                      </button>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-semibold text-neutral-900">Billing History</h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <span>Total spent:</span>
                      <span className="font-bold text-neutral-900">${DEMO_BILLING.reduce((s, b) => s + b.amount, 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-neutral-100">
                            <th className="text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">Date</th>
                            <th className="text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">Description</th>
                            <th className="text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">Type</th>
                            <th className="text-right text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">Amount</th>
                            <th className="text-right text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-5 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DEMO_BILLING.map((bill) => (
                            <tr key={bill.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                              <td className="px-5 py-3.5 text-sm text-neutral-600 whitespace-nowrap">{bill.date}</td>
                              <td className="px-5 py-3.5 text-sm text-neutral-900 font-medium">{bill.description}</td>
                              <td className="px-5 py-3.5">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                  bill.type === "Agreement" ? "bg-blue-50 text-blue-700" :
                                  bill.type === "Customization" ? "bg-violet-50 text-violet-700" :
                                  "bg-rose-50 text-[#be123c]"
                                }`}>
                                  {bill.type}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-sm font-semibold text-neutral-900 text-right">${bill.amount.toLocaleString()}</td>
                              <td className="px-5 py-3.5 text-right"><BillingStatusBadge status={bill.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Download History */}
                <div>
                  <h3 className="font-serif text-lg font-semibold text-neutral-900 mb-4">Agreement Download History</h3>
                  <div className="space-y-2">
                    {agreements.filter((a) => a.status === "approved" || a.status === "delivered" || a.status === "expert-draft").map((agr) => (
                      <div key={agr.id} className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-neutral-50 flex items-center justify-center">
                            <svg className="w-4.5 h-4.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900">{agr.title}</p>
                            <p className="text-[12px] text-neutral-400">Purchased {agr.datePurchased} | {agr.tier === "counsel-review" ? "Counsel Review" : "Base Draft"}</p>
                          </div>
                        </div>
                        <a href={`/api/download/${agr.id}`} download className="px-4 py-2 text-[12px] font-medium text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download PDF
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Upgrade CTA Banner ── */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 rounded-2xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
          </div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-rose-200">Upgrade Available</p>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-normal text-white mb-3">
                  Get Your Agreements Reviewed by a Licensed Canadian Lawyer
                </h2>
                <p className="text-rose-200 text-sm max-w-xl mb-5">
                  Base Draft agreements are production-ready but unreviewed. Upgrade to Counsel Review
                  starting at <span className="text-white font-semibold">$149/agreement</span> and get the professional
                  sign-off your business deserves.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 lg:mb-0">
                  {[
                    { title: "Redline Markup", desc: "Tracked changes with lawyer annotations" },
                    { title: "Enforceability Opinion", desc: "Jurisdiction-specific legal analysis" },
                    { title: "Direct Communication", desc: "Message your reviewing lawyer directly" },
                  ].map((b) => (
                    <div key={b.title} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-rose-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
                      <div>
                        <p className="text-white text-sm font-medium">{b.title}</p>
                        <p className="text-rose-300 text-[11px]">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <Link href="/pricing" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-rose-50 text-rose-900 text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
                  Upgrade to Counsel Review
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <p className="text-rose-300 text-[11px]">Starting at $149 per agreement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Draft Modal ── */}
      {showDraftModal && viewingAgreement && (
        <DraftModal
          agreement={viewingAgreement}
          selectedCustomizations={selectedCustomizations}
          onToggleCustomization={toggleCustomization}
          onClose={closeDraftModal}
          scrollToCustomizations={scrollToCustomizationsOnOpen}
        />
      )}
    </div>
  );
}
