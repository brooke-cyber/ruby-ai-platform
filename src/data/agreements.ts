export type Category = "employment" | "corporate" | "investment" | "commercial" | "platform" | "creator";
export type Complexity = "low" | "medium" | "high" | "very-high";

export interface Agreement {
  id: string;
  category: Category;
  crossListedIn?: Category[];
  type: string;
  title: string;
  description: string;
  price: number;
  counselPrice: number;
  complexity: Complexity;
  caseRef: string;
  caseCitation: string;
  typicalUseCase: string;
  keyDifferentiator: string;
  tags: string[];
  relatedAgreements: string[];
}

export const AGREEMENTS: Agreement[] = [
  // ── HIRING & TEAM (7) ──
  {
    id: "standard-employment",
    category: "employment",
    type: "standard-employment",
    title: "Standard Employment Agreement",
    description: "Your first hire deserves a real contract. Covers compensation, benefits, termination, and restrictive covenants — built to protect you if things go sideways.",
    price: 199,
    counselPrice: 399,
    complexity: "low",
    caseRef: "Waksdale v. Swegon",
    caseCitation: "Waksdale v. Swegon Group AB, 2020 ONCA 391",
    typicalUseCase: "Full-time employees hired without fixed end date",
    keyDifferentiator: "Governed by ESA; common law reasonable notice on termination",
    tags: ["employment", "hiring", "startup", "full-time", "termination", "ESA"],
    relatedAgreements: ["offer-letter", "ip-assignment", "non-compete"],
  },
  {
    id: "fixed-term",
    category: "employment",
    type: "fixed-term",
    title: "Fixed-Term Employment Agreement",
    description: "Hiring for a project or covering a leave? Lock in the end date, early termination rights, and renewal terms so there are no surprises for either side.",
    price: 199,
    counselPrice: 399,
    complexity: "medium",
    caseRef: "Howard v. Benson Group",
    caseCitation: "Howard v. Benson Group Ltd., 2012 ONCA 231",
    typicalUseCase: "Maternity leave coverage, project-based roles",
    keyDifferentiator: "Howard v. Benson rules; early termination provisions required",
    tags: ["employment", "hiring", "contract", "fixed-term", "project", "temporary"],
    relatedAgreements: ["standard-employment", "ip-assignment", "offer-letter"],
  },
  {
    id: "executive-employment",
    category: "employment",
    type: "executive-employment",
    title: "Executive Employment Agreement",
    description: "Your C-suite hire needs more than a standard contract. Enhanced severance, change-of-control protection, and enforceable non-competes built for senior leadership.",
    price: 349,
    counselPrice: 599,
    complexity: "high",
    caseRef: "Shafron v. Ceccardi",
    caseCitation: "Shafron v. Ceccardi Development Inc., 2008 CanLII 40409",
    typicalUseCase: "CEOs, CFOs, CTOs, and senior management",
    keyDifferentiator: "C-suite non-compete exception; enhanced severance multipliers",
    tags: ["employment", "executive", "c-suite", "severance", "change-of-control", "non-compete", "equity"],
    relatedAgreements: ["non-compete", "ip-assignment", "offer-letter"],
  },
  {
    id: "non-compete",
    category: "employment",
    crossListedIn: ["creator"],
    type: "non-compete",
    title: "Non-Compete / Non-Solicit",
    description: "Stop your best people from walking to competitors or poaching your clients. Enforceable restrictive covenants that actually hold up in Canadian courts.",
    price: 199,
    counselPrice: 349,
    complexity: "high",
    caseRef: "Elsley v. J.G. Collins",
    caseCitation: "Elsley v. J.G. Collins Insurance Agencies Ltd., 1978 CanLII 211 (SCC)",
    typicalUseCase: "Post-hire restrictive covenants requiring fresh consideration",
    keyDifferentiator: "Ontario s.67.2 prohibition applies; Shafron/Elsley test",
    tags: ["employment", "restrictive-covenant", "non-compete", "non-solicit", "departing-employee"],
    relatedAgreements: ["standard-employment", "executive-employment", "ip-assignment"],
  },
  {
    id: "ip-assignment",
    category: "employment",
    crossListedIn: ["creator", "corporate"],
    type: "ip-assignment",
    title: "Confidentiality & IP Assignment",
    description: "If your team builds it, you should own it. Assign all intellectual property to your company and protect your trade secrets — before someone walks out with them.",
    price: 149,
    counselPrice: 299,
    complexity: "medium",
    caseRef: "Sagaz Industries",
    caseCitation: "671122 Ontario Ltd. v. Sagaz Industries Canada Inc., 2001 SCC 59",
    typicalUseCase: "Technical employees, developers, designers with IP creation duties",
    keyDifferentiator: "Moral rights waiver under Copyright Act s.14.1",
    tags: ["employment", "ip", "intellectual-property", "confidentiality", "trade-secrets", "startup", "tech"],
    relatedAgreements: ["standard-employment", "contractor", "non-compete"],
  },
  {
    id: "contractor",
    category: "employment",
    crossListedIn: ["creator"],
    type: "contractor",
    title: "Independent Contractor Agreement",
    description: "Hiring a freelancer or consultant? Get the relationship documented properly so the CRA doesn\u2019t reclassify them as an employee — and you don\u2019t owe back taxes and benefits.",
    price: 199,
    counselPrice: 349,
    complexity: "medium",
    caseRef: "Sagaz Industries",
    caseCitation: "671122 Ontario Ltd. v. Sagaz Industries Canada Inc., 2001 SCC 15",
    typicalUseCase: "Freelancers, consultants, fractional executives",
    keyDifferentiator: "Sagaz misclassification risk; impacts withholding obligations",
    tags: ["employment", "contractor", "freelancer", "consultant", "startup", "CRA", "misclassification"],
    relatedAgreements: ["ip-assignment", "non-compete", "master-services-agreement"],
  },
  {
    id: "offer-letter",
    category: "employment",
    type: "offer-letter",
    title: "Offer of Employment",
    description: "Make it official. A professional offer letter with compensation, start date, and conditions — the document that turns a handshake into a binding commitment.",
    price: 99,
    counselPrice: 199,
    complexity: "low",
    caseRef: "Krishnamoorthy v. Olympus",
    caseCitation: "Krishnamoorthy v. Olympus Canada Inc., 2017 ONCA 873",
    typicalUseCase: "Initial employment offer preceding full agreement",
    keyDifferentiator: "Binding offer terms; acceptance creates employment contract",
    tags: ["employment", "hiring", "offer", "startup", "onboarding"],
    relatedAgreements: ["standard-employment", "executive-employment", "ip-assignment"],
  },

  // ── EQUITY & GOVERNANCE (7) ──
  {
    id: "two-party-usa",
    category: "corporate",
    type: "two-party-usa",
    title: "Two-Party Shareholder Agreement",
    description: "You and your co-founder need rules before you need a lawyer. Who decides what, who can sell, what happens in a deadlock — all locked in before emotions run high.",
    price: 499,
    counselPrice: 899,
    complexity: "high",
    caseRef: "Duha Printers v. R.",
    caseCitation: "Duha Printers (Western) Ltd. v. R., 1998 SCC",
    typicalUseCase: "One shareholder 50-80%, other 20-50%",
    keyDifferentiator: "Balances majority liquidity against minority veto rights",
    tags: ["corporate", "founder", "shareholder", "co-founder", "governance", "startup", "equity"],
    relatedAgreements: ["articles-incorporation", "emerging-corp-usa", "deadlock-usa"],
  },
  {
    id: "emerging-corp-usa",
    category: "corporate",
    type: "emerging-corp-usa",
    title: "Early-Stage Shareholder Agreement",
    description: "Built for early-stage companies. Founder vesting, equity pools, simple governance, and investor-ready structure — so you\u2019re not rewriting everything at your next round.",
    price: 399,
    counselPrice: 699,
    complexity: "medium",
    caseRef: "CBCA s.146",
    caseCitation: "Canada Business Corporations Act, R.S.C. 1985, c. C-44, s.146",
    typicalUseCase: "Early-stage companies with founder-employees and angel investors",
    keyDifferentiator: "Founder vesting, equity pools, and simple governance",
    tags: ["corporate", "startup", "founder", "vesting", "equity", "angel", "early-stage", "ESOP"],
    relatedAgreements: ["articles-incorporation", "safe-agreement", "two-party-usa"],
  },
  {
    id: "jv-usa",
    category: "corporate",
    type: "jv-usa",
    title: "Joint Venture Agreement",
    description: "Partnering with another company? Define IP ownership, profit sharing, and exit rights before the deal starts. The alternative is a lawsuit when things get complicated.",
    price: 599,
    counselPrice: 999,
    complexity: "very-high",
    caseRef: "CBCA/OBCA JV Provisions",
    caseCitation: "CBCA s.146 + OBCA JV Provisions",
    typicalUseCase: "Strategic alliance between 2-3 corporations",
    keyDifferentiator: "Unique IP ownership rules; deadlock resolution critical",
    tags: ["corporate", "joint-venture", "partnership", "ip", "strategic-alliance", "profit-sharing"],
    relatedAgreements: ["partnership-agreement", "ip-assignment", "master-services-agreement"],
  },
  {
    id: "pe-backed-usa",
    category: "corporate",
    type: "pe-backed-usa",
    title: "Investor / PE-Backed Agreement",
    description: "Taking institutional money? This protects both sides — board control, information rights, anti-dilution, and exit mechanics that investors expect to see.",
    price: 599,
    counselPrice: 999,
    complexity: "very-high",
    caseRef: "CBCA s.146",
    caseCitation: "Canada Business Corporations Act, R.S.C. 1985, c. C-44, s.146",
    typicalUseCase: "PE firm investor + incumbent owner/management",
    keyDifferentiator: "Board control, information rights, and exit provisions",
    tags: ["corporate", "investment", "private-equity", "venture-capital", "board", "anti-dilution", "governance"],
    relatedAgreements: ["emerging-corp-usa", "safe-agreement", "convertible-note"],
  },
  {
    id: "deadlock-usa",
    category: "corporate",
    type: "deadlock-usa",
    title: "50/50 Partnership Agreement",
    description: "Equal partners, equal risk. When you can\u2019t agree, you need a plan — mediation, arbitration, shotgun buy-sell. Without this, 50/50 splits end in litigation.",
    price: 499,
    counselPrice: 899,
    complexity: "high",
    caseRef: "CBCA s.146",
    caseCitation: "Canada Business Corporations Act, R.S.C. 1985, c. C-44, s.146",
    typicalUseCase: "Two equal shareholders with heightened deadlock risk",
    keyDifferentiator: "Deadlock resolution is the core of the agreement",
    tags: ["corporate", "founder", "partnership", "deadlock", "shotgun", "buy-sell", "50-50"],
    relatedAgreements: ["two-party-usa", "partnership-agreement", "articles-incorporation"],
  },
  {
    id: "articles-incorporation",
    category: "corporate",
    type: "articles-incorporation",
    title: "Incorporation & Formation",
    description: "The foundation of your company. Share structure, director provisions, and business restrictions — filed federally or provincially to bring your corporation to life.",
    price: 249,
    counselPrice: 449,
    complexity: "low",
    caseRef: "CBCA / OBCA",
    caseCitation: "CBCA s.6 / OBCA s.5",
    typicalUseCase: "New corporation formation",
    keyDifferentiator: "Foundation document for all corporate governance",
    tags: ["corporate", "incorporation", "startup", "formation", "shares", "CBCA", "OBCA"],
    relatedAgreements: ["emerging-corp-usa", "two-party-usa", "articles-amendment"],
  },
  {
    id: "articles-amendment",
    category: "corporate",
    type: "articles-amendment",
    title: "Articles of Amendment",
    description: "Changing your share structure, company name, or director count? File it properly the first time — errors here can delay fundraising and create compliance headaches.",
    price: 149,
    counselPrice: 299,
    complexity: "low",
    caseRef: "OBCA s.168",
    caseCitation: "Ontario Business Corporations Act, R.S.O. 1990, c. B.16, s.168",
    typicalUseCase: "Corporate changes requiring article amendments",
    keyDifferentiator: "Modifies existing corporate constating documents",
    tags: ["corporate", "amendment", "shares", "governance", "restructuring"],
    relatedAgreements: ["articles-incorporation", "emerging-corp-usa"],
  },

  // ── FINANCING & CAPITAL (6) ──
  {
    id: "safe-agreement",
    category: "investment",
    type: "safe-agreement",
    title: "SAFE Agreement (Canadian)",
    description: "Raise your round without the legal bill. Valuation cap, discount rate, MFN, and pro rata rights — fully compliant with Canadian securities law. Pre-seed through bridge.",
    price: 449,
    counselPrice: 799,
    complexity: "medium",
    caseRef: "NI 45-106",
    caseCitation: "National Instrument 45-106 Prospectus Exemptions",
    typicalUseCase: "Pre-seed, seed, or bridge financing rounds",
    keyDifferentiator: "Full Canadian SAFE with conversion mechanics, MFN, and securities compliance",
    tags: ["investment", "startup", "fundraising", "SAFE", "seed", "pre-seed", "angel", "securities"],
    relatedAgreements: ["convertible-note", "emerging-corp-usa", "pe-backed-usa"],
  },
  {
    id: "convertible-note",
    category: "investment",
    type: "convertible-note",
    title: "Convertible Note Agreement",
    description: "Bridge financing that converts to equity at the next round. Interest rate, maturity date, valuation cap, and conversion mechanics — structured so both sides know exactly when and how the note converts.",
    price: 449,
    counselPrice: 799,
    complexity: "high",
    caseRef: "Interest Act + NI 45-106",
    caseCitation: "Interest Act, R.S.C. 1985, c. I-15 + National Instrument 45-106",
    typicalUseCase: "Bridge rounds, pre-priced seed financing, angel investment",
    keyDifferentiator: "Conversion mechanics with Interest Act compliance and Criminal Code s.347 savings clause",
    tags: ["investment", "startup", "fundraising", "debt", "convertible", "bridge", "angel", "securities"],
    relatedAgreements: ["safe-agreement", "bilateral-loan", "emerging-corp-usa"],
  },
  {
    id: "bilateral-loan",
    category: "investment",
    type: "bilateral-loan",
    title: "Bilateral Loan Agreement",
    description: "Borrowing from one lender? Fixed or variable rate, repayment schedule, security interests, and default remedies — all drafted to protect both sides and comply with Canadian lending law.",
    price: 399,
    counselPrice: 699,
    complexity: "high",
    caseRef: "Interest Act + PPSA",
    caseCitation: "Interest Act, R.S.C. 1985, c. I-15 + Personal Property Security Act, R.S.O. 1990, c. P.10",
    typicalUseCase: "Private lending, shareholder loans, related-party financing",
    keyDifferentiator: "Interest Act s.4 disclosure + PPSA security registration + Criminal Code s.347 savings clause",
    tags: ["investment", "lending", "loan", "debt", "security", "PPSA", "shareholder-loan"],
    relatedAgreements: ["demand-note", "revolving-credit", "convertible-note"],
  },
  {
    id: "demand-note",
    category: "investment",
    type: "demand-note",
    title: "Demand Promissory Note",
    description: "Simple lending, done right. The lender can call the loan at any time — with proper notice provisions, interest calculations, and pre-payment rights baked in from day one.",
    price: 199,
    counselPrice: 399,
    complexity: "low",
    caseRef: "Bills of Exchange Act",
    caseCitation: "Bills of Exchange Act, R.S.C. 1985, c. B-4",
    typicalUseCase: "Short-term shareholder loans, family lending, bridge financing",
    keyDifferentiator: "Payable on demand with Bills of Exchange Act compliance and proper demand notice mechanics",
    tags: ["investment", "lending", "promissory-note", "demand", "short-term", "family", "shareholder-loan"],
    relatedAgreements: ["bilateral-loan", "revolving-credit"],
  },
  {
    id: "revolving-credit",
    category: "investment",
    type: "revolving-credit",
    title: "Revolving Credit Facility",
    description: "Need flexible access to capital? Draw down, repay, and re-borrow up to a set limit — with commitment fees, utilization thresholds, and financial covenants that lenders expect to see.",
    price: 599,
    counselPrice: 999,
    complexity: "very-high",
    caseRef: "Interest Act + PPSA + BIA",
    caseCitation: "Interest Act + PPSA + Bankruptcy and Insolvency Act, R.S.C. 1985, c. B-3",
    typicalUseCase: "Working capital facilities, operational credit lines, growth financing",
    keyDifferentiator: "Draw-down mechanics, financial covenants, borrowing base calculations, and cross-default provisions",
    tags: ["investment", "lending", "credit-facility", "revolving", "working-capital", "covenants", "PPSA"],
    relatedAgreements: ["bilateral-loan", "demand-note"],
  },

  // ── SAAS & SERVICES (3) ──
  {
    id: "saas-sla",
    category: "commercial",
    type: "saas-sla",
    title: "SaaS Service Level Agreement",
    description: "Selling software? Your customers expect uptime guarantees, service credits, and data handling commitments. This is the agreement that keeps enterprise clients signing.",
    price: 349,
    counselPrice: 599,
    complexity: "medium",
    caseRef: "PIPEDA + Provincial Privacy",
    caseCitation: "Personal Information Protection and Electronic Documents Act, S.C. 2000, c. 5",
    typicalUseCase: "Software-as-a-Service providers and customers",
    keyDifferentiator: "Uptime commitments with tiered service credits",
    tags: ["commercial", "SaaS", "software", "SLA", "uptime", "service-credits", "data", "PIPEDA"],
    relatedAgreements: ["enterprise-sla", "privacy-policy", "terms-and-conditions"],
  },
  {
    id: "managed-services-sla",
    category: "commercial",
    type: "managed-services-sla",
    title: "Managed Services SLA",
    description: "Outsourcing IT, ops, or support? Define response times, escalation paths, and accountability — so both sides know exactly what\u2019s expected before the invoice arrives.",
    price: 249,
    counselPrice: 449,
    complexity: "medium",
    caseRef: "PIPEDA + OHSA",
    caseCitation: "PIPEDA + Occupational Health and Safety Act, R.S.O. 1990, c. O.1",
    typicalUseCase: "Outsourced IT, HR, or operations services",
    keyDifferentiator: "Response/resolution time SLOs by severity tier",
    tags: ["commercial", "managed-services", "SLA", "outsourcing", "IT", "operations", "support"],
    relatedAgreements: ["master-services-agreement", "saas-sla", "enterprise-sla"],
  },
  {
    id: "enterprise-sla",
    category: "commercial",
    type: "enterprise-sla",
    title: "Enterprise Licensing SLA",
    description: "Landing enterprise deals? You need a licensing agreement that can handle complex liability frameworks, force majeure, and the compliance scrutiny that comes with big contracts.",
    price: 399,
    counselPrice: 699,
    complexity: "high",
    caseRef: "PIPEDA + Securities",
    caseCitation: "PIPEDA + Provincial Securities Legislation",
    typicalUseCase: "Enterprise software licensing and deployment",
    keyDifferentiator: "Complex liability caps and force majeure provisions",
    tags: ["commercial", "enterprise", "licensing", "SLA", "software", "liability", "force-majeure"],
    relatedAgreements: ["saas-sla", "master-services-agreement", "managed-services-sla"],
  },

  // ── PLATFORM & BUSINESS (4) ──
  {
    id: "terms-and-conditions",
    category: "platform",
    crossListedIn: ["commercial"],
    type: "terms-and-conditions",
    title: "Terms & Conditions",
    description: "Every website, app, and platform needs enforceable terms. Liability limits, dispute resolution, user obligations, and privacy compliance — built so they actually hold up in court.",
    price: 249,
    counselPrice: 449,
    complexity: "medium",
    caseRef: "Rudder v. Microsoft",
    caseCitation: "Rudder v. Microsoft Corp., 1999 CanLII 14923 (ON SC)",
    typicalUseCase: "SaaS platforms, e-commerce sites, mobile apps, digital services",
    keyDifferentiator: "Clickwrap enforceability with Uber v. Heller unconscionability safeguards",
    tags: ["platform", "terms-of-service", "website", "app", "e-commerce", "liability", "startup"],
    relatedAgreements: ["privacy-policy", "saas-sla", "master-services-agreement"],
  },
  {
    id: "privacy-policy",
    category: "platform",
    crossListedIn: ["creator", "commercial"],
    type: "privacy-policy",
    title: "Privacy Policy",
    description: "Collecting emails, names, or payment info? Canadian law requires a privacy policy. Ours covers PIPEDA, provincial laws, breach notification, and Quebec\u2019s strict new rules.",
    price: 199,
    counselPrice: 399,
    complexity: "medium",
    caseRef: "PIPEDA",
    caseCitation: "Personal Information Protection and Electronic Documents Act, S.C. 2000, c. 5",
    typicalUseCase: "Any business collecting personal information from Canadians",
    keyDifferentiator: "10 Fair Information Principles compliance with Quebec Law 25 provisions",
    tags: ["platform", "privacy", "PIPEDA", "data", "compliance", "Quebec", "CASL", "startup"],
    relatedAgreements: ["terms-and-conditions", "saas-sla", "influencer-agreement"],
  },
  {
    id: "partnership-agreement",
    category: "corporate",
    type: "partnership-agreement",
    title: "Partnership Agreement",
    description: "Going into business with someone without incorporating? Define who puts in what, who gets what, and what happens when someone wants out — before the money starts flowing.",
    price: 399,
    counselPrice: 699,
    complexity: "high",
    caseRef: "Partnerships Act",
    caseCitation: "Partnerships Act, R.S.O. 1990, c. P.5",
    typicalUseCase: "Professional services, joint ventures, co-founders without incorporation",
    keyDifferentiator: "Profit allocation, fiduciary duties, and dissolution mechanics",
    tags: ["corporate", "partnership", "founder", "profit-sharing", "dissolution", "professional-services"],
    relatedAgreements: ["deadlock-usa", "jv-usa", "two-party-usa"],
  },
  {
    id: "master-services-agreement",
    category: "platform",
    crossListedIn: ["commercial"],
    type: "master-services-agreement",
    title: "Master Services Agreement (MSA)",
    description: "One master agreement for all your client engagements. SOW framework, payment terms, IP ownership, and liability caps — so you\u2019re not renegotiating from scratch every time.",
    price: 349,
    counselPrice: 599,
    complexity: "high",
    caseRef: "PIPEDA + Provincial Consumer Protection",
    caseCitation: "PIPEDA + Consumer Protection Act, 2002, S.O. 2002, c. 30",
    typicalUseCase: "Agencies, consultancies, IT firms with recurring client engagements",
    keyDifferentiator: "SOW-based engagement model with master liability and IP framework",
    tags: ["platform", "commercial", "MSA", "services", "agency", "consulting", "SOW", "ip"],
    relatedAgreements: ["contractor", "saas-sla", "enterprise-sla"],
  },
  // ── CREATOR ──
  {
    id: "influencer-agreement",
    category: "creator",
    type: "influencer-agreement",
    title: "Influencer / Creator Agreement",
    description: "Brand deal, UGC campaign, or sponsored content? Define the deliverables, disclosure rules, IP ownership, and payment terms before the first post goes live. Competition Act compliant.",
    price: 299,
    counselPrice: 549,
    complexity: "high",
    caseRef: "Competition Act s.52",
    caseCitation: "Competition Act R.S.C. 1985, c. C-34, s.52; Competition Bureau Influencer Marketing Guidelines (2022)",
    typicalUseCase: "Brand sponsorships, UGC campaigns, affiliate partnerships, ambassador programs",
    keyDifferentiator: "15 regulatory modules including Competition Act, ASC, PIPEDA, CASL, FTC cross-border, platform-specific disclosure templates",
    tags: ["creator", "influencer", "brand", "UGC", "sponsored-content", "social-media", "marketing", "disclosure"],
    relatedAgreements: ["contractor", "ip-assignment", "privacy-policy"],
  },
];

