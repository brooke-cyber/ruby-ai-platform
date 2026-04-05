import type { Category } from "./agreements";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type Severity = "critical" | "high" | "medium" | "low";

/**
 * A conditional compliance question that can trigger follow-up questions
 * based on the user's answer.
 */
export interface ComplianceTrigger {
  id: string;
  question: string;
  description: string;
  /** Which agreement types this question applies to. Empty/undefined = all agreements in category */
  appliesTo?: string[];
  /** Follow-up questions shown conditionally based on this answer */
  followUps?: {
    /** Show these follow-ups when parent answer is "yes" */
    onYes?: ComplianceTrigger[];
    /** Show these follow-ups when parent answer is "no" */
    onNo?: ComplianceTrigger[];
  };
}

/**
 * A compliance module representing a regulatory domain with curated,
 * conditional trigger questions and a risk profile.
 */
export interface ComplianceModule {
  id: string;
  category: Category;
  title: string;
  description: string;
  triggers: ComplianceTrigger[];
  /** Risk profile specific to this module */
  riskProfile: {
    level: Severity;
    factors: string[];
  };
  // ── Legacy fields preserved for backward compatibility ──
  name: string;
  shortName: string;
  alwaysOn: boolean;
  severity: Severity;
  riskDescription: string;
}

// ─────────────────────────────────────────────────────────────
// Severity ordering (for sorting)
// ─────────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ─────────────────────────────────────────────────────────────
// Compliance Modules — curated conditional question trees
// ─────────────────────────────────────────────────────────────

