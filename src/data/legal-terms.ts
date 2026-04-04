// ─── Legal Jargon Explainer ───
// Plain-language definitions for legal terms shown in the wizard.
// These appear as subtle inline tooltips so founders understand
// exactly what they're agreeing to — without leaving the flow.

export interface LegalTerm {
  term: string;
  plain: string;          // 1-sentence plain English
  detail?: string;        // Optional longer explanation
  example?: string;       // Real-world example
  icon?: string;          // Emoji for visual context
}

export const LEGAL_TERMS: Record<string, LegalTerm> = {
  // ── Employment ──
  "esa": {
    term: "ESA (Employment Standards Act)",
    plain: "Ontario's baseline employment law — the minimum rights every employee gets, no matter what the contract says.",
    detail: "If your contract gives less than the ESA minimum, those terms are void. Courts use the Waksdale holistic test: one bad clause can invalidate your entire termination framework.",
    icon: "⚖️",
  },
  "bardal-factors": {
    term: "Bardal Factors",
    plain: "The formula courts use to calculate reasonable notice — based on age, years of service, role, and job market availability.",
    detail: "Named after Bardal v. Globe & Mail (1960). These factors determine how many months of pay an employer owes when terminating without cause.",
    example: "A 55-year-old VP with 15 years of service might get 18-24 months. A 25-year-old junior with 2 years might get 2-4 months.",
    icon: "📊",
  },
  "waksdale": {
    term: "Waksdale Holistic Test",
    plain: "A 2020 Ontario court ruling that says if ANY termination clause in your contract is invalid, ALL of them might be thrown out.",
    detail: "Waksdale v. Swegon Group means courts read the entire termination framework together. One illegal for-cause clause can void the without-cause clause too.",
    icon: "🔗",
  },
  "non-compete": {
    term: "Non-Compete Clause",
    plain: "A clause that stops someone from working for a competitor or starting a competing business after they leave.",
    detail: "In Ontario, non-competes are banned for most employees (ESA s.67.2). Only C-suite executives can be bound by them. Even where allowed, courts apply the Shafron reasonableness test.",
    icon: "🚫",
  },
  "non-solicit": {
    term: "Non-Solicitation Clause",
    plain: "A clause that stops someone from poaching your clients or employees after they leave — less restrictive than a non-compete.",
    detail: "Courts are more likely to enforce non-solicitation clauses because they don't prevent someone from working entirely — they just protect specific business relationships.",
    icon: "🤝",
  },
  "moral-rights": {
    term: "Moral Rights",
    plain: "The creator's right to be credited for their work and to prevent it from being distorted — even after selling the copyright.",
    detail: "Under the Canadian Copyright Act s.14.1, moral rights can't be assigned, only waived. This is critical for IP assignments and influencer agreements.",
    icon: "✍️",
  },
  "ip-assignment": {
    term: "IP Assignment",
    plain: "Transferring ownership of intellectual property (inventions, code, designs) from the creator to the company.",
    detail: "Without a written assignment, the creator may own IP they built on company time. Assignment should cover all work product, not just inventions.",
    icon: "📝",
  },

  // ── Corporate / Shareholder ──
  "rofr": {
    term: "Right of First Refusal (ROFR)",
    plain: "Before selling shares to an outsider, you must first offer them to existing shareholders at the same price.",
    detail: "ROFR prevents unwanted third parties from joining the shareholder group. The exercise period (typically 30-60 days) matters — too short and it's unfair to existing shareholders.",
    icon: "🏷️",
  },
  "tag-along": {
    term: "Tag-Along Rights",
    plain: "If a majority shareholder sells their stake, minority shareholders can 'tag along' and sell on the same terms.",
    detail: "Protects minority shareholders from being stuck in a company after the controlling shareholder exits to a third party.",
    icon: "🏃",
  },
  "drag-along": {
    term: "Drag-Along Rights",
    plain: "If enough shareholders (usually 75%) agree to sell the company, they can force the remaining shareholders to sell too.",
    detail: "Prevents a small minority from blocking a sale that benefits the majority. The threshold percentage is a key negotiation point.",
    icon: "🔗",
  },
  "shotgun-clause": {
    term: "Shotgun Buy-Sell",
    plain: "A deadlock breaker: one partner names a price, and the other must either buy at that price or sell at that price. No negotiation.",
    detail: "Also called a 'Russian roulette' clause. It forces fairness because the person naming the price doesn't know which side of the deal they'll be on.",
    icon: "🎯",
  },
  "reserved-matters": {
    term: "Reserved Matters",
    plain: "Big decisions that need more than a simple majority vote — like taking on debt, issuing new shares, or selling the company.",
    detail: "These protect minority shareholders by requiring unanimous or super-majority approval for decisions that could dilute or harm their investment.",
    icon: "🔒",
  },
  "pre-emptive-rights": {
    term: "Pre-Emptive Rights",
    plain: "The right to buy new shares before they're offered to outsiders, so your ownership percentage doesn't get diluted.",
    detail: "If the company issues 1,000 new shares, a shareholder with pre-emptive rights can buy their proportional share first.",
    icon: "🛡️",
  },

  // ── Investment / SAFE ──
  "valuation-cap": {
    term: "Valuation Cap",
    plain: "The maximum company valuation at which your SAFE converts to equity — the lower the cap, the more shares the investor gets.",
    detail: "If the cap is $5M and the company raises at $20M, the investor converts as if the company were only worth $5M — getting 4x more shares.",
    example: "Invest $100K with a $5M cap. Company raises Series A at $20M. You convert at $5M = 2% ownership instead of 0.5%.",
    icon: "📈",
  },
  "discount-rate": {
    term: "Discount Rate",
    plain: "A percentage discount SAFE investors get on the share price compared to what new investors pay in the next round.",
    detail: "A 20% discount means if Series A investors pay $1/share, SAFE holders convert at $0.80/share. Rewards early risk-taking.",
    icon: "💰",
  },
  "mfn-clause": {
    term: "MFN (Most Favoured Nation)",
    plain: "If the company gives a later investor better SAFE terms, your terms automatically upgrade to match.",
    detail: "Protects early SAFE investors from being disadvantaged by subsequent deals with lower caps or higher discounts.",
    icon: "⭐",
  },
  "pro-rata": {
    term: "Pro-Rata Rights",
    plain: "The right to invest more money in future rounds to maintain your ownership percentage.",
    detail: "Without pro-rata rights, your ownership gets diluted every time the company raises more money.",
    icon: "📐",
  },

  // ── SLA / Commercial ──
  "uptime-sla": {
    term: "Uptime SLA",
    plain: "The guaranteed percentage of time the service will be available — 99.9% means less than 8.7 hours of downtime per year.",
    detail: "99.9% (three nines) = ~8.7 hrs/year downtime. 99.99% (four nines) = ~52 min/year. Each extra '9' is exponentially harder and more expensive to maintain.",
    icon: "⏱️",
  },
  "service-credits": {
    term: "Service Credits",
    plain: "Automatic bill credits you get when the service provider misses their uptime or response time commitments.",
    detail: "Usually structured as a percentage of monthly fees. Tiered schedules give bigger credits for bigger failures.",
    icon: "💳",
  },
  "liability-cap": {
    term: "Liability Cap",
    plain: "The maximum amount one party can owe the other if something goes wrong — usually expressed as X months of fees.",
    detail: "A 12-month cap means if you pay $10K/month, the max the provider owes you for any claim is $120K. Higher caps = more protection but harder to negotiate.",
    icon: "🧢",
  },
  "force-majeure": {
    term: "Force Majeure",
    plain: "The 'acts of God' clause — neither party is liable for failures caused by events beyond their control (pandemics, natural disasters, wars).",
    detail: "Post-COVID, this clause matters more than ever. Carefully drafted force majeure clauses specify exactly which events qualify.",
    icon: "🌪️",
  },
  "consequential-damages": {
    term: "Consequential Damages Exclusion",
    plain: "An agreement that neither side can sue for indirect losses like lost profits or lost business opportunities — only direct damages.",
    detail: "Without this exclusion, a $50K software failure could theoretically lead to a $5M lost-profits claim. Most B2B contracts exclude consequential damages mutually.",
    icon: "🔄",
  },

  // ── Privacy / Data ──
  "pipeda": {
    term: "PIPEDA",
    plain: "Canada's federal privacy law — it governs how businesses collect, use, and share personal information.",
    detail: "Personal Information Protection and Electronic Documents Act. Based on 10 fair information principles. Applies to all commercial activities in Canada except where provincial laws apply (Quebec, BC, Alberta).",
    icon: "🔐",
  },
  "casl": {
    term: "CASL",
    plain: "Canada's anti-spam law — you need consent before sending commercial emails, and must include an unsubscribe link.",
    detail: "Canada's Anti-Spam Legislation. Violations can result in fines up to $10M for businesses. Requires express or implied consent, sender identification, and a functioning unsubscribe mechanism.",
    icon: "📧",
  },
  "quebec-law-25": {
    term: "Quebec Law 25",
    plain: "Quebec's updated privacy law — stricter than PIPEDA, with mandatory privacy impact assessments and a dedicated privacy officer.",
    detail: "Requires privacy-by-default, explicit consent for sensitive data, data portability rights, and the right to deindexation. Fines up to $25M or 4% of global revenue.",
    icon: "⚜️",
  },

  // ── Platform / T&C ──
  "clickwrap": {
    term: "Clickwrap Agreement",
    plain: "The most enforceable way to get users to agree — they must check a box and click 'I Agree' before using your service.",
    detail: "Courts consistently enforce clickwrap agreements because the user takes an affirmative action. Stronger than browsewrap (just a footer link) per Rudder v. Microsoft.",
    icon: "☑️",
  },
  "browsewrap": {
    term: "Browsewrap Agreement",
    plain: "The weakest form — terms are just linked in the footer and users 'agree' by using the site. Courts often reject these.",
    detail: "Browsewrap is risky because users may never see the terms. Courts require proof of actual or constructive notice. Clickwrap is much safer.",
    icon: "⚠️",
  },
  "arbitration": {
    term: "Binding Arbitration",
    plain: "Disputes go to a private arbitrator instead of court — faster and cheaper, but the decision is final with very limited appeal rights.",
    detail: "After Uber v. Heller (SCC 2020), arbitration clauses that impose unreasonable costs or barriers can be struck down as unconscionable in Canada.",
    icon: "⚖️",
  },
  "unconscionability": {
    term: "Unconscionability",
    plain: "A legal doctrine that lets courts throw out contract terms that are so unfair they 'shock the conscience.'",
    detail: "After Uber v. Heller (SCC 2020), even standard arbitration clauses can be struck down if they create an unfair power imbalance — especially in consumer and employment contexts.",
    icon: "🚨",
  },

  // ── Influencer ──
  "competition-act-s52": {
    term: "Competition Act s.52",
    plain: "Canada's main advertising law — all sponsored content MUST be clearly disclosed. Fines up to $15M for corporations.",
    detail: "Criminal offence for knowingly misleading the public. Influencers and brands are both liable. Every paid post needs clear, unavoidable disclosure (#ad, #sponsored, or platform's built-in tool).",
    icon: "📢",
  },
  "ftc-guides": {
    term: "FTC Endorsement Guides",
    plain: "US advertising rules — if you have American followers, you must comply with FTC disclosure requirements on top of Canadian law.",
    detail: "16 CFR Part 255. Requires 'clear and conspicuous' disclosure. Can't be buried in hashtags or below the fold. Must be in the same language as the post.",
    icon: "🇺🇸",
  },
  "agco": {
    term: "AGCO (Alcohol & Gaming Commission)",
    plain: "Ontario's regulator for alcohol and gambling advertising — extra-strict rules for influencer content in these industries.",
    detail: "AGCO iGaming Standards s.2.03 prohibit content that appeals to minors. Influencers promoting gambling must include responsible gambling messaging and age-gate their content.",
    icon: "🎰",
  },
  "exclusivity": {
    term: "Exclusivity Period",
    plain: "A time window where the influencer can't promote competing brands — protects the brand's investment in the partnership.",
    detail: "Can be category-wide (no other skincare brands) or narrow (no direct competitors only). Duration and scope are key negotiation points.",
    icon: "🏆",
  },
  "usage-rights": {
    term: "Content Usage Rights",
    plain: "Who can use the influencer's content, where, and for how long after the campaign ends.",
    detail: "Companies often want perpetual rights to repurpose influencer content in ads. Influencers should negotiate time limits and additional compensation for extended usage.",
    icon: "📸",
  },
  "morals-clause": {
    term: "Morals Clause",
    plain: "Lets the brand terminate the deal if the influencer does something that could embarrass or damage the brand's reputation.",
    detail: "Should be specific about what triggers it (criminal charges, public controversy) rather than vague 'conduct unbecoming' language. The influencer version protects against brand scandals too.",
    icon: "📜",
  },

  // ── Lending / Debt ──
  "promissory-note": {
    term: "Promissory Note",
    plain: "A written promise to pay back money — the IOU that makes a loan legally binding.",
    detail: "Must include the principal amount, interest rate, repayment schedule, and default consequences to be enforceable.",
    icon: "📃",
  },
  "security-interest": {
    term: "Security Interest",
    plain: "Collateral — the lender gets rights to specific assets if the borrower doesn't pay back the loan.",
    detail: "Must be registered under provincial Personal Property Security Act (PPSA) to be enforceable against third parties. Priority depends on registration date.",
    icon: "🔐",
  },
  "default-provisions": {
    term: "Events of Default",
    plain: "The specific things that trigger the lender's right to demand immediate repayment — missing a payment, going bankrupt, or breaking a covenant.",
    detail: "Well-drafted defaults include cure periods (time to fix the problem before the lender can act) and notice requirements.",
    icon: "⚡",
  },
  "subordination": {
    term: "Subordination",
    plain: "When one lender agrees their debt ranks below another — if the company fails, the senior lender gets paid first.",
    detail: "Common in startup lending where founders take a back seat to institutional lenders. Subordination agreements should be in writing and acknowledged by all parties.",
    icon: "📊",
  },

  // ── MSA ──
  "sow": {
    term: "Statement of Work (SOW)",
    plain: "The document that describes exactly what work will be done under a master agreement — scope, timeline, deliverables, and price.",
    detail: "The MSA sets the general terms; each SOW is a separate mini-contract under it. This structure lets you do multiple projects without renegotiating the whole agreement each time.",
    icon: "📋",
  },
  "change-order": {
    term: "Change Order",
    plain: "A formal request to modify the scope, timeline, or cost of work already underway — prevents scope creep.",
    detail: "Without a change order process, clients can keep adding requirements without paying more. Both parties must agree in writing before changes take effect.",
    icon: "🔄",
  },
  "indemnification": {
    term: "Indemnification",
    plain: "A promise to cover someone else's losses — if your work causes a lawsuit, you pay the legal costs and damages.",
    detail: "Indemnification can be mutual or one-way. Key negotiations: what triggers it, whether it includes attorney fees, and whether there's a cap.",
    icon: "🛡️",
  },
};

