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
  /** Estimated time in seconds the AI will take to generate this agreement */
  estimatedGenerationTime?: number;
  /** Wizard input fields that are mandatory before generation can proceed */
  requiredFields?: string[];
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
  estimatedGenerationTime: 30,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "startDate", "baseSalary"],
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
    {
      id: "vacationPosition",
      label: "Vacation Entitlement",
      description: "How much paid vacation does the employee receive annually?",
      options: [
        { id: "employer-favourable", label: "ESA Minimum (2 Weeks)", description: "Statutory minimum of 2 weeks / 4% vacation pay — lowest cost to employer, meets bare legal requirements", favorability: "client" },
        { id: "balanced", label: "Market Standard (3 Weeks)", description: "Three weeks paid vacation — competitive for mid-level hires and standard in most Canadian industries", favorability: "balanced" },
        { id: "employee-favourable", label: "Enhanced (4+ Weeks)", description: "Four or more weeks paid vacation — strongest talent attraction, common for senior or hard-to-fill roles", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "severanceFormulaPosition",
      label: "Severance Formula",
      description: "What formula determines severance on termination without cause?",
      options: [
        { id: "employer-favourable", label: "ESA Minimums Only", description: "Statutory minimum severance and termination pay under the ESA — 1 week per year of service (capped at 26 weeks) plus termination notice", favorability: "client" },
        { id: "balanced", label: "Enhanced Formula (2 Weeks/Year, 12-Month Cap)", description: "Two weeks' base salary per year of service, capped at 12 months — provides certainty for both parties and exceeds ESA minimums", favorability: "balanced" },
        { id: "employee-favourable", label: "Bardal Factors (Uncapped)", description: "Reasonable notice determined by Bardal factors (age, length of service, character of employment, availability of similar employment) — no contractual cap, court determines the amount", favorability: "counter-party" },
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
- workLocationPosition: If remote rights are granted, address equipment provision, expense reimbursement, and the employer's right to recall with notice.
- vacationPosition: Draft vacation entitlement clause matching selection. If ESA minimum, reference the applicable ESA section and vacation pay calculation (4% for first 5 years, 6% after 5 years in Ontario). If enhanced, specify whether unused vacation carries over or is paid out annually, and address vacation scheduling approval process.
- severanceFormulaPosition: Draft severance clause per selection. If ESA minimums, ensure the clause explicitly references the statutory formula and does NOT attempt to contract below it (per Waksdale). If enhanced formula, specify the calculation clearly (base salary only vs. total compensation including bonus). If Bardal factors, the agreement should NOT cap reasonable notice — instead, it defers to common law. Include interaction with the termination clause and any mitigation obligations.`,
};

const FIXED_TERM_EMPLOYMENT_CONFIG: AgreementConfig = {
  id: "fixed-term-employment",
  partyLabels: {
    partyALabel: "Employer (Company)",
    partyAPlaceholder: "Maple Leaf Corp.",
    partyBLabel: "Fixed-Term Employee",
    partyBPlaceholder: "John Doe",
  },
  estimatedGenerationTime: 35,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "startDate", "endDate", "baseSalary"],
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
  estimatedGenerationTime: 35,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "scopeOfWork", "feeStructure"],
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
    {
      id: "paymentTermsPosition",
      label: "Payment Terms",
      description: "When and how does the contractor get paid?",
      options: [
        { id: "client-favourable", label: "Net 30", description: "Payment due 30 calendar days after receipt of invoice — standard corporate accounts payable cycle", favorability: "client" },
        { id: "balanced", label: "Net 15", description: "Payment due 15 calendar days after receipt of invoice — faster cash flow for the contractor", favorability: "balanced" },
        { id: "contractor-favourable", label: "Upon Delivery", description: "Payment due immediately upon delivery and acceptance of each milestone or deliverable", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "liabilityCapPosition",
      label: "Liability Cap",
      description: "What is the maximum liability the contractor can face under the agreement?",
      options: [
        { id: "client-favourable", label: "No Cap", description: "Contractor's liability is uncapped — full exposure for all claims arising from the engagement", favorability: "client" },
        { id: "balanced", label: "Cap at Fees Paid", description: "Contractor's total liability capped at the aggregate fees paid under the agreement — standard commercial term", favorability: "balanced" },
        { id: "contractor-favourable", label: "Cap at 2x Fees for Current SOW", description: "Liability capped at twice the fees paid under the current statement of work — limits exposure to the specific engagement", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "exclusivityPosition",
      label: "Exclusivity",
      description: "Is the contractor restricted from working for others during the engagement?",
      options: [
        { id: "client-favourable", label: "Exclusive Engagement", description: "Contractor works exclusively for the client during the term — WARNING: increases misclassification risk under Wiebe Door integration test", favorability: "client" },
        { id: "balanced", label: "Non-Exclusive with Competitor Restriction", description: "Contractor may work for others but not for direct competitors of the client during the term", favorability: "balanced" },
        { id: "contractor-favourable", label: "Fully Non-Exclusive", description: "Contractor may work for any other clients without restriction — strongest indicator of true independent contractor status", favorability: "counter-party" },
      ],
      defaultPosition: "contractor-favourable",
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
- insurancePosition: If comprehensive, require certificates of insurance naming client as additional insured before work begins. If none, include a waiver of claims clause.
- paymentTermsPosition: Draft payment clause per selection. Include invoice requirements (format, detail, submission method), late payment interest (per Interest Act, expressed as annual rate), and any holdback provisions for disputed amounts. If upon delivery, define acceptance criteria clearly to avoid payment disputes. Specify GST/HST treatment explicitly.
- liabilityCapPosition: Draft liability limitation clause per selection. If uncapped, include consequential damages waiver as partial protection. If capped at fees paid, specify whether the cap applies per-claim or in aggregate. Carve out fraud, willful misconduct, and IP infringement from any cap. Address interaction with indemnification obligations.
- exclusivityPosition: Draft exclusivity clause per selection. WARNING: If exclusive engagement is selected, include a prominent drafting note that exclusivity is a strong indicator of employment under the Wiebe Door integration test — the client should understand the misclassification risk. If non-exclusive with competitor restriction, define "direct competitor" precisely. If fully non-exclusive, reinforce the independent contractor relationship language.`,
};

const NON_COMPETE_CONFIG: AgreementConfig = {
  id: "non-compete",
  estimatedGenerationTime: 30,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "employeeRole"],
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
  estimatedGenerationTime: 55,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "executiveTitle", "baseSalary", "bonusStructure"],
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
    {
      id: "severanceMultiplierPosition",
      label: "Severance Multiplier",
      description: "What multiple of base compensation does the executive receive on termination without cause?",
      options: [
        { id: "employer-favourable", label: "12 Months Base Salary", description: "One year of base salary only — no bonus or benefits continuation. Lowest cost to the corporation.", favorability: "client" },
        { id: "balanced", label: "18 Months Total Compensation", description: "Eighteen months of base salary plus pro-rated bonus target and benefits continuation — standard for senior executives in Canadian markets", favorability: "balanced" },
        { id: "employee-favourable", label: "24 Months Total Compensation + Equity", description: "Twenty-four months of base salary, bonus target, benefits, and continued equity vesting — maximum executive protection, typically reserved for CEO-level hires", favorability: "counter-party" },
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
- disputeResolutionPosition: If arbitration, specify the arbitral institution (e.g., ADR Institute of Canada), number of arbitrators, and seat. If mediation-then-arbitration, specify the mediation period (e.g., 30 days) before escalation.
- severanceMultiplierPosition: Draft the severance multiplier clause per selection. Specify whether the multiplier applies to base salary only or total compensation (base + target bonus + benefits value). If 24 months with equity, address interaction with the equityAccelerationPosition to avoid double-counting of vesting acceleration. Include a release requirement (mutual release of claims) as a condition of receiving the severance payment. Reference Honda Canada v. Keays on the enforceability of pre-negotiated severance amounts.`,
};

const IP_ASSIGNMENT_CONFIG: AgreementConfig = {
  id: "ip-assignment",
  partyLabels: {
    partyALabel: "Assignee (Company Receiving IP)",
    partyAPlaceholder: "Acme Technologies Inc.",
    partyBLabel: "Assignor (Person Transferring IP)",
    partyBPlaceholder: "Jane Creator / Dev Studio Ltd.",
  },
  estimatedGenerationTime: 25,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "ipDescription"],
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
  estimatedGenerationTime: 20,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "purposeOfDisclosure"],
  wizardSteps: ["plat-terms"],
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
    {
      id: "scopeDefinitionPosition",
      label: "Confidential Information Scope",
      description: "How broadly is 'Confidential Information' defined?",
      options: [
        { id: "discloser-favourable", label: "Broad Definition", description: "All information disclosed in any form, whether marked confidential or not — broadest protection but harder to administer", favorability: "client" },
        { id: "balanced", label: "Marked or Designated", description: "Written information must be marked 'Confidential'; oral disclosures must be confirmed in writing within 10 business days — clear boundaries", favorability: "balanced" },
        { id: "recipient-favourable", label: "Specifically Identified Only", description: "Only information listed in a schedule or specifically identified at the time of disclosure — narrowest scope, easiest for recipient", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "permittedDisclosurePosition",
      label: "Permitted Disclosures",
      description: "Who can the receiving party share confidential information with?",
      options: [
        { id: "discloser-favourable", label: "Direct Employees Only", description: "Confidential information may only be shared with the receiving party's direct employees on a strict need-to-know basis", favorability: "client" },
        { id: "balanced", label: "Representatives (Employees, Advisors, Directors)", description: "May share with employees, directors, officers, and professional advisors (lawyers, accountants) who are bound by confidentiality obligations", favorability: "balanced" },
        { id: "recipient-favourable", label: "Affiliates and Subcontractors", description: "May share with affiliates, subsidiaries, subcontractors, and professional advisors — broadest sharing rights, subject to each being bound by equivalent confidentiality", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "returnDestructionPosition",
      label: "Return or Destruction",
      description: "What happens to confidential information when the NDA expires or is terminated?",
      options: [
        { id: "discloser-favourable", label: "Return All + Certified Destruction", description: "All materials returned within 10 days; electronic copies permanently destroyed; officer certifies destruction in writing", favorability: "client" },
        { id: "balanced", label: "Return or Destroy at Recipient's Election", description: "Recipient may return or destroy at their choice; certify destruction within 30 days; may retain copies required by law or regulation", favorability: "balanced" },
        { id: "recipient-favourable", label: "Destruction with Backup Retention", description: "Destroy active copies within 30 days; may retain copies in routine backup systems subject to ongoing confidentiality obligations", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — NON-DISCLOSURE AGREEMENT:
This is a confidentiality agreement to protect sensitive business information.

TARGET DOCUMENT LENGTH: 5-10 pages. NDAs should be concise and focused — overly long NDAs create friction in business development.

KEY CASE LAW:
- Lac Minerals v. International Corona Resources (1989 SCC): Breach of confidence — even without a formal NDA, confidential information shared in a business relationship may be protected
- Lyons v. Multari (2000 ONCA): Reasonableness of confidentiality scope and duration in commercial relationships
- Shafron v. KRG Insurance Brokers (2009 SCC): While focused on non-competes, the reasonableness principles inform confidentiality duration analysis

CRITICAL SECTIONS:
1. Definition of Confidential Information — the MOST important clause. Must be specific enough to be enforceable but broad enough to capture all sensitive information.
2. Standard exclusions (publicly available, independently developed, received from third party without restriction, compelled by law)
3. Permitted purpose and use restrictions
4. Permitted disclosures (who can see the information)
5. Return/destruction obligations on termination
6. Remedies (injunctive relief acknowledgment — damages are typically inadequate for confidentiality breaches)
7. No implied license, partnership, or obligation to transact

COMMON PITFALLS:
- Definition of Confidential Information is too broad (everything ever communicated) or too narrow (only marked documents)
- No carve-out for legally compelled disclosure (court orders, regulatory requests) — creates an impossible obligation
- Perpetual duration for non-trade-secret information — may be unenforceable
- No provision for residual knowledge (information retained in unaided memory)
- Missing the "compelled disclosure" notice requirement — recipient should notify discloser before complying with a legal demand

JURISDICTION-SPECIFIC CONSIDERATIONS:
- Quebec: Civil Code may impose additional confidentiality obligations beyond the NDA terms
- Cross-border: If information flows internationally, address data protection (PIPEDA, GDPR if EU parties involved)
- Regulated industries: Healthcare (PHIPA), financial services (OSFI guidelines) — sector-specific confidentiality requirements may apply

ADDITIONAL CLAUSE POSITIONS:
- scopeDefinitionPosition: Draft the definition of Confidential Information per selection. If broad, include a specific list of categories (technical, financial, business, personnel) plus a catch-all. If marked/designated, specify the marking requirements precisely and the timeline for confirming oral disclosures.
- permittedDisclosurePosition: Draft permitted disclosure clause per selection. Require that all permitted recipients be bound by confidentiality obligations no less protective than the NDA. Include a provision that the receiving party is responsible for any breach by its permitted recipients.
- returnDestructionPosition: Draft return/destruction clause per selection. Address electronically stored information specifically — backup tapes, cloud storage, email archives. Include a carve-out for copies retained by legal or compliance departments as required by law, with ongoing confidentiality obligations on retained copies.`,
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
  estimatedGenerationTime: 60,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "corporationName", "ownershipSplit"],
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
    {
      id: "valuationMethodPosition",
      label: "Valuation Methodology",
      description: "How are shares valued for buyouts, ROFR, and compelled transfers?",
      options: [
        { id: "seller-favourable", label: "Independent Appraiser", description: "Fair market value determined by an independent chartered business valuator (CBV) — most accurate but slowest and most expensive", favorability: "counter-party" },
        { id: "balanced", label: "Formula-Based (EBITDA Multiple)", description: "Pre-agreed EBITDA multiple (e.g., 4-6x trailing 12-month EBITDA) — provides certainty and speed, reviewed annually", favorability: "balanced" },
        { id: "buyer-favourable", label: "Book Value", description: "Share value based on the corporation's book value per audited financial statements — simplest but typically undervalues going-concern businesses", favorability: "client" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "distributionPolicyPosition",
      label: "Dividend / Distribution Policy",
      description: "How and when are profits distributed to shareholders?",
      options: [
        { id: "retain-earnings", label: "Discretionary (Board Decides)", description: "Distributions at the sole discretion of the board — maximum flexibility to reinvest profits in the business", favorability: "client" },
        { id: "balanced", label: "Mandatory Annual Distribution", description: "Minimum annual distribution of a percentage of net income (e.g., 50%), subject to maintaining adequate working capital and compliance with solvency tests", favorability: "balanced" },
        { id: "shareholder-favourable", label: "Mandatory Quarterly Distribution", description: "Quarterly distributions of available cash flow after operating expenses and reserves — strongest shareholder cash flow protection", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "nonCompetePosition",
      label: "Shareholder Non-Compete",
      description: "How broad is the non-compete restriction on each co-founder?",
      options: [
        { id: "restrictive", label: "24 Months Canada-Wide", description: "During term + 24 months post-departure, no competing business anywhere in Canada — broadest protection, enforceability risk per Shafron", favorability: "client" },
        { id: "balanced", label: "12 Months Provincial", description: "During term + 12 months post-departure, no competing business in the province of incorporation — reasonable and likely enforceable", favorability: "balanced" },
        { id: "permissive", label: "No Non-Compete", description: "No non-compete restriction — co-founders may engage in any business after departure, subject only to confidentiality obligations", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "rofrPosition",
      label: "Right of First Refusal (ROFR)",
      description: "Must a shareholder offer shares to the other co-founder before selling to a third party?",
      options: [
        { id: "restrictive", label: "Mandatory ROFR + Board Approval", description: "Departing shareholder must offer shares to co-founder at the same price; plus board must approve any third-party buyer — maximum control", favorability: "client" },
        { id: "balanced", label: "Standard ROFR (30 Days)", description: "Co-founder has 30-day right of first refusal at the offered price; if declined, selling shareholder may proceed to third party on same or better terms", favorability: "balanced" },
        { id: "permissive", label: "Notice Only", description: "Selling shareholder must notify co-founder but co-founder has no right to match the offer — maximum transferability", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "dragAlongPosition",
      label: "Drag-Along Rights",
      description: "Can one co-founder force the other to sell in a third-party acquisition?",
      options: [
        { id: "majority-power", label: "Simple Majority Triggers Drag", description: "Shareholder(s) holding 51%+ can force all shareholders to sell — lowest threshold, maximum liquidity for majority", favorability: "client" },
        { id: "balanced", label: "75% Triggers Drag with Fair Price Floor", description: "Drag-along requires 75% shareholder approval and the offered price must meet or exceed the formula valuation — protects against fire sales", favorability: "balanced" },
        { id: "minority-protected", label: "Unanimous Consent Required", description: "No drag-along without unanimous consent — minority can block any forced sale", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "goodLeaverBadLeaverPosition",
      label: "Good Leaver / Bad Leaver",
      description: "What price does a departing shareholder receive based on the circumstances of their departure?",
      options: [
        { id: "company-favourable", label: "Aggressive Step-Down", description: "Good leaver: FMV. Bad leaver: book value or par value. Voluntary resignation treated as bad leaver unless after 3+ years.", favorability: "client" },
        { id: "balanced", label: "Standard Step-Down", description: "Good leaver (termination without cause, disability, death): FMV. Bad leaver (cause, competing, breach): 75% of FMV.", favorability: "balanced" },
        { id: "shareholder-favourable", label: "FMV for All Departures", description: "Fair market value regardless of departure circumstances — simplest and most shareholder-friendly", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
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
- Include step-down mechanisms for all restrictive provisions

TARGET DOCUMENT LENGTH: 25-40 pages depending on complexity of governance provisions.

KEY CASE LAW:
- Shafron v. KRG Insurance Brokers (2009 SCC): Non-compete reasonableness test — apply to shareholder non-compete provisions
- Shoppers Drug Mart v. 6470360 Canada (2014 ONCA): Shotgun buy-sell must be fair and not used as an oppression tool
- BCE Inc. v. 1976 Debentureholders (2008 SCC): Reasonable expectations of shareholders — informs reserved matters and minority protections
- 820099 Ontario Inc. v. Harold E. Baird & Associates (2002 ONCA): Valuation methodology disputes — importance of clear formula provisions

COMMON PITFALLS:
- Failing to address what happens on the death of a co-founder (life insurance funding for buy-sell)
- Omitting a clear definition of "fair market value" leading to valuation disputes
- Non-compete clauses that are too broad for the Shafron test
- No mechanism for capital calls when the business needs additional funding

ADDITIONAL CLAUSE POSITIONS:
- valuationMethodPosition: Draft valuation clause per selection. If independent appraiser, specify the selection process (each party nominates one CBV, those two select a third), timeline (30-60 days), and cost allocation. If formula-based, define EBITDA adjustments (owner compensation normalization, non-recurring items) and specify the review/update frequency for the multiple. If book value, require annual audited financials and specify GAAP/ASPE basis.
- distributionPolicyPosition: Draft distribution policy per selection. If mandatory, include solvency test compliance (CBCA s.42 / OBCA s.38) and specify the calculation methodology. Include tax distribution provisions to cover shareholders' personal income tax obligations on undistributed corporate income.
- nonCompetePosition: Draft non-compete per selection. If 24 months Canada-wide, include Shafron risk acknowledgment and step-down provisions. If no non-compete, strengthen the confidentiality and non-solicitation provisions as alternatives.
- rofrPosition: Draft ROFR per selection. Specify the offer notice mechanics, matching period, and what happens if the ROFR holder cannot finance the purchase (financing extension or ROFR lapses).
- dragAlongPosition: Draft drag-along per selection. Include minimum price floor, tag-along rights for the minority, and representation that the third-party buyer will offer the same terms to both shareholders.
- goodLeaverBadLeaverPosition: Draft good/bad leaver provisions per selection. Define each category precisely. If step-down, specify the payment terms (lump sum vs. installments) for each category and the time period over which installments are paid.`,
};

const STARTUP_SHA_CONFIG: AgreementConfig = {
  id: "startup-sha",
  partyLabels: {
    partyALabel: "Lead Founder / Majority Shareholder",
    partyAPlaceholder: "Jane CEO",
    partyBLabel: "Co-Founders / Minority Shareholders",
    partyBPlaceholder: "John CTO, Sarah COO",
  },
  estimatedGenerationTime: 60,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "corporationName", "ownershipSplit"],
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
    {
      id: "vestingSchedulePosition",
      label: "Founder Vesting Schedule",
      description: "How do founder shares vest over time to protect against early departures?",
      options: [
        { id: "standard", label: "4-Year / 1-Year Cliff (Standard)", description: "Shares vest monthly over 4 years with a 1-year cliff — industry standard for VC-backed startups, protects against co-founder departure in year one", favorability: "balanced" },
        { id: "accelerated", label: "3-Year / 6-Month Cliff (Accelerated)", description: "Shares vest monthly over 3 years with a 6-month cliff — appropriate when founders have significant pre-incorporation contributions", favorability: "counter-party" },
        { id: "immediate", label: "Immediate Full Vesting", description: "All shares fully vested from day one — no protection against early departure but appropriate for established founders with proven track record", favorability: "counter-party" },
      ],
      defaultPosition: "standard",
    },
    {
      id: "equityPoolPosition",
      label: "Employee Stock Option Pool (ESOP)",
      description: "What percentage of fully diluted shares is reserved for future employee grants?",
      options: [
        { id: "conservative", label: "10% Pool", description: "Smaller pool — sufficient for early hires only, will likely need board approval to increase before Series A", favorability: "client" },
        { id: "balanced", label: "15% Pool", description: "Standard pool for seed-stage companies — covers key early hires and some mid-stage growth, may need top-up at Series A", favorability: "balanced" },
        { id: "generous", label: "20% Pool", description: "Larger pool — provides flexibility for aggressive hiring without requiring shareholder approval for increases in the near term", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "antiDilutionPosition",
      label: "Anti-Dilution Mechanism",
      description: "What price protection do existing shareholders get if the company raises a down round?",
      options: [
        { id: "investor-favourable", label: "Full Ratchet", description: "Conversion price adjusts to the new lower price as if the original investment was made at the down-round price — most protective for investors, most punitive for founders", favorability: "counter-party" },
        { id: "balanced", label: "Weighted Average Broad-Based", description: "Conversion price adjusted based on weighted average of existing and new shares — accounts for the size of the down round, standard in CVCA term sheets", favorability: "balanced" },
        { id: "founder-favourable", label: "No Anti-Dilution", description: "No price protection — investors take full dilution risk alongside founders. Unusual but may be appropriate for very early stage.", favorability: "client" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "founderDeparturePosition",
      label: "Founder Departure Buyback",
      description: "What happens to a departing founder's vested shares?",
      options: [
        { id: "company-favourable", label: "Company Repurchase at Cost", description: "Company has the right to repurchase all vested shares at original subscription price — harsh but protects remaining founders from a departed founder holding a blocking position", favorability: "client" },
        { id: "balanced", label: "Good Leaver/Bad Leaver", description: "Good leaver (terminated without cause): retains vested shares. Bad leaver (cause, compete, breach): company repurchases vested shares at cost.", favorability: "balanced" },
        { id: "founder-favourable", label: "Departing Founder Retains All Vested", description: "Departing founder retains all vested shares regardless of departure circumstances — only unvested shares are forfeited", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "boardCompositionPosition",
      label: "Board Composition",
      description: "How is the board of directors structured to balance founder and minority interests?",
      options: [
        { id: "founder-controlled", label: "Founder-Controlled Board", description: "Lead founder appoints majority of directors; minority founders have one board seat; no independent directors required", favorability: "client" },
        { id: "balanced", label: "Balanced Board with Independent", description: "Lead founder appoints 2 directors, minority founders appoint 1, plus 1 mutually agreed independent director", favorability: "balanced" },
        { id: "minority-protected", label: "Proportional Representation", description: "Board seats allocated proportionally to ownership; key committees require minority participation", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
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
9. Non-compete and non-solicitation for all shareholders

TARGET DOCUMENT LENGTH: 30-50 pages depending on complexity and number of shareholders.

KEY CASE LAW:
- BCE Inc. v. 1976 Debentureholders (2008 SCC): Reasonable expectations of minority shareholders inform reserved matter and oppression analysis
- Budd v. Gentra Inc. (1998 ONCA): Minority oppression remedy — informs protective provisions
- Balanyk v. Balanyk (2011 ONCA): Valuation disputes in closely-held corporations — importance of clear methodology
- 820099 Ontario Inc. v. Harold E. Baird & Associates (2002 ONCA): Buy-sell mechanism fairness

COMMON PITFALLS:
- Omitting vesting for the lead founder (all founders should vest, not just minority)
- ESOP pool too small, requiring painful renegotiation before first financing round
- Failing to define "good leaver" vs. "bad leaver" with sufficient precision
- No mechanism for additional capital contributions or shareholder loans
- Drag-along threshold too low, allowing lead founder to force a sale without minority consent

ADDITIONAL CLAUSE POSITIONS:
- vestingSchedulePosition: Draft vesting schedule per selection. Specify the mechanics: share restriction agreement, repurchase right, or reverse vesting. Include acceleration triggers (single/double trigger on CoC). Address tax implications — s.7 ITA on stock option benefits.
- equityPoolPosition: Draft ESOP reservation clause per selection. Specify that ESOP shares are authorized but unissued, not included in the denominator for voting purposes until granted and vested. Include board authority to grant options within the pool without further shareholder approval.
- antiDilutionPosition: Draft anti-dilution clause per selection. If full ratchet, include a carve-out for ESOP grants (to avoid triggering on employee option exercises). If weighted average, specify the formula precisely with definitions of each variable. Include an exception for shares issued in connection with strategic partnerships.
- founderDeparturePosition: Draft departure buyback per selection. Address payment terms (lump sum or installments over 12-24 months), whether the company or remaining founders have the repurchase right, and the timeline for exercising the repurchase option (typically 60-90 days after departure).
- boardCompositionPosition: Draft board composition per selection. Specify how observers (non-voting) are handled, quorum requirements, and what happens to minority board seats if their ownership falls below a threshold (e.g., 10%).`,
};

const JOINT_VENTURE_CONFIG: AgreementConfig = {
  id: "joint-venture",
  partyLabels: {
    partyALabel: "JV Partner A (Lead Venturer)",
    partyAPlaceholder: "Alpha Corp.",
    partyBLabel: "JV Partner B (Co-Venturer)",
    partyBPlaceholder: "Beta Industries Inc.",
  },
  estimatedGenerationTime: 75,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "jvPurpose", "ownershipSplit"],
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
    {
      id: "capitalContributionPosition",
      label: "Capital Contributions",
      description: "How are additional capital needs of the JV funded?",
      options: [
        { id: "partner-a-leads", label: "Pro-Rata Mandatory Contributions", description: "Each partner must contribute additional capital pro-rata to their ownership; failure to contribute results in dilution", favorability: "balanced" },
        { id: "balanced", label: "Voluntary with Dilution Protection", description: "Additional contributions are voluntary; contributing partner may receive additional equity or a preference on distributions", favorability: "balanced" },
        { id: "capped", label: "Capped Total Commitments", description: "Each partner's total capital commitment is capped at an agreed amount; JV must seek external financing beyond the cap", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "ipContributionPosition",
      label: "IP Licensing to/from JV",
      description: "How is intellectual property contributed to and created by the joint venture handled?",
      options: [
        { id: "partner-a-favourable", label: "License In, JV Owns All Created IP", description: "Partners license existing IP to JV; all IP created by JV is owned by JV exclusively — clean ownership but partners lose created IP on exit", favorability: "client" },
        { id: "balanced", label: "License In, License Back on Exit", description: "Partners license existing IP to JV; JV owns created IP during term; on exit, departing partner gets a non-exclusive license to JV-created IP in their field of use", favorability: "balanced" },
        { id: "partner-b-favourable", label: "Each Partner Retains Their IP", description: "Each partner retains ownership of IP they contribute and IP created by their personnel; JV receives a license to use all contributed IP", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "nonCompeteJVPosition",
      label: "Partner Non-Compete with JV",
      description: "Can the JV partners compete with the joint venture?",
      options: [
        { id: "restrictive", label: "Broad Non-Compete", description: "Neither partner may engage in any business that competes with the JV's business scope, globally, during the JV term + 24 months", favorability: "client" },
        { id: "balanced", label: "Field-of-Use Restriction", description: "Partners may not compete in the JV's specific field of use but may operate freely in adjacent or unrelated markets", favorability: "balanced" },
        { id: "permissive", label: "No Non-Compete", description: "Partners are free to compete with the JV — only confidentiality and non-solicitation of JV employees apply", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "profitAllocationPosition",
      label: "Profit & Loss Allocation",
      description: "How are JV profits and losses distributed between partners?",
      options: [
        { id: "pro-rata", label: "Pro-Rata to Ownership", description: "Profits and losses allocated strictly in proportion to each partner's ownership percentage — simplest approach", favorability: "balanced" },
        { id: "priority-return", label: "Priority Return Then Pro-Rata", description: "Contributing partners receive a priority return on capital (e.g., 8% IRR) before profits are shared pro-rata — rewards capital-heavy partners", favorability: "client" },
        { id: "waterfall", label: "Tiered Waterfall", description: "Distribution waterfall with tiers: first to return capital, then preferred return, then profit split (which may differ from ownership) — most complex but most flexible", favorability: "balanced" },
      ],
      defaultPosition: "pro-rata",
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
11. Anti-trust / competition law compliance (if partners are competitors)

TARGET DOCUMENT LENGTH: 40-60 pages depending on the complexity of the JV structure and the scope of contributed assets.

KEY CASE LAW:
- Shafron v. KRG Insurance Brokers (2009 SCC): Reasonableness test for non-compete provisions between JV partners
- Frame v. Smith (1987 SCC): Fiduciary duties in commercial relationships — JV partners may owe fiduciary duties depending on structure
- International Corona Resources v. Lac Minerals (1989 SCC): Confidentiality and fiduciary obligations in commercial negotiations — relevant to JV confidentiality provisions

COMMON PITFALLS:
- Failing to define the JV scope precisely, leading to disputes over whether a partner's new opportunity belongs to the JV
- No mechanism for additional capital calls when the JV needs more funding
- Unclear IP ownership for technology created during the JV
- Exit valuation disputes when partners disagree on the value of the JV
- Anti-trust issues if JV partners are competitors (Competition Act s.90.1)

ADDITIONAL CLAUSE POSITIONS:
- capitalContributionPosition: Draft capital contribution clause per selection. If mandatory pro-rata, specify the dilution mechanics if a partner fails to contribute (e.g., additional shares issued to contributing partner at a discount). If capped, specify what happens when the cap is reached and external financing is needed (partner guarantees? JV-level debt?).
- ipContributionPosition: Draft IP contribution clause per selection. Include a schedule of contributed IP from each partner. Specify the license terms (exclusive vs. non-exclusive, field-of-use restrictions, royalty terms if any). Address improvements to contributed IP during the JV term. On exit, clearly define what each partner takes with them.
- nonCompeteJVPosition: Draft non-compete per selection. If broad, apply Shafron reasonableness analysis. Include a carve-out for pre-existing businesses of each partner. Specify how new opportunities are allocated (JV first look, partner first look, or mutual agreement).
- profitAllocationPosition: Draft distribution clause per selection. If waterfall, define each tier precisely with calculation examples. Address tax distribution provisions to cover each partner's tax obligations on JV income. Specify distribution frequency and the approval process.`,
};

const INVESTOR_PE_CONFIG: AgreementConfig = {
  id: "investor-pe-backed",
  partyLabels: {
    partyALabel: "Company / Founders",
    partyAPlaceholder: "StartupCo Inc.",
    partyBLabel: "Investor / PE Fund",
    partyBPlaceholder: "Venture Capital Fund LP",
  },
  estimatedGenerationTime: 75,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "corporationName", "investmentAmount"],
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
    {
      id: "antiDilutionPEPosition",
      label: "Anti-Dilution Protection",
      description: "What price protection does the investor receive in a down round?",
      options: [
        { id: "founder-favourable", label: "No Anti-Dilution", description: "Investor takes full dilution risk alongside common shareholders — rare but possible in founder-friendly markets", favorability: "client" },
        { id: "balanced", label: "Weighted Average Broad-Based", description: "Conversion price adjusted based on the weighted average of existing and new share prices — CVCA standard, accounts for deal size", favorability: "balanced" },
        { id: "investor-favourable", label: "Full Ratchet", description: "Conversion price drops to the new lower price as if original investment was made at the down-round price — most protective for investor, most dilutive for founders", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "protectiveProvisionsPosition",
      label: "Investor Protective Provisions",
      description: "What actions require investor consent beyond normal board approval?",
      options: [
        { id: "founder-favourable", label: "Minimal Protections", description: "Investor consent required only for changes to investor share rights, liquidation, and new senior securities — founders retain maximum operational freedom", favorability: "client" },
        { id: "balanced", label: "Standard CVCA Protections", description: "Investor consent for: new debt above threshold, new equity, asset sales, related-party transactions, budget deviations, and key hires/fires", favorability: "balanced" },
        { id: "investor-favourable", label: "Comprehensive Protections", description: "Broad investor consent requirements including operating budget approval, all capital expenditures above threshold, customer/vendor contracts above threshold, and strategic direction changes", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "dragAlongPEPosition",
      label: "Drag-Along Rights",
      description: "When can the investor force founders to sell their shares in an acquisition?",
      options: [
        { id: "founder-favourable", label: "Investor Drag After 7 Years", description: "Investor can trigger drag-along only after 7 years from closing, and only at a price that returns at least 3x the investor's investment", favorability: "client" },
        { id: "balanced", label: "Investor Drag After 5 Years with Floor", description: "Investor can trigger drag-along after 5 years, subject to a minimum price floor that provides founders a reasonable return", favorability: "balanced" },
        { id: "investor-favourable", label: "Investor Drag After 3 Years", description: "Investor can trigger drag-along after 3 years from closing with no minimum price floor — maximum liquidity protection for the investor", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "informationRightsPosition",
      label: "Information & Inspection Rights",
      description: "What financial information and access does the investor receive?",
      options: [
        { id: "founder-favourable", label: "Annual Financials Only", description: "Investor receives annual audited financials and annual budget — minimal reporting burden on the company", favorability: "client" },
        { id: "balanced", label: "Quarterly Financials + Annual Budget", description: "Quarterly unaudited financials, annual audited financials, annual budget and operating plan, and cap table updates — CVCA standard", favorability: "balanced" },
        { id: "investor-favourable", label: "Monthly Reporting + Inspection Rights", description: "Monthly management accounts, quarterly financials, annual audit, KPI dashboard, and right to inspect books/records with 5 days notice", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "founderLockUpPosition",
      label: "Founder Lock-Up & Transfer Restrictions",
      description: "Can founders sell or transfer their shares during the investment period?",
      options: [
        { id: "investor-favourable", label: "Full Lock-Up (No Sales)", description: "Founders may not sell, transfer, or pledge any shares without investor consent for the duration of the investment — maximum alignment", favorability: "counter-party" },
        { id: "balanced", label: "Lock-Up with Limited Exceptions", description: "Founders locked up for 3 years post-closing; after lock-up, transfers permitted subject to ROFR and investor consent for transfers exceeding 10% of holdings", favorability: "balanced" },
        { id: "founder-favourable", label: "ROFR Only", description: "No lock-up; founders may sell subject to right of first refusal in favor of the company and then the investor — maximum founder liquidity", favorability: "client" },
      ],
      defaultPosition: "balanced",
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
12. ROFR on founder share transfers

TARGET DOCUMENT LENGTH: 40-60 pages plus schedules (cap table, investor rights, protective provisions).

KEY CASE LAW:
- BCE Inc. v. 1976 Debentureholders (2008 SCC): Duty to act in best interests of corporation; reasonable expectations of stakeholders including preferred shareholders
- Peoples Department Stores v. Wise (2004 SCC): Directors' fiduciary duty runs to the corporation, not individual shareholders — informs governance structure
- Budd v. Gentra Inc. (1998 ONCA): Oppression remedy available to minority shareholders — founders need awareness of remedies

COMMON PITFALLS:
- Liquidation preference stack too aggressive — founders receive nothing on a modest exit
- Protective provisions too broad — company cannot operate without investor approval for routine matters
- No founder carve-out on drag-along — founders forced to sell at a loss while investor gets their money back via preference
- Pay-to-play provisions not included — passive investors benefit without participating in follow-on rounds
- Missing registration rights if IPO is a realistic exit path

ADDITIONAL CLAUSE POSITIONS:
- antiDilutionPEPosition: Draft anti-dilution clause per selection. If weighted average, include the formula with all variable definitions. Include carve-outs for ESOP grants, strategic issuances, and conversion of existing instruments. If full ratchet, include a pay-to-play provision requiring the investor to participate pro-rata in the down round to receive the adjustment.
- protectiveProvisionsPosition: Draft protective provisions per selection. List each consent right as a separate numbered item. Include a materiality threshold for financial items (e.g., debt above $X, contracts above $Y). Specify whether consent is required from investors as a class or individually. Address the process for obtaining consent (written notice, deemed consent after 15 days).
- dragAlongPEPosition: Draft drag-along per selection. Include tag-along rights for founders at the same price and terms. Specify the minimum consideration threshold. Address escrow and indemnification holdbacks in the sale — ensure founders are not disproportionately burdened. Include a representation that the acquirer will offer the same form of consideration to all shareholders.
- informationRightsPosition: Draft information rights per selection. Specify GAAP/ASPE basis for financials. Include confidentiality obligations on the investor for information received. Address the cost of audits. If inspection rights, specify reasonable notice period and restrictions on competitive use of information.
- founderLockUpPosition: Draft lock-up per selection. Address permitted transfers (estate planning, family trusts) that do not require investor consent but do require transferee to be bound by the SHA. Specify whether founder shares remain subject to vesting during the lock-up period.`,
};

const FIFTY_FIFTY_CONFIG: AgreementConfig = {
  id: "fifty-fifty",
  partyLabels: {
    partyALabel: "Partner A",
    partyAPlaceholder: "Jane Business Partner",
    partyBLabel: "Partner B",
    partyBPlaceholder: "John Business Partner",
  },
  estimatedGenerationTime: 55,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "corporationName"],
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
    {
      id: "valuationMethod5050Position",
      label: "Buyout Valuation Method",
      description: "How are shares valued when one partner buys out the other?",
      options: [
        { id: "appraiser", label: "Independent CBV Appraiser", description: "Fair market value determined by a Chartered Business Valuator — most accurate, most expensive, 30-60 day timeline", favorability: "balanced" },
        { id: "formula", label: "Pre-Agreed Formula (EBITDA Multiple)", description: "Shares valued at a pre-agreed EBITDA multiple (e.g., 5x trailing 12-month adjusted EBITDA) — provides certainty and speed", favorability: "balanced" },
        { id: "shotgun-price", label: "Shotgun-Named Price", description: "Triggering partner names the price per share — the price IS the offer; no independent valuation needed. Works only with shotgun buy-sell mechanism.", favorability: "balanced" },
      ],
      defaultPosition: "formula",
    },
    {
      id: "financialControls5050Position",
      label: "Financial Controls",
      description: "What spending and signing authority limits apply?",
      options: [
        { id: "tight-controls", label: "Dual Signature Above $5,000", description: "Both partners must co-sign for any expenditure above $5,000 and all banking transactions — maximum control but operationally slower", favorability: "balanced" },
        { id: "balanced", label: "Single Signature Below $25,000", description: "Either partner can authorize spending up to $25,000; amounts above require both partners' approval — balances efficiency with oversight", favorability: "balanced" },
        { id: "flexible", label: "Domain-Based Spending Authority", description: "Each partner has independent spending authority within their operational domain up to $50,000; cross-domain or larger amounts require both partners", favorability: "balanced" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "nonCompete5050Position",
      label: "Mutual Non-Compete",
      description: "How broad are the non-compete restrictions on each partner?",
      options: [
        { id: "restrictive", label: "Broad (24 Months Post-Departure)", description: "During term + 24 months, no competing business in Canada — broadest protection, Shafron enforceability risk", favorability: "balanced" },
        { id: "balanced", label: "Moderate (12 Months Provincial)", description: "During term + 12 months post-departure, no competing business in the province — reasonable and likely enforceable", favorability: "balanced" },
        { id: "permissive", label: "Non-Solicit Only", description: "No non-compete; only non-solicitation of clients and employees for 12 months post-departure", favorability: "balanced" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "insuranceFunding5050Position",
      label: "Buy-Sell Insurance Funding",
      description: "Is the buy-sell mechanism funded by life/disability insurance?",
      options: [
        { id: "fully-funded", label: "Cross-Owned Life + Disability Insurance", description: "Each partner owns a life and disability insurance policy on the other, sufficient to fund the buyout at the formula valuation — ensures funds are available when needed", favorability: "balanced" },
        { id: "partially-funded", label: "Corporate-Owned Insurance", description: "Corporation owns key-person insurance on both partners; proceeds used to fund redemption of deceased/disabled partner's shares — simpler but corporate-level tax implications", favorability: "balanced" },
        { id: "unfunded", label: "No Insurance Funding", description: "Buy-sell not backed by insurance; purchasing partner must self-finance the buyout (installment payments over 2-5 years) — lowest cost but highest execution risk", favorability: "balanced" },
      ],
      defaultPosition: "partially-funded",
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
10. Valuation methodology for buyouts (critical when shotgun is used)

TARGET DOCUMENT LENGTH: 25-40 pages. The document must be precise — ambiguity in a 50/50 agreement guarantees disputes.

KEY CASE LAW:
- Shoppers Drug Mart v. 6470360 Canada (2014 ONCA): Shotgun buy-sell fairness — the mechanism can be challenged if it creates an unequal playing field (e.g., one partner has more liquidity)
- BCE Inc. v. 1976 Debentureholders (2008 SCC): Reasonable expectations of equal shareholders
- Shafron v. KRG Insurance Brokers (2009 SCC): Non-compete reasonableness for the mutual non-compete provisions
- Budd v. Gentra Inc. (1998 ONCA): Oppression remedy in closely-held corporations

COMMON PITFALLS:
- Shotgun mechanism without financing provisions — the wealthier partner can force a lowball buyout
- No minimum waiting period before shotgun can be triggered (e.g., require 12 months of mediation attempts first)
- Deadlock clause that only covers governance deadlock but not operational day-to-day disagreements
- No insurance funding for death/disability buy-sell — surviving partner cannot afford to buy out the estate
- Dual-signature requirements that are too restrictive for daily operations

ADDITIONAL CLAUSE POSITIONS:
- valuationMethod5050Position: Draft valuation clause per selection. If independent appraiser, specify the CBV selection process, timeline, and cost allocation. If formula, define EBITDA adjustments and the multiple, with annual review provisions. If shotgun-named price, draft the shotgun mechanics with a minimum price floor tied to book value to prevent predatory lowball offers.
- financialControls5050Position: Draft financial control provisions per selection. Include banking resolution language. Specify who has signing authority for specific transaction types (payroll, vendor payments, capital expenditures, debt). Address credit card limits and corporate expense policies.
- nonCompete5050Position: Draft mutual non-compete per selection. Apply Shafron reasonableness test. Both partners should be subject to identical restrictions. Include step-down provisions. If non-solicit only, define "solicitation" precisely (active vs. passive) and specify the client and employee lists that are protected.
- insuranceFunding5050Position: Draft insurance funding provisions per selection. If cross-owned, specify the minimum coverage amount (tied to formula valuation), the obligation to maintain the policy, and what happens if a partner becomes uninsurable. If corporate-owned, address the CDA (Capital Dividend Account) tax treatment on death proceeds. If unfunded, draft installment payment terms (interest rate, security, acceleration on default).`,
};

const INCORPORATION_CONFIG: AgreementConfig = {
  id: "articles-of-incorporation",
  partyLabels: {
    partyALabel: "Incorporator / Founding Director",
    partyAPlaceholder: "Jane Founder",
    partyBLabel: "Corporation Name",
    partyBPlaceholder: "Acme Technologies Inc.",
  },
  estimatedGenerationTime: 20,
  requiredFields: ["partyAName", "corporationName", "jurisdiction", "registeredOffice"],
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
  estimatedGenerationTime: 40,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "investmentAmount", "valuationCap"],
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
    {
      id: "conversionTriggerPosition",
      label: "Conversion Trigger Events",
      description: "What events beyond a qualified financing can trigger SAFE conversion?",
      options: [
        { id: "company-favourable", label: "Qualified Financing Only", description: "SAFE converts only on an equity financing round meeting the minimum threshold — company controls timing of conversion", favorability: "client" },
        { id: "balanced", label: "Qualified Financing + Maturity", description: "SAFE converts on a qualified financing OR automatically at the cap price after a defined period (e.g., 24 months) — provides investor with a backstop", favorability: "balanced" },
        { id: "investor-favourable", label: "Any Equity Issuance", description: "SAFE converts on any equity issuance (including ESOP grants above a threshold) — broadest trigger, maximum investor protection against indefinite deferral", favorability: "counter-party" },
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
- sideLetterPosition: If side letter rights are granted, draft as a separate side letter exhibit. If broad, include consent rights for material transactions (asset sales, mergers, key hires).
- conversionTriggerPosition: Draft conversion trigger clause per selection. If qualified financing only, define "Equity Financing" precisely (exclude ESOP grants, convertible note conversions, and strategic equity issuances below the threshold). If maturity conversion, specify the conversion price (at cap, at discount to most recent valuation, or at a pre-agreed price). If any equity issuance, include carve-outs for ESOP grants up to the approved pool size and shares issued in connection with strategic partnerships.`,
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
  estimatedGenerationTime: 50,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "principalAmount", "interestRate", "maturityDate", "valuationCap"],
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
    {
      id: "maturityConversionPosition",
      label: "Maturity Conversion Mechanics",
      description: "If no qualifying financing occurs by maturity, how does conversion work?",
      options: [
        { id: "borrower-favourable", label: "Automatic at Cap", description: "Note automatically converts at the valuation cap price at maturity — company avoids repayment obligation and investor gets equity at the agreed ceiling price", favorability: "client" },
        { id: "balanced", label: "Optional for Holder", description: "At maturity, holder may elect to convert at the cap price OR demand repayment of principal plus accrued interest — investor retains optionality", favorability: "balanced" },
        { id: "lender-favourable", label: "Automatic at Discount to Cap", description: "Note automatically converts at a discount (e.g., 20%) to the valuation cap at maturity — rewards investor for the extended holding period", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "subordinationPosition",
      label: "Subordination & Priority",
      description: "Where does this convertible note rank relative to other company debt?",
      options: [
        { id: "borrower-favourable", label: "Subordinated", description: "Note is subordinated to all existing and future senior debt — allows company to obtain bank financing without intercreditor issues", favorability: "client" },
        { id: "balanced", label: "Pari Passu with Other Notes", description: "Note ranks equally with all other convertible notes and unsecured debt — standard for multi-investor note rounds", favorability: "balanced" },
        { id: "lender-favourable", label: "Senior Unsecured", description: "Note ranks senior to all other unsecured debt of the company — investor has priority in a workout or insolvency scenario", favorability: "counter-party" },
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
- maturityExtensionPosition: If automatic extension, specify whether interest rate changes during the extension period. If no extension, draft maturity conversion mechanics (e.g., convert at cap or repay at investor's election).
- maturityConversionPosition: Draft maturity conversion clause per selection. If automatic at cap, specify the conversion mechanics (number of shares = principal + accrued interest / cap price per share). If optional for holder, include the election notice period (typically 10-30 days before maturity) and the mechanics for each election. If automatic at discount, specify whether the discount is applied to the cap or to the most recent equity price. Address fractional share treatment.
- subordinationPosition: Draft subordination clause per selection. If subordinated, include a standstill provision preventing the note holder from exercising remedies while senior debt is outstanding. If pari passu, include pro-rata sharing provisions with other note holders. If senior, address intercreditor implications if the company later obtains bank financing. Reference BIA priority rules in an insolvency scenario.`,
};

const BILATERAL_LOAN_CONFIG: AgreementConfig = {
  id: "bilateral-loan",
  partyLabels: {
    partyALabel: "Borrower",
    partyAPlaceholder: "Borrower Corp.",
    partyBLabel: "Lender",
    partyBPlaceholder: "Lender Name / Institution",
  },
  estimatedGenerationTime: 50,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "principalAmount", "interestRate", "loanTerm"],
  wizardSteps: ["inv-lending", "inv-covenants"],
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
      id: "defaultRemedyPosition",
      label: "Default & Remedies",
      description: "What triggers default and what can the lender do?",
      options: [
        { id: "borrower-favourable", label: "Borrower-Favorable", description: "Extended cure period + negotiation before any enforcement — maximum borrower protection", favorability: "client" },
        { id: "balanced", label: "Balanced", description: "Cure period + mediation before acceleration — standard market approach", favorability: "balanced" },
        { id: "lender-favourable", label: "Lender-Favorable", description: "Acceleration + seizure of collateral — immediate enforcement rights on default", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "prepaymentPosition",
      label: "Prepayment Terms",
      description: "What penalty (if any) applies if the borrower repays the loan early?",
      options: [
        { id: "no-penalty", label: "No Penalty", description: "Borrower can prepay at any time without cost — maximum flexibility", favorability: "client" },
        { id: "declining-penalty", label: "Declining Penalty (3/2/1%)", description: "Prepayment penalty that decreases over time: 3% in year 1, 2% in year 2, 1% in year 3", favorability: "balanced" },
        { id: "make-whole", label: "Make-Whole Premium", description: "Borrower must compensate lender for lost interest through a make-whole calculation — maximum lender protection", favorability: "counter-party" },
      ],
      defaultPosition: "no-penalty",
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
  estimatedGenerationTime: 15,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "principalAmount", "interestRate"],
  wizardSteps: ["inv-lending"],
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
    {
      id: "demandNoticePosition",
      label: "Demand Notice Period",
      description: "How much advance notice must the lender give before demanding repayment?",
      options: [
        { id: "immediate", label: "Immediate Demand", description: "Payable immediately on demand — no advance notice required", favorability: "counter-party" },
        { id: "10-day", label: "10-Day Notice", description: "Lender must provide 10 days' written notice before demanding repayment", favorability: "balanced" },
        { id: "30-day", label: "30-Day Notice", description: "Lender must provide 30 days' written notice — gives the borrower time to arrange alternative financing", favorability: "client" },
      ],
      defaultPosition: "10-day",
    },
    {
      id: "interestCalculation",
      label: "Interest Calculation Method",
      description: "How is interest calculated on the outstanding balance?",
      options: [
        { id: "simple", label: "Simple Interest", description: "Interest calculated only on the original principal — straightforward and borrower-friendly", favorability: "client" },
        { id: "compound-monthly", label: "Compound Monthly", description: "Interest compounds monthly — unpaid interest is added to the principal each month", favorability: "balanced" },
        { id: "compound-quarterly", label: "Compound Quarterly", description: "Interest compounds quarterly — slightly less aggressive than monthly compounding", favorability: "balanced" },
      ],
      defaultPosition: "simple",
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
  estimatedGenerationTime: 80,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "facilityLimit", "interestRate", "maturityDate"],
  wizardSteps: ["inv-lending", "inv-covenants"],
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
      id: "commitmentFee",
      label: "Commitment Fee",
      description: "What fee does the borrower pay on the undrawn portion of the facility?",
      options: [
        { id: "no-fee", label: "No Fee", description: "No commitment fee on undrawn amounts — borrower pays nothing for maintaining availability", favorability: "client" },
        { id: "quarter-percent", label: "0.25% on Unused", description: "Low commitment fee of 0.25% per annum on the undrawn facility amount", favorability: "balanced" },
        { id: "half-percent", label: "0.50% on Unused", description: "Standard commitment fee of 0.50% per annum on the undrawn facility amount — typical for mid-market facilities", favorability: "counter-party" },
      ],
      defaultPosition: "quarter-percent",
    },
    {
      id: "borrowingBase",
      label: "Borrowing Base",
      description: "Is the available credit limited by a formula tied to the borrower's assets?",
      options: [
        { id: "no-base", label: "No Base Required", description: "Full facility amount available at all times — no asset-based limitation on draws", favorability: "client" },
        { id: "ar-only", label: "Accounts Receivable Only", description: "Availability limited to a percentage (e.g., 80%) of eligible accounts receivable", favorability: "balanced" },
        { id: "full-base", label: "Full Borrowing Base (AR + Inventory)", description: "Availability based on eligible receivables (80%) + inventory (50%) with concentration limits and monthly borrowing base certificates", favorability: "counter-party" },
      ],
      defaultPosition: "ar-only",
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
  estimatedGenerationTime: 40,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "serviceDescription", "subscriptionFee"],
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
    {
      id: "dataDeletionPosition",
      label: "Data Deletion on Termination",
      description: "What happens to the customer's data when the subscription ends?",
      options: [
        { id: "provider-favourable", label: "90-Day Retention Then Deletion", description: "Provider retains customer data for 90 days post-termination for re-activation convenience, then deletes — gives provider flexibility", favorability: "client" },
        { id: "balanced", label: "30-Day Export Window Then Certified Deletion", description: "Customer has 30 days to export data in standard format; after export window closes, provider certifies deletion within 10 business days", favorability: "balanced" },
        { id: "customer-favourable", label: "Immediate Export + Certified Deletion", description: "Provider provides data export in multiple standard formats on termination date; certified deletion within 5 business days; written confirmation provided", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "subProcessorPosition",
      label: "Sub-Processor Management",
      description: "How much control does the customer have over which third parties process their data?",
      options: [
        { id: "provider-favourable", label: "General Authorization", description: "Customer grants general authorization for sub-processors; provider maintains a published list and updates it periodically", favorability: "client" },
        { id: "balanced", label: "Notice with Objection Right", description: "Provider notifies customer 30 days before engaging a new sub-processor; customer may object on reasonable privacy grounds; parties negotiate resolution", favorability: "balanced" },
        { id: "customer-favourable", label: "Prior Written Consent Required", description: "Provider must obtain customer's prior written consent before engaging any new sub-processor — maximum customer control over data processing chain", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
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
- renewalPosition: Draft renewal mechanics per selection. If auto-renewal, specify the price escalation cap (e.g., CPI or maximum 5% increase). If mutual agreement, include a negotiation period before expiry.
- dataDeletionPosition: Draft data deletion clause per selection. Specify the deletion standard (NIST 800-88 or equivalent). Address backup copies — specify the retention period for backups and when backup deletion occurs. Include a written certification of deletion signed by the provider's privacy officer. Address legal hold obligations that may override deletion timelines.
- subProcessorPosition: Draft sub-processor clause per selection. Require that all sub-processors are bound by data processing agreements no less protective than the customer agreement. Include a current list of approved sub-processors as an exhibit. If prior consent required, specify the approval timeline and what happens if customer objects (provider must offer alternative or customer may terminate affected services). Reference PIPEDA Principle 7 (Safeguards) for the standard sub-processors must meet.`,
};

const MANAGED_SERVICES_SLA_CONFIG: AgreementConfig = {
  id: "managed-services-sla",
  partyLabels: {
    partyALabel: "Managed Services Provider",
    partyAPlaceholder: "TechOps Solutions Inc.",
    partyBLabel: "Client (Service Recipient)",
    partyBPlaceholder: "Growing Business Corp.",
  },
  estimatedGenerationTime: 40,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "serviceScope"],
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
    {
      id: "staffingPosition",
      label: "Staffing Requirements",
      description: "What level of dedicated staffing does the client receive?",
      options: [
        { id: "provider-favourable", label: "Shared Resources Pool", description: "Provider allocates staff from a shared pool; no guaranteed named resources — maximum provider flexibility", favorability: "client" },
        { id: "balanced", label: "Named Key Personnel", description: "Key roles (lead technician, account manager) are named individuals; support staff from shared pool; 30-day notice before replacing key personnel", favorability: "balanced" },
        { id: "client-favourable", label: "Fully Dedicated Team", description: "Entire team dedicated to client; named individuals in all roles; no replacement without client approval; provider backfills within 5 business days", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "transitionAssistancePosition",
      label: "Transition Assistance on Termination",
      description: "What support does the provider give when the client transitions to a new provider or in-house?",
      options: [
        { id: "provider-favourable", label: "30-Day Transition (At Cost)", description: "Provider assists with transition for 30 days at standard billing rates — minimal obligation", favorability: "client" },
        { id: "balanced", label: "90-Day Transition (Included)", description: "90-day transition period included in the contract; provider must maintain service levels during transition and cooperate with successor", favorability: "balanced" },
        { id: "client-favourable", label: "180-Day Transition + Knowledge Transfer", description: "Six-month transition with full knowledge transfer, documentation, and training of successor team — included in fees", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "performanceCreditsPosition",
      label: "Performance Credits & Penalties",
      description: "What happens when the provider misses SLA targets?",
      options: [
        { id: "provider-favourable", label: "Service Credits Only", description: "Provider issues service credits against future invoices for SLA misses — no cash refunds, credits are sole remedy", favorability: "client" },
        { id: "balanced", label: "Credits + Remediation Plan", description: "Service credits for SLA misses plus mandatory remediation plan; repeated misses in 3 consecutive months trigger termination right", favorability: "balanced" },
        { id: "client-favourable", label: "Cash Penalties + Step-In Rights", description: "Cash penalties (not just credits) for SLA misses; client has step-in rights to manage critical functions directly if provider fails 3 months running", favorability: "counter-party" },
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

TARGET DOCUMENT LENGTH: 25-40 pages plus schedules (service descriptions, SLA metrics table, escalation matrix, pricing schedule).

KEY CASE LAW:
- Tercon Contractors v. British Columbia (2010 SCC): Limitation of liability and exclusion clauses in service contracts — must be clear, unambiguous, and not unconscionable
- Guarantee Company of North America v. Gordon Capital (1999 SCC): Interpretation of indemnification provisions in commercial contracts
- Bhasin v. Hrynew (2014 SCC): Duty of honest performance in commercial contracts — relevant to service delivery obligations

COMMON PITFALLS:
- Scope definition too vague — leads to disputes about what is "in scope" vs. "out of scope" (and therefore extra cost)
- No change management process for scope modifications — client requests treated as free extras until provider pushes back
- Knowledge transfer obligations not specified — client trapped with provider because all institutional knowledge resides with provider staff
- SLA metrics not objectively measurable — disputes over whether targets were met

MANDATORY PROVISIONS:
1. Detailed service scope with in-scope and out-of-scope definitions
2. Staffing requirements (dedicated vs. shared resources)
3. Response times by severity level
4. Escalation matrix with named contacts
5. Change management process
6. Performance metrics and reporting
7. Knowledge transfer obligations
8. Transition assistance on termination (minimum 90 days)
9. Data handling and confidentiality
10. Insurance requirements (E&O, CGL, cyber)

ADDITIONAL CLAUSE POSITIONS:
- staffingPosition: Draft staffing clause per selection. If named key personnel, include a replacement approval process and a minimum notice period before personnel changes. If dedicated team, specify the team composition, minimum qualifications, and the provider's obligation to maintain staffing levels at all times.
- transitionAssistancePosition: Draft transition clause per selection. Specify deliverables (documentation, data exports, training sessions, parallel running period). Address what happens to provider-created tools, scripts, and automation during transition — does the client get a license? Include an obligation for the provider to maintain service levels throughout the transition period.
- performanceCreditsPosition: Draft SLA remedies per selection. Define the credit calculation formula (e.g., 5% of monthly fee per 0.1% below target). Cap total credits at a percentage of monthly fees (e.g., 30%). If cash penalties, specify the penalty amounts and payment timeline. If step-in rights, define the scope and duration of client's step-in authority.`,
};

const ENTERPRISE_LICENSING_SLA_CONFIG: AgreementConfig = {
  id: "enterprise-licensing-sla",
  partyLabels: {
    partyALabel: "Licensor (Software Company)",
    partyAPlaceholder: "Enterprise Software Inc.",
    partyBLabel: "Licensee (Enterprise Customer)",
    partyBPlaceholder: "Major Corporation Ltd.",
  },
  estimatedGenerationTime: 55,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "softwareDescription", "licenseFee"],
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
    {
      id: "sourceCodeEscrowPosition",
      label: "Source Code Escrow",
      description: "Is the software source code held in escrow for the licensee's protection?",
      options: [
        { id: "licensor-favourable", label: "No Escrow", description: "No source code escrow — licensee relies entirely on licensor for maintenance and support", favorability: "client" },
        { id: "balanced", label: "Standard Escrow with Release Triggers", description: "Source code deposited with a third-party escrow agent; released to licensee on licensor insolvency, material breach, or discontinuation of support", favorability: "balanced" },
        { id: "licensee-favourable", label: "Enhanced Escrow with Regular Updates", description: "Source code escrow with quarterly deposits, verification testing, and broad release triggers including change of control and failure to meet SLA for 3 consecutive months", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "maintenanceSupportPosition",
      label: "Maintenance & Support",
      description: "What level of ongoing maintenance and support is included?",
      options: [
        { id: "licensor-favourable", label: "Basic Support (Business Hours)", description: "Bug fixes and security patches only; support available Monday-Friday 9am-5pm; 24-hour response for critical issues", favorability: "client" },
        { id: "balanced", label: "Standard Support (Extended Hours)", description: "Bug fixes, security patches, and minor updates; support 7am-9pm weekdays; 4-hour response for critical issues; dedicated support contact", favorability: "balanced" },
        { id: "licensee-favourable", label: "Premium Support (24/7)", description: "All updates and new versions included; 24/7 support with 1-hour response for critical issues; dedicated support engineer; on-site support available", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "liabilityCapEntPosition",
      label: "Liability Cap",
      description: "What is the maximum liability each party faces under the agreement?",
      options: [
        { id: "licensor-favourable", label: "Cap at 12 Months Fees", description: "Total liability capped at the license and maintenance fees paid in the preceding 12 months — standard SaaS-style cap", favorability: "client" },
        { id: "balanced", label: "Cap at 2x Annual Fees", description: "Total liability capped at twice the annual fees — reflects the higher value and complexity of enterprise deployments", favorability: "balanced" },
        { id: "licensee-favourable", label: "Cap at Total Contract Value", description: "Total liability capped at the full contract value across all years — maximum protection for the licensee's investment", favorability: "counter-party" },
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

TARGET DOCUMENT LENGTH: 30-50 pages plus exhibits (license grant schedule, SLA metrics, support procedures, fee schedule, source code escrow agreement).

KEY CASE LAW:
- Tercon Contractors v. British Columbia (2010 SCC): Enforceability of limitation and exclusion clauses — must be clear, not unconscionable, and consistent with the parties' reasonable expectations
- Sattva Capital v. Creston Moly (2014 SCC): Contract interpretation principles — factual matrix matters for enterprise agreements with complex commercial contexts
- Weyerhaeuser v. Ontario (2006 SCC): Interpretation of scope and limitation clauses in commercial licensing agreements

COMMON PITFALLS:
- License grant scope too narrow — licensee cannot deploy across all needed environments (dev, test, staging, production)
- Audit true-up penalties disproportionate to the value of over-deployment
- No source code escrow — licensee completely dependent on licensor's continued solvency
- Maintenance and support terms vague — no defined response times or resolution targets
- IP indemnification excluded or inadequate — licensee exposed to infringement claims without recourse

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
11. Term and renewal (multi-year with auto-renewal is common)
12. Data protection and PIPEDA compliance

ADDITIONAL CLAUSE POSITIONS:
- sourceCodeEscrowPosition: Draft escrow clause per selection. If standard, specify the escrow agent (e.g., Iron Mountain, NCC Group), release conditions, and the licensee's rights upon release (non-exclusive license to use, modify, and maintain the source code for internal purposes only). If enhanced, include verification testing requirements and specify who bears the escrow agent fees.
- maintenanceSupportPosition: Draft support clause per selection. Include a severity classification matrix (Critical/High/Medium/Low) with response and resolution targets for each. Specify the escalation path. Address what happens if support levels degrade (service credits, termination right). Include a technology roadmap commitment — licensor will support the current version for a minimum period.
- liabilityCapEntPosition: Draft liability cap per selection. Carve out from the cap: IP indemnification, breach of confidentiality, willful misconduct, and data breach. Specify whether the cap is per-incident or aggregate. Address the interaction between liability cap and insurance requirements.`,
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
  estimatedGenerationTime: 35,
  requiredFields: ["partyAName", "jurisdiction", "platformDescription", "platformUrl"],
  wizardSteps: ["plat-business", "plat-privacy", "plat-terms"],
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
    {
      id: "acceptanceMechanism",
      label: "Terms Acceptance Method",
      description: "How do users accept the terms of service?",
      options: [
        { id: "platform-favourable", label: "Browsewrap (Terms Link in Footer)", description: "Terms are accessible via a link; use of the platform constitutes acceptance — easiest to implement but weakest enforceability per Rudder v. Microsoft", favorability: "client" },
        { id: "balanced", label: "Sign-In Wrap", description: "Terms link displayed at sign-up/sign-in with statement that proceeding constitutes acceptance — moderate enforceability, good UX", favorability: "balanced" },
        { id: "user-favourable", label: "Clickwrap (Checkbox + Button)", description: "User must check a box confirming they have read and agree to the terms before creating an account — strongest enforceability, per Rudder v. Microsoft", favorability: "counter-party" },
      ],
      defaultPosition: "user-favourable",
    },
    {
      id: "classActionWaiverPosition",
      label: "Class Action Waiver",
      description: "Can users bring class action lawsuits against the platform?",
      options: [
        { id: "platform-favourable", label: "Full Class Action Waiver", description: "Users waive the right to participate in class actions — all disputes must be brought individually. WARNING: may be unenforceable per Uber v. Heller for consumer contracts", favorability: "client" },
        { id: "balanced", label: "Waiver with Small Claims Exception", description: "Class action waiver applies but users may bring individual claims in small claims court without waiving class rights — Seidel v. TELUS carve-out", favorability: "balanced" },
        { id: "user-favourable", label: "No Class Action Waiver", description: "Users retain full class action rights — no restriction on collective dispute resolution", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
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
- governingLawPosition: Draft governing law and jurisdiction clause per selection. If platform's home province, include a Douez v. Facebook risk acknowledgment for consumer-facing terms. If user's province, address conflict-of-laws implications.
- acceptanceMechanism: Draft the acceptance mechanism language per selection. If browsewrap, include "By using this platform, you agree to be bound by these Terms" language prominently. If sign-in wrap, specify the exact language displayed at the sign-in/sign-up screen. If clickwrap, specify the checkbox label text and require that the checkbox is unchecked by default (no pre-checked boxes — per CASL consent requirements). Include a mechanism for recording and timestamping acceptance for evidentiary purposes.
- classActionWaiverPosition: Draft class action waiver per selection. If full waiver, include a prominent conspicuousness requirement (bold text, separate section) to improve enforceability. Include Uber v. Heller unconscionability risk acknowledgment — courts may strike the waiver if it creates an undue barrier to dispute resolution. If waiver with small claims exception, specify the small claims court jurisdiction threshold. Ensure the waiver is severable so that if struck, the remaining dispute resolution terms survive.

TARGET DOCUMENT LENGTH: 15-25 pages. Terms must be comprehensive but written in reasonably plain language to satisfy Uber v. Heller unconscionability scrutiny.

JURISDICTION-SPECIFIC CONSIDERATIONS:
- Quebec: Terms must be available in French (Charter of the French Language). Consumer protection provisions under Quebec CPA may override certain liability limitations.
- British Columbia: Business Practices and Consumer Protection Act imposes additional disclosure requirements for distance sales.
- Alberta: Consumer Protection Act, Fair Trading Act — ensure terms comply with provincial consumer standards.
- All provinces: Provincial consumer protection legislation may render certain warranty disclaimers and liability limitations void for consumer transactions.`,
};

const PRIVACY_POLICY_CONFIG: AgreementConfig = {
  id: "privacy-policy",
  partyLabels: {
    partyALabel: "Organization (Data Controller)",
    partyAPlaceholder: "YourApp Inc.",
    partyBLabel: "Individuals (Data Subjects)",
    partyBPlaceholder: "Users / customers / visitors",
  },
  estimatedGenerationTime: 30,
  requiredFields: ["partyAName", "jurisdiction", "dataTypesCollected", "platformUrl"],
  wizardSteps: ["plat-business", "plat-privacy", "plat-terms"],
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
  estimatedGenerationTime: 50,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "partnershipName", "businessPurpose"],
  wizardSteps: ["plat-business", "plat-structure"],
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
  estimatedGenerationTime: 50,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "serviceDescription"],
  wizardSteps: ["plat-business", "plat-structure", "plat-terms"],
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
  estimatedGenerationTime: 55,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "campaignPlatforms", "deliverableTypes", "compensationAmount"],
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
// OFFER LETTER
// ──────────────────────────────────────────────

const OFFER_LETTER_CONFIG: AgreementConfig = {
  id: "offer-letter",
  partyLabels: {
    partyALabel: "Employer",
    partyAPlaceholder: "Company Name Inc.",
    partyBLabel: "Candidate",
    partyBPlaceholder: "Candidate Full Name",
  },
  estimatedGenerationTime: 15,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "positionTitle", "baseSalary", "startDate"],
  wizardSteps: ["emp-comp"],
  clausePositions: [
    {
      id: "probationPosition",
      label: "Probation Period",
      description: "How long is the probationary period before full employment protections apply?",
      options: [
        { id: "employer-favourable", label: "Extended Probation (6 months)", description: "Maximum probation window — employer retains flexibility to assess fit with statutory minimum termination rights", favorability: "client" },
        { id: "balanced", label: "Standard Probation (3 months)", description: "Industry-standard probation period balancing employer assessment needs with candidate certainty", favorability: "balanced" },
        { id: "employee-favourable", label: "No Probation", description: "Full employment protections from day one — no probationary termination rights", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "startDateFlexibility",
      label: "Start Date Flexibility",
      description: "How much flexibility does the candidate have on their start date?",
      options: [
        { id: "employer-favourable", label: "Fixed Start Date", description: "Start date is firm and non-negotiable — candidate must begin on the specified date or the offer lapses", favorability: "client" },
        { id: "balanced", label: "Flexible Within 2 Weeks", description: "Start date may be adjusted by mutual agreement within a 2-week window", favorability: "balanced" },
        { id: "employee-favourable", label: "Flexible Within 30 Days", description: "Candidate may defer start date by up to 30 days to accommodate notice period or personal transition", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "conditionsOfEmployment",
      label: "Conditions of Employment",
      description: "What conditions must the candidate satisfy before employment is confirmed?",
      options: [
        { id: "employer-favourable", label: "Enhanced Conditions (Reference + Background)", description: "Offer is conditional on satisfactory reference checks AND criminal background verification — maximum employer due diligence", favorability: "client" },
        { id: "balanced", label: "Standard Conditions (Background Check)", description: "Offer is conditional on a satisfactory criminal background check only", favorability: "balanced" },
        { id: "employee-favourable", label: "Minimal Conditions", description: "Offer is unconditional or subject only to proof of legal work authorization — fastest path to confirmed employment", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — OFFER OF EMPLOYMENT LETTER:
This is a formal offer letter, NOT a full employment agreement. It should be concise (2-4 pages), professional, and legally sound. The offer letter creates a binding commitment on the terms it contains — treat it with the same legal rigor as a contract.

CRITICAL — Krishnamoorthy v. Olympus Canada Inc.:
- An offer letter that specifies compensation terms IS a binding agreement on those terms, even absent a signed employment contract.
- Do NOT include vague or aspirational language about compensation — every stated term (salary, bonus, equity) may be enforced as a contractual commitment.
- If the employer intends for terms to be subject to a subsequent employment agreement, state that explicitly and clearly.

MANDATORY CONTENT:
1. Position title and description of the role
2. Compensation: base salary (annualized), pay frequency, bonus structure (if applicable), equity/stock option grant (if applicable) with vesting schedule reference
3. Start date (per startDateFlexibility position selected)
4. Reporting structure: who the candidate reports to, direct/indirect reports if applicable
5. Conditions of employment (per conditionsOfEmployment position selected): background check, reference verification, proof of work authorization
6. Benefits summary: health/dental/vision, vacation entitlement, any additional perks — reference full benefits package documentation
7. Probation period (per probationPosition position selected) with clear explanation of what probation means for termination rights
8. Employment status: at-will (if applicable) or notice period for termination without cause
9. Acceptance deadline: specify a clear date by which the candidate must accept or the offer lapses
10. Signature blocks for authorized company representative and candidate

TONE & FORMAT:
- Professional and welcoming — this is the candidate's first formal impression of the employer
- Use plain language; avoid excessive legalese
- Keep it concise: 2-4 pages maximum
- Reference (but do not reproduce) the full employment agreement, benefits documentation, and equity plan that will follow

CONDITIONAL CLAUSES:
- IF equity is offered → reference the stock option plan and include vesting schedule summary, cliff period, and exercise window
- IF relocation is involved → include relocation allowance or stipend terms
- IF the role is remote/hybrid → specify work location expectations and any in-office requirements
- IF the candidate is in a regulated profession → note any licensing or certification requirements as conditions`,
};

// ──────────────────────────────────────────────
// ARTICLES OF AMENDMENT
// ──────────────────────────────────────────────

const ARTICLES_AMENDMENT_CONFIG: AgreementConfig = {
  id: "articles-amendment",
  partyLabels: {
    partyALabel: "Corporation",
    partyAPlaceholder: "Corporation Name Inc.",
    partyBLabel: "",
    partyBPlaceholder: "",
  },
  estimatedGenerationTime: 20,
  requiredFields: ["partyAName", "jurisdiction", "corporationNumber", "amendmentDescription"],
  wizardSteps: ["corp-governance"],
  clausePositions: [
    {
      id: "amendmentScope",
      label: "Amendment Scope",
      description: "How broad are the changes being made to the articles?",
      options: [
        { id: "narrow", label: "Single Amendment (One Change)", description: "Articles are being amended for one specific purpose — name change, share class addition, or director count change", favorability: "balanced" },
        { id: "bundled", label: "Multiple Amendments (Bundle Changes)", description: "Several related amendments consolidated into a single filing — reduces cost and administrative burden", favorability: "balanced" },
        { id: "comprehensive", label: "Comprehensive Restructuring", description: "Broad-based amendment touching share structure, governance, and business restrictions — typically accompanies a major transaction", favorability: "client" },
      ],
      defaultPosition: "narrow",
    },
    {
      id: "effectiveDate",
      label: "Effective Date",
      description: "When should the amendments take effect?",
      options: [
        { id: "immediate", label: "Immediate on Filing", description: "Amendments become effective as soon as the certificate of amendment is issued by the Director", favorability: "balanced" },
        { id: "delayed", label: "Delayed Effective Date", description: "Amendments become effective on a specified future date — useful for coordinating with closing conditions or fiscal year-end", favorability: "balanced" },
        { id: "upon-approval", label: "Upon Shareholder Approval", description: "Amendments are filed only after formal shareholder approval is obtained — ensures governance compliance before filing", favorability: "counter-party" },
      ],
      defaultPosition: "immediate",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — ARTICLES OF AMENDMENT:
This is a corporate amendment filing document, NOT a contract between parties. Articles of Amendment modify an existing corporation's articles of incorporation.

GOVERNING LEGISLATION:
- CBCA: Canada Business Corporations Act, s.173 — amendment requires special resolution (2/3 of votes cast) unless the articles require a greater majority
- OBCA: Ontario Business Corporations Act, s.168 — similar special resolution requirement
- Determine the governing statute from the corporation's jurisdiction of incorporation and apply the correct section references throughout

TYPES OF AMENDMENTS COVERED:
1. Corporation name change: new name, numbered company to named (or vice versa), French/English form changes
2. Share structure changes: creation of new share classes, modification of rights/privileges/restrictions/conditions attached to existing classes, deletion of share classes, share consolidation or subdivision
3. Director count changes: change from fixed to minimum/maximum range, increase or decrease in number of directors, residency requirement adjustments (CBCA s.105(3) — 25% Canadian resident requirement)
4. Business restriction changes: adding, removing, or modifying restrictions on the business the corporation may carry on
5. Other provisions: changing the registered office province/territory, adding or removing transfer restrictions, adding or removing borrowing power limitations

MANDATORY CONTENT:
1. Corporation name and corporation number
2. Date of incorporation or amalgamation
3. Governing statute (CBCA or OBCA) with specific section reference
4. Current provision being amended (verbatim from existing articles)
5. Amended provision (new language replacing the current provision)
6. Resolution reference: special resolution date, whether passed at a meeting of shareholders or by written resolution in lieu of meeting (CBCA s.142 / OBCA s.104)
7. Director certification that the amendment was duly authorized
8. Filing instructions: where to file (Corporations Canada for CBCA, ServiceOntario for OBCA), applicable fees, required forms (Form 4 for CBCA, Form 3 for OBCA)
9. Effective date provision (per effectiveDate position selected)

AMENDMENT SCOPE (per amendmentScope position selected):
- Single Amendment: Draft a clean, focused amendment to one article only. Keep the document tight.
- Multiple Amendments: Group related amendments logically. Number each amendment clearly. Include a recital explaining the business rationale for bundling.
- Comprehensive Restructuring: Provide a full restatement of the amended articles. Include a blackline comparison appendix showing changes from the original articles. Add a cover memo summarizing each change.

CONDITIONAL CLAUSES:
- IF share rights are being modified → include class vote requirements (CBCA s.176) and dissent rights notice (CBCA s.190)
- IF name change → include NUANS name search report reference and name reservation number
- IF director count change → confirm that the new count complies with minimum requirements (CBCA s.102 — minimum 1 for non-distributing, minimum 3 for distributing)
- IF adding transfer restrictions → ensure compliance with exemption from prospectus requirements for private issuer status`,
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
  // Employment — Offer Letter
  "offer-letter": OFFER_LETTER_CONFIG,
  // Corporate — Articles of Amendment
  "articles-amendment": ARTICLES_AMENDMENT_CONFIG,
};

/** Get the config for a specific agreement, or null if not found */
export function getAgreementConfig(agreementId: string): AgreementConfig | null {
  return AGREEMENT_CONFIGS[agreementId] || null;
}

/** Safely get config for an agreement, returning a sensible default if not found */
export function getConfigForAgreement(agreementId: string): AgreementConfig {
  const config = AGREEMENT_CONFIGS[agreementId];
  if (config) return config;

  // Return a sensible default config
  return {
    id: agreementId,
    partyLabels: {
      partyALabel: "Party A",
      partyAPlaceholder: "Company Name",
      partyBLabel: "Party B",
      partyBPlaceholder: "Other Party",
    },
    draftingInstructions: "",
    clausePositions: [],
    wizardSteps: [],
    estimatedGenerationTime: 30,
    requiredFields: [],
  };
}

/**
 * Validate that all required wizard steps have been completed in the provided data.
 * Returns { valid: true } or { valid: false, missingSteps: string[], missingFields: string[] }.
 */
export function validateWizardData(
  config: AgreementConfig,
  data: Record<string, unknown>
): { valid: boolean; missingSteps: string[]; missingFields: string[] } {
  const missingSteps: string[] = [];
  const missingFields: string[] = [];

  // Check that each wizard step has corresponding data
  for (const step of config.wizardSteps) {
    if (!(step in data) || data[step] === undefined || data[step] === null) {
      missingSteps.push(step);
    }
  }

  // Check that all required fields are present and non-empty
  if (config.requiredFields) {
    for (const field of config.requiredFields) {
      const value = data[field];
      if (value === undefined || value === null || value === "") {
        missingFields.push(field);
      }
    }
  }

  return {
    valid: missingSteps.length === 0 && missingFields.length === 0,
    missingSteps,
    missingFields,
  };
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
    "plat-business", "plat-privacy", "plat-terms", "plat-structure",
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
