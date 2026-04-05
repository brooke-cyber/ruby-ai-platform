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
  estimatedGenerationTime: 35,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "startDate", "baseSalary"],
  wizardSteps: ["emp-comp", "emp-clause", "emp-covenant", "emp-ip"],
  clausePositions: [
    {
      id: "terminationPosition",
      label: "Termination Without Cause",
      description: "How much notice or severance does the employee get if you let them go without a specific reason? This is the single highest-cost clause in the agreement.",
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
      description: "A trial period where termination is easier. Note: ESA minimums still apply after 3 months regardless of what the contract says.",
      options: [
        { id: "employer-favourable", label: "Maximum Probation (6 months)", description: "Longest period — but ESA notice requirements apply after 3 months, so months 4-6 only reduce common law notice", favorability: "client" },
        { id: "balanced", label: "Standard Probation (3 months)", description: "Industry standard — aligns with the ESA 3-month threshold for termination notice", favorability: "balanced" },
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
        { id: "employer-favourable", label: "Exempt (No Overtime)", description: "Employee is classified as exempt from overtime — must qualify under a specific ESA exemption (managerial, professional, IT). Misclassifying a non-exempt employee triggers retroactive overtime claims.", favorability: "client" },
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
    { id: "benefitsContinuationOnTermPosition", label: "Benefits Continuation on Termination", description: "How long do health and dental benefits continue after termination without cause? Bain v. UBS Securities confirms benefits are part of compensation during notice.", options: [{ id: "employer-favourable", label: "ESA Minimum Only", description: "Benefits during statutory ESA notice period only", favorability: "client" }, { id: "balanced", label: "Through Severance Period", description: "Benefits through contractual notice/severance period", favorability: "balanced" }, { id: "employee-favourable", label: "Extended (24 months)", description: "Benefits for longer of severance or 24 months", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "moralRightsWaiverPosition", label: "Moral Rights Waiver", description: "How broadly does the employee waive their moral rights under Copyright Act s.14.1? Moral rights (integrity, attribution, association) cannot be assigned, only waived.", options: [{ id: "employer-favourable", label: "Full Waiver", description: "Complete waiver — company can modify work freely without attribution", favorability: "client" }, { id: "balanced", label: "Waiver with Attribution", description: "Waived except attribution where work is used substantially intact", favorability: "balanced" }, { id: "employee-favourable", label: "Limited Waiver", description: "Waived only for ordinary business use — employee retains integrity right", favorability: "counter-party" }], defaultPosition: "employer-favourable" },
    { id: "postEmploymentCooperationPosition", label: "Post-Employment Cooperation", description: "Must the employee help with litigation, audits, or transition after leaving?", options: [{ id: "employer-favourable", label: "Broad (Unlimited)", description: "Unlimited cooperation on litigation and audits", favorability: "client" }, { id: "balanced", label: "12 Months", description: "12 months at per-diem rate", favorability: "balanced" }, { id: "employee-favourable", label: "Transition Only", description: "30-day transition only", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "returnOfPropertyPosition", label: "Return of Company Property", description: "How quickly must the employee return laptops, files, and credentials after leaving?", options: [{ id: "employer-favourable", label: "Immediate + Cert", description: "Within 24 hours with certification", favorability: "client" }, { id: "balanced", label: "5 Business Days", description: "5 business days with checklist", favorability: "balanced" }, { id: "employee-favourable", label: "14 Days", description: "14-day return period", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "socialMediaPosition", label: "Social Media / Public Statements", description: "Restrictions on what the employee can say publicly? Must not chill ESA/OHSA/HRC complaint rights.", options: [{ id: "employer-favourable", label: "Comprehensive Policy", description: "Non-disparagement survives 24 months", favorability: "client" }, { id: "balanced", label: "Mutual Non-Disparagement", description: "Mutual 12-month non-disparagement", favorability: "balanced" }, { id: "employee-favourable", label: "Confidentiality Only", description: "No restrictions beyond confidentiality", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "gardenLeavePosition", label: "Garden Leave", description: "Can the employer keep the employee at home on full pay during the notice period? Strengthens enforceability of restrictive covenants.", options: [{ id: "employer-favourable", label: "Full Garden Leave", description: "Full notice period with pay", favorability: "client" }, { id: "balanced", label: "Capped 4 Weeks", description: "Max 4 weeks garden leave", favorability: "balanced" }, { id: "employee-favourable", label: "No Garden Leave", description: "No garden leave provision", favorability: "counter-party" }], defaultPosition: "balanced" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — STANDARD EMPLOYMENT AGREEMENT:
This is a standard employment agreement for a non-executive hire.

KEY CASE LAW: Waksdale v. Swegon (2020 ONCA 391) — holistic termination review. Shafron v. KRG (2009 SCC 6) — restrictive covenant reasonableness. Matthews v. Ocean Nutrition (2020 SCC 26) — bonus during notice. ESA s.67.2 — non-compete void for non-C-suite. Honda v. Keays (2008 SCC 39) — manner of dismissal. Rahman v. Cannon Design (2022 ONCA 451) — salary increases enforceable. Lyons v. Multari (2000 ONCA) — non-solicitation preferred.

PROVINCIAL: Ontario ESA 2000 s.54-62; BC ESA RSBC 1996 c.113 s.63; Alberta ESC RSA 2000 c.E-9 s.56; Quebec CQLR c.N-1.1 Art. 82. BC Pay Transparency Act (2023) — salary range in postings.

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
- severanceFormulaPosition: Draft severance clause per selection. If ESA minimums, ensure the clause explicitly references the statutory formula and does NOT attempt to contract below it (per Waksdale). If enhanced formula, specify the calculation clearly (base salary only vs. total compensation including bonus). If Bardal factors, the agreement should NOT cap reasonable notice — instead, it defers to common law. Include interaction with the termination clause and any mitigation obligations.
- benefitsContinuationOnTermPosition: Reference Bain v. UBS Securities Canada on benefits during notice. Address insurer limitations.
- moralRightsWaiverPosition: Per Copyright Act s.14.1. Cover integrity, attribution, association rights.
- postEmploymentCooperationPosition: Compensate time. Must not conflict with mitigation duty.
- returnOfPropertyPosition: BYOD data deletion. Do not violate ESA s.13 wage deductions.
- socialMediaPosition: Must not chill ESA/OHSA/HRC complaint rights.
- gardenLeavePosition: Full pay. Address covenant period offset.`,
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
    {
      id: "ipAssignmentPosition",
      label: "IP Assignment for Term Work",
      description: "Who owns intellectual property created during the fixed-term engagement?",
      options: [
        { id: "employer-favourable", label: "Full Assignment + Moral Rights Waiver", description: "All IP created during the term transfers to employer; moral rights waiver under Copyright Act s.14.1; includes inventions, software, designs, and trade secrets", favorability: "client" },
        { id: "balanced", label: "Work Product Assignment Only", description: "IP created in the course of employment duties transfers to employer; pre-existing IP retained by employee with license grant; moral rights waiver limited to assigned work", favorability: "balanced" },
        { id: "employee-favourable", label: "Limited to Deliverables", description: "Only specifically identified deliverables are assigned; all other IP (including improvements and methodologies) retained by employee", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "restrictiveCovenantPosition",
      label: "Post-Term Restrictive Covenants",
      description: "What restrictions apply to the fixed-term employee after the contract ends?",
      options: [
        { id: "employer-favourable", label: "Non-Solicitation + Non-Compete (12 months)", description: "12-month non-solicitation of clients and employees plus non-compete — enforceability subject to Shafron reasonableness and ESA s.67.2 for Ontario non-C-suite", favorability: "client" },
        { id: "balanced", label: "Non-Solicitation Only (6 months)", description: "6-month non-solicitation of clients and key employees; no non-compete — balances employer protection with employee mobility per Lyons v. Multari", favorability: "balanced" },
        { id: "employee-favourable", label: "Confidentiality Only", description: "No post-term non-solicitation or non-compete; only ongoing confidentiality obligations survive — maximum employee freedom", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "earlyTerminationCompPosition",
      label: "Compensation on Early Termination",
      description: "What components of compensation are included if the employer terminates before the term expires?",
      options: [
        { id: "employer-favourable", label: "Base Salary Only", description: "Early termination payment limited to base salary for the remaining term or notice period — no bonus, commission, or benefits continuation", favorability: "client" },
        { id: "balanced", label: "Base Salary + Pro-Rated Bonus", description: "Base salary for remaining term plus pro-rated bonus based on time served in the performance period — per Matthews v. Ocean Nutrition Capital principles on bonus entitlement during notice", favorability: "balanced" },
        { id: "employee-favourable", label: "Full Compensation Package", description: "Base salary, full target bonus, benefits continuation, and any other compensation through the end of the original term — maximum employee protection per Howard v. Benson Group", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "returnOfPropertyPosition",
      label: "Return of Company Property",
      description: "What are the employee's obligations to return company property on termination or expiry?",
      options: [
        { id: "employer-favourable", label: "Immediate Return + Certification", description: "All company property (devices, documents, access credentials, confidential materials) returned within 24 hours of termination; written certification of compliance; employer may withhold final payment until property returned", favorability: "client" },
        { id: "balanced", label: "Return Within 5 Business Days", description: "Company property returned within 5 business days of termination or expiry; employer provides a checklist; reasonable time to separate personal data from company devices", favorability: "balanced" },
        { id: "employee-favourable", label: "Reasonable Return Period (14 Days)", description: "14-day return period with employer-arranged pickup or prepaid shipping; employee retains personal copies of non-confidential work samples for portfolio purposes", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "gardenLeavePosition",
      label: "Garden Leave",
      description: "Can the employer place the fixed-term employee on garden leave during any notice period?",
      options: [
        { id: "employer-favourable", label: "Full Garden Leave Rights", description: "Employer may place employee on garden leave for the entire notice period with full pay — employee must remain available but is excused from active duties; restricts employee from starting new employment", favorability: "client" },
        { id: "balanced", label: "Garden Leave with Cap (4 Weeks)", description: "Garden leave limited to 4 weeks maximum; employee receives full compensation during garden leave; non-compete period reduced by the duration of garden leave served", favorability: "balanced" },
        { id: "employee-favourable", label: "No Garden Leave", description: "No garden leave provision — employer must either provide active work or terminate and pay out; employee free to commence new employment once notice period ends", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "socialMediaPosition",
      label: "Social Media / Public Statements",
      description: "What restrictions apply to employee public statements about the employer during and after the term?",
      options: [
        { id: "employer-favourable", label: "Strict Restrictions", description: "Employee may not make any public statements (including social media) about the employer without prior written approval; non-disparagement survives termination indefinitely", favorability: "client" },
        { id: "balanced", label: "Mutual Non-Disparagement", description: "Mutual non-disparagement obligation during and for 12 months post-term; employee may update professional profiles (e.g., LinkedIn) with factual role descriptions", favorability: "balanced" },
        { id: "employee-favourable", label: "No Restrictions Beyond Confidentiality", description: "No specific social media or public statement restrictions beyond the duty not to disclose confidential information; employee retains full freedom of expression", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — FIXED-TERM EMPLOYMENT AGREEMENT:
This is a fixed-term (contract) employment agreement with a defined end date.

CRITICAL LEGAL RISKS:
- Howard v. Benson Group (2016 ONCA 236): If fixed-term contract lacks an early termination clause, employer must pay the ENTIRE remaining term. This is the #1 risk in fixed-term agreements. The Court of Appeal held that absent an enforceable early termination clause, damages equal the full salary and benefits for the unexpired term.
- Ceccol v. Ontario Gymnastic Federation (2001 ONCA): Successive renewals can convert fixed-term to indefinite employment. The court found that multiple renewals over 16 years created a reasonable expectation of continued employment. Include anti-stacking language.
- Waksdale v. Swegon (2020 ONCA 391): The holistic approach applies — if ANY termination provision in the agreement violates ESA minimums, the ENTIRE termination framework is void, even provisions that independently comply.
- ESA 2000 s.54-62: ESA minimums STILL apply to fixed-term employees after 3+ months. This includes termination notice and severance pay obligations.
- Matthews v. Ocean Nutrition Capital Ltd. (2020 SCC 26): Bonus and incentive compensation entitlements during the notice period — an employee is entitled to compensation they would have received during the reasonable notice period, including bonuses, unless there is clear and unambiguous language excluding the entitlement.
- Monterosso v. Metro Freightliner Hamilton Inc. (2023 ONCA 413): Reinforced that fixed-term employees terminated without an enforceable early termination clause are entitled to damages for the balance of the term with no duty to mitigate.

PROVINCIAL VARIATIONS:
- Ontario: ESA 2000 applies; s.67.2 non-compete prohibition for non-C-suite; probation period max 3 months for ESA notice exemption.
- BC: Employment Standards Act, RSBC 1996, c.113 — different notice periods (1 week after 3 months, up to 8 weeks after 8 years); no equivalent to Ontario s.67.2 non-compete ban.
- Alberta: Employment Standards Code, RSA 2000, c.E-9 — different termination notice thresholds; group termination rules differ.
- Quebec: An Act Respecting Labour Standards, CQLR c.N-1.1 — distinct rules on fixed-term contract renewal; Art. 2091 CCQ governs reasonable notice; psychological harassment provisions mandatory.

PAY TRANSPARENCY:
- BC Pay Transparency Act (2023): Employers must include expected salary or salary range in job postings; applies to fixed-term postings.
- PEI Employment Standards Act amendment (2022): Pay range disclosure required.
- Ontario: Pay transparency legislation anticipated — draft compensation terms with precision.

PARTY DYNAMICS:
- Employer wants flexibility to end early without paying the full remaining term
- Employee wants certainty of income for the agreed duration

MANDATORY PROVISIONS:
1. Clear start and end date
2. Early termination clause (CRITICAL — without it, employer pays full remaining term per Howard v. Benson)
3. Renewal/non-renewal notice period
4. Anti-succession clause to prevent deemed indefinite conversion (Ceccol)
5. Whether benefits continue through the full term or only a portion
6. What happens to bonus/commission on early termination (Matthews v. Ocean Nutrition)
7. IP assignment for work created during the term with moral rights waiver (Copyright Act s.14.1)
8. Return of company property and confidential information obligations
9. Post-term restrictive covenants (subject to ESA s.67.2 for Ontario non-C-suite)
10. Garden leave provisions if applicable

ADDITIONAL CLAUSE POSITIONS:
- successionPosition: Draft anti-succession language matching the selected renewal limit. If strong, include explicit language that this contract cannot be renewed more than once and reference Ceccol v. Ontario Gymnastic Federation risk. If no limit, include a disclaimer that successive renewals do not create indefinite employment expectations (note: this disclaimer may not withstand judicial scrutiny per Ceccol).
- benefitsContinuationPosition: Specify benefits coverage period clearly. If partial, include transition language and information about conversion to individual coverage. If no benefits, state explicitly that the employee is responsible for their own insurance.
- ipAssignmentPosition: Draft IP assignment clause per selection. For full assignment, include moral rights waiver under Copyright Act s.14.1 and invention assignment covering patents, trade secrets, and industrial designs. For limited assignment, define "deliverables" precisely and include a schedule.
- restrictiveCovenantPosition: Draft post-term covenants per selection. If Ontario non-C-suite, non-compete is VOID per ESA s.67.2 — substitute enhanced non-solicitation per Lyons v. Multari. Apply Shafron v. KRG reasonableness test to all restrictive covenants. Duration must be proportionate to the length of the fixed term.
- earlyTerminationCompPosition: Draft compensation on early termination per selection. Apply Matthews v. Ocean Nutrition principles — ensure bonus exclusion language is clear and unambiguous if bonus is excluded. Specify whether benefits continuation applies during the payout period. Address interaction with ESA minimum notice/severance.
- returnOfPropertyPosition: Draft property return clause per selection. Include comprehensive list of company property (devices, documents, credentials, confidential materials, software licenses). Address data deletion from personal devices. Specify consequences of non-compliance.
- gardenLeavePosition: Draft garden leave clause per selection. Specify that compensation continues during garden leave. Address whether garden leave counts toward or reduces any post-employment restrictive covenant period. Include obligation for employee to remain available for reasonable inquiries during garden leave.
- socialMediaPosition: Draft social media / public statements clause per selection. Mutual non-disparagement clauses are increasingly scrutinized — ensure they do not chill protected whistleblower activity or ESA complaint rights. Non-disparagement must not prevent the employee from filing a complaint under the ESA, OHSA, or Human Rights Code.`,
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
  wizardSteps: ["emp-ip"],
  clausePositions: [
    {
      id: "controlPosition",
      label: "Degree of Control",
      description: "How much control does the client have over how the work is done? More control = higher risk that CRA reclassifies this as employment.",
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
    { id: "moralRightsPosition", label: "Moral Rights Waiver", description: "Copyright Act s.14.1 moral rights waiver for contractor deliverables?", options: [{ id: "client-favourable", label: "Full Waiver", description: "Complete moral rights waiver under s.14.1 — client may modify freely without attribution", favorability: "client" }, { id: "balanced", label: "Waiver with Attribution", description: "Moral rights waived except attribution where work is used substantially intact", favorability: "balanced" }, { id: "contractor-favourable", label: "No Waiver", description: "Moral rights retained — contractor can object to prejudicial modifications", favorability: "counter-party" }], defaultPosition: "client-favourable" },
    { id: "returnOfMaterialsPosition", label: "Return of Client Materials", description: "Contractor obligations to return client materials on termination?", options: [{ id: "client-favourable", label: "Immediate Return + Certified Destruction", description: "All client materials returned within 5 days; electronic copies permanently destroyed; written certification", favorability: "client" }, { id: "balanced", label: "Return Within 14 Days", description: "Client materials returned within 14 days; contractor may retain copies needed for warranty obligations", favorability: "balanced" }, { id: "contractor-favourable", label: "Return on Request", description: "Materials returned upon client written request; contractor retains work-in-progress until final payment received", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "nonSolicitationPosition", label: "Non-Solicitation of Employees", description: "Can the contractor recruit the client's employees?", options: [{ id: "client-favourable", label: "12-Month Non-Solicitation", description: "Contractor may not solicit or hire client employees for 12 months post-engagement", favorability: "client" }, { id: "balanced", label: "6-Month Non-Solicitation", description: "6-month restriction on soliciting client employees directly involved in the engagement", favorability: "balanced" }, { id: "contractor-favourable", label: "No Non-Solicitation", description: "No restriction on hiring — contractor may recruit freely; reinforces independent status", favorability: "counter-party" }], defaultPosition: "balanced" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — INDEPENDENT CONTRACTOR AGREEMENT:
This is NOT an employment agreement. The entire document must reinforce the independent contractor relationship.

CRITICAL LEGAL RISK — MISCLASSIFICATION:
- CRA and provincial employment standards agencies actively pursue misclassification
- Sagaz Industries (2001 SCC 59): Is the worker in business on their own account? McKee v. Reid's Heritage Homes (2009 ONCA 916): Substance over form.
- Wiebe Door Services v. MNR (1986 FCA): The 4-factor test (control, ownership of tools, chance of profit/risk of loss, integration) determines true status
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
- exclusivityPosition: Draft exclusivity clause per selection. WARNING: If exclusive engagement is selected, include a prominent drafting note that exclusivity is a strong indicator of employment under the Wiebe Door integration test — the client should understand the misclassification risk. If non-exclusive with competitor restriction, define "direct competitor" precisely. If fully non-exclusive, reinforce the independent contractor relationship language.
- moralRightsPosition: Draft moral rights waiver per Copyright Act s.14.1. Note: unlike employment (where s.13(3) gives employer automatic copyright), contractor retains copyright unless explicitly assigned. Moral rights waiver is essential for client to freely modify deliverables.
- returnOfMaterialsPosition: Draft return of materials clause. Address source code escrow if applicable. Specify data deletion requirements for confidential client information on contractor systems.
- nonSolicitationPosition: Draft non-solicitation per selection. Note: overly broad restrictions on a contractor may be an indicator of employment relationship under Sagaz. Keep restrictions narrow and commercially reasonable.`,
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
        { id: "employer-favourable", label: "Broad Scope", description: "Industry-wide restriction within the province for 24 months — WARNING: 24 months is presumptively unreasonable under Shafron and may be struck entirely", favorability: "client" },
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
        { id: "employer-favourable", label: "Continued Employment Only", description: "Non-compete supported only by continued employment — HIGH RISK: courts may find this insufficient consideration, making the entire covenant unenforceable", favorability: "client" },
        { id: "balanced", label: "Promotion + Raise", description: "Non-compete tied to a promotion, title change, or salary increase — stronger consideration", favorability: "balanced" },
        { id: "employee-favourable", label: "Signing Bonus", description: "Separate cash payment specifically for the non-compete — strongest consideration and clearest value exchange", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "stepDownPosition",
      label: "Step-Down Provisions",
      description: "If a court finds the restrictions too broad, should they automatically reduce to a narrower scope? Without step-downs, the court strikes the entire clause (Shafron v. KRG).",
      options: [
        { id: "employer-favourable", label: "Duration + Geographic Step-Down", description: "Both duration and geography automatically reduce in tiers — maximum chance the clause survives judicial scrutiny under Shafron", favorability: "client" },
        { id: "balanced", label: "Geographic Step-Down Only", description: "If geographic scope is struck, it automatically reduces to next narrower territory — moderate protection", favorability: "balanced" },
        { id: "employee-favourable", label: "No Step-Down", description: "Fixed restrictions with no automatic reduction — if any part is unreasonable, the entire clause is void per Shafron. Riskiest option for the employer.", favorability: "counter-party" },
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
        { id: "employer-favourable", label: "Arbitration (Confidential)", description: "Binding arbitration with confidentiality provisions — keeps disputes private, faster resolution, and prevents public disclosure of compensation details", favorability: "client" },
        { id: "balanced", label: "Mediation Then Arbitration", description: "Mandatory mediation attempt first, then binding arbitration if unresolved — balances cost-efficiency with procedural fairness", favorability: "balanced" },
        { id: "employee-favourable", label: "Litigation (Public Courts)", description: "Disputes resolved through the courts — public proceedings with full discovery. Public exposure can pressure faster settlement but risks reputational harm for both sides.", favorability: "counter-party" },
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
        { id: "balanced", label: "Included in Engagement Compensation", description: "IP assignment is part of the overall compensation package for the underlying engagement or relationship", favorability: "balanced" },
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
    {
      id: "reservedMattersPosition",
      label: "Reserved Matters (Unanimous Consent)",
      description: "Which corporate actions require both co-founders' unanimous consent?",
      options: [
        { id: "narrow", label: "Narrow Reserved Matters", description: "Only existential matters require unanimity: share issuance, sale of substantially all assets, amalgamation, wind-up, and changes to articles — operational decisions by simple majority", favorability: "client" },
        { id: "balanced", label: "Standard Reserved Matters", description: "Existential matters plus: incurring debt above threshold, related-party transactions, capital expenditure above threshold, material changes to business scope, and hiring/firing C-suite executives", favorability: "balanced" },
        { id: "broad", label: "Broad Reserved Matters", description: "Extensive list requiring unanimity: all of the above plus annual budget approval, any new contract above threshold, dividend declarations, and changes to accounting policies — maximum protection but operational friction", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "keyPersonInsurancePosition",
      label: "Key Person Insurance",
      description: "Should the corporation carry life and disability insurance on each co-founder to fund buyouts?",
      options: [
        { id: "comprehensive", label: "Life + Disability + Critical Illness", description: "Corporation owns policies covering death, total disability, and critical illness for each co-founder — fullest protection, highest premium cost", favorability: "balanced" },
        { id: "standard", label: "Life + Total Disability Only", description: "Corporation owns life and total disability policies sufficient to fund the buy-sell at formula valuation — standard protection at moderate cost", favorability: "balanced" },
        { id: "none", label: "No Insurance (Self-Funded)", description: "No insurance — buyout funded by purchasing co-founder personally or via installment payments over 2-5 years. Lowest cost but highest execution risk on death/disability.", favorability: "balanced" },
      ],
      defaultPosition: "standard",
    },
    {
      id: "informationRightsCoFounderPosition",
      label: "Information & Inspection Rights",
      description: "What access does each co-founder have to the corporation's financial records and information?",
      options: [
        { id: "full-access", label: "Full Open-Book Access", description: "Both co-founders have unrestricted access to all books, records, and accounts at any time — appropriate where both are active in the business", favorability: "balanced" },
        { id: "balanced", label: "Monthly Financials + Inspection Rights", description: "Monthly management accounts, quarterly board package, annual audited financials, plus 5-day notice inspection rights — structured information flow", favorability: "balanced" },
        { id: "limited", label: "Quarterly Financials Only", description: "Quarterly unaudited financial statements and annual audited financials — minimal reporting, appropriate only where both founders are equally involved in operations", favorability: "client" },
      ],
      defaultPosition: "full-access",
    },
    {
      id: "disputeResolutionPosition",
      label: "Dispute Resolution Cascade",
      description: "How are disputes under the agreement resolved?",
      options: [
        { id: "litigation", label: "Court Litigation", description: "Disputes resolved by the courts of the governing jurisdiction — public process, appeal rights, but slow and expensive", favorability: "balanced" },
        { id: "mediation-arbitration", label: "Mediation then Binding Arbitration", description: "Mandatory 30-day mediation attempt, then binding arbitration under ADR Institute of Canada rules with a single arbitrator — private, faster, final", favorability: "balanced" },
        { id: "arbitration-only", label: "Binding Arbitration Only", description: "All disputes to binding arbitration under ADR Institute rules — fastest resolution but no preliminary mediation attempt", favorability: "balanced" },
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
- Not specifying whether agreement is a USA under CBCA s.146 (which restricts directors' powers and shifts liability to shareholders)
- Ignoring the solvency test requirements (CBCA s.42) when drafting mandatory distribution provisions

CANADIAN STATUTORY FRAMEWORK:
- CBCA s.146 — Unanimous Shareholder Agreement: If this agreement restricts ALL directors' powers, it qualifies as a USA and shifts fiduciary duties and personal liability to shareholders. CRITICAL: Include a clear statement whether this is intended as a USA or a non-USA shareholder agreement. If USA, all share certificates must be endorsed, and any new shareholder is bound automatically (s.146(3)).
- CBCA s.241 — Oppression Remedy: Every provision must be tested against the oppression standard. Clauses that unfairly disregard the reasonable expectations of either co-founder are vulnerable to oppression claims. Per BCE Inc. v. 1976 Debentureholders (2008 SCC), "reasonable expectations" are assessed contextually by considering the relationship between parties, past practice, and the nature of the corporation.
- OBCA s.108 / BCBCA s.137 — Provincial variations: If incorporated provincially, confirm the equivalent USA and oppression provisions. OBCA s.108 USA provisions mirror CBCA but BCBCA s.137 has distinct requirements. Quebec: QBCA does not have a true USA equivalent — use a traditional SHA with carefully drafted governance provisions.
- CBCA s.42 / OBCA s.38 — Solvency Tests: All dividend and distribution provisions must include a solvency gate — the corporation cannot declare or pay a dividend if there are reasonable grounds to believe the corporation is or would be unable to pay its liabilities as they become due, or the realizable value of assets would be less than aggregate of liabilities and stated capital.

ENHANCED CASE LAW:
- Shafron v. KRG Insurance Brokers (2009 SCC): Non-compete reasonableness test — apply to shareholder non-compete provisions. Ambiguous territorial scope renders the clause unenforceable; courts will NOT read down or sever.
- Shoppers Drug Mart v. 6470360 Canada (2014 ONCA): Shotgun buy-sell must be fair and not used as an oppression tool. A shotgun triggered in bad faith or with asymmetric information may be set aside.
- BCE Inc. v. 1976 Debentureholders (2008 SCC): Reasonable expectations of shareholders — informs reserved matters and minority protections. The board must act in the best interests of the corporation, which may include balancing stakeholder interests.
- 820099 Ontario Inc. v. Harold E. Baird & Associates (2002 ONCA): Valuation methodology disputes — importance of clear formula provisions. Ambiguity in valuation clauses leads to costly litigation.
- Budd v. Gentra Inc. (1998 ONCA): Minority shareholder oppression — fiduciary duties owed by majority to minority, even in two-party structures. Squeeze-out tactics will attract oppression remedy.
- Naneff v. Con-Crete Holdings Ltd. (1995 ONCA): Reasonable expectations evolve over time — the original deal may not define expectations forever. Draft the agreement to anticipate changing circumstances.
- Ford Motor Co. of Canada v. Ontario Municipal Employees Retirement Board (2006 ONCA): Valuation discounts for minority interests and marketability — address whether discounts apply in the buyout valuation methodology.

TAX CONSIDERATIONS:
- Lifetime Capital Gains Exemption (LCGE): Draft share structure and transfer provisions to preserve eligibility for the LCGE on qualified small business corporation shares (ITA s.110.6). Include a covenant that neither founder will take actions that would cause the corporation to fail the 90% active business asset test, the 50% ownership test, or the 24-month holding period test.
- ITA s.85 Rollover: If founders are contributing assets on incorporation, include provisions contemplating a s.85 rollover election to defer capital gains. Share consideration must be structured to comply with s.85(1) requirements.
- Capital Dividend Account (CDA): On death, life insurance proceeds (less ACB of the policy) are credited to the CDA. Draft buy-sell provisions to ensure the corporation can elect to pay capital dividends from the CDA to the estate on redemption of the deceased's shares, enabling tax-free recovery.
- Shareholder Loans (ITA s.15): Caution against shareholder loan arrangements that could trigger s.15(2) income inclusion. If shareholder loans are contemplated, include repayment terms that comply with the 1-year repayment exception under s.15(2.6).

ADDITIONAL CLAUSE POSITIONS:
- valuationMethodPosition: Draft valuation clause per selection. If independent appraiser, specify the selection process (each party nominates one CBV, those two select a third), timeline (30-60 days), and cost allocation. If formula-based, define EBITDA adjustments (owner compensation normalization, non-recurring items) and specify the review/update frequency for the multiple. If book value, require annual audited financials and specify GAAP/ASPE basis.
- distributionPolicyPosition: Draft distribution policy per selection. If mandatory, include solvency test compliance (CBCA s.42 / OBCA s.38) and specify the calculation methodology. Include tax distribution provisions to cover shareholders' personal income tax obligations on undistributed corporate income.
- nonCompetePosition: Draft non-compete per selection. If 24 months Canada-wide, include Shafron risk acknowledgment and step-down provisions. If no non-compete, strengthen the confidentiality and non-solicitation provisions as alternatives.
- rofrPosition: Draft ROFR per selection. Specify the offer notice mechanics, matching period, and what happens if the ROFR holder cannot finance the purchase (financing extension or ROFR lapses).
- dragAlongPosition: Draft drag-along per selection. Include minimum price floor, tag-along rights for the minority, and representation that the third-party buyer will offer the same terms to both shareholders.
- goodLeaverBadLeaverPosition: Draft good/bad leaver provisions per selection. Define each category precisely. If step-down, specify the payment terms (lump sum vs. installments) for each category and the time period over which installments are paid.
- reservedMattersPosition: Draft reserved matters list per selection. Enumerate each matter as a separate numbered item. For the "balanced" option, include at minimum: (i) amendment to articles/by-laws, (ii) issuance of shares or securities, (iii) declaration of dividends, (iv) sale of all or substantially all assets, (v) amalgamation or arrangement, (vi) voluntary dissolution, (vii) related-party transactions, (viii) incurrence of indebtedness above threshold, (ix) material change in the nature of the business, (x) annual budget approval, (xi) hiring/termination of CEO/CFO, (xii) initiation of material litigation. Specify that failure to achieve unanimity on a reserved matter triggers the deadlock resolution mechanism.
- keyPersonInsurancePosition: Draft key person insurance provisions per selection. Specify the minimum coverage amount (tied to formula valuation and reviewed annually), the obligation to maintain the policy in good standing, the process if a co-founder becomes uninsurable, and the treatment of insurance proceeds (CDA credit on death — see tax considerations above).
- informationRightsCoFounderPosition: Draft information and inspection rights per selection. Address confidentiality obligations on information received. Specify the format and delivery method for financial reporting. Include a right to appoint the corporation's auditor or to require an audit where one is not otherwise required.
- disputeResolutionPosition: Draft dispute resolution cascade per selection. If mediation-arbitration, specify the mediation institution (e.g., ADR Institute of Canada or local equivalent), seat of arbitration, language, number of arbitrators, and the arbitral rules. Include an express carve-out for injunctive relief (parties may seek urgent injunctive relief from the courts notwithstanding the arbitration clause). Specify that the arbitrator's award is final, binding, and enforceable as a judgment of the Superior Court.

VOTING AGREEMENT CROSS-REFERENCES:
- PROTECTIVE PROVISIONS: Reserved matters in this SHA should mirror the protective provision framework from the Voting Agreement clause library (VA-05). If the corporation later enters a Voting Agreement with investors, the reserved matters list must be reconciled — the more restrictive provision governs. Include a coordination clause stating that if a Voting Agreement is executed, its protective provisions supplement (not replace) this SHA's reserved matters.
- BOARD GOVERNANCE: Board composition provisions should be drafted to accommodate future Voting Agreement board designation rights (VA-02). Include a mechanism for amending board composition provisions without amending the entire SHA, to facilitate investor board seats in future financing rounds.
- REGULATORY AWARENESS — MI 61-101: If either co-founder proposes a related-party transaction (e.g., management buyout, insider acquisition), MI 61-101 minority protection rules may apply. Include a covenant that any related-party transaction exceeding $25K requires disclosure to the non-participating co-founder and, if the corporation is a reporting issuer, compliance with MI 61-101 formal valuation and majority-of-minority requirements.
- REGULATORY AWARENESS — NI 62-104: If a third party proposes to acquire >20% of the corporation's voting shares, take-over bid rules under NI 62-104 may apply. Draft drag-along provisions to account for the 105-day deposit period and 50%+1 minimum tender condition. Any lock-up tied to the drag-along must distinguish between hard lock-ups (which must convert to cash alternatives during a bid) and soft lock-ups.
- JOINT ACTOR CONSIDERATIONS: In a two-party SHA, the co-founders should be aware that coordinated voting or economic arrangements beyond this agreement could trigger joint actor status under MI 61-101. Include a representation that neither co-founder has entered into collateral economic arrangements, is actively participating in any bid, or is sharing MNPI with third parties. Reference the safe harbour: a voting/shareholders' agreement alone does NOT constitute joint actor status.`,
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
      id: "preEmptiveRightsPosition",
      label: "Pre-Emptive Rights on New Issuances",
      description: "When the company issues new shares, can existing shareholders participate to maintain their ownership percentage?",
      options: [
        { id: "no-pre-emptive", label: "No Pre-Emptive Rights", description: "Company can issue shares freely; minority shareholders have no right to participate and may be diluted", favorability: "client" },
        { id: "pro-rata", label: "Pro-Rata Participation Right", description: "Shareholders can participate pro-rata in any new share issuance to maintain their percentage — standard protection against dilution", favorability: "balanced" },
        { id: "super-pro-rata", label: "Super Pro-Rata (Up to 2x)", description: "Shareholders can purchase up to 2x their pro-rata share of new issuances — allows minority shareholders to increase their stake over time", favorability: "counter-party" },
      ],
      defaultPosition: "pro-rata",
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
    {
      id: "reservedMattersStartupPosition",
      label: "Reserved Matters (Minority Veto Rights)",
      description: "Which corporate actions require consent of all founders, not just the majority?",
      options: [
        { id: "narrow", label: "Minimal Veto Rights", description: "Minority veto only on: amendments to articles that prejudice minority share class, amalgamation, and voluntary dissolution", favorability: "client" },
        { id: "balanced", label: "Standard Veto Rights", description: "Minority veto on: share issuance/dilution, sale of all or substantially all assets, related-party transactions, incurrence of material debt, changes to business scope, and key executive compensation", favorability: "balanced" },
        { id: "broad", label: "Comprehensive Veto Rights", description: "Broad minority veto list including all of the above plus: annual budget approval, any contract above $50K, dividend policy changes, and establishment of subsidiaries — maximum protection, operational friction", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "nonCompeteStartupPosition",
      label: "Founder Non-Compete & Non-Solicitation",
      description: "How restrictive are the post-departure obligations on founders?",
      options: [
        { id: "restrictive", label: "24 Months + Broad Scope", description: "During term + 24 months post-departure, no competing business in Canada, no solicitation of clients/employees/suppliers — broadest protection, Shafron enforceability risk", favorability: "client" },
        { id: "balanced", label: "12 Months + Provincial Scope", description: "During term + 12 months, no competing business in province of incorporation, 18-month non-solicitation of clients and employees — reasonable and likely enforceable", favorability: "balanced" },
        { id: "permissive", label: "Non-Solicit Only", description: "No non-compete; 12-month non-solicitation of clients and key employees only — minimally restrictive, maximum founder mobility", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "dragAlongStartupPosition",
      label: "Drag-Along / Tag-Along Rights",
      description: "Can the majority force minority founders to sell in an acquisition?",
      options: [
        { id: "majority-power", label: "Simple Majority Drag (51%+)", description: "Lead founder can force a sale with 51%+ approval; tag-along at same price and terms — maximum exit flexibility for majority", favorability: "client" },
        { id: "balanced", label: "Supermajority Drag (75%+) with Price Floor", description: "Drag-along requires 75% shareholder approval; offered price must meet or exceed formula valuation; minority gets tag-along at identical terms — protects against fire sales", favorability: "balanced" },
        { id: "minority-protected", label: "Unanimous Consent Required", description: "No forced sale without unanimous consent — minority can block any M&A transaction entirely", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "informationRightsStartupPosition",
      label: "Information Rights & Reporting",
      description: "What financial information do minority founders receive?",
      options: [
        { id: "full-access", label: "Full Open-Book Access", description: "All founders have unrestricted access to all books, records, bank accounts, and management reports — appropriate where all founders are active in the business", favorability: "counter-party" },
        { id: "balanced", label: "Monthly Management Accounts + Inspection Rights", description: "Monthly unaudited financials, quarterly board package, annual budget, cap table updates, plus 5-day notice inspection rights — standard for active co-founders", favorability: "balanced" },
        { id: "limited", label: "Quarterly Financials + Annual Audit", description: "Quarterly unaudited statements and annual audited financials — appropriate where minority founders are not active in day-to-day operations", favorability: "client" },
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
- Not addressing whether the agreement qualifies as a USA under CBCA s.146 — if it restricts ALL directors' powers, fiduciary duties and personal liability shift to shareholders
- Ignoring provincial BCA variations (OBCA s.108, BCBCA s.137, QBCA) that may affect enforceability

CANADIAN STATUTORY FRAMEWORK:
- CBCA s.146 — Unanimous Shareholder Agreement: In a startup context, a USA is appropriate where founders want to retain governance control. If USA, all share certificates must note its existence (s.146(2)), and any new shareholder (including future investors) is deemed party to the USA (s.146(3)). CRITICAL: A USA that restricts all or some directors' powers shifts corresponding duties and liabilities (including CBCA s.122 fiduciary duties) to the shareholders who assume those powers. This has significant implications when investors later join — the USA must be amended or replaced.
- CBCA s.241 — Oppression Remedy: Minority co-founders have standing to bring an oppression claim if their reasonable expectations are unfairly disregarded. Per BCE Inc. (2008 SCC), reasonable expectations are assessed contextually including startup stage, founders' relative contributions, past practice, and representations made during cofounding discussions.
- OBCA s.108 / BCBCA s.137 — Provincial Variations: OBCA USA provisions substantially mirror CBCA. BCBCA s.137 has distinct requirements. Quebec QBCA does not have a true USA equivalent — use a traditional SHA with carefully drafted governance provisions.
- CBCA s.42 / OBCA s.38 — Solvency Tests: All dividend and distribution provisions must comply with the solvency test.
- Securities Compliance: Any share issuance must comply with NI 45-106 prospectus exemptions (typically "private issuer" s.2.4 or "founder, control person, family" s.2.5). ESOP grants to employees should rely on the employee exemption where available. Maintain an exemption register.

ENHANCED CASE LAW:
- BCE Inc. v. 1976 Debentureholders (2008 SCC): Reasonable expectations of minority shareholders inform reserved matter and oppression analysis. Board must act in the corporation's best interests, balancing competing stakeholder interests.
- Budd v. Gentra Inc. (1998 ONCA): Minority oppression remedy — squeeze-out tactics by majority founders will attract judicial intervention. Informs protective provisions.
- Balanyk v. Balanyk (2011 ONCA): Valuation disputes in closely-held corporations — courts will not rewrite ambiguous valuation formulas.
- 820099 Ontario Inc. v. Harold E. Baird & Associates (2002 ONCA): Buy-sell mechanism fairness — mechanisms must not be structured to advantage one party.
- Peoples Department Stores v. Wise (2004 SCC): Directors' fiduciary duty runs to the corporation, not individual shareholders — critical for board composition provisions.
- Shafron v. KRG Insurance Brokers (2009 SCC): Non-compete must be reasonable in scope, duration, and activity. Courts will NOT read down or sever ambiguous terms.
- Pente Investment Management v. Schneider Corp. (1998 ONCA): Duty of board in change-of-control transactions — informs drag-along provisions.
- Naneff v. Con-Crete Holdings Ltd. (1995 ONCA): Reasonable expectations evolve over time — the original deal may not define expectations forever.

TAX CONSIDERATIONS:
- Lifetime Capital Gains Exemption (LCGE): Structure shares to preserve QSBC eligibility under ITA s.110.6. Include covenants to maintain the 90% active business asset test, 50% ownership test, and 24-month holding period.
- ITA s.85 Rollover: If founders contributed IP or assets, ensure s.85 elections were filed. Draft buyout provisions compatible with future s.85 transactions.
- ESOP Tax Treatment: Stock options under ITA s.7 — for CCPC shares, the s.7 benefit is deferred until disposition and the 50% deduction under s.110(1)(d) may apply if exercise price equals FMV at grant. Draft ESOP provisions to preserve these benefits.
- Shareholder Loans (ITA s.15): Restrict shareholder loans that could trigger s.15(2) income inclusion. If loans are contemplated, require compliance with the 1-year repayment rule under s.15(2.6).
- Capital Dividend Account (CDA): On death, life insurance proceeds (less ACB) credit to CDA. Draft buy-sell provisions to allow tax-free capital dividend payments to the estate.

ADDITIONAL CLAUSE POSITIONS:
- preEmptiveRightsPosition: Draft pre-emptive rights per selection. If pro-rata, specify the notice period for new issuances (typically 15-30 days), the mechanics for exercising or waiving the right, and the consequences of non-exercise (shares may be issued to third parties on the same or better terms within 90 days). If super pro-rata, specify the maximum over-allotment and the conditions under which it applies. Include carve-outs for ESOP grants, convertible instrument conversions, and strategic issuances that do not trigger the pre-emptive right.
- vestingSchedulePosition: Draft vesting schedule per selection. Specify the mechanics: share restriction agreement, repurchase right, or reverse vesting. Include acceleration triggers (single/double trigger on CoC). Address tax implications — s.7 ITA on stock option benefits.
- equityPoolPosition: Draft ESOP reservation clause per selection. Specify that ESOP shares are authorized but unissued, not included in the denominator for voting purposes until granted and vested. Include board authority to grant options within the pool without further shareholder approval.
- antiDilutionPosition: Draft anti-dilution clause per selection. This is the price-based protection on down rounds — distinct from pre-emptive rights which address participation in new issuances. If full ratchet, include a carve-out for ESOP grants (to avoid triggering on employee option exercises). If weighted average, specify the formula precisely with definitions of each variable. Include an exception for shares issued in connection with strategic partnerships.
- founderDeparturePosition: Draft departure buyback per selection. Address payment terms (lump sum or installments over 12-24 months), whether the company or remaining founders have the repurchase right, and the timeline for exercising the repurchase option (typically 60-90 days after departure).
- boardCompositionPosition: Draft board composition per selection. Specify how observers (non-voting) are handled, quorum requirements, and what happens to minority board seats if their ownership falls below a threshold (e.g., 10%).
- reservedMattersStartupPosition: Draft reserved matters per selection. Enumerate each matter as a separate numbered item. For the "balanced" option, include: (i) amendment to articles/by-laws, (ii) issuance of new securities or creation of new share classes, (iii) sale of all or substantially all assets, (iv) amalgamation, arrangement, or continuance, (v) voluntary dissolution, (vi) related-party transactions, (vii) material debt above threshold, (viii) annual budget approval, (ix) material change to business scope, (x) CEO/CFO compensation. Specify that failure to achieve required consent triggers deadlock resolution.
- nonCompeteStartupPosition: Draft non-compete per selection. Apply Shafron reasonableness analysis. Include garden leave provisions where appropriate. Include step-down provisions. If non-solicit only, define "solicitation" precisely and specify the protected client/employee universe.
- dragAlongStartupPosition: Draft drag-along/tag-along per selection. Include tag-along for minority at same price, terms, and form of consideration. Specify minimum 30-day notice. Include a carve-out that minority founders are not required to provide indemnification beyond their pro-rata share. Address escrow holdbacks.
- informationRightsStartupPosition: Draft information rights per selection. Specify GAAP/ASPE basis. Include confidentiality obligations. If inspection rights, specify reasonable notice and restrictions on competitive use. Include a right to appoint auditor or require an audit.

VOTING AGREEMENT CROSS-REFERENCES:
- PROTECTIVE PROVISIONS: The reserved matters / minority veto rights in this SHA should be designed to coordinate with the Voting Agreement protective provision framework (VA-05-001 through VA-05-025). When the company raises institutional capital, a Voting Agreement will typically introduce 8-25 investor consent matters. Draft this SHA's reserved matters to be additive (not conflicting) with future Voting Agreement protective provisions. The more restrictive provision should govern.
- BOARD GOVERNANCE: Board composition should anticipate future Voting Agreement board designation rights (VA-02). Include flexibility for the board to expand to accommodate investor-designated directors without requiring full SHA amendment. Reference CBCA s.105(3) 25% Canadian resident director requirement in the board composition clause.
- REGULATORY AWARENESS — MI 61-101: In a startup with multiple founders, related-party transactions (founder loans, management fees, affiliated service agreements) may trigger MI 61-101 minority protection if the company becomes a reporting issuer. Include a covenant that related-party transactions above $25K require disclosure to all shareholders and, if applicable, compliance with MI 61-101 formal valuation and majority-of-minority approval requirements.
- REGULATORY AWARENESS — NI 62-104: Draft drag-along provisions to coordinate with NI 62-104 take-over bid thresholds. If a third-party acquirer will obtain >20% of voting shares through the drag-along, the transaction may trigger take-over bid rules requiring a 105-day deposit period and 50%+1 minimum tender. Include a provision that drag-along mechanics comply with applicable securities law, including NI 62-104 exemptions (e.g., private agreement exemption for <5 sellers).
- JOINT ACTOR ANALYSIS: With multiple founders holding significant stakes, coordinated voting or economic arrangements could trigger joint actor status under MI 61-101. Include a representation that shareholders have not entered into collateral economic arrangements beyond this SHA. Reference the safe harbour: a shareholders' agreement alone does NOT constitute joint actor status, provided there are no collateral benefits, active bid participation, MNPI sharing, or director coordination beyond the agreement terms.`,
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
    {
      id: "reservedMattersJVPosition",
      label: "JV Reserved Matters (Partner Consent)",
      description: "Which JV corporate actions require both partners' consent?",
      options: [
        { id: "narrow", label: "Existential Matters Only", description: "Partner consent only for: amendment to JV articles, dissolution, sale of all assets, change of JV scope, and admission of new partners", favorability: "client" },
        { id: "balanced", label: "Standard Reserved Matters", description: "Both partners must consent to: changes to articles, new securities, material debt, related-party transactions, material contracts, capital expenditure above threshold, change of auditors, annual budget, and key personnel changes", favorability: "balanced" },
        { id: "broad", label: "Comprehensive Reserved Matters", description: "Extensive list requiring both partners: all of the above plus any contract above threshold, dividend declarations, legal proceedings, insurance changes, and changes to accounting policies", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "deadlockJVPosition",
      label: "JV Deadlock Resolution",
      description: "How are governance deadlocks between JV partners resolved?",
      options: [
        { id: "escalation", label: "CEO Escalation then Board Mediation", description: "Deadlocked matters escalate from management committee to partner CEOs; if unresolved within 30 days, non-binding mediation; if still unresolved, triggers exit mechanism", favorability: "balanced" },
        { id: "shotgun", label: "Shotgun Buy-Sell on Deadlock", description: "Persistent deadlock (60+ days) triggers the right of either partner to initiate a shotgun buy-sell — decisive but high-stakes", favorability: "balanced" },
        { id: "arbitration", label: "Binding Arbitration", description: "Unresolved deadlock referred to binding arbitration under ADR Institute rules with an arbitrator experienced in the JV's industry — third party decides", favorability: "balanced" },
      ],
      defaultPosition: "escalation",
    },
    {
      id: "valuationJVPosition",
      label: "JV Valuation Methodology",
      description: "How is the JV valued for buyouts, exits, and compelled transfers?",
      options: [
        { id: "appraiser", label: "Independent CBV Appraiser", description: "Fair market value determined by Chartered Business Valuator — each partner nominates one CBV, those two select a third if they disagree. Most accurate but slowest (30-60 days).", favorability: "balanced" },
        { id: "formula", label: "Pre-Agreed Formula", description: "JV valued at a pre-agreed EBITDA or revenue multiple, reviewed annually by partners — provides certainty and speed, avoids valuation disputes", favorability: "balanced" },
        { id: "net-asset-value", label: "Net Asset Value", description: "JV valued at the fair market value of its net assets (assets minus liabilities) — appropriate for asset-heavy JVs, may undervalue intangibles", favorability: "balanced" },
      ],
      defaultPosition: "formula",
    },
    {
      id: "termAndTerminationJVPosition",
      label: "JV Term & Termination",
      description: "What is the duration of the JV and what triggers termination?",
      options: [
        { id: "fixed-term", label: "Fixed Term (5 Years + Renewal)", description: "JV has a 5-year initial term with automatic 2-year renewals unless either partner gives 12 months' notice — provides certainty and periodic reassessment", favorability: "balanced" },
        { id: "indefinite", label: "Indefinite (Until Terminated)", description: "JV continues indefinitely until terminated by either partner on 12 months' notice or by a termination event (material breach, insolvency, change of control) — maximum flexibility", favorability: "balanced" },
        { id: "milestone-based", label: "Milestone-Based with Review", description: "JV continues until specific milestones are achieved (e.g., revenue target, market entry); annual review of progress with right to terminate if milestones are missed", favorability: "balanced" },
      ],
      defaultPosition: "indefinite",
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

CANADIAN STATUTORY FRAMEWORK:
- CBCA s.146 — Unanimous Shareholder Agreement: If the JV is incorporated federally, consider whether the JV agreement should qualify as a USA. A USA restricts directors' powers and shifts fiduciary duties to the shareholder-partners. Common in 50/50 JVs where both partners want direct governance control.
- CBCA s.241 — Oppression Remedy: JV partners as shareholders can bring oppression claims. Per BCE Inc. (2008 SCC), reasonable expectations include those arising from the JV agreement, the JV's purpose, and the parties' respective contributions.
- OBCA / BCBCA / QBCA — Provincial Variations: If JV is incorporated provincially, confirm equivalent USA and oppression provisions. BCBCA s.137 has distinct requirements. QBCA does not have a true USA mechanism.
- Competition Act s.90.1: If JV partners are competitors, the JV may require pre-merger notification to the Competition Bureau under Part IX if applicable thresholds are met. Even below thresholds, the Bureau can challenge an anti-competitive JV.
- CBCA s.42 / OBCA s.38 — Solvency Tests: All JV distributions must comply with the solvency test.

ENHANCED CASE LAW:
- Shafron v. KRG Insurance Brokers (2009 SCC): Reasonableness test for non-compete provisions — ambiguous territorial or activity restrictions will be struck entirely.
- Frame v. Smith (1987 SCC): Fiduciary duties in commercial relationships — JV partners may owe fiduciary duties depending on structure.
- International Corona Resources v. Lac Minerals (1989 SCC): Confidentiality and fiduciary obligations — relevant to JV confidentiality and opportunity allocation.
- BCE Inc. v. 1976 Debentureholders (2008 SCC): Reasonable expectations of JV partner-shareholders — informs reserved matters and governance protections.
- Peoples Department Stores v. Wise (2004 SCC): Directors' fiduciary duty runs to the JV entity, not to either partner individually.
- Budd v. Gentra Inc. (1998 ONCA): Oppression remedy for minority JV partners — squeeze-out or self-dealing will attract judicial intervention.
- Pente Investment Management v. Schneider Corp. (1998 ONCA): Duty of JV board in change-of-control or exit transactions.
- Ford Motor Co. of Canada v. Ontario Municipal Employees Retirement Board (2006 ONCA): Valuation discounts — address whether minority discount applies to departing partner's interest.

COMMON PITFALLS:
- Failing to define the JV scope precisely, leading to disputes over whether a partner's new opportunity belongs to the JV
- No mechanism for additional capital calls when the JV needs more funding
- Unclear IP ownership for technology created during the JV
- Exit valuation disputes when partners disagree on the value of the JV
- Anti-trust issues if JV partners are competitors (Competition Act s.90.1)
- Not addressing change-of-control of a JV partner (what if Partner A is acquired by a competitor of Partner B?)
- Omitting a deadlock resolution mechanism, leading to paralysis in a 50/50 JV
- Failing to address transfer pricing for goods/services between the JV and each partner

TAX CONSIDERATIONS:
- JV Structure Choice: Incorporated JV is a separate taxpayer; unincorporated JV allows each partner to claim its share of income/losses directly. Impacts loss utilization, CCA, and withholding taxes.
- Transfer Pricing (ITA s.247): If JV trades with either partner's related entities, arm's-length pricing is required.
- ITA s.85 Rollover: If partners contribute assets, consider a s.85 rollover to defer capital gains.
- Capital Dividend Account (CDA): On wind-down, ensure CDA balance is distributed tax-free before dissolution.
- Withholding Tax (Part XIII ITA): If either partner is non-resident, 25% withholding applies on dividends (reduced by treaty). Draft distribution provisions to address withholding.

ADDITIONAL CLAUSE POSITIONS:
- capitalContributionPosition: Draft capital contribution clause per selection. If mandatory pro-rata, specify the dilution mechanics if a partner fails to contribute (e.g., additional shares issued to contributing partner at a discount). If capped, specify what happens when the cap is reached and external financing is needed (partner guarantees? JV-level debt?).
- ipContributionPosition: Draft IP contribution clause per selection. Include a schedule of contributed IP from each partner. Specify the license terms (exclusive vs. non-exclusive, field-of-use restrictions, royalty terms if any). Address improvements to contributed IP during the JV term. On exit, clearly define what each partner takes with them.
- nonCompeteJVPosition: Draft non-compete per selection. If broad, apply Shafron reasonableness analysis. Include a carve-out for pre-existing businesses of each partner. Specify how new opportunities are allocated (JV first look, partner first look, or mutual agreement).
- profitAllocationPosition: Draft distribution clause per selection. If waterfall, define each tier precisely with calculation examples. Address tax distribution provisions to cover each partner's tax obligations on JV income. Specify distribution frequency and the approval process.
- reservedMattersJVPosition: Draft reserved matters per selection. For "balanced," include: (i) amendment to JV articles, (ii) new securities, (iii) admission of new partners, (iv) sale of material assets, (v) amalgamation, (vi) dissolution, (vii) material debt, (viii) related-party transactions, (ix) annual budget, (x) CEO appointment/termination, (xi) material litigation, (xii) change of auditors.
- deadlockJVPosition: Draft deadlock resolution per selection. If escalation, specify timeline at each level. If shotgun, include minimum notice and financing provision. If arbitration, specify ADR Institute rules, seat, arbitrator count, and cost allocation.
- valuationJVPosition: Draft valuation clause per selection. If appraiser, specify CBV selection process, timeline, cost allocation. If formula, define all variables precisely and specify annual review. If net asset value, specify book vs. FMV and intangible asset treatment.
- termAndTerminationJVPosition: Draft term and termination per selection. Include termination events: material breach (with cure period), insolvency, change of control of a partner, failure to meet capital calls, unresolvable deadlock. Specify consequences: orderly wind-down, buy-sell rights, asset distribution.`,
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
    {
      id: "founderNonCompetePEPosition",
      label: "Founder Non-Compete & Employment",
      description: "What employment and non-compete obligations do founders have?",
      options: [
        { id: "founder-favourable", label: "Key-Person Covenant Only", description: "Founders commit to full-time involvement for 3 years; 12-month non-compete post-departure in the province only — reasonable and likely enforceable per Shafron", favorability: "client" },
        { id: "balanced", label: "Standard Founder Restrictions", description: "Full-time commitment for 4 years; 18-month non-compete in Canada; 24-month non-solicitation of clients/employees; linked to employment agreement", favorability: "balanced" },
        { id: "investor-favourable", label: "Comprehensive Restrictions", description: "Full-time commitment for investment duration; 24-month non-compete globally; 36-month non-solicitation; key-person insurance required — broadest protection, Shafron risk on geographic scope", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "preEmptiveRightsPEPosition",
      label: "Pre-Emptive Rights on Future Rounds",
      description: "Can the investor participate pro-rata in future financing rounds?",
      options: [
        { id: "founder-favourable", label: "No Pre-Emptive Rights", description: "Investor has no automatic right to participate in future rounds — company has maximum flexibility on future investor selection", favorability: "client" },
        { id: "balanced", label: "Pro-Rata Participation Right", description: "Investor has the right (not obligation) to purchase their pro-rata share of any new equity issuance to maintain their percentage — CVCA standard", favorability: "balanced" },
        { id: "investor-favourable", label: "Super Pro-Rata + Pay-to-Play", description: "Investor can purchase up to 2x their pro-rata share; investors who do not participate lose anti-dilution and protective provisions — rewards active investors", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "exitMechanismPEPosition",
      label: "Investor Exit Mechanism & Timeline",
      description: "What exit rights and liquidity options does the investor have?",
      options: [
        { id: "founder-favourable", label: "No Forced Exit Rights", description: "No put option or forced exit — investor relies on drag-along, IPO, or M&A for liquidity. Company controls exit timing.", favorability: "client" },
        { id: "balanced", label: "Put Option After 7 Years", description: "If no liquidity event within 7 years, investor has a put option to require the company or founders to repurchase shares at FMV determined by independent CBV — provides a backstop", favorability: "balanced" },
        { id: "investor-favourable", label: "Put Option After 5 Years + Redemption", description: "Investor can force redemption of preferred shares after 5 years at FMV plus accrued dividends; if company cannot fund, triggers mandatory sale process — maximum liquidity protection", favorability: "counter-party" },
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

CANADIAN STATUTORY FRAMEWORK:
- CBCA s.146: In most VC/PE transactions, the SHA is NOT a USA because the investor wants directors to retain their powers. However, extensive protective provisions may inadvertently qualify as a USA.
- CBCA s.241: Both founders and investors have oppression standing. Per BCE Inc. (2008 SCC), preferred shareholders' reasonable expectations are shaped by their share rights, the SHA, and investment circumstances.
- OBCA / BCBCA / QBCA: Confirm governing BCA. OBCA s.108 mirrors CBCA. BCBCA s.137 has distinct requirements. QBCA has no true USA equivalent.
- Securities: Share issuance must comply with NI 45-106 (typically accredited investor s.2.3). File Form 45-106F1 within 10 days.
- CBCA s.42 / OBCA s.38: Dividend and redemption provisions must comply with statutory solvency test.
- CBCA s.190: Dissent rights on fundamental changes — SHA should address interaction with drag-along.

KEY CASE LAW:
- BCE Inc. v. 1976 Debentureholders (2008 SCC): Duty to act in best interests of corporation; reasonable expectations of stakeholders including preferred shareholders
- Peoples Department Stores v. Wise (2004 SCC): Directors' fiduciary duty runs to the corporation, not individual shareholders — informs governance structure
- Budd v. Gentra Inc. (1998 ONCA): Oppression remedy available to minority shareholders — founders need awareness of remedies
- Shafron v. KRG Insurance Brokers (2009 SCC): Non-compete reasonableness — apply to founder non-compete provisions. Global scope will likely be struck.
- Pente Investment Management v. Schneider Corp. (1998 ONCA): Board duties in change-of-control — informs drag-along and exit.
- Ford Motor Co. of Canada v. Ontario Municipal Employees Retirement Board (2006 ONCA): Valuation of minority interests.
- Naneff v. Con-Crete Holdings Ltd. (1995 ONCA): Reasonable expectations evolve — draft to anticipate changing circumstances.
- Re Stelco Inc. (2005 ONCA): Directors' duties in zone of insolvency — relevant to protective provisions and information rights.

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
- founderLockUpPosition: Draft lock-up per selection. Address permitted transfers (estate planning, family trusts) that do not require investor consent but do require transferee to be bound by the SHA. Specify whether founder shares remain subject to vesting during the lock-up period.

VOTING AGREEMENT CROSS-REFERENCES:
- PROTECTIVE PROVISIONS FRAMEWORK: Investor protective provisions in this SHA MUST coordinate with the Voting Agreement protective provision framework (VA-05). The standard CVCA package maps to VA-05-001 through VA-05-016. If both a SHA and Voting Agreement exist, include a coordination clause: "To the extent any matter requires consent under both this Agreement and the Voting Agreement, compliance with the more restrictive requirement shall be deemed compliance with both." The 8 non-negotiable protective provisions (VA-05-001 to VA-05-008) should appear in BOTH documents.
- BOARD GOVERNANCE FROM VOTING AGREEMENT: Board composition and designation rights in this SHA should exactly mirror the Voting Agreement's Article II board matrix (VA-02-001 to VA-02-005). Include: (a) founder common designees (2 seats at seed/Series A), (b) preferred designees (1 seat per lead investor series, designated by class vote or lead investor), (c) mutual independent director (TSX/CSE independence standards), (d) stage-based adjustments as new preferred series are issued. Committee composition (audit per NI 52-110, compensation, nomination) should be specified per VA-02-004 and VA-02-005.
- MI 61-101 MINORITY PROTECTION: Investor SHA transactions involving insiders (founder buybacks, management fees, affiliated services, asset transfers to founder entities) may constitute related party transactions under MI 61-101. If the company is or becomes a reporting issuer: (a) formal valuation by an independent valuator (IVF designation) is required unless an exemption applies (transaction <$500K or <2% market cap), (b) majority-of-minority shareholder approval is required. Include a covenant requiring compliance with MI 61-101 for any transaction between the company and any insider, affiliate, or associate exceeding $25K.
- NI 62-104 TAKE-OVER BID COORDINATION: Drag-along provisions must account for NI 62-104 thresholds. If the drag-along will result in an acquirer obtaining >20% of voting shares, the transaction may trigger take-over bid rules. Include: (a) compliance with 105-day deposit period, (b) 50%+1 minimum tender condition, (c) 10-day extension requirement, (d) hard lock-up conversion to cash alternative per NI 62-104 s.2.38. The SHA's founder lock-up provisions should specify whether they constitute "hard" or "soft" lock-ups, as hard lock-ups must permit shareholders to accept a competing cash bid during a take-over.
- JOINT ACTOR ANALYSIS: Multiple shareholders coordinating through this SHA (founders + investor) should be assessed for joint actor risk under MI 61-101. The 6-factor test applies: (1) collateral economic benefits (management fees, earnouts tied to SHA), (2) active bid participation, (3) MNPI sharing between parties, (4) director coordination beyond normal board functions, (5) formal affiliation documentation, (6) control mechanisms. Include a safe harbour acknowledgment: this SHA alone does NOT create joint actor status. Include representations that no party has collateral arrangements beyond this agreement.
- NI 62-103 EARLY WARNING: If the investor's ownership crosses >10% of voting shares (reporting issuer) or >5% (non-reporting), NI 62-103 early warning filing obligations are triggered. Include a covenant requiring the investor to promptly notify the company of any threshold crossing and to file the required news release (next business day) and early warning report (within 2 business days).`,
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
      id: "proRataPosition",
      label: "Pro-Rata Participation Rights",
      description: "Does the SAFE investor have a right to participate in future financing rounds to maintain their ownership percentage?",
      options: [
        { id: "company-favourable", label: "No Pro-Rata Rights", description: "Investor has no right to participate in future rounds — company retains full discretion over future investor selection", favorability: "client" },
        { id: "balanced", label: "Pro-Rata on Next Round Only", description: "Investor may participate in the next equity financing round on a pro-rata basis — one-round right only", favorability: "balanced" },
        { id: "investor-favourable", label: "Ongoing Pro-Rata Rights", description: "Investor has a continuing right to maintain their pro-rata percentage in all future equity financings until an IPO or exit", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "informationRightsPosition",
      label: "Information Rights & Financial Reporting",
      description: "What financial information does the SAFE investor receive, and how often?",
      options: [
        { id: "company-favourable", label: "Annual Summary Only", description: "Company provides a brief annual financial summary — minimal reporting burden", favorability: "client" },
        { id: "balanced", label: "Quarterly Financials", description: "Quarterly unaudited financial statements (income statement, balance sheet) and an annual summary — market standard for seed investors", favorability: "balanced" },
        { id: "investor-favourable", label: "Full Information Rights", description: "Monthly financials, quarterly board packages, annual audited statements, and right to inspect books and records on reasonable notice", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
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
      id: "conversionTriggerPosition",
      label: "Conversion Trigger Events",
      description: "What events beyond a qualified financing can trigger SAFE conversion?",
      options: [
        { id: "company-favourable", label: "Qualified Financing Only", description: "SAFE converts only on an equity financing round meeting the minimum threshold — company controls timing of conversion", favorability: "client" },
        { id: "balanced", label: "Qualified Financing + Liquidity Event", description: "SAFE converts on a qualified financing OR on a change of control / liquidity event (acquisition, IPO) — ensures the investor is not left behind if the company exits before raising a priced round", favorability: "balanced" },
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

CANADIAN SECURITIES LAW REQUIREMENTS:
- NI 45-106 s.2.3: If relying on the accredited investor exemption, the issuer must obtain a signed Form 45-106F9 (or equivalent risk acknowledgment in Ontario under OSC Rule 45-501) from EACH investor BEFORE accepting funds. Verify qualification under the financial asset test ($1M+), income test ($200K individual / $300K joint), or net asset test ($5M+). If the investor is a permitted individual under OSC Rule 45-501, use Form 45-501F1 instead.
- NI 45-102 s.2.5: All SAFE instruments issued under a prospectus exemption are subject to a 4-month hold period from the distribution date. Securities may not be traded until the hold period expires AND the issuer is a reporting issuer (or the first trade is made under another exemption). Include a bold-face restricted security legend on the SAFE instrument referencing NI 45-102 s.2.5.
- CSA Staff Notice 46-307 and OSC Staff Notice 33-749: The CSA has flagged that SAFEs may be classified as securities (specifically, investment contracts) under Canadian securities legislation regardless of whether the issuer characterizes them as equity or debt. Draft the SAFE on the basis that it IS a security requiring full prospectus exemption compliance.
- Provincial filing: File Form 45-106F1 (Report of Exempt Distribution) within 10 days of the distribution in each province where investors reside. Ontario requires filing with the OSC; BC with the BCSC; Alberta with the ASC.
- Tax treatment: Unlike US SAFEs, Canadian SAFEs do not benefit from IRC s.1202 QSBS treatment. CRA may treat the SAFE as a prepaid forward contract. Conversion to equity may trigger a taxable disposition. Include a tax acknowledgment clause.

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
- conversionPosition: Draft conversion economics per selection. Specify the valuation cap, discount rate, and how they interact (better-of vs. combined). This is the core economic term of the SAFE.
- mfnPosition: Draft MFN clause per selection. If limited MFN, specify which terms are subject to adjustment (cap and discount only). If broad MFN, include an amendment mechanism allowing the holder to elect to adopt improved terms within 30 days of notice of a subsequent SAFE issuance.
- preMoneyPostPosition: Draft conversion mechanics using the selected SAFE type. Post-money SAFEs include the SAFE amount in the post-money valuation; pre-money SAFEs exclude it. Clearly define the conversion formula.
- proRataPosition: If pro-rata rights granted, specify calculation methodology (based on as-converted ownership at the time of subsequent financing), notice period for exercise (typically 10-15 business days), and whether the right is assignable. If ongoing rights, include a termination event (e.g., IPO or investor falling below a minimum ownership threshold).
- informationRightsPosition: Draft information covenant per selection. Specify delivery deadlines (e.g., quarterly financials within 45 days of quarter end, annual financials within 90 days of fiscal year end). Include confidentiality obligations on received information. If full rights, define scope of inspection right and reasonable notice period (typically 10 business days).
- minimumRaisePosition: Define "Equity Financing" with the selected minimum threshold. Specify whether the threshold includes or excludes amounts raised under other SAFEs/notes converting in the same round.
- dissolutionPosition: Draft dissolution waterfall per selection. If 1x back first, specify priority relative to other SAFE holders and any secured creditors.
- conversionTriggerPosition: Draft conversion trigger clause per selection. If qualified financing only, define "Equity Financing" precisely (exclude ESOP grants, convertible note conversions, and strategic equity issuances below the threshold). If liquidity event trigger, specify the conversion price on a change of control (at cap or at a multiple of invested amount). If any equity issuance, include carve-outs for ESOP grants up to the approved pool size and shares issued in connection with strategic partnerships.

VOTING AGREEMENT CROSS-REFERENCES:
- CONVERSION TO VOTING SHARES: Upon conversion of the SAFE into equity, the investor will receive shares that may be subject to a Voting Agreement. Include a provision that as a condition of conversion, the SAFE investor must execute a joinder to any existing Voting Agreement, ROFR/Co-Sale Agreement, and Shareholders' Agreement. The converted shares become "Subject Shares" under the Voting Agreement and are bound by its board designation, protective provision, and drag-along mechanics.
- PROTECTIVE PROVISIONS AWARENESS: If a Voting Agreement or SHA exists at the time of SAFE conversion, the SAFE investor should be made aware that protective provisions (VA-05-001 to VA-05-025) will apply to their converted shares. Include a representation that the investor acknowledges the existence of governance agreements and agrees to be bound upon conversion.
- BOARD GOVERNANCE: If the SAFE includes side letter board observer rights, these should be drafted to coordinate with the Voting Agreement's board composition framework (VA-02). Specify that observer rights are subject to the board composition provisions of any Voting Agreement and do not create a board designation right.`,
};

// ──────────────────────────────────────────────
// TERM SHEET
// ──────────────────────────────────────────────

const TERM_SHEET_CONFIG: AgreementConfig = {
  id: "term-sheet",
  partyLabels: { partyALabel: "Company", partyAPlaceholder: "StartupCo Inc.", partyBLabel: "Lead Investor", partyBPlaceholder: "VC Fund / Angel Investor" },
  estimatedGenerationTime: 30,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "roundSize", "preMoneyValuation"],
  wizardSteps: ["inv-terms", "inv-governance"],
  clausePositions: [
    { id: "economicsPosition", label: "Economics Overview", description: "What are the high-level economics of this round? The term sheet captures headline deal terms — detailed mechanics go in the definitive agreements.", options: [{ id: "company-favourable", label: "Founder-Friendly Economics", description: "Higher pre-money, 1x non-participating preference, small option pool — founder retains maximum ownership", favorability: "client" }, { id: "balanced", label: "Market-Standard Economics", description: "Fair pre-money, 1x non-participating, 15% option pool, CVCA standard — where most Canadian deals close", favorability: "balanced" }, { id: "investor-favourable", label: "Investor-Friendly Economics", description: "Lower pre-money, participating preference, larger pre-money option pool — maximizes investor returns", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "governancePosition", label: "Governance & Control", description: "Who controls the board and what requires investor approval? Most consequential non-economic term.", options: [{ id: "company-favourable", label: "Founder-Controlled", description: "Founders hold board majority; investor gets one seat or observer; minimal protective provisions", favorability: "client" }, { id: "balanced", label: "Balanced Board", description: "Equal founder/investor directors plus mutual independent; standard CVCA protections", favorability: "balanced" }, { id: "investor-favourable", label: "Investor-Controlled", description: "Investor board majority or expansive protective provisions over operations", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "bindingTermsPosition", label: "Binding vs. Non-Binding", description: "Which sections are legally binding? Most term sheets are non-binding except confidentiality, exclusivity, and governing law.", options: [{ id: "company-favourable", label: "Minimal Binding", description: "Only confidentiality — maximum flexibility to walk away", favorability: "client" }, { id: "balanced", label: "Standard Binding", description: "Confidentiality, exclusivity (30-45 days), governing law — everything else non-binding", favorability: "balanced" }, { id: "investor-favourable", label: "Extended Binding", description: "Confidentiality, exclusivity (60-90 days), expense reimbursement, no-shop", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "exclusivityPosition", label: "Exclusivity Period", description: "How long must the company stop talking to other investors?", options: [{ id: "company-favourable", label: "No Exclusivity", description: "Company can continue other discussions — competitive tension", favorability: "client" }, { id: "balanced", label: "30-Day Exclusivity", description: "Standard market practice", favorability: "balanced" }, { id: "investor-favourable", label: "60-Day Exclusivity", description: "Extended with auto-extension if diligence ongoing", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "dueDiligencePosition", label: "Due Diligence Scope", description: "What level of diligence before closing?", options: [{ id: "company-favourable", label: "Confirmatory Only", description: "Light-touch — appropriate for seed", favorability: "client" }, { id: "balanced", label: "Standard", description: "Corporate records, financials, IP, contracts, employment — Series A standard", favorability: "balanced" }, { id: "investor-favourable", label: "Comprehensive", description: "Full legal, financial, tax, IP, commercial with third-party advisors", favorability: "counter-party" }], defaultPosition: "balanced" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — TERM SHEET:
NON-BINDING summary. Keep SHORT (5-10 pages). Detailed provisions go in definitive agreements.
Structure: Summary > Economics (headlines) > Governance (bullet list) > Investor Rights (brief) > Conditions > Binding Provisions (fully drafted) > Non-Binding Acknowledgment.
CANADIAN: CVCA Model Term Sheet. NI 45-106 exemption. Baxter v. Jones: explicit non-binding language.`,
};

// ──────────────────────────────────────────────
// SUBSCRIPTION AGREEMENT (NI 45-106)
// ──────────────────────────────────────────────

const SUBSCRIPTION_AGREEMENT_NI45106_CONFIG: AgreementConfig = {
  id: "subscription-agreement-ni45106",
  partyLabels: { partyALabel: "Company (Issuer)", partyAPlaceholder: "StartupCo Inc.", partyBLabel: "Subscriber (Investor)", partyBPlaceholder: "Investor Name / Fund Name" },
  estimatedGenerationTime: 45,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "shareClass", "pricePerShare", "numberOfShares", "exemptionReliedUpon"],
  wizardSteps: ["inv-terms", "inv-securities", "inv-compliance"],
  clausePositions: [
    { id: "exemptionPosition", label: "Prospectus Exemption", description: "Which NI 45-106 exemption? Determines investor qualifications, disclosure, and filing obligations.", options: [{ id: "accredited", label: "Accredited Investor (s.2.3)", description: "Financial thresholds ($1M assets, $200K/$300K income, $5M net assets) — most common. Requires Form 45-106F9.", favorability: "balanced" }, { id: "friends-family", label: "Friends, Family & Business Associates (s.2.5)", description: "Strict relationship test with director/officer — no financial threshold", favorability: "client" }, { id: "offering-memo", label: "Offering Memorandum (s.2.9)", description: "Non-accredited eligible but detailed OM required. 2-business-day cancellation right.", favorability: "counter-party" }], defaultPosition: "accredited" },
    { id: "repsWarrantiesPosition", label: "Company Representations", description: "How extensive are the company's reps and warranties?", options: [{ id: "company-favourable", label: "Minimal", description: "Corporate existence, authority, valid issuance only", favorability: "client" }, { id: "balanced", label: "Standard", description: "Existence, authority, issuance, no litigation, IP, compliance — standard Canadian private placement", favorability: "balanced" }, { id: "investor-favourable", label: "Comprehensive", description: "Full suite: financials, tax, contracts, employment, data privacy — institutional", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "closingConditionsPosition", label: "Closing Conditions", description: "What must be satisfied before funds are released?", options: [{ id: "company-favourable", label: "Minimal", description: "Execution and payment — fast close", favorability: "client" }, { id: "balanced", label: "Standard", description: "Execution, payment, officer's cert, legal opinion, no MAC, NI 45-106 filings", favorability: "balanced" }, { id: "investor-favourable", label: "Comprehensive", description: "Plus diligence, escrow, minimum raise, ancillary approvals", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "holdPeriodPosition", label: "Resale Restrictions", description: "All Canadian private placements have a 4-month hold (NI 45-102). What additional restrictions?", options: [{ id: "company-favourable", label: "Standard Hold Only", description: "4-month statutory hold with legend — minimum", favorability: "client" }, { id: "balanced", label: "Hold + Company ROFR", description: "Plus company right of first refusal on resale — cap table control", favorability: "balanced" }, { id: "investor-favourable", label: "Hold + Registration Commitment", description: "Company commitment to facilitate resale — investor liquidity path", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "investorRepsPosition", label: "Investor Representations", description: "What must the investor represent to establish qualification?", options: [{ id: "company-favourable", label: "Full", description: "Accredited status, intent, sophistication, risk acknowledgment, AML", favorability: "client" }, { id: "balanced", label: "Standard", description: "Exemption qualification, intent, restriction acknowledgment", favorability: "balanced" }, { id: "investor-favourable", label: "Minimal", description: "Qualification and authority only", favorability: "counter-party" }], defaultPosition: "company-favourable" },
    { id: "indemnificationPosition", label: "Indemnification", description: "Who covers false representations?", options: [{ id: "company-favourable", label: "Investor Indemnifies", description: "One-way: investor covers breach of investor reps", favorability: "client" }, { id: "balanced", label: "Mutual", description: "Each covers breach of own reps", favorability: "balanced" }, { id: "investor-favourable", label: "Company Indemnifies", description: "One-way: company covers breach of company reps", favorability: "counter-party" }], defaultPosition: "balanced" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — SUBSCRIPTION AGREEMENT (NI 45-106):
Securities subscription for Canadian private placement. Exemption compliance MANDATORY.
Accredited (s.2.3): Form 45-106F9. Ontario: 45-501F1. Friends/family (s.2.5): relationship declaration. OM (s.2.9): reference OM + 2-day cancellation.
NI 45-102 s.2.5: 4-month hold with bold legend. Provincial filing: Form 45-106F1 within 10 days.`,
};

// ──────────────────────────────────────────────
// INVESTORS' RIGHTS AGREEMENT
// ──────────────────────────────────────────────

const INVESTORS_RIGHTS_CONFIG: AgreementConfig = {
  id: "investors-rights-agreement",
  partyLabels: { partyALabel: "Company", partyAPlaceholder: "StartupCo Inc.", partyBLabel: "Investors (as a class)", partyBPlaceholder: "Series Seed / Series A Investors" },
  estimatedGenerationTime: 55,
  requiredFields: ["partyAName", "partyBName", "jurisdiction"],
  wizardSteps: ["inv-governance", "inv-info"],
  clausePositions: [
    { id: "registrationRightsPosition", label: "Registration Rights", description: "Can investors require the company to register shares for public sale? In Canada, this means prospectus qualification.", options: [{ id: "company-favourable", label: "Piggyback Only", description: "Include in voluntary prospectus but cannot demand one — company controls IPO", favorability: "client" }, { id: "balanced", label: "Demand + Piggyback (After 5 Years)", description: "50%+ holders demand after 5 years. Piggyback on voluntary. Two demands — CVCA", favorability: "balanced" }, { id: "investor-favourable", label: "Demand + Short-Form (After 3 Years)", description: "25% threshold, 3 years, unlimited short-form, company bears expenses", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "informationRightsPosition", label: "Information Rights", description: "What financial/operational information, and how often?", options: [{ id: "company-favourable", label: "Annual Only", description: "Annual audited within 120 days — minimal for seed", favorability: "client" }, { id: "balanced", label: "Quarterly + Annual", description: "Quarterly unaudited 45 days, annual audited 90 days, budget — CVCA", favorability: "balanced" }, { id: "investor-favourable", label: "Monthly + Quarterly + Annual", description: "Monthly accounts, quarterly, annual, KPIs, cap table, material events", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "proRataPosition", label: "Pro-Rata Rights", description: "Can investors maintain ownership in future rounds?", options: [{ id: "company-favourable", label: "No Pro-Rata", description: "Company decides future investors", favorability: "client" }, { id: "balanced", label: "Major Investors ($250K+)", description: "Pro-rata of future equity issuances — CVCA standard", favorability: "balanced" }, { id: "investor-favourable", label: "All + Super Pro-Rata + Pay-to-Play", description: "Lead gets 2x; non-exercising lose preferred", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "boardObserverPosition", label: "Board Observer Rights", description: "Non-voting observer at board meetings?", options: [{ id: "company-favourable", label: "No Observers", description: "Directors only", favorability: "client" }, { id: "balanced", label: "Lead Observer", description: "One observer, receives board packages — Series A standard", favorability: "balanced" }, { id: "investor-favourable", label: "Multiple + Committee Access", description: "Each class designates observer with committee access", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "mfnPosition", label: "Most Favored Nation", description: "Auto-upgrade if future investors get better rights?", options: [{ id: "company-favourable", label: "No MFN", description: "Each class negotiates independently", favorability: "client" }, { id: "balanced", label: "Info + Pro-Rata MFN", description: "Auto-upgrade on info and pro-rata only", favorability: "balanced" }, { id: "investor-favourable", label: "Broad MFN", description: "Adopt any better term from any future investor", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "inspectionRightsPosition", label: "Inspection Rights", description: "Can investors inspect books beyond reports?", options: [{ id: "company-favourable", label: "No Inspection", description: "Rely on reports", favorability: "client" }, { id: "balanced", label: "Reasonable Notice", description: "Major investors inspect with 10 days notice", favorability: "balanced" }, { id: "investor-favourable", label: "Broad + Management", description: "Books, facilities, management, auditors", favorability: "counter-party" }], defaultPosition: "balanced" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — INVESTORS' RIGHTS AGREEMENT (CANADIAN):
GOVERNANCE RIGHTS only. Do NOT include economics (valuation, pricing, liquidation, anti-dilution).
Cover: registration, info rights, pro-rata, observer, MFN, inspection.
CBCA s.21 supplements statutory rights. NI 51-102 overlap if reporting issuer.`,
};

// ──────────────────────────────────────────────
// VOTING AGREEMENT
// ──────────────────────────────────────────────

// Note: VOTING_AGREEMENT_CONFIG defined below (line ~4816) with full three-document system integration

// ──────────────────────────────────────────────
// ROFR & CO-SALE AGREEMENT
// ──────────────────────────────────────────────

const ROFR_COSALE_CONFIG: AgreementConfig = {
  id: "rofr-co-sale",
  partyLabels: { partyALabel: "Company & Key Holders", partyAPlaceholder: "StartupCo Inc. / Founders", partyBLabel: "Investors (as a class)", partyBPlaceholder: "Series Seed / Series A Investors" },
  estimatedGenerationTime: 40,
  requiredFields: ["partyAName", "partyBName", "jurisdiction"],
  wizardSteps: ["inv-transfers"],
  clausePositions: [
    { id: "rofrPosition", label: "Right of First Refusal", description: "When a shareholder sells, who buys first? Keeps ownership in the group.", options: [{ id: "company-favourable", label: "Company ROFR Only", description: "Company first, then third party", favorability: "client" }, { id: "balanced", label: "Company + Investor Waterfall", description: "Company, then investors pro-rata, then third party — CVCA", favorability: "balanced" }, { id: "investor-favourable", label: "Waterfall + Oversubscription", description: "Plus investors buy unsubscribed shares", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "coSalePosition", label: "Co-Sale (Tag-Along)", description: "If founder sells, can investors join on same terms?", options: [{ id: "company-favourable", label: "No Co-Sale", description: "No investor participation", favorability: "client" }, { id: "balanced", label: "Pro-Rata Co-Sale", description: "Each investor sells pro-rata on same terms — CVCA", favorability: "balanced" }, { id: "investor-favourable", label: "Full Co-Sale (First-In)", description: "Investors sell first; key holder reduced", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "transferNoticePosition", label: "Transfer Notice Period", description: "Notice and response time?", options: [{ id: "company-favourable", label: "Short (15 Days)", description: "15 ROFR, 10 co-sale", favorability: "client" }, { id: "balanced", label: "Standard (30 Days)", description: "30 ROFR, 15 co-sale, extension available", favorability: "balanced" }, { id: "investor-favourable", label: "Extended (45 Days)", description: "45 with auto-extension, 20 co-sale", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "permittedTransfersPosition", label: "Permitted Transfers", description: "ROFR/co-sale exceptions for estate planning?", options: [{ id: "company-favourable", label: "Narrow", description: "Immediate family and revocable trusts only", favorability: "client" }, { id: "balanced", label: "Standard", description: "Family trusts, family, estate, charitable 10%. Joinder required.", favorability: "balanced" }, { id: "investor-favourable", label: "Broad", description: "Plus co-investors, affiliates, pledges", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "prohibitedTransfersPosition", label: "Prohibited Transfers", description: "Completely prohibited even with ROFR?", options: [{ id: "company-favourable", label: "Broad", description: "No competitors, no registration-trigger, no reporting-issuer", favorability: "client" }, { id: "balanced", label: "Standard", description: "No competitors, no securities violations", favorability: "balanced" }, { id: "investor-favourable", label: "Minimal", description: "Only securities violations", favorability: "counter-party" }], defaultPosition: "balanced" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — ROFR & CO-SALE (CANADIAN):
TRANSFER MECHANICS only. No board governance, protectives, liquidation, or info rights.
CBCA s.174: restrictions in articles/bylaws/USA. Securities Transfer Act: note on certificates.
NI 45-102: coordinate ROFR periods with hold period.`,
};

// ──────────────────────────────────────────────
// FOUNDERS' LOCK-UP
// ──────────────────────────────────────────────

const FOUNDERS_LOCKUP_CONFIG: AgreementConfig = {
  id: "founders-lock-up",
  partyLabels: { partyALabel: "Founder(s)", partyAPlaceholder: "Founder Name(s)", partyBLabel: "Company & Investors", partyBPlaceholder: "StartupCo Inc. / Lead Investor" },
  estimatedGenerationTime: 35,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "lockUpPeriod"],
  wizardSteps: ["inv-lockup"],
  clausePositions: [
    { id: "lockUpPeriodPosition", label: "Lock-Up Duration", description: "How long restricted from selling/transferring/pledging?", options: [{ id: "founder-favourable", label: "12-Month", description: "Shortest standard", favorability: "client" }, { id: "balanced", label: "24-Month", description: "Series A standard", favorability: "balanced" }, { id: "investor-favourable", label: "36-Month", description: "Later-stage alignment", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "releaseSchedulePosition", label: "Release Schedule", description: "All at once or gradually?", options: [{ id: "founder-favourable", label: "Full at Expiry", description: "All transferable on expiry date", favorability: "client" }, { id: "balanced", label: "Quarterly Pro-Rata", description: "25% each quarter in final year", favorability: "balanced" }, { id: "investor-favourable", label: "Annual Cliff", description: "1/3 per year", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "accelerationPosition", label: "Acceleration Triggers", description: "What allows early transfer?", options: [{ id: "founder-favourable", label: "Broad", description: "CoC, IPO, no-cause termination, death, investor sells 50%+", favorability: "client" }, { id: "balanced", label: "Standard", description: "CoC or IPO. Partial on no-cause. Full on death.", favorability: "balanced" }, { id: "investor-favourable", label: "Limited", description: "Only CoC at 3x+ return", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "permittedTransfersPosition", label: "Permitted During Lock-Up", description: "Estate planning transfers?", options: [{ id: "founder-favourable", label: "Broad", description: "Family trusts, family, estate, RRSPs, charitable 10%", favorability: "client" }, { id: "balanced", label: "Limited", description: "Revocable trusts (voting control) and estate only", favorability: "balanced" }, { id: "investor-favourable", label: "None", description: "Absolute restriction except by law", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "breachConsequencesPosition", label: "Breach Consequences", description: "What if founder violates?", options: [{ id: "founder-favourable", label: "Injunction Only", description: "Court order, no forfeiture", favorability: "client" }, { id: "balanced", label: "Injunction + Escrow Forfeiture", description: "Plus forfeiture of escrowed shares", favorability: "balanced" }, { id: "investor-favourable", label: "Full Consequences", description: "Injunction + forfeiture + repurchase at lower of cost/FMV", favorability: "counter-party" }], defaultPosition: "balanced" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — FOUNDERS' LOCK-UP (CANADIAN):
LOCK-UP MECHANICS only. No governance, protectives, or economics.
NI 45-102 hold runs independently. CBCA s.174: note on certificates.`,
};

// ──────────────────────────────────────────────
// BRIDGE NOTE
// ──────────────────────────────────────────────

const BRIDGE_NOTE_CONFIG: AgreementConfig = {
  id: "bridge-note",
  partyLabels: { partyALabel: "Company (Borrower)", partyAPlaceholder: "StartupCo Inc.", partyBLabel: "Investor (Lender)", partyBPlaceholder: "Existing Investor / Bridge Lender" },
  estimatedGenerationTime: 45,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "principalAmount", "interestRate", "maturityDate"],
  wizardSteps: ["inv-terms", "inv-conversion"],
  clausePositions: [
    { id: "conversionDiscountPosition", label: "Conversion Discount", description: "What discount on conversion into the next round?", options: [{ id: "company-favourable", label: "15%", description: "Lower — minimizes dilution", favorability: "client" }, { id: "balanced", label: "20%", description: "Market-standard Canadian bridge", favorability: "balanced" }, { id: "investor-favourable", label: "25-30%", description: "Higher risk = higher discount", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "maturityPosition", label: "Maturity & Repayment", description: "When does the bridge mature? What if no round closes? Most litigated issue.", options: [{ id: "company-favourable", label: "12-Month + Auto-Extension", description: "Automatic 6-month extension", favorability: "client" }, { id: "balanced", label: "12-Month, Consent Extension", description: "Mutual consent. At maturity: convert or repay.", favorability: "balanced" }, { id: "investor-favourable", label: "6-Month, No Extension", description: "Short, creates urgency + default risk", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "subordinationPosition", label: "Subordination & Priority", description: "Rank vs. existing debt? Determines payout order.", options: [{ id: "company-favourable", label: "Fully Subordinated", description: "Below all senior debt", favorability: "client" }, { id: "balanced", label: "Pari Passu", description: "Equal with other notes", favorability: "balanced" }, { id: "investor-favourable", label: "Senior", description: "Above existing unsecured — rescue nature", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "warrantsPosition", label: "Warrant Coverage", description: "Additional equity sweetener?", options: [{ id: "company-favourable", label: "No Warrants", description: "Discount is the only compensation", favorability: "client" }, { id: "balanced", label: "10-15% Coverage", description: "At next-round price", favorability: "balanced" }, { id: "investor-favourable", label: "20-25% Coverage", description: "At lower of cap or next price, 3-5yr exercise", favorability: "counter-party" }], defaultPosition: "company-favourable" },
    { id: "existingInvestorPosition", label: "Conflict Protections", description: "If bridge investors are also shareholders, conflict rules apply.", options: [{ id: "company-favourable", label: "Independent Board Approval", description: "Non-investor board or special committee", favorability: "client" }, { id: "balanced", label: "Board + Fairness Opinion", description: "Plus independent fairness opinion", favorability: "balanced" }, { id: "investor-favourable", label: "Non-Conflicted Shareholder Vote", description: "Majority of non-participating shareholders", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "qualifiedFinancingPosition", label: "Qualified Financing Threshold", description: "How large must the next round be for automatic conversion?", options: [{ id: "company-favourable", label: "Low ($1M)", description: "Maximum conversion flexibility", favorability: "client" }, { id: "balanced", label: "Standard ($3M-$5M)", description: "Properly priced institutional round", favorability: "balanced" }, { id: "investor-favourable", label: "High ($5M+) + Quality Gate", description: "Institutional lead, 50%+ new money", favorability: "counter-party" }], defaultPosition: "balanced" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — BRIDGE NOTE (CANADIAN):
SHORT-TERM debt. Focus: conversion, maturity, SUBORDINATION. No extensive governance.
Interest Act s.4 (annual rate). Criminal Code s.347 savings clause MANDATORY.
NI 45-106 filing. BIA s.136 subordination.`,
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
    { id: "cnInformationRightsPosition", label: "Information Rights", description: "What financial information must the company provide to the note holder during the term?", options: [{ id: "borrower-favourable", label: "Annual Summary Only", description: "Company provides an annual financial summary — minimal reporting burden during the note term", favorability: "client" }, { id: "balanced", label: "Quarterly Financials + Annual Audited", description: "Quarterly unaudited financial statements and annual audited financials — standard investor information rights", favorability: "balanced" }, { id: "lender-favourable", label: "Full Reporting Suite", description: "Monthly management accounts, quarterly financials, annual audited statements, budget and forecast, cap table updates, and notice of material events", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "cnMfnPosition", label: "Most Favored Nation (MFN)", description: "If the company issues subsequent convertible notes on better terms, does this holder get upgraded?", options: [{ id: "borrower-favourable", label: "No MFN", description: "This note's terms are fixed regardless of any subsequent note issuances", favorability: "client" }, { id: "balanced", label: "Limited MFN (Economic Terms)", description: "Holder can adopt the better of their cap/discount or any subsequently issued convertible note's economic terms", favorability: "balanced" }, { id: "lender-favourable", label: "Broad MFN (All Terms)", description: "Holder can adopt any more favorable term from any subsequently issued convertible instrument — includes governance rights and side letters", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "cnAntiDilutionPosition", label: "Anti-Dilution on Conversion", description: "If the company raises equity at a price below the note's conversion price, is the conversion price adjusted?", options: [{ id: "borrower-favourable", label: "No Anti-Dilution", description: "Conversion price is fixed at the cap/discount regardless of future equity pricing — company avoids additional dilution on conversion", favorability: "client" }, { id: "balanced", label: "Broad-Based Weighted Average", description: "Conversion price adjusted using broad-based weighted average anti-dilution formula on a down-round — standard institutional protection", favorability: "balanced" }, { id: "lender-favourable", label: "Full Ratchet", description: "Conversion price drops to the lowest price of any subsequent equity issuance — maximum investor protection on down-rounds", favorability: "counter-party" }], defaultPosition: "borrower-favourable" },
    { id: "cnKeyPersonPosition", label: "Key Person Event of Default", description: "Is the departure of a key founder treated as an event of default or acceleration trigger?", options: [{ id: "borrower-favourable", label: "No Key Person Clause", description: "No event of default or acceleration trigger tied to any individual — company personnel changes have no impact on the note", favorability: "client" }, { id: "balanced", label: "Key Person Notice Obligation", description: "Company must notify the note holder within 10 business days if a named key person departs — no automatic acceleration but triggers a discussion right", favorability: "balanced" }, { id: "lender-favourable", label: "Key Person Event of Default", description: "Departure of a named key person constitutes an event of default, triggering the holder's right to accelerate or convert at the cap price (holder's election)", favorability: "counter-party" }], defaultPosition: "balanced" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — CONVERTIBLE NOTE (CANADIAN):
This is a debt instrument that converts to equity upon specified trigger events.

CRITICAL REGULATORY REQUIREMENTS:
- Interest Act s.4: All interest must be expressed as an annual rate
- Criminal Code s.347: Include savings clause capping effective rate at 60% per annum
- NI 45-106: Securities law compliance for the conversion feature
- Interest Act s.8: If secured by real property, no default interest allowed
- Interest Act s.6: No interest-on-interest unless the note expressly provides for compound interest at a stated annual rate
- NI 45-106 s.2.3: Obtain signed Form 45-106F9 (Ontario: Form 45-501F1) from each investor BEFORE closing. Verify accredited investor thresholds.
- NI 45-102 s.2.5: Note and conversion shares subject to 4-month hold period. Include restricted security legends.
- Provincial filing: File Form 45-106F1 within 10 days of distribution in each province where investors reside (OSC, BCSC, ASC).
- PPSA: If secured, register financing statement under applicable provincial PPSA to perfect security interest.
- BIA s.136: Draft subordination and priority provisions with BIA insolvency waterfall in mind.

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
- subordinationPosition: Draft subordination clause per selection. If subordinated, include a standstill provision preventing the note holder from exercising remedies while senior debt is outstanding. If pari passu, include pro-rata sharing provisions with other note holders. If senior, address intercreditor implications if the company later obtains bank financing. Reference BIA priority rules in an insolvency scenario.
- cnInformationRightsPosition: Draft information rights covenant per selection. Specify delivery deadlines (quarterly within 45 days, annual within 90 days). Include confidentiality obligations. If full suite, define scope of inspection right, notice of material events (litigation, regulatory action, key employee departures), and cap table update frequency.
- cnMfnPosition: If limited MFN, specify which economic terms are subject to adjustment (valuation cap, discount rate, interest rate). If broad MFN, include an amendment mechanism allowing the holder to elect to adopt improved terms within 30 days of notice of a subsequent issuance.
- cnAntiDilutionPosition: If broad-based weighted average, include the full formula. If full ratchet, specify whether it applies only to the next round or to all future issuances. Include customary carve-outs for ESOP grants, strategic issuances, and shares issued on conversion of existing instruments.
- cnKeyPersonPosition: If key person clause included, name the specific individuals, define the triggering event (departure, reduction to part-time, removal as officer), and specify whether there is a cure period (e.g., 90 days to find a replacement approved by the holder).

VOTING AGREEMENT CROSS-REFERENCES:
- CONVERSION JOINDER: Upon conversion of the note into equity, the note holder must execute a joinder to any existing Voting Agreement (becoming bound by board designation rights under VA-02, protective provisions under VA-05, drag-along under VA-04, and transfer restrictions under VA-06). Include this as a condition to conversion in the conversion mechanics clause.
- PROTECTIVE PROVISIONS: Convertible note holders who convert into preferred shares will be subject to Voting Agreement protective provisions (VA-05-001 to VA-05-025). If the note includes its own investor consent rights (e.g., consent for additional debt, asset sales), these should be drafted to coordinate with — not conflict with — the Voting Agreement's protective provision framework. Upon conversion, the Voting Agreement protective provisions supersede the note's consent rights.
- REGULATORY AWARENESS — NI 62-104: If the note converts into shares representing >20% of voting power, NI 62-104 take-over bid thresholds may be triggered. Include a provision addressing whether conversion is exempt from take-over bid rules (typically exempt as a pre-existing contractual right). Reference NI 62-104 exemptions for convertible security conversion.`,
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
    { id: "crossDefaultPosition", label: "Cross-Default Provisions", description: "Does a default under another agreement trigger a default under this loan?", options: [{ id: "borrower-favourable", label: "No Cross-Default", description: "Default under this loan is independent of all other borrower obligations — no contagion from other agreements", favorability: "client" }, { id: "balanced", label: "Limited Cross-Default", description: "Cross-default only if borrower defaults on debt obligations above a specified threshold (e.g., $100K) — prevents minor disputes from triggering acceleration", favorability: "balanced" }, { id: "lender-favourable", label: "Broad Cross-Default", description: "Default under any material agreement of the borrower (including leases, licenses, and other contracts) triggers a default under this loan — maximum lender protection", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "macClausePosition", label: "Material Adverse Change (MAC) Clause", description: "Can the lender accelerate or refuse draws if a material adverse change occurs in the borrower's business?", options: [{ id: "borrower-favourable", label: "No MAC Clause", description: "No MAC-based acceleration or draw refusal — lender bears the risk of business deterioration during the loan term", favorability: "client" }, { id: "balanced", label: "Narrow MAC (Financial Only)", description: "MAC limited to material adverse changes in the borrower's financial condition or ability to perform its payment obligations — excludes general market or industry conditions", favorability: "balanced" }, { id: "lender-favourable", label: "Broad MAC", description: "MAC covers financial condition, business, operations, assets, or prospects of the borrower — broad discretion for lender to call a MAC event", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "reportingPosition", label: "Financial Reporting Requirements", description: "What ongoing financial information must the borrower provide?", options: [{ id: "borrower-favourable", label: "Annual Financials Only", description: "Annual financial statements within 120 days of fiscal year end — minimal reporting burden", favorability: "client" }, { id: "balanced", label: "Quarterly + Annual Financials", description: "Quarterly unaudited financials within 45 days, annual audited financials within 90 days, plus a compliance certificate confirming covenant compliance", favorability: "balanced" }, { id: "lender-favourable", label: "Comprehensive Reporting", description: "Monthly management accounts, quarterly financials, annual audited statements, annual budget, compliance certificates, and immediate notice of any material event or litigation", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "personalGuaranteePosition", label: "Personal Guarantee Scope", description: "If a personal guarantee is required, what is its scope?", options: [{ id: "borrower-favourable", label: "No Personal Guarantee", description: "Loan is a corporate obligation only — no personal recourse to principals or shareholders", favorability: "client" }, { id: "balanced", label: "Limited Guarantee", description: "Personal guarantee limited to a fixed dollar amount or percentage of the outstanding loan balance — capped exposure for the guarantor", favorability: "balanced" }, { id: "lender-favourable", label: "Unlimited Joint and Several Guarantee", description: "Unlimited personal guarantee from all principals, joint and several — lender can pursue any guarantor for the full outstanding amount", favorability: "counter-party" }], defaultPosition: "borrower-favourable" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — BILATERAL LOAN AGREEMENT (CANADIAN):
Standard loan agreement between one borrower and one lender under Canadian law.

CRITICAL REGULATORY REQUIREMENTS:
- Interest Act s.4: Interest must be expressed as an annual rate
- Interest Act s.8: If secured by real property, no higher default interest rate permitted
- Criminal Code s.347: Savings clause MANDATORY — effective interest cannot exceed 60% per annum
- PPSA: If secured, register financing statement under applicable provincial PPSA promptly. Include borrower covenant to cooperate with registrations and renewals.
- Interest Act s.6: No interest-on-interest unless the agreement expressly provides for compound interest at a stated annual rate.
- BIA s.136/s.244: Draft security provisions with BIA priority waterfall in mind. Provide 10 days notice (BIA s.244) before enforcing security against an insolvent debtor.
- Criminal Code s.347 calculation: Include ALL fees, commitment charges, standby charges, and premiums when computing the effective annual rate for s.347 compliance.

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
- repaymentStructurePosition: Draft the repayment schedule per selection. For bullet repayment, include refinancing risk acknowledgment. For balloon, specify the amortization period vs. the loan term (e.g., 10-year amortization, 5-year term).
- crossDefaultPosition: If limited, define threshold amount and covered obligations. If broad, include carve-outs for bona fide disputes.
- macClausePosition: Define MAC precisely. Narrow MAC excludes general economic/industry conditions and changes in law. Broad MAC may include prospects. Specify remedies (acceleration, draw stop, increased reporting).
- reportingPosition: Include compliance certificate (officer's certificate confirming no default and covenant compliance). Specify GAAP/ASPE format, delivery deadlines, and consequences of late delivery.
- personalGuaranteePosition: If limited, specify dollar cap and whether it reduces with principal repayment. If unlimited, include joint and several liability, continuing guarantee, and waiver of defenses.`,
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
    { id: "dnSecurityPosition", label: "Security Interest", description: "Is the demand note secured?", options: [{ id: "borrower-favourable", label: "Unsecured", description: "General unsecured obligation", favorability: "client" }, { id: "balanced", label: "Specific Collateral", description: "Secured by specific identified assets", favorability: "balanced" }, { id: "lender-favourable", label: "GSA + PPSA", description: "First-priority GSA registered under PPSA", favorability: "counter-party" }], defaultPosition: "borrower-favourable" },
    { id: "dnPrepaymentPosition", label: "Prepayment", description: "Can the borrower prepay before demand?", options: [{ id: "borrower-favourable", label: "Prepay Freely", description: "Prepay any time without penalty", favorability: "client" }, { id: "balanced", label: "10 Days Notice", description: "Prepay with 10 days notice", favorability: "balanced" }, { id: "lender-favourable", label: "Consent Required", description: "No prepayment without lender consent", favorability: "counter-party" }], defaultPosition: "borrower-favourable" },
    { id: "dnDefaultPosition", label: "Events of Default", description: "What events beyond non-payment constitute default?", options: [{ id: "borrower-favourable", label: "Non-Payment Only", description: "Default only on failure to pay after demand", favorability: "client" }, { id: "balanced", label: "Standard Defaults", description: "Non-payment, misrepresentation, insolvency, bankruptcy", favorability: "balanced" }, { id: "lender-favourable", label: "Comprehensive", description: "Non-payment, cross-default, MAC, change of control, covenant breach, insolvency", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "dnCrossDefaultPosition", label: "Cross-Default", description: "Does default under another obligation trigger default here?", options: [{ id: "borrower-favourable", label: "No Cross-Default", description: "Independent of other obligations", favorability: "client" }, { id: "balanced", label: "Limited", description: "Cross-default on debt above threshold only", favorability: "balanced" }, { id: "lender-favourable", label: "Full", description: "Default under any material obligation triggers default", favorability: "counter-party" }], defaultPosition: "borrower-favourable" },
    { id: "dnDefaultInterestPosition", label: "Default Interest", description: "Does interest rate increase on default?", options: [{ id: "borrower-favourable", label: "No Default Interest", description: "Rate unchanged on default", favorability: "client" }, { id: "balanced", label: "+2% Default Rate", description: "Rate increases 2% on overdue amounts", favorability: "balanced" }, { id: "lender-favourable", label: "+5% Default Rate", description: "Rate increases 5% (subject to s.347 cap)", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "dnAssignmentPosition", label: "Assignment", description: "Can the lender assign the note?", options: [{ id: "borrower-favourable", label: "Consent Required", description: "No assignment without borrower consent", favorability: "client" }, { id: "balanced", label: "Affiliates Only", description: "Assign to affiliates freely; others need consent", favorability: "balanced" }, { id: "lender-favourable", label: "Freely Assignable", description: "Lender may assign to any party", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "dnWaiverPosition", label: "Borrower Waivers", description: "What statutory rights does the borrower waive?", options: [{ id: "borrower-favourable", label: "Minimal", description: "Waives presentment and protest only", favorability: "client" }, { id: "balanced", label: "Standard", description: "Waives presentment, protest, notice of dishonour", favorability: "balanced" }, { id: "lender-favourable", label: "Comprehensive", description: "Waives presentment, protest, dishonour notice, set-off, surety defenses", favorability: "counter-party" }], defaultPosition: "balanced" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — DEMAND PROMISSORY NOTE (CANADIAN):
A simple promissory note payable on demand under the Bills of Exchange Act.

CRITICAL REGULATORY REQUIREMENTS:
- Bills of Exchange Act: Note must meet formal requirements (unconditional promise, sum certain, payable on demand)
- Interest Act s.4: Interest expressed as annual rate
- Criminal Code s.347: Savings clause MANDATORY — effective rate including fees and default interest must not exceed 60%
- Interest Act s.6: No interest-on-interest unless expressly provided at a stated annual rate
- PPSA: If secured, register financing statement under applicable provincial PPSA
- BIA s.136: Unsecured demand note ranks as ordinary unsecured claim in insolvency

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
13. AI/automated decision-making disclosure and transparency (AIDA readiness)
14. Cross-border data transfer provisions with PIPEDA accountability
15. Security audit and penetration testing rights
16. Disaster recovery RPO/RTO commitments
17. Accessibility compliance (AODA WCAG 2.0 Level AA for Ontario)

CRITICAL CANADIAN LEGAL FRAMEWORK:
- PIPEDA s.10.1: Breach notification within 72 hours where RROSH exists. Report to OPC and notify affected individuals.
- Bill C-27 (CPPA + AIDA): Draft for forward-compatibility with data portability rights, algorithmic transparency, and AI impact assessments.
- Quebec Law 25 (Bill 64, effective Sept 2023): Mandatory PIAs, designated privacy officer, consent for cross-border transfers, penalties up to $25M or 4% worldwide turnover.
- CASL (S.C. 2010, c. 23): Service-related CEMs require consent. Transactional messages generally exempt under s.6(6).
- AODA: WCAG 2.0 Level AA for Ontario users.
- OPC cross-border guidance (2019): Accountability under Principle 1 for PI transferred to foreign processors.

KEY CASE LAW:
- Tercon v. BC (2010 SCC): Limitation clauses must be clear and not unconscionable
- Sattva v. Creston Moly (2014 SCC): Factual matrix matters for interpretation
- Bhasin v. Hrynew (2014 SCC): Duty of honest performance in SLA obligations
- Uber v. Heller (2020 SCC): Unconscionable standard form terms unenforceable
- Douez v. Facebook (2017 SCC): Forum selection in consumer contracts subject to fairness test

ADDITIONAL CLAUSE POSITIONS:
- terminationPosition: Draft termination for convenience clause per selection. If not permitted, ensure there is still a robust termination for cause provision. If permitted, address refund of prepaid fees on early termination.
- indemnificationPosition: Draft indemnification clause per selection. If provider indemnifies for IP, include standard exclusions (modifications by customer, combination with third-party software, use outside documentation). Include defense and settlement control mechanics.
- renewalPosition: Draft renewal mechanics per selection. If auto-renewal, specify the price escalation cap (e.g., CPI or maximum 5% increase). If mutual agreement, include a negotiation period before expiry.
- dataDeletionPosition: Draft data deletion clause per selection. Specify the deletion standard (NIST 800-88 or equivalent). Address backup copies — specify the retention period for backups and when backup deletion occurs. Include a written certification of deletion signed by the provider's privacy officer. Address legal hold obligations that may override deletion timelines.
- subProcessorPosition: Draft sub-processor clause per selection. Require that all sub-processors are bound by data processing agreements no less protective than the customer agreement. Include a current list of approved sub-processors as an exhibit. If prior consent required, specify the approval timeline and what happens if customer objects (provider must offer alternative or customer may terminate affected services). Reference PIPEDA Principle 7 (Safeguards) for the standard sub-processors must meet.
- serviceCreditPosition: Draft service credit calculation per selection. Specify: (a) measurement period (calendar month), (b) calculation formula, (c) exclusions from downtime (planned maintenance, force majeure, customer-caused), (d) claim process (request within 30 days), (e) credit cap as percentage of monthly fees.
- disasterRecoveryPosition: Draft DR clause per selection. Specify: (a) RPO and RTO targets, (b) geographic separation of backup facilities, (c) DR testing frequency and customer participation rights, (d) DR plan documentation, (e) notification during DR events, (f) whether DR failures constitute SLA breaches.
- securityAuditPosition: Draft security audit clause per selection. Include: (a) SOC 2 Type II report sharing, (b) customer pen testing rights, (c) vulnerability remediation timelines, (d) ISO 27001 or equivalent certification obligation, (e) cooperation with customer compliance audits.
- aiDisclosurePosition: Draft AI clause per selection. Reference AIDA (Bill C-27). Include: (a) disclosure of AI/ML features, (b) data inputs used, (c) customer opt-out rights, (d) human review for significant automated decisions, (e) algorithmic impact assessment, (f) Quebec Law 25 s.12.1 compliance.`,
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
// SUBSCRIPTION AGREEMENTS
// ──────────────────────────────────────────────

const SUBSCRIPTION_AGREEMENT_CONFIG: AgreementConfig = {
  id: "subscription-agreement",
  partyLabels: {
    partyALabel: "Service Provider (Company)",
    partyAPlaceholder: "SaaSCo Technologies Inc.",
    partyBLabel: "Subscriber",
    partyBPlaceholder: "Client Corp. / Jane Smith",
  },
  estimatedGenerationTime: 35,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "serviceDescription", "subscriptionFee", "billingCycle"],
  wizardSteps: ["sub-service", "sub-billing", "sub-tiers", "sub-clause", "sub-data"],
  clausePositions: [
    {
      id: "autoRenewalPosition",
      label: "Auto-Renewal Terms",
      description: "How does the subscription renew at the end of each billing period?",
      options: [
        { id: "provider-favourable", label: "Auto-Renew with 60-Day Opt-Out", description: "Subscription automatically renews for successive terms of equal length unless subscriber provides written notice of non-renewal at least 60 days before the end of the current term. Compliant with Ontario CPA s.43 disclosure requirements for automatic renewals.", favorability: "client" },
        { id: "balanced", label: "Auto-Renew with 30-Day Opt-Out + Reminder", description: "Subscription auto-renews but provider must send a renewal reminder notice at least 30 days before the renewal date, clearly disclosing the renewal terms, pricing, and cancellation instructions per CASL and CPA requirements. Subscriber may cancel within 30 days of renewal if reminder was not sent.", favorability: "balanced" },
        { id: "subscriber-favourable", label: "Affirmative Renewal Required", description: "Subscription expires at the end of each term unless the subscriber affirmatively opts in to renewal. No automatic charges. Provider must send a renewal offer at least 30 days before expiry.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "cancellationPosition",
      label: "Cancellation Policy",
      description: "How can the subscriber cancel and what happens to prepaid fees?",
      options: [
        { id: "provider-favourable", label: "Cancel at End of Term Only", description: "Subscriber may cancel only at the end of the current billing period by providing written notice. No refund of prepaid fees. Cancellation takes effect at the end of the then-current term.", favorability: "client" },
        { id: "balanced", label: "Cancel Anytime, Pro-Rata Refund", description: "Subscriber may cancel at any time. If on an annual plan, provider refunds unused months on a pro-rata basis less a reasonable early termination fee (e.g., one month). Monthly subscribers cancel effective next billing date.", favorability: "balanced" },
        { id: "subscriber-favourable", label: "Cancel Anytime, Full Refund of Unused", description: "Subscriber may cancel at any time with immediate effect. Full refund of any prepaid and unused subscription fees within 30 days. No early termination penalty.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "priceChangePosition",
      label: "Price Change Notice",
      description: "How much notice must the provider give before changing subscription pricing?",
      options: [
        { id: "provider-favourable", label: "30 Days Notice, Effective Next Renewal", description: "Provider may change pricing with 30 days written notice. New pricing takes effect at the next renewal date. Continued use after the renewal date constitutes acceptance of the new pricing.", favorability: "client" },
        { id: "balanced", label: "60 Days Notice + Right to Cancel", description: "Provider must give at least 60 days written notice of any price increase. If the increase exceeds CPI + 3%, subscriber may cancel without penalty before the new pricing takes effect. Annual subscribers are price-locked for the current term.", favorability: "balanced" },
        { id: "subscriber-favourable", label: "Price-Locked for Full Term + 90 Days Notice", description: "Subscription pricing is locked for the entire initial term and each renewal term. Any price change requires 90 days advance written notice and subscriber's express written consent. Subscriber may cancel with full pro-rata refund if price increase is rejected.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "usageOveragePosition",
      label: "Usage Overage Handling",
      description: "What happens when the subscriber exceeds their plan's usage limits?",
      options: [
        { id: "provider-favourable", label: "Automatic Overage Charges", description: "Usage exceeding plan limits is automatically billed at the published overage rate. Provider will send a notification when usage reaches 80% and 100% of the plan limit but is not required to suspend or throttle.", favorability: "client" },
        { id: "balanced", label: "Notification + Grace Period", description: "Provider notifies subscriber when usage reaches 80% and 100% of plan limits. A 7-day grace period applies at 100%, during which subscriber may upgrade or reduce usage. After the grace period, overage charges apply at the published rate.", favorability: "balanced" },
        { id: "subscriber-favourable", label: "Hard Cap with Upgrade Prompt", description: "Service is throttled (not terminated) when plan limits are reached. No automatic overage charges. Provider notifies subscriber and offers upgrade options. Subscriber must affirmatively consent to any additional charges.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "dataPortabilityPosition",
      label: "Data Portability on Termination",
      description: "How does the subscriber get their data back when the subscription ends?",
      options: [
        { id: "provider-favourable", label: "30-Day Export Window (Self-Serve)", description: "Subscriber has 30 days after termination to export data through the platform's self-serve export tools. After 30 days, provider deletes all subscriber data with no obligation to assist. Standard export format (CSV/JSON).", favorability: "client" },
        { id: "balanced", label: "60-Day Export + Assisted Migration", description: "Subscriber has 60 days to export data. Provider makes data available in standard machine-readable formats (CSV, JSON, XML) and provides reasonable assistance with data migration at no additional cost. Provider certifies deletion within 15 business days after the export window closes.", favorability: "balanced" },
        { id: "subscriber-favourable", label: "Full Portability + Extended Retention", description: "Provider exports all subscriber data in multiple standard formats on the termination date. Data retained for 90 days for re-activation convenience. Provider provides full migration assistance including API access during transition. Certified deletion with written confirmation upon subscriber request after the retention period.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "liabilityCapPosition",
      label: "Liability Cap",
      description: "What is the maximum liability each party faces under the agreement?",
      options: [
        { id: "provider-favourable", label: "Cap at Fees Paid in Last 12 Months", description: "Total aggregate liability for either party capped at the subscription fees actually paid in the 12 months preceding the claim. Excludes all indirect, consequential, and punitive damages.", favorability: "client" },
        { id: "balanced", label: "Cap at 2x Annual Subscription Fee", description: "Total aggregate liability capped at twice the annual subscription fee. Carve-outs from the cap for breach of confidentiality, IP infringement indemnity, and willful misconduct. Consequential damages excluded except for the carve-out categories.", favorability: "balanced" },
        { id: "subscriber-favourable", label: "Cap at Total Contract Value (Uncapped for Data Breach)", description: "Liability capped at the total contract value across all terms. No cap on provider's liability for data breaches involving subscriber's personal information, IP infringement, or gross negligence. Subscriber retains right to consequential damages for data breach claims.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "refundPolicyPosition",
      label: "Refund Policy",
      description: "Under what circumstances can the subscriber obtain a refund?",
      options: [
        { id: "provider-favourable", label: "No Refunds", description: "All fees are non-refundable once paid. Service credits are the sole remedy for service failures. Consistent with standard B2B SaaS practice.", favorability: "client" },
        { id: "balanced", label: "Pro-Rata Refund for Material Breach", description: "Refund of unused prepaid fees on a pro-rata basis if the agreement is terminated due to provider's material breach. For B2C subscribers, a 30-day satisfaction guarantee applies per provincial consumer protection standards.", favorability: "balanced" },
        { id: "subscriber-favourable", label: "Full Refund Guarantee", description: "30-day money-back guarantee for new subscriptions. Pro-rata refund for cancellation at any time. Full refund if provider fails to meet SLA commitments for 2 or more months in any 6-month period.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "serviceModificationPosition",
      label: "Service Modification Rights",
      description: "How much can the provider change the service during the subscription term?",
      options: [
        { id: "provider-favourable", label: "Broad Modification Rights", description: "Provider may modify, update, or discontinue features at any time with 15 days notice. Provider is not obligated to maintain backward compatibility. Continued use after modification constitutes acceptance.", favorability: "client" },
        { id: "balanced", label: "Material Changes Require Notice + Opt-Out", description: "Provider may make non-material improvements at any time. Material changes (feature removal, API changes, data handling changes) require 30 days advance written notice. Subscriber may terminate without penalty if a material change adversely affects their use.", favorability: "balanced" },
        { id: "subscriber-favourable", label: "Feature Freeze + Consent Required", description: "Core features as described in the service description at the time of subscription are guaranteed for the term. Material modifications to core features require subscriber's prior written consent. If consent is withheld, subscriber may continue on existing terms or terminate with a full pro-rata refund.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "suspensionRightsPosition",
      label: "Suspension Rights",
      description: "When can the provider suspend the subscriber's access to the service?",
      options: [
        { id: "provider-favourable", label: "Broad Suspension Rights", description: "Provider may suspend access immediately for non-payment, suspected abuse, security threats, or at provider's reasonable discretion. No obligation to provide advance notice for security-related suspensions.", favorability: "client" },
        { id: "balanced", label: "Suspension with Notice + Cure Period", description: "For non-payment: 10 business days written notice and cure period before suspension. For policy violations: 5 business days notice except for imminent security threats (immediate suspension with concurrent notice). Provider must restore access within 24 hours of issue resolution.", favorability: "balanced" },
        { id: "subscriber-favourable", label: "Restricted Suspension + Data Access", description: "Suspension only for non-payment (after 15 business days notice and cure period) or imminent security threat. During suspension, subscriber retains read-only access to their data for export purposes. Provider must provide written reasons for any suspension and an appeals process.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "ipOwnershipPosition",
      label: "Intellectual Property",
      description: "Who owns what intellectual property under the subscription?",
      options: [
        { id: "provider-favourable", label: "Provider Owns Everything", description: "Provider retains all IP rights in the service, platform, and any customizations. Subscriber's data is licensed to provider for service improvement, analytics, and aggregated benchmarking. Subscriber receives a limited, non-exclusive license to use the service during the term.", favorability: "client" },
        { id: "balanced", label: "Split Ownership", description: "Provider owns the platform, service, and all pre-existing IP. Subscriber owns all subscriber data and content uploaded to the platform. Provider may use anonymized, aggregated subscriber data for service improvement only. Custom integrations built for subscriber are jointly owned.", favorability: "balanced" },
        { id: "subscriber-favourable", label: "Subscriber Retains Maximum Rights", description: "Provider owns the platform. Subscriber owns all subscriber data, content, configurations, workflows, and custom integrations. Provider has no right to use subscriber data for any purpose other than delivering the service. All subscriber-generated outputs belong exclusively to the subscriber.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — SUBSCRIPTION AGREEMENT:
This is a subscription agreement for SaaS/recurring-revenue businesses operating in Canada.

PARTY DYNAMICS:
- The Service Provider (Party A) wants predictable recurring revenue, flexibility to modify the service, and protection from churn-related revenue loss
- The Subscriber (Party B) wants clear pricing, cancellation rights, data portability, service level commitments, and protection against unilateral changes

TARGET DOCUMENT LENGTH: 20-35 pages, written in clear commercial language appropriate for the subscriber audience (B2B or B2C as indicated by the wizard inputs).

CRITICAL CANADIAN LEGAL FRAMEWORK:

1. AUTO-RENEWAL & CONSUMER PROTECTION:
- Ontario Consumer Protection Act, 2002 (CPA), s.43-43.1: Internet agreements must disclose material terms including renewal provisions. Automatic renewals in consumer contracts require clear and prominent disclosure BEFORE the initial purchase, and the consumer must be able to cancel within the statutory cancellation window.
- Ontario CPA s.37-40: Future performance agreements (including subscriptions over $50) have specific disclosure requirements and a 1-year cancellation right if required information was not disclosed.
- Ontario Regulation 17/05 (General) s.31-34: Prescribes the specific disclosure format for internet agreements — supplier name, description, itemized pricing, total cost, delivery date, cancellation rights, and contact information.
- BC Business Practices and Consumer Protection Act (BPCPA), Part 4: Distance sales contracts require similar disclosures. Consumer may cancel within 7 days if supplier fails to provide required disclosures.
- Alberta Internet Sales Contract Regulation (AR 81/2001): Requires disclosure of total price, cancellation policy, and supplier contact information for internet sales.
- Quebec Consumer Protection Act (CPA), ss.214.1-214.8: Strict rules for distance contracts. Consumer has 7 days to cancel. Auto-renewal clauses must be clear and in French.

2. CASL (CANADA'S ANTI-SPAM LEGISLATION, S.C. 2010, c. 23):
- s.6: Every commercial electronic message (CEM) requires consent — express or implied
- s.10: Express consent must include: identity of sender, contact information, unsubscribe mechanism, and statement that consent can be withdrawn
- Implied consent under s.10(9): Exists for 2 years from a purchase/subscription, 6 months from an inquiry
- Auto-renewal reminder emails ARE commercial electronic messages and MUST comply with CASL
- Billing notifications and transactional messages are generally exempt under s.6(6) but renewal marketing is NOT exempt
- Penalty: Up to $10M per violation for organizations — this is not theoretical, the CRTC actively enforces

3. PIPEDA (S.C. 2000, c. 5):
- All subscriber personal information collected, used, or disclosed must comply with the 10 Fair Information Principles
- Payment information (credit card, bank account) is sensitive personal information requiring express consent
- Data breach notification: Report to OPC and notify affected individuals if breach creates a real risk of significant harm (RROSH) — PIPEDA s.10.1
- Data portability: While not yet a statutory right under PIPEDA, Bill C-27 (Digital Charter Implementation Act) proposes data portability — draft the agreement to be forward-compatible
- Quebec Law 25: If subscribers are in Quebec, additional obligations apply including privacy impact assessments, data residency preferences, and a designated privacy officer

4. BILLING & PAYMENT LAW:
- Interest Act, R.S.C. 1985, c. I-15, s.4: If charging interest on overdue amounts, the annual rate must be expressly stated (not just a monthly rate). Failure to disclose the annual rate limits recovery to 5% per annum.
- Criminal Code s.347: Criminal interest rate — effective annual rate must not exceed 60% (48% effective January 1, 2025 per Bill C-46 amendments). Ensure late fees + interest do not combine to exceed this threshold.
- Currency Act: All prices must be expressed in Canadian dollars unless otherwise agreed. If USD pricing is offered to Canadian subscribers, the agreement must clearly disclose this.
- GST/HST: Subscription fees for digital services are subject to GST/HST. Non-resident providers must register for GST/HST if providing digital services to Canadian consumers (Excise Tax Act, Part IX, Division II).

5. UNCONSCIONABILITY & ENFORCEABILITY:
- Uber Technologies Inc. v. Heller, 2020 SCC 16: Standard form contract terms that are unconscionable are unenforceable. Auto-renewal, cancellation penalties, and dispute resolution clauses must not create an undue barrier for subscribers.
- Douez v. Facebook Inc., 2017 SCC 33: Forum selection clauses in consumer contracts are subject to a fairness inquiry — do not default to a foreign jurisdiction for Canadian consumer subscribers.
- Rudder v. Microsoft Corp., 1999 CanLII 14923 (ON SC): Clickwrap acceptance is enforceable, but terms must be reasonably accessible and readable.
- Tilden Rent-A-Car v. Clendenning, 1978 CanLII 1446 (ON CA): Onerous terms buried in standard form contracts may be unenforceable if the party signing could not reasonably be expected to have read and understood them — ensure prominent disclosure of auto-renewal, price escalation, and cancellation restrictions.

MANDATORY PROVISIONS — EVERY SUBSCRIPTION AGREEMENT MUST INCLUDE:
1. Service description: What the subscriber is getting, feature scope, plan tier details
2. Subscription term: Start date, initial term length, renewal mechanics
3. Pricing and billing: Subscription fee, billing cycle (monthly/annual), payment method, currency, taxes
4. Auto-renewal disclosure: CASL-compliant notice of auto-renewal terms, how to opt out, reminder notice schedule
5. Cancellation and termination: How to cancel, notice period, effect of cancellation, refund/credit treatment
6. Price changes: Notice period, effective date, subscriber's right to cancel if price increases
7. Usage limits and overages: What is included in the plan, what happens at the limit, overage pricing
8. Plan tier changes: How to upgrade/downgrade, when changes take effect, pricing adjustments
9. Service level commitments: Uptime target (reference SLA if separate), maintenance windows, service credits
10. Data ownership and portability: Who owns subscriber data, export rights, format, timeline on termination
11. Intellectual property: Platform IP, subscriber content IP, license grants
12. Suspension and termination for cause: Non-payment suspension, AUP violations, cure periods
13. Liability limitations: Cap, exclusions, carve-outs for data breach and IP infringement
14. Privacy and data protection: PIPEDA compliance, data processing, breach notification, reference to Privacy Policy
15. Dispute resolution: Governing law, jurisdiction, arbitration (if any — with Uber v. Heller safeguards)
16. Force majeure: Defined events, notice obligations, termination right for extended force majeure
17. Assignment: Provider may assign on change of control (with notice); subscriber may not assign without consent
18. Entire agreement, severability, and amendments clause

DRAFTING GUIDANCE FOR SPECIFIC CLAUSE POSITIONS:

- autoRenewalPosition: This is the MOST REGULATED clause in the agreement. Draft precisely per selection. If auto-renewal is included, the agreement MUST: (a) disclose the renewal terms prominently before the subscriber's initial purchase, (b) state the renewal price or the formula for determining it, (c) specify the deadline for opting out and exactly how to opt out (email, dashboard, phone — at minimum two methods), (d) require the provider to send a reminder notice in advance of each renewal (30 days minimum to comply with CPA best practices). For Ontario B2C subscribers, ensure compliance with CPA s.43 — failure to properly disclose auto-renewal terms gives the consumer a right to cancel at any time and receive a full refund of unearned fees. For Quebec subscribers, auto-renewal clauses must be in French and meet the stricter Quebec CPA requirements for distance contracts.

- cancellationPosition: Draft cancellation clause per selection. Ensure the cancellation mechanism is as easy as the sign-up mechanism (emerging regulatory expectation and FTC Click-to-Cancel rule influence, even in Canada). Specify: (a) how to cancel (online dashboard, email, or phone — never require mail or fax only), (b) when cancellation takes effect, (c) what happens to prepaid fees, (d) whether there is an early termination fee and how it is calculated. For B2C subscribers, ensure the cancellation clause does not violate provincial consumer protection cancellation rights — in Ontario, internet agreement cancellation rights under CPA ss.37-40 may override contractual cancellation restrictions.

- priceChangePosition: Draft price change clause per selection. Canadian courts have held that unilateral price change provisions in standard form contracts must be reasonable and properly disclosed (Tilden v. Clendenning principle). Include: (a) minimum notice period, (b) how notice will be delivered (email to subscriber's registered email, in-app notification, or both), (c) whether annual subscribers are price-locked for their current term, (d) subscriber's right to cancel if they reject the new pricing, (e) any cap on annual price increases (CPI-indexed caps are market-friendly).

- usageOveragePosition: Draft overage clause per selection. Key considerations: (a) define measurable usage metrics (API calls, storage, seats, bandwidth), (b) specify the published overage rate or rate card as an exhibit, (c) notification triggers (80%, 90%, 100%), (d) whether usage is measured in real-time or on billing cycle close, (e) for B2C subscribers, ensure compliance with CPA disclosure requirements — the subscriber must know the maximum possible charge before committing.

- dataPortabilityPosition: Draft data portability clause per selection. This is critical for subscriber lock-in risk and increasingly regulated. Include: (a) subscriber's right to export data at any time during the subscription (not just on termination), (b) export formats (CSV, JSON, XML at minimum), (c) timeline for provider to make data available on termination, (d) whether migration assistance is included and at what cost, (e) PIPEDA access rights — subscriber has the right to access their personal information held by the provider regardless of contractual terms. Note: Bill C-27 (if enacted) will create a statutory data portability right — draft to be forward-compatible.

- liabilityCapPosition: Draft liability cap per selection. Standard carve-outs from the cap should include: (a) indemnification obligations, (b) breach of confidentiality, (c) IP infringement, (d) willful misconduct or gross negligence, (e) provider's data breach obligations under PIPEDA. For B2C subscribers, certain liability limitations may be unenforceable under provincial consumer protection legislation — include a savings clause that preserves subscriber's statutory rights.

- refundPolicyPosition: Draft refund clause per selection. For B2C subscribers, note that Ontario CPA s.43 provides a right to cancel and receive a credit within specific timeframes for internet agreements. BC BPCPA provides a 7-day cancellation right for distance sales if required disclosures were not made. Ensure the refund policy does not purport to override these statutory rights. Include the refund method (original payment method), timeline (within 15 business days is best practice), and any conditions (subscriber must return access credentials, delete local copies, etc.).

- serviceModificationPosition: Draft service modification clause per selection. Include: (a) definition of what constitutes a "material" change, (b) how notice is delivered, (c) subscriber's remedies if a material change adversely affects them, (d) whether the subscriber can continue on legacy terms for the remainder of their current term. Consider Uber v. Heller — unilateral modification clauses that are overly broad may be challenged as unconscionable.

- suspensionRightsPosition: Draft suspension clause per selection. Ensure suspension provisions are proportionate and include due process protections. Include: (a) grounds for suspension (non-payment, AUP violation, security threat, legal compliance), (b) notice requirements (advance notice for non-payment, concurrent notice for security), (c) cure period before suspension takes effect, (d) what happens to subscriber's data during suspension (preserved, accessible read-only, or locked), (e) timeline for restoration after the issue is resolved. For B2C subscribers, immediate suspension without notice (except for genuine security threats) may be challenged under consumer protection fairness standards.

- ipOwnershipPosition: Draft IP clause per selection. Critical distinctions: (a) platform/service IP (always remains with provider), (b) subscriber content and data (should remain with subscriber unless explicitly licensed), (c) aggregated/anonymized data (common for provider to retain rights — but must comply with PIPEDA), (d) custom configurations, workflows, and integrations (negotiate case-by-case), (e) feedback and suggestions (typically licensed to provider — but disclose this). Include a moral rights waiver under Copyright Act s.14.1 for any subscriber content that qualifies as a "work" under the Act.

B2B vs. B2C CONSIDERATIONS:
- If the subscriber is a CONSUMER (individual for personal use), provincial consumer protection statutes apply and OVERRIDE conflicting contractual terms. Draft a savings clause: "Nothing in this Agreement limits or excludes any rights the Subscriber may have under applicable consumer protection legislation."
- If the subscriber is a BUSINESS, the agreement has more freedom to limit remedies and impose restrictions — but unconscionability under Uber v. Heller still applies to standard form terms.
- If the platform serves BOTH B2B and B2C subscribers, include a bifurcated provision: "Sections X.1 through X.5 apply only to Business Subscribers. Sections Y.1 through Y.5 apply only to Consumer Subscribers and reflect applicable provincial consumer protection requirements."

VOTING AGREEMENT CROSS-REFERENCES (applicable when subscription involves equity or revenue-share components):
- CHANGE OF CONTROL: If the SaaS provider is subject to a Voting Agreement or SHA with drag-along provisions, a change-of-control transaction may affect subscriber relationships. Include a change-of-control clause addressing: (a) subscriber's right to terminate if the provider is acquired by a competitor, (b) assignment of the subscription agreement to the acquirer, (c) continuity of service levels and data handling obligations post-acquisition. This coordinates with Voting Agreement termination triggers (VA-07) — when a drag-along or merger closes, the provider's subscriber agreements must be assignable.
- REGULATORY AWARENESS — MI 61-101: If the subscription agreement involves a related-party component (e.g., the subscriber is an insider, affiliate, or associate of the provider), MI 61-101 minority protection rules may classify the arrangement as a related party transaction. Include appropriate disclosure if the subscriber relationship involves consideration exceeding $25K and the provider is a reporting issuer.`,
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
    {
      id: "profitAllocationPosition",
      label: "Profit & Loss Allocation",
      description: "How are the partnership's profits and losses divided between partners?",
      options: [
        { id: "equal-split", label: "Equal Split", description: "Profits and losses split 50/50 regardless of capital contribution — simple but may not reflect unequal contributions", favorability: "balanced" },
        { id: "proportional-to-capital", label: "Proportional to Capital Contribution", description: "Profits and losses allocated in proportion to each partner's capital contribution — rewards financial investment", favorability: "client" },
        { id: "custom-split", label: "Custom Split (Sweat Equity Recognized)", description: "Profits and losses allocated per a custom schedule that recognizes both capital and non-capital contributions (time, skills, relationships)", favorability: "counter-party" },
      ],
      defaultPosition: "proportional-to-capital",
    },
    {
      id: "capitalContributionPosition",
      label: "Capital Contributions",
      description: "How are initial and future capital contributions handled?",
      options: [
        { id: "fixed-initial-only", label: "Fixed Initial Contribution Only", description: "Each partner makes a defined initial contribution; no obligation for additional capital — partners know their maximum financial exposure upfront", favorability: "counter-party" },
        { id: "pro-rata-calls", label: "Pro-Rata Capital Calls", description: "Managing partner may issue capital calls proportional to ownership; partners who do not contribute face dilution — standard for operating partnerships", favorability: "balanced" },
        { id: "mandatory-additional", label: "Mandatory Additional Contributions", description: "Partners must contribute additional capital as required by the business, up to a defined maximum — ensures the business is adequately funded", favorability: "client" },
      ],
      defaultPosition: "pro-rata-calls",
    },
    {
      id: "disputeResolutionPosition",
      label: "Dispute Resolution",
      description: "How do the partners resolve disagreements about the business?",
      options: [
        { id: "mediation-first", label: "Mediation Then Arbitration", description: "Disputes go to mediation first; if unresolved within 30 days, binding arbitration — keeps disputes private and faster than court", favorability: "balanced" },
        { id: "arbitration-only", label: "Binding Arbitration", description: "All disputes resolved by binding arbitration under provincial arbitration legislation — fast, private, final", favorability: "client" },
        { id: "litigation", label: "Court Litigation", description: "Partners retain full right to litigate disputes in court — public process but preserves appeal rights and judicial oversight", favorability: "counter-party" },
      ],
      defaultPosition: "mediation-first",
    },
    {
      id: "exitDissolutionPosition",
      label: "Exit & Dissolution",
      description: "What happens when a partner wants to leave or the partnership needs to wind down?",
      options: [
        { id: "buyout-formula", label: "Mandatory Buyout at Formula Price", description: "Departing partner's interest must be purchased by remaining partners at a price determined by a pre-agreed formula (book value, multiple of earnings, or independent valuation) — provides certainty", favorability: "balanced" },
        { id: "right-of-first-refusal", label: "Right of First Refusal + Market Sale", description: "Remaining partners have 60 days to match any third-party offer; if they decline, the departing partner may sell to the third party — balances exit freedom with partner protection", favorability: "counter-party" },
        { id: "lock-in-period", label: "Lock-In Period (3 Years) Then Buyout", description: "Partners cannot exit for the first 3 years; after the lock-in, mandatory buyout at independently appraised fair market value — protects the partnership during the critical early years", favorability: "client" },
      ],
      defaultPosition: "buyout-formula",
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
12. Dispute resolution

ADDITIONAL CLAUSE POSITIONS:
- profitAllocationPosition: Draft profit/loss allocation per selection. Address guaranteed payments (salary/draw) before profit split. Specify distribution frequency (monthly, quarterly, annual). Address tax implications — partnership income flows through to partners individually regardless of whether cash is distributed.
- capitalContributionPosition: Draft capital contribution provisions per selection. Specify the valuation methodology for non-cash contributions (property, equipment, IP). If capital calls are permitted, define the call process, notice period, and consequences of failing to contribute (dilution formula or forced buyout).
- disputeResolutionPosition: Draft dispute resolution per selection. Include a deadlock-breaking mechanism for 50/50 partnerships (casting vote, third-party tie-breaker, shotgun clause). Address interim measures — can operations continue during a dispute? Include costs allocation.
- exitDissolutionPosition: Draft exit and dissolution per selection. Address the valuation mechanism in detail — who values the departing partner's interest and how. Include non-compete provisions post-departure. Address the effect of death or disability (life insurance funded buyout is standard). Specify the payment timeline for the buyout price (lump sum vs. installments).`,
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
    {
      id: "offerExpiryPosition",
      label: "Offer Acceptance Deadline",
      description: "How long does the candidate have to accept this offer? Per Krishnamoorthy v. Olympus, stated terms in an offer letter are binding — an open-ended offer creates risk.",
      options: [
        { id: "employer-favourable", label: "3 Business Days", description: "Short deadline creates urgency — candidate must decide quickly or the offer lapses", favorability: "client" },
        { id: "balanced", label: "5 Business Days", description: "Standard acceptance window — enough time for the candidate to review with a lawyer while maintaining employer control", favorability: "balanced" },
        { id: "employee-favourable", label: "10 Business Days", description: "Extended window — gives the candidate time to weigh competing offers or negotiate", favorability: "counter-party" },
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
// VENDOR AGREEMENT
// ──────────────────────────────────────────────

const VENDOR_AGREEMENT_CONFIG: AgreementConfig = {
  id: "vendor-agreement",
  partyLabels: {
    partyALabel: "Company (Buyer)",
    partyAPlaceholder: "Purchasing Corp.",
    partyBLabel: "Vendor (Supplier)",
    partyBPlaceholder: "Reliable Supplies Inc.",
  },
  estimatedGenerationTime: 50,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "goodsOrServicesDescription"],
  wizardSteps: ["com-service", "com-procurement", "com-data", "com-liability"],
  clausePositions: [
    {
      id: "paymentTermsPosition",
      label: "Payment Terms",
      description: "How quickly must the buyer pay the vendor after invoice?",
      options: [
        { id: "buyer-favourable", label: "Net 90", description: "Payment due 90 days after invoice receipt. Maximizes buyer's cash flow and float; vendor bears extended receivables risk. Buyer may negotiate early-payment discount (e.g., 2/10 Net 90).", favorability: "client" },
        { id: "balanced", label: "Net 30", description: "Payment due 30 days after invoice receipt. Industry standard for Canadian commercial procurement; balances buyer cash management with vendor working capital needs. Late payment interest at Bank of Canada overnight rate + 2%.", favorability: "balanced" },
        { id: "vendor-favourable", label: "Net 15 / Payment on Delivery", description: "Payment due 15 days after invoice or upon delivery. Vendor receives prompt payment; buyer has limited inspection window before payment obligation crystallizes.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "warrantyPosition",
      label: "Warranty Scope",
      description: "What warranties does the vendor provide on goods or services delivered?",
      options: [
        { id: "buyer-favourable", label: "Comprehensive Warranty (24 Months)", description: "Vendor warrants goods/services are free from defects in materials, workmanship, and design for 24 months from acceptance. Includes fitness for particular purpose (Ontario Sale of Goods Act, s.15(1)). Vendor bears all costs of warranty claims including shipping, re-inspection, and consequential losses.", favorability: "client" },
        { id: "balanced", label: "Standard Warranty (12 Months)", description: "Vendor warrants goods/services are free from material defects for 12 months from delivery. Implied warranties of merchantability under the Ontario Sale of Goods Act, s.15, are preserved but not expanded. Warranty remedy limited to repair, replacement, or credit at vendor's election.", favorability: "balanced" },
        { id: "vendor-favourable", label: "Limited Warranty (90 Days, As-Is After)", description: "Vendor warrants goods/services for 90 days from delivery against defects in materials and workmanship only. Implied warranties under the Sale of Goods Act are disclaimed to the maximum extent permitted by law. Sole remedy is repair or replacement.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "liabilityCapPosition",
      label: "Liability Cap",
      description: "What is the maximum liability exposure for each party under this agreement?",
      options: [
        { id: "buyer-favourable", label: "Uncapped Vendor Liability", description: "Vendor's liability is uncapped for breach of warranty, indemnification obligations, IP infringement, and confidentiality breach. Only indirect/consequential damages are capped at 2x annual contract value. Buyer's liability limited to unpaid fees.", favorability: "client" },
        { id: "balanced", label: "Mutual Cap at 12 Months' Fees", description: "Each party's aggregate liability capped at the total fees paid or payable in the 12 months preceding the claim. Carve-outs for gross negligence, wilful misconduct, IP infringement indemnity, and confidentiality breach (capped at 2x). Mutual exclusion of indirect/consequential damages.", favorability: "balanced" },
        { id: "vendor-favourable", label: "Vendor Cap at Contract Value", description: "Vendor's total aggregate liability capped at the lesser of fees actually paid under the agreement or the value of the specific purchase order giving rise to the claim. Broad exclusion of indirect, incidental, special, and consequential damages.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "ipOwnershipPosition",
      label: "IP Ownership of Deliverables",
      description: "Who owns intellectual property in custom deliverables created by the vendor for the buyer?",
      options: [
        { id: "buyer-favourable", label: "Buyer Owns All Deliverables", description: "All custom deliverables, work product, and derivative works are owned by the buyer as work-for-hire. Vendor assigns all rights including copyright (Copyright Act, R.S.C. 1985, c. C-42) and waives moral rights (s.14.1). Vendor retains only pre-existing IP with a license to buyer.", favorability: "client" },
        { id: "balanced", label: "Buyer Owns Custom Work; Vendor Keeps Pre-Existing IP", description: "Buyer owns bespoke deliverables created specifically for this engagement. Vendor retains all pre-existing IP, tools, methodologies, and general know-how, with a perpetual, royalty-free license granted to buyer for use with deliverables. Joint IP requires mutual consent for licensing.", favorability: "balanced" },
        { id: "vendor-favourable", label: "Vendor Retains IP; Buyer Gets License", description: "Vendor retains all IP in deliverables and grants buyer a non-exclusive, perpetual license to use deliverables for buyer's internal business purposes. Vendor may reuse deliverable components for other clients.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "confidentialityDurationPosition",
      label: "Confidentiality Duration",
      description: "How long do confidentiality obligations survive after the agreement ends?",
      options: [
        { id: "buyer-favourable", label: "5 Years Post-Termination", description: "Confidentiality obligations survive for 5 years after termination or expiry. Trade secrets protected indefinitely (as long as they remain trade secrets). Return/destruction of confidential information within 30 days of termination.", favorability: "client" },
        { id: "balanced", label: "3 Years Post-Termination", description: "Confidentiality obligations survive for 3 years after termination or expiry. Trade secrets protected for the longer of 3 years or the duration they qualify as trade secrets. Standard carve-outs for information entering the public domain, independently developed, or required by law.", favorability: "balanced" },
        { id: "vendor-favourable", label: "1 Year Post-Termination", description: "Confidentiality obligations survive for 1 year after termination or expiry. Standard exceptions apply. No obligation to return residual knowledge retained in the unaided memory of vendor personnel.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "terminationForConveniencePosition",
      label: "Termination for Convenience",
      description: "Can the buyer terminate the agreement without cause, and what are the financial consequences?",
      options: [
        { id: "buyer-favourable", label: "Buyer May Terminate on 15 Days' Notice", description: "Buyer may terminate for convenience on 15 days' written notice. Buyer pays only for goods/services delivered and accepted prior to termination. No cancellation fees, restocking fees, or lost-profit claims by vendor.", favorability: "client" },
        { id: "balanced", label: "Either Party on 30 Days' Notice", description: "Either party may terminate for convenience on 30 days' written notice. Buyer pays for goods/services delivered through the termination date plus any non-cancellable costs reasonably incurred by vendor prior to notice. Vendor must mitigate costs.", favorability: "balanced" },
        { id: "vendor-favourable", label: "Termination for Cause Only (No Convenience)", description: "Neither party may terminate for convenience. Termination permitted only for material breach (with 30-day cure period), insolvency, or force majeure exceeding 90 days. Provides vendor with revenue certainty for the full term.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "insurancePosition",
      label: "Insurance Requirements",
      description: "What insurance must the vendor maintain during the term?",
      options: [
        { id: "buyer-favourable", label: "Comprehensive Insurance Package", description: "Vendor must maintain: CGL ($5M per occurrence), professional E&O ($5M), cyber liability ($5M), auto ($2M), umbrella/excess ($10M). Buyer named as additional insured. 30 days' advance notice of cancellation. Annual certificates of insurance required.", favorability: "client" },
        { id: "balanced", label: "Standard Commercial Insurance", description: "Vendor must maintain: CGL ($2M per occurrence), professional E&O ($2M if applicable), cyber liability ($2M if handling personal data), workers' compensation (statutory). Buyer named as additional insured on CGL. Annual certificates of insurance.", favorability: "balanced" },
        { id: "vendor-favourable", label: "Basic Insurance Only", description: "Vendor must maintain CGL ($1M per occurrence) and workers' compensation (statutory minimums). No additional insured requirement. Vendor provides certificate of insurance upon request.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "auditRightsPosition",
      label: "Audit Rights",
      description: "What rights does the buyer have to audit the vendor's performance, records, and compliance?",
      options: [
        { id: "buyer-favourable", label: "Broad Audit Rights", description: "Buyer may audit vendor's books, records, facilities, and subcontractors at any time with 5 business days' notice. Audit scope includes financial records, quality systems, data handling practices, and regulatory compliance. If audit reveals material non-compliance, vendor bears all audit costs.", favorability: "client" },
        { id: "balanced", label: "Annual Audit with Reasonable Notice", description: "Buyer may conduct one audit per year with 15 business days' advance written notice during normal business hours. Scope limited to records relevant to the agreement. Buyer bears audit costs unless material non-compliance is found (discrepancy exceeding 5%).", favorability: "balanced" },
        { id: "vendor-favourable", label: "Limited Audit (Cause-Based Only)", description: "Buyer may audit only upon reasonable grounds to believe vendor is in material breach. 30 days' written notice required. Scope limited to the specific area of concern. Buyer bears all audit costs regardless of outcome.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "subcontractingPosition",
      label: "Subcontracting Restrictions",
      description: "Can the vendor subcontract its obligations, and what controls does the buyer have?",
      options: [
        { id: "buyer-favourable", label: "No Subcontracting Without Prior Approval", description: "Vendor may not subcontract any portion of its obligations without buyer's prior written consent (which may be withheld in buyer's sole discretion). Vendor remains fully liable for all subcontractor performance. Subcontractors must agree to buyer's confidentiality and data handling requirements.", favorability: "client" },
        { id: "balanced", label: "Pre-Approved Subcontractors; Consent for Others", description: "Vendor may use subcontractors listed in Schedule [X] without further consent. Any additional subcontractors require buyer's prior written consent, not to be unreasonably withheld. Vendor remains liable for subcontractor performance. Vendor must flow down material contract terms to subcontractors.", favorability: "balanced" },
        { id: "vendor-favourable", label: "Vendor Discretion to Subcontract", description: "Vendor may subcontract freely with written notice to buyer. Vendor remains responsible for the quality of all subcontracted work but has sole discretion over subcontractor selection. Buyer may object only on reasonable security or compliance grounds.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "dataHandlingPosition",
      label: "Data Handling & PIPEDA Compliance",
      description: "How must the vendor handle personal information and buyer data received in performing the agreement?",
      options: [
        { id: "buyer-favourable", label: "Strict Data Processing Agreement", description: "Vendor acts as processor under PIPEDA and must: process data only on buyer's documented instructions; implement safeguards per PIPEDA s.4.7; notify buyer within 24 hours of any breach; not transfer data outside Canada without consent; submit to buyer data audits; delete all data within 30 days of termination; maintain SOC 2 Type II or equivalent certification.", favorability: "client" },
        { id: "balanced", label: "Standard PIPEDA Compliance", description: "Vendor must handle all personal information in accordance with PIPEDA's 10 Fair Information Principles (Schedule 1). Vendor implements reasonable safeguards appropriate to the sensitivity of the information. Breach notification within 72 hours. Data returned or destroyed within 60 days of termination. Annual privacy impact assessments where applicable.", favorability: "balanced" },
        { id: "vendor-favourable", label: "General Confidentiality Treatment", description: "Vendor treats buyer data as confidential information subject to the agreement's general confidentiality provisions. Vendor implements commercially reasonable security measures. Breach notification as soon as reasonably practicable. Data handling upon termination per vendor's standard data retention policy.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — VENDOR AGREEMENT:
This is a procurement agreement where the Company (Buyer) engages a Vendor (Supplier) to provide goods, services, or both. The agreement governs the full vendor relationship including ordering, delivery, quality, payment, and ongoing compliance obligations.

PARTY DYNAMICS:
- The Buyer wants price certainty, quality assurance, reliable delivery, audit rights, and maximum flexibility to terminate or adjust volumes
- The Vendor wants revenue predictability, clear specifications, reasonable payment terms, limited liability exposure, and protection against scope creep or specification changes
- Power dynamics vary: strategic/sole-source vendors have more leverage; commodity suppliers have less

GOVERNING LEGISLATION & KEY REFERENCES:
- Ontario Sale of Goods Act, R.S.O. 1990, c. S.1 — implied conditions of merchantability (s.15(2)), fitness for particular purpose (s.15(1)), sale by description (s.14), and sale by sample (s.16). These implied terms apply unless expressly excluded, and exclusion clauses are subject to reasonableness under Tercon Contractors v. British Columbia (2010 SCC 4)
- Personal Information Protection and Electronic Documents Act (PIPEDA), S.C. 2000, c. 5 — applies whenever the vendor processes personal information on behalf of the buyer. Principle 4.1.3 requires that the buyer (as controller) ensure the vendor provides a comparable level of protection through contractual means
- Consumer Protection Act, 2002, S.O. 2002, c. 30 — relevant if the goods or services may ultimately flow to consumers; unfair practices and unconscionable representations provisions may apply
- Competition Act, R.S.C. 1985, c. C-34 — supply chain compliance including anti-kickback, bid-rigging (s.47), and conspiracy provisions (s.45)
- Bankruptcy and Insolvency Act, R.S.C. 1985, c. B-3 — vendor insolvency provisions and buyer's rights regarding pre-paid goods
- International Sale of Goods Act, R.S.O. 1990, c. I.10 (UN CISG) — applies to international vendor relationships unless expressly excluded; consider whether to opt in or out

KEY CASE LAW:
- Tercon Contractors Ltd. v. British Columbia (Ministry of Transportation and Highways), 2010 SCC 4 — framework for enforceability of limitation and exclusion clauses in commercial contracts
- Bhasin v. Hrynew, 2014 SCC 71 — duty of honest performance applies to all contractual relationships including vendor/buyer
- Guarantee Company of North America v. Gordon Capital Corp., 1999 SCC — interpretation of indemnification provisions
- Hunter Engineering Co. v. Syncrude Canada Ltd., 1989 SCC — enforceability of warranty exclusion clauses in commercial sale of goods

MANDATORY PROVISIONS:
1. Scope of goods/services with detailed specifications (incorporate by reference to purchase orders, SOWs, or specification schedules)
2. Ordering process — purchase orders, blanket orders, or call-off orders with minimum/maximum quantities
3. Pricing — fixed pricing, cost-plus, or indexed pricing with adjustment mechanics (tied to CPI or commodity indices)
4. Payment terms per paymentTermsPosition — invoice requirements, supporting documentation, right to dispute invoices within 30 days, late payment interest
5. Delivery obligations — delivery terms (FOB, CIF, DDP per Incoterms 2020 if applicable), delivery schedule, risk of loss, title transfer
6. Quality standards and inspection — incoming inspection rights, rejection process, cure period for non-conforming goods (Sale of Goods Act, s.33-34 acceptance provisions), quality management system requirements (ISO 9001 if applicable)
7. Warranty per warrantyPosition — warranty period, warranty remedies, interaction with Sale of Goods Act implied warranties, epidemic failure clause for systemic defects
8. Indemnification — vendor indemnifies for IP infringement, product liability, personal injury, property damage, and regulatory non-compliance; buyer indemnifies for misuse outside specifications
9. Insurance per insurancePosition — minimum coverage requirements, additional insured status, certificate delivery obligations
10. Confidentiality per confidentialityDurationPosition — mutual confidentiality with specific protections for buyer's specifications, pricing, and business plans; vendor's manufacturing processes
11. Data handling per dataHandlingPosition — PIPEDA compliance framework, breach notification, data localization, return/destruction obligations
12. Supply chain compliance — anti-corruption (Corruption of Foreign Public Officials Act), modern slavery/forced labour (Fighting Against Forced Labour and Child Labour in Supply Chains Act, S.C. 2023, c. 9), sanctions compliance, conflict minerals, ESG reporting
13. Force majeure — defined events, notice requirements, mitigation obligations, right to terminate if force majeure exceeds 90 days, no force majeure excuse for payment obligations
14. Dispute resolution — escalation (operational contacts → senior management → mediation → arbitration/litigation), governing law (Ontario), forum selection
15. Termination — for cause (material breach with 30-day cure), for convenience per terminationForConveniencePosition, insolvency triggers, consequences of termination (wind-down, return of materials, final payment)
16. Audit rights per auditRightsPosition — scope, frequency, cost allocation, records retention period (minimum 7 years per CRA requirements)
17. Subcontracting per subcontractingPosition — restrictions, approval process, flow-down of terms, vendor liability for subcontractors

ADDITIONAL CLAUSE POSITIONS:
- paymentTermsPosition: Draft payment clause per selection. Include invoice format requirements (matching PO number, itemized pricing, applicable taxes — HST/GST). Address right to set off disputed amounts. Include prompt payment discount mechanics if buyer-favourable position selected. Late payment interest must not exceed Criminal Code s.347 threshold (60% per annum).
- warrantyPosition: Draft warranty per selection. Explicitly address interaction with Ontario Sale of Goods Act implied warranties — if vendor-favourable position, include express disclaimer language per Hunter Engineering. If buyer-favourable, preserve and expand implied warranties. Include epidemic failure clause: if defect rate exceeds [X]% of units in any [Y]-month period, vendor must recall, replace, and reimburse at vendor's cost.
- liabilityCapPosition: Draft liability framework per selection. Specify carve-outs clearly (items excluded from the cap). Address whether the cap is per-claim or aggregate. Include a gross negligence / wilful misconduct override. Ensure the cap is commercially reasonable under the Tercon framework.
- ipOwnershipPosition: Draft IP provisions per selection. Address background IP, foreground IP, and improvements. If buyer-owns position, include full assignment with Copyright Act compliance and moral rights waiver. If license position, specify permitted uses, sublicensing rights, and restrictions.
- insurancePosition: Draft insurance requirements per selection. Specify policy types, minimum limits, additional insured requirements, waiver of subrogation, and certificate delivery timeline. Require 30 days' advance written notice of cancellation or material change.
- auditRightsPosition: Draft audit provisions per selection. Address document retention obligations (7 years minimum for tax/regulatory). Specify who bears audit costs and under what circumstances cost-shifting applies.
- subcontractingPosition: Draft subcontracting provisions per selection. Include a flow-down clause requiring subcontractors to be bound by equivalent confidentiality, IP, data handling, and compliance obligations. Vendor must remain primarily liable — no novation through subcontracting.
- dataHandlingPosition: Draft data handling provisions per selection. If the vendor will process personal information, include a PIPEDA-compliant data processing addendum. Address cross-border data transfers, breach notification timelines, and data localization requirements. Reference the 10 Fair Information Principles in PIPEDA Schedule 1.`,
};

// ──────────────────────────────────────────────
// STATEMENT OF WORK (SOW)
// ──────────────────────────────────────────────

const SOW_CONFIG: AgreementConfig = {
  id: "statement-of-work",
  partyLabels: {
    partyALabel: "Client",
    partyAPlaceholder: "Enterprise Client Corp.",
    partyBLabel: "Service Provider",
    partyBPlaceholder: "Dev Agency Inc.",
  },
  estimatedGenerationTime: 35,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "projectDescription"],
  wizardSteps: ["sow-scope", "sow-milestones", "sow-terms"],
  clausePositions: [
    {
      id: "paymentStructurePosition",
      label: "Payment Structure",
      description: "How is the service provider compensated for the work?",
      options: [
        { id: "client-favourable", label: "Fixed Price (Milestone-Based)", description: "Total project price fixed at execution. Payments tied to milestone completion and client acceptance. Provider bears cost overrun risk. Client has maximum budget certainty. Milestone payment schedule attached as appendix.", favorability: "client" },
        { id: "balanced", label: "Time & Materials with Cap", description: "Provider bills actual hours at agreed rates, subject to a not-to-exceed cap. Client pays for actual effort but has budget ceiling protection. Provider must notify client at 75% and 90% of cap. Overages require written change order.", favorability: "balanced" },
        { id: "provider-favourable", label: "Time & Materials (Uncapped)", description: "Provider bills actual hours at agreed rates with no cap. Client pays for all effort required to complete the scope. Monthly invoicing with detailed time records. Provides provider with full cost recovery but client bears scope risk.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "changeOrderThresholdPosition",
      label: "Change Order Threshold",
      description: "At what point do scope changes require a formal change order?",
      options: [
        { id: "client-favourable", label: "All Changes Require Change Order", description: "Any deviation from the defined scope — no matter how minor — requires a written change order signed by both parties before work proceeds. Provider may not incur additional costs without prior written authorization. Maximum client control over budget and scope.", favorability: "client" },
        { id: "balanced", label: "De Minimis Threshold (< 5% of SOW Value)", description: "Changes below 5% of total SOW value or 8 hours of effort may be handled by email approval between project managers. Changes above the threshold require a formal change order with revised timeline and pricing. Running log of all changes maintained.", favorability: "balanced" },
        { id: "provider-favourable", label: "Flexible Scope Adjustments", description: "Provider may make reasonable adjustments to approach and methodology without formal change order. Only changes that materially affect timeline (> 2 weeks) or cost (> 15% of SOW value) require a formal change order. Provider has operational flexibility to deliver efficiently.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "acceptancePeriodPosition",
      label: "Acceptance Period",
      description: "How long does the client have to review and accept (or reject) deliverables?",
      options: [
        { id: "client-favourable", label: "30 Business Days + Unlimited Revisions", description: "Client has 30 business days to review each deliverable against acceptance criteria. Client may reject with detailed written reasons. Provider must cure deficiencies and re-submit. No deemed acceptance — client must provide affirmative written acceptance.", favorability: "client" },
        { id: "balanced", label: "10 Business Days + Deemed Acceptance", description: "Client has 10 business days to review and provide written acceptance or rejection with specific reasons tied to the acceptance criteria. If client fails to respond within 10 business days, deliverable is deemed accepted. Two rounds of revisions included; additional revisions are change orders.", favorability: "balanced" },
        { id: "provider-favourable", label: "5 Business Days + Deemed Acceptance", description: "Client has 5 business days to accept or reject. Rejection must reference specific acceptance criteria failures. Silence after 5 business days constitutes acceptance. One round of revisions included. Provider proceeds to next milestone regardless.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "ipOwnershipPosition",
      label: "IP Ownership",
      description: "Who owns the intellectual property created in performing the SOW?",
      options: [
        { id: "client-favourable", label: "Client Owns All Work Product", description: "All deliverables, work product, documentation, and derivative works are owned by the client. Provider assigns all rights including copyright (Copyright Act, R.S.C. 1985, c. C-42, s.13) and waives moral rights (s.14.1). Provider retains only pre-existing IP with a royalty-free license to client.", favorability: "client" },
        { id: "balanced", label: "Client Owns Deliverables; Provider Keeps Tools", description: "Client owns the specific deliverables described in the SOW. Provider retains ownership of pre-existing IP, tools, frameworks, libraries, and general methodologies. Provider grants client a perpetual, royalty-free license to use retained IP as embedded in the deliverables.", favorability: "balanced" },
        { id: "provider-favourable", label: "Provider Retains IP; Client Gets License", description: "Provider retains all IP in the deliverables and grants client a non-exclusive, perpetual, royalty-free license to use the deliverables for client's internal business purposes. Provider may reuse components, techniques, and general knowledge for other clients.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "warrantyDurationPosition",
      label: "Warranty Duration",
      description: "How long does the service provider warrant the deliverables after acceptance?",
      options: [
        { id: "client-favourable", label: "12 Months Post-Acceptance", description: "Provider warrants all deliverables for 12 months from final acceptance. Warranty covers material defects, non-conformance with specifications, and failure to meet acceptance criteria. Provider must remedy defects at no additional cost within 10 business days of notice.", favorability: "client" },
        { id: "balanced", label: "90 Days Post-Acceptance", description: "Provider warrants deliverables for 90 days from acceptance. Defects reported within the warranty period are remedied at provider's cost. Defects caused by client modifications or misuse are excluded. Warranty remedy is re-performance or repair.", favorability: "balanced" },
        { id: "provider-favourable", label: "30 Days Post-Acceptance", description: "Provider warrants deliverables for 30 days from acceptance against material defects only. Sole remedy is re-performance. No warranty on deliverables modified by client or third parties. After 30 days, any additional work is billed at standard rates.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "personnelReplacementPosition",
      label: "Personnel Replacement Rights",
      description: "What control does the client have over the specific individuals assigned to the project?",
      options: [
        { id: "client-favourable", label: "Named Key Personnel; Client Approval to Replace", description: "Key personnel are named in the SOW and may not be replaced without client's prior written consent. If key personnel become unavailable, provider must propose replacement of equal or greater qualification within 5 business days. Client has right to interview and approve. Unauthorized removal is a material breach.", favorability: "client" },
        { id: "balanced", label: "Named Key Personnel; Reasonable Replacement", description: "Key personnel (project lead, senior architect) are named. Provider gives 15 business days' advance notice before replacing key personnel and proposes a replacement of comparable qualifications. Client may object on reasonable grounds. Support staff may be rotated at provider's discretion.", favorability: "balanced" },
        { id: "provider-favourable", label: "Provider Discretion on Staffing", description: "Provider has sole discretion over staffing assignments and may reassign personnel as needed to meet deliverable timelines. Provider commits to maintaining team skill levels consistent with the SOW requirements but is not obligated to assign specific named individuals.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "scopeCreepProtectionPosition",
      label: "Scope Creep Protection",
      description: "What mechanisms prevent the project scope from expanding without proper authorization?",
      options: [
        { id: "client-favourable", label: "Strict Scope Boundary + Provider Absorption", description: "Scope is defined exclusively by this SOW. Any work not expressly described is out of scope. If provider performs out-of-scope work without a signed change order, provider bears the cost. Provider may not invoice for work not covered by this SOW or an approved change order.", favorability: "client" },
        { id: "balanced", label: "Defined Scope + Mutual Change Process", description: "SOW defines the baseline scope. Either party may propose changes via the change order process. Provider must flag scope ambiguities in writing within 5 business days of discovery. Disputed scope items are escalated to project sponsors. Neither party may unilaterally expand or contract scope.", favorability: "balanced" },
        { id: "provider-favourable", label: "Scope Includes Reasonably Implied Work", description: "Scope includes all work reasonably implied by or necessary to achieve the stated project objectives, even if not expressly listed. Provider may adjust approach and include ancillary tasks without change orders. Only material additions to project objectives require formal change orders.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "terminationForConveniencePosition",
      label: "Termination for Convenience",
      description: "Can the client terminate the SOW without cause, and what are the financial consequences?",
      options: [
        { id: "client-favourable", label: "Client May Terminate on 5 Days' Notice", description: "Client may terminate the SOW for any reason on 5 business days' written notice. Client pays only for deliverables completed and accepted prior to termination plus actual hours worked on in-progress milestones at agreed rates. No kill fee, cancellation penalty, or lost-profit claim.", favorability: "client" },
        { id: "balanced", label: "Either Party on 15 Days' Notice", description: "Either party may terminate the SOW for convenience on 15 business days' written notice. Client pays for all completed milestones plus pro-rated work on in-progress milestones plus reasonable non-cancellable third-party costs incurred by provider. Provider must mitigate costs upon receiving notice.", favorability: "balanced" },
        { id: "provider-favourable", label: "Termination for Cause Only + Kill Fee", description: "SOW may only be terminated for material breach (with 30-day cure period). If client terminates without cause, client pays a kill fee equal to 25% of remaining SOW value plus all work performed to date. Provides provider with project revenue certainty.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — STATEMENT OF WORK (SOW):
This is a project-based scope document that defines the specific deliverables, timeline, milestones, acceptance criteria, and commercial terms for a defined engagement. It may be standalone or executed under an existing Master Services Agreement.

PARTY DYNAMICS:
- The Client wants a clearly defined scope with fixed or capped pricing, measurable acceptance criteria, and strong change order controls to prevent budget overruns
- The Service Provider wants a well-defined scope to manage delivery risk, fair compensation for scope changes, reasonable acceptance timelines, and protection against client delays or indecision
- SOWs are the single most litigated document type in commercial services disputes — clarity and specificity are paramount

GOVERNING LEGISLATION & KEY REFERENCES:
- Bhasin v. Hrynew, 2014 SCC 71 — duty of honest performance in contractual dealings; directly relevant to change order negotiations, milestone acceptance, and scope interpretations
- Consumer Protection Act, 2002, S.O. 2002, c. 30 — relevant if the services flow to consumers or if the client is a small business in certain regulated sectors
- Copyright Act, R.S.C. 1985, c. C-42 — governs IP ownership in deliverables; first owner of copyright is the author (s.13(1)) unless work-for-hire or assigned; moral rights (s.14.1) must be addressed
- Tercon Contractors Ltd. v. British Columbia, 2010 SCC 4 — enforceability of limitation clauses in service agreements

KEY CASE LAW:
- Bhasin v. Hrynew, 2014 SCC 71 — organizing principle of good faith in contract performance
- Sattva Capital Corp. v. Creston Moly Corp., 2014 SCC 53 — contractual interpretation is a question of mixed fact and law; factual matrix is admissible to interpret scope provisions
- Tercon Contractors Ltd. v. British Columbia, 2010 SCC 4 — three-part test for enforcing exclusion/limitation clauses
- Copperweld Corp. v. Independence Tube Corp., applied by analogy in Canadian scope/deliverable disputes

COMMON PITFALLS:
- Vague scope definitions that lead to "that was in scope" / "that was out of scope" disputes
- Acceptance criteria that are subjective ("to client's satisfaction") rather than objective and measurable
- No change order process, leading to scope creep with no corresponding price adjustment
- Assumptions/dependencies section missing — project fails because client did not provide required access/data/decisions on time
- Payment schedule not tied to measurable milestones — leads to disputes about percentage completion
- No provision for client-caused delays — provider bears timeline risk without schedule relief

TARGET DOCUMENT LENGTH: 10-20 pages plus appendices (scope details, milestone schedule, acceptance criteria matrix, rate card, assumptions log).

MANDATORY PROVISIONS:
1. Project overview and objectives — high-level description of what the project aims to achieve, business context, and success metrics
2. Detailed scope of work — itemized description of all deliverables, organized by work stream or phase. Include explicit "In Scope" and "Out of Scope" sections. Use specific, measurable language (not "as needed" or "as appropriate")
3. Deliverables table — each deliverable with: description, format/medium, acceptance criteria (objective and measurable), responsible party, and due date
4. Milestone schedule — project phases with start/end dates, dependencies, and milestone payment triggers. Include a Gantt chart or milestone timeline as an appendix
5. Acceptance criteria and process per acceptancePeriodPosition — define what "done" means for each deliverable. Criteria must be binary (pass/fail), not subjective. Include the review/acceptance/rejection/cure workflow
6. Payment schedule per paymentStructurePosition — tie payments to milestones (fixed price) or billing periods (T&M). Include rate card, expense policy, invoice format, and payment terms
7. Change order process per changeOrderThresholdPosition — formal mechanism for requesting, evaluating, pricing, and approving scope changes. Include a change order template as an appendix
8. Project team and key personnel per personnelReplacementPosition — named individuals, roles, expected time commitment (% FTE or hours/week), and replacement mechanics
9. Assumptions and dependencies — enumerate all assumptions upon which the scope, timeline, and pricing are based. Include client responsibilities (access, data, decisions, approvals) with specific timelines. If an assumption proves false, define the impact mechanism (change order, schedule extension, or price adjustment)
10. Client responsibilities — specific obligations the client must fulfill for the project to succeed (access to systems, timely feedback, designated decision-maker, test environments, sample data)
11. IP ownership per ipOwnershipPosition — who owns what, including pre-existing IP, project-created IP, and derivative works. Address open source components. Include Copyright Act assignment and moral rights waiver if client-owns position
12. Warranty per warrantyDurationPosition — post-acceptance warranty period, covered defects, exclusions (client modifications, misuse, force majeure), and remedy (re-performance, repair, credit)
13. Scope creep protection per scopeCreepProtectionPosition — mechanisms to identify, flag, and address scope expansion. Define the escalation path for scope disputes
14. Termination per terminationForConveniencePosition — termination rights, notice period, financial consequences, wind-down obligations, and disposition of in-progress work
15. Relationship to MSA (if applicable) — if this SOW is executed under a Master Services Agreement, specify the MSA by name and date, and state the order of precedence in case of conflict between the SOW and MSA terms

ADDITIONAL CLAUSE POSITIONS:
- paymentStructurePosition: Draft payment clause per selection. For fixed price, include a milestone payment table with deliverable name, due date, payment amount, and cumulative percentage. For T&M, include rate card (by role), monthly invoicing mechanics, expense reimbursement policy, and cap notification thresholds. For all positions, include HST/GST treatment and late payment interest.
- changeOrderThresholdPosition: Draft change order clause per selection. Include a change order form template as a schedule. Define the evaluation and approval workflow (who has authority to approve change orders and at what dollar threshold). Address the impact of unapproved changes — provider proceeds at own risk.
- acceptancePeriodPosition: Draft acceptance clause per selection. Define the acceptance testing process step by step. Specify what constitutes a valid rejection (must reference specific acceptance criteria failures). Address partial acceptance of multi-component deliverables. Define the re-submission and re-review cycle.
- ipOwnershipPosition: Draft IP provisions per selection. Address background IP inventory (listed in a schedule), foreground IP (created during the project), and improvements to background IP. If using open-source components, require disclosure and license compatibility review. Include Copyright Act s.13 assignment language and s.14.1 moral rights waiver for client-owns positions.
- warrantyDurationPosition: Draft warranty clause per selection. Specify the warranty commencement date (final acceptance, milestone acceptance, or delivery). Define warranty support obligations (response time for defect reports). Address interaction with any MSA-level warranty provisions.
- personnelReplacementPosition: Draft key personnel clause per selection. Include a key personnel table (name, role, qualifications, expected commitment). Define what constitutes "unavailability" (resignation, reassignment, illness). Address the transition period when replacing key personnel.
- scopeCreepProtectionPosition: Draft scope protection provisions per selection. Include a scope baseline reference (the SOW itself, or a requirements document). Define the process for flagging potential scope issues during the project. Address the commercial impact of scope disputes (work stops, work continues at risk, etc.).
- terminationForConveniencePosition: Draft termination provisions per selection. Specify how in-progress work is valued (percentage completion, actual hours, or milestone pro-ration). Address transition obligations (handover of work product, documentation, and credentials). Define the survival provisions that outlast termination (confidentiality, IP ownership, warranty on accepted deliverables, indemnification).`,
};

// ──────────────────────────────────────────────
// CONSULTING AGREEMENT
// ──────────────────────────────────────────────

const CONSULTING_AGREEMENT_CONFIG: AgreementConfig = {
  id: "consulting-agreement",
  partyLabels: {
    partyALabel: "Client (Company)",
    partyAPlaceholder: "Acme Technologies Inc.",
    partyBLabel: "Consultant",
    partyBPlaceholder: "Jane Consulting Inc. / John Advisor",
  },
  estimatedGenerationTime: 40,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "scopeOfServices", "feeStructure"],
  wizardSteps: ["com-service", "emp-comp", "emp-ip", "emp-covenant"],
  clausePositions: [
    {
      id: "compensationStructurePosition",
      label: "Compensation Structure",
      description: "How is the consultant compensated for their services?",
      options: [
        { id: "client-favourable", label: "Fixed Project Fee", description: "Single fixed fee for the entire engagement, payable on milestone completion — maximum cost certainty for the client, consultant bears overrun risk", favorability: "client" },
        { id: "balanced", label: "Monthly Retainer + Variable", description: "Base monthly retainer with additional hourly/daily rates for work beyond the retained scope — predictable base cost with flexibility for scope changes", favorability: "balanced" },
        { id: "consultant-favourable", label: "Hourly/Daily Rate", description: "Time-based billing at agreed hourly or daily rates with no cap — consultant is compensated for all time invested, client bears scope creep risk", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "ipOwnershipPosition",
      label: "IP Ownership",
      description: "Who owns the intellectual property created during the consulting engagement?",
      options: [
        { id: "client-favourable", label: "Client Owns All Work Product", description: "All IP, deliverables, work product, and materials created during the engagement vest in the client upon creation. Consultant assigns all rights including future rights. Background IP used in deliverables is licensed perpetually to the client.", favorability: "client" },
        { id: "balanced", label: "Client Owns Deliverables, Consultant Retains Tools", description: "Client owns custom deliverables and bespoke work product. Consultant retains pre-existing methodologies, frameworks, tools, and general know-how with a perpetual license to the client for use within the deliverables.", favorability: "balanced" },
        { id: "consultant-favourable", label: "Consultant Retains IP with License to Client", description: "Consultant retains ownership of all IP created during the engagement. Client receives a perpetual, non-exclusive, royalty-free license to use the deliverables for their internal business purposes only.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "nonCompeteScopePosition",
      label: "Non-Compete Scope",
      description: "Is the consultant restricted from working with competitors during or after the engagement?",
      options: [
        { id: "client-favourable", label: "During Term + 12 Months Post-Term", description: "Consultant may not provide similar services to direct competitors during the engagement and for 12 months after termination — broad protection but must pass Elsley/Shafron reasonableness test", favorability: "client" },
        { id: "balanced", label: "During Term + 6 Months Post-Term (Named Competitors)", description: "Consultant restricted from working with a defined list of named competitors during the term and for 6 months post-termination — targeted scope improves enforceability under Shafron", favorability: "balanced" },
        { id: "consultant-favourable", label: "During Term Only", description: "Non-compete applies only during the active engagement period — no post-term restrictions. Consultant is free to work with any party after the engagement ends.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "nonSolicitDurationPosition",
      label: "Non-Solicitation of Employees",
      description: "How long is the consultant restricted from soliciting the client's employees after the engagement?",
      options: [
        { id: "client-favourable", label: "24 Months Post-Term", description: "Consultant may not solicit or hire any of the client's employees or contractors for 24 months after the engagement ends — maximum protection for client's workforce", favorability: "client" },
        { id: "balanced", label: "12 Months Post-Term", description: "Non-solicitation of employees the consultant worked directly with for 12 months post-termination — standard commercial term with reasonable scope", favorability: "balanced" },
        { id: "consultant-favourable", label: "6 Months Post-Term", description: "Non-solicitation limited to 6 months and only applies to employees the consultant directly supervised or managed during the engagement", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "confidentialityTermPosition",
      label: "Confidentiality Term",
      description: "How long do the consultant's confidentiality obligations survive after the engagement?",
      options: [
        { id: "client-favourable", label: "Perpetual for Trade Secrets, 5 Years Otherwise", description: "Trade secrets protected indefinitely; all other confidential information protected for 5 years post-termination — strongest protection under Lac Minerals principles", favorability: "client" },
        { id: "balanced", label: "3 Years Post-Termination", description: "All confidential information protected for 3 years after the engagement ends — standard commercial term balancing protection and practicality", favorability: "balanced" },
        { id: "consultant-favourable", label: "2 Years Post-Termination", description: "Confidentiality obligations expire 2 years after termination — shortest reasonable duration, easier for the consultant to manage ongoing obligations", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "terminationNoticePosition",
      label: "Termination Notice Period",
      description: "How much advance notice is required to terminate the consulting engagement?",
      options: [
        { id: "client-favourable", label: "Either Party 7 Days Written Notice", description: "Short notice period — maximum flexibility for the client to end the engagement quickly. Consultant must complete any work-in-progress deliverables.", favorability: "client" },
        { id: "balanced", label: "Mutual 30 Days Written Notice", description: "30 days written notice from either party — allows orderly transition, knowledge transfer, and handover of work product", favorability: "balanced" },
        { id: "consultant-favourable", label: "For Cause Only + 60 Days Convenience", description: "Immediate termination only for material breach (with cure period); otherwise 60 days written notice required — consultant has maximum engagement security", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "consultingLiabilityCapPosition",
      label: "Liability Cap",
      description: "What is the maximum liability the consultant faces under the engagement?",
      options: [
        { id: "client-favourable", label: "Uncapped Liability", description: "Consultant's liability is not capped — full exposure for all direct, indirect, and consequential damages arising from the engagement", favorability: "client" },
        { id: "balanced", label: "Capped at Fees Paid in Prior 12 Months", description: "Consultant's aggregate liability capped at total fees paid under the agreement in the 12 months preceding the claim — standard commercial limitation with carve-outs for fraud and willful misconduct", favorability: "balanced" },
        { id: "consultant-favourable", label: "Capped at Fees for Current SOW, No Consequential Damages", description: "Liability capped at fees paid under the active statement of work, with full exclusion of indirect, incidental, and consequential damages — maximum consultant protection", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "insuranceRequirementsPosition",
      label: "Insurance Requirements",
      description: "What insurance must the consultant maintain during the engagement?",
      options: [
        { id: "client-favourable", label: "Comprehensive (E&O $2M + CGL $2M + Cyber $1M)", description: "Professional errors & omissions ($2M), commercial general liability ($2M), and cyber liability ($1M) — client named as additional insured on CGL policy with 30-day cancellation notice", favorability: "client" },
        { id: "balanced", label: "Standard (E&O $1M + CGL $1M)", description: "Professional E&O insurance ($1M) and commercial general liability ($1M) — standard requirements for professional services engagements", favorability: "balanced" },
        { id: "consultant-favourable", label: "E&O Only ($1M)", description: "Professional errors and omissions insurance only ($1M minimum) — appropriate for advisory-only engagements with limited on-site or physical risk", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "expensePolicyPosition",
      label: "Expense Policy",
      description: "How are the consultant's out-of-pocket expenses handled?",
      options: [
        { id: "client-favourable", label: "No Expense Reimbursement", description: "All expenses are the consultant's responsibility and are deemed included in the fees — maximum cost certainty for the client", favorability: "client" },
        { id: "balanced", label: "Pre-Approved Expenses with Cap", description: "Client reimburses reasonable out-of-pocket expenses that are pre-approved in writing, subject to a monthly or engagement-level cap. Receipts required for all expenses over $25.", favorability: "balanced" },
        { id: "consultant-favourable", label: "All Reasonable Expenses at Cost", description: "Client reimburses all reasonable business expenses incurred in performing the services, submitted monthly with receipts — travel, accommodation, meals, materials, and third-party costs", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "consultingExclusivityPosition",
      label: "Exclusivity",
      description: "Is the consultant restricted from working for other clients during the engagement?",
      options: [
        { id: "client-favourable", label: "Exclusive Engagement", description: "Consultant works exclusively for the client during the term — WARNING: strong indicator of employment relationship under Sagaz/Wiebe Door integration test, increasing misclassification risk", favorability: "client" },
        { id: "balanced", label: "Non-Exclusive with Conflict Restriction", description: "Consultant may work for other clients but must disclose and avoid engagements that create a conflict of interest with the client's business", favorability: "balanced" },
        { id: "consultant-favourable", label: "Fully Non-Exclusive", description: "Consultant may freely engage with any other clients without restriction or disclosure — strongest independent contractor indicator under Sagaz", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — CONSULTING AGREEMENT:
This is a professional services consulting agreement. It is NOT an employment agreement and is NOT a simple independent contractor agreement for task-based freelance work. This agreement governs a sophisticated advisory or professional services engagement where the consultant provides expert knowledge, strategic guidance, or specialized professional services.

CRITICAL LEGAL RISK — INDEPENDENT CONTRACTOR VS. EMPLOYEE DISTINCTION:
The single most significant legal risk in any consulting engagement is misclassification by the CRA or provincial employment standards authorities.

Key case law governing the distinction:
- 671122 Ontario Ltd. v. Sagaz Industries Canada Inc., 2001 SCC 59: The Supreme Court established the central question as "whether the person who has been engaged to perform the services is performing them as a person in business on their own account." The four-factor Wiebe Door test (control, ownership of tools, chance of profit/risk of loss, integration) is applied, with no single factor being determinative.
- 1688782 Ontario Inc. v. Maple Leaf Foods Inc., 2020 ONCA 166: The Ontario Court of Appeal confirmed that the substance of the relationship, not the label in the contract, determines the true nature of the engagement. Courts look through contractual language to examine the actual working relationship.
- Wiebe Door Services Ltd. v. MNR, 1986 CanLII 184 (FCA): The foundational four-factor test — (1) degree of control exercised over the worker, (2) ownership of tools and equipment, (3) chance of profit and risk of loss, (4) integration into the engaging party's business.

DRAFTING TO MINIMIZE MISCLASSIFICATION RISK:
1. Control: The agreement must establish that the client defines WHAT is to be done (scope, deliverables, objectives) but NOT HOW the consultant does the work. The consultant controls their own methods, schedule, work location, and processes.
2. Tools: The consultant provides their own tools, equipment, software, and workspace. If the client provides access to systems, frame it as providing necessary access to client environments, not providing the tools of the trade.
3. Profit/Loss: The consultant must bear genuine economic risk — fixed-fee engagements, responsibility for their own overhead, ability to profit from efficiency or suffer loss from scope creep.
4. Integration: The consultant should not be integrated into the client's organizational structure. No company email addresses, no inclusion in org charts, no mandatory attendance at internal meetings (though project meetings are acceptable).
5. Exclusivity: AVOID exclusive engagement clauses — they are the strongest single indicator of an employment relationship. If the client insists on exclusivity, include a prominent drafting note flagging the misclassification risk.

SCOPE OF SERVICES AND DELIVERABLES:
- Define the scope of services with specificity. Use a Statement of Work (SOW) model where the main agreement sets the terms and individual SOWs define specific engagements.
- Each SOW should include: description of services, specific deliverables, acceptance criteria, timeline and milestones, fees, and any engagement-specific terms.
- Include a change order process for scope changes — consultant should not be obligated to perform work outside the agreed scope without a written change order and corresponding fee adjustment.

COMPENSATION AND PAYMENT:
- Draft per the compensationStructurePosition selected:
  - Fixed project fee: Define milestone payment schedule, acceptance criteria for each milestone, and what happens to fees if the engagement is terminated mid-project.
  - Monthly retainer: Specify the retained scope of hours/services, the rate for additional work, and how unused retainer hours are handled (use-it-or-lose-it vs. rollover).
  - Hourly/daily rate: Specify the rate, billing increment (typically 6-minute or 15-minute increments for professional services), invoicing frequency, and any not-to-exceed budget.
- GST/HST: The consultant is responsible for charging and remitting GST/HST on all fees. Include a clause requiring the consultant to provide their GST/HST registration number. If the consultant is a non-resident, address the reverse charge mechanism.
- CRA Reporting: The client has no obligation to withhold income tax, CPP, or EI from payments to the consultant. Include a representation that the consultant is responsible for all of their own tax obligations including income tax instalments and CPP self-employed contributions.
- Late Payment: Specify interest on overdue payments expressed as an annual rate (per the Interest Act, R.S.C. 1985, c. I-15, interest must be expressed as a per annum rate; failure to do so limits recovery to 5% per annum).

INTELLECTUAL PROPERTY AND MORAL RIGHTS:
- Draft per the ipOwnershipPosition selected. Regardless of position:
  - Copyright Act, R.S.C. 1985, c. C-42, s.13(3): The "employer owns" default does NOT apply to independent contractors. Without an express assignment clause, the consultant owns the copyright in all works they create — even if the client paid for them.
  - Copyright Act s.14.1: Moral rights (right of integrity, right of attribution, right of association) cannot be assigned — they can only be waived. Include an express moral rights waiver in all IP clauses.
  - If client owns all work product: Include a present assignment ("hereby assigns") not a promise to assign ("agrees to assign"). Include an irrevocable power of attorney allowing the client to execute IP assignment documents on the consultant's behalf.
  - If consultant retains IP with license: Define the license scope precisely — perpetual vs. term, exclusive vs. non-exclusive, sublicensable or not, field of use restrictions.
  - Pre-existing IP: Require the consultant to disclose all pre-existing IP that may be incorporated into deliverables. Include a schedule for pre-existing IP. Grant the client a perpetual, irrevocable license to use any pre-existing IP embedded in the deliverables.

CONFIDENTIALITY:
- Draft per the confidentialityTermPosition selected.
- Define "Confidential Information" broadly to include all non-public information disclosed during the engagement — business plans, financial data, customer lists, technology, trade secrets, and the terms of the agreement itself.
- Standard carve-outs: publicly available information, independently developed information, information received from a third party without restriction, and information compelled by law (with notice to the disclosing party).
- Return/destruction obligation on termination.

RESTRICTIVE COVENANTS:
- Non-compete: Draft per nonCompeteScopePosition. Apply the Elsley v. J.G. Collins Insurance Agencies Ltd., 1978 CanLII 211 (SCC) test — the restriction must be reasonable in scope, duration, and geography, and must protect a legitimate proprietary interest. For consultants, the proprietary interest is typically access to confidential information and client relationships, not merely competitive knowledge.
- Shafron v. KRG Insurance Brokers, 2009 SCC 6: Courts will NOT read down or blue-pencil an overly broad non-compete — they will strike it entirely. Draft narrowly and include step-down provisions as a fallback.
- Non-solicitation: Draft per nonSolicitDurationPosition. Non-solicitation clauses are generally more enforceable than non-competes because they are narrower in scope.
- Note: Ontario ESA s.67.2 (Working for Workers Act) non-compete prohibition does NOT apply to independent contractors — it only applies to employees. However, if the engagement is reclassified as employment, the prohibition would apply retroactively unless the consultant held a C-suite position.

INSURANCE:
- Draft per insuranceRequirementsPosition.
- E&O (Professional Liability): Covers negligent acts, errors, or omissions in the performance of professional services. Critical for advisory and consulting engagements.
- CGL (Commercial General Liability): Covers bodily injury and property damage. More relevant for consultants with on-site presence.
- Cyber Liability: Relevant if the consultant handles personal information or has access to the client's IT systems.
- Require certificates of insurance before the engagement commences. If client is named as additional insured, specify the endorsement requirements.

TERMINATION:
- Draft per terminationNoticePosition.
- Termination for cause: Define "cause" precisely — material breach (with cure period), fraud, insolvency, failure to perform, breach of confidentiality, criminal conviction.
- Payment on termination: Consultant is entitled to payment for all services performed and expenses incurred up to the effective date of termination. For fixed-fee engagements, specify the pro-rata calculation methodology.
- Wind-down obligations: Require orderly transition of work-in-progress, return of client materials, and cooperation with knowledge transfer for a reasonable period (typically 15-30 days) after termination.

HST/GST AND TAX TREATMENT:
- The consultant is NOT an employee for tax purposes. The client does not withhold income tax, CPP, or EI.
- The consultant must charge GST/HST (if registered) and is responsible for their own tax filings and remittances.
- Include CRA form T4A reporting acknowledgment — the client may be required to report payments to the consultant on a T4A slip if the consultant is an individual.
- If the consultant is a corporation, payments are reported differently and T4A may not be required for all payments.`,
};

// ──────────────────────────────────────────────
// SOFTWARE LICENSING AGREEMENT
// ──────────────────────────────────────────────

const SOFTWARE_LICENSE_CONFIG: AgreementConfig = {
  id: "software-license",
  partyLabels: {
    partyALabel: "Licensor",
    partyAPlaceholder: "SoftwareCo Inc.",
    partyBLabel: "Licensee",
    partyBPlaceholder: "Enterprise Client Corp.",
  },
  estimatedGenerationTime: 50,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "softwareDescription", "licenseType"],
  wizardSteps: ["com-service", "com-sla", "com-data", "com-liability"],
  clausePositions: [
    {
      id: "licenseTypePosition",
      label: "License Type",
      description: "Is the software license perpetual or term-based?",
      options: [
        { id: "licensor-favourable", label: "Term License (Annual Renewal)", description: "License granted for a fixed annual term, automatically renewing unless either party provides 90 days written notice of non-renewal — licensor maintains recurring revenue and ability to adjust pricing at each renewal", favorability: "client" },
        { id: "balanced", label: "Term License with Perpetual Fallback", description: "Annual term license with a perpetual fallback right — if the licensee pays for 3+ consecutive years, they receive a perpetual license to the version current at that time (maintenance and support still require renewal)", favorability: "balanced" },
        { id: "licensee-favourable", label: "Perpetual License", description: "One-time perpetual license to the software as delivered — licensee can use the software indefinitely regardless of whether maintenance and support are renewed", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "seatRestrictionPosition",
      label: "Seat / Usage Restrictions",
      description: "How is the licensee's usage of the software measured and limited?",
      options: [
        { id: "licensor-favourable", label: "Named User Seats (Strict)", description: "License limited to a fixed number of named users — each user must be individually identified and licensed. No sharing of credentials. Overage billed at 150% of per-seat rate.", favorability: "client" },
        { id: "balanced", label: "Concurrent User Seats", description: "License limited to a maximum number of simultaneous users — any authorized user may access the software so long as the concurrent limit is not exceeded. Allows flexible allocation across a larger user base.", favorability: "balanced" },
        { id: "licensee-favourable", label: "Enterprise-Wide (Unlimited)", description: "Unlimited site/enterprise license — all employees, contractors, and authorized agents of the licensee may use the software without seat restrictions. Highest upfront cost but maximum flexibility.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "sourceCodeEscrowPosition",
      label: "Source Code Escrow",
      description: "Is the source code held in escrow for the licensee's protection?",
      options: [
        { id: "licensor-favourable", label: "No Escrow", description: "No source code escrow — licensee relies entirely on the licensor for ongoing access, maintenance, and support. Licensor retains complete control of the codebase.", favorability: "client" },
        { id: "balanced", label: "Escrow with Limited Release Triggers", description: "Source code deposited with a neutral third-party escrow agent. Release only on: (a) licensor insolvency/bankruptcy, (b) licensor ceases to maintain the software for 12+ months, or (c) licensor materially breaches maintenance obligations and fails to cure within 90 days.", favorability: "balanced" },
        { id: "licensee-favourable", label: "Escrow with Broad Release + Verification", description: "Source code deposited with escrow agent with annual technical verification. Release on: (a) insolvency, (b) cessation of business, (c) material breach of maintenance SLA, (d) change of control of licensor, or (e) failure to provide any update within 6 months. Licensee receives right to modify and maintain upon release.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "maintenanceSlaPosition",
      label: "Maintenance and Support SLA",
      description: "What level of maintenance and technical support does the licensor provide?",
      options: [
        { id: "licensor-favourable", label: "Best Efforts Support (Business Hours)", description: "Licensor provides best-efforts support during business hours (9am-5pm EST, Mon-Fri). No guaranteed response times. Bug fixes included in regular release cycles only. No dedicated support personnel.", favorability: "client" },
        { id: "balanced", label: "Tiered SLA with Response Times", description: "Severity-tiered support: Critical (P1) — 4-hour response, 24-hour workaround; Major (P2) — 8-hour response, 5-business-day resolution target; Minor (P3) — 2-business-day response. Extended business hours support (8am-8pm EST). Dedicated support contact.", favorability: "balanced" },
        { id: "licensee-favourable", label: "Premium 24/7 SLA with Resolution Targets", description: "24/7/365 support. P1 — 1-hour response, 4-hour resolution or workaround with service credits for SLA misses. P2 — 4-hour response, 24-hour resolution target. Named support engineer. Quarterly service reviews. Escalation matrix to licensor's VP Engineering.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "updatePolicyPosition",
      label: "Updates and Upgrades",
      description: "What entitlement does the licensee have to new versions, updates, and upgrades?",
      options: [
        { id: "licensor-favourable", label: "Bug Fixes Only (Patches)", description: "Maintenance includes bug fixes and security patches to the licensed version only. Feature updates, new versions, and major upgrades require a separate purchase or upgrade fee.", favorability: "client" },
        { id: "balanced", label: "Minor Updates Included, Major Upgrades at Discount", description: "All minor version updates (e.g., v2.1 to v2.9) included in maintenance fees. Major version upgrades (e.g., v2.x to v3.0) available at a discount (typically 40-60% of new license fee) for active maintenance subscribers.", favorability: "balanced" },
        { id: "licensee-favourable", label: "All Updates and Upgrades Included", description: "All updates, upgrades, new versions, and feature releases included in the annual maintenance fee for as long as maintenance is active — licensee always has access to the latest version at no additional cost", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "ipIndemnificationPosition",
      label: "IP Infringement Indemnification",
      description: "Who bears the risk if the software infringes a third party's intellectual property rights?",
      options: [
        { id: "licensor-favourable", label: "Limited IP Indemnity", description: "Licensor indemnifies only against final judgments of direct copyright infringement in Canada. Excludes: patent claims, trade secret claims, claims arising from licensee's modifications or combinations with third-party software, and open-source component claims. Licensor's sole remedy is to modify, replace, or refund.", favorability: "client" },
        { id: "balanced", label: "Standard IP Indemnity", description: "Licensor indemnifies against claims that the software as delivered infringes any Canadian IP right (copyright, patent, trade secret). Licensor controls defense and may, at its option: (a) obtain a license, (b) modify for non-infringement, or (c) if neither is commercially reasonable, terminate and refund pro-rata fees. Carve-outs for licensee modifications and combinations.", favorability: "balanced" },
        { id: "licensee-favourable", label: "Broad IP Indemnity + Hold Harmless", description: "Licensor indemnifies and holds harmless against all IP infringement claims worldwide, including patent, copyright, trade secret, and trade-mark. Covers the software, documentation, and all components including third-party and open-source elements. No carve-out for combinations unless the infringement would not exist but for the combination. Licensor pays all damages, settlements, and legal costs.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "softwareLiabilityCapPosition",
      label: "Limitation of Liability",
      description: "What is the maximum aggregate liability each party faces under the agreement?",
      options: [
        { id: "licensor-favourable", label: "Capped at 12 Months' Fees, No Consequential Damages", description: "Each party's aggregate liability capped at total fees paid or payable in the 12 months preceding the claim. Full mutual exclusion of indirect, incidental, special, and consequential damages including lost profits and lost data.", favorability: "client" },
        { id: "balanced", label: "Tiered Cap with Carve-Outs", description: "General liability capped at 12 months' fees. Elevated cap (24 months' fees) for data breach, confidentiality breach, and IP indemnification obligations. Uncapped for fraud, willful misconduct, and death/personal injury. Mutual consequential damages exclusion except for data breach and confidentiality breach.", favorability: "balanced" },
        { id: "licensee-favourable", label: "Uncapped for Licensor's Key Obligations", description: "Licensor's liability uncapped for IP indemnification, data breach, confidentiality breach, and willful misconduct. General cap of 24 months' fees for all other claims. Licensee may recover consequential damages for data loss and business interruption caused by licensor's breach.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "dataHandlingPosition",
      label: "Data Handling Standards",
      description: "What data protection and privacy obligations apply to the software and any data processed?",
      options: [
        { id: "licensor-favourable", label: "Licensee Responsible for Data", description: "Licensee is solely responsible for all data entered into or processed by the software. Licensor provides the software 'as-is' from a data perspective. Licensee must ensure its own PIPEDA compliance. Licensor has no obligation to back up, protect, or return licensee data beyond standard system operations.", favorability: "client" },
        { id: "balanced", label: "Shared Responsibilities with DPA", description: "Parties enter a Data Processing Addendum (DPA) defining roles under PIPEDA. Licensor implements reasonable administrative, technical, and physical safeguards. Data encrypted in transit (TLS 1.2+) and at rest (AES-256). Annual SOC 2 Type II audit report provided. Breach notification within 72 hours. Data residency in Canada unless licensee consents otherwise.", favorability: "balanced" },
        { id: "licensee-favourable", label: "Comprehensive Data Protection with Audit Rights", description: "Full DPA with licensor as processor under PIPEDA. Data residency exclusively in Canada. Encryption at rest and in transit. Annual SOC 2 Type II and penetration test reports. Breach notification within 24 hours. Licensee audit rights (once per year with 30 days notice). Data portability in standard format on termination. Data deletion certification within 30 days of termination. Privacy impact assessment for material changes.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "auditRightsPosition",
      label: "Audit Rights",
      description: "Can either party audit the other's compliance with the agreement?",
      options: [
        { id: "licensor-favourable", label: "Licensor Audit Rights Only", description: "Licensor may audit licensee's usage annually (with 30 days notice) to verify compliance with seat limits and usage restrictions. If audit reveals unauthorized use exceeding 5%, licensee pays for the audit plus true-up fees at 150% of list price. No reciprocal audit rights for licensee.", favorability: "client" },
        { id: "balanced", label: "Mutual Audit Rights (Annual)", description: "Each party may audit the other once per year with 30 days written notice. Licensor audits licensee's usage compliance; licensee audits licensor's data handling and security practices. Audits conducted during business hours, at auditing party's expense (unless audit reveals material non-compliance, in which case the non-compliant party bears cost).", favorability: "balanced" },
        { id: "licensee-favourable", label: "Broad Licensee Audit Rights", description: "Licensee may audit licensor's security, data handling, SLA compliance, and source code escrow deposits up to twice per year with 15 days notice. Licensor bears audit costs if material non-compliance is found. Licensee may engage independent third-party auditors. Licensor audit of licensee limited to once per year with 45 days notice.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "terminationWindDownPosition",
      label: "Termination and Wind-Down",
      description: "What happens when the license agreement ends?",
      options: [
        { id: "licensor-favourable", label: "Immediate Cessation", description: "On termination, licensee must immediately cease all use of the software and destroy/return all copies within 15 days. No transition period. No data export assistance. Licensor may remotely disable the software.", favorability: "client" },
        { id: "balanced", label: "90-Day Wind-Down with Data Export", description: "Licensee receives a 90-day wind-down period to transition off the software. During wind-down, licensee retains read-only access. Licensor provides data export in standard formats (CSV, JSON, XML). After wind-down, all data is deleted and licensor provides written certification.", favorability: "balanced" },
        { id: "licensee-favourable", label: "180-Day Transition + Migration Assistance", description: "180-day transition period with full operational access to the software. Licensor provides reasonable migration assistance (up to 40 hours of professional services). Data exported in licensee's preferred format. Licensor retains licensee's data for 12 months post-termination as a safety net, then deletes with certification.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — SOFTWARE LICENSING AGREEMENT:
This is a proprietary software licensing agreement governing the grant of rights to use software developed and owned by the licensor. This is NOT a SaaS/subscription agreement (though the software may be delivered via cloud), and it is NOT an assignment of IP — the licensor retains ownership of all intellectual property.

CRITICAL IP FRAMEWORK — CANADIAN SOFTWARE IP LAW:
- Cinar Corporation v. Robinson, 2013 SCC 73: The Supreme Court of Canada's leading case on copyright infringement and the assessment of substantial similarity. The court held that the proper approach is a qualitative assessment — courts must consider the cumulative effect of the features copied, not merely a mechanical, feature-by-feature comparison. This principle applies when drafting infringement indemnification and warranty clauses: the licensor must warrant that the software as a whole does not infringe, not merely that individual components are original.
- Century 21 Canada Ltd Partnership v. Rogers Communications Inc., 2011 BCSC 1196: Addressed the scope of software licenses and the distinction between a license (permission to use) and an assignment (transfer of ownership). Critical for drafting the license grant — the agreement must clearly establish that the licensee receives a LICENSE, not ownership, and that the grant is limited to the specific rights enumerated.
- Copyright Act, R.S.C. 1985, c. C-42: Software is protected as a "literary work" under s.2. The copyright owner has the exclusive right to reproduce, publish, and adapt the work (s.3). A license is a permission to exercise one or more of these exclusive rights — the license grant must specify exactly which rights are being licensed.
- Patent Act, R.S.C. 1985, c. P-4: If the software implements patented methods or processes, the license must address patent rights separately. Copyright protects the expression of the code; patent protects the underlying method or process.

LICENSE GRANT — DRAFTING REQUIREMENTS:
- Draft the license grant per the licenseTypePosition selected:
  - Perpetual: "Licensor hereby grants to Licensee a perpetual, non-exclusive, non-transferable license to use the Software..." Specify that "perpetual" means the license survives termination of the maintenance agreement but does not survive termination for licensee's material breach.
  - Term with perpetual fallback: Define the term, renewal mechanics, and the conditions for triggering the perpetual fallback (typically 3+ consecutive years of paid maintenance). The perpetual right attaches to the version current at the trigger date.
  - Term (annual renewal): Define the initial term, auto-renewal mechanics, and the non-renewal notice period. Specify what happens on non-renewal — immediate cessation or wind-down period per terminationWindDownPosition.
- Regardless of type: The license is NON-EXCLUSIVE (unless specifically negotiated otherwise) and NON-TRANSFERABLE without the licensor's written consent. Include anti-assignment language.

USAGE RESTRICTIONS — MANDATORY:
1. No reverse engineering, decompilation, or disassembly (except as permitted by law — note that Canadian copyright law provides narrow exceptions for interoperability under Copyright Act s.30.6)
2. No modification of the object code or creation of derivative works (unless source code license is granted)
3. No sublicensing, rental, or lending to third parties
4. No use for service bureau, outsourcing, or time-sharing purposes (unless explicitly authorized)
5. No removal or alteration of proprietary notices, trademarks, or copyright legends
6. No use in excess of the licensed seat count or usage metrics
7. No distribution or transmission of the software to unauthorized parties
8. Geographic restrictions (if applicable — e.g., Canada-only use)

SOURCE CODE ESCROW:
- Draft per sourceCodeEscrowPosition:
  - If escrow is included: Identify the escrow agent (e.g., Iron Mountain, NCC Group). Specify the deposit requirements (complete, compilable source code, build instructions, dependencies, and documentation). Define release conditions precisely. On release, licensee receives a limited license to use, modify, and maintain the source code solely for internal use of the software — NOT to commercialize, distribute, or create competing products.
  - Technical verification: If selected, the escrow agent (or licensee's nominated third party) verifies annually that the deposited code can be compiled into working software. Licensor bears the cost of initial deposit; verification costs borne by the requesting party.
  - Post-release obligations: Licensee's right to modify source code is limited to bug fixes and maintenance. Licensor's indemnification obligations terminate with respect to any modifications made by the licensee.

THIRD-PARTY COMPONENTS AND OPEN-SOURCE COMPLIANCE:
- The licensor must disclose all third-party and open-source components incorporated into the software.
- Provide a schedule of open-source components with their respective licenses (MIT, Apache 2.0, GPL, LGPL, etc.).
- CRITICAL: If any component is licensed under a "copyleft" license (GPL, AGPL), the licensor must represent that the copyleft obligations do not extend to the licensee's use of the software or require the licensee to disclose its own source code. This is a critical warranty.
- Licensor warrants that all third-party components are properly licensed and that the licensee's use of the software will not infringe any third-party license terms.

DATA HANDLING — PIPEDA COMPLIANCE:
- Draft per dataHandlingPosition.
- Personal Information Protection and Electronic Documents Act (PIPEDA), S.C. 2000, c. 5: If the software processes personal information of Canadian residents, both parties have obligations under PIPEDA's 10 Fair Information Principles.
- If the licensor hosts or processes data: A Data Processing Addendum (DPA) is required defining the parties' roles (controller vs. processor), the purposes of processing, data residency requirements, breach notification timelines, and data return/deletion on termination.
- Quebec Law 25 (Act respecting the protection of personal information in the private sector): If licensee operates in Quebec, additional requirements apply including privacy impact assessments, consent requirements, and data residency considerations.
- Data portability: On termination, the licensee must be able to export their data in a standard, machine-readable format. Specify the formats (CSV, JSON, XML, SQL dump) and the timeline for data availability post-termination.

ACCEPTANCE TESTING:
- For on-premise deployments or custom configurations, include an acceptance testing period (typically 30 days from delivery or installation).
- Define acceptance criteria: the software must perform materially in accordance with the documentation and functional specifications.
- Specify the defect reporting and cure process during the acceptance period.
- If the software fails acceptance testing after a reasonable cure period (typically 2 additional cure cycles), the licensee may reject the software and receive a full refund.

PERFORMANCE WARRANTIES:
- Licensor warrants that the software will perform materially in accordance with the documentation for a specified warranty period (typically 12 months from acceptance).
- Licensor warrants that the software does not contain any malicious code (viruses, trojans, backdoors, time bombs, or disabling devices).
- Licensor warrants that it has the right and authority to grant the license and that the software does not infringe any third-party IP rights (scope per ipIndemnificationPosition).
- DISCLAIMER: Except for the express warranties, the software is provided "AS IS." Licensor disclaims all implied warranties including merchantability, fitness for a particular purpose, and non-infringement TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.

LIMITATION OF LIABILITY:
- Draft per softwareLiabilityCapPosition.
- Regardless of position: Include a mutual exclusion of consequential damages with specific carve-outs as selected. Always carve out: (a) fraud and willful misconduct, (b) death or personal injury caused by negligence, (c) breach of confidentiality (to the extent not insurable), and (d) IP indemnification obligations (per the selected position).
- The liability cap should apply PER CLAIM and IN AGGREGATE — specify which.
- Address the interaction between the liability cap and the indemnification obligations — indemnification amounts count toward the cap unless the cap position specifies otherwise.

AUDIT RIGHTS:
- Draft per auditRightsPosition.
- Licensor audit rights are standard in software licensing — the licensor needs to verify that the licensee is not using the software in excess of the licensed scope.
- Licensee audit rights are increasingly common, particularly for data handling and security compliance.
- Specify: notice period, frequency, scope, who bears costs, what happens if non-compliance is found, and dispute resolution for audit findings.

EXPORT CONTROLS:
- If the software contains encryption or is subject to export controls, include a clause requiring the licensee to comply with all applicable Canadian export control laws (Export and Import Permits Act, R.S.C. 1985, c. E-19) and, if applicable, U.S. Export Administration Regulations (EAR).
- Licensee represents that it will not export or re-export the software to any country, entity, or person prohibited under applicable export control laws.

TERMINATION AND WIND-DOWN:
- Draft per terminationWindDownPosition.
- Material breach: Either party may terminate on the other's material breach, subject to a cure period (typically 30 days for payment defaults, 60 days for other breaches).
- Insolvency: Either party may terminate immediately if the other becomes insolvent, files for bankruptcy, or has a receiver appointed.
- Surviving provisions: Confidentiality, limitation of liability, IP ownership, indemnification, and audit rights survive termination.
- Post-termination data handling: Specify the data return/export timeline and format, and require written certification of data deletion.`,
};

// ──────────────────────────────────────────────
// VOTING AGREEMENTS (M&A / SECURITIES)
// ──────────────────────────────────────────────

const VOTING_AGREEMENT_CONFIG: AgreementConfig = {
  id: "voting-agreement",
  partyLabels: {
    partyALabel: "Company / Target",
    partyAPlaceholder: "TargetCo Inc.",
    partyBLabel: "Shareholder(s) / Voting Party",
    partyBPlaceholder: "Shareholder Name(s)",
  },
  estimatedGenerationTime: 90,
  requiredFields: [
    "partyAName",
    "partyBName",
    "jurisdiction",
    "transactionType",
    "shareholderCapacity",
    "subjectShares",
    "ownershipPercentage",
    "considerationType",
    "stockExchangeListing",
    "arrangementAgreementDate",
    "governingLaw",
    "terminationDate",
  ],
  wizardSteps: [
    "va-type",           // Step 0: Agreement Type Confirmation (plan of arrangement, take-over bid, merger of equals, asset purchase)
    "va-parties",        // Step 1: Three-Party Capture (Buyer, Shareholder, Company/Target)
    "va-transaction",    // Step 2: Transaction Context (deal structure, consideration, Arrangement Agreement reference)
    "va-securities",     // Step 3: Subject Shares & Securities (ownership calc, early warning detection, NI 62-103)
    "va-commitment",     // Step 4: Voting Commitment (vote-for, vote-against, irrevocable/revocable proxy)
    "va-transfer",       // Step 5: Transfer Restrictions (no-sale, no-pledge, lock-up variant for take-over bid)
    "va-nosolicitation", // Step 6: Non-Solicitation / No-Shop (3-tier routing by shareholder capacity)
    "va-termination",    // Step 7: Termination Provisions (mutual, consideration change, drop-dead, AA termination)
    "va-general",        // Step 8: General Provisions (governing law, jurisdiction, notices, Quebec language)
    "va-review",         // Step 9: Review & Generate (collapsible review, edit capability, .docx output)
  ],
  clausePositions: [
    {
      id: "irrevocableProxyPosition",
      label: "Irrevocable Proxy Scope & Duration",
      description: "How much voting control does the Buyer receive over the Shareholder's shares via proxy appointment?",
      options: [
        { id: "buyer-favourable", label: "Full Irrevocable Proxy (Coupled with Interest)", description: "Irrevocable proxy coupled with an interest to vote all Subject Shares on ALL matters — survives death, incapacity, insolvency. CBCA s.148 compliant. Maximum deal certainty for Buyer.", favorability: "client" },
        { id: "balanced", label: "Irrevocable Proxy on Transaction Matters Only", description: "Irrevocable proxy limited to voting on the Arrangement Resolution, related resolutions, and against competing Acquisition Proposals. Shareholder retains voting rights on routine corporate matters.", favorability: "balanced" },
        { id: "shareholder-favourable", label: "Revocable Proxy with Fiduciary Out", description: "Proxy revocable if Arrangement Agreement is terminated or if board determines a Superior Proposal exists. Shareholder retains right to revoke proxy on 5 business days' notice. Per VA-04-003 clause variant.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "boardCompositionVAPosition",
      label: "Board Composition (Investor / Founder / Independent Seats)",
      description: "How are board seats allocated among founders, investors, and independent directors in the voting arrangement?",
      options: [
        { id: "founder-controlled", label: "Founder-Controlled Board", description: "Founders designate majority of directors (e.g., 3 of 5). Investors appoint 1 director. 1 mutual independent director meeting TSX/CSE independence standards. CBCA s.105(3): 25% Canadian resident requirement.", favorability: "client" },
        { id: "balanced", label: "Balanced Board with Stage-Based Allocation", description: "Seed: 2 founder + 1 investor + 1 independent. Series A+: 2 founder + 2 investor + 1 independent. Board size changes require approval of holders of majority of each class voting separately. Per VA-02-001 to VA-02-005 clause library.", favorability: "balanced" },
        { id: "investor-controlled", label: "Investor Board Majority", description: "Investors designate majority of directors. Founder retains 1-2 seats subject to maintaining minimum ownership threshold. Independent director appointed by investor designees. Typical for later-stage PE or control transactions.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "protectiveProvisionsVAPosition",
      label: "Protective Provisions (Consent Matters)",
      description: "Which corporate actions require separate Preferred class consent beyond normal board approval? Per VA-05 clause library (15-25 specific consent matters).",
      options: [
        { id: "founder-favourable", label: "Minimal Protective Provisions (8 Items)", description: "Consent required only for: (1) amend articles/bylaws adversely affecting Preferred, (2) create senior/parity securities, (3) increase/decrease authorized shares, (4) reclassify to senior shares, (5) declare dividends, (6) redeem/repurchase shares, (7) approve liquidation/dissolution, (8) approve merger/amalgamation/sale of all assets. Items 1-8 are non-negotiable per VA-05-001 to VA-05-008.", favorability: "client" },
        { id: "balanced", label: "Standard Protective Provisions (16 Items)", description: "Items 1-8 plus: (9) incur debt >$250K-500K, (10) increase ESOP pool beyond X%, (11) enter/modify related party transactions >$25K-50K, (12) change principal business, (13) hire/terminate CEO or change compensation >10-20%, (14) approve annual budget or deviate >10-15%, (15) create subsidiaries or invest >$100K, (16) change auditors. Items 9-16 negotiable. Per VA-05 clause library.", favorability: "balanced" },
        { id: "investor-favourable", label: "Comprehensive Protective Provisions (25 Items)", description: "All 16 standard items plus: (17) enter any contract >$50K, (18) grant security interests, (19) settle litigation >$25K, (20) change fiscal year, (21) change banking relationships, (22) open/close offices, (23) amend ESOP terms, (24) file patents, (25) change insurance coverage. Maximum investor control, significant operational friction.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "standstillPosition",
      label: "Standstill Provisions",
      description: "What restrictions apply to the Shareholder acquiring additional shares or taking actions to influence the Company during the agreement term?",
      options: [
        { id: "hard-standstill", label: "Hard Standstill", description: "Shareholder may not acquire ANY additional voting securities, make public announcements regarding voting intentions, seek board representation beyond the agreement, or propose competing transactions. No exceptions. Strictest deal protection.", favorability: "client" },
        { id: "balanced", label: "Soft Standstill with Market Exceptions", description: "Shareholder may not acquire additional securities that would exceed their current ownership percentage. Exceptions for: (a) participation in rights offerings pro-rata, (b) ESOP grants in ordinary course, (c) acquisitions from affiliates. Shareholder may communicate privately with board.", favorability: "balanced" },
        { id: "no-standstill", label: "No Standstill (Information Rights Only)", description: "No acquisition restrictions. Shareholder retains full market freedom. Shareholder must disclose additional acquisitions per NI 62-103 early warning thresholds. Appropriate for passive investors or regulatory-driven agreements.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "fundamentalTransactionVotingPosition",
      label: "Voting on Fundamental Transactions (Merger, Sale, IPO)",
      description: "How does the Shareholder commit to vote on major corporate transactions?",
      options: [
        { id: "buyer-favourable", label: "Comprehensive Vote-For + Vote-Against", description: "Shareholder votes FOR: Arrangement Resolution, all ancillary resolutions, adjournments. Shareholder votes AGAINST: any competing Acquisition Proposal, any resolution that could delay/prevent closing. No beneficial ownership changes permitted. Per VA-04-001 and VA-04-002.", favorability: "client" },
        { id: "balanced", label: "Vote-For with Fiduciary Carve-Out", description: "Shareholder votes FOR the Arrangement Resolution and against competing proposals. Fiduciary carve-out: if Shareholder is a director/officer and the board determines a Superior Proposal exists, voting obligation is suspended while the board deliberates. Per CBCA s.122 director duties.", favorability: "balanced" },
        { id: "shareholder-favourable", label: "Vote-For with Material Change Out", description: "Shareholder votes FOR the Arrangement Resolution. Voting obligation terminates if: (a) consideration decreases >10%, (b) material adverse change to transaction terms, (c) board withdraws recommendation. Shareholder retains full discretion on non-transaction matters.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "boardCommitteePosition",
      label: "Board Committee Composition (Audit, Compensation, Nomination)",
      description: "What committee structures are required and who appoints committee members?",
      options: [
        { id: "investor-favourable", label: "Investor Committee Majority", description: "Audit Committee: 3 members, investor majority, all independent per NI 52-110. Compensation Committee: investor designee as chair. Nomination Committee: joint founder-investor. TSX/TSXV rules require audit committee independence.", favorability: "counter-party" },
        { id: "balanced", label: "Balanced Committee Representation", description: "Audit Committee: independent director as chair + 1 investor + 1 founder (all meeting NI 52-110 independence). Compensation Committee: independent director + 1 investor. Nomination Committee: 1 founder + 1 investor + independent director. Per VA-02-004 and VA-02-005.", favorability: "balanced" },
        { id: "founder-favourable", label: "Founder Committee Influence", description: "Audit Committee: minimum statutory compliance (NI 52-110). No separate compensation or nomination committees required — full board acts as committee. Founder retains maximum operational control over compensation and hiring.", favorability: "client" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "observerRightsPosition",
      label: "Observer Rights",
      description: "Do non-board shareholders or minority investors receive the right to attend board meetings as observers?",
      options: [
        { id: "full-observer", label: "Full Observer Rights", description: "Observer may attend all board and committee meetings. Receives all board materials concurrently with directors. May participate in discussion but may not vote. Observer subject to confidentiality obligations. Company pays travel expenses. Per VA-02-005.", favorability: "counter-party" },
        { id: "limited-observer", label: "Limited Observer Rights", description: "Observer may attend regular board meetings only (not committee meetings). Board may exclude observer from sessions discussing: (a) matters in which observer has a conflict, (b) privileged communications, (c) compensation of observer-related personnel. 48-hour advance notice of meetings.", favorability: "balanced" },
        { id: "no-observer", label: "No Observer Rights", description: "No observer seat. Non-board shareholders receive information rights per the agreement but do not attend board meetings. Appropriate for large shareholder groups or where confidentiality concerns predominate.", favorability: "client" },
      ],
      defaultPosition: "limited-observer",
    },
    {
      id: "writtenConsentPosition",
      label: "Written Consent vs. Meeting Requirement",
      description: "Can shareholders act by written consent in lieu of a meeting, or must all voting occur at a duly called meeting?",
      options: [
        { id: "consent-permitted", label: "Written Consent Permitted (CBCA s.142)", description: "Shareholders may act by written resolution signed by ALL shareholders entitled to vote. Resolution effective when last signature obtained. Counterparts and electronic signatures permitted per CBCA s.252.1. Per VA-07-001.", favorability: "balanced" },
        { id: "balanced", label: "Written Consent for Routine; Meeting for Material", description: "Written consent permitted for routine matters (director election, officer appointments). Material matters (fundamental transactions, amendments, protective provisions) require duly convened meeting with formal notice and quorum. Balances efficiency with deliberation.", favorability: "balanced" },
        { id: "meeting-only", label: "Meeting Required for All Votes", description: "All shareholder actions require a duly called meeting with minimum 21-day notice per CBCA s.135. No action by written consent. Ensures full deliberation, proxy solicitation compliance (CBCA s.148-150), and dissent rights notice.", favorability: "client" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "quorumPosition",
      label: "Quorum Requirements",
      description: "What constitutes a quorum for shareholder meetings under this agreement?",
      options: [
        { id: "low-quorum", label: "Statutory Minimum Quorum", description: "Quorum = holders of majority of shares entitled to vote, present in person or by proxy. Per CBCA s.139(1). Adjourned meeting: no quorum requirement (shareholders present constitute quorum).", favorability: "client" },
        { id: "balanced", label: "Enhanced Quorum with Class Representation", description: "Quorum = holders of 66⅔% of outstanding shares, provided holders of majority of EACH class (Common and Preferred) are represented. Ensures both founder and investor voices are heard.", favorability: "balanced" },
        { id: "high-quorum", label: "Supermajority Quorum", description: "Quorum = holders of 75% of outstanding shares with all classes represented. Prevents action without broad consensus. Risk: inability to achieve quorum may require repeated adjournments.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "directorRemovalPosition",
      label: "Director Removal & Replacement Mechanics",
      description: "How can designated directors be removed and replaced under the voting agreement?",
      options: [
        { id: "designator-only", label: "Removal Only by Designating Party", description: "A designated director may ONLY be removed by the party/class that designated them. All shareholders commit to vote FOR removal if requested by the designating party. Vacancy filled by designating party's nominee within 30 days. Per VA-03-001 to VA-03-003.", favorability: "balanced" },
        { id: "balanced", label: "Designator Removal + Board For-Cause", description: "Designating party may remove their designee at will. Additionally, the board may remove any director for cause (fraud, felony, material breach of fiduciary duty) by supermajority board vote. Removed director replaced by designating party's nominee.", favorability: "balanced" },
        { id: "shareholder-vote", label: "Shareholder Vote Removal (CBCA s.109)", description: "Any director may be removed by ordinary resolution of shareholders per CBCA s.109(1). Designating party retains right to nominate replacement, but removal is not limited to the designating class.", favorability: "counter-party" },
      ],
      defaultPosition: "designator-only",
    },
    {
      id: "executiveCompVotingPosition",
      label: "Executive Compensation Voting",
      description: "What shareholder or board approval is required for executive compensation decisions?",
      options: [
        { id: "board-discretion", label: "Board Discretion (No Shareholder Vote)", description: "Executive compensation set by the board (or compensation committee) without shareholder approval. Board may grant equity within the approved ESOP pool.", favorability: "client" },
        { id: "balanced", label: "Board Sets with Investor Consent Thresholds", description: "Board sets compensation. Investor consent required for: (a) CEO compensation changes >10-20%, (b) new equity grants exceeding individual threshold, (c) executive severance packages exceeding 12 months. Per protective provisions VA-05-013.", favorability: "balanced" },
        { id: "shareholder-approval", label: "Shareholder Advisory Vote + Investor Veto", description: "Annual say-on-pay advisory vote by all shareholders. Investor class veto on: any executive compensation exceeding $[X], any new employment agreement with C-suite, any change-of-control golden parachute.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "antiDilutionVotingPosition",
      label: "Anti-Dilution Voting Protections",
      description: "What voting protections exist to prevent dilution of existing shareholders without consent?",
      options: [
        { id: "no-protection", label: "No Anti-Dilution Voting Protection", description: "Board may authorize new share issuances without separate class vote (subject only to protective provisions, if any). Maximum company flexibility.", favorability: "client" },
        { id: "balanced", label: "Class Vote on Dilutive Issuances", description: "Any issuance that would dilute existing Preferred holders below their pro-rata percentage requires separate class vote of affected Preferred class. ESOP grants within approved pool are carved out. Per VA-05-003 and VA-05-006.", favorability: "balanced" },
        { id: "full-protection", label: "Comprehensive Anti-Dilution Voting", description: "Separate class vote required for ANY share issuance. Full ratchet price protection on down-rounds requires additional shareholder approval. Pay-to-play for non-participating investors.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "dragAlongVotingPosition",
      label: "Drag-Along Voting Threshold",
      description: "What approval threshold triggers the drag-along obligation requiring all shareholders to vote in favor of and consummate a sale?",
      options: [
        { id: "low-threshold", label: "60% Preferred + Common Majority", description: "Drag-along triggered by 60% of Preferred (on as-converted basis) plus majority of Common. Lowest threshold — maximum exit flexibility. Risk level: HIGH per VA-04-004.", favorability: "client" },
        { id: "balanced", label: "66⅔% Preferred + Common Majority + Price Floor", description: "Drag-along requires 66⅔% of Preferred plus majority of Common. Minimum price: not less than 1.5x original issue price of most senior Preferred. Risk level: MEDIUM.", favorability: "balanced" },
        { id: "high-threshold", label: "75% Preferred + 75% Common + 3x Price Floor", description: "Drag-along requires 75% of each of Preferred and Common voting separately. Minimum price: 3x original issue price. 30 business days' advance notice. Risk level: LOW.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "informationRightsVotingPosition",
      label: "Information Rights Tied to Voting",
      description: "What information must the Company provide to voting parties to enable informed exercise of voting rights?",
      options: [
        { id: "minimal", label: "Meeting Materials Only", description: "Company provides notice of meetings and proxy materials per CBCA s.135-136. No additional information rights beyond statutory requirements.", favorability: "client" },
        { id: "balanced", label: "Quarterly Financials + Transaction Disclosure", description: "Quarterly unaudited financials, annual audited statements, cap table updates. For shareholder votes: management information circular with full transaction disclosure, board recommendation, and dissent rights notice. Per VA-08-001.", favorability: "balanced" },
        { id: "comprehensive", label: "Full Information Rights Package", description: "Monthly management accounts, quarterly financials, annual audit, annual budget, KPI dashboard, cap table, 5-day notice inspection rights, plus all board materials (subject to privilege). For fundamental transactions: independent valuation, fairness opinion, full data room access.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "terminationTriggersPosition",
      label: "Termination Triggers (IPO, Acquisition, Time-Based)",
      description: "Under what circumstances does the voting agreement automatically terminate?",
      options: [
        { id: "narrow-termination", label: "Narrow Termination (Closing or Mutual Consent Only)", description: "Agreement terminates only upon: (a) Effective Time of the transaction, or (b) mutual written consent of Buyer and Shareholder. No drop-dead date. Maximum deal protection for Buyer. Per VA-07-001.", favorability: "client" },
        { id: "balanced", label: "Standard Termination Triggers", description: "Terminates upon earliest of: (a) Effective Time, (b) mutual consent, (c) AA termination, (d) consideration decrease >10%, (e) drop-dead date (6 months take-over bid, 12 months arrangement), (f) regulatory approval failure. Per VA-07-001 to VA-07-005.", favorability: "balanced" },
        { id: "broad-termination", label: "Broad Termination with Shareholder Protections", description: "All standard triggers plus: (g) material adverse change, (h) board recommendation withdrawal, (i) failure to mail circular within 60 days, (j) Qualified IPO, (k) adverse tax change. Shareholder may terminate on 10 days' notice.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — VOTING AGREEMENT (CANADIAN M&A / SECURITIES):
This is a voting agreement for Canadian M&A transactions — plans of arrangement, take-over bids, mergers of equals, or asset purchases. Priced at $850+ reflecting senior securities counsel complexity.

PARTY DYNAMICS:
- Company/Target (Party A): The corporation whose shares are subject to the voting agreement
- Shareholder(s)/Voting Party (Party B): One or more shareholders committing to vote their shares in a specified manner
- Buyer: The acquiring entity (captured as a third party in the wizard) whose transaction the Shareholder is supporting
- The core tension: DEAL CERTAINTY for the Buyer vs. FLEXIBILITY AND FIDUCIARY PROTECTION for the Shareholder

TRANSACTION TYPE ROUTING (Step 0 — va-type):
- Plan of Arrangement (CBCA s.192): Most common. 66⅔% shareholder approval + court approval (interim and final orders). Revocable proxy standard. Dissent rights under CBCA s.190.
- Take-Over Bid (NI 62-104): >20% share acquisition triggers bid rules. 105-day deposit period. 50%+1 minimum tender. Irrevocable proxy required. Hard lock-up must convert to cash alternative.
- Merger of Equals: Reciprocal voting obligations. Both boards approve. Both shareholder meetings. Dual fairness opinions.
- Asset Purchase: Shareholder votes to approve asset sale. Liquidation/creditor payment provisions.

REGULATORY THREE-PILLAR SYSTEM:
The voting agreement regulatory module operates on three pillars that the AI engine must execute in sequence:

PILLAR 1 — VALIDATION (15 rules):
- RULE-VA-001 (CRITICAL): Jurisdiction must be in supported list (CBCA, OBCA, QCA, ABCA, BCBCA)
- RULE-VA-003 (CRITICAL): Share counts must add up; verify voting vs. non-voting split
- RULE-VA-005: Identify any shareholder with >10% voting interest as control person; trigger joint actor analysis
- RULE-VA-006 (HIGH): Multi-factor joint actor risk assessment — analyze collateral benefits, active bid participation, MNPI sharing, director coordination, affiliation documentation. Score 0-100.
- RULE-VA-007 (HIGH): MI 61-101 applicability — if insider/affiliate involved, check if formal valuation and majority-of-minority approval required
- RULE-VA-008: NI 62-103 early warning — if ownership crosses 10% (reporting issuer) or 5% (non-reporting), inject disclosure clauses
- RULE-VA-009 (CRITICAL): NI 62-104 take-over bid threshold — if ownership will exceed 20%, inject bid conversion clauses and lock-up conversion
- RULE-VA-010 (CRITICAL): Quebec jurisdiction requires bilingual clause per Bill 96 and Civil Code overlay
- RULE-VA-012: Director/fiduciary signatory requires fiduciary carve-out clause (Revlon duty, Superior Proposal response)
- RULE-VA-013 (HIGH): Exchange-listed issuer requires exchange approval workflow — independent director vote, fairness opinion, Part IV (TSX) compliance
- RULE-VA-015 (HIGH): Hard vs. soft lock-up distinction — hard lock-ups must convert to cash alternative during take-over bid per NI 62-104 s.2.38

PILLAR 2 — INJECTION (10 rules):
- INJ-VA-001: Quebec — bilingual preamble, French language clause, Civil Code overlay (arts. 322-329)
- INJ-VA-002: Controlling shareholder (>50% or group >66⅔%) — control definition, governance, fiduciary duty
- INJ-VA-003: D&O fiduciary carve-out — director carve-out, Superior Proposal, Revlon duty
- INJ-VA-004: Early warning — news release (next business day), report (2 business days), MNPI prohibition
- INJ-VA-005: MI 61-101 — formal valuation, majority-of-minority approval, collateral benefits disclosure
- INJ-VA-006: Take-over bid lock-up conversion — lock-up conversion, cash alternative, 105-day extension
- INJ-VA-008: Reciprocal voting (merger of equals) — reciprocal obligations, governance, board composition
- INJ-VA-009: Multi-shareholder (>5 signatories) — schedule, amendment procedure, withdrawal rights
- INJ-VA-010: Exchange-specific — Part IV (TSX), disclosure, committee approval

PILLAR 3 — ROUTING (8 routes):
- ROUTE-VA-001 (Standard): No control shift, no joint actor risk. 3-5 days.
- ROUTE-VA-002 (Controlling Shareholder): Post-agreement control >50%. 10-15 days. Fairness opinion required.
- ROUTE-VA-003 (Take-Over Bid): Ownership >20%. 4-6 months. Securities commission review.
- ROUTE-VA-004 (Merger of Equals): Reciprocal voting. 3-4 months. Dual fairness opinions.
- ROUTE-VA-005 (Quebec): QCA jurisdiction. 8-12 weeks. AMF + Superior Court.
- ROUTE-VA-006 (Multi-Shareholder): >5 signatories. 2-3 weeks.
- ROUTE-VA-007 (Joint Actor Escalation): Risk score >60. 6-12 weeks. Exemptive relief.
- ROUTE-VA-008 (MI 61-101 Formal Valuation): Insider transaction >25% market cap. 12-16 weeks.

CBCA STATUTORY FRAMEWORK:
- s.2(1): "affiliate" definition — controls permitted transferee and joint actor analysis
- s.102(1): Directors manage corporation; voting agreements must not improperly fetter discretion
- s.105(3): 25% of directors must be resident Canadians
- s.109: Election and removal of directors; statutory right coordinated by agreement
- s.122: Director fiduciary duties; agreements must include fiduciary carve-out for director-shareholders
- s.137: Shareholder proposals; agreement must not prevent exercise of proposal rights
- s.143: Shareholder meeting requirements for fundamental transactions
- s.145.1: Pooling agreements / voting trusts — this agreement is a valid pooling agreement
- s.146: Unanimous shareholder agreements — if agreement restricts ALL directors' powers, it may qualify as USA
- s.148-150: Proxy requirements — irrevocable proxy must be in writing, signed, deposited
- s.190: Dissent rights on fundamental changes; address interaction with voting commitment
- s.192: Plans of arrangement — 66⅔% threshold; court approval (fair and reasonable)

SECURITIES LAW FRAMEWORK:
- MI 61-101 (Minority Protection): Formal valuation + majority-of-minority for related party transactions. SAFE HARBOUR: Voting agreement ALONE does NOT constitute joint actor status. Joint actor arises from collateral benefits, active bid participation, MNPI sharing, director coordination, or affiliation.
- NI 62-104 (Take-Over Bids): >20% triggers bid. 105-day deposit. 50%+1 minimum tender. Hard lock-up conversion to cash alternative. Voting agreement (vote at meeting) vs. lock-up (agree not to sell).
- NI 62-103 (Early Warning): >10% (reporting) or >5% (non-reporting) triggers disclosure. News release next business day. Report within 2 business days.

STOCK EXCHANGE RULES:
- TSX: >20% control triggers Part IV. Independent director approval. Fairness opinion. Majority-of-minority vote.
- TSXV: >20% control or director transaction >$100K. Sponsor review. Disinterested shareholder vote.
- CSE: >20% control, board seat, or veto rights. Substance-based assessment.
- NEO: >20% control. Pre-approval recommended. Board independence assessment.

PROVINCIAL MAPPING:
- CBCA: s.192 arrangement. Most permissive.
- Ontario OBCA: s.182. Strictest joint actor analysis (OSC).
- Quebec QCA: s.208. BILINGUAL MANDATORY. Civil Code arts. 322-329.
- Alberta ABCA: s.193. Moderate. ASC exemptive relief available.
- BC BCBCA: s.291. Substantive fairness test. Broad dissent rights.

CLAUSE LIBRARY (89 clauses, VA-XX-NNN format, 11 sections):
VA-01 Definitions | VA-02 Board Composition | VA-03 Voting Commitments | VA-04 Proxy & Enforcement | VA-05 Protective Provisions (25 consent matters) | VA-06 Transfer Restrictions | VA-07 Termination | VA-08 Information & Disclosure | VA-09 Non-Solicitation (3 tiers) | VA-10 General Provisions | VA-11 Remedies

JOINT ACTOR ANALYSIS ENGINE:
6-factor weighted risk assessment:
Factor 1 (HIGH): Collateral economic benefits = joint actor PRESUMED
Factor 2 (HIGH): Active bid participation = joint actor
Factor 3 (MEDIUM): MNPI sharing = presumption of joint actor
Factor 4 (MEDIUM): Director coordination = joint actor; heightened fiduciary scrutiny
Factor 5 (HIGH): Affiliation documentation = joint actor AUTOMATIC
Factor 6 (LOW — safe harbour): Voting agreement alone = NO joint actor presumption

COMPLEXITY CLASSIFICATION:
- Tier 1 (Simple): Single shareholder, plan of arrangement, no control shift, <$10M. 10-15 min wizard, 12-18 pages.
- Tier 2 (Standard): 2-5 shareholders, exchange-listed, $10M-100M. 15-20 min, 18-25 pages.
- Tier 3 (Complex): >5 shareholders, MI 61-101 triggered, >$100M. 20-30 min, 25-40 pages.

MANDATORY PROVISIONS:
1. Definitions (VA-01): Subject Shares, Arrangement Agreement, Acquisition Proposal, Control Person
2. Board composition (VA-02): Seat allocation, CBCA s.105(3) residency
3. Voting commitments (VA-03): Vote-for, vote-against, removal/replacement
4. Proxy appointment (VA-04): Irrevocable or revocable per transaction type; CBCA s.148
5. Protective provisions (VA-05): Consent matters per position selection
6. Transfer restrictions (VA-06): No-sale, no-pledge, lock-up variant
7. Termination (VA-07): Configurable triggers per position
8. Reps and warranties: Authority, title, no conflicts, no undisclosed arrangements
9. Specific performance (VA-11): Injunctive relief without proof of damages
10. Governing law, dispute resolution, notices (VA-10)
11. Spousal consent (Schedule A): Ontario FLA s.4-6, BC FLA s.84-85, Alberta MPA s.7, Quebec CC arts. 414-426
12. Non-solicitation (VA-09): 3-tier routing by shareholder capacity

KEY CASE LAW:
- BCE Inc. v. 1976 Debentureholders (2008 SCC): Fiduciary duty; reasonable expectations
- Peoples Department Stores v. Wise (2004 SCC): Directors' duty to corporation
- Pente Investment Management v. Schneider Corp. (1998 ONCA): Board duties in change-of-control
- Re Stelco Inc. (2005 ONCA): Directors' duties in zone of insolvency
- InterOil Corp. v. Mulacek (2017 SCC): Arrangement fairness test`,
};

// ──────────────────────────────────────────────
// MUTUAL NDA
// ──────────────────────────────────────────────

const NDA_MUTUAL_CONFIG: AgreementConfig = {
  id: "nda-mutual",
  partyLabels: { partyALabel: "Party A (First Disclosing Party)", partyAPlaceholder: "Acme Technologies Inc.", partyBLabel: "Party B (Second Disclosing Party)", partyBPlaceholder: "Potential Partner Inc." },
  estimatedGenerationTime: 15,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "purposeOfDisclosure"],
  wizardSteps: ["plat-terms"],
  clausePositions: [
    { id: "durationPosition", label: "Confidentiality Duration", description: "How long must both parties keep each other's information confidential?", options: [{ id: "long", label: "Perpetual", description: "Obligations last forever — strongest protection for trade secrets", favorability: "client" }, { id: "balanced", label: "3-5 Years", description: "Standard commercial duration — enforceable and reasonable", favorability: "balanced" }, { id: "short", label: "1-2 Years", description: "Short duration — easier to administer", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "scopePosition", label: "Confidential Information Scope", description: "How broadly is 'Confidential Information' defined? Too narrow and important info falls through the cracks. Too broad and it becomes unmanageable.", options: [{ id: "broad", label: "Broad Definition", description: "All info disclosed in any form, marked or not — broadest protection", favorability: "client" }, { id: "marked", label: "Marked or Designated", description: "Written info must be marked; oral confirmed in writing within 10 business days", favorability: "balanced" }, { id: "narrow", label: "Specifically Identified Only", description: "Only info listed in a schedule — narrowest scope", favorability: "counter-party" }], defaultPosition: "marked" },
    { id: "exclusionsPosition", label: "Standard Exclusions", description: "What information is carved out from confidentiality obligations?", options: [{ id: "narrow-exclusions", label: "Narrow Exclusions", description: "Only publicly available and legally compelled — maximum protection", favorability: "client" }, { id: "standard-exclusions", label: "Standard Exclusions", description: "Public info, independently developed, third party, legally compelled — industry standard", favorability: "balanced" }, { id: "broad-exclusions", label: "Broad Exclusions + Residual Knowledge", description: "Standard plus residual knowledge carve-out — recipient may use general ideas in unaided memory", favorability: "counter-party" }], defaultPosition: "standard-exclusions" },
    { id: "returnDestructionPosition", label: "Return or Destruction", description: "What happens to confidential materials when the NDA expires?", options: [{ id: "strict", label: "Return All + Certified Destruction", description: "Materials returned within 10 days; electronic copies destroyed; officer certifies in writing", favorability: "client" }, { id: "balanced", label: "Return or Destroy at Recipient's Election", description: "Return or destroy; certify within 30 days; retain copies required by law", favorability: "balanced" }, { id: "flexible", label: "Destruction with Backup Retention", description: "Destroy active copies; retain routine backups subject to ongoing confidentiality", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "injunctiveReliefPosition", label: "Injunctive Relief", description: "Can a party seek a court order to stop a breach immediately?", options: [{ id: "automatic", label: "Acknowledged Right to Injunctive Relief", description: "Both parties acknowledge irreparable harm and entitlement to injunctive relief without bond", favorability: "client" }, { id: "standard", label: "Standard Remedies", description: "Any remedy at law or equity, including injunction", favorability: "balanced" }, { id: "damages-first", label: "Damages as Primary Remedy", description: "Monetary damages primary; injunction only if damages inadequate", favorability: "counter-party" }], defaultPosition: "automatic" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — MUTUAL NDA:
This is a mutual (bilateral) NDA. Both parties share and protect each other's confidential information.
TARGET: 4-8 pages. All obligations must be symmetric.
KEY CASE LAW: Lac Minerals v. International Corona (1989 SCC), Lyons v. Multari (2000 ONCA).
MANDATORY SECTIONS: Definition, exclusions, purpose/use, permitted disclosures, return/destruction, injunctive relief, no implied rights, term/survival.`,
};

// ──────────────────────────────────────────────
// ONE-WAY NDA
// ──────────────────────────────────────────────

const NDA_ONE_WAY_CONFIG: AgreementConfig = {
  id: "nda-one-way",
  partyLabels: { partyALabel: "Disclosing Party (Your Company)", partyAPlaceholder: "Acme Technologies Inc.", partyBLabel: "Receiving Party", partyBPlaceholder: "Potential Contractor / Vendor" },
  estimatedGenerationTime: 15,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "purposeOfDisclosure"],
  wizardSteps: ["plat-terms"],
  clausePositions: [
    { id: "durationPosition", label: "Confidentiality Duration", description: "How long must the receiving party keep your information confidential?", options: [{ id: "long", label: "Perpetual", description: "Obligations last forever — use for trade secrets", favorability: "client" }, { id: "balanced", label: "3-5 Years", description: "Standard commercial duration", favorability: "balanced" }, { id: "short", label: "1-2 Years", description: "Short — for time-sensitive info", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "scopePosition", label: "Confidential Information Scope", description: "How broadly is your 'Confidential Information' defined?", options: [{ id: "broad", label: "Broad Definition", description: "All info in any form, marked or not — maximum protection", favorability: "client" }, { id: "marked", label: "Marked or Designated", description: "Written marked; oral confirmed in 10 business days", favorability: "balanced" }, { id: "narrow", label: "Specifically Identified Only", description: "Only scheduled info — easiest for recipient", favorability: "counter-party" }], defaultPosition: "broad" },
    { id: "returnDestructionPosition", label: "Return or Destruction", description: "What happens to your materials when the NDA ends?", options: [{ id: "strict", label: "Return All + Certified Destruction", description: "Returned within 10 days; e-copies destroyed; officer certifies", favorability: "client" }, { id: "balanced", label: "Return or Destroy at Election", description: "Return or destroy; certify in 30 days; retain legal-required copies", favorability: "balanced" }, { id: "flexible", label: "Destruction with Backup Retention", description: "Active copies destroyed; routine backups under ongoing confidentiality", favorability: "counter-party" }], defaultPosition: "strict" },
    { id: "injunctiveReliefPosition", label: "Injunctive Relief", description: "Can you seek a court order to stop a breach immediately?", options: [{ id: "automatic", label: "Acknowledged Right to Injunctive Relief", description: "Receiving party acknowledges irreparable harm; discloser may seek injunction without bond", favorability: "client" }, { id: "standard", label: "Standard Remedies", description: "Any remedy at law or equity", favorability: "balanced" }], defaultPosition: "automatic" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — ONE-WAY NDA:
Unilateral NDA where only the Disclosing Party shares confidential information.
TARGET: 3-6 pages. All obligations flow to the Receiving Party only.`,
};

// ──────────────────────────────────────────────
// DATA PROCESSING AGREEMENT
// ──────────────────────────────────────────────

const DATA_PROCESSING_CONFIG: AgreementConfig = {
  id: "data-processing-agreement",
  partyLabels: { partyALabel: "Data Controller (Your Organization)", partyAPlaceholder: "YourApp Inc.", partyBLabel: "Data Processor (Service Provider)", partyBPlaceholder: "Cloud Services Corp." },
  estimatedGenerationTime: 35,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "dataTypes", "processingPurposes"],
  wizardSteps: ["plat-privacy", "plat-terms"],
  clausePositions: [
    { id: "processingInstructionsPosition", label: "Processing Instructions", description: "How tightly does the controller control what the processor does with personal information?", options: [{ id: "controller-strict", label: "Documented Instructions Only", description: "Processor acts only on documented written instructions — no discretion", favorability: "client" }, { id: "balanced", label: "Documented Instructions with Reasonable Discretion", description: "Follows instructions but may exercise discretion for routine operations", favorability: "balanced" }, { id: "processor-flexible", label: "General Purpose Authorization", description: "Authorized for described purposes with discretion on methods", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "subProcessorPosition", label: "Sub-Processor Approval", description: "How much control do you have over which third parties handle your data downstream?", options: [{ id: "prior-consent", label: "Prior Written Consent Required", description: "Must obtain consent before engaging any sub-processor", favorability: "client" }, { id: "notice-objection", label: "30-Day Notice with Objection Right", description: "30 days notice; controller may object on reasonable grounds", favorability: "balanced" }, { id: "general-auth", label: "General Authorization", description: "General authorization; processor maintains published list", favorability: "counter-party" }], defaultPosition: "notice-objection" },
    { id: "breachNotificationPosition", label: "Breach Notification Timeline", description: "How quickly must the processor notify you of a data breach?", options: [{ id: "fastest", label: "Within 24 Hours", description: "Maximum response time for the controller under PIPEDA", favorability: "client" }, { id: "standard", label: "72 Hours (PIPEDA-Aligned)", description: "Aligned with PIPEDA s.10.1 reporting", favorability: "balanced" }, { id: "flexible", label: "As Soon as Reasonably Practicable", description: "After initial investigation for meaningful information", favorability: "counter-party" }], defaultPosition: "standard" },
    { id: "crossBorderTransferPosition", label: "Cross-Border Data Transfers", description: "Can personal information be stored outside Canada?", options: [{ id: "canada-only", label: "Canada-Only Data Residency", description: "Stored and processed exclusively in Canada", favorability: "client" }, { id: "with-safeguards", label: "Transfers with Contractual Safeguards", description: "Permitted with safeguards per PIPEDA Principle 4.1.3", favorability: "balanced" }, { id: "permitted", label: "Transfers Permitted with Notice", description: "International transfers with notice and reasonable security", favorability: "counter-party" }], defaultPosition: "with-safeguards" },
    { id: "auditRightsPosition", label: "Audit Rights", description: "How can you verify the processor is protecting your data?", options: [{ id: "broad-audit", label: "On-Site Audit + SOC 2", description: "Annual on-site audit plus SOC 2 Type II and pen test results", favorability: "client" }, { id: "report-based", label: "Annual SOC 2 Report", description: "SOC 2 Type II report — no on-site audit", favorability: "balanced" }, { id: "self-certification", label: "Self-Certification", description: "Annual self-certification of compliance", favorability: "counter-party" }], defaultPosition: "report-based" },
    { id: "dataReturnDeletionPosition", label: "Data Return & Deletion on Termination", description: "What happens to personal information when the agreement ends?", options: [{ id: "strict", label: "Return + Certified Deletion Within 30 Days", description: "Return all data; certify deletion within 30 days with written confirmation", favorability: "client" }, { id: "balanced", label: "60-Day Export Window Then Deletion", description: "60 days to export; deletion within 30 days after; may retain legal-required copies", favorability: "balanced" }, { id: "flexible", label: "Deletion Per Standard Schedule", description: "Deletes per its standard schedule; provides timeline on request", favorability: "counter-party" }], defaultPosition: "balanced" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — DATA PROCESSING AGREEMENT (DPA):
PIPEDA-compliant DPA defining controller-processor relationship.
NOT a privacy policy or commercial agreement. Strictly data governance.
DO NOT include SLA commitments, franchise fees, or service levels.
LEGAL FRAMEWORK: PIPEDA Principle 4.1.3, s.10.1, Quebec Law 25, Bill C-27 (CPPA).
MANDATORY: Controller/processor roles, processing scope, security, sub-processors, breach notification, cross-border, audit, data return/deletion.`,
};

// ──────────────────────────────────────────────
// COOKIE POLICY
// ──────────────────────────────────────────────

const COOKIE_POLICY_CONFIG: AgreementConfig = {
  id: "cookie-policy",
  partyLabels: { partyALabel: "Website Operator", partyAPlaceholder: "YourApp Inc.", partyBLabel: "Website Visitors (as a class)", partyBPlaceholder: "Visitors and users" },
  estimatedGenerationTime: 10,
  requiredFields: ["partyAName", "platformUrl"],
  wizardSteps: ["plat-privacy"],
  clausePositions: [
    { id: "consentMechanismPosition", label: "Cookie Consent Mechanism", description: "How do visitors consent to cookies on their devices?", options: [{ id: "implied", label: "Implied Consent (Banner Notice)", description: "Banner informs; continued browsing implies consent. CASL/PIPEDA compliant but may not satisfy GDPR.", favorability: "client" }, { id: "opt-out", label: "Opt-Out Model (Default On, Easy Off)", description: "Non-essential cookies active by default; visitors can disable via preference center. Standard Canadian approach.", favorability: "balanced" }, { id: "opt-in", label: "Opt-In Model (Granular Consent)", description: "Only necessary cookies by default; all others require affirmative opt-in. GDPR-grade.", favorability: "counter-party" }], defaultPosition: "opt-out" },
    { id: "cookieCategoriesPosition", label: "Cookie Categories", description: "How are your cookies organized and explained?", options: [{ id: "simple", label: "Two Categories (Necessary + Non-Necessary)", description: "Simple split — easiest for visitors", favorability: "balanced" }, { id: "standard", label: "Four Categories (Necessary, Functional, Analytics, Marketing)", description: "Industry-standard with meaningful choices", favorability: "balanced" }, { id: "granular", label: "Per-Cookie Disclosure", description: "Each cookie listed with name, provider, purpose, type, expiration", favorability: "counter-party" }], defaultPosition: "standard" },
    { id: "retentionPosition", label: "Cookie Retention Periods", description: "How long do cookies remain on visitors' devices?", options: [{ id: "extended", label: "Up to 24 Months", description: "Maximum tracking window", favorability: "client" }, { id: "standard", label: "Session + 12 Months Max", description: "Session cookies expire on close; persistent max 12 months", favorability: "balanced" }, { id: "minimal", label: "Session + 90 Days Max", description: "Minimal tracking footprint", favorability: "counter-party" }], defaultPosition: "standard" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — COOKIE POLICY:
Simple transparency document. 2-4 pages. Plain language.
DO NOT include commercial terms, liability, payment, SLA, or IP clauses.
LEGAL: CASL s.8, PIPEDA Principle 4.3. If EU visitors: GDPR Art. 5(3).
SECTIONS: What cookies are, categories used, manage/disable, third-party cookies, retention, contact, last updated.`,
};

// ──────────────────────────────────────────────
// SAAS SUBSCRIPTION AGREEMENT
// ──────────────────────────────────────────────

const SAAS_SUBSCRIPTION_CONFIG: AgreementConfig = {
  id: "saas-subscription",
  partyLabels: { partyALabel: "SaaS Provider", partyAPlaceholder: "CloudApp Inc.", partyBLabel: "Customer (Subscriber)", partyBPlaceholder: "Business Customer Corp." },
  estimatedGenerationTime: 40,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "serviceDescription", "subscriptionFee", "billingCycle"],
  wizardSteps: ["sub-service", "sub-billing", "sub-clause", "sub-data"],
  clausePositions: [
    { id: "dataOwnershipPosition", label: "Customer Data Ownership", description: "Who owns the data your customers put into your platform? This is the single most important question for SaaS customers evaluating vendor lock-in risk.", options: [{ id: "provider-retains", label: "Provider Retains Broad Data Rights", description: "Customer owns raw data; provider retains rights to aggregate and anonymize for analytics", favorability: "client" }, { id: "balanced", label: "Customer Owns All; Provider Uses Anonymized Only", description: "Customer owns all input data. Provider uses anonymized, aggregated data for service improvement only.", favorability: "balanced" }, { id: "customer-owns", label: "Customer Owns Everything + Full Portability", description: "Customer owns all data including derived insights. Full export anytime. Certified deletion on termination.", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "uptimeCommitmentPosition", label: "Uptime Commitment", description: "If your platform goes down for 2 hours, does your customer get a credit? This determines the answer.", options: [{ id: "best-efforts", label: "Best Efforts (No SLA)", description: "Targets availability but no binding commitment — appropriate for early-stage products", favorability: "client" }, { id: "standard-sla", label: "99.9% Uptime with Service Credits", description: "99.9% monthly (~43 min downtime/month). Credits: 10% for 99.0-99.9%, 25% below 99.0%. Industry standard.", favorability: "balanced" }, { id: "premium-sla", label: "99.95%+ with Credits and Termination Right", description: "99.95% with aggressive credits. Customer may terminate if breached 3 consecutive months.", favorability: "counter-party" }], defaultPosition: "standard-sla" },
    { id: "autoRenewalPosition", label: "Auto-Renewal & Cancellation", description: "How does the subscription renew and how can the customer cancel?", options: [{ id: "auto-renew-lock", label: "Auto-Renew, Cancel at Term End Only", description: "Auto-renews unless 60 days notice. No early termination.", favorability: "client" }, { id: "auto-renew-flex", label: "Auto-Renew with 30-Day Opt-Out + Pro-Rata Refund", description: "Cancel anytime with 30 days notice and pro-rata refund. Reminder per CPA requirements.", favorability: "balanced" }, { id: "no-auto-renew", label: "No Auto-Renewal (Affirmative Opt-In)", description: "Expires unless customer renews. No automatic charges.", favorability: "counter-party" }], defaultPosition: "auto-renew-flex" },
    { id: "liabilityCapPosition", label: "Liability Cap", description: "What is the maximum either party can owe the other?", options: [{ id: "low-cap", label: "12 Months' Fees", description: "Cap at fees paid in prior 12 months. Consequential damages excluded.", favorability: "client" }, { id: "medium-cap", label: "2x Annual Fees with Carve-Outs", description: "General cap at 2x. Elevated for data breach and IP. Uncapped for fraud.", favorability: "balanced" }, { id: "high-cap", label: "Total Contract Value, Uncapped for Data Breach", description: "Cap at total value. Uncapped for PI data breaches.", favorability: "counter-party" }], defaultPosition: "medium-cap" },
    { id: "terminationAssistancePosition", label: "Termination & Data Transition", description: "What happens to customer data when the subscription ends?", options: [{ id: "minimal", label: "30-Day Self-Serve Export", description: "30 days via platform tools. Then deleted.", favorability: "client" }, { id: "standard", label: "60-Day Export + Certified Deletion", description: "60 days in standard formats. Certified deletion in 15 business days.", favorability: "balanced" }, { id: "comprehensive", label: "90-Day Transition + Migration Support", description: "90-day transition with migration assistance and API access.", favorability: "counter-party" }], defaultPosition: "standard" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — SaaS SUBSCRIPTION AGREEMENT:
Full commercial SaaS relationship: billing, cancellation, data ownership, liability.
DISTINCT FROM SAAS_SLA_CONFIG (uptime/credits focus).
LEGAL: Ontario CPA s.43 auto-renewal, CASL, PIPEDA, Uber v. Heller, Interest Act s.4.`,
};

// ──────────────────────────────────────────────
// CONTENT LICENSE (Creator)
// ──────────────────────────────────────────────

const CONTENT_LICENSE_CONFIG: AgreementConfig = {
  id: "content-license",
  partyLabels: { partyALabel: "Licensee (Brand / Publisher)", partyAPlaceholder: "MediaBrand Inc.", partyBLabel: "Licensor (Content Creator)", partyBPlaceholder: "Jane Creator / Creative Studio" },
  estimatedGenerationTime: 25,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "contentDescription", "licenseFee"],
  wizardSteps: ["inf-rights", "inf-terms"],
  clausePositions: [
    { id: "licenseExclusivityPosition", label: "License Exclusivity", description: "Can you also license this content to other brands?", options: [{ id: "exclusive", label: "Exclusive License", description: "Only the licensee can use the content during the term", favorability: "client" }, { id: "semi-exclusive", label: "Semi-Exclusive (You Keep Portfolio Use)", description: "Licensee has exclusive commercial use; you keep portfolio and self-promotion rights", favorability: "balanced" }, { id: "non-exclusive", label: "Non-Exclusive License", description: "You can license the same content to multiple brands", favorability: "counter-party" }], defaultPosition: "semi-exclusive" },
    { id: "licenseDurationPosition", label: "License Duration", description: "How long can the licensee use your content?", options: [{ id: "perpetual", label: "Perpetual License", description: "Forever — one-time payment", favorability: "client" }, { id: "term", label: "Fixed Term (12 Months, Renewable)", description: "12 months with renewal option — flexibility for both sides", favorability: "balanced" }, { id: "campaign", label: "Campaign-Specific", description: "Tied to a specific campaign — you regain full rights when it ends", favorability: "counter-party" }], defaultPosition: "term" },
    { id: "modificationRightsPosition", label: "Content Modification Rights", description: "Can the licensee edit, crop, or remix your work?", options: [{ id: "full-modification", label: "Full Modification + Derivatives", description: "Edit, crop, overlay, derivatives without approval", favorability: "client" }, { id: "limited-modification", label: "Minor Edits Only", description: "Minor formatting OK; substantive edits need approval", favorability: "balanced" }, { id: "no-modification", label: "No Modifications (Use As-Is)", description: "Content used exactly as delivered — moral rights preserved", favorability: "counter-party" }], defaultPosition: "limited-modification" },
    { id: "territoryPosition", label: "Territory", description: "Where can the licensee use your content?", options: [{ id: "worldwide", label: "Worldwide", description: "No geographic restriction", favorability: "client" }, { id: "north-america", label: "North America (Canada + US)", description: "You keep rights for other markets", favorability: "balanced" }, { id: "canada-only", label: "Canada Only", description: "You retain all other territories", favorability: "counter-party" }], defaultPosition: "north-america" },
    { id: "attributionPosition", label: "Creator Attribution", description: "Do you get credited when your content is used?", options: [{ id: "no-attribution", label: "No Attribution Required", description: "No credit needed. Requires moral rights waiver under Copyright Act s.14.1.", favorability: "client" }, { id: "reasonable-attribution", label: "Attribution Where Reasonable", description: "Credited where standard (photo/video credits) but not every crop or post", favorability: "balanced" }, { id: "mandatory-attribution", label: "Mandatory Attribution in All Uses", description: "Your name/handle must appear prominently in every use", favorability: "counter-party" }], defaultPosition: "reasonable-attribution" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — CONTENT LICENSE:
Creator licenses work to brands/publishers. Use creator-friendly language — no corporate jargon.
KEY IP LAW: Copyright Act s.13(1) creator is first owner; s.14.1 moral rights waived only, not assigned.
MANDATORY: Content description, license scope, modification rights, attribution, compensation, reps, termination, moral rights.`,
};

// ──────────────────────────────────────────────
// TALENT AGREEMENT (Creator)
// ──────────────────────────────────────────────

const TALENT_AGREEMENT_CONFIG: AgreementConfig = {
  id: "talent-agreement",
  partyLabels: { partyALabel: "Production Company / Brand", partyAPlaceholder: "MediaProd Inc.", partyBLabel: "Talent (Performer / On-Camera)", partyBPlaceholder: "Jane Talent" },
  estimatedGenerationTime: 30,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "projectDescription", "talentFee"],
  wizardSteps: ["inf-rights", "inf-terms"],
  clausePositions: [
    { id: "likenessRightsPosition", label: "Likeness & Image Rights", description: "How broadly can your face, voice, and image be used?", options: [{ id: "broad", label: "Broad Usage (All Media, Perpetual)", description: "All media in perpetuity — one-time buyout", favorability: "client" }, { id: "defined", label: "Defined Usage (Specific Media, 12 Months)", description: "Specific media for 12 months — additional uses require separate payment", favorability: "balanced" }, { id: "limited", label: "Project-Specific Only", description: "Only in the specific deliverables — no ads or promos without separate consent", favorability: "counter-party" }], defaultPosition: "defined" },
    { id: "exclusivityPosition", label: "Talent Exclusivity", description: "Can you work with competing brands during or after this project?", options: [{ id: "exclusive", label: "Category Exclusive (During + 6 Months)", description: "No competing brand work in same category during and 6 months after", favorability: "client" }, { id: "during-only", label: "Non-Compete During Project Only", description: "Avoid competing work only during active production", favorability: "balanced" }, { id: "none", label: "No Exclusivity", description: "Free to work with anyone anytime", favorability: "counter-party" }], defaultPosition: "during-only" },
    { id: "compensationStructurePosition", label: "Compensation", description: "How are you paid for your performance?", options: [{ id: "buyout", label: "Flat Buyout Fee", description: "One-time fee covers performance and all usage rights", favorability: "client" }, { id: "day-rate-plus", label: "Day Rate + Usage Fee", description: "Day rate plus separate usage fee based on distribution — industry standard", favorability: "balanced" }, { id: "performance-royalty", label: "Day Rate + Performance Royalties", description: "Day rate plus royalties based on content performance", favorability: "counter-party" }], defaultPosition: "day-rate-plus" },
    { id: "aiUsagePosition", label: "AI & Digital Double Rights", description: "Can AI-generated versions of your likeness or voice be created?", options: [{ id: "permitted", label: "AI Usage Permitted with Notice", description: "AI content using your likeness allowed with 30 days notice", favorability: "client" }, { id: "consent-required", label: "Prior Written Consent for Each Use", description: "Separate consent and additional compensation per AI use", favorability: "balanced" }, { id: "prohibited", label: "AI Usage Strictly Prohibited", description: "No AI-generated, synthetic, or manipulated versions — full deepfake protection", favorability: "counter-party" }], defaultPosition: "consent-required" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — TALENT AGREEMENT:
Talent/performer agreement. Plain, talent-friendly language.
KEY: Copyright Act s.14.1 moral rights, common law personality rights, ACTRA/UDA if union, AI/digital doubles.
MANDATORY: Project description, schedule, compensation, likeness rights, exclusivity, AI restrictions, wardrobe/travel, cancellation.`,
};

// ──────────────────────────────────────────────
// PRODUCTION AGREEMENT (Creator)
// ──────────────────────────────────────────────

const PRODUCTION_AGREEMENT_CONFIG: AgreementConfig = {
  id: "production-agreement",
  partyLabels: { partyALabel: "Client (Commissioning Party)", partyAPlaceholder: "Brand Corp. / Agency Inc.", partyBLabel: "Production Company", partyBPlaceholder: "Creative Productions Ltd." },
  estimatedGenerationTime: 40,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "projectDescription", "productionBudget"],
  wizardSteps: ["inf-campaign", "inf-deliverables", "inf-rights", "inf-terms"],
  clausePositions: [
    { id: "ipOwnershipPosition", label: "Ownership of Produced Content", description: "Who owns the final content and raw materials?", options: [{ id: "client-owns", label: "Client Owns Everything (Work-for-Hire)", description: "Client owns all content, footage, and files upon creation", favorability: "client" }, { id: "split", label: "Client Owns Finals; Producer Keeps Raw", description: "Client owns deliverables. Producer retains raw footage and project files with license to client.", favorability: "balanced" }, { id: "producer-owns", label: "Producer Retains IP; Client Gets License", description: "Producer retains all IP. Client gets defined license for agreed purposes.", favorability: "counter-party" }], defaultPosition: "split" },
    { id: "deliverySchedulePosition", label: "Delivery Schedule", description: "How is the timeline structured and what happens if deadlines are missed?", options: [{ id: "strict", label: "Firm Deadlines with Liquidated Damages", description: "All dates firm. Late delivery triggers 2%/day damages capped at 20%.", favorability: "client" }, { id: "milestone-based", label: "Milestone-Based with Extensions", description: "Key milestones with target dates. Extensions for force majeure and client delays.", favorability: "balanced" }, { id: "flexible", label: "Best Efforts with Client Gates", description: "Best efforts on dates. Client approval gates at each milestone. No penalties.", favorability: "counter-party" }], defaultPosition: "milestone-based" },
    { id: "approvalProcessPosition", label: "Client Approval Process", description: "How many rounds of feedback and revisions?", options: [{ id: "unlimited", label: "Unlimited Revisions", description: "Client requests unlimited revisions — producer absorbs costs", favorability: "client" }, { id: "defined-rounds", label: "2 Rounds (Extra Billable)", description: "Two rounds included. Additional billed hourly. Deemed approved if no response in 5 days.", favorability: "balanced" }, { id: "limited", label: "1 Round Per Milestone", description: "One round included. Extras are change orders.", favorability: "counter-party" }], defaultPosition: "defined-rounds" },
    { id: "budgetOverrunPosition", label: "Budget Overrun Handling", description: "What if production costs exceed the budget?", options: [{ id: "fixed-budget", label: "Fixed Budget (Producer Bears Overruns)", description: "Budget fixed. Producer absorbs overruns unless client-caused.", favorability: "client" }, { id: "contingency", label: "Budget + 10% Contingency", description: "10% contingency for unforeseen costs. Beyond that needs change order.", favorability: "balanced" }, { id: "cost-plus", label: "Cost-Plus Model", description: "Actual costs plus 15-20% markup. Maximum creative flexibility.", favorability: "counter-party" }], defaultPosition: "contingency" },
    { id: "insurancePosition", label: "Production Insurance", description: "What insurance must the production company carry?", options: [{ id: "comprehensive", label: "Full Production Package", description: "CGL ($5M), E&O ($2M), equipment, cast, workers' comp. Client as additional insured.", favorability: "client" }, { id: "standard", label: "Standard Production Insurance", description: "CGL ($2M), E&O ($1M), equipment, workers' comp.", favorability: "balanced" }, { id: "basic", label: "Basic CGL + Workers' Comp", description: "CGL ($1M) and statutory workers' comp only", favorability: "counter-party" }], defaultPosition: "standard" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — PRODUCTION AGREEMENT:
Content production for video, audio, photo, or multimedia.
NOT a franchise agreement — no franchise territory or fees.
KEY: Copyright Act s.13(1), s.14.1 moral rights, ACTRA/UDA if union talent.
MANDATORY: Scope, schedule, budget, approvals, IP ownership, talent, insurance, force majeure, confidentiality, termination.`,
};

// ──────────────────────────────────────────────
// MUSIC SYNC LICENSE (Creator)
// ──────────────────────────────────────────────

const MUSIC_SYNC_CONFIG: AgreementConfig = {
  id: "music-sync",
  partyLabels: { partyALabel: "Licensee (Production / Brand)", partyAPlaceholder: "FilmCo Productions Inc.", partyBLabel: "Licensor (Rights Holder / Artist)", partyBPlaceholder: "Jane Songwriter / Music Publisher" },
  estimatedGenerationTime: 25,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "songTitle", "projectDescription"],
  wizardSteps: ["inf-rights", "inf-terms"],
  clausePositions: [
    { id: "syncRightsPosition", label: "Sync Rights Scope", description: "What right is being granted to sync the music with visual content?", options: [{ id: "broad-sync", label: "Broad Sync (All Media, Worldwide)", description: "All media types worldwide — maximum flexibility", favorability: "client" }, { id: "defined-sync", label: "Defined Media & Territory", description: "Specific media and territories — standard approach", favorability: "balanced" }, { id: "narrow-sync", label: "Single Project, Single Territory", description: "One project, one territory — rights holder keeps maximum control", favorability: "counter-party" }], defaultPosition: "defined-sync" },
    { id: "masterUsePosition", label: "Master Use Rights", description: "Using the original recording or re-recording? You need sync rights for the composition AND master use for the recording.", options: [{ id: "master-included", label: "Master Use Included", description: "Both sync and master use in this agreement", favorability: "client" }, { id: "re-record-permitted", label: "Sync Only (Re-Record Permitted)", description: "Composition sync only — re-record with your own artists", favorability: "balanced" }, { id: "sync-only", label: "Sync Only (Master Separate)", description: "Composition only — master use from label/artist separately", favorability: "counter-party" }], defaultPosition: "master-included" },
    { id: "territoryPosition", label: "Territory", description: "Where can the synced content be distributed?", options: [{ id: "worldwide", label: "Worldwide", description: "No restriction", favorability: "client" }, { id: "north-america", label: "North America", description: "Canada and US", favorability: "balanced" }, { id: "canada-only", label: "Canada Only", description: "Preserves international licensing value", favorability: "counter-party" }], defaultPosition: "north-america" },
    { id: "durationPosition", label: "License Duration", description: "How long can the music stay in your content?", options: [{ id: "perpetual", label: "Perpetual", description: "Stays permanently — standard for film", favorability: "client" }, { id: "fixed-term", label: "Fixed Term (1-3 Years)", description: "Standard for advertising — renew or remove", favorability: "balanced" }, { id: "campaign", label: "Campaign-Specific", description: "Removed after campaign ends", favorability: "counter-party" }], defaultPosition: "fixed-term" },
    { id: "feeStructurePosition", label: "Fee Structure", description: "How is the sync fee calculated?", options: [{ id: "flat-fee", label: "Flat One-Time Fee", description: "Single upfront — predictable, no ongoing royalties", favorability: "client" }, { id: "upfront-plus-royalty", label: "Upfront + Backend Royalty", description: "Upfront fee plus revenue share or per-stream royalty", favorability: "balanced" }, { id: "mfn", label: "Most Favored Nations (MFN)", description: "Fee matches highest paid to any other rights holder on the project", favorability: "counter-party" }], defaultPosition: "flat-fee" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — MUSIC SYNC LICENSE:
Sync license for combining music with visual content.
NOT a general IP assignment — only sync-specific terms.
KEY: Copyright Act s.3(1)(d) sync right. Two rights: composition sync + master use. SOCAN for performance.
MANDATORY: Song ID, sync scope, master use, territory, duration, fee, credit, reps, termination, SOCAN/CMRRA.`,
};

// ──────────────────────────────────────────────
// DISTRIBUTION AGREEMENT (Creator)
// ──────────────────────────────────────────────

const DISTRIBUTION_CONFIG: AgreementConfig = {
  id: "distribution-agreement",
  partyLabels: { partyALabel: "Distributor / Platform", partyAPlaceholder: "DistributionCo Inc.", partyBLabel: "Content Owner / Creator", partyBPlaceholder: "Creative Studio Ltd. / Jane Creator" },
  estimatedGenerationTime: 30,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "contentDescription", "distributionChannels"],
  wizardSteps: ["inf-rights", "inf-terms"],
  clausePositions: [
    { id: "distributionExclusivityPosition", label: "Distribution Exclusivity", description: "Is the distributor the only one who can get your content to market?", options: [{ id: "exclusive", label: "Exclusive Distribution", description: "Sole distribution rights — no self-distribution or others during term", favorability: "client" }, { id: "semi-exclusive", label: "Semi-Exclusive (Keep Direct Sales)", description: "Distributor handles third-party channels; you keep direct-to-consumer sales", favorability: "balanced" }, { id: "non-exclusive", label: "Non-Exclusive", description: "Multiple distributors — they compete on service, not lock-in", favorability: "counter-party" }], defaultPosition: "semi-exclusive" },
    { id: "revenueSharePosition", label: "Revenue Share", description: "How is the money split?", options: [{ id: "distributor-heavy", label: "70/30 (Distributor / Creator)", description: "Typical when distributor provides significant marketing", favorability: "client" }, { id: "even-split", label: "50/50 Split", description: "Equal — fair when both contribute meaningfully", favorability: "balanced" }, { id: "creator-heavy", label: "80/20 (Creator / Distributor)", description: "Standard for digital distribution where creator drives audience", favorability: "counter-party" }], defaultPosition: "even-split" },
    { id: "termDurationPosition", label: "Agreement Duration", description: "How long are you locked in?", options: [{ id: "long-term", label: "3 Years", description: "Gives distributor time to build your market", favorability: "client" }, { id: "standard", label: "1 Year (Renewable)", description: "Annual evaluation", favorability: "balanced" }, { id: "short", label: "6 Months (Trial)", description: "Test before committing", favorability: "counter-party" }], defaultPosition: "standard" },
    { id: "reportingPaymentPosition", label: "Reporting & Payment", description: "How often do you get paid and see numbers?", options: [{ id: "quarterly", label: "Quarterly", description: "Every 3 months — slower but standard", favorability: "client" }, { id: "monthly", label: "Monthly", description: "Monthly reports, payment within 30 days", favorability: "balanced" }, { id: "real-time", label: "Real-Time Dashboard + Monthly Payment", description: "Live analytics with monthly payment", favorability: "counter-party" }], defaultPosition: "monthly" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — DISTRIBUTION AGREEMENT:
Content distribution between creator and distributor. Creator-friendly language.
MANDATORY: Content specs, channels, territory, exclusivity, revenue share, reporting, audit, marketing, term, rights reversion, reps, liability.`,
};

// ──────────────────────────────────────────────
// TECHNOLOGY LICENSE
// ──────────────────────────────────────────────

const TECHNOLOGY_LICENSE_CONFIG: AgreementConfig = {
  id: "technology-license",
  partyLabels: { partyALabel: "Licensor (Technology Owner)", partyAPlaceholder: "TechIP Inc.", partyBLabel: "Licensee", partyBPlaceholder: "Implementing Corp." },
  estimatedGenerationTime: 45,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "technologyDescription", "licenseFee"],
  wizardSteps: ["com-service", "com-data", "com-liability"],
  clausePositions: [
    { id: "licenseGrantPosition", label: "License Grant Scope", description: "What rights does the licensee get?", options: [{ id: "narrow", label: "Limited Internal Use Only", description: "Internal only — no sublicensing or product incorporation", favorability: "client" }, { id: "standard", label: "Internal Use + Integration Rights", description: "Internal use plus integration into licensee's products — standard", favorability: "balanced" }, { id: "broad", label: "Broad Commercial Use + Sublicensing", description: "Full commercial use with sublicensing", favorability: "counter-party" }], defaultPosition: "standard" },
    { id: "royaltyStructurePosition", label: "Royalty Structure", description: "How does the licensee pay?", options: [{ id: "upfront", label: "Lump Sum (Paid-Up)", description: "One-time payment, no ongoing royalties", favorability: "client" }, { id: "running-royalty", label: "Running Royalty", description: "Ongoing based on units or revenue", favorability: "balanced" }, { id: "minimum-guarantee", label: "Minimum Guarantee + Royalty", description: "Annual minimum plus per-unit royalty", favorability: "counter-party" }], defaultPosition: "running-royalty" },
    { id: "improvementOwnershipPosition", label: "Improvements", description: "Who owns improvements the licensee makes?", options: [{ id: "licensor-owns", label: "Licensor Owns All", description: "Improvements vest in licensor with license-back", favorability: "client" }, { id: "shared", label: "Joint Ownership", description: "Either party may exploit", favorability: "balanced" }, { id: "licensee-owns", label: "Licensee Owns Its Improvements", description: "Licensee owns what it creates on top", favorability: "counter-party" }], defaultPosition: "shared" },
    { id: "territoryPosition", label: "Territory", description: "Where can the licensee commercialize?", options: [{ id: "worldwide", label: "Worldwide", description: "No restriction", favorability: "counter-party" }, { id: "north-america", label: "North America", description: "Canada and US", favorability: "balanced" }, { id: "canada-only", label: "Canada Only", description: "Licensor keeps international flexibility", favorability: "client" }], defaultPosition: "north-america" },
    { id: "auditRightsPosition", label: "Royalty Audit Rights", description: "Can the licensor verify royalty payments?", options: [{ id: "broad-audit", label: "Annual Audit + Records", description: "Annual with 30 days notice. 5-year retention. Underpayment >5% = licensee pays costs.", favorability: "client" }, { id: "standard", label: "Audit on Cause", description: "On reasonable grounds. Auditing party bears cost unless >10% discrepancy.", favorability: "balanced" }, { id: "limited", label: "Self-Reporting", description: "Annual self-certified reports. No on-site without breach.", favorability: "counter-party" }], defaultPosition: "broad-audit" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — TECHNOLOGY LICENSE:
Patent, trade secret, or know-how licensing. Different from software license (packaged product).
KEY: Patent Act, Competition Act s.32, Copyright Act for software components.
MANDATORY: Tech description, license grant, royalty, tech assistance, improvements, IP indemnification, confidentiality, term, audit, export controls.`,
};

// ──────────────────────────────────────────────
// FRANCHISE AGREEMENT
// ──────────────────────────────────────────────

const FRANCHISE_CONFIG: AgreementConfig = {
  id: "franchise-agreement",
  partyLabels: { partyALabel: "Franchisor", partyAPlaceholder: "FranchiseBrand Inc.", partyBLabel: "Franchisee", partyBPlaceholder: "Local Operator Inc. / Jane Franchisee" },
  estimatedGenerationTime: 60,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "franchiseSystem", "territory", "initialFranchiseFee"],
  wizardSteps: ["com-service", "com-liability"],
  clausePositions: [
    { id: "territoryPosition", label: "Territory & Exclusivity", description: "Does the franchisee get an exclusive territory?", options: [{ id: "non-exclusive", label: "Non-Exclusive Territory", description: "Defined area but franchisor can open competing locations", favorability: "client" }, { id: "protected", label: "Protected Territory", description: "No other franchises in territory. Online/wholesale channels retained by franchisor.", favorability: "balanced" }, { id: "exclusive", label: "Exclusive Territory", description: "Sole exclusive right — no competing locations or channels", favorability: "counter-party" }], defaultPosition: "protected" },
    { id: "feeStructurePosition", label: "Fee Structure", description: "What ongoing fees does the franchisee pay?", options: [{ id: "high-royalty", label: "8% Royalty + 3% Marketing", description: "Higher franchisor revenue", favorability: "client" }, { id: "standard", label: "5% Royalty + 2% Marketing", description: "Industry standard", favorability: "balanced" }, { id: "low-royalty", label: "3% Royalty + 1% Marketing", description: "Lower costs for franchisee", favorability: "counter-party" }], defaultPosition: "standard" },
    { id: "termRenewalPosition", label: "Term & Renewal", description: "How long and can the franchisee renew?", options: [{ id: "short-no-guarantee", label: "5 Years, Renewal at Franchisor Discretion", description: "Short term. Discretionary renewal.", favorability: "client" }, { id: "standard-renewal", label: "10 Years, Conditional Renewal Right", description: "Renewal if performance met. Then-current terms.", favorability: "balanced" }, { id: "long-guaranteed", label: "10 Years, Automatic Renewal", description: "Auto-renewal for 5-year terms unless 12 months notice", favorability: "counter-party" }], defaultPosition: "standard-renewal" },
    { id: "transferRestrictionPosition", label: "Transfer Restrictions", description: "Can the franchisee sell or transfer?", options: [{ id: "restricted", label: "Approval + ROFR + Fee", description: "Franchisor approval, right of first refusal, transfer fee", favorability: "client" }, { id: "standard", label: "Approval (Not Unreasonably Withheld)", description: "Cannot unreasonably refuse qualified transferees. ROFR.", favorability: "balanced" }, { id: "flexible", label: "Notice + Qualification Only", description: "Any qualified transferee with 60 days notice", favorability: "counter-party" }], defaultPosition: "standard" },
    { id: "disclosurePosition", label: "Pre-Sale Disclosure", description: "How the franchisor complies with mandatory franchise disclosure laws. Under the Arthur Wishart Act (Ontario), disclosure must be delivered at least 14 days before signing or paying anything.", options: [{ id: "minimum-compliance", label: "Statutory Minimum", description: "Only legally required disclosures", favorability: "client" }, { id: "enhanced-disclosure", label: "Enhanced Disclosure", description: "Statutory plus unit economics, system data, satisfaction surveys", favorability: "balanced" }, { id: "full-transparency", label: "Full Transparency", description: "Comprehensive including audited unit financials and territory analysis", favorability: "counter-party" }], defaultPosition: "enhanced-disclosure" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — FRANCHISE AGREEMENT:
CRITICAL — ARTHUR WISHART ACT (Ontario), 2000, S.O. 2000, c. 3:
1. Disclosure document required 14 days before signing/paying (s.5(1))
2. Contents per s.5(3) and O. Reg. 581/00
3. Rescission: 60 days if no disclosure; 2 years if materially deficient (s.6)
4. Duty of fair dealing (s.3) — cannot be contracted out
5. No waiver of statutory rights (s.11)
OTHER: Alberta F-23, BC SBC 2015 c.35, Manitoba F156, NB F-23.5, PEI F-14.1.
CASE LAW: Dig This Garden (2005 ONCA), Raibex v. ASWR (2018 ONCA), Mendoza v. Active Tire (2017 ONCA).
MANDATORY: Grant, territory, term, fees, marketing fund, training, standards, suppliers, IP, insurance, transfer, termination, post-term non-compete, disclosure.`,
};

// ──────────────────────────────────────────────
// ACCEPTABLE USE POLICY
// ──────────────────────────────────────────────

const ACCEPTABLE_USE_CONFIG: AgreementConfig = {
  id: "acceptable-use-policy",
  partyLabels: { partyALabel: "Platform Operator", partyAPlaceholder: "YourApp Inc.", partyBLabel: "Users (as a class)", partyBPlaceholder: "Platform users" },
  estimatedGenerationTime: 15,
  requiredFields: ["partyAName", "platformUrl", "platformDescription"],
  wizardSteps: ["plat-terms"],
  clausePositions: [
    { id: "prohibitedConductPosition", label: "Prohibited Conduct Scope", description: "How detailed is the list of things users cannot do?", options: [{ id: "broad", label: "Comprehensive List", description: "Detailed: illegal content, harassment, spam, scraping, reverse engineering, catch-all", favorability: "client" }, { id: "standard", label: "Standard Prohibited Conduct", description: "Essentials: illegal activity, harassment, spam, malware, unauthorized access", favorability: "balanced" }, { id: "minimal", label: "Minimal (Illegal Activity Only)", description: "Only Canadian law violations — maximum user freedom", favorability: "counter-party" }], defaultPosition: "standard" },
    { id: "enforcementPosition", label: "Enforcement", description: "What happens when someone breaks the rules?", options: [{ id: "strict", label: "Zero Tolerance", description: "Any violation may trigger immediate suspension without warning", favorability: "client" }, { id: "graduated", label: "Graduated (Warning > Suspension > Ban)", description: "Warning, then suspension, then ban. Severe violations skip steps.", favorability: "balanced" }, { id: "due-process", label: "Due Process (Notice + Response)", description: "Notice and 5 days to respond before action. Illegal content removed immediately.", favorability: "counter-party" }], defaultPosition: "graduated" },
    { id: "appealsPosition", label: "Appeals Process", description: "Can users challenge enforcement decisions?", options: [{ id: "no-appeal", label: "No Formal Appeal", description: "Decisions final. Support available but no guaranteed review.", favorability: "client" }, { id: "internal-appeal", label: "Internal Appeal Within 14 Days", description: "Written appeal, different reviewer, 10 business day response", favorability: "balanced" }, { id: "independent-review", label: "Independent Review", description: "Independent panel after internal appeal — strongest user protection", favorability: "counter-party" }], defaultPosition: "internal-appeal" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — ACCEPTABLE USE POLICY:
Simple behavioral policy. 3-6 pages. Plain language.
DO NOT include payment, privacy, liability, or SLA terms — those belong elsewhere.
SECTIONS: Prohibited conduct, content standards, enforcement, appeals, reporting, updates.`,
};

// ──────────────────────────────────────────────
// TERMS OF SERVICE
// ──────────────────────────────────────────────

const TERMS_OF_SERVICE_CONFIG: AgreementConfig = {
  id: "terms-of-service",
  partyLabels: { partyALabel: "Service Provider", partyAPlaceholder: "YourCompany Inc.", partyBLabel: "Users / Customers", partyBPlaceholder: "Service users" },
  estimatedGenerationTime: 30,
  requiredFields: ["partyAName", "jurisdiction", "serviceDescription", "platformUrl"],
  wizardSteps: ["plat-business", "plat-terms"],
  clausePositions: [
    { id: "liabilityPosition", label: "Liability Limitation", description: "How much liability does the service provider accept?", options: [{ id: "maximum-protection", label: "Maximum Limitation", description: "Cap at 12 months' fees; broad warranty disclaimer; consequential excluded", favorability: "client" }, { id: "balanced", label: "Reasonable with Carve-Outs", description: "Cap at fees; carve-outs for gross negligence, willful misconduct, data breach", favorability: "balanced" }, { id: "minimal-protection", label: "Minimal Limitation", description: "Higher exposure; only speculative and punitive excluded", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "terminationPosition", label: "Account Termination", description: "When can the provider terminate a user's account?", options: [{ id: "broad-discretion", label: "Provider Discretion + 30 Days Notice", description: "Terminate for any reason with notice, or immediately for violations", favorability: "client" }, { id: "cause-based", label: "For Cause + Wind-Down", description: "Material breach only (15-day cure) or illegal activity. 30-day data export.", favorability: "balanced" }, { id: "restricted", label: "Cause + Appeal + 60-Day Export", description: "Documented breach. 30-day cure. Appeal right. 60-day export.", favorability: "counter-party" }], defaultPosition: "cause-based" },
    { id: "disputeResolutionPosition", label: "Dispute Resolution", description: "How are disputes resolved?", options: [{ id: "arbitration", label: "Mandatory Arbitration", description: "Binding arbitration, class waiver. WARNING: Uber v. Heller risk for consumers.", favorability: "client" }, { id: "balanced", label: "Arbitration + Small Claims Carve-Out", description: "Arbitration >$35K; small claims below. Per Seidel v. TELUS.", favorability: "balanced" }, { id: "court", label: "Court Litigation", description: "Full court access. No arbitration. No class waiver.", favorability: "counter-party" }], defaultPosition: "balanced" },
    { id: "modificationPosition", label: "Terms Modification", description: "How can terms be updated?", options: [{ id: "unilateral", label: "15 Days Email Notice", description: "Modify with notice. Continued use = acceptance.", favorability: "client" }, { id: "notice-plus-opt-out", label: "30 Days + Opt-Out Right", description: "30 days for material changes. Terminate with refund if rejected.", favorability: "balanced" }, { id: "re-acceptance", label: "Re-Acceptance Required", description: "Material changes need affirmative acceptance.", favorability: "counter-party" }], defaultPosition: "notice-plus-opt-out" },
    { id: "governingLawPosition", label: "Governing Law", description: "Which province's laws govern?", options: [{ id: "provider-province", label: "Provider's Province", description: "Simplest. Douez v. Facebook risk for consumers.", favorability: "client" }, { id: "user-province", label: "User's Province", description: "Most enforceable per Douez v. Facebook", favorability: "balanced" }], defaultPosition: "provider-province" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — TERMS OF SERVICE:
Digital service ToS. 12-20 pages. Clear language.
KEY: Uber v. Heller unconscionability, Douez v. Facebook forum, Rudder v. Microsoft clickwrap, PIPEDA, CASL.
MANDATORY: Service, accounts, AUP, payment, IP, privacy ref, warranty, liability, disputes, termination, governing law, amendments.`,
};

// ──────────────────────────────────────────────
// LICENSING AGREEMENT (General IP)
// ──────────────────────────────────────────────

const LICENSING_AGREEMENT_CONFIG: AgreementConfig = {
  id: "licensing-agreement",
  partyLabels: { partyALabel: "Licensor (IP Owner)", partyAPlaceholder: "IP Holdings Inc.", partyBLabel: "Licensee", partyBPlaceholder: "Commercial User Corp." },
  estimatedGenerationTime: 35,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "ipDescription", "licenseScope"],
  wizardSteps: ["com-service", "com-liability"],
  clausePositions: [
    { id: "exclusivityPosition", label: "Exclusivity", description: "Is the licensee the only one who can use this IP?", options: [{ id: "exclusive", label: "Exclusive", description: "Only the licensee — even licensor cannot compete", favorability: "counter-party" }, { id: "sole", label: "Sole License", description: "No other licensees but licensor retains own use", favorability: "balanced" }, { id: "non-exclusive", label: "Non-Exclusive", description: "Licensor may license to others", favorability: "client" }], defaultPosition: "sole" },
    { id: "royaltyPosition", label: "Compensation", description: "How does the licensee pay?", options: [{ id: "lump-sum", label: "One-Time Lump Sum", description: "Single upfront payment — simplest", favorability: "client" }, { id: "royalty", label: "Running Royalty", description: "Ongoing payments based on units/revenue/usage", favorability: "balanced" }, { id: "hybrid", label: "Upfront + Royalty with Minimum", description: "Upfront plus ongoing with annual floor", favorability: "counter-party" }], defaultPosition: "royalty" },
    { id: "termPosition", label: "Duration", description: "How long does the license last?", options: [{ id: "perpetual", label: "Perpetual", description: "Indefinite — terminable for breach", favorability: "counter-party" }, { id: "fixed-term", label: "5 Years (Renewable)", description: "Periodic renegotiation checkpoints", favorability: "balanced" }, { id: "short-term", label: "1-2 Years", description: "Test viability first", favorability: "client" }], defaultPosition: "fixed-term" },
    { id: "qualityControlPosition", label: "Quality Control", description: "How much control does the licensor keep? Critical for trademarks — Trade-marks Act s.50 requires quality control or the mark may be invalidated.", options: [{ id: "strict", label: "Strict + Approval Rights", description: "Pre-approval for all uses. Detailed guidelines. Non-compliance = material breach.", favorability: "client" }, { id: "guidelines", label: "Guidelines + Periodic Review", description: "Published guidelines. Annual review. Good-faith compliance.", favorability: "balanced" }, { id: "minimal", label: "Minimal Oversight", description: "Reasonable commercial judgment. Annual audit.", favorability: "counter-party" }], defaultPosition: "guidelines" },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — LICENSING AGREEMENT:
General IP licensing for trademarks, copyrights, patents, or combinations.
CRITICAL: Trade-marks Act s.50 requires quality control for TM licenses — or mark may be invalidated.
MANDATORY: IP description, grant, compensation, quality control, reporting, enforcement, reps, indemnification, termination, survival.`,
};

// ──────────────────────────────────────────────
// INTERNSHIP / CO-OP AGREEMENT
// ──────────────────────────────────────────────

const INTERNSHIP_COOP_CONFIG: AgreementConfig = {
  id: "internship-coop",
  partyLabels: { partyALabel: "Host Organization (Employer)", partyAPlaceholder: "Acme Technologies Inc.", partyBLabel: "Intern / Co-op Student", partyBPlaceholder: "Jordan Lee" },
  estimatedGenerationTime: 20,
  requiredFields: ["partyAName", "partyBName", "jurisdiction", "startDate", "endDate", "educationalInstitution", "compensationType"],
  wizardSteps: ["emp-comp", "emp-clause", "emp-ip"],
  clausePositions: [
    {
      id: "compensationPosition",
      label: "Compensation Structure",
      description: "How is the intern compensated? In Canada, unpaid internships are only lawful for academic programs meeting strict ESA exemption criteria.",
      options: [
        { id: "minimum-wage", label: "Provincial Minimum Wage", description: "Hourly rate at applicable provincial minimum. Lowest cost but meets statutory floor. Must comply with ESA/Labour Standards Act.", favorability: "client" },
        { id: "competitive-stipend", label: "Competitive Stipend Above Minimum", description: "Hourly rate 15-25% above minimum wage. Attracts stronger candidates. May include transit or meal allowance.", favorability: "balanced" },
        { id: "market-rate", label: "Market-Rate Compensation + Benefits", description: "Comparable to junior full-time rate. Health/dental benefits. Performance bonus eligibility. Strongest retention.", favorability: "counter-party" },
      ],
      defaultPosition: "competitive-stipend",
    },
    {
      id: "learningObjectivesPosition",
      label: "Learning Objectives & Supervision",
      description: "How structured is the educational component? Critical for ESA internship exemptions — the placement must primarily benefit the student.",
      options: [
        { id: "minimal", label: "General Work Experience", description: "Intern participates in regular team work. Informal mentorship. No formal learning plan. Risk: may not qualify for ESA student exemption.", favorability: "client" },
        { id: "structured", label: "Structured Learning Plan with Mentor", description: "Written learning objectives. Assigned mentor. Monthly check-ins. Mid-term and final evaluations aligned with academic program.", favorability: "balanced" },
        { id: "comprehensive", label: "Comprehensive Development Program", description: "Detailed competency framework. Weekly 1:1 mentorship. Rotational exposure. Portfolio project. Academic supervisor coordination. Formal assessment rubric.", favorability: "counter-party" },
      ],
      defaultPosition: "structured",
    },
    {
      id: "ipAssignmentPosition",
      label: "Intellectual Property Assignment",
      description: "Who owns what the intern creates? Consider Copyright Act s.13(3) — employer owns work made in course of employment, but interns may not clearly be 'employees' under the Act.",
      options: [
        { id: "full-assignment", label: "Full IP Assignment to Employer", description: "All work product assigned. Moral rights waived per Copyright Act s.14.1. Pre-existing IP excluded. Broadest employer protection.", favorability: "client" },
        { id: "work-product-only", label: "Work Product Assignment; Portfolio Rights Retained", description: "Employer owns deliverables created in scope of duties. Intern retains right to use sanitized samples in academic portfolio. Moral rights waived for commercial use only.", favorability: "balanced" },
        { id: "shared-rights", label: "Shared Rights with Academic License", description: "Employer owns commercial rights. Intern retains academic and personal-use license. University retains research license if co-op program requires it.", favorability: "counter-party" },
      ],
      defaultPosition: "work-product-only",
    },
    {
      id: "termEarlyTerminationPosition",
      label: "Term & Early Termination",
      description: "What is the placement duration and how can either party end it early?",
      options: [
        { id: "employer-flexible", label: "At-Will with 1 Week Notice", description: "Either party terminates with 1 week written notice. No obligation to complete full term. ESA minimum notice applies if intern qualifies as employee.", favorability: "client" },
        { id: "balanced", label: "Fixed Term with 2 Weeks Notice + Academic Coordination", description: "Fixed term matching academic semester. Early termination with 2 weeks notice and notification to academic institution. Good-faith effort to complete placement.", favorability: "balanced" },
        { id: "intern-protected", label: "Guaranteed Term with Cause-Only Termination", description: "Full term guaranteed unless terminated for cause (misconduct, academic withdrawal). Employer pays out remaining term if terminated without cause.", favorability: "counter-party" },
      ],
      defaultPosition: "balanced",
    },
    {
      id: "confidentialityPosition",
      label: "Confidentiality Obligations",
      description: "How restrictive are confidentiality obligations? Must balance employer protection with intern's ability to discuss experience for career development.",
      options: [
        { id: "strict", label: "Full NDA — Same as Employees", description: "Comprehensive confidentiality identical to full-time staff. Covers all non-public information. Survives 3 years. Lac Minerals standard.", favorability: "client" },
        { id: "standard", label: "Standard Confidentiality with Academic Carve-Out", description: "Protects trade secrets and proprietary information. Permits discussion of general skills and non-proprietary learnings with academic supervisors. Survives 2 years.", favorability: "balanced" },
        { id: "limited", label: "Trade Secrets Only", description: "Covers only information meeting the legal definition of trade secrets. General business knowledge not restricted. Survives 1 year.", favorability: "counter-party" },
      ],
      defaultPosition: "standard",
    },
    {
      id: "workplaceSafetyPosition",
      label: "Workplace Safety & Insurance",
      description: "How is the intern covered for workplace injuries? WSIB/WCB coverage varies by province and intern classification.",
      options: [
        { id: "basic", label: "WSIB/WCB Coverage Only", description: "Standard workplace safety insurance per provincial requirements. No additional coverage.", favorability: "client" },
        { id: "enhanced", label: "WSIB/WCB + Supplemental Insurance", description: "Provincial workers' compensation plus supplemental accident and liability insurance. Covers gaps in WSIB/WCB for student placements.", favorability: "balanced" },
        { id: "comprehensive", label: "Full Coverage + Health Benefits", description: "WSIB/WCB plus supplemental insurance plus enrollment in employer health and dental benefits for placement duration.", favorability: "counter-party" },
      ],
      defaultPosition: "enhanced",
    },
    {
      id: "returnOfferPosition",
      label: "Return Offer & Conversion",
      description: "Is there a pathway from internship to full-time employment?",
      options: [
        { id: "no-commitment", label: "No Commitment", description: "Placement creates no expectation of future employment. Intern may apply through standard channels.", favorability: "client" },
        { id: "consideration", label: "Priority Consideration", description: "Strong performers receive priority consideration for open roles. No binding commitment. Evaluation criteria shared at mid-point.", favorability: "balanced" },
        { id: "conditional-offer", label: "Conditional Return Offer Framework", description: "Performance-based return offer criteria defined upfront. Meeting criteria triggers offer letter within 30 days of placement end. Compensation at market junior rate.", favorability: "counter-party" },
      ],
      defaultPosition: "consideration",
    },
    {
      id: "academicIntegrationPosition",
      label: "Academic Integration & Reporting",
      description: "How does the placement coordinate with the educational institution?",
      options: [
        { id: "minimal", label: "Employer Signs Off Only", description: "Employer confirms attendance and provides brief evaluation. No ongoing academic coordination.", favorability: "client" },
        { id: "collaborative", label: "Collaborative Evaluation", description: "Mid-term and final evaluations shared with academic supervisor. Employer participates in academic assessment if requested. Learning objectives mapped to curriculum.", favorability: "balanced" },
        { id: "fully-integrated", label: "Fully Integrated Academic Partnership", description: "Tripartite agreement with institution. Regular progress reports. Academic supervisor site visits. Research output may be published with employer consent. Joint assessment.", favorability: "counter-party" },
      ],
      defaultPosition: "collaborative",
    },
  ],
  draftingInstructions: `AGREEMENT-SPECIFIC INSTRUCTIONS — INTERNSHIP / CO-OP PLACEMENT AGREEMENT:
This is an internship or co-operative education placement agreement under Canadian employment and education law. Priced at $350-550 reflecting employment standards complexity and academic coordination.

PARTY DYNAMICS:
- Host Organization (Party A): The employer providing the work placement
- Intern/Co-op Student (Party B): The student completing the placement, often through a post-secondary institution's co-op or internship program

CRITICAL LEGAL FRAMEWORK — EMPLOYMENT STANDARDS:
1. Ontario ESA, 2000: s.1(2) — "intern" not defined; student exemption requires: (a) placement part of curriculum, (b) approved by institution, (c) primarily benefits student. Janice v. 1526926 Ontario (2015 ONSC) — unpaid intern was employee where work benefited employer.
2. BC ESA: s.1 — "employee" includes interns unless meeting practicum exemption (accredited institution, part of program).
3. Alberta ESA: Students in approved programs exempt from minimum wage and hours of work provisions.
4. Quebec LSA: Student placements under supervision of educational institution may be exempt — but must meet criteria of s.1 "employee" test.
5. Federal (CLSA): Federally regulated employers — internship provisions in Part III, Division I.1 of the Canada Labour Code.

COMPENSATION RULES:
- If intern qualifies as "employee" under applicable ESA, ALL employment standards apply: minimum wage, hours of work, vacation pay, holiday pay, overtime.
- Unpaid internships lawful ONLY if meeting strict ESA student/practicum exemption criteria.
- WSIB/WCB coverage: Most provinces require coverage for paid interns. Co-op programs often have institutional WSIB coverage.

INTELLECTUAL PROPERTY:
- Copyright Act R.S.C. 1985, c. C-42, s.13(3): Employer owns copyright in works made "in the course of employment" — but intern may not be "employee" under the Act.
- Best practice: Express IP assignment clause to remove ambiguity.
- Moral rights (s.14.1): Cannot be assigned, only waived. Waiver should be included.
- Academic IP policies: Many universities claim rights to student work created during co-op. Address in tripartite agreements.

CONFIDENTIALITY:
- Lac Minerals Ltd. v. International Corona Resources Ltd. (1989 2 SCR 574): Breach of confidence framework.
- Interns have same confidentiality obligations as employees, but enforce reasonableness — overly broad restrictions on students may be unenforceable per Payette v. Guay (2013 SCC 45) principles.

WORKPLACE SAFETY:
- Occupational Health and Safety Act (Ontario): s.1(1) — "worker" includes interns. Employer has same duties as for employees.
- WSIB: Schedule 1 employers must register interns. Co-op programs may provide institutional coverage through Ministry of Colleges and Universities.

HUMAN RIGHTS:
- Canadian Human Rights Act / provincial codes: Full protection applies to interns. Duty to accommodate disabilities, religious practices.
- Age discrimination protections apply — do not set age-based eligibility.

MANDATORY PROVISIONS:
1. Parties and academic institution identification
2. Placement term (start/end dates aligned with academic calendar)
3. Compensation structure and payment schedule
4. Learning objectives and evaluation criteria
5. Supervision and mentorship framework
6. IP assignment and moral rights waiver
7. Confidentiality with academic carve-out
8. Early termination provisions and notice to institution
9. Workplace safety and insurance coverage
10. Return of property on completion
11. Non-solicitation (limited — no non-compete for interns per Payette principles)
12. Governing law and dispute resolution
13. Academic integration and reporting obligations

KEY CASE LAW:
- Janice v. 1526926 Ontario Inc. (2015 ONSC): Unpaid intern found to be employee — work benefited employer
- Payette v. Guay inc. (2013 SCC 45): Restrictive covenants — reasonableness analysis applies with heightened scrutiny for junior/vulnerable workers
- Machtinger v. HOJ Industries (1992 SCC): Termination provisions below ESA minimums are void
- Frame v. Smith (1987 2 SCR 99): Fiduciary obligations in relationships of trust and vulnerability`,
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
  "term-sheet": TERM_SHEET_CONFIG,
  "subscription-agreement-ni45106": SUBSCRIPTION_AGREEMENT_NI45106_CONFIG,
  "investors-rights-agreement": INVESTORS_RIGHTS_CONFIG,
  "rofr-co-sale": ROFR_COSALE_CONFIG,
  "founders-lock-up": FOUNDERS_LOCKUP_CONFIG,
  "bridge-note": BRIDGE_NOTE_CONFIG,
  "convertible-note": CONVERTIBLE_NOTE_CONFIG,
  "bilateral-loan": BILATERAL_LOAN_CONFIG,
  "demand-note": DEMAND_NOTE_CONFIG,
  "revolving-credit": REVOLVING_CREDIT_CONFIG,
  // Commercial
  "saas-sla": SAAS_SLA_CONFIG,
  "managed-services-sla": MANAGED_SERVICES_SLA_CONFIG,
  "enterprise-sla": ENTERPRISE_LICENSING_SLA_CONFIG,
  "enterprise-licensing-sla": ENTERPRISE_LICENSING_SLA_CONFIG,
  "subscription-agreement": SUBSCRIPTION_AGREEMENT_CONFIG,
  "vendor-agreement": VENDOR_AGREEMENT_CONFIG,
  "statement-of-work": SOW_CONFIG,
  "consulting-agreement": CONSULTING_AGREEMENT_CONFIG,
  "software-license": SOFTWARE_LICENSE_CONFIG,
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
  // M&A / Securities — Voting Agreement
  "voting-agreement": VOTING_AGREEMENT_CONFIG,
  // NDA Variants
  "nda-mutual": NDA_MUTUAL_CONFIG,
  "nda-one-way": NDA_ONE_WAY_CONFIG,
  // Privacy & Data
  "data-processing-agreement": DATA_PROCESSING_CONFIG,
  "cookie-policy": COOKIE_POLICY_CONFIG,
  // Commercial
  "saas-subscription": SAAS_SUBSCRIPTION_CONFIG,
  "technology-license": TECHNOLOGY_LICENSE_CONFIG,
  "franchise-agreement": FRANCHISE_CONFIG,
  "licensing-agreement": LICENSING_AGREEMENT_CONFIG,
  // Platform
  "acceptable-use-policy": ACCEPTABLE_USE_CONFIG,
  "terms-of-service": TERMS_OF_SERVICE_CONFIG,
  // Creator
  "content-license": CONTENT_LICENSE_CONFIG,
  "talent-agreement": TALENT_AGREEMENT_CONFIG,
  "production-agreement": PRODUCTION_AGREEMENT_CONFIG,
  "music-sync": MUSIC_SYNC_CONFIG,
  "distribution-agreement": DISTRIBUTION_CONFIG,
  // Internship / Co-op
  "internship-coop": INTERNSHIP_COOP_CONFIG,
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
    "inv-terms", "inv-conversion", "inv-info", "inv-lending", "inv-covenants",
    "com-service", "com-sla", "com-data", "com-liability", "com-procurement",
    "sub-service", "sub-billing", "sub-tiers", "sub-clause", "sub-data",
    "sow-scope", "sow-milestones", "sow-terms",
    "plat-business", "plat-privacy", "plat-terms", "plat-structure",
    "inf-campaign", "inf-deliverables", "inf-rights", "inf-terms", "inf-compliance",
    "va-type", "va-parties", "va-transaction", "va-securities", "va-commitment", "va-transfer", "va-nosolicitation", "va-termination", "va-general", "va-review",
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
