"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ───
interface ModificationCategory {
  id: string;
  name: string;
  description: string;
  example: string;
  icon: string;
  clauseIds?: string[];
  regModuleIds?: string[];
}

interface ChatMessage {
  role: "ai" | "user" | "system";
  content: string;
  timestamp: Date;
  riskFlag?: string;
  draftVersion?: number;
}

interface ModificationRequest {
  id: string;
  category: ModificationCategory;
  intakeType: string;
  intakeData: Record<string, string>;
  messages: ChatMessage[];
  summary: string;
  structureScope: string;
  complexityTier: "simple" | "standard" | "complex";
  riskFlags: string[];
  baseFee: number;
  volumeDiscount: number;
  autoResolved: boolean;
  requiresLawyerReview: boolean;
  expanded: boolean;
}

interface SessionData {
  contractType: string;
  contractTitle: string;
  wizardSelections: Record<string, unknown>;
  clauseManifest: string[];
  regModulesActivated: string[];
  governingLaw: string;
  parties: string[];
}

// ─── Dynamic Categories (mapped from clause library per spec §4.1) ───
const UNIVERSAL_CATEGORIES: ModificationCategory[] = [
  { id: "custom-schedule", name: "Custom Schedule or Exhibit", description: "Create a non-standard payment schedule, milestone table, deliverables schedule, or exhibit.", example: "Add a milestone-based payment schedule tied to project deliverables.", icon: "CS" },
  { id: "something-else", name: "Something Else", description: "Describe what you need in your own words. Our counsel engine will help structure your request.", example: "I need a revenue-sharing earn-out tied to Q3 and Q4 performance metrics.", icon: "SE" },
];

const CONTRACT_CATEGORIES: Record<string, ModificationCategory[]> = {
  employment: [
    { id: "emp-termination", name: "Termination & Severance", description: "Modify notice periods, severance formulas, or termination triggers.", example: "Increase severance from ESA minimum to 2 weeks per year of service.", icon: "TS", clauseIds: ["CL-EA-006", "CL-EA-007", "CL-EA-013"] },
    { id: "emp-covenants", name: "Restrictive Covenants", description: "Adjust non-compete, non-solicit, or confidentiality scope and duration.", example: "Narrow the non-solicit from all clients to only clients you personally serviced.", icon: "RC", clauseIds: ["CL-EA-008", "CL-EA-009", "CL-EA-010"] },
    { id: "emp-compensation", name: "Compensation & Benefits", description: "Modify salary structure, bonus terms, equity provisions, or benefits.", example: "Add a signing bonus with a 12-month clawback provision.", icon: "CB", clauseIds: ["CL-EA-002", "CL-EA-003", "CL-EA-004"] },
    { id: "emp-ip", name: "IP & Inventions", description: "Adjust intellectual property assignment, moral rights, or invention clauses.", example: "Carve out personal projects from the IP assignment clause.", icon: "IP", clauseIds: ["CL-EA-011", "CL-EA-012"] },
  ],
  corporate: [
    { id: "corp-transfer", name: "Share Transfer & Exit", description: "Modify ROFR, tag-along, drag-along, or exit mechanisms.", example: "Add a 90-day ROFR exercise period instead of the standard 30 days.", icon: "ST", clauseIds: ["CL-SHA-021", "CL-SHA-022", "CL-SHA-023", "CL-SHA-024"] },
    { id: "corp-governance", name: "Governance & Voting", description: "Adjust board composition, reserved matters, or voting thresholds.", example: "Add board observer rights for minority shareholders above 10%.", icon: "GV", clauseIds: ["CL-SHA-005", "CL-SHA-031", "CL-SHA-032"] },
    { id: "corp-deadlock", name: "Deadlock Resolution", description: "Change the deadlock resolution mechanism or add mediation steps.", example: "Replace shotgun buy-sell with mediation then arbitration.", icon: "DR", clauseIds: ["CL-SHA-034", "CL-SHA-035"] },
    { id: "corp-dividends", name: "Dividends & Distributions", description: "Modify dividend policy, distribution waterfall, or reinvestment provisions.", example: "Add a minimum annual distribution of 30% of net profits.", icon: "DD", clauseIds: ["CL-SHA-019", "CL-SHA-020"] },
  ],
  investment: [
    { id: "inv-interest", name: "Interest & Payment Terms", description: "Modify interest rates, payment schedules, or amortization structure.", example: "Change the interest rate from 8% to 6% and switch from bullet to amortizing repayment.", icon: "PT", clauseIds: ["CL-LDI-002", "CL-LDI-003", "CL-LDI-004", "CL-LDI-019", "CL-LDI-020"] },
    { id: "inv-default", name: "Default & Remedies", description: "Adjust cure periods, events of default, or acceleration provisions.", example: "Extend the cure period from 5 days to 15 days and add a MAC exclusion for pandemic events.", icon: "DF", clauseIds: ["CL-LDI-006", "CL-LDI-007", "CL-LDI-013"], regModuleIds: ["RM-CC347", "RM-IA"] },
    { id: "inv-security", name: "Security & Collateral", description: "Change security interests, collateral descriptions, or priority arrangements.", example: "Change the security from an all-assets GSA to a specific pledge of accounts receivable only.", icon: "SC", clauseIds: ["CL-LDI-021", "CL-LDI-022", "CL-LDI-023", "CL-LDI-024", "CL-LDI-044", "CL-LDI-045"], regModuleIds: ["RM-PPSA", "RM-IA8"] },
    { id: "inv-conversion", name: "Conversion Mechanics", description: "Modify valuation cap, discount rate, or conversion triggers.", example: "Lower the valuation cap and add a most-favoured-nation clause.", icon: "CM", clauseIds: ["CL-LDI-025", "CL-LDI-026", "CL-LDI-027", "CL-LDI-028", "CL-LDI-029", "CL-LDI-030"], regModuleIds: ["RM-NI45106"] },
    { id: "inv-rights", name: "Investor / Lender Rights", description: "Add or modify information rights, pro-rata rights, or board observer rights.", example: "Add board observer rights for any investor above $500K.", icon: "IR", clauseIds: ["CL-LDI-005", "CL-LDI-031", "CL-LDI-032", "CL-LDI-034", "CL-LDI-035"] },
    { id: "inv-parties", name: "Parties & Structure", description: "Add a co-borrower, guarantor, or change the deal structure.", example: "Add my co-founder as a personal guarantor on this loan.", icon: "PS", clauseIds: ["CL-LDI-011", "CL-LDI-049", "CL-LDI-050", "CL-LDI-051", "CL-LDI-052"] },
  ],
  commercial: [
    { id: "com-sla", name: "Service Levels & Credits", description: "Modify uptime commitments, response times, or service credit schedules.", example: "Increase uptime commitment from 99.9% to 99.95% with enhanced credit schedule.", icon: "SL" },
    { id: "com-liability", name: "Liability & Indemnification", description: "Adjust liability caps, indemnification scope, or damages exclusions.", example: "Increase liability cap from 12 months to 24 months of fees.", icon: "LI" },
    { id: "com-data", name: "Data & Privacy", description: "Modify data handling, residency requirements, or breach notification terms.", example: "Add data residency requirement for Canada-only storage.", icon: "DP" },
    { id: "com-ip", name: "IP Ownership & Licensing", description: "Adjust who owns work product, license grants, or open-source provisions.", example: "Change IP ownership from vendor-retains to client-owns-all-deliverables.", icon: "IL" },
  ],
  platform: [
    { id: "plat-terms", name: "Terms & Acceptance", description: "Modify acceptance mechanism, modification procedures, or user obligations.", example: "Switch from browsewrap to clickwrap acceptance with version tracking.", icon: "TA" },
    { id: "plat-disputes", name: "Dispute Resolution", description: "Change dispute resolution mechanism, jurisdiction, or class action waiver.", example: "Add a 30-day informal resolution period before arbitration.", icon: "DS" },
    { id: "plat-content", name: "User Content & IP", description: "Modify UGC licensing, content moderation, or takedown procedures.", example: "Add a copyright notice-and-takedown procedure compliant with the Copyright Act.", icon: "UC" },
    { id: "plat-privacy", name: "Data Collection & Use", description: "Adjust what personal data is collected, how it's used, and retention periods.", example: "Add biometric data collection disclosure for our facial recognition feature.", icon: "DC", clauseIds: ["CL-PP-001", "CL-PP-002", "CL-PP-003"] },
    { id: "plat-sharing", name: "Third-Party Sharing", description: "Expand or restrict data sharing with partners, analytics providers, or advertisers.", example: "Expand the third-party sharing clause to cover our new analytics partner.", icon: "TP", clauseIds: ["CL-PP-004", "CL-PP-005"] },
    { id: "plat-retention", name: "Retention & Deletion", description: "Change how long data is kept and when it gets automatically deleted.", example: "Change the retention period from 3 years to 18 months and add auto-deletion.", icon: "RD", clauseIds: ["CL-PP-006", "CL-PP-007"] },
    { id: "plat-userrights", name: "User Rights & Access", description: "Add data portability, access requests, or deletion rights.", example: "Add a data portability clause compliant with Quebec Law 25.", icon: "UR", clauseIds: ["CL-PP-008", "CL-PP-009", "CL-PP-010"] },
  ],
  creator: [
    { id: "inf-compensation", name: "Compensation & Performance", description: "Modify payment structure, performance bonuses, or affiliate commission terms.", example: "Add a 5% commission on sales generated through the influencer's unique link.", icon: "CP" },
    { id: "inf-content", name: "Content Rights & Usage", description: "Adjust IP ownership, usage rights duration, or whitelisting scope.", example: "Limit brand usage rights to social media only — no paid advertising.", icon: "CR" },
    { id: "inf-exclusivity", name: "Exclusivity & Non-Compete", description: "Modify exclusivity scope, duration, or competitor definition.", example: "Narrow exclusivity to direct competitors only, not the entire skincare category.", icon: "EX" },
    { id: "inf-compliance", name: "Disclosure & Regulatory", description: "Adjust platform-specific disclosure templates or add industry compliance.", example: "Add AGCO-compliant responsible gambling messaging for iGaming campaign.", icon: "DG" },
  ],
};

