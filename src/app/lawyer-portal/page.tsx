'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════
   CONSTANTS & TYPES
   ═══════════════════════════════════════════════════════ */

const PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
];

const PRACTICE_AREAS = [
  'Corporate/Commercial', 'Employment', 'Privacy/Data', 'Securities',
  'IP', 'Lending', 'Real Estate', 'Litigation', 'Tax', 'Immigration',
];

const DESIGNATIONS = ['Barrister & Solicitor', 'Avocat(e)'];

type Tab = 'available' | 'active' | 'completed' | 'earnings' | 'profile';
type AvailabilityStatus = 'available' | 'busy' | 'vacation';
type OnboardingGate = 'gate1' | 'gate2' | 'complete';
type CaseTier = 'Standard' | 'Intermediate' | 'Complex' | 'Expert';

interface AvailableCase {
  id: string;
  agreementType: string;
  jurisdiction: string;
  tier: CaseTier;
  estimatedHours: number;
  fee: number;
  deadline: string;
  clientAnon: string;
  description: string;
  matchScore: number;
  practiceArea: string;
  modRef: string;
}

interface ActiveCase {
  id: string;
  agreementType: string;
  jurisdiction: string;
  tier: CaseTier;
  fee: number;
  deadline: string;
  clientAnon: string;
  description: string;
  status: 'In Review' | 'Revision Requested' | 'Submitted';
  progress: number;
  acceptedAt: string;
  modRef: string;
}

interface CompletedCase {
  id: string;
  agreementType: string;
  jurisdiction: string;
  tier: CaseTier;
  fee: number;
  completedAt: string;
  clientAnon: string;
  rating: number;
  timeToComplete: string;
  modRef: string;
}

interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  cases: number;
  method: string;
  status: 'Paid' | 'Pending' | 'Processing';
}

interface QualificationCase {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'submitted' | 'grading' | 'passed' | 'failed';
}

interface QualificationReview {
  issuesFound: Record<string, boolean>;
  recommendedChanges: string;
  overallQuality: number;
  additionalNotes: string;
}