export const CATEGORY_META: Record<Category, { label: string; description: string; count: number }> = {
  employment: {
    label: "Hiring & Team",
    description: "Everything you need to hire with confidence — employment contracts, contractor agreements, non-competes, and IP protection.",
    count: 7,
  },
  corporate: {
    label: "Equity & Governance",
    description: "Shareholder agreements, incorporation documents, partnerships, and the governance rules that protect your company.",
    count: 8,
  },
  investment: {
    label: "Raising Capital",
    description: "SAFEs, convertible notes, loan agreements, and credit facilities — everything you need to raise money or structure debt, fully compliant with Canadian securities and lending law.",
    count: 5,
  },
  commercial: {
    label: "Software & Services",
    description: "Service agreements, enterprise licensing, privacy policies, and master service agreements for tech companies.",
    count: 6,
  },
  platform: {
    label: "Platform & Business",
    description: "Terms of service, privacy policies, partnerships, and master service agreements — the legal foundation every business needs.",
    count: 4,
  },
  creator: {
    label: "Creator & Influencer",
    description: "Influencer agreements, privacy policies, IP assignments, and contractor terms for creator and brand partnerships.",
    count: 5,
  },
};

export const CATEGORY_BADGE_COLORS: Record<Category, { bg: string; text: string }> = {
  employment: { bg: "bg-blue-100", text: "text-blue-700" },
  corporate: { bg: "bg-purple-100", text: "text-purple-700" },
  investment: { bg: "bg-emerald-100", text: "text-emerald-700" },
  commercial: { bg: "bg-amber-100", text: "text-amber-700" },
  platform: { bg: "bg-slate-100", text: "text-slate-700" },
  creator: { bg: "bg-rose-100", text: "text-rose-700" },
};

