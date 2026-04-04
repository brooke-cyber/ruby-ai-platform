// ─── Agreement-Specific Configurations ───
// Each agreement type gets unique party labels, wizard steps, clause positions,
// and drafting logic. No more generic "Employee / Shareholder / Investor" labels.

export interface PartyLabel {
  partyALabel: string;
  partyAPlaceholder: string;
  partyBLabel: string;
  partyBPlaceholder: string;
}

export interface ClausePosition {
  id: string;
  label: string;
  description: string;
  options: {
    id: string;
    label: string;
    description: string;
    favorability: "client" | "balanced" | "counter-party";
  }[];
  defaultPosition: string;
}

export interface AgreementConfig {
  id: string;
  partyLabels: PartyLabel;
  /** Agreement-specific system prompt additions for the AI drafter */
  draftingInstructions: string;
  /** Clause positions unique to this agreement type */
  clausePositions: ClausePosition[];
  /** Which wizard step IDs this agreement needs (beyond party + compliance + review) */
  wizardSteps: string[];
}

// ──────────────────────────────────────────────
// EMPLOYMENT AGREEMENTS
// ──────────────────────────────────────────────

const STANDARD_EMPLOYMENT_CONFIG: AgreementConfig = {
  id: "standard-employment",
  partyLabels: {
    partyALabel: "Employer (Company)",
    partyAPlaceholder: "Acme Technologies Inc.",
    partyBLabel: "Employee",
    partyBPlaceholder: "Jane Smith",
  },
  wizardSteps: ["emp-comp", "emp-clause", "emp-covenant", "emp-ip"],
  clausePositions: [
    {
      id: "terminationPosition",
      label: "Termination Without Cause",
      description: "How much notice/severance does the employee get if terminated without cause?",
      options: [
        { id: "employer-favourable", label: "ESA Minimum Only", description: "Statutory minimum under the Employment Standards Act — lowest cost to employer", favorability: "client" },
        { id: "balanced", label: "ESA-Plus Enhanced Formula", description: "Reasonable notice formula based on Bardal factors — where most deals land", favorability: "balanced" },
        { id: "employee-favourable", label: "Full Compensation Continuation", description: "Salary + benefits + bonus continuation through notice period — maximum employee protection", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "probationPosition",
      label: "Probation Period",
      description: "How long before the employee's full protections kick in?",
      options: [
        { id: "employer-favourable", label: "Maximum Probation (6 months)", description: "Longest allowable period — employer can terminate with statutory minimum", favorability: "client" },
        { id: "balanced", label: "Standard Probation (3 months)", description: "Industry standard with basic protections", favorability: "balanced" },
        { id: "employee-favourable", label: "No Probation", description: "Full protections from day one", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "noticePeriodPosition",
      label: "Resignation Notice Period",
      description: "How much notice must the employee give when resigning?",
      options: [
        { id: "employer-favourable", label: "8 Weeks Notice", description: "Long notice period protects employer's ability to find a replacement and transition work", favorability: "client" },
        { id: "balanced", label: "4 Weeks Notice", description: "Standard notice period balancing employee mobility with employer transition needs", favorability: "balanced" },
        { id: "employee-favourable", label: "2 Weeks Notice", description: "Minimal notice period — maximizes employee flexibility to move on quickly", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "overtimePosition",
      label: "Overtime Treatment",
      description: "How is overtime work compensated?",
      options: [
        { id: "employer-favourable", label: "Exempt (No Overtime)", description: "Employee is classified as exempt — no overtime pay regardless of hours worked", favorability: "client" },
        { id: "balanced", label: "Standard ESA Overtime", description: "Overtime at 1.5x regular rate after 44 hours per week per ESA requirements", favorability: "balanced" },
        { id: "employee-favourable", label: "Enhanced Overtime", description: "Overtime at 1.5x after 40 hours per week — more generous than ESA minimum", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "benefitsWaitingPosition",
      label: "Benefits Enrollment Timing",
      description: "When does the employee become eligible for group benefits?",
      options: [
        { id: "employer-favourable", label: "After 90 Days", description: "Benefits begin after 90 calendar days — reduces cost for short-tenure employees", favorability: "client" },
        { id: "balanced", label: "After Probation", description: "Benefits enrollment coincides with end of probation period", favorability: "balanced" },
        { id: "employee-favourable", label: "Immediate Enrollment", description: "Full benefits from day one of employment — strongest employee attraction", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "bonusClawbackPosition",
      label: "Bonus Clawback",
      description: "Can the employer recover bonuses already paid if the employee leaves shortly after?",
      options: [
        { id: "employer-favourable", label: "Full Repayment Within 12 Months", description: "Employee must repay 100% of bonus if they resign within 12 months of payment", favorability: "client" },
        { id: "balanced", label: "Pro-Rata Repayment", description: "Bonus repayment decreases proportionally each month — e.g., leave at 6 months, repay 50%", favorability: "balanced" },
        { id: "employee-favourable", label: "No Clawback", description: "Once paid, bonuses are fully earned and non-recoverable regardless of departure timing", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "workLocationPosition",
      label: "Work Arrangement",
      description: "What are the expectations for where the employee performs their work?",
      options: [
        { id: "employer-favourable", label: "Strict In-Office", description: "Employee must work from the employer's designated office location full-time", favorability: "client" },
        { id: "balanced", label: "Hybrid Flexibility", description: "Combination of in-office and remote work per company policy, subject to change with reasonable notice", favorability: "balanced" },
        { id: "employee-favourable", label: "Full Remote Rights", description: "Employee has contractual right to work remotely — any change requires mutual agreement", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — STANDARD EMPLOYMENT AGREEMENT:
This is a standard employment agreement for a non-executive hire.

PARTY DYNAMICS:
- The Employer is Party A (the company). Draft to protect the employer's business interests while remaining enforceable.
- The Employee is Party B. Ensure all ESA minimums are met — the Waksdale holistic test means ONE invalid clause can void the entire termination framework.

CRITICAL CLAUSES TO INCLUDE:
1. Position, duties, and reporting structure
2. Compensation: base salary, bonus structure (if any), pay frequency
3. Benefits enrollment timing and coverage
4. Probation period with clear termination-during-probation language
5. Termination provisions: with cause (just cause threshold per Dowling), without cause (per selected position), resignation notice
6. Restrictive covenants: confidentiality, non-solicitation, non-compete (if Ontario non-C-suite, VOID per ESA s.67.2 — substitute enhanced non-solicitation)
7. IP assignment with moral rights waiver under Copyright Act s.14.1
8. Entire agreement clause and independent legal advice acknowledgment

ENFORCEABILITY LOGIC:
- Non-compete: If jurisdiction is Ontario and employee is NOT C-suite, the non-compete MUST be converted to an enhanced non-solicitation with specific client/territory restrictions. Flag this in the agreement.
- Non-solicitation duration: Maximum 12-18 months to pass Shafron reasonableness test. Anything over 24 months is presumptively unenforceable.
- Termination: Apply the Waksdale holistic approach — every termination provision must independently comply with ESA minimums. If for-cause language is too broad, it poisons the entire clause.

ADDITIONAL CLAUSE POSITIONS:
- noticePeriodPosition: Draft resignation notice clause matching the selected period (2/4/8 weeks). Ensure it does not conflict with ESA minimum notice requirements.
- overtimePosition: If exempt, include exemption justification language. If standard/enhanced, specify calculation method and approval process.
- benefitsWaitingPosition: Align benefits enrollment with probation period if both are configured. Specify what happens to benefits on termination during the waiting period.
- bonusClawbackPosition: If clawback is selected, include clear repayment mechanics, deduction authorization, and interaction with termination provisions.
- workLocationPosition: If remote rights are granted, address equipment provision, expense reimbursement, and the employer's right to recall with notice.`,
};

const FIXED_TERM_EMPLOYMENT_CONFIG: AgreementConfig = {
  id: "fixed-term-employment",
  partyLabels: {
    partyALabel: "Employer (Company)",
    partyAPlaceholder: "Maple Leaf Corp.",
    partyBLabel: "Fixed-Term Employee",
    partyBPlaceholder: "John Doe",
  },
  wizardSteps: ["emp-comp", "emp-clause", "emp-covenant", "emp-ip"],
  clausePositions: [
    {
      id: "terminationPosition",
      label: "Early Termination",
      description: "What happens if the employer ends the contract before the fixed term expires?",
      options: [
        { id: "employer-favourable", label: "Termination for Convenience with Notice", description: "Employer can terminate with reasonable notice — no obligation to pay remaining term", favorability: "client" },
        { id: "balanced", label: "Pay Remaining Term or Reasonable Notice", description: "Employee gets the greater of remaining term compensation or reasonable notice", favorability: "balanced" },
        { id: "employee-favourable", label: "Full Remaining Term Payout", description: "Employee receives full compensation for the balance of the term — per Howard v. Benson Group", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "renewalPosition",
      label: "Renewal & Conversion",
      description: "What happens when the fixed term ends?",
      options: [
        { id: "employer-favourable", label: "No Automatic Renewal", description: "Contract expires without obligation. Fresh negotiation required.", favorability: "client" },
        { id: "balanced", label: "Renewal Option with Notice", description: "Either party can elect to renew with 30 days notice before expiry", favorability: "balanced" },
        { id: "employee-favourable", label: "Auto-Converts to Permanent", description: "If not terminated at expiry, automatically converts to indefinite employment with full ESA protections", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "successionPosition",
      label: "Anti-Succession / Renewal Limits",
      description: "How many times can the fixed-term contract be renewed before it is deemed indefinite?",
      options: [
        { id: "employer-favourable", label: "Strong Anti-Succession (Max 1 Renewal)", description: "Contract can only be renewed once — prevents Ceccol deemed-indefinite risk", favorability: "client" },
        { id: "balanced", label: "Moderate (Max 2 Renewals)", description: "Up to two renewals permitted with explicit anti-stacking language", favorability: "balanced" },
        { id: "employee-favourable", label: "No Renewal Limit", description: "Unlimited renewals — higher risk of being deemed indefinite employment by a court", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "benefitsContinuationPosition",
      label: "Benefits During Term",
      description: "Does the fixed-term employee receive benefits for the full contract duration?",
      options: [
        { id: "employer-favourable", label: "No Benefits", description: "No group benefits — employee is responsible for their own coverage during the term", favorability: "client" },
        { id: "balanced", label: "First 6 Months Only", description: "Benefits provided for the first 6 months of the term; employee transitions to own coverage after", favorability: "balanced" },
        { id: "employee-favourable", label: "Full Term Benefits", description: "Group benefits provided for the entire duration of the fixed term", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — FIXED-TERM EMPLOYMENT AGREEMENT:
This is a fixed-term (contract) employment agreement with a defined end date.

CRITICAL LEGAL RISKS:
- Howard v. Benson Group (2016 ONCA): If fixed-term contract lacks an early termination clause, employer must pay the ENTIRE remaining term. This is the #1 risk in fixed-term agreements.
- Successive renewals can convert fixed-term to indefinite employment (Ceccol v. Ontario Gymnastic Federation). Include anti-stacking language.
- ESA minimums STILL apply to fixed-term employees after 3+ months.

PARTY DYNAMICS:
- Employer wants flexibility to end early without paying the full remaining term
- Employee wants certainty of income for the agreed duration

MANDATORY PROVISIONS:
1. Clear start and end date
2. Early termination clause (CRITICAL — without it, employer pays full remaining term)
3. Renewal/non-renewal notice period
4. Anti-succession clause to prevent deemed indefinite conversion
5. Whether benefits continue through the full term or only a portion
6. What happens to bonus/commission on early termination
7. IP assignment for work created during the term

ADDITIONAL CLAUSE POSITIONS:
- successionPosition: Draft anti-succession language matching the selected renewal limit. If strong, include explicit language that this contract cannot be renewed more than once. If no limit, include a disclaimer that successive renewals do not create indefinite employment expectations.
- benefitsContinuationPosition: Specify benefits coverage period clearly. If partial, include transition language and COBRA-equivalent notification. If no benefits, state explicitly that the employee is responsible for their own insurance.`,
};

const CONTRACTOR_CONFIG: AgreementConfig = {
  id: "contractor",
  partyLabels: {
    partyALabel: "Client (Engaging Company)",
    partyAPlaceholder: "StartupCo Inc.",
    partyBLabel: "Independent Contractor",
    partyBPlaceholder: "Freelance Dev LLC / Jane Freelancer",
  },
  wizardSteps: ["emp-comp", "emp-ip"],
  clausePositions: [
    {
      id: "controlPosition",
      label: "Degree of Control",
      description: "How much control does the client have over how the work is done?",
      options: [
        { id: "client-favourable", label: "Maximum Client Control", description: "Detailed deliverables, milestones, client-directed workflow — higher misclassification risk", favorability: "client" },
        { id: "balanced", label: "Balanced Deliverables", description: "Defined scope and deadlines, contractor controls methods — industry standard", favorability: "balanced" },
        { id: "contractor-favourable", label: "Contractor Autonomy", description: "High-level outcomes only, contractor controls all methods and schedule", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "ipPosition",
      label: "IP Ownership",
      description: "Who owns the work product the contractor creates?",
      options: [
        { id: "client-favourable", label: "Client Owns Everything", description: "All IP, including background IP used in deliverables, transfers to client", favorability: "client" },
        { id: "balanced", label: "Client Owns Deliverables", description: "Client owns custom deliverables; contractor retains pre-existing tools and methodologies with license to client", favorability: "balanced" },
        { id: "contractor-favourable", label: "Contractor Retains IP", description: "Contractor retains all IP; client gets a perpetual license to use deliverables", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "terminationPosition",
      label: "Termination Rights",
      description: "How can either party end the contractor relationship?",
      options: [
        { id: "client-favourable", label: "Either Party 7 Days Notice", description: "Short notice period — maximum flexibility for the client to end the engagement quickly", favorability: "client" },
        { id: "balanced", label: "Mutual 14 Days Notice", description: "Two weeks notice from either side — standard commercial term allowing orderly transition", favorability: "balanced" },
        { id: "contractor-favourable", label: "For Cause + 30 Days Convenience", description: "Immediate termination only for material breach; otherwise 30 days written notice required", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "indemnificationPosition",
      label: "Tax Indemnification",
      description: "Who bears the risk if CRA reclassifies the contractor as an employee?",
      options: [
        { id: "client-favourable", label: "Contractor Indemnifies Fully", description: "Contractor indemnifies client for all back taxes, CPP/EI, penalties, and interest on reclassification", favorability: "client" },
        { id: "balanced", label: "Mutual Indemnification", description: "Each party indemnifies the other for their own tax obligations; shared risk on reclassification", favorability: "balanced" },
        { id: "contractor-favourable", label: "Limited to Amounts Payable", description: "Contractor's indemnification capped at amounts already paid under the agreement", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "insurancePosition",
      label: "Insurance Requirements",
      description: "What insurance must the contractor maintain during the engagement?",
      options: [
        { id: "client-favourable", label: "Comprehensive Coverage", description: "Contractor must maintain CGL ($2M), professional E&O ($1M), and cyber liability insurance with client as additional insured", favorability: "client" },
        { id: "balanced", label: "Basic CGL", description: "Contractor maintains standard commercial general liability insurance ($1-2M)", favorability: "balanced" },
        { id: "contractor-favourable", label: "No Insurance Required", description: "No mandatory insurance — contractor manages their own risk", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — INDEPENDENT CONTRACTOR AGREEMENT:
This is NOT an employment agreement. The entire document must reinforce the independent contractor relationship.

CRITICAL LEGAL RISK — MISCLASSIFICATION:
- CRA and provincial employment standards agencies actively pursue misclassification
- Wiebe Door Services v. MNR: The 4-factor test (control, ownership of tools, chance of profit/risk of loss, integration) determines true status
- If misclassified, client owes: back taxes, CPP/EI contributions, vacation pay, termination pay, potential penalties

PARTY DYNAMICS:
- Client wants clear IP ownership and the ability to direct deliverables without creating an employment relationship
- Contractor wants autonomy, ability to work for others, and clear payment terms

MANDATORY PROVISIONS:
1. Explicit statement of independent contractor status
2. No exclusivity clause (contractor can work for others)
3. Contractor provides own tools and equipment
4. Payment on invoice (not salary schedule)
5. No benefits, vacation, or statutory deductions
6. GST/HST registration number (if applicable)
7. Clear scope of work / deliverables
8. IP assignment with moral rights waiver
9. Indemnification for tax obligations
10. Termination by either party with notice (not "firing")

ADDITIONAL CLAUSE POSITIONS:
- terminationPosition: Draft termination clause per selected position. For 7-day notice, ensure the clause is styled as a commercial termination, not "firing." For cause-only, define material breach clearly.
- indemnificationPosition: Draft tax indemnification clause. If contractor indemnifies fully, include hold harmless language covering CRA reassessment, penalties, and interest. If mutual, allocate responsibility for each party's own statutory obligations.
- insurancePosition: If comprehensive, require certificates of insurance naming client as additional insured before work begins. If none, include a waiver of claims clause.`,
};

const NON_COMPETE_CONFIG: AgreementConfig = {
  id: "non-compete",
  partyLabels: {
    partyALabel: "Employer / Company",
    partyAPlaceholder: "Acme Technologies Inc.",
    partyBLabel: "Employee / Departing Party",
    partyBPlaceholder: "Jane Smith",
  },
  wizardSteps: ["emp-covenant"],
  clausePositions: [
    {
      id: "scopePosition",
      label: "Geographic & Activity Scope",
      description: "How broad are the competitive restrictions?",
      options: [
        { id: "employer-favourable", label: "Broad Scope", description: "Industry-wide restriction within the province for 24 months", favorability: "client" },
        { id: "balanced", label: "Reasonable Scope", description: "Direct competitors only, within the city/region, 12 months", favorability: "balanced" },
        { id: "employee-favourable", label: "Narrow Scope", description: "Only the specific business line, limited geography, 6 months", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "considerationPosition",
      label: "Fresh Consideration",
      description: "What consideration supports the non-compete if signed after employment began?",
      options: [
        { id: "employer-favourable", label: "Continued Employment Only", description: "Non-compete supported only by continued employment — risky, may be challenged as insufficient consideration", favorability: "client" },
        { id: "balanced", label: "Promotion + Raise", description: "Non-compete tied to a promotion, title change, or salary increase — stronger consideration", favorability: "balanced" },
        { id: "employee-favourable", label: "Signing Bonus", description: "Separate cash payment specifically for the non-compete — strongest consideration and clearest value exchange", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "stepDownPosition",
      label: "Step-Down Provisions",
      description: "If a court finds the restrictions too broad, do they step down automatically?",
      options: [
        { id: "employer-favourable", label: "No Step-Down", description: "Fixed restrictions with no automatic reduction — all or nothing per Shafron", favorability: "client" },
        { id: "balanced", label: "Geographic Step-Down", description: "If geographic scope is struck, it automatically reduces to next narrower territory", favorability: "balanced" },
        { id: "employee-favourable", label: "Duration + Geographic Step-Down", description: "Both duration and geography automatically reduce in tiers — maximum severability protection", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "enforcementPosition",
      label: "Enforcement Remedies",
      description: "What remedies are available to the employer if the non-compete is breached?",
      options: [
        { id: "employer-favourable", label: "Injunction + Actual Damages + Legal Costs", description: "Full enforcement arsenal: injunctive relief, actual damages, and indemnification for legal costs", favorability: "client" },
        { id: "balanced", label: "Injunction + Liquidated Damages", description: "Injunctive relief plus pre-agreed liquidated damages amount — provides certainty for both sides", favorability: "balanced" },
        { id: "employee-favourable", label: "Injunctive Relief Only", description: "Only injunctive relief available — no monetary damages claim for breach", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — NON-COMPETE AGREEMENT:

CRITICAL ENFORCEABILITY FRAMEWORK:
- Ontario ESA s.67.2 (Working for Workers Act): Non-competes are VOID for all employees EXCEPT C-suite executives (CEO, CFO, COO, etc.). If the employee is not C-suite in Ontario, this agreement MUST be drafted as an enhanced non-solicitation instead. FLAG THIS CLEARLY.
- Shafron v. KRG Insurance Brokers (2009 SCC): Restrictive covenants must be reasonable in scope, duration, and geography. Courts will NOT blue-pencil — they strike the entire clause.
- Payette v. Guay (2013 SCC): Quebec may apply different standards.

ENFORCEABILITY CHECKLIST (Shafron test):
1. Duration: 6-12 months is generally enforceable. 24+ months is presumptively unreasonable.
2. Geography: Must be tied to actual business territory, not aspirational reach.
3. Activity: Must be specific to the actual competitive harm, not "any business."
4. Consideration: If signed after employment starts, requires fresh consideration (raise, promotion, bonus).

DRAFTING LOGIC:
- If jurisdiction is Ontario AND employee is NOT C-suite → Draft as enhanced non-solicitation with specific client lists and employee non-recruit provisions instead
- If jurisdiction is Ontario AND employee IS C-suite → Non-compete is permissible but must still pass Shafron
- If jurisdiction is NOT Ontario → Non-compete is permissible but Shafron principles apply nationally
- Always include a severability clause with step-down provisions as backup

ADDITIONAL CLAUSE POSITIONS:
- considerationPosition: Draft consideration clause matching selected type. If continued employment only, add a risk acknowledgment that this may be challenged. If signing bonus, specify the amount and payment timing.
- stepDownPosition: If step-down is selected, draft cascading reduction tiers (e.g., province → city → 50km radius; 24 months → 12 months → 6 months). If no step-down, rely on the severability clause alone.
- enforcementPosition: Draft remedies clause per selection. If liquidated damages, specify the pre-agreed amount formula. If full damages, include an acknowledgment that damages are difficult to quantify.`,
};

const EXECUTIVE_EMPLOYMENT_CONFIG: AgreementConfig = {
  id: "executive-employment",
  partyLabels: {
    partyALabel: "Corporation",
    partyAPlaceholder: "Maple Leaf Technologies Inc.",
    partyBLabel: "Executive Officer",
    partyBPlaceholder: "John Executive, CEO",
  },
  wizardSteps: ["emp-comp", "emp-clause", "emp-covenant", "emp-ip"],
  clausePositions: [
    {
      id: "terminationPosition",
      label: "Severance Package",
      description: "What does the executive receive on termination without cause?",
      options: [
        { id: "employer-favourable", label: "Formula-Based Severance", description: "1 month per year of service, capped at 12 months", favorability: "client" },
        { id: "balanced", label: "Negotiated Fixed Severance", description: "Pre-agreed lump sum (e.g., 12-18 months base + pro-rated bonus)", favorability: "balanced" },
        { id: "employee-favourable", label: "Full Package Continuation", description: "Salary + bonus + benefits + equity vesting acceleration through full notice period", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "changeOfControlPosition",
      label: "Change of Control",
      description: "What happens to the executive's position and compensation on acquisition/merger?",
      options: [
        { id: "employer-favourable", label: "No Special Provisions", description: "Standard termination provisions apply; no acceleration or golden parachute", favorability: "client" },
        { id: "balanced", label: "Single Trigger", description: "Equity acceleration on change of control; severance only if also terminated", favorability: "balanced" },
        { id: "employee-favourable", label: "Double Trigger Golden Parachute", description: "Full equity acceleration + enhanced severance on change of control + termination/constructive dismissal", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "equityAccelerationPosition",
      label: "Equity Vesting on Termination",
      description: "What happens to unvested equity when the executive is terminated without cause?",
      options: [
        { id: "employer-favourable", label: "No Acceleration", description: "Unvested equity is forfeited on termination — only vested shares are retained", favorability: "client" },
        { id: "balanced", label: "Partial (Pro-Rata) Acceleration", description: "Unvested equity accelerates proportionally based on time served in the current vesting period", favorability: "balanced" },
        { id: "employee-favourable", label: "Full Acceleration", description: "All unvested equity immediately vests on termination without cause — maximum executive protection", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "clawbackPosition",
      label: "Bonus & Equity Clawback",
      description: "Under what circumstances can the company recover previously paid bonuses or vested equity?",
      options: [
        { id: "employer-favourable", label: "Broad Clawback", description: "Clawback triggered by financial restatement, policy violation, misconduct discovery, or reputational harm within 3 years", favorability: "client" },
        { id: "balanced", label: "Clawback on Cause Only", description: "Clawback applies only when the executive is terminated for just cause — limited to bonus paid in the preceding 12 months", favorability: "balanced" },
        { id: "employee-favourable", label: "No Clawback", description: "Once compensation is earned and paid, it cannot be recovered regardless of subsequent events", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "dnoInsurancePosition",
      label: "D&O Insurance Coverage",
      description: "What level of directors' and officers' insurance protects the executive?",
      options: [
        { id: "employer-favourable", label: "Company Standard Policy", description: "Executive is covered under the company's existing D&O policy — no special provisions", favorability: "client" },
        { id: "balanced", label: "Enhanced Dedicated Policy", description: "Company maintains dedicated D&O insurance with minimum coverage amounts specified in the agreement", favorability: "balanced" },
        { id: "employee-favourable", label: "Tail Coverage 6 Years Post-Departure", description: "Company must maintain D&O tail coverage for 6 years after the executive's departure — covers legacy liability", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "nonCompeteDurationPosition",
      label: "Non-Compete Duration",
      description: "How long is the executive restricted from competing after departure?",
      options: [
        { id: "employer-favourable", label: "24 Months", description: "Two-year non-compete — maximum duration that may still be enforceable for C-suite executives", favorability: "client" },
        { id: "balanced", label: "12 Months", description: "One-year non-compete — standard for senior executives and generally enforceable under Shafron", favorability: "balanced" },
        { id: "employee-favourable", label: "6 Months", description: "Six-month non-compete — shorter restriction with higher enforceability likelihood", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "disputeResolutionPosition",
      label: "Dispute Resolution",
      description: "How are disputes between the executive and the company resolved?",
      options: [
        { id: "employer-favourable", label: "Litigation", description: "Disputes resolved through the courts — public proceedings, full discovery rights", favorability: "client" },
        { id: "balanced", label: "Arbitration (Confidential)", description: "Binding arbitration with confidentiality provisions — keeps disputes private, faster resolution", favorability: "balanced" },
        { id: "employee-favourable", label: "Mediation Then Arbitration", description: "Mandatory mediation attempt first, then binding arbitration if unresolved — least adversarial approach", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — EXECUTIVE EMPLOYMENT AGREEMENT:
This is a senior executive agreement requiring sophisticated compensation and governance provisions.

PARTY DYNAMICS:
- The Corporation is engaging a C-suite executive who has significant negotiating leverage
- Executive agreements typically involve higher stakes: larger severance, equity, change of control provisions, D&O insurance
- Non-competes ARE enforceable for C-suite in Ontario (ESA s.67.2 exception)

MANDATORY PROVISIONS:
1. Title, reporting structure, and fiduciary duty acknowledgment
2. Base compensation, bonus structure (discretionary vs. formula), and equity/option grants
3. Change of control provisions (single vs. double trigger)
4. D&O insurance and indemnification
5. Severance: typically negotiated as a fixed amount, not statutory minimum
6. Clawback provisions for bonus/equity
7. Board seat (if applicable) and resignation on termination
8. Non-compete (enforceable for C-suite), non-solicitation, confidentiality
9. Expense policy and perquisites
10. Dispute resolution: typically arbitration to maintain confidentiality

ADDITIONAL CLAUSE POSITIONS:
- equityAccelerationPosition: Draft equity acceleration clause per selection. If partial, specify the pro-rata formula. If full, address interaction with change-of-control acceleration to avoid double-counting.
- clawbackPosition: If broad clawback, define each trigger event precisely and specify the lookback period. If cause-only, tie the definition of "cause" to the termination clause. Include mechanics for how recovery is effected.
- dnoInsurancePosition: If tail coverage, specify the minimum coverage amount and the 6-year post-departure period. Include a covenant that the company will not cancel or reduce coverage without executive consent.
- nonCompeteDurationPosition: Draft non-compete with the selected duration. Cross-reference with Ontario ESA s.67.2 C-suite exception. Include garden leave provisions if the duration exceeds 12 months.
- disputeResolutionPosition: If arbitration, specify the arbitral institution (e.g., ADR Institute of Canada), number of arbitrators, and seat. If mediation-then-arbitration, specify the mediation period (e.g., 30 days) before escalation.`,
};

const IP_ASSIGNMENT_CONFIG: AgreementConfig = {
  id: "ip-assignment",
  partyLabels: {
    partyALabel: "Assignee (Company Receiving IP)",
    partyAPlaceholder: "Acme Technologies Inc.",
    partyBLabel: "Assignor (Person Transferring IP)",
    partyBPlaceholder: "Jane Creator / Dev Studio Ltd.",
  },
  wizardSteps: ["emp-ip"],
  clausePositions: [
    {
      id: "scopePosition",
      label: "Assignment Scope",
      description: "How broad is the IP transfer?",
      options: [
        { id: "assignee-favourable", label: "Full Assignment", description: "All IP created during the relationship, including improvements and derivatives, worldwide and perpetual", favorability: "client" },
        { id: "balanced", label: "Work Product Assignment", description: "IP directly created for the company; assignor retains pre-existing IP with license grant", favorability: "balanced" },
        { id: "assignor-favourable", label: "Limited Assignment", description: "Only specifically identified deliverables; all other IP retained by assignor", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "moralRightsPosition",
      label: "Moral Rights",
      description: "Moral rights under the Copyright Act cannot be assigned — only waived.",
      options: [
        { id: "assignee-favourable", label: "Full Waiver", description: "Complete moral rights waiver under Copyright Act s.14.1 — company can modify freely", favorability: "client" },
        { id: "balanced", label: "Waiver with Attribution", description: "Moral rights waived except right of attribution — assignor credited where reasonable", favorability: "balanced" },
        { id: "assignor-favourable", label: "No Waiver", description: "Moral rights fully retained — assignor can object to modifications", favorability: "counter-party" },
      ],
      defaultPosition: "assignee-favourable",
    },
    {
      id: "priorIpPosition",
      label: "Pre-Existing IP Treatment",
      description: "How is the assignor's pre-existing intellectual property handled?",
      options: [
        { id: "assignee-favourable", label: "No Carve-Out", description: "No pre-existing IP is excluded — all IP used in deliverables transfers to assignee", favorability: "client" },
        { id: "balanced", label: "Representations Only", description: "Assignor represents they have not incorporated pre-existing IP, but no formal disclosure schedule", favorability: "balanced" },
        { id: "assignor-favourable", label: "Full Disclosure Schedule", description: "Assignor provides a detailed schedule of all pre-existing IP, which is explicitly excluded from the assignment", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "furtherAssurancesPosition",
      label: "Future Cooperation Obligation",
      description: "How long must the assignor help the assignee perfect the IP rights?",
      options: [
        { id: "assignee-favourable", label: "Unlimited Obligation", description: "Assignor must execute any documents and provide assistance to perfect the assignment, with no time limit", favorability: "client" },
        { id: "balanced", label: "Reasonable Efforts for 2 Years", description: "Assignor provides reasonable cooperation for 2 years post-assignment at assignee's expense", favorability: "balanced" },
        { id: "assignor-favourable", label: "One-Time Assistance Only", description: "Assignor provides a single round of assistance at closing — no ongoing obligation", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "considerationPosition",
      label: "Consideration for Assignment",
      description: "What form of payment supports the IP transfer?",
      options: [
        { id: "assignee-favourable", label: "Nominal ($1 Under Seal)", description: "Nominal consideration of $1 — relies on the deed/seal for enforceability", favorability: "client" },
        { id: "balanced", label: "Included in Employment Compensation", description: "IP assignment is part of the overall employment/engagement compensation package", favorability: "balanced" },
        { id: "assignor-favourable", label: "Separate Cash Consideration", description: "Separate, independently negotiated cash payment specifically for the IP rights", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — IP ASSIGNMENT AGREEMENT:
This is a standalone intellectual property assignment — not embedded in an employment agreement.

CRITICAL LEGAL FRAMEWORK:
- Copyright Act s.13(3): Employer automatically owns copyright for work created in course of employment. BUT this does NOT apply to contractors, consultants, or founders.
- Copyright Act s.14.1: Moral rights cannot be assigned, only waived. A waiver is REQUIRED for the assignee to freely modify the work.
- Patent Act: Patent rights must be explicitly assigned in writing. Inventions by employees are NOT automatically owned by employer unless contractually assigned.
- Trade-marks Act: Trade-mark rights follow use, not creation. Assignment must include goodwill.

PARTY DYNAMICS:
- Assignee (Company) wants clean, unencumbered title to all IP with no residual claims
- Assignor (Creator) wants fair compensation and may want to retain rights to pre-existing tools/methods

MANDATORY PROVISIONS:
1. Specific identification of IP being assigned (schedules of patents, copyrights, trade-marks, trade secrets)
2. Representations that assignor is the sole owner with authority to assign
3. Worldwide, perpetual, irrevocable assignment language
4. Moral rights waiver (per position selected)
5. Further assurances clause (obligation to sign future documents to perfect assignment)
6. Consideration clause (must have valid consideration or be under seal)
7. No residual rights / no retained license (unless balanced position selected)
8. Indemnification for IP infringement claims

ADDITIONAL CLAUSE POSITIONS:
- priorIpPosition: If no carve-out, include a broad representation that all IP is original. If disclosure schedule, attach as an exhibit and include a mechanism for updating the schedule.
- furtherAssurancesPosition: If unlimited, include an irrevocable power of attorney allowing assignee to execute documents on assignor's behalf if assignor is unavailable. If time-limited, specify expense reimbursement terms.
- considerationPosition: If nominal, execute under seal and include recital of consideration. If separate cash, specify the amount, payment timing, and any holdback provisions.`,
};

const STANDARD_NDA_CONFIG: AgreementConfig = {
  id: "standard-nda",
  partyLabels: {
    partyALabel: "Disclosing Party",
    partyAPlaceholder: "Acme Technologies Inc.",
    partyBLabel: "Receiving Party",
    partyBPlaceholder: "Potential Partner Inc.",
  },
  wizardSteps: [],
  clausePositions: [
    {
      id: "directionality",
      label: "NDA Direction",
      description: "Is confidential information flowing one way or both ways?",
      options: [
        { id: "mutual", label: "Mutual NDA", description: "Both parties share and protect each other's confidential information", favorability: "balanced" },
        { id: "one-way-discloser", label: "One-Way (You Disclose)", description: "Only your client shares confidential information; other party is restricted", favorability: "client" },
        { id: "one-way-recipient", label: "One-Way (You Receive)", description: "Your client receives confidential information; narrower obligations preferred", favorability: "counter-party" },
      ],
      defaultPosition: "mutual",
    },
    {
      id: "durationPosition",
      label: "Confidentiality Duration",
      description: "How long do the confidentiality obligations last?",
      options: [
        { id: "discloser-favourable", label: "Perpetual", description: "Obligations last forever — strongest protection for trade secrets", favorability: "client" },
        { id: "balanced", label: "3-5 Years", description: "Standard commercial duration — enforceable and reasonable", favorability: "balanced" },
        { id: "recipient-favourable", label: "1-2 Years", description: "Short duration — easier for the receiving party", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — NON-DISCLOSURE AGREEMENT:
This is a confidentiality agreement to protect sensitive business information.

DRAFTING LOGIC:
- Mutual NDAs are market standard for business discussions between two companies
- One-way NDAs are appropriate when only one party is sharing sensitive information
- Definition of "Confidential Information" is the most important clause — too broad = unenforceable, too narrow = gaps

MANDATORY PROVISIONS:
1. Clear definition of Confidential Information (with specific examples AND exclusions)
2. Standard exclusions: publicly known, independently developed, received from third party, compelled by law
3. Permitted purpose (what the information can be used for)
4. Return/destruction of materials on termination
5. Remedies clause: acknowledge that damages are inadequate and injunctive relief is appropriate
6. Residuals clause consideration (whether incidentally retained knowledge is permitted)
7. No implied license or partnership`,
};

// ──────────────────────────────────────────────
// CORPORATE / EQUITY AGREEMENTS
// ──────────────────────────────────────────────

const TWO_PARTY_SHA_CONFIG: AgreementConfig = {
  id: "two-party-sha",
  partyLabels: {
    partyALabel: "Co-Founder A",
    partyAPlaceholder: "Jane Founder",
    partyBLabel: "Co-Founder B",
    partyBPlaceholder: "John Co-Founder",
  },
  wizardSteps: ["corp-shareholders", "corp-governance", "corp-transfer", "corp-deadlock"],
  clausePositions: [
    {
      id: "vestingPosition",
      label: "Founder Vesting",
      description: "Should founders' shares vest over time to protect against early departures?",
      options: [
        { id: "aggressive-vesting", label: "4-Year Vest, 1-Year Cliff", description: "Standard startup vesting — protects against co-founder leaving early with full equity", favorability: "balanced" },
        { id: "moderate-vesting", label: "3-Year Vest, No Cliff", description: "Shorter schedule recognizing pre-existing contributions", favorability: "balanced" },
        { id: "no-vesting", label: "Immediate Full Ownership", description: "No vesting — both founders own their shares outright from day one", favorability: "balanced" },
      ],
      defaultPosition: "aggressive-vesting",
    },
    {
      id: "deadlockPosition",
      label: "50/50 Deadlock Resolution",
      description: "If co-founders disagree on a major decision, how is it resolved?",
      options: [
        { id: "shotgun", label: "Shotgun Buy-Sell", description: "One partner names a price; the other must buy or sell at that price. Fast but high-stakes.", favorability: "balanced" },
        { id: "mediation-arbitration", label: "Mediation then Arbitration", description: "Attempt mediation first; if unresolved, binding arbitration. Slower but more measured.", favorability: "balanced" },
        { id: "casting-vote", label: "Casting Vote / Tie-Breaker", description: "Designated third party or advisor gets the deciding vote on deadlocked matters.", favorability: "balanced" },
      ],
      defaultPosition: "mediation-arbitration",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — TWO-PARTY SHAREHOLDER AGREEMENT:
This is a co-founder / two-party shareholder agreement. The core tension is EQUALITY + DEADLOCK PREVENTION.

PARTY DYNAMICS:
- Both parties are co-founders with roughly equal power
- Neither party is a passive investor — both are active in the business
- The #1 risk is a 50/50 deadlock with no resolution mechanism

CRITICAL CLAUSES:
1. Vesting schedule (protects against "dead equity" from early departures)
2. Deadlock resolution mechanism — THIS IS THE MOST IMPORTANT CLAUSE
3. ROFR on share transfers (keeps ownership between founders)
4. Compelled transfer on death/disability/bankruptcy (shotgun or put/call)
5. Reserved matters requiring unanimous consent (protect minority positions)
6. Non-compete during and after (both founders)
7. Drag-along / tag-along rights
8. Valuation methodology for buyouts (formula, third-party, or agreed value)

ENFORCEABILITY:
- Ontario Jockey Club principle: Transfer restrictions must be graduated, not absolute
- Include step-down mechanisms for all restrictive provisions`,
};

const STARTUP_SHA_CONFIG: AgreementConfig = {
  id: "startup-sha",
  partyLabels: {
    partyALabel: "Lead Founder / Majority Shareholder",
    partyAPlaceholder: "Jane CEO",
    partyBLabel: "Co-Founders / Minority Shareholders",
    partyBPlaceholder: "John CTO, Sarah COO",
  },
  wizardSteps: ["corp-shareholders", "corp-governance", "corp-transfer", "corp-deadlock"],
  clausePositions: [
    {
      id: "controlPosition",
      label: "Decision-Making Control",
      description: "How are major decisions made between unequal shareholders?",
      options: [
        { id: "majority-rules", label: "Majority Rules", description: "Lead founder controls all ordinary decisions; reserved matters need supermajority", favorability: "client" },
        { id: "balanced", label: "Balanced Governance", description: "Board decisions by majority, but key matters (dilution, sale, debt) need all founders", favorability: "balanced" },
        { id: "minority-protected", label: "Strong Minority Protections", description: "Extensive reserved matters requiring unanimous consent; minority veto on strategic decisions", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "dilutionPosition",
      label: "Anti-Dilution Protection",
      description: "How are minority shareholders protected when new shares are issued?",
      options: [
        { id: "no-protection", label: "No Anti-Dilution", description: "Company can issue shares freely; minority shareholders may be diluted", favorability: "client" },
        { id: "pre-emptive", label: "Pre-Emptive Rights", description: "Shareholders can participate pro-rata in new issuances to maintain their percentage", favorability: "balanced" },
        { id: "full-ratchet", label: "Full Ratchet + Pre-Emptive", description: "Price protection on down rounds plus right to maintain percentage — strongest minority protection", favorability: "counter-party" },
      ],
      defaultPosition: "pre-emptive",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — STARTUP SHAREHOLDER AGREEMENT:
This is a multi-party startup shareholder agreement with UNEQUAL ownership stakes.

PARTY DYNAMICS:
- Lead founder typically holds majority or plurality
- Minority co-founders need protections against being squeezed out
- Agreement must balance operational efficiency (lead founder can run the company) with minority protections (co-founders can't be diluted or forced out unfairly)

KEY DIFFERENCES FROM TWO-PARTY:
- Unequal equity split means different protective mechanisms
- Board composition must reflect ownership but protect minorities
- Vesting is critical — a departing minority founder shouldn't retain a blocking position
- Pre-emptive rights are essential for minority protection against dilution

MANDATORY PROVISIONS:
1. ESOP pool reservation (typically 10-15% for future hires)
2. Vesting for ALL founders (including lead)
3. Board composition with minority appointment rights
4. Pre-emptive rights on new issuances
5. Reserved matters (minority veto on existential decisions)
6. Drag-along (majority can force a sale) with fair price protections
7. Tag-along (minority can join a sale)
8. Good leaver / bad leaver provisions
9. Non-compete and non-solicitation for all shareholders`,
};

const JOINT_VENTURE_CONFIG: AgreementConfig = {
  id: "joint-venture",
  partyLabels: {
    partyALabel: "JV Partner A (Lead Venturer)",
    partyAPlaceholder: "Alpha Corp.",
    partyBLabel: "JV Partner B (Co-Venturer)",
    partyBPlaceholder: "Beta Industries Inc.",
  },
  wizardSteps: ["corp-shareholders", "corp-governance", "corp-deadlock"],
  clausePositions: [
    {
      id: "managementPosition",
      label: "JV Management",
      description: "Who runs the day-to-day operations of the joint venture?",
      options: [
        { id: "partner-a-manages", label: "Partner A Manages", description: "Lead venturer appoints management; Partner B has board oversight only", favorability: "client" },
        { id: "joint-management", label: "Joint Management Committee", description: "Equal representation on management committee; decisions by consensus or majority", favorability: "balanced" },
        { id: "independent-management", label: "Independent Management", description: "JV hires independent CEO; both partners have board seats but don't run operations", favorability: "counter-party" },
      ],
      defaultPosition: "joint-management",
    },
    {
      id: "exitPosition",
      label: "JV Exit Mechanism",
      description: "How does a partner exit the joint venture?",
      options: [
        { id: "buy-sell", label: "Buy-Sell (Shotgun)", description: "Either partner can trigger; forces a buy or sell at named price", favorability: "balanced" },
        { id: "put-call", label: "Put/Call Options", description: "Partner B can put (force Partner A to buy) or Partner A can call (force Partner B to sell) at formula price", favorability: "balanced" },
        { id: "wind-down", label: "Orderly Wind-Down", description: "Liquidate JV assets and distribute proceeds — slowest but cleanest", favorability: "balanced" },
      ],
      defaultPosition: "buy-sell",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — JOINT VENTURE AGREEMENT:
This is a joint venture between two independent companies creating a shared enterprise.

PARTY DYNAMICS:
- Both parties are sophisticated commercial entities (not individuals)
- Each party brings different assets: capital, technology, market access, etc.
- Neither party wants to cede full control to the other
- Exit provisions are critical because JVs have high failure rates

MANDATORY PROVISIONS:
1. JV purpose and scope (clearly defined — prevents scope creep disputes)
2. Capital contributions (cash, IP, assets, services) from each partner
3. Profit/loss allocation (may differ from ownership split)
4. Management structure and decision-making
5. Reserved matters (both partners must agree)
6. Non-compete restrictions (partners can't compete with the JV)
7. IP licensing to/from the JV (what each partner contributes vs. what the JV creates)
8. Exit mechanisms with clear valuation methodology
9. Deadlock resolution
10. Confidentiality between the JV and each partner's other businesses
11. Anti-trust / competition law compliance (if partners are competitors)`,
};

const INVESTOR_PE_CONFIG: AgreementConfig = {
  id: "investor-pe-backed",
  partyLabels: {
    partyALabel: "Company / Founders",
    partyAPlaceholder: "StartupCo Inc.",
    partyBLabel: "Investor / PE Fund",
    partyBPlaceholder: "Venture Capital Fund LP",
  },
  wizardSteps: ["corp-shareholders", "corp-governance", "corp-transfer"],
  clausePositions: [
    {
      id: "boardPosition",
      label: "Board Control",
      description: "What board representation does the investor get?",
      options: [
        { id: "founder-controlled", label: "Founder-Controlled Board", description: "Founders hold board majority; investor gets observer seat or single director", favorability: "client" },
        { id: "balanced", label: "Balanced Board", description: "Equal founder/investor directors plus one mutual independent", favorability: "balanced" },
        { id: "investor-controlled", label: "Investor Board Majority", description: "Investor appoints majority of directors; typical for later-stage PE", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "liquidationPosition",
      label: "Liquidation Preference",
      description: "What does the investor get back first on a sale or liquidation?",
      options: [
        { id: "non-participating-1x", label: "1x Non-Participating", description: "Investor gets 1x investment back OR converts to common — the founder-friendly standard", favorability: "client" },
        { id: "participating-1x", label: "1x Participating", description: "Investor gets 1x back AND shares in remaining proceeds — double-dip", favorability: "counter-party" },
        { id: "participating-capped", label: "Participating with Cap", description: "Investor gets 1x back AND shares up to a cap (typically 3x) — compromise position", favorability: "balanced" },
      ],
      defaultPosition: "non-participating-1x",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — INVESTOR / PE-BACKED SHAREHOLDER AGREEMENT:
This is a shareholder agreement with an institutional investor (VC, PE, or angel fund).

PARTY DYNAMICS:
- Founders want to maintain operational control and minimize dilution
- Investor wants governance rights, information rights, protective provisions, and a clear path to exit (typically 5-7 year horizon)
- This is NOT a co-founder agreement — the investor is a financial party, not an operator

MANDATORY PROVISIONS:
1. Share classes (preferred vs. common) with clear rights per class
2. Liquidation preference (participating vs. non-participating)
3. Anti-dilution protection (weighted average or full ratchet)
4. Board composition and investor appointment rights
5. Protective provisions / investor consent rights (new debt, new equity, asset sales, M&A)
6. Information and inspection rights
7. Pre-emptive rights on future rounds
8. Drag-along (investor can force a sale after X years)
9. Tag-along (founders can join investor-initiated sale)
10. Registration rights (if applicable for public offerings)
11. Founder employment agreements and non-competes
12. ROFR on founder share transfers`,
};

const FIFTY_FIFTY_CONFIG: AgreementConfig = {
  id: "fifty-fifty",
  partyLabels: {
    partyALabel: "Partner A",
    partyAPlaceholder: "Jane Business Partner",
    partyBLabel: "Partner B",
    partyBPlaceholder: "John Business Partner",
  },
  wizardSteps: ["corp-shareholders", "corp-governance", "corp-deadlock"],
  clausePositions: [
    {
      id: "deadlockPosition",
      label: "Deadlock Resolution (CRITICAL for 50/50)",
      description: "The single most important clause in a 50/50 agreement. Without it, deadlock can paralyze the business.",
      options: [
        { id: "shotgun", label: "Shotgun Buy-Sell (Russian Roulette)", description: "One partner names a price; other must buy at that price or sell at that price. Fast, decisive, high-stakes.", favorability: "balanced" },
        { id: "baseball-arbitration", label: "Baseball Arbitration", description: "Both partners submit sealed valuations; arbitrator picks the closest to fair value. Less adversarial than shotgun.", favorability: "balanced" },
        { id: "mediation-escalation", label: "Mediation → Arbitration → Dissolution", description: "Graduated: try mediation first, then binding arbitration, then forced dissolution as last resort.", favorability: "balanced" },
      ],
      defaultPosition: "shotgun",
    },
    {
      id: "castingVotePosition",
      label: "Tie-Breaking Mechanism",
      description: "For operational deadlocks (not existential ones), who breaks the tie?",
      options: [
        { id: "external-advisor", label: "External Advisor", description: "Mutually appointed advisor gets casting vote on operational deadlocks", favorability: "balanced" },
        { id: "alternating", label: "Alternating Decision Rights", description: "Partners alternate who gets final say on deadlocked operational decisions", favorability: "balanced" },
        { id: "domain-split", label: "Domain-Based Authority", description: "Each partner has final authority in their area of expertise (e.g., Partner A = tech, Partner B = sales)", favorability: "balanced" },
      ],
      defaultPosition: "external-advisor",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — 50/50 PARTNERSHIP / SHAREHOLDER AGREEMENT:
This is a DEADLOCK-FOCUSED agreement between two equal partners.

THE CORE PROBLEM:
- 50/50 ownership means neither partner can outvote the other
- Without a deadlock mechanism, the business can be completely paralyzed
- This is the #1 cause of business disputes in Canada for equal partnerships

PARTY DYNAMICS:
- Both parties have equal economic and governance rights
- The agreement must create mechanisms to BREAK ties, not just acknowledge them
- Every material clause should contemplate what happens when partners disagree

MANDATORY PROVISIONS:
1. Deadlock resolution mechanism (THE most important clause)
2. Operational tie-breaking (domain authority or casting vote)
3. Shotgun / buy-sell mechanism with minimum waiting period and financing considerations
4. Mutual non-compete and non-solicitation
5. Equal board representation (2+2 with mutual independent, or alternating chair)
6. Reserved matters requiring unanimity
7. Financial controls (dual signature requirements, spending limits)
8. Management responsibility allocation
9. Exit mechanism that works for equal partners (shotgun is most common)
10. Valuation methodology for buyouts (critical when shotgun is used)`,
};

const INCORPORATION_CONFIG: AgreementConfig = {
  id: "articles-of-incorporation",
  partyLabels: {
    partyALabel: "Incorporator / Founding Director",
    partyAPlaceholder: "Jane Founder",
    partyBLabel: "Corporation Name",
    partyBPlaceholder: "Acme Technologies Inc.",
  },
  wizardSteps: ["corp-shareholders"],
  clausePositions: [
    {
      id: "shareStructure",
      label: "Share Structure",
      description: "How should the corporation's shares be structured?",
      options: [
        { id: "simple", label: "Simple (Common Only)", description: "Single class of common shares with equal rights. Clean and simple for bootstrapped companies.", favorability: "balanced" },
        { id: "dual-class", label: "Dual-Class (Common + Preferred)", description: "Common shares for founders + blank-cheque preferred for future investors. Standard for fundraising.", favorability: "balanced" },
        { id: "multi-class", label: "Multi-Class Voting", description: "Multiple classes with different voting rights. Lets founders maintain control post-investment.", favorability: "client" },
      ],
      defaultPosition: "dual-class",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — ARTICLES OF INCORPORATION:
This is a corporate formation document, NOT a contract between parties.

CRITICAL: Articles of Incorporation are filed with the government (CBCA or provincial). They must comply with the specific statutory requirements of the governing legislation.

CBCA vs OBCA:
- If CBCA: Must comply with Canada Business Corporations Act
- If OBCA: Must comply with Ontario Business Corporations Act
- Key differences: CBCA requires 25% Canadian resident directors; OBCA has no such requirement

MANDATORY CONTENT:
1. Corporation name (must include legal element: Inc., Corp., Ltd.)
2. Registered office address (province)
3. Share structure: classes, rights, privileges, restrictions
4. Number of directors (fixed or min/max range)
5. Restrictions on share transfers (if private company)
6. Restrictions on business activities (if any — usually none)
7. Other provisions (borrowing powers, etc.)

SHARE STRUCTURE LOGIC:
- Pre-revenue/bootstrapped: Simple common shares only
- Planning to raise: Common + blank preferred (flexible for future terms)
- Maintaining founder control: Supervoting common for founders + regular common for others`,
};

// ──────────────────────────────────────────────
// FINANCING AGREEMENTS
// ──────────────────────────────────────────────

const SAFE_CONFIG: AgreementConfig = {
  id: "safe-agreement",
  partyLabels: {
    partyALabel: "Company (Issuer)",
    partyAPlaceholder: "StartupCo Inc.",
    partyBLabel: "Investor",
    partyBPlaceholder: "Angel Investor / Fund Name",
  },
  wizardSteps: ["inv-terms", "inv-conversion", "inv-info"],
  clausePositions: [
    {
      id: "conversionPosition",
      label: "Conversion Terms",
      description: "How favorable are the conversion economics for the investor?",
      options: [
        { id: "company-favourable", label: "Company-Friendly", description: "Higher valuation cap, lower discount (10-15%), post-money SAFE", favorability: "client" },
        { id: "balanced", label: "Market Standard", description: "Reasonable cap + 20% discount, pre-money SAFE — where most seed deals close", favorability: "balanced" },
        { id: "investor-favourable", label: "Investor-Friendly", description: "Lower cap, higher discount (25-30%), MFN on all terms, pro-rata rights", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "mfnPosition",
      label: "Most Favored Nation (MFN)",
      description: "If the company offers better terms to a later investor, does this investor get upgraded?",
      options: [
        { id: "no-mfn", label: "No MFN", description: "This investor's terms are locked in regardless of future SAFEs", favorability: "client" },
        { id: "limited-mfn", label: "Limited MFN (Cap & Discount Only)", description: "Investor gets the better of their cap/discount or any future SAFE's", favorability: "balanced" },
        { id: "broad-mfn", label: "Broad MFN (All Terms)", description: "Investor can adopt any more favorable term from any future SAFE — includes side letters", favorability: "counter-party" },
      ],
      defaultPosition: "limited-mfn",
    },
    {
      id: "preMoneyPostPosition",
      label: "SAFE Type (Pre-Money vs Post-Money)",
      description: "Does the SAFE convert on a pre-money or post-money basis? This fundamentally affects dilution.",
      options: [
        { id: "company-favourable", label: "Post-Money SAFE", description: "SAFE holders' ownership is calculated on a post-money basis — company knows exactly how much dilution each SAFE represents", favorability: "client" },
        { id: "balanced", label: "Pre-Money SAFE", description: "SAFE converts on a pre-money basis — more favorable to investor as subsequent SAFEs don't dilute earlier ones", favorability: "balanced" },
      ],
      defaultPosition: "company-favourable",
    },
    {
      id: "minimumRaisePosition",
      label: "Qualified Financing Threshold",
      description: "How large must the equity financing round be to trigger automatic SAFE conversion?",
      options: [
        { id: "company-favourable", label: "$500K Minimum", description: "Low threshold — gives company flexibility to trigger conversion with a smaller round", favorability: "client" },
        { id: "balanced", label: "$1M Minimum", description: "Standard threshold — ensures conversion only occurs on a meaningful financing round", favorability: "balanced" },
        { id: "investor-favourable", label: "$2M Minimum", description: "High threshold — protects investor by ensuring conversion only on a substantial institutional round", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "dissolutionPosition",
      label: "Dissolution Preference",
      description: "What does the SAFE investor receive if the company dissolves before conversion?",
      options: [
        { id: "company-favourable", label: "Nothing (Pure Equity Risk)", description: "Investor takes full equity risk — receives nothing on dissolution beyond what common shareholders get", favorability: "client" },
        { id: "balanced", label: "Pro-Rata with Common", description: "Investor participates pro-rata with common shareholders based on an implied ownership percentage", favorability: "balanced" },
        { id: "investor-favourable", label: "1x Investment Back First", description: "Investor receives their full investment amount back before any distribution to common shareholders", favorability: "counter-party" },
      ],
      defaultPosition: "investor-favourable",
    },
    {
      id: "sideLetterPosition",
      label: "Side Letter Rights",
      description: "Does the SAFE investor receive additional governance or information rights via side letter?",
      options: [
        { id: "company-favourable", label: "No Side Letters", description: "SAFE is a clean, standalone instrument — no additional rights granted", favorability: "client" },
        { id: "balanced", label: "Limited Side Letter", description: "Investor receives board observer seat and quarterly financial information rights", favorability: "balanced" },
        { id: "investor-favourable", label: "Broad Side Letter", description: "Full suite of customary rights: board observer, information rights, pro-rata participation, major transaction consent", favorability: "counter-party" },
      ],
      defaultPosition: "company-favourable",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — SAFE AGREEMENT (CANADIAN):
This is a Simple Agreement for Future Equity adapted for Canadian securities law.

CRITICAL: This is NOT a US YC SAFE copy-paste. Canadian SAFEs require:
- NI 45-106 prospectus exemption compliance (accredited investor, friends & family, offering memorandum)
- Provincial securities law filing requirements
- Canadian tax treatment considerations (not US tax-free treatment)
- Proper definition of "Equity Financing" under Canadian terminology

PARTY DYNAMICS:
- Company wants to raise capital quickly without setting a valuation
- Investor wants downside protection (cap) and upside participation (discount)
- The SAFE is not debt — it's a contractual right to future equity

MANDATORY PROVISIONS:
1. Investment amount and payment terms
2. Valuation cap (pre-money or post-money — SPECIFY WHICH)
3. Discount rate
4. Definition of "Equity Financing" (what triggers conversion)
5. Conversion mechanics on: equity financing, liquidity event, dissolution
6. MFN clause (if applicable)
7. Pro-rata rights on future rounds (if applicable)
8. Information rights (what the investor sees and how often)
9. Securities law compliance: NI 45-106 exemption relied upon, hold period, legends
10. Governing law and dispute resolution
11. No interest, no maturity date, no repayment right (it's NOT a loan)

ADDITIONAL CLAUSE POSITIONS:
- preMoneyPostPosition: Draft conversion mechanics using the selected SAFE type. Post-money SAFEs include the SAFE amount in the post-money valuation; pre-money SAFEs exclude it. Clearly define the conversion formula.
- minimumRaisePosition: Define "Equity Financing" with the selected minimum threshold. Specify whether the threshold includes or excludes amounts raised under other SAFEs/notes converting in the same round.
- dissolutionPosition: Draft dissolution waterfall per selection. If 1x back first, specify priority relative to other SAFE holders and any secured creditors.
- sideLetterPosition: If side letter rights are granted, draft as a separate side letter exhibit. If broad, include consent rights for material transactions (asset sales, mergers, key hires).`,
};

// ──────────────────────────────────────────────
// LENDING & DEBT INSTRUMENTS
// ──────────────────────────────────────────────

const CONVERTIBLE_NOTE_CONFIG: AgreementConfig = {
  id: "convertible-note",
  partyLabels: {
    partyALabel: "Company (Borrower)",
    partyAPlaceholder: "StartupCo Inc.",
    partyBLabel: "Investor (Lender)",
    partyBPlaceholder: "Angel Investor / Fund Name",
  },
  wizardSteps: ["inv-terms", "inv-conversion", "inv-info"],
  clausePositions: [
    {
      id: "interestPosition",
      label: "Interest & Payment Terms",
      description: "How favorable are the interest rate and repayment terms?",
      options: [
        { id: "borrower-favourable", label: "Borrower-Friendly", description: "Lower interest rate, longer maturity, flexible prepayment with no penalty", favorability: "client" },
        { id: "balanced", label: "Market Standard", description: "Reasonable rate (6-8%), 18-24 month maturity, standard prepayment terms", favorability: "balanced" },
        { id: "lender-favourable", label: "Lender-Friendly", description: "Higher interest rate, shorter maturity, prepayment premium, mandatory conversion", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "conversionPosition",
      label: "Conversion Mechanics",
      description: "How favorable are the conversion economics for the investor?",
      options: [
        { id: "company-favourable", label: "Company-Friendly", description: "Higher valuation cap, lower discount (10-15%), fewer conversion triggers", favorability: "client" },
        { id: "balanced", label: "Market Standard", description: "Reasonable cap + 20% discount — where most seed convertible notes close", favorability: "balanced" },
        { id: "investor-favourable", label: "Investor-Friendly", description: "Lower cap, higher discount (25-30%), broad conversion triggers, MFN on all terms", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "defaultPosition",
      label: "Default & Remedies",
      description: "What happens if the borrower misses a payment or breaches a covenant?",
      options: [
        { id: "borrower-favourable", label: "Borrower-Friendly", description: "Long cure periods (30 days), limited acceleration triggers, no cross-default", favorability: "client" },
        { id: "balanced", label: "Balanced", description: "Standard cure periods (15 days), acceleration on material default, standard cross-default", favorability: "balanced" },
        { id: "lender-favourable", label: "Lender-Friendly", description: "Short cure (5 days), broad acceleration rights, cross-default across all instruments", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "securityPosition",
      label: "Security Interest",
      description: "Is the convertible note secured by company assets?",
      options: [
        { id: "borrower-favourable", label: "Unsecured", description: "No security interest — note is a general unsecured obligation of the company", favorability: "client" },
        { id: "balanced", label: "Subordinated Security", description: "Security interest subordinated to any senior lender — provides some protection without blocking future financing", favorability: "balanced" },
        { id: "lender-favourable", label: "Senior Secured with PPSA", description: "First-priority security interest in all company assets registered under PPSA", favorability: "counter-party" },
      ],
      defaultPosition: "borrower-favourable",
    },
    {
      id: "prepaymentPosition",
      label: "Prepayment Rights",
      description: "Can the company repay the note early instead of converting?",
      options: [
        { id: "borrower-favourable", label: "Prepay Freely", description: "Borrower can prepay principal + accrued interest at any time without penalty", favorability: "client" },
        { id: "balanced", label: "Prepay with 2% Premium", description: "Borrower can prepay but must pay a 2% prepayment premium to compensate investor for lost upside", favorability: "balanced" },
        { id: "lender-favourable", label: "No Prepayment Without Consent", description: "Borrower cannot prepay without investor's written consent — protects investor's conversion right", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "maturityExtensionPosition",
      label: "Maturity Extension",
      description: "What happens if the note reaches maturity without a qualifying financing event?",
      options: [
        { id: "borrower-favourable", label: "Automatic 6-Month Extension", description: "Maturity automatically extends by 6 months — gives company more time to raise a qualifying round", favorability: "client" },
        { id: "balanced", label: "Extension with Investor Consent", description: "Maturity can be extended with mutual agreement — investor can negotiate improved terms for the extension", favorability: "balanced" },
        { id: "lender-favourable", label: "No Extension", description: "Note becomes immediately due and payable at maturity — investor can demand repayment or negotiate conversion", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — CONVERTIBLE NOTE (CANADIAN):
This is a debt instrument that converts to equity upon specified trigger events.

CRITICAL REGULATORY REQUIREMENTS:
- Interest Act s.4: All interest must be expressed as an annual rate
- Criminal Code s.347: Include savings clause capping effective rate at 60% per annum
- NI 45-106: Securities law compliance for the conversion feature
- Interest Act s.8: If secured by real property, no default interest allowed

MANDATORY PROVISIONS:
1. Principal amount, interest rate (annual), and payment schedule
2. Maturity date and maturity conversion mechanics
3. Qualified financing conversion (trigger, cap, discount)
4. Change of control conversion or repayment mechanics
5. Events of default with cure periods
6. Prepayment rights and any prepayment premium
7. Security interest (if any) with PPSA registration requirements
8. Information rights for the lender/investor
9. Criminal Code s.347 savings clause (MANDATORY)
10. NI 45-106 prospectus exemption relied upon

ADDITIONAL CLAUSE POSITIONS:
- securityPosition: If secured, draft PPSA registration requirements and describe the collateral. If subordinated, include an intercreditor acknowledgment. Include Interest Act s.8 considerations if real property is involved.
- prepaymentPosition: If prepay with premium, specify whether the premium applies to full or partial prepayment. If no prepayment, include language that the investor's conversion right is protected.
- maturityExtensionPosition: If automatic extension, specify whether interest rate changes during the extension period. If no extension, draft maturity conversion mechanics (e.g., convert at cap or repay at investor's election).`,
};

const BILATERAL_LOAN_CONFIG: AgreementConfig = {
  id: "bilateral-loan",
  partyLabels: {
    partyALabel: "Borrower",
    partyAPlaceholder: "Borrower Corp.",
    partyBLabel: "Lender",
    partyBPlaceholder: "Lender Name / Institution",
  },
  wizardSteps: ["inv-terms", "inv-info"],
  clausePositions: [
    {
      id: "interestPosition",
      label: "Interest & Repayment",
      description: "How aggressive are the interest rate and repayment terms?",
      options: [
        { id: "borrower-favourable", label: "Borrower-Friendly", description: "Lower rate, interest-only period, flexible prepayment, no security required", favorability: "client" },
        { id: "balanced", label: "Market Standard", description: "Market-rate interest, amortizing repayment, standard security package", favorability: "balanced" },
        { id: "lender-favourable", label: "Lender-Friendly", description: "Higher rate, bullet repayment, comprehensive security, financial covenants", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "defaultPosition",
      label: "Default & Remedies",
      description: "What triggers default and what can the lender do?",
      options: [
        { id: "borrower-favourable", label: "Borrower-Friendly", description: "Limited default triggers, 30-day cure, no cross-default, limited acceleration", favorability: "client" },
        { id: "balanced", label: "Balanced", description: "Standard default triggers, 15-day cure, standard cross-default provisions", favorability: "balanced" },
        { id: "lender-favourable", label: "Lender-Friendly", description: "Broad defaults, 5-day cure, full cross-default, immediate acceleration rights", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "financialCovenantsPosition",
      label: "Financial Covenants",
      description: "What ongoing financial tests must the borrower satisfy?",
      options: [
        { id: "borrower-favourable", label: "No Financial Covenants", description: "No ongoing financial tests — borrower has maximum operational flexibility", favorability: "client" },
        { id: "balanced", label: "Light Covenants (DSCR Only)", description: "Debt service coverage ratio test only (e.g., minimum 1.25x) — tested quarterly", favorability: "balanced" },
        { id: "lender-favourable", label: "Comprehensive Covenants", description: "Full covenant package: DSCR (1.25x), leverage ratio (3.0x), current ratio (1.5x), and annual capex limit", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "securityPackagePosition",
      label: "Security Package",
      description: "What collateral secures the loan?",
      options: [
        { id: "borrower-favourable", label: "Unsecured", description: "No security interest — loan is a general unsecured obligation based on borrower's creditworthiness", favorability: "client" },
        { id: "balanced", label: "General Security Agreement", description: "GSA creating a first-priority security interest in all present and after-acquired property of the borrower", favorability: "balanced" },
        { id: "lender-favourable", label: "GSA + Personal Guarantee", description: "General security agreement plus unlimited personal guarantee from principals — maximum lender protection", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "repaymentStructurePosition",
      label: "Repayment Structure",
      description: "How is the loan principal repaid over time?",
      options: [
        { id: "borrower-favourable", label: "Interest-Only with Bullet", description: "Interest payments only during the term; full principal due at maturity — preserves borrower cash flow", favorability: "client" },
        { id: "balanced", label: "Amortizing (Equal Payments)", description: "Equal blended payments of principal and interest over the loan term — steady reduction of outstanding balance", favorability: "balanced" },
        { id: "lender-favourable", label: "Amortizing with Balloon", description: "Amortizing payments based on a longer schedule with a balloon payment at maturity — lender gets periodic principal reduction plus large final payment", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — BILATERAL LOAN AGREEMENT (CANADIAN):
Standard loan agreement between one borrower and one lender under Canadian law.

CRITICAL REGULATORY REQUIREMENTS:
- Interest Act s.4: Interest must be expressed as an annual rate
- Interest Act s.8: If secured by real property, no higher default interest rate permitted
- Criminal Code s.347: Savings clause MANDATORY — effective interest cannot exceed 60% per annum
- PPSA: If secured, proper registration and priority rules apply

MANDATORY PROVISIONS:
1. Principal amount and drawdown mechanics
2. Interest rate (fixed or variable), calculation method, payment dates
3. Repayment schedule (amortizing, bullet, interest-only period)
4. Prepayment rights and any prepayment premium
5. Security interest description and PPSA registration
6. Representations and warranties (both parties)
7. Financial covenants (debt service coverage, leverage ratios)
8. Events of default with specific cure periods
9. Remedies on default (acceleration, enforcement, receiver appointment)
10. Criminal Code s.347 savings clause (MANDATORY)

ADDITIONAL CLAUSE POSITIONS:
- financialCovenantsPosition: If comprehensive covenants, define each ratio precisely with calculation methodology. Include testing frequency (quarterly or annually) and specify cure rights if a covenant is breached. Include a compliance certificate requirement.
- securityPackagePosition: If GSA, include PPSA registration requirements, priority language, and perfection steps. If personal guarantee, specify whether it is limited or unlimited, joint and several, and whether it survives repayment of the loan.
- repaymentStructurePosition: Draft the repayment schedule per selection. For bullet repayment, include refinancing risk acknowledgment. For balloon, specify the amortization period vs. the loan term (e.g., 10-year amortization, 5-year term).`,
};

const DEMAND_NOTE_CONFIG: AgreementConfig = {
  id: "demand-note",
  partyLabels: {
    partyALabel: "Borrower (Maker)",
    partyAPlaceholder: "Borrower Name / Company",
    partyBLabel: "Lender (Payee)",
    partyBPlaceholder: "Lender Name",
  },
  wizardSteps: ["inv-terms"],
  clausePositions: [
    {
      id: "demandPosition",
      label: "Demand & Payment Terms",
      description: "How much notice does the borrower get before the loan is called?",
      options: [
        { id: "borrower-favourable", label: "Borrower-Friendly", description: "30-day demand notice, low interest, no security, flexible prepayment", favorability: "client" },
        { id: "balanced", label: "Market Standard", description: "15-day demand notice, market interest, optional security", favorability: "balanced" },
        { id: "lender-favourable", label: "Lender-Friendly", description: "Payable on demand (no notice), higher rate, secured, cross-default", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — DEMAND PROMISSORY NOTE (CANADIAN):
A simple promissory note payable on demand under the Bills of Exchange Act.

CRITICAL REGULATORY REQUIREMENTS:
- Bills of Exchange Act: Note must meet formal requirements (unconditional promise, sum certain, payable on demand)
- Interest Act s.4: Interest expressed as annual rate
- Criminal Code s.347: Savings clause MANDATORY

MANDATORY PROVISIONS:
1. Principal amount
2. Interest rate (annual) and calculation method
3. Demand mechanics and notice period (if any)
4. Payment method and location
5. Prepayment rights
6. Security (if any)
7. Criminal Code s.347 savings clause (MANDATORY)
8. Governing law`,
};

const REVOLVING_CREDIT_CONFIG: AgreementConfig = {
  id: "revolving-credit",
  partyLabels: {
    partyALabel: "Borrower",
    partyAPlaceholder: "Operating Company Inc.",
    partyBLabel: "Lender",
    partyBPlaceholder: "Lender / Financial Institution",
  },
  wizardSteps: ["inv-terms", "inv-info"],
  clausePositions: [
    {
      id: "facilityPosition",
      label: "Facility Terms",
      description: "How flexible is the credit facility for the borrower?",
      options: [
        { id: "borrower-favourable", label: "Borrower-Friendly", description: "High limit, low commitment fee, flexible borrowing base, minimal covenants", favorability: "client" },
        { id: "balanced", label: "Market Standard", description: "Standard limit, market commitment fees, reasonable covenants and reporting", favorability: "balanced" },
        { id: "lender-favourable", label: "Lender-Friendly", description: "Strict borrowing base, comprehensive covenants, sweep provisions, full security", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "defaultPosition",
      label: "Default & Remedies",
      description: "What triggers default and what remedies are available?",
      options: [
        { id: "borrower-favourable", label: "Borrower-Friendly", description: "Limited triggers, long cure periods, no cross-default, limited recourse", favorability: "client" },
        { id: "balanced", label: "Balanced", description: "Standard triggers, 15-day cure, standard cross-default, market remedies", favorability: "balanced" },
        { id: "lender-favourable", label: "Lender-Friendly", description: "Broad triggers, short cure, full cross-default, appointment of receiver", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "borrowingBasePosition",
      label: "Borrowing Base",
      description: "Is the available credit limited by a formula tied to the borrower's assets?",
      options: [
        { id: "borrower-favourable", label: "No Borrowing Base", description: "Full facility amount available at all times — no asset-based limitation on draws", favorability: "client" },
        { id: "balanced", label: "Simple (% of Receivables)", description: "Availability limited to a percentage (e.g., 80%) of eligible accounts receivable", favorability: "balanced" },
        { id: "lender-favourable", label: "Comprehensive Borrowing Base", description: "Availability based on eligible receivables (80%) + inventory (50%) with concentration limits, dilution reserves, and monthly borrowing base certificates", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "sweepPosition",
      label: "Cash Sweep",
      description: "Is the borrower required to apply excess cash flow to reduce the outstanding balance?",
      options: [
        { id: "borrower-favourable", label: "No Cash Sweep", description: "No mandatory prepayment from excess cash flow — borrower retains all cash for operations", favorability: "client" },
        { id: "balanced", label: "Annual Sweep at 50%", description: "50% of annual excess cash flow applied to reduce the revolving balance — tested annually", favorability: "balanced" },
        { id: "lender-favourable", label: "Quarterly Sweep at 75%", description: "75% of quarterly excess cash flow applied to reduce the balance — aggressive cash recapture", favorability: "counter-party" },
      ],
      defaultPosition: "borrower-favourable",
    },
    {
      id: "commitmentFeePosition",
      label: "Commitment Fee",
      description: "What fee does the borrower pay on the undrawn portion of the facility?",
      options: [
        { id: "borrower-favourable", label: "0.25% on Undrawn", description: "Low commitment fee — minimizes cost of maintaining undrawn availability", favorability: "client" },
        { id: "balanced", label: "0.50% Standard", description: "Market-standard commitment fee on undrawn amounts — typical for mid-market facilities", favorability: "balanced" },
        { id: "lender-favourable", label: "0.75% with Utilization Grid", description: "Higher base commitment fee plus a utilization-based grid that increases the fee as usage rises", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — REVOLVING CREDIT FACILITY (CANADIAN):
A revolving loan facility allowing draw-down, repayment, and re-borrowing up to a committed limit.

CRITICAL REGULATORY REQUIREMENTS:
- Interest Act s.4: All interest and fees expressed as annual rates
- Criminal Code s.347: Savings clause MANDATORY — all fees, standby charges, and interest combined cannot exceed 60% effective annual rate
- PPSA: Comprehensive security registration required
- BIA: Facility terms must account for insolvency priority

MANDATORY PROVISIONS:
1. Commitment amount (facility limit)
2. Availability period and maturity date
3. Draw-down mechanics (notice period, minimum amounts, conditions precedent)
4. Interest rate (prime + margin, or CORRA-based), calculation, payment dates
5. Commitment fee / standby fee on undrawn portion
6. Utilization fee (if applicable)
7. Repayment and mandatory prepayment triggers
8. Borrowing base calculation (if asset-based)
9. Financial covenants (debt service coverage, leverage, current ratio)
10. Reporting requirements (frequency, content)
11. Security package description and PPSA registration
12. Events of default with cure periods
13. Criminal Code s.347 savings clause (MANDATORY)

ADDITIONAL CLAUSE POSITIONS:
- borrowingBasePosition: If comprehensive, define "eligible receivables" and "eligible inventory" precisely. Include concentration limits (e.g., no single debtor > 25%), dilution reserve, and borrowing base certificate frequency (monthly).
- sweepPosition: If cash sweep applies, define "excess cash flow" precisely (EBITDA minus debt service, taxes, capex, and permitted distributions). Specify the sweep percentage and testing period.
- commitmentFeePosition: Draft the commitment fee clause per selection. If utilization grid, specify the tiers (e.g., <33% utilization = 0.75%, 33-66% = 0.50%, >66% = 0.25% — inverted grid rewarding usage).`,
};

// ──────────────────────────────────────────────
// COMMERCIAL / SaaS AGREEMENTS
// ──────────────────────────────────────────────

const SAAS_SLA_CONFIG: AgreementConfig = {
  id: "saas-sla",
  partyLabels: {
    partyALabel: "Service Provider (SaaS Company)",
    partyAPlaceholder: "CloudPlatform Inc.",
    partyBLabel: "Customer (Subscriber)",
    partyBPlaceholder: "Enterprise Client Corp.",
  },
  wizardSteps: ["com-service", "com-sla", "com-data", "com-liability"],
  clausePositions: [
    {
      id: "slaPosition",
      label: "SLA Commitment Level",
      description: "How aggressive are the uptime and performance guarantees?",
      options: [
        { id: "provider-favourable", label: "Best Efforts", description: "Target uptime with service credits as sole remedy — no liability for outages beyond credits", favorability: "client" },
        { id: "balanced", label: "Committed SLA with Credits", description: "99.9% uptime commitment with tiered service credit schedule. Industry standard.", favorability: "balanced" },
        { id: "customer-favourable", label: "Guaranteed SLA with Termination Right", description: "99.95%+ with aggressive credits AND customer right to terminate for repeated SLA breaches", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "dataPosition",
      label: "Data Ownership & Portability",
      description: "Who owns the customer's data and how easily can they take it back?",
      options: [
        { id: "provider-favourable", label: "Provider Retains Aggregated Data", description: "Customer owns their data but provider retains rights to anonymized/aggregated usage data", favorability: "client" },
        { id: "balanced", label: "Customer Owns All Data", description: "Customer owns all data; provider can use anonymized data for service improvement only", favorability: "balanced" },
        { id: "customer-favourable", label: "Full Portability + Deletion", description: "Customer owns all data with guaranteed export in standard format + certified deletion on termination", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "terminationPosition",
      label: "Termination for Convenience",
      description: "Can the customer terminate the subscription before the end of the term without cause?",
      options: [
        { id: "provider-favourable", label: "Not Permitted", description: "Customer is locked in for the full subscription term — no early termination without cause", favorability: "client" },
        { id: "balanced", label: "90 Days Notice", description: "Customer can terminate with 90 days written notice — balance between revenue predictability and customer flexibility", favorability: "balanced" },
        { id: "customer-favourable", label: "30 Days Notice", description: "Customer can terminate with 30 days notice — maximum flexibility, higher churn risk for provider", favorability: "counter-party" },
      ],
      defaultPosition: "provider-favourable",
    },
    {
      id: "indemnificationPosition",
      label: "Indemnification",
      description: "Who indemnifies whom, and for what?",
      options: [
        { id: "provider-favourable", label: "No Indemnification", description: "Neither party indemnifies the other — each bears their own risk", favorability: "client" },
        { id: "balanced", label: "Mutual Indemnification", description: "Provider indemnifies for IP infringement; customer indemnifies for data and content uploaded to the platform", favorability: "balanced" },
        { id: "customer-favourable", label: "Provider Indemnifies for IP", description: "Provider indemnifies customer against all third-party IP infringement claims arising from use of the service", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "renewalPosition",
      label: "Renewal Terms",
      description: "How does the subscription renew at the end of the initial term?",
      options: [
        { id: "provider-favourable", label: "Auto-Renewal with 60-Day Opt-Out", description: "Subscription auto-renews for successive 1-year terms unless either party gives 60 days notice of non-renewal", favorability: "client" },
        { id: "balanced", label: "Annual Renewal by Mutual Agreement", description: "Subscription expires at end of term; renewal requires affirmative mutual agreement on pricing and terms", favorability: "balanced" },
        { id: "customer-favourable", label: "Evergreen Until Terminated", description: "Subscription continues month-to-month after initial term until either party terminates — customer has ongoing flexibility", favorability: "counter-party" },
      ],
      defaultPosition: "provider-favourable",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — SaaS SERVICE LEVEL AGREEMENT:
This is a SaaS subscription agreement with service level commitments.

PARTY DYNAMICS:
- Provider wants to limit liability, retain flexibility to modify the service, and own aggregated data
- Customer wants uptime guarantees, data ownership/portability, and meaningful remedies for service failures

MANDATORY PROVISIONS:
1. Service description and feature scope
2. Uptime commitment (99.9% is market standard)
3. Measurement methodology (how uptime is calculated, excluding planned maintenance)
4. Service credit schedule (tiered: 10% for 99.0-99.9%, 25% for 95-99%, etc.)
5. Support tiers and response times (critical/high/medium/low)
6. Data ownership, processing, and portability
7. PIPEDA compliance and data residency requirements
8. Breach notification obligations (72 hours is Canadian standard)
9. Liability caps (typically 12 months of fees)
10. Force majeure (what qualifies and what doesn't)
11. Termination for convenience and for cause
12. Transition assistance period on termination

ADDITIONAL CLAUSE POSITIONS:
- terminationPosition: Draft termination for convenience clause per selection. If not permitted, ensure there is still a robust termination for cause provision. If permitted, address refund of prepaid fees on early termination.
- indemnificationPosition: Draft indemnification clause per selection. If provider indemnifies for IP, include standard exclusions (modifications by customer, combination with third-party software, use outside documentation). Include defense and settlement control mechanics.
- renewalPosition: Draft renewal mechanics per selection. If auto-renewal, specify the price escalation cap (e.g., CPI or maximum 5% increase). If mutual agreement, include a negotiation period before expiry.`,
};

const MANAGED_SERVICES_SLA_CONFIG: AgreementConfig = {
  id: "managed-services-sla",
  partyLabels: {
    partyALabel: "Managed Services Provider",
    partyAPlaceholder: "TechOps Solutions Inc.",
    partyBLabel: "Client (Service Recipient)",
    partyBPlaceholder: "Growing Business Corp.",
  },
  wizardSteps: ["com-service", "com-sla", "com-data", "com-liability"],
  clausePositions: [
    {
      id: "scopePosition",
      label: "Scope Flexibility",
      description: "How rigid is the service scope?",
      options: [
        { id: "provider-favourable", label: "Flexible Scope", description: "Change orders and scope adjustments at provider's discretion with client notice", favorability: "client" },
        { id: "balanced", label: "Defined Scope with Change Process", description: "Clear scope baseline; changes require mutual written agreement and pricing adjustment", favorability: "balanced" },
        { id: "client-favourable", label: "Fixed Scope + Penalties", description: "Strict scope obligations; provider pays penalties for under-delivery", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — MANAGED SERVICES SLA:
This is a managed services agreement for outsourced IT, operations, or support.

KEY DIFFERENCE FROM SaaS SLA:
- Managed services involve human delivery (staff, technicians, operators)
- SaaS is software delivery — managed services is people + process delivery
- Pricing is typically monthly retainer, not per-seat subscription
- Escalation paths and named contacts are critical

MANDATORY PROVISIONS:
1. Detailed service scope with in-scope and out-of-scope definitions
2. Staffing requirements (dedicated vs. shared resources)
3. Response times by severity level
4. Escalation matrix with named contacts
5. Change management process
6. Performance metrics and reporting
7. Knowledge transfer obligations
8. Transition assistance on termination (minimum 90 days)`,
};

const ENTERPRISE_LICENSING_SLA_CONFIG: AgreementConfig = {
  id: "enterprise-licensing-sla",
  partyLabels: {
    partyALabel: "Licensor (Software Company)",
    partyAPlaceholder: "Enterprise Software Inc.",
    partyBLabel: "Licensee (Enterprise Customer)",
    partyBPlaceholder: "Major Corporation Ltd.",
  },
  wizardSteps: ["com-service", "com-sla", "com-data", "com-liability"],
  clausePositions: [
    {
      id: "licensePosition",
      label: "License Grant",
      description: "What type of license is being granted?",
      options: [
        { id: "licensor-favourable", label: "Restricted License", description: "Named users only, single site, no modification rights, annual audit rights", favorability: "client" },
        { id: "balanced", label: "Standard Enterprise License", description: "Unlimited users within the organization, multi-site, read-only API access", favorability: "balanced" },
        { id: "licensee-favourable", label: "Broad Enterprise License", description: "Unlimited users + affiliates, modification/customization rights, source code escrow", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "auditPosition",
      label: "Compliance Auditing",
      description: "Can the licensor audit the licensee's usage?",
      options: [
        { id: "licensor-favourable", label: "Unrestricted Audit Rights", description: "Licensor can audit at any time with 5 business days notice", favorability: "client" },
        { id: "balanced", label: "Annual Audit with Notice", description: "One audit per year with 30 days notice during business hours", favorability: "balanced" },
        { id: "licensee-favourable", label: "Self-Reporting Only", description: "Licensee provides annual usage reports; no on-site audit without cause", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — ENTERPRISE LICENSING SLA:
This is an enterprise software licensing agreement with SLA commitments.

KEY DIFFERENCE FROM SaaS:
- License (not subscription) — may involve on-premise deployment
- Typically larger contract value with more complex liability framework
- Often involves customization, integration, and professional services
- Compliance auditing is a key negotiation point

MANDATORY PROVISIONS:
1. License grant scope (users, sites, affiliates, modification rights)
2. License restrictions (reverse engineering, sublicensing, competing products)
3. Fees and payment terms (license fee + maintenance/support fee)
4. Source code escrow (if applicable)
5. Implementation and professional services
6. SLA commitments (uptime, response times, service credits)
7. Audit rights and compliance verification
8. Indemnification (IP infringement, data breach)
9. Liability caps (typically larger than SaaS — often 2x annual fees)
10. Force majeure
11. Term and renewal (multi-year with auto-renewal is common)`,
};

// ──────────────────────────────────────────────
// PLATFORM & BUSINESS AGREEMENTS
// ──────────────────────────────────────────────

const TERMS_AND_CONDITIONS_CONFIG: AgreementConfig = {
  id: "terms-and-conditions",
  partyLabels: {
    partyALabel: "Platform Operator (Your Company)",
    partyAPlaceholder: "YourApp Inc.",
    partyBLabel: "End Users (as a class)",
    partyBPlaceholder: "Platform users / website visitors",
  },
  wizardSteps: ["plat-business", "plat-terms"],
  clausePositions: [
    {
      id: "liabilityPosition",
      label: "Liability Limitation",
      description: "How much liability does the platform accept for issues arising from use?",
      options: [
        { id: "platform-favourable", label: "Maximum Limitation", description: "Liability capped at fees paid in last 12 months; broad disclaimer of warranties", favorability: "client" },
        { id: "balanced", label: "Reasonable Limitation", description: "Liability capped at fees paid; carve-outs for gross negligence and willful misconduct", favorability: "balanced" },
        { id: "user-favourable", label: "Minimal Limitation", description: "Higher liability exposure; only excludes consequential damages", favorability: "counter-party" },
      ],
      defaultPosition: "platform-favourable",
    },
    {
      id: "contentPosition",
      label: "User Content & Licensing",
      description: "What rights does the platform get to user-generated content?",
      options: [
        { id: "platform-favourable", label: "Broad License", description: "Perpetual, irrevocable, worldwide license to use, modify, distribute, and sublicense user content", favorability: "client" },
        { id: "balanced", label: "Operational License", description: "Non-exclusive license to use content for platform operation and promotion; user retains ownership", favorability: "balanced" },
        { id: "user-favourable", label: "Minimal License", description: "Limited license only for displaying content on the platform; no sublicensing or off-platform use", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "modificationPosition",
      label: "Terms Modification",
      description: "How can the platform update these terms after users have accepted them?",
      options: [
        { id: "platform-favourable", label: "Unilateral with Email + Continued Use", description: "Platform can modify terms at any time; email notification sent; continued use after notice constitutes acceptance", favorability: "client" },
        { id: "balanced", label: "Unilateral with 30 Days Notice", description: "Platform can modify terms with 30 days advance notice; material changes highlighted; users can terminate before effective date", favorability: "balanced" },
        { id: "user-favourable", label: "Bilateral (Re-Acceptance Required)", description: "Material changes require users to affirmatively re-accept the updated terms — strongest user protection", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "governingLawPosition",
      label: "Governing Law",
      description: "Which jurisdiction's laws govern the terms?",
      options: [
        { id: "platform-favourable", label: "Platform's Home Province", description: "Laws of the platform operator's home province govern — simplest for the company to manage", favorability: "client" },
        { id: "balanced", label: "User's Province", description: "Laws of the user's home province govern — per Douez v. Facebook, more enforceable for consumer-facing platforms", favorability: "balanced" },
        { id: "user-favourable", label: "Federal Law Only", description: "Federal Canadian law governs (where applicable) — avoids provincial variation but limited scope", favorability: "counter-party" },
      ],
      defaultPosition: "platform-favourable",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — TERMS & CONDITIONS:
This is a platform terms of service / terms and conditions agreement.

CRITICAL LEGAL FRAMEWORK:
- Rudder v. Microsoft (1999): Clickwrap agreements are enforceable; browsewrap may not be
- Uber Technologies v. Heller (2020 SCC): Unconscionable arbitration clauses in standard form contracts are unenforceable
- Douez v. Facebook (2017 SCC): Forum selection clauses in consumer contracts must meet fairness test
- CASL: Any electronic messaging requires consent

PARTY DYNAMICS:
- Platform operator wants maximum protection: liability limits, broad content licenses, unilateral modification rights
- Users (as a class) need: clear terms, reasonable dispute resolution, privacy protections, ability to terminate

THIS IS NOT A NEGOTIATED CONTRACT — it's a unilateral document that must still be enforceable.

MANDATORY SECTIONS:
1. Acceptance mechanism and eligibility (age, jurisdiction)
2. Account creation, security, and termination
3. Acceptable use policy with specific prohibited conduct
4. User content license and takedown procedures
5. Platform IP rights and restrictions
6. Payment terms and refund policy (if e-commerce)
7. Privacy integration (reference to separate Privacy Policy)
8. Disclaimer of warranties (as-is, as-available)
9. Limitation of liability (capped, with carve-outs per Uber v. Heller)
10. Dispute resolution (arbitration with small claims carve-out per Seidel v. TELUS)
11. Modification clause (how the platform updates terms)
12. CASL compliance for commercial electronic messages
13. Quebec language requirements (if operating in Quebec)

ADDITIONAL CLAUSE POSITIONS:
- modificationPosition: Draft the modification clause per selection. If unilateral with continued use, include a clear "last updated" date and changelog reference. If bilateral, implement a click-through re-acceptance mechanism. Consider Uber v. Heller unconscionability principles.
- governingLawPosition: Draft governing law and jurisdiction clause per selection. If platform's home province, include a Douez v. Facebook risk acknowledgment for consumer-facing terms. If user's province, address conflict-of-laws implications.`,
};

const PRIVACY_POLICY_CONFIG: AgreementConfig = {
  id: "privacy-policy",
  partyLabels: {
    partyALabel: "Organization (Data Controller)",
    partyAPlaceholder: "YourApp Inc.",
    partyBLabel: "Individuals (Data Subjects)",
    partyBPlaceholder: "Users / customers / visitors",
  },
  wizardSteps: ["plat-business"],
  clausePositions: [
    {
      id: "consentPosition",
      label: "Consent Framework",
      description: "How does the organization obtain consent for data collection?",
      options: [
        { id: "org-favourable", label: "Implied Consent Where Possible", description: "Use implied consent for non-sensitive data; express consent only where legally required", favorability: "client" },
        { id: "balanced", label: "Express Consent Standard", description: "Express consent for personal info; implied for non-identifiable analytics data", favorability: "balanced" },
        { id: "user-favourable", label: "Opt-In Everything", description: "Granular opt-in consent for each data use purpose — highest privacy standard", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "retentionPosition",
      label: "Data Retention",
      description: "How long does the organization keep personal information?",
      options: [
        { id: "org-favourable", label: "Retain Until No Longer Needed", description: "Broad retention — organization determines when data is no longer needed", favorability: "client" },
        { id: "balanced", label: "Defined Retention Periods", description: "Specific retention periods by data type (e.g., account data: duration + 2 years, analytics: 12 months)", favorability: "balanced" },
        { id: "user-favourable", label: "Minimum Retention + Auto-Delete", description: "Shortest legally permissible retention with automatic deletion and user-triggered deletion rights", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "thirdPartyPosition",
      label: "Third-Party Data Sharing",
      description: "How broadly does the organization share personal information with third parties?",
      options: [
        { id: "org-favourable", label: "Broad Sharing", description: "Share with advertising networks, data brokers, and marketing partners for targeted advertising and revenue", favorability: "client" },
        { id: "balanced", label: "Moderate Sharing", description: "Share with analytics providers and marketing platforms for service improvement and communication — no data brokers", favorability: "balanced" },
        { id: "user-favourable", label: "Minimal Sharing", description: "Share only with essential service providers (hosting, payment processing) under strict data processing agreements", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "internationalTransferPosition",
      label: "International Data Transfers",
      description: "Can personal information be transferred or stored outside Canada?",
      options: [
        { id: "org-favourable", label: "Transfers with Adequacy Determination", description: "Transfers permitted to countries with adequate privacy protection as determined by the organization", favorability: "client" },
        { id: "balanced", label: "Transfers with Contractual Safeguards", description: "International transfers permitted only with binding contractual safeguards (data processing agreements) ensuring Canadian-equivalent protection", favorability: "balanced" },
        { id: "user-favourable", label: "No Transfers Outside Canada", description: "All personal information stored and processed exclusively within Canada — data residency commitment", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "breachNotificationPosition",
      label: "Breach Notification Timeline",
      description: "How quickly will affected individuals be notified of a data breach?",
      options: [
        { id: "org-favourable", label: "As Soon as Practicable", description: "Notification as soon as practicable after assessment — allows time for investigation and remediation before disclosure", favorability: "client" },
        { id: "balanced", label: "72 Hours (PIPEDA Standard)", description: "Notification within 72 hours of determining a breach poses a real risk of significant harm — PIPEDA standard", favorability: "balanced" },
        { id: "user-favourable", label: "24 Hours", description: "Notification within 24 hours of breach discovery — most aggressive commitment, above regulatory minimum", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — PRIVACY POLICY:
This is a PIPEDA-compliant privacy policy, NOT a contract.

CRITICAL LEGAL FRAMEWORK:
- PIPEDA: Federal privacy law — 10 Fair Information Principles
- CASL: Anti-spam legislation — consent for commercial electronic messages
- Quebec Law 25 (new): Mandatory privacy impact assessments, data breach reporting, designated privacy officer
- Provincial laws: Alberta PIPA, BC PIPA may apply
- If international users: GDPR (EU) and CCPA (California) provisions may be needed

THIS IS A LEGAL DISCLOSURE, NOT A CONTRACT:
- Must be written in PLAIN LANGUAGE (PIPEDA Principle 8: Openness)
- Must be ACCESSIBLE (posted on website, available on request)
- Must accurately reflect ACTUAL data practices

MANDATORY SECTIONS (PIPEDA 10 Principles):
1. Accountability: Named privacy officer / DPO
2. Identifying purposes: Why each type of data is collected
3. Consent: How consent is obtained and withdrawn
4. Limiting collection: Only collect what's necessary
5. Limiting use, disclosure, retention: How data is used and when deleted
6. Accuracy: How individuals can correct their data
7. Safeguards: Security measures protecting personal information
8. Openness: This policy itself satisfies this principle
9. Individual access: Right to access personal information held
10. Challenging compliance: How to complain

ADDITIONAL SECTIONS IF APPLICABLE:
- Cookies and tracking technologies
- Third-party service providers and data sharing
- International data transfers (if data leaves Canada)
- Children's privacy (if applicable)
- Data breach notification procedures
- Quebec-specific requirements (if operating in Quebec)

ADDITIONAL CLAUSE POSITIONS:
- thirdPartyPosition: Draft the third-party sharing section per selection. If broad, list categories of recipients and purposes. If minimal, name specific service providers and require DPAs. Always include a mechanism for users to opt out of non-essential sharing.
- internationalTransferPosition: If transfers permitted, specify the countries and safeguards. If Canada-only, include a data residency commitment with server location disclosure. Consider GDPR adequacy implications for EU users.
- breachNotificationPosition: Draft the breach notification section per selection. Specify what information the notification will include (nature of breach, data affected, remediation steps, contact information). If 24 hours, distinguish between discovery and confirmation of breach.`,
};

const PARTNERSHIP_AGREEMENT_CONFIG: AgreementConfig = {
  id: "partnership-agreement",
  partyLabels: {
    partyALabel: "Partner A (Managing Partner)",
    partyAPlaceholder: "Jane Partner",
    partyBLabel: "Partner B",
    partyBPlaceholder: "John Partner",
  },
  wizardSteps: ["plat-structure", "corp-deadlock"],
  clausePositions: [
    {
      id: "managementPosition",
      label: "Management Authority",
      description: "Who makes day-to-day business decisions?",
      options: [
        { id: "partner-a-leads", label: "Managing Partner Model", description: "Partner A handles daily operations; major decisions require both partners", favorability: "client" },
        { id: "equal-management", label: "Equal Management", description: "All partners participate equally in management decisions", favorability: "balanced" },
        { id: "committee", label: "Management Committee", description: "Formal committee structure with defined authority levels", favorability: "balanced" },
      ],
      defaultPosition: "equal-management",
    },
    {
      id: "liabilityPosition",
      label: "Partner Liability",
      description: "How is liability shared among partners?",
      options: [
        { id: "joint-several", label: "Joint and Several", description: "Each partner is fully liable for all partnership debts — standard for general partnerships", favorability: "balanced" },
        { id: "proportional", label: "Proportional to Ownership", description: "Partners liable only in proportion to their ownership share (requires LLP registration)", favorability: "balanced" },
        { id: "limited", label: "Limited Liability", description: "Limited partners have liability capped at their capital contribution (requires LP registration)", favorability: "counter-party" },
      ],
      defaultPosition: "joint-several",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — PARTNERSHIP AGREEMENT:
This is a business partnership agreement for partners who have NOT incorporated.

CRITICAL LEGAL CONTEXT:
- Without a written agreement, provincial Partnership Acts fill the gaps with DEFAULT RULES that may not match what the partners actually want
- General partnerships create JOINT AND SEVERAL LIABILITY — each partner is personally liable for ALL partnership debts
- Partnership income flows through to individual partners for tax purposes

PARTY DYNAMICS:
- Partners may have equal or unequal contributions (capital, skills, time, connections)
- Both want clear rules before money starts flowing
- Exit provisions are critical — partnerships are harder to unwind than corporations

MANDATORY PROVISIONS:
1. Partnership name and business purpose
2. Capital contributions (cash, property, services)
3. Profit and loss allocation (may differ from ownership)
4. Drawing rights and salary/guaranteed payments
5. Management structure and decision-making authority
6. Banking and financial controls
7. Non-competition during partnership
8. Admission of new partners
9. Withdrawal / retirement of partners
10. Death, disability, or bankruptcy of a partner
11. Dissolution and winding up
12. Dispute resolution`,
};

const MSA_CONFIG: AgreementConfig = {
  id: "master-services-agreement",
  partyLabels: {
    partyALabel: "Service Provider (Your Company)",
    partyAPlaceholder: "Dev Agency Inc.",
    partyBLabel: "Client",
    partyBPlaceholder: "Enterprise Client Corp.",
  },
  wizardSteps: ["plat-structure", "com-liability"],
  clausePositions: [
    {
      id: "ipPosition",
      label: "IP Ownership",
      description: "Who owns the work product created under each SOW?",
      options: [
        { id: "provider-favourable", label: "Provider Retains IP", description: "Provider owns all IP; client gets a perpetual, non-exclusive license to deliverables", favorability: "client" },
        { id: "balanced", label: "Client Owns Deliverables, Provider Keeps Tools", description: "Client owns custom work product; provider retains pre-existing tools, frameworks, and methodologies", favorability: "balanced" },
        { id: "client-favourable", label: "Client Owns Everything", description: "All IP (including tools and methods used) assigned to client — work-for-hire approach", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "paymentPosition",
      label: "Payment Terms",
      description: "When and how does the provider get paid?",
      options: [
        { id: "provider-favourable", label: "Upfront + Milestones", description: "50% upfront, balance on milestones. Provider has security; client has less leverage.", favorability: "client" },
        { id: "balanced", label: "Net 30 on Milestones", description: "Payment due 30 days after milestone completion and client acceptance", favorability: "balanced" },
        { id: "client-favourable", label: "Net 60 on Completion", description: "Payment due 60 days after final delivery and acceptance. Client holds all leverage.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "warrantyPosition",
      label: "Warranty Period",
      description: "How long does the provider warrant that deliverables will be free from material defects?",
      options: [
        { id: "provider-favourable", label: "30 Days Post-Delivery", description: "Short warranty — provider fixes defects for 30 days after acceptance, then all warranties expire", favorability: "client" },
        { id: "balanced", label: "90 Days Post-Delivery", description: "Standard warranty period — provider corrects material defects discovered within 90 days of acceptance", favorability: "balanced" },
        { id: "client-favourable", label: "12 Months Post-Delivery", description: "Extended warranty — provider responsible for defects for a full year after delivery", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "indemnificationPosition",
      label: "Indemnification",
      description: "Who indemnifies whom for third-party claims?",
      options: [
        { id: "provider-favourable", label: "Client Indemnifies for Content/Data", description: "Client indemnifies provider for all claims arising from client-provided content, data, or specifications", favorability: "client" },
        { id: "balanced", label: "Mutual Indemnification", description: "Provider indemnifies for IP infringement and negligence; client indemnifies for content/data and specifications", favorability: "balanced" },
        { id: "client-favourable", label: "Provider Indemnifies for IP + Negligence", description: "Provider broadly indemnifies for IP infringement, professional negligence, and breach of confidentiality", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "terminationPosition",
      label: "MSA Termination",
      description: "How can either party terminate the master agreement (not individual SOWs)?",
      options: [
        { id: "provider-favourable", label: "For Cause Only", description: "MSA can only be terminated for material breach with cure period — protects ongoing revenue relationship", favorability: "client" },
        { id: "balanced", label: "Either Party 90 Days Notice", description: "Either party can terminate the MSA with 90 days written notice — existing SOWs continue to completion", favorability: "balanced" },
        { id: "client-favourable", label: "Either Party 30 Days Notice", description: "Either party can terminate with 30 days notice — maximum flexibility, existing SOWs may be terminated concurrently", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — MASTER SERVICES AGREEMENT:
This is a framework agreement governing an ongoing client relationship with individual SOWs.

PARTY DYNAMICS:
- Provider wants to standardize terms across multiple engagements to avoid renegotiating every time
- Client wants flexibility to scope individual projects without being locked into unfavorable master terms
- The MSA + SOW structure lets both parties agree on "the rules" once, then just negotiate scope and price per project

MANDATORY MSA PROVISIONS:
1. Master terms that apply to all SOWs
2. SOW template with required fields (scope, timeline, fees, acceptance criteria)
3. Order of precedence (SOW terms override MSA on conflict? Or vice versa?)
4. Change order process for SOW modifications
5. Acceptance testing and deemed acceptance
6. IP ownership framework (per position selected)
7. Confidentiality (mutual)
8. Payment terms (per position selected)
9. Warranty period for deliverables
10. Liability caps (per SOW or aggregate)
11. Indemnification (IP infringement, third-party claims)
12. Termination (MSA termination vs. individual SOW termination)
13. Non-solicitation of personnel (mutual)

ADDITIONAL CLAUSE POSITIONS:
- warrantyPosition: Draft warranty clause per selection. Specify the warranty remedy (re-performance, repair, or refund). Include an exclusion for defects caused by client modifications or misuse.
- indemnificationPosition: Draft indemnification framework per selection. Include defense obligation, settlement control, and cooperation requirements. Cap indemnification at the aggregate fees paid under the MSA or the relevant SOW.
- terminationPosition: Distinguish between MSA termination and SOW termination. Specify what happens to active SOWs when the MSA terminates (wind down, immediate stop, or complete existing SOWs). Address payment for work performed through termination date.`,
};

// ──────────────────────────────────────────────
// INFLUENCER / CREATOR AGREEMENT
// ──────────────────────────────────────────────

const INFLUENCER_CONFIG: AgreementConfig = {
  id: "influencer-agreement",
  partyLabels: {
    partyALabel: "Brand / Company",
    partyAPlaceholder: "AwesomeBrand Inc.",
    partyBLabel: "Influencer / Content Creator",
    partyBPlaceholder: "Jane Creator (@janecreates)",
  },
  wizardSteps: ["inf-campaign", "inf-deliverables", "inf-rights", "inf-terms", "inf-compliance"],
  clausePositions: [
    {
      id: "contentApprovalPosition",
      label: "Content Approval & Creative Control",
      description: "How much control does the brand have over the influencer's content before it goes live?",
      options: [
        { id: "brand-favourable", label: "Full Brand Approval", description: "All content submitted 5 days pre-publication; brand has sole discretion; unlimited revision rounds; post-publication removal within 24 hours", favorability: "client" },
        { id: "balanced", label: "Reasonable Approval", description: "Submit 3-5 days before; brand approval within 2-3 days, not unreasonably withheld; reasonable modifications only", favorability: "balanced" },
        { id: "influencer-favourable", label: "Creator Controls", description: "Influencer retains full editorial control; no pre-approval required; post-publication removal only for false/defamatory statements", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "ipOwnershipPosition",
      label: "Content Ownership & IP",
      description: "Who owns the content the influencer creates? This is the #1 negotiation point in influencer deals.",
      options: [
        { id: "brand-favourable", label: "Full Assignment to Brand", description: "All rights/copyrights assigned upon creation; moral rights waived; brand may edit, sublicense, create derivatives perpetually; includes Web3/NFT rights", favorability: "client" },
        { id: "balanced", label: "License to Brand", description: "Influencer retains copyright; grants brand non-exclusive 12-month license; minor edits for formatting; attribution maintained; no sublicensing without payment", favorability: "balanced" },
        { id: "influencer-favourable", label: "Creator Retains Everything", description: "Influencer retains full copyright; limited license for 12 months; brand cannot edit/modify; moral rights retained; content removed within 30 days of termination", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "exclusivityPosition",
      label: "Exclusivity & Non-Compete",
      description: "Can the influencer work with competing brands during or after the campaign?",
      options: [
        { id: "brand-favourable", label: "Broad Exclusivity", description: "During term + 12-24 months post-term; industry-wide competitor restriction; violation = liquidated damages + injunctive relief", favorability: "client" },
        { id: "balanced", label: "Reasonable Exclusivity", description: "During term only for direct competitors; 6-12 months post-term for direct competitors only; may promote complementary products", favorability: "balanced" },
        { id: "influencer-favourable", label: "Minimal Restrictions", description: "No exclusive promotion of competitors during term only; no post-term non-compete; retains right to work with brands in different verticals", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "performancePosition",
      label: "Performance Metrics & Accountability",
      description: "Is the influencer held to specific engagement/reach targets?",
      options: [
        { id: "brand-favourable", label: "Strict KPIs", description: "Minimum engagement rate, reach, and conversion targets; failure = payment reduction, additional content, or termination right", favorability: "client" },
        { id: "balanced", label: "Benchmark-Based", description: "Targets tied to influencer's historical averages; if falls below threshold, parties meet to review; limited remedies", favorability: "balanced" },
        { id: "influencer-favourable", label: "Best Efforts", description: "Acknowledges algorithm factors beyond influencer's control; no metric-based liability or payment reduction", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "moralsClausePosition",
      label: "Morals Clause",
      description: "When can the brand terminate based on the influencer's personal conduct?",
      options: [
        { id: "brand-favourable", label: "Broad Morals Clause", description: "Brand may terminate immediately for any conduct that in brand's sole discretion reflects negatively; no cure period", favorability: "client" },
        { id: "balanced", label: "Reasonable Morals Clause", description: "Termination for felony conviction or public conduct materially harming brand; 10 business days to cure; brand provides written explanation", favorability: "balanced" },
        { id: "influencer-favourable", label: "Narrow Morals Clause", description: "Limited to criminal conviction or deliberate brand defamation; 15 days to respond; social/political expression excluded", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "liabilityCapPosition",
      label: "Liability Cap",
      description: "What is the maximum liability the influencer can face under the agreement?",
      options: [
        { id: "brand-favourable", label: "Unlimited for Certain Claims", description: "Liability capped at fees paid for general claims, but unlimited for IP infringement, confidentiality breach, and disclosure non-compliance", favorability: "client" },
        { id: "balanced", label: "2x Fees Paid", description: "Influencer's total liability capped at twice the total fees paid under the agreement", favorability: "balanced" },
        { id: "influencer-favourable", label: "Total Fees Paid", description: "Influencer's maximum liability limited to total fees actually paid — lowest risk for creator", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "forceRejectionPosition",
      label: "Brand's Content Rejection Rights",
      description: "How many times can the brand reject and request revisions to submitted content?",
      options: [
        { id: "brand-favourable", label: "Unlimited Rejection", description: "Brand can reject content unlimited times until satisfied — creator must revise at no additional cost", favorability: "client" },
        { id: "balanced", label: "Max 2 Rejections Then Deemed Approved", description: "Brand may request up to 2 rounds of revisions; if not approved after the second revision, content is deemed approved", favorability: "balanced" },
        { id: "influencer-favourable", label: "No Rejection Right", description: "Brand provides a brief; influencer creates content with full creative control; no rejection right once brief is followed", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "postTermRightsPosition",
      label: "Content Rights After Termination",
      description: "What happens to published content when the agreement ends?",
      options: [
        { id: "brand-favourable", label: "Perpetual License for Existing Posts", description: "Brand retains a perpetual, royalty-free license to all content created during the term — posts stay up indefinitely", favorability: "client" },
        { id: "balanced", label: "Content Stays but No New Use", description: "Existing posts remain live but brand cannot repurpose, boost, or create derivatives from the content after termination", favorability: "balanced" },
        { id: "influencer-favourable", label: "All Content Removed Within 30 Days", description: "All branded content must be removed from all platforms within 30 days of termination — clean break", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — INFLUENCER / CREATOR AGREEMENT:
This is an influencer marketing agreement between a brand and a content creator.

CRITICAL COMPLIANCE — Competition Act s.52:
- ALL material connections between influencer and brand MUST be disclosed clearly and conspicuously
- June 2024 amendments: strict liability, penalties up to CAD 15M for corporations
- Non-compliant disclosure = criminal liability under s.52(1) or civil liability under s.74.01
- Platform-specific disclosure requirements: #ad in first 50 chars on Instagram, first 30 chars on TikTok, first 30 seconds on YouTube

PARTY DYNAMICS:
- Brand wants: content control, broad IP rights, metric accountability, exclusivity, and the ability to terminate for brand-damaging conduct
- Influencer wants: creative freedom, IP retention, fair compensation, minimal exclusivity, and protection against arbitrary termination
- The agreement must balance brand protection with influencer authenticity — over-controlling content defeats the purpose of influencer marketing

MANDATORY PROVISIONS:
1. Deliverables: Specific platforms, content types, frequency, technical specs (reference Exhibit A)
2. Performance metrics: KPIs with measurement methods and cure periods (reference Exhibit B)
3. Public disclosure: Platform-specific disclosure templates compliant with Competition Bureau + ASC (reference Exhibit C)
4. Content approval process and timeline
5. IP ownership and moral rights (per position selected — Copyright Act s.14.1 requires explicit waiver)
6. Republication and editing rights
7. Compensation: Fee structure, payment timing, expense policy, GST/HST obligations
8. Exclusivity and competitor restrictions
9. Confidentiality (brand strategy, unreleased products)
10. Term, renewal, and termination (including morals clause)
11. Independent contractor status (per Wiebe Door 4-factor test — misclassification = CRA reassessment)
12. Representations and warranties (audience authenticity, no bot followers)
13. Indemnification (IP clearance, disclosure compliance, defamation)
14. Insurance requirements (if applicable)

CONDITIONAL REGULATORY CLAUSES:
- IF iGaming/alcohol → add AGCO s.2.03 minor appeal restriction
- IF US audience > 5% → add FTC Endorsement Guides compliance
- IF influencer collects personal data → add PIPEDA/CASL consent clauses
- IF Quebec audience → add French language requirements
- IF health/supplement claims → add Therapeutic Products Directorate substantiation
- IF AI-generated content → add CCCS GenAI disclosure requirements

ADDITIONAL CLAUSE POSITIONS:
- liabilityCapPosition: Draft liability limitation per selection. If unlimited for certain claims, enumerate the carve-out categories precisely. Ensure the cap is commercially reasonable relative to the deal value.
- forceRejectionPosition: Draft the content approval and rejection process per selection. If max 2 rejections, specify what constitutes a "rejection" vs. a "minor comment." Include deemed approval timeline if brand fails to respond within the review period.
- postTermRightsPosition: Draft post-termination content rights per selection. If removal required, specify the takedown process by platform. If perpetual license, clarify whether brand can continue to boost/advertise using the content. Address FTC/Competition Act disclosure obligations on historical posts.`,
};

// ──────────────────────────────────────────────
// CONFIG LOOKUP MAP
// ──────────────────────────────────────────────

export const AGREEMENT_CONFIGS: Record<string, AgreementConfig> = {
  // Employment
  "standard-employment": STANDARD_EMPLOYMENT_CONFIG,
  "fixed-term": FIXED_TERM_EMPLOYMENT_CONFIG,
  "fixed-term-employment": FIXED_TERM_EMPLOYMENT_CONFIG,
  "contractor": CONTRACTOR_CONFIG,
  "non-compete": NON_COMPETE_CONFIG,
  "executive-employment": EXECUTIVE_EMPLOYMENT_CONFIG,
  "ip-assignment": IP_ASSIGNMENT_CONFIG,
  "standard-nda": STANDARD_NDA_CONFIG,
  // Corporate
  "two-party-usa": TWO_PARTY_SHA_CONFIG,
  "two-party-sha": TWO_PARTY_SHA_CONFIG,
  "emerging-corp-usa": STARTUP_SHA_CONFIG,
  "startup-sha": STARTUP_SHA_CONFIG,
  "jv-usa": JOINT_VENTURE_CONFIG,
  "joint-venture": JOINT_VENTURE_CONFIG,
  "pe-backed-usa": INVESTOR_PE_CONFIG,
  "investor-pe-backed": INVESTOR_PE_CONFIG,
  "deadlock-usa": FIFTY_FIFTY_CONFIG,
  "fifty-fifty": FIFTY_FIFTY_CONFIG,
  "articles-incorporation": INCORPORATION_CONFIG,
  "articles-of-incorporation": INCORPORATION_CONFIG,
  // Investment & Lending
  "safe-agreement": SAFE_CONFIG,
  "convertible-note": CONVERTIBLE_NOTE_CONFIG,
  "bilateral-loan": BILATERAL_LOAN_CONFIG,
  "demand-note": DEMAND_NOTE_CONFIG,
  "revolving-credit": REVOLVING_CREDIT_CONFIG,
  // Commercial
  "saas-sla": SAAS_SLA_CONFIG,
  "managed-services-sla": MANAGED_SERVICES_SLA_CONFIG,
  "enterprise-sla": ENTERPRISE_LICENSING_SLA_CONFIG,
  "enterprise-licensing-sla": ENTERPRISE_LICENSING_SLA_CONFIG,
  // Platform
  "terms-and-conditions": TERMS_AND_CONDITIONS_CONFIG,
  "privacy-policy": PRIVACY_POLICY_CONFIG,
  "partnership-agreement": PARTNERSHIP_AGREEMENT_CONFIG,
  "master-services-agreement": MSA_CONFIG,
  // Creator
  "influencer-agreement": INFLUENCER_CONFIG,
};

/** Get the config for a specific agreement, or null if not found */
export function getAgreementConfig(agreementId: string): AgreementConfig | null {
  return AGREEMENT_CONFIGS[agreementId] || null;
}

/** Get the party labels for a set of selected agreements. If multiple agreements, merge intelligently. */
export function getPartyLabels(agreementIds: string[]): { partyALabel: string; partyAPlaceholder: string; partyBLabel: string; partyBPlaceholder: string } {
  if (agreementIds.length === 0) {
    return { partyALabel: "Party A", partyAPlaceholder: "Company Name", partyBLabel: "Party B", partyBPlaceholder: "Other Party" };
  }
  if (agreementIds.length === 1) {
    const config = AGREEMENT_CONFIGS[agreementIds[0]];
    if (config) return config.partyLabels;
  }
  // Multiple agreements: use the first agreement's labels as primary
  const primary = AGREEMENT_CONFIGS[agreementIds[0]];
  if (primary) return primary.partyLabels;
  return { partyALabel: "Party A", partyAPlaceholder: "Company Name", partyBLabel: "Party B", partyBPlaceholder: "Other Party" };
}

/** Get all unique wizard steps needed for a set of agreements */
export function getWizardSteps(agreementIds: string[]): string[] {
  const stepSet = new Set<string>();
  for (const id of agreementIds) {
    const config = AGREEMENT_CONFIGS[id];
    if (config) {
      for (const step of config.wizardSteps) {
        stepSet.add(step);
      }
    }
  }
  // Return in a logical order
  const ORDER = [
    "emp-comp", "emp-clause", "emp-covenant", "emp-ip",
    "corp-shareholders", "corp-governance", "corp-transfer", "corp-deadlock",
    "inv-terms", "inv-conversion", "inv-info",
    "com-service", "com-sla", "com-data", "com-liability",
    "plat-business", "plat-terms", "plat-structure",
    "inf-campaign", "inf-deliverables", "inf-rights", "inf-terms", "inf-compliance",
  ];
  return ORDER.filter((s) => stepSet.has(s));
}

/** Get all clause positions for a set of agreements */
export function getClausePositions(agreementIds: string[]): ClausePosition[] {
  const seen = new Set<string>();
  const positions: ClausePosition[] = [];
  for (const id of agreementIds) {
    const config = AGREEMENT_CONFIGS[id];
    if (config) {
      for (const cp of config.clausePositions) {
        if (!seen.has(cp.id)) {
          seen.add(cp.id);
          positions.push(cp);
        }
      }
    }
  }
  return positions;
}

/** Get the combined drafting instructions for a set of agreements */
export function getDraftingInstructions(agreementIds: string[]): string {
  return agreementIds
    .map((id) => AGREEMENT_CONFIGS[id]?.draftingInstructions || "")
    .filter(Boolean)
    .join("\n\n---\n\n");
}
