import type { Category } from "./agreements";

export type Severity = "critical" | "high" | "medium" | "low";

export interface ComplianceModule {
  id: string;
  name: string;
  shortName: string;
  category: Category;
  description: string;
  alwaysOn: boolean;
  severity: Severity;
  riskDescription: string;
}

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const MODULES: ComplianceModule[] = [
  // ── EMPLOYMENT (14) ──
  { id: "esa-2000", name: "ESA 2000 Baseline", shortName: "ESA", category: "employment", description: "Ontario Employment Standards Act mandatory minimums", alwaysOn: true, severity: "critical", riskDescription: "Non-compliance with ESA minimums renders termination clauses void and exposes the employer to Ministry of Labour complaints, back-pay orders, and potential common law notice liability." },
  { id: "waksdale", name: "Waksdale Compliance", shortName: "Waksdale", category: "employment", description: "Holistic termination section review per Waksdale v. Swegon", alwaysOn: true, severity: "critical", riskDescription: "A single ESA-non-compliant termination provision voids the entire termination section, exposing employer to full common law reasonable notice damages." },
  { id: "s67-2-prohibition", name: "s.67.2 Non-Compete Prohibition", shortName: "s.67.2", category: "employment", description: "Ontario non-compete ban for non-C-suite employees", alwaysOn: false, severity: "critical", riskDescription: "Including a non-compete for a non-C-suite Ontario employee renders the clause void and may invalidate the broader restrictive covenant section." },
  { id: "common-law-notice", name: "Common Law Notice", shortName: "CL Notice", category: "employment", description: "Reasonable notice calculation at common law", alwaysOn: false, severity: "high", riskDescription: "Failure to properly address common law notice entitlements may result in significantly higher termination costs than anticipated." },
  { id: "shafron-elsley", name: "Shafron/Elsley Enforceability", shortName: "Shafron", category: "employment", description: "Restrictive covenant reasonableness test", alwaysOn: false, severity: "high", riskDescription: "Restrictive covenants failing the Shafron/Elsley reasonableness test are unenforceable, leaving the employer without post-employment protections." },
  { id: "howard-benson", name: "Howard v. Benson Fixed-Term", shortName: "Howard", category: "employment", description: "Fixed-term early termination rules", alwaysOn: false, severity: "high", riskDescription: "Early termination of a fixed-term contract without a valid termination clause exposes employer to damages for the full remaining term." },
  { id: "sagaz", name: "Sagaz Misclassification", shortName: "Sagaz", category: "employment", description: "Contractor vs employee misclassification risk", alwaysOn: false, severity: "high", riskDescription: "Misclassifying an employee as a contractor triggers retroactive ESA entitlements, CPP/EI premiums, and potential CRA penalties." },
  { id: "copyright-s14", name: "Copyright Act s.14.1 Moral Rights", shortName: "Moral Rights", category: "employment", description: "Moral rights waiver for IP assignment", alwaysOn: false, severity: "medium", riskDescription: "Without a moral rights waiver, the creator retains the right to object to modifications of their work, blocking commercial exploitation of assigned IP." },
  { id: "provincial-esa", name: "Provincial ESA Equivalents", shortName: "Prov ESA", category: "employment", description: "Non-Ontario provincial employment standards", alwaysOn: false, severity: "high", riskDescription: "Applying Ontario ESA standards to an employee in another province may leave gaps in statutory compliance for that jurisdiction." },
  { id: "probation", name: "Probation Period Rules", shortName: "Probation", category: "employment", description: "Statutory and contractual probation requirements", alwaysOn: false, severity: "medium", riskDescription: "Improperly structured probation clauses may be unenforceable, obligating the employer to provide full notice or pay in lieu on termination." },
  { id: "benefits-continuation", name: "Benefits Continuation", shortName: "Benefits", category: "employment", description: "Post-termination benefits obligations", alwaysOn: false, severity: "medium", riskDescription: "Failure to continue benefits during the notice period may constitute a breach, increasing wrongful dismissal damages." },
  { id: "human-rights", name: "Human Rights Code", shortName: "HRC", category: "employment", description: "Accommodation, non-discrimination, harassment", alwaysOn: false, severity: "high", riskDescription: "Human rights violations expose the employer to HRTO complaints, damages for injury to dignity, and mandatory policy remediation orders." },
  { id: "ohsa", name: "OHSA 1990 Workplace Safety", shortName: "OHSA", category: "employment", description: "Workplace health and safety obligations", alwaysOn: false, severity: "high", riskDescription: "OHSA non-compliance can result in stop-work orders, fines up to $1.5M for corporations, and personal liability for directors and officers." },
  { id: "aoda", name: "Accessibility (AODA)", shortName: "AODA", category: "employment", description: "Accessibility for Ontarians with Disabilities Act", alwaysOn: false, severity: "medium", riskDescription: "AODA non-compliance results in administrative penalties up to $100K/day for corporations and reputational harm." },

  // ── CORPORATE (5) ──
  { id: "cbca-usa", name: "CBCA Unanimous Shareholder Agreement", shortName: "CBCA USA", category: "corporate", description: "CBCA s.146 USA compliance requirements", alwaysOn: false, severity: "critical", riskDescription: "A non-compliant USA may fail to validly restrict directors' powers, leaving shareholders without intended governance protections." },
  { id: "provincial-bca", name: "Provincial BCA", shortName: "Prov BCA", category: "corporate", description: "Provincial business corporations act compliance", alwaysOn: false, severity: "high", riskDescription: "Non-compliance with the governing provincial BCA may render corporate resolutions and share issuances voidable." },
  { id: "corp-securities", name: "Corporate Securities Compliance", shortName: "Corp Sec", category: "corporate", description: "Securities law requirements for corporate transactions", alwaysOn: false, severity: "critical", riskDescription: "Securities law violations can trigger rescission rights for investors, administrative penalties, and quasi-criminal liability." },
  { id: "corp-tax", name: "Corporate Tax Structuring", shortName: "Tax", category: "corporate", description: "Tax implications of corporate structure", alwaysOn: false, severity: "high", riskDescription: "Improper tax structuring may result in unexpected tax liabilities, loss of small business deduction, or adverse CRA reassessment." },
  { id: "oppression-remedy", name: "Minority Oppression Remedy", shortName: "s.241", category: "corporate", description: "CBCA s.241 minority shareholder oppression protections", alwaysOn: false, severity: "high", riskDescription: "Inadequate minority protections expose the corporation to oppression remedy claims with broad judicial remedies including buyout orders." },

  // ── INVESTMENT (4) ──
  { id: "ni-45-106", name: "NI 45-106 Prospectus Exemptions", shortName: "NI 45-106", category: "investment", description: "Prospectus exemption compliance for SAFE issuance", alwaysOn: false, severity: "critical", riskDescription: "Issuing securities without a valid prospectus exemption grants investors a statutory right of rescission and exposes directors to personal liability." },
  { id: "provincial-securities-inv", name: "Provincial Securities (Investment)", shortName: "Prov Sec", category: "investment", description: "Provincial securities legislation for investments", alwaysOn: false, severity: "high", riskDescription: "Each province has distinct securities requirements; non-compliance in the investor's jurisdiction triggers local enforcement action." },
  { id: "accredited-investor", name: "Accredited Investor Verification", shortName: "Accred Inv", category: "investment", description: "Accredited investor qualification and documentation", alwaysOn: false, severity: "critical", riskDescription: "Failing to verify accredited investor status invalidates the prospectus exemption reliance and exposes the issuer to rescission claims." },
  { id: "safe-conversion", name: "SAFE Conversion Mechanics", shortName: "Conversion", category: "investment", description: "Valuation cap, discount, and trigger mechanics", alwaysOn: false, severity: "high", riskDescription: "Ambiguous conversion mechanics create disputes at the qualifying financing, potentially delaying or blocking the funding round." },

  // ── COMMERCIAL (4) ──
  { id: "pipeda-commercial", name: "PIPEDA Commercial Compliance", shortName: "PIPEDA", category: "commercial", description: "Federal privacy legislation for commercial activities", alwaysOn: false, severity: "critical", riskDescription: "PIPEDA violations can result in Privacy Commissioner findings, Federal Court orders, and reputational damage from public reporting." },
  { id: "data-residency", name: "Data Residency Requirements", shortName: "Residency", category: "commercial", description: "Cross-border data transfer and storage requirements", alwaysOn: false, severity: "high", riskDescription: "Non-compliant cross-border data transfers expose the organization to privacy complaints and may breach contractual obligations to clients." },
  { id: "casl", name: "CASL Anti-Spam Compliance", shortName: "CASL", category: "commercial", description: "Canada Anti-Spam Legislation electronic messaging", alwaysOn: false, severity: "high", riskDescription: "CASL violations carry administrative monetary penalties up to $10M per violation for corporations under the private right of action." },
  { id: "sla-liability", name: "SLA Liability Framework", shortName: "SLA Liab", category: "commercial", description: "Service credit, liability cap, and force majeure framework", alwaysOn: false, severity: "medium", riskDescription: "Absent or poorly drafted SLA terms expose the service provider to unlimited liability and create ambiguity around service credit obligations." },
  // ── PLATFORM (3) ──
  { id: "quebec-law25", name: "Quebec Law 25 (Privacy)", shortName: "Law 25", category: "platform", description: "Quebec Act respecting the protection of personal information in the private sector — consent, transparency, and privacy officer requirements", alwaysOn: false, severity: "critical", riskDescription: "Law 25 violations carry administrative monetary penalties up to $25M or 4% of worldwide turnover, and mandatory breach notification requirements." },
  { id: "platform-pipeda", name: "PIPEDA Platform Compliance", shortName: "PIPEDA Plat", category: "platform", description: "Federal privacy legislation applied to platform data collection and user accounts", alwaysOn: false, severity: "critical", riskDescription: "Platform PIPEDA non-compliance risks Privacy Commissioner investigations, compliance orders, and public reporting of findings." },
  { id: "platform-casl", name: "CASL Platform Messaging", shortName: "CASL Plat", category: "platform", description: "Canada Anti-Spam Legislation for platform-originated electronic messages", alwaysOn: false, severity: "high", riskDescription: "Sending commercial electronic messages without valid consent exposes the platform to CASL penalties up to $10M per violation." },
  { id: "platform-data-residency", name: "Platform Data Residency", shortName: "Plat Resid", category: "platform", description: "Cross-border data transfer and storage requirements for platform user data", alwaysOn: false, severity: "high", riskDescription: "Storing user data outside Canada without adequate protections may violate PIPEDA and provincial privacy statutes." },

  // ── CREATOR (6) ──
  { id: "competition-act-s52", name: "Competition Act s.52 — Misleading Advertising", shortName: "Competition Act", category: "creator", description: "Mandatory influencer disclosure and material connection requirements", alwaysOn: true, severity: "critical", riskDescription: "Competition Act s.52 violations are a criminal offence carrying fines up to $200K and/or imprisonment up to 1 year on summary conviction." },
  { id: "asc-disclosure", name: "Ad Standards Canada — Testimonials", shortName: "ASC", category: "creator", description: "Ad Standards Canada disclosure standards for testimonials and endorsements", alwaysOn: true, severity: "high", riskDescription: "ASC non-compliance results in mandatory ad withdrawal orders, public notices, and reputational harm to both brand and creator." },
  { id: "copyright-moral-rights", name: "Copyright Act s.14.1 — Moral Rights", shortName: "Moral Rights", category: "creator", description: "Content creator moral rights waiver requirements", alwaysOn: true, severity: "high", riskDescription: "Without a moral rights waiver, the creator can block modifications or commercial uses of delivered content after assignment." },
  { id: "ftc-cross-border", name: "FTC Endorsement Guides (Cross-Border)", shortName: "FTC", category: "creator", description: "US audience triggers FTC 16 CFR 255 compliance", alwaysOn: false, severity: "high", riskDescription: "FTC enforcement actions for undisclosed endorsements carry civil penalties up to $50K per violation and injunctive relief." },
  { id: "agco-igaming", name: "AGCO iGaming Standards", shortName: "AGCO", category: "creator", description: "Ontario alcohol and gaming advertising restrictions for influencer content", alwaysOn: false, severity: "high", riskDescription: "AGCO violations can result in licence revocation for the operator and personal liability for the influencer under Ontario regulations." },
  { id: "pipeda-casl-creator", name: "PIPEDA & CASL — Creator Data Collection", shortName: "PIPEDA/CASL", category: "creator", description: "Privacy and anti-spam compliance for data collection via influencer campaigns", alwaysOn: false, severity: "high", riskDescription: "Collecting personal data or sending CEMs through influencer campaigns without compliance exposes both brand and creator to joint PIPEDA/CASL liability." },
];

