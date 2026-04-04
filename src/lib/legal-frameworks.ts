/**
 * Legal Frameworks — Clause Libraries, Drafting Workflows & Regulatory Modules
 * Extracted from Ruby Law proprietary legal databases
 * Used as system context for AI agreement generation
 */

// ─── EMPLOYMENT AGREEMENT FRAMEWORK ─────────────────────────────────────────

export const EMPLOYMENT_FRAMEWORK = `
EMPLOYMENT AGREEMENT DRAFTING FRAMEWORK
Based on Employment Clause Library v4.0, Employment Drafting Workflow Engine v4.0, and Employment Regulatory Module Reference

═══════════════════════════════════════════
THREE-POSITION FRAMEWORK
═══════════════════════════════════════════
Every clause where positions diverge MUST be drafted in the appropriate position:
- EMPLOYER-FRIENDLY: Maximizes employer flexibility and minimizes ongoing obligations. Default when representing the employer.
- BALANCED / MARKET: Where most negotiated deals land. Default starting position for most commercial engagements.
- EMPLOYEE-PROTECTIVE: Strongest protections for the employee. Use when representing an executive or in high-risk departure scenarios.

When the wizard specifies a tier of "self-serve", use BALANCED/MARKET position.
When the wizard specifies "counsel" tier, note the position can be customized by the lawyer.

═══════════════════════════════════════════
SECTION 1: TERMINATION CLAUSES
═══════════════════════════════════════════
Most heavily litigated provisions in Canadian employment law.

REGULATORY COMPLIANCE:
- Waksdale v. Swegon Group AB, 2020 ONCA 391: ANY single ESA violation in the termination clause voids the ENTIRE termination/severance section, exposing employer to full common law reasonable notice (potentially 24+ months)
- ESA 2000 minimum notice: 1 week per year of service up to 8 weeks; severance pay threshold: 5+ years service AND employer payroll $2.5M+
- Howard v. Benson Group Ltd., 2012 ONCA 231: Fixed-term contracts — early termination clause MUST explicitly allow early termination without cause; absence = pay for remainder of term
- Termination for cause must meet the high threshold set by McKinley v. BC Tel, 2001 SCC 38 (proportionality analysis)

THREE POSITIONS FOR WITHOUT-CAUSE TERMINATION:
EMPLOYER-FRIENDLY: ESA minimums only (1 week/year up to 8 weeks notice + severance if applicable). Clear language limiting to statutory minimums. Include benefits continuation during statutory notice period only.
BALANCED/MARKET: Greater of ESA minimums OR 2 weeks per year of service (capped at 12 months). Benefits continuation during notice period. Lump sum or salary continuance at employer's option.
EMPLOYEE-PROTECTIVE: Reasonable notice per Bardal factors (length of service, age, character of employment, availability of similar employment). No artificial cap. Benefits continuation through notice period. Outplacement assistance included.

THREE POSITIONS FOR PROBATIONARY PERIOD:
EMPLOYER-FRIENDLY: 3-month probation, terminate on 1 week notice during probation.
BALANCED/MARKET: 3-month probation with ESA minimums during probation, reasonable notice after.
EMPLOYEE-PROTECTIVE: No probation clause (employee gets full notice rights from day one).

═══════════════════════════════════════════
SECTION 2: RESTRICTIVE COVENANTS
═══════════════════════════════════════════

REGULATORY COMPLIANCE:
- Ontario Working for Workers Act, 2021: s.67.2 ESA — Non-competition clauses VOID for all employees EXCEPT: (a) C-suite executives, or (b) sale-of-business exception. This is MANDATORY — cannot be contracted around.
- Shafron v. KRG Insurance Brokers, 2009 SCC 6: Restrictive covenants must be: (1) reasonable between parties, (2) reasonable in public interest, (3) clear and unambiguous — courts will NOT read down or sever ambiguous terms
- Elsley v. J.G. Collins Insurance Agencies Ltd., 1978 CanLII 7 SCC: Three-part enforceability test for all restrictive covenants: (a) proprietary interest, (b) reasonable scope (geographic, temporal, activity), (c) clear and unambiguous
- Hobbs v. TDI International Bridges Inc., 2008 ONCA: Fresh consideration REQUIRED for post-hire restrictive covenant amendments. Continued employment alone is NOT sufficient consideration.
- Mason v. Chem-Trend Ltd Partnership, 2011 ONCA 344: Non-solicitation preferred over non-compete as less restrictive means

NON-COMPETITION (where permitted):
EMPLOYER-FRIENDLY: 24-month non-compete, broad geographic scope (Canada-wide), broad definition of competing business.
BALANCED/MARKET: 12-month non-compete, limited geographic scope (province or city), narrow definition limited to direct competitors.
EMPLOYEE-PROTECTIVE: No non-compete (non-solicitation only). If non-compete required, 6-month maximum with narrow geographic/activity scope and garden leave pay.

NON-SOLICITATION OF CLIENTS:
EMPLOYER-FRIENDLY: 24 months, all clients of employer during employment term.
BALANCED/MARKET: 12 months, clients with whom employee had material contact in last 24 months.
EMPLOYEE-PROTECTIVE: 6 months, clients with whom employee had direct personal contact in last 12 months.

NON-SOLICITATION OF EMPLOYEES:
EMPLOYER-FRIENDLY: 24 months, all employees of employer.
BALANCED/MARKET: 12 months, employees whom the departing employee directly supervised or worked closely with.
EMPLOYEE-PROTECTIVE: 6 months, employees the departing employee directly supervised, and only active solicitation (not passive applications).

═══════════════════════════════════════════
SECTION 3: INTELLECTUAL PROPERTY
═══════════════════════════════════════════

REGULATORY COMPLIANCE:
- Copyright Act (Canada) s.13(3): Works made in course of employment — employer is first owner of copyright (default rule, but only for works in scope of employment)
- Copyright Act s.14.1: Moral rights cannot be assigned but CAN be waived. Always include moral rights waiver.
- Patent Act: Unlike copyright, no statutory employer ownership. Must be assigned by contract.

IP ASSIGNMENT:
EMPLOYER-FRIENDLY: All IP created during employment or using employer resources belongs to employer. Broad assignment including future IP. Moral rights waiver. Cooperation clause for registration.
BALANCED/MARKET: IP created in scope of employment or using employer resources belongs to employer. Personal projects on own time excluded. Moral rights waiver for work product. Pre-existing IP carved out with schedule.
EMPLOYEE-PROTECTIVE: Only IP directly related to assigned duties belongs to employer. Pre-existing IP fully excluded. Employee retains rights to personal projects. Moral rights waiver limited to work product.

═══════════════════════════════════════════
SECTION 4: COMPENSATION & BENEFITS
═══════════════════════════════════════════
- Base salary with annual review
- Bonus/commission structure (discretionary vs. formula)
- Stock options/equity participation (if applicable)
- Benefits plan enrollment
- Vacation entitlement (ESA minimum: 2 weeks/year for first 5 years, 3 weeks after)
- Expense reimbursement

═══════════════════════════════════════════
SECTION 5: CONFIDENTIALITY
═══════════════════════════════════════════
EMPLOYER-FRIENDLY: Broad definition of confidential information, indefinite obligation, unilateral injunctive relief provision.
BALANCED/MARKET: Reasonable definition with carve-outs for public information, 3-year post-termination obligation (indefinite for trade secrets), mutual non-disclosure.
EMPLOYEE-PROTECTIVE: Narrow definition limited to documented trade secrets and proprietary processes, 2-year obligation, standard carve-outs including whistleblower protections.

═══════════════════════════════════════════
REGULATORY MODULES (apply based on jurisdiction)
═══════════════════════════════════════════

ONTARIO MODULE:
- ESA 2000 compliance mandatory
- s.67.2 non-compete prohibition (Working for Workers Act)
- Human Rights Code protections
- WSIB coverage requirements
- Pay equity obligations (Pay Equity Act)

BRITISH COLUMBIA MODULE:
- Employment Standards Act (BC) compliance
- Non-compete enforceability: more permissive than Ontario but still Shafron test applies
- Human Rights Code (BC)
- WorkSafeBC coverage

QUEBEC MODULE:
- Civil Code of Quebec art. 2085-2097 governs employment
- art. 2089: Non-compete must be in writing, limited in time/territory/activities, and reasonable
- art. 2091: Reasonable notice mandatory, cannot be waived
- art. 2094: Serious reason required for termination (different from common law just cause)
- Charter of Human Rights and Freedoms
- Act Respecting Labour Standards (ARLS)
- French language requirements (Charter of the French Language)

ALBERTA MODULE:
- Employment Standards Code (Alberta)
- Most permissive non-compete enforcement in Canada
- Alberta Human Rights Act
- WCB Alberta coverage

FEDERAL MODULE (federally regulated employers):
- Canada Labour Code Part III
- CHRC compliance
- Canadian Human Rights Act
- Federal Contractors Program (if applicable)
`;

