"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ─── Types ───
interface ModificationCategory {
  id: string;
  name: string;
  description: string;
  example: string;
  icon: string;
  clauseIds?: string[];
  regModuleIds?: string[];
}

interface ChatMessage {
  id: string;
  role: "ruby" | "user" | "system";
  content: string;
  timestamp: Date;
  riskFlag?: string;
  draftVersion?: number;
  quickActions?: QuickAction[];
  clausePreview?: ClausePreview;
  provinceTip?: string;
}

interface QuickAction {
  label: string;
  value: string;
}

interface ClausePreview {
  title: string;
  current: string;
  proposed: string;
}

interface ModificationRecord {
  id: string;
  category: string;
  summary: string;
  complexityTier: "simple" | "standard" | "complex";
  baseFee: number;
  riskFlags: string[];
  requiresLawyerReview: boolean;
  messages: ChatMessage[];
}

interface SessionData {
  contractType: string;
  contractTitle: string;
  tier: string;
  governingLaw: string;
  selected: Record<string, unknown>;
}

interface PendingChange {
  id: string;
  category: ModificationCategory;
  description: string;
  riskFlags: string[];
  provinceTip: string | null;
  confirmed: boolean;
}

// ─── Modification Categories (mapped from clause library) ───
const UNIVERSAL_CATEGORIES: ModificationCategory[] = [
  { id: "custom-schedule", name: "Custom Schedule or Exhibit", description: "Create a non-standard payment schedule, milestone table, deliverables schedule, or exhibit.", example: "Add a milestone-based payment schedule tied to project deliverables.", icon: "CS" },
  { id: "something-else", name: "Something Else", description: "Describe what you need in your own words. Ruby will help structure your request.", example: "I need a revenue-sharing earn-out tied to Q3 and Q4 performance metrics.", icon: "SE" },
];

const CONTRACT_CATEGORIES: Record<string, ModificationCategory[]> = {
  employment: [
    { id: "emp-termination", name: "Termination & Severance", description: "Modify notice periods, severance formulas, or termination triggers.", example: "Increase severance from ESA minimum to 2 weeks per year of service.", icon: "TS", clauseIds: ["CL-EA-006", "CL-EA-007", "CL-EA-013"] },
    { id: "emp-covenants", name: "Restrictive Covenants", description: "Adjust non-compete, non-solicit, or confidentiality scope and duration.", example: "Narrow the non-solicit from all clients to only clients you personally serviced.", icon: "RC", clauseIds: ["CL-EA-008", "CL-EA-009", "CL-EA-010"] },
    { id: "emp-compensation", name: "Compensation & Benefits", description: "Modify salary structure, bonus terms, equity provisions, or benefits.", example: "Add a signing bonus with a 12-month clawback provision.", icon: "CB", clauseIds: ["CL-EA-002", "CL-EA-003", "CL-EA-004"] },
    { id: "emp-ip", name: "IP & Inventions", description: "Adjust intellectual property assignment, moral rights, or invention clauses.", example: "Carve out personal projects from the IP assignment clause.", icon: "IP", clauseIds: ["CL-EA-011", "CL-EA-012"] },
  ],
  corporate: [
    { id: "corp-transfer", name: "Share Transfer & Exit", description: "Modify ROFR, tag-along, drag-along, or exit mechanisms.", example: "Add a 90-day ROFR exercise period instead of the standard 30 days.", icon: "ST", clauseIds: ["CL-SHA-021", "CL-SHA-022", "CL-SHA-023", "CL-SHA-024"] },
    { id: "corp-governance", name: "Governance & Voting", description: "Adjust board composition, reserved matters, or voting thresholds.", example: "Add board observer rights for minority shareholders above 10%.", icon: "GV", clauseIds: ["CL-SHA-005", "CL-SHA-031", "CL-SHA-032"] },
    { id: "corp-deadlock", name: "Deadlock Resolution", description: "Change the deadlock resolution mechanism or add mediation steps.", example: "Replace shotgun buy-sell with mediation then arbitration.", icon: "DR", clauseIds: ["CL-SHA-034", "CL-SHA-035"] },
    { id: "corp-dividends", name: "Dividends & Distributions", description: "Modify dividend policy, distribution waterfall, or reinvestment provisions.", example: "Add a minimum annual distribution of 30% of net profits.", icon: "DD", clauseIds: ["CL-SHA-019", "CL-SHA-020"] },
  ],
  investment: [
    { id: "inv-interest", name: "Interest & Payment Terms", description: "Modify interest rates, payment schedules, or amortization structure.", example: "Change the interest rate from 8% to 6% and switch from bullet to amortizing repayment.", icon: "PT", clauseIds: ["CL-LDI-002", "CL-LDI-003", "CL-LDI-004", "CL-LDI-019", "CL-LDI-020"] },
    { id: "inv-default", name: "Default & Remedies", description: "Adjust cure periods, events of default, or acceleration provisions.", example: "Extend the cure period from 5 days to 15 days and add a MAC exclusion for pandemic events.", icon: "DF", clauseIds: ["CL-LDI-006", "CL-LDI-007", "CL-LDI-013"], regModuleIds: ["RM-CC347", "RM-IA"] },
    { id: "inv-security", name: "Security & Collateral", description: "Change security interests, collateral descriptions, or priority arrangements.", example: "Change the security from an all-assets GSA to a specific pledge of accounts receivable only.", icon: "SC", clauseIds: ["CL-LDI-021", "CL-LDI-022", "CL-LDI-023", "CL-LDI-024", "CL-LDI-044", "CL-LDI-045"], regModuleIds: ["RM-PPSA", "RM-IA8"] },
    { id: "inv-conversion", name: "Conversion Mechanics", description: "Modify valuation cap, discount rate, or conversion triggers.", example: "Lower the valuation cap and add a most-favoured-nation clause.", icon: "CM", clauseIds: ["CL-LDI-025", "CL-LDI-026", "CL-LDI-027", "CL-LDI-028", "CL-LDI-029", "CL-LDI-030"], regModuleIds: ["RM-NI45106"] },
    { id: "inv-rights", name: "Investor / Lender Rights", description: "Add or modify information rights, pro-rata rights, or board observer rights.", example: "Add board observer rights for any investor above $500K.", icon: "IR", clauseIds: ["CL-LDI-005", "CL-LDI-031", "CL-LDI-032", "CL-LDI-034", "CL-LDI-035"] },
    { id: "inv-parties", name: "Parties & Structure", description: "Add a co-borrower, guarantor, or change the deal structure.", example: "Add my co-founder as a personal guarantor on this loan.", icon: "PS", clauseIds: ["CL-LDI-011", "CL-LDI-049", "CL-LDI-050", "CL-LDI-051", "CL-LDI-052"] },
  ],
  commercial: [
    { id: "com-sla", name: "Service Levels & Credits", description: "Modify uptime commitments, response times, or service credit schedules.", example: "Increase uptime commitment from 99.9% to 99.95% with enhanced credit schedule.", icon: "SL" },
    { id: "com-liability", name: "Liability & Indemnification", description: "Adjust liability caps, indemnification scope, or damages exclusions.", example: "Increase liability cap from 12 months to 24 months of fees.", icon: "LI" },
    { id: "com-data", name: "Data & Privacy", description: "Modify data handling, residency requirements, or breach notification terms.", example: "Add data residency requirement for Canada-only storage.", icon: "DP" },
    { id: "com-ip", name: "IP Ownership & Licensing", description: "Adjust who owns work product, license grants, or open-source provisions.", example: "Change IP ownership from vendor-retains to client-owns-all-deliverables.", icon: "IL" },
  ],
  platform: [
    { id: "plat-terms", name: "Terms & Acceptance", description: "Modify acceptance mechanism, modification procedures, or user obligations.", example: "Switch from browsewrap to clickwrap acceptance with version tracking.", icon: "TA" },
    { id: "plat-disputes", name: "Dispute Resolution", description: "Change dispute resolution mechanism, jurisdiction, or class action waiver.", example: "Add a 30-day informal resolution period before arbitration.", icon: "DS" },
    { id: "plat-content", name: "User Content & IP", description: "Modify UGC licensing, content moderation, or takedown procedures.", example: "Add a copyright notice-and-takedown procedure compliant with the Copyright Act.", icon: "UC" },
    { id: "plat-privacy", name: "Data Collection & Use", description: "Adjust what personal data is collected, how it's used, and retention periods.", example: "Add biometric data collection disclosure for our facial recognition feature.", icon: "DC", clauseIds: ["CL-PP-001", "CL-PP-002", "CL-PP-003"] },
    { id: "plat-sharing", name: "Third-Party Sharing", description: "Expand or restrict data sharing with partners, analytics providers, or advertisers.", example: "Expand the third-party sharing clause to cover our new analytics partner.", icon: "TP", clauseIds: ["CL-PP-004", "CL-PP-005"] },
    { id: "plat-retention", name: "Retention & Deletion", description: "Change how long data is kept and when it gets automatically deleted.", example: "Change the retention period from 3 years to 18 months and add auto-deletion.", icon: "RD", clauseIds: ["CL-PP-006", "CL-PP-007"] },
    { id: "plat-userrights", name: "User Rights & Access", description: "Add data portability, access requests, or deletion rights.", example: "Add a data portability clause compliant with Quebec Law 25.", icon: "UR", clauseIds: ["CL-PP-008", "CL-PP-009", "CL-PP-010"] },
  ],
  creator: [
    { id: "inf-compensation", name: "Compensation & Performance", description: "Modify payment structure, performance bonuses, or affiliate commission terms.", example: "Add a 5% commission on sales generated through the influencer's unique link.", icon: "CP" },
    { id: "inf-content", name: "Content Rights & Usage", description: "Adjust IP ownership, usage rights duration, or whitelisting scope.", example: "Limit brand usage rights to social media only — no paid advertising.", icon: "CR" },
    { id: "inf-exclusivity", name: "Exclusivity & Non-Compete", description: "Modify exclusivity scope, duration, or competitor definition.", example: "Narrow exclusivity to direct competitors only, not the entire skincare category.", icon: "EX" },
    { id: "inf-compliance", name: "Disclosure & Regulatory", description: "Adjust platform-specific disclosure templates or add industry compliance.", example: "Add AGCO-compliant responsible gambling messaging for iGaming campaign.", icon: "DG" },
  ],
};