export interface Jurisdiction {
  id: string;
  name: string;
  shortName: string;
}

export const JURISDICTIONS: Jurisdiction[] = [
  { id: "ontario", name: "Ontario", shortName: "ON" },
  { id: "british-columbia", name: "British Columbia", shortName: "BC" },
  { id: "alberta", name: "Alberta", shortName: "AB" },
  { id: "quebec", name: "Quebec", shortName: "QC" },
  { id: "manitoba", name: "Manitoba", shortName: "MB" },
  { id: "saskatchewan", name: "Saskatchewan", shortName: "SK" },
  { id: "nova-scotia", name: "Nova Scotia", shortName: "NS" },
  { id: "new-brunswick", name: "New Brunswick", shortName: "NB" },
  { id: "pei", name: "Prince Edward Island", shortName: "PE" },
  { id: "newfoundland", name: "Newfoundland and Labrador", shortName: "NL" },
  { id: "northwest-territories", name: "Northwest Territories", shortName: "NT" },
  { id: "yukon", name: "Yukon", shortName: "YT" },
  { id: "nunavut", name: "Nunavut", shortName: "NU" },
];

export interface TriggerQuestion {
  id: string;
  question: string;
  description: string;
  categories: Category[];
  activatesModules: string[];
}

export const TRIGGER_QUESTIONS: TriggerQuestion[] = [
  { id: "tq-ontario", question: "Is the place of employment Ontario?", description: "Triggers ESA 2000, Waksdale, s.67.2 prohibition, OHSA, AODA", categories: ["employment"], activatesModules: ["esa-2000", "waksdale", "s67-2-prohibition", "ohsa", "aoda"] },
  { id: "tq-csuite", question: "Is the employee a C-suite executive?", description: "C-suite exception to non-compete prohibition; Shafron test applies", categories: ["employment"], activatesModules: ["shafron-elsley"] },
  { id: "tq-fixed-term", question: "Is this a fixed-term engagement?", description: "Howard v. Benson early termination rules apply", categories: ["employment"], activatesModules: ["howard-benson"] },
  { id: "tq-contractor", question: "Is this a contractor engagement?", description: "Sagaz misclassification analysis required", categories: ["employment"], activatesModules: ["sagaz"] },
  { id: "tq-stock-options", question: "Does the agreement include stock options or equity?", description: "Securities compliance and tax implications", categories: ["employment", "corporate"], activatesModules: ["corp-securities", "corp-tax"] },
  { id: "tq-non-compete", question: "Is a non-compete clause requested?", description: "Ontario s.67.2 prohibition for non-C-suite employees", categories: ["employment"], activatesModules: ["s67-2-prohibition", "shafron-elsley"] },
  { id: "tq-workplace-safety", question: "Does the role involve physical workplace or safety-sensitive duties?", description: "OHSA workplace safety and human rights accommodation", categories: ["employment"], activatesModules: ["ohsa", "human-rights"] },
  { id: "tq-cbca", question: "Is the corporation incorporated under CBCA (federal)?", description: "CBCA s.146 USA requirements apply", categories: ["corporate"], activatesModules: ["cbca-usa"] },
  { id: "tq-provincial-bca", question: "Is the corporation incorporated under a provincial statute?", description: "Provincial BCA requirements apply", categories: ["corporate"], activatesModules: ["provincial-bca"] },
  { id: "tq-minority", question: "Are there minority shareholders requiring protection?", description: "Oppression remedy and minority veto provisions", categories: ["corporate"], activatesModules: ["oppression-remedy"] },
  { id: "tq-share-issuance", question: "Will the corporation issue new shares or securities?", description: "NI 45-106 and provincial securities compliance", categories: ["corporate", "investment"], activatesModules: ["ni-45-106", "corp-securities"] },
  { id: "tq-safe-issuance", question: "Is this a SAFE instrument issuance?", description: "SAFE conversion mechanics and accredited investor verification", categories: ["investment"], activatesModules: ["safe-conversion", "accredited-investor", "ni-45-106"] },
  { id: "tq-personal-info", question: "Will personal information be collected or processed?", description: "PIPEDA commercial compliance and data residency", categories: ["commercial"], activatesModules: ["pipeda-commercial", "data-residency"] },
  { id: "tq-electronic-messaging", question: "Will the service involve electronic messaging to users?", description: "CASL anti-spam legislation compliance", categories: ["commercial"], activatesModules: ["casl"] },
  { id: "tq-cloud-saas", question: "Is this a cloud/SaaS service?", description: "SLA liability framework and data residency requirements", categories: ["commercial"], activatesModules: ["sla-liability", "data-residency"] },
  // ── PLATFORM ──
  { id: "tq-platform-personal-info", question: "Does the platform collect personal information?", description: "Triggers PIPEDA and data residency compliance for platform user data", categories: ["platform"], activatesModules: ["platform-pipeda", "platform-data-residency"] },
  { id: "tq-platform-quebec", question: "Does the platform operate in Quebec?", description: "Triggers Quebec Law 25 privacy requirements including consent and privacy officer obligations", categories: ["platform"], activatesModules: ["quebec-law25"] },
  { id: "tq-platform-accounts", question: "Will users create accounts with stored credentials?", description: "User account data collection triggers PIPEDA compliance", categories: ["platform"], activatesModules: ["platform-pipeda"] },
  { id: "tq-platform-payments", question: "Does the platform accept payments or handle financial data?", description: "Financial data handling triggers PIPEDA commercial compliance", categories: ["platform"], activatesModules: ["platform-pipeda"] },
  { id: "tq-platform-cem", question: "Does the platform send commercial electronic messages (emails, push notifications)?", description: "Commercial electronic messages trigger CASL compliance", categories: ["platform"], activatesModules: ["platform-casl"] },
  // ── CREATOR ──
  { id: "tq-us-audience", question: "Does the influencer have a US audience (>5%)?", description: "Triggers FTC Endorsement Guide compliance on top of Canadian law", categories: ["creator"], activatesModules: ["ftc-cross-border"] },
  { id: "tq-regulated-industry", question: "Is this a regulated industry (alcohol, iGaming, cannabis, health)?", description: "Triggers AGCO or industry-specific advertising restrictions", categories: ["creator"], activatesModules: ["agco-igaming"] },
  { id: "tq-creator-data", question: "Will the campaign collect personal data (contests, email lists)?", description: "Triggers PIPEDA/CASL compliance for influencer campaigns", categories: ["creator"], activatesModules: ["pipeda-casl-creator"] },
];