const MOCK_AGREEMENT_DOCS: Record<string, { title: string; date: string; content: string }> = {
  qc1: {
    title: 'UNANIMOUS SHAREHOLDER AGREEMENT',
    date: 'March 28, 2026',
    content: `UNANIMOUS SHAREHOLDER AGREEMENT

THIS UNANIMOUS SHAREHOLDER AGREEMENT (the "Agreement") is made effective as of the 28th day of March, 2026.

BETWEEN:

    MAPLE LEAF TECHNOLOGIES INC. (the "Corporation"), a corporation incorporated under the Ontario Business Corporations Act, R.S.O. 1990, c. B.16 (the "Act");

    JAMES ARTHUR WELLINGTON ("Founder A"), an individual residing in Toronto, Ontario;

    PRIYA SHARMA ("Founder B"), an individual residing in Mississauga, Ontario;

(collectively, the "Parties" and individually, a "Party")

RECITALS

A. The Corporation was incorporated under the Act on January 15, 2026.
B. The authorized share capital of the Corporation consists of an unlimited number of Class A Common Shares, an unlimited number of Class B Preferred Shares, and an unlimited number of Class C Non-Voting Shares.
C. As of the date hereof, Founder A holds 500,000 Class A Common Shares and Founder B holds 500,000 Class A Common Shares.
D. The Parties wish to enter into this Agreement to govern their rights and obligations as shareholders of the Corporation.


SECTION 1 — DEFINITIONS AND INTERPRETATION

1.1  In this Agreement, the following terms shall have the following meanings:

    (a) "Affiliate" means, with respect to any Person, any other Person that directly or indirectly controls, is controlled by, or is under common control with such Person;
    (b) "Board" means the board of directors of the Corporation;
    (c) "Business Day" means any day other than a Saturday, Sunday or statutory holiday in the Province of Ontario;
    (d) "Fair Market Value" shall be determined by mutual agreement of the Parties, or failing such agreement within fifteen (15) days, by a qualified independent valuator appointed by the Corporation's auditor;
    (e) "Transfer" includes any sale, assignment, gift, pledge, encumbrance, hypothecation, or other disposition of Shares.


SECTION 2 — GOVERNANCE AND BOARD COMPOSITION

2.1  The Board shall consist of three (3) directors, appointed as follows:
    (a) Founder A shall be entitled to nominate one (1) director;
    (b) Founder B shall be entitled to nominate one (1) director;
    (c) The third director shall be an independent director mutually agreed upon by Founder A and Founder B.

2.2  Quorum for any meeting of the Board shall require the presence of all three (3) directors.

2.3  The following matters shall require the unanimous written consent of all Shareholders holding Class A Common Shares:
    (a) Any amendment to the Articles of the Corporation;
    (b) The issuance of any new shares or securities convertible into shares;
    (c) Any merger, amalgamation, or acquisition by the Corporation;
    (d) The sale of all or substantially all of the assets of the Corporation;
    (e) Any borrowing in excess of $50,000;
    (f) Entry into any contract with a value exceeding $100,000;
    (g) The declaration or payment of any dividend.


SECTION 3 — DRAG-ALONG RIGHTS

3.1  If shareholders holding at least fifty-one percent (51%) of the issued and outstanding Class A Common Shares (the "Dragging Shareholders") receive a bona fide offer from an arm's length third party to purchase all of the issued and outstanding shares of the Corporation (a "Drag-Along Sale"), the Dragging Shareholders may require all other Shareholders to sell their Shares on the same terms and conditions.

3.2  The Dragging Shareholders shall provide written notice to all other Shareholders at least ten (10) Business Days prior to the closing of the Drag-Along Sale.

3.3  The purchase price in any Drag-Along Sale shall be allocated among all Shareholders on a pro rata basis.


SECTION 4 — TAG-ALONG RIGHTS

4.1  If any Shareholder (the "Selling Shareholder") proposes to Transfer any Shares to a third party, each other Shareholder (the "Tag-Along Shareholder") shall have the right to participate in such Transfer by selling a proportionate number of their Shares on the same terms and conditions.

4.2  The Selling Shareholder shall provide written notice to all other Shareholders at least twenty (20) Business Days prior to the proposed Transfer, which notice shall include the identity of the proposed purchaser and the proposed price per Share.


SECTION 5 — SHOTGUN BUY-SELL PROVISION

5.1  At any time after the second (2nd) anniversary of this Agreement, any Shareholder (the "Initiating Shareholder") may deliver to the other Shareholder(s) (the "Receiving Shareholder(s)") a notice (the "Shotgun Notice") offering to either:
    (a) purchase all of the Shares held by the Receiving Shareholder(s) at a specified price per Share (the "Offer Price"); or
    (b) sell all of the Shares held by the Initiating Shareholder to the Receiving Shareholder(s) at the Offer Price.

5.2  The Receiving Shareholder(s) shall have thirty (30) calendar days following receipt of the Shotgun Notice to elect to either sell or purchase at the Offer Price.

5.3  If the Receiving Shareholder(s) fail to respond within the thirty (30) day period, they shall be deemed to have elected to sell their Shares at the Offer Price.


SECTION 6 — RESTRICTIVE COVENANTS

6.1  Non-Competition. Each Shareholder agrees that, during the term of this Agreement and for a period of three (3) years following the date on which such Shareholder ceases to hold any Shares, such Shareholder shall not, directly or indirectly, engage in, participate in, or assist any business that competes with the Business anywhere within Canada.

6.2  Non-Solicitation. Each Shareholder agrees that, during the term of this Agreement and for a period of two (2) years thereafter, they shall not solicit or attempt to solicit any employee, contractor, client, or customer of the Corporation.


SECTION 7 — INTELLECTUAL PROPERTY

7.1  Each Shareholder hereby assigns to the Corporation all right, title, and interest in and to any intellectual property developed in connection with the Business.

7.2  Any intellectual property created by a Shareholder that relates to the Corporation's field of activity shall be presumed to have been developed in connection with the Business unless the Shareholder can demonstrate otherwise.

7.3  The Corporation shall own all intellectual property developed by any employee, contractor, or agent of the Corporation in the course of their engagement.


SECTION 8 — TERMINATION

8.1  This Agreement shall terminate upon the earliest of:
    (a) the written consent of all Parties;
    (b) the dissolution or winding-up of the Corporation;
    (c) all Shares becoming held by a single Shareholder.

8.2  Upon termination, the rights and obligations of the Parties under Sections 6 and 7 shall survive.


SECTION 9 — DISPUTE RESOLUTION

9.1  Any dispute arising out of or in connection with this Agreement shall first be submitted to mediation.

9.2  If mediation fails to resolve the dispute within sixty (60) days, either Party may submit the dispute to binding arbitration in accordance with the Arbitration Act, 1991 (Ontario).


SECTION 10 — GENERAL PROVISIONS

10.1  Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein.

10.2  Entire Agreement. This Agreement constitutes the entire agreement between the Parties.

10.3  Notices. Any notice under this Agreement shall be in writing and delivered to the addresses set forth above.

10.4  Severability. If any provision is held to be invalid, the remaining provisions shall continue in full force and effect.


IN WITNESS WHEREOF the Parties have executed this Agreement as of the date first above written.


JAMES ARTHUR WELLINGTON

Per: ________________
Name: James Arthur Wellington
Title: Founder A
Date:


PRIYA SHARMA

Per: ________________
Name: Priya Sharma
Title: Founder B
Date:


MAPLE LEAF TECHNOLOGIES INC.

Per: ________________
Name:
Title: Authorized Signatory
Date:`,
  },
  qc2: {
    title: 'EXECUTIVE EMPLOYMENT AGREEMENT',
    date: 'March 25, 2026',
    content: `EXECUTIVE EMPLOYMENT AGREEMENT

THIS EXECUTIVE EMPLOYMENT AGREEMENT (the "Agreement") is made effective as of the 25th day of March, 2026.

BETWEEN:

    NORTHERN PEAK SOFTWARE INC. (the "Employer"), a corporation incorporated under the Canada Business Corporations Act;

    AND

    DAVID CHEN (the "Executive"), an individual residing in Toronto, Ontario.

(collectively, the "Parties" and individually, a "Party")

RECITALS

A. The Employer is a technology company specializing in enterprise SaaS solutions with offices in Toronto, Ontario.
B. The Employer wishes to employ the Executive as its Chief Technology Officer, and the Executive wishes to accept such employment, on the terms and conditions set out herein.


SECTION 1 — POSITION AND DUTIES

1.1  Position. The Executive shall serve as Chief Technology Officer ("CTO") of the Employer, reporting directly to the Chief Executive Officer.

1.2  Duties. The Executive shall:
    (a) oversee all technology strategy and development operations;
    (b) manage the engineering and product development teams;
    (c) advise the Board on technology-related matters;
    (d) perform such other duties as reasonably assigned by the CEO.

1.3  Full-Time Service. The Executive shall devote substantially all of their working time, attention, and energy to the performance of their duties hereunder.


SECTION 2 — TERM

2.1  This Agreement shall commence on April 1, 2026 (the "Start Date") and continue for an indefinite term until terminated in accordance with Section 7 of this Agreement.


SECTION 3 — COMPENSATION

3.1  Base Salary. The Executive shall receive an annual base salary of $285,000 (the "Base Salary"), payable in accordance with the Employer's regular payroll schedule, less all applicable statutory deductions.

3.2  Signing Bonus. The Executive shall receive a one-time signing bonus of $40,000, payable within thirty (30) days of the Start Date.

3.3  Annual Bonus. The Executive shall be eligible for an annual performance bonus of up to 30% of the Base Salary, as determined by the Board in its sole discretion based on achievement of mutually agreed-upon performance targets.


SECTION 4 — EQUITY

4.1  Stock Options. Subject to Board approval, the Executive shall be granted options to purchase 150,000 Class A Common Shares of the Employer at an exercise price equal to the fair market value on the date of grant.

4.2  Vesting. The stock options shall vest over a period of four (4) years, with 25% vesting on the first anniversary of the Start Date and the remainder vesting in equal monthly installments over the following thirty-six (36) months.

4.3  Change of Control. In the event of a Change of Control (as defined below), all unvested options shall immediately vest in full.

    "Change of Control" means any transaction or series of transactions resulting in: (a) any person or group acquiring more than 50% of the voting shares of the Employer; or (b) the sale of all or substantially all of the assets of the Employer.


SECTION 5 — BENEFITS AND PERQUISITES

5.1  Benefits. The Executive shall be entitled to participate in all employee benefit plans maintained by the Employer, including health, dental, vision, and life insurance coverage.

5.2  Vacation. The Executive shall be entitled to four (4) weeks of paid vacation per year, to be taken at times mutually agreed upon with the CEO.

5.3  Professional Development. The Employer shall reimburse the Executive for reasonable professional development expenses up to $10,000 per year.

5.4  Equipment. The Employer shall provide the Executive with necessary equipment for the performance of their duties.


SECTION 6 — RESTRICTIVE COVENANTS

6.1  Confidentiality. The Executive shall not, during or after employment, disclose any Confidential Information of the Employer to any third party. "Confidential Information" includes all non-public information relating to the Employer's business, technology, clients, finances, and operations.

6.2  Non-Competition. During employment and for a period of twenty-four (24) months following termination for any reason, the Executive shall not, directly or indirectly, be employed by, consult for, or have any interest in any business that is competitive with the Employer's business within any province or territory in Canada where the Employer conducts business.

6.3  Non-Solicitation. During employment and for a period of eighteen (18) months following termination, the Executive shall not directly or indirectly solicit any employee, consultant, client, or customer of the Employer.

6.4  Intellectual Property Assignment. All inventions, developments, improvements, and works of authorship conceived or created by the Executive during employment shall be the sole and exclusive property of the Employer.


SECTION 7 — TERMINATION

7.1  Termination by the Employer for Cause. The Employer may terminate the Executive's employment immediately for Cause. "Cause" means:
    (a) willful misconduct or gross negligence;
    (b) material breach of this Agreement;
    (c) conviction of an indictable offence;
    (d) fraud or dishonesty in connection with the Employer's business.

7.2  Termination by the Employer without Cause. The Employer may terminate the Executive's employment at any time without Cause by providing the Executive with:
    (a) payment in lieu of any minimum notice period and severance pay required by the Ontario Employment Standards Act, 2000 (the "ESA").

7.3  Termination by the Executive. The Executive may terminate their employment at any time by providing the Employer with written notice.

7.4  Resignation for Good Reason. The Executive may resign for Good Reason if, without the Executive's prior written consent:
    (a) there is a material diminution in the Executive's position, duties, or responsibilities;
    (b) the Executive's Base Salary is reduced by more than 10%;
    (c) the Executive's primary work location is relocated by more than 50 km.

    In the event of a resignation for Good Reason, the Executive shall be entitled to the same severance as set out in Section 7.2.


SECTION 8 — GARDEN LEAVE

8.1  Upon giving or receiving notice of termination, the Employer may, at its sole discretion, require the Executive to remain away from the Employer's premises and refrain from performing duties for all or part of the notice period (the "Garden Leave Period"), while continuing to receive Base Salary and benefits.


SECTION 9 — GENERAL PROVISIONS

9.1  Governing Law. This Agreement shall be governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein.

9.2  Entire Agreement. This Agreement constitutes the entire agreement between the Parties.

9.3  Amendment. No amendment to this Agreement shall be effective unless made in writing and signed by both Parties.

9.4  Severability. If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.

9.5  Independent Legal Advice. The Executive acknowledges that they have been advised to obtain independent legal advice prior to executing this Agreement.


IN WITNESS WHEREOF the Parties have executed this Agreement as of the date first above written.


NORTHERN PEAK SOFTWARE INC.

Per: ________________
Name:
Title: Authorized Signatory
Date:


DAVID CHEN

Per: ________________
Name: David Chen
Title: Executive
Date:`,
  },
};