// ─── SHAREHOLDER AGREEMENT FRAMEWORK ────────────────────────────────────────

export const SHAREHOLDER_FRAMEWORK = `
SHAREHOLDER AGREEMENT DRAFTING FRAMEWORK
Based on Shareholder Agreement Clause Library v4.0, Drafting Workflow Engine v4.0, and Regulatory Module Reference

═══════════════════════════════════════════
AGREEMENT CLASSIFICATION
═══════════════════════════════════════════
Select the appropriate template structure based on party dynamics:

1. TWO-PARTY USA: One shareholder 50-80%, other 20-50%. Balance majority liquidity against minority veto rights.
2. EMERGING CORPORATION USA: Early-stage startup with founder-employees and angel investors. Founder vesting, equity pools, sweat equity recognition.
3. JOINT VENTURE USA: Strategic alliance between 2-3 corporations. IP ownership allocation, deadlock resolution, scope limitations.
4. PE-BACKED INVESTMENT USA: PE firm + incumbent owner/management. Board control, information rights, exit timeline provisions.
5. 50/50 DEADLOCK USA: Two equal shareholders. Deadlock resolution cascade is the core structural challenge.

═══════════════════════════════════════════
THREE-POSITION FRAMEWORK
═══════════════════════════════════════════
MAJORITY-FRIENDLY: Maximizes majority shareholder control, minimizes minority protections. Opening position when representing controlling shareholder.
BALANCED/MARKET: Market-standard allocation of control and protections. Where most negotiated shareholder agreements settle.
MINORITY-PROTECTIVE: Strongest protections for minority shareholders. Tag-along guaranteed, pro-rata board representation, expanded reserved matters list.

═══════════════════════════════════════════
SECTION 1: DEFINITIONS
═══════════════════════════════════════════
MANDATORY DEFINED TERMS (include ALL):
Affiliate, Applicable Law, Board of Directors, Business, Business Day, Change of Control, Competing Business, Confidential Information, Corporation, Deadlock, Deemed Transfer, Director, Dispute, Drag-Along Sale, Drag-Along Threshold, Fair Market Value, Fiscal Year, Fundamental Decision, Governmental Authority, IFRS, Indemnified Party, Material Adverse Effect, Ordinary Course, Permitted Transfer, Permitted Transferee, Person, Pre-Emptive Right, Proportionate Share, Qualified IPO, Reserved Matter, Right of First Offer (ROFO), Right of First Refusal (ROFR), Securities, Shareholders, Shareholders Agreement (USA), Tag-Along Right, Tag-Along Sale, Transfer, Unanimous Consent Matter, Valuation, Voting Agreement

═══════════════════════════════════════════
SECTION 2: BOARD COMPOSITION & GOVERNANCE
═══════════════════════════════════════════

REGULATORY COMPLIANCE:
- CBCA s.102(1): Management vested in board of directors
- CBCA s.146: USA may restrict/transfer board powers to shareholders
- CBCA s.109: Directors elected by shareholders at AGM unless USA provides otherwise
- Duha Printers (Western) Ltd. v. R., 1998 SCC: USA binding on corporation if all shareholders party

BOARD COMPOSITION:
MAJORITY-FRIENDLY: Majority appoints all directors minus one. Minority gets one board seat or observer only. Chair appointed by majority with casting vote.
BALANCED/MARKET: Board seats proportional to ownership (e.g., 60/40 split = 3/2 on 5-person board). Independent chair selected by mutual agreement. No casting vote.
MINORITY-PROTECTIVE: Each shareholder appoints at least one director regardless of ownership percentage. Minority gets additional observer rights. Unanimous consent for chair selection.

═══════════════════════════════════════════
SECTION 3: RESERVED MATTERS & CONSENT RIGHTS
═══════════════════════════════════════════

RESERVED MATTERS (require shareholder approval beyond board):
- Issuance of new securities or equity
- Declaration or payment of dividends
- Incurrence of debt above threshold
- Sale of material assets
- Amendment to articles/bylaws
- Related-party transactions
- Entry into new business lines
- Appointment/removal of auditor
- Approval of annual budget
- Any transaction exceeding $ threshold
- Change to fiscal year
- Establishment of equity incentive plans

MAJORITY-FRIENDLY: Simple majority (50%+1) for most matters. Super-majority (66.7%) only for fundamental changes (amalgamation, dissolution, articles amendment).
BALANCED/MARKET: Simple majority for operational matters. Super-majority (66.7%) for material matters (debt, asset sales, equity issuance). Unanimous for fundamental changes.
MINORITY-PROTECTIVE: Super-majority (75%) for most material matters. Unanimous consent for equity issuance, related-party transactions, and fundamental changes. Expanded list of reserved matters.

═══════════════════════════════════════════
SECTION 4: TRANSFER RESTRICTIONS
═══════════════════════════════════════════

REGULATORY COMPLIANCE:
- NI 45-106 s.2.4: Private issuer must restrict share transfer
- Ontario Jockey Club v. Smith, 1960: Absolute transfer restrictions VOID; graduated restrictions (ROFR/ROFO) enforceable if reasonable
- CBCA s.6(1)(d): Articles may contain transfer restrictions

RIGHT OF FIRST REFUSAL (ROFR):
MAJORITY-FRIENDLY: ROFR on all transfers including to family/affiliates. 60-day exercise period. Over-subscription right for remaining shareholders.
BALANCED/MARKET: ROFR on third-party transfers (permitted transfers exempt). 30-day exercise period. Pro-rata over-subscription.
MINORITY-PROTECTIVE: ROFR with 15-day exercise period. Broad permitted transfer exceptions (family, trusts, affiliates). Shotgun clause available as alternative.

TAG-ALONG RIGHTS:
MAJORITY-FRIENDLY: Tag-along only if majority sells >80% of shares. Pro-rata participation only.
BALANCED/MARKET: Tag-along triggered at >50% sale. Pro-rata participation at same price and terms.
MINORITY-PROTECTIVE: Tag-along on ANY sale by majority shareholder, regardless of percentage. Identical price, terms, and conditions. Minority can tag full position.

DRAG-ALONG RIGHTS:
MAJORITY-FRIENDLY: Drag-along at 51% threshold. Minority must sell at drag price with limited protections.
BALANCED/MARKET: Drag-along at 66.7% threshold. Fair market value floor. Independent valuation if disputed. Minority reps and warranties limited to title and authority only.
MINORITY-PROTECTIVE: Drag-along at 75%+ threshold only. Independent valuation mandatory. FMV floor with premium. Minority has right to match drag offer and retain shares.

PRE-EMPTIVE RIGHTS:
MAJORITY-FRIENDLY: No pre-emptive rights, or limited to primary issuances only with short exercise window (10 days).
BALANCED/MARKET: Pro-rata pre-emptive rights on all new issuances except employee equity plans. 20-day exercise window.
MINORITY-PROTECTIVE: Full pre-emptive rights on ALL issuances including employee plans. 30-day exercise window. Over-subscription rights.

═══════════════════════════════════════════
SECTION 5: DEADLOCK RESOLUTION
═══════════════════════════════════════════

DEADLOCK CASCADE (apply in order):
1. Senior Executive Negotiation: CEOs/principals meet within 15 days
2. Mediation: Independent mediator, 30-60 days
3. Binding Arbitration: Single arbitrator or panel, commercial arbitration rules
4. Shotgun Buy-Sell: One shareholder names price per share; other must either buy at that price or sell at that price
5. Forced Dissolution: Wind up corporation and distribute assets

SHOTGUN MECHANICS:
- Triggering shareholder serves notice with price per share
- Receiving shareholder has 30-60 days to elect buy or sell
- If elect buy: must pay triggering shareholder at named price
- If elect sell: triggering shareholder must buy at named price
- Anti-abuse provision: price must be bona fide FMV

═══════════════════════════════════════════
SECTION 6: FINANCIAL PROVISIONS
═══════════════════════════════════════════

REGULATORY COMPLIANCE:
- CBCA s.42: Dividend solvency test — (a) corporation able to pay liabilities as they become due, AND (b) realizable value of assets >= aggregate of liabilities + stated capital of all classes
- CBCA s.43: Share purchase/redemption subject to same solvency test

DIVIDENDS:
MAJORITY-FRIENDLY: Dividends at board discretion. No mandatory distribution policy.
BALANCED/MARKET: Distribute 30-50% of available net income annually after reserves. Board sets timing.
MINORITY-PROTECTIVE: Mandatory annual distribution of 50%+ of available net income. Quarterly distributions if available. Independent audit of distributable income.

═══════════════════════════════════════════
SECTION 7: RESTRICTIVE COVENANTS
═══════════════════════════════════════════
- Non-Competition: 1-3 year term, Competing Business scope, geographic limitations
- Ontario s.67.2: Non-compete VOID for employee-shareholders (use enhanced non-solicitation)
- Non-Solicitation: customers (1-2 years), employees (1-2 years)
- Confidentiality: indefinite for trade secrets, 2-5 years for other information
- Enforceability: Shafron test applies

═══════════════════════════════════════════
SECTION 8: VALUATION METHODS
═══════════════════════════════════════════
For ROFR, tag-along, drag-along, shotgun, and forced buyout:
- Independent valuator (CBV-designated preferred)
- Multiple methodologies: DCF, comparable transactions, asset-based, earnings multiple
- Minority discount: apply or not based on position
- Marketability discount: apply or not based on position

═══════════════════════════════════════════
JURISDICTION-SPECIFIC COMPLIANCE
═══════════════════════════════════════════
CBCA (Federal): s.146 USA auto-binding on transferees unless rescind within 30 days. s.194 dissent rights cannot be eliminated. s.241 oppression remedy cannot be contracted out.
OBCA (Ontario): Similar to CBCA. s.67.2 non-compete prohibition for employees.
QBCA (Quebec): s.213-230 USA provisions. s.216 mandatory registrar disclosure. s.219 USA terminates if corporation becomes reporting issuer. Civil Code art. 2089 stricter non-compete.
BCBCA (British Columbia): Most flexible approach. Significant PE activity precedent.
ABCA (Alberta): Most permissive for non-compete enforcement.
`;

