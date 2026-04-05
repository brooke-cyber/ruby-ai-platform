import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  EMPLOYMENT_FRAMEWORK,
  SHAREHOLDER_FRAMEWORK,
  SAFE_FRAMEWORK,
  SLA_FRAMEWORK,
  CORPORATE_FRAMEWORK,
  GENERAL_BUSINESS_FRAMEWORK,
  INFLUENCER_AGREEMENT_FRAMEWORK,
} from "@/lib/legal-frameworks";
import { getDraftingInstructions, getClausePositions } from "@/data/agreement-configs";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Rate Limiting (in-memory, per-IP)
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup every 2 minutes to avoid unbounded memory growth
let lastCleanup = Date.now();
function cleanupRateLimitStore() {
  const now = Date.now();
  if (now - lastCleanup < 120_000) return;
  lastCleanup = now;
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  for (const [ip, entry] of rateLimitStore) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) rateLimitStore.delete(ip);
  }
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSecs: number } {
  cleanupRateLimitStore();
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  let entry = rateLimitStore.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(ip, entry);
  }
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
  if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = entry.timestamps[0];
    const retryAfterSecs = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSecs: Math.max(1, retryAfterSecs) };
  }
  entry.timestamps.push(now);
  return { allowed: true, retryAfterSecs: 0 };
}