// ─── Suggestion Chips per Category ───
const SUGGESTION_CHIPS: Record<string, string[]> = {
  "emp-termination": [
    "Increase severance to 2 weeks per year of service",
    "Add change-of-control termination trigger",
    "Extend notice period to 6 months",
    "Add garden leave provision",
    "Remove termination without cause clause",
  ],
  "emp-covenants": [
    "Narrow non-solicit to direct clients only",
    "Reduce non-compete from 24 to 12 months",
    "Add carve-out for personal projects",
    "Remove non-compete entirely (non-C-suite)",
    "Limit geographic scope to GTA only",
  ],
  "emp-compensation": [
    "Add signing bonus with 12-month clawback",
    "Add equity vesting with 1-year cliff",
    "Include performance bonus structure",
    "Add car allowance or expense provisions",
    "Change salary review frequency to annual",
  ],
  "emp-ip": [
    "Carve out personal projects from IP assignment",
    "Add pre-existing IP schedule",
    "Modify moral rights waiver scope",
    "Add open-source contribution policy",
  ],
  "corp-transfer": [
    "Extend ROFR period to 90 days",
    "Lower drag-along threshold to 66.7%",
    "Add tag-along rights for minority holders",
    "Add shotgun buy-sell mechanism",
    "Include put/call option on death or disability",
  ],
  "corp-governance": [
    "Add board observer rights for 10%+ shareholders",
    "Expand reserved matters list",
    "Change voting threshold to supermajority",
    "Add casting vote for board chair",
  ],
  "corp-deadlock": [
    "Replace shotgun with mediation then arbitration",
    "Add mandatory cooling-off period",
    "Add expert determination for valuation disputes",
  ],
  "corp-dividends": [
    "Add minimum annual distribution of 30% net profits",
    "Create preferred distribution waterfall",
    "Add reinvestment threshold before distributions",
  ],
  "inv-interest": [
    "Lower interest rate to 6%",
    "Switch from bullet to amortizing repayment",
    "Add PIK (payment-in-kind) interest option",
    "Change day-count to actual/365",
  ],
  "inv-conversion": [
    "Lower valuation cap",
    "Increase discount rate to 25%",
    "Add most-favoured-nation clause",
    "Add automatic conversion at maturity",
  ],
  "inv-rights": [
    "Add board observer rights for investors above $500K",
    "Add pro-rata participation rights",
    "Require monthly financial reporting",
    "Add information rights for all investors",
  ],
  "inv-default": [
    "Extend cure period to 15 days",
    "Add MAC exclusion for pandemic events",
    "Remove cross-default provision",
    "Add grace period for payment defaults",
  ],
  "inv-security": [
    "Switch from all-assets GSA to specific pledge",
    "Add PPSA registration requirements",
    "Add permitted encumbrances schedule",
  ],
  "inv-parties": [
    "Add co-founder as personal guarantor",
    "Add co-borrower with joint liability",
    "Add corporate guarantor subsidiary",
  ],
  "com-sla": [
    "Increase uptime to 99.95%",
    "Add enhanced service credits schedule",
    "Tighten P1 response time to 15 minutes",
    "Add disaster recovery RPO/RTO commitments",
  ],
  "com-liability": [
    "Increase liability cap to 24 months of fees",
    "Add IP indemnification carve-out",
    "Remove consequential damages exclusion for data breach",
  ],
  "com-data": [
    "Add Canada-only data residency requirement",
    "Tighten breach notification to 48 hours",
    "Add data deletion on termination clause",
    "Require SOC 2 Type II certification",
  ],
  "com-ip": [
    "Change IP ownership to client-owns-all-deliverables",
    "Add open-source audit obligation",
    "Narrow license grant to term of agreement only",
  ],
  "inf-exclusivity": [
    "Limit exclusivity to direct competitors only",
    "Add geographic carve-out for European brands",
    "Reduce exclusivity period to campaign duration only",
  ],
  "inf-compensation": [
    "Add 5% affiliate commission on sales",
    "Add performance bonus at 100K views",
    "Switch to hybrid flat fee plus commission",
  ],
  "inf-content": [
    "Limit brand usage to social media only",
    "Require creator approval for paid advertising use",
    "Add content revision caps (max 2 rounds)",
    "Specify content ownership after campaign",
  ],
  "inf-compliance": [
    "Add AGCO-compliant messaging for iGaming",
    "Add French-language disclosure for Quebec audience",
    "Update FTC disclosure requirements",
  ],
  "plat-terms": [
    "Switch from browsewrap to clickwrap acceptance",
    "Add version tracking for terms changes",
    "Modify auto-renewal disclosure per Ontario CPA",
    "Add specific prohibited conduct list",
  ],
  "plat-disputes": [
    "Add 30-day informal resolution period",
    "Switch to arbitration under ADR Institute rules",
    "Remove class action waiver (post Uber v. Heller)",
    "Add mediation step before litigation",
  ],
  "plat-content": [
    "Add DMCA/Copyright Act takedown procedure",
    "Modify UGC license scope and duration",
    "Add content moderation appeal process",
  ],
  "plat-privacy": [
    "Add biometric data collection disclosure",
    "Expand cookie categories and consent options",
    "Add Quebec Law 25 privacy impact provisions",
    "Specify PIPEDA-compliant retention schedule",
  ],
  "plat-sharing": [
    "Add named third-party processor list",
    "Restrict cross-border data transfers",
    "Add data processing agreement requirements",
  ],
  "plat-retention": [
    "Shorten retention to 18 months",
    "Add automatic deletion on account closure",
    "Create tiered retention by data category",
  ],
  "plat-userrights": [
    "Add GDPR-style data portability right",
    "Add right to explanation for automated decisions",
    "Add Quebec Law 25 access request process",
  ],
  "custom-schedule": [
    "Milestone-based payment schedule",
    "Vesting schedule with acceleration triggers",
    "Service credit calculation table",
    "Deliverables and acceptance criteria schedule",
  ],
  "something-else": [
    "Add a revenue-sharing earn-out provision",
    "Include an arbitration clause with specific rules",
    "Add a most-favoured-customer pricing provision",
    "Include a force majeure clause with pandemic carve-out",
  ],
  default: [
    "Modify a specific clause or threshold",
    "Add a new provision or schedule",
    "Adjust payment or compensation terms",
    "Change dispute resolution mechanism",
    "Modify termination or exit provisions",
  ],
};