export const COMPLIANCE_MODULES: ComplianceModule[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMPLOYMENT MODULE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "employment",
    category: "employment",
    title: "Employment Compliance",
    description: "Canadian employment law compliance — ESA, termination, restrictive covenants, equity, and multi-province rules.",
    name: "Employment Compliance",
    shortName: "Employment",
    alwaysOn: false,
    severity: "high",
    riskDescription: "Employment agreements carry the highest litigation risk in Canadian law. Wrongful dismissal claims average $50K-$200K in damages.",
    riskProfile: {
      level: "high",
      factors: [
        "Employment agreements carry the highest litigation risk in Canadian law.",
        "Wrongful dismissal claims average $50K-$200K in damages.",
        "Waksdale invalidation of termination clauses is the #1 employment law risk in Ontario.",
        "Misclassification triggers retroactive ESA entitlements and CRA penalties.",
      ],
    },
    triggers: [
      // ── 1. Ontario ──
      {
        id: "emp-ontario",
        question: "Will the employee work primarily in Ontario?",
        description: "Ontario has the strictest employment standards in Canada. Ruby will apply ESA minimums, validate termination clauses under Waksdale, and ensure non-compete compliance with s.67.2.",
        appliesTo: ["standard-employment", "fixed-term", "executive-employment", "offer-letter", "internship-coop"],
        followUps: {
          onYes: [
            {
              id: "emp-ontario-high-earner",
              question: "Will the employee earn more than $100,000 per year?",
              description: "High earners may be exempt from certain ESA provisions (hours of work, overtime). Ruby will apply the appropriate exemptions and adjust termination entitlements.",
              followUps: {
                onYes: [
                  {
                    id: "emp-ontario-csuite",
                    question: "Is this a C-suite or VP-level position (CEO, CFO, CTO, COO, VP)?",
                    description: "Executive roles qualify for the non-compete exception under ESA s.67.2 and typically receive enhanced severance. Ruby will include change-of-control provisions and golden parachute protections. If the executive will also be a named officer or director, they owe fiduciary duties under CBCA s.122 that survive termination — Ruby will add fiduciary duty acknowledgments and D&O indemnification provisions.",
                  },
                ],
              },
            },
            {
              id: "emp-ontario-trade-secrets",
              question: "Will the employee have access to trade secrets, proprietary technology, or confidential client lists?",
              description: "Ruby will add enhanced confidentiality obligations, IP assignment with moral rights waiver, and return-of-materials provisions.",
              followUps: {
                onYes: [
                  {
                    id: "emp-ontario-trade-secrets-departing",
                    question: "Does the employee have the ability to copy, download, or transfer this proprietary information?",
                    description: "Employees with digital access to trade secrets are the highest flight risk. Ruby will add specific data handling obligations, exit interview requirements, and forensic audit rights on departure.",
                  },
                ],
              },
            },
            {
              id: "emp-ontario-25-employees",
              question: "Does your company have 25 or more employees?",
              description: "Companies with 25+ employees in Ontario must comply with the Working for Workers Act — electronic monitoring policies, disconnecting from work policies, and non-compete restrictions.",
            },
          ],
        },
      },
      // ── 2. British Columbia ──
      {
        id: "emp-bc",
        question: "Will the employee work primarily in British Columbia?",
        description: "BC's Employment Standards Act has different minimums for vacation (2 weeks after 1 year, 3 weeks after 5 years), termination notice, and overtime calculations.",
        appliesTo: ["standard-employment", "fixed-term", "executive-employment", "offer-letter", "internship-coop"],
        followUps: {
          onYes: [
            {
              id: "emp-bc-hightech",
              question: "Will the employee work in technology, film, or high-tech industries?",
              description: "BC has specific high-tech exemptions from hours of work and overtime under the Employment Standards Regulation. Ruby will apply these if eligible.",
            },
            {
              id: "emp-bc-unionized",
              question: "Is there an existing collective agreement or union certification at this workplace?",
              description: "BC's Labour Relations Code overrides individual employment contracts where a union is certified. Your individual agreement cannot offer less than the collective agreement, and certain clauses may be unenforceable.",
            },
          ],
        },
      },
      // ── 3. Alberta ──
      {
        id: "emp-alberta",
        question: "Will the employee work primarily in Alberta?",
        description: "Alberta's Employment Standards Code has distinct rules for overtime banking, vacation pay calculations, and group termination notice.",
        appliesTo: ["standard-employment", "fixed-term", "executive-employment", "offer-letter", "internship-coop"],
        followUps: {
          onYes: [
            {
              id: "emp-alberta-overtime-banking",
              question: "Will the employee be eligible for overtime banking arrangements?",
              description: "Alberta allows overtime banking by written agreement, but banked hours must be paid at 1.5x if not taken as time off within 6 months. Ruby will draft compliant overtime banking provisions.",
            },
          ],
        },
      },
      // ── 4. Quebec ──
      {
        id: "emp-quebec",
        question: "Will the employee work primarily in Quebec?",
        description: "Quebec's Act Respecting Labour Standards and Charter of the French Language require French-language employment contracts and unique notice provisions. Ruby will generate bilingual-compliant documentation.",
        appliesTo: ["standard-employment", "fixed-term", "executive-employment", "offer-letter", "internship-coop"],
        followUps: {
          onYes: [
            {
              id: "emp-quebec-language",
              question: "Will the employment contract be provided in French?",
              description: "Under Quebec's Charter of the French Language, employees have a right to work in French. If the contract is English-only and a dispute arises, a court may interpret ambiguities against the employer. Ruby will generate a bilingual version.",
            },
            {
              id: "emp-quebec-psychological-harassment",
              question: "Does your company have a psychological harassment prevention policy?",
              description: "Quebec's Act Respecting Labour Standards s.81.19 mandates that every employer have a psychological harassment prevention and complaint-handling policy. Failure to implement one exposes the company to CNESST complaints and damages.",
            },
          ],
        },
      },
      // ── 5. Fixed-term ──
      {
        id: "emp-fixed-term",
        question: "Is this a fixed-term or project-based position with a defined end date?",
        description: "Fixed-term contracts carry unique risks under Howard v. Benson Group — early termination without proper provisions can result in damages for the entire remaining term.",
        appliesTo: ["fixed-term"],
        followUps: {
          onYes: [
            {
              id: "emp-fixed-term-renewal",
              question: "Will there be a possibility of renewal or extension?",
              description: "Successive renewals can convert a fixed-term contract into an indefinite one under Ceccol v. Ontario Gymnastic Federation. Ruby will add clear renewal mechanics and non-renewal notice.",
              followUps: {
                onYes: [
                  {
                    id: "emp-fixed-term-renewal-count",
                    question: "Has this person already been on one or more previous fixed-term contracts with your company?",
                    description: "Multiple successive contracts dramatically increase the risk of deemed indefinite employment. Courts look at the total duration and number of renewals. Ruby will add explicit anti-evergreen language and maximum renewal caps.",
                  },
                ],
              },
            },
            {
              id: "emp-fixed-term-12mo",
              question: "Does the contract term exceed 12 months?",
              description: "Longer fixed terms increase the employer's exposure if early termination provisions aren't properly drafted. Ruby will add graduated early termination payments.",
            },
            {
              id: "emp-fixed-term-early-termination",
              question: "Do you need the right to terminate this contract before the end date?",
              description: "Without an explicit early termination clause in a fixed-term contract, you may owe the employee their full remaining salary for the unexpired term. This is the most expensive mistake in fixed-term drafting.",
            },
          ],
        },
      },
      // ── 6. Non-compete / Non-solicitation ──
      {
        id: "emp-non-compete",
        question: "Will you require the employee to sign a non-compete or non-solicitation agreement?",
        description: "Post-Waksdale and ESA s.67.2, non-competes for non-executive employees in Ontario are unenforceable. Ruby will draft enforceable non-solicitation alternatives or apply the executive exception.",
        appliesTo: ["standard-employment", "executive-employment", "non-compete"],
        followUps: {
          onYes: [
            {
              id: "emp-non-compete-sales",
              question: "Is the employee in a sales, client-facing, or business development role?",
              description: "Client-facing roles justify stronger non-solicitation provisions. Ruby will draft specific client and prospect non-solicitation with reasonable temporal and geographic scope per Elsley v. Collins.",
            },
            {
              id: "emp-non-compete-key-clients",
              question: "Does the employee have direct access to your company's key clients or accounts?",
              description: "Direct client access strengthens the enforceability of non-solicitation covenants. Ruby will tailor the restricted activities to the specific client relationships.",
            },
            {
              id: "emp-non-compete-garden-leave",
              question: "Are you willing to pay the employee during the restricted period (garden leave)?",
              description: "Paid garden leave provisions are significantly more enforceable than unpaid restrictions. Courts view them as reasonable because the employee is compensated for the restraint. Ruby will draft a garden leave clause with salary continuation.",
            },
          ],
          onNo: [
            {
              id: "emp-no-noncompete-confidentiality",
              question: "Will you at least require a confidentiality and non-disclosure agreement?",
              description: "Even without non-compete or non-solicitation, a standalone NDA protects trade secrets and confidential information. Without one, your only protection is the common law duty of good faith, which is narrow and hard to enforce.",
            },
          ],
        },
      },
      // ── 7. Equity compensation ──
      {
        id: "emp-equity",
        question: "Will the employee receive equity compensation (stock options, RSUs, phantom shares)?",
        description: "Equity-compensated employees need specific vesting schedules, treatment on termination (accelerated vs forfeited), tax implications under ITA s.7, and securities compliance provisions.",
        appliesTo: ["executive-employment", "standard-employment"],
        followUps: {
          onYes: [
            {
              id: "emp-equity-vesting",
              question: "Should equity vest on a time-based schedule or milestone-based schedule?",
              description: "Ruby will configure the appropriate vesting mechanic — standard 4-year with 1-year cliff, or custom milestones tied to performance targets.",
            },
            {
              id: "emp-equity-termination-treatment",
              question: "Should unvested equity be forfeited on termination without cause?",
              description: "Courts in Paquette v. TeraGo increasingly award damages for lost equity on wrongful dismissal. If your plan forfeits unvested options on termination, the termination clause must be airtight or the employee can claim the value of options that would have vested during the reasonable notice period.",
              followUps: {
                onYes: [
                  {
                    id: "emp-equity-clawback",
                    question: "Should there be a clawback provision for vested but unexercised options?",
                    description: "Clawback provisions on vested equity are harder to enforce and may be struck down as a penalty clause. Ruby will draft a post-termination exercise window instead, which achieves a similar result with better enforceability.",
                  },
                ],
              },
            },
            {
              id: "emp-equity-tax-election",
              question: "Will the employee need to file a Section 7 tax election or 83(b) equivalent?",
              description: "Stock option taxation under ITA s.7 can create a significant tax bill on exercise if the employee does not plan properly. Ruby will add a tax acknowledgment clause so the company is not liable for the employee's tax planning failures.",
            },
          ],
        },
      },
      // ── 8. Remote / multi-province ──
      {
        id: "emp-remote",
        question: "Will this person work remotely, in a hybrid arrangement, or from multiple provinces?",
        description: "Multi-province work arrangements trigger complex questions about which province's employment standards apply. Ruby will add choice-of-law provisions and address the Pfizer v. Chicken Delight cross-border analysis.",
        appliesTo: ["standard-employment", "fixed-term", "executive-employment", "offer-letter", "internship-coop", "contractor"],
        followUps: {
          onYes: [
            {
              id: "emp-remote-equipment",
              question: "Will the company provide equipment (laptop, phone, monitors) for remote work?",
              description: "Remote equipment creates questions about ownership on termination, expense reimbursement, and insurance liability. Ruby will add an equipment schedule and return-on-departure provisions.",
            },
            {
              id: "emp-remote-us-resident",
              question: "Will the employee be working from outside Canada at any point?",
              description: "An employee working from a foreign jurisdiction — even temporarily — can trigger permanent establishment risk, foreign employment standards, and tax withholding obligations. Even a few weeks in the US can create state tax nexus.",
              followUps: {
                onYes: [
                  {
                    id: "emp-remote-us-tax-nexus",
                    question: "Will the employee spend more than 183 days outside Canada in any calendar year?",
                    description: "Exceeding 183 days in most jurisdictions creates tax residency. The employee may become subject to foreign employment standards, and your company may have foreign payroll obligations. Ruby will add a mandatory location-reporting provision.",
                  },
                ],
              },
            },
          ],
        },
      },
      // ── 9. Prior employment / competitor ──
      {
        id: "emp-prior-employer",
        question: "Has the employee worked for a direct competitor in the last 2 years?",
        description: "Hiring from competitors creates inevitable disclosure risk and potential tortious interference claims. You need to know what obligations they are bringing with them before you sign.",
        appliesTo: ["standard-employment", "executive-employment", "offer-letter", "internship-coop"],
        followUps: {
          onYes: [
            {
              id: "emp-prior-employer-noncompete",
              question: "Does the employee have an active non-compete or non-solicitation from their previous employer?",
              description: "If the employee is bound by a prior non-compete and you hire them anyway, your company can be sued for inducing breach of contract. Ruby will add representations that the employee is free to work and an indemnity for prior employer claims.",
              followUps: {
                onYes: [
                  {
                    id: "emp-prior-employer-noncompete-review",
                    question: "Have you reviewed the actual text of their prior restrictive covenant?",
                    description: "Do not rely on the employee's characterization. The actual clause may be broader or narrower than they describe. Ruby will add a condition precedent requiring delivery and legal review of the prior agreement before the start date.",
                  },
                ],
              },
            },
            {
              id: "emp-prior-employer-ip",
              question: "Did the employee develop any intellectual property at their prior employer?",
              description: "If the employee brings contaminated IP into your company, the prior employer could claim ownership of your product. Ruby will add an IP originality representation and a pre-hire IP disclosure schedule.",
            },
          ],
        },
      },
      // ── 10. Managerial authority ──
      {
        id: "emp-manager",
        question: "Will this employee manage a team of 5 or more people?",
        description: "Employees with significant managerial responsibility may qualify as managers under ESA overtime exemptions, but misclassifying someone as a manager when they are not can trigger retroactive overtime claims.",
        appliesTo: ["standard-employment", "executive-employment", "offer-letter", "internship-coop"],
        followUps: {
          onYes: [
            {
              id: "emp-manager-hiring-firing",
              question: "Will they have authority to hire, discipline, or terminate team members?",
              description: "True hiring/firing authority is a key factor in the managerial exemption analysis. Without it, calling someone a 'manager' does not exempt them from overtime. Ruby will document the actual scope of authority.",
            },
            {
              id: "emp-manager-budget",
              question: "Will they control a departmental budget or approve expenditures?",
              description: "Budget authority strengthens the managerial exemption argument and also triggers fiduciary-like duties. Ruby will add appropriate spending authorization limits and reporting obligations.",
            },
          ],
        },
      },
      // ── 11. Probation period ──
      {
        id: "emp-probation",
        question: "Will the employment agreement include a probationary period?",
        description: "Probation periods are widely misunderstood. They do NOT allow you to terminate without notice — ESA minimums still apply after 3 months. A poorly worded probation clause can backfire under Nagribianko v. Select Wine Merchants.",
        appliesTo: ["standard-employment", "offer-letter", "internship-coop"],
        followUps: {
          onYes: [
            {
              id: "emp-probation-length",
              question: "Will the probation period exceed 3 months?",
              description: "After 3 months in Ontario, ESA termination notice requirements apply regardless of probation status. A 6-month probation clause that promises 'termination without notice during probation' will be struck down. Ruby will align the probation clause with ESA minimums.",
            },
          ],
          onNo: [
            {
              id: "emp-no-probation-notice",
              question: "Will you include a termination clause that limits severance to ESA minimums?",
              description: "Without a probationary period and without a valid termination clause, common law reasonable notice applies — which can be 1 month per year of service or more. This is the single highest-cost omission in employment agreements. If yes, Waksdale may invalidate your entire termination clause if any part of it falls below ESA minimums.",
            },
          ],
        },
      },
      // ── 12. Financial handling ──
      {
        id: "emp-financial-handling",
        question: "Will this employee handle client money or financial transactions?",
        description: "Employees who handle client funds create bonding, insurance, and fiduciary obligation requirements. If money goes missing, the employer may be vicariously liable. Ruby will add fidelity bond requirements, trust account handling procedures, and enhanced termination-for-cause provisions tied to financial misconduct.",
        appliesTo: ["standard-employment", "executive-employment", "offer-letter", "internship-coop"],
      },
      // ── 13. Unionized workplace ──
      {
        id: "emp-unionized",
        question: "Is this a unionized workplace or is there any union organizing activity?",
        description: "If a union is certified at your workplace, individual employment contracts cannot offer less than the collective agreement, and certain clauses (like individual termination provisions) may be unenforceable. During organizing activity, employers face strict rules under provincial labour relations legislation about what they can say and do.",
        appliesTo: ["standard-employment", "offer-letter", "internship-coop"],
        followUps: {
          onYes: [
            {
              id: "emp-unionized-scope",
              question: "Is this employee within the bargaining unit covered by the collective agreement?",
              description: "If the employee falls within the bargaining unit, their terms and conditions are governed by the collective agreement, not the individual employment contract. The individual contract is largely unenforceable for in-scope employees. Ruby will flag the appropriate approach based on bargaining unit scope.",
            },
          ],
        },
      },
      // ── 14. Cross-provincial work ──
      {
        id: "emp-cross-provincial",
        question: "Will the employee work across provincial borders (e.g., live in one province, work in another)?",
        description: "Cross-provincial employment triggers complex jurisdictional questions about which province's employment standards apply, which workers' compensation board covers the employee, and which province's tax rules apply. The analysis differs from pure remote work because the employee may physically attend offices in multiple provinces.",
        appliesTo: ["standard-employment", "fixed-term", "executive-employment", "offer-letter", "internship-coop"],
        followUps: {
          onYes: [
            {
              id: "emp-cross-provincial-which-law",
              question: "Is the employee's primary workplace in a different province from the employer's head office?",
              description: "Employment standards generally follow the employee's primary workplace, not the employer's jurisdiction. If an Ontario company hires someone working primarily in BC, BC employment standards apply. Mistakes here lead to non-compliant termination provisions. Ruby will apply the correct provincial minimums.",
            },
          ],
        },
      },
      // ── 15. Contractor vs. employee ──
      {
        id: "emp-misclassification",
        question: "Is there any chance this role could be classified as an independent contractor rather than an employee?",
        description: "Worker misclassification is a top CRA audit target. If CRA reclassifies a contractor as an employee, the company owes retroactive CPP, EI, source deductions, and penalties. The test is substance over form — it does not matter what the contract says if the working relationship looks like employment.",
        appliesTo: ["standard-employment", "contractor", "offer-letter"],
        followUps: {
          onYes: [
            {
              id: "emp-misclassification-control",
              question: "Will the company control how, when, and where the work is performed?",
              description: "Control over the manner of work is the single strongest indicator of employment under the Wiebe Door / 671122 Ontario Ltd. test. If you control the how, you likely have an employee regardless of what the contract says.",
            },
            {
              id: "emp-misclassification-tools",
              question: "Will the company provide tools, equipment, or software licenses?",
              description: "Providing tools and equipment points toward employment under the ownership-of-tools factor in the four-fold test. True contractors typically supply their own tools.",
            },
            {
              id: "emp-misclassification-exclusivity",
              question: "Will this person work exclusively for your company?",
              description: "Exclusivity is a major red flag for misclassification. True contractors serve multiple clients. If this person works only for you, CRA will likely view them as an employee. Ruby will add a right-to-engage-others clause, but the actual practice must match.",
            },
          ],
        },
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CORPORATE MODULE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "corporate",
    category: "corporate",
    title: "Corporate / Shareholder Compliance",
    description: "Shareholder agreements, corporate governance, deadlock resolution, and exit mechanics under CBCA and provincial BCAs.",
    name: "Corporate / Shareholder Compliance",
    shortName: "Corporate",
    alwaysOn: false,
    severity: "critical",
    riskDescription: "Shareholder disputes are the most expensive commercial litigation in Canada. A poorly drafted SHA can cost $500K+ to litigate.",
    riskProfile: {
      level: "critical",
      factors: [
        "Shareholder disputes are the most expensive commercial litigation in Canada.",
        "A poorly drafted SHA can cost $500K+ to litigate.",
        "Deadlock without resolution mechanics causes corporate paralysis.",
        "Oppression remedy claims under CBCA s.241 carry broad judicial remedies.",
      ],
    },
    triggers: [
      // ── 1. Number of shareholders ──
      {
        id: "corp-shareholder-count",
        question: "How many shareholders will be party to this agreement?",
        description: "The number of parties fundamentally changes the agreement structure — deadlock resolution, voting thresholds, board composition, and exit mechanics all depend on shareholder count.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "deadlock-usa", "pe-backed-usa", "jv-usa"],
        followUps: {
          onYes: [
            // "Yes" context: 2 shareholders
            {
              id: "corp-equal-split",
              question: "Is the ownership split 50/50 or close to equal?",
              description: "Equal splits create inherent deadlock risk. Ruby will include mandatory mediation, arbitration, and shotgun buy-sell provisions to prevent corporate paralysis.",
              followUps: {
                onYes: [
                  {
                    id: "corp-equal-split-shotgun",
                    question: "Are both shareholders financially capable of buying the other out?",
                    description: "Shotgun (buy-sell) clauses only work if both parties can realistically afford to buy. If one shareholder has significantly more capital, the shotgun becomes a tool of oppression. Ruby will add fair market value appraisal alternatives alongside the shotgun.",
                  },
                ],
              },
            },
          ],
          onNo: [
            // "No" context: 3+ shareholders
            {
              id: "corp-majority-holder",
              question: "Will any single shareholder hold more than 50% of voting shares?",
              description: "Majority control changes the power dynamics. Ruby will add minority protections — veto rights on fundamental matters, information rights, and oppression remedy acknowledgments under CBCA s.241.",
              followUps: {
                onYes: [
                  {
                    id: "corp-majority-squeeze-out",
                    question: "Could the majority shareholder reach 90% ownership (triggering compulsory acquisition rights)?",
                    description: "Under CBCA s.206, a shareholder holding 90% or more can force remaining minority shareholders to sell. Minority shareholders need pre-emptive protections and fair value guarantees. Ruby will add squeeze-out pricing protections.",
                  },
                ],
              },
            },
            {
              id: "corp-share-classes",
              question: "Will there be different classes of shares (common, preferred, founder shares)?",
              description: "Multiple share classes require specific rights, preferences, and privileges for each class. Ruby will structure the waterfall, voting rights, and conversion mechanics.",
            },
          ],
        },
      },
      // ── 2. Founder vesting ──
      {
        id: "corp-founder-vesting",
        question: "Will founders be subject to vesting on their shares?",
        description: "Founder vesting protects co-founders if someone leaves early. Ruby will configure the vesting schedule, cliff period, acceleration triggers, and treatment of unvested shares on departure.",
        appliesTo: ["emerging-corp-usa", "two-party-usa", "founders-lock-up"],
        followUps: {
          onYes: [
            {
              id: "corp-vesting-acceleration",
              question: "Should vesting accelerate on change of control (acquisition) or termination without cause?",
              description: "Single-trigger (on acquisition) or double-trigger (acquisition + termination) acceleration. Ruby will draft the appropriate mechanism.",
            },
            {
              id: "corp-vesting-ip-contribution",
              question: "Did any founder contribute pre-existing IP to the company in exchange for their shares?",
              description: "If a founder leaves before fully vesting, who owns the IP they contributed? Without clear IP assignment that is independent of vesting, a departed founder could claim their IP back. Ruby will ensure IP assignment is unconditional and survives any share forfeiture.",
            },
          ],
          onNo: [
            {
              id: "corp-no-vesting-departure",
              question: "What happens if a co-founder leaves in the first year?",
              description: "Without vesting, a co-founder who leaves after 3 months keeps their full equity stake and gets a free ride on everyone else's work. This is the #1 cause of co-founder disputes. Ruby strongly recommends adding at least a basic vesting schedule.",
            },
          ],
        },
      },
      // ── 3. Investor-shareholders ──
      {
        id: "corp-investor-shareholders",
        question: "Are any shareholders also investors (not just founders or employees)?",
        description: "Investor-shareholders typically require board seats, information rights, anti-dilution protection, and liquidation preferences that pure founder SHAs don't include.",
        appliesTo: ["pe-backed-usa", "emerging-corp-usa"],
        followUps: {
          onYes: [
            {
              id: "corp-prior-capital",
              question: "Has the company already raised external capital (angel, seed, Series A, or later)?",
              description: "Pre-existing investors may have rights that constrain the new agreement. Ruby will cross-reference with investors' rights agreements and ensure consistency.",
              followUps: {
                onYes: [
                  {
                    id: "corp-prior-capital-antidilution",
                    question: "Do existing investors have anti-dilution protection (full ratchet or weighted average)?",
                    description: "If existing investors have anti-dilution rights and this round is a down round, their shares will automatically adjust, further diluting founders. Ruby will model the dilution impact and ensure the new agreement accounts for the ratchet.",
                  },
                ],
              },
            },
            {
              id: "corp-board-representation",
              question: "Will investors have board representation or observer rights?",
              description: "Ruby will add board composition provisions, observer rights, committee structure, and D&O insurance requirements.",
            },
            {
              id: "corp-investor-info-rights",
              question: "Will investors receive ongoing financial information (monthly/quarterly reports)?",
              description: "Information rights seem innocuous but create real obligations — you must actually produce the reports on time or face breach claims. Ruby will define exactly what information is provided, how often, and the cure period for late delivery.",
              followUps: {
                onYes: [
                  {
                    id: "corp-investor-audit-rights",
                    question: "Will investors have the right to audit the company's books?",
                    description: "Audit rights can be weaponized by hostile shareholders. Ruby will add reasonable restrictions — advance notice, business hours only, no more than once per year, and costs borne by the requesting shareholder unless discrepancies are found.",
                  },
                ],
              },
            },
          ],
        },
      },
      // ── 4. Drag-along ──
      {
        id: "corp-drag-along",
        question: "Will the agreement include drag-along rights (forcing minority shareholders to sell)?",
        description: "Drag-along rights are essential for exit scenarios but must be carefully drafted to avoid oppression claims under CBCA s.241. Ruby will set appropriate thresholds and pricing protections.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "pe-backed-usa", "voting-agreement"],
        followUps: {
          onYes: [
            {
              id: "corp-drag-along-threshold",
              question: "What voting threshold will trigger drag-along rights (e.g., 66.7%, 75%, 90%)?",
              description: "A lower threshold makes exits easier but gives minority shareholders less protection. The standard is 66.7% to 75%. Ruby will set the threshold and add a minimum price floor so minority shareholders cannot be dragged at a fire-sale price.",
            },
            {
              id: "corp-drag-along-tag-along",
              question: "Will minority shareholders also have tag-along (co-sale) rights?",
              description: "Tag-along rights are the flip side of drag-along — they let minority shareholders sell alongside the majority on the same terms. Without tag-along, a majority shareholder can sell their stake to a third party and leave minorities trapped with a new, unknown controlling shareholder.",
            },
          ],
        },
      },
      // ── 5. Incorporation jurisdiction ──
      {
        id: "corp-incorporation",
        question: "Is the company incorporated federally (CBCA) or provincially?",
        description: "CBCA and provincial acts have different rules for unanimous shareholder agreements, share transfer restrictions, and director liability. Ruby will tailor the agreement to your incorporation statute.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "articles-incorporation", "restated-articles", "articles-amendment"],
        followUps: {
          onYes: [
            // "Yes" context: CBCA
            {
              id: "corp-usa-s146",
              question: "Will this be a Unanimous Shareholder Agreement under CBCA s.146?",
              description: "USAs under CBCA s.146 can restrict director powers and transfer them to shareholders — a powerful tool but must include ALL shareholders to be valid. A single missing signatory invalidates the entire USA.",
              followUps: {
                onYes: [
                  {
                    id: "corp-usa-s146-new-shareholders",
                    question: "How will new shareholders be bound by the USA after signing?",
                    description: "Under CBCA s.146(3), a new shareholder is deemed a party to the USA, but they must receive a copy. If the corporation fails to notify a transferee, the transfer is voidable. Ruby will add mandatory USA delivery provisions to the share transfer mechanics.",
                  },
                ],
              },
            },
          ],
        },
      },
      // ── 6. Shareholder-employees ──
      {
        id: "corp-shareholder-employees",
        question: "Are any shareholders also employees of the company?",
        description: "Shareholder-employees create overlapping legal relationships — employment law, corporate law, and tax law all apply simultaneously. The biggest trap is conflicting IP assignment clauses between the employment agreement and the SHA.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "pe-backed-usa"],
        followUps: {
          onYes: [
            {
              id: "corp-shareholder-employee-ip",
              question: "Do their employment agreements contain IP assignment clauses that could conflict with shareholder IP rights?",
              description: "If the employment agreement assigns all IP to the company and the SHA gives shareholders IP licenses, you have a conflict. Ruby will harmonize the IP provisions across both agreements.",
            },
            {
              id: "corp-shareholder-employee-termination",
              question: "Does termination of employment trigger a share buyback obligation?",
              description: "Linking employment termination to share forfeiture or forced buyback is extremely common but creates wrongful dismissal exposure — courts may treat the lost equity as additional severance damages. Ruby will draft carefully separated triggers.",
            },
          ],
        },
      },
      // ── 7. Deadlock resolution ──
      {
        id: "corp-deadlock",
        question: "Have you considered what happens if shareholders cannot agree on a major decision?",
        description: "Deadlock is the silent killer of closely-held corporations. Without a resolution mechanism, your only option is an oppression application in court — which costs $100K+ and takes years. Every SHA needs a deadlock resolution ladder.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "deadlock-usa", "jv-usa"],
        followUps: {
          onYes: [
            {
              id: "corp-deadlock-mechanism",
              question: "Do you prefer mediation/arbitration, shotgun buy-sell, or a put/call mechanism?",
              description: "Each mechanism suits different situations. Mediation preserves the relationship. Shotgun is fast but favors the wealthier party. Put/call gives both sides options. Ruby will draft a multi-stage ladder: negotiation first, then mediation, then the chosen final mechanism.",
            },
          ],
        },
      },
      // ── 8. Share transfer restrictions ──
      {
        id: "corp-transfer-restrictions",
        question: "Will there be restrictions on shareholders transferring their shares?",
        description: "Without transfer restrictions, a shareholder can sell to anyone — including competitors, problematic individuals, or strangers. Right of first refusal (ROFR) and board approval requirements are essential for closely-held companies.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "pe-backed-usa", "jv-usa"],
        followUps: {
          onYes: [
            {
              id: "corp-rofr",
              question: "Will existing shareholders have a right of first refusal (ROFR)?",
              description: "ROFR lets existing shareholders match any third-party offer before a sale can proceed. Ruby will draft the ROFR with clear timelines, pricing mechanics, and partial exercise rights.",
            },
            {
              id: "corp-transfer-permitted",
              question: "Will transfers to family members, trusts, or holding companies be permitted without restrictions?",
              description: "Permitted transfers to related parties are standard but must be carefully defined. An overly broad permitted transfer clause lets shareholders move shares to entities you cannot control. Ruby will add conditions — the transferee must be bound by the SHA and the transferor must retain control of the entity.",
            },
          ],
        },
      },
      // ── 9. Valuation methodology ──
      {
        id: "corp-valuation",
        question: "Have you agreed on how the company will be valued for buyouts, exits, or share transfers?",
        description: "Valuation disputes are the #1 issue in shareholder buyouts. If the SHA is silent on valuation methodology, you will spend $50K+ on competing valuators in court. Agree on the formula now while everyone is still friendly.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "pe-backed-usa", "deadlock-usa"],
        followUps: {
          onYes: [
            {
              id: "corp-valuation-method",
              question: "Will you use a formula (e.g., multiple of EBITDA), independent valuator, or fair market value?",
              description: "Formula-based valuations are predictable but may not reflect true value. Independent valuators are accurate but expensive and slow. Ruby will draft the chosen method with fallback to independent valuation if parties dispute the formula result.",
            },
            {
              id: "corp-valuation-minority-discount",
              question: "Should minority shareholders receive fair market value or a discounted price on buyout?",
              description: "Minority discounts (typically 15-35%) are standard in private company valuations but feel punitive to the departing shareholder. Courts in oppression cases often disallow minority discounts. Ruby will configure the discount based on the exit scenario (voluntary vs involuntary departure).",
            },
          ],
        },
      },
      // ── 10. Dividend policy ──
      {
        id: "corp-dividends",
        question: "Will the SHA include a dividend or distribution policy?",
        description: "Without a dividend policy, the controlling shareholders can indefinitely retain earnings while minority shareholders receive nothing — a classic oppression scenario. Ruby will add minimum distribution requirements or a dividend threshold trigger.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "pe-backed-usa"],
        followUps: {
          onYes: [
            {
              id: "corp-dividends-tax",
              question: "Are shareholders in different tax brackets or tax jurisdictions?",
              description: "Dividend timing and characterization have major tax consequences. Some shareholders may prefer salary, others dividends. Ruby will add flexibility provisions and a tax-efficient distribution waterfall.",
            },
          ],
        },
      },
      // ── 11. Non-competition among shareholders ──
      {
        id: "corp-shareholder-noncompete",
        question: "Should shareholders be restricted from competing with the company?",
        description: "Unlike employment non-competes, shareholder non-competes are generally enforceable because they are negotiated between sophisticated parties with consideration (the shares). But they still need reasonable scope, geography, and duration.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "jv-usa"],
        followUps: {
          onYes: [
            {
              id: "corp-shareholder-noncompete-post-exit",
              question: "Should the non-compete survive after a shareholder sells their shares?",
              description: "A post-exit non-compete restricts a departing shareholder from competing for a period after selling. This is standard but the duration must be reasonable — typically 1-2 years. Ruby will tie the non-compete duration to the buyout price as additional consideration.",
            },
          ],
        },
      },
      // ── 12. Shareholder-directors ──
      {
        id: "corp-shareholder-directors",
        question: "Will any shareholder also be a director of the company?",
        description: "Shareholder-directors wear two hats — they owe fiduciary duties as directors under CBCA s.122 while simultaneously having rights as shareholders. This creates conflicts of interest on compensation, related-party transactions, and strategic decisions. Ruby will add conflict-of-interest protocols, recusal provisions, and independent director requirements for key decisions.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "pe-backed-usa"],
        followUps: {
          onYes: [
            {
              id: "corp-shareholder-director-conflict",
              question: "Could the shareholder-director's personal interests conflict with the company's interests on major decisions?",
              description: "Directors must act in the best interest of the corporation, not themselves. A shareholder-director voting to approve their own compensation or a related-party deal faces breach of fiduciary duty claims. Ruby will add mandatory disclosure of conflicts and abstention requirements for conflicted votes.",
            },
          ],
        },
      },
      // ── 13. Multiple share classes ──
      {
        id: "corp-multiple-share-classes",
        question: "Are there multiple share classes with different voting rights?",
        description: "Dual-class or multi-class share structures (e.g., 10x voting shares for founders, non-voting preferred for investors) create power imbalances that must be carefully documented. Minority holders of non-voting shares have limited influence but retain oppression remedy rights under CBCA s.241. Ruby will draft class-specific rights, conversion triggers, and sunset provisions on supervoting shares.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "pe-backed-usa", "articles-incorporation", "restated-articles"],
        followUps: {
          onYes: [
            {
              id: "corp-multiple-share-classes-sunset",
              question: "Will supervoting or founder shares have a sunset clause (automatic conversion to regular voting shares)?",
              description: "Sunset clauses convert supervoting shares to ordinary shares after a set period or triggering event (e.g., IPO, founder departure). Without a sunset, founders can maintain control indefinitely regardless of their economic interest. Ruby will draft time-based or event-based sunset provisions.",
            },
          ],
        },
      },
      // ── 14. Key person provisions ──
      {
        id: "corp-key-person",
        question: "Is the company's value heavily dependent on one or two key individuals?",
        description: "If the CEO or lead developer dies, becomes disabled, or leaves, what happens? Key person provisions trigger buyback rights, insurance requirements, and succession planning. Without them, you are one bad event away from corporate paralysis.",
        appliesTo: ["two-party-usa", "emerging-corp-usa", "pe-backed-usa"],
        followUps: {
          onYes: [
            {
              id: "corp-key-person-insurance",
              question: "Does the company carry key person life and disability insurance?",
              description: "Key person insurance funds the buyback of a deceased or disabled shareholder's shares. Without it, the company may not have the cash to buy out the estate, creating a forced relationship with the deceased's heirs. Ruby will add insurance maintenance covenants and use-of-proceeds provisions.",
            },
            {
              id: "corp-key-person-death",
              question: "Have you addressed what happens to shares if a shareholder dies?",
              description: "Without a death buyback provision, shares pass to the deceased's estate — meaning you could end up in business with their spouse, children, or estate trustee. Ruby will add a mandatory buyback on death, funded by key person insurance, at a pre-agreed valuation.",
            },
          ],
        },
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INVESTMENT MODULE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "investment",
    category: "investment",
    title: "Investment & Securities Compliance",
    description: "Securities law compliance for capital raises — NI 45-106 exemptions, SAFE/convertible mechanics, and investor protections.",
    name: "Investment & Securities Compliance",
    shortName: "Investment",
    alwaysOn: false,
    severity: "critical",
    riskDescription: "Securities law violations carry personal liability, regulatory sanctions, and potential criminal penalties. Every capital raise must comply with NI 45-106 prospectus exemptions.",
    riskProfile: {
      level: "critical",
      factors: [
        "Securities law violations carry personal liability, regulatory sanctions, and potential criminal penalties.",
        "Every capital raise must comply with NI 45-106 prospectus exemptions.",
        "Investors have a statutory right of rescission if exemptions are not properly relied upon.",
        "Directors face personal liability for non-compliant securities issuances.",
      ],
    },
    triggers: [
      // ── 1. Accredited investors ──
      {
        id: "inv-accredited",
        question: "Will the company raise capital from accredited investors under NI 45-106?",
        description: "The accredited investor exemption (NI 45-106 s.2.3) is the most common Canadian prospectus exemption. Ruby will include full accredited investor representations, risk acknowledgments, and Form 45-106F1 filing provisions.",
        appliesTo: ["subscription-agreement-ni45106", "safe-agreement", "equity-financing", "share-subscription", "term-sheet", "series-b-financing", "series-c-financing"],
        followUps: {
          onYes: [
            {
              id: "inv-non-canadian",
              question: "Will any investors be non-Canadian residents?",
              description: "Cross-border investors trigger additional securities compliance — US Reg D, Reg S, or other foreign exemptions. Ruby will add appropriate non-Canadian investor representations and legends.",
              followUps: {
                onYes: [
                  {
                    id: "inv-non-canadian-us",
                    question: "Will any investors be US residents or US entities?",
                    description: "US investors require Reg D (Rule 506(b) or 506(c)) compliance, Form D filing with the SEC, and blue sky notice filings in each investor's home state. Failure to comply gives the US investor a rescission right. Ruby will add Reg D representations and US legends.",
                  },
                ],
              },
            },
            {
              id: "inv-prior-issuances",
              question: "Has the company previously issued securities under a prospectus exemption?",
              description: "Prior issuances may affect hold period calculations under NI 45-102 and require disclosure of existing shareholders and dilution impact.",
            },
            {
              id: "inv-over-1m",
              question: "Will the raise exceed $1,000,000 in total?",
              description: "Larger raises may trigger additional reporting requirements and OSC filing obligations. Ruby will include appropriate disclosure schedules and filing timelines.",
            },
          ],
          onNo: [
            {
              id: "inv-friends-family",
              question: "Will you rely on the friends, family, and business associates exemption (NI 45-106 s.2.5)?",
              description: "The friends/family exemption has strict relationship requirements — the investor must be a close personal friend, family member, or close business associate of a director or officer. Casual acquaintances do not qualify. Misuse of this exemption gives the investor a statutory rescission right.",
            },
            {
              id: "inv-offering-memo",
              question: "Will you prepare an Offering Memorandum under NI 45-106 s.2.9?",
              description: "The OM exemption is available in most provinces and allows raises from non-accredited investors, but requires a detailed offering memorandum with prescribed disclosure. Investors get a 2-business-day cooling-off right to cancel their subscription.",
            },
          ],
        },
      },
      // ── 2. Security type ──
      {
        id: "inv-security-type",
        question: "What type of securities are being issued?",
        description: "SAFEs, convertible notes, preferred shares, and common shares each have different regulatory treatment, conversion mechanics, and investor protections.",
        appliesTo: ["safe-agreement", "convertible-note", "equity-financing", "subscription-agreement-ni45106", "term-sheet"],
        followUps: {
          onYes: [
            // "Yes" context: SAFE / convertible instrument
            {
              id: "inv-valuation-cap",
              question: "Will the SAFE or note include a valuation cap?",
              description: "Valuation caps set the maximum company valuation at which the instrument converts. Ruby will calculate the conversion mechanics and add MFN provisions.",
              followUps: {
                onYes: [
                  {
                    id: "inv-valuation-cap-mfn",
                    question: "Should this SAFE include a Most Favored Nation (MFN) clause?",
                    description: "MFN gives this investor the right to adopt the terms of any later SAFE issued on better terms (lower cap, higher discount). Without MFN, early investors can be disadvantaged by later, more favorable deals. Ruby will add MFN with automatic amendment mechanics.",
                  },
                ],
              },
            },
            {
              id: "inv-discount-rate",
              question: "Will there be a discount rate on conversion?",
              description: "Standard discount rates range from 15-25%. Ruby will draft the conversion price formula with the discount applied.",
            },
            {
              id: "inv-safe-dissolution",
              question: "What happens to the SAFE if the company dissolves before a qualifying financing?",
              description: "Most SAFEs rank junior to all creditors on dissolution, meaning the investor gets nothing. This is a risk investors often miss. Ruby will add dissolution payment provisions and clarify the SAFE's position in the waterfall.",
            },
          ],
          onNo: [
            // "No" context: priced equity round
            {
              id: "inv-pre-money",
              question: "Has a pre-money valuation been agreed?",
              description: "Ruby will calculate the price per share, post-money valuation, and dilution impact on existing shareholders.",
            },
            {
              id: "inv-liquidation-pref",
              question: "Will preferred shares have a liquidation preference?",
              description: "1x non-participating is standard. Ruby will configure the liquidation waterfall — participating vs non-participating, preference multiple, and cap.",
              followUps: {
                onYes: [
                  {
                    id: "inv-liquidation-pref-participating",
                    question: "Will the preference be participating (double-dip) or non-participating?",
                    description: "Participating preferred gets its preference PLUS its pro-rata share of remaining proceeds — this is very investor-favorable and can dramatically reduce founder proceeds on exit. Non-participating preferred must choose between the preference or converting to common. Ruby will model both scenarios.",
                  },
                ],
              },
            },
          ],
        },
      },
      // ── 3. Board seat ──
      {
        id: "inv-board-seat",
        question: "Will the lead investor require a board seat?",
        description: "Board seats for investors are standard at Series A and later. Ruby will add board composition provisions, observer rights, and committee structure.",
        appliesTo: ["equity-financing", "term-sheet", "pe-backed-usa", "series-b-financing", "series-c-financing", "investors-rights-agreement"],
        followUps: {
          onYes: [
            {
              id: "inv-board-seat-protective",
              question: "Will the investor have protective provisions (veto rights) on major decisions?",
              description: "Protective provisions let an investor veto things like new debt, equity issuances, acquisitions, or changes to the articles. This is standard but the scope matters enormously — overly broad veto rights can paralyze the company. Ruby will draft a balanced list of protected matters.",
            },
            {
              id: "inv-board-seat-removal",
              question: "Can the investor's board seat be removed if they sell their shares below a threshold?",
              description: "Board seats should be tied to ownership thresholds. If an investor sells down, they should lose their seat. Without this, a 2% holder could retain board control indefinitely. Ruby will add ownership-based qualification requirements.",
            },
          ],
        },
      },
      // ── 4. Pro-rata ──
      {
        id: "inv-pro-rata",
        question: "Will investors receive pro-rata participation rights for future rounds?",
        description: "Pro-rata rights let investors maintain their ownership percentage in future rounds. Ruby will calculate the pro-rata share on a fully-diluted basis and add pay-to-play provisions if applicable.",
        appliesTo: ["investors-rights-agreement", "safe-agreement", "equity-financing", "series-b-financing"],
        followUps: {
          onYes: [
            {
              id: "inv-pro-rata-pay-to-play",
              question: "Should investors who do not exercise pro-rata rights lose their preferred status (pay-to-play)?",
              description: "Pay-to-play converts non-participating investors' preferred shares to common, eliminating their liquidation preference and anti-dilution protection. This punishes free-riders and incentivizes continued support. Ruby will draft the automatic conversion mechanics.",
            },
            {
              id: "inv-pro-rata-super",
              question: "Will any investor receive super pro-rata rights (right to invest more than their proportional share)?",
              description: "Super pro-rata rights let a favored investor increase their ownership percentage in future rounds. This dilutes other shareholders more than standard pro-rata. Ruby will define the super pro-rata allocation and its priority relative to other investors' rights.",
            },
          ],
        },
      },
      // ── 5. Bridge round ──
      {
        id: "inv-bridge",
        question: "Is this a bridge round or interim financing before a priced round?",
        description: "Bridge financing has unique conversion mechanics — automatic conversion on qualified financing, optional conversion triggers, and maturity date handling. Ruby will draft appropriate conversion triggers and extension provisions.",
        appliesTo: ["convertible-note", "safe-agreement", "term-sheet"],
        followUps: {
          onYes: [
            {
              id: "inv-bridge-maturity",
              question: "What happens if the company does not raise a qualifying round before the note matures?",
              description: "This is the most litigated issue in convertible note disputes. Options include: automatic conversion at the cap, repayment demand right, or extension. If the note becomes due and the company cannot repay, the investor can force bankruptcy. Ruby will add clear maturity handling provisions.",
            },
            {
              id: "inv-bridge-existing-investors",
              question: "Are bridge investors also existing shareholders?",
              description: "Existing shareholders doing bridge financing creates conflict of interest — they are setting terms that benefit themselves as creditors while diluting outside shareholders. Ruby will add independent approval requirements and fairness protections.",
            },
          ],
        },
      },
      // ── 6. Information rights ──
      {
        id: "inv-info-rights",
        question: "Will investors have information rights (access to financial statements, cap table, etc.)?",
        description: "Information rights are the foundation of the investor-company relationship but can be burdensome. Every report you commit to is an obligation you must fulfill or face breach claims.",
        appliesTo: ["investors-rights-agreement", "equity-financing", "term-sheet", "series-b-financing", "series-c-financing"],
        followUps: {
          onYes: [
            {
              id: "inv-info-rights-frequency",
              question: "Will you provide monthly or quarterly financials?",
              description: "Monthly reporting is common at seed/Series A but extremely burdensome. Quarterly is more sustainable. Ruby will draft the reporting schedule with appropriate delivery deadlines and a cure period for late delivery.",
              followUps: {
                onYes: [
                  {
                    id: "inv-info-rights-audit",
                    question: "Will investors require annual audited financial statements?",
                    description: "Audited financials cost $15K-$50K+ per year depending on company size. Some investors require them even at the seed stage, which is a significant overhead for a startup. Ruby will add the audit obligation with a revenue threshold below which only reviewed financials are required.",
                  },
                ],
              },
            },
          ],
        },
      },
      // ── 7. Founder restrictions ──
      {
        id: "inv-founder-lockup",
        question: "Will founders be subject to share lockup or transfer restrictions?",
        description: "Investors want founders locked in. Standard lockups prevent founders from selling any shares for 1-3 years after the investment. Without a lockup, a founder could take the investment money and immediately sell their shares on the secondary market.",
        appliesTo: ["equity-financing", "term-sheet", "series-b-financing", "series-c-financing", "investors-rights-agreement"],
        followUps: {
          onYes: [
            {
              id: "inv-founder-lockup-exceptions",
              question: "Should founders be able to sell a small portion of shares for personal liquidity?",
              description: "Allowing founders to sell 10-15% of their holdings provides personal financial security and reduces the pressure to pursue a premature exit. Ruby will add a limited secondary sale carve-out with investor consent requirements.",
            },
          ],
        },
      },
      // ── 8. Representations and warranties ──
      {
        id: "inv-reps-warranties",
        question: "Will the company provide representations and warranties to investors?",
        description: "Reps and warranties are the investor's insurance policy. If any representation turns out to be false, the investor may have a claim for damages or rescission. The scope of reps is heavily negotiated — every rep is a potential liability for the company.",
        appliesTo: ["subscription-agreement-ni45106", "equity-financing", "share-subscription", "series-b-financing", "series-c-financing"],
        followUps: {
          onYes: [
            {
              id: "inv-reps-ip-ownership",
              question: "Can the company represent that it owns all of its intellectual property free and clear?",
              description: "This is the rep most likely to be breached. Open source components, contractor-created code without proper IP assignment, and founder-contributed pre-existing IP all create holes. Ruby will add appropriate IP disclosure schedules and carve-outs.",
            },
            {
              id: "inv-reps-litigation",
              question: "Is the company currently involved in any litigation, disputes, or regulatory proceedings?",
              description: "Undisclosed litigation is a deal-killer. If the company represents 'no litigation' and a lawsuit surfaces post-closing, the investor has a rescission claim. Ruby will add a litigation disclosure schedule and materiality qualifiers.",
            },
            {
              id: "inv-reps-survival",
              question: "How long should the representations survive after closing (12 months, 18 months, indefinitely)?",
              description: "Longer survival periods give investors more protection but expose the company to claims for longer. Tax and IP reps typically survive longer than general reps. Ruby will draft a tiered survival schedule.",
            },
          ],
        },
      },
      // ── 9. Anti-dilution ──
      {
        id: "inv-anti-dilution",
        question: "Will investors receive anti-dilution protection?",
        description: "Anti-dilution adjusts the investor's conversion price if the company issues shares at a lower price in the future (a 'down round'). This protects the investor's economics but shifts the dilution burden to founders and employees.",
        appliesTo: ["equity-financing", "term-sheet", "series-b-financing", "series-c-financing", "investors-rights-agreement"],
        followUps: {
          onYes: [
            {
              id: "inv-anti-dilution-type",
              question: "Will anti-dilution be full ratchet or weighted average?",
              description: "Full ratchet reprices ALL of the investor's shares to the new lower price — this is extremely founder-unfriendly and can result in massive dilution. Broad-based weighted average is the standard and factors in the size of the down round. Ruby will model the dilution impact of each option.",
            },
          ],
        },
      },
      // ── 10. ESOP / option pool ──
      {
        id: "inv-option-pool",
        question: "Will the company create or expand an employee stock option pool as part of this round?",
        description: "Investors routinely require the option pool to be created or expanded BEFORE the investment (pre-money), which means existing shareholders bear all the dilution. A 15% option pool created pre-money at Series A can dilute founders by 15% before the investor even takes their share.",
        appliesTo: ["equity-financing", "term-sheet", "series-b-financing", "series-c-financing"],
        followUps: {
          onYes: [
            {
              id: "inv-option-pool-size",
              question: "What size option pool is the investor requiring (10%, 15%, 20%)?",
              description: "The 'right' pool size should be based on your actual hiring plan for the next 18-24 months. Investors often push for a larger pool than necessary because it lowers the effective pre-money valuation. Ruby will help you model the true dilution impact.",
            },
          ],
        },
      },
      // ── 11. Redemption rights ──
      {
        id: "inv-redemption",
        question: "Will investors have redemption rights (right to force the company to buy back their shares)?",
        description: "Redemption rights give investors a forced exit after a set period (typically 5-7 years). If the company cannot fund the redemption, it can be forced into insolvency. This is a nuclear option that investors rarely exercise but use as negotiating leverage.",
        appliesTo: ["equity-financing", "term-sheet", "series-b-financing", "series-c-financing", "investors-rights-agreement"],
      },
      // ── 12. First funding round ──
      {
        id: "inv-first-round",
        question: "Is this the company's first external funding round?",
        description: "First-time fundraising companies often lack the corporate housekeeping investors expect — clean cap tables, properly authorized shares, IP assignment agreements from all contributors, and compliant articles. Investors will require these as conditions to closing. Ruby will generate a closing checklist and flag gaps before the investor's counsel finds them.",
        appliesTo: ["safe-agreement", "convertible-note", "equity-financing", "subscription-agreement-ni45106", "term-sheet"],
        followUps: {
          onYes: [
            {
              id: "inv-first-round-housekeeping",
              question: "Has the company completed all corporate housekeeping (IP assignments, founder agreements, cap table cleanup)?",
              description: "Incomplete corporate housekeeping is the #1 cause of delayed closings in first rounds. Missing IP assignments from early contributors, unsigned founder agreements, and cap table discrepancies will all surface during due diligence. Ruby will generate a pre-closing housekeeping checklist.",
            },
          ],
        },
      },
      // ── 13. Board observation rights ──
      {
        id: "inv-observer-rights",
        question: "Will the investor have board observation rights (attending meetings without a vote)?",
        description: "Board observer rights are a common compromise when the investor does not justify a full board seat. Observers can attend meetings and receive board materials but cannot vote. However, observers who regularly participate in discussions may be deemed de facto directors with corresponding fiduciary duties. Ruby will draft observer rights with clear limitations on participation and liability.",
        appliesTo: ["safe-agreement", "equity-financing", "term-sheet", "investors-rights-agreement", "series-b-financing"],
        followUps: {
          onYes: [
            {
              id: "inv-observer-confidentiality",
              question: "Will the observer be bound by confidentiality obligations covering board materials?",
              description: "Board materials contain the company's most sensitive information — financials, strategy, personnel issues. An observer without confidentiality obligations could share this with competing portfolio companies. Ruby will add observer confidentiality provisions and conflict-of-interest protocols.",
            },
          ],
        },
      },
      // ── 14. Conversion triggers ──
      {
        id: "inv-conversion-triggers",
        question: "What events will trigger automatic conversion of convertible securities?",
        description: "The definition of 'qualifying financing' that triggers automatic conversion is one of the most negotiated terms. A threshold set too high ($5M+) may never be reached, leaving investors in limbo. A threshold set too low ($500K) may convert at terms unfavorable to the company.",
        appliesTo: ["convertible-note", "safe-agreement", "term-sheet"],
        followUps: {
          onYes: [
            {
              id: "inv-conversion-qualifying-amount",
              question: "What is the minimum qualifying financing amount for automatic conversion?",
              description: "Standard thresholds are $1M-$3M for seed SAFEs and $3M-$10M for later convertible notes. Ruby will set the threshold and define what counts toward it (new money only? or including conversion amounts?).",
            },
            {
              id: "inv-conversion-change-of-control",
              question: "Should the securities convert automatically on a change of control (acquisition)?",
              description: "Without change-of-control conversion language, SAFE holders may receive nothing in an acquisition that happens before a qualifying financing. Ruby will add change-of-control conversion at the cap or a multiple of the invested amount.",
            },
          ],
        },
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMMERCIAL MODULE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "commercial",
    category: "commercial",
    title: "Commercial & Services Compliance",
    description: "SaaS, SLA, privacy, IP licensing, and CASL compliance for commercial service agreements.",
    name: "Commercial & Services Compliance",
    shortName: "Commercial",
    alwaysOn: false,
    severity: "medium",
    riskDescription: "Service agreements define your revenue relationships. Ambiguous scope, SLA, or liability terms are the #1 cause of commercial disputes.",
    riskProfile: {
      level: "medium",
      factors: [
        "Service agreements define your revenue relationships.",
        "Ambiguous scope, SLA, or liability terms are the #1 cause of commercial disputes.",
        "PIPEDA non-compliance carries Privacy Commissioner findings and Federal Court orders.",
        "CASL violations carry AMPs up to $10M per violation.",
      ],
    },
    triggers: [
      // ── 1. Recurring services ──
      {
        id: "com-recurring",
        question: "Will the agreement involve ongoing recurring services (SaaS, managed services, subscriptions)?",
        description: "Recurring services require auto-renewal mechanics, service credit calculations, uptime commitments, and cancellation rights compliant with Canadian consumer protection law.",
        appliesTo: ["saas-sla", "managed-services-sla", "enterprise-sla", "subscription-agreement", "software-license"],
        followUps: {
          onYes: [
            {
              id: "com-uptime",
              question: "What uptime commitment will you guarantee (99.9%, 99.95%, 99.99%)?",
              description: "Each tier has different downtime allowances and service credit calculations. 99.9% = 8.77 hours/year downtime. 99.99% = 52.6 minutes/year. Ruby will calculate service credits accordingly.",
            },
            {
              id: "com-enterprise",
              question: "Will you serve enterprise clients with custom SLA requirements?",
              description: "Enterprise clients typically require custom liability caps, data handling addendums, and compliance certifications. Ruby will add negotiation-ready enterprise provisions.",
            },
            {
              id: "com-auto-renewal",
              question: "Will the agreement auto-renew at the end of each term?",
              description: "Auto-renewal clauses must comply with Ontario's Consumer Protection Act and BC's Business Practices and Consumer Protection Act, which require advance notice of renewal and a right to cancel. Failing to send renewal notices can make the auto-renewal unenforceable.",
              followUps: {
                onYes: [
                  {
                    id: "com-auto-renewal-price-increase",
                    question: "Can you increase pricing on renewal?",
                    description: "If the agreement auto-renews with a price increase and the customer is not notified in advance, the increase may be unenforceable. Ruby will add advance pricing notice provisions (typically 30-60 days) and a right to terminate if the customer rejects the increase.",
                  },
                ],
              },
            },
          ],
        },
      },
      // ── 2. Personal information ──
      {
        id: "com-personal-info",
        question: "Will the agreement involve collecting, processing, or storing personal information?",
        description: "Any handling of personal information triggers PIPEDA compliance. Ruby will add data processing provisions, breach notification procedures, and cross-border transfer restrictions.",
        appliesTo: ["saas-sla", "terms-and-conditions", "privacy-policy", "software-license", "subscription-agreement"],
        followUps: {
          onYes: [
            {
              id: "com-quebec-users",
              question: "Will any users be located in Quebec?",
              description: "Quebec's Law 25 (An Act to Modernize Legislative Provisions as Regards the Protection of Personal Information) imposes additional obligations — privacy impact assessments, consent requirements, and the right to data portability.",
            },
            {
              id: "com-cross-border-data",
              question: "Will personal information be stored or processed outside of Canada?",
              description: "Cross-border data transfers require additional safeguards under PIPEDA Principle 4.1.3 and may require privacy impact assessments.",
              followUps: {
                onYes: [
                  {
                    id: "com-cross-border-data-country",
                    question: "Is data flowing to a country without adequate privacy protections (e.g., countries without PIPEDA-equivalent legislation)?",
                    description: "Storing personal data in a country with weak privacy protections increases regulatory risk. Under PIPEDA Principle 4.1.3, the organization transferring data remains accountable. Ruby will add mandatory contractual safeguards, data processing agreements, and privacy impact assessment requirements.",
                  },
                  {
                    id: "com-cross-border-data-us-cloud",
                    question: "Will data be stored on US-based cloud providers (AWS, Azure, GCP)?",
                    description: "US cloud providers are subject to the US CLOUD Act, which allows US law enforcement to compel disclosure of data regardless of where it is physically stored. Canadian clients increasingly require Canadian data residency. Ruby will add data residency provisions and CLOUD Act risk acknowledgments.",
                  },
                ],
              },
            },
            {
              id: "com-data-breach-notification",
              question: "Do you have a data breach notification procedure in place?",
              description: "PIPEDA requires notification to the Privacy Commissioner and affected individuals for breaches creating a 'real risk of significant harm.' You must notify without unreasonable delay. Failure to report is an offence punishable by up to $100,000 per violation.",
              followUps: {
                onNo: [
                  {
                    id: "com-data-breach-plan",
                    question: "Will you need Ruby to draft a breach response protocol as part of this agreement?",
                    description: "A breach response plan should include: breach detection procedures, severity classification, notification timelines (typically 72 hours), affected individual notification templates, and a post-incident review process. Ruby will include this as a schedule to the agreement.",
                  },
                ],
              },
            },
            {
              id: "com-children-data",
              question: "Could any users be under 18 years old?",
              description: "Collecting personal information from minors requires verifiable parental consent under PIPEDA and raises additional obligations under provincial privacy laws. Quebec Law 25 specifically prohibits profiling of minors. Ruby will add age verification mechanics and parental consent provisions.",
            },
          ],
        },
      },
      // ── 3. IP licensing / assignment ──
      {
        id: "com-ip",
        question: "Will the agreement include intellectual property licensing or assignment?",
        description: "IP ownership must be crystal clear. Ruby will draft specific grant language, usage restrictions, reservation of rights, and moral rights waivers under Copyright Act s.14.1.",
        appliesTo: ["software-license", "master-services-agreement", "consulting-agreement", "ip-assignment", "statement-of-work"],
        followUps: {
          onYes: [
            {
              id: "com-ip-ownership",
              question: "Will the licensor retain ownership of the IP (license) or transfer it entirely (assignment)?",
              description: "Licenses grant usage rights while the licensor retains ownership. Assignments transfer all rights permanently. Ruby will draft the appropriate conveyance.",
            },
            {
              id: "com-ip-background",
              question: "Will either party bring pre-existing IP (background IP) into the project?",
              description: "Background IP is the #1 source of IP disputes in commercial agreements. Without a clear carve-out, the client may argue that all IP delivered under the agreement belongs to them — including your pre-existing frameworks and tools. Ruby will add a background IP schedule and license-back provisions.",
            },
            {
              id: "com-ip-open-source",
              question: "Will the deliverables incorporate open source software?",
              description: "Certain open source licenses (GPL, AGPL) have copyleft provisions that can 'infect' your proprietary code, requiring you to open-source your entire codebase. If you are assigning IP to a client, you must disclose any open source components and their license terms. Ruby will add an open source disclosure schedule.",
            },
          ],
        },
      },
      // ── 4. CASL ──
      {
        id: "com-casl",
        question: "Will either party be sending commercial electronic messages (emails, texts, newsletters)?",
        description: "CASL (Canada's Anti-Spam Legislation) requires express consent, identification, and unsubscribe mechanisms for all commercial electronic messages. Penalties up to $10M per violation.",
        appliesTo: ["terms-and-conditions", "privacy-policy", "subscription-agreement", "influencer-agreement"],
        followUps: {
          onYes: [
            {
              id: "com-casl-express-consent",
              question: "Do you have a process for obtaining and recording express consent before sending messages?",
              description: "Implied consent (e.g., existing business relationship) expires after 2 years. Express consent lasts until withdrawn. You must be able to prove consent was obtained. Ruby will add consent collection mechanics with timestamp records and audit trails.",
            },
            {
              id: "com-casl-install-software",
              question: "Will any software, apps, cookies, or tracking pixels be installed on users' devices?",
              description: "CASL s.8 requires express consent before installing any computer program, including cookies, tracking pixels, and browser extensions. This is separate from the CEM consent requirement and carries the same $10M penalty. Ruby will add software installation consent provisions.",
            },
          ],
        },
      },
      // ── 5. Milestone-based deliverables ──
      {
        id: "com-milestones",
        question: "Will the agreement involve milestone-based or project-based deliverables?",
        description: "Project-based work requires clear acceptance criteria, change order processes, and scope creep protection. Ruby will add milestone payment schedules tied to acceptance.",
        appliesTo: ["statement-of-work", "master-services-agreement", "consulting-agreement", "vendor-agreement"],
        followUps: {
          onYes: [
            {
              id: "com-milestones-acceptance",
              question: "What is the acceptance process — will the client have a testing period before accepting deliverables?",
              description: "Without a defined acceptance process, a client can delay payment indefinitely by claiming the work is 'not done.' Ruby will add a testing period (typically 5-10 business days), acceptance criteria, and deemed acceptance if the client does not reject within the window.",
            },
            {
              id: "com-milestones-change-orders",
              question: "What happens if the client requests changes to the scope of work mid-project?",
              description: "Scope creep is the #1 cause of commercial disputes in project-based work. Without a formal change order process, you will do extra work for free and have no recourse. Ruby will add a change order procedure requiring written approval and pricing adjustment before out-of-scope work begins.",
            },
          ],
        },
      },
      // ── 6. Liability cap ──
      {
        id: "com-liability-cap",
        question: "Will the agreement include a limitation of liability?",
        description: "Without a liability cap, your exposure on a $10K/month SaaS contract could be millions in consequential damages. Limitation of liability is the single most important commercial protection — and the most negotiated clause in any services agreement.",
        appliesTo: ["saas-sla", "managed-services-sla", "enterprise-sla", "master-services-agreement", "consulting-agreement", "software-license", "subscription-agreement"],
        followUps: {
          onYes: [
            {
              id: "com-liability-cap-amount",
              question: "Should the liability cap be tied to fees paid (e.g., 12 months of fees) or a fixed dollar amount?",
              description: "Fee-based caps scale with the relationship and are the standard approach. Fixed caps are simpler but may be too high or too low as the relationship grows. Ruby will set the cap and add appropriate carve-outs for IP infringement, confidentiality breach, and willful misconduct.",
            },
            {
              id: "com-liability-consequential",
              question: "Will the agreement exclude consequential, indirect, and special damages?",
              description: "Consequential damage exclusions are standard but must be mutual. A one-sided exclusion will face enforceability challenges. Ruby will add a mutual exclusion with carve-outs for confidentiality breaches and IP infringement.",
            },
          ],
          onNo: [
            {
              id: "com-no-liability-cap-warning",
              question: "Are you aware that without a liability cap, your exposure is potentially unlimited?",
              description: "This is the highest-risk position a service provider can take. A single data breach, service outage, or IP infringement claim could exceed the total value of the contract by 100x. Ruby strongly recommends adding at minimum a liability cap equal to 12 months of fees paid.",
            },
          ],
        },
      },
      // ── 7. Indemnification ──
      {
        id: "com-indemnification",
        question: "Will the agreement include indemnification obligations?",
        description: "Indemnification shifts the risk of third-party claims from one party to the other. It is often the most dangerous clause because it sits outside the liability cap — meaning unlimited exposure for the indemnifying party.",
        appliesTo: ["saas-sla", "master-services-agreement", "software-license", "consulting-agreement", "vendor-agreement"],
        followUps: {
          onYes: [
            {
              id: "com-indemnification-ip",
              question: "Will you indemnify the client against IP infringement claims?",
              description: "IP indemnification is standard in software and SaaS agreements — you are promising that your product does not infringe anyone else's IP. But this obligation is typically uncapped and survives termination. Ruby will add reasonable controls: right to cure, right to replace the infringing component, and termination as a last resort.",
            },
            {
              id: "com-indemnification-mutual",
              question: "Should indemnification be mutual (both parties indemnify the other)?",
              description: "One-sided indemnification is a red flag in negotiations. Mutual indemnification where each party covers their own negligence and IP is the balanced approach. Ruby will draft mutual indemnification with appropriate scope for each party's obligations.",
            },
          ],
        },
      },
      // ── 8. Cross-border services ──
      {
        id: "com-cross-border",
        question: "Does this agreement involve cross-border data transfer or services delivered across borders?",
        description: "Cross-border commercial agreements trigger multiple regulatory regimes — privacy (PIPEDA + foreign equivalent), tax (permanent establishment risk), export controls, and sanctions compliance.",
        appliesTo: ["saas-sla", "master-services-agreement", "software-license", "consulting-agreement", "vendor-agreement"],
        followUps: {
          onYes: [
            {
              id: "com-cross-border-currency",
              question: "Will payments be made in a currency other than Canadian dollars?",
              description: "Foreign currency payments create exchange rate risk. Without a clear allocation of that risk, disputes arise when exchange rates fluctuate significantly. Ruby will add a currency clause specifying the payment currency, the exchange rate source, and which party bears fluctuation risk.",
            },
            {
              id: "com-cross-border-sanctions",
              question: "Will services be delivered to or from a country subject to Canadian or US sanctions?",
              description: "Canada's Special Economic Measures Act and the US OFAC sanctions programs prohibit transactions with designated countries, entities, and individuals. Violation carries criminal penalties. Ruby will add sanctions representations and compliance covenants.",
            },
            {
              id: "com-cross-border-governing-law",
              question: "Which jurisdiction's law will govern the agreement?",
              description: "In cross-border agreements, governing law determines which country's contract law applies to disputes. Choose your home jurisdiction. If the counterparty insists on theirs, at minimum ensure the dispute resolution forum is neutral (e.g., arbitration). Ruby will add a governing law clause with a forum selection or arbitration provision.",
            },
          ],
        },
      },
      // ── 9. Subcontractors ──
      {
        id: "com-subcontractors",
        question: "Will the service provider use subcontractors or third-party vendors to deliver services?",
        description: "If your vendor subcontracts your work, you need to know who is actually handling your data and deliverables. Many data breaches originate with subcontractors who were never vetted by the client.",
        appliesTo: ["master-services-agreement", "saas-sla", "consulting-agreement", "vendor-agreement", "managed-services-sla"],
        followUps: {
          onYes: [
            {
              id: "com-subcontractors-approval",
              question: "Should the client have approval rights over subcontractors?",
              description: "Requiring prior written consent before engaging subcontractors is standard for enterprise agreements. Ruby will add subcontractor approval provisions, flow-down obligations (the subcontractor must comply with the same confidentiality and data handling standards), and the right to object to new subcontractors.",
            },
            {
              id: "com-subcontractors-liability",
              question: "Will the primary vendor remain liable for subcontractor performance and breaches?",
              description: "Without a flow-down liability clause, the primary vendor can disclaim responsibility for subcontractor failures. Ruby will add a provision making the vendor responsible for all subcontractor acts as if they were the vendor's own.",
            },
          ],
        },
      },
      // ── 10. Termination for convenience ──
      {
        id: "com-termination-convenience",
        question: "Should either party be able to terminate the agreement without cause (termination for convenience)?",
        description: "Termination for convenience gives either party an exit ramp. Without it, you are locked into the full term and your only exit is proving the other party breached. Standard notice periods are 30-90 days.",
        appliesTo: ["saas-sla", "master-services-agreement", "consulting-agreement", "vendor-agreement", "subscription-agreement"],
        followUps: {
          onYes: [
            {
              id: "com-termination-wind-down",
              question: "Will there be a transition or wind-down period after termination?",
              description: "Abrupt termination of critical services can be catastrophic. Ruby will add a mandatory transition period (typically 30-90 days) during which the outgoing provider must cooperate with data migration, knowledge transfer, and service continuity.",
            },
            {
              id: "com-termination-data-return",
              question: "What happens to the client's data after termination?",
              description: "Without a data return clause, the service provider can delete the client's data immediately on termination. Ruby will add a data export period (typically 30 days), format requirements, and certification of destruction after the export window closes.",
            },
          ],
        },
      },
      // ── 11. Force majeure ──
      {
        id: "com-force-majeure",
        question: "Will the agreement include a force majeure clause?",
        description: "Post-pandemic, force majeure clauses are heavily scrutinized. A generic clause may not cover future pandemics, cyberattacks, or supply chain disruptions. Ruby will draft a modern force majeure clause with specific enumerated events and a termination trigger if the event lasts beyond a threshold period.",
        appliesTo: ["saas-sla", "master-services-agreement", "consulting-agreement", "vendor-agreement", "software-license"],
      },
      // ── 12. Government / public sector clients ──
      {
        id: "com-government",
        question: "Does this agreement involve government or public sector clients?",
        description: "Government contracts are subject to procurement rules, freedom of information legislation (ATIA federally, FIPPA in Ontario), and heightened security requirements. Confidentiality clauses may be overridden by FOI requests — the government client cannot promise to keep your pricing or technical information secret if an FOI request is filed.",
        appliesTo: ["saas-sla", "master-services-agreement", "consulting-agreement", "vendor-agreement", "software-license"],
        followUps: {
          onYes: [
            {
              id: "com-government-security",
              question: "Does the contract require a security clearance or compliance with government security standards?",
              description: "Federal government IT contracts often require compliance with ITSG-33 (IT Security Risk Management) and may require personnel security clearances. Provincial contracts may require compliance with specific security frameworks. These obligations are non-negotiable and failure to comply is grounds for immediate termination. Ruby will flag security compliance requirements.",
            },
            {
              id: "com-government-foi",
              question: "Are you comfortable with the possibility that your pricing, technical approach, or contract terms could be disclosed through a freedom of information request?",
              description: "Government contracts are subject to FOI legislation. Third-party confidential information can be exempted, but the exemption is not automatic — the government must actively assert it, and the Information Commissioner can override it. Ruby will add FOI notification provisions requiring the government client to notify you before disclosing your information under an FOI request.",
            },
          ],
        },
      },
      // ── 13. Export controls ──
      {
        id: "com-export-controls",
        question: "Are there export control considerations for the technology or services in this agreement?",
        description: "Canada's Export and Import Permits Act and the Export Control List restrict the export of certain technologies, software, and technical data. US-origin technology is also subject to EAR (Export Administration Regulations) and ITAR. Violation carries criminal penalties and debarment from government contracts.",
        appliesTo: ["software-license", "saas-sla", "master-services-agreement", "consulting-agreement"],
        followUps: {
          onYes: [
            {
              id: "com-export-controls-encryption",
              question: "Does the technology include encryption that may be subject to export controls?",
              description: "Encryption software above certain key lengths is controlled under the Wassenaar Arrangement and Canada's Export Control List (Group 1, Category 5). Even SaaS products with strong encryption may require an export permit if accessed from controlled jurisdictions. Ruby will add export control representations and end-user restrictions.",
            },
          ],
        },
      },
      // ── 14. AI / machine learning ──
      {
        id: "com-ai-ml",
        question: "Will the services involve artificial intelligence, machine learning, or automated decision-making?",
        description: "AI services create unique liability issues — who is responsible for AI-generated errors or biased outputs? PIPEDA's Transparency Principle and Canada's proposed AIDA (Artificial Intelligence and Data Act) impose disclosure and accountability requirements for automated decision-making.",
        appliesTo: ["saas-sla", "software-license", "master-services-agreement", "consulting-agreement"],
        followUps: {
          onYes: [
            {
              id: "com-ai-training-data",
              question: "Will the AI be trained on the client's data?",
              description: "If the client's data is used to train your model, the client may argue they have IP rights in the trained model. Conversely, if you train on one client's data and serve another, you have a confidentiality problem. Ruby will add clear data usage rights, model ownership provisions, and data isolation commitments.",
            },
            {
              id: "com-ai-automated-decisions",
              question: "Will AI make decisions that materially affect individuals (hiring, credit, insurance, etc.)?",
              description: "Automated decision-making that significantly affects individuals triggers PIPEDA's right to explanation and may require human-in-the-loop review. Quebec Law 25 requires informing individuals that a decision is made by automated processing and providing a right to contest. Ruby will add transparency and contestability provisions.",
            },
          ],
        },
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PLATFORM MODULE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "platform",
    category: "platform",
    title: "Platform & Terms Compliance",
    description: "Terms of service, privacy policies, user-generated content, and marketplace intermediary rules for digital platforms.",
    name: "Platform & Terms Compliance",
    shortName: "Platform",
    alwaysOn: false,
    severity: "medium",
    riskDescription: "Platform terms define your relationship with every user. Unenforceable terms expose you to class action risk.",
    riskProfile: {
      level: "medium",
      factors: [
        "Platform terms define your relationship with every user.",
        "Unenforceable terms expose you to class action risk.",
        "Uber v. Heller raised the bar for unconscionability in standard-form contracts.",
        "Quebec Law 25 imposes the strictest privacy requirements in Canada for platforms.",
      ],
    },
    triggers: [
      // ── 1. Web / mobile access ──
      {
        id: "plat-web-mobile",
        question: "Will users access the platform through a website or mobile app?",
        description: "Clickwrap vs browsewrap enforceability varies significantly. Ruby will implement Rudder v. Microsoft-compliant acceptance mechanics and Uber v. Heller unconscionability safeguards.",
        appliesTo: ["terms-and-conditions", "privacy-policy"],
        followUps: {
          onYes: [
            {
              id: "plat-accounts",
              question: "Will users create accounts and store data on the platform?",
              description: "Account-based platforms need data retention policies, account termination procedures, and data export/portability rights.",
              followUps: {
                onYes: [
                  {
                    id: "plat-accounts-deletion",
                    question: "Can users delete their accounts and all associated data?",
                    description: "Right to deletion is mandatory under Quebec Law 25 and increasingly expected by users. Without a clear deletion process, you face regulatory complaints and reputational damage. Ruby will add account deletion mechanics, data purge timelines, and exceptions for legally required retention.",
                  },
                  {
                    id: "plat-accounts-inactive",
                    question: "Will you terminate or archive inactive accounts after a period of inactivity?",
                    description: "Dormant accounts with stored personal data create ongoing privacy liability. Ontario's Consumer Protection Act and PIPEDA Principle 4.5 require that you not retain personal information longer than necessary. Ruby will add inactivity policies with advance notice before account closure.",
                  },
                ],
              },
            },
            {
              id: "plat-payments",
              question: "Will users make payments through the platform?",
              description: "Payment processing triggers PCI DSS compliance requirements, refund policies, and Ontario Consumer Protection Act s.43 disclosure for internet agreements.",
              followUps: {
                onYes: [
                  {
                    id: "plat-payments-recurring",
                    question: "Will there be recurring or subscription-based payments?",
                    description: "Recurring payment terms must include clear cancellation mechanics and advance notice of renewals. Ontario CPA s.43 requires specific disclosures for internet agreements including total cost and cancellation rights. Failure to comply gives consumers a 1-year cancellation window.",
                  },
                  {
                    id: "plat-payments-refund",
                    question: "What is your refund policy for digital goods or services?",
                    description: "Canadian consumer protection law varies by province — Ontario allows cancellation of internet agreements within 7 days if required disclosures are not made. BC allows 15 days for distance sales contracts. A blanket 'no refunds' policy may be unenforceable. Ruby will draft a refund policy compliant with the strictest applicable provincial requirements.",
                  },
                ],
              },
            },
          ],
        },
      },
      // ── 2. User-generated content ──
      {
        id: "plat-ugc",
        question: "Will the platform accept user-generated content (posts, reviews, uploads)?",
        description: "UGC platforms need content licenses, DMCA/notice-and-takedown procedures, content moderation policies, and liability limitation for user content.",
        appliesTo: ["terms-and-conditions"],
        followUps: {
          onYes: [
            {
              id: "plat-ugc-takedown",
              question: "Do you have a DMCA-equivalent or notice-and-takedown process for infringing content?",
              description: "Canada does not have a direct DMCA equivalent, but the Copyright Modernization Act (2012) created a notice-and-notice regime requiring platforms to forward infringement notices to users. Failing to forward notices can lead to liability for the platform. Ruby will draft a compliant notice-and-notice process.",
            },
            {
              id: "plat-ugc-moderation",
              question: "Will you actively moderate user content or rely on user reporting?",
              description: "Active moderation can create liability — if you moderate some content, a court may expect you to moderate all content. Passive platforms have stronger intermediary protections. Ruby will draft appropriate content moderation policies that balance safety with legal liability.",
            },
            {
              id: "plat-ugc-license",
              question: "What license will you require over user-generated content?",
              description: "Most platforms require a broad, perpetual, worldwide license to use, reproduce, and distribute user content. Without this license, displaying user content on your platform is technically copyright infringement. But overly broad licenses (e.g., the right to sublicense to third parties for commercial use) may be unconscionable under Uber v. Heller. Ruby will draft a balanced content license.",
            },
          ],
        },
      },
      // ── 3. Marketplace ──
      {
        id: "plat-marketplace",
        question: "Will the platform operate as a marketplace connecting buyers and sellers?",
        description: "Marketplace platforms have unique liability considerations — is the platform a party to transactions or just a facilitator? Ruby will draft appropriate intermediary protections.",
        appliesTo: ["terms-and-conditions", "privacy-policy"],
        followUps: {
          onYes: [
            {
              id: "plat-marketplace-party",
              question: "Does the platform take possession of goods, process payments, or set prices?",
              description: "If the platform touches the transaction (holds funds, sets prices, handles fulfillment), it may be deemed a party to the transaction rather than a mere intermediary. This exposes the platform to product liability, consumer protection obligations, and sales tax collection requirements. Ruby will structure the terms to maintain intermediary status.",
            },
            {
              id: "plat-marketplace-dispute",
              question: "Will the platform mediate disputes between buyers and sellers?",
              description: "Offering dispute resolution creates expectations and potential liability. If you resolve disputes inconsistently, you face unfairness claims. Ruby will add a structured dispute resolution process with clear limitations on the platform's role and decision-making authority.",
            },
            {
              id: "plat-marketplace-fees",
              question: "Will the platform charge transaction fees or commissions?",
              description: "Transaction-based revenue models require clear disclosure of all fees, timing of fee deductions, and treatment of fees on refunds or chargebacks. Hidden fees violate consumer protection laws. Ruby will add a transparent fee schedule and disclosure provisions.",
            },
          ],
        },
      },
      // ── 4. Terms enforceability ──
      {
        id: "plat-enforceability",
        question: "How will users agree to your terms of service — clickwrap, browsewrap, or sign-up flow?",
        description: "Browsewrap terms (posted on the website but not actively accepted) are frequently unenforceable in Canada. Clickwrap (checkbox 'I agree') is more defensible but must still survive Uber v. Heller unconscionability analysis. Ruby will implement the most defensible acceptance mechanism.",
        appliesTo: ["terms-and-conditions"],
        followUps: {
          onYes: [
            {
              id: "plat-enforceability-updates",
              question: "Will you update your terms of service periodically?",
              description: "Changing terms on existing users requires notice and an opportunity to reject. A clause that says 'we may update these terms at any time' is likely unenforceable post-Uber v. Heller. Ruby will add a version control mechanism, email notice of material changes, and a right to terminate if the user rejects the new terms.",
            },
            {
              id: "plat-enforceability-arbitration",
              question: "Will the terms include a mandatory arbitration clause?",
              description: "After Uber v. Heller (2020 SCC), mandatory arbitration in standard-form consumer contracts is at serious risk of being struck down as unconscionable — especially if the arbitration fees exceed the value of the dispute. Ruby will draft an arbitration clause with fee-shifting provisions to survive Heller scrutiny, or recommend small claims court carve-outs.",
            },
          ],
        },
      },
      // ── 5. Minors / age restrictions ──
      {
        id: "plat-minors",
        question: "Could users under 18 (or under 13) access or register on the platform?",
        description: "Platforms accessible to minors face heightened privacy obligations, potential COPPA exposure (if US users are under 13), and Quebec Law 25 restrictions on profiling minors. Age verification is increasingly required by regulators worldwide.",
        appliesTo: ["terms-and-conditions", "privacy-policy"],
        followUps: {
          onYes: [
            {
              id: "plat-minors-verification",
              question: "Will you implement age verification at registration?",
              description: "Age gates that simply ask 'Are you 18+?' are considered insufficient by most regulators. Ruby will add a robust age verification mechanism and parental consent flow for users who identify as minors.",
            },
            {
              id: "plat-minors-data",
              question: "Will you collect personal information from users under 13?",
              description: "Collecting data from children under 13 triggers COPPA (if any US users) with fines up to $50,120 per violation. Even in Canada, PIPEDA requires that consent for minors be obtained from a parent or guardian. Ruby will add parental consent mechanics and data minimization provisions for minor users.",
            },
          ],
        },
      },
      // ── 6. API access ──
      {
        id: "plat-api",
        question: "Will you offer API access to third-party developers or integrators?",
        description: "APIs extend your platform's functionality but create new liability vectors — data breaches through poorly secured API keys, rate abuse, and unauthorized data scraping. API terms are a separate legal document from your consumer ToS.",
        appliesTo: ["terms-and-conditions"],
        followUps: {
          onYes: [
            {
              id: "plat-api-rate-limits",
              question: "Will API access have rate limits, usage tiers, or paid plans?",
              description: "Without rate limits, a single developer can overload your infrastructure. Paid API tiers require clear SLAs, uptime commitments, and refund policies. Ruby will draft API terms with tiered access, rate limiting, and abuse prevention provisions.",
            },
            {
              id: "plat-api-data-access",
              question: "Will the API expose user data to third-party developers?",
              description: "Exposing user data via API creates a PIPEDA consent issue — users consented to your platform using their data, not third-party developers. You need explicit user consent for each third-party data access. Ruby will add OAuth-style consent flows and developer data handling obligations.",
            },
          ],
        },
      },
      // ── 7. Accessibility ──
      {
        id: "plat-accessibility",
        question: "Will the platform comply with AODA (Accessibility for Ontarians with Disabilities Act) or WCAG standards?",
        description: "Ontario's AODA requires that all public-facing websites and web content of organizations with 50+ employees comply with WCAG 2.0 Level AA. Non-compliance carries fines up to $100,000/day for corporations. Even if not legally required, inaccessible platforms face human rights complaints.",
        appliesTo: ["terms-and-conditions"],
      },
      // ── 8. Geoblocking / jurisdiction restrictions ──
      {
        id: "plat-geo-restrictions",
        question: "Will the platform be available worldwide or restricted to specific jurisdictions?",
        description: "Making your platform available globally means you may be subject to EU GDPR, US state privacy laws (CCPA, etc.), and other foreign regulations. Geoblocking certain jurisdictions is sometimes the safest legal strategy.",
        appliesTo: ["terms-and-conditions", "privacy-policy"],
        followUps: {
          onYes: [
            {
              id: "plat-geo-eu",
              question: "Will EU residents be able to access the platform?",
              description: "EU access triggers GDPR compliance — lawful basis for processing, data protection officer appointment, 72-hour breach notification, and massive fines (up to 4% of global revenue). If you do not intend to serve EU users, Ruby will add EU geoblocking provisions. If you do, Ruby will add GDPR-compliant provisions.",
            },
            {
              id: "plat-geo-us",
              question: "Will US residents be able to access the platform?",
              description: "US access triggers a patchwork of state privacy laws (CCPA/CPRA in California, plus Virginia, Colorado, Connecticut, and others). Each state has different requirements for opt-out rights, data sale disclosures, and consumer requests. Ruby will add US-specific privacy provisions.",
            },
          ],
        },
      },
      // ── 9. Platform suspension / termination ──
      {
        id: "plat-suspension",
        question: "Will the platform reserve the right to suspend or terminate user accounts?",
        description: "The right to suspend accounts must be balanced with fairness. Terminating a user's account on a platform where they have stored data, purchased content, or built a following creates significant legal exposure if done without proper process.",
        appliesTo: ["terms-and-conditions"],
        followUps: {
          onYes: [
            {
              id: "plat-suspension-process",
              question: "Will users receive notice and an opportunity to appeal before permanent termination?",
              description: "Platforms that terminate accounts without notice face breach of contract claims, especially if the user has paid for a subscription or stored valuable content. Ruby will add a tiered enforcement process: warning, temporary suspension, and permanent termination with notice and appeal rights.",
            },
            {
              id: "plat-suspension-data",
              question: "Will suspended users be able to export their data before account deletion?",
              description: "Data portability on termination is increasingly viewed as a right, not a courtesy. Quebec Law 25 explicitly provides a right to data portability. Ruby will add a post-termination data export window (typically 30 days) before permanent deletion.",
            },
          ],
        },
      },
      // ── 10. AI/ML data processing ──
      {
        id: "plat-ai-processing",
        question: "Do you use AI or machine learning to process user data (recommendations, content moderation, personalization)?",
        description: "AI-powered processing of user data triggers transparency obligations under PIPEDA and Quebec Law 25. Users have the right to know when automated processing significantly affects them, and Quebec specifically requires informing individuals of automated decision-making and providing a right to contest. Canada's proposed AIDA would impose further accountability requirements.",
        appliesTo: ["terms-and-conditions", "privacy-policy"],
        followUps: {
          onYes: [
            {
              id: "plat-ai-profiling",
              question: "Does the AI create user profiles or segments that could be used for targeted advertising or differential pricing?",
              description: "Profiling users for advertising or pricing decisions is increasingly regulated. Quebec Law 25 prohibits profiling minors entirely and requires disclosure of profiling to all users. GDPR (if EU users access the platform) gives users the right to object to profiling. Ruby will add profiling disclosure provisions and opt-out mechanics.",
            },
            {
              id: "plat-ai-transparency",
              question: "Will you disclose to users that AI is being used to process their data?",
              description: "Transparency about AI usage is moving from best practice to legal requirement. Quebec Law 25 mandates disclosure of automated decision-making. PIPEDA's Transparency Principle requires informing individuals about how their information is used. Ruby will add AI processing disclosures in your privacy policy and terms of service.",
            },
          ],
        },
      },
      // ── 11. Third-party integrations ──
      {
        id: "plat-integrations",
        question: "Does your platform integrate with third-party services (payment processors, analytics, social login)?",
        description: "Every third-party integration is a potential data leak and liability vector. If a third-party payment processor has a breach, your users will blame you — not the processor. Your terms need to clearly allocate responsibility for third-party services.",
        appliesTo: ["terms-and-conditions", "privacy-policy"],
        followUps: {
          onYes: [
            {
              id: "plat-integrations-liability",
              question: "Will your terms disclaim liability for third-party service failures?",
              description: "A blanket third-party disclaimer may be unenforceable if users rely on the integration as a core feature. Ruby will add specific third-party service disclosures, reasonable disclaimers, and separate consent flows where the integration involves sharing user data.",
            },
          ],
        },
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CREATOR MODULE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "creator",
    category: "creator",
    title: "Creator & Influencer Compliance",
    description: "Advertising disclosure, IP ownership, exclusivity, and Competition Act compliance for influencer and creator agreements.",
    name: "Creator & Influencer Compliance",
    shortName: "Creator",
    alwaysOn: false,
    severity: "high",
    riskDescription: "Creator agreements sit at the intersection of advertising law, IP law, and employment law. Competition Act violations carry penalties up to $10M.",
    riskProfile: {
      level: "high",
      factors: [
        "Creator agreements sit at the intersection of advertising law, IP law, and employment law.",
        "Competition Act violations carry penalties up to $10M.",
        "FTC cross-border exposure for creators with US audiences.",
        "Cannabis Act promotion offences carry fines up to $5M and/or imprisonment.",
      ],
    },
    triggers: [
      // ── 1. Sponsored content ──
      {
        id: "cre-sponsored",
        question: "Will the creator produce sponsored content or paid partnerships?",
        description: "Competition Act s.52 and Competition Bureau guidelines require clear disclosure of material connections. Ruby will add platform-specific disclosure templates (#ad, #sponsored, paid partnership labels).",
        appliesTo: ["influencer-agreement"],
        followUps: {
          onYes: [
            {
              id: "cre-multi-platform",
              question: "Will the content be published on multiple platforms (Instagram, TikTok, YouTube, etc.)?",
              description: "Each platform has unique disclosure requirements and content format specifications. Ruby will add platform-specific deliverable schedules and disclosure templates.",
              followUps: {
                onYes: [
                  {
                    id: "cre-multi-platform-repurpose",
                    question: "Can the brand repurpose the content across platforms the creator did not originally post on?",
                    description: "A TikTok video repurposed as a Facebook ad changes the context and audience entirely. The creator may not want their content on certain platforms. Ruby will specify exactly which platforms the brand can redistribute to and whether reformatting is permitted.",
                  },
                ],
              },
            },
            {
              id: "cre-approval-rights",
              question: "Will the brand have approval rights over content before publication?",
              description: "Content approval provisions must balance creative control with publication timelines. Ruby will add approval workflows with deemed-approval deadlines.",
              followUps: {
                onYes: [
                  {
                    id: "cre-approval-revisions",
                    question: "How many rounds of revisions will the brand be entitled to?",
                    description: "Without a revision cap, brands can request unlimited changes, effectively turning the creator into an employee without employment protections. Ruby will cap revisions (typically 2 rounds) and add fees for additional revision rounds.",
                  },
                ],
              },
            },
            {
              id: "cre-ftc-cross-border",
              question: "Will the content reach US audiences?",
              description: "Creators with US audiences are subject to FTC Endorsement Guides in addition to Canadian Competition Act requirements. FTC enforcement is aggressive — fines can reach $50,000+ per violation. The disclosure requirements differ from Canada (e.g., #ad must be above the fold, not buried in hashtags). Ruby will add dual-jurisdiction disclosure requirements.",
            },
          ],
        },
      },
      // ── 2. Exclusivity ──
      {
        id: "cre-exclusivity",
        question: "Will the agreement include exclusivity restrictions?",
        description: "Exclusivity limits the creator's ability to work with competing brands. Ruby will define the competitive category, geographic scope, and duration — with appropriate compensation adjustments.",
        appliesTo: ["influencer-agreement", "non-compete"],
        followUps: {
          onYes: [
            {
              id: "cre-exclusivity-category",
              question: "Is the exclusivity limited to a specific industry category or brand competitor?",
              description: "Category exclusivity (e.g., 'athletic footwear') is more enforceable than broad industry exclusivity. Ruby will draft specific category definitions.",
            },
            {
              id: "cre-exclusivity-duration",
              question: "Does the exclusivity period extend beyond the contract term (post-term exclusivity)?",
              description: "Post-term exclusivity restricts the creator's income after the contract ends. Without additional compensation for the restricted period, this is likely unenforceable as an unreasonable restraint of trade. Ruby will tie any post-term exclusivity to continued payment.",
            },
            {
              id: "cre-exclusivity-compensation",
              question: "Is the creator being paid a premium for exclusivity?",
              description: "Exclusivity without additional compensation is the most challenged term in creator agreements. Courts and regulators expect exclusivity to come with a price. Ruby will add an exclusivity premium (typically 25-50% above non-exclusive rates) or make the exclusivity severable.",
            },
          ],
        },
      },
      // ── 3. Content IP ──
      {
        id: "cre-ip",
        question: "Will the brand own the content IP or will the creator retain ownership with a license?",
        description: "IP ownership vs licensing fundamentally changes the creator's future rights to their content. Ruby will draft the appropriate IP conveyance with usage scope, territory, and duration.",
        appliesTo: ["influencer-agreement", "ip-assignment"],
        followUps: {
          onYes: [
            // "Yes" context: brand owns IP
            {
              id: "cre-ip-portfolio",
              question: "Will the creator retain the right to use the content in their personal portfolio?",
              description: "Even when IP is assigned to the brand, creators typically negotiate a portfolio license — the right to showcase the work on their own channels as a sample of their capabilities. Without this, the creator cannot show prospective clients what they have done. Ruby will add a limited, non-commercial portfolio license.",
            },
            {
              id: "cre-ip-moral-rights",
              question: "Will the creator waive their moral rights under the Copyright Act?",
              description: "Under Canadian Copyright Act s.14.1, creators have moral rights (attribution, integrity) that exist independently of IP ownership and cannot be assigned — only waived. If the brand modifies the content without a moral rights waiver, the creator can sue. Ruby will add a moral rights waiver.",
            },
          ],
          onNo: [
            // "No" context: creator retains IP with license
            {
              id: "cre-ip-license-scope",
              question: "What is the scope of the license — exclusive or non-exclusive, and for how long?",
              description: "An exclusive license prevents the creator from licensing the same content to other brands. A perpetual license means the brand can use the content forever without additional payment. Ruby will draft the license with clear scope, territory, duration, and permitted uses.",
            },
            {
              id: "cre-ip-license-sublicense",
              question: "Can the brand sublicense the content to partners, affiliates, or agencies?",
              description: "Sublicensing rights let the brand give your content to third parties you never agreed to work with. Without limits, the brand's media agency could use your content in ways you never intended. Ruby will restrict sublicensing to specific categories of sublicensees.",
            },
          ],
        },
      },
      // ── 4. Payment terms ──
      {
        id: "cre-payment",
        question: "What is the payment structure — flat fee, per-deliverable, performance-based, or hybrid?",
        description: "Payment disputes are the #1 source of creator-brand conflicts. Ambiguous payment triggers (e.g., 'upon completion') create disagreements about when payment is due. Ruby will draft clear payment milestones tied to specific events.",
        appliesTo: ["influencer-agreement"],
        followUps: {
          onYes: [
            // "Yes" context: performance-based or hybrid
            {
              id: "cre-payment-performance",
              question: "Will any compensation be tied to performance metrics (views, clicks, conversions)?",
              description: "Performance-based pay creates disputes over attribution, tracking methodology, and metric verification. The creator has no control over algorithm changes that affect reach. Ruby will define the metrics, the tracking tool (whose analytics are authoritative), and minimum guaranteed compensation regardless of performance.",
              followUps: {
                onYes: [
                  {
                    id: "cre-payment-performance-audit",
                    question: "Will the creator have the right to audit the brand's performance data?",
                    description: "Without audit rights, the creator must trust the brand's reported numbers. Ruby will add a right to audit conversion data and access to the tracking dashboard.",
                  },
                ],
              },
            },
          ],
          onNo: [
            // "No" context: flat fee
            {
              id: "cre-payment-upfront",
              question: "Will the creator receive any payment upfront before starting work?",
              description: "Creators routinely demand 50% upfront and 50% on delivery. Without upfront payment, the creator bears all the risk — they do the work and hope the brand pays. Ruby will add a standard deposit requirement and payment milestone schedule.",
            },
          ],
        },
      },
      // ── 5. Regulated products ──
      {
        id: "cre-regulated-product",
        question: "Is the product or service in a regulated category (cannabis, alcohol, pharma, financial services, health)?",
        description: "Regulated product advertising has category-specific rules that override general advertising law. A creator promoting a cannabis product can face criminal charges under the Cannabis Act. Financial promotions must comply with securities regulation.",
        appliesTo: ["influencer-agreement"],
        followUps: {
          onYes: [
            {
              id: "cre-regulated-cannabis",
              question: "Is this a cannabis or cannabis-adjacent product?",
              description: "Cannabis Act s.17 prohibits promotion that could be appealing to young persons, depicts a person, character, or animal, or presents cannabis in a way that associates it with a positive emotion. Violations carry fines up to $5M and/or imprisonment. Ruby will add cannabis-specific content restrictions and compliance certifications.",
            },
            {
              id: "cre-regulated-alcohol",
              question: "Is this an alcohol brand?",
              description: "Alcohol advertising is regulated provincially. AGCO (Ontario), LCLB (BC), and AGLC (Alberta) each have different rules about depiction of consumption, target audience, and social responsibility messaging. Ruby will add province-specific alcohol advertising compliance provisions.",
            },
            {
              id: "cre-regulated-health-claims",
              question: "Will the content include health, wellness, or therapeutic claims?",
              description: "Health claims in advertising are regulated under the Food and Drugs Act and the Competition Act. Unsubstantiated health claims are a criminal offence under Competition Act s.52. Even testimonial-style claims ('this product cured my acne') can violate the FDA if the product is not approved for that use. Ruby will add a health claim prohibition or require substantiation.",
            },
          ],
        },
      },
      // ── 6. Creator likeness and name ──
      {
        id: "cre-likeness",
        question: "Will the brand use the creator's name, likeness, image, or voice beyond the delivered content?",
        description: "Using a creator's likeness in paid ads, on product packaging, or in-store displays goes beyond a typical sponsored post. This is a separate right that requires explicit consent, additional compensation, and clear scope limitations.",
        appliesTo: ["influencer-agreement"],
        followUps: {
          onYes: [
            {
              id: "cre-likeness-ads",
              question: "Will the creator's likeness be used in paid advertising (social media ads, print, TV, out-of-home)?",
              description: "Paid media usage is a significant step up from organic posting. The creator's face could appear in ads they have no control over, associated with messaging they did not approve. Ruby will add paid media rights as a separate grant with separate compensation and approval rights.",
            },
            {
              id: "cre-likeness-ai",
              question: "Will the brand create AI-generated content using the creator's likeness or voice?",
              description: "AI-generated deepfakes and voice clones using creator likeness is the fastest-growing legal issue in creator law. Without explicit restrictions, the brand could generate infinite content featuring the creator without additional compensation. Ruby will add an explicit AI prohibition or AI usage license with tight controls.",
            },
          ],
        },
      },
      // ── 7. Termination and kill fee ──
      {
        id: "cre-termination",
        question: "Can the brand terminate the agreement before the creator delivers all content?",
        description: "If the brand cancels mid-project after the creator has already invested time and turned down other work, the creator loses income. Without a kill fee, the creator has no recourse for wasted effort.",
        appliesTo: ["influencer-agreement"],
        followUps: {
          onYes: [
            {
              id: "cre-termination-kill-fee",
              question: "Will there be a kill fee if the brand terminates early?",
              description: "Industry standard kill fees range from 25% (pre-production) to 100% (post-production) of the contracted amount. Ruby will add a tiered kill fee based on the stage of completion at termination.",
            },
            {
              id: "cre-termination-content-usage",
              question: "Can the brand use content that was already delivered if they terminate early?",
              description: "If the brand terminates early but keeps and uses the content already delivered, the creator should be paid in full for that content. Ruby will add a post-termination usage clause — either the brand returns/deletes all content, or pays in full for any content they retain.",
            },
          ],
        },
      },
      // ── 8. Usage duration ──
      {
        id: "cre-usage-duration",
        question: "How long can the brand use the delivered content (3 months, 1 year, perpetually)?",
        description: "Usage duration is one of the most undervalued terms in creator agreements. A 'perpetual' usage right means the brand can use your content forever without additional payment. Industry standard is 12 months with renewal options at additional cost.",
        appliesTo: ["influencer-agreement"],
        followUps: {
          onYes: [
            // "Yes" context: limited duration
            {
              id: "cre-usage-renewal",
              question: "Can the brand renew usage rights after the initial period, and at what cost?",
              description: "Without a renewal rate, the brand may try to continue using content after the license expires. Ruby will add automatic expiry, takedown obligations, and renewal pricing (typically 25-50% of the original fee per renewal period).",
            },
          ],
          onNo: [
            // "No" context: perpetual usage
            {
              id: "cre-usage-perpetual-premium",
              question: "Is the creator being compensated with a perpetual usage premium?",
              description: "Perpetual usage should cost 2-3x the rate for time-limited usage. If the creator is being paid the same rate for perpetual rights as for 12-month rights, they are significantly undervaluing their content. Ruby will flag this disparity.",
            },
          ],
        },
      },
      // ── 9. Content deletion / takedown rights ──
      {
        id: "cre-takedown",
        question: "Can the creator request content removal from their own channels after the campaign ends?",
        description: "Creators increasingly want the right to remove sponsored posts after the campaign period so their feed does not look permanently commercialized. Without explicit takedown rights, the brand may insist the content stays up indefinitely.",
        appliesTo: ["influencer-agreement"],
        followUps: {
          onYes: [
            {
              id: "cre-takedown-timeline",
              question: "When can the creator remove the content — immediately after the campaign or after a hold period?",
              description: "Brands typically want a minimum live period (e.g., 30-90 days) to measure performance. Ruby will add a minimum posting duration after which the creator may remove the content from their channels, with a separate term for brand-controlled channels.",
            },
          ],
        },
      },
      // ── 10. Whitelisting / dark posting ──
      {
        id: "cre-whitelisting",
        question: "Will the brand run paid ads through the creator's social media accounts (whitelisting)?",
        description: "Whitelisting lets the brand boost or run ads from the creator's account, making it look like the creator is directly endorsing the product. This gives the brand access to the creator's ad account, audience data, and engagement metrics — far more access than a typical sponsorship.",
        appliesTo: ["influencer-agreement"],
        followUps: {
          onYes: [
            {
              id: "cre-whitelisting-control",
              question: "Will the creator retain approval rights over whitelisted ad content and targeting?",
              description: "Without approval rights, the brand can run ads from the creator's account to any audience with any message. The creator's reputation is at stake. Ruby will add approval requirements for ad creative and targeting parameters, and a right to revoke whitelisting access.",
            },
            {
              id: "cre-whitelisting-compensation",
              question: "Is whitelisting compensated separately from organic posting?",
              description: "Whitelisting is a separate right worth 2-5x the organic posting rate because the brand is accessing the creator's audience data and account authority. If whitelisting is bundled into the base fee, the creator is significantly undercharging. Ruby will add whitelisting as a separately priced deliverable.",
            },
          ],
        },
      },
      // ── 11. Creator representations ──
      {
        id: "cre-representations",
        question: "Will the creator be required to make representations about their audience metrics?",
        description: "Fake followers and inflated engagement are rampant in influencer marketing. If the brand is paying based on claimed audience size and the numbers are fabricated, the brand needs a contractual remedy. Ruby will add audience metric representations with a right to audit and clawback for material misrepresentation.",
        appliesTo: ["influencer-agreement"],
        followUps: {
          onYes: [
            {
              id: "cre-representations-audit",
              question: "Will the brand have the right to audit the creator's follower authenticity?",
              description: "Third-party tools (HypeAuditor, Social Blade) can detect fake followers and engagement pods. Ruby will add a right to audit using specified tools, with a termination right if inauthentic engagement exceeds a threshold (typically 20%).",
            },
          ],
        },
      },
      // ── 12. Existing exclusivity ──
      {
        id: "cre-existing-exclusivity",
        question: "Does the creator have an existing exclusivity agreement with another brand?",
        description: "If the creator is already bound by an exclusivity agreement with a competing brand and enters into your agreement, you could face tortious interference claims from the prior brand. The creator may also be in breach of their prior agreement, creating liability for both the creator and your brand.",
        appliesTo: ["influencer-agreement"],
        followUps: {
          onYes: [
            {
              id: "cre-existing-exclusivity-conflict",
              question: "Is the existing exclusivity in the same or an overlapping product category?",
              description: "If the existing exclusivity covers the same product category, the creator cannot legally work with your brand during the restriction period. Proceeding anyway exposes both you and the creator to breach of contract and tortious interference claims. Ruby will add a representation that the creator is free to enter the agreement and an indemnity for prior agreement breaches.",
            },
          ],
        },
      },
      // ── 13. Agency representation ──
      {
        id: "cre-agency",
        question: "Is the creator represented by an agency, manager, or talent representative?",
        description: "If the creator has a manager or agency, the agreement must address who signs, who receives payment, and whether the agency commission is included in or on top of the creator's fee. Payment to the agency does not necessarily constitute payment to the creator if the agency relationship ends.",
        appliesTo: ["influencer-agreement"],
        followUps: {
          onYes: [
            {
              id: "cre-agency-authority",
              question: "Does the agency have authority to bind the creator to contractual obligations?",
              description: "If the agency signs on behalf of the creator without proper authority, the agreement may be voidable. Ruby will require a representation of agency authority and add both the creator and agency as parties to the agreement.",
            },
            {
              id: "cre-agency-payment",
              question: "Will payment go directly to the creator or to the agency?",
              description: "If payment goes to the agency and the agency goes bankrupt or withholds payment, the creator may claim the brand has not fulfilled its payment obligation. Ruby will add a payment direction clause with the creator's written confirmation of the payment arrangement.",
            },
          ],
        },
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Legacy compat: MODULES export (flat list for backward compat)
// ─────────────────────────────────────────────────────────────

export const MODULES: ComplianceModule[] = COMPLIANCE_MODULES;

// ─────────────────────────────────────────────────────────────
// Jurisdictions
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Legacy compat: TriggerQuestion interface + TRIGGER_QUESTIONS
// Flattens the conditional tree into a flat list so existing
// consumers (API route, wizard page) continue to work.
// ─────────────────────────────────────────────────────────────

export interface TriggerQuestion {
  id: string;
  question: string;
  description: string;
  categories: Category[];
  /** IDs of compliance modules this trigger belongs to */
  activatesModules: string[];
  /** If this is a follow-up, the parent trigger ID */
  parentId?: string;
  /** Condition under which this follow-up appears ("yes" | "no") */
  showWhen?: "yes" | "no";
  /** Which agreement types this question applies to */
  appliesTo?: string[];
}

/** Recursively flatten a ComplianceTrigger tree into TriggerQuestion[] */
function flattenTriggers(
  triggers: ComplianceTrigger[],
  category: Category,
  moduleId: string,
  parentId?: string,
  showWhen?: "yes" | "no",
): TriggerQuestion[] {
  const result: TriggerQuestion[] = [];
  for (const t of triggers) {
    result.push({
      id: t.id,
      question: t.question,
      description: t.description,
      categories: [category],
      activatesModules: [moduleId],
      parentId,
      showWhen,
      appliesTo: t.appliesTo,
    });
    if (t.followUps?.onYes) {
      result.push(...flattenTriggers(t.followUps.onYes, category, moduleId, t.id, "yes"));
    }
    if (t.followUps?.onNo) {
      result.push(...flattenTriggers(t.followUps.onNo, category, moduleId, t.id, "no"));
    }
  }
  return result;
}

export const TRIGGER_QUESTIONS: TriggerQuestion[] = COMPLIANCE_MODULES.flatMap((m) =>
  flattenTriggers(m.triggers, m.category, m.id),
);

// ─────────────────────────────────────────────────────────────
// Query helpers
// ─────────────────────────────────────────────────────────────

export function getModulesForCategories(categories: Category[]): ComplianceModule[] {
  return COMPLIANCE_MODULES.filter((m) => categories.includes(m.category));
}

export function getQuestionsForCategories(categories: Category[], agreementIds?: string[]): TriggerQuestion[] {
  return TRIGGER_QUESTIONS.filter((q) => {
    // Must match at least one selected category
    if (!q.categories.some((c) => categories.includes(c))) return false;
    // If appliesTo is specified and agreementIds are provided, filter out irrelevant questions
    if (agreementIds && q.appliesTo && q.appliesTo.length > 0) {
      if (!q.appliesTo.some((id) => agreementIds.includes(id))) return false;
    }
    return true;
  });
}

/**
 * Returns only the top-level (root) trigger questions for given categories.
 * Use this when you want to show the initial question set before any
 * follow-ups have been revealed.
 */
export function getRootQuestionsForCategories(categories: Category[], agreementIds?: string[]): TriggerQuestion[] {
  return TRIGGER_QUESTIONS.filter((q) => {
    if (q.parentId) return false;
    if (!q.categories.some((c) => categories.includes(c))) return false;
    if (agreementIds && q.appliesTo && q.appliesTo.length > 0) {
      if (!q.appliesTo.some((id) => agreementIds.includes(id))) return false;
    }
    return true;
  });
}

/**
 * Given a set of answered trigger IDs and their boolean values, returns the
 * follow-up questions that should now be visible.
 */
export function getVisibleFollowUps(
  answers: Record<string, boolean>,
  categories: Category[],
  agreementIds?: string[],
): TriggerQuestion[] {
  const allQuestions = getQuestionsForCategories(categories, agreementIds);
  return allQuestions.filter((q) => {
    if (!q.parentId || !q.showWhen) return false;
    const parentAnswer = answers[q.parentId];
    if (parentAnswer === undefined) return false;
    return (parentAnswer && q.showWhen === "yes") || (!parentAnswer && q.showWhen === "no");
  });
}

/**
 * Returns all currently visible questions: root questions + any unlocked follow-ups.
 */
export function getVisibleQuestions(
  answers: Record<string, boolean>,
  categories: Category[],
  agreementIds?: string[],
): TriggerQuestion[] {
  const roots = getRootQuestionsForCategories(categories, agreementIds);
  const followUps = getVisibleFollowUps(answers, categories, agreementIds);
  return [...roots, ...followUps];
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

/**
 * Evaluates compliance based on answered trigger questions.
 * Activates modules whose triggers were answered affirmatively
 * and generates contextual warnings.
 */
export function evaluateCompliance(
  categories: Category[],
  jurisdiction: string,
  triggerAnswers: Record<string, boolean>,
): { activeModules: ComplianceModule[]; warnings: string[] } {
  const relevantModules = getModulesForCategories(categories);
  const active = new Set<string>();
  const warnings: string[] = [];

  // Always-on modules
  for (const m of relevantModules) {
    if (m.alwaysOn) active.add(m.id);
  }

  // Activate modules when any of their triggers are answered "yes"
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

  // ── Employment warnings ──
  if (categories.includes("employment")) {
    const isOntario = triggerAnswers["emp-ontario"];
    const isCsuite = triggerAnswers["emp-ontario-csuite"];
    const wantsNonCompete = triggerAnswers["emp-non-compete"];

    if (isOntario && wantsNonCompete && !isCsuite) {
      warnings.push(
        "Ontario ESA s.67.2: Non-compete clauses are void for non-C-suite employees. Ruby will substitute enhanced non-solicitation provisions.",
      );
    }
    if (isOntario && triggerAnswers["emp-ontario-25-employees"]) {
      warnings.push(
        "Working for Workers Act: Companies with 25+ Ontario employees must maintain electronic monitoring and disconnecting-from-work policies.",
      );
    }
    if (triggerAnswers["emp-fixed-term"] && triggerAnswers["emp-fixed-term-renewal"]) {
      warnings.push(
        "Ceccol v. Ontario Gymnastic Federation: Successive fixed-term renewals risk converting the contract to indefinite employment. Ruby will add anti-conversion safeguards.",
      );
    }
    if (triggerAnswers["emp-remote"]) {
      warnings.push(
        "Multi-province employment: Ruby will analyze which province's employment standards govern this arrangement and add appropriate choice-of-law provisions.",
      );
    }
  }

  // ── Corporate warnings ──
  if (categories.includes("corporate")) {
    if (triggerAnswers["corp-equal-split"]) {
      warnings.push(
        "50/50 ownership creates inherent deadlock risk. Ruby will include mandatory mediation, arbitration, and shotgun buy-sell provisions.",
      );
    }
    if (triggerAnswers["corp-drag-along"] && triggerAnswers["corp-majority-holder"]) {
      warnings.push(
        "Drag-along with majority control must be carefully drafted to avoid oppression claims under CBCA s.241. Ruby will add pricing protections for minority shareholders.",
      );
    }
    if (triggerAnswers["corp-usa-s146"]) {
      warnings.push(
        "CBCA s.146 USA: Must include ALL shareholders to be valid. A single missing shareholder invalidates the entire agreement.",
      );
    }
  }

  // ── Investment warnings ──
  if (categories.includes("investment")) {
    if (triggerAnswers["inv-accredited"] && triggerAnswers["inv-non-canadian"]) {
      warnings.push(
        "Cross-border investors require additional securities compliance — US Reg D, Reg S, or other foreign exemptions must be addressed.",
      );
    }
    if (triggerAnswers["inv-bridge"]) {
      warnings.push(
        "Bridge financing: Ensure conversion triggers, maturity date, and extension provisions are clearly defined to avoid disputes at the qualifying financing.",
      );
    }
  }

  // ── Commercial warnings ──
  if (categories.includes("commercial")) {
    if (triggerAnswers["com-personal-info"] && triggerAnswers["com-quebec-users"]) {
      warnings.push(
        "Quebec Law 25: Processing personal information of Quebec residents triggers mandatory privacy impact assessments, consent reforms, and privacy officer designation — in force since September 2023.",
      );
    }
    if (triggerAnswers["com-personal-info"] && triggerAnswers["com-cross-border-data"]) {
      warnings.push(
        "Cross-border data transfers require additional safeguards under PIPEDA Principle 4.1.3. Ruby will add data processing agreements and transfer impact assessments.",
      );
    }
    if (triggerAnswers["com-casl"]) {
      warnings.push(
        "CASL compliance: All commercial electronic messages require express consent, sender identification, and functional unsubscribe mechanisms. Penalties up to $10M per violation.",
      );
    }
  }

  // ── Platform warnings ──
  if (categories.includes("platform")) {
    if (triggerAnswers["plat-payments"]) {
      warnings.push(
        "Payment processing triggers PCI DSS compliance, Ontario Consumer Protection Act s.43 internet agreement disclosure, and refund policy requirements.",
      );
    }
    if (triggerAnswers["plat-marketplace"]) {
      warnings.push(
        "Marketplace intermediary status must be clearly established — platform liability differs significantly based on whether the platform is a party to or facilitator of transactions.",
      );
    }
  }

  // ── Creator warnings ──
  if (categories.includes("creator")) {
    if (triggerAnswers["cre-sponsored"]) {
      warnings.push(
        "Competition Act s.52: All sponsored content must include clear and prominent disclosure of the material connection. Criminal penalties apply for non-disclosure.",
      );
    }
    if (triggerAnswers["cre-exclusivity"] && !triggerAnswers["cre-exclusivity-category"]) {
      warnings.push(
        "Broad exclusivity restrictions without specific category definitions are more likely to be challenged as unreasonable restraints of trade.",
      );
    }
  }

  const activeModules = relevantModules.filter((m) => active.has(m.id));
  return { activeModules, warnings };
}
