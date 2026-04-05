/**
 * Prompt Builder — Centralizes prompt construction for AI agreement generation.
 * Uses legal frameworks from legal-frameworks.ts and agreement configs.
 */

import type { Category } from "../data/agreements";
import type { ClausePosition } from "../data/agreement-configs";
import {
  EMPLOYMENT_FRAMEWORK,
  SHAREHOLDER_FRAMEWORK,
  SAFE_FRAMEWORK,
  SLA_FRAMEWORK,
  CORPORATE_FRAMEWORK,
  GENERAL_BUSINESS_FRAMEWORK,
  INFLUENCER_AGREEMENT_FRAMEWORK,
} from "./legal-frameworks";

// ─── Framework Mapping ──────────────────────────────────────────────────────

/** Map category to the appropriate legal framework(s) */
const CATEGORY_FRAMEWORK_MAP: Record<Category, string[]> = {
  employment: [EMPLOYMENT_FRAMEWORK],
  corporate: [SHAREHOLDER_FRAMEWORK, CORPORATE_FRAMEWORK],
  investment: [SAFE_FRAMEWORK, CORPORATE_FRAMEWORK],
  commercial: [SLA_FRAMEWORK, GENERAL_BUSINESS_FRAMEWORK],
  platform: [GENERAL_BUSINESS_FRAMEWORK],
  creator: [INFLUENCER_AGREEMENT_FRAMEWORK],
};

/** Map specific agreement types to their primary framework override */
const AGREEMENT_FRAMEWORK_OVERRIDES: Record<string, string[]> = {
  "standard-employment": [EMPLOYMENT_FRAMEWORK],
  "fixed-term": [EMPLOYMENT_FRAMEWORK],
  "executive-employment": [EMPLOYMENT_FRAMEWORK],
  "contractor": [EMPLOYMENT_FRAMEWORK],
  "non-compete": [EMPLOYMENT_FRAMEWORK],
  "ip-assignment": [EMPLOYMENT_FRAMEWORK, CORPORATE_FRAMEWORK],
  "offer-letter": [EMPLOYMENT_FRAMEWORK],
  "two-party-usa": [SHAREHOLDER_FRAMEWORK],
  "emerging-corp-usa": [SHAREHOLDER_FRAMEWORK],
  "jv-usa": [SHAREHOLDER_FRAMEWORK, CORPORATE_FRAMEWORK],
  "pe-backed-usa": [SHAREHOLDER_FRAMEWORK],
  "deadlock-usa": [SHAREHOLDER_FRAMEWORK],
  "articles-incorporation": [CORPORATE_FRAMEWORK],
  "articles-amendment": [CORPORATE_FRAMEWORK],
  "safe-agreement": [SAFE_FRAMEWORK],
  "convertible-note": [SAFE_FRAMEWORK],
  "bilateral-loan": [SAFE_FRAMEWORK],
  "demand-note": [SAFE_FRAMEWORK],
  "revolving-credit": [SAFE_FRAMEWORK],
  "saas-sla": [SLA_FRAMEWORK],
  "managed-services-sla": [SLA_FRAMEWORK],
  "enterprise-sla": [SLA_FRAMEWORK],
  "terms-and-conditions": [GENERAL_BUSINESS_FRAMEWORK],
  "privacy-policy": [GENERAL_BUSINESS_FRAMEWORK],
  "partnership-agreement": [CORPORATE_FRAMEWORK, GENERAL_BUSINESS_FRAMEWORK],
  "master-services-agreement": [GENERAL_BUSINESS_FRAMEWORK, SLA_FRAMEWORK],
  "influencer-agreement": [INFLUENCER_AGREEMENT_FRAMEWORK],
};

// ─── Prompt Cache ───────────────────────────────────────────────────────────

/** Cache for base system prompts keyed by agreementType + category */
const systemPromptCache = new Map<string, string>();

function getCacheKey(agreementType: string, category: Category): string {
  return `${agreementType}::${category}`;
}

// ─── System Prompt Builder ──────────────────────────────────────────────────

/**
 * Build the system prompt for the AI agreement drafter.
 * Combines the legal framework, clause positions, and compliance modules
 * into a single structured system prompt.
 *
 * Uses an internal cache: if the same agreementType + category combo is
 * requested again, returns the cached base prompt string.
 */
export function buildSystemPrompt(
  agreementType: string,
  category: Category,
  clausePositions: ClausePosition[],
  complianceModules: string[]
): string {
  const cacheKey = getCacheKey(agreementType, category);

  // Check if we have a cached version with the same clause positions and compliance modules
  // We only cache the base (framework) portion and rebuild the dynamic parts each time
  let basePrompt = systemPromptCache.get(cacheKey);

  if (!basePrompt) {
    // Resolve the legal framework(s) for this agreement type
    const frameworks =
      AGREEMENT_FRAMEWORK_OVERRIDES[agreementType] ||
      CATEGORY_FRAMEWORK_MAP[category] ||
      [GENERAL_BUSINESS_FRAMEWORK];

    basePrompt = [
      "You are a senior Canadian lawyer drafting a legal agreement. You must follow the legal frameworks, case law, and regulatory requirements provided below exactly.",
      "",
      "═══════════════════════════════════════════",
      "LEGAL FRAMEWORKS",
      "═══════════════════════════════════════════",
      "",
      ...frameworks,
      "",
    ].join("\n");

    systemPromptCache.set(cacheKey, basePrompt);
  }

  // Build the dynamic portions (clause positions + compliance modules)
  const clauseSection = buildClausePositionsSection(clausePositions);
  const complianceSection = buildComplianceSection(complianceModules);

  return [
    basePrompt,
    "═══════════════════════════════════════════",
    "CLAUSE POSITIONS (as selected by the user)",
    "═══════════════════════════════════════════",
    "",
    clauseSection,
    "",
    "═══════════════════════════════════════════",
    "COMPLIANCE MODULES",
    "═══════════════════════════════════════════",
    "",
    complianceSection,
    "",
    "═══════════════════════════════════════════",
    "DRAFTING INSTRUCTIONS",
    "═══════════════════════════════════════════",
    "",
    "Draft the agreement following the legal framework above. For each clause where a position has been selected, draft in that position. For clauses where no position is specified, use the BALANCED/MARKET default.",
    "",
    "The agreement must:",
    "1. Be complete and ready for execution (no placeholders like [INSERT])",
    "2. Comply with all applicable Canadian federal and provincial legislation",
    "3. Reference the specific case law and statutory provisions from the framework",
    "4. Include all mandatory provisions listed in the framework",
    "5. Use clear, professional legal language appropriate for a Canadian jurisdiction",
  ].join("\n");
}