// ─── Complexity Pricing ───
const COMPLEXITY_PRICING: Record<string, { base: number; label: string }> = {
  simple: { base: 49, label: "Simple" },
  standard: { base: 129, label: "Standard" },
  complex: { base: 299, label: "Complex" },
};

const LAWYER_ADDON = { standard: 149, priority: 349 };

function volumeDiscount(index: number): number {
  if (index === 0) return 0;
  if (index === 1) return 0.2;
  return 0.4;
}

const COMPLEXITY_COLORS: Record<string, { bg: string; text: string }> = {
  simple: { bg: "bg-emerald-50", text: "text-emerald-700" },
  standard: { bg: "bg-amber-50", text: "text-amber-700" },
  complex: { bg: "bg-rose-50", text: "text-rose-700" },
};

// ─── Risk Detection ───
function detectRisks(text: string, category: ModificationCategory | null): string[] {
  const flags: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes("remove") && lower.includes("savings clause")) flags.push("Removing the Criminal Code s.347 savings clause is not permitted under Canadian law.");
  if (lower.includes("interest") && lower.includes("real property")) flags.push("Interest Act s.8 restricts default interest on real-property-secured instruments.");
  if (lower.includes("remove") && lower.includes("non-compete") && lower.includes("non-solicit")) flags.push("Removing non-solicitation may conflict with the existing non-compete clause.");
  if (lower.includes("securities") && (lower.includes("weaken") || lower.includes("remove"))) flags.push("NI 45-106 investor accreditation verification must not be weakened.");
  if (category?.regModuleIds && category.regModuleIds.length > 0) flags.push("This modification may trigger additional regulatory compliance requirements.");
  return flags;
}

// ─── Mandatory Lawyer Review ───
function requiresMandatoryLawyerReview(text: string, category: ModificationCategory | null): boolean {
  const lower = text.toLowerCase();
  if (lower.includes("savings clause") || lower.includes("s.347")) return true;
  if (lower.includes("real property") && lower.includes("interest")) return true;
  if (lower.includes("securities") && lower.includes("accreditation")) return true;
  if (category?.regModuleIds?.includes("RM-IA8")) return true;
  return false;
}

// ─── Complexity Determination ───
function determineComplexity(
  messageCount: number,
  category: ModificationCategory | null,
  riskFlags: string[]
): "simple" | "standard" | "complex" {
  if (riskFlags.length >= 2) return "complex";
  if (category?.regModuleIds && category.regModuleIds.length >= 2) return "complex";
  if (category?.clauseIds && category.clauseIds.length >= 5) return "complex";
  if (messageCount <= 3) return "simple";
  if (messageCount <= 6) return "standard";
  return "complex";
}

// ─── Category Detection from User Input ───
function detectCategory(text: string, categories: ModificationCategory[]): ModificationCategory | null {
  const lower = text.toLowerCase();
  const keywords: Record<string, string[]> = {
    "emp-termination": ["termination", "severance", "notice period", "fired", "let go", "terminate", "garden leave"],
    "emp-covenants": ["non-compete", "non-solicit", "restrictive", "covenant", "confidentiality"],
    "emp-compensation": ["salary", "bonus", "compensation", "equity", "vesting", "benefits", "signing bonus", "clawback", "stock option"],
    "emp-ip": ["intellectual property", "ip assignment", "invention", "moral rights", "patent", "open source", "personal project"],
    "corp-transfer": ["rofr", "right of first refusal", "tag-along", "drag-along", "share transfer", "exit", "buy-sell", "shotgun"],
    "corp-governance": ["board", "voting", "governance", "reserved matter", "observer", "director", "supermajority"],
    "corp-deadlock": ["deadlock", "mediation", "arbitration", "dispute between shareholders"],
    "corp-dividends": ["dividend", "distribution", "profit sharing", "reinvestment"],
    "inv-interest": ["interest rate", "payment schedule", "amortiz", "repayment", "bullet", "pik"],
    "inv-default": ["default", "cure period", "acceleration", "event of default", "cross-default", "mac"],
    "inv-security": ["security", "collateral", "gsa", "ppsa", "pledge", "encumbrance"],
    "inv-conversion": ["valuation cap", "conversion", "discount rate", "mfn", "most favoured"],
    "inv-rights": ["board observer", "pro-rata", "information rights", "investor rights", "lender rights"],
    "inv-parties": ["guarantor", "co-borrower", "co-signer", "add a party", "new party"],
    "com-sla": ["uptime", "sla", "service level", "response time", "rpo", "rto", "service credit"],
    "com-liability": ["liability cap", "indemnif", "damages", "limitation of liability"],
    "com-data": ["data residency", "breach notification", "data handling", "soc 2", "data deletion"],
    "com-ip": ["ip ownership", "work product", "license grant", "open-source", "deliverables"],
    "plat-terms": ["browsewrap", "clickwrap", "terms of service", "acceptance", "auto-renewal"],
    "plat-disputes": ["dispute resolution", "class action", "arbitration clause", "mediation"],
    "plat-content": ["ugc", "user content", "takedown", "content moderation", "dmca"],
    "plat-privacy": ["personal data", "biometric", "cookie", "privacy", "pipeda", "law 25"],
    "plat-sharing": ["third-party sharing", "data sharing", "processor", "cross-border"],
    "plat-retention": ["retention period", "data retention", "auto-deletion", "how long"],
    "plat-userrights": ["data portability", "access request", "right to delete", "automated decision"],
    "inf-compensation": ["commission", "affiliate", "performance bonus", "flat fee", "creator pay"],
    "inf-content": ["usage rights", "whitelisting", "brand usage", "content ownership", "revision cap"],
    "inf-exclusivity": ["exclusivity", "exclusive", "competitor", "category exclusivity"],
    "inf-compliance": ["disclosure", "agco", "gambling", "ftc", "french-language"],
    "custom-schedule": ["schedule", "milestone", "payment table", "exhibit", "deliverables table"],
  };

  let bestMatch: { id: string; score: number } | null = null;
  for (const [catId, terms] of Object.entries(keywords)) {
    let score = 0;
    for (const term of terms) {
      if (lower.includes(term)) score++;
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { id: catId, score };
    }
  }

  if (bestMatch) {
    return categories.find((c) => c.id === bestMatch!.id) || null;
  }
  return null;
}

// ─── Province Tips ───
function getProvinceTip(text: string, province: string): string | null {
  const lower = text.toLowerCase();

  if (province === "Ontario" || province === "ontario") {
    if (lower.includes("non-compete")) return "In Ontario, non-compete clauses for employees are unenforceable under the ESA (s.67.2) unless the employee is a C-suite executive. Consider a non-solicit instead.";
    if (lower.includes("termination") || lower.includes("severance")) return "Ontario's Employment Standards Act sets minimum notice/severance requirements. Common law reasonable notice typically exceeds ESA minimums significantly.";
    if (lower.includes("auto-renewal") || lower.includes("subscription")) return "Ontario's Consumer Protection Act requires specific disclosure for auto-renewal agreements and a simple cancellation mechanism.";
  }

  if (province === "Quebec" || province === "quebec" || province === "Qu\u00e9bec") {
    if (lower.includes("privacy") || lower.includes("data") || lower.includes("personal information")) return "Quebec's Law 25 (in force since September 2023) imposes strict requirements including privacy impact assessments, consent management, and data portability rights.";
    if (lower.includes("non-compete")) return "Under the Civil Code of Quebec (art. 2089), non-compete clauses must be limited in time, territory, and activity, and must be in writing.";
    if (lower.includes("language") || lower.includes("french")) return "Quebec's Charter of the French Language requires consumer-facing agreements to be available in French.";
  }

  if (province === "British Columbia" || province === "BC") {
    if (lower.includes("termination") || lower.includes("severance")) return "BC's Employment Standards Act sets minimum notice requirements. Unlike Ontario, BC does not have a separate statutory severance pay obligation.";
  }

  if (province === "Alberta" || province === "alberta") {
    if (lower.includes("non-compete")) return "Alberta courts have historically been strict about enforcing non-compete clauses, requiring narrow scope, limited duration, and a legitimate business interest.";
  }

  if (lower.includes("securities") || lower.includes("accredited investor")) return "National Instrument 45-106 governs prospectus exemptions across Canadian provinces. Accredited investor verification requirements cannot be weakened.";
  if (lower.includes("ppsa") || lower.includes("security interest")) return `The ${province} Personal Property Security Act governs security interest registration. Ensure PPSA registrations are filed in the correct province.`;

  return null;
}