// ─── Intake Type Definitions (per spec §5.1) ───
const INTAKE_TYPES = [
  { id: "modify", label: "Modify Existing", desc: "Change a clause in your contract", icon: "ME" },
  { id: "add", label: "Add New Provision", desc: "Add something that's not there yet", icon: "AP" },
  { id: "remove", label: "Remove a Clause", desc: "Take out a clause you don't need", icon: "RM" },
  { id: "add-party", label: "Add a Party", desc: "Add a guarantor, co-signer, etc.", icon: "PY" },
  { id: "custom-schedule", label: "Custom Schedule", desc: "Payment, milestone, or exhibit", icon: "CS" },
  { id: "freeform", label: "Something Else", desc: "Describe it in your own words", icon: "FE" },
];

// ─── Complexity Pricing (per spec §7.4) ───
const COMPLEXITY_PRICING: Record<string, { base: number; label: string }> = {
  simple: { base: 49, label: "Simple" },
  standard: { base: 129, label: "Standard" },
  complex: { base: 299, label: "Complex" },
};

const LAWYER_ADDON = { standard: 149, priority: 349 };

function volumeDiscount(index: number): number {
  if (index === 0) return 0;
  if (index === 1) return 0.2;
  return 0.4;
}

// ─── Shared UI ───
const inputClass = "mt-1.5 block w-full border border-neutral-200 bg-white rounded-lg px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-[rgba(190,18,60,0.1)] focus:border-[#be123c] outline-none transition-all duration-200";
const labelClass = "text-[14px] font-medium text-neutral-700";

const COMPLEXITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  simple: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  standard: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  complex: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

// ─── Risk Detection (per spec §6.4) ───
function detectRisks(intakeData: Record<string, string>, category: ModificationCategory | null): string[] {
  const flags: string[] = [];
  const desc = (intakeData.description || "").toLowerCase();
  if (desc.includes("remove") && desc.includes("savings clause")) flags.push("Regulatory: Removing Criminal Code s.347 savings clause is not permitted.");
  if (desc.includes("interest") && desc.includes("real property")) flags.push("Regulatory: Interest Act s.8 restricts default interest on real-property-secured instruments.");
  if (desc.includes("remove") && desc.includes("non-compete") && desc.includes("non-solicit")) flags.push("Internal consistency: Removing non-solicitation may conflict with non-compete clause.");
  if (desc.includes("securities") && (desc.includes("weaken") || desc.includes("remove"))) flags.push("Regulatory: NI 45-106 investor accreditation verification must not be weakened.");
  if (category?.regModuleIds && category.regModuleIds.length > 0) flags.push("This modification may trigger additional regulatory compliance requirements.");
  return flags;
}

// ─── Mandatory Lawyer Review Check (per spec §12.6) ───
function requiresMandatoryLawyerReview(intakeData: Record<string, string>, category: ModificationCategory | null): boolean {
  const desc = (intakeData.description || "").toLowerCase();
  if (desc.includes("savings clause") || desc.includes("s.347")) return true;
  if (desc.includes("real property") && desc.includes("interest")) return true;
  if (desc.includes("securities") && desc.includes("accreditation")) return true;
  if (category?.regModuleIds?.includes("RM-IA8")) return true;
  return false;
}

// ─── Auto-Resolution Check (per spec §5.2) ───
function canAutoResolve(intakeType: string, intakeData: Record<string, string>): boolean {
  return intakeType === "modify" && intakeData.isThreshold === "true" && !!intakeData.currentValue && !!intakeData.desiredValue;
}

// ─── Complexity Tier Determination (per spec §7.2) ───
function determineComplexity(
  intakeType: string,
  messages: ChatMessage[],
  category: ModificationCategory | null,
  riskFlags: string[]
): "simple" | "standard" | "complex" {
  // Novel / multi-clause / regulatory triggers → complex
  if (riskFlags.length >= 2) return "complex";
  if (category?.regModuleIds && category.regModuleIds.length >= 2) return "complex";
  if (category?.clauseIds && category.clauseIds.length >= 5) return "complex";
  if (intakeType === "freeform") return "complex";
  // Threshold change, single removal → simple
  if (intakeType === "modify" && messages.length <= 2) return "simple";
  if (intakeType === "remove") return "simple";
  // Everything else → standard
  return "standard";
}