const QUALIFICATION_ISSUES: Record<string, { id: string; label: string; isReal: boolean }[]> = {
  qc1: [
    { id: 'drag-threshold', label: 'Drag-along threshold is too low at 51% (should be 66.67% or higher for a 2-party equal split)', isReal: true },
    { id: 'shotgun-notice', label: 'Shotgun notice period of 30 calendar days is too short (should specify Business Days or extend period)', isReal: true },
    { id: 'non-compete-scope', label: 'Non-compete geographic scope (all of Canada) and duration (3 years) is likely unenforceable in Ontario', isReal: true },
    { id: 'ip-assignment', label: 'IP assignment clause in s.7.2 creates an overbroad presumption — reverses burden of proof onto Shareholder', isReal: true },
    { id: 'no-preemptive', label: 'No pre-emptive rights on new share issuances despite requiring unanimous consent for issuance', isReal: true },
    { id: 'no-deadlock', label: 'No deadlock resolution mechanism despite requiring unanimous Board quorum (3 of 3)', isReal: true },
    { id: 'fmv-gap', label: 'Fair Market Value determination lacks detail on valuation methodology and cost allocation', isReal: true },
    { id: 'drag-notice', label: 'Drag-along notice period of 10 Business Days is too short for such a significant transaction', isReal: true },
    { id: 'false-dividends', label: 'Dividend provisions are unreasonably restrictive', isReal: false },
    { id: 'false-quorum', label: 'Board quorum requirements violate the OBCA', isReal: false },
  ],
  qc2: [
    { id: 'termination-notice', label: 'Section 7.2 limits termination pay to ESA minimums only — no common law reasonable notice or severance package specified', isReal: true },
    { id: 'non-compete-duration', label: 'Non-compete of 24 months post-termination is likely unenforceable in Ontario (typically max 12 months)', isReal: true },
    { id: 'non-compete-scope', label: 'Non-compete geographic scope ("any province where Employer conducts business") is overbroad', isReal: true },
    { id: 'resignation-notice', label: 'Section 7.3 does not specify a required notice period for Executive resignation', isReal: true },
    { id: 'good-reason-cure', label: 'Good Reason resignation has no cure period for the Employer to remedy the triggering event', isReal: true },
    { id: 'change-control-accel', label: 'Single-trigger acceleration on Change of Control (Section 4.3) with no double-trigger alternative', isReal: true },
    { id: 'signing-bonus-claw', label: 'No clawback provision on the $40,000 signing bonus if Executive leaves within first year', isReal: true },
    { id: 'ip-scope', label: 'IP assignment clause (s.6.4) does not exclude pre-existing IP or personal projects unrelated to business', isReal: true },
    { id: 'false-salary', label: 'Base salary is below market rate for a CTO position', isReal: false },
    { id: 'false-vacation', label: 'Four weeks vacation violates Ontario minimum standards', isReal: false },
  ],
};

/* ═══════════════════════════════════════════════════════
   DEMO DATA
   ═══════════════════════════════════════════════════════ */

const DEMO_LAWYER = {
  name: 'Sarah Chen',
  designation: 'Barrister & Solicitor',
  barNumber: '78432A',
  province: 'Ontario',
  practiceAreas: ['Corporate/Commercial', 'Securities', 'IP'],
  jurisdictions: ['Ontario', 'British Columbia'],
  casesCompleted: 47,
  avgRating: 4.42,
  responseTime: '2.4h',
  monthlyEarnings: 8350,
  currentTier: 'Complex' as CaseTier,
  availability: 'available' as AvailabilityStatus,
  maxConcurrent: 5,
  activeCaseCount: 3,
  bio: 'Experienced corporate lawyer with a focus on startup financing, shareholder agreements, and IP protection. 12+ years of practice in Ontario and BC.',
  ratings: {
    clientSatisfaction: 4.6,
    reviewQuality: 4.3,
    turnaroundTime: 4.5,
    approvalAccuracy: 4.1,
    communication: 4.6,
  },
};

const TIER_THRESHOLDS = [
  { name: 'Standard' as CaseTier, minCases: 0, minRating: 0, label: 'Basic agreements', color: 'bg-neutral-100 text-neutral-700' },
  { name: 'Intermediate' as CaseTier, minCases: 11, minRating: 4.0, label: 'Mid-complexity', color: 'bg-blue-50 text-blue-700' },
  { name: 'Complex' as CaseTier, minCases: 31, minRating: 4.3, label: 'Complex transactions', color: 'bg-amber-50 text-amber-700' },
  { name: 'Expert' as CaseTier, minCases: 76, minRating: 4.5, label: 'All work types', color: 'bg-rose-50 text-[#be123c]' },
];

const AVAILABLE_CASES: AvailableCase[] = [
  { id: 'ac1', agreementType: 'Shareholder Agreement', jurisdiction: 'Ontario', tier: 'Complex', estimatedHours: 4, fee: 442, deadline: '2026-04-07', clientAnon: 'Client #4821', description: 'Multi-party SHA with drag-along, tag-along, and shotgun provisions. 3 share classes.', matchScore: 97, practiceArea: 'Corporate/Commercial', modRef: '#MOD-2026-0901' },
  { id: 'ac2', agreementType: 'Convertible Note', jurisdiction: 'Ontario', tier: 'Intermediate', estimatedHours: 2, fee: 221, deadline: '2026-04-08', clientAnon: 'Client #3192', description: 'Standard post-money SAFE conversion with $5M cap. Single modification to discount rate.', matchScore: 94, practiceArea: 'Securities', modRef: '#MOD-2026-0902' },
  { id: 'ac3', agreementType: 'IP Assignment Agreement', jurisdiction: 'British Columbia', tier: 'Standard', estimatedHours: 1.5, fee: 143, deadline: '2026-04-09', clientAnon: 'Client #7734', description: 'Founder IP assignment to incorporated entity. Standard moral rights waiver.', matchScore: 91, practiceArea: 'IP', modRef: '#MOD-2026-0903' },
  { id: 'ac4', agreementType: 'SAFE Agreement', jurisdiction: 'Ontario', tier: 'Standard', estimatedHours: 1, fee: 117, deadline: '2026-04-10', clientAnon: 'Client #5501', description: 'Post-money SAFE, $3M cap, 20% discount. No special provisions.', matchScore: 88, practiceArea: 'Securities', modRef: '#MOD-2026-0904' },
  { id: 'ac5', agreementType: 'Executive Employment', jurisdiction: 'British Columbia', tier: 'Complex', estimatedHours: 5, fee: 553, deadline: '2026-04-06', clientAnon: 'Client #2290', description: 'C-suite employment agreement with equity provisions, change-of-control triggers, and garden leave.', matchScore: 85, practiceArea: 'Employment', modRef: '#MOD-2026-0905' },
  { id: 'ac6', agreementType: 'Subscription Agreement', jurisdiction: 'Ontario', tier: 'Intermediate', estimatedHours: 3, fee: 273, deadline: '2026-04-08', clientAnon: 'Client #6618', description: 'Series A subscription with anti-dilution provisions and board observer rights.', matchScore: 82, practiceArea: 'Securities', modRef: '#MOD-2026-0906' },
  { id: 'ac7', agreementType: 'Shareholder Agreement', jurisdiction: 'Alberta', tier: 'Standard', estimatedHours: 2, fee: 182, deadline: '2026-04-11', clientAnon: 'Client #9043', description: '2-party equal split SHA with standard ROFR and buy-sell provisions.', matchScore: 65, practiceArea: 'Corporate/Commercial', modRef: '#MOD-2026-0907' },
];