function buildClausePositionsSection(clausePositions: ClausePosition[]): string {
  if (clausePositions.length === 0) {
    return "No specific clause positions selected. Use BALANCED/MARKET defaults for all clauses.";
  }

  return clausePositions
    .map((cp) => {
      const selectedOption = cp.options.find((o) => o.id === cp.defaultPosition);
      const selectedLabel = selectedOption ? selectedOption.label : "Balanced (default)";
      const selectedDesc = selectedOption ? selectedOption.description : "";
      return [
        `${cp.label}: ${selectedLabel}`,
        `  Description: ${cp.description}`,
        `  Selected position: ${selectedDesc}`,
      ].join("\n");
    })
    .join("\n\n");
}

function buildComplianceSection(complianceModules: string[]): string {
  if (complianceModules.length === 0) {
    return "No additional compliance modules selected. Apply standard Canadian federal law requirements.";
  }

  return complianceModules
    .map((mod) => `- ${mod}`)
    .join("\n");
}

// ─── User Prompt Builder ────────────────────────────────────────────────────

/**
 * Build the user prompt from wizard data collected during the agreement configuration flow.
 * Extracts party information, specific selections, and any custom instructions.
 */
export function buildUserPrompt(wizardData: Record<string, unknown>): string {
  const sections: string[] = [];

  // Party information
  if (wizardData.partyAName || wizardData.partyBName) {
    sections.push("PARTIES:");
    if (wizardData.partyAName) sections.push(`  Party A: ${wizardData.partyAName}`);
    if (wizardData.partyBName) sections.push(`  Party B: ${wizardData.partyBName}`);
    if (wizardData.partyAAddress) sections.push(`  Party A Address: ${wizardData.partyAAddress}`);
    if (wizardData.partyBAddress) sections.push(`  Party B Address: ${wizardData.partyBAddress}`);
    sections.push("");
  }

  // Jurisdiction
  if (wizardData.jurisdiction) {
    sections.push(`JURISDICTION: ${wizardData.jurisdiction}`);
    sections.push("");
  }

  // Tier
  if (wizardData.tier) {
    sections.push(`SERVICE TIER: ${wizardData.tier}`);
    if (wizardData.tier === "self-serve") {
      sections.push("  Use BALANCED/MARKET clause positions as defaults.");
    } else if (wizardData.tier === "counsel") {
      sections.push("  Clause positions may be customized by the reviewing lawyer.");
    }
    sections.push("");
  }

  // Collect all remaining wizard data into a structured section
  const excludedKeys = new Set([
    "partyAName", "partyBName", "partyAAddress", "partyBAddress",
    "jurisdiction", "tier", "customInstructions", "clausePositions",
  ]);

  const additionalData = Object.entries(wizardData)
    .filter(([key, value]) => !excludedKeys.has(key) && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      // Convert camelCase to readable label
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
      return `  ${label}: ${typeof value === "object" ? JSON.stringify(value) : value}`;
    });

  if (additionalData.length > 0) {
    sections.push("AGREEMENT DETAILS:");
    sections.push(...additionalData);
    sections.push("");
  }

  // Clause positions (if provided as explicit selections)
  if (wizardData.clausePositions && typeof wizardData.clausePositions === "object") {
    sections.push("SELECTED CLAUSE POSITIONS:");
    const positions = wizardData.clausePositions as Record<string, string>;
    for (const [clauseId, positionId] of Object.entries(positions)) {
      const label = clauseId
        .replace(/([A-Z])/g, " $1")
        .replace(/Position$/, "")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
      sections.push(`  ${label}: ${positionId}`);
    }
    sections.push("");
  }

  // Custom instructions from the user
  if (wizardData.customInstructions) {
    sections.push("ADDITIONAL INSTRUCTIONS FROM CLIENT:");
    sections.push(`  ${wizardData.customInstructions}`);
    sections.push("");
  }

  // Final instruction
  sections.push("Please draft the complete agreement based on the above information and the legal framework provided in the system prompt.");

  return sections.join("\n");
}

// ─── Token Estimator ────────────────────────────────────────────────────────

/**
 * Rough token count estimator.
 * Uses the common approximation of ~4 characters per token for English text.
 * This is not exact but provides a useful estimate for prompt budgeting.
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// ─── Cache Management ───────────────────────────────────────────────────────

/** Clear the system prompt cache (useful for testing or when frameworks are updated) */
export function clearPromptCache(): void {
  systemPromptCache.clear();
}

/** Get the current number of cached system prompts */
export function getPromptCacheSize(): number {
  return systemPromptCache.size;
}
