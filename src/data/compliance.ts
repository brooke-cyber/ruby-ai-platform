import type { Category } from "./agreements";

export interface ComplianceModule {
  id: string;
  name: string;
  shortName: string;
  category: Category;
  description: string;
  alwaysOn: boolean;
}

export const MODULES: ComplianceModule[] = [
  // ── EMPLOYMENT (14) ──
  { id: "esa-2000", name: "ESA 2000 Baseline", shortName: "ESA", category: "employment", description: "Ontario Employment Standards Act mandatory minimums", alwaysOn: true },
  { id: "waksdale", name: "Waksdale Compliance", shortName: "Waksdale", category: "employment", description: "Holistic termination section review per Waksdale v. Swegon", alwaysOn: true },
  { id: "s67-2-prohibition", name: "s.67.2 Non-Compete Prohibition", shortName: "s.67.2", category: "employment", description: "Ontario non-compete ban for non-C-suite employees", alwaysOn: false },
  { id: "common-law-notice", name: "Common Law Notice", shortName: "CL Notice", category: "employment", description: "Reasonable notice calculation at common law", alwaysOn: false },
  { id: "shafron-elsley", name: "Shafron/Elsley Enforceability", shortName: "Shafron", category: "employment", description: "Restrictive covenant reasonableness test", alwaysOn: false },
  { id: "howard-benson", name: "Howard v. Benson Fixed-Term", shortName: "Howard", category: "employment", description: "Fixed-term early termination rules", alwaysOn: false },
  { id: "sagaz", name: "Sagaz Misclassification", shortName: "Sagaz", category: "employment", description: "Contractor vs employee misclassification risk", alwaysOn: false },
  { id: "copyright-s14", name: "Copyright Act s.14.1 Moral Rights", shortName: "Moral Rights", category: "employment", description: "Moral rights waiver for IP assignment", alwaysOn: false },
  { id: "provincial-esa", name: "Provincial ESA Equivalents", shortName: "Prov ESA", category: "employment", description: "Non-Ontario provincial employment standards", alwaysOn: false },
  { id: "probation", name: "Probation Period Rules", shortName: "Probation", category: "employment", description: "Statutory and contractual probation requirements", alwaysOn: false },
  { id: "benefits-continuation", name: "Benefits Continuation", shortName: "Benefits", category: "employment", description: "Post-termination benefits obligations", alwaysOn: false },
  { id: "human-rights", name: "Human Rights Code", shortName: "HRC", category: "employment", description: "Accommodation, non-discrimination, harassment", alwaysOn: false },
  { id: "ohsa", name: "OHSA 1990 Workplace Safety", shortName: "OHSA", category: "employment", description: "Workplace health and safety obligations", alwaysOn: false },
  { id: "aoda", name: "Accessibility (AODA)", shortName: "AODA", category: "employment", description: "Accessibility for Ontarians with Disabilities Act", alwaysOn: false },

  // ── CORPORATE (5) ──
  { id: "cbca-usa", name: "CBCA Unanimous Shareholder Agreement", shortName: "CBCA USA", category: "corporate", description: "CBCA s.146 USA compliance requirements", alwaysOn: false },
  { id: "provincial-bca", name: "Provincial BCA", shortName: "Prov BCA", category: "corporate", description: "Provincial business corporations act compliance", alwaysOn: false },
  { id: "corp-securities", name: "Corporate Securities Compliance", shortName: "Corp Sec", category: "corporate", description: "Securities law requirements for corporate transactions", alwaysOn: false },
  { id: "corp-tax", name: "Corporate Tax Structuring", shortName: "Tax", category: "corporate", description: "Tax implications of corporate structure", alwaysOn: false },
  { id: "oppression-remedy", name: "Minority Oppression Remedy", shortName: "s.241", category: "corporate", description: "CBCA s.241 minority shareholder oppression protections", alwaysOn: false },

  // ── INVESTMENT (4) ──
  { id: "ni-45-106", name: "NI 45-106 Prospectus Exemptions", shortName: "NI 45-106", category: "investment", description: "Prospectus exemption compliance for SAFE issuance", alwaysOn: false },
  { id: "provincial-securities-inv", name: "Provincial Securities (Investment)", shortName: "Prov Sec", category: "investment", description: "Provincial securities legislation for investments", alwaysOn: false },
  { id: "accredited-investor", name: "Accredited Investor Verification", shortName: "Accred Inv", category: "investment", description: "Accredited investor qualification and documentation", alwaysOn: false },
  { id: "safe-conversion", name: "SAFE Conversion Mechanics", shortName: "Conversion", category: "investment", description: "Valuation cap, discount, and trigger mechanics", alwaysOn: false },

  // ── COMMERCIAL (4) ──
  { id: "pipeda-commercial", name: "PIPEDA Commercial Compliance", shortName: "PIPEDA", category: "commercial", description: "Federal privacy legislation for commercial activities", alwaysOn: false },
  { id: "data-residency", name: "Data Residency Requirements", shortName: "Residency", category: "commercial", description: "Cross-border data transfer and storage requirements", alwaysOn: false },
  { id: "casl", name: "CASL Anti-Spam Compliance", shortName: "CASL", category: "commercial", description: "Canada Anti-Spam Legislation electronic messaging", alwaysOn: false },
  { id: "sla-liability", name: "SLA Liability Framework", shortName: "SLA Liab", category: "commercial", description: "Service credit, liability cap, and force majeure framework", alwaysOn: false },
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
];

export function getModulesForCategories(categories: Category[]): ComplianceModule[] {
  return MODULES.filter((m) => categories.includes(m.category));
}

export function getQuestionsForCategories(categories: Category[]): TriggerQuestion[] {
  return TRIGGER_QUESTIONS.filter((q) =>
    q.categories.some((c) => categories.includes(c))
  );
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