// ─── SAFE AGREEMENT FRAMEWORK ───────────────────────────────────────────────

export const SAFE_FRAMEWORK = `
SAFE (SIMPLE AGREEMENT FOR FUTURE EQUITY) DRAFTING FRAMEWORK
Based on SAFE Clause Library (Canadian Tech) and SAFE Drafting Workflow Engine v3.0

═══════════════════════════════════════════
INVESTOR CLASSIFICATION
═══════════════════════════════════════════
Classify the investor along three dimensions:

1. INVESTOR TYPE:
   - Angel: Individual, $25K-$250K, relationship-driven, limited governance
   - Institutional Seed: Fund, $250K-$2M, board observer rights, info rights
   - Strategic: Corporation, variable amount, co-development rights, commercial terms
   - Friends & Family: Individual, <$25K, simplified terms, extra disclosure

2. COMPANY STAGE:
   - Pre-Revenue: No revenue, valuation cap only, no discount
   - Revenue-Generating: Revenue present, cap + discount, fuller info rights
   - Growth/Bridge: Established, discount preferred, extensive info rights

3. DEAL SIZE:
   - <$100K: Simplified terms, limited governance
   - $100K-$500K: Standard terms, quarterly reports
   - $500K+: Enhanced terms, board observer, monthly reports, audit rights

═══════════════════════════════════════════
REGULATORY TRIGGER QUESTIONS (8 Questions)
═══════════════════════════════════════════
Q1: Is the investor an accredited investor under NI 45-106 s.1.1?
Q2: Will proceeds exceed the offering memorandum threshold ($500K)?
Q3: Does the company have investors in Quebec?
Q4: Are there US or non-Canadian investors?
Q5: Has the company previously issued SAFEs with different terms?
Q6: Will total SAFE outstanding exceed 30% of fully diluted capitalization?
Q7: Is the company a reporting issuer in any Canadian jurisdiction?
Q8: Does the company have outstanding convertible instruments with different terms?

═══════════════════════════════════════════
REGULATORY MODULES
═══════════════════════════════════════════

MODULE 1 — ACCREDITED INVESTOR (NI 45-106 s.2.3):
- Individual: income >$200K (or $300K joint) in each of 2 most recent years; or net financial assets >$1M; or net assets >$5M
- Entity: net assets >$5M; or all equity owners are accredited investors
- FILING: Report of exempt distribution within 10 days (Form 45-106F1)
- Provincial fees vary: Ontario $500 base, BC $nil for accredited

MODULE 2 — OFFERING MEMORANDUM (NI 45-106 s.2.9):
- Required if NOT all investors are accredited
- Form 45-106F2 content requirements
- 2-business-day right of withdrawal after delivery
- Annual financial statements obligation while securities outstanding
- $10K maximum for non-accredited individual investors (unless eligible)

MODULE 3 — QUEBEC COMPLIANCE:
- Quebec has opted out of NI 45-106 passport system
- AMF (Autorité des marchés financiers) governs
- Regulation 45-106Q applies with specific Quebec modifications
- French language requirement for offering documents

MODULE 4 — CROSS-BORDER (US/International):
- Regulation D Rule 506(b) or 506(c) if US investors
- Form D filing with SEC within 15 days
- Blue sky compliance for each US state
- No general solicitation under 506(b)

═══════════════════════════════════════════
THREE-POSITION FRAMEWORK FOR SAFE TERMS
═══════════════════════════════════════════

SECTION 1: DEFINITIONS
Include ALL of: Affiliate, Capitalization, Change of Control, Common Stock, Company, Conversion Amount, Conversion Price, Discount Rate, Dissolution Event, Equity Financing, Fair Market Value, Fully Diluted Capitalization, Investor, IPO, Liquidity Event, MFN, Post-Money Valuation Cap, Pre-Money Valuation Cap, Preferred Stock, Pro Rata Rights, Purchase Amount, Qualified Financing, Safe, Securities Exemption, Standard Preferred Stock, Unissued Option Pool, Valuation, Written Notice

SECTION 2: VALUATION CAP
INVESTOR-FAVORABLE: Low cap ($3-5M pre-revenue, $5-10M revenue-generating). Post-money calculation (cleaner, more dilution-protective). Anti-dilution adjustment on subsequent down rounds.
MARKET STANDARD: Mid-range cap. Post-money preferred. No anti-dilution below cap.
COMPANY-FAVORABLE: High cap or no cap (discount-only). Pre-money calculation. No anti-dilution protections.

SECTION 3: DISCOUNT RATE
INVESTOR-FAVORABLE: 25-30% discount. Applies on BOTH equity financing and liquidity events. No cap on discount benefit.
MARKET STANDARD: 20% discount. Applies on equity financing. Reasonable cap on total discount benefit.
COMPANY-FAVORABLE: 10-15% discount. Applies on equity financing only. Discount disappears after 24 months.

SECTION 4: CONVERSION MECHANICS
Equity Financing Conversion:
- Trigger: Company closes qualified equity financing (minimum threshold)
- Price: Lower of (a) cap price, or (b) discount price
- Cap Price = Valuation Cap ÷ Fully Diluted Capitalization
- Discount Price = Financing Price × (1 - Discount Rate)
- Investor receives same class of securities as new investors

Liquidity Event Conversion:
INVESTOR-FAVORABLE: Convert at cap price or elect cash return of 2x purchase amount.
MARKET STANDARD: Convert at cap price or elect cash return of 1x purchase amount.
COMPANY-FAVORABLE: Convert at cap price. Cash return of 1x only if conversion would yield less than purchase amount.

Dissolution Event:
INVESTOR-FAVORABLE: Return of purchase amount BEFORE any distribution to shareholders. Priority over common stock.
MARKET STANDARD: Return of purchase amount pari passu with other SAFE holders, then pro rata with shareholders.
COMPANY-FAVORABLE: Pro rata distribution with all shareholders based on as-converted share count.

SECTION 5: PRO RATA RIGHTS
INVESTOR-FAVORABLE: Full pro rata rights on ALL future equity rounds. Unlimited. Super pro rata option (up to 2x proportionate share). 30-day exercise window.
MARKET STANDARD: Pro rata rights on next equity round only. Proportionate share only. 15-day exercise window.
COMPANY-FAVORABLE: No pro rata rights. Or pro rata only if investor holds >5% on as-converted basis.

SECTION 6: MFN (MOST FAVORED NATION)
INVESTOR-FAVORABLE: Automatic amendment to match any better SAFE terms. Applies to valuation cap, discount, pro rata, AND any other material term. No investor consent needed.
MARKET STANDARD: Right to elect to convert to any subsequent SAFE on better terms. Applies to cap and discount. Investor must affirmatively elect within 10 days.
COMPANY-FAVORABLE: MFN applies only to valuation cap. Company provides notice; investor has 5 days to elect. Expires after 12 months.

SECTION 7: INFORMATION RIGHTS
INVESTOR-FAVORABLE: Monthly financial statements, quarterly board deck, annual audited financials, annual budget, cap table on request. Board observer seat.
MARKET STANDARD: Quarterly financial statements, annual audited financials, annual budget.
COMPANY-FAVORABLE: Annual financial statements only. No cap table disclosure until conversion.

SECTION 8: REPRESENTATIONS & WARRANTIES
Company Reps: Due organization, authority, no conflicts, capitalization accuracy, no litigation, financial statements accurate, compliance with laws, IP ownership, tax compliance
Investor Reps: Accredited investor status, investment intent, restricted securities acknowledgment, independent investigation, no reliance

SECTION 9: GOVERNING LAW
Ontario: Laws of Ontario and federal laws of Canada applicable therein
British Columbia: Laws of BC and federal laws of Canada applicable therein
Quebec: Laws of Quebec and federal laws of Canada applicable therein (note: Civil Code governs interpretation)

SECTION 10: TERMINATION & AMENDMENT
- SAFE terminates on conversion, liquidity event, or dissolution
- Amendment requires written consent of Company and Investor
- No unilateral amendment
`;