// ---------------------------------------------------------------------------
// Input Sanitization
// ---------------------------------------------------------------------------
function stripHtmlTags(value: unknown): unknown {
  if (typeof value === "string") {
    // Remove HTML/script tags but keep the text content
    return value.replace(/<\/?[^>]+(>|$)/g, "");
  }
  if (Array.isArray(value)) {
    return value.map(stripHtmlTags);
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = stripHtmlTags(v);
    }
    return out;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
interface ValidationError {
  field: string;
  message: string;
}

const VALID_CATEGORIES = new Set([
  "employment",
  "corporate",
  "shareholders",
  "investment",
  "commercial",
  "partnership",
  "incorporation",
  "general",
  "terms-and-conditions",
  "privacy-policy",
  "master-services-agreement",
  "partnership-agreement",
  "influencer-agreement",
]);

const VALID_JURISDICTIONS = new Set([
  "Ontario",
  "British Columbia",
  "Alberta",
  "Quebec",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Prince Edward Island",
  "Northwest Territories",
  "Yukon",
  "Nunavut",
  "Federal",
]);

function validateRequest(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  const { category, agreementType, jurisdiction, wizardData, system: customSystem, user: customUser, stream } = body;

  // If custom system/user prompts are provided, they just need to be strings
  if (customSystem !== undefined || customUser !== undefined) {
    if (typeof customSystem !== "string" || customSystem.length === 0) {
      errors.push({ field: "system", message: "Must be a non-empty string when provided." });
    } else if (customSystem.length > 50_000) {
      errors.push({ field: "system", message: "Must not exceed 50,000 characters." });
    }
    if (typeof customUser !== "string" || customUser.length === 0) {
      errors.push({ field: "user", message: "Must be a non-empty string when provided." });
    } else if (customUser.length > 50_000) {
      errors.push({ field: "user", message: "Must not exceed 50,000 characters." });
    }
    // stream is optional
    if (stream !== undefined && typeof stream !== "boolean") {
      errors.push({ field: "stream", message: "Must be a boolean." });
    }
    return errors;
  }

  // Standard generation mode — validate required fields
  if (category === undefined || category === null) {
    errors.push({ field: "category", message: "Required. Must be a string or array of strings." });
  } else {
    const cats = Array.isArray(category) ? category : [category];
    for (const c of cats) {
      if (typeof c !== "string") {
        errors.push({ field: "category", message: `Each category must be a string, got ${typeof c}.` });
      } else if (!VALID_CATEGORIES.has(c)) {
        errors.push({ field: "category", message: `Unknown category "${c}". Valid: ${[...VALID_CATEGORIES].join(", ")}` });
      }
    }
  }

  if (typeof agreementType !== "string" || agreementType.length === 0) {
    errors.push({ field: "agreementType", message: "Required. Must be a non-empty string." });
  } else if (agreementType.length > 200) {
    errors.push({ field: "agreementType", message: "Must not exceed 200 characters." });
  }

  if (jurisdiction !== undefined && jurisdiction !== null) {
    if (typeof jurisdiction !== "string") {
      errors.push({ field: "jurisdiction", message: "Must be a string." });
    } else if (!VALID_JURISDICTIONS.has(jurisdiction)) {
      errors.push({ field: "jurisdiction", message: `Unknown jurisdiction "${jurisdiction}". Valid: ${[...VALID_JURISDICTIONS].join(", ")}` });
    }
  }

  if (wizardData !== undefined && wizardData !== null && typeof wizardData !== "object") {
    errors.push({ field: "wizardData", message: "Must be an object when provided." });
  }

  // Validate wizardData sub-fields that are strings (party names, etc.)
  if (wizardData && typeof wizardData === "object") {
    const wd = wizardData as Record<string, unknown>;
    if (wd.party && typeof wd.party === "object") {
      const party = wd.party as Record<string, unknown>;
      if (party.partyA !== undefined && typeof party.partyA === "string" && party.partyA.length > 500) {
        errors.push({ field: "wizardData.party.partyA", message: "Must not exceed 500 characters." });
      }
      if (party.partyB !== undefined && typeof party.partyB === "string" && party.partyB.length > 500) {
        errors.push({ field: "wizardData.party.partyB", message: "Must not exceed 500 characters." });
      }
    }
    if (wd.tier !== undefined && typeof wd.tier === "string") {
      if (!["self-serve", "lawyer-review", "custom"].includes(wd.tier)) {
        errors.push({ field: "wizardData.tier", message: `Invalid tier "${wd.tier}". Valid: self-serve, lawyer-review, custom.` });
      }
    }
    if (wd.riskProfile && typeof wd.riskProfile === "object") {
      const rp = wd.riskProfile as Record<string, unknown>;
      if (rp.tolerance !== undefined && typeof rp.tolerance === "string") {
        if (!["conservative", "balanced", "aggressive"].includes(rp.tolerance)) {
          errors.push({ field: "wizardData.riskProfile.tolerance", message: `Invalid tolerance "${rp.tolerance}". Valid: conservative, balanced, aggressive.` });
        }
      }
    }
  }

  if (stream !== undefined && typeof stream !== "boolean") {
    errors.push({ field: "stream", message: "Must be a boolean." });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Structured logging
// ---------------------------------------------------------------------------
function log(
  level: "info" | "warn" | "error",
  message: string,
  meta?: Record<string, unknown>
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

// ---------------------------------------------------------------------------
// Error categorization
// ---------------------------------------------------------------------------
type ErrorCategory = "validation" | "rate_limit" | "timeout" | "api_error" | "internal";

function categorizeError(err: unknown): { category: ErrorCategory; status: number; message: string } {
  if (err instanceof Anthropic.APIError) {
    if (err.status === 429) {
      return { category: "rate_limit", status: 429, message: "AI service rate limit exceeded. Please try again in a moment." };
    }
    if (err.status === 529 || err.status === 503) {
      return { category: "api_error", status: 503, message: "AI service is temporarily overloaded. Please try again shortly." };
    }
    return { category: "api_error", status: 502, message: "AI service error. Please try again." };
  }
  if (err instanceof Error) {
    if (err.name === "AbortError" || err.message.includes("abort") || err.message.includes("timeout")) {
      return { category: "timeout", status: 504, message: "Request timed out. The document may be too complex — try simplifying your inputs." };
    }
  }
  return { category: "internal", status: 500, message: "An internal error occurred. Please try again." };
}

// ---------------------------------------------------------------------------
// Constants — system prompt, frameworks, expert context (unchanged)
// ---------------------------------------------------------------------------

const BASE_SYSTEM = `You are the Ruby Law AI drafting engine — a Canadian legal agreement generator built on proprietary clause libraries, drafting workflows, and regulatory module compliance databases developed by practicing Canadian lawyers.

CORE DRAFTING STANDARDS:
- ABSOLUTELY NEVER use square brackets like [NAME], [DATE], [AMOUNT], or any [PLACEHOLDER] in the output. This is a strict requirement — zero square brackets in the entire document.
- Use the ACTUAL values provided in the wizard data for all party names, dates, amounts, jurisdictions, percentages, and terms.
- If a specific value was not provided by the client, use a professional blank line: "________________" (16 underscores). This makes the document look like a printed agreement ready for manual completion — not a software template.
- The final document must be ready for a lawyer to review and a client to sign. It should read as a complete, professional legal document with no template artifacts.
- Reference applicable Canadian statutes and case law inline where relevant
- Produce ONLY the draft agreement text — no commentary, no summaries, no meta-text
- Use professional legal language appropriate for Canadian courts
- All monetary amounts in Canadian Dollars (CAD) unless otherwise specified

PROFESSIONAL LEGAL DOCUMENT FORMAT — MANDATORY:
Every agreement must follow this exact structure and formatting standard, matching the output quality of Canada's top-tier law firms (Practical Law / Thomson Reuters standard):

TITLE PAGE:
- Agreement title in all caps, centered (e.g., "MASTER SERVICES AGREEMENT")
- "BETWEEN:" followed by full legal names of all parties with their designations
- "AND:" for the second party
- Date line: "DATED as of the _____ day of __________, 20___" (or actual date if provided)

RECITALS:
- Begin with "WHEREAS" recitals establishing the background and purpose
- Each recital starts with "WHEREAS" followed by a substantive statement
- End recitals with: "NOW THEREFORE in consideration of the mutual covenants and agreements herein contained, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:"

DEFINITIONS SECTION:
- Section 1 must always be "INTERPRETATION AND DEFINITIONS"
- Every defined term in quotes and bold on first definition: **"Agreement"** means...
- Alphabetical order within the definitions section
- Cross-reference defined terms throughout the document

OPERATIVE PROVISIONS:
- Use numbered sections: 1, 2, 3, 4... for major articles
- Use decimal sub-sections: 1.1, 1.2, 2.1, 2.2... for sub-provisions
- Use lettered paragraphs: (a), (b), (c)... for lists within sub-sections
- Use roman numerals: (i), (ii), (iii)... for sub-lists within lettered paragraphs
- Bold all section headings
- Include section cross-references where appropriate (e.g., "as defined in Section 1.1")

SCHEDULES AND EXHIBITS:
- Reference schedules in the body: "as set out in Schedule A"
- Include at least one schedule for complex agreements (employment, shareholder, investment, MSA)
- Schedules appear after the execution block
- Format: "SCHEDULE A" centered, followed by schedule title

EXECUTION BLOCK:
- "IN WITNESS WHEREOF the parties have executed this Agreement as of the date first written above."
- Signature blocks for each party with:
  - Party legal name in caps
  - "Per: ________________________"
  - "Name:"
  - "Title:"
  - "Date:"
  - "I have authority to bind the [corporation/partnership]."

THREE-POSITION DRAFTING FRAMEWORK:
Every material clause must be drafted according to the specified negotiating position. If no position is specified, use BALANCED/MARKET as the default.
- Position 1 (Client-Favorable): Maximizes protections for our client
- Position 2 (Balanced/Market): Where most negotiated deals land — the default
- Position 3 (Counter-Party Favorable): Maximum concession — only if specifically requested

QUALITY STANDARDS:
- Every restrictive covenant MUST pass the Shafron enforceability test (reasonable scope, duration, geography)
- Every termination clause MUST comply with the Waksdale holistic test (no single ESA violation)
- Every transfer restriction MUST be graduated, not absolute (Ontario Jockey Club principle)
- Cross-reference regulatory modules for jurisdiction-specific compliance
- Include all mandatory defined terms for the agreement type
- Address all active compliance modules flagged in the wizard data

LAYER MODEL:
This is a Layer 1 deterministic contract generation. The output should be a complete, production-ready base contract. Clients may subsequently use the Layer 2 Customization Wizard for modifications beyond the standard wizard options.`;

const CATEGORY_FRAMEWORKS: Record<string, string> = {
  employment: EMPLOYMENT_FRAMEWORK,
  corporate: SHAREHOLDER_FRAMEWORK,
  shareholders: SHAREHOLDER_FRAMEWORK,
  investment: SAFE_FRAMEWORK,
  commercial: SLA_FRAMEWORK,
  partnership: CORPORATE_FRAMEWORK,
  incorporation: CORPORATE_FRAMEWORK,
  general: GENERAL_BUSINESS_FRAMEWORK,
  "terms-and-conditions": GENERAL_BUSINESS_FRAMEWORK,
  "privacy-policy": GENERAL_BUSINESS_FRAMEWORK,
  "master-services-agreement": GENERAL_BUSINESS_FRAMEWORK,
  "partnership-agreement": GENERAL_BUSINESS_FRAMEWORK,
  "influencer-agreement": INFLUENCER_AGREEMENT_FRAMEWORK,
};

const AGREEMENT_EXPERT_CONTEXT: Record<string, string> = {
  "Standard Employment Agreement": `
EXPERT DRAFTING CONTEXT — EMPLOYMENT AGREEMENT:
You are drafting as a senior employment lawyer with 15+ years of Canadian practice. This agreement must:
- Open with clear identification of employer, employee, position, and start date
- Include a comprehensive DEFINITIONS section (at minimum: "Confidential Information", "Intellectual Property", "Termination Date", "Notice Period", "Cause")
- Structure compensation as: base salary, bonus/incentive (if any), equity (if any), benefits, vacation
- TERMINATION section is THE most important section — draft per Waksdale: every termination clause must be internally consistent. Test: if ANY one provision is struck down, do the remaining provisions survive independently?
- Restrictive covenants must pass Shafron v. KRG: (1) legitimate proprietary interest, (2) reasonable in scope/geography/duration, (3) clear and unambiguous
- For Ontario: s.67.2 ESA 2000 — non-compete clauses are VOID for non-C-suite employees. Use non-solicitation instead.
- Include proper NOTICE provisions, ENTIRE AGREEMENT clause, INDEPENDENT LEGAL ADVICE acknowledgment
- Target length: 12-18 pages, 6,000-9,000 words
`,

  "Fixed-Term Employment Agreement": `
EXPERT DRAFTING CONTEXT — FIXED-TERM EMPLOYMENT:
You are drafting as a senior employment lawyer. This is a FIXED-TERM contract — Howard v. Benson Group rules apply:
- If the contract does NOT include a valid early termination clause, the employer must pay the ENTIRE remaining term
- Early termination clause must be explicit, unambiguous, and comply with ESA minimums
- Include: fixed term dates, renewal provisions (automatic vs. manual), conversion to permanent provisions
- Address: what happens at expiry (automatic termination vs. notice), successive fixed-term contracts risk (may create permanent employment relationship)
- CRITICAL: Do not draft as open-ended with a "term" — draft as genuinely fixed-term with a real end date
- Target length: 10-15 pages
`,

  "Executive Employment Agreement": `
EXPERT DRAFTING CONTEXT — EXECUTIVE EMPLOYMENT:
You are drafting as a senior corporate/employment lawyer for a C-suite executive. This requires ENHANCED provisions:
- Change-of-control protection (single or double trigger)
- Enhanced severance multipliers (12-24 months, not ESA minimums)
- Clawback provisions for bonus/incentive compensation
- Director & officer insurance requirements
- Board observer or board seat rights (if applicable)
- Golden parachute / golden handshake provisions
- Non-compete IS enforceable for C-suite in Ontario (s.67.2 exception) — but must still pass Shafron
- Equity acceleration on change of control
- Expense reimbursement and perquisites section
- Target length: 18-25 pages, 9,000-12,000 words
`,

  "Non-Compete / Non-Solicit": `
EXPERT DRAFTING CONTEXT — RESTRICTIVE COVENANTS:
You are drafting standalone restrictive covenant agreements. Shafron v. KRG is your bible:
- Three-part test: proprietary interest + reasonable scope + clear language
- Ontario s.67.2: non-compete VOID for non-C-suite. Draft non-solicitation instead with robust client/employee protection
- Each covenant must be INDEPENDENTLY enforceable — blue-pencil severability clause
- Include: adequate consideration (for existing employees: new consideration required beyond continued employment)
- Geographic scope must be justified by actual business territory
- Duration must correlate with legitimate business interest (12 months typical, 24 months maximum defensible)
- Garden leave provisions as alternative to post-employment restrictions
- Target length: 5-8 pages
`,

  "Independent Contractor Agreement": `
EXPERT DRAFTING CONTEXT — CONTRACTOR AGREEMENT:
You are drafting to establish a genuine independent contractor relationship. Sagaz Industries is the key case:
- Control test: contractor must control HOW the work is done, not just WHAT
- Integration test: is the contractor's work integral to the company's business?
- Economic reality: does the contractor bear financial risk?
- Include EXPLICIT contractor acknowledgments: no benefits, no vacation, no EI, no CPP (contractor responsible)
- CRA/tax implications section: contractor responsible for own remittances
- IP assignment must be explicit (no employer/employee default under Copyright Act s.13(3))
- Deliverable-based payment (NOT hourly) strengthens contractor classification
- Termination: notice period, not "cause" — contractors don't get "fired"
- Target length: 8-12 pages
`,

  "Two-Party Shareholder Agreement": `
EXPERT DRAFTING CONTEXT — TWO-PARTY SHAREHOLDER AGREEMENT:
You are drafting as a senior corporate lawyer for a two-shareholder company. This is the MOST IMPORTANT governance document:
- Must be comprehensive: 40-60 clauses across 8-12 articles
- TRANSFER RESTRICTIONS are critical: ROFR mechanics (notice, valuation, exercise period, closing), tag-along, drag-along
- DEADLOCK RESOLUTION must be airtight: mediation → arbitration → shotgun buy-sell cascade with specific mechanics
- Board composition and appointment rights tied to equity percentages
- Reserved matters / unanimous consent list (15-25 matters requiring both shareholders' approval)
- Valuation methodology for all transfer scenarios (fair market value, formula, independent appraiser)
- Distributions policy: mandatory vs. discretionary, frequency, calculation
- Non-compete between shareholders (enforceable in shareholder context even in Ontario)
- Death, disability, bankruptcy provisions
- Shotgun buy-sell: pricing, notice mechanics, acceptance/rejection timeline, financing provisions
- Target length: 25-40 pages, 12,000-18,000 words
`,

  "Early-Stage Shareholder Agreement": `
EXPERT DRAFTING CONTEXT — EARLY-STAGE SHAREHOLDER AGREEMENT:
You are drafting for a company with founder-employees. Focus on:
- Founder vesting schedules (4-year vest, 1-year cliff is standard)
- Equity pool reservation for future employees (10-20% typical)
- Sweat equity recognition and valuation
- Simplified governance (smaller board, fewer reserved matters)
- Investor-ready structure: anticipate Series Seed or Series A terms
- Anti-dilution protection basics
- Founder departure provisions: what happens to unvested shares
- Right of first refusal on secondary sales
- Information rights (quarterly financials, annual budget)
- Target length: 20-30 pages
`,

  "SAFE Agreement (Canadian)": `
EXPERT DRAFTING CONTEXT — CANADIAN SAFE:
You are drafting a Canadian SAFE that must comply with NI 45-106 Prospectus Exemptions. This is NOT a YC SAFE copy:
- Must include Canadian securities law compliance provisions
- Accredited investor or other exemption basis must be stated
- Valuation cap AND/OR discount rate mechanics with precise conversion formulas
- Qualified Financing definition (minimum raise threshold, type of securities)
- MFN (Most Favored Nation) clause: scope and amendment mechanics
- Pro rata rights: threshold, exercise mechanics, information requirements
- Board observer rights (if applicable)
- Information rights: frequency, scope (financial statements, cap table, material events)
- Dissolution/wind-down: investor payment priority before common shareholders
- Change of control: conversion or payment mechanics
- Representations from BOTH company and investor
- NI 45-106 exemption reliance (typically s.2.3 accredited investor or s.2.5 family/friends)
- Target length: 12-18 pages
`,

  "Convertible Note Agreement": `
EXPERT DRAFTING CONTEXT — CONVERTIBLE NOTE:
You are drafting as a securities/finance lawyer. Critical compliance requirements:
- Interest Act R.S.C. 1985: interest must be stated as annual rate (not monthly/daily)
- Criminal Code s.347: criminal interest rate (>60% per annum) savings clause MANDATORY
- Interest calculation: simple vs. compound, day-count convention (actual/365 or 30/360)
- Maturity date and maturity conversion mechanics
- Qualified Financing conversion: automatic vs. optional, valuation cap, discount
- Unqualified financing / maturity conversion: how note converts if no qualified financing before maturity
- Prepayment rights: whether permitted, penalties
- Subordination provisions (if applicable)
- Events of default: payment default, covenant breach, insolvency
- Security: secured (PPSA registration) vs. unsecured
- Target length: 15-22 pages
`,

  "SaaS Service Level Agreement": `
EXPERT DRAFTING CONTEXT — SAAS SLA:
You are drafting as a technology/commercial lawyer for a SaaS provider:
- Uptime guarantee with specific measurement methodology (monthly, excluding scheduled maintenance)
- Service credit schedule: tiered credits for SLA breaches (e.g., 99.9% target: 10% credit for <99.9%, 25% for <99.5%, 50% for <99.0%)
- Incident response: severity classification (P1/P2/P3/P4), response times, escalation matrix
- Data handling: PIPEDA compliance, data residency, encryption (at rest + in transit), breach notification (72 hours per PIPEDA)
- Sub-processor obligations: notice requirements, adequate protection
- Limitation of liability: cap at 12 months fees (typical), carve-outs for IP infringement, data breach, willful misconduct
- Force majeure: modern clause including pandemic, cyber attack, supply chain
- Term and renewal: auto-renewal with notice to cancel, migration assistance on termination
- Target length: 15-25 pages
`,

  "Influencer / Creator Agreement": `
EXPERT DRAFTING CONTEXT — INFLUENCER/CREATOR AGREEMENT:
You are drafting as a media/advertising/IP lawyer. This is the MOST REGULATED agreement type:
- Competition Act s.52: ALL paid endorsements must be clearly disclosed. Include specific disclosure language templates per platform
- Instagram: #ad or Paid Partnership tag. TikTok: #ad in caption + branded content toggle. YouTube: includes paid promotion checkbox + verbal disclosure in first 30 seconds
- Quebec: Consumer Protection Act requires French-language disclosure for Quebec audiences
- FTC compliance (if US audience >5%): material connection disclosure, no deceptive claims
- AGCO compliance (if alcohol/iGaming): age-gating, responsible messaging, no performance claims
- Content deliverables: format, platform, posting schedule, approval workflow, revision rounds
- IP ownership: who owns the content post-campaign, usage rights scope and duration
- Moral rights: creator retains moral rights under Copyright Act s.14.1 (cannot be assigned, only waived)
- Exclusivity: category exclusivity during and after campaign (duration, scope, competing brands definition)
- Payment: flat fee vs. performance-based vs. hybrid, payment triggers, invoicing
- Morals clause: define triggering events, cure period, consequences
- Platform-specific exhibit appendices with disclosure templates
- Target length: 15-25 pages with exhibits
`,

  "Privacy Policy": `
EXPERT DRAFTING CONTEXT — PRIVACY POLICY:
You are drafting as a privacy/data protection lawyer under Canadian privacy law:
- PIPEDA 10 Fair Information Principles (Schedule 1): accountability, identifying purposes, consent, limiting collection, limiting use/disclosure/retention, accuracy, safeguards, openness, individual access, challenging compliance
- Quebec Law 25 (if applicable): explicit consent, privacy impact assessments, de-identification requirements, privacy officer designation, 72-hour breach notification
- CASL anti-spam compliance (if collecting emails): express consent, unsubscribe mechanism, sender identification
- Structure: What we collect, How we use it, When we share it, How we protect it, Your rights, How to contact us
- Cookie policy section with categories (necessary, functional, analytics, advertising)
- Data retention schedule by category
- Cross-border transfer provisions (if data leaves Canada)
- Children's privacy (if applicable)
- Target length: 8-15 pages
`,

  "Terms & Conditions": `
EXPERT DRAFTING CONTEXT — TERMS & CONDITIONS:
You are drafting enforceable web/app terms. Key cases:
- Rudder v. Microsoft: clickwrap agreements are enforceable if user has opportunity to review
- Uber v. Heller (SCC 2020): arbitration clauses can be unconscionable if they impose excessive costs/barriers on consumers
- Include: acceptance mechanism (clickwrap recommended over browsewrap), user obligations, prohibited conduct, IP ownership, user content license, disclaimers, limitation of liability, dispute resolution, governing law, modification rights
- Class action waiver: enforceable in some provinces but draft carefully post-Uber v. Heller
- Automatic renewal disclosure (Ontario Consumer Protection Act s.40)
- Target length: 10-18 pages
`,

  "Master Services Agreement (MSA)": `
EXPERT DRAFTING CONTEXT — MASTER SERVICES AGREEMENT:
You are drafting as a commercial/technology lawyer:
- Master agreement + Statement of Work (SOW) framework
- SOW template as exhibit/schedule: scope, deliverables, timeline, acceptance criteria, fees, expenses
- Change order process: formal, written, pricing impact
- IP ownership: default (client owns deliverables, provider retains pre-existing IP and tools)
- Representations and warranties: professional standards, non-infringement, compliance
- Indemnification: mutual with carve-outs, defense and settlement obligations
- Insurance requirements: CGL, E&O, cyber liability
- Confidentiality: mutual NDA provisions
- Limitation of liability: cap at fees paid in prior 12 months, direct damages only
- Termination: for cause (with cure period) and for convenience (with wind-down)
- Target length: 18-30 pages
`,
};

// ---------------------------------------------------------------------------
// API timeout constant
// ---------------------------------------------------------------------------
const API_TIMEOUT_MS = 90_000; // 90 seconds

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  // --- Extract client IP ---
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  log("info", "Generate request received", { requestId, clientIp });

  // --- Rate limiting ---
  const rl = checkRateLimit(clientIp);
  if (!rl.allowed) {
    log("warn", "Rate limit exceeded", { requestId, clientIp, retryAfterSecs: rl.retryAfterSecs });
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please wait before trying again.",
        errorCategory: "rate_limit",
        requestId,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rl.retryAfterSecs),
          "X-Request-Id": requestId,
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    // --- Parse body ---
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body.", errorCategory: "validation", requestId },
        {
          status: 400,
          headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" },
        }
      );
    }

    // --- Sanitize inputs (strip HTML/script tags) ---
    body = stripHtmlTags(body) as Record<string, unknown>;

    // --- Validate ---
    const validationErrors = validateRequest(body);
    if (validationErrors.length > 0) {
      log("warn", "Validation failed", { requestId, errors: validationErrors });
      return NextResponse.json(
        {
          error: "Validation failed.",
          errorCategory: "validation",
          details: validationErrors,
          requestId,
        },
        {
          status: 400,
          headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" },
        }
      );
    }

    const { category, agreementType, jurisdiction, wizardData, system: customSystem, user: customUser } = body;

    // --- API key check ---
    const apiKey = process.env.RUBY_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      log("error", "Missing API key", { requestId });
      return NextResponse.json(
        { error: "Generation service is being configured. Please try again shortly.", errorCategory: "api_error", requestId },
        {
          status: 503,
          headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" },
        }
      );
    }

    // --- Build prompts (all existing logic preserved) ---
    let systemPrompt: string;
    let userPrompt: string;

    if (customSystem && customUser) {
      systemPrompt = customSystem as string;
      userPrompt = customUser as string;
    } else {
      const wd = (wizardData || {}) as Record<string, unknown>;
      const categories = Array.isArray(category) ? category : [category];
      const frameworks = categories
        .map((c: string) => CATEGORY_FRAMEWORKS[c] || "")
        .filter(Boolean)
        .join("\n\n");

      // Get agreement-specific drafting instructions
      const agreementIds: string[] = (wd.agreementIds as string[]) || [];
      const specificInstructions = getDraftingInstructions(agreementIds);

      // Get clause position selections and format them
      const clauseSelections: Record<string, string> = (wd.clauseSelections as Record<string, string>) || {};
      const allPositions = getClausePositions(agreementIds);
      let clauseDirective = "";
      if (allPositions.length > 0) {
        const lines = allPositions.map((cp) => {
          const selectedId = clauseSelections[cp.id] || cp.defaultPosition;
          const selectedOption = cp.options.find((o) => o.id === selectedId);
          return `- ${cp.label}: ${selectedOption?.label || selectedId} (${selectedOption?.description || ""})`;
        });
        clauseDirective = `\nCLIENT-SELECTED CLAUSE POSITIONS:\nThe client has chosen the following negotiating positions. Draft EACH of these clauses according to the selected position:\n${lines.join("\n")}`;
      }

      systemPrompt = `${BASE_SYSTEM}\n\n${frameworks}\n\n${specificInstructions}${clauseDirective}`;
      const parts: string[] = [];
      parts.push(`AGREEMENT TYPE: ${agreementType || "Not specified"}`);
      parts.push(`JURISDICTION: ${jurisdiction || "Ontario"}`);

      if (wd.party && typeof wd.party === "object") {
        const party = wd.party as Record<string, string>;
        parts.push(`\nPARTIES:`);
        parts.push(`- Party A (Corporation/Employer/Vendor): ${party.partyA || "________________"}`);
        parts.push(`- Party B (Shareholder/Employee/Investor/Customer): ${party.partyB || "________________"}`);
      }

      // Risk profile — shapes every clause in the agreement
      if (wd.riskProfile && typeof wd.riskProfile === "object") {
        const rp = wd.riskProfile as Record<string, unknown>;
        parts.push(`\nCLIENT RISK PROFILE:`);
        const tolerance = rp.tolerance as string;
        parts.push(`- Risk Tolerance: ${tolerance.toUpperCase()}`);
        if (tolerance === "conservative") {
          parts.push(`  → Draft ALL discretionary clauses in the most protective position for our client. Maximize indemnities, cap counterparty liability narrowly, include broad termination rights, extensive representations, and strong IP protections.`);
        } else if (tolerance === "aggressive") {
          parts.push(`  → Draft for speed and deal completion. Use lighter-touch clauses, mutual obligations where possible, reasonable caps, and fewer conditions precedent. The client values flexibility over ironclad protection.`);
        } else {
          parts.push(`  → Draft in the balanced/market position. Fair to both sides. Standard industry protections without being overly aggressive or leaving gaps.`);
        }
        const priorities: string[] = (rp.priorities as string[]) || (rp.priority ? [rp.priority as string] : []);
        if (priorities.length > 0) {
          parts.push(`- Client Priorities: ${priorities.join(", ")}`);
          const PRIORITY_DIRECTIVES: Record<string, string> = {
            protection: "Emphasize IP assignment, broad confidentiality, strong non-competes, comprehensive indemnification.",
            relationship: "Use collaborative language, mutual obligations, reasonable cure periods, and dispute escalation ladders before termination.",
            speed: "Keep the agreement concise and straightforward. Minimize conditions and approvals. Prioritize clear, simple terms.",
            control: "Maximize approval rights, reserved matters, veto powers, and unilateral decision-making authority for our client.",
            exit: "Include robust termination for convenience, clear wind-down procedures, IP return obligations, and transition assistance periods.",
            cost: "Minimize payment obligations, cap expenses, include detailed expense approval processes, and favour fixed-fee over open-ended arrangements.",
          };
          for (const p of priorities) {
            if (PRIORITY_DIRECTIVES[p]) parts.push(`  → ${PRIORITY_DIRECTIVES[p]}`);
          }
        }
        if (rp.context) parts.push(`- Client Context: "${rp.context}" — factor this into your drafting approach.`);
        if (rp.experience === "first-time") parts.push(`- Experience Level: First-time — include clear section headers and ensure the document is as readable as possible while maintaining legal precision.`);
        else if (rp.experience === "legal-background") parts.push(`- Experience Level: Legal professional — use full technical legal language without simplification.`);
      }

      if (wd.tier) {
        parts.push(`\nSERVICE TIER: ${wd.tier}`);
        if (wd.tier === "self-serve") {
          parts.push(`DRAFTING POSITION: Use BALANCED/MARKET position for all clauses.`);
        } else {
          parts.push(`DRAFTING POSITION: Flag all three-position clauses with [POSITION: BALANCED/MARKET — adjustable] so reviewing counsel can customize.`);
        }
      }

      if (wd.activeModules && Array.isArray(wd.activeModules) && wd.activeModules.length > 0) {
        parts.push(`\nACTIVE COMPLIANCE MODULES: ${wd.activeModules.join(", ")}`);
        parts.push(`Apply ALL regulatory requirements from the activated modules above.`);
      }

      if (wd.warnings && Array.isArray(wd.warnings) && wd.warnings.length > 0) {
        parts.push(`\nCOMPLIANCE WARNINGS TO ADDRESS:\n${wd.warnings.map((w: string) => `- ${w}`).join("\n")}`);
      }

      // Employment-specific data
      if (wd.employment && typeof wd.employment === "object") {
        const e = wd.employment as Record<string, unknown>;
        parts.push(`\nEMPLOYMENT TERMS:`);
        if (e.salary) parts.push(`- Annual Salary: ${e.salary} CAD`);
        if (e.startDate) parts.push(`- Start Date: ${e.startDate}`);
        if (e.vacationDays) parts.push(`- Vacation Days: ${e.vacationDays}`);
        if (e.benefitsPlan) parts.push(`- Benefits Plan: ${e.benefitsPlan}`);
        if (e.terminationPosition) parts.push(`- Termination Position: ${e.terminationPosition}`);
        if (e.probationPosition) parts.push(`- Probation Position: ${e.probationPosition}`);
        parts.push(`- Confidentiality Clause: ${e.confidentiality ? "Yes" : "No"}`);
        parts.push(`- Non-Solicitation of Clients: ${e.nonSolicitClient ? `Yes (${e.nonSolicitClientDuration} months)` : "No"}`);
        parts.push(`- Non-Solicitation of Employees: ${e.nonSolicitEmployee ? `Yes (${e.nonSolicitEmployeeDuration} months)` : "No"}`);
        parts.push(`- Non-Compete: ${e.nonCompete ? `Yes (${e.nonCompeteDuration} months)` : "No"}`);
        if (e.ipPosition) parts.push(`- IP Assignment Position: ${e.ipPosition}`);
      }

      // Corporate/shareholder-specific data
      if (wd.corporate && typeof wd.corporate === "object") {
        const c = wd.corporate as Record<string, unknown>;
        parts.push(`\nSHAREHOLDER & GOVERNANCE TERMS:`);
        if (c.shareholders && Array.isArray(c.shareholders) && c.shareholders.length > 0) {
          parts.push(`- Shareholders:`);
          (c.shareholders as { name: string; equity: string; role: string }[]).forEach((sh) => {
            parts.push(`  * ${sh.name || "[NAME]"}: ${sh.equity}% equity, Role: ${sh.role || "Shareholder"}`);
          });
        }
        parts.push(`- Board Size: ${c.boardSize} directors`);
        parts.push(`- Appointment Rights: ${c.appointmentRights}`);
        if (c.reservedMatters && Array.isArray(c.reservedMatters) && c.reservedMatters.length > 0) {
          parts.push(`- Reserved Matters (require shareholder approval): ${(c.reservedMatters as string[]).join("; ")}`);
        }
        parts.push(`- Voting Threshold: ${c.votingThreshold}%`);
        parts.push(`- Right of First Refusal (ROFR): ${c.rofr ? `Yes (${c.rofrDays}-day exercise period)` : "No"}`);
        parts.push(`- Tag-Along Rights: ${c.tagAlong ? `Yes (threshold: ${c.tagAlongThreshold}%)` : "No"}`);
        parts.push(`- Drag-Along Rights: ${c.dragAlong ? `Yes (threshold: ${c.dragAlongThreshold}%)` : "No"}`);
        parts.push(`- Pre-Emptive Rights: ${c.preEmptive ? "Yes" : "No"}`);
        parts.push(`- Deadlock Resolution Method: ${c.deadlockMethod}`);
        parts.push(`- Exit Mechanism: ${c.exitMechanism}`);
      }

      // Investment-specific data
      if (wd.investment && typeof wd.investment === "object") {
        const inv = wd.investment as Record<string, unknown>;
        parts.push(`\nINVESTMENT TERMS:`);
        if (inv.investmentAmount) parts.push(`- Investment Amount: ${inv.investmentAmount} CAD`);
        if (inv.valuationCap) parts.push(`- Valuation Cap: ${inv.valuationCap} CAD`);
        parts.push(`- Discount Rate: ${inv.discountRate}%`);
        if (inv.conversionTriggers) parts.push(`- Conversion Triggers: ${(inv.conversionTriggers as string[]).join(", ")}`);
        parts.push(`- MFN Clause Scope: ${inv.mfnClause}`);
        parts.push(`- Pro Rata Threshold: ${inv.proRataThreshold}%`);
        parts.push(`- Information Frequency: ${inv.infoFrequency}`);
        if (inv.infoScope) parts.push(`- Information Scope: ${(inv.infoScope as string[]).join(", ")}`);
        parts.push(`- Board Observer Rights: ${inv.boardObserver ? "Yes" : "No"}`);
      }

      // Commercial-specific data
      if (wd.commercial && typeof wd.commercial === "object") {
        const com = wd.commercial as Record<string, unknown>;
        parts.push(`\nCOMMERCIAL / SLA TERMS:`);
        if (com.serviceDescription) parts.push(`- Service Description: ${com.serviceDescription}`);
        parts.push(`- Deployment Model: ${com.deploymentModel}`);
        parts.push(`- Uptime Commitment: ${com.uptimeCommitment}%`);
        parts.push(`- Response Times: Critical ${com.responseCritical}hr, High ${com.responseHigh}hr, Medium ${com.responseMedium}hr, Low ${com.responseLow}hr`);
        parts.push(`- Service Credit Schedule: ${com.serviceCreditSchedule}`);
        parts.push(`- PIPEDA Compliance: ${com.pipeda ? "Yes" : "No"}`);
        parts.push(`- Data Residency: ${com.dataResidency}`);
        parts.push(`- Breach Notification: ${com.breachNotification} hours`);
        parts.push(`- CASL Compliance: ${com.casl ? "Yes" : "No"}`);
        parts.push(`- Liability Cap: ${com.liabilityCap}`);
        parts.push(`- Force Majeure: ${com.forceMajeure ? "Yes" : "No"}`);
        parts.push(`- Consequential Damages Exclusion: ${com.consequentialDamages ? "Yes" : "No"}`);
      }

      // Platform-specific data (T&C, Privacy, Partnership, MSA)
      if (wd.platform && typeof wd.platform === "object") {
        const plat = wd.platform as Record<string, unknown>;
        parts.push(`\nPLATFORM & BUSINESS TERMS:`);
        parts.push(`- Business Type: ${plat.businessType}`);
        if (plat.platformUrl) parts.push(`- Platform URL: ${plat.platformUrl}`);
        parts.push(`- User Accounts: ${plat.hasUserAccounts ? "Yes" : "No"}`);
        parts.push(`- Collects Personal Information: ${plat.collectsPersonalInfo ? "Yes" : "No"}`);
        parts.push(`- E-Commerce / Payment Processing: ${plat.hasEcommerce ? "Yes" : "No"}`);
        parts.push(`- User-Generated Content: ${plat.hasUGC ? "Yes" : "No"}`);
        parts.push(`- Operates in Quebec: ${plat.operatesInQuebec ? "Yes — apply Quebec Law 25 and French language requirements" : "No"}`);
        parts.push(`- International Users: ${plat.hasInternationalUsers ? "Yes — include GDPR/CCPA provisions" : "No"}`);
        parts.push(`- Acceptance Mechanism: ${plat.acceptanceMechanism}`);
        parts.push(`- Dispute Resolution: ${plat.disputeResolution}`);
        parts.push(`- Data Storage Location: ${plat.dataStorage}`);
        parts.push(`- Partnership Type: ${plat.partnershipType}`);
        parts.push(`- Profit/Loss Split: ${plat.profitSplit}`);
        parts.push(`- Management Structure: ${plat.managementStructure}`);
        parts.push(`- MSA Payment Terms: ${plat.msaPaymentTerms}`);
        parts.push(`- MSA IP Ownership: ${plat.msaIpOwnership}`);
      }

      // Influencer-specific data
      if (wd.influencer && typeof wd.influencer === "object") {
        const inf = wd.influencer as Record<string, unknown>;
        const platforms = inf.platforms as string[];
        const contentTypes = inf.contentTypes as string[];
        parts.push(`\nINFLUENCER / CREATOR CAMPAIGN TERMS:`);
        parts.push(`- Platforms: ${platforms.join(", ")}`);
        parts.push(`- Content Types: ${contentTypes.join(", ")}`);
        parts.push(`- Campaign Duration: ${inf.campaignDuration}`);
        parts.push(`- Posting Frequency: ${inf.postFrequency}`);
        parts.push(`- Compensation Model: ${inf.compensationModel}`);
        if (inf.hasUsAudience) parts.push(`- US Audience: Yes (${inf.usAudiencePercent}%) — ACTIVATE FTC Endorsement Guides compliance`);
        if (inf.isRegulatedIndustry) parts.push(`- Regulated Industry: ${inf.regulatedCategory} — ACTIVATE industry-specific compliance module`);
        if (inf.collectsPersonalData) parts.push(`- Collects Personal Data: Yes — ACTIVATE PIPEDA/CASL consent and security clauses`);
        if (inf.usesAiContent) parts.push(`- AI-Generated Content: Yes — ACTIVATE CCCS synthetic content disclosure requirements`);
        if (inf.hasQuebecAudience) parts.push(`- Quebec Audience: Yes — ACTIVATE Charter of French Language requirements; generate French-language disclosure addendum`);
        parts.push(`\nPLATFORM-SPECIFIC DISCLOSURE REQUIREMENTS (include in Exhibit C):`);
        for (const p of platforms) {
          if (p === "instagram") parts.push(`- Instagram: #ad in first 3 characters of caption + activate Paid Partnership label`);
          else if (p === "tiktok") parts.push(`- TikTok: Use brand partnerships tool + #ad hashtag in first 30 characters`);
          else if (p === "youtube") parts.push(`- YouTube: Auto-applied Paid Partnership label + video description disclaimer in first 30 seconds`);
          else if (p === "x-twitter") parts.push(`- X/Twitter: #ad or #partner early in post text (first 50 characters)`);
          else if (p === "facebook") parts.push(`- Facebook: Paid partnership label + privacy disclaimer in comment section`);
          else if (p === "linkedin") parts.push(`- LinkedIn: #ad disclosure in post text + sponsored content tag`);
        }
      }

      // Trigger answers for compliance context
      if (wd.triggerAnswers && typeof wd.triggerAnswers === "object") {
        const answered = Object.entries(wd.triggerAnswers as Record<string, unknown>).filter(([, v]) => v);
        if (answered.length > 0) {
          parts.push(`\nCOMPLIANCE TRIGGER ANSWERS (Yes):`);
          answered.forEach(([k]) => parts.push(`- ${k}: Yes`));
        }
      }

      // Add agreement-specific expert context
      const expertContext = AGREEMENT_EXPERT_CONTEXT[agreementType as string] || "";

      userPrompt = `${parts.join("\n")}
${expertContext}
Generate the COMPLETE draft agreement now. This must be a full, production-ready legal document including:
1. Title page with agreement name, parties, and effective date
2. WHEREAS recitals establishing the purpose and context
3. Complete DEFINITIONS section with ALL mandatory defined terms for this agreement type
4. All operative ARTICLES with numbered sections and sub-sections
5. All provisions as specified by the parameters above, drafted in the appropriate THREE-POSITION stance
6. All applicable compliance provisions for the specified jurisdiction
7. REPRESENTATIONS AND WARRANTIES from each party
8. TERMINATION provisions and survival clauses
9. GOVERNING LAW and dispute resolution (jurisdiction-specific)
10. GENERAL PROVISIONS (entire agreement, severability, amendments, notices, waiver, counterparts)
11. EXECUTION blocks with signature lines for all parties

CRITICAL FORMATTING RULES — READ CAREFULLY:
- You MUST use the ACTUAL party names, dates, amounts, jurisdiction, salary, equity percentages, and every other value provided in the wizard data above. Insert them directly into the document text.
- For example, if Party A is "Acme Corp" and Party B is "Jane Smith", write: "THIS AGREEMENT made between **Acme Corp** (the "Company") and **Jane Smith** (the "Employee")..." — NOT blanks, NOT placeholders.
- NEVER use square brackets like [NAME], [DATE], [AMOUNT], or any [PLACEHOLDER]. This is an absolute rule — zero square brackets in the output.
- ONLY use blank lines "________________" for values that were genuinely NOT provided in the wizard data above. If a value exists in the data, you MUST use it.
- Use markdown heading syntax for document structure:
  - Use # for the agreement title only (e.g., # SHAREHOLDER AGREEMENT)
  - Use ## for major article/section headings following the pattern: ## ARTICLE 1 — INTERPRETATION AND DEFINITIONS, ## ARTICLE 2 — TERM, etc.
  - Use ### for sub-section headings (e.g., ### 1.1 Defined Terms)
  - Use --- for horizontal rules / section dividers
- Bold all defined terms on first use using **text** (e.g., **"Agreement"**, **"Effective Date"**).
- Do NOT use # symbols inside running text — only at the start of a line for headings.

ABSOLUTELY NO DASH BULLET POINTS — THIS IS CRITICAL:
- NEVER use "- " (dash followed by space) for lists anywhere in the agreement.
- NEVER use "* " (asterisk followed by space) for lists.
- Top-tier law firms NEVER use bullet points in contracts. Instead:
  - For lists within clauses, use lettered paragraphs: (a), (b), (c)... at the start of each line
  - For sub-lists, use roman numerals: (i), (ii), (iii)... at the start of each line
  - For definitions, use numbered sub-sections: 1.1, 1.2, 1.3...
  - For enumerated obligations, use the section numbering system: 4.1(a), 4.1(b)...
- Every list item must be a proper legal provision with lettered or numbered designation.
- The document must look like it came from McCarthy Tétrault or Osler — not a markdown README.

PROFESSIONAL TYPOGRAPHY:
- Use proper legal transitions between sections (not just line breaks)
- Include "the parties agree as follows:" before operative provisions
- Use "shall" for obligations, "may" for permissions, "will" for future events
- Maintain consistent voice and tense throughout
- Keep section spacing compact — do NOT add excessive blank lines between sections. One blank line maximum between sections.
- Do NOT use "## WHEREAS" or "## RECITALS" as a heading. The WHEREAS recitals should flow directly after the party/date lines without a separate heading.

ZERO BLANK FIELDS RULE — ABSOLUTE REQUIREMENT:
- Review EVERY single data point provided in the wizard data above.
- If a salary is provided, it MUST appear in the compensation section.
- If shareholders/equity percentages are provided, they MUST appear in the share capital provisions.
- If vacation days, benefits, start date, probation period, notice period, non-compete duration, non-solicit duration are provided, each MUST appear in the appropriate section.
- If a valuation cap, discount rate, investment amount, or conversion trigger is provided, it MUST appear.
- If board size, voting threshold, ROFR days, tag-along threshold, drag-along threshold are provided, they MUST appear.
- If uptime commitment, response times, service credits, data residency are provided, they MUST appear.
- If platforms, content types, campaign duration, posting frequency, compensation model are provided, they MUST appear.
- The ONLY time "________________" should appear is for party signatures and genuinely missing optional fields.
- After drafting, mentally verify: did I use EVERY piece of data from the wizard? If not, add it.

- The output must read like a finished legal document from a top-tier firm, not a template.
- MANDATORY STRUCTURAL ELEMENTS — every agreement must include:
  - WHEREAS recitals establishing the background and purpose, ending with the "NOW THEREFORE" consideration clause
  - A complete execution block: "IN WITNESS WHEREOF..." with proper signature lines (Per:, Name:, Title:, Date:, authority to bind statement) for EACH party
  - For complex agreements (employment, shareholder, investment, MSA): include at least one Schedule (e.g., Schedule A — Compensation Details, Schedule A — Share Capital, Schedule A — Statement of Work)

Generate the full agreement — do not truncate, summarize, or abbreviate any section.`;
    }

    const model = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";
    const anthropic = new Anthropic({ apiKey });

    // Check if client wants streaming
    const wantsStream = body.stream === true;

    if (wantsStream) {
      // Streaming response — tokens appear as they're generated
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const abortController = new AbortController();
          const timeoutId = setTimeout(() => abortController.abort(), API_TIMEOUT_MS);

          // Heartbeat to prevent connection timeouts
          const heartbeatInterval = setInterval(() => {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`));
            } catch {
              // Controller may already be closed
            }
          }, 10_000);

          try {
            const messageStream = anthropic.messages.stream(
              {
                model,
                max_tokens: 12000,
                temperature: 0.3,
                system: systemPrompt,
                messages: [{ role: "user", content: userPrompt }],
              },
              { signal: abortController.signal }
            );

            messageStream.on("text", (text) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "delta", text })}\n\n`));
            });

            const finalMessage = await messageStream.finalMessage();

            // Append LSO disclaimer for Expert Draft (self-serve) documents
            const wd = body.wizardData as Record<string, unknown> | undefined;
            const requestedTier = wd?.tier;
            if (requestedTier === "self-serve") {
              const disclaimer = `\n\n---\n\n**NOTICE**: This document was prepared using Ruby Law's Expert Draft technology. It has not been reviewed by a licensed lawyer and does not constitute legal advice or a legal opinion. No lawyer-client relationship is created by the generation or use of this document. The Law Society of Ontario requires this disclosure pursuant to its rules governing the unauthorized practice of law. You are strongly encouraged to obtain independent legal advice before executing this agreement.`;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "delta", text: disclaimer })}\n\n`));
            }

            const durationMs = Date.now() - startTime;
            log("info", "Stream generation complete", {
              requestId,
              durationMs,
              model: finalMessage.model,
              inputTokens: finalMessage.usage.input_tokens,
              outputTokens: finalMessage.usage.output_tokens,
            });

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", model: finalMessage.model, usage: { input_tokens: finalMessage.usage.input_tokens, output_tokens: finalMessage.usage.output_tokens }, requestId })}\n\n`));
            controller.close();
          } catch (err) {
            const { category: errCategory, message: errMessage } = categorizeError(err);
            const durationMs = Date.now() - startTime;
            log("error", "Stream generation failed", { requestId, durationMs, errorCategory: errCategory, error: err instanceof Error ? err.message : "Unknown" });

            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: errMessage, errorCategory: errCategory, requestId })}\n\n`));
              controller.close();
            } catch {
              // Controller may already be closed
            }
          } finally {
            clearTimeout(timeoutId);
            clearInterval(heartbeatInterval);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-store",
          Connection: "keep-alive",
          "X-Request-Id": requestId,
        },
      });
    }

    // Non-streaming fallback with timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), API_TIMEOUT_MS);

    let message;
    try {
      message = await anthropic.messages.create(
        {
          model,
          max_tokens: 12000,
          temperature: 0.3,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        },
        { signal: abortController.signal }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const textBlock = message.content.find((b) => b.type === "text");
    let draft = textBlock ? textBlock.text : "No content generated.";

    // Append LSO disclaimer for Expert Draft (self-serve) documents
    const wd = body.wizardData as Record<string, unknown> | undefined;
    const requestedTier = wd?.tier;
    if (requestedTier === "self-serve") {
      draft += `\n\n---\n\n**NOTICE**: This document was prepared using Ruby Law's Expert Draft technology. It has not been reviewed by a licensed lawyer and does not constitute legal advice or a legal opinion. No lawyer-client relationship is created by the generation or use of this document. The Law Society of Ontario requires this disclosure pursuant to its rules governing the unauthorized practice of law. You are strongly encouraged to obtain independent legal advice before executing this agreement.`;
    }

    const durationMs = Date.now() - startTime;
    log("info", "Generation complete", {
      requestId,
      durationMs,
      model: message.model,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    });

    return NextResponse.json(
      {
        draft,
        model: message.model,
        usage: {
          input_tokens: message.usage.input_tokens,
          output_tokens: message.usage.output_tokens,
        },
        requestId,
      },
      {
        headers: {
          "X-Request-Id": requestId,
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    const { category: errCategory, status, message: errMessage } = categorizeError(err);
    const durationMs = Date.now() - startTime;
    log("error", "Generate API error", {
      requestId,
      durationMs,
      errorCategory: errCategory,
      error: err instanceof Error ? err.message : "Unknown",
      stack: err instanceof Error ? err.stack : undefined,
    });

    return NextResponse.json(
      { error: errMessage, errorCategory: errCategory, requestId },
      {
        status,
        headers: {
          "X-Request-Id": requestId,
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