export const COMPLEXITY_COLORS: Record<Complexity, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  "very-high": "bg-red-500",
};

export function calculatePricing(
  selectedIds: string[],
  tier: "self-serve" | "counsel"
): { subtotal: number; discount: number; total: number } {
  const items = AGREEMENTS.filter((a) => selectedIds.includes(a.id));
  const subtotal = items.reduce(
    (sum, a) => sum + (tier === "counsel" ? a.counselPrice : a.price),
    0
  );
  let discount = 0;
  if (items.length === 2) discount = 0.1;
  else if (items.length >= 3) discount = 0.15;
  const total = Math.round(subtotal * (1 - discount));
  return { subtotal, discount, total };
}

// ─── Helper Functions ───────────────────────────────────────────────────────

/** Get a single agreement by its ID, or undefined if not found */
export function getAgreementById(id: string): Agreement | undefined {
  return AGREEMENTS.find((a) => a.id === id);
}

/** Get all agreements in a given category (primary category only, not cross-listed) */
export function getAgreementsByCategory(category: Category): Agreement[] {
  return AGREEMENTS.filter(
    (a) => a.category === category || (a.crossListedIn && a.crossListedIn.includes(category))
  );
}

/**
 * Search agreements by a text query. Matches against title, description, and typicalUseCase.
 * Case-insensitive. Returns agreements sorted by relevance (title matches first).
 */
export function searchAgreements(query: string): Agreement[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const titleMatches: Agreement[] = [];
  const descriptionMatches: Agreement[] = [];
  const useCaseMatches: Agreement[] = [];
  const tagMatches: Agreement[] = [];
  const seen = new Set<string>();

  for (const a of AGREEMENTS) {
    if (a.title.toLowerCase().includes(q)) {
      titleMatches.push(a);
      seen.add(a.id);
    }
  }
  for (const a of AGREEMENTS) {
    if (!seen.has(a.id) && a.description.toLowerCase().includes(q)) {
      descriptionMatches.push(a);
      seen.add(a.id);
    }
  }
  for (const a of AGREEMENTS) {
    if (!seen.has(a.id) && a.typicalUseCase.toLowerCase().includes(q)) {
      useCaseMatches.push(a);
      seen.add(a.id);
    }
  }
  for (const a of AGREEMENTS) {
    if (!seen.has(a.id) && a.tags.some((t) => t.toLowerCase().includes(q))) {
      tagMatches.push(a);
      seen.add(a.id);
    }
  }

  return [...titleMatches, ...descriptionMatches, ...useCaseMatches, ...tagMatches];
}