// ─── SLA (SERVICE LEVEL AGREEMENT) FRAMEWORK ────────────────────────────────

export const SLA_FRAMEWORK = `
SERVICE LEVEL AGREEMENT DRAFTING FRAMEWORK
Based on SLA Clause Library (Canadian Tech) v3.0 and SLA Drafting Workflow Engine v3.0

═══════════════════════════════════════════
THREE-POSITION FRAMEWORK
═══════════════════════════════════════════
VENDOR-PREFERRED: Starting position when drafting for a vendor client. Maximum flexibility, minimum exposure.
MARKET STANDARD: Where most deals land after negotiation. Ready fallback when customer pushes back.
MAX CONCESSION: Furthest you should go. Beyond this, escalate to senior counsel.

═══════════════════════════════════════════
SECTION 1: PREAMBLE, RECITALS & PARTIES
═══════════════════════════════════════════
- Identify Service Provider and Customer with full legal names
- Incorporation details and principal places of business
- Recitals establishing context (existing MSA reference if applicable)
- Effective date and term

═══════════════════════════════════════════
SECTION 2: SERVICE DESCRIPTION & SCOPE
═══════════════════════════════════════════
VENDOR-PREFERRED: High-level service description with right to modify. Broad exclusions. "Commercially reasonable efforts" standard.
MARKET STANDARD: Detailed service description with change management process. Reasonable exclusions. "Best commercial efforts" standard.
MAX CONCESSION: Exhaustive service description with specific deliverables. Minimal exclusions. Firm commitments with SLA backing.

Include: Deployment model (SaaS/on-premise/hybrid), covered environments, authorized users, geographic scope, integration points, data formats

═══════════════════════════════════════════
SECTION 3: UPTIME & AVAILABILITY
═══════════════════════════════════════════

UPTIME COMMITMENTS:
VENDOR-PREFERRED: 99.5% monthly uptime. Measured excluding scheduled maintenance, force majeure, and customer-caused outages. Scheduled maintenance windows: 8 hours/week.
MARKET STANDARD: 99.9% monthly uptime. Measured excluding pre-announced scheduled maintenance only. Scheduled maintenance: 4 hours/week in off-peak.
MAX CONCESSION: 99.95% monthly uptime. Measured on total calendar time excluding only pre-announced maintenance with 72-hour notice. Maintenance windows: 2 hours/week, pre-approved times only.

MEASUREMENT:
- Uptime % = (Total Minutes - Downtime Minutes) / Total Minutes × 100
- Monitoring: Third-party monitoring tool (specify) or mutual agreement
- Reporting: Monthly uptime reports within 5 business days of month-end

═══════════════════════════════════════════
SECTION 4: SERVICE LEVELS & RESPONSE TIMES
═══════════════════════════════════════════

SEVERITY TIERS:
- CRITICAL (Severity 1): Complete service outage or data breach. Response: 15min-1hr. Resolution: 4-8hr.
- HIGH (Severity 2): Major feature unavailable, significant performance degradation. Response: 1-4hr. Resolution: 8-24hr.
- MEDIUM (Severity 3): Minor feature issue, workaround available. Response: 4-8hr. Resolution: 2-5 business days.
- LOW (Severity 4): Cosmetic issues, feature requests, documentation. Response: 1-2 business days. Resolution: 5-10 business days.

THREE POSITIONS FOR RESPONSE/RESOLUTION:
VENDOR-PREFERRED: Critical 1hr/8hr, High 4hr/24hr, Medium 8hr/5d, Low 2d/10d
MARKET STANDARD: Critical 30min/4hr, High 2hr/12hr, Medium 4hr/3d, Low 1d/5d
MAX CONCESSION: Critical 15min/2hr, High 1hr/8hr, Medium 2hr/1d, Low 4hr/3d

═══════════════════════════════════════════
SECTION 5: SERVICE CREDITS
═══════════════════════════════════════════

VENDOR-PREFERRED: 5% credit per 0.1% below SLA (capped at 10% monthly fee). Credits are sole remedy. Must claim within 30 days. Applied against future invoices only.
MARKET STANDARD: 10% credit per 0.1% below SLA (capped at 25% monthly fee). Credits are primary but not sole remedy. Claim within 60 days. Credit or cash refund at customer option.
MAX CONCESSION: 15% credit per 0.1% below SLA (capped at 50% monthly fee). Auto-applied without claim requirement. Termination right if credits exceed 25% in any quarter.

═══════════════════════════════════════════
SECTION 6: DATA PROTECTION & PRIVACY
═══════════════════════════════════════════

REGULATORY COMPLIANCE:
- PIPEDA (Personal Information Protection and Electronic Documents Act, S.C. 2000, c. 5): Governs collection, use, and disclosure of personal information in course of commercial activities
- 10 Fair Information Principles (Schedule 1 to PIPEDA): Accountability, Identifying Purposes, Consent, Limiting Collection, Limiting Use/Disclosure/Retention, Accuracy, Safeguards, Openness, Individual Access, Challenging Compliance
- Breach notification: 72-hour notification to OPC and affected individuals for breaches creating "real risk of significant harm" (RROSH)
- CASL (Canada's Anti-Spam Legislation, S.C. 2010, c. 23): Express consent required for commercial electronic messages
- Provincial privacy laws: PIPA (Alberta), PIPA (BC), Quebec Law 25 (An Act respecting the protection of personal information in the private sector)

DATA RESIDENCY:
VENDOR-PREFERRED: Data may be processed in any jurisdiction. Adequate protection via contractual safeguards.
MARKET STANDARD: Primary data stored in Canada. Processing may occur outside Canada with prior notice and adequate safeguards.
MAX CONCESSION: All data stored and processed exclusively in Canada. No cross-border transfers without prior written consent.

═══════════════════════════════════════════
SECTION 7: INTELLECTUAL PROPERTY
═══════════════════════════════════════════
- Vendor retains all IP in the service platform
- Customer retains all IP in customer data and customizations
- License grants: vendor grants customer license to use service; customer grants vendor license to process data
- No implied licenses

═══════════════════════════════════════════
SECTION 8: LIABILITY & INDEMNIFICATION
═══════════════════════════════════════════

LIABILITY CAP:
VENDOR-PREFERRED: Total aggregate liability capped at fees paid in prior 6 months. Mutual consequential damages exclusion with NO carve-outs.
MARKET STANDARD: Total aggregate liability capped at fees paid in prior 12 months. Consequential damages exclusion with carve-outs for: (a) IP infringement, (b) data breach, (c) willful misconduct.
MAX CONCESSION: Liability cap at 2x annual fees. Unlimited liability for IP infringement, data breach, confidentiality breach, and willful misconduct.

INDEMNIFICATION:
- Vendor indemnifies for IP infringement claims
- Customer indemnifies for misuse of service, customer data content
- Notice, control, and cooperation obligations

═══════════════════════════════════════════
SECTION 9: TERM, TERMINATION & TRANSITION
═══════════════════════════════════════════
VENDOR-PREFERRED: 36-month initial term, auto-renew for 12-month periods. 90-day termination notice. Early termination fee = remaining contract value.
MARKET STANDARD: 12-month initial term, auto-renew for 12-month periods. 60-day termination notice. Termination for convenience with 90-day notice and pro-rata refund.
MAX CONCESSION: Month-to-month after initial 6-month term. 30-day termination notice. Full refund of prepaid fees on termination. 12-month data export period.

TRANSITION ASSISTANCE:
- Data export in standard format (CSV, JSON, API)
- Transition period: 30-90 days post-termination
- Cooperation with replacement vendor
- Data deletion certification after transition

═══════════════════════════════════════════
SECTION 10: FORCE MAJEURE
═══════════════════════════════════════════
VENDOR-PREFERRED: Broad definition including pandemics, infrastructure failures, government actions, labor disputes, cyber attacks. Unlimited suspension period.
MARKET STANDARD: Standard definition. Obligation to use commercially reasonable efforts to mitigate. Customer may terminate if FM exceeds 60 days.
MAX CONCESSION: Narrow definition (acts of God, war, government orders only). Vendor must maintain DR/BCP. Customer may terminate if FM exceeds 30 days with full refund.

═══════════════════════════════════════════
SECTION 11: DISPUTE RESOLUTION
═══════════════════════════════════════════
- Escalation: service managers (10 days) → executives (20 days) → mediation (30 days) → arbitration or litigation
- Governing law: Laws of [Province] and federal laws of Canada applicable therein
- Venue: Courts of [Province] or arbitration in [City]
`;