// ─── Message ID generator ───
let msgIdCounter = 0;
function nextMsgId(): string {
  msgIdCounter++;
  return `msg-${Date.now()}-${msgIdCounter}`;
}

let modIdCounter = 0;
function nextModId(): string {
  modIdCounter++;
  return `mod-${modIdCounter}`;
}

let pendingIdCounter = 0;
function nextPendingId(): string {
  pendingIdCounter++;
  return `pending-${Date.now()}-${pendingIdCounter}`;
}

// ─── Simulated Ruby Response (placeholder for real AI integration) ───
function generateRubyResponse(
  userText: string,
  session: SessionData,
  detectedCategory: ModificationCategory | null,
  messageHistory: ChatMessage[],
  userMessageCount: number
): { content: string; quickActions?: QuickAction[]; clausePreview?: ClausePreview; provinceTip?: string; riskFlag?: string } {
  const lower = userText.toLowerCase();
  const province = session.governingLaw || "Ontario";

  // Province tip detection
  const provinceTip = getProvinceTip(userText, province) || undefined;

  // Risk detection
  const risks = detectRisks(userText, detectedCategory);
  const riskFlag = risks.length > 0 ? risks[0] : undefined;

  // Determine response based on context
  const catName = detectedCategory?.name || "your contract";

  // Handle threshold / numeric changes
  if (lower.match(/\b(change|increase|decrease|extend|reduce|shorten|raise|lower)\b.*\b(\d+)\b/)) {
    const match = lower.match(/\b(change|increase|decrease|extend|reduce|shorten|raise|lower)\b/);
    const numMatch = lower.match(/\b(\d+)\b/);
    const action = match ? match[1] : "change";
    const number = numMatch ? numMatch[1] : "";

    return {
      content: `I can ${action} that to ${number}. Let me show you how the clause would read with this change.`,
      clausePreview: {
        title: `${catName} - Proposed Change`,
        current: `[Current clause language will be populated from your contract template]`,
        proposed: `[Updated language reflecting the ${action} to ${number} will appear here]`,
      },
      quickActions: [
        { label: "Looks good, apply this", value: "apply" },
        { label: "Adjust the number", value: "adjust" },
        { label: "Show me the full clause", value: "full-clause" },
      ],
      provinceTip,
      riskFlag,
    };
  }

  // Handle non-compete discussions
  if (lower.includes("non-compete")) {
    const isOntario = province === "Ontario";
    return {
      content: isOntario
        ? `I should flag something important: since your agreement is governed by Ontario law, non-compete clauses for employees are **unenforceable under the ESA (s.67.2)** unless the employee is a C-suite executive (i.e., Chief Executive Officer, President, Chief Administrative Officer, Chief Operating Officer, Chief Financial Officer, Chief Information Officer, Chief Legal Officer, Chief Human Resources Officer, or Chief Corporate Development Officer).\n\nWould you like me to:\n- Draft a **non-solicitation clause** instead (which is enforceable in Ontario)\n- Proceed with the non-compete if this is for a C-suite executive\n- Draft a narrower **non-competition** clause appropriate for a C-suite role`
        : `I can adjust the non-compete clause in your ${catName} section. To draft the best version, I need to understand the scope you're looking for.`,
      quickActions: isOntario
        ? [
            { label: "Draft a non-solicit instead", value: "I'd like a non-solicitation clause instead of a non-compete" },
            { label: "This is for C-suite", value: "This is for a C-suite executive, proceed with non-compete" },
            { label: "Tell me more about the rules", value: "What are the specific rules around non-competes in Ontario?" },
          ]
        : [
            { label: "12-month duration", value: "Set the non-compete duration to 12 months" },
            { label: "24-month duration", value: "Set the non-compete duration to 24 months" },
            { label: "Custom period", value: "I want a custom non-compete period" },
          ],
      provinceTip,
      riskFlag,
    };
  }

  // Handle termination/severance
  if (lower.includes("termination") || lower.includes("severance") || lower.includes("notice period")) {
    return {
      content: `I can customize the termination and severance provisions in your ${session.contractTitle}. Under ${province} law, there are both statutory minimums and common law considerations to keep in mind.\n\nWhat specifically would you like to adjust?`,
      quickActions: [
        { label: "Increase severance formula", value: "Increase the severance formula to 2 weeks per year of service" },
        { label: "Extend notice period", value: "Extend the notice period to 6 months" },
        { label: "Add change-of-control trigger", value: "Add a double-trigger change of control provision" },
        { label: "Add garden leave", value: "Add a garden leave provision during the notice period" },
      ],
      provinceTip,
      riskFlag,
    };
  }

  // Handle "apply" or acceptance
  if (lower.includes("looks good") || lower.includes("apply") || lower === "yes" || lower.includes("that works") || lower.includes("perfect")) {
    return {
      content: `I've recorded that modification. You can continue making more changes, or click **Confirm & Proceed** when you're ready to review pricing and proceed.\n\nIs there anything else you'd like to adjust?`,
      quickActions: [
        { label: "Make another change", value: "I'd like to make another change" },
        { label: "Show me what changed", value: "Show me a summary of all changes so far" },
      ],
      provinceTip,
      riskFlag,
    };
  }

  // Handle removal requests
  if (lower.includes("remove") || lower.includes("delete") || lower.includes("take out")) {
    return {
      content: `I can remove that provision. Before I do, I want to make sure you understand the implications:\n\n- Removing clauses may affect the enforceability or balance of your agreement\n- Some clauses serve as protective "savings" provisions required by regulation\n\nWould you like me to proceed with the removal, or would you prefer to modify the clause instead of removing it entirely?`,
      quickActions: [
        { label: "Proceed with removal", value: "Yes, remove the clause entirely" },
        { label: "Modify instead", value: "Let's modify it instead of removing it" },
        { label: "What are the risks?", value: "What specific risks come with removing this clause?" },
      ],
      provinceTip,
      riskFlag,
    };
  }

  // Handle addition requests
  if (lower.includes("add") || lower.includes("include") || lower.includes("insert") || lower.includes("new provision") || lower.includes("new clause")) {
    return {
      content: `I can add that to your ${session.contractTitle}. To draft the best version, could you tell me:\n\n1. **Who should this provision primarily protect?** (you, the other party, or both equally)\n2. **Any specific thresholds or numbers** you have in mind?\n\nOr I can draft a balanced version and you can adjust from there.`,
      quickActions: [
        { label: "Protect me (my company)", value: "Draft it to protect me / my company" },
        { label: "Balanced for both parties", value: "Draft a balanced version for both parties" },
        { label: "Draft it and I'll adjust", value: "Just draft a balanced version and I'll adjust" },
      ],
      provinceTip,
      riskFlag,
    };
  }

  // Handle summary requests
  if (lower.includes("summary") || lower.includes("what changed") || lower.includes("changes so far")) {
    const userMsgCount = messageHistory.filter((m) => m.role === "user").length;
    return {
      content: `Here's a summary of the modifications discussed so far:\n\n${userMsgCount > 0 ? `We've discussed **${userMsgCount} change${userMsgCount > 1 ? "s" : ""}** to your ${session.contractTitle}.\n\nClick **Finalize Changes** in the header to see the full breakdown with pricing.` : "No modifications have been finalized yet. Tell me what you'd like to change and I'll draft it for you."}`,
      provinceTip,
      riskFlag,
    };
  }

  // Generic / first-time response with contextual guidance
  if (detectedCategory) {
    const chips = SUGGESTION_CHIPS[detectedCategory.id] || [];
    return {
      content: `I can see this relates to **${detectedCategory.name}**. ${detectedCategory.clauseIds ? `This section involves ${detectedCategory.clauseIds.length} related provisions in your agreement.` : ""}\n\nCould you be more specific about what you'd like to change? For example, are you looking to modify an existing term, add something new, or remove a provision?`,
      quickActions: chips.slice(0, 3).map((c) => ({ label: c, value: c })),
      provinceTip,
      riskFlag,
    };
  }

  // Fallback with helpful suggestions
  return {
    content: `I'd be happy to help with that. To make sure I draft the right modification, could you tell me a bit more about:\n\n- **Which part** of the agreement you'd like to change\n- **What outcome** you're looking for\n\nOr you can pick one of the common modifications below and I'll guide you through it.`,
    quickActions: [
      { label: "Show me common changes for this contract", value: `What are the most common modifications for a ${session.contractTitle}?` },
      { label: "I'll describe what I need", value: "Let me describe what I need in my own words" },
    ],
    provinceTip,
    riskFlag,
  };
}

