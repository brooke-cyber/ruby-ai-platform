"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AGREEMENTS, type Category } from "@/data/agreements";
import { getQuestionsForCategories, getModulesForCategories, evaluateCompliance } from "@/data/compliance";
import { JURISDICTIONS } from "@/data/compliance";
import { getPartyLabels, getWizardSteps, getClausePositions, getDraftingInstructions, type ClausePosition } from "@/data/agreement-configs";
import { getTermsForStep, type LegalTerm } from "@/data/legal-terms";

// ─── Types ───
interface PartyInfo { partyA: string; partyB: string; jurisdiction: string; }
interface EmploymentData { salary: string; startDate: string; vacationDays: string; benefitsPlan: string; terminationPosition: string; probationPosition: string; confidentiality: boolean; nonSolicitClient: boolean; nonSolicitClientDuration: string; nonSolicitEmployee: boolean; nonSolicitEmployeeDuration: string; nonCompete: boolean; nonCompeteDuration: string; nonCompeteScope: string; gardenLeave: boolean; ipPosition: string; ipAssignmentScope: string; overtimeEligibility: string; bonusStructure: string; bonusClawback: boolean; workArrangement: string; expTechStipend: boolean; expTravel: boolean; expProfDev: boolean; relocationAssistance: boolean; relocationAmount: string; signingBonus: string; signingBonusRepayMonths: string; }
interface CorporateData { shareholders: { name: string; equity: string; role: string }[]; boardSize: string; appointmentRights: string; reservedMatters: string[]; votingThreshold: string; rofr: boolean; rofrDays: string; tagAlong: boolean; tagAlongThreshold: string; dragAlong: boolean; dragAlongThreshold: string; preEmptive: boolean; deadlockMethod: string; exitMechanism: string; directorAppointmentMethod: string; infoRightsFrequency: string; spendingLimitBeforeBoard: string; expenseApprovalThreshold: string; relatedPartyDisclosure: boolean; }
interface InvestmentData { investmentAmount: string; valuationCap: string; discountRate: number; conversionTriggers: string[]; mfnClause: string; proRataThreshold: string; infoFrequency: string; infoScope: string[]; boardObserver: boolean; proRataRights: boolean; }
interface CommercialData { serviceDescription: string; deploymentModel: string; uptimeCommitment: number; responseCritical: string; responseHigh: string; responseMedium: string; responseLow: string; serviceCreditSchedule: string; pipeda: boolean; dataResidency: string; breachNotification: string; casl: boolean; liabilityCap: string; forceMajeure: boolean; consequentialDamages: boolean; dataBackupDR: boolean; serviceAvailability: string; maintenanceWindow: string; changeManagement: boolean; escalationMatrix: boolean; customerAuditRights: boolean; dataEncryption: string; subProcessorNotification: boolean; breachNotificationTimeline: string; dataPortability: boolean; dataDeletionTimeline: string; crossBorderRestrictions: boolean; }
interface PlatformData { businessType: string; platformUrl: string; hasUserAccounts: boolean; collectsPersonalInfo: boolean; hasEcommerce: boolean; hasUGC: boolean; operatesInQuebec: boolean; hasInternationalUsers: boolean; acceptanceMechanism: string; disputeResolution: string; dataStorage: string; partnershipType: string; profitSplit: string; managementStructure: string; msaPaymentTerms: string; msaIpOwnership: string; ageRestriction: boolean; cookieConsent: string; contentModeration: string; apiAccess: boolean; rateLimiting: boolean; accountSuspensionRights: boolean; classActionWaiver: boolean; }
interface RiskProfile { tolerance: string; priorities: string[]; context: string; experience: string; }
interface InfluencerData { platforms: string[]; contentTypes: string[]; campaignDuration: string; postFrequency: string; hasUsAudience: boolean; usAudiencePercent: string; isRegulatedIndustry: boolean; regulatedCategory: string; collectsPersonalData: boolean; usesAiContent: boolean; hasQuebecAudience: boolean; compensationModel: string; compensationAmount: string; paymentSchedule: string; performanceMetrics: boolean; metricType: string; metricTarget: string; contentApproval: string; approvalDays: string; revisionRounds: string; ipOwnership: string; usageRightsScope: string; usageRightsDuration: string; exclusivity: boolean; exclusivityScope: string; exclusivityDuration: string; moralsClauseScope: string; terminationNotice: string; terminationForCause: string[]; whitelisting: boolean; whitelistingScope: string; boostingRights: boolean; }

const RESERVED_MATTERS_OPTIONS = [
  "Dividend policy", "Debt issuance above threshold", "Related-party transactions",
  "Share issuance or dilution", "Material contracts", "Winding up or dissolution",
  "Amendment to articles", "Sale of substantially all assets",
];

// ─── Shared UI ───
const inputClass = "mt-1.5 block w-full border border-neutral-200 bg-white rounded-lg px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-[rgba(190,18,60,0.1)] focus:border-[#be123c] outline-none transition-all duration-200";
const labelClass = "text-[14px] font-medium text-neutral-700";
const toggleClass = (on: boolean) => `relative w-11 h-6 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-[#be123c]" : "bg-neutral-200"}`;
const toggleDot = (on: boolean) => `absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`;

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className={toggleClass(on)} role="switch" aria-checked={on}>
      <span className={toggleDot(on)} />
    </button>
  );
}

function LegalTermBadge({ term }: { term: LegalTerm }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-block">
      <button type="button" onClick={() => setOpen(!open)} className={`inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-3 py-1 transition-all duration-200 cursor-help ${open ? "bg-[#be123c] text-white border border-[#be123c] shadow-sm" : "text-neutral-600 bg-white border border-neutral-200 shadow-sm hover:border-[#be123c]/40 hover:text-[#be123c] hover:shadow-md"}`}>
        <span>{term.icon}</span> {term.term}
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 left-0 top-full mt-2 w-72 sm:w-80 bg-white border border-neutral-200 rounded-xl shadow-2xl p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[15px] font-bold text-neutral-900">{term.term}</p>
            <button type="button" onClick={() => setOpen(false)} className="text-neutral-300 hover:text-neutral-500 transition-colors -mt-0.5 -mr-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <p className="text-[14px] text-neutral-600 leading-relaxed mb-2">{term.plain}</p>
          {term.detail && <p className="text-[13px] text-neutral-400 leading-relaxed mb-2">{term.detail}</p>}
          {term.example && <div className="text-[13px] text-neutral-500 bg-neutral-50 rounded-lg p-3 leading-relaxed"><span className="font-medium text-neutral-700">Example: </span>{term.example}</div>}
        </div>
      )}
    </span>
  );
}

function HelpTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);
  return (
    <span ref={ref} className="relative inline-block ml-1">
      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }} className="inline-flex items-center gap-0.5 text-[13px] text-neutral-400 hover:text-[#be123c] transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={1.5}/><path strokeLinecap="round" strokeWidth={1.5} d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
        <span className="underline decoration-dotted underline-offset-2">What&apos;s this?</span>
      </button>
      {open && (
        <span className="absolute z-50 left-0 top-full mt-1.5 w-64 sm:w-72 bg-white border border-neutral-200 rounded-lg shadow-xl p-3.5 text-[14px] text-neutral-600 leading-relaxed">
          {text}
        </span>
      )}
    </span>
  );
}

function LegalTermsBar({ stepId }: { stepId: string }) {
  const terms = getTermsForStep(stepId);
  if (terms.length === 0) return null;
  return (
    <div className="mb-6 flex flex-wrap gap-2 items-center">
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400 mr-1">Legal terms</span>
      {terms.map((t) => <LegalTermBadge key={t.term} term={t} />)}
    </div>
  );
}

const GENERATION_STAGES = [
  { label: "Analyzing your inputs", duration: 3000 },
  { label: "Mapping regulatory frameworks", duration: 4000 },
  { label: "Assembling clause positions", duration: 5000 },
  { label: "Drafting agreement sections", duration: 8000 },
  { label: "Running compliance verification", duration: 4000 },
  { label: "Finalizing document", duration: 3000 },
];