// ─── CORPORATE TRANSACTIONS FRAMEWORK ───────────────────────────────────────

export const CORPORATE_FRAMEWORK = `
CORPORATE TRANSACTIONS DRAFTING FRAMEWORK
Based on Articles of Incorporation, Articles of Amendment, and Partnership Agreement databases

═══════════════════════════════════════════
ARTICLES OF INCORPORATION
═══════════════════════════════════════════
CBCA REQUIREMENTS:
- Form 1 under CBCA
- Corporate name (or numbered company)
- Registered office province
- Class and number of shares (minimum 1 class)
- Share transfer restrictions (required for private issuers under NI 45-106)
- Number of directors (minimum/maximum)
- Any restrictions on business

SHARE STRUCTURE:
- Common shares: voting, dividend, liquidation rights
- Preferred shares (if applicable): blank-cheque preferred with board-set terms
- Special shares: redeemable, retractable, convertible provisions

OBCA REQUIREMENTS:
- Form 1 under OBCA (Ontario)
- Similar to CBCA with provincial variations
- Filing with Ontario Business Registry

═══════════════════════════════════════════
ARTICLES OF AMENDMENT
═══════════════════════════════════════════
Common amendments:
- Name change
- Share structure modification (split, consolidation, new class)
- Adding/removing share transfer restrictions
- Changing director number
- Adding/removing business restrictions

PROCESS:
- Board resolution recommending amendment
- Special resolution of shareholders (2/3 majority)
- Filing articles of amendment with applicable registry
- Certificate of amendment issued

═══════════════════════════════════════════
PARTNERSHIP AGREEMENTS
═══════════════════════════════════════════

GENERAL PARTNERSHIP:
- Formation, name, principal place of business
- Capital contributions and accounts
- Profit/loss allocation (percentage or formula)
- Management and authority
- Banking and financial controls
- Admission and withdrawal of partners
- Dissolution and winding up
- Non-competition and confidentiality
- Dispute resolution

LIMITED PARTNERSHIP:
- General partner powers and duties
- Limited partner rights and restrictions
- Capital contributions and calls
- Distribution waterfall
- Carried interest (if applicable)
- Transfer restrictions
- GP removal provisions
- Dissolution triggers
`;