// ─── Structure/Scope Generator (per spec §7.1) ───
function generateStructureScope(mod: ModificationRequest): string {
  if (mod.autoResolved) return `Single value change: ${mod.intakeData.currentValue} → ${mod.intakeData.desiredValue}`;
  if (mod.intakeType === "remove") return `Clause removal from ${mod.category.name} section`;
  if (mod.intakeType === "add-party") return `${mod.intakeData.partyRole || "New party"} addition with signing blocks and representations`;
  if (mod.intakeType === "custom-schedule") return `${mod.intakeData.scheduleType || "Custom"} schedule with ${mod.intakeData.entryCount || "multiple"} entries`;
  if (mod.intakeType === "add") return `New provision in ${mod.category.name}, ${mod.intakeData.protects === "me" ? "favouring your position" : mod.intakeData.protects === "other" ? "balanced toward other party" : "balanced for both parties"}`;
  return `Modified provision in ${mod.category.name} section`;
}

let modIdCounter = 0;
function nextModId(): string {
  modIdCounter++;
  return `mod-${modIdCounter}`;
}

// ─── HIGH COMPLEXITY Contract Types (per spec §3.3) ───
const HIGH_COMPLEXITY_TYPES = ["convertible-note", "bilateral-loan", "revolving-credit", "convertible_note", "bilateral_loan", "revolving_credit"];
const SIMPLE_TYPES = ["demand-note", "demand_note", "privacy-policy", "privacy_policy"];

