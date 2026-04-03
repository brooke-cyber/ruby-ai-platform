import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const BASE_SYSTEM = `You are Ruby AI, an agreement drafting engine for Canadian jurisdictions. You generate legally precise, enforceable agreement drafts based on specialized drafting workflows. Generate the agreement as structured sections with proper legal formatting. Use WHEREAS recitals, numbered articles, and sub-sections. Include placeholder brackets [BRACKETS] for values the client must confirm. Reference applicable statutes and case law in annotations. Produce ONLY the draft agreement text.`;

const CATEGORY_RULES: Record<string, string> = {
  employment: `
EMPLOYMENT COMPLIANCE RULES:
- ESA 2000 compliance (or applicable provincial statute) for all Ontario employment
- Waksdale holistic test: any single ESA violation voids entire termination/severance section
- s.67.2 non-compete prohibition (Ontario) unless C-suite or sale-of-business exception
- Shafron/Elsley enforceability test for all restrictive covenants: geographic scope, temporal duration, legitimate interest
- Fresh consideration required for post-hire covenant amendments (Hobbs v. TDI)
- Howard v. Benson early termination rules for fixed-term contracts
- Sagaz misclassification safeguards for contractor engagements
- Copyright Act s.14.1 moral rights waiver for IP assignments`,

  corporate: `
CORPORATE GOVERNANCE COMPLIANCE RULES:
- CBCA s.146 unanimous shareholder agreement compliance (all shareholders must be party)
- Drag-along/tag-along preserving minority protections (s.241 oppression remedy)
- Shotgun buy-sell with precise trigger events and valuation methodology
- Pre-emptive rights (ROFR/ROFO) with clear notice periods and exercise mechanics
- Deadlock resolution: arbitration, shotgun, or third-party determination cascade
- Reserved matters aligned with CBCA s.115 (director powers) and s.109 (shareholder rights)
- Board composition with nomination rights proportional to ownership`,

  investment: `
INVESTMENT COMPLIANCE RULES:
- NI 45-106 prospectus exemptions and exempt distribution reporting requirements
- Valuation cap mechanics: ceiling event, future financing, conversion price calculation
- Discount rate application: percentage reduction from per-share price in qualifying financing
- MFN clause scope (valuation cap, discount, or both)
- Conversion triggers: equity financing (minimum threshold), liquidity event (M&A/IPO), dissolution
- Pro rata rights: threshold, pool mechanics, over-subscription allocation
- Accredited investor representations and verification requirements`,

  commercial: `
COMMERCIAL COMPLIANCE RULES:
- Uptime commitments (99.5%-99.99%) with measurement windows and scheduled maintenance exclusions
- SLOs: response/resolution times by severity tier (Critical 1hr/4hr through Low 5d/10d)
- Tiered service credits (10%/25%/50% of monthly fee) based on SLA breach severity
- Liability caps excluding indemnification obligations and IP infringement claims
- Force majeure (pandemics, natural disasters, war, infrastructure failures)
- Mutual consequential damages exclusion with carve-outs
- PIPEDA data handling requirements + 72-hour breach notification
- CASL electronic messaging compliance for all electronic communications`,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, agreementType, jurisdiction, wizardData, system: customSystem, user: customUser } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (customSystem && customUser) {
      systemPrompt = customSystem;
      userPrompt = customUser;
    } else {
      const categories = Array.isArray(category) ? category : [category];
      const rules = categories
        .map((c: string) => CATEGORY_RULES[c] || "")
        .filter(Boolean)
        .join("\n");
      systemPrompt = `${BASE_SYSTEM}\n${rules}`;

      userPrompt = `Generate a complete draft agreement with the following parameters:

Agreement Type: ${agreementType || "Not specified"}
Jurisdiction: ${jurisdiction || "Ontario"}

${wizardData ? JSON.stringify(wizardData, null, 2) : "No additional configuration provided."}

Generate the complete agreement now. Include all standard sections, recitals, definitions, operative provisions, and execution blocks. Use proper legal formatting with numbered articles and sub-sections.`;
    }

    const model = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model,
      max_tokens: 8192,
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