// ─── GENERAL BUSINESS FRAMEWORK (T&C, Privacy, Partnership, MSA) ──────────

export const GENERAL_BUSINESS_FRAMEWORK = `
GENERAL BUSINESS AGREEMENTS DRAFTING FRAMEWORK
Based on Terms & Conditions Clause Library v2.0, Privacy Policy Drafting Workflow, Partnership Agreement Database, and MSA Clause Library

═══════════════════════════════════════════
TERMS & CONDITIONS
═══════════════════════════════════════════

THREE-POSITION FRAMEWORK FOR T&C:
- PLATFORM-FAVOURABLE: Aggressive platform protections, broad liability exclusions, mandatory arbitration. Suitable for B2B platforms.
- BALANCED: Moderate terms appropriate for most B2C platforms. Consumer-friendly dispute resolution with reasonable limitations.
- USER-FAVOURABLE: Strong consumer protections, full refund policies, court-based dispute resolution. For high-risk consumer services.

18-SECTION CLAUSE LIBRARY:
1. ACCEPTANCE & FORMATION: Clickwrap acceptance mechanisms (Rudder v. Microsoft, 1999 CanLII 14923). Browse-wrap generally unenforceable — use active acceptance (checkbox, click-to-agree). Quebec requires French language availability.
2. DEFINITIONS: Platform, Services, User, Content, Intellectual Property, Personal Information (PIPEDA-aligned), Prohibited Activities.
3. LICENSE & ACCESS GRANT: Scope of license, restrictions, revocation rights. Distinguish subscription vs. perpetual access.
4. USER OBLIGATIONS: Acceptable use, account security, age requirements, compliance with applicable laws.
5. USER-GENERATED CONTENT: License grant from users, content moderation rights, takedown procedures (Copyright Act s.41.25-41.27).
6. PRIVACY & DATA: PIPEDA 10 Fair Information Principles integration, consent mechanisms, data handling cross-reference to Privacy Policy.
7. WARRANTIES & DISCLAIMERS: "As-is" disclaimers for B2B; CPA-limited disclaimers for B2C (Ontario Consumer Protection Act, 2002). Implied warranties cannot be excluded for consumer transactions in most provinces.
8. LIABILITY LIMITATIONS: Aggregate liability caps (typically 12-month fees paid). Unconscionability threshold (Uber Technologies Inc. v. Heller, 2020 SCC 16 — arbitration clauses and excessive costs). Tercon Contractors Ltd. v. British Columbia, 2010 SCC 4 — four-part enforceability test.
9. INDEMNIFICATION: User indemnification of platform for content, IP infringement, third-party claims. Must be mutual for balanced position.
10. TERMINATION: Right to terminate for breach, convenience, or platform discontinuation. Refund obligations on termination.
11. DISPUTE RESOLUTION: Forum selection (Douez v. Facebook, 2017 SCC 33 — consumer forum selection clauses may be unenforceable). Seidel v. TELUS, 2011 SCC 15 — class action waivers limited. Arbitration clauses must pass Uber v. Heller unconscionability test.
12. MODIFICATION CLAUSES: Right to modify terms with notice. Kanitz v. Rogers Cable, 2002 CanLII 49415 — modification must be reasonable with adequate notice.
13. GENERAL PROVISIONS: Entire agreement, severability, assignment, waiver, force majeure, notices.
14. ACCOUNT SECURITY: Password responsibilities, unauthorized access notification, account suspension rights.
15. INTELLECTUAL PROPERTY: Platform IP ownership, user license limitations, trademark usage rules.
16. CONTENT MONITORING: Right to monitor, remove, or restrict content. DMCA/Copyright Act notice-and-takedown.
17. COPYRIGHT PROCEDURES: Copyright Act s.41.25-41.27 notice-and-notice regime (Canada does NOT use DMCA takedown).
18. GOVERNING LAW: Provincial law selection, federal law application, cross-border considerations.

REGULATORY MODULES:
- M-TC-001: PIPEDA (10 Fair Information Principles)
- M-TC-002: CASL (Anti-Spam, consent requirements, unsubscribe mechanisms)
- M-TC-003: Quebec Law 25 (Bill 64 — enhanced privacy rights, DPO requirement, PIA for high-risk processing)
- M-TC-004: Quebec French Language (Charter of the French Language — French version required for Quebec consumers)
- M-TC-005: Ontario Consumer Protection Act (unfair practices, internet agreements, cooling-off periods)
- M-TC-006: BC Consumer Protection (BPCPA specific requirements)
- M-TC-007: Copyright Act (notice-and-notice, fair dealing, moral rights)
- M-TC-008: Competition Act (deceptive marketing, drip pricing, performance claims)
- M-TC-009: Accessibility (AODA/WCAG 2.1 AA for Ontario)
- M-TC-010: E-Commerce (UECA, electronic signatures, electronic documents)
- M-TC-011: Industry-Specific (financial services, health, education triggers)
- M-TC-012: Dispute Resolution (arbitration enforceability, class action waivers, small claims)
- M-TC-013: Cross-Border (GDPR adequacy, CCPA compliance for US users)

PROVINCIAL COMPLIANCE MATRIX:
Apply province-specific rules based on jurisdiction. Key variations:
- Ontario: CPA 2002, AODA, OHSA
- Quebec: Charter of French Language, Civil Code, Law 25, CPA (Quebec)
- BC: BPCPA, PIPA
- Alberta: PIPA Alberta, Fair Trading Act
- Saskatchewan: Consumer Protection and Business Practices Act

═══════════════════════════════════════════
PRIVACY POLICY
═══════════════════════════════════════════

Must address all 10 PIPEDA Fair Information Principles:
1. Accountability — Designate individual responsible, DPO if Quebec
2. Identifying Purposes — Specify all purposes at or before collection
3. Consent — Obtain meaningful consent (express for sensitive, implied for non-sensitive)
4. Limiting Collection — Collect only what is necessary
5. Limiting Use, Disclosure, and Retention — Use only for stated purposes
6. Accuracy — Keep information accurate, complete, up-to-date
7. Safeguards — Protect with appropriate security
8. Openness — Make policies readily available
9. Individual Access — Right to access own information
10. Challenging Compliance — Process for complaints

ADDITIONAL REQUIREMENTS:
- Quebec Law 25: Privacy Impact Assessments, data breach reporting to CAI, consent for profiling
- CASL: Commercial electronic message consent, unsubscribe mechanism
- Children's Privacy: Verifiable parental consent under 13, enhanced protections under 16 in Quebec
- Cross-Border: GDPR provisions if processing EU data, CCPA provisions if processing California residents
- Breach Notification: PIPEDA mandatory breach reporting (72 hours to OPC), Quebec reporting to CAI

═══════════════════════════════════════════
MASTER SERVICES AGREEMENT (MSA)
═══════════════════════════════════════════

STRUCTURE:
- Master agreement sets framework terms
- Individual SOWs (Statements of Work) define specific engagements
- SOW template with: scope, deliverables, timeline, fees, acceptance criteria

KEY PROVISIONS:
1. Services Description & SOW Framework
2. Fees & Payment Terms (net-30, net-60, milestone-based)
3. Intellectual Property Ownership (work-for-hire vs. license-back)
4. Confidentiality (mutual NDA provisions)
5. Representations & Warranties (professional standard, no infringement)
6. Liability Limitation (aggregate cap, typically 12-month fees)
7. Indemnification (mutual, IP infringement, negligence)
8. Term & Termination (convenience with 30-day notice, cause with cure period)
9. Insurance Requirements (professional liability, general commercial)
10. Force Majeure
11. Governing Law & Dispute Resolution
12. General Provisions (assignment, notices, amendment, entire agreement)

IP OWNERSHIP POSITIONS:
- Client-Favorable: All work product owned by client, pre-existing IP licensed
- Balanced: Deliverables owned by client, tools/methodologies retained by provider
- Provider-Favorable: Provider retains all IP, client gets license to deliverables
`;

