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
  "platform",
  "creator",
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
    } else {
      // Accept jurisdiction in any case or slug format (e.g., "ontario", "Ontario", "british-columbia")
      const normalizedJurisdiction = jurisdiction.toLowerCase().replace(/-/g, " ");
      const validLower = new Set([...VALID_JURISDICTIONS].map((j) => j.toLowerCase()));
      if (!validLower.has(normalizedJurisdiction)) {
        // Also accept slug formats like "british-columbia" for "British Columbia"
        const slugMatch = [...VALID_JURISDICTIONS].some(
          (j) => j.toLowerCase().replace(/\s+/g, "-") === jurisdiction.toLowerCase()
        );
        if (!slugMatch) {
          errors.push({ field: "jurisdiction", message: `Unknown jurisdiction "${jurisdiction}".` });
        }
      }
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
  platform: GENERAL_BUSINESS_FRAMEWORK,
  creator: INFLUENCER_AGREEMENT_FRAMEWORK,
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
BASE DRAFTING CONTEXT — EMPLOYMENT AGREEMENT:
You are drafting as a senior employment lawyer with 15+ years of Canadian practice. This agreement must:
- Open with clear identification of employer, employee, position, and start date
- Include a comprehensive DEFINITIONS section (at minimum: "Confidential Information", "Intellectual Property", "Termination Date", "Notice Period", "Cause")
- Structure compensation as: base salary, bonus/incentive (if any), equity (if any), benefits, vacation
- TERMINATION section is THE most important section — draft per Waksdale v. Swegon, 2020 ONCA 391: every termination clause must be internally consistent. Test: if ANY one provision is struck down, do the remaining provisions survive independently? Per Monterosso v. Metro Freightliner, 2023 ONCA 413, the for-cause and without-cause provisions are read together.
- BONUS/INCENTIVE COMPENSATION: Per Matthews v. Ocean Nutrition Canada Ltd., 2020 SCC 26, employees are entitled to bonus during the reasonable notice period UNLESS the plan contains clear, unambiguous language excluding terminated employees. Draft bonus provisions with explicit language if the intent is to exclude post-termination entitlement.
- Restrictive covenants must pass Shafron v. KRG: (1) legitimate proprietary interest, (2) reasonable in scope/geography/duration, (3) clear and unambiguous
- For Ontario: s.67.2 ESA 2000 — non-compete clauses are VOID for non-C-suite employees. Use non-solicitation instead.
- Include proper NOTICE provisions, ENTIRE AGREEMENT clause, INDEPENDENT LEGAL ADVICE acknowledgment
- Target length: 12-18 pages, 6,000-9,000 words
`,

  "Fixed-Term Employment Agreement": `
BASE DRAFTING CONTEXT — FIXED-TERM EMPLOYMENT:
You are drafting as a senior employment lawyer. This is a FIXED-TERM contract — Howard v. Benson Group Inc., 2016 ONCA 256 rules apply:
- If the contract does NOT include a valid early termination clause, the employer must pay the ENTIRE remaining term
- Early termination clause must be explicit, unambiguous, and comply with ESA minimums
- Include: fixed term dates, renewal provisions (automatic vs. manual), conversion to permanent provisions
- Address: what happens at expiry (automatic termination vs. notice), successive fixed-term contracts risk (may create permanent employment relationship)
- CRITICAL: Do not draft as open-ended with a "term" — draft as genuinely fixed-term with a real end date
- Target length: 10-15 pages
`,

  "Executive Employment Agreement": `
BASE DRAFTING CONTEXT — EXECUTIVE EMPLOYMENT:
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
BASE DRAFTING CONTEXT — RESTRICTIVE COVENANTS:
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
BASE DRAFTING CONTEXT — CONTRACTOR AGREEMENT:
You are drafting to establish a genuine independent contractor relationship. 671122 Ontario Ltd. v. Sagaz Industries Canada Inc., 2001 SCC 59 is the key case:
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

  "Confidentiality & IP Assignment": `
BASE DRAFTING CONTEXT — CONFIDENTIALITY & IP ASSIGNMENT:
You are drafting as a senior IP/technology lawyer protecting a company's most valuable intangible assets. This agreement must be structured around WHAT IP IS BEING PROTECTED:

ARTICLE 1 — DEFINITIONS & INTERPRETATION:
- Define 7 distinct IP categories with precision:
  (a) "Software IP": source code, object code, APIs, SDKs, firmware, scripts, configuration files, build tools, deployment pipelines, and all documentation
  (b) "Algorithm & AI IP": machine learning models, neural network architectures, model weights and parameters, training datasets, data preprocessing pipelines, feature engineering methods, hyperparameter configurations, and inference optimization techniques
  (c) "Trade Secrets": proprietary business processes, formulas, compilations, patterns, methods, techniques, customer lists, supplier terms, pricing models, financial projections, and strategic plans — per the Trade Secrets Act (Ontario) and common law
  (d) "Copyrightable Works": documentation, technical specifications, UI/UX designs, wireframes, graphics, marketing materials, training materials, presentations, white papers, and all original works of authorship under Copyright Act s.5
  (e) "Patentable Inventions": inventions, improvements, discoveries, and industrial designs capable of patent protection under the Patent Act, R.S.C. 1985, c. P-4
  (f) "Trademark Assets": trademarks, service marks, trade names, trade dress, logos, domain names, social media handles, and brand guidelines under the Trademarks Act, R.S.C. 1985, c. T-13
  (g) "Data Assets": databases, data compilations, data models, data dictionaries, metadata schemas, and structured/unstructured data collections

ARTICLE 2 — IP ASSIGNMENT MECHANICS:
- Present tense assignment: "hereby assigns" (not "agrees to assign") for immediate vesting
- Work-for-hire analysis under Copyright Act s.13(3): if employee, employer owns by default; if contractor, MUST have explicit assignment
- Address joint authorship scenarios: if IP created collaboratively, specify that company owns 100%
- Future works clause: all IP created during employment that relates to the company's business or is created using company resources
- Invention disclosure obligation: employee must disclose ALL inventions within 10 business days of conception, using a structured Invention Disclosure Form
- Assignment of moral rights: waiver under Copyright Act s.14.1 — moral rights cannot be assigned in Canada, only WAIVED
- Consideration: for existing employees, new consideration beyond continued employment (signing bonus, stock options, etc.)

ARTICLE 3 — PRE-EXISTING IP SCHEDULE:
- Structured disclosure: employee lists ALL pre-existing IP on Schedule A at time of signing
- Categories: personal projects, open-source contributions, prior employer IP, academic work, patents pending
- License-back provision: if employee's pre-existing IP is incorporated into company work, employee grants perpetual, irrevocable, royalty-free license
- Dispute resolution: if dispute arises about whether IP is pre-existing or company-created, burden of proof is on employee
- Update mechanism: employee can update Schedule A within first 30 days with manager approval

ARTICLE 4 — CONFIDENTIALITY TIERS:
- Three-tier classification system:
  (a) RESTRICTED: source code, algorithms, model weights, financial data, customer PII — need-to-know basis only, no copies, secure storage required
  (b) CONFIDENTIAL: business plans, product roadmaps, internal processes, vendor terms — shared within teams, no external disclosure
  (c) INTERNAL: general company information, org charts, non-public policies — shared freely internally, not externally
- Return/destruction obligations on termination: all materials returned within 5 business days, certification of destruction for digital copies
- Survival period: RESTRICTED information — indefinite (trade secret protection); CONFIDENTIAL — 5 years post-termination; INTERNAL — 2 years

ARTICLE 5 — SPECIFIC IP-TYPE PROTECTIONS:
- Software: source code escrow provisions, repository access controls, commit history belongs to company
- AI/ML: model weights are trade secrets, training data curation methodology is proprietary, prohibition on replicating models at new employer
- Patents: invention assignment obligation, cooperation in patent prosecution, company pays filing costs, employee named as inventor
- Trademarks: brand usage guidelines during employment, no personal use of company marks, social media policy
- Trade secrets: reasonable measures requirement per Lyons Partnership v. Morris, ongoing secrecy obligation

ARTICLE 6 — CONTRACTOR/EMPLOYEE DISTINCTION (Sagaz):
- If relationship is employment: Copyright Act s.13(3) provides default ownership to employer for works made in course of employment
- If relationship is independent contractor: NO default — must have explicit written assignment, IP assignment clause is THE most critical provision
- Sagaz multi-factor test: control over work, ownership of tools, chance of profit/risk of loss, integration into business
- Include contractor acknowledgments that IP assignment is core consideration for the engagement
- Misclassification risk: if contractor is later deemed employee, assignment should still hold; if employee is deemed contractor, explicit assignment covers the gap

ARTICLE 7 — REMEDIES & ENFORCEMENT:
- Injunctive relief: acknowledge that breach causes irreparable harm, consent to injunction without proof of damages
- Liquidated damages clause for willful breach
- Indemnification: employee indemnifies company for any third-party IP claims arising from employee's representations
- Audit rights: company may audit employee's personal devices (with reasonable notice) if breach suspected
- Post-termination obligations: non-solicitation of company's IP team, prohibition on competitive use of confidential information

CRITICAL COMPLIANCE:
- Copyright Act s.14.1: moral rights (attribution, integrity, association) can only be WAIVED, not assigned — must include explicit waiver
- Patent Act: employee inventions made in course of employment presumptively belong to employer, but assignment agreement removes ambiguity
- Trade-marks Act: company should register key marks; agreement should include employee cooperation obligation
- Provincial variations: Quebec's Civil Code arts. 2088-2089 impose different confidentiality obligations
- Open source: address open source contribution policy — employee must get approval before contributing to open source projects that touch company technology

Target length: 10-15 pages, 5,000-7,500 words. Include Schedules: A (Pre-Existing IP), B (Invention Disclosure Form), C (Confidentiality Classification Guide).
`,

  "Two-Party Shareholder Agreement": `
BASE DRAFTING CONTEXT — TWO-PARTY SHAREHOLDER AGREEMENT:
You are drafting as a senior corporate lawyer for a two-shareholder company. This is the MOST IMPORTANT governance document:
- Must be comprehensive: 40-60 clauses across 8-12 articles
- TRANSFER RESTRICTIONS are critical: ROFR mechanics (notice, valuation, exercise period, closing), tag-along, drag-along
- DEADLOCK RESOLUTION must be airtight: mediation → arbitration → shotgun buy-sell cascade with specific mechanics
- Board composition and appointment rights tied to equity percentages
- Reserved matters / unanimous consent list (15-25 matters requiring both shareholders' approval)
- Valuation methodology for all transfer scenarios (fair market value, formula, independent appraiser)
- Distributions policy: mandatory vs. discretionary, frequency, calculation
- Non-compete between shareholders (enforceable in shareholder context even in Ontario — ESA s.67.2 applies to employment relationships only, not shareholder covenants; but dual-capacity individuals require careful drafting)
- OPPRESSION REMEDY: CBCA s.241 cannot be contracted out. Per BCE Inc. v. 1976 Debentureholders, 2008 SCC 69, the oppression remedy is assessed against "reasonable expectations" of stakeholders. The USA informs but does not conclusively determine those expectations. Draft governance and exit provisions with this in mind.
- Death, disability, bankruptcy provisions
- Shotgun buy-sell: pricing, notice mechanics, acceptance/rejection timeline, financing provisions
- Target length: 25-40 pages, 12,000-18,000 words
`,

  "Early-Stage Shareholder Agreement": `
BASE DRAFTING CONTEXT — EARLY-STAGE SHAREHOLDER AGREEMENT:
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
BASE DRAFTING CONTEXT — CANADIAN SAFE:
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
BASE DRAFTING CONTEXT — CONVERTIBLE NOTE:
You are drafting as a securities/finance lawyer. Critical compliance requirements:
- Interest Act R.S.C. 1985: s.4 requires interest to be stated as a rate per annum or percentage per annum (not monthly/daily); s.6 limits recovery of interest on blended payments to the rate stated in the agreement — failure to express as annual rate means only 5% recoverable
- Criminal Code s.347: criminal interest rate savings clause MANDATORY. NOTE: As of January 1, 2025, the criminal rate was lowered from 60% effective annual rate (approx. 48% APR) to 35% APR for most lending. Exemptions: commercial loans $10K-$500K (48% APR cap), pawnbroking loans under $1K (48% APR cap), and payday loans (14% of amount advanced cap). Loans over $500K are fully exempt. Draft the savings clause to reference the current 35% APR threshold.
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
BASE DRAFTING CONTEXT — SAAS SLA:
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
BASE DRAFTING CONTEXT — INFLUENCER/CREATOR AGREEMENT:
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
BASE DRAFTING CONTEXT — PRIVACY POLICY:
You are drafting as a privacy/data protection lawyer under Canadian privacy law:
- PIPEDA 10 Fair Information Principles (Schedule 1): accountability, identifying purposes, consent, limiting collection, limiting use/disclosure/retention, accuracy, safeguards, openness, individual access, challenging compliance
- Quebec Law 25 (if applicable — fully in force as of September 2024): explicit consent, privacy impact assessments, de-identification requirements, privacy officer designation, 72-hour breach notification to CAI, automated decision-making transparency under s.12.1 (must inform individuals when decisions are based exclusively on automated processing), data portability rights
- CASL anti-spam compliance (if collecting emails): express consent, unsubscribe mechanism, sender identification
- Structure: What we collect, How we use it, When we share it, How we protect it, Your rights, How to contact us
- Cookie policy section with categories (necessary, functional, analytics, advertising)
- Data retention schedule by category
- Cross-border transfer provisions (if data leaves Canada)
- Children's privacy (if applicable)
- Target length: 8-15 pages
`,

  "Terms & Conditions": `
BASE DRAFTING CONTEXT — TERMS & CONDITIONS:
You are drafting enforceable web/app terms. Key cases:
- Rudder v. Microsoft: clickwrap agreements are enforceable if user has opportunity to review
- Uber Technologies Inc. v. Heller, 2020 SCC 16: arbitration clauses can be unconscionable if they impose excessive costs/barriers on consumers. Two-part test: (1) inequality of bargaining power, and (2) improvident bargain. Forum selection and mandatory arbitration clauses in standard-form consumer contracts are particularly vulnerable.
- Include: acceptance mechanism (clickwrap recommended over browsewrap), user obligations, prohibited conduct, IP ownership, user content license, disclaimers, limitation of liability, dispute resolution, governing law, modification rights
- Class action waiver: enforceable in some provinces but draft carefully post-Uber v. Heller
- Automatic renewal disclosure (Ontario Consumer Protection Act s.40)
- Target length: 10-18 pages
`,

  "Master Services Agreement (MSA)": `
BASE DRAFTING CONTEXT — MASTER SERVICES AGREEMENT:
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
- Good faith in performance: Per Bhasin v. Hrynew, 2014 SCC 71 and Callow v. Zollinger, 2020 SCC 45, parties owe a duty of honest performance. Discretionary clauses (e.g., termination for convenience, satisfaction clauses, renewal decisions) must be exercised honestly and not used to mislead. Draft discretionary rights with objective standards where possible.
- Target length: 18-30 pages
`,

  "Subscription Agreement": `
BASE DRAFTING CONTEXT — SUBSCRIPTION AGREEMENT:
You are drafting as a senior commercial/SaaS lawyer for a recurring-revenue subscription service:
- Service description: clearly define what the subscription includes (features, tiers, usage limits, seat counts)
- Subscription terms: initial term, renewal mechanism (auto-renewal vs. manual), billing cycle (monthly/annual), prorated billing
- Auto-renewal compliance: Ontario Consumer Protection Act s.40 requires clear disclosure of auto-renewal terms. Similar requirements under BC BPCPA. Draft notice provisions that comply with the strictest provincial standard
- CASL (Canada's Anti-Spam Legislation): commercial electronic messages related to subscription management require express or implied consent. Draft consent mechanism provisions
- Pricing: current fees, price change notification period (minimum 30 days recommended), grandfathering provisions
- Usage limits and overages: metered usage thresholds, overage pricing, throttling vs. automatic upgrade
- Plan changes: upgrade (immediate, prorated credit), downgrade (end of billing cycle, feature access termination)
- Data portability: PIPEDA s.4.9 — subscriber right to access and export personal data in machine-readable format
- Service level commitments: availability target, credit schedule for downtime, exclusions (maintenance windows, force majeure)
- Cancellation: subscriber right to cancel, notice requirements, refund policy (prorated vs. forfeiture), data retention period post-cancellation
- Suspension rights: provider right to suspend for non-payment, security breach, or TOS violation — with notice and cure period
- IP: provider owns platform/service, subscriber owns their data, limited license grants
- Warranties: service will materially conform to documentation, no warranty of uninterrupted service
- Liability cap: aggregate liability capped at fees paid in the prior 12 months
- Governing law: applicable Canadian province
- Target length: 12-18 pages
`,

  "Vendor Agreement": `
BASE DRAFTING CONTEXT — VENDOR/SUPPLIER AGREEMENT:
You are drafting as a senior procurement/commercial lawyer:
- Scope of goods/services: detailed description with specifications, quality standards, delivery schedule
- Pricing and payment: unit pricing, total contract value, payment terms (Net 30/60/90), early payment discounts, late payment interest (Interest Act R.S.C. 1985 s.4 — must state as annual rate; s.6 — blended payment interest disclosure; Criminal Code s.347 — rate must not exceed 35% APR as of January 2025; exemptions apply for commercial loans $10K-$500K at 48% APR, and loans over $500K are fully exempt)
- Delivery and acceptance: delivery terms (FOB, CIF per Incoterms 2020), inspection period, acceptance criteria, rejection process
- Warranties: merchantability, fitness for purpose, compliance with specifications, compliance with applicable laws (Ontario Sale of Goods Act R.S.O. 1990 c. S.1)
- Quality standards: ISO compliance, testing requirements, defect rates, recall procedures
- Indemnification: vendor indemnifies for IP infringement, product liability, negligence, breach of law
- Insurance: CGL, product liability, workers comp — minimum coverage amounts with company named as additional insured
- PIPEDA compliance: if vendor handles personal information, include data processing addendum, breach notification obligations (72-hour notification per PIPEDA), data residency requirements
- Supply chain: right to audit, subcontracting restrictions, conflict minerals disclosure, modern slavery compliance
- Confidentiality: mutual NDA, return/destruction of confidential information on termination
- Force majeure: defined events, notice requirements, mitigation obligations, termination right after extended FM
- Termination: for cause (with cure), for convenience (with wind-down period), transition assistance
- Dispute resolution: negotiation, mediation, arbitration (ADR Institute of Canada rules)
- Target length: 15-22 pages
`,

  "Statement of Work": `
BASE DRAFTING CONTEXT — STATEMENT OF WORK (SOW):
You are drafting as a commercial lawyer for a project-based engagement under an MSA or standalone:
- Project scope: detailed description of deliverables, tasks, milestones, success criteria
- Assumptions and dependencies: what the client must provide (access, data, approvals), what the provider assumes
- Out-of-scope: explicitly list what is NOT included to prevent scope creep
- Timeline: start date, milestone dates, completion date, consequences of delay (liquidated damages if applicable)
- Payment structure: fixed-price, time-and-materials, or milestone-based, with payment schedule tied to deliverables
- Change order process: formal written change request, pricing impact, timeline impact, approval process
- Acceptance criteria: testing methodology, acceptance period, deemed acceptance if no response, rejection and re-work process
- Key personnel: named individuals, replacement approval rights, knowledge transfer obligations
- IP ownership: work product assignment (client owns deliverables), provider retains pre-existing IP with perpetual license to client
- Warranty: 90-day warranty period post-acceptance for defects, bug-fix obligations
- Project governance: steering committee, reporting cadence, escalation process
- Termination: partial termination (by milestone), payment for completed work
- Target length: 8-15 pages
`,

  "Consulting Agreement": `
BASE DRAFTING CONTEXT — CONSULTING AGREEMENT:
You are drafting as a senior employment/commercial lawyer. CRITICAL distinction from employment:
- Independent contractor characterization: apply Sagaz Industries (SCC 2001) four-factor test: (1) control, (2) ownership of tools, (3) chance of profit/risk of loss, (4) integration into business. Draft provisions that reinforce contractor status
- 1688782 Ontario Inc. v. Maple Leaf Foods: mischaracterization risk — if the relationship is truly employment, the contract label is irrelevant. Draft substantive provisions that genuinely reflect independence
- Scope of services: defined deliverables, self-directed work methods, ability to work for other clients simultaneously
- Compensation: hourly rate, project fee, or retainer — no benefits, no vacation pay, no EI/CPP deductions. Consultant responsible for own HST/GST remittance
- Expenses: pre-approved expenses only, monthly invoicing, receipts required
- IP assignment: all work product created during engagement assigned to client. Moral rights waiver per Copyright Act s.14.1
- Pre-existing IP: consultant retains ownership of pre-existing tools/methodologies with perpetual license to client
- Restrictive covenants: non-solicitation of employees/clients (Elsley v. J.G. Collins standard), non-compete ONLY if genuinely necessary and narrowly scoped (Shafron v. KRG: must be clear, unambiguous, and reasonable)
- Confidentiality: robust NDA with survival post-termination, return/destruction of materials
- Insurance: E&O/professional liability, CGL — minimum $2M per occurrence recommended
- Termination: either party with 30 days written notice, immediate for cause, payment for completed work
- CRA reporting: no T4, consultant receives invoices and issues T4A if applicable
- Indemnification: mutual, with each party responsible for their own negligence
- Target length: 10-15 pages
`,

  "Software Licensing Agreement": `
BASE DRAFTING CONTEXT — SOFTWARE LICENSING AGREEMENT:
You are drafting as a senior IP/technology lawyer:
- License grant: clearly define scope — perpetual vs. term, exclusive vs. non-exclusive, number of users/seats/instances, territory, permitted use (internal business use only, or sublicensing permitted)
- License restrictions: no reverse engineering, decompilation (Copyright Act s.3), no modification, no sublicensing without consent, no competitive benchmarking, no use to develop competing product
- Delivery and installation: delivery method, installation support, acceptance testing period
- Source code escrow: escrow agent (Iron Mountain or equivalent), release triggers (bankruptcy, material breach, discontinuation of product), verification rights
- Maintenance and support: response times by severity, bug fixes, error corrections, telephone/email support hours, dedicated account manager
- Updates and upgrades: included in license or separate fee, minor versions (patches) vs. major versions, end-of-life/sunset provisions with minimum 18-month notice
- Third-party components: disclosure of open-source software, compliance with open-source licenses (GPL, MIT, Apache), no copyleft contamination of client's IP
- Data handling: PIPEDA compliance if software processes personal information, data residency (Canada), encryption standards, breach notification
- Warranties: software materially conforms to documentation, free of viruses/malware, no IP infringement — Cinar Corporation v. Robinson, 2013 SCC 73: substantial copying test for copyright infringement claims
- IP indemnification: licensor indemnifies against third-party IP infringement claims, modification/replacement right, refund if no workaround available
- Limitation of liability: licensor aggregate liability capped at fees paid in prior 12 months, exclude consequential/indirect damages, carve-outs for IP indemnification and wilful misconduct
- Audit rights: licensor right to audit licensee compliance with license restrictions (seat count, usage), annual or upon reasonable notice
- Termination: for breach (with 30-day cure), for insolvency, effect on license post-termination (perpetual license survives for paid-up versions)
- Export controls: compliance with Canadian export regulations (Export and Import Permits Act)
- Target length: 18-28 pages
`,

  "Incorporation & Formation": `
BASE DRAFTING CONTEXT — ARTICLES OF INCORPORATION (GOVERNMENT-READY FORMAT):
You are drafting articles of incorporation in the EXACT format required by the applicable government filing authority. This must be a GOVERNMENT-READY document that can be filed immediately.

**JURISDICTION-SPECIFIC FORMATTING:**

For FEDERAL (CBCA) incorporation — use Form 1 (Articles of Incorporation under CBCA s.6):
- Item 1: Corporate name (or numbered company)
- Item 2: Province or territory where registered office is situated
- Item 3: Class(es) of shares, maximum number (or unlimited), and rights/privileges/restrictions/conditions for EACH class
- Item 4: Restrictions on share transfers (if any)
- Item 5: Number (or min/max) of directors
- Item 6: Restrictions on business the corporation may carry on (if any)
- Item 7: Other provisions (if any): pre-emptive rights, lien on shares, borrowing powers, indemnification

For ONTARIO (OBCA) incorporation — use Form 1 under OBCA s.5:
- Similar structure to CBCA but filed with Ontario ServiceOntario
- Include: name, registered office municipality, number of directors, share capital, restrictions

For BRITISH COLUMBIA (BCBCA) — use Notice of Articles + Incorporation Agreement:
- BC uses a "Notice of Articles" (not traditional articles) filed with BC Registrar
- Include: Incorporation Agreement signed by each incorporator
- Table of authorized share structure

For ALBERTA (ABCA) — use Form 1 Articles of Incorporation:
- Filed with Alberta Corporate Registry
- Include: name, registered office, share classes, number of directors, restrictions

For QUEBEC — use Articles of Incorporation under the Business Corporations Act (Quebec):
- Filed with Registraire des entreprises du Québec

**SHARE STRUCTURE — DRAFT IN FULL LEGAL DETAIL:**
- Common Shares: voting (one vote per share), dividend entitlement (as declared), liquidation entitlement (pro rata after preferred)
- If preferred shares: specify each class separately with: dividend rate/priority, liquidation preference, voting rights (or non-voting), conversion rights, redemption provisions, anti-dilution

**MUST INCLUDE:**
- Incorporator name(s), address(es), number of shares subscribed
- First director(s) name(s), address(es), Canadian residency declaration
- Restrictions on share transfer (if private company)
- Borrowing powers of directors
- Indemnification of directors and officers

Format the output as a clean, professional government filing form with clearly labeled sections, blanks for signatures, and filing instructions at the top.
Target length: 8-15 pages
`,

  "Articles of Amendment": `
BASE DRAFTING CONTEXT — ARTICLES OF AMENDMENT:
Draft articles of amendment in government-ready format matching the applicable filing authority:
- For CBCA: Form 4 (Articles of Amendment under s.27 or s.173)
- For OBCA: Form 3 (Articles of Amendment under s.168)
- Clearly state the corporation number, name, and each specific amendment
- If creating a new share class: include FULL rights, privileges, restrictions, and conditions
- If changing directors: state the new min/max
- Include special resolution authorization statement
- Target length: 5-10 pages
`,

  "Amended and Restated Articles of Incorporation": `
BASE DRAFTING CONTEXT — AMENDED AND RESTATED ARTICLES:
You are drafting restated articles that consolidate all previous amendments into one clean document, typically done post-financing:
- Include the FULL authorized share capital with ALL classes (common, preferred series A/B/C as applicable)
- Each preferred share class needs COMPLETE specification: dividend rights (cumulative vs non-cumulative), liquidation preference (1x, 2x, participating vs non-participating), conversion mechanics (mandatory vs optional, anti-dilution adjustments), voting rights (as-converted basis or class voting), redemption (if any), protective provisions
- Anti-dilution adjustment formulas (broad-based weighted average is standard, narrow-based or full ratchet less common)
- Conversion triggers: voluntary conversion, mandatory conversion on qualified IPO, automatic conversion thresholds
- Pre-emptive rights language
- Format as a government-ready filing document with proper form structure
- Target length: 15-25 pages
`,

  "Term Sheet": `
BASE DRAFTING CONTEXT — TERM SHEET:
Draft a non-binding term sheet following CVCA (Canadian Venture Capital and Private Equity Association) model format.

**THREE-DOCUMENT PRINCIPLES APPLIED:**
This term sheet must be structured for downstream document generation — every economic and governance term here becomes a parameter that flows into the Subscription Agreement, IRA, Voting Agreement, ROFR/Co-Sale Agreement, and Founders' Lock-Up Agreement.

**BINDING vs. NON-BINDING PROVISIONS — CLEARLY ENUMERATE:**
BINDING provisions (survive regardless of whether financing closes):
- Confidentiality: mutual NDA covering term sheet and all due diligence materials, 24-month survival
- Exclusivity/No-Shop: 45-60 day period during which founders cannot solicit, encourage, negotiate, or accept competing offers from any third party; breach triggers investor's right to recover documented expenses
- Governing law: Province of [Ontario/BC/Alberta/Quebec] and federal laws of Canada applicable therein
- Expenses: company pays investor's reasonable legal fees up to cap ($25,000-$50,000) upon closing; each party bears own costs if deal does not close (except if company breaches exclusivity)
NON-BINDING provisions (all economic and governance terms):
- All sections below are subject to definitive documentation and satisfactory due diligence

**ECONOMICS SECTION — FULL DETAIL:**
- Pre-money valuation: $[X] on a fully-diluted basis (specify what "fully-diluted" includes: outstanding shares + all options/warrants + ESOP pool expansion)
- Price per share: pre-money valuation / fully-diluted share count = $[Y] per Series [Seed/A/B] Preferred Share
- Investment amount: $[Z] aggregate; specify if single close or multiple closes permitted
- Authorized shares: state total authorized capital structure post-financing (common shares, each preferred series)
- ESOP pool: [10-20]% of post-money fully-diluted shares; specify that pool is UNISSUED and included in pre-money (standard) or post-money (founder-favorable); state current pool utilization and required expansion
- Liquidation preference: 1x non-participating preferred (STANDARD — investor gets back investment OR converts to common, not both); note if participating preferred requested (AGGRESSIVE — investor gets preference PLUS pro-rata common participation, typically with 3x cap)
- Anti-dilution: broad-based weighted average (STANDARD); formula: NCP = OCP x ((CSO + CSP) / (CSO + CSI)) where NCP=new conversion price, OCP=old conversion price, CSO=common shares outstanding, CSP=common shares purchasable at old price with new consideration, CSI=common shares actually issued
- Dividend rights: non-cumulative, when-as-and-if declared by board, pari passu with common on as-converted basis (STANDARD); note if cumulative dividends requested (AGGRESSIVE)
- Conversion: voluntary at any time at option of holder; mandatory on Qualified IPO (>$[X] gross proceeds on recognized exchange); automatic conversion at election of majority of preferred class

**GOVERNANCE SECTION — FULL DETAIL:**
- Board composition matrix:
  * Series Seed: 2 Founder-designated, 1 Lead Investor-designated, 0-1 Mutual Independent = 3-4 total
  * Series A: 2 Founder-designated, 1-2 Investor-designated, 1 Mutual Independent = 4-5 total
  * Series B+: 2 Founder-designated, 2 Investor-designated, 1 Mutual Independent = 5 total
- Protective provisions (matters requiring approval of holders of majority of Preferred, voting as a single class):
  1. Amend charter or bylaws in manner adverse to Preferred
  2. Create new class of shares senior to or pari passu with Preferred
  3. Increase or decrease authorized shares of any class
  4. Declare or pay any dividend or distribution
  5. Redeem or repurchase any shares (except employee repurchases at cost)
  6. Effect any liquidation, dissolution, or winding up
  7. Effect any merger, amalgamation, or sale of all/substantially all assets
  8. Incur indebtedness exceeding $[100,000-500,000]
  9. Increase ESOP pool beyond [X]%
  10. Enter related party transactions exceeding $[25,000-50,000]
  11. Change principal business or enter new line of business
  12. Change auditors
- Drag-along: holders of [60-75]% of Preferred + majority of Common can compel all shareholders to approve acquisition; pricing floor of [1x-3x] original issue price
- Information rights: monthly unaudited financials (30 days), quarterly (45 days), annual audited (90 days), annual budget, cap table updates

**INVESTOR RIGHTS SECTION:**
- Pro-rata participation rights: Major Investors (holding >[X]% or $[Y] of Preferred) may participate in future rounds to maintain percentage ownership
- Registration rights: 2 demand registrations, unlimited piggyback, S-1/F-1 shelf registration
- Most Favored Nation (MFN): if company issues securities with more favorable terms, prior investors receive equivalent terms
- Key person provisions: [Founder name(s)] must remain full-time in current role; departure triggers enhanced information rights, board observer seat conversion, and potential acceleration of any milestone-based tranching

**CONDITIONS PRECEDENT:**
- Satisfactory completion of legal, financial, and technical due diligence
- Execution of definitive agreements (Share Purchase Agreement, IRA, Voting Agreement, ROFR/Co-Sale, Founders' Lock-Up)
- Legal opinion of company counsel (valid issuance, no conflicts, corporate authority)
- Board and shareholder approval of financing and restated articles
- No Material Adverse Change since term sheet date
- Satisfactory employment/IP assignment agreements with all founders and key employees
- NI 45-106 s.2.3 accredited investor exemption confirmed for all investors (or other applicable exemption)

**CVCA MODEL REFERENCE:**
- This term sheet follows the CVCA model term sheet structure for Canadian venture capital transactions
- All definitive documentation to be prepared using CVCA model forms as starting point, modified for transaction-specific terms

**CROSS-DOCUMENT DEPENDENCIES:**
- Term Sheet economics flow into -> Subscription Agreement pricing, Restated Articles share terms
- Term Sheet governance flows into -> Voting Agreement board provisions, IRA protective provisions
- Term Sheet investor rights flow into -> IRA information/registration/pro-rata rights
- Term Sheet transfer provisions flow into -> ROFR/Co-Sale Agreement, Founders' Lock-Up Agreement

**REGULATORY HOOKS:**
- NI 45-106 prospectus exemption framework
- CBCA s.6 (articles of incorporation share structure)
- CBCA s.173 (amendment of articles for new share class)
- Provincial securities commission filing (Form 45-106F1 within 10 days of closing)

**PROVINCIAL VARIATIONS:**
- Ontario: OSA s.73.3 additional exemptions; OSC Rule 45-501
- BC: BCSecA s.46 registration exemptions; BC Instrument 45-534
- Alberta: ASA s.86 registration exemptions
- Quebec: Securities Act (Quebec) s.43 exemptions; AMF filing requirements

Target length: 5-8 pages (concise by design — detail flows to definitive documents)
`,

  "Subscription Agreement (NI 45-106)": `
BASE DRAFTING CONTEXT — SUBSCRIPTION AGREEMENT (NI 45-106):

Draft a formal securities subscription agreement for Canadian private placement under NI 45-106, structured as a comprehensive three-document-compliant instrument with clause variants, risk levels, and regulatory hooks.

=== DOCUMENT STRUCTURE ===

**ARTICLE I — SUBSCRIPTION AND PURCHASE**
- Subscription mechanics: subscriber irrevocably subscribes for [number] of [Class] shares at $[price] per share for aggregate subscription price of $[total]
- Payment method: wire transfer to company's solicitor trust account or certified cheque, due on or before closing date
- Closing date: [date], or such later date as mutually agreed but not later than [longstop date]
- Multiple closings: if applicable, initial close (minimum $[X] aggregate) and subsequent closes within [60-90] days
- Conditions to closing:
  * No Material Adverse Change since subscription date
  * Accuracy of all representations and warranties at closing
  * Receipt of all regulatory approvals and filings
  * Minimum aggregate subscription amount of $[X] received
  * Legal opinions delivered (company counsel: valid issuance, corporate authority, no conflicts)
  * Board resolution authorizing issuance
  * Form 45-106F1 prepared for filing

**ARTICLE II — SUBSCRIBER REPRESENTATIONS AND WARRANTIES**
Accredited Investor Status — ALL 15 categories under NI 45-106 s.2.3 (subscriber must certify which apply):
  (a) Registered under securities legislation as adviser or dealer (other than limited market dealer)
  (b) Individual with net financial assets >$1M (alone or with spouse) — define "financial assets" as cash, securities, contracts of insurance, deposits, excluding real property
  (c) Individual with net income >$200K in each of 2 most recent years (or combined spousal income >$300K) and reasonable expectation of exceeding in current year
  (d) Individual with net assets >$5M (alone or with spouse)
  (e) Person (other than individual) with net assets >$5M on most recent financial statements
  (f) Person recognized as accredited investor by securities regulatory authority
  (g) Trust with >$5M assets, not established for purpose of acquiring securities
  (h) Person acting on behalf of fully-managed account managed by registered adviser
  (i) Bank, loan corporation, trust company, insurance company, treasury branch, credit union, or caisse populaire
  (j) Government of Canada/province/territory, or crown agency
  (k) Municipality, public board, commission in Canada
  (l) Entity owned by accredited investors
  (m) Investment fund managed by registered adviser or exempt adviser
  (n) Person registered as exempt market dealer
  (o) Pension fund regulated under federal/provincial legislation
- Control Person representations: subscriber is not / is a control person (>20% per NI 62-104); if yes, additional disclosure obligations
- Insider representations: subscriber is not / is an insider (director, officer, >10% holder per NI 55-104); if yes, insider reporting obligations apply
- Restricted person representations: subscriber is not subject to cease trade order, bankruptcy, or securities regulatory proceedings
- Additional subscriber representations:
  * Legal capacity and authority to enter agreement
  * Subscription not made in contravention of any applicable securities legislation
  * No directed selling efforts in any jurisdiction
  * Independent investment decision, not relying on company or any person for investment advice
  * Access to information about company sufficient to make informed investment decision
  * Resident of [Province/Territory]
  * Not a "U.S. Person" as defined in Regulation S under the U.S. Securities Act (or, if US person, reliance on Rule 506(b)/506(c) of Regulation D)
  * Securities acquired for investment, not with view to resale or distribution

**ARTICLE III — ISSUER REPRESENTATIONS AND WARRANTIES**
- Due organization: company is duly incorporated and validly existing under [CBCA/OBCA/BCBCA/ABCA/QCA]
- Authorized capital: authorized share structure is as described in Schedule [X]; all outstanding shares validly issued, fully paid, non-assessable
- Valid issuance: shares subscribed for, when issued and paid for, will be validly issued, fully paid, non-assessable, free from all liens
- No conflicting agreements: execution and performance does not conflict with articles, bylaws, any material agreement, or any court order
- Financial statements accuracy: most recent financial statements fairly present financial position in accordance with [ASPE/IFRS], no material adverse changes since date thereof
- Material change disclosure: no undisclosed material changes; all material facts have been disclosed to subscriber
- Tax compliance: company is in good standing with CRA and applicable provincial tax authorities; all returns filed, all taxes paid or adequately provisioned
- Litigation: no material litigation pending or threatened
- Intellectual property: company owns or has valid licenses to all material IP
- Regulatory compliance: in compliance with all applicable laws, including privacy (PIPEDA/provincial equivalents), employment standards, environmental

**ARTICLE IV — HOLD PERIOD AND RESALE RESTRICTIONS**
- NI 45-102 s.2.5 hold period acknowledgment:
  * For reporting issuers: 4-month hold period from distribution date; after hold period, resale permitted if company is and has been a reporting issuer for 4 months, no unusual effort to prepare market, no extraordinary commission
  * For non-reporting issuers: indefinite hold period; resale only under another prospectus exemption or pursuant to a prospectus
- Legend on certificates/DRS statements: "THE SECURITIES REPRESENTED HEREBY ARE SUBJECT TO A HOLD PERIOD AND MAY NOT BE TRADED IN CANADA UNTIL [DATE — 4 MONTHS + 1 DAY FROM DISTRIBUTION]. THE HOLDER OF THESE SECURITIES MUST NOT TRADE THE SECURITIES BEFORE THE EXPIRY OF THE HOLD PERIOD UNLESS AUTHORIZED UNDER SECURITIES LEGISLATION."
- No trading during hold period: subscriber acknowledges and agrees not to trade, sell, transfer, or otherwise dispose of securities during hold period
- Book-entry notation: if securities held in book-entry form, appropriate notation restricting transfer

**ARTICLE V — RISK ACKNOWLEDGMENTS**
- Speculative investment: subscription is speculative and involves a high degree of risk
- No market for securities: there is no public market for the securities and none may develop
- Potential loss of entire investment: subscriber may lose entire investment
- Dilution risk: future financings may dilute subscriber's percentage ownership and economic interest
- Key person risk: company's success depends on continued services of key founders/management
- No prospectus: securities offered without a prospectus; subscriber does not have protections of prospectus requirements
- Limited information: company is not a reporting issuer and has limited ongoing disclosure obligations
- Illiquidity: securities cannot be readily sold due to resale restrictions
- Minority shareholder risks: subscriber may have limited ability to influence company decisions

**ARTICLE VI — FORM 45-106F1 AND REGULATORY FILINGS**
- Company must file Form 45-106F1 (Report of Exempt Distribution) with applicable securities regulatory authority within 10 days of distribution
- Subscriber acknowledges and agrees to cooperate with filing, including providing all information required for Form 45-106F1
- Subscriber consents to collection and disclosure of personal information for regulatory filing purposes (PIPEDA/provincial privacy compliance)
- If applicable: Schedule III-A (Ontario) additional filing requirements
- If applicable: BC Form 45-106F6 filing requirements

**ARTICLE VII — CLOSING MECHANICS**
- Time and place: [date, time, location or virtual closing]
- Company deliverables at closing:
  1. Share certificates or DRS statements with appropriate legends
  2. Legal opinion of company counsel (valid issuance, corporate authority, no conflicts, securities law compliance)
  3. Certified copy of directors' resolution authorizing issuance
  4. Certified copy of articles/certificate of incorporation
  5. Officer's certificate confirming accuracy of representations
  6. Executed Form 45-106F1 (for filing within 10 days)
  7. Updated cap table reflecting issuance
- Subscriber deliverables at closing:
  1. Executed subscription agreement
  2. Completed accredited investor certificate (Schedule A)
  3. Payment of subscription price by wire transfer
  4. Completed personal information form for regulatory filings
  5. If applicable: executed spousal/domestic partner consent

**ARTICLE VIII — POST-CLOSING OBLIGATIONS**
- Shareholder agreement joinder: subscriber must execute joinder to existing Shareholder Agreement within [5] business days of closing
- Voting agreement joinder: subscriber must execute joinder to Voting Agreement
- ROFR/Co-Sale agreement joinder: subscriber must execute joinder to Right of First Refusal and Co-Sale Agreement
- IRA joinder: subscriber must execute joinder to Investors' Rights Agreement (if Major Investor threshold met)

**CROSS-DOCUMENT DEPENDENCIES:**
- Subscription Agreement pricing must match -> Term Sheet economics
- Share terms must match -> Restated Articles authorized capital
- Investor rights threshold must align with -> IRA Major Investor definition
- Transfer restrictions must coordinate with -> ROFR/Co-Sale Agreement, Founders' Lock-Up Agreement
- Accredited investor status confirmed here flows to -> Form 45-106F1 filing

**REGULATORY HOOKS:**
- NI 45-106 s.2.3 (accredited investor exemption — primary reliance)
- NI 45-106 s.2.5 (family, friends, business associates exemption — alternative)
- NI 45-102 s.2.5 (4-month hold period / resale restrictions)
- NI 45-106F1 (Report of Exempt Distribution — filed within 10 days)
- NI 55-104 (insider reporting if >10% holder)
- NI 62-103 (early warning reporting if >10%)
- CBCA s.25 (issuance of shares), s.28 (stated capital account)

**PROVINCIAL VARIATIONS:**
- Ontario: OSC Rule 45-501 additional requirements; Ontario Schedule III-A filing
- BC: BC Instrument 45-534; BCSC additional exemptions for BC-based issuers
- Alberta: ASC Blanket Order 45-517; Alberta-specific accredited investor modifications
- Quebec: AMF Regulation 45-106 respecting Prospectus Exemptions; French language requirements for Quebec-resident subscribers; Civil Code warranty framework

**SCHEDULES:**
- Schedule A: Accredited Investor Certificate (with all 15 categories as checkboxes)
- Schedule B: Risk Factors (minimum 15 company-specific and general risk factors)
- Schedule C: Closing Documents Checklist
- Schedule D: Form of Joinder Agreement

Target length: 15-25 pages
`,

  "Investors' Rights Agreement": `
BASE DRAFTING CONTEXT — INVESTORS' RIGHTS AGREEMENT (IRA):

This is the most comprehensive post-closing investor protection document on the Ruby Law platform. Draft a complete, production-ready IRA compliant with Canadian federal and provincial securities law, CBCA corporate governance, and CSA national instruments.

=== DOCUMENT STRUCTURE ===
The IRA must contain these Articles in order:

ARTICLE I — INTERPRETATION AND DEFINITIONS
- Define: Affiliate (per NI 45-106 or CBCA s.2(1)), Business Day (Ontario-based), Control Person (>20% per NI 62-104), Person, Securities, Major Investor (threshold-based), Registrable Securities
- Extended meanings: gender-neutral, singular/plural, statutory references include amendments
- Currency: CAD default, dual currency for cross-border
- Business day adjustment for non-business day deadlines
- If PIPE transaction: add Subscription Agreement, Closing Date, PIPE Transaction definitions
- If IPO-related: add Prospectus, IPO Closing, Underwriting Agreement definitions
- If convertible securities: add conversion-specific definitions

ARTICLE II — BOARD DESIGNATION RIGHTS
- Smart defaults by ownership %:
  * <5%: Observer rights only, no board seats
  * 5-10%: 0-1 nominee (suggest observer), threshold at 10%
  * 10-20%: 1 nominee, standard minority investor, audit committee participation recommended
  * 20-33%: 1-2 nominees, threshold at 20%, investor may control key committee
  * >33%: 2-3 nominees proportional, NI 62-104 implications
- Board size covenant options: Fixed size, Min/Max range, or No covenant (issuer-friendly)
- Nomination procedures: Standard (30-60 day advance notice) or Enhanced (with board qualification review)
- Replacement rights: Automatic replacement or replacement with board approval (not unreasonably withheld)
- Director compensation: Same as other directors, waiver option, D&O insurance coverage
- Observer rights variants: Full (all meetings + materials), Limited (regular meetings only), or with Confidentiality undertaking
- Committee rights: Membership right or Observer right on Audit, Compensation, Governance committees
- CBCA s.105(3): Verify 25% Canadian residency requirement for all nominees
- CBCA s.109: Board designation compatible with shareholder voting rules

ARTICLE III — PRE-EMPTIVE (ANTI-DILUTION) RIGHTS
- Grant: Right to participate in future issuances to maintain proportional ownership
- Variants: Standard pro-rata, Threshold-based (lapses below specified %), Super pre-emptive (can increase beyond pro-rata)
- Calculation basis options:
  * Non-Diluted: shares / (existing + new shares) — simpler, earlier-stage
  * As-Converted: includes all convertible securities — later-stage
  * Fully-Diluted: includes all options, warrants, convertibles — most comprehensive
- Issuance notice: 10-30 business days (default 15), with pricing, terms, and purpose
- Exercise period: 10-20 business days (default 10, must be ≤ notice period)
- Standard exceptions (auto-include): Employee/Director incentive plans, DRIP, M&A securities, conversion of existing convertibles
- Optional exceptions: Debt financing, ATM (at-the-market) offerings
- No Rights as Holder clause: pre-emptive rights don't make investor a shareholder of new issuance until exercise

ARTICLE IV — REGISTRATION RIGHTS
- Demand registration:
  * Include if investment ≥$5M and ownership ≥10%; suggest if ≥$2M
  * Number of demands: 1-5 (default 2)
  * Minimum value threshold: default $2M CAD
  * Ownership threshold: default 10%
  * Blackout period: 0-180 days between registrations
  * Company right to defer: up to 120-180 days per fiscal year
- Piggyback registration:
  * Included by default if demand included
  * Priority options: Investor Priority, Pro-Rata (standard), Underwriter Discretion
  * Cutback provisions with proportional allocation
- Shelf registration:
  * Include if investment ≥$3M and ownership ≥10%
  * Shelf period: 12-36 months (default 25 months per NI 44-102)
  * Takedown rights from existing shelf
- Registration procedures: Company responsibility for prospectus preparation, comfort letters, legal opinions
- Expense allocation: Company Pays All (standard/investor-friendly), 50/50, or Holder Pays
- Lock-up: 30-180 days post-registration (default 90-180)
- Underwriter selection: Company selects, Mutual agreement, or Holder selects if >50% registered
- Indemnification: Standard mutual (company indemnifies holder, holder indemnifies company for holder-specific misstatements)
- Most Favored Nation: if superior registration rights granted to later investor, prior investors get same
- NI 44-101 (short form prospectus): 12+ months reporting history required
- NI 44-102 (shelf distributions): continuous offering eligibility

ARTICLE V — STANDSTILL COVENANT
- Include if ownership >20% or control person status
- Restricted activities: acquiring beyond ownership cap, unsolicited take-over bids, proxy solicitation, calling special meetings, proposing nominees outside Article II, public advocacy, joining shareholder groups
- Ownership cap: initial ownership + 2-3% buffer
- Term: 12-60 months (default 36)
- Termination triggers: expiry, change of control (>50%), material breach (30-day cure), mutual consent
- Exceptions (negotiation-heavy):
  * Fiduciary Out (default on): board may approve third-party transactions
  * Competing Bid Response (default on): investor can compete if third-party unsolicited bid
  * Private Discussions (default on): confidential board communications not restricted
- NI 62-104: take-over bid trigger at 20%
- NI 62-103: early warning reporting at 10% and each additional 2%

ARTICLE VI — ADDITIONAL PROVISIONS (OPTIONAL)
- Information rights: quarterly financials (45 days), annual audited (90 days), MD&A, material event notice (10 days), cap table. Threshold: 5% ownership to maintain rights.
- Governance veto rights (advanced — routes to lawyer review): new share classes, material acquisitions (>20% assets), related party transactions, auditor changes, article amendments
- Transfer restrictions: ROFR (company first, then investor), tag-along, drag-along, permitted transferees (affiliates, family, trusts)
- Confidentiality: mutual covenant with carve-outs for advisors, legal requirements, securities compliance
- Non-compete/non-solicit: investor and director nominees (rare, discuss with lawyer)

ARTICLE VII — GENERAL PROVISIONS
- Governing law: Ontario (default), BC, Alberta, Quebec, or other province. Quebec requires Civil Code framework, different remedies.
- Dispute resolution: Ontario Superior Court (default), or arbitration (AAA/ADRIC), or mediation-then-arbitration
- Termination: ownership threshold (if below specified %), mutual consent, completion of IPO, change of control
- Notice: registered mail or courier (default), or email-only
- Amendment: mutual written consent
- Assignment: with consent, or automatic to affiliates
- Counterparts: electronic (default) or wet ink
- Time of essence, further assurances, injunctive relief, no third-party beneficiaries (or with affiliate beneficiaries), entire agreement, severability

=== REGULATORY COMPLIANCE ===
- NI 45-106: Affiliate and control person definitions, prospectus exemption verification
- NI 51-102: Continuous disclosure obligations, insider reporting
- NI 62-104: Take-over bid thresholds (20%), defensive tactics
- NI 62-103: Early warning at 10%, each additional 2%
- NI 44-101/44-102: Short form prospectus and shelf distribution eligibility
- NI 55-104: Insider reporting for officers, directors, 10%+ holders
- CBCA s.2(1) (Affiliate), s.102(1) (board), s.105(3) (Canadian residency), s.109 (director election), s.137 (shareholder proposals), s.143 (proxy), s.190 (arrangements)
- Provincial variations: OSA (Ontario), BCSA (BC), ASA (Alberta), QSA (Quebec) for control person thresholds, insider reporting, dispute resolution

=== FORMATTING ===
- Use proper legal document formatting with ARTICLE headings (Roman numerals), Section numbers, subsections
- Include recitals (WHEREAS the Company has issued securities..., WHEREAS the Holder holds approximately X% of outstanding shares...)
- Target length: 25-40 pages depending on complexity
- Include signature blocks for all parties with witness lines
- Include Schedule A (Definitions), Schedule B (Registration Procedures), if applicable
`,

  "Voting Agreement": `
BASE DRAFTING CONTEXT — VOTING AGREEMENT:

Draft a comprehensive voting agreement governing how shareholders exercise voting rights, structured with clause variants, risk levels, cross-clause dependencies, and regulatory hooks following three-document principles.

=== DOCUMENT STRUCTURE ===

**ARTICLE I — INTERPRETATION AND DEFINITIONS**
- Define: Common Shares, Preferred Shares (each series), Voting Shares, Transfer, Founder, Investor, Key Holder, Qualified IPO, Change of Control, Board Designee, Independent Director
- "Shares" includes all shares now owned or hereafter acquired, including on conversion or exercise
- Statutory references: CBCA, applicable provincial business corporations act

**ARTICLE II — BOARD COMPOSITION AND DESIGNATION RIGHTS**
Board composition matrix with seat allocation by share class:
- Founder Common designees:
  * Seed Stage: 2 seats (designated by holders of majority of Founder Common)
  * Series A: 2 seats (designated by holders of majority of Founder Common)
  * Series B+: 2 seats (designated by holders of majority of Founder Common, subject to maintaining minimum [10-15]% ownership)
- Series Seed Preferred designee:
  * 0-1 seat (designated by holders of majority of Series Seed Preferred)
  * Seat lapses if Series Seed is less than [5]% of fully-diluted capitalization
- Series A Preferred designee:
  * 1 seat (designated by lead Series A investor OR holders of majority of Series A Preferred)
  * Additional seat if Series A investors hold >25% of fully-diluted
- Series B+ Preferred designees:
  * 1-2 seats (designated by holders of majority of applicable preferred class)
  * Lead investor designation right vs. class vote — specify which applies
- Mutual Independent Director:
  * 1 seat (designated by mutual agreement of Founder designees and Investor designees, or by majority of board if no agreement within 60 days)
  * Qualification: not an employee, officer, consultant, or affiliate of company or any investor; no material business relationship; meets TSX/CSE independence standards
  * Compensation: same as other non-employee directors; D&O insurance coverage required
- Board size: [3-7] directors total; no change to board size without approval of holders of majority of each of Common and Preferred (voting as separate classes)
- CBCA s.105(3) compliance: at least 25% of directors must be resident Canadians; board composition must be structured to satisfy this requirement

**ARTICLE III — VOTING COMMITMENTS**
- Irrevocable commitment: each shareholder agrees to vote ALL shares (now owned or hereafter acquired) in favor of the board designees nominated under Article II at every annual or special meeting, and in every written consent
- Voting applies to: annual elections, filling vacancies, removal and replacement of directors
- Removal: a designee may only be removed by the party/class that designated them; all shareholders agree to vote for removal if requested by the designating party
- Vacancy: if a designee seat becomes vacant, the designating party has 30 days to nominate a replacement; all shareholders vote to appoint replacement at next meeting or by written consent
- No cumulative voting: shareholders waive any right to cumulative voting to the extent permitted by law

**ARTICLE IV — DRAG-ALONG VOTING MECHANICS**
- Threshold: drag-along triggered by approval of holders of:
  * [60-75]% of outstanding Preferred Shares (voting as a single class on as-converted basis), PLUS
  * Majority of outstanding Common Shares (excluding shares held by investors)
  * [RISK LEVEL: LOW = 75% threshold; MEDIUM = 66.67%; HIGH = 60%]
- Pricing protections:
  * Minimum per-share price: not less than [1x-3x] the original issue price of the most senior Preferred class (adjusted for stock splits, dividends, recapitalizations)
  * [RISK LEVEL: LOW = 1x minimum; MEDIUM = 1.5x; HIGH = 3x or market-based floor]
- Procedural requirements:
  * Written notice to all shareholders at least [20-30] business days before proposed closing
  * Notice must include: identity of acquirer, per-share consideration (by class), form of consideration (cash/shares/mixed), material terms and conditions, expected closing date, copies of definitive agreements
  * Each dragged shareholder must execute all transaction documents, provide customary representations (title, authority, no conflicts), and deliver shares free of encumbrances
  * Consideration: each shareholder receives same form and per-share amount as the initiating holders (adjusted for liquidation preferences per restated articles)
  * Escrow/holdback: dragged shareholders participate pro-rata in any escrow, holdback, or earnout on same terms as initiating holders
  * Expense allocation: transaction expenses allocated pro-rata to all shareholders based on consideration received

**ARTICLE V — PROTECTIVE PROVISION VOTING**
Specific matters requiring separate class vote of holders of majority of Preferred Shares (voting as a single class):
  1. Amend, alter, or repeal any provision of articles or bylaws in manner that adversely affects rights, preferences, or privileges of Preferred
  2. Create or authorize any new class or series of shares having rights, preferences, or privileges senior to or on parity with any existing Preferred class
  3. Increase or decrease the authorized number of shares of any class or series
  4. Reclassify any outstanding shares into shares having rights, preferences, or privileges senior to Preferred
  5. Declare or pay any dividend or make any distribution on any shares (other than dividends on Preferred required by articles)
  6. Redeem, repurchase, or acquire any shares (except repurchases from employees/consultants at cost or FMV upon termination)
  7. Approve any liquidation, dissolution, or winding up of the company
  8. Approve any merger, amalgamation, arrangement, or sale of all or substantially all assets
  9. Incur or guarantee indebtedness exceeding $[250,000-500,000] in aggregate
  10. Increase ESOP pool beyond [X]% of fully-diluted shares
  11. Enter into or modify any related party transaction exceeding $[25,000-50,000]
  12. Change the company's principal line of business
  13. Hire or terminate the CEO or change CEO compensation by more than [10-20]%
  14. Approve annual budget or deviate from approved budget by more than [10-15]%
  15. Create any subsidiary or make any investment exceeding $[100,000]
  16. Change auditors
- [CUSTOMIZABILITY: Items 1-8 = NO (always included); Items 9-16 = YES (negotiable)]

Specific matters requiring separate class vote of holders of majority of Common Shares:
  1. Any amendment that adversely affects Common Share rights
  2. Any increase to the ESOP pool (dilutes Common disproportionately)
  3. Any conversion of Preferred to Common on terms other than stated in articles

**ARTICLE VI — PROXY PROVISIONS**
- Irrevocable proxy: if any shareholder fails to vote shares in accordance with this agreement at any meeting or by written consent, each such shareholder hereby grants to the company's Corporate Secretary (or designee) an IRREVOCABLE PROXY coupled with an interest to vote such shares in accordance with the terms of this agreement
- Proxy coupled with interest: this proxy is coupled with an interest sufficient in law to support an irrevocable power and shall not be terminated by any act of the shareholder, by lack of authority, or by occurrence of any other event (including death, incapacity, insolvency, or dissolution)
- Duration: proxy continues for so long as this agreement remains in effect
- Priority: this proxy supersedes any other proxy granted by the shareholder with respect to the matters covered by this agreement
- CBCA s.148 compliance: proxy must be in writing, signed by shareholder or authorized attorney, deposited with company

**ARTICLE VII — WRITTEN CONSENT IN LIEU OF MEETING**
- CBCA s.142: shareholders may act by written resolution in lieu of meeting; resolution must be signed by ALL shareholders entitled to vote (not merely majority, unless articles provide otherwise)
- Procedure: company circulates written consent to all shareholders; each shareholder agrees to sign and return within [10] business days of receipt
- Counterparts: written consent may be executed in counterparts, including electronic signatures per CBCA s.252.1
- Effective date: written consent effective when last required signature obtained, or on date specified in consent if later
- Record-keeping: company must file written consent with minutes of shareholder meetings per CBCA s.142(2)

**ARTICLE VIII — SPOUSAL/DOMESTIC PARTNER CONSENT**
- Requirement: each individual shareholder must deliver, concurrently with execution of this agreement, a spousal/domestic partner consent in the form attached as Schedule A
- Consent covers: the spouse/partner acknowledges the voting agreement, agrees to be bound by transfer and voting provisions, waives any community property or family law claims that could interfere with the agreement
- Provincial family law variations:
  * Ontario: Family Law Act s.4-6 (equalization of net family property); consent confirms shares not "family property" subject to equalization absent court order
  * BC: Family Law Act s.84-85 (family property division); consent acknowledges shares subject to agreement restrictions
  * Alberta: Matrimonial Property Act s.7 (distribution of matrimonial property); consent required for interspousal immunity
  * Quebec: Civil Code arts. 414-426 (family patrimony); particular attention to partnership of acquests regime — shares may be family patrimony
- Subsequent marriage/partnership: shareholder must deliver spousal consent within 30 days of marriage or commencement of qualifying relationship
- Failure to deliver: company may withhold registration of any transfer and exclude shareholder from distributions until consent received

**ARTICLE IX — TERMINATION**
This agreement terminates upon the earliest of:
  (a) Completion of a Qualified IPO (listing on TSX, CSE, NYSE, NASDAQ, or equivalent recognized exchange with gross proceeds exceeding $[X])
  (b) Closing of a Change of Control transaction (merger, amalgamation, arrangement, or sale of all/substantially all assets approved by requisite holders)
  (c) Written consent of: (i) holders of majority of outstanding Preferred Shares (voting as single class on as-converted basis), AND (ii) holders of majority of outstanding Common Shares, AND (iii) the company (acting through its board)
  (d) Dissolution or winding up of the company
  (e) The date that is [5-10] years from the date of this agreement, unless renewed by written consent of all parties
- Survival: Sections [confidentiality, indemnification, governing law, dispute resolution] survive termination

**ARTICLE X — ENFORCEMENT AND REMEDIES**
- Specific performance: each party acknowledges that monetary damages would be inadequate for breach of voting obligations; the non-breaching parties are entitled to specific performance, injunctive relief, and other equitable remedies WITHOUT proof of actual damages and WITHOUT requirement of posting bond
- CBCA s.145.1: this agreement constitutes a valid pooling agreement under CBCA s.145.1 — shares subject to this agreement are "pooled" for voting purposes as contemplated by the Act
- Cumulative remedies: specific performance is in addition to (not in lieu of) any other remedies available at law or equity
- Costs: prevailing party in any enforcement action entitled to reasonable legal costs
- No waiver: failure to enforce any provision does not waive right to enforce subsequently

**CROSS-DOCUMENT DEPENDENCIES:**
- Board composition must match -> Term Sheet governance section, IRA board designation rights (Article II)
- Protective provisions must mirror -> IRA negative covenants, Restated Articles preferred share rights
- Drag-along terms must coordinate with -> ROFR/Co-Sale Agreement (drag-along, if included there), SHA drag-along
- Termination triggers must align across -> Voting Agreement, IRA, ROFR/Co-Sale, Founders' Lock-Up
- Proxy provisions must not conflict with -> CBCA proxy solicitation rules (s.148-150)

**CONFLICTS / MUTUAL EXCLUSIVITY:**
- Drag-along in Voting Agreement vs. drag-along in ROFR/Co-Sale: if BOTH included, must specify which takes precedence (typically Voting Agreement governs shareholder vote, ROFR/Co-Sale governs share transfer mechanics)
- Protective provisions here vs. IRA negative covenants: if BOTH included, specify that the more restrictive provision governs and that compliance with both is required

**REGULATORY HOOKS:**
- CBCA s.142 (written consent in lieu of meeting)
- CBCA s.145.1 (pooling agreements / voting trusts)
- CBCA s.148-150 (proxy requirements)
- CBCA s.105(3) (25% Canadian resident director requirement)
- CBCA s.109 (election of directors)
- CBCA s.2(1) (affiliate definition for permitted transferee analysis)
- CBCA s.102(1) (directors manage corporation; agreement must not improperly fetter discretion)
- CBCA s.122 (director fiduciary duties; fiduciary carve-out required for director-shareholders)
- CBCA s.137 (shareholder proposals; agreement must not prevent exercise)
- CBCA s.143 (shareholder meeting requirements for fundamental transactions)
- CBCA s.146 (USA — if agreement restricts ALL directors' powers, shifts fiduciary duties to shareholders)
- CBCA s.190 (dissent rights on fundamental changes; address interaction with voting commitment)
- CBCA s.192 (plans of arrangement; 66⅔% threshold; court approval)
- NI 62-104 (take-over bid implications if drag-along involves >20% acquisition; 105-day deposit period; 50%+1 minimum tender; hard lock-up conversion to cash alternative per s.2.38)
- MI 61-101 (minority protection for related party transactions, business combinations, insider bids; formal valuation + majority-of-minority approval; SAFE HARBOUR: voting agreement alone does NOT constitute joint actor status)
- NI 62-103 (early warning system; >10% reporting issuer or >5% non-reporting triggers disclosure; news release next business day; report within 2 business days)

**PROVINCIAL VARIATIONS:**
- Ontario: OBCA s.108 (shareholder agreements); s.182 (arrangement); Family Law Act spousal consent; OSC strictest joint actor analysis; CSA Staff Notice 61-301 guidance
- BC: BCBCA s.128 (unanimous shareholder agreements); s.291 (arrangement); Family Law Act s.84-85; substantive fairness test; broad dissent rights
- Alberta: ABCA s.140 (unanimous shareholder agreements); s.193 (arrangement); Matrimonial Property Act; moderate joint actor standard; ASC exemptive relief available
- Quebec: Civil Code arts. 414-426 (family patrimony); QCA s.123.91 (shareholder agreements); s.208 (arrangement); French language MANDATORY per Bill 96; AMF review; Superior Court approval; Civil Code arts. 322-329 director liability overlay

**REGULATORY THREE-PILLAR SYSTEM:**
This voting agreement must be processed through three regulatory pillars in sequence:

Pillar 1 — VALIDATION (15 rules, RULE-VA-001 to RULE-VA-015):
Apply jurisdiction validation (CRITICAL), share count verification (CRITICAL), control person detection (>10%), joint actor risk assessment (6-factor weighted test scoring 0-100), MI 61-101 applicability check, NI 62-103 early warning trigger detection, NI 62-104 take-over bid threshold check (CRITICAL if >20%), Quebec bilingual check (CRITICAL for QCA), fiduciary carve-out check for director/officer signatories, exchange approval check (TSX Part IV, TSXV Policy 5.2/5.3, CSE Rules 6.1-6.3, NEO Rule Book Part 6), and hard vs. soft lock-up distinction.

Pillar 2 — INJECTION (10 rules, INJ-VA-001 to INJ-VA-010):
Auto-inject regulatory clauses based on validation triggers: Quebec bilingual provisions, controlling shareholder governance, D&O fiduciary carve-out (Revlon duty, Superior Proposal), early warning disclosure, MI 61-101 formal valuation and minority approval, take-over bid lock-up conversion, hard lock-up provisions, reciprocal voting for merger of equals, multi-shareholder consolidation schedule, exchange-specific language.

Pillar 3 — ROUTING (8 routes, ROUTE-VA-001 to ROUTE-VA-008):
Standard (3-5 days), Controlling Shareholder (10-15 days, fairness opinion), Take-Over Bid (4-6 months, securities commission), Merger of Equals (3-4 months, dual fairness opinions), Quebec (8-12 weeks, AMF + Superior Court), Multi-Shareholder (2-3 weeks, batch), Joint Actor Escalation (6-12 weeks, exemptive relief), MI 61-101 Formal Valuation (12-16 weeks, independent valuator).

**CLAUSE LIBRARY (89 clauses, VA-XX-NNN format, 11 sections):**
VA-01 Definitions (10 clauses) | VA-02 Board Composition (5 clauses) | VA-03 Voting Commitments (3 clauses) | VA-04 Proxy & Enforcement (5 clauses) | VA-05 Protective Provisions (25 consent matters — 8 non-negotiable, 17 negotiable) | VA-06 Transfer Restrictions (8 clauses) | VA-07 Termination (8 clauses) | VA-08 Information & Disclosure (5 clauses) | VA-09 Non-Solicitation (3 tiers by shareholder capacity) | VA-10 General Provisions (10 clauses) | VA-11 Remedies (5 clauses)

**JOINT ACTOR ANALYSIS ENGINE:**
When multiple signatories exist, apply the 6-factor weighted risk assessment:
Factor 1 (HIGH): Collateral economic benefits = joint actor PRESUMED
Factor 2 (HIGH): Active bid participation = joint actor
Factor 3 (MEDIUM): MNPI sharing = presumption of joint actor
Factor 4 (MEDIUM): Director coordination = joint actor; heightened fiduciary scrutiny
Factor 5 (HIGH): Affiliation documentation = joint actor AUTOMATIC
Factor 6 (LOW — safe harbour): Voting agreement alone = NO joint actor presumption; MI 61-101 exemptions available

**STOCK EXCHANGE GOVERNANCE:**
- TSX: >20% control triggers Part IV; independent director approval; fairness opinion; public circular; majority-of-minority vote
- TSXV: >20% control or director transaction >$100K; sponsor review; disinterested shareholder vote
- CSE: >20% control, board seat, or veto rights; substance-based assessment
- NEO: >20% control; pre-approval recommended; board independence assessment

**COMPLEXITY CLASSIFICATION:**
- Tier 1 (Simple): Single shareholder, plan of arrangement, no control shift, <$10M. 12-18 pages.
- Tier 2 (Standard): 2-5 shareholders, exchange-listed, $10M-100M. 18-25 pages.
- Tier 3 (Complex): >5 shareholders, MI 61-101 triggered, >$100M. 25-40 pages.

Target length: 12-18 pages (Tier 1) to 25-40 pages (Tier 3)
`,

  "Right of First Refusal and Co-Sale Agreement": `
BASE DRAFTING CONTEXT — ROFR AND CO-SALE AGREEMENT:

Draft a comprehensive transfer restriction agreement with clause variants, risk levels, cross-clause dependencies, and regulatory hooks following three-document principles.

=== DOCUMENT STRUCTURE ===

**ARTICLE I — INTERPRETATION AND DEFINITIONS**
- Define: Transfer (broadly — any sale, assignment, pledge, hypothecation, encumbrance, or other disposition, whether voluntary, involuntary, or by operation of law), Proposed Transfer, Transfer Notice, Proposed Transferee, Key Holder (founders and other restricted shareholders), Investor, Company, Shares (all classes), ROFR Exercise Period, Co-Sale Pro-Rata Portion, Permitted Transfer, Permitted Transferee, Joinder Agreement
- "Transfer" expressly includes: sale, gift, bequest, pledge, hypothecation, assignment, grant of security interest, transfer by operation of law (bankruptcy, death, divorce), and any agreement to do any of the foregoing

**ARTICLE II — TRANSFER NOTICE AND ROFR PROCESS**
Transfer Notice Requirements:
- Seller (Key Holder proposing transfer) must provide written notice ("Transfer Notice") to the Company and all Investors at least [30] days before any proposed transfer
- Transfer Notice must include ALL material terms:
  * Identity of proposed purchaser (name, address, relationship to seller if any)
  * Number and class of shares proposed to be transferred
  * Proposed price per share and aggregate consideration
  * Form of consideration (cash, securities, property — if non-cash, include independent valuation)
  * All other material terms and conditions of the proposed transfer
  * Expected closing date and timeline
  * Copy of bona fide written offer or term sheet from proposed purchaser
  * Representations that the terms represent a bona fide arm's length offer (or disclosure of non-arm's length relationship)

Company ROFR (First Priority):
- Exercise period: [15-30] business days from receipt of Transfer Notice [RISK LEVEL: LOW = 30 days; MEDIUM = 20 days; HIGH = 15 days]
- Company has right to purchase ALL or any PORTION of the shares proposed for transfer, at the same price and on the same terms as set out in the Transfer Notice
- If consideration is non-cash: Company may substitute cash payment equal to the fair market value of the non-cash consideration (determined by independent appraiser if parties disagree)
- Exercise by written notice to Seller specifying number of shares to be purchased
- Closing: within [30] business days of exercise notice
- Partial exercise: if Company exercises for less than all shares, remaining shares proceed to Investor ROFR

Investor ROFR (Second Priority):
- Triggered only if Company does not exercise ROFR for ALL shares in the Transfer Notice
- Exercise period: [15] business days from notice that Company has declined or partially exercised
- Each Investor may purchase its pro-rata share of the remaining shares (pro-rata = Investor's shares / total Investor shares)
- Over-allotment: if any Investor does not fully exercise, non-exercising Investor's allocation redistributed to exercising Investors pro-rata, for additional [5] business days
- Exercise by written notice to Company and Seller
- Closing: within [30] business days of final exercise notice

**ARTICLE III — CO-SALE / TAG-ALONG RIGHTS**
- Trigger: if neither Company nor Investors fully exercise ROFR rights under Article II, and Seller proceeds with proposed transfer to third-party purchaser
- Co-sale calculation: each Investor may sell up to its Co-Sale Pro-Rata Portion on the same terms as Seller
  * Formula: Co-Sale Pro-Rata Portion = (Investor's Shares / total Key Holder Shares) x number of shares proposed for transfer by Seller
  * "Key Holder Shares" includes all shares held by ALL Key Holders (not just the selling Key Holder)
- Seller's obligation: Seller must reduce the number of shares it sells to accommodate Investor co-sale rights; if Proposed Transferee unwilling to purchase both Seller and Investor shares, Seller may not proceed with transfer
- Exercise: Investor delivers written co-sale election within [15] business days of notice that ROFR not fully exercised
- Mechanics: Investor delivers share certificates (with executed transfer documents) to Seller; Seller arranges for closing with Proposed Transferee; consideration for Investor shares delivered directly to Investor
- Consideration: Investor receives same per-share price and form of consideration as Seller; if mixed consideration, allocated pro-rata
- Non-exercise: failure to exercise co-sale right for any particular transfer does not waive right for future transfers

**ARTICLE IV — RIGHT OF FIRST OFFER (ALTERNATIVE TO ROFR — INCLUDE IF SPECIFIED)**
[CUSTOMIZABILITY: YES — include ROFO as alternative to ROFR if parties prefer]
- Seller must first offer shares to Company and Investors BEFORE soliciting third-party offers
- Offer notice: Seller provides written notice of intention to sell, specifying number and class of shares, desired price range, and other material terms
- Company exercise period: [20] business days to make a binding offer to purchase
- Investor exercise period: [15] business days after Company exercise period expires (if Company declines)
- If no exercise: Seller may solicit third-party offers for [90] days, but may not sell at price more than [10-15]% below the price offered to Company/Investors
- ROFO vs ROFR: ROFO is MUTUALLY EXCLUSIVE with ROFR — do not include both for the same class of transfers

**ARTICLE V — PROHIBITED AND PERMITTED TRANSFERS**
Prohibited Transfers:
- ANY transfer not made in compliance with this agreement is VOID AB INITIO
- Company must refuse to register any non-compliant transfer on its books
- Company must instruct its transfer agent to refuse to effect any non-compliant transfer
- Transferee of a prohibited transfer acquires NO rights in the shares and is not recognized as a shareholder

Permitted Transfers (exempt from ROFR and co-sale process):
- To Affiliates: transfer to entity controlled by, controlling, or under common control with transferor (CBCA s.2(1) definition of affiliate) — with executed Joinder Agreement
- To Family Trusts: transfer to trust established solely for benefit of transferor's spouse, children, or other dependants, for estate planning purposes — with executed Joinder Agreement and evidence of trust terms
- To Charitable Organizations: transfer to registered charity (Income Tax Act definition) of not more than [1-5]% of transferor's holdings — with executed Joinder Agreement
- To Other Existing Shareholders: transfer to another party to this agreement — with written notice to Company and all parties
- Estate transfers: transfer by will or intestacy upon death — transferee/estate must execute Joinder Agreement within [30] days of probate
- Court-ordered transfers: transfer pursuant to court order in divorce or family law proceedings — subject to Article VIII (spousal consent provisions), transferee must execute Joinder Agreement

Notice of Permitted Transfer:
- Transferor must provide [10] business days advance written notice to Company and all Investors before any Permitted Transfer
- Notice must include: identity of transferee, relationship establishing permitted status (with evidence), number and class of shares, executed Joinder Agreement
- Company may require legal opinion that transfer qualifies as Permitted Transfer

**ARTICLE VI — JOINDER REQUIREMENTS**
- ALL transferees (including Permitted Transferees) must execute a Joinder Agreement in the form attached as Schedule A
- Joinder Agreement binds transferee to: this ROFR/Co-Sale Agreement, the Voting Agreement, the Shareholders' Agreement (if applicable), and any other ancillary agreements
- Transfer not effective until Joinder Agreement executed and delivered to Company
- Company may refuse to update shareholder register until Joinder Agreement received

**ARTICLE VII — DRAG-ALONG (IF INCLUDED IN THIS AGREEMENT)**
[CUSTOMIZABILITY: YES — drag-along may be in Voting Agreement instead; if in BOTH, specify precedence]
- Threshold: holders of [60-75]% of outstanding Preferred (on as-converted basis) + majority of Common (excluding Investor-held Common) may compel all shareholders to transfer shares to an acquirer
- Pricing protection: aggregate consideration must imply per-share value of not less than [1x] original issue price of most senior Preferred class
- Procedural requirements: [20-30] business days written notice with all material terms, copy of definitive agreement, identity of acquirer
- Dragged shareholder obligations: execute all transaction documents, provide standard transfer representations (title, authority, no liens), deliver shares at closing, participate pro-rata in escrow/holdback/indemnity
- Consideration allocation: per waterfall in Restated Articles (liquidation preference priority, then pro-rata)
- [CROSS-CLAUSE CONFLICT: if drag-along also in Voting Agreement, this Article governs share transfer mechanics; Voting Agreement Article IV governs shareholder vote mechanics]

**ARTICLE VIII — LOCK-UP COORDINATION**
- Key Holders subject to Founders' Lock-Up Agreement: ROFR process does not apply during lock-up period (Founders' Lock-Up Agreement controls during its term)
- Upon expiry/release of lock-up: this ROFR/Co-Sale Agreement applies to all subsequent transfers
- Employment agreement vesting: if Key Holder's shares are subject to vesting under employment agreement, only VESTED shares may be transferred (unvested shares subject to company repurchase right under employment agreement, not ROFR process)
- Coordination clause: in event of conflict between this agreement, Founders' Lock-Up Agreement, and employment agreement vesting provisions, the most restrictive provision governs

**ARTICLE IX — LEGEND AND TRANSFER AGENT INSTRUCTIONS**
- Legend: all share certificates (or DRS statements) must bear the following legend: "THE SHARES REPRESENTED BY THIS CERTIFICATE ARE SUBJECT TO A RIGHT OF FIRST REFUSAL AND CO-SALE AGREEMENT DATED [DATE]. ANY TRANSFER OR ATTEMPTED TRANSFER IN VIOLATION OF SUCH AGREEMENT SHALL BE VOID. A COPY OF THE AGREEMENT IS ON FILE AT THE REGISTERED OFFICE OF THE COMPANY."
- Transfer agent: Company must instruct transfer agent to refuse to register any transfer unless Company confirms compliance with this agreement
- Legend removal: upon termination of this agreement, Company must promptly instruct transfer agent to remove legend and remove transfer restrictions

**ARTICLE X — TERMINATION**
This agreement terminates upon the earliest of:
  (a) Completion of a Qualified IPO
  (b) Closing of a Change of Control transaction (approved under drag-along or otherwise)
  (c) Written consent of: Company, holders of majority of Preferred (on as-converted basis), and holders of majority of Key Holder Shares
  (d) Dissolution or winding up of the company
- Survival: confidentiality, indemnification, governing law, and dispute resolution provisions survive termination

**ARTICLE XI — GENERAL PROVISIONS**
- Governing law: Province of [Ontario/BC/Alberta/Quebec] and federal laws of Canada applicable therein
- Dispute resolution: [courts of competent jurisdiction / arbitration under ADRIC rules]
- Specific performance: parties entitled to injunctive relief and specific performance for breach, without proof of actual damages or bond
- Remedies cumulative: all remedies in addition to any other remedies available at law or equity
- Notices: to addresses set out in Schedule B, by registered mail, courier, or email (with confirmation)
- Amendment: written consent of Company + holders of majority of Preferred (on as-converted basis) + holders of majority of Key Holder Shares
- Severability, entire agreement, further assurances, counterparts (including electronic)

**CROSS-DOCUMENT DEPENDENCIES:**
- ROFR pricing must be consistent with -> Transfer provisions in SHA, valuation methodology in Buy-Sell provisions
- Co-sale pro-rata calculation must use same share counting methodology as -> IRA pre-emptive rights, Voting Agreement
- Drag-along (if included) must coordinate with -> Voting Agreement drag-along, Restated Articles liquidation waterfall
- Permitted transferee definition must align with -> CBCA s.2(1) affiliate definition used in IRA
- Lock-up coordination must reference -> Founders' Lock-Up Agreement specific dates and tranches
- Joinder requirements must cover ALL ancillary agreements -> Voting Agreement, IRA, SHA

**REGULATORY HOOKS:**
- Securities Transfer Act (Ontario) s.67-85: governs enforceability of transfer restrictions on securities; restrictions must be noted on certificate or in issuer's records to be effective against transferee
- CBCA s.174: restrictions on transfer of shares must be set out in articles; this agreement supplements (does not replace) article restrictions
- CBCA s.49(8): company may refuse to register transfer if transfer would result in violation of agreement
- NI 45-102 s.2.5: hold period restrictions apply IN ADDITION to this agreement's transfer restrictions — shares subject to hold period cannot be transferred even through ROFR process unless an exemption applies
- NI 45-106 s.2.3/2.5: any transferee acquiring shares must independently qualify for a prospectus exemption

**PROVINCIAL VARIATIONS:**
- Ontario: Securities Transfer Act, 2006 (Ontario) governs priority of security interests; OBCA s.56 transfer restrictions
- BC: Securities Transfer Act (BC) equivalent provisions; BCBCA s.120 transfer restrictions in articles
- Alberta: Securities Transfer Act (Alberta); ABCA s.48 transfer restrictions
- Quebec: Civil Code of Quebec arts. 1708-1784 (sale of property); QCA transfer restriction provisions; French language requirement for Quebec-resident shareholders

**SCHEDULES:**
- Schedule A: Form of Joinder Agreement
- Schedule B: Notice Addresses of All Parties
- Schedule C: Key Holder Share Ownership Table (shares subject to agreement)

Target length: 12-18 pages
`,

  "Founders' Lock-Up Agreement": `
BASE DRAFTING CONTEXT — FOUNDERS' LOCK-UP AGREEMENT:

Draft a comprehensive founder share restriction agreement with clause variants, risk levels, cross-clause dependencies, acceleration mechanics, and regulatory hooks following three-document principles.

=== DOCUMENT STRUCTURE ===

**ARTICLE I — INTERPRETATION AND DEFINITIONS**
- Define: Founder, Locked Shares (all shares held by Founder at closing, plus any shares acquired thereafter through stock splits, dividends, or conversions), Lock-Up Period, Release Date, Release Tranche, Escrow Agent, Good Leaver, Bad Leaver, Cause, Change of Control, Qualified IPO, Milestone Event, Original Issue Price, Fair Market Value
- "Locked Shares" includes: all Common Shares, any Preferred Shares held by Founder, any shares issuable on exercise of options or warrants held by Founder (on a pre-exercise basis)

**ARTICLE II — LOCK-UP STRUCTURE**
Lock-up period: commences on Closing Date and continues for [12-24] months [RISK LEVEL: LOW = 12 months; MEDIUM = 18 months; HIGH = 24 months]

Lock-up Structure Options (select ONE — MUTUALLY EXCLUSIVE):

OPTION A — Flat Lock-Up [RISK LEVEL: LOW]:
- 100% of Locked Shares restricted for full Lock-Up Period
- On Release Date: 100% of Locked Shares released simultaneously
- Simple, clean, but creates liquidity cliff
- [CUSTOMIZABILITY: YES — standard for seed-stage companies]

OPTION B — Graduated Release [RISK LEVEL: MEDIUM — RECOMMENDED]:
- Quarterly tranches over Lock-Up Period:
  * 24-month lock-up: 12.5% released every quarter (8 tranches)
  * 18-month lock-up: 16.67% released every quarter (6 tranches)
  * 12-month lock-up: 25% released every quarter (4 tranches)
- Alternative: semi-annual tranches (25% every 6 months over 24 months, or 50% every 6 months over 12 months)
- Each tranche released automatically on the applicable Release Date without further action required
- [CUSTOMIZABILITY: YES — tranche size and frequency negotiable]

OPTION C — Milestone-Based Release [RISK LEVEL: HIGH]:
- Release tied to company performance milestones:
  * Revenue milestones: [25]% released on achieving $[X] ARR, additional [25]% on $[Y] ARR
  * User/customer milestones: [25]% released on achieving [X] active users/customers
  * Funding milestones: [25]% released on closing of Series [A/B] financing of at least $[X]
- If milestone not achieved by longstop date ([36] months from closing): board determines whether to release or extend, in consultation with lead investor
- Milestone certification: CEO and CFO (or board) certify achievement of milestone; investor has [15] business days to object
- [CUSTOMIZABILITY: RESTRICTED — milestones must be objective, measurable, within founder's reasonable control]

**ARTICLE III — ACCELERATION TRIGGERS**

Single-Trigger Acceleration — Qualified IPO:
- Upon completion of Qualified IPO (listing on TSX, CSE, NYSE, NASDAQ or equivalent with gross proceeds >$[X]):
  * Lock-up under this agreement TERMINATES and CONVERTS to standard IPO lock-up of [180] days from effective date of IPO prospectus
  * During IPO lock-up: founder may not sell, offer to sell, contract to sell, pledge, grant option to purchase, or otherwise dispose of shares without prior written consent of lead underwriter
  * IPO lock-up may be extended by up to [34] days if company earnings release or material news falls within [15] days of scheduled IPO lock-up expiry (per standard underwriter requirements)
- [RISK LEVEL: LOW — standard provision]

Double-Trigger Acceleration — Change of Control + Termination:
- Full acceleration of ALL remaining Locked Shares upon BOTH:
  (i) Closing of a Change of Control (merger, amalgamation, arrangement, or sale of all/substantially all assets), AND
  (ii) Founder's employment/engagement terminated by the acquirer without Cause, or Founder resigns for Good Reason, within [12-24] months following Change of Control
- "Good Reason" defined as: material diminution of title, authority, duties, or compensation; relocation of principal workplace by more than [50] km; material breach of employment agreement by acquirer
- If Change of Control occurs WITHOUT termination: lock-up continues on same terms (or adjusted terms as specified in acquisition agreement), with acquirer assuming company's obligations under this agreement
- [RISK LEVEL: MEDIUM — standard for Series A+ companies]

Death or Disability Acceleration:
- Death: [100]% immediate acceleration of all remaining Locked Shares; shares transfer to estate/beneficiary subject to Joinder Agreement; estate has [90] days to comply with Joinder requirements
- Permanent Disability (inability to perform duties for [6] consecutive months or [9] months in any [12]-month period, as certified by qualified physician):
  * Option 1: [100]% immediate acceleration [RISK LEVEL: LOW]
  * Option 2: [50]% immediate acceleration, remaining [50]% continues on original schedule [RISK LEVEL: MEDIUM]
  * Option 3: Pro-rata acceleration (locked shares released proportional to time served during Lock-Up Period) [RISK LEVEL: HIGH]
- [CUSTOMIZABILITY: YES — acceleration percentage negotiable]

Good Leaver / Bad Leaver:
- Good Leaver (voluntary resignation with [90] days notice, mutual termination, constructive dismissal, redundancy):
  * Pro-rata acceleration: Locked Shares released proportional to time served during Lock-Up Period (e.g., if 12 of 24 months served, 50% of remaining Locked Shares released)
  * Remaining Locked Shares: company has option (not obligation) to repurchase at Fair Market Value within [60] days
- Bad Leaver (termination for Cause, resignation without required notice, breach of fiduciary duty, breach of non-compete/non-solicit, conviction of criminal offense involving dishonesty):
  * NO acceleration — all remaining Locked Shares forfeited to company
  * Company repurchase right at LOWER of: (i) Original Issue Price, or (ii) Fair Market Value
  * Repurchase must be exercised within [90] days of Bad Leaver event
  * If company does not exercise repurchase, shares remain locked for remainder of original Lock-Up Period
- "Cause" defined as: (a) material breach of employment agreement, founder agreement, or fiduciary duty, unremedied after [30] days written notice; (b) conviction of indictable offense or offense involving fraud/dishonesty; (c) willful misconduct or gross negligence causing material harm to company; (d) material breach of confidentiality, non-compete, or IP assignment obligations
- [RISK LEVEL: MEDIUM for good leaver pro-rata; HIGH for bad leaver forfeiture]

**ARTICLE IV — ESCROW MECHANICS**
- Escrow agent: [company's transfer agent / independent escrow agent / company's legal counsel in trust]
- Deposit: Founder must deposit all Locked Share certificates (or DRS statements) with Escrow Agent within [5] business days of Closing
- Escrow agreement: Founder, Company, and Escrow Agent execute three-party escrow agreement in form attached as Schedule A
- Release instructions: release of shares from escrow requires JOINT written instruction from Company (signed by authorized officer) and Founder, confirming:
  (i) Applicable Release Date has occurred or acceleration trigger has been satisfied
  (ii) No breach of this agreement or any related agreement by Founder
  (iii) Number and class of shares to be released
- Escrow Agent duties: hold shares as bailee, not as trustee; no discretion to release without joint instruction; protected by standard escrow indemnification
- Voting during escrow: Founder retains all voting rights with respect to Locked Shares held in escrow (Founder votes shares per Voting Agreement)
- Dividends during escrow: any dividends or distributions on Locked Shares held in escrow are paid to Founder (or held in escrow at company's election)
- Escrow fees: paid by Company

**ARTICLE V — BREACH CONSEQUENCES**
- Forfeiture: any attempt to transfer Locked Shares in violation of this agreement results in automatic forfeiture of the shares attempted to be transferred; company has right to repurchase forfeited shares at LOWER of Original Issue Price or Fair Market Value
- Company repurchase right: if Founder breaches any material provision, company may repurchase ALL remaining Locked Shares (not just the shares involved in the breach) at LOWER of Original Issue Price or Fair Market Value
- Board seat consequences: material breach by Founder entitles holders of majority of Preferred to require Founder to resign from board; if Founder does not resign within [10] business days of written demand, Founder's board designation rights under Voting Agreement are suspended
- Clawback: if Founder receives proceeds from an unauthorized transfer, Founder must immediately remit all such proceeds to company
- Injunctive relief: company entitled to immediate injunctive relief, including TRO and preliminary injunction, without proof of actual damages or bond
- Indemnification: Founder indemnifies company for all losses, costs, and expenses (including legal fees) arising from Founder's breach

**ARTICLE VI — LEGEND REQUIREMENTS**
- Share certificates (or DRS statements) for all Locked Shares must bear the following restrictive legend:
  "THE SHARES REPRESENTED BY THIS CERTIFICATE ARE SUBJECT TO A FOUNDERS' LOCK-UP AGREEMENT DATED [DATE]. THESE SHARES MAY NOT BE SOLD, TRANSFERRED, PLEDGED, HYPOTHECATED, OR OTHERWISE DISPOSED OF EXCEPT IN ACCORDANCE WITH THE TERMS OF SUCH AGREEMENT. A COPY OF THE AGREEMENT IS ON FILE AT THE REGISTERED OFFICE OF THE COMPANY."
- Additional legend for securities law hold period (NI 45-102): standard 4-month hold period legend if applicable
- Legend removal: Company must instruct transfer agent to remove lock-up legend within [5] business days of shares being released from lock-up (securities law legend remains if hold period still running)

**ARTICLE VII — PERMITTED TRANSFERS DURING LOCK-UP**
- During Lock-Up Period, Founder may transfer Locked Shares ONLY to:
  (a) Family trusts established solely for estate planning purposes, for benefit of Founder's spouse, children, or dependants — with executed Joinder Agreement binding trust and trustee
  (b) Registered retirement savings plan (RRSP) or tax-free savings account (TFSA) of Founder — shares remain subject to lock-up within registered account
  (c) Spouse or common-law partner as part of estate planning (not divorce/separation) — with executed Joinder Agreement and spousal consent
  (d) Charitable organizations (registered under Income Tax Act) — limited to [1]% of Locked Shares per year, with [30] days advance notice
- ALL Permitted Transferees must execute Joinder Agreement binding them to: this Lock-Up Agreement, Voting Agreement, ROFR/Co-Sale Agreement, and any SHA
- Founder remains jointly and severally liable with Permitted Transferee for compliance

**ARTICLE VIII — COORDINATION PROVISIONS**
- ROFR Agreement: during Lock-Up Period, ROFR/Co-Sale Agreement transfer restrictions do NOT apply (this Lock-Up Agreement is the controlling restriction); upon lock-up release, ROFR/Co-Sale Agreement governs all subsequent transfers
- Employment agreement vesting: lock-up release schedule is INDEPENDENT of employment agreement vesting schedule; shares may be vested but still locked (lock-up is additional restriction on top of vesting)
  * Example: if Founder has 4-year vesting with 1-year cliff, AND 24-month graduated lock-up: at month 12, 25% of shares are vested AND first lock-up tranche released; at month 24, 50% of shares are vested AND all lock-up tranches released; shares continue vesting through month 48 without lock-up restriction
- SHA provisions: if Shareholders' Agreement contains transfer restrictions, the more restrictive of SHA provisions and this Lock-Up Agreement governs during Lock-Up Period
- Voting Agreement: Founder's voting obligations under Voting Agreement are NOT affected by lock-up — Founder votes all Locked Shares per Voting Agreement throughout Lock-Up Period

**ARTICLE IX — TERMINATION**
This agreement terminates upon the earliest of:
  (a) Release of all Locked Shares per the release schedule or acceleration triggers
  (b) Completion of Qualified IPO (this agreement terminates and IPO lock-up commences)
  (c) Written consent of Company + holders of majority of Preferred + Founder
  (d) Dissolution or winding up of the company
- Survival: breach consequences (Article V), indemnification, governing law, and dispute resolution survive termination

**REGULATORY HOOKS:**
- NI 45-102 s.2.5: 4-month resale restriction runs CONCURRENTLY with lock-up period; if lock-up period is shorter than 4-month hold period, securities law hold period continues after lock-up expiry; coordinate legend removal to ensure hold period legend remains when lock-up legend removed
- CBCA s.174: share transfer restrictions must be set out in articles; this agreement supplements article restrictions (ensure articles contain reference to this agreement)
- CBCA s.49(8): company may refuse to register transfer of locked shares
- Income Tax Act s.7: if shares acquired under employee stock option, lock-up does not affect timing of taxable benefit (taxable event occurs at exercise, not at lock-up release); advise Founder to obtain independent tax advice
- Income Tax Act s.116: if Founder is non-resident, lock-up release may trigger s.116 clearance certificate requirements

**PROVINCIAL VARIATIONS:**
- Ontario: ESA, 2000 — lock-up provisions must not conflict with employment standards minimums; if Founder is also employee, lock-up cannot extend beyond what is reasonable as ancillary restraint to employment relationship
- BC: Employment Standards Act (BC) — similar coordination with employment relationship
- Alberta: Employment Standards Code (Alberta) — similar coordination
- Quebec: Civil Code arts. 2085-2097 (employment contract) — lock-up provisions reviewed under Civil Code reasonableness standard; lock-up that effectively prevents founder from earning livelihood may be challenged as unreasonable restraint; French language requirement

**SCHEDULES:**
- Schedule A: Form of Escrow Agreement
- Schedule B: Lock-Up Release Schedule (dates and tranches)
- Schedule C: Form of Joinder Agreement for Permitted Transferees
- Schedule D: Milestone Definitions and Certification Process (if Option C selected)

Target length: 10-15 pages
`,

  "Series B Financing Agreement": `
BASE DRAFTING CONTEXT — SERIES B FINANCING AGREEMENT:

Draft a comprehensive Series B preferred share financing agreement with all IRA-style detail, structured with clause variants, risk levels, cross-clause dependencies, and regulatory hooks following three-document principles. This is a growth-stage financing instrument reflecting increased investor sophistication and enhanced governance requirements.

=== DOCUMENT STRUCTURE ===

**ARTICLE I — INTERPRETATION AND DEFINITIONS**
- Define: Series B Preferred Shares, Series B Original Issue Price, Conversion Price, Conversion Rate, Liquidation Preference, Participating Preferred, Non-Participating Preferred, Broad-Based Weighted Average, Narrow-Based Weighted Average, Full Ratchet, Pay-to-Play, Qualified IPO, Change of Control, Material Adverse Change, Milestone Tranche, Bridge Note, Management Carve-Out, Major Investor (Series B), D&O Insurance, Secondary Sale, Demand Registration, Piggyback Registration, Shelf Registration
- All defined terms from IRA (Article I) incorporated by reference where applicable
- Currency: CAD default; USD conversion mechanics for cross-border investors

**ARTICLE II — PREFERRED SHARE TERMS**
Series B Preferred Share Rights, Privileges, Restrictions, and Conditions:

Dividend Rights:
- Non-cumulative preferred dividend: [6-8]% per annum on Original Issue Price, payable when-as-and-if declared by board
- Participation: pari passu with Common on as-converted basis after preferred dividend paid
- [RISK LEVEL: LOW = non-cumulative; MEDIUM = cumulative, non-compounding; HIGH = cumulative, compounding]
- [CUSTOMIZABILITY: YES — rate and cumulative/non-cumulative negotiable]

Liquidation Waterfall:
- Non-Participating Preferred (STANDARD — investor-gets-back-or-converts):
  * Step 1: Series B receives [1x] Original Issue Price per share PLUS any declared but unpaid dividends
  * Step 2: Series A receives [1x] Original Issue Price per share PLUS any declared but unpaid dividends
  * Step 3: Series Seed receives [1x] Original Issue Price per share PLUS any declared but unpaid dividends
  * Step 4: Remaining proceeds distributed pro-rata to Common shareholders (including Preferred holders who elect to convert)
  * Election: each Preferred holder may elect to receive liquidation preference OR convert to Common and participate in Step 4 (not both)
- Participating Preferred with Cap (AGGRESSIVE):
  * Step 1-3: same as non-participating (each series receives preference amount)
  * Step 4: Preferred holders ALSO participate pro-rata with Common on as-converted basis
  * Cap: Preferred participation ceases when aggregate amount received per share (preference + participation) equals [3x] Original Issue Price
  * After cap: remaining proceeds distributed to Common only
  * [RISK LEVEL: LOW = non-participating; MEDIUM = participating with 3x cap; HIGH = participating with no cap]
- Participating Preferred without Cap (HIGHLY AGGRESSIVE — flag for lawyer review):
  * Same as participating with cap, but no cap on participation
  * [RISK LEVEL: HIGH — ROUTES TO LAWYER REVIEW]

Anti-Dilution Protection:
- Broad-Based Weighted Average (STANDARD):
  * Formula: NCP = OCP x ((CSO + CSP) / (CSO + CSI))
  * CSO = Common shares outstanding (fully-diluted, including all options, warrants, and convertible securities)
  * CSP = shares purchasable at old conversion price with aggregate consideration for new issuance
  * CSI = shares actually issued in dilutive issuance
  * "Broad-based" means CSO includes: all outstanding Common + all Common issuable on conversion/exercise of Preferred, options, warrants, convertible notes, SAFEs
- Narrow-Based Weighted Average (LESS COMMON):
  * Same formula, but CSO includes only outstanding Common (excludes option pool and convertible securities)
  * [RISK LEVEL: MEDIUM — more dilutive to founders than broad-based]
- Full Ratchet (AGGRESSIVE — flag for lawyer review):
  * Conversion price adjusted to equal price of new dilutive issuance (regardless of number of shares issued)
  * [RISK LEVEL: HIGH — ROUTES TO LAWYER REVIEW]
  * [CROSS-CLAUSE CONFLICT: Full ratchet is MUTUALLY EXCLUSIVE with weighted average — select ONE]
- Standard carve-outs from anti-dilution (no adjustment for): employee option pool issuances, DRIP shares, acquisition shares, conversion of existing convertibles, shares issued to strategic partners (board-approved)

Pay-to-Play Provisions:
- Requirement: in any future "down round" (price per share below Series B Original Issue Price), each Series B holder must invest its pro-rata share to maintain Series B Preferred status
- Consequence of non-participation:
  * Option 1: Series B Preferred converts to Common [RISK LEVEL: HIGH for investor]
  * Option 2: Series B Preferred converts to shadow series with reduced rights (no anti-dilution, no protective provisions) [RISK LEVEL: MEDIUM]
  * Option 3: Series B Preferred loses pro-rata right in future rounds only [RISK LEVEL: LOW]
- [CUSTOMIZABILITY: YES — consequence level negotiable]
- Pay-to-play is MUTUALLY EXCLUSIVE with full ratchet anti-dilution (if full ratchet, no pay-to-play — investor already fully protected)

Conversion Rights:
- Voluntary: at any time, at option of holder, at then-applicable Conversion Rate
- Mandatory: automatic conversion upon Qualified IPO (>$[50M] gross proceeds on recognized exchange) or upon vote of holders of majority of Series B Preferred
- Conversion rate: initially 1:1, adjusted for anti-dilution, stock splits, dividends, recapitalizations

**ARTICLE III — BOARD COMPOSITION AND GOVERNANCE**
Board composition changes for Series B:
- Total board size: [5-7] directors
- Composition:
  * 2 Founder-designated (holders of majority of Common)
  * 1 Series A Investor-designated (holders of majority of Series A Preferred)
  * 1 Series B Lead Investor-designated (lead Series B investor OR holders of majority of Series B Preferred)
  * 1 Mutual Independent Director (approved by both Founder and Investor designees)
  * [Optional: 1 additional Independent or 1 board observer for Series Seed investors]
- Board committees:
  * Audit Committee: at least 1 Investor designee, 1 Independent; chair = Independent
  * Compensation Committee: at least 1 Investor designee; reviews all executive compensation, ESOP grants, management carve-out
  * [Optional: Governance/Nominating Committee]
- Board observer rights: any Investor holding >[5]% on as-converted basis entitled to 1 non-voting observer at all board meetings (except when board discusses matters in which observer has conflict)

Enhanced Protective Provisions (Series B):
All IRA/Voting Agreement protective provisions PLUS:
  1. Hire, terminate, or materially change compensation of CEO, CFO, CTO, or COO
  2. Approve or modify ESOP pool or any equity incentive plan
  3. Approve annual budget or deviate from approved budget by more than [10]%
  4. Enter any contract with value exceeding $[500,000]
  5. Make any capital expenditure exceeding $[250,000]
  6. Acquire any business or assets with value exceeding $[500,000]
  7. Create any subsidiary or joint venture
  8. Approve any related party transaction (any amount)
  9. Change auditors or accounting policies
  10. Approve any settlement of litigation exceeding $[100,000]
  11. Grant any exclusive license of material IP
- [CUSTOMIZABILITY: Items 1-7 = NO (always included at Series B); Items 8-11 = YES (negotiable)]

**ARTICLE IV — MANAGEMENT CARVE-OUT**
- Purpose: incentivize management to maximize exit value even when liquidation preference overhang exists
- Structure: [5-10]% of Change of Control proceeds allocated to management pool BEFORE liquidation waterfall
- Allocation: CEO [40-50]%, other C-suite [30-40]%, other key employees [10-30]% (specific allocations determined by board Compensation Committee)
- Threshold: carve-out only payable if Change of Control price exceeds $[X] (minimum return to investors)
- Vesting: carve-out amounts vest over [2-4] years; unvested portion forfeited on departure
- Clawback: carve-out subject to clawback for Bad Leaver events
- [RISK LEVEL: LOW = 5% carve-out with high threshold; MEDIUM = 7.5%; HIGH = 10%]
- [CUSTOMIZABILITY: YES — percentage and allocation negotiable]

**ARTICLE V — D&O INSURANCE**
- Company must maintain directors' and officers' liability insurance:
  * Minimum coverage: $[2M-5M] per occurrence, $[5M-10M] aggregate
  * Coverage: all directors, officers, and company (entity coverage)
  * Tail coverage: [6] years following any Change of Control or termination of policy
  * Annual premium budget: approved by board as part of annual budget
- Indemnification: company indemnifies all directors and officers to fullest extent permitted by CBCA s.124
- Advancement: company advances defense costs upon receipt of undertaking to repay if indemnification ultimately not available
- [RISK LEVEL: LOW = $2M/$5M; MEDIUM = $3M/$7M; HIGH = $5M/$10M]

**ARTICLE VI — SECONDARY SALE PROVISIONS**
- Founder/early investor liquidity: in connection with Series B closing, [10-20]% of round proceeds may be used for secondary purchases of existing shares
- Eligible sellers: Founders and Series Seed investors holding shares for >[24] months
- Pricing: secondary shares purchased at [discount of 5-15]% to Series B price per share
- Cap: no individual seller may sell more than [25]% of their holdings in secondary
- Board and Investor approval: secondary sales require approval of board + holders of majority of Series B Preferred
- [CUSTOMIZABILITY: YES — percentage of round, discount, and individual cap negotiable]

**ARTICLE VII — REGISTRATION RIGHTS**
Demand Registration:
- Number of demands: [2-3] (Series B investors may initiate; does not reduce prior series' demand rights)
- Minimum registrable value: $[5M] CAD
- Company right to defer: up to [120] days per fiscal year (once per 12-month period)
- Underwriter selection: mutual agreement of Company and initiating holders

Piggyback Registration:
- All Investors with registrable securities may participate in any company-initiated offering
- Priority: if underwriter cutback, allocation pro-rata among all registering holders (Investors and Company)
- Unlimited piggyback rights

Shelf Registration:
- Company must file shelf prospectus within [90] days of becoming eligible (12+ months as reporting issuer)
- Shelf period: 25 months per NI 44-102
- Takedown rights: any Major Investor may initiate takedown from existing shelf, up to [4] per year

S-1/F-1 Registration (for dual-listed companies):
- If company lists on US exchange: demand and shelf registration rights under US Securities Act
- Coordination: Canadian and US registration rights exercisable independently

**ARTICLE VIII — MILESTONE TRANCHING**
- If Series B is tranched (not all invested at initial close):
  * Tranche 1: $[X] at initial close
  * Tranche 2: $[Y] upon achievement of [milestone — e.g., $[X] ARR, [Y] customers, regulatory approval]
  * Tranche 3 (if applicable): $[Z] upon achievement of [milestone]
- Milestone certification: CEO and CFO certify; lead investor has [15] business days to verify
- Price per share: same across all tranches (standard) OR with step-up for later tranches (negotiable)
- Failure to achieve milestone by longstop date: investors not obligated to fund subsequent tranches; company may seek alternative financing
- Anti-dilution: if company raises at lower price before all tranches funded, unfunded tranches adjust to lower price
- [CUSTOMIZABILITY: YES — milestone definitions, amounts, and timing negotiable]

**ARTICLE IX — BRIDGE NOTE CONVERSION**
- If Series B preceded by bridge financing (convertible notes or SAFEs):
  * Automatic conversion: bridge notes convert into Series B Preferred at closing
  * Conversion price: lower of (i) Series B price per share, or (ii) bridge valuation cap / fully-diluted shares, or (iii) Series B price less discount ([15-25]%)
  * Accrued interest: converts into additional Series B shares at conversion price
  * Mechanics: bridge holders deliver note for cancellation; company issues Series B shares; bridge holders execute all Series B transaction documents
- Multiple bridge instruments: if different valuation caps/discounts, each converts at its own terms (may result in different effective prices)
- [CROSS-CLAUSE DEPENDENCY: bridge conversion terms must coordinate with anti-dilution provisions — bridge conversion at discount does NOT trigger anti-dilution for earlier preferred series if bridge conversion was contemplated at time of bridge issuance]

**ARTICLE X — RESTATED ARTICLES COORDINATION**
- CBCA s.173: articles must be amended and restated to reflect Series B share terms
- Restated articles filed concurrently with Series B closing
- Restated articles must include COMPLETE rights, privileges, restrictions, and conditions for ALL classes:
  * Common Shares
  * Series Seed Preferred (if outstanding)
  * Series A Preferred (if outstanding)
  * Series B Preferred
- Liquidation waterfall in restated articles must EXACTLY match waterfall in this agreement
- Protective provisions in restated articles must EXACTLY match this agreement and Voting Agreement
- [CROSS-CLAUSE DEPENDENCY: Restated Articles are the AUTHORITATIVE source for share rights — this agreement and Voting Agreement must not conflict]

**CROSS-DOCUMENT DEPENDENCIES:**
- Series B share terms must match -> Restated Articles authorized capital
- Board composition must match -> Voting Agreement Article II
- Protective provisions must match -> Voting Agreement Article V, IRA negative covenants
- Registration rights supplement (not replace) -> IRA registration rights
- Liquidation waterfall must be consistent across -> this Agreement, Restated Articles, Term Sheet
- Bridge conversion coordinates with -> Convertible Note Agreement, SAFE Agreement
- Secondary sale provisions coordinate with -> ROFR/Co-Sale Agreement (ROFR waived for approved secondaries)
- Management carve-out coordinates with -> ESOP pool, employment agreements

**REGULATORY HOOKS:**
- NI 45-106: prospectus exemption for all Series B investors (s.2.3 accredited investor primary; verify for each investor)
- NI 45-106F1: Report of Exempt Distribution filed within 10 days of each closing (including each tranche)
- NI 45-102 s.2.5: 4-month hold period from each distribution date (each tranche has independent hold period)
- NI 51-102: continuous disclosure if reporting issuer; Series B may trigger reporting issuer status in some jurisdictions
- NI 62-103: early warning reporting at 10% for any investor; each additional 2% requires updated report
- NI 62-104: take-over bid threshold at 20% — Series B investment must not inadvertently trigger
- CBCA s.173: amendment of articles for new share class requires special resolution (2/3 of votes cast)
- CBCA s.176: class vote required if amendment affects rights of existing class
- CBCA s.190: dissent and appraisal rights for shareholders objecting to fundamental changes
- Income Tax Act s.86/s.86.1: share reorganization tax implications of restated articles

**PROVINCIAL VARIATIONS:**
- Ontario: OSA additional prospectus exemptions; OSC Rule 45-501; Ontario Business Corporations Act parallel filing if OBCA corporation
- BC: BC Securities Act; BC Instrument 45-534; BCBCA s.258-264 (arrangements)
- Alberta: ASA; ABCA s.186-193 (arrangements); Alberta Securities Commission blanket orders
- Quebec: QSA; AMF filing requirements; Civil Code warranty framework for share purchase; French language requirements for Quebec-based issuers and investors

Target length: 30-50 pages
`,

  "Series C / Late-Stage Financing": `
BASE DRAFTING CONTEXT — SERIES C / LATE-STAGE FINANCING:

Draft a comprehensive Series C or later-stage preferred share financing agreement with all IRA-style detail plus enhanced governance, secondary sale, and public-market preparation provisions. This instrument reflects institutional-grade investment terms, multiple existing preferred series, and anticipated path to liquidity (IPO or strategic acquisition).

=== DOCUMENT STRUCTURE ===
This agreement includes EVERYTHING in the Series B Financing Agreement PLUS the following additional/enhanced provisions:

**ARTICLE I — ENHANCED DEFINITIONS**
All Series B definitions PLUS:
- Multi-Tranche Closing, Secondary Sale, Secondary Purchaser, Ratchet Protection, Full Ratchet, Weighted Average Ratchet, Down-Round Protection, Enhanced Governance Rights, Board Committee Seat, Observer Rights, Budget Approval Right, TSX Listing, CSE Listing, Management Carve-Out Plan, Bridge Financing, Automatic Conversion, Cross-Border Investor, US Reg D, US Reg S, Warrant, Warrant Exercise Price, Warrant Expiry Date

**ARTICLE II — PREFERRED SHARE TERMS (ENHANCED)**
All Series B preferred share terms PLUS:

Enhanced Liquidation Waterfall:
- Seniority: Series C > Series B > Series A > Series Seed > Common (strict seniority is STANDARD; pari passu among all preferred is ALTERNATIVE)
- [RISK LEVEL: LOW = strict seniority (last money in, first money out); MEDIUM = pari passu among Series B and C with seniority over A/Seed; HIGH = full pari passu among all preferred]
- Participating vs Non-Participating: at Series C, participating preferred with [3x] cap is more common than at earlier stages
- Aggregate preference stack: calculate and disclose total liquidation preference overhang ($[X] = sum of all preferred original issue prices); include analysis of minimum exit value required for Common to receive any proceeds

Enhanced Anti-Dilution:
- Ratchet protection options:
  * Broad-Based Weighted Average (STANDARD — same as Series B)
  * Full Ratchet for first [12-18] months, converting to Broad-Based Weighted Average thereafter (COMPROMISE)
  * Full Ratchet for duration (AGGRESSIVE — typically only granted if company is accepting down-round terms)
  * [RISK LEVEL: LOW = BBWA; MEDIUM = time-limited full ratchet; HIGH = permanent full ratchet]
- Down-round protection: if Series D or later is priced below Series C price:
  * Anti-dilution adjustment per formula above
  * PLUS: Series C investors receive additional shares ("top-up shares") to restore original ownership percentage
  * Top-up shares: issued as Series C Preferred with same rights (not Common)
  * [RISK LEVEL: HIGH — ROUTES TO LAWYER REVIEW]
  * [CROSS-CLAUSE CONFLICT: down-round protection with top-up is MUTUALLY EXCLUSIVE with pay-to-play]

**ARTICLE III — MULTI-TRANCHE CLOSING MECHANICS**
- Tranche structure:
  * First Close: $[X] (minimum [50]% of total round), with [lead investor] committing at least $[Y]
  * Subsequent Close(s): additional investors may subscribe within [60-90] days of First Close at same price and terms
  * Final Close: no subscriptions accepted after [90] days from First Close (or [120] days with board approval)
- Per-tranche mechanics:
  * Each close is independent: shares issued, consideration received, Form 45-106F1 filed
  * All investors in all tranches receive IDENTICAL share terms (same price, same rights)
  * Hold period (NI 45-102 s.2.5) runs independently from each tranche's distribution date
- Pro-rata allocation: if round oversubscribed, existing investors receive pro-rata allocation first, then new investors
- Most favored nation: if any subsequent close investor receives better terms (side letter), all prior close investors receive same terms retroactively

**ARTICLE IV — SECONDARY SALE PROVISIONS (ENHANCED)**
- Scope: dedicated secondary component of Series C round:
  * [15-25]% of aggregate round size allocated to secondary purchases
  * Company facilitates but does not fund (secondary purchases made by new Series C investors or designated secondary purchaser)
- Eligible sellers (priority order):
  1. Founders: may sell up to [20-30]% of holdings (post-vesting, post-lock-up)
  2. Series Seed investors: may sell up to [50]% of holdings (earliest vintage, longest hold)
  3. Series A investors: may sell up to [25]% of holdings
  4. Early employees with vested options: may exercise and sell up to [25]% of vested shares
- Pricing: secondary shares purchased at [5-15]% discount to Series C primary price
- ROFR waiver: company and existing investors waive ROFR rights for approved secondary sales
- Board approval: secondary allocation and individual seller caps approved by board (including Investor designees)
- Tax coordination: seller responsible for own tax consequences; company provides T5008 (if applicable); advise sellers to obtain independent tax advice re: capital gains implications
- [CUSTOMIZABILITY: YES — secondary allocation, eligible sellers, discount, and caps negotiable]

**ARTICLE V — ENHANCED GOVERNANCE**
Board composition at Series C:
- Total board size: [7] directors
- Composition:
  * 2 Founder-designated
  * 1 Series A Investor-designated
  * 1 Series B Lead Investor-designated
  * 1 Series C Lead Investor-designated
  * 2 Mutual Independent Directors (one of whom chairs the board)
- Board committee seats (mandatory):
  * Audit Committee: 3 members (2 Independent + 1 Investor designee); all must be financially literate; chair = Independent with accounting designation
  * Compensation Committee: 3 members (1 Independent + 1 Investor designee + 1 Founder designee); reviews all executive compensation, ESOP/equity grants, management carve-out plan
  * Governance/Nominating Committee: 3 members (2 Independent + 1 Investor designee); oversees board composition, independence standards, succession planning
- Observer rights: any Investor holding >[3]% on as-converted basis entitled to 1 non-voting observer at board and committee meetings
- Budget approval right: annual budget requires approval of board (including affirmative vote of at least 1 Investor designee and 1 Independent); quarterly budget variance reports to board; deviation from approved budget by more than [10]% requires board re-approval
- Enhanced protective provisions: all Series B protective provisions PLUS:
  * Approve any expenditure or commitment exceeding $[1M]
  * Approve any litigation or regulatory action (prosecution or settlement) involving potential exposure exceeding $[500,000]
  * Approve any change to company's tax structure or jurisdiction of incorporation
  * Approve any share buyback program
  * Approve any investor relations or public communications strategy (pre-IPO)

**ARTICLE VI — TSX/CSE LISTING PREPARATION**
- IPO readiness covenant: company must, within [12-18] months of Series C closing, achieve "IPO ready" status including:
  * Appointment of CFO with public company experience
  * Conversion of financial reporting from ASPE to IFRS
  * Implementation of internal controls over financial reporting (ICFR) per NI 52-109
  * Engagement of "Big Four" or equivalent auditor
  * Board composition meeting TSX/CSE independence requirements
  * Corporate governance policies: code of conduct, insider trading policy, disclosure policy, whistleblower policy
- TSX listing requirements: minimum public float, distribution, market capitalization thresholds
- CSE listing requirements: alternative for earlier-stage companies; different ongoing governance requirements
- Dual listing preparation: if US listing contemplated (NYSE/NASDAQ), include Sarbanes-Oxley readiness, SEC registration coordination, MJDS (Multi-Jurisdictional Disclosure System) for Canadian issuers
- Cost allocation: IPO preparation costs are company expenses (approved in annual budget)
- Registration rights coordination: demand registration rights may be exercised to compel IPO after [24-36] months if company has not voluntarily filed prospectus

**ARTICLE VII — MANAGEMENT CARVE-OUT PLAN (ENHANCED)**
- Increased pool: [7.5-15]% of Change of Control proceeds allocated to management before liquidation waterfall
- Plan structure:
  * Tier 1 (C-Suite): CEO, CFO, CTO, COO — [50-60]% of pool
  * Tier 2 (VP level): VPs of key functions — [25-30]% of pool
  * Tier 3 (Key contributors): identified by Compensation Committee — [10-25]% of pool
- Vesting: [4]-year vesting with [1]-year cliff from plan adoption; full acceleration on Change of Control
- Minimum return threshold: carve-out only payable if Change of Control price implies aggregate return to Series C investors of at least [1.5-2x] Original Issue Price
- Board Compensation Committee administers plan; amendments require committee + board approval
- [CUSTOMIZABILITY: YES — pool size, tiers, and threshold negotiable]

**ARTICLE VIII — BRIDGE FINANCING WITH AUTOMATIC CONVERSION**
- Pre-Series C bridge: if company raises bridge financing (convertible notes or SAFEs) prior to Series C:
  * Automatic conversion into Series C Preferred at closing
  * Conversion discount: [15-25]% to Series C price per share
  * Valuation cap: $[X] pre-money (if applicable)
  * Interest conversion: accrued interest converts into additional Series C shares
  * Maturity extension: if Series C does not close before bridge maturity, maturity automatically extends by [6] months (one time)
- Post-Series C bridge (for Series D or beyond):
  * If company requires additional financing before next priced round, Series C investors have right of first offer
  * Bridge terms: convertible note at [6-8]% interest, [20]% discount to next round, valuation cap of [X] (post-money of Series C round + [20-30]% premium)
  * MFN: if bridge issued to non-Series C investors on better terms, Series C investors receive retroactive adjustment
- [CROSS-CLAUSE DEPENDENCY: bridge conversion must coordinate with anti-dilution — bridge conversion at discount does NOT trigger anti-dilution if contemplated at bridge issuance]

**ARTICLE IX — WARRANT PROVISIONS**
- Warrant issuance: Series C investors may receive warrants for additional shares as part of investment:
  * Coverage: [10-25]% warrant coverage (for every $[100] invested, investor receives warrants to purchase $[10-25] of additional shares)
  * Exercise price: [110-150]% of Series C price per share
  * Exercise period: [3-5] years from Series C closing
  * Exercise mechanics: cash exercise (standard), cashless/net exercise (if shares not publicly traded), or combination
  * Anti-dilution: warrant exercise price adjusts for stock splits, dividends, and recapitalizations (but NOT for anti-dilution adjustments to preferred conversion price)
  * Expiry: unexercised warrants expire at end of exercise period; automatic cashless exercise if in-the-money at expiry
- [CUSTOMIZABILITY: YES — coverage, exercise price, and period negotiable]
- [CROSS-CLAUSE DEPENDENCY: warrants must be included in fully-diluted share count for anti-dilution calculations and pro-rata rights]

**ARTICLE X — CROSS-BORDER INVESTOR PROVISIONS**
- US Investors — Regulation D compliance:
  * Rule 506(b): if no general solicitation, up to 35 non-accredited + unlimited accredited investors; purchaser questionnaire required
  * Rule 506(c): if general solicitation used, ALL investors must be verified accredited; reasonable steps to verify (tax returns, bank statements, third-party verification)
  * Form D: company files Form D with SEC within 15 days of first sale to US investor
  * US transfer restrictions: restricted securities under Rule 144; 6-month/12-month hold period; legend requirements
- US Investors — Regulation S compliance (for offshore transactions):
  * Transaction must occur outside the United States
  * No directed selling efforts in the United States
  * Offering restrictions during distribution compliance period ([40] days for non-reporting issuers)
- US tax considerations: advise US investors re: PFIC (Passive Foreign Investment Company) status of Canadian issuer; QEF election or Mark-to-Market election may be available; company to provide PFIC annual information statement
- Other cross-border: for investors in UK, EU, Asia — confirm local private placement exemptions; coordinate with local counsel
- [REGULATORY HOOK: US securities compliance is IN ADDITION to Canadian NI 45-106 compliance — dual compliance required for cross-border rounds]

**ARTICLE XI — ENHANCED INFORMATION RIGHTS**
All IRA information rights PLUS:
- Monthly management letter (CEO letter to investors): key metrics, pipeline, burn rate, runway, hiring, competitive landscape
- Quarterly board package: financials, KPIs, budget vs actual, cash flow forecast, cap table, material litigation update
- Annual audited financials: IFRS (if IPO-ready) within [90] days of fiscal year end
- Annual budget: presented to board for approval at least [30] days before fiscal year start
- Cap table: updated within [10] business days of any issuance, exercise, transfer, or conversion
- Material event notice: [5] business days for any MAC, litigation, regulatory action, key person departure, IP dispute
- [CUSTOMIZABILITY: NO — all information rights are standard at Series C stage]

**CROSS-DOCUMENT DEPENDENCIES:**
All Series B cross-document dependencies PLUS:
- Secondary sale provisions must coordinate with -> ROFR/Co-Sale Agreement (ROFR waiver for approved secondaries)
- TSX/CSE listing preparation coordinates with -> Registration rights (demand registration may compel IPO)
- Warrant provisions must be included in -> fully-diluted calculations across all agreements (anti-dilution, pro-rata, voting)
- Cross-border provisions must coordinate with -> Subscription Agreement (dual-jurisdiction representations)
- Management carve-out plan coordinates with -> Employment agreements, ESOP plan, Compensation Committee charter
- Multi-tranche mechanics coordinate with -> NI 45-106F1 filing (separate filing per tranche)

**REGULATORY HOOKS:**
All Series B regulatory hooks PLUS:
- NI 52-109: CEO/CFO certification of annual and interim filings (if reporting issuer)
- NI 52-110: audit committee requirements (if reporting issuer)
- NI 58-101: corporate governance disclosure (if reporting issuer)
- NI 51-102 s.4.3: material change reporting (if reporting issuer)
- TSX Company Manual / CSE Policy Manual: listing and ongoing requirements
- US Securities Act: Reg D (Rule 506(b)/506(c)), Reg S for cross-border investors
- US Exchange Act: Form D filing, ongoing reporting if >$10M assets and >2000 holders
- Income Tax Act s.116: non-resident disposition clearance certificate
- Income Tax Act s.85: tax-deferred rollover for share exchanges in reorganization
- CBCA s.190: dissent and appraisal rights — enhanced relevance at late stage given higher preference stack

**PROVINCIAL VARIATIONS:**
All Series B provincial variations PLUS:
- Ontario: TSX listing subject to OSC oversight; OSC Rule 51-801 (implementing NI 51-102)
- BC: CSE listing popular for BC-based tech companies; BCSC oversight
- Alberta: ASC blanket orders for late-stage private placements
- Quebec: AMF pre-marketing requirements; French language prospectus requirement if listed on TSX/CSE; additional consumer protection considerations for Quebec-based SaaS companies

Target length: 40-60 pages
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
- Use proper em-dashes (—) for all dashes in headings and running text. NEVER use double hyphens (--) as a substitute for an em-dash. Example: "ARTICLE 6 — RESTRICTIVE COVENANTS" not "ARTICLE 6 -- RESTRICTIVE COVENANTS".
- Do NOT use ASCII art signature lines made of underscores (e.g., "____________________________"). Instead, for signature blocks use the standard "Per: ________________" format (16 underscores) ONLY in the execution block, and nowhere else.
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

            // Append LSO disclaimer for Base Draft (self-serve) documents
            const wd = body.wizardData as Record<string, unknown> | undefined;
            const requestedTier = wd?.tier;
            if (requestedTier === "self-serve") {
              const disclaimer = `\n\n---\n\n**NOTICE**: This document was prepared using Ruby Law's Base Draft engine. It has not been reviewed by a licensed lawyer and does not constitute legal advice or a legal opinion. No lawyer-client relationship is created by the generation or use of this document. The Law Society of Ontario requires this disclosure pursuant to its rules governing the unauthorized practice of law. You are strongly encouraged to obtain independent legal advice before executing this agreement.`;
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

    // Append LSO disclaimer for Base Draft (self-serve) documents
    const wd = body.wizardData as Record<string, unknown> | undefined;
    const requestedTier = wd?.tier;
    if (requestedTier === "self-serve") {
      draft += `\n\n---\n\n**NOTICE**: This document was prepared using Ruby Law's Base Draft engine. It has not been reviewed by a licensed lawyer and does not constitute legal advice or a legal opinion. No lawyer-client relationship is created by the generation or use of this document. The Law Society of Ontario requires this disclosure pursuant to its rules governing the unauthorized practice of law. You are strongly encouraged to obtain independent legal advice before executing this agreement.`;
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