// ─── Component ───
export default function CustomizePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [session, setSession] = useState<SessionData>({
    contractType: "", contractTitle: "", wizardSelections: {}, clauseManifest: [], regModulesActivated: [], governingLaw: "Ontario", parties: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<ModificationCategory | null>(null);
  const [intakeType, setIntakeType] = useState("modify");
  const [intakeData, setIntakeData] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [modifications, setModifications] = useState<ModificationRequest[]>([]);
  const [editingModIndex, setEditingModIndex] = useState<number | null>(null);
  const [deliveryTier, setDeliveryTier] = useState<"ai-only" | "lawyer-standard" | "lawyer-priority">("ai-only");
  const [showRedirect, setShowRedirect] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const type = sessionStorage.getItem("ruby-contract-type") || "employment";
    const title = sessionStorage.getItem("ruby-contract-title") || "Your Agreement";
    setSession((prev) => ({ ...prev, contractType: type, contractTitle: title }));
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const categories = [
    ...(CONTRACT_CATEGORIES[session.contractType] || CONTRACT_CATEGORIES["employment"] || []),
    ...UNIVERSAL_CATEGORIES,
  ];

  const anyRequiresLawyer = modifications.some((m) => m.requiresLawyerReview);

  // ─── Handlers ───
  function handleCategorySelect(cat: ModificationCategory) {
    setSelectedCategory(cat);
    // Wizard redirect check (per spec §4.4)
    if (cat.id !== "custom-schedule" && cat.id !== "something-else") {
      // Check if this might be a standard wizard option
      const hasClauseIds = cat.clauseIds && cat.clauseIds.length > 0;
      if (hasClauseIds) {
        setShowRedirect(true);
        setCurrentStep(2);
        return;
      }
    }
    setShowRedirect(false);
    setCurrentStep(2);
  }

  function handleDismissRedirect() {
    setShowRedirect(false);
  }

  function handleIntakeSubmit() {
    const risks = detectRisks(intakeData, selectedCategory);
    const mandatoryLawyer = requiresMandatoryLawyerReview(intakeData, selectedCategory);

    // Auto-resolution check (per spec §5.2)
    if (canAutoResolve(intakeType, intakeData)) {
      const mod: ModificationRequest = {
        id: nextModId(),
        category: selectedCategory!,
        intakeType,
        intakeData,
        messages: [],
        summary: `Change ${intakeData.clauseName || "value"} from ${intakeData.currentValue} to ${intakeData.desiredValue}`,
        structureScope: `Single value change: ${intakeData.currentValue} → ${intakeData.desiredValue}`,
        complexityTier: "simple",
        riskFlags: risks,
        baseFee: COMPLEXITY_PRICING.simple.base,
        volumeDiscount: volumeDiscount(modifications.length),
        autoResolved: true,
        requiresLawyerReview: mandatoryLawyer,
        expanded: true,
      };
      setModifications((prev) => [...prev, mod]);
      setCurrentStep(4);
      return;
    }

    setCurrentStep(3);
    setDraftCount(0);
    setExchangeCount(0);

    const opening: ChatMessage = {
      role: "ai",
      content: buildOpeningMessage(),
      timestamp: new Date(),
    };
    const msgs: ChatMessage[] = [opening];
    if (risks.length > 0) {
      msgs.push({
        role: "system",
        content: risks.join("\n"),
        timestamp: new Date(),
        riskFlag: risks[0],
      });
    }
    setMessages(msgs);
  }

  function buildOpeningMessage(): string {
    const action = intakeType === "modify" ? "modify" : intakeType === "add" ? "add a new provision to" : intakeType === "remove" ? "remove a clause from" : intakeType === "add-party" ? "add a party to" : intakeType === "custom-schedule" ? "create a custom schedule for" : "customize";
    let msg = `I can see you'd like to ${action} your ${session.contractTitle}`;
    if (selectedCategory) msg += ` — specifically in the area of **${selectedCategory.name}**`;
    msg += ".";

    // Show contract context (per spec §6.3.1)
    if (session.governingLaw) msg += ` Your contract is governed by **${session.governingLaw}** law.`;

    if (intakeData.description) msg += `\n\nYou mentioned: "${intakeData.description}"`;
    if (intakeType === "add-party" && intakeData.partyName) msg += `\n\nI'll be drafting provisions for **${intakeData.partyName}** as a ${intakeData.partyRole || "new party"}.`;
    if (intakeType === "add" && intakeData.protects) {
      const lean = intakeData.protects === "me" ? "favouring your position" : intakeData.protects === "other" ? "balanced towards the other party" : "balanced for both parties";
      msg += `\n\nI'll draft this ${lean}.`;
    }

    // Per spec §6.3.1 — go directly to drafting if enough context, or ask one clarifying question
    if (intakeData.description && intakeData.description.length > 50) {
      msg += "\n\nI have enough context to draft something for you. Let me work on that now.";
    } else {
      msg += "\n\nBefore I draft, let me make sure I understand your needs. Could you provide a bit more detail about what specific outcome you're looking for?";
    }
    return msg;
  }

  function handleSendMessage() {
    if (!chatInput.trim() || isAiTyping) return;
    if (exchangeCount >= 8) return;

    const userMsg: ChatMessage = { role: "user", content: chatInput.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);
    const newExchangeCount = exchangeCount + 1;
    setExchangeCount(newExchangeCount);

    // Inline risk detection during conversation (per spec §6.4)
    const conversationRisks = detectRisks({ description: chatInput }, selectedCategory);

    setTimeout(() => {
      let aiContent: string;
      const newDraftCount = draftCount + 1;
      setDraftCount(newDraftCount);

      if (newDraftCount >= 3) {
        aiContent = "I've captured your requirements. The language has been refined based on your feedback.\n\n**Final draft ready.** Click \"Looks Good\" below to proceed to the summary and pricing screen.";
      } else if (newExchangeCount >= 8) {
        aiContent = "We've reached the conversation limit. I've drafted the best version based on our discussion.\n\n**Draft finalized.** Click \"Looks Good\" to continue.";
      } else {
        aiContent = `I've drafted an updated version incorporating your feedback.\n\n**Modified clause (Draft ${newDraftCount}):** The provision now includes your requested adjustments while maintaining compliance with applicable Canadian regulatory requirements.`;
        if (selectedCategory?.clauseIds) {
          aiContent += `\n\nThis draws from our clause library (${selectedCategory.clauseIds.length} related provisions) to ensure the language is well-established.`;
        }
        aiContent += `\n\nDoes this look right, or would you like me to adjust anything?`;
      }

      const newMsgs: ChatMessage[] = [];
      newMsgs.push({ role: "ai", content: aiContent, timestamp: new Date(), draftVersion: newDraftCount });

      if (conversationRisks.length > 0) {
        newMsgs.push({
          role: "system",
          content: conversationRisks.join("\n"),
          timestamp: new Date(),
          riskFlag: conversationRisks[0],
        });
      }

      setMessages((prev) => [...prev, ...newMsgs]);
      setIsAiTyping(false);
    }, 1800);
  }

  function handleFileAttach() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setAttachedFiles((prev) => [...prev, ...names]);
    // Add system message about file (per spec §6.1)
    const msg: ChatMessage = {
      role: "system",
      content: `File attached: ${names.join(", ")}. This will be referenced in the drafting conversation.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
  }

  function handleFinishChat() {
    const risks = detectRisks(intakeData, selectedCategory);
    const allConversationRisks = messages.filter((m) => m.riskFlag).map((m) => m.riskFlag!);
    const combinedRisks = [...new Set([...risks, ...allConversationRisks])];
    const tier = determineComplexity(intakeType, messages, selectedCategory, combinedRisks);
    const mandatoryLawyer = requiresMandatoryLawyerReview(intakeData, selectedCategory);

    const mod: ModificationRequest = {
      id: nextModId(),
      category: selectedCategory!,
      intakeType,
      intakeData,
      messages,
      summary: intakeData.description || "Custom modification",
      structureScope: "",
      complexityTier: tier,
      riskFlags: combinedRisks,
      baseFee: COMPLEXITY_PRICING[tier].base,
      volumeDiscount: volumeDiscount(editingModIndex !== null ? editingModIndex : modifications.length),
      autoResolved: false,
      requiresLawyerReview: mandatoryLawyer,
      expanded: true,
    };
    mod.structureScope = generateStructureScope(mod);

    if (editingModIndex !== null) {
      setModifications((prev) => prev.map((m, i) => (i === editingModIndex ? mod : m)));
      setEditingModIndex(null);
    } else {
      setModifications((prev) => [...prev, mod]);
    }
    setCurrentStep(4);
  }

  function handleAddAnother() {
    setSelectedCategory(null);
    setIntakeType("modify");
    setIntakeData({});
    setMessages([]);
    setChatInput("");
    setDraftCount(0);
    setExchangeCount(0);
    setAttachedFiles([]);
    setEditingModIndex(null);
    setCurrentStep(1);
  }

  function handleEditMod(index: number) {
    const mod = modifications[index];
    setSelectedCategory(mod.category);
    setIntakeType(mod.intakeType);
    setIntakeData(mod.intakeData);
    setMessages(mod.messages);
    setDraftCount(mod.messages.filter((m) => m.draftVersion).length);
    setExchangeCount(mod.messages.filter((m) => m.role === "user").length);
    setEditingModIndex(index);
    setCurrentStep(3);
  }

  function handleRemoveMod(index: number) {
    setModifications((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleModExpanded(index: number) {
    setModifications((prev) => prev.map((m, i) => (i === index ? { ...m, expanded: !m.expanded } : m)));
  }

  function handleCheckout() {
    setOrderComplete(true);
    setCurrentStep(5);
  }

  // ─── Pricing Calculations ───
  const subtotal = modifications.reduce((sum, mod, i) => {
    const discount = volumeDiscount(i);
    return sum + mod.baseFee * (1 - discount);
  }, 0);
  const lawyerAddon = deliveryTier === "lawyer-standard" ? LAWYER_ADDON.standard : deliveryTier === "lawyer-priority" ? LAWYER_ADDON.priority : 0;
  const total = subtotal + (lawyerAddon * modifications.length);

  const STEPS = ["Contract Delivered", "Select Category", "Describe Change", "Counsel Engine", "Review & Pay", "Confirmed"];

  // Mobile step indicator
  const stepName = STEPS[currentStep] || "";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-28 md:pb-12">

        {/* ─── Progress Bar ─── */}
        {currentStep < 5 && (
          <div className="mb-6 sm:mb-10">
            {/* Mobile: compact step indicator */}
            <div className="sm:hidden mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[15px] font-semibold text-neutral-900">{stepName}</p>
                <p className="text-[13px] text-neutral-400">Step {currentStep + 1} of 5</p>
              </div>
              <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#be123c] rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / 5) * 100}%` }} />
              </div>
            </div>
            {/* Desktop: full step indicators */}
            <div className="hidden sm:flex items-center gap-2">
              {STEPS.slice(0, 5).map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-semibold shrink-0 ${i <= currentStep ? "bg-[#be123c] text-white" : "bg-neutral-100 text-neutral-400"}`}>
                    {i < currentStep ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : i + 1}
                  </div>
                  <span className={`text-[14px] font-medium truncate ${i <= currentStep ? "text-neutral-900" : "text-neutral-400"}`}>{s}</span>
                  {i < 4 && <div className={`flex-1 h-px min-w-2 ${i < currentStep ? "bg-[#be123c]" : "bg-neutral-200"}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Step 0: Contract Delivery (spec §3.1) ═══ */}
        {currentStep === 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3">Your {session.contractTitle} is ready</h1>
              <p className="text-neutral-500 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">Your base contract has been generated and is ready to download. You can use it as-is, or customize it further.</p>
            </div>

            {/* Key Terms Summary (per spec §3.1) */}
            <div className="max-w-md mx-auto bg-neutral-50 border border-neutral-200 rounded-xl p-5">
              <p className="text-[14px] font-semibold text-neutral-500 uppercase tracking-wide mb-3">Key Terms</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">Contract Type</span><span className="text-neutral-900 font-medium">{session.contractTitle}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Governing Law</span><span className="text-neutral-900 font-medium">{session.governingLaw}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Status</span><span className="text-emerald-600 font-medium">Complete</span></div>
              </div>
            </div>

            {/* Display condition note (per spec §3.3) */}
            {HIGH_COMPLEXITY_TYPES.includes(session.contractType) && (
              <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <p className="text-[14px] text-blue-700 leading-relaxed">Customizations to this instrument type are common and expected. Many clients tailor specific clauses to their deal terms.</p>
              </div>
            )}
            {SIMPLE_TYPES.includes(session.contractType) && (
              <div className="max-w-md mx-auto bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                <p className="text-[14px] text-neutral-500 leading-relaxed">Most clients proceed without customization, but the option is available if you need it.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button className="inline-flex items-center justify-center gap-2 border border-neutral-200 rounded-xl px-6 py-3.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download Contract
              </button>
              <button onClick={() => setCurrentStep(1)} className="inline-flex items-center justify-center gap-2 bg-[#be123c] text-white rounded-xl px-6 py-3.5 text-sm font-semibold hover:bg-[#9f1239] transition-colors">
                Customize This Contract
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            {/* Spec §3.2 — supporting copy */}
            <p className="text-center text-[14px] text-neutral-400 max-w-md mx-auto leading-relaxed">Need something the standard options don&apos;t cover? Our legal drafting engine will craft custom provisions for you, with optional lawyer review.</p>
          </div>
        )}

        {/* ═══ Step 1: Category Selection (spec §4) ═══ */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-2">What would you like to customize?</h2>
              <p className="text-[15px] sm:text-[14px] text-neutral-500 leading-relaxed">Select the area of your contract you&apos;d like to modify. Categories are tailored to your {session.contractTitle}.</p>
            </div>

            {/* Existing modifications banner */}
            {modifications.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <p className="text-[15px] text-emerald-700"><span className="font-semibold">{modifications.length} modification{modifications.length > 1 ? "s" : ""}</span> already added to this session</p>
                <button onClick={() => setCurrentStep(4)} className="text-[14px] text-emerald-700 font-medium underline underline-offset-2 hover:text-emerald-800">View summary</button>
              </div>
            )}

            {/* Category grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button key={cat.id} type="button" onClick={() => handleCategorySelect(cat)} className="text-left bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-[#be123c]/30 hover:shadow-sm transition-all duration-200 group">
                  <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-[#be123c] transition-colors mb-1.5">{cat.name}</h3>
                  <p className="text-[14px] text-neutral-500 leading-relaxed mb-3">{cat.description}</p>
                  <p className="text-[13px] text-neutral-400 leading-relaxed border-t border-neutral-100 pt-3">
                    <span className="font-medium text-neutral-500">e.g.</span> {cat.example}
                  </p>
                </button>
              ))}
            </div>

            <button onClick={() => setCurrentStep(0)} className="text-[15px] text-neutral-500 hover:text-neutral-700 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to contract
            </button>
          </div>
        )}

        {/* ═══ Step 2: Structured Intake (spec §5) ═══ */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-2">{selectedCategory?.name}</h2>
              <p className="text-[15px] sm:text-[14px] text-neutral-500 leading-relaxed">Tell us what you&apos;d like to change. The more specific you are, the better our legal drafting engine can tailor your modification.</p>
            </div>

            {/* Wizard Redirect (per spec §4.4) */}
            {showRedirect && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-[15px] text-blue-800 font-medium mb-1">This might already be available</p>
                <p className="text-[14px] text-blue-700 leading-relaxed mb-3">It looks like the standard wizard may cover this type of change. Would you like to go back and check, or continue with a custom modification?</p>
                <div className="flex gap-3">
                  <Link href="/wizard" className="text-[14px] text-blue-700 font-medium underline underline-offset-2">Go back to wizard</Link>
                  <button onClick={handleDismissRedirect} className="text-[14px] text-blue-600 font-medium">Continue with custom</button>
                </div>
              </div>
            )}

            <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Modification type selector (spec §5.1) */}
              <div>
                <p className={`${labelClass} mb-3`}>What type of modification?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {INTAKE_TYPES.map((opt) => (
                    <button key={opt.id} type="button" onClick={() => setIntakeType(opt.id)} className={`rounded-xl border p-3 sm:p-4 text-left transition-all ${intakeType === opt.id ? "border-[#be123c] bg-[rgba(190,18,60,0.02)]" : "border-neutral-200 hover:border-neutral-300"}`}>
                      <p className={`text-[14px] sm:text-[15px] font-semibold ${intakeType === opt.id ? "text-[#be123c]" : "text-neutral-900"}`}>{opt.label}</p>
                      <p className="text-[10px] sm:text-[13px] text-neutral-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description field — all types */}
              <label className="block">
                <span className={labelClass}>{intakeType === "remove" ? "Which clause do you want to remove, and why?" : intakeType === "add-party" ? "Describe the party you want to add and their role" : "Describe what you want to change"}</span>
                <textarea value={intakeData.description || ""} onChange={(e) => setIntakeData({ ...intakeData, description: e.target.value })} placeholder={`e.g. "${selectedCategory?.example || "Describe your modification..."}"` } rows={3} className={inputClass} />
                <p className="text-[10px] text-neutral-400 mt-1.5">{intakeType === "freeform" ? "Max 1,000 characters" : "Max 500 characters"}</p>
              </label>

              {/* ─── Conditional fields per intake type (spec §5.1.1–5.1.6) ─── */}

              {/* Modify: threshold toggle + values */}
              {intakeType === "modify" && (
                <>
                  <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-4">
                    <input type="checkbox" checked={intakeData.isThreshold === "true"} onChange={(e) => setIntakeData({ ...intakeData, isThreshold: e.target.checked ? "true" : "false" })} className="rounded accent-[#be123c] shrink-0 w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">This is a simple number or threshold change</p>
                      <p className="text-[13px] text-neutral-400">If yes, we may process this instantly without a drafting conversation</p>
                    </div>
                  </div>
                  {intakeData.isThreshold === "true" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className={labelClass}>Current Value</span>
                        <input type="text" value={intakeData.currentValue || ""} onChange={(e) => setIntakeData({ ...intakeData, currentValue: e.target.value })} placeholder="e.g. 30 days" className={inputClass} />
                      </label>
                      <label className="block">
                        <span className={labelClass}>Desired Value</span>
                        <input type="text" value={intakeData.desiredValue || ""} onChange={(e) => setIntakeData({ ...intakeData, desiredValue: e.target.value })} placeholder="e.g. 90 days" className={inputClass} />
                      </label>
                    </div>
                  )}
                </>
              )}

              {/* Add: who does it protect (spec §5.1.2) */}
              {intakeType === "add" && (
                <label className="block">
                  <span className={labelClass}>Who does this provision protect?</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                    {[{ id: "me", label: "Me (my company)" }, { id: "other", label: "The other party" }, { id: "both", label: "Both parties equally" }].map((opt) => (
                      <button key={opt.id} type="button" onClick={() => setIntakeData({ ...intakeData, protects: opt.id })} className={`rounded-xl border px-4 py-3 text-[15px] font-medium transition-all active:scale-[0.97] ${intakeData.protects === opt.id ? "border-[#be123c] text-[#be123c] bg-[rgba(190,18,60,0.02)]" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>{opt.label}</button>
                    ))}
                  </div>
                </label>
              )}

              {/* Remove: reason + risk acknowledgement (spec §5.1.3) */}
              {intakeType === "remove" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <p className="text-[14px] text-amber-800 font-medium mb-1">Important</p>
                  <p className="text-[14px] text-amber-700 leading-relaxed">Removing clauses may affect the enforceability of your agreement. Our counsel engine will flag any risks, and you&apos;ll have the option to add lawyer review.</p>
                </div>
              )}

              {/* Add Party (spec §5.1.5) */}
              {intakeType === "add-party" && (
                <div className="space-y-4">
                  <label className="block">
                    <span className={labelClass}>Role of new party</span>
                    <select value={intakeData.partyRole || ""} onChange={(e) => setIntakeData({ ...intakeData, partyRole: e.target.value })} className={inputClass}>
                      <option value="">Select role...</option>
                      <option value="co-borrower">Co-Borrower</option>
                      <option value="guarantor">Guarantor</option>
                      <option value="co-signer">Co-Signer</option>
                      <option value="additional-lender">Additional Lender</option>
                      <option value="assignee">Assignee</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className={labelClass}>Full legal name of new party</span>
                      <input type="text" value={intakeData.partyName || ""} onChange={(e) => setIntakeData({ ...intakeData, partyName: e.target.value })} placeholder="e.g. Jane Smith" className={inputClass} />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Individual or corporation?</span>
                      <div className="flex gap-3 mt-2.5">
                        {["Individual", "Corporation"].map((opt) => (
                          <button key={opt} type="button" onClick={() => setIntakeData({ ...intakeData, partyType: opt.toLowerCase() })} className={`flex-1 rounded-xl border px-4 py-3 text-[15px] font-medium transition-all active:scale-[0.97] ${intakeData.partyType === opt.toLowerCase() ? "border-[#be123c] text-[#be123c] bg-[rgba(190,18,60,0.02)]" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>{opt}</button>
                        ))}
                      </div>
                    </label>
                  </div>
                  {intakeData.partyRole === "guarantor" && (
                    <label className="block">
                      <span className={labelClass}>Scope of guarantee</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                        {[{ id: "full", label: "Full amount" }, { id: "partial", label: "Partial (specify amount)" }, { id: "specific", label: "Specific obligations only" }].map((opt) => (
                          <button key={opt.id} type="button" onClick={() => setIntakeData({ ...intakeData, guaranteeScope: opt.id })} className={`rounded-xl border px-4 py-3 text-[15px] font-medium transition-all active:scale-[0.97] ${intakeData.guaranteeScope === opt.id ? "border-[#be123c] text-[#be123c] bg-[rgba(190,18,60,0.02)]" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>{opt.label}</button>
                        ))}
                      </div>
                    </label>
                  )}
                </div>
              )}

              {/* Custom Schedule (spec §5.1.4) */}
              {intakeType === "custom-schedule" && (
                <div className="space-y-4">
                  <label className="block">
                    <span className={labelClass}>Schedule type</span>
                    <select value={intakeData.scheduleType || ""} onChange={(e) => setIntakeData({ ...intakeData, scheduleType: e.target.value })} className={inputClass}>
                      <option value="">Select type...</option>
                      <option value="payment">Payment Schedule</option>
                      <option value="milestone">Milestone Table</option>
                      <option value="deliverables">Deliverables Schedule</option>
                      <option value="collateral">Collateral Description</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className={labelClass}>Approximate number of entries</span>
                    <input type="number" min={1} max={50} value={intakeData.entryCount || ""} onChange={(e) => setIntakeData({ ...intakeData, entryCount: e.target.value })} placeholder="e.g. 12" className={inputClass} />
                  </label>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
              <button onClick={() => { setCurrentStep(1); setIntakeData({}); setShowRedirect(false); }} className="inline-flex items-center justify-center gap-2 border border-neutral-200 rounded-xl px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <button onClick={handleIntakeSubmit} disabled={!intakeData.description} className="inline-flex items-center justify-center gap-2 bg-[#be123c] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-[#9f1239] transition-colors disabled:opacity-50 active:scale-[0.98]">
                {canAutoResolve(intakeType, intakeData) ? "Apply Change Instantly" : "Continue to Drafting"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* ═══ Step 3: AI Conversation (spec §6) ═══ */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">Legal Drafting Engine</h2>
                <p className="text-[13px] sm:text-[14px] text-neutral-400 mt-1">Shape your modification through conversation. All revisions happen here — before payment.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[13px] text-neutral-400">
                  <span className="bg-neutral-100 px-2 py-0.5 rounded-full">{exchangeCount}/8</span>
                  <span className="bg-neutral-100 px-2 py-0.5 rounded-full">{draftCount}/3</span>
                </div>
                <button onClick={handleFinishChat} className="inline-flex items-center gap-2 bg-[#be123c] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#9f1239] transition-colors whitespace-nowrap active:scale-[0.97]">
                  Looks Good
                </button>
              </div>
            </div>

            {/* Intake context sidebar (per spec §6.1 — remains visible) */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-neutral-500">
              <span><span className="font-medium text-neutral-600">Category:</span> {selectedCategory?.name}</span>
              <span><span className="font-medium text-neutral-600">Type:</span> {INTAKE_TYPES.find(t => t.id === intakeType)?.label}</span>
              <span><span className="font-medium text-neutral-600">Contract:</span> {session.contractTitle}</span>
              <span><span className="font-medium text-neutral-600">Law:</span> {session.governingLaw}</span>
            </div>

            {/* Chat messages */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div ref={chatContainerRef} className="max-h-[50vh] sm:max-h-[480px] overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "system" ? (
                      <div className="w-full rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-500 shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                          </span>
                          <p className="text-[14px] text-amber-800 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className={`max-w-[85%] sm:max-w-[80%] rounded-xl px-4 sm:px-5 py-3 ${msg.role === "user" ? "bg-neutral-900 text-white" : "bg-neutral-50 border border-neutral-200 text-neutral-900"}`}>
                        <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        {msg.draftVersion && <p className="text-[10px] mt-2 opacity-50">Draft v{msg.draftVersion}</p>}
                      </div>
                    )}
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Attached files display */}
              {attachedFiles.length > 0 && (
                <div className="border-t border-neutral-100 px-4 py-2 flex flex-wrap gap-2">
                  {attachedFiles.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 text-[13px] rounded-lg px-2.5 py-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {/* Chat input (per spec §6.1) */}
              <div className="border-t border-neutral-200 p-3 sm:p-4 flex gap-2 sm:gap-3">
                {/* File upload (per spec §6.1 — clients can attach files) */}
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.png,.jpg" onChange={handleFileChange} />
                <button onClick={handleFileAttach} className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-colors" title="Attach file (PDF, DOCX, PNG, JPG — max 10MB)">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </button>
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} placeholder={exchangeCount >= 8 ? "Conversation limit reached" : "Describe your adjustment..."} className="flex-1 min-w-0 border border-neutral-200 rounded-lg px-3 sm:px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-[rgba(190,18,60,0.1)] focus:border-[#be123c] outline-none" disabled={isAiTyping || exchangeCount >= 8} />
                <button onClick={handleSendMessage} disabled={!chatInput.trim() || isAiTyping || exchangeCount >= 8} className="bg-neutral-900 text-white rounded-lg px-4 sm:px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors shrink-0 active:scale-[0.97]">
                  Send
                </button>
              </div>
            </div>

            <p className="text-[13px] text-neutral-400 text-center">Accepted files: PDF, DOCX, PNG, JPG (max 10MB). Files are reference material only.</p>
          </div>
        )}

        {/* ═══ Step 4: Summary + Quote (spec §7) ═══ */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900">Review & Pay</h2>
                <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-full bg-[#be123c] text-white text-xs font-bold">{modifications.length}</span>
                <span className="text-sm text-neutral-400">{modifications.length === 1 ? 'modification' : 'modifications'}</span>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed">Review your customizations, add more if needed, then choose a delivery option.</p>
            </div>

            {/* Modification cards (spec §7.1 — expandable/collapsible) */}
            <div className="space-y-3">
              {modifications.map((mod, i) => {
                const tier = COMPLEXITY_COLORS[mod.complexityTier];
                const discount = volumeDiscount(i);
                const discountedFee = mod.baseFee * (1 - discount);
                return (
                  <div key={mod.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    {/* Header — always visible, clickable to expand/collapse */}
                    <button type="button" onClick={() => toggleModExpanded(i)} className="w-full px-4 sm:px-6 py-4 flex items-center gap-3 text-left">
                      <span className="flex items-center justify-center w-2 h-2 rounded-full bg-[#be123c] shrink-0 mt-1.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-neutral-900">{mod.category.name}: {INTAKE_TYPES.find(t => t.id === mod.intakeType)?.label || "Custom"}</p>
                        <p className="text-[14px] text-neutral-500 mt-0.5 truncate">{mod.summary}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-block px-3 py-1 text-[13px] font-semibold rounded-full ${tier.bg} ${tier.text}`}>{COMPLEXITY_PRICING[mod.complexityTier].label}</span>
                        <span className="text-sm font-semibold text-neutral-900">${discountedFee.toFixed(0)}</span>
                        <svg className={`w-4 h-4 text-neutral-400 transition-transform ${mod.expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </button>

                    {/* Expanded details */}
                    {mod.expanded && (
                      <div className="px-4 sm:px-6 pb-4 border-t border-neutral-100 pt-4 space-y-3">
                        {/* Structure & Scope (per spec §7.1) */}
                        <div className="text-[14px]">
                          <span className="text-neutral-500 font-medium">Structure & scope:</span>
                          <span className="text-neutral-700 ml-1">{mod.structureScope}</span>
                        </div>

                        {/* Before/After for modify (per spec §7.1) */}
                        {mod.intakeType === "modify" && mod.intakeData.currentValue && (
                          <div className="flex gap-4 text-[14px]">
                            <div><span className="text-neutral-400">Before:</span> <span className="text-neutral-600">{mod.intakeData.currentValue}</span></div>
                            <div><span className="text-neutral-400">After:</span> <span className="text-neutral-700 font-medium">{mod.intakeData.desiredValue}</span></div>
                          </div>
                        )}

                        {/* Pricing line */}
                        <div className="flex items-center gap-3 text-[14px] text-neutral-500 pt-2 border-t border-neutral-100">
                          <span>Base: ${mod.baseFee}</span>
                          {discount > 0 && <span className="text-emerald-600 font-medium">Volume: -{Math.round(discount * 100)}%</span>}
                          {mod.autoResolved && <span className="text-blue-600 font-medium">Auto-resolved</span>}
                        </div>

                        {/* Risk flags (spec §7.1) */}
                        {mod.riskFlags.length > 0 && (
                          <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 space-y-1">
                            {mod.riskFlags.map((flag, fi) => (
                              <p key={fi} className="text-[13px] text-amber-700 flex items-start gap-1.5">
                                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                {flag}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Mandatory lawyer review flag (per spec §12.6) */}
                        {mod.requiresLawyerReview && (
                          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                            <p className="text-[13px] text-rose-700 font-medium">This modification requires lawyer review due to regulatory requirements. Engine-only delivery is not available for this change.</p>
                          </div>
                        )}

                        {/* Edit / Remove actions (per spec §7.5) */}
                        <div className="flex gap-3 pt-1">
                          <button onClick={() => handleEditMod(i)} className="text-[14px] text-neutral-500 hover:text-[#be123c] font-medium transition-colors">Edit</button>
                          <button onClick={() => handleRemoveMod(i)} className="text-[14px] text-neutral-500 hover:text-red-600 font-medium transition-colors">Remove</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add another (per spec §4.3 — multi-modification support) */}
            <button onClick={handleAddAnother} className="w-full border-2 border-dashed border-neutral-200 hover:border-[#be123c] rounded-xl px-6 py-5 flex items-center justify-center gap-3 text-sm font-semibold text-neutral-500 hover:text-[#be123c] transition-all group">
              <span className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-neutral-300 group-hover:border-[#be123c] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </span>
              Add Another Modification
              <span className="text-xs font-normal text-neutral-400 group-hover:text-[#be123c]/60">{modifications.length >= 1 ? '20% off' : ''}{modifications.length >= 2 ? ' \u2192 40% off 3rd+' : ''}</span>
            </button>

            {/* Delivery Options (spec §7.3) */}
            {modifications.length > 0 && (
              <>
                <div>
                  <p className="text-[15px] font-semibold text-neutral-700 mb-3">Choose delivery option</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* AI-Only (per spec §7.3 Option A) */}
                    <button
                      type="button"
                      onClick={() => !anyRequiresLawyer && setDeliveryTier("ai-only")}
                      className={`text-left border rounded-xl p-4 sm:p-6 transition-all ${anyRequiresLawyer ? "opacity-50 cursor-not-allowed border-neutral-200 bg-neutral-50" : deliveryTier === "ai-only" ? "border-[#be123c] border-2 bg-[rgba(190,18,60,0.02)]" : "border-neutral-200 hover:border-neutral-300"}`}
                    >
                      <p className="text-sm font-semibold text-neutral-900 mb-1">Engine-Drafted Contract</p>
                      <p className="text-[14px] text-neutral-500 leading-relaxed mb-3">Delivered immediately upon payment. Drafted by our legal drafting engine based on your instructions.</p>
                      <p className="text-[13px] text-neutral-400">Instant delivery</p>
                      <p className="text-[13px] text-neutral-400 mt-1">Not reviewed by a licensed lawyer</p>
                      {/* Regulatory override warning (per spec §12.6) */}
                      {anyRequiresLawyer && (
                        <div className="mt-3 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2">
                          <p className="text-[13px] text-rose-700 font-medium">Engine-only delivery is unavailable. One or more modifications require lawyer review due to regulatory requirements.</p>
                        </div>
                      )}
                      {/* Risk flag warning */}
                      {!anyRequiresLawyer && modifications.some(m => m.riskFlags.length > 0) && (
                        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                          <p className="text-[13px] text-amber-700 font-medium">Your modification(s) have risk flags. Lawyer review is recommended.</p>
                        </div>
                      )}
                    </button>

                    {/* AI + Lawyer Review (per spec §7.3 Option B) */}
                    <button
                      type="button"
                      onClick={() => setDeliveryTier("lawyer-standard")}
                      className={`text-left border rounded-xl p-4 sm:p-6 transition-all ${deliveryTier.startsWith("lawyer") ? "border-[#be123c] border-2 bg-[rgba(190,18,60,0.02)]" : "border-neutral-200 hover:border-neutral-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-neutral-900">Engine Draft + Lawyer Review</p>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Recommended</span>
                      </div>
                      <p className="text-[14px] text-neutral-500 leading-relaxed mb-3">Reviewed and approved by a licensed Canadian lawyer.</p>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-[14px] text-neutral-600 cursor-pointer">
                          <input type="radio" name="turnaround" checked={deliveryTier === "lawyer-standard"} onChange={() => setDeliveryTier("lawyer-standard")} className="accent-[#be123c]" />
                          Standard (3–5 days) +${LAWYER_ADDON.standard}
                        </label>
                        <label className="flex items-center gap-2 text-[14px] text-neutral-600 cursor-pointer">
                          <input type="radio" name="turnaround" checked={deliveryTier === "lawyer-priority"} onChange={() => setDeliveryTier("lawyer-priority")} className="accent-[#be123c]" />
                          Priority (24h) +${LAWYER_ADDON.priority}
                        </label>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-[13px] text-emerald-700 font-medium">Reviewed & Approved by a Licensed Lawyer</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Order Total (spec §7.4) */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                  <div className="space-y-2 text-sm">
                    {modifications.map((mod, i) => {
                      const disc = volumeDiscount(i);
                      const fee = mod.baseFee * (1 - disc);
                      return (
                        <div key={mod.id} className="flex justify-between text-neutral-500 text-[14px]">
                          <span className="truncate mr-3">{mod.category.name} ({COMPLEXITY_PRICING[mod.complexityTier].label}){disc > 0 ? ` -${Math.round(disc * 100)}%` : ""}</span>
                          <span className="shrink-0">${fee.toFixed(0)}</span>
                        </div>
                      );
                    })}
                    {deliveryTier !== "ai-only" && (
                      <div className="flex justify-between text-neutral-500 text-[14px]">
                        <span>Lawyer review ({deliveryTier === "lawyer-priority" ? "Priority 24h" : "Standard 3–5 days"}) x{modifications.length}</span>
                        <span>${(lawyerAddon * modifications.length).toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-neutral-200 text-neutral-900 font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(0)} CAD</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-2">
                  <button onClick={() => { setModifications([]); setCurrentStep(0); }} className="text-[15px] text-neutral-500 hover:text-neutral-700 transition-colors">Discard all — keep base contract</button>
                  <button onClick={handleCheckout} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#be123c] text-white rounded-xl px-8 py-3.5 text-sm font-semibold hover:bg-[#9f1239] transition-colors active:scale-[0.98]">
                    Proceed to Checkout — ${total.toFixed(0)}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </>
            )}

            {modifications.length === 0 && (
              <div className="text-center py-12">
                <p className="text-neutral-400 text-sm">No modifications yet. Add one to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ Step 5: Order Confirmed (spec §8) ═══ */}
        {currentStep === 5 && (
          <div className="space-y-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3">
                {deliveryTier === "ai-only" ? "Your customized contract is ready" : "Submitted for lawyer review"}
              </h1>
              <p className="text-neutral-500 max-w-lg mx-auto text-sm leading-relaxed">
                {deliveryTier === "ai-only"
                  ? "Your customized contract has been generated and is ready to download."
                  : `Your contract has been submitted for lawyer review. Expected turnaround: ${deliveryTier === "lawyer-priority" ? "24 hours" : "3–5 business days"}.`}
              </p>
            </div>

            {/* Order reference */}
            <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2 text-[14px] text-neutral-600">
              <span className="font-medium">Order ref:</span>
              <span className="font-mono">RBY-{Date.now().toString(36).toUpperCase()}</span>
            </div>

            {/* Modifications summary */}
            <div className="max-w-md mx-auto space-y-3">
              {modifications.map((mod, i) => (
                <div key={mod.id} className="bg-white border border-neutral-200 rounded-lg px-4 py-3 text-left flex items-center gap-3">
                  <span className="flex items-center justify-center w-1.5 h-1.5 rounded-full bg-[#be123c] shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">{mod.category.name}</p>
                    <p className="text-[13px] text-neutral-400 truncate">{mod.summary}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${COMPLEXITY_COLORS[mod.complexityTier].bg} ${COMPLEXITY_COLORS[mod.complexityTier].text}`}>{COMPLEXITY_PRICING[mod.complexityTier].label}</span>
                </div>
              ))}
            </div>

            {/* Status tracker (spec §8.4 — full 4-state tracker) */}
            {deliveryTier !== "ai-only" && (
              <div className="max-w-sm mx-auto">
                <p className="text-[14px] font-semibold text-neutral-500 uppercase tracking-wide mb-4">Status</p>
                <div className="space-y-0">
                  {[
                    { label: "Submitted", desc: "Your contract is in the review queue.", active: true, done: true },
                    { label: "In Review", desc: "A lawyer is reviewing your customizations.", active: false, done: false },
                    { label: "Clarification Needed", desc: "The reviewing lawyer may have a question.", active: false, done: false },
                    { label: "Approved", desc: "Your customized contract is ready.", active: false, done: false },
                  ].map((s, i) => (
                    <div key={i}>
                      <div className="flex items-start gap-3 py-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${s.done ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-400"}`}>
                          {s.done ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <span className="text-[10px] font-medium">{i + 1}</span>}
                        </div>
                        <div className="text-left">
                          <p className={`text-sm ${s.done ? "text-neutral-900 font-medium" : "text-neutral-400"}`}>{s.label}</p>
                          <p className="text-[13px] text-neutral-400 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                      {i < 3 && <div className={`ml-3 w-px h-3 ${i === 0 ? "bg-emerald-300" : "bg-neutral-200"}`} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI-Only footer note (per spec §8.2) */}
            {deliveryTier === "ai-only" && (
              <p className="text-[13px] text-neutral-400 max-w-md mx-auto">This contract was drafted by our legal drafting engine and has not been reviewed by a lawyer.</p>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              {deliveryTier === "ai-only" && (
                <button className="inline-flex items-center justify-center gap-2 bg-[#be123c] text-white rounded-xl px-6 py-3.5 text-sm font-semibold hover:bg-[#9f1239] transition-colors active:scale-[0.98]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Download Customized Contract
                </button>
              )}
              <Link href="/documents" className="inline-flex items-center justify-center gap-2 border border-neutral-200 rounded-xl px-6 py-3.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                Back to Agreements
              </Link>
            </div>

            {/* Upgrade path (spec §8.2 — 30-day upgrade) */}
            {deliveryTier === "ai-only" && (
              <div className="max-w-md mx-auto bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                <p className="text-sm font-medium text-neutral-900 mb-1">Want a lawyer to review your customizations?</p>
                <p className="text-[14px] text-neutral-500 leading-relaxed mb-3">You can upgrade to lawyer review within 30 days. You&apos;ll only pay the review add-on — your base modification fee was already covered.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="text-[15px] text-[#be123c] font-medium hover:underline">Standard Review (+${LAWYER_ADDON.standard})</button>
                  <span className="text-neutral-300 hidden sm:inline">|</span>
                  <button className="text-[15px] text-[#be123c] font-medium hover:underline">Priority Review (+${LAWYER_ADDON.priority})</button>
                </div>
              </div>
            )}

            {/* New modification path (per spec §8.6 Path 1) */}
            <div className="max-w-md mx-auto">
              <button onClick={() => { setModifications([]); setOrderComplete(false); setCurrentStep(1); }} className="text-[15px] text-neutral-500 hover:text-[#be123c] transition-colors font-medium">
                Need another modification? Start a new customization
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile Sticky Bottom Nav ─── */}
      {currentStep === 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3 z-40 md:hidden safe-area-bottom">
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => setCurrentStep(2)} className="text-[15px] text-neutral-500 font-medium">Back</button>
            <div className="text-[13px] text-neutral-400">{exchangeCount}/8 exchanges · {draftCount}/3 drafts</div>
            <button onClick={handleFinishChat} className="bg-[#be123c] text-white rounded-lg px-5 py-2.5 text-sm font-semibold active:scale-[0.97]">
              Looks Good
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