// Get relevant terms for a step
export function getTermsForStep(stepId: string): LegalTerm[] {
  const STEP_TERMS: Record<string, string[]> = {
    "emp-comp": ["esa", "bardal-factors"],
    "emp-clause": ["waksdale", "esa"],
    "emp-covenant": ["non-compete", "non-solicit"],
    "emp-ip": ["ip-assignment", "moral-rights"],
    "corp-shareholders": ["reserved-matters", "pre-emptive-rights"],
    "corp-governance": ["reserved-matters"],
    "corp-transfer": ["rofr", "tag-along", "drag-along", "pre-emptive-rights"],
    "corp-deadlock": ["shotgun-clause"],
    "inv-terms": ["valuation-cap", "discount-rate"],
    "inv-conversion": ["mfn-clause"],
    "inv-info": ["pro-rata"],
    "com-service": ["uptime-sla"],
    "com-sla": ["uptime-sla", "service-credits"],
    "com-data": ["pipeda", "casl"],
    "com-liability": ["liability-cap", "force-majeure", "consequential-damages"],
    "plat-business": ["pipeda"],
    "plat-terms": ["clickwrap", "browsewrap", "arbitration", "unconscionability"],
    "plat-structure": ["sow", "indemnification"],
    "inf-campaign": ["competition-act-s52", "exclusivity"],
    "inf-deliverables": ["ftc-guides", "agco", "pipeda", "casl"],
    "inf-compliance": ["competition-act-s52", "ftc-guides", "morals-clause", "usage-rights"],
    "risk-profile": [],
    "compliance": ["pipeda", "casl", "quebec-law-25"],
    "agreement-clauses": [],
  };
  const keys = STEP_TERMS[stepId] || [];
  return keys.map((k) => LEGAL_TERMS[k]).filter(Boolean);
}