// ─── Render Markdown-light (bold only) ───
function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Step definitions ───
const STEPS = [
  { number: 1, label: "Your Contract" },
  { number: 2, label: "Select Category" },
  { number: 3, label: "Describe Change" },
  { number: 4, label: "Review with Ruby" },
  { number: 5, label: "Order & Pay" },
];

// ═══════════════════════════════════════════════════════════
// ═══ Main Component ═══
// ═══════════════════════════════════════════════════════════
export default function CustomizePage() {
  // ─── State ───
  const [session, setSession] = useState<SessionData>({
    contractType: "",
    contractTitle: "",
    tier: "",
    governingLaw: "Ontario",
    selected: {},
  });

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<ModificationCategory | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);

  // Step 3 state
  const [changeDescription, setChangeDescription] = useState("");

  // Step 4 chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<ModificationCategory | null>(null);

  // Step 5 / order state
  const [modifications, setModifications] = useState<ModificationRecord[]>([]);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [deliveryTier, setDeliveryTier] = useState<"ai-only" | "lawyer-standard" | "lawyer-priority">("ai-only");
  const [orderComplete, setOrderComplete] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Load session data ───
  useEffect(() => {
    const type = sessionStorage.getItem("ruby-contract-type") || "employment";
    const title = sessionStorage.getItem("ruby-contract-title") || "Standard Employment Agreement";
    const tier = sessionStorage.getItem("ruby-tier") || "standard";
    let selected: Record<string, unknown> = {};
    try {
      const raw = sessionStorage.getItem("ruby-selected");
      if (raw) selected = JSON.parse(raw);
    } catch {
      // ignore parse errors
    }
    const governingLaw = (selected?.province as string) || (selected?.governingLaw as string) || (selected?.jurisdiction as string) || "Ontario";
    setSession({ contractType: type, contractTitle: title, tier, governingLaw, selected });
  }, []);

  // ─── Categories for this contract type ───
  const categories = [
    ...(CONTRACT_CATEGORIES[session.contractType] || CONTRACT_CATEGORIES["employment"] || []),
    ...UNIVERSAL_CATEGORIES,
  ];

  // ─── Scroll to latest message ───
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // ─── Any modification requires lawyer? ───
  const anyRequiresLawyer = modifications.some((m) => m.requiresLawyerReview);

  // ─── Pricing ───
  const subtotal = modifications.reduce((sum, mod, i) => {
    const discount = volumeDiscount(i);
    return sum + mod.baseFee * (1 - discount);
  }, 0);
  const lawyerAddon = deliveryTier === "lawyer-standard" ? LAWYER_ADDON.standard : deliveryTier === "lawyer-priority" ? LAWYER_ADDON.priority : 0;
  const total = subtotal + lawyerAddon * modifications.length;

  // ─── Send message handler (Step 4 chat) ───
  const handleSend = useCallback(
    (text?: string) => {
      const content = (text || chatInput).trim();
      if (!content || isTyping) return;

      const userMsg: ChatMessage = {
        id: nextMsgId(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setChatInput("");
      setIsTyping(true);

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      const detected = detectCategory(content, categories);
      if (detected) setDetectedCategory(detected);

      setTimeout(() => {
        const response = generateRubyResponse(content, session, detected || detectedCategory, messages, messages.filter((m) => m.role === "user").length + 1);

        const rubyMsg: ChatMessage = {
          id: nextMsgId(),
          role: "ruby",
          content: response.content,
          timestamp: new Date(),
          quickActions: response.quickActions,
          clausePreview: response.clausePreview,
          provinceTip: response.provinceTip,
          riskFlag: response.riskFlag,
        };

        setMessages((prev) => [...prev, rubyMsg]);
        setIsTyping(false);

        // Track modification if response indicates a change was captured
        if (content.toLowerCase().includes("apply") || content.toLowerCase() === "yes" || content.toLowerCase().includes("looks good") || content.toLowerCase().includes("that works")) {
          const prevUserMessages = messages.filter((m) => m.role === "user");
          const lastSubstantive = prevUserMessages[prevUserMessages.length - 1];
          if (lastSubstantive) {
            const cat = detected || detectedCategory;
            const risks = detectRisks(lastSubstantive.content, cat);
            const tier = determineComplexity(messages.length, cat, risks);
            const mod: ModificationRecord = {
              id: nextModId(),
              category: cat?.name || "Custom Modification",
              summary: lastSubstantive.content.length > 80 ? lastSubstantive.content.slice(0, 77) + "..." : lastSubstantive.content,
              complexityTier: tier,
              baseFee: COMPLEXITY_PRICING[tier].base,
              riskFlags: risks,
              requiresLawyerReview: requiresMandatoryLawyerReview(lastSubstantive.content, cat),
              messages: [...messages, userMsg, rubyMsg],
            };
            setModifications((prev) => [...prev, mod]);
            // Also mark the pending change as confirmed
            setPendingChanges((prev) => prev.map((pc) => ({ ...pc, confirmed: true })));
          }
        }
      }, 1200 + Math.random() * 800);
    },
    [chatInput, isTyping, categories, session, detectedCategory, messages]
  );

  // ─── Keyboard handler for textarea ───
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Auto-resize textarea ───
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  // ─── Finalize / checkout ───
  const handleCheckout = () => {
    setOrderComplete(true);
  };

  // ─── Move to Step 4 with opening message ───
  const initializeRubyChat = useCallback((change: PendingChange) => {
    const province = session.governingLaw || "Ontario";
    const risks = change.riskFlags;
    const complexity = determineComplexity(1, change.category, risks);
    const needsLawyer = requiresMandatoryLawyerReview(change.description, change.category);

    let reviewContent = `I've reviewed your proposed modification:\n\n`;
    reviewContent += `**Category:** ${change.category.name}\n`;
    reviewContent += `**Your request:** "${change.description}"\n\n`;

    if (change.category.clauseIds && change.category.clauseIds.length > 0) {
      reviewContent += `This touches **${change.category.clauseIds.length} related clause${change.category.clauseIds.length > 1 ? "s" : ""}** in your agreement. `;
    }

    reviewContent += `I've assessed this as a **${COMPLEXITY_PRICING[complexity].label}** modification ($${COMPLEXITY_PRICING[complexity].base} CAD).\n\n`;

    if (risks.length > 0) {
      reviewContent += `I've flagged ${risks.length} risk consideration${risks.length > 1 ? "s" : ""} for you to review.\n\n`;
    }

    if (needsLawyer) {
      reviewContent += `**Note:** This modification requires mandatory lawyer review due to regulatory requirements.\n\n`;
    }

    if (change.provinceTip) {
      reviewContent += `I also have a ${province}-specific consideration to flag.\n\n`;
    }

    reviewContent += `Would you like me to proceed with drafting this change, or would you like to refine anything first?`;

    const openingMsg: ChatMessage = {
      id: nextMsgId(),
      role: "ruby",
      content: reviewContent,
      timestamp: new Date(),
      riskFlag: risks.length > 0 ? risks[0] : undefined,
      provinceTip: change.provinceTip || undefined,
      clausePreview: {
        title: `${change.category.name} - Proposed Change`,
        current: `[Current clause language from your ${session.contractTitle}]`,
        proposed: `[Draft reflecting: "${change.description}"]`,
      },
      quickActions: [
        { label: "Looks good, apply this", value: "Looks good, apply this change" },
        { label: "I want to adjust this", value: "I'd like to refine what I described" },
        { label: "Tell me more about the risks", value: "What specific risks should I know about?" },
      ],
    };

    setMessages([openingMsg]);
    setDetectedCategory(change.category);
    setCurrentStep(4);
  }, [session]);

  // ─── Handle adding a change from Step 3 ───
  const handleAddChange = () => {
    if (!changeDescription.trim() || !selectedCategory) return;

    const risks = detectRisks(changeDescription, selectedCategory);
    const tip = getProvinceTip(changeDescription, session.governingLaw);

    const newChange: PendingChange = {
      id: nextPendingId(),
      category: selectedCategory,
      description: changeDescription.trim(),
      riskFlags: risks,
      provinceTip: tip,
      confirmed: false,
    };

    setPendingChanges((prev) => [...prev, newChange]);
    setChangeDescription("");

    // Move to Step 4 to review with Ruby
    initializeRubyChat(newChange);
  };

  // ─── Handle chip click in Step 3 ───
  const handleStep3ChipClick = (chip: string) => {
    setChangeDescription(chip);
  };

  // ─── Navigate steps ───
  const goToStep = (step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  };

  // ─── Tier label ───
  const tierLabel = session.tier === "standard" ? "Standard" : session.tier === "premium" ? "Premium" : session.tier === "basic" ? "Basic" : session.tier || "Standard";

  // ═══════════════════════════════════════════════════════════
  // ═══ Progress Bar Component ═══
  // ═══════════════════════════════════════════════════════════
  const ProgressBar = () => (
    <div className="bg-white border-b border-neutral-200 py-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep === step.number
                      ? "bg-[#be123c] text-white shadow-md shadow-rose-200"
                      : currentStep > step.number
                      ? "bg-emerald-500 text-white"
                      : "bg-white border-2 border-neutral-300 text-neutral-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`text-[10px] sm:text-[11px] mt-1.5 font-medium whitespace-nowrap ${
                  currentStep === step.number ? "text-[#be123c]" : currentStep > step.number ? "text-emerald-600" : "text-neutral-400"
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 sm:mx-3 mt-[-18px] ${
                  currentStep > step.number ? "bg-emerald-400" : "bg-neutral-200"
                }`} />
              )}
            </div>
          ))}
        </div>
        {pendingChanges.length > 0 && (
          <div className="mt-2 text-center">
            <span className="text-[11px] font-medium text-[#be123c] bg-rose-50 px-2.5 py-0.5 rounded-full">
              {pendingChanges.length} modification{pendingChanges.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // ═══ Pending Changes Sidebar ═══
  // ═══════════════════════════════════════════════════════════
  const PendingChangesSidebar = () => {
    if (pendingChanges.length === 0 || currentStep < 2 || currentStep > 4) return null;
    return (
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-4">
        <p className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide mb-2">Modifications ({pendingChanges.length})</p>
        <div className="space-y-2">
          {pendingChanges.map((pc) => (
            <div key={pc.id} className="flex items-center gap-2 text-[13px]">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pc.confirmed ? "bg-emerald-500" : "bg-amber-400"}`} />
              <span className="text-neutral-600 truncate flex-1">{pc.category.name}: {pc.description.length > 40 ? pc.description.slice(0, 37) + "..." : pc.description}</span>
              {pc.confirmed && (
                <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <button
                onClick={() => setPendingChanges((prev) => prev.filter((p) => p.id !== pc.id))}
                className="text-neutral-300 hover:text-red-500 transition-colors shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // ═══ ORDER COMPLETE VIEW ═══
  // ═══════════════════════════════════════════════════════════
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="space-y-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3">
                {deliveryTier === "ai-only" ? "Your customized contract is ready" : "Submitted for lawyer review"}
              </h1>
              <p className="text-neutral-500 max-w-lg mx-auto text-sm leading-relaxed">
                {deliveryTier === "ai-only"
                  ? "Your customized contract has been generated and is ready to download."
                  : `Your contract has been submitted for lawyer review. Expected turnaround: ${deliveryTier === "lawyer-priority" ? "24 hours" : "3-5 business days"}.`}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2 text-[14px] text-neutral-600">
              <span className="font-medium">Order ref:</span>
              <span className="font-mono">RBY-{Date.now().toString(36).toUpperCase()}</span>
            </div>

            {/* Modifications summary */}
            <div className="max-w-md mx-auto space-y-3">
              {modifications.map((mod) => (
                <div key={mod.id} className="bg-white border border-neutral-200 rounded-lg px-4 py-3 text-left flex items-center gap-3">
                  <span className="flex items-center justify-center w-1.5 h-1.5 rounded-full bg-[#be123c] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">{mod.category}</p>
                    <p className="text-[13px] text-neutral-400 truncate">{mod.summary}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${COMPLEXITY_COLORS[mod.complexityTier].bg} ${COMPLEXITY_COLORS[mod.complexityTier].text}`}>
                    {COMPLEXITY_PRICING[mod.complexityTier].label}
                  </span>
                </div>
              ))}
            </div>

            {/* Status tracker for lawyer review */}
            {deliveryTier !== "ai-only" && (
              <div className="max-w-sm mx-auto">
                <p className="text-[14px] font-semibold text-neutral-500 uppercase tracking-wide mb-4">Status</p>
                <div className="space-y-0">
                  {[
                    { label: "Submitted", desc: "Your contract is in the review queue.", done: true },
                    { label: "In Review", desc: "A lawyer is reviewing your customizations.", done: false },
                    { label: "Clarification Needed", desc: "The reviewing lawyer may have a question.", done: false },
                    { label: "Approved", desc: "Your customized contract is ready.", done: false },
                  ].map((s, i) => (
                    <div key={i}>
                      <div className="flex items-start gap-3 py-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${s.done ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-400"}`}>
                          {s.done ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-[10px] font-medium">{i + 1}</span>
                          )}
                        </div>
                        <div className="text-left">
                          <p className={`text-sm ${s.done ? "text-neutral-900 font-medium" : "text-neutral-400"}`}>{s.label}</p>
                          <p className="text-[13px] text-neutral-400 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                      {i < 3 && <div className={`ml-3 w-px h-3 ${i === 0 ? "bg-emerald-300" : "bg-neutral-200"}`} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deliveryTier === "ai-only" && (
              <p className="text-[13px] text-neutral-400 max-w-md mx-auto">This contract was drafted by Ruby and has not been reviewed by a lawyer.</p>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              {deliveryTier === "ai-only" && (
                <button className="inline-flex items-center justify-center gap-2 bg-[#be123c] text-white rounded-xl px-6 py-3.5 text-sm font-semibold hover:bg-[#9f1239] transition-colors active:scale-[0.98]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Customized Contract
                </button>
              )}
              <Link href="/documents" className="inline-flex items-center justify-center gap-2 border border-neutral-200 rounded-xl px-6 py-3.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                Back to Agreements
              </Link>
            </div>

            {/* Upgrade path for AI-only */}
            {deliveryTier === "ai-only" && (
              <div className="max-w-md mx-auto bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                <p className="text-sm font-medium text-neutral-900 mb-1">Want a lawyer to review your customizations?</p>
                <p className="text-[14px] text-neutral-500 leading-relaxed mb-3">Upgrade to lawyer review at any time. You&apos;ll only pay the review add-on.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="text-[15px] text-[#be123c] font-medium hover:underline">Standard Review (+${LAWYER_ADDON.standard})</button>
                  <span className="text-neutral-300 hidden sm:inline">|</span>
                  <button className="text-[15px] text-[#be123c] font-medium hover:underline">Priority Review (+${LAWYER_ADDON.priority})</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ═══ MAIN 5-STEP WIZARD ═══
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ─── Header ─── */}
      <header className="shrink-0 border-b border-neutral-200 bg-white z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {currentStep > 1 && (
              <button
                onClick={() => {
                  if (currentStep === 5) { setCurrentStep(4); setShowOrderSummary(false); }
                  else if (currentStep === 4) setCurrentStep(3);
                  else if (currentStep === 3) setCurrentStep(2);
                  else if (currentStep === 2) setCurrentStep(1);
                }}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#be123c] shrink-0">
              <span className="text-white text-sm font-bold">R</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] font-semibold text-neutral-900 truncate font-serif">
                Ruby &mdash; Customization Wizard
              </h1>
              <p className="text-[12px] text-neutral-400 truncate">
                {session.contractTitle} &middot; {session.governingLaw} law &middot; Step {currentStep} of 5
              </p>
            </div>
          </div>
        </div>

        {/* Legal advice disclaimer */}
        <div className="bg-neutral-50 border-t border-neutral-100 px-4 sm:px-6 py-2">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-[12px] text-neutral-400">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ruby helps you customize your agreement but does not provide legal advice.</span>
          </div>
        </div>
      </header>

      {/* ─── Progress Bar ─── */}
      <ProgressBar />

      {/* ─── Step Content ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* ═══ STEP 1: Your Contract ═══ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 font-serif">Your Contract</h2>
                <p className="text-neutral-500 mt-2 text-sm">Your base draft has been generated and is ready for customization.</p>
              </div>

              {/* Contract Summary Card */}
              <div className="max-w-lg mx-auto bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-50">
                    <svg className="w-6 h-6 text-[#be123c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 font-serif">{session.contractTitle}</h3>
                    <p className="text-sm text-neutral-400">Base draft generated</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Type</p>
                    <p className="text-sm text-neutral-700 mt-0.5 capitalize">{session.contractType || "Employment"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Province</p>
                    <p className="text-sm text-neutral-700 mt-0.5">{session.governingLaw}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Tier</p>
                    <p className="text-sm text-neutral-700 mt-0.5">{tierLabel}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Status</p>
                    <p className="text-sm text-emerald-600 mt-0.5 font-medium">Ready</p>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4 space-y-3">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#be123c] text-white rounded-xl px-6 py-3.5 text-sm font-semibold hover:bg-[#9f1239] transition-colors active:scale-[0.98]"
                  >
                    Customize This Contract
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="flex gap-3">
                    <button className="flex-1 inline-flex items-center justify-center gap-2 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Base Draft
                    </button>
                    <Link
                      href="/documents"
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      Skip Customization
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Select Category ═══ */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 font-serif">What do you want to modify?</h2>
                <p className="text-neutral-500 mt-2 text-sm">Select a category to get started.</p>
              </div>

              <PendingChangesSidebar />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setChangeDescription("");
                      setCurrentStep(3);
                    }}
                    className="text-left border border-neutral-200 rounded-xl p-4 sm:p-5 hover:border-[#be123c] hover:bg-[rgba(190,18,60,0.01)] transition-all group active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 text-neutral-500 font-mono text-[13px] font-bold shrink-0 group-hover:bg-rose-50 group-hover:text-[#be123c] transition-colors">
                        {cat.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-neutral-900 group-hover:text-[#be123c] transition-colors">{cat.name}</p>
                        <p className="text-[13px] text-neutral-500 mt-0.5 leading-relaxed">{cat.description}</p>
                        <p className="text-[12px] text-neutral-400 mt-1.5 italic">e.g. {cat.example}</p>
                      </div>
                      <svg className="w-4 h-4 text-neutral-300 group-hover:text-[#be123c] shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Describe Your Change ═══ */}
          {currentStep === 3 && selectedCategory && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 font-serif">Describe Your Change</h2>
                <p className="text-neutral-500 mt-2 text-sm">Tell us what you would like to change.</p>
              </div>

              <PendingChangesSidebar />

              {/* Selected category badge */}
              <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                <div className="flex items-center justify-center w-7 h-7 rounded bg-white text-[#be123c] font-mono text-[11px] font-bold border border-rose-100">
                  {selectedCategory.icon}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#9f1239]">{selectedCategory.name}</p>
                  <p className="text-[11px] text-rose-400">{selectedCategory.description}</p>
                </div>
                <button onClick={() => setCurrentStep(2)} className="ml-2 text-rose-300 hover:text-rose-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Suggestion chips */}
              {(SUGGESTION_CHIPS[selectedCategory.id] || SUGGESTION_CHIPS["default"]).length > 0 && (
                <div>
                  <p className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">Common requests</p>
                  <div className="flex flex-wrap gap-2">
                    {(SUGGESTION_CHIPS[selectedCategory.id] || SUGGESTION_CHIPS["default"]).map((chip) => (
                      <button
                        key={chip}
                        onClick={() => handleStep3ChipClick(chip)}
                        className={`text-[12px] sm:text-[13px] px-3.5 py-2 rounded-lg border transition-all whitespace-nowrap active:scale-[0.97] ${
                          changeDescription === chip
                            ? "border-[#be123c] text-[#be123c] bg-rose-50"
                            : "border-neutral-200 text-neutral-600 bg-white hover:border-[#be123c] hover:text-[#be123c] hover:bg-[rgba(190,18,60,0.02)]"
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text input area */}
              <div>
                <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">Describe what you&apos;d like to change</label>
                <textarea
                  ref={descInputRef}
                  value={changeDescription}
                  onChange={(e) => setChangeDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && changeDescription.trim()) {
                      e.preventDefault();
                      handleAddChange();
                    }
                  }}
                  placeholder={`e.g. "${selectedCategory.example}"`}
                  rows={3}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-[14px] sm:text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-[rgba(190,18,60,0.15)] focus:border-[#be123c] outline-none resize-none transition-all"
                />
              </div>

              {/* Inline risk flags */}
              {changeDescription.trim() && detectRisks(changeDescription, selectedCategory).length > 0 && (
                <div className="space-y-2">
                  {detectRisks(changeDescription, selectedCategory).map((risk, i) => (
                    <div key={i} className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-[13px] text-amber-800 leading-relaxed">{risk}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Province tip */}
              {changeDescription.trim() && getProvinceTip(changeDescription, session.governingLaw) && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-[12px] font-semibold text-blue-700 uppercase tracking-wide mb-0.5">{session.governingLaw} Consideration</p>
                    <p className="text-[13px] text-blue-800 leading-relaxed">{getProvinceTip(changeDescription, session.governingLaw)}</p>
                  </div>
                </div>
              )}

              {/* Continue button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  Back to categories
                </button>
                <button
                  onClick={handleAddChange}
                  disabled={!changeDescription.trim()}
                  className="inline-flex items-center gap-2 bg-[#be123c] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-[#9f1239] transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 4: Review with Ruby ═══ */}
          {currentStep === 4 && (
            <div className="flex flex-col" style={{ minHeight: "calc(100vh - 280px)" }}>
              <PendingChangesSidebar />

              {/* Chat Messages */}
              <div ref={chatContainerRef} className="flex-1 space-y-5 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "ruby" && (
                      <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#be123c] shrink-0 mt-0.5">
                          <span className="text-white text-[11px] font-bold">R</span>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm px-4 py-3">
                            <p className="text-[14px] sm:text-[15px] leading-relaxed text-neutral-900 whitespace-pre-wrap">{renderContent(msg.content)}</p>
                          </div>

                          {msg.riskFlag && (
                            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 flex items-start gap-2">
                              <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <p className="text-[13px] text-amber-800 leading-relaxed">{msg.riskFlag}</p>
                            </div>
                          )}

                          {msg.provinceTip && (
                            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 flex items-start gap-2">
                              <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="text-[12px] font-semibold text-blue-700 uppercase tracking-wide mb-0.5">{session.governingLaw} Consideration</p>
                                <p className="text-[13px] text-blue-800 leading-relaxed">{msg.provinceTip}</p>
                              </div>
                            </div>
                          )}

                          {msg.clausePreview && (
                            <div className="rounded-xl border border-neutral-200 overflow-hidden">
                              <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
                                <p className="text-[13px] font-semibold text-neutral-700">{msg.clausePreview.title}</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
                                <div className="px-4 py-3">
                                  <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-1.5">Current</p>
                                  <p className="text-[13px] text-neutral-600 leading-relaxed">{msg.clausePreview.current}</p>
                                </div>
                                <div className="px-4 py-3 bg-emerald-50/30">
                                  <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">Proposed</p>
                                  <p className="text-[13px] text-neutral-700 leading-relaxed">{msg.clausePreview.proposed}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {msg.quickActions && msg.quickActions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {msg.quickActions.map((action) => (
                                <button
                                  key={action.label}
                                  onClick={() => handleSend(action.value)}
                                  disabled={isTyping}
                                  className="text-[13px] px-3.5 py-2 rounded-lg border border-neutral-200 text-neutral-700 bg-white hover:border-[#be123c] hover:text-[#be123c] hover:bg-[rgba(190,18,60,0.02)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {msg.role === "user" && (
                      <div className="max-w-[85%] sm:max-w-[75%]">
                        <div className="bg-[#be123c] text-white rounded-2xl rounded-tr-sm px-4 py-3">
                          <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    )}

                    {msg.role === "system" && (
                      <div className="w-full">
                        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2">
                          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-[14px] text-amber-800 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#be123c] shrink-0 mt-0.5">
                        <span className="text-white text-[11px] font-bold">R</span>
                      </div>
                      <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input Area for Step 4 */}
              <div className="border-t border-neutral-200 bg-white pt-3 mt-auto">
                {/* Chat input */}
                <div className="flex items-end gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <textarea
                      ref={inputRef}
                      value={chatInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Ruby a question or refine your request..."
                      rows={1}
                      disabled={isTyping}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 pr-12 text-[14px] sm:text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-[rgba(190,18,60,0.15)] focus:border-[#be123c] outline-none resize-none transition-all disabled:opacity-60"
                      style={{ maxHeight: "120px" }}
                    />
                  </div>
                  <button
                    onClick={() => handleSend()}
                    disabled={!chatInput.trim() || isTyping}
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#be123c] text-white hover:bg-[#9f1239] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 active:scale-[0.95] mb-[1px]"
                    aria-label="Send message"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                    </svg>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-300 text-center mb-3">Press Enter to send, Shift+Enter for new line</p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setChangeDescription("");
                      setCurrentStep(2);
                    }}
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Another Modification
                  </button>
                  <button
                    onClick={() => {
                      // Convert pending changes to modification records if not already done
                      for (const pc of pendingChanges) {
                        if (!pc.confirmed) {
                          const complexity = determineComplexity(messages.length, pc.category, pc.riskFlags);
                          const mod: ModificationRecord = {
                            id: nextModId(),
                            category: pc.category.name,
                            summary: pc.description.length > 80 ? pc.description.slice(0, 77) + "..." : pc.description,
                            complexityTier: complexity,
                            baseFee: COMPLEXITY_PRICING[complexity].base,
                            riskFlags: pc.riskFlags,
                            requiresLawyerReview: requiresMandatoryLawyerReview(pc.description, pc.category),
                            messages: [...messages],
                          };
                          setModifications((prev) => [...prev, mod]);
                          setPendingChanges((prev) => prev.map((p) => p.id === pc.id ? { ...p, confirmed: true } : p));
                        }
                      }
                      setShowOrderSummary(true);
                      setCurrentStep(5);
                    }}
                    disabled={pendingChanges.length === 0}
                    className="inline-flex items-center gap-2 bg-[#be123c] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-[#9f1239] transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    Finalize Changes
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 5: Order Summary & Pay ═══ */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 font-serif">Order Summary &amp; Pay</h2>
                  <p className="text-sm text-neutral-500 mt-1">Review your customizations and choose a delivery option.</p>
                </div>
                <button
                  onClick={() => { setShowOrderSummary(false); setCurrentStep(4); }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to review
                </button>
              </div>

              {/* Modification cards */}
              <div className="space-y-3">
                {modifications.map((mod, i) => {
                  const tier = COMPLEXITY_COLORS[mod.complexityTier];
                  const discount = volumeDiscount(i);
                  const discountedFee = mod.baseFee * (1 - discount);
                  return (
                    <div key={mod.id} className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-neutral-900">{mod.category}</p>
                          <p className="text-[14px] text-neutral-500 mt-0.5">{mod.summary}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-block px-3 py-1 text-[13px] font-semibold rounded-full ${tier.bg} ${tier.text}`}>
                            {COMPLEXITY_PRICING[mod.complexityTier].label}
                          </span>
                          <span className="text-sm font-semibold text-neutral-900">${discountedFee.toFixed(0)}</span>
                        </div>
                      </div>
                      {discount > 0 && (
                        <p className="text-[13px] text-emerald-600 font-medium mt-2">Volume discount: -{Math.round(discount * 100)}%</p>
                      )}
                      {mod.riskFlags.length > 0 && (
                        <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/50 p-3 space-y-1">
                          {mod.riskFlags.map((flag, fi) => (
                            <p key={fi} className="text-[13px] text-amber-700 flex items-start gap-1.5">
                              <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              {flag}
                            </p>
                          ))}
                        </div>
                      )}
                      {mod.requiresLawyerReview && (
                        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                          <p className="text-[13px] text-rose-700 font-medium">This modification requires lawyer review due to regulatory requirements.</p>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setModifications((prev) => prev.filter((_, idx) => idx !== i));
                        }}
                        className="text-[13px] text-neutral-400 hover:text-red-600 font-medium transition-colors mt-3"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>

              {modifications.length === 0 && (
                <div className="text-center py-12 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <p className="text-neutral-400 text-sm">No modifications captured yet. Go back to review changes with Ruby.</p>
                  <button onClick={() => { setShowOrderSummary(false); setCurrentStep(4); }} className="mt-3 text-sm text-[#be123c] font-medium hover:underline">
                    Back to review
                  </button>
                </div>
              )}

              {modifications.length > 0 && (
                <>
                  {/* Delivery Options */}
                  <div>
                    <p className="text-[15px] font-semibold text-neutral-700 mb-3">Choose delivery option</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* AI-Only */}
                      <button
                        type="button"
                        onClick={() => !anyRequiresLawyer && setDeliveryTier("ai-only")}
                        className={`text-left border rounded-xl p-4 sm:p-6 transition-all ${anyRequiresLawyer ? "opacity-50 cursor-not-allowed border-neutral-200 bg-neutral-50" : deliveryTier === "ai-only" ? "border-[#be123c] border-2 bg-[rgba(190,18,60,0.02)]" : "border-neutral-200 hover:border-neutral-300"}`}
                      >
                        <p className="text-sm font-semibold text-neutral-900 mb-1">Engine-Drafted Contract</p>
                        <p className="text-[14px] text-neutral-500 leading-relaxed mb-3">Delivered immediately upon payment. Drafted by Ruby based on your instructions.</p>
                        <p className="text-[13px] text-neutral-400">Instant delivery</p>
                        <p className="text-[13px] text-neutral-400 mt-1">Not reviewed by a licensed lawyer</p>
                        {anyRequiresLawyer && (
                          <div className="mt-3 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2">
                            <p className="text-[13px] text-rose-700 font-medium">Engine-only delivery is unavailable. One or more modifications require lawyer review.</p>
                          </div>
                        )}
                      </button>

                      {/* Lawyer Review */}
                      <button
                        type="button"
                        onClick={() => setDeliveryTier("lawyer-standard")}
                        className={`text-left border rounded-xl p-4 sm:p-6 transition-all ${deliveryTier.startsWith("lawyer") ? "border-[#be123c] border-2 bg-[rgba(190,18,60,0.02)]" : "border-neutral-200 hover:border-neutral-300"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-neutral-900">Base Draft + Lawyer Review</p>
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Recommended</span>
                        </div>
                        <p className="text-[14px] text-neutral-500 leading-relaxed mb-3">Reviewed and approved by a licensed Canadian lawyer.</p>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-[14px] text-neutral-600 cursor-pointer">
                            <input type="radio" name="turnaround" checked={deliveryTier === "lawyer-standard"} onChange={() => setDeliveryTier("lawyer-standard")} className="accent-[#be123c]" />
                            Standard (3-5 days) +${LAWYER_ADDON.standard}
                          </label>
                          <label className="flex items-center gap-2 text-[14px] text-neutral-600 cursor-pointer">
                            <input type="radio" name="turnaround" checked={deliveryTier === "lawyer-priority"} onChange={() => setDeliveryTier("lawyer-priority")} className="accent-[#be123c]" />
                            Priority (24h) +${LAWYER_ADDON.priority}
                          </label>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-[13px] text-emerald-700 font-medium">Reviewed &amp; Approved by a Licensed Lawyer</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                    <div className="space-y-2 text-sm">
                      {modifications.map((mod, i) => {
                        const disc = volumeDiscount(i);
                        const fee = mod.baseFee * (1 - disc);
                        return (
                          <div key={mod.id} className="flex justify-between text-neutral-500 text-[14px]">
                            <span className="truncate mr-3">
                              {mod.category} ({COMPLEXITY_PRICING[mod.complexityTier].label})
                              {disc > 0 ? ` -${Math.round(disc * 100)}%` : ""}
                            </span>
                            <span className="shrink-0">${fee.toFixed(0)}</span>
                          </div>
                        );
                      })}
                      {deliveryTier !== "ai-only" && (
                        <div className="flex justify-between text-neutral-500 text-[14px]">
                          <span>Lawyer review ({deliveryTier === "lawyer-priority" ? "Priority 24h" : "Standard 3-5 days"}) x{modifications.length}</span>
                          <span>${(lawyerAddon * modifications.length).toFixed(0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-3 border-t border-neutral-200 text-neutral-900 font-semibold">
                        <span>Total</span>
                        <span>${total.toFixed(0)} CAD</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-2">
                    <button onClick={() => { setShowOrderSummary(false); setCurrentStep(4); }} className="text-[15px] text-neutral-500 hover:text-neutral-700 transition-colors">
                      Back to review
                    </button>
                    <button onClick={handleCheckout} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#be123c] text-white rounded-xl px-8 py-3.5 text-sm font-semibold hover:bg-[#9f1239] transition-colors active:scale-[0.98]">
                      Proceed to Checkout - ${total.toFixed(0)}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