const ACTIVE_CASES: ActiveCase[] = [
  { id: 'atc1', agreementType: 'Convertible Note', jurisdiction: 'Ontario', tier: 'Complex', fee: 442, deadline: '2026-04-05', clientAnon: 'Client #3318', description: 'Interest rate changed from 5% to 8% with new qualified financing threshold. Maturity shortened.', status: 'In Review', progress: 65, acceptedAt: '2026-04-02', modRef: '#MOD-2026-0832' },
  { id: 'atc2', agreementType: 'Shareholder Agreement', jurisdiction: 'British Columbia', tier: 'Complex', fee: 553, deadline: '2026-04-06', clientAnon: 'Client #2145', description: 'Drag-along threshold lowered to 60%. New shotgun clause added. BC regulatory considerations.', status: 'Revision Requested', progress: 40, acceptedAt: '2026-04-01', modRef: '#MOD-2026-0851' },
  { id: 'atc3', agreementType: 'IP Assignment Agreement', jurisdiction: 'Ontario', tier: 'Standard', fee: 143, deadline: '2026-04-08', clientAnon: 'Client #8892', description: 'Scope of assigned IP broadened to include future works and derivative creations.', status: 'Submitted', progress: 95, acceptedAt: '2026-04-03', modRef: '#MOD-2026-0860' },
];

const COMPLETED_CASES: CompletedCase[] = [
  { id: 'cc1', agreementType: 'SAFE Agreement', jurisdiction: 'Ontario', tier: 'Standard', fee: 117, completedAt: '2026-04-01', clientAnon: 'Client #4421', rating: 5.0, timeToComplete: '1.2h', modRef: '#MOD-2026-0810' },
  { id: 'cc2', agreementType: 'Executive Employment', jurisdiction: 'Ontario', tier: 'Complex', fee: 553, completedAt: '2026-03-29', clientAnon: 'Client #3390', rating: 4.8, timeToComplete: '4.5h', modRef: '#MOD-2026-0798' },
  { id: 'cc3', agreementType: 'Shareholder Agreement', jurisdiction: 'British Columbia', tier: 'Complex', fee: 442, completedAt: '2026-03-27', clientAnon: 'Client #7712', rating: 4.2, timeToComplete: '5.1h', modRef: '#MOD-2026-0785' },
  { id: 'cc4', agreementType: 'Convertible Note', jurisdiction: 'Ontario', tier: 'Intermediate', fee: 221, completedAt: '2026-03-25', clientAnon: 'Client #2258', rating: 4.5, timeToComplete: '2.0h', modRef: '#MOD-2026-0771' },
  { id: 'cc5', agreementType: 'IP Assignment Agreement', jurisdiction: 'Ontario', tier: 'Standard', fee: 143, completedAt: '2026-03-23', clientAnon: 'Client #5590', rating: 4.7, timeToComplete: '1.5h', modRef: '#MOD-2026-0760' },
  { id: 'cc6', agreementType: 'Subscription Agreement', jurisdiction: 'Ontario', tier: 'Intermediate', fee: 273, completedAt: '2026-03-20', clientAnon: 'Client #8834', rating: 4.0, timeToComplete: '3.2h', modRef: '#MOD-2026-0748' },
  { id: 'cc7', agreementType: 'Vendor Agreement', jurisdiction: 'British Columbia', tier: 'Standard', fee: 182, completedAt: '2026-03-18', clientAnon: 'Client #1123', rating: 4.6, timeToComplete: '2.1h', modRef: '#MOD-2026-0735' },
  { id: 'cc8', agreementType: 'SAFE Agreement', jurisdiction: 'Ontario', tier: 'Standard', fee: 117, completedAt: '2026-03-15', clientAnon: 'Client #9901', rating: 5.0, timeToComplete: '0.8h', modRef: '#MOD-2026-0722' },
];

const PAYOUT_HISTORY: PayoutRecord[] = [
  { id: 'p1', date: '2026-03-31', amount: 2784.00, cases: 8, method: 'Direct Deposit', status: 'Paid' },
  { id: 'p2', date: '2026-03-15', amount: 2439.00, cases: 7, method: 'Direct Deposit', status: 'Paid' },
  { id: 'p3', date: '2026-02-28', amount: 3329.00, cases: 10, method: 'Direct Deposit', status: 'Paid' },
  { id: 'p4', date: '2026-02-15', amount: 1888.00, cases: 6, method: 'Direct Deposit', status: 'Paid' },
];

const QUALIFICATION_CASES: QualificationCase[] = [
  { id: 'qc1', title: 'Sample Shareholder Agreement Review', description: 'Review a 2-party SHA with drag-along and shotgun provisions. Identify all material issues and provide a risk summary.', status: 'pending' },
  { id: 'qc2', title: 'Sample Employment Agreement Review', description: 'Review an executive employment agreement with non-compete and change-of-control clauses. Flag regulatory concerns.', status: 'pending' },
];

const NOTIFICATION_PREFS = [
  { key: 'newCaseMatches', label: 'New case matches' },
  { key: 'caseUpdates', label: 'Case updates' },
  { key: 'paymentReceived', label: 'Payment received' },
  { key: 'ratingReceived', label: 'Rating received' },
  { key: 'systemAnnouncements', label: 'System announcements' },
  { key: 'deadlineReminders', label: 'Deadline reminders' },
  { key: 'tierAdvancement', label: 'Tier advancement' },
  { key: 'weeklyDigest', label: 'Weekly digest' },
  { key: 'qualificationUpdates', label: 'Qualification updates' },
];

/* ═══════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════ */

const inputClass = "w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] transition-all";
const selectClass = "w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] bg-white transition-all";

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${sizeClass} ${star <= Math.round(rating) ? 'text-amber-400' : 'text-neutral-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function MatchBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : score >= 80 ? 'bg-blue-50 text-blue-700 border-blue-200' : score >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-neutral-50 text-neutral-600 border-neutral-200';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${color}`}>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
      {score}% match
    </span>
  );
}

function TierBadge({ tier }: { tier: CaseTier }) {
  const t = TIER_THRESHOLDS.find((tt) => tt.name === tier);
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t?.color || 'bg-neutral-100 text-neutral-700'}`}>{tier}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'In Review': 'bg-blue-50 text-blue-700 border-blue-200',
    'Revision Requested': 'bg-amber-50 text-amber-700 border-amber-200',
    'Submitted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Paid': 'bg-emerald-50 text-emerald-700',
    'Pending': 'bg-amber-50 text-amber-700',
    'Processing': 'bg-blue-50 text-blue-700',
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors[status] || 'bg-neutral-50 text-neutral-600 border-neutral-200'}`}>{status}</span>;
}

function ProgressBar({ value, max = 100, color = 'bg-[#be123c]' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function SpinnerIcon() {
  return <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>;
}

/* ═══════════════════════════════════════════════════════
   AUTH GATE
   ═══════════════════════════════════════════════════════ */

function AuthGate({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); onLogin(); }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#faf9f7]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#be123c]/10 mb-4">
            <svg className="h-6 w-6 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">Ruby Lawyer Marketplace</h1>
          <p className="text-neutral-500 mt-1 text-sm">Review pipeline for licensed Canadian lawyers</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
          {mode === 'login' ? (
            <>
              <h2 className="font-serif text-xl font-semibold text-neutral-900 mb-6">Sign In</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                  <input type="email" placeholder="counsel@lawfirm.ca" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                  <input type="password" placeholder="Enter password" className={inputClass} />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#be123c] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#9f1239] disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                  {isSubmitting ? <span className="inline-flex items-center gap-2"><SpinnerIcon /> Signing in...</span> : 'Sign In'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => setMode('register')} className="text-sm text-[#be123c] hover:text-[#9f1239] font-medium transition-colors">
                  Register as a Reviewer &rarr;
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setMode('login')} className="text-neutral-400 hover:text-neutral-700 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <h2 className="font-serif text-xl font-semibold text-neutral-900">Register as a Reviewer</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Legal Name</label>
                  <input type="text" placeholder="e.g. Jane Doe, B.A., J.D." className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                  <input type="email" placeholder="counsel@lawfirm.ca" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Law Society Number</label>
                  <input type="text" placeholder="e.g. 12345A" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jurisdiction</label>
                  <select value={selectedJurisdiction} onChange={(e) => setSelectedJurisdiction(e.target.value)} className={selectClass}>
                    <option value="">Select province or territory</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Designation</label>
                  <select value={selectedDesignation} onChange={(e) => setSelectedDesignation(e.target.value)} className={selectClass}>
                    <option value="">Select designation</option>
                    {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Practice Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {PRACTICE_AREAS.map((area) => (
                      <button key={area} type="button" onClick={() => toggleArea(area)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${selectedAreas.includes(area) ? 'bg-[#be123c] text-white border-[#be123c] shadow-sm' : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#be123c]/40 hover:bg-[#be123c]/5'}`}>
                        {selectedAreas.includes(area) && <span className="mr-1">&#10003;</span>}
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                  <input type="password" placeholder="Create password (min. 10 characters)" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm Password</label>
                  <input type="password" placeholder="Re-enter password" className={inputClass} />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#be123c] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#9f1239] disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                  {isSubmitting ? <span className="inline-flex items-center gap-2"><SpinnerIcon /> Creating account...</span> : 'Create Account'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => setMode('login')} className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">Already have an account? Sign in</button>
              </div>
            </>
          )}
        </div>
        <p className="text-center text-xs text-neutral-400 mt-6">Demo mode — click Sign In or Create Account to continue.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ONBOARDING FLOW
   ═══════════════════════════════════════════════════════ */