// ─── INFLUENCER AGREEMENT FRAMEWORK ─────────────────────────────────────────

export const INFLUENCER_AGREEMENT_FRAMEWORK = `
INFLUENCER AGREEMENT DRAFTING FRAMEWORK
Based on Ruby Law proprietary Clause Library, Drafting Workflow, and Regulatory Module Reference

APPLICABLE LEGAL FRAMEWORK:
- Competition Act R.S.C. 1985, c. C-34 (s.52 criminal, s.74.01 civil; June 2024 amendments — strict liability, penalties up to CAD 15M corporations, CAD 1M individuals)
- Competition Bureau Influencer Marketing Guidelines (2022): Clear/conspicuous disclosure of material connection
- Ad Standards Canada (ASC) Code & Interpretation Guideline #5: #ad/#sponsored in first 50 characters on Instagram; stand-alone hashtags
- Copyright Act R.S.C. 1985, c. C-42 (ss.3, 5, 13, 14.1, 29): Author retains copyright unless explicitly assigned; moral rights waiver must be explicit per Acoose v. Glenbow Museum 2014 FC 1064
- Trademarks Act R.S.C. 1985, c. T-13 (s.19): Authorized use of brand trademarks
- PIPEDA S.C. 2000, c. 5: Privacy compliance for audience data collection
- CASL S.C. 2010, c. 23: Opt-in consent for commercial electronic messages (penalties up to CAD 6M corporations)
- Quebec Law 25 (Bill 64): Stricter privacy requirements for Quebec-based influencers/companies (penalties up to CAD 250K organizations)
- FTC Endorsement Guides 16 CFR Part 255: Applies if US audience; material connection must be "clear and conspicuous"
- AGCO iGaming Standards (Ontario) s.2.03: Prohibits influencers likely to appeal to minors in iGaming
- CCCS GenAI/LLM Warning: Synthetic content disclosure requirements
- Wiebe Door Services Ltd. v. M.N.R. [1986] 3 F.C. 553: Independent contractor misclassification test

8-PHASE DRAFTING WORKFLOW:
Phase 1 — Client Intake & Campaign Profiling: Party structure, platforms, content types, frequency, metrics, exclusivity, IP model, compensation, subcontractors, industry, geographic reach, personal data collection, term
Phase 2 — Regulatory Routing: Map regulations by industry/geography; trigger conditional clauses (IF iGaming/alcohol → AGCO s.2.03; IF US audience >5% → FTC compliance; IF collects personal data → PIPEDA/CASL; IF Quebec → French version)
Phase 3 — Clause Assembly: Build from 30+ core clauses with three-position variants
Phase 4 — Compliance Verification: Disclosure adequacy, platform ToU adherence, IP clearance, privacy consent, insurance, morals clause scope, FTC compliance
Phase 5 — Legal Review: Flag negotiation points; generate redline summary
Phase 6 — Client Sign-Off: Authorize execution
Phase 7 — Execution & Delivery: Signature packets; eSignature workflow
Phase 8 — Amendment Tracking: Amendment log; performance metrics; renewal cycles

CORE AGREEMENT STRUCTURE (15 Sections + 6 Exhibits):
Section 1-2: Preamble, Recitals, Definitions, Entire Agreement, Appointment
Section 3: Services & Deliverables (→ Exhibit A: Scope of Services)
Section 4: Influencer Obligations, Performance Metrics (→ Exhibit B), Posting Requirements (→ Exhibit C)
Section 5: Content Approval, Monitoring, Public Disclosure Compliance (Competition Act, ASC, FTC)
Section 6: Work Product, IP Ownership, Moral Rights Waiver, Third-Party Clearances
Section 7: Personnel & Subcontractors (→ Exhibit D)
Section 8: Fees & Expenses (→ Exhibit E), Payment Terms, GST/HST, CRA withholding
Section 9: Confidentiality, Exclusivity & Non-Compete (→ Exhibit F: Competitor List)
Section 10: Term, Renewal, Termination (for cause, convenience), Survival
Section 11: Independent Contractor Status (per Wiebe Door 4-factor test)
Section 12: Representations & Warranties
Section 13: Indemnification (IP, Third-Party Claims, Defamation)
Section 14: Insurance, Morals Clause, Force Majeure
Section 15: General Provisions (Notices, Amendments, Severability, Governing Law, Dispute Resolution)

THREE-POSITION CLAUSE FRAMEWORK:

1. SERVICES & DELIVERABLES:
- Company-Favourable: Exact deliverable count per platform, minimum video duration, technical specs, unlimited revisions, proof-of-posting within 24 hours, brand event attendance
- Balanced: Approximate deliverables with reasonable modifications and good-faith flexibility
- Influencer-Favourable: Approximately X mentions subject to editorial schedule, complete creative control

2. PERFORMANCE METRICS:
- Company-Favourable: Minimum engagement rate, reach, conversions; failure = payment reduction/additional work/termination
- Balanced: Benchmarks tied to historical averages; if falls X% below, parties meet to review; limited remedies
- Influencer-Favourable: Acknowledges algorithm factors beyond control; no metric-based liability

3. CONTENT APPROVAL & MONITORING:
- Company-Favourable: All content submitted 5 days pre-publication; Company sole discretion; unlimited revision rounds; post-publication removal within 24 hours
- Balanced: Submit 3-5 days; Company approval within 2-3 days not unreasonably withheld; reasonable modifications only
- Influencer-Favourable: Editorial control retained; no pre-approval; post-publication removal only for false/defamatory statements

4. PUBLIC DISCLOSURE (CRITICAL — Competition Act s.52):
- Company-Favourable: '#ad'/'#sponsored' in first 50 characters Instagram; Instagram Paid Partnership tag; 'AD' in Stories 20pt font; '#ad' first 30 chars TikTok; first 30 seconds YouTube; Company monitors; Influencer corrects within 4 hours; repeated non-compliance = material breach + indemnification
- Balanced: Clear hashtag in prominent location; platform-native tools; verbal disclosure in video; good-faith judgment
- Influencer-Favourable: Discloses per Guidelines and platform terms; retains discretion on format

5. INTELLECTUAL PROPERTY:
- Company-Favourable: Full assignment of all rights/copyrights upon creation; waives all moral rights (paternity, integrity, association); Company may edit, modify, sublicense, create derivatives perpetually; owns Web3/NFT/metaverse rights
- Balanced: Influencer retains copyright; grants Company non-exclusive license 12 months; Company may make minor edits (aspect ratio, color); maintain attribution; no sublicense without payment
- Influencer-Favourable: Influencer retains full copyright/ownership; limited non-exclusive license 12 months; Company cannot edit/modify; Influencer retains moral rights; Company removes content within 30 days of termination

6. REPUBLICATION & EDITING:
- Company-Favourable: Republish/edit/modify perpetually across all channels; create derivatives; remove/replace Influencer image without consent
- Balanced: Republish on Company platforms 12-24 months; minor edits for formatting only; maintain attribution
- Influencer-Favourable: Republish limited to primary platforms for term only; no edits; remove within 30 days of termination

7. CONFIDENTIALITY:
- Company-Favourable: All Company information strictly confidential; term + 3-5 years post-term; breach = injunctive relief + liquidated damages
- Balanced: Marked information confidential; may disclose to professional advisors under NDA; survives 2 years; breach = actual damages
- Influencer-Favourable: Only designated-in-writing information; may discuss general terms with advisors; survives 1 year

8. EXCLUSIVITY & NON-COMPETE:
- Company-Favourable: During term + 12-24 months post-term; industry-wide; violation = liquidated damages + injunctive relief
- Balanced: During term only for direct competitors; post-term 6-12 months direct competitors only; may promote complementary products
- Influencer-Favourable: No exclusive promotion of competitors during term; no post-term non-compete; retains right to work with other brands in different verticals

9. FEES & COMPENSATION:
- Company-Favourable: Flat fee non-refundable; NET 30/60; no expense reimbursement unless pre-approved; Influencer responsible for all taxes/GST/HST
- Balanced: Flat fee + performance bonus if engagement exceeds target; NET 15-30; pre-approved expenses reimbursed
- Influencer-Favourable: Full fee upon execution; no payment reductions; all reasonable expenses reimbursed

10. TERM & TERMINATION:
- Company-Favourable: Company may terminate for convenience 30 days; immediately for material breach (10 days uncured), brand-damaging conduct, disclosure violations, metric failure; Influencer removes all content
- Balanced: Either party may terminate convenience 30 days; for cause requires material breach uncured 10 days; content removed 30 days; Company may retain archives
- Influencer-Favourable: Either party 60 days notice; for cause only if material breach uncured 15 days; Company removes content 30 days; Influencer retains portfolio rights

11. MORALS CLAUSE:
- Company-Favourable: Company may terminate immediately for conduct that in Company's sole discretion is immoral, unethical, illegal, or reflects negatively; no cure period
- Balanced: Termination for felony conviction, public conduct materially harming brand; 10 business days to cure; Company provides written explanation
- Influencer-Favourable: Limited to criminal conviction or deliberate Company defamation; 15 days to respond; Company must demonstrate material harm; social/political expression not triggering

PLATFORM-SPECIFIC DISCLOSURE TEMPLATES (Exhibit C):
- Instagram: #ad in first 3 characters + link to brand partnership tool
- TikTok: Brand partnerships tool + #ad hashtag
- YouTube: Auto-applied Paid Partnership label + video description disclaimer
- X/Twitter: #ad or #partner early in post text
- Facebook: Paid partnership label + privacy disclaimer

PERFORMANCE METRICS KPIs (Exhibit B):
- Engagement: 2% engagement rate (native analytics, 30-day cure)
- Traffic: 5K unique clicks (UTM/GA, 14-day cure)
- Reach: 100K impressions (platform impressions, 30-day per-post)
- Conversion: 50 MQLs or 5 sales (CRM/GA, 60-day cumulative)
- Share of Voice: #1 trend, 10% share (social listening, monthly)

CONDITIONAL REGULATORY ROUTING:
- IF iGaming OR alcohol → add AGCO s.2.03 minor appeal restriction clause
- IF US audience > 5% → add FTC Endorsement Guides compliance clause
- IF influencer collects personal data → add PIPEDA/CASL consent & security clauses
- IF uses third-party music/images → add IP indemnity; request clearance certificates
- IF performance metrics defined → populate Exhibit B with KPI thresholds and cure periods
- IF Quebec audience → generate French contract version; run Charter of French Language review
- IF environmental/green claims → add substantiation requirements per Competition Act s.74.01
- IF health products → add Therapeutic Products Directorate substantiation requirements
- IF cannabis → add Cannabis Act restrictions; prohibit psychoactive claims; require age-gating

15 REGULATORY MODULES:
M-IA-001: Competition Act — Misleading Advertising (ALL agreements)
M-IA-002: Competition Bureau Influencer Marketing Guidelines (ALL agreements)
M-IA-003: Ad Standards Canada (ALL agreements)
M-IA-004: FTC Endorsement Guides (IF US audience)
M-IA-005: AGCO iGaming Standards (IF iGaming/gambling)
M-IA-006: Copyright Act — Content Ownership (ALL agreements)
M-IA-007: Trademarks Act — Brand Usage (ALL agreements)
M-IA-008: Personality and Publicity Rights (ALL agreements)
M-IA-009: PIPEDA — Personal Information (IF data collection)
M-IA-010: CASL — Commercial Electronic Messages (IF email/DM campaigns)
M-IA-011: Provincial Privacy Laws (IF Quebec/Alberta/BC)
M-IA-012: Defamation Law (ALL agreements)
M-IA-013: Human Rights Legislation (ALL agreements)
M-IA-014: GenAI and LLM Content (IF AI-generated content)
M-IA-015: Industry-Specific Regulations (IF alcohol/cannabis/health/financial)
`;