function GenerationProgress({ isActive }: { isActive: boolean }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

  useEffect(() => {
    if (!isActive) { setStageIndex(0); setStageProgress(0); return; }
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      let cumulative = 0;
      for (let i = 0; i < GENERATION_STAGES.length; i++) {
        cumulative += GENERATION_STAGES[i].duration;
        if (elapsed < cumulative) {
          setStageIndex(i);
          const stageStart = cumulative - GENERATION_STAGES[i].duration;
          setStageProgress(Math.min(((elapsed - stageStart) / GENERATION_STAGES[i].duration) * 100, 100));
          return;
        }
      }
      setStageIndex(GENERATION_STAGES.length - 1);
      setStageProgress(95);
    }, 100);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const totalDuration = GENERATION_STAGES.reduce((s, st) => s + st.duration, 0);
  const overallProgress = Math.min(
    GENERATION_STAGES.slice(0, stageIndex).reduce((s, st) => s + st.duration, 0) / totalDuration * 100 +
    (GENERATION_STAGES[stageIndex]?.duration || 0) / totalDuration * stageProgress,
    95
  );

  return (
    <div className="space-y-6 py-4">
      {/* Overall progress bar */}
      <div>
        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#be123c] to-rose-400 rounded-full transition-all duration-300 ease-out" style={{ width: `${overallProgress}%` }} />
        </div>
        <p className="text-[14px] text-neutral-400 mt-2 tabular-nums">{Math.round(overallProgress)}% complete</p>
      </div>
      {/* Stage list */}
      <div className="space-y-3">
        {GENERATION_STAGES.map((stage, i) => (
          <div key={stage.label} className={`flex items-center gap-3 transition-all duration-300 ${i < stageIndex ? "opacity-50" : i === stageIndex ? "opacity-100" : "opacity-30"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${i < stageIndex ? "bg-emerald-100" : i === stageIndex ? "bg-[rgba(190,18,60,0.1)]" : "bg-neutral-100"}`}>
              {i < stageIndex ? (
                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              ) : i === stageIndex ? (
                <div className="w-2 h-2 rounded-full bg-[#be123c] animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-neutral-300" />
              )}
            </div>
            <span className={`text-[15px] ${i === stageIndex ? "text-neutral-900 font-medium" : i < stageIndex ? "text-neutral-500" : "text-neutral-400"}`}>{stage.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-2xl font-bold font-serif text-neutral-900 leading-tight">{title}</h2>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 border border-neutral-200 rounded-full px-2.5 py-0.5">Layer 1</span>
      </div>
      <p className="text-[14px] text-neutral-500 mt-2">{subtitle}</p>
    </div>
  );
}

// ─── Component ───
export default function WizardPage() {
  const router = useRouter();
  const [step, _setStep] = useState(0);
  const setStep = (n: number) => { _setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const [selected, setSelected] = useState<string[]>([]);
  const [tier, setTier] = useState<string>("self-serve");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const [party, setParty] = useState<PartyInfo>({ partyA: "", partyB: "", jurisdiction: "ontario" });
  const [triggerAnswers, setTriggerAnswers] = useState<Record<string, boolean>>({});
  const [employment, setEmployment] = useState<EmploymentData>({ salary: "", startDate: "", vacationDays: "15", benefitsPlan: "standard", terminationPosition: "balanced", probationPosition: "balanced", confidentiality: true, nonSolicitClient: true, nonSolicitClientDuration: "12", nonSolicitEmployee: true, nonSolicitEmployeeDuration: "12", nonCompete: false, nonCompeteDuration: "12", nonCompeteScope: "city", gardenLeave: false, ipPosition: "full-assignment", ipAssignmentScope: "all-work-product", overtimeEligibility: "exempt", bonusStructure: "none", bonusClawback: false, workArrangement: "in-office", expTechStipend: false, expTravel: false, expProfDev: false, relocationAssistance: false, relocationAmount: "", signingBonus: "", signingBonusRepayMonths: "" });
  const [corporate, setCorporate] = useState<CorporateData>({ shareholders: [{ name: "", equity: "", role: "" }], boardSize: "3", appointmentRights: "pro-rata", reservedMatters: ["Dividend policy", "Share issuance or dilution"], votingThreshold: "66.67", rofr: true, rofrDays: "30", tagAlong: true, tagAlongThreshold: "50", dragAlong: true, dragAlongThreshold: "75", preEmptive: true, deadlockMethod: "mediation-arbitration", exitMechanism: "shotgun", directorAppointmentMethod: "pro-rata", infoRightsFrequency: "quarterly", spendingLimitBeforeBoard: "", expenseApprovalThreshold: "", relatedPartyDisclosure: true });
  const [investment, setInvestment] = useState<InvestmentData>({ investmentAmount: "", valuationCap: "", discountRate: 20, conversionTriggers: ["equity-financing"], mfnClause: "both", proRataThreshold: "5", infoFrequency: "quarterly", infoScope: ["P&L", "Balance sheet"], boardObserver: false, proRataRights: true });
  const [commercial, setCommercial] = useState<CommercialData>({ serviceDescription: "", deploymentModel: "cloud", uptimeCommitment: 99.9, responseCritical: "1", responseHigh: "4", responseMedium: "8", responseLow: "24", serviceCreditSchedule: "tiered", pipeda: true, dataResidency: "canada", breachNotification: "72", casl: true, liabilityCap: "12mo", forceMajeure: true, consequentialDamages: true, dataBackupDR: true, serviceAvailability: "24-7", maintenanceWindow: "sunday-2am", changeManagement: true, escalationMatrix: false, customerAuditRights: false, dataEncryption: "both", subProcessorNotification: true, breachNotificationTimeline: "72h", dataPortability: true, dataDeletionTimeline: "30", crossBorderRestrictions: false });
  const [platform, setPlatform] = useState<PlatformData>({ businessType: "saas", platformUrl: "", hasUserAccounts: true, collectsPersonalInfo: true, hasEcommerce: false, hasUGC: false, operatesInQuebec: false, hasInternationalUsers: false, acceptanceMechanism: "clickwrap", disputeResolution: "arbitration", dataStorage: "canada", partnershipType: "general", profitSplit: "equal", managementStructure: "all-partners", msaPaymentTerms: "net-30", msaIpOwnership: "client-owns", ageRestriction: false, cookieConsent: "banner", contentModeration: "post-moderation", apiAccess: false, rateLimiting: true, accountSuspensionRights: true, classActionWaiver: false });
  const [riskProfile, setRiskProfile] = useState<RiskProfile>({ tolerance: "balanced", priorities: [], context: "", experience: "first-time" });
  const [influencer, setInfluencer] = useState<InfluencerData>({ platforms: ["instagram"], contentTypes: ["photo"], campaignDuration: "3-months", postFrequency: "weekly", hasUsAudience: false, usAudiencePercent: "0", isRegulatedIndustry: false, regulatedCategory: "", collectsPersonalData: false, usesAiContent: false, hasQuebecAudience: false, compensationModel: "flat-fee", compensationAmount: "", paymentSchedule: "on-delivery", performanceMetrics: false, metricType: "", metricTarget: "", contentApproval: "brand-pre-approval", approvalDays: "3", revisionRounds: "2", ipOwnership: "brand-owns-license", usageRightsScope: "all-channels", usageRightsDuration: "campaign-plus-12", exclusivity: false, exclusivityScope: "", exclusivityDuration: "campaign-only", moralsClauseScope: "mutual", terminationNotice: "30", terminationForCause: [], whitelisting: false, whitelistingScope: "", boostingRights: false });

  useEffect(() => {
    const s = sessionStorage.getItem("ruby-selected");
    const t = sessionStorage.getItem("ruby-tier");
    if (s) setSelected(JSON.parse(s));
    if (t) setTier(t);
  }, []);

  const items = AGREEMENTS.filter((a) => selected.includes(a.id));
  const categories = useMemo(() => [...new Set(items.map((a) => a.category))] as Category[], [items]);
  const hasEmployment = categories.includes("employment");
  const hasCorporate = categories.includes("corporate");
  const hasInvestment = categories.includes("investment");
  const hasCommercial = categories.includes("commercial");
  const hasPlatform = categories.includes("platform");
  const hasCreator = categories.includes("creator");

  // Agreement-specific configurations
  const selectedIds = items.map((a) => a.id);
  const hasInfluencer = selectedIds.includes("influencer-agreement");
  const partyLabels = useMemo(() => getPartyLabels(selectedIds), [selectedIds]);
  const agreementClausePositions = useMemo(() => getClausePositions(selectedIds), [selectedIds]);
  const [clauseSelections, setClauseSelections] = useState<Record<string, string>>({});

  const questions = useMemo(() => getQuestionsForCategories(categories), [categories]);
  const { activeModules, warnings } = useMemo(
    () => evaluateCompliance(categories, party.jurisdiction, triggerAnswers),
    [categories, party.jurisdiction, triggerAnswers]
  );

  const steps = useMemo(() => {
    const s: { id: string; label: string }[] = [
      { id: "party", label: "Party Information" },
      { id: "risk-profile", label: "Your Risk Profile" },
      { id: "compliance", label: "Compliance Check" },
    ];

    // Use agreement-specific wizard steps instead of generic category-based ones
    const neededSteps = getWizardSteps(selectedIds);
    const STEP_LABELS: Record<string, string> = {
      "emp-comp": "Compensation & Benefits",
      "emp-clause": "Clause Positions",
      "emp-covenant": "Restrictive Covenants",
      "emp-ip": "IP Assignment",
      "corp-shareholders": "Shareholder Structure",
      "corp-governance": "Governance Provisions",
      "corp-transfer": "Transfer Restrictions",
      "corp-deadlock": "Deadlock & Exit",
      "inv-terms": "Investment Terms",
      "inv-conversion": "Conversion Mechanics",
      "inv-info": "Information Rights",
      "com-service": "Service Definition",
      "com-sla": "Service Levels",
      "com-data": "Data & Privacy",
      "com-liability": "Liability",
      "plat-business": "Business & Platform",
      "plat-terms": "Terms & Privacy",
      "plat-structure": "Partnership / MSA",
      "inf-campaign": "Campaign & Platforms",
      "inf-deliverables": "Content & Approval",
      "inf-rights": "IP, Exclusivity & Rights",
      "inf-terms": "Compensation & Termination",
      "inf-compliance": "Disclosure & Compliance",
    };
    for (const stepId of neededSteps) {
      s.push({ id: stepId, label: STEP_LABELS[stepId] || stepId });
    }

    // Add agreement-specific clause positions step if there are any
    if (agreementClausePositions.length > 0) {
      s.push({ id: "agreement-clauses", label: "Agreement Strategy" });
    }

    s.push({ id: "review", label: "Review & Generate" });
    return s;
  }, [selectedIds, agreementClausePositions]);

  const currentStepId = steps[step]?.id || "party";
  const isOntarioNonCsuiteNonCompete = triggerAnswers["tq-ontario"] && !triggerAnswers["tq-csuite"] && employment.nonCompete;

  const complexityScore = useMemo(() => {
    let score = 0;
    for (const item of items) {
      if (item.complexity === "low") score += 1;
      else if (item.complexity === "medium") score += 2;
      else if (item.complexity === "high") score += 3;
      else score += 4;
    }
    return Math.min(score + activeModules.length, 20);
  }, [items, activeModules]);

  async function handleGenerate() {
    setIsGenerating(true);
    setError("");
    try {
      const wizardData = { party, triggerAnswers, riskProfile, employment: hasEmployment ? employment : undefined, corporate: hasCorporate ? corporate : undefined, investment: hasInvestment ? investment : undefined, commercial: hasCommercial ? commercial : undefined, platform: hasPlatform ? platform : undefined, influencer: (hasInfluencer || hasCreator) ? influencer : undefined, activeModules: activeModules.map((m) => m.name), warnings, tier, clauseSelections, agreementIds: selectedIds };
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      console.log("[Ruby] Starting generation fetch...");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categories, agreementType: items.map((i) => i.title).join(", "), jurisdiction: party.jurisdiction, wizardData }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      console.log("[Ruby] Fetch complete, status:", res.status);
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Generation failed (${res.status})`); }
      console.log("[Ruby] Reading response body...");
      const text = await res.text();
      console.log("[Ruby] Response body length:", text.length);
      const data = JSON.parse(text);
      sessionStorage.setItem("ruby-draft", data.draft);
      sessionStorage.setItem("ruby-contract-type", categories.join(","));
      sessionStorage.setItem("ruby-contract-title", items.map((i) => i.title).join(", "));
      console.log("[Ruby] Draft stored, navigating to preview...");
      router.push("/preview");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Generation timed out. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
      console.error("[Ruby] Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  function renderStep() {
    switch (currentStepId) {
      case "party": return (
        <div className="space-y-6">
          <StepHeader title="Party Information" subtitle="Identify the parties and governing jurisdiction for your agreement." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>{partyLabels.partyALabel}</span><input type="text" value={party.partyA} onChange={(e) => setParty({ ...party, partyA: e.target.value })} placeholder={partyLabels.partyAPlaceholder} className={inputClass} /></label>
            <label className="block"><span className={labelClass}>{partyLabels.partyBLabel}</span><input type="text" value={party.partyB} onChange={(e) => setParty({ ...party, partyB: e.target.value })} placeholder={partyLabels.partyBPlaceholder} className={inputClass} /></label>
          </div>
          <label className="block"><span className={labelClass}>Jurisdiction <HelpTip text="This is the province whose laws will govern your agreement. Pick the province where your business operates or where the work will be performed." /></span>
            <select value={party.jurisdiction} onChange={(e) => setParty({ ...party, jurisdiction: e.target.value })} className={inputClass}>
              {JURISDICTIONS.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </label>
        </div>
      );

      case "compliance": return (
        <div className="space-y-6">
          <StepHeader title="Compliance Check" subtitle="Answer these questions so we can automatically include the right legal protections. If you're unsure, it's safer to say yes — we'll handle the rest." />
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-5 transition-colors hover:bg-neutral-50">
                <div className="pr-4">
                  <p className="text-sm font-medium text-neutral-900">{q.question}</p>
                  <p className="text-[14px] text-neutral-400 mt-0.5">{q.description}</p>
                </div>
                <Toggle on={!!triggerAnswers[q.id]} onToggle={() => setTriggerAnswers((prev) => ({ ...prev, [q.id]: !prev[q.id] }))} />
              </div>
            ))}
          </div>
          {activeModules.length > 0 && (
            <div className="rounded-xl bg-white border border-neutral-200 p-5">
              <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-neutral-500 mb-3">Active Frameworks</p>
              <div className="flex flex-wrap gap-2">
                {activeModules.map((m) => <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full border border-[#be123c] text-[#be123c] bg-[rgba(190,18,60,0.03)] px-3 py-1 text-[13px] font-medium">{m.shortName}</span>)}
              </div>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((w, i) => <div key={i} className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-[15px] text-red-600">{w}</div>)}
            </div>
          )}
        </div>
      );

      case "emp-comp": return (
        <div className="space-y-6">
          <StepHeader title="Compensation & Benefits" subtitle="Core employment terms, compensation structure, bonuses, and allowances." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Annual Salary (CAD)</span><input type="text" value={employment.salary} onChange={(e) => setEmployment({ ...employment, salary: e.target.value })} placeholder="$120,000" className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Start Date</span><input type="date" value={employment.startDate} onChange={(e) => setEmployment({ ...employment, startDate: e.target.value })} className={inputClass} /></label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Vacation Days</span><input type="number" value={employment.vacationDays} onChange={(e) => setEmployment({ ...employment, vacationDays: e.target.value })} className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Benefits Plan</span>
              <select value={employment.benefitsPlan} onChange={(e) => setEmployment({ ...employment, benefitsPlan: e.target.value })} className={inputClass}>
                <option value="standard">Standard Group Benefits</option><option value="enhanced">Enhanced Executive Benefits</option><option value="none">No Benefits</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Overtime Eligibility <HelpTip text="Exempt employees don't get overtime pay — they're paid the same salary regardless of hours. Non-exempt employees must be paid overtime for hours worked beyond the standard work week." /></span>
              <select value={employment.overtimeEligibility} onChange={(e) => setEmployment({ ...employment, overtimeEligibility: e.target.value })} className={inputClass}>
                <option value="exempt">Exempt (no overtime)</option><option value="non-exempt">Non-Exempt (overtime eligible)</option>
              </select>
            </label>
            <label className="block"><span className={labelClass}>Work Arrangement</span>
              <select value={employment.workArrangement} onChange={(e) => setEmployment({ ...employment, workArrangement: e.target.value })} className={inputClass}>
                <option value="in-office">In-Office</option><option value="remote">Fully Remote</option><option value="hybrid">Hybrid</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Bonus Structure <HelpTip text="Discretionary means the company decides each year whether to pay a bonus. Performance-based ties the bonus to specific targets. Guaranteed means the bonus is part of the compensation package regardless of performance." /></span>
              <select value={employment.bonusStructure} onChange={(e) => setEmployment({ ...employment, bonusStructure: e.target.value })} className={inputClass}>
                <option value="none">No Bonus</option><option value="discretionary">Discretionary</option><option value="performance">Performance-Based</option><option value="guaranteed">Guaranteed</option>
              </select>
            </label>
            {employment.bonusStructure !== "none" && (
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                <div><p className="text-sm font-medium text-neutral-900">Bonus Clawback on Termination</p><p className="text-[13px] text-neutral-400">Company can recover bonus if the employee leaves within a set period</p></div>
                <Toggle on={employment.bonusClawback} onToggle={() => setEmployment({ ...employment, bonusClawback: !employment.bonusClawback })} />
              </div>
            )}
          </div>
          <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-neutral-500">Expenses & Allowances</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "expTechStipend" as const, label: "Technology Stipend", desc: "Covers home office equipment, laptop, or software" },
              { key: "expTravel" as const, label: "Travel Expenses", desc: "Reimbursement for business travel, mileage, and meals" },
              { key: "expProfDev" as const, label: "Professional Development", desc: "Budget for courses, conferences, certifications, or training" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                <div><p className="text-sm font-medium text-neutral-900">{item.label}</p><p className="text-[13px] text-neutral-400">{item.desc}</p></div>
                <Toggle on={employment[item.key]} onToggle={() => setEmployment({ ...employment, [item.key]: !employment[item.key] })} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
            <div><p className="text-sm font-medium text-neutral-900">Relocation Assistance</p><p className="text-[13px] text-neutral-400">Financial help for the employee to move for this role</p></div>
            <Toggle on={employment.relocationAssistance} onToggle={() => setEmployment({ ...employment, relocationAssistance: !employment.relocationAssistance })} />
          </div>
          {employment.relocationAssistance && (
            <label className="block"><span className={labelClass}>Relocation Amount (CAD)</span><input type="text" value={employment.relocationAmount} onChange={(e) => setEmployment({ ...employment, relocationAmount: e.target.value })} placeholder="$10,000" className={inputClass} /></label>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Signing Bonus (CAD) <HelpTip text="A one-time payment when the employee accepts the offer. Often includes a repayment clause if they leave early." /></span><input type="text" value={employment.signingBonus} onChange={(e) => setEmployment({ ...employment, signingBonus: e.target.value })} placeholder="$5,000 (leave blank for none)" className={inputClass} /></label>
            {employment.signingBonus && (
              <label className="block"><span className={labelClass}>Repayment if employee leaves within (months)</span><input type="number" value={employment.signingBonusRepayMonths} onChange={(e) => setEmployment({ ...employment, signingBonusRepayMonths: e.target.value })} placeholder="12" className={inputClass} /></label>
            )}
          </div>
        </div>
      );

      case "emp-clause": return (
        <div className="space-y-6">
          <StepHeader title="Clause Positions" subtitle="Choose how strongly each clause protects you vs. the other party. Left favours your company, middle is fair to both sides, right favours the employee." />
          {[{ id: "terminationPosition" as const, label: "Termination Without Cause", help: "If you fire someone without a specific reason, how much severance do they get? 'ESA minimum' is the legal minimum. 'Enhanced formula' adds extra based on years worked. 'Full continuation' pays their full salary for a set period.", ef: "ESA minimum only", bal: "ESA-Plus enhanced formula", ep: "Full compensation continuation" }, { id: "probationPosition" as const, label: "Probation Period", help: "A trial period at the start of employment. During probation, you can let someone go more easily. Longer probation favours the employer, shorter or none favours the employee.", ef: "Maximum probation (6 months)", bal: "Standard probation (3 months)", ep: "No probation period" }].map((clause) => (
            <div key={clause.id} className="rounded-xl border border-neutral-200 p-5">
              <p className="text-sm font-semibold text-neutral-900 mb-4">{clause.label} {clause.help && <HelpTip text={clause.help} />}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["employer-favourable", "balanced", "employee-favourable"] as const).map((pos, i) => {
                  const labels = [clause.ef, clause.bal, clause.ep];
                  const active = employment[clause.id] === pos;
                  return <button key={pos} type="button" onClick={() => setEmployment({ ...employment, [clause.id]: pos })} className={`rounded-xl border px-4 py-3 text-[15px] font-medium transition-all duration-200 ${active ? "border-[#be123c] text-[#be123c] bg-[rgba(190,18,60,0.03)]" : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300"}`}>{labels[i]}</button>;
                })}
              </div>
            </div>
          ))}
        </div>
      );

      case "emp-covenant": return (
        <div className="space-y-5">
          <StepHeader title="Restrictive Covenants" subtitle="These clauses protect your business after someone leaves. Toggle on the protections you want — we'll draft them to be enforceable in your province." />
          <div className="rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-neutral-900">Confidentiality Clause <HelpTip text="A confidentiality clause legally prevents the employee from sharing your company's trade secrets, client lists, pricing, and other sensitive information — both during and after employment. This is the most enforceable type of restrictive covenant." /></p><p className="text-[14px] text-neutral-400 mt-0.5">Prevents them from sharing your company's private information, client lists, or trade secrets</p></div>
              <Toggle on={employment.confidentiality} onToggle={() => setEmployment({ ...employment, confidentiality: !employment.confidentiality })} />
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-neutral-900">Non-Solicitation of Clients <HelpTip text="Stops the departing employee from contacting your clients or customers to poach their business. Courts enforce these more readily than non-competes because they're narrower in scope." /></p><p className="text-[14px] text-neutral-400 mt-0.5">Stops them from reaching out to your clients or customers to take their business after they leave</p></div>
              <Toggle on={employment.nonSolicitClient} onToggle={() => setEmployment({ ...employment, nonSolicitClient: !employment.nonSolicitClient })} />
            </div>
            {employment.nonSolicitClient && <label className="block"><span className={labelClass}>Client Non-Solicitation Duration (months)</span><input type="number" value={employment.nonSolicitClientDuration} onChange={(e) => setEmployment({ ...employment, nonSolicitClientDuration: e.target.value })} className={inputClass} /></label>}
          </div>
          <div className="rounded-xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-neutral-900">Non-Solicitation of Employees <HelpTip text="Prevents the departing employee from recruiting your other team members to join them at a competitor. Especially important for managers and senior staff who have strong relationships with your team." /></p><p className="text-[14px] text-neutral-400 mt-0.5">Stops them from recruiting your other team members to leave with them</p></div>
              <Toggle on={employment.nonSolicitEmployee} onToggle={() => setEmployment({ ...employment, nonSolicitEmployee: !employment.nonSolicitEmployee })} />
            </div>
            {employment.nonSolicitEmployee && <label className="block"><span className={labelClass}>Employee Non-Solicitation Duration (months)</span><input type="number" value={employment.nonSolicitEmployeeDuration} onChange={(e) => setEmployment({ ...employment, nonSolicitEmployeeDuration: e.target.value })} className={inputClass} /></label>}
          </div>
          <div className="rounded-xl border border-neutral-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0"><p className="text-sm font-medium text-neutral-900">Non-Competition Clause <HelpTip text="Prevents the employee from working for a direct competitor after leaving. These are the hardest restrictive covenants to enforce — courts will only uphold them if they're reasonable in duration, geography, and scope. In Ontario, they're banned for non-C-suite employees." /></p><p className="text-[14px] text-neutral-400 mt-0.5">Prevents them from working for a direct competitor for a set period after leaving</p></div>
              <Toggle on={employment.nonCompete} onToggle={() => setEmployment({ ...employment, nonCompete: !employment.nonCompete })} />
            </div>
            {isOntarioNonCsuiteNonCompete && <div className="mt-3 rounded-xl border border-red-100 bg-red-50/50 p-4 text-[15px] text-red-600 leading-relaxed">Ontario ESA s.67.2: Non-compete clauses are void for non-C-suite employees. The system will automatically substitute enhanced non-solicitation provisions.</div>}
            {employment.nonCompete && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <label className="block"><span className={labelClass}>Non-Compete Duration (months)</span><input type="number" value={employment.nonCompeteDuration} onChange={(e) => setEmployment({ ...employment, nonCompeteDuration: e.target.value })} className={inputClass} /></label>
                <label className="block"><span className={labelClass}>Non-Compete Geographic Scope <HelpTip text="How wide the geographic restriction is. Narrower scopes (city-level) are much more likely to be enforced by courts than broad scopes (national or industry-wide)." /></span>
                  <select value={employment.nonCompeteScope} onChange={(e) => setEmployment({ ...employment, nonCompeteScope: e.target.value })} className={inputClass}>
                    <option value="city">City / Metro Area</option><option value="province">Province-Wide</option><option value="national">National (Canada)</option><option value="industry">Industry-Specific (no geographic limit)</option>
                  </select>
                </label>
              </div>
            )}
            {employment.nonCompete && (
              <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 mt-2">
                <div><p className="text-sm font-medium text-neutral-900">Garden Leave <HelpTip text="Pays the employee during the non-compete period so courts are more likely to enforce it. The employee stays on payroll but doesn't come to work — this makes the non-compete much more defensible." /></p><p className="text-[13px] text-neutral-400">Pay the employee during the restricted period to strengthen enforceability</p></div>
                <Toggle on={employment.gardenLeave} onToggle={() => setEmployment({ ...employment, gardenLeave: !employment.gardenLeave })} />
              </div>
            )}
          </div>
          <div className="rounded-xl border border-neutral-200 p-5">
            <p className="text-sm font-semibold text-neutral-900 mb-3">IP Assignment Scope <HelpTip text="Controls what work the employee creates that belongs to the company. 'All work product' is broadest — everything they create during employment. 'Only work-related' is limited to things related to their job duties. 'Only during working hours' is the narrowest." /></p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[{ id: "all-work-product", label: "All Work Product", desc: "Everything created during employment belongs to the company" }, { id: "work-related-only", label: "Only Work-Related", desc: "Only inventions and creations related to job duties" }, { id: "working-hours-only", label: "Only During Working Hours", desc: "Company only owns what's created on the clock" }].map((opt) => (
                <button key={opt.id} type="button" onClick={() => setEmployment({ ...employment, ipAssignmentScope: opt.id })} className={`text-left rounded-xl border p-4 transition-all duration-200 ${employment.ipAssignmentScope === opt.id ? "border-[#be123c] border-2 bg-[rgba(190,18,60,0.02)] shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"}`}>
                  <p className="text-[15px] font-semibold text-neutral-900 mb-1">{opt.label}</p>
                  <p className="text-[13px] text-neutral-400 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      );

      case "emp-ip": return (
        <div className="space-y-6">
          <StepHeader title="IP Assignment" subtitle="Intellectual property ownership and moral rights provisions." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[{ id: "full-assignment", label: "Full Assignment", desc: "All IP created during employment assigned to employer" }, { id: "license-back", label: "License-Back", desc: "IP assigned but employee retains license for personal use" }, { id: "no-assignment", label: "No Assignment", desc: "Employee retains IP ownership" }].map((pos) => (
              <button key={pos.id} type="button" onClick={() => setEmployment({ ...employment, ipPosition: pos.id })} className={`card text-left p-5 transition-all duration-200 ${employment.ipPosition === pos.id ? "border-[#be123c] border-2 shadow-sm" : "hover:border-neutral-300"}`}>
                <p className="text-sm font-semibold text-neutral-900">{pos.label}</p>
                <p className="text-[14px] text-neutral-400 mt-1 leading-relaxed">{pos.desc}</p>
              </button>
            ))}
          </div>
        </div>
      );

      case "corp-shareholders": return (
        <div className="space-y-6">
          <StepHeader title="Shareholder Structure" subtitle="Define shareholders, ownership percentages, and roles. Must total 100%." />
          {corporate.shareholders.map((sh, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="Shareholder name" value={sh.name} onChange={(e) => { const s = [...corporate.shareholders]; s[i] = { ...s[i], name: e.target.value }; setCorporate({ ...corporate, shareholders: s }); }} className={inputClass} />
              <input placeholder="Equity %" type="number" value={sh.equity} onChange={(e) => { const s = [...corporate.shareholders]; s[i] = { ...s[i], equity: e.target.value }; setCorporate({ ...corporate, shareholders: s }); }} className={inputClass} />
              <div className="flex gap-3">
                <input placeholder="Role" value={sh.role} onChange={(e) => { const s = [...corporate.shareholders]; s[i] = { ...s[i], role: e.target.value }; setCorporate({ ...corporate, shareholders: s }); }} className={`flex-1 ${inputClass}`} />
                {corporate.shareholders.length > 1 && <button type="button" onClick={() => setCorporate({ ...corporate, shareholders: corporate.shareholders.filter((_, j) => j !== i) })} className="text-neutral-400 hover:text-red-500 text-sm font-medium transition-colors mt-1.5">Remove</button>}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setCorporate({ ...corporate, shareholders: [...corporate.shareholders, { name: "", equity: "", role: "" }] })} className="text-[15px] text-neutral-900 font-medium hover:text-[#be123c] transition-colors">+ Add Shareholder</button>
          {(() => { const total = corporate.shareholders.reduce((s, sh) => s + (parseFloat(sh.equity) || 0), 0); return total !== 100 && total > 0 ? <p className="text-[15px] text-amber-700">Total equity: {total}% (must equal 100%)</p> : null; })()}
        </div>
      );

      case "corp-governance": return (
        <div className="space-y-6">
          <StepHeader title="Governance Provisions" subtitle="Decide how major decisions get made — who sits on the board, what percentage of votes are needed, and which big decisions need special approval." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Board Size (directors) <HelpTip text="How many people sit on the board of directors? The board makes major business decisions. More directors means more voices, but can slow things down." /></span><input type="number" value={corporate.boardSize} onChange={(e) => setCorporate({ ...corporate, boardSize: e.target.value })} className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Voting Threshold (%) <HelpTip text="The percentage of shareholder votes needed to approve major decisions. 50% means a simple majority. 66.67% or higher means you need a supermajority — this protects minority shareholders from being outvoted." /></span><input type="text" value={corporate.votingThreshold} onChange={(e) => setCorporate({ ...corporate, votingThreshold: e.target.value })} placeholder="66.67" className={inputClass} /></label>
          </div>
          <label className="block"><span className={labelClass}>Director Appointment Rights <HelpTip text="Determines how board seats are allocated. Pro-rata means each shareholder group gets seats proportional to their ownership. Named means specific shareholders get guaranteed seats." /></span>
            <select value={corporate.directorAppointmentMethod} onChange={(e) => setCorporate({ ...corporate, directorAppointmentMethod: e.target.value })} className={inputClass}>
              <option value="pro-rata">Pro-Rata (seats based on ownership %)</option><option value="named">Named Appointment (specific shareholders pick specific seats)</option><option value="majority-appoints">Majority Shareholder Appoints All</option><option value="mutual-agreement">Mutual Agreement Required for All Appointments</option>
            </select>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Information Rights Frequency <HelpTip text="How often shareholders receive financial updates about the company. More frequent reporting keeps everyone informed but requires more administrative effort." /></span>
              <select value={corporate.infoRightsFrequency} onChange={(e) => setCorporate({ ...corporate, infoRightsFrequency: e.target.value })} className={inputClass}>
                <option value="monthly">Monthly Financials</option><option value="quarterly">Quarterly Financials</option><option value="annual">Annual Financials Only</option>
              </select>
            </label>
            <label className="block"><span className={labelClass}>Spending Limit Before Board Approval (CAD) <HelpTip text="The maximum dollar amount management can spend on a single expense or decision without needing the board's approval. Lower limits give the board more control." /></span><input type="text" value={corporate.spendingLimitBeforeBoard} onChange={(e) => setCorporate({ ...corporate, spendingLimitBeforeBoard: e.target.value })} placeholder="$25,000" className={inputClass} /></label>
          </div>
          <label className="block"><span className={labelClass}>Expense Approval Threshold (CAD) <HelpTip text="The dollar amount above which individual expenses need explicit approval. Keeps day-to-day spending flexible while preventing large unauthorized purchases." /></span><input type="text" value={corporate.expenseApprovalThreshold} onChange={(e) => setCorporate({ ...corporate, expenseApprovalThreshold: e.target.value })} placeholder="$5,000" className={inputClass} /></label>
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
            <div><p className="text-sm font-medium text-neutral-900">Related Party Transaction Disclosure <HelpTip text="Requires shareholders and directors to disclose any deals between the company and themselves, their family members, or their other businesses. This prevents conflicts of interest and self-dealing." /></p><p className="text-[14px] text-neutral-400 mt-0.5">Require disclosure when a shareholder or director has a personal interest in a company transaction</p></div>
            <Toggle on={corporate.relatedPartyDisclosure} onToggle={() => setCorporate({ ...corporate, relatedPartyDisclosure: !corporate.relatedPartyDisclosure })} />
          </div>
          <div><p className={`${labelClass} mb-3`}>Reserved Matters <HelpTip text="These are big decisions that can't be made without special approval from all (or most) shareholders — even if one person owns more shares. Check the ones you want to protect." /></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RESERVED_MATTERS_OPTIONS.map((m) => (<label key={m} className="flex items-center gap-3 text-sm text-neutral-500 cursor-pointer"><input type="checkbox" checked={corporate.reservedMatters.includes(m)} onChange={(e) => setCorporate({ ...corporate, reservedMatters: e.target.checked ? [...corporate.reservedMatters, m] : corporate.reservedMatters.filter((r) => r !== m) })} className="rounded border-neutral-300 accent-[#be123c] focus:ring-[rgba(190,18,60,0.1)]" />{m}</label>))}
            </div>
          </div>
        </div>
      );

      case "corp-transfer": return (
        <div className="space-y-5">
          <StepHeader title="Transfer Restrictions" subtitle="Control what happens when someone wants to sell their shares. These rules protect you from ending up in business with someone you didn't choose." />
          {[{ key: "rofr" as const, label: "Right of First Refusal (ROFR)", help: "If a shareholder wants to sell their shares, the other shareholders get the first chance to buy them — before they can sell to an outsider.", dur: "rofrDays" as const, durLabel: "Exercise Period (days)" }, { key: "tagAlong" as const, label: "Tag-Along Rights", help: "If a majority shareholder sells their shares, minority shareholders can join the sale on the same terms — so they don't get left behind.", dur: "tagAlongThreshold" as const, durLabel: "Threshold (%)" }, { key: "dragAlong" as const, label: "Drag-Along Rights", help: "If shareholders owning above the threshold want to sell the company, they can require the remaining shareholders to sell too — prevents a minority from blocking a deal.", dur: "dragAlongThreshold" as const, durLabel: "Threshold (%)" }, { key: "preEmptive" as const, label: "Pre-Emptive Rights", help: "When the company issues new shares, existing shareholders get the right to buy their proportional share first — so their ownership percentage doesn't get diluted.", dur: null, durLabel: "" }].map((item) => (
            <div key={item.key} className="rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0"><p className="text-sm font-medium text-neutral-900">{item.label} {item.help && <HelpTip text={item.help} />}</p></div>
                <Toggle on={corporate[item.key]} onToggle={() => setCorporate({ ...corporate, [item.key]: !corporate[item.key] })} />
              </div>
              {corporate[item.key] && item.dur && <input type="number" value={corporate[item.dur]} onChange={(e) => setCorporate({ ...corporate, [item.dur!]: e.target.value })} placeholder={item.durLabel} className={`mt-3 w-48 ${inputClass}`} />}
            </div>
          ))}
        </div>
      );

      case "corp-deadlock": return (
        <div className="space-y-6">
          <StepHeader title="Deadlock & Exit" subtitle="What happens when co-owners can't agree, or someone wants out? These are the 'break glass' rules that prevent expensive lawsuits." />
          <div><p className={`${labelClass} mb-3`}>Deadlock Resolution Method</p>
            <div className="space-y-2">{[{ id: "mediation-arbitration", label: "Mediation then Arbitration", help: "A neutral third party first tries to help you reach agreement (mediation). If that fails, an arbitrator makes a binding decision — faster and cheaper than court." }, { id: "shotgun", label: "Shotgun Buy-Sell", help: "One partner names a price for their shares. The other must either buy at that price or sell at that price. Forces fair pricing because the person naming the price doesn't know which side they'll end up on." }, { id: "third-party", label: "Third-Party Referee", help: "An independent expert (like an accountant or industry advisor) breaks the tie on the specific issue you disagree about." }].map((m) => (<label key={m.id} className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 ${corporate.deadlockMethod === m.id ? "border-[#be123c] bg-[rgba(190,18,60,0.03)]" : "border-neutral-200 hover:border-neutral-300"}`}><input type="radio" name="deadlock" checked={corporate.deadlockMethod === m.id} onChange={() => setCorporate({ ...corporate, deadlockMethod: m.id })} className="mt-0.5 accent-[#be123c] focus:ring-[rgba(190,18,60,0.1)]" /><div><span className="text-sm text-neutral-900 font-medium">{m.label}</span> <HelpTip text={m.help} /><p className="text-[13px] text-neutral-400 mt-0.5">{m.help}</p></div></label>))}</div>
          </div>
          <label className="block"><span className={labelClass}>Exit Mechanism <HelpTip text="The exit mechanism determines what happens when a shareholder wants to leave the company or the shareholders can't resolve a fundamental disagreement. Pick the one that best fits your relationship and risk appetite." /></span>
            <select value={corporate.exitMechanism} onChange={(e) => setCorporate({ ...corporate, exitMechanism: e.target.value })} className={inputClass}>
              <option value="shotgun">Shotgun Buy-Sell — One partner names a price, the other buys or sells at that price</option>
              <option value="put-call">Put/Call Options — Pre-agreed formula gives each partner the right to buy or force a sale</option>
              <option value="drag-along">Drag-Along Sale — Majority can force everyone to sell to a third-party buyer</option>
              <option value="dissolution">Forced Dissolution — Wind up the company and distribute assets</option>
            </select>
          </label>
        </div>
      );

      case "inv-terms": return (
        <div className="space-y-6">
          <StepHeader title="Investment Terms" subtitle="Set the key numbers for your investment round. These determine how much the investor pays, and how their investment converts into shares later." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Investment Amount (CAD)</span><input type="text" value={investment.investmentAmount} onChange={(e) => setInvestment({ ...investment, investmentAmount: e.target.value })} placeholder="$250,000" className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Valuation Cap (CAD) <HelpTip text="The maximum company value used when calculating how many shares the investor gets. A lower cap is better for the investor." /></span><input type="text" value={investment.valuationCap} onChange={(e) => setInvestment({ ...investment, valuationCap: e.target.value })} placeholder="$5,000,000" className={inputClass} /></label>
          </div>
          <label className="block"><span className={labelClass}>Discount Rate: {investment.discountRate}% <HelpTip text="The percentage discount the investor gets on the share price compared to future investors. A 20% discount means they pay 80 cents for every dollar future investors pay." /></span><input type="range" min="10" max="30" step="1" value={investment.discountRate} onChange={(e) => setInvestment({ ...investment, discountRate: parseInt(e.target.value) })} className="mt-2 block w-full accent-[#be123c]" /></label>
          <label className="block"><span className={labelClass}>Information Rights Frequency <HelpTip text="How often the investor receives financial and business updates. More frequent reporting builds trust but creates more work for the company." /></span>
            <select value={investment.infoFrequency} onChange={(e) => setInvestment({ ...investment, infoFrequency: e.target.value })} className={inputClass}>
              <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option>
            </select>
          </label>
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
            <div><p className="text-sm font-medium text-neutral-900">Board Observer Seat <HelpTip text="Gives the investor the right to attend board meetings and listen, but not vote. It's a middle ground between a full board seat and no board involvement." /></p><p className="text-[14px] text-neutral-400 mt-0.5">Investor can attend board meetings without voting power</p></div>
            <Toggle on={investment.boardObserver} onToggle={() => setInvestment({ ...investment, boardObserver: !investment.boardObserver })} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
            <div><p className="text-sm font-medium text-neutral-900">Pro Rata Rights <HelpTip text="Gives the investor the right to invest more in future rounds to maintain their ownership percentage. Without this, future fundraising rounds will dilute their stake." /></p><p className="text-[14px] text-neutral-400 mt-0.5">Investor can participate in future rounds to maintain their ownership percentage</p></div>
            <Toggle on={investment.proRataRights} onToggle={() => setInvestment({ ...investment, proRataRights: !investment.proRataRights })} />
          </div>
        </div>
      );

      case "inv-conversion": return (
        <div className="space-y-6">
          <StepHeader title="Conversion Mechanics" subtitle="Define when and how the SAFE investment converts into actual shares." />
          <div><p className={`${labelClass} mb-3`}>Conversion Triggers <HelpTip text="These are the events that cause the SAFE to convert into equity (shares). Select all that should trigger conversion." /></p>
            {[{ id: "equity-financing", label: "Qualified Financing", desc: "Converts when the company raises a priced equity round above a minimum threshold" }, { id: "change-of-control", label: "Change of Control", desc: "Converts when the company is acquired by or merges with another company" }, { id: "ipo", label: "IPO", desc: "Converts when the company goes public on a stock exchange" }, { id: "maturity-date", label: "Maturity Date", desc: "Converts automatically on a specific date if no other trigger has occurred" }, { id: "dissolution", label: "Dissolution", desc: "Investor gets paid back (at least their investment) if the company winds down" }].map((t) => (<label key={t.id} className="flex items-start gap-3 text-sm text-neutral-500 mb-3 cursor-pointer"><input type="checkbox" checked={investment.conversionTriggers.includes(t.id)} onChange={(e) => setInvestment({ ...investment, conversionTriggers: e.target.checked ? [...investment.conversionTriggers, t.id] : investment.conversionTriggers.filter((c) => c !== t.id) })} className="rounded border-neutral-300 accent-[#be123c] focus:ring-[rgba(190,18,60,0.1)] mt-0.5" /><div><span className="text-neutral-900 font-medium">{t.label}</span><p className="text-[13px] text-neutral-400">{t.desc}</p></div></label>))}
          </div>
          <label className="block"><span className={labelClass}>MFN Clause Scope <HelpTip text="Most Favoured Nation — if the company offers better terms to a later investor, this investor automatically gets those better terms too. Protects early investors from being disadvantaged by future deals." /></span>
            <select value={investment.mfnClause} onChange={(e) => setInvestment({ ...investment, mfnClause: e.target.value })} className={inputClass}>
              <option value="valuation-cap">Valuation Cap Only</option><option value="discount">Discount Only</option><option value="both">Both (Valuation Cap & Discount)</option><option value="full">Full MFN (all terms including side letters)</option><option value="none">No MFN Clause</option>
            </select>
          </label>
          <label className="block"><span className={labelClass}>Pro Rata Threshold (%) <HelpTip text="The minimum ownership percentage an investor must hold to qualify for pro rata rights. A lower threshold gives more investors the right to participate in future rounds." /></span><input type="text" value={investment.proRataThreshold} onChange={(e) => setInvestment({ ...investment, proRataThreshold: e.target.value })} className={inputClass} /></label>
        </div>
      );

      case "inv-info": return (
        <div className="space-y-6">
          <StepHeader title="Information Rights" subtitle="Reporting frequency, scope, and board observer rights." />
          <label className="block"><span className={labelClass}>Reporting Frequency</span>
            <select value={investment.infoFrequency} onChange={(e) => setInvestment({ ...investment, infoFrequency: e.target.value })} className={inputClass}>
              <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option>
            </select>
          </label>
          <div><p className={`${labelClass} mb-3`}>Information Scope</p>
            {["P&L", "Balance sheet", "Cap table", "Material events"].map((s) => (<label key={s} className="flex items-center gap-3 text-sm text-neutral-500 mb-3 cursor-pointer"><input type="checkbox" checked={investment.infoScope.includes(s)} onChange={(e) => setInvestment({ ...investment, infoScope: e.target.checked ? [...investment.infoScope, s] : investment.infoScope.filter((i) => i !== s) })} className="rounded border-neutral-300 accent-[#be123c] focus:ring-[rgba(190,18,60,0.1)]" />{s}</label>))}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
            <p className="text-sm font-medium text-neutral-900">Board Observer Rights</p>
            <Toggle on={investment.boardObserver} onToggle={() => setInvestment({ ...investment, boardObserver: !investment.boardObserver })} />
          </div>
        </div>
      );

      case "com-service": return (
        <div className="space-y-6">
          <StepHeader title="Service Definition" subtitle="Describe the services, deployment model, availability, and operational commitments." />
          <label className="block"><span className={labelClass}>Service Description</span><textarea value={commercial.serviceDescription} onChange={(e) => setCommercial({ ...commercial, serviceDescription: e.target.value })} placeholder="Describe the services being provided..." rows={4} className={inputClass} /></label>
          <div><p className={`${labelClass} mb-3`}>Deployment Model</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{[{ id: "cloud", label: "Cloud" }, { id: "on-premise", label: "On-Premise" }, { id: "hybrid", label: "Hybrid" }].map((m) => (<button key={m.id} type="button" onClick={() => setCommercial({ ...commercial, deploymentModel: m.id })} className={`rounded-xl border p-4 text-sm font-medium transition-all duration-200 ${commercial.deploymentModel === m.id ? "border-[#be123c] text-[#be123c] bg-[rgba(190,18,60,0.03)]" : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300"}`}>{m.label}</button>))}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Service Availability Hours <HelpTip text="When users can access the service. 24/7 means always available. Business hours means weekdays during normal working hours in your timezone." /></span>
              <select value={commercial.serviceAvailability} onChange={(e) => setCommercial({ ...commercial, serviceAvailability: e.target.value })} className={inputClass}>
                <option value="24-7">24/7 (always available)</option><option value="business-hours">Business Hours (Mon-Fri 9am-5pm)</option><option value="extended">Extended Hours (Mon-Sat 7am-11pm)</option><option value="custom">Custom Schedule</option>
              </select>
            </label>
            <label className="block"><span className={labelClass}>Planned Maintenance Window <HelpTip text="A scheduled time when you can take the service offline for updates without it counting against your uptime commitment." /></span>
              <select value={commercial.maintenanceWindow} onChange={(e) => setCommercial({ ...commercial, maintenanceWindow: e.target.value })} className={inputClass}>
                <option value="sunday-2am">Sundays 2:00-6:00 AM ET</option><option value="saturday-night">Saturday 11pm-3am ET</option><option value="weeknight">Weeknights 1:00-5:00 AM ET</option><option value="none">No Scheduled Window</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "dataBackupDR" as const, label: "Data Backup & Disaster Recovery", desc: "Commit to regular data backups and a plan to restore service after an outage or disaster" },
              { key: "changeManagement" as const, label: "Change Management Process", desc: "Commit to notifying the customer before making significant changes to the service" },
              { key: "escalationMatrix" as const, label: "Escalation Matrix", desc: "Define escalation levels with named contacts and response times for different severity issues" },
              { key: "customerAuditRights" as const, label: "Customer Audit Rights", desc: "Allow the customer to audit your security practices, compliance, or service delivery" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                <div className="min-w-0 pr-3"><p className="text-sm font-medium text-neutral-900">{item.label}</p><p className="text-[13px] text-neutral-400">{item.desc}</p></div>
                <Toggle on={commercial[item.key]} onToggle={() => setCommercial({ ...commercial, [item.key]: !commercial[item.key] })} />
              </div>
            ))}
          </div>
        </div>
      );

      case "com-sla": return (
        <div className="space-y-6">
          <StepHeader title="Service Levels" subtitle="Uptime commitments and response time SLOs." />
          <label className="block"><span className={labelClass}>Uptime Commitment: {commercial.uptimeCommitment}%</span><input type="range" min="99.5" max="99.99" step="0.01" value={commercial.uptimeCommitment} onChange={(e) => setCommercial({ ...commercial, uptimeCommitment: parseFloat(e.target.value) })} className="mt-2 block w-full accent-[#be123c]" /></label>
          <div><p className={`${labelClass} mb-3`}>Response Times (hours)</p>
            <div className="grid grid-cols-4 gap-4">{[{ key: "responseCritical" as const, label: "Critical" }, { key: "responseHigh" as const, label: "High" }, { key: "responseMedium" as const, label: "Medium" }, { key: "responseLow" as const, label: "Low" }].map((t) => (<label key={t.key} className="block"><span className="text-[14px] text-neutral-500">{t.label}</span><input type="number" value={commercial[t.key]} onChange={(e) => setCommercial({ ...commercial, [t.key]: e.target.value })} className={inputClass} /></label>))}</div>
          </div>
        </div>
      );

      case "com-data": return (
        <div className="space-y-5">
          <StepHeader title="Data & Privacy" subtitle="Privacy compliance, data handling, breach response, and data lifecycle management." />
          {[{ key: "pipeda" as const, label: "PIPEDA Compliance", desc: "Federal privacy legislation for commercial activities" }, { key: "casl" as const, label: "CASL Compliance", desc: "Canada Anti-Spam Legislation for electronic messaging" }].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
              <div><p className="text-sm font-medium text-neutral-900">{item.label}</p><p className="text-[14px] text-neutral-400 mt-0.5">{item.desc}</p></div>
              <Toggle on={commercial[item.key]} onToggle={() => setCommercial({ ...commercial, [item.key]: !commercial[item.key] })} />
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Data Residency</span>
              <select value={commercial.dataResidency} onChange={(e) => setCommercial({ ...commercial, dataResidency: e.target.value })} className={inputClass}>
                <option value="canada">Canada Only</option><option value="north-america">North America</option><option value="global">Global</option>
              </select>
            </label>
            <label className="block"><span className={labelClass}>Data Encryption Requirements <HelpTip text="In transit means data is encrypted while being sent over the internet. At rest means data is encrypted when stored on servers. Both is the strongest protection." /></span>
              <select value={commercial.dataEncryption} onChange={(e) => setCommercial({ ...commercial, dataEncryption: e.target.value })} className={inputClass}>
                <option value="in-transit">In Transit Only (TLS/SSL)</option><option value="at-rest">At Rest Only (AES-256)</option><option value="both">Both In Transit & At Rest</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Breach Notification Timeline <HelpTip text="How quickly you must notify the other party after discovering a data breach. Shorter timelines are more protective for the customer but harder to comply with." /></span>
              <select value={commercial.breachNotificationTimeline} onChange={(e) => setCommercial({ ...commercial, breachNotificationTimeline: e.target.value })} className={inputClass}>
                <option value="24h">24 hours (strictest)</option><option value="48h">48 hours</option><option value="72h">72 hours (PIPEDA standard)</option><option value="asap">As soon as practicable</option>
              </select>
            </label>
            <label className="block"><span className={labelClass}>Data Deletion After Termination <HelpTip text="How many days after the agreement ends before customer data must be permanently deleted. Longer timelines give the customer more time to export their data." /></span>
              <select value={commercial.dataDeletionTimeline} onChange={(e) => setCommercial({ ...commercial, dataDeletionTimeline: e.target.value })} className={inputClass}>
                <option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option><option value="180">180 days</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "subProcessorNotification" as const, label: "Sub-Processor Notification", desc: "Notify the customer before sharing their data with any new third-party service provider" },
              { key: "dataPortability" as const, label: "Data Portability on Termination", desc: "Customer can export all their data in a standard format when the agreement ends" },
              { key: "crossBorderRestrictions" as const, label: "Cross-Border Data Transfer Restrictions", desc: "Limit data transfers outside Canada unless specific safeguards are in place" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                <div className="min-w-0 pr-3"><p className="text-sm font-medium text-neutral-900">{item.label}</p><p className="text-[13px] text-neutral-400">{item.desc}</p></div>
                <Toggle on={commercial[item.key]} onToggle={() => setCommercial({ ...commercial, [item.key]: !commercial[item.key] })} />
              </div>
            ))}
          </div>
        </div>
      );

      case "com-liability": return (
        <div className="space-y-5">
          <StepHeader title="Liability" subtitle="Liability caps, force majeure, and damages exclusions." />
          <label className="block"><span className={labelClass}>Liability Cap</span>
            <select value={commercial.liabilityCap} onChange={(e) => setCommercial({ ...commercial, liabilityCap: e.target.value })} className={inputClass}>
              <option value="6mo">6 Months of Fees</option><option value="12mo">12 Months of Fees</option><option value="24mo">24 Months of Fees</option>
            </select>
          </label>
          {[{ key: "forceMajeure" as const, label: "Force Majeure Clause" }, { key: "consequentialDamages" as const, label: "Mutual Consequential Damages Exclusion" }].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
              <p className="text-sm font-medium text-neutral-900">{item.label}</p>
              <Toggle on={commercial[item.key]} onToggle={() => setCommercial({ ...commercial, [item.key]: !commercial[item.key] })} />
            </div>
          ))}
        </div>
      );

      case "plat-business": return (
        <div className="space-y-5">
          <StepHeader title="Business & Platform" subtitle="Tell us about your business so we can tailor your terms." />
          <label className="block"><span className={labelClass}>Business Type</span>
            <select value={platform.businessType} onChange={(e) => setPlatform({ ...platform, businessType: e.target.value })} className={inputClass}>
              <option value="saas">SaaS / Software Platform</option><option value="ecommerce">E-Commerce</option><option value="marketplace">Marketplace</option><option value="mobile-app">Mobile App</option><option value="content-platform">Content Platform</option><option value="professional-services">Professional Services</option><option value="other">Other</option>
            </select>
          </label>
          <label className="block"><span className={labelClass}>Platform / Website URL</span>
            <input type="text" value={platform.platformUrl} onChange={(e) => setPlatform({ ...platform, platformUrl: e.target.value })} placeholder="https://yourcompany.com" className={inputClass} />
          </label>
          {[
            { key: "hasUserAccounts" as const, label: "Users create accounts on your platform" },
            { key: "collectsPersonalInfo" as const, label: "You collect personal information (names, emails, payment)" },
            { key: "hasEcommerce" as const, label: "You process payments or sell products/services" },
            { key: "hasUGC" as const, label: "Users can post content, comments, or reviews" },
            { key: "operatesInQuebec" as const, label: "You serve customers in Quebec" },
            { key: "hasInternationalUsers" as const, label: "You have users outside Canada (US, EU, etc.)" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
              <p className="text-sm font-medium text-neutral-900">{item.label}</p>
              <Toggle on={platform[item.key]} onToggle={() => setPlatform({ ...platform, [item.key]: !platform[item.key] })} />
            </div>
          ))}
        </div>
      );

      case "plat-terms": return (
        <div className="space-y-5">
          <StepHeader title="Terms & Privacy" subtitle="How users accept your terms, how disputes are handled, and platform-specific protections." />
          <label className="block"><span className={labelClass}>Acceptance Mechanism <HelpTip text="Clickwrap (checkbox + button) is the strongest in court. Browsewrap (just a footer link) is the weakest and often unenforceable. Sign-in wrap is in between." /></span>
            <select value={platform.acceptanceMechanism} onChange={(e) => setPlatform({ ...platform, acceptanceMechanism: e.target.value })} className={inputClass}>
              <option value="clickwrap">Clickwrap (checkbox + "I agree" button)</option><option value="sign-in-wrap">Sign-in Wrap (agreeing by creating account)</option><option value="browsewrap">Browsewrap (terms link in footer — weakest)</option>
            </select>
          </label>
          <label className="block"><span className={labelClass}>Dispute Resolution <HelpTip text="How legal disputes with users will be resolved. Arbitration is private and usually faster. Courts are public. Online dispute resolution is emerging for digital platforms." /></span>
            <select value={platform.disputeResolution} onChange={(e) => setPlatform({ ...platform, disputeResolution: e.target.value })} className={inputClass}>
              <option value="arbitration">Binding Arbitration</option><option value="mediation-then-court">Mediation then Court</option><option value="court-only">Courts Only</option><option value="small-claims">Small Claims Court Carve-out</option><option value="online-dispute">Online Dispute Resolution</option>
            </select>
          </label>
          <label className="block"><span className={labelClass}>Data Storage Location</span>
            <select value={platform.dataStorage} onChange={(e) => setPlatform({ ...platform, dataStorage: e.target.value })} className={inputClass}>
              <option value="canada">Canada Only</option><option value="canada-us">Canada & United States</option><option value="international">International (with safeguards)</option>
            </select>
          </label>
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
            <div><p className="text-sm font-medium text-neutral-900">Age Restriction / COPPA Compliance <HelpTip text="If your platform is accessible to users under 13 (or under 16 in some jurisdictions), you may need special parental consent rules and data handling restrictions." /></p><p className="text-[14px] text-neutral-400 mt-0.5">Require age verification and restrict access for minors</p></div>
            <Toggle on={platform.ageRestriction} onToggle={() => setPlatform({ ...platform, ageRestriction: !platform.ageRestriction })} />
          </div>
          <label className="block"><span className={labelClass}>Cookie Consent Mechanism <HelpTip text="How you inform users about cookies and tracking. A banner is the most common approach. A modal is more prominent and ensures active consent." /></span>
            <select value={platform.cookieConsent} onChange={(e) => setPlatform({ ...platform, cookieConsent: e.target.value })} className={inputClass}>
              <option value="banner">Cookie Banner (passive notice)</option><option value="modal">Cookie Modal (active consent required)</option><option value="none">No Cookie Consent (not recommended)</option>
            </select>
          </label>
          {platform.hasUGC && (
            <label className="block"><span className={labelClass}>Content Moderation Approach <HelpTip text="Pre-moderation means reviewing content before it's published. Post-moderation means removing content after it's flagged. Community reporting relies on users flagging problems." /></span>
              <select value={platform.contentModeration} onChange={(e) => setPlatform({ ...platform, contentModeration: e.target.value })} className={inputClass}>
                <option value="pre-moderation">Pre-Moderation (review before publishing)</option><option value="post-moderation">Post-Moderation (review after publishing)</option><option value="community-reporting">Community Reporting (users flag content)</option>
              </select>
            </label>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "apiAccess" as const, label: "API Access Terms", desc: "Include terms governing third-party access to your platform via API" },
              { key: "rateLimiting" as const, label: "Rate Limiting / Fair Use Policy", desc: "Set usage limits to prevent abuse and ensure fair access for all users" },
              { key: "accountSuspensionRights" as const, label: "Account Suspension / Termination Rights", desc: "Reserve the right to suspend or terminate user accounts for policy violations" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                <div className="min-w-0 pr-3"><p className="text-sm font-medium text-neutral-900">{item.label}</p><p className="text-[13px] text-neutral-400">{item.desc}</p></div>
                <Toggle on={platform[item.key]} onToggle={() => setPlatform({ ...platform, [item.key]: !platform[item.key] })} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
            <div><p className="text-sm font-medium text-neutral-900">Class Action Waiver <HelpTip text="Prevents users from joining together in a class action lawsuit against your company. Instead, each user must bring their claim individually. Common in platform terms but may not be enforceable in all Canadian provinces." /></p><p className="text-[14px] text-neutral-400 mt-0.5">Require users to resolve disputes individually, not as a group</p></div>
            <Toggle on={platform.classActionWaiver} onToggle={() => setPlatform({ ...platform, classActionWaiver: !platform.classActionWaiver })} />
          </div>
        </div>
      );

      case "plat-structure": return (
        <div className="space-y-5">
          <StepHeader title="Partnership & MSA Terms" subtitle="Structure for partnership agreements and master service agreements." />
          <label className="block"><span className={labelClass}>Partnership Type</span>
            <select value={platform.partnershipType} onChange={(e) => setPlatform({ ...platform, partnershipType: e.target.value })} className={inputClass}>
              <option value="general">General Partnership</option><option value="limited">Limited Partnership</option><option value="llp">Limited Liability Partnership (LLP)</option>
            </select>
          </label>
          <label className="block"><span className={labelClass}>Profit / Loss Split</span>
            <select value={platform.profitSplit} onChange={(e) => setPlatform({ ...platform, profitSplit: e.target.value })} className={inputClass}>
              <option value="equal">Equal (50/50)</option><option value="proportional">Proportional to Capital</option><option value="custom">Custom Formula</option>
            </select>
          </label>
          <label className="block"><span className={labelClass}>Management Structure</span>
            <select value={platform.managementStructure} onChange={(e) => setPlatform({ ...platform, managementStructure: e.target.value })} className={inputClass}>
              <option value="all-partners">All Partners Manage</option><option value="managing-partner">Designated Managing Partner</option><option value="committee">Management Committee</option>
            </select>
          </label>
          <label className="block"><span className={labelClass}>MSA Payment Terms</span>
            <select value={platform.msaPaymentTerms} onChange={(e) => setPlatform({ ...platform, msaPaymentTerms: e.target.value })} className={inputClass}>
              <option value="net-15">Net 15</option><option value="net-30">Net 30</option><option value="net-60">Net 60</option><option value="milestone">Milestone-Based</option>
            </select>
          </label>
          <label className="block"><span className={labelClass}>IP Ownership (MSA)</span>
            <select value={platform.msaIpOwnership} onChange={(e) => setPlatform({ ...platform, msaIpOwnership: e.target.value })} className={inputClass}>
              <option value="client-owns">Client Owns All Work Product</option><option value="shared">Client Owns Deliverables, Provider Keeps Tools</option><option value="provider-owns">Provider Retains IP, Client Gets License</option>
            </select>
          </label>
        </div>
      );

      case "risk-profile": return (
        <div className="space-y-6">
          <StepHeader title="Your Risk Profile" subtitle="Help us understand your priorities so every clause is drafted to match how you think about risk — not a generic template." />
          <div className="rounded-xl border border-neutral-200 p-6 space-y-2">
            <p className="text-sm font-semibold text-neutral-900">How much risk are you comfortable taking?</p>
            <p className="text-[14px] text-neutral-400 mb-4">This shapes every clause in your agreement — from termination rights to liability caps.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { id: "conservative", label: "Conservative", desc: "Maximum protection. Lock down every clause. You'd rather over-protect than leave anything to chance.", color: "text-emerald-600" },
                { id: "balanced", label: "Balanced", desc: "Market-standard positions. Fair to both sides. You want a deal that gets signed without unnecessary friction.", color: "text-neutral-600" },
                { id: "aggressive", label: "Growth-First", desc: "Speed and flexibility matter most. You'll accept more risk to move fast and close deals.", color: "text-amber-600" },
              ] as const).map((opt) => (
                <button key={opt.id} type="button" onClick={() => setRiskProfile({ ...riskProfile, tolerance: opt.id })} className={`text-left rounded-xl border p-4 transition-all duration-200 ${riskProfile.tolerance === opt.id ? "border-[#be123c] border-2 bg-[rgba(190,18,60,0.02)] shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"}`}>
                  <p className="text-[15px] font-semibold text-neutral-900 mb-1">{opt.label}</p>
                  <p className="text-[13px] text-neutral-400 leading-relaxed mb-2">{opt.desc}</p>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${opt.color}`}>{opt.id === "conservative" ? "Max protection" : opt.id === "balanced" ? "Market standard" : "Max flexibility"}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 p-6 space-y-2">
            <p className="text-sm font-semibold text-neutral-900">What matters most to you? <span className="text-neutral-400 font-normal text-[14px]">(select all that apply)</span></p>
            <p className="text-[14px] text-neutral-400 mb-4">The more we know about what you care about, the more precisely we draft every clause.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {([
                { id: "protection", label: "Protecting my IP & assets", icon: "shield" },
                { id: "relationship", label: "Preserving the relationship", icon: "heart" },
                { id: "speed", label: "Getting the deal done fast", icon: "bolt" },
                { id: "control", label: "Maintaining control & decision power", icon: "key" },
                { id: "exit", label: "Clear exit options if things go wrong", icon: "door" },
                { id: "cost", label: "Minimizing cost & obligations", icon: "dollar" },
              ] as const).map((opt) => {
                const isSelected = riskProfile.priorities.includes(opt.id);
                return (
                  <button key={opt.id} type="button" onClick={() => setRiskProfile((prev) => ({ ...prev, priorities: isSelected ? prev.priorities.filter((p) => p !== opt.id) : [...prev.priorities, opt.id] }))} className={`text-left rounded-lg border px-4 py-3 text-[15px] transition-all duration-200 flex items-center gap-3 ${isSelected ? "border-[#be123c] bg-[rgba(190,18,60,0.02)] font-medium text-neutral-900" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>
                    <span className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-all ${isSelected ? "bg-[#be123c] border-[#be123c]" : "border-neutral-300 bg-white"}`}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="block">
            <span className={labelClass}>Tell us about your situation <span className="text-neutral-400 font-normal">(optional)</span></span>
            <textarea value={riskProfile.context} onChange={(e) => setRiskProfile({ ...riskProfile, context: e.target.value })} placeholder="E.g., 'First time hiring a contractor — want to make sure I'm covered' or 'We've been burned by a bad partnership before, need ironclad protections'" className={`${inputClass} min-h-[80px]`} />
          </label>
          <label className="block"><span className={labelClass}>How familiar are you with legal agreements?</span>
            <select value={riskProfile.experience} onChange={(e) => setRiskProfile({ ...riskProfile, experience: e.target.value })} className={inputClass}>
              <option value="first-time">First time — I need everything explained</option>
              <option value="some">I've signed agreements before but I'm not a lawyer</option>
              <option value="experienced">Very familiar — I negotiate contracts regularly</option>
              <option value="legal-background">I have a legal background</option>
            </select>
          </label>
        </div>
      );

      case "inf-campaign": return (
        <div className="space-y-5">
          <StepHeader title="Campaign & Platforms" subtitle="Which platforms, how long, and what kind of content? This drives your disclosure requirements and platform-specific compliance." />
          <div>
            <span className={labelClass}>Platforms <span className="text-neutral-400 text-[14px]">(select all that apply)</span></span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              {(["instagram", "tiktok", "youtube", "x-twitter", "facebook", "linkedin"] as const).map((p) => (
                <button key={p} type="button" onClick={() => setInfluencer((prev) => ({ ...prev, platforms: prev.platforms.includes(p) ? prev.platforms.filter((x) => x !== p) : [...prev.platforms, p] }))} className={`rounded-lg border px-4 py-3 text-[15px] capitalize transition-all ${influencer.platforms.includes(p) ? "border-[#be123c] bg-[rgba(190,18,60,0.02)] font-medium text-neutral-900" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>
                  {p === "x-twitter" ? "X / Twitter" : p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={labelClass}>Content Types <span className="text-neutral-400 text-[14px]">(select all that apply)</span></span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              {(["photo", "video", "reel", "story", "carousel", "live-stream", "blog-post", "podcast"] as const).map((ct) => (
                <button key={ct} type="button" onClick={() => setInfluencer((prev) => ({ ...prev, contentTypes: prev.contentTypes.includes(ct) ? prev.contentTypes.filter((x) => x !== ct) : [...prev.contentTypes, ct] }))} className={`rounded-lg border px-4 py-3 text-[15px] capitalize transition-all ${influencer.contentTypes.includes(ct) ? "border-[#be123c] bg-[rgba(190,18,60,0.02)] font-medium text-neutral-900" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}>
                  {ct.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Campaign Duration</span>
              <select value={influencer.campaignDuration} onChange={(e) => setInfluencer({ ...influencer, campaignDuration: e.target.value })} className={inputClass}>
                <option value="one-off">One-Off Post / Campaign</option><option value="1-month">1 Month</option><option value="3-months">3 Months</option><option value="6-months">6 Months</option><option value="12-months">12 Months</option><option value="ongoing">Ongoing / Evergreen</option>
              </select>
            </label>
            <label className="block"><span className={labelClass}>Posting Frequency</span>
              <select value={influencer.postFrequency} onChange={(e) => setInfluencer({ ...influencer, postFrequency: e.target.value })} className={inputClass}>
                <option value="daily">Daily</option><option value="2-3-week">2-3 Times per Week</option><option value="weekly">Weekly</option><option value="bi-weekly">Bi-Weekly</option><option value="monthly">Monthly</option><option value="custom">Custom Schedule</option>
              </select>
            </label>
          </div>
          <label className="block"><span className={labelClass}>Compensation Model</span>
            <select value={influencer.compensationModel} onChange={(e) => setInfluencer({ ...influencer, compensationModel: e.target.value })} className={inputClass}>
              <option value="flat-fee">Flat Fee (per campaign)</option><option value="per-post">Per Post</option><option value="performance">Performance-Based (CPA/CPC)</option><option value="hybrid">Hybrid (Base + Performance Bonus)</option><option value="product-only">Product / Gifting Only</option><option value="affiliate">Affiliate Commission</option><option value="retainer">Monthly Retainer</option>
            </select>
          </label>
        </div>
      );

      case "inf-deliverables": return (
        <div className="space-y-5">
          <StepHeader title="Content & Approval Workflow" subtitle="Define what gets created, how it's approved, and the revision process. This drives the Deliverables schedule in your agreement." />
          <div>
            <p className={`${labelClass} mb-3`}>Content Approval Process</p>
            <div className="space-y-2">
              {[
                { id: "brand-pre-approval", label: "Brand Pre-Approval Required", desc: "Brand reviews and approves all content before posting" },
                { id: "concept-only", label: "Concept Approval Only", desc: "Brand approves the concept/brief — creator has creative freedom on execution" },
                { id: "no-approval", label: "No Approval Required", desc: "Creator posts at their discretion within brand guidelines" },
              ].map((opt) => (
                <label key={opt.id} className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${influencer.contentApproval === opt.id ? "border-[#be123c] bg-[rgba(190,18,60,0.02)]" : "border-neutral-200 hover:border-neutral-300"}`}>
                  <input type="radio" name="contentApproval" checked={influencer.contentApproval === opt.id} onChange={() => setInfluencer({ ...influencer, contentApproval: opt.id })} className="mt-0.5 accent-[#be123c]" />
                  <div><p className="text-sm font-medium text-neutral-900">{opt.label}</p><p className="text-[13px] text-neutral-400">{opt.desc}</p></div>
                </label>
              ))}
            </div>
          </div>
          {influencer.contentApproval !== "no-approval" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <label className="block"><span className={labelClass}>Approval Window (business days)</span><input type="number" value={influencer.approvalDays} onChange={(e) => setInfluencer({ ...influencer, approvalDays: e.target.value })} className={inputClass} /><p className="text-[13px] text-neutral-400 mt-1">If brand doesn't respond within this window, content is deemed approved</p></label>
              <label className="block"><span className={labelClass}>Revision Rounds Included</span><select value={influencer.revisionRounds} onChange={(e) => setInfluencer({ ...influencer, revisionRounds: e.target.value })} className={inputClass}><option value="1">1 round</option><option value="2">2 rounds</option><option value="3">3 rounds</option><option value="unlimited">Unlimited</option></select></label>
            </div>
          )}
          <div className="rounded-xl border border-neutral-200 p-5 space-y-4">
            <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-neutral-500">Regulatory Triggers</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="text-sm font-medium text-neutral-900">US Audience (&gt; 5%)?</p><p className="text-[13px] text-neutral-400">Triggers FTC Endorsement Guide compliance</p></div><Toggle on={influencer.hasUsAudience} onToggle={() => setInfluencer({ ...influencer, hasUsAudience: !influencer.hasUsAudience })} /></div>
              {influencer.hasUsAudience && <label className="block pl-4"><span className={labelClass}>Estimated US Audience %</span><input type="text" value={influencer.usAudiencePercent} onChange={(e) => setInfluencer({ ...influencer, usAudiencePercent: e.target.value })} placeholder="e.g. 25" className={inputClass} /></label>}
              <div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="text-sm font-medium text-neutral-900">Regulated Industry?</p><p className="text-[13px] text-neutral-400">Alcohol, iGaming, cannabis, health products, or financial services</p></div><Toggle on={influencer.isRegulatedIndustry} onToggle={() => setInfluencer({ ...influencer, isRegulatedIndustry: !influencer.isRegulatedIndustry })} /></div>
              {influencer.isRegulatedIndustry && <label className="block pl-4"><span className={labelClass}>Category</span><select value={influencer.regulatedCategory} onChange={(e) => setInfluencer({ ...influencer, regulatedCategory: e.target.value })} className={inputClass}><option value="">Select...</option><option value="alcohol">Alcohol (AGCO)</option><option value="igaming">iGaming (AGCO s.2.03)</option><option value="cannabis">Cannabis (Cannabis Act)</option><option value="health">Health / Supplements (TPD)</option><option value="financial">Financial Services</option></select></label>}
              <div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="text-sm font-medium text-neutral-900">Collects personal data?</p><p className="text-[13px] text-neutral-400">Contests, email lists, or lead gen — triggers PIPEDA/CASL</p></div><Toggle on={influencer.collectsPersonalData} onToggle={() => setInfluencer({ ...influencer, collectsPersonalData: !influencer.collectsPersonalData })} /></div>
              <div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="text-sm font-medium text-neutral-900">Uses AI-generated content?</p><p className="text-[13px] text-neutral-400">CCCS requires disclosure of synthetic/AI content</p></div><Toggle on={influencer.usesAiContent} onToggle={() => setInfluencer({ ...influencer, usesAiContent: !influencer.usesAiContent })} /></div>
              <div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="text-sm font-medium text-neutral-900">Quebec audience?</p><p className="text-[13px] text-neutral-400">Triggers Charter of French Language requirements</p></div><Toggle on={influencer.hasQuebecAudience} onToggle={() => setInfluencer({ ...influencer, hasQuebecAudience: !influencer.hasQuebecAudience })} /></div>
            </div>
          </div>
        </div>
      );

      case "inf-rights": return (
        <div className="space-y-5">
          <StepHeader title="IP, Exclusivity & Usage Rights" subtitle="Who owns the content, where can it be used, and can the influencer work with competitors? These clauses protect both sides." />
          <div>
            <p className={`${labelClass} mb-3`}>Content IP Ownership</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "brand-owns-full", label: "Brand Owns All IP", desc: "Full assignment of copyright and waiver of moral rights. Brand can modify, sub-license, and use in perpetuity." },
                { id: "brand-owns-license", label: "Brand License (Balanced)", desc: "Creator retains copyright but grants brand an exclusive license for agreed channels and duration." },
                { id: "creator-retains", label: "Creator Retains IP", desc: "Creator owns all content. Brand gets a limited, non-exclusive license for campaign period only." },
              ].map((opt) => (
                <button key={opt.id} type="button" onClick={() => setInfluencer({ ...influencer, ipOwnership: opt.id })} className={`text-left rounded-xl border p-4 transition-all duration-200 ${influencer.ipOwnership === opt.id ? "border-[#be123c] border-2 bg-[rgba(190,18,60,0.02)] shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"}`}>
                  <p className="text-[15px] font-semibold text-neutral-900 mb-1">{opt.label}</p>
                  <p className="text-[13px] text-neutral-400 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Usage Rights Scope</span>
              <select value={influencer.usageRightsScope} onChange={(e) => setInfluencer({ ...influencer, usageRightsScope: e.target.value })} className={inputClass}>
                <option value="influencer-channels-only">Influencer's channels only</option>
                <option value="brand-social">Brand's social media</option>
                <option value="all-digital">All digital channels (social, web, email)</option>
                <option value="all-channels">All channels including paid advertising</option>
                <option value="all-plus-sublicense">All channels + right to sub-license</option>
              </select>
            </label>
            <label className="block"><span className={labelClass}>Usage Rights Duration</span>
              <select value={influencer.usageRightsDuration} onChange={(e) => setInfluencer({ ...influencer, usageRightsDuration: e.target.value })} className={inputClass}>
                <option value="campaign-only">Campaign period only</option>
                <option value="campaign-plus-3">Campaign + 3 months</option>
                <option value="campaign-plus-12">Campaign + 12 months</option>
                <option value="24-months">24 months from posting</option>
                <option value="perpetual">Perpetual (forever)</option>
              </select>
            </label>
          </div>
          <div className="rounded-xl border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-neutral-900">Exclusivity Clause</p><p className="text-[13px] text-neutral-400">Prevents the influencer from promoting competing brands</p></div>
              <Toggle on={influencer.exclusivity} onToggle={() => setInfluencer({ ...influencer, exclusivity: !influencer.exclusivity })} />
            </div>
            {influencer.exclusivity && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
                <label className="block"><span className={labelClass}>Exclusivity Scope</span>
                  <select value={influencer.exclusivityScope} onChange={(e) => setInfluencer({ ...influencer, exclusivityScope: e.target.value })} className={inputClass}>
                    <option value="">Select...</option>
                    <option value="direct-competitors">Direct competitors only</option>
                    <option value="product-category">Entire product category</option>
                    <option value="industry-wide">Industry-wide</option>
                  </select>
                </label>
                <label className="block"><span className={labelClass}>Exclusivity Duration</span>
                  <select value={influencer.exclusivityDuration} onChange={(e) => setInfluencer({ ...influencer, exclusivityDuration: e.target.value })} className={inputClass}>
                    <option value="campaign-only">Campaign period only</option>
                    <option value="campaign-plus-30">Campaign + 30 days</option>
                    <option value="campaign-plus-90">Campaign + 90 days</option>
                    <option value="campaign-plus-180">Campaign + 6 months</option>
                  </select>
                </label>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-neutral-900">Whitelisting / Paid Promotion Rights</p><p className="text-[13px] text-neutral-400">Can the brand run paid ads using the influencer's account / likeness?</p></div>
              <Toggle on={influencer.whitelisting} onToggle={() => setInfluencer({ ...influencer, whitelisting: !influencer.whitelisting })} />
            </div>
            {influencer.whitelisting && (
              <label className="block"><span className={labelClass}>Whitelisting Scope</span>
                <select value={influencer.whitelistingScope} onChange={(e) => setInfluencer({ ...influencer, whitelistingScope: e.target.value })} className={inputClass}>
                  <option value="dark-posts">Dark posts only (not on creator's feed)</option>
                  <option value="all-paid">All paid media including creator's account</option>
                  <option value="specific-platforms">Specific platforms only</option>
                </select>
              </label>
            )}
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-neutral-900">Content Boosting Rights</p><p className="text-[13px] text-neutral-400">Can the brand boost / sponsor the influencer's organic posts?</p></div>
              <Toggle on={influencer.boostingRights} onToggle={() => setInfluencer({ ...influencer, boostingRights: !influencer.boostingRights })} />
            </div>
          </div>
        </div>
      );

      case "inf-terms": return (
        <div className="space-y-5">
          <StepHeader title="Compensation & Termination" subtitle="Payment structure, performance incentives, morals clause, and exit terms. These determine how the deal works financially and how either party can end it." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Compensation Amount (CAD)</span><input type="text" value={influencer.compensationAmount} onChange={(e) => setInfluencer({ ...influencer, compensationAmount: e.target.value })} placeholder="$5,000" className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Payment Schedule</span>
              <select value={influencer.paymentSchedule} onChange={(e) => setInfluencer({ ...influencer, paymentSchedule: e.target.value })} className={inputClass}>
                <option value="upfront">100% Upfront</option>
                <option value="on-delivery">On Delivery</option>
                <option value="50-50">50% Upfront / 50% on Delivery</option>
                <option value="milestone">Milestone-Based</option>
                <option value="monthly">Monthly Retainer</option>
                <option value="net-30">Net 30 (Invoice)</option>
              </select>
            </label>
          </div>
          <div className="rounded-xl border border-neutral-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-neutral-900">Performance-Based Compensation</p><p className="text-[13px] text-neutral-400">Add bonus or commission tied to engagement, clicks, conversions, or sales</p></div>
              <Toggle on={influencer.performanceMetrics} onToggle={() => setInfluencer({ ...influencer, performanceMetrics: !influencer.performanceMetrics })} />
            </div>
            {influencer.performanceMetrics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
                <label className="block"><span className={labelClass}>Metric Type</span>
                  <select value={influencer.metricType} onChange={(e) => setInfluencer({ ...influencer, metricType: e.target.value })} className={inputClass}>
                    <option value="">Select...</option>
                    <option value="engagement-rate">Engagement Rate</option>
                    <option value="clicks">Click-Through Rate (CTR)</option>
                    <option value="conversions">Conversions (CPA)</option>
                    <option value="sales">Sales Revenue (Commission)</option>
                    <option value="impressions">Impressions / Reach</option>
                    <option value="app-installs">App Installs</option>
                  </select>
                </label>
                <label className="block"><span className={labelClass}>Performance Target</span><input type="text" value={influencer.metricTarget} onChange={(e) => setInfluencer({ ...influencer, metricTarget: e.target.value })} placeholder="e.g. 3% engagement rate" className={inputClass} /></label>
              </div>
            )}
          </div>
          <div>
            <p className={`${labelClass} mb-3`}>Morals Clause</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "brand-only", label: "Brand-Favourable", desc: "Brand can terminate if influencer engages in any conduct that could damage brand reputation. Broad discretion." },
                { id: "mutual", label: "Mutual (Balanced)", desc: "Either party can terminate for conduct damaging the other's reputation. Specific triggers defined." },
                { id: "narrow", label: "Influencer-Favourable", desc: "Termination only for criminal conviction or proven fraud. Protects influencer's creative freedom." },
              ].map((opt) => (
                <button key={opt.id} type="button" onClick={() => setInfluencer({ ...influencer, moralsClauseScope: opt.id })} className={`text-left rounded-xl border p-4 transition-all duration-200 ${influencer.moralsClauseScope === opt.id ? "border-[#be123c] border-2 bg-[rgba(190,18,60,0.02)] shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"}`}>
                  <p className="text-[15px] font-semibold text-neutral-900 mb-1">{opt.label}</p>
                  <p className="text-[13px] text-neutral-400 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <label className="block"><span className={labelClass}>Termination Notice Period (days)</span>
              <select value={influencer.terminationNotice} onChange={(e) => setInfluencer({ ...influencer, terminationNotice: e.target.value })} className={inputClass}>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </select>
            </label>
            <div>
              <p className={`${labelClass} mb-2`}>Termination for Cause Triggers</p>
              <div className="space-y-2">
                {["Material breach", "Missed deliverable deadline", "Platform TOS violation", "Brand safety incident", "Non-disclosure violation", "Competitor engagement"].map((trigger) => (
                  <label key={trigger} className="flex items-center gap-2 text-[15px] text-neutral-600 cursor-pointer">
                    <input type="checkbox" checked={influencer.terminationForCause.includes(trigger)} onChange={(e) => setInfluencer({ ...influencer, terminationForCause: e.target.checked ? [...influencer.terminationForCause, trigger] : influencer.terminationForCause.filter((t) => t !== trigger) })} className="rounded border-neutral-300 accent-[#be123c]" />
                    {trigger}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

      case "inf-compliance": return (
        <div className="space-y-5">
          <StepHeader title="Disclosure & Compliance" subtitle="Review the regulatory modules that will be activated based on your selections. These ensure your agreement is Competition Act compliant." />
          <div className="rounded-xl border border-neutral-200 p-5">
            <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-neutral-500 mb-3">Auto-Activated Compliance Modules</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" /><span className="text-neutral-900 font-medium">Competition Act s.52 — Mandatory Disclosure</span></div>
              <div className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" /><span className="text-neutral-900 font-medium">Ad Standards Canada — Testimonial Standards</span></div>
              <div className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" /><span className="text-neutral-900 font-medium">Copyright Act s.14.1 — Moral Rights</span></div>
              {influencer.platforms.map((p) => (
                <div key={p} className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" /><span className="text-neutral-700 capitalize">{p === "x-twitter" ? "X / Twitter" : p} — Platform-Specific Disclosure Template</span></div>
              ))}
              {influencer.hasUsAudience && <div className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" /><span className="text-neutral-900 font-medium">FTC Endorsement Guides (16 CFR 255) — US Audience</span></div>}
              {influencer.isRegulatedIndustry && influencer.regulatedCategory === "igaming" && <div className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" /><span className="text-neutral-900 font-medium">AGCO s.2.03 — Minor Appeal Restriction</span></div>}
              {influencer.isRegulatedIndustry && influencer.regulatedCategory === "alcohol" && <div className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" /><span className="text-neutral-900 font-medium">AGCO — Alcohol Advertising Standards</span></div>}
              {influencer.isRegulatedIndustry && influencer.regulatedCategory === "cannabis" && <div className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" /><span className="text-neutral-900 font-medium">Cannabis Act — Content Restrictions & Age-Gating</span></div>}
              {influencer.isRegulatedIndustry && influencer.regulatedCategory === "health" && <div className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" /><span className="text-neutral-900 font-medium">TPD — Health Claims Substantiation</span></div>}
              {influencer.collectsPersonalData && <div className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" /><span className="text-neutral-900 font-medium">PIPEDA & CASL — Data Collection & Anti-Spam</span></div>}
              {influencer.usesAiContent && <div className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" /><span className="text-neutral-900 font-medium">CCCS — AI/Synthetic Content Disclosure</span></div>}
              {influencer.hasQuebecAudience && <div className="flex items-center gap-2 text-[15px]"><span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" /><span className="text-neutral-900 font-medium">Charter of French Language — Quebec Requirements</span></div>}
            </div>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
            <p className="text-[15px] text-amber-700"><span className="font-semibold">Competition Act Warning:</span> Non-compliant influencer disclosure carries penalties up to CAD $15M for corporations and personal criminal liability under s.52(1). Your agreement will include platform-specific disclosure templates to ensure full compliance.</p>
          </div>
        </div>
      );

      case "agreement-clauses": return (
        <div className="space-y-6">
          <StepHeader title="Agreement Strategy" subtitle="Set the negotiating position for each key clause. These control how strongly the agreement protects each party." />
          {agreementClausePositions.map((cp: ClausePosition) => (
            <div key={cp.id} className="rounded-xl border border-neutral-200 p-6">
              <p className="text-sm font-semibold text-neutral-900 mb-1">{cp.label}</p>
              <p className="text-[14px] text-neutral-400 mb-4">{cp.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cp.options.map((opt) => {
                  const active = (clauseSelections[cp.id] || cp.defaultPosition) === opt.id;
                  const favorColor = opt.favorability === "client" ? "text-emerald-600" : opt.favorability === "counter-party" ? "text-amber-600" : "text-neutral-500";
                  const favorLabel = opt.favorability === "client" ? "Favours you" : opt.favorability === "counter-party" ? "Favours other party" : "Market standard";
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setClauseSelections((prev) => ({ ...prev, [cp.id]: opt.id }))}
                      className={`text-left rounded-xl border p-4 transition-all duration-200 ${active ? "border-[#be123c] border-2 bg-[rgba(190,18,60,0.02)] shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"}`}
                    >
                      <p className="text-[15px] font-semibold text-neutral-900 mb-1">{opt.label}</p>
                      <p className="text-[13px] text-neutral-400 leading-relaxed mb-2">{opt.description}</p>
                      <span className={`text-[10px] font-medium uppercase tracking-wider ${favorColor}`}>{favorLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );

      case "review": return (
        <div className="space-y-6">
          <StepHeader title="Review & Generate" subtitle="Review your selections and generate the draft." />
          <div className="rounded-xl bg-white border border-neutral-200 p-6 space-y-4">
            {[
              ["Parties", `${party.partyA || "—"} / ${party.partyB || "—"}`],
              ["Jurisdiction", party.jurisdiction.replace("-", " ")],
              ["Agreements", `${items.length} selected`],
              ["Risk Profile", `${riskProfile.tolerance.charAt(0).toUpperCase() + riskProfile.tolerance.slice(1)}${riskProfile.priorities.length > 0 ? ` — ${riskProfile.priorities.length} priorities` : ""}`],
              ["Compliance", `${activeModules.length} active`],
              ["Tier", tier.replace("-", " ")],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-neutral-500">{label}</span>
                <span className="text-neutral-900 font-medium capitalize">{value}</span>
              </div>
            ))}
          </div>
          {warnings.length > 0 && <div className="space-y-2">{warnings.map((w, i) => <div key={i} className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-[15px] text-amber-700">{w}</div>)}</div>}
          {isGenerating ? (
            <GenerationProgress isActive={isGenerating} />
          ) : (
            <div className="text-center pt-6">
              <button type="button" onClick={handleGenerate} disabled={isGenerating} className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl !px-10 !py-4 text-sm font-medium transition-colors disabled:opacity-50">
                Generate Draft
              </button>
            </div>
          )}
          {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}

          {/* Layer 2 — Customize CTA */}
          <div className="mt-10 border border-dashed border-neutral-300 rounded-xl p-6 text-center bg-neutral-50/50">
            <p className="text-[15px] text-neutral-600 leading-relaxed max-w-md mx-auto">
              Need something the standard options don&apos;t cover? Customize your contract with our AI-powered modification tools.
            </p>
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("ruby-contract-type", categories.join(","));
                sessionStorage.setItem("ruby-contract-title", items.map((i) => i.title).join(", "));
                router.push("/customize");
              }}
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white text-sm font-medium rounded-lg transition-all"
            >
              Customize This Contract
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      );

      default: return <p>Unknown step</p>;
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 lg:py-16 pb-28 md:pb-8">
      {/* ── Mobile step header ── */}
      <div className="md:hidden mb-4">
        {items.length > 1 && (
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
            {items.map((item, idx) => (
              <span key={item.id} className="inline-flex items-center gap-1 shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[13px] text-neutral-600">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#be123c] text-white text-[8px] font-bold">{idx + 1}</span>
                {item.title}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <p className="text-[15px] font-semibold text-neutral-900 truncate pr-2">{steps[step]?.label}</p>
          <span className="text-[14px] text-neutral-400 font-medium tabular-nums shrink-0">Step {step + 1} of {steps.length}</span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#be123c] rounded-full transition-all duration-500 ease-out" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex gap-6 lg:gap-10">
        {/* Sidebar — desktop only */}
        <div className="hidden md:block w-52 lg:w-60 shrink-0 border-r border-neutral-100 pr-4 lg:pr-8">
          <div className="sticky top-[96px]">
            {/* Multi-agreement indicator */}
            {items.length > 1 && (
              <div className="mb-6 pb-5 border-b border-neutral-100">
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400 mb-2">Agreements ({items.length})</p>
                <div className="space-y-1">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[14px] bg-neutral-50 border border-neutral-100"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#be123c] text-white text-[9px] font-bold">{idx + 1}</span>
                      <span className="truncate text-neutral-700">{item.title}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400 mt-2 leading-relaxed">All agreements share the same wizard. Configurations apply to relevant agreement types.</p>
              </div>
            )}
            {items.length === 1 && (
              <div className="mb-5 pb-4 border-b border-neutral-100">
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400 mb-1">Agreement</p>
                <p className="text-[15px] font-medium text-neutral-900">{items[0].title}</p>
              </div>
            )}
            <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-neutral-400 mb-4">Progress</p>
            <div className="space-y-0.5 mb-10">
              {steps.map((s, i) => (
                <button key={s.id} type="button" onClick={() => setStep(i)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition-all duration-200 ${i === step ? "text-[#be123c] font-medium" : i < step ? "text-neutral-700 hover:bg-neutral-50" : "text-neutral-400"}`}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${i === step ? "border-2 border-[#be123c] text-[#be123c] bg-white" : i < step ? "bg-neutral-100 text-neutral-700" : "bg-neutral-100 text-neutral-300"}`}>
                    {i < step ? <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : i + 1}
                  </span>
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
            {/* Complexity meter */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-neutral-500 mb-3">Complexity</p>
              <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ease-smooth ${complexityScore > 15 ? "bg-red-500" : complexityScore > 8 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min((complexityScore / 20) * 100, 100)}%` }} />
              </div>
              <p className="text-[13px] text-neutral-500 mt-2">{complexityScore}/20</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Progress bar — desktop only */}
          <div className="hidden md:flex mb-6 items-center gap-3">
            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#be123c] rounded-full transition-all duration-500 ease-out" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
            <span className="text-[14px] text-neutral-400 font-medium tabular-nums">{step + 1}/{steps.length}</span>
          </div>
          <LegalTermsBar stepId={currentStepId} />
          <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-6 md:p-8 lg:p-10">
            {renderStep()}
          </div>
          {/* Desktop nav buttons */}
          <div className="hidden md:flex mt-8 justify-between items-center">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
            ) : <div />}
            {step < steps.length - 1 && (
              <button type="button" onClick={() => setStep(step + 1)} className="btn-primary flex items-center gap-2">
                Continue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="flex-1 flex items-center justify-center gap-2 border border-neutral-200 rounded-xl py-3.5 text-sm font-medium text-neutral-700 active:bg-neutral-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
          ) : <div className="flex-1" />}
          {step < steps.length - 1 && (
            <button type="button" onClick={() => setStep(step + 1)} className="flex-[2] flex items-center justify-center gap-2 bg-[#be123c] text-white rounded-xl py-3.5 text-sm font-semibold active:bg-[#9f1239] transition-colors">
              Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