function OnboardingFlow({ gate, onAdvance }: { gate: OnboardingGate; onAdvance: (next: OnboardingGate) => void }) {
  const [province, setProvince] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [lawSocietyVerified, setLawSocietyVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [qualCases, setQualCases] = useState<QualificationCase[]>(QUALIFICATION_CASES);
  const [qualReviews, setQualReviews] = useState<Record<string, QualificationReview>>({});
  const [gradingProgress, setGradingProgress] = useState<Record<string, number>>({});

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]);
  };

  const handleGate1Submit = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setLawSocietyVerified(true);
      setIdentityVerified(true);
      setInsuranceVerified(true);
      setIsVerifying(false);
      setTimeout(() => onAdvance('gate2'), 600);
    }, 1500);
  };

  const handleStartQualCase = (id: string) => {
    setQualCases((prev) => prev.map((c) => c.id === id ? { ...c, status: 'in-progress' as const } : c));
    setQualReviews((prev) => ({
      ...prev,
      [id]: { issuesFound: {}, recommendedChanges: '', overallQuality: 0, additionalNotes: '' },
    }));
  };

  const updateQualReview = (id: string, update: Partial<QualificationReview>) => {
    setQualReviews((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...update },
    }));
  };

  const toggleIssue = (caseId: string, issueId: string) => {
    setQualReviews((prev) => ({
      ...prev,
      [caseId]: {
        ...prev[caseId],
        issuesFound: {
          ...prev[caseId].issuesFound,
          [issueId]: !prev[caseId].issuesFound[issueId],
        },
      },
    }));
  };

  const handleSubmitQualCase = (id: string) => {
    setQualCases((prev) => prev.map((c) => c.id === id ? { ...c, status: 'grading' as const } : c));
    setGradingProgress((prev) => ({ ...prev, [id]: 0 }));

    // Animate grading progress
    const steps = [10, 25, 40, 55, 70, 85, 95, 100];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setGradingProgress((prev) => ({ ...prev, [id]: step }));
      }, (i + 1) * 400);
    });

    // After grading animation completes, mark as passed
    setTimeout(() => {
      setQualCases((prev) => {
        const updated = prev.map((c) => c.id === id ? { ...c, status: 'passed' as const } : c);
        if (updated.every((c) => c.status === 'passed')) {
          setTimeout(() => onAdvance('complete'), 1000);
        }
        return updated;
      });
    }, steps.length * 400 + 600);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#be123c]/10 flex items-center justify-center">
              <svg className="h-4 w-4 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
            </div>
            <span className="font-serif text-lg font-bold text-neutral-900">Ruby</span>
          </Link>
          <span className="text-sm text-neutral-500">Lawyer Onboarding</span>
        </div>
      </header>

      <div className={`mx-auto px-6 py-12 ${gate === 'gate2' ? 'max-w-4xl' : 'max-w-2xl'}`}>
        {/* Progress indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-700">Onboarding Progress</span>
            <span className="text-sm text-neutral-500">{gate === 'gate1' ? 'Step 1 of 2' : 'Step 2 of 2'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className={`h-2 rounded-full transition-all duration-500 ${gate === 'gate1' ? 'bg-[#be123c]' : 'bg-[#be123c]'}`} />
              <p className="text-xs text-neutral-500 mt-1.5">Automated Verification</p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${gate === 'gate2' ? 'bg-[#be123c] text-white' : 'bg-neutral-200 text-neutral-500'}`}>
              {gate === 'gate2' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : '2'}
            </div>
            <div className="flex-1">
              <div className={`h-2 rounded-full transition-all duration-500 ${gate === 'gate2' ? 'bg-[#be123c]' : 'bg-neutral-200'}`} />
              <p className="text-xs text-neutral-500 mt-1.5">Qualification Review</p>
            </div>
          </div>
        </div>

        {gate === 'gate1' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-2">Automated Verification</h2>
              <p className="text-neutral-500 text-sm">We need to verify your credentials before you can access the marketplace.</p>
            </div>

            {/* Law Society Verification */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${lawSocietyVerified ? 'bg-emerald-50' : 'bg-neutral-50'}`}>
                  {lawSocietyVerified ? (
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Law Society Verification</h3>
                  <p className="text-xs text-neutral-500">{lawSocietyVerified ? 'Verified' : 'Pending verification'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Province / Territory</label>
                  <select value={province} onChange={(e) => setProvince(e.target.value)} className={selectClass}>
                    <option value="">Select your law society jurisdiction</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Bar Number / Law Society ID</label>
                  <input type="text" value={barNumber} onChange={(e) => setBarNumber(e.target.value)} placeholder="e.g. 78432A" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Practice Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {PRACTICE_AREAS.map((area) => (
                      <button key={area} type="button" onClick={() => toggleArea(area)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${selectedAreas.includes(area) ? 'bg-[#be123c] text-white border-[#be123c] shadow-sm' : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#be123c]/40 hover:bg-[#be123c]/5'}`}>
                        {selectedAreas.includes(area) && <span className="mr-1">&#10003;</span>}
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Verification */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${identityVerified ? 'bg-emerald-50' : 'bg-neutral-50'}`}>
                  {identityVerified ? (
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Identity Verification</h3>
                  <p className="text-xs text-neutral-500">{identityVerified ? 'Verified' : 'Government-issued ID required'}</p>
                </div>
              </div>
              <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-lg p-6 text-center">
                <svg className="w-8 h-8 text-neutral-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                <p className="text-sm text-neutral-500">Upload a photo of your government-issued ID</p>
                <p className="text-xs text-neutral-400 mt-1">Auto-verified in demo mode</p>
              </div>
            </div>

            {/* Insurance Verification */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${insuranceVerified ? 'bg-emerald-50' : 'bg-neutral-50'}`}>
                  {insuranceVerified ? (
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Professional Liability Insurance</h3>
                  <p className="text-xs text-neutral-500">{insuranceVerified ? 'Verified' : 'Proof of insurance required'}</p>
                </div>
              </div>
              <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-lg p-6 text-center">
                <svg className="w-8 h-8 text-neutral-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                <p className="text-sm text-neutral-500">Upload your insurance certificate</p>
                <p className="text-xs text-neutral-400 mt-1">Auto-verified in demo mode</p>
              </div>
            </div>

            <button onClick={handleGate1Submit} disabled={isVerifying}
              className="w-full bg-[#be123c] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#9f1239] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm">
              {isVerifying ? (
                <span className="inline-flex items-center gap-2"><SpinnerIcon /> Verifying credentials...</span>
              ) : 'Verify & Continue'}
            </button>
          </div>
        )}

        {gate === 'gate2' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-2">Qualification Review</h2>
              <p className="text-neutral-500 text-sm">Complete these sample reviews to demonstrate your review quality. These are graded by our quality team.</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <div>
                <p className="text-sm font-medium text-emerald-800">Gate 1 Complete</p>
                <p className="text-xs text-emerald-600 mt-0.5">Law society, identity, and insurance verified successfully.</p>
              </div>
            </div>

            {qualCases.map((qc) => {
              const doc = MOCK_AGREEMENT_DOCS[qc.id];
              const issues = QUALIFICATION_ISSUES[qc.id] || [];
              const review = qualReviews[qc.id];

              return (
                <div key={qc.id} className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-neutral-100">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">{qc.title}</h3>
                        <p className="text-xs text-neutral-500 mt-1">{qc.description}</p>
                      </div>
                      <span className={`shrink-0 ml-4 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        qc.status === 'passed' ? 'bg-emerald-50 text-emerald-700' :
                        qc.status === 'grading' ? 'bg-purple-50 text-purple-700' :
                        qc.status === 'in-progress' ? 'bg-amber-50 text-amber-700' :
                        'bg-neutral-50 text-neutral-600'
                      }`}>
                        {qc.status === 'passed' ? 'Passed' : qc.status === 'grading' ? 'Grading...' : qc.status === 'in-progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Pending state */}
                  {qc.status === 'pending' && (
                    <div className="p-6">
                      <button onClick={() => handleStartQualCase(qc.id)} className="bg-[#be123c] text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-[#9f1239] transition-all">
                        Start Review
                      </button>
                    </div>
                  )}

                  {/* In-progress: Document + Review Form */}
                  {qc.status === 'in-progress' && doc && review && (
                    <div className="p-6 space-y-6">
                      {/* Document Preview */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-[#be123c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                          <h4 className="text-sm font-semibold text-neutral-900">Agreement Document</h4>
                          <span className="text-xs text-neutral-400 ml-auto">{doc.date}</span>
                        </div>
                        <div className="border border-neutral-200 rounded-xl bg-[#fdfcfb] overflow-hidden">
                          <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-2 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                            <span className="text-xs text-neutral-400 ml-2 font-mono">{doc.title}</span>
                          </div>
                          <div className="max-h-[480px] overflow-y-auto p-6 md:p-8">
                            <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-neutral-800">{doc.content}</pre>
                          </div>
                        </div>
                      </div>

                      {/* Review Form */}
                      <div className="border-t border-neutral-100 pt-6">
                        <h4 className="font-serif text-lg font-semibold text-neutral-900 mb-4">Your Review</h4>

                        {/* Issue Flags */}
                        <div className="mb-5">
                          <label className="block text-sm font-medium text-neutral-700 mb-2">Issues Identified</label>
                          <p className="text-xs text-neutral-500 mb-3">Select all material issues you have identified in this agreement. Some items may not be genuine issues.</p>
                          <div className="space-y-2">
                            {issues.map((issue) => (
                              <label key={issue.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${review.issuesFound[issue.id] ? 'border-[#be123c]/30 bg-[#be123c]/5' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
                                <input
                                  type="checkbox"
                                  checked={!!review.issuesFound[issue.id]}
                                  onChange={() => toggleIssue(qc.id, issue.id)}
                                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#be123c] focus:ring-[#be123c]/20 accent-[#be123c]"
                                />
                                <span className="text-sm text-neutral-700">{issue.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Recommended Changes */}
                        <div className="mb-5">
                          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Recommended Changes</label>
                          <p className="text-xs text-neutral-500 mb-2">Describe your recommended revisions and remediation steps for the issues you identified.</p>
                          <textarea
                            value={review.recommendedChanges}
                            onChange={(e) => updateQualReview(qc.id, { recommendedChanges: e.target.value })}
                            placeholder="e.g., Section 3.1 — Increase drag-along threshold to 66.67% to prevent a single founder from triggering a forced sale. Section 6.1 — Narrow non-compete to the GTA and reduce duration to 12 months..."
                            className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] transition-all h-32 resize-none"
                          />
                        </div>

                        {/* Overall Quality Rating */}
                        <div className="mb-5">
                          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Overall Draft Quality</label>
                          <p className="text-xs text-neutral-500 mb-3">Rate the overall quality of this draft agreement.</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateQualReview(qc.id, { overallQuality: star })}
                                className="transition-transform hover:scale-110"
                              >
                                <svg className={`w-7 h-7 ${star <= review.overallQuality ? 'text-amber-400' : 'text-neutral-200'} transition-colors`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </button>
                            ))}
                            <span className="ml-2 text-xs text-neutral-500">
                              {review.overallQuality === 0 ? 'Not rated' : ['', 'Poor', 'Below Average', 'Acceptable', 'Good', 'Excellent'][review.overallQuality]}
                            </span>
                          </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="mb-5">
                          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Additional Notes (Optional)</label>
                          <textarea
                            value={review.additionalNotes}
                            onChange={(e) => updateQualReview(qc.id, { additionalNotes: e.target.value })}
                            placeholder="Any other observations, risk factors, or compliance considerations..."
                            className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] transition-all h-20 resize-none"
                          />
                        </div>

                        {/* Submit */}
                        <button
                          onClick={() => handleSubmitQualCase(qc.id)}
                          disabled={Object.values(review.issuesFound).filter(Boolean).length === 0 || !review.recommendedChanges.trim() || review.overallQuality === 0}
                          className="w-full bg-[#be123c] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#9f1239] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          Submit Review for Grading
                        </button>
                        <p className="text-xs text-neutral-400 text-center mt-2">You must flag at least one issue, provide recommendations, and rate the draft to submit.</p>
                      </div>
                    </div>
                  )}

                  {/* Grading animation */}
                  {qc.status === 'grading' && (
                    <div className="p-6">
                      <div className="flex flex-col items-center py-6">
                        <div className="relative mb-4">
                          <svg className="animate-spin h-10 w-10 text-[#be123c]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-neutral-900 mb-1">Grading your review...</p>
                        <p className="text-xs text-neutral-500 mb-4">AI quality assessment in progress</p>
                        <div className="w-full max-w-xs">
                          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#be123c] transition-all duration-300"
                              style={{ width: `${gradingProgress[qc.id] || 0}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1.5">
                            <span className="text-xs text-neutral-400">Analyzing responses</span>
                            <span className="text-xs text-neutral-500 font-medium">{gradingProgress[qc.id] || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Passed state */}
                  {qc.status === 'passed' && (
                    <div className="p-6">
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">Review Passed</p>
                          <p className="text-xs text-emerald-600 mt-0.5">Your review quality meets Ruby marketplace standards. Well done.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════ */

export default function LawyerMarketplace() {
  const [authed, setAuthed] = useState(false);
  const [onboardingGate, setOnboardingGate] = useState<OnboardingGate>('gate1');
  const [activeTab, setActiveTab] = useState<Tab>('available');
  const [availability, setAvailability] = useState<AvailabilityStatus>(DEMO_LAWYER.availability);
  const [maxConcurrent, setMaxConcurrent] = useState(DEMO_LAWYER.maxConcurrent);
  const [vacationStart, setVacationStart] = useState('');
  const [vacationEnd, setVacationEnd] = useState('');
  const [activeCases, setActiveCases] = useState<ActiveCase[]>(ACTIVE_CASES);
  const [availableCases, setAvailableCases] = useState<AvailableCase[]>(AVAILABLE_CASES);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    newCaseMatches: true, caseUpdates: true, paymentReceived: true,
    ratingReceived: true, systemAnnouncements: false, deadlineReminders: true,
    tierAdvancement: true, weeklyDigest: true, qualificationUpdates: true,
  });
  const [profileAreas, setProfileAreas] = useState<string[]>(DEMO_LAWYER.practiceAreas);
  const [profileJurisdictions, setProfileJurisdictions] = useState<string[]>(DEMO_LAWYER.jurisdictions);
  const [bio, setBio] = useState(DEMO_LAWYER.bio);

  // Auth gate
  if (!authed) return <AuthGate onLogin={() => setAuthed(true)} />;

  // Onboarding gate
  if (onboardingGate !== 'complete') {
    return <OnboardingFlow gate={onboardingGate} onAdvance={setOnboardingGate} />;
  }

  // Computed values
  const weightedRating = (
    DEMO_LAWYER.ratings.clientSatisfaction * 0.40 +
    DEMO_LAWYER.ratings.reviewQuality * 0.25 +
    DEMO_LAWYER.ratings.turnaroundTime * 0.15 +
    DEMO_LAWYER.ratings.approvalAccuracy * 0.10 +
    DEMO_LAWYER.ratings.communication * 0.10
  );

  const currentTierIdx = TIER_THRESHOLDS.findIndex((t) => t.name === DEMO_LAWYER.currentTier);
  const nextTier = currentTierIdx < TIER_THRESHOLDS.length - 1 ? TIER_THRESHOLDS[currentTierIdx + 1] : null;
  const tierProgress = nextTier ? Math.min(100, (DEMO_LAWYER.casesCompleted / nextTier.minCases) * 100) : 100;

  const thisWeekEarnings = 2223;
  const thisMonthEarnings = DEMO_LAWYER.monthlyEarnings;
  const allTimeEarnings = 56966;
  const platformFeeRate = 0.12;

  const handleAcceptCase = (caseId: string) => {
    const c = availableCases.find((ac) => ac.id === caseId);
    if (!c) return;
    setAvailableCases((prev) => prev.filter((ac) => ac.id !== caseId));
    setActiveCases((prev) => [...prev, {
      id: c.id, agreementType: c.agreementType, jurisdiction: c.jurisdiction, tier: c.tier,
      fee: c.fee, deadline: c.deadline, clientAnon: c.clientAnon, description: c.description,
      status: 'In Review', progress: 0, acceptedAt: '2026-04-04', modRef: c.modRef,
    }]);
  };

  const handleDeclineCase = (caseId: string) => {
    setAvailableCases((prev) => prev.filter((ac) => ac.id !== caseId));
  };

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'available', label: 'Available Cases', count: availableCases.length },
    { key: 'active', label: 'Active Cases', count: activeCases.length },
    { key: 'completed', label: 'Completed', count: COMPLETED_CASES.length },
    { key: 'earnings', label: 'Earnings' },
    { key: 'profile', label: 'Profile & Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* ── Top Nav ── */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#be123c]/10 flex items-center justify-center">
              <svg className="h-4 w-4 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
            </div>
            <span className="font-serif text-lg font-bold text-neutral-900">Ruby <span className="text-[#be123c]">Marketplace</span></span>
          </Link>
          <div className="flex items-center gap-4">
            {/* Availability toggle */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${availability === 'available' ? 'bg-emerald-500' : availability === 'busy' ? 'bg-amber-500' : 'bg-neutral-400'}`} />
              <span className="text-xs font-medium text-neutral-600 capitalize">{availability}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-[#be123c] flex items-center justify-center text-white text-xs font-bold">SC</div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-neutral-900">{DEMO_LAWYER.name}</p>
              <p className="text-xs text-neutral-500">{DEMO_LAWYER.designation}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {/* Cases Completed */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Cases Done</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{DEMO_LAWYER.casesCompleted}</p>
          </div>
          {/* Average Rating */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Avg Rating</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{weightedRating.toFixed(1)}</p>
            <div className="mt-1"><Stars rating={weightedRating} /></div>
          </div>
          {/* Response Time */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Resp. Time</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{DEMO_LAWYER.responseTime}</p>
          </div>
          {/* Monthly Earnings */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Your Commission</span>
              <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#be123c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">${DEMO_LAWYER.monthlyEarnings.toLocaleString()}</p>
            <p className="text-[10px] text-neutral-400 mt-1">65% of review fees</p>
          </div>
          {/* Current Tier */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Tier</span>
              <TierBadge tier={DEMO_LAWYER.currentTier} />
            </div>
            <div className="mt-1">
              <ProgressBar value={tierProgress} color="bg-[#be123c]" />
              {nextTier && <p className="text-[11px] text-neutral-400 mt-1.5">{DEMO_LAWYER.casesCompleted}/{nextTier.minCases} cases to {nextTier.name}</p>}
            </div>
          </div>
        </div>

        {/* ── Rating Breakdown ── */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-neutral-900">Rating Breakdown</h3>
            <span className="text-2xl font-bold text-neutral-900">{weightedRating.toFixed(2)} <span className="text-sm font-normal text-neutral-400">/ 5.0</span></span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Client Satisfaction', value: DEMO_LAWYER.ratings.clientSatisfaction, weight: '40%' },
              { label: 'Review Quality', value: DEMO_LAWYER.ratings.reviewQuality, weight: '25%' },
              { label: 'Turnaround Time', value: DEMO_LAWYER.ratings.turnaroundTime, weight: '15%' },
              { label: 'Approval Accuracy', value: DEMO_LAWYER.ratings.approvalAccuracy, weight: '10%' },
              { label: 'Communication', value: DEMO_LAWYER.ratings.communication, weight: '10%' },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-neutral-600">{r.label}</span>
                  <span className="text-xs font-semibold text-neutral-800">{r.value.toFixed(1)}</span>
                </div>
                <ProgressBar value={r.value} max={5} color={r.value >= 4.5 ? 'bg-emerald-500' : r.value >= 4.0 ? 'bg-blue-500' : r.value >= 3.5 ? 'bg-amber-500' : 'bg-red-500'} />
                <span className="text-[10px] text-neutral-400 mt-1 block">{r.weight} weight</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tier Progress ── */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-8">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Tier Progression</h3>
          <div className="flex items-center gap-2">
            {TIER_THRESHOLDS.map((tier, idx) => {
              const isActive = tier.name === DEMO_LAWYER.currentTier;
              const isPast = idx < currentTierIdx;
              return (
                <div key={tier.name} className="flex-1 relative">
                  <div className={`h-2 rounded-full ${isPast || isActive ? 'bg-[#be123c]' : 'bg-neutral-100'}`} />
                  <div className={`mt-2 text-center ${isActive ? 'font-bold text-[#be123c]' : isPast ? 'text-neutral-700' : 'text-neutral-400'}`}>
                    <p className="text-xs">{tier.name}</p>
                    <p className="text-[10px] mt-0.5">{tier.minCases}+ cases{tier.minRating > 0 ? ` / ${tier.minRating}+` : ''}</p>
                  </div>
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#be123c] border-2 border-white shadow-sm" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="border-b border-neutral-200 mb-6">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'border-[#be123c] text-[#be123c]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}>
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#be123c]/10 text-[#be123c]' : 'bg-neutral-100 text-neutral-500'}`}>{tab.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab Content ── */}
        <div className="transition-all duration-300">

          {/* AVAILABLE CASES */}
          {activeTab === 'available' && (
            <div className="space-y-4">
              {availableCases.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-12 h-12 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                  <p className="text-neutral-500 text-sm">No available cases right now. Check back soon.</p>
                </div>
              ) : (
                availableCases.map((c) => (
                  <div key={c.id} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-neutral-900">{c.agreementType}</h4>
                          <TierBadge tier={c.tier} />
                          <MatchBadge score={c.matchScore} />
                        </div>
                        <p className="text-sm text-neutral-600 mb-3">{c.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                            {c.jurisdiction}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ~{c.estimatedHours}h estimated
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                            Due {c.deadline}
                          </span>
                          <span className="text-neutral-400">{c.modRef}</span>
                          <span className="text-neutral-400">{c.clientAnon}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 lg:flex-col lg:items-end shrink-0">
                        <p className="text-xl font-bold text-neutral-900">${c.fee}</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleDeclineCase(c.id)} className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-all">Decline</button>
                          <button onClick={() => handleAcceptCase(c.id)} className="px-4 py-2 text-xs font-semibold text-white bg-[#be123c] rounded-lg hover:bg-[#9f1239] transition-all shadow-sm">Accept</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ACTIVE CASES */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {activeCases.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-12 h-12 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  <p className="text-neutral-500 text-sm">No active cases. Accept a case to get started.</p>
                </div>
              ) : (
                activeCases.map((c) => (
                  <div key={c.id} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-neutral-900">{c.agreementType}</h4>
                          <TierBadge tier={c.tier} />
                          <StatusBadge status={c.status} />
                        </div>
                        <p className="text-sm text-neutral-600 mb-3">{c.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mb-3">
                          <span>{c.jurisdiction}</span>
                          <span>Due {c.deadline}</span>
                          <span>{c.modRef}</span>
                          <span>{c.clientAnon}</span>
                          <span>Accepted {c.acceptedAt}</span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-neutral-500">Progress</span>
                            <span className="text-xs font-semibold text-neutral-700">{c.progress}%</span>
                          </div>
                          <ProgressBar value={c.progress} color={c.status === 'Revision Requested' ? 'bg-amber-500' : 'bg-[#be123c]'} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 lg:flex-col lg:items-end shrink-0">
                        <p className="text-xl font-bold text-neutral-900">${c.fee}</p>
                        <button className="px-4 py-2 text-xs font-semibold text-[#be123c] bg-[#be123c]/5 border border-[#be123c]/20 rounded-lg hover:bg-[#be123c]/10 transition-all">
                          View Document
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* COMPLETED CASES */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              {COMPLETED_CASES.map((c) => (
                <div key={c.id} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-neutral-900">{c.agreementType}</h4>
                        <TierBadge tier={c.tier} />
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                        <span>{c.jurisdiction}</span>
                        <span>Completed {c.completedAt}</span>
                        <span>{c.modRef}</span>
                        <span>{c.clientAnon}</span>
                        <span>Time: {c.timeToComplete}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <Stars rating={c.rating} size="md" />
                        <p className="text-xs text-neutral-500 mt-0.5">{c.rating.toFixed(1)}</p>
                      </div>
                      <p className="text-lg font-bold text-neutral-900">${c.fee}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">This Week</span>
                  <p className="text-2xl font-bold text-neutral-900 mt-2">${thisWeekEarnings.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-1">+$840 from last week</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">This Month</span>
                  <p className="text-2xl font-bold text-neutral-900 mt-2">${thisMonthEarnings.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-1">+$2,100 from last month</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">All Time</span>
                  <p className="text-2xl font-bold text-neutral-900 mt-2">${allTimeEarnings.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500 mt-1">{DEMO_LAWYER.casesCompleted} cases completed</p>
                </div>
              </div>

              {/* Platform fee transparency */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Fee Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Gross Earnings (This Month)</p>
                    <p className="text-lg font-bold text-neutral-900">${(thisMonthEarnings / (1 - platformFeeRate)).toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Platform Fee (12%)</p>
                    <p className="text-lg font-bold text-red-600">-${((thisMonthEarnings / (1 - platformFeeRate)) * platformFeeRate).toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Net Payout</p>
                    <p className="text-lg font-bold text-emerald-700">${thisMonthEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Next payout */}
              <div className="bg-[#be123c]/5 border border-[#be123c]/20 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Next Payout</p>
                  <p className="text-xs text-neutral-500 mt-0.5">April 15, 2026 via Direct Deposit</p>
                </div>
                <p className="text-xl font-bold text-[#be123c]">$3,420.00</p>
              </div>

              {/* Payout history */}
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-900">Payout History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-100 bg-neutral-50/50">
                        <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Date</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Amount</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Cases</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Method</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PAYOUT_HISTORY.map((p) => (
                        <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                          <td className="px-6 py-3.5 text-neutral-900">{p.date}</td>
                          <td className="px-6 py-3.5 font-semibold text-neutral-900">${p.amount.toLocaleString()}</td>
                          <td className="px-6 py-3.5 text-neutral-600">{p.cases}</td>
                          <td className="px-6 py-3.5 text-neutral-600">{p.method}</td>
                          <td className="px-6 py-3.5"><StatusBadge status={p.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bank account */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Payment Setup</h3>
                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">Royal Bank of Canada</p>
                    <p className="text-xs text-neutral-500">Account ending in ****4821</p>
                  </div>
                  <button className="text-xs font-semibold text-[#be123c] hover:text-[#9f1239] transition-colors">Update</button>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bio */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Bio & Experience</h3>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#be123c]/20 focus:border-[#be123c] transition-all h-32 resize-none"
                  placeholder="Tell clients about your experience..." />
                <button className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-[#be123c] rounded-lg hover:bg-[#9f1239] transition-all">Save Bio</button>
              </div>

              {/* Practice Areas */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Practice Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {PRACTICE_AREAS.map((area) => (
                    <button key={area} type="button"
                      onClick={() => setProfileAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area])}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${profileAreas.includes(area) ? 'bg-[#be123c] text-white border-[#be123c] shadow-sm' : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#be123c]/40 hover:bg-[#be123c]/5'}`}>
                      {profileAreas.includes(area) && <span className="mr-1">&#10003;</span>}
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jurisdictions */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Jurisdictions Served</h3>
                <div className="flex flex-wrap gap-2">
                  {PROVINCES.map((prov) => (
                    <button key={prov} type="button"
                      onClick={() => setProfileJurisdictions((prev) => prev.includes(prov) ? prev.filter((p) => p !== prov) : [...prev, prov])}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${profileJurisdictions.includes(prov) ? 'bg-[#be123c] text-white border-[#be123c] shadow-sm' : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#be123c]/40 hover:bg-[#be123c]/5'}`}>
                      {profileJurisdictions.includes(prov) && <span className="mr-1">&#10003;</span>}
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Availability</h3>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-medium text-neutral-600 mb-2 block">Status</label>
                    <div className="flex gap-2">
                      {(['available', 'busy', 'vacation'] as AvailabilityStatus[]).map((status) => (
                        <button key={status} onClick={() => setAvailability(status)}
                          className={`flex-1 text-xs font-semibold px-3 py-2.5 rounded-lg border transition-all capitalize ${
                            availability === status
                              ? status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : status === 'busy' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                              : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
                          }`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'available' ? 'bg-emerald-500' : status === 'busy' ? 'bg-amber-500' : 'bg-neutral-400'}`} />
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-600 mb-2 block">Max Concurrent Cases: <span className="font-bold text-neutral-900">{maxConcurrent}</span></label>
                    <input type="range" min={1} max={10} value={maxConcurrent} onChange={(e) => setMaxConcurrent(Number(e.target.value))}
                      className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-[#be123c]" />
                    <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                      <span>1</span><span>5</span><span>10</span>
                    </div>
                  </div>

                  {availability === 'vacation' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-neutral-600 mb-1.5 block">Start Date</label>
                        <input type="date" value={vacationStart} onChange={(e) => setVacationStart(e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-600 mb-1.5 block">End Date</label>
                        <input type="date" value={vacationEnd} onChange={(e) => setVacationEnd(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  )}

                  {activeCases.length >= maxConcurrent && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                      <p className="text-xs text-amber-700">At capacity. Matching auto-paused until a case is completed.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm lg:col-span-2">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Notification Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {NOTIFICATION_PREFS.map((np) => (
                    <label key={np.key} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors">
                      <span className="text-sm text-neutral-700">{np.label}</span>
                      <button type="button"
                        onClick={() => setNotifications((prev) => ({ ...prev, [np.key]: !prev[np.key] }))}
                        className={`relative w-11 h-6 shrink-0 rounded-full transition-colors duration-200 ${notifications[np.key] ? 'bg-[#be123c]' : 'bg-neutral-300'}`}
                        role="switch" aria-checked={notifications[np.key]}>
                        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${notifications[np.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-400">Ruby AI Platform &mdash; Lawyer Marketplace (Demo)</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">Home</Link>
            <Link href="/portal" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">Client Portal</Link>
            <Link href="/wizard" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">Agreement Wizard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
