export type Category = "employment" | "corporate" | "investment" | "commercial";
export type Complexity = "low" | "medium" | "high" | "very-high";

export interface Agreement {
  id: string;
  category: Category;
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
}

export const AGREEMENTS: Agreement[] = [
  // ── EMPLOYMENT (7) ──
  {
    id: "standard-employment",
    category: "employment",
    type: "standard-employment",
    title: "Standard Employment Agreement",
    description: "Indefinite-term employment agreement with ESA-compliant termination, compensation, and restrictive covenants for Canadian employers.",
    price: 149,
    counselPrice: 349,
    complexity: "low",
    caseRef: "Waksdale v. Swegon",
    caseCitation: "Waksdale v. Swegon Group AB, 2020 ONCA 391",
    typicalUseCase: "Full-time employees hired without fixed end date",
    keyDifferentiator: "Governed by ESA; common law reasonable notice on termination",
  },
  {
    id: "fixed-term",
    category: "employment",
    type: "fixed-term",
    title: "Fixed-Term Employment Agreement",
    description: "Defined-period employment with early termination provisions, renewal mechanics, and Howard v. Benson compliance for Canadian jurisdictions.",
    price: 129,
    counselPrice: 299,
    complexity: "medium",
    caseRef: "Howard v. Benson Group",
    caseCitation: "Howard v. Benson Group Ltd., 2012 ONCA 231",
    typicalUseCase: "Maternity leave coverage, project-based roles",
    keyDifferentiator: "Howard v. Benson rules; early termination provisions required",
  },
  {
    id: "executive-employment",
    category: "employment",
    type: "executive-employment",
    title: "Executive Employment Agreement",
    description: "C-suite and senior management agreement with enhanced severance, change-of-control provisions, and Shafron-compliant restrictive covenants.",
    price: 249,
    counselPrice: 499,
    complexity: "high",
    caseRef: "Shafron v. Ceccardi",
    caseCitation: "Shafron v. Ceccardi Development Inc., 2008 CanLII 40409",
    typicalUseCase: "CEOs, CFOs, CTOs, and senior management",
    keyDifferentiator: "C-suite non-compete exception; enhanced severance multipliers",
  },
  {
    id: "non-compete",
    category: "employment",
    type: "non-compete",
    title: "Non-Compete / Non-Solicit Agreement",
    description: "Standalone restrictive covenant agreement with Elsley enforceability analysis, fresh consideration documentation, and Ontario s.67.2 compliance.",
    price: 179,
    counselPrice: 399,
    complexity: "high",
    caseRef: "Elsley v. J.G. Collins",
    caseCitation: "Elsley v. J.G. Collins Insurance Agencies Ltd., 1978 CanLII 211 (SCC)",
    typicalUseCase: "Post-hire restrictive covenants requiring fresh consideration",
    keyDifferentiator: "Ontario s.67.2 prohibition applies; Shafron/Elsley test",
  },
  {
    id: "ip-assignment",
    category: "employment",
    type: "ip-assignment",
    title: "Confidentiality & IP Assignment",
    description: "Trade secret protection and intellectual property assignment with Copyright Act moral rights waiver and defined confidential information scope.",
    price: 119,
    counselPrice: 279,
    complexity: "medium",
    caseRef: "Sagaz Industries",
    caseCitation: "671122 Ontario Ltd. v. Sagaz Industries Canada Inc., 2001 SCC 59",
    typicalUseCase: "Technical employees, developers, designers with IP creation duties",
    keyDifferentiator: "Moral rights waiver under Copyright Act s.14.1",
  },
  {
    id: "contractor",
    category: "employment",
    type: "contractor",
    title: "Independent Contractor Agreement",
    description: "Service engagement with Sagaz misclassification safeguards, contractor status documentation, and withholding obligation protection.",
    price: 129,
    counselPrice: 299,
    complexity: "medium",
    caseRef: "Sagaz Industries",
    caseCitation: "671122 Ontario Ltd. v. Sagaz Industries Canada Inc., 2001 SCC 15",
    typicalUseCase: "Freelancers, consultants, fractional executives",
    keyDifferentiator: "Sagaz misclassification risk; impacts withholding obligations",
  },
  {
    id: "offer-letter",
    category: "employment",
    type: "offer-letter",
    title: "Offer of Employment",
    description: "Formal offer letter with acceptance terms, start date, compensation summary, and conditional employment provisions for Canadian employers.",
    price: 89,
    counselPrice: 219,
    complexity: "low",
    caseRef: "Krishnamoorthy v. Olympus",
    caseCitation: "Krishnamoorthy v. Olympus Canada Inc., 2017 ONCA 873",
    typicalUseCase: "Initial employment offer preceding full agreement",
    keyDifferentiator: "Binding offer terms; acceptance creates employment contract",
  },

  // ── CORPORATE GOVERNANCE (7) ──
  {
    id: "two-party-usa",
    category: "corporate",
    type: "two-party-usa",
    title: "Two-Party Shareholder Agreement",
    description: "Majority/minority shareholder agreement with drag-along, tag-along, ROFR, deadlock resolution, and CBCA s.146 USA compliance.",
    price: 399,
    counselPrice: 799,
    complexity: "high",
    caseRef: "Duha Printers v. R.",
    caseCitation: "Duha Printers (Western) Ltd. v. R., 1998 SCC",
    typicalUseCase: "One shareholder 50-80%, other 20-50%",
    keyDifferentiator: "Balances majority liquidity against minority veto rights",
  },
  {
    id: "emerging-corp-usa",
    category: "corporate",
    type: "emerging-corp-usa",
    title: "Emerging Corporation USA",
    description: "Early-stage startup shareholder agreement with founder vesting, equity pools, simple governance, and CBCA s.146 compliance.",
    price: 299,
    counselPrice: 599,
    complexity: "medium",
    caseRef: "CBCA s.146",
    caseCitation: "Canada Business Corporations Act, R.S.C. 1985, c. C-44, s.146",
    typicalUseCase: "Startups with founder-employees and angel investors",
    keyDifferentiator: "Founder vesting, equity pools, and simple governance",
  },
  {
    id: "jv-usa",
    category: "corporate",
    type: "jv-usa",
    title: "Joint Venture USA",
    description: "Strategic alliance shareholder agreement with unique IP ownership rules, deadlock resolution, and JV-specific governance provisions.",
    price: 499,
    counselPrice: 999,
    complexity: "very-high",
    caseRef: "CBCA/OBCA JV Provisions",
    caseCitation: "CBCA s.146 + OBCA JV Provisions",
    typicalUseCase: "Strategic alliance between 2-3 corporations",
    keyDifferentiator: "Unique IP ownership rules; deadlock resolution critical",
  },
  {
    id: "pe-backed-usa",
    category: "corporate",
    type: "pe-backed-usa",
    title: "PE-Backed Investment USA",
    description: "Private equity investment shareholder agreement with board control, information rights, change-of-control, and price protection mechanisms.",
    price: 599,
    counselPrice: 1199,
    complexity: "very-high",
    caseRef: "CBCA s.146",
    caseCitation: "Canada Business Corporations Act, R.S.C. 1985, c. C-44, s.146",
    typicalUseCase: "PE firm investor + incumbent owner/management",
    keyDifferentiator: "Board control, information rights, and exit provisions",
  },
  {
    id: "deadlock-usa",
    category: "corporate",
    type: "deadlock-usa",
    title: "50/50 Deadlock USA",
    description: "Equal-ownership shareholder agreement with multi-step deadlock resolution cascade, shotgun buy-sell, and shared governance provisions.",
    price: 449,
    counselPrice: 899,
    complexity: "high",
    caseRef: "CBCA s.146",
    caseCitation: "Canada Business Corporations Act, R.S.C. 1985, c. C-44, s.146",
    typicalUseCase: "Two equal shareholders with heightened deadlock risk",
    keyDifferentiator: "Deadlock resolution is the core of the agreement",
  },
  {
    id: "articles-incorporation",
    category: "corporate",
    type: "articles-incorporation",
    title: "Articles of Incorporation",
    description: "Federal or provincial articles of incorporation with share structure, director provisions, and business restrictions.",
    price: 199,
    counselPrice: 399,
    complexity: "low",
    caseRef: "CBCA / OBCA",
    caseCitation: "CBCA s.6 / OBCA s.5",
    typicalUseCase: "New corporation formation",
    keyDifferentiator: "Foundation document for all corporate governance",
  },
  {
    id: "articles-amendment",
    category: "corporate",
    type: "articles-amendment",
    title: "Articles of Amendment",
    description: "Amendment to existing articles of incorporation for share structure changes, name changes, or business restriction modifications.",
    price: 149,
    counselPrice: 349,
    complexity: "low",
    caseRef: "OBCA s.168",
    caseCitation: "Ontario Business Corporations Act, R.S.O. 1990, c. B.16, s.168",
    typicalUseCase: "Corporate changes requiring article amendments",
    keyDifferentiator: "Modifies existing corporate constating documents",
  },

  // ── INVESTMENT (3) ──
  {
    id: "pre-seed-safe",
    category: "investment",
    type: "pre-seed-safe",
    title: "Pre-Seed SAFE",
    description: "Simple Agreement for Future Equity for pre-seed rounds with valuation cap, discount rate, and NI 45-106 prospectus exemption compliance.",
    price: 199,
    counselPrice: 449,
    complexity: "medium",
    caseRef: "NI 45-106",
    caseCitation: "National Instrument 45-106 Prospectus Exemptions",
    typicalUseCase: "First institutional or angel investment",
    keyDifferentiator: "Simplest SAFE structure with standard conversion mechanics",
  },
  {
    id: "seed-safe",
    category: "investment",
    type: "seed-safe",
    title: "Seed SAFE",
    description: "Seed-stage SAFE with enhanced MFN provisions, pro rata rights, information rights, and provincial securities compliance.",
    price: 249,
    counselPrice: 549,
    complexity: "medium",
    caseRef: "NI 45-106 + Provincial Securities",
    caseCitation: "NI 45-106 + Provincial Securities Legislation",
    typicalUseCase: "Seed round with multiple investors",
    keyDifferentiator: "MFN clause and pro rata rights standard",
  },
  {
    id: "bridge-safe",
    category: "investment",
    type: "bridge-safe",
    title: "Bridge SAFE",
    description: "Bridge financing SAFE with enhanced conversion mechanics, multiple trigger events, and OSC regulatory compliance.",
    price: 349,
    counselPrice: 699,
    complexity: "high",
    caseRef: "NI 45-106 + OSC Rules",
    caseCitation: "NI 45-106 + Ontario Securities Commission Rules",
    typicalUseCase: "Bridge round between priced rounds",
    keyDifferentiator: "Complex conversion triggers and enhanced investor protections",
  },

  // ── COMMERCIAL (3) ──
  {
    id: "saas-sla",
    category: "commercial",
    type: "saas-sla",
    title: "SaaS Service Level Agreement",
    description: "Cloud-based SaaS agreement with uptime SLAs, service credits, data handling provisions, and PIPEDA privacy compliance.",
    price: 199,
    counselPrice: 449,
    complexity: "medium",
    caseRef: "PIPEDA + Provincial Privacy",
    caseCitation: "Personal Information Protection and Electronic Documents Act, S.C. 2000, c. 5",
    typicalUseCase: "Software-as-a-Service providers and customers",
    keyDifferentiator: "Uptime commitments with tiered service credits",
  },
  {
    id: "managed-services-sla",
    category: "commercial",
    type: "managed-services-sla",
    title: "Managed Services SLA",
    description: "Managed IT/operations service agreement with response time SLOs, escalation procedures, and workplace safety compliance.",
    price: 249,
    counselPrice: 549,
    complexity: "medium",
    caseRef: "PIPEDA + OHSA",
    caseCitation: "PIPEDA + Occupational Health and Safety Act, R.S.O. 1990, c. O.1",
    typicalUseCase: "Outsourced IT, HR, or operations services",
    keyDifferentiator: "Response/resolution time SLOs by severity tier",
  },
  {
    id: "enterprise-sla",
    category: "commercial",
    type: "enterprise-sla",
    title: "Enterprise Licensing SLA",
    description: "Enterprise software licensing agreement with complex liability framework, force majeure, and securities-related compliance for large deployments.",
    price: 349,
    counselPrice: 699,
    complexity: "high",
    caseRef: "PIPEDA + Securities",
    caseCitation: "PIPEDA + Provincial Securities Legislation",
    typicalUseCase: "Enterprise software licensing and deployment",
    keyDifferentiator: "Complex liability caps and force majeure provisions",
  },
];

export const CATEGORY_META: Record<Category, { label: string; description: string; count: number }> = {
  employment: {
    label: "Employment",
    description: "Employment agreements, restrictive covenants, IP assignments, and contractor engagements for Canadian workplaces.",
    count: 7,
  },
  corporate: {
    label: "Corporate Governance",
    description: "Shareholder agreements, articles of incorporation, and corporate governance documents under CBCA and provincial statutes.",
    count: 7,
  },
  investment: {
    label: "Investment",
    description: "SAFE agreements for pre-seed, seed, and bridge financing rounds with NI 45-106 prospectus exemption compliance.",
    count: 3,
  },
  commercial: {
    label: "Commercial",
    description: "Service level agreements for SaaS, managed services, and enterprise licensing with PIPEDA and CASL compliance.",
    count: 3,
  },
};

export const CATEGORY_BADGE_COLORS: Record<Category, { bg: string; text: string }> = {
  employment: { bg: "bg-blue-100", text: "text-blue-700" },
  corporate: { bg: "bg-purple-100", text: "text-purple-700" },
  investment: { bg: "bg-emerald-100", text: "text-emerald-700" },
  commercial: { bg: "bg-amber-100", text: "text-amber-700" },
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