export function getModulesForCategories(categories: Category[]): ComplianceModule[] {
  return MODULES.filter((m) => categories.includes(m.category));
}

export function getQuestionsForCategories(categories: Category[]): TriggerQuestion[] {
  return TRIGGER_QUESTIONS.filter((q) =>
    q.categories.some((c) => categories.includes(c))
  );
}

/**
 * Sorts compliance modules by severity priority (critical first, low last).
 */
export function getModulesByPriority(modules: ComplianceModule[]): ComplianceModule[] {
  return [...modules].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

/**
 * Returns a human-readable compliance summary string for the given active modules.
 */
export function getComplianceSummary(activeModules: ComplianceModule[]): string {
  if (activeModules.length === 0) {
    return "No compliance modules are active. Ensure trigger questions have been answered to activate relevant regulatory requirements.";
  }

  const sorted = getModulesByPriority(activeModules);
  const bySeverity: Record<Severity, ComplianceModule[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };
  for (const m of sorted) {
    bySeverity[m.severity].push(m);
  }

  const parts: string[] = [];
  parts.push(`${activeModules.length} compliance module${activeModules.length === 1 ? "" : "s"} active.`);

  if (bySeverity.critical.length > 0) {
    parts.push(`CRITICAL (${bySeverity.critical.length}): ${bySeverity.critical.map((m) => m.shortName).join(", ")}.`);
  }
  if (bySeverity.high.length > 0) {
    parts.push(`HIGH (${bySeverity.high.length}): ${bySeverity.high.map((m) => m.shortName).join(", ")}.`);
  }
  if (bySeverity.medium.length > 0) {
    parts.push(`MEDIUM (${bySeverity.medium.length}): ${bySeverity.medium.map((m) => m.shortName).join(", ")}.`);
  }
  if (bySeverity.low.length > 0) {
    parts.push(`LOW (${bySeverity.low.length}): ${bySeverity.low.map((m) => m.shortName).join(", ")}.`);
  }

  return parts.join(" ");
}

export function evaluateCompliance(
  categories: Category[],
  jurisdiction: string,
  triggerAnswers: Record<string, boolean>
): { activeModules: ComplianceModule[]; warnings: string[] } {
  const relevantModules = getModulesForCategories(categories);
  const active = new Set<string>();
  const warnings: string[] = [];

  // Always-on modules
  for (const m of relevantModules) {
    if (m.alwaysOn) active.add(m.id);
  }

  // Trigger-based activation
  for (const [questionId, answer] of Object.entries(triggerAnswers)) {
    if (!answer) continue;
    const question = TRIGGER_QUESTIONS.find((q) => q.id === questionId);
    if (!question) continue;
    for (const moduleId of question.activatesModules) {
      if (relevantModules.some((m) => m.id === moduleId)) {
        active.add(moduleId);
      }
    }
  }

  // Category-specific warnings
  if (categories.includes("employment")) {
    const isOntario = triggerAnswers["tq-ontario"];
    const isCsuite = triggerAnswers["tq-csuite"];
    const wantsNonCompete = triggerAnswers["tq-non-compete"];
    if (isOntario && wantsNonCompete && !isCsuite) {
      warnings.push("Ontario ESA s.67.2: Non-compete clauses are void for non-C-suite employees. The system will substitute enhanced non-solicitation provisions.");
    }
  }
  if (categories.includes("corporate")) {
    const hasMinority = triggerAnswers["tq-minority"];
    if (hasMinority && !active.has("oppression-remedy")) {
      warnings.push("Minority shareholders present without oppression remedy protections. Consider enabling CBCA s.241 compliance.");
    }
  }
  if (categories.includes("investment")) {
    const isSafe = triggerAnswers["tq-safe-issuance"];
    if (isSafe && !active.has("accredited-investor")) {
      warnings.push("SAFE issuance without accredited investor verification may violate NI 45-106 prospectus exemption requirements.");
    }
  }
  if (categories.includes("commercial")) {
    const hasPersonalInfo = triggerAnswers["tq-personal-info"];
    if (hasPersonalInfo && !active.has("pipeda-commercial")) {
      warnings.push("Personal information processing without PIPEDA compliance creates privacy liability exposure.");
    }
  }

  const activeModules = relevantModules.filter((m) => active.has(m.id));
  return { activeModules, warnings };
}
