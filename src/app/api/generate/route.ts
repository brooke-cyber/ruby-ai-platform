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

const BASE_SYSTEM = `You are the Ruby Law AI drafting engine — a Canadian legal agreement generator built on proprietary clause libraries, drafting workflows, and regulatory module compliance databases developed by practicing Canadian lawyers.

CORE DRAFTING STANDARDS:
- Generate production-ready legal agreements with proper Canadian legal formatting
- Use WHEREAS recitals, numbered ARTICLES (ARTICLE 1, ARTICLE 2...), and sub-sections (1.1, 1.2, 1.3...)
- ABSOLUTELY NEVER use square brackets like [NAME], [DATE], [AMOUNT], or any [PLACEHOLDER] in the output. This is a strict requirement — zero square brackets in the entire document.
- Use the ACTUAL values provided in the wizard data for all party names, dates, amounts, jurisdictions, percentages, and terms.
- If a specific value was not provided by the client, use a professional blank line: "________________" (16 underscores). This makes the document look like a printed agreement ready for manual completion — not a software template.
- The final document must be ready for a lawyer to review and a client to sign. It should read as a complete, professional legal document with no template artifacts.
- Bold all article headings, section headings, and defined terms on first use
- Reference applicable Canadian statutes and case law inline where relevant
- Include a comprehensive DEFINITIONS section at the start of every agreement
- Include execution blocks at the end with signature lines for all parties
- Produce ONLY the draft agreement text — no commentary, no summaries, no meta-text
- Use professional legal language appropriate for Canadian courts
- All monetary amounts in Canadian Dollars (CAD) unless otherwise specified
- Format the document as if it were being printed by a top-tier Canadian law firm

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, agreementType, jurisdiction, wizardData, system: customSystem, user: customUser } = body;

    const apiKey = process.env.RUBY_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Generation service is being configured. Please try again shortly." }, { status: 503 });
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (customSystem && customUser) {
      systemPrompt = customSystem;
      userPrompt = customUser;
    } else {
      const wd = wizardData || {};
      const categories = Array.isArray(category) ? category : [category];
      const frameworks = categories
        .map((c: string) => CATEGORY_FRAMEWORKS[c] || "")
        .filter(Boolean)
        .join("\n\n");

      // Get agreement-specific drafting instructions
      const agreementIds: string[] = wd.agreementIds || [];
      const specificInstructions = getDraftingInstructions(agreementIds);

      // Get clause position selections and format them
      const clauseSelections: Record<string, string> = wd.clauseSelections || {};
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

      if (wd.party) {
        parts.push(`\nPARTIES:`);
        parts.push(`- Party A (Corporation/Employer/Vendor): ${wd.party.partyA || "________________"}`);
        parts.push(`- Party B (Shareholder/Employee/Investor/Customer): ${wd.party.partyB || "________________"}`);
      }

      // Risk profile — shapes every clause in the agreement
      if (wd.riskProfile) {
        const rp = wd.riskProfile;
        parts.push(`\nCLIENT RISK PROFILE:`);
        parts.push(`- Risk Tolerance: ${rp.tolerance.toUpperCase()}`);
        if (rp.tolerance === "conservative") {
          parts.push(`  → Draft ALL discretionary clauses in the most protective position for our client. Maximize indemnities, cap counterparty liability narrowly, include broad termination rights, extensive representations, and strong IP protections.`);
        } else if (rp.tolerance === "aggressive") {
          parts.push(`  → Draft for speed and deal completion. Use lighter-touch clauses, mutual obligations where possible, reasonable caps, and fewer conditions precedent. The client values flexibility over ironclad protection.`);
        } else {
          parts.push(`  → Draft in the balanced/market position. Fair to both sides. Standard industry protections without being overly aggressive or leaving gaps.`);
        }
        const priorities: string[] = rp.priorities || (rp.priority ? [rp.priority] : []);
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

      if (wd.activeModules && wd.activeModules.length > 0) {
        parts.push(`\nACTIVE COMPLIANCE MODULES: ${wd.activeModules.join(", ")}`);
        parts.push(`Apply ALL regulatory requirements from the activated modules above.`);
      }

      if (wd.warnings && wd.warnings.length > 0) {
        parts.push(`\nCOMPLIANCE WARNINGS TO ADDRESS:\n${wd.warnings.map((w: string) => `- ${w}`).join("\n")}`);
      }

      // Employment-specific data
      if (wd.employment) {
        const e = wd.employment;
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
      if (wd.corporate) {
        const c = wd.corporate;
        parts.push(`\nSHAREHOLDER & GOVERNANCE TERMS:`);
        if (c.shareholders && c.shareholders.length > 0) {
          parts.push(`- Shareholders:`);
          c.shareholders.forEach((sh: { name: string; equity: string; role: string }) => {
            parts.push(`  * ${sh.name || "[NAME]"}: ${sh.equity}% equity, Role: ${sh.role || "Shareholder"}`);
          });
        }
        parts.push(`- Board Size: ${c.boardSize} directors`);
        parts.push(`- Appointment Rights: ${c.appointmentRights}`);
        if (c.reservedMatters && c.reservedMatters.length > 0) {
          parts.push(`- Reserved Matters (require shareholder approval): ${c.reservedMatters.join("; ")}`);
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
      if (wd.investment) {
        const inv = wd.investment;
        parts.push(`\nINVESTMENT TERMS:`);
        if (inv.investmentAmount) parts.push(`- Investment Amount: ${inv.investmentAmount} CAD`);
        if (inv.valuationCap) parts.push(`- Valuation Cap: ${inv.valuationCap} CAD`);
        parts.push(`- Discount Rate: ${inv.discountRate}%`);
        if (inv.conversionTriggers) parts.push(`- Conversion Triggers: ${inv.conversionTriggers.join(", ")}`);
        parts.push(`- MFN Clause Scope: ${inv.mfnClause}`);
        parts.push(`- Pro Rata Threshold: ${inv.proRataThreshold}%`);
        parts.push(`- Information Frequency: ${inv.infoFrequency}`);
        if (inv.infoScope) parts.push(`- Information Scope: ${inv.infoScope.join(", ")}`);
        parts.push(`- Board Observer Rights: ${inv.boardObserver ? "Yes" : "No"}`);
      }

      // Commercial-specific data
      if (wd.commercial) {
        const com = wd.commercial;
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
      if (wd.platform) {
        const plat = wd.platform;
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
      if (wd.influencer) {
        const inf = wd.influencer;
        parts.push(`\nINFLUENCER / CREATOR CAMPAIGN TERMS:`);
        parts.push(`- Platforms: ${inf.platforms.join(", ")}`);
        parts.push(`- Content Types: ${inf.contentTypes.join(", ")}`);
        parts.push(`- Campaign Duration: ${inf.campaignDuration}`);
        parts.push(`- Posting Frequency: ${inf.postFrequency}`);
        parts.push(`- Compensation Model: ${inf.compensationModel}`);
        if (inf.hasUsAudience) parts.push(`- US Audience: Yes (${inf.usAudiencePercent}%) — ACTIVATE FTC Endorsement Guides compliance`);
        if (inf.isRegulatedIndustry) parts.push(`- Regulated Industry: ${inf.regulatedCategory} — ACTIVATE industry-specific compliance module`);
        if (inf.collectsPersonalData) parts.push(`- Collects Personal Data: Yes — ACTIVATE PIPEDA/CASL consent and security clauses`);
        if (inf.usesAiContent) parts.push(`- AI-Generated Content: Yes — ACTIVATE CCCS synthetic content disclosure requirements`);
        if (inf.hasQuebecAudience) parts.push(`- Quebec Audience: Yes — ACTIVATE Charter of French Language requirements; generate French-language disclosure addendum`);
        parts.push(`\nPLATFORM-SPECIFIC DISCLOSURE REQUIREMENTS (include in Exhibit C):`);
        for (const p of inf.platforms) {
          if (p === "instagram") parts.push(`- Instagram: #ad in first 3 characters of caption + activate Paid Partnership label`);
          else if (p === "tiktok") parts.push(`- TikTok: Use brand partnerships tool + #ad hashtag in first 30 characters`);
          else if (p === "youtube") parts.push(`- YouTube: Auto-applied Paid Partnership label + video description disclaimer in first 30 seconds`);
          else if (p === "x-twitter") parts.push(`- X/Twitter: #ad or #partner early in post text (first 50 characters)`);
          else if (p === "facebook") parts.push(`- Facebook: Paid partnership label + privacy disclaimer in comment section`);
          else if (p === "linkedin") parts.push(`- LinkedIn: #ad disclosure in post text + sponsored content tag`);
        }
      }

      // Trigger answers for compliance context
      if (wd.triggerAnswers) {
        const answered = Object.entries(wd.triggerAnswers).filter(([, v]) => v);
        if (answered.length > 0) {
          parts.push(`\nCOMPLIANCE TRIGGER ANSWERS (Yes):`);
          answered.forEach(([k]) => parts.push(`- ${k}: Yes`));
        }
      }

      userPrompt = `${parts.join("\n")}

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
  - Use ## for major article/section headings (e.g., ## ARTICLE 1 — DEFINITIONS)
  - Use ### for sub-section headings (e.g., ### 1.1 Defined Terms)
  - Use --- for horizontal rules / section dividers
- Bold all defined terms on first use using **text** (e.g., **"Agreement"**, **"Effective Date"**).
- Do NOT use # symbols inside running text — only at the start of a line for headings.
- The output must read like a finished legal document from a top-tier firm, not a template.

Generate the full agreement — do not truncate, summarize, or abbreviate any section.`;
    }

    const model = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const draft = textBlock ? textBlock.text : "No content generated.";

    return NextResponse.json({
      draft,
      model: message.model,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    });
  } catch (err) {
    console.error("Generate API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
