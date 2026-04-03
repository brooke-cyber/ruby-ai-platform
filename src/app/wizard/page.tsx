"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AGREEMENTS, type Category } from "@/data/agreements";
import { getQuestionsForCategories, getModulesForCategories, evaluateCompliance } from "@/data/compliance";
import { JURISDICTIONS } from "@/data/compliance";

// ─── Types ───
interface PartyInfo { partyA: string; partyB: string; jurisdiction: string; }
interface EmploymentData { salary: string; startDate: string; vacationDays: string; benefitsPlan: string; terminationPosition: string; probationPosition: string; confidentiality: boolean; nonSolicitClient: boolean; nonSolicitClientDuration: string; nonSolicitEmployee: boolean; nonSolicitEmployeeDuration: string; nonCompete: boolean; nonCompeteDuration: string; ipPosition: string; }
interface CorporateData { shareholders: { name: string; equity: string; role: string }[]; boardSize: string; appointmentRights: string; reservedMatters: string[]; votingThreshold: string; rofr: boolean; rofrDays: string; tagAlong: boolean; tagAlongThreshold: string; dragAlong: boolean; dragAlongThreshold: string; preEmptive: boolean; deadlockMethod: string; exitMechanism: string; }
interface InvestmentData { investmentAmount: string; valuationCap: string; discountRate: number; conversionTriggers: string[]; mfnClause: string; proRataThreshold: string; infoFrequency: string; infoScope: string[]; boardObserver: boolean; }
interface CommercialData { serviceDescription: string; deploymentModel: string; uptimeCommitment: number; responseCritical: string; responseHigh: string; responseMedium: string; responseLow: string; serviceCreditSchedule: string; pipeda: boolean; dataResidency: string; breachNotification: string; casl: boolean; liabilityCap: string; forceMajeure: boolean; consequentialDamages: boolean; }

const RESERVED_MATTERS_OPTIONS = [
  "Dividend policy", "Debt issuance above threshold", "Related-party transactions",
  "Share issuance or dilution", "Material contracts", "Winding up or dissolution",
  "Amendment to articles", "Sale of substantially all assets",
];

// ─── Shared UI ───
const inputClass = "mt-1.5 block w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-dark-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-ruby-700/15 focus:border-ruby-700 outline-none transition-all duration-200";
const labelClass = "text-[13px] font-medium text-dark-800";
const toggleClass = (on: boolean) => `relative w-11 h-6 rounded-full transition-colors duration-200 ${on ? "bg-dark-950" : "bg-neutral-200"}`;
const toggleDot = (on: boolean) => `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0.5"}`;

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className={toggleClass(on)}>
      <span className={toggleDot(on)} />
    </button>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-[1.5rem] text-dark-900 leading-tight">{title}</h2>
      <p className="text-[13px] text-neutral-500 mt-1.5">{subtitle}</p>
    </div>
  );
}

// ─── Component ───
export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [tier, setTier] = useState<string>("self-serve");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const [party, setParty] = useState<PartyInfo>({ partyA: "", partyB: "", jurisdiction: "ontario" });
  const [triggerAnswers, setTriggerAnswers] = useState<Record<string, boolean>>({});
  const [employment, setEmployment] = useState<EmploymentData>({ salary: "", startDate: "", vacationDays: "15", benefitsPlan: "standard", terminationPosition: "balanced", probationPosition: "balanced", confidentiality: true, nonSolicitClient: true, nonSolicitClientDuration: "12", nonSolicitEmployee: true, nonSolicitEmployeeDuration: "12", nonCompete: false, nonCompeteDuration: "12", ipPosition: "full-assignment" });
  const [corporate, setCorporate] = useState<CorporateData>({ shareholders: [{ name: "", equity: "", role: "" }], boardSize: "3", appointmentRights: "pro-rata", reservedMatters: ["Dividend policy", "Share issuance or dilution"], votingThreshold: "66.67", rofr: true, rofrDays: "30", tagAlong: true, tagAlongThreshold: "50", dragAlong: true, dragAlongThreshold: "75", preEmptive: true, deadlockMethod: "mediation-arbitration", exitMechanism: "shotgun" });
  const [investment, setInvestment] = useState<InvestmentData>({ investmentAmount: "", valuationCap: "", discountRate: 20, conversionTriggers: ["equity-financing"], mfnClause: "both", proRataThreshold: "5", infoFrequency: "quarterly", infoScope: ["P&L", "Balance sheet"], boardObserver: false });
  const [commercial, setCommercial] = useState<CommercialData>({ serviceDescription: "", deploymentModel: "cloud", uptimeCommitment: 99.9, responseCritical: "1", responseHigh: "4", responseMedium: "8", responseLow: "24", serviceCreditSchedule: "tiered", pipeda: true, dataResidency: "canada", breachNotification: "72", casl: true, liabilityCap: "12mo", forceMajeure: true, consequentialDamages: true });

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

  const questions = useMemo(() => getQuestionsForCategories(categories), [categories]);
  const { activeModules, warnings } = useMemo(
    () => evaluateCompliance(categories, party.jurisdiction, triggerAnswers),
    [categories, party.jurisdiction, triggerAnswers]
  );

  const steps = useMemo(() => {
    const s: { id: string; label: string }[] = [
      { id: "party", label: "Party Information" },
      { id: "compliance", label: "Compliance Modules" },
    ];
    if (hasEmployment) {
      s.push({ id: "emp-comp", label: "Compensation & Benefits" });
      s.push({ id: "emp-clause", label: "Clause Positions" });
      s.push({ id: "emp-covenant", label: "Restrictive Covenants" });
      s.push({ id: "emp-ip", label: "IP Assignment" });
    }
    if (hasCorporate) {
      s.push({ id: "corp-shareholders", label: "Shareholder Structure" });
      s.push({ id: "corp-governance", label: "Governance Provisions" });
      s.push({ id: "corp-transfer", label: "Transfer Restrictions" });
      s.push({ id: "corp-deadlock", label: "Deadlock & Exit" });
    }
    if (hasInvestment) {
      s.push({ id: "inv-terms", label: "Investment Terms" });
      s.push({ id: "inv-conversion", label: "Conversion Mechanics" });
      s.push({ id: "inv-info", label: "Information Rights" });
    }
    if (hasCommercial) {
      s.push({ id: "com-service", label: "Service Definition" });
      s.push({ id: "com-sla", label: "Service Levels" });
      s.push({ id: "com-data", label: "Data & Privacy" });
      s.push({ id: "com-liability", label: "Liability" });
    }
    s.push({ id: "review", label: "Review & Generate" });
    return s;
  }, [hasEmployment, hasCorporate, hasInvestment, hasCommercial]);

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
      const wizardData = { party, triggerAnswers, employment: hasEmployment ? employment : undefined, corporate: hasCorporate ? corporate : undefined, investment: hasInvestment ? investment : undefined, commercial: hasCommercial ? commercial : undefined, activeModules: activeModules.map((m) => m.name), warnings, tier };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categories, agreementType: items.map((i) => i.title).join(", "), jurisdiction: party.jurisdiction, wizardData }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Generation failed (${res.status})`); }
      const data = await res.json();
      sessionStorage.setItem("ruby-draft", data.draft);
      router.push("/preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  }

  function renderStep() {
    switch (currentStepId) {
      case "party": return (
        <div className="space-y-6">
          <StepHeader title="Party Information" subtitle="Identify the parties and governing jurisdiction." />
          <div className="grid grid-cols-2 gap-5">
            <label className="block"><span className={labelClass}>Party A (Client / Employer / Corporation)</span><input type="text" value={party.partyA} onChange={(e) => setParty({ ...party, partyA: e.target.value })} placeholder="Acme Technologies Inc." className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Party B (Employee / Shareholder / Investor)</span><input type="text" value={party.partyB} onChange={(e) => setParty({ ...party, partyB: e.target.value })} placeholder="Jane Doe" className={inputClass} /></label>
          </div>
          <label className="block"><span className={labelClass}>Jurisdiction</span>
            <select value={party.jurisdiction} onChange={(e) => setParty({ ...party, jurisdiction: e.target.value })} className={inputClass}>
              {JURISDICTIONS.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </label>
        </div>
      );

      case "compliance": return (
        <div className="space-y-6">
          <StepHeader title="Compliance Modules" subtitle="Answer trigger questions to activate relevant compliance modules." />
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-5 transition-colors hover:bg-neutral-50/50">
                <div className="pr-4">
                  <p className="text-sm font-medium text-dark-900">{q.question}</p>
                  <p className="text-[12px] text-neutral-400 mt-0.5">{q.description}</p>
                </div>
                <Toggle on={!!triggerAnswers[q.id]} onToggle={() => setTriggerAnswers((prev) => ({ ...prev, [q.id]: !prev[q.id] }))} />
              </div>
            ))}
          </div>
          {activeModules.length > 0 && (
            <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400 mb-3">Active Modules</p>
              <div className="flex flex-wrap gap-2">
                {activeModules.map((m) => <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-dark-950 text-white px-3 py-1 text-[11px] font-medium">{m.shortName}</span>)}
              </div>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="space-y-2">
              {warnings.map((w, i) => <div key={i} className="rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">{w}</div>)}
            </div>
          )}
        </div>
      );

      case "emp-comp": return (
        <div className="space-y-6">
          <StepHeader title="Compensation & Benefits" subtitle="Core employment terms and compensation structure." />
          <div className="grid grid-cols-2 gap-5">
            <label className="block"><span className={labelClass}>Annual Salary (CAD)</span><input type="text" value={employment.salary} onChange={(e) => setEmployment({ ...employment, salary: e.target.value })} placeholder="$120,000" className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Start Date</span><input type="date" value={employment.startDate} onChange={(e) => setEmployment({ ...employment, startDate: e.target.value })} className={inputClass} /></label>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <label className="block"><span className={labelClass}>Vacation Days</span><input type="number" value={employment.vacationDays} onChange={(e) => setEmployment({ ...employment, vacationDays: e.target.value })} className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Benefits Plan</span>
              <select value={employment.benefitsPlan} onChange={(e) => setEmployment({ ...employment, benefitsPlan: e.target.value })} className={inputClass}>
                <option value="standard">Standard Group Benefits</option><option value="enhanced">Enhanced Executive Benefits</option><option value="none">No Benefits</option>
              </select>
            </label>
          </div>
        </div>
      );

      case "emp-clause": return (
        <div className="space-y-6">
          <StepHeader title="Clause Positions" subtitle="Select your negotiating position for key clauses." />
          {[{ id: "terminationPosition" as const, label: "Termination Without Cause", ef: "ESA minimum only", bal: "ESA-Plus enhanced formula", ep: "Full compensation continuation" }, { id: "probationPosition" as const, label: "Probation Period", ef: "Maximum probation (6 months)", bal: "Standard probation (3 months)", ep: "No probation period" }].map((clause) => (
            <div key={clause.id} className="rounded-xl border border-neutral-200 p-5">
              <p className="text-sm font-semibold text-dark-900 mb-4">{clause.label}</p>
              <div className="grid grid-cols-3 gap-3">
                {(["employer-favourable", "balanced", "employee-favourable"] as const).map((pos, i) => {
                  const labels = [clause.ef, clause.bal, clause.ep];
                  const active = employment[clause.id] === pos;
                  return <button key={pos} type="button" onClick={() => setEmployment({ ...employment, [clause.id]: pos })} className={`rounded-xl border px-4 py-3 text-[13px] font-medium transition-all duration-200 ${active ? "border-dark-950 bg-dark-950 text-white" : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400"}`}>{labels[i]}</button>;
                })}
              </div>
            </div>
          ))}
        </div>
      );

      case "emp-covenant": return (
        <div className="space-y-5">
          <StepHeader title="Restrictive Covenants" subtitle="Configure confidentiality, non-solicitation, and non-compete provisions." />
          {[{ key: "confidentiality" as const, label: "Confidentiality Clause", desc: "Protects trade secrets and confidential business information" }, { key: "nonSolicitClient" as const, label: "Non-Solicitation of Clients", desc: "Prohibits solicitation of employer's clients post-termination" }, { key: "nonSolicitEmployee" as const, label: "Non-Solicitation of Employees", desc: "Prohibits recruiting employer's employees post-termination" }].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
              <div><p className="text-sm font-medium text-dark-900">{item.label}</p><p className="text-[12px] text-neutral-400 mt-0.5">{item.desc}</p></div>
              <Toggle on={employment[item.key]} onToggle={() => setEmployment({ ...employment, [item.key]: !employment[item.key] })} />
            </div>
          ))}
          {employment.nonSolicitClient && <label className="block"><span className={labelClass}>Client Non-Solicitation Duration (months)</span><input type="number" value={employment.nonSolicitClientDuration} onChange={(e) => setEmployment({ ...employment, nonSolicitClientDuration: e.target.value })} className={inputClass} /></label>}
          <div className="rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-dark-900">Non-Competition Clause</p><p className="text-[12px] text-neutral-400 mt-0.5">Restricts competitive employment post-termination</p></div>
              <Toggle on={employment.nonCompete} onToggle={() => setEmployment({ ...employment, nonCompete: !employment.nonCompete })} />
            </div>
            {isOntarioNonCsuiteNonCompete && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700 leading-relaxed">Ontario ESA s.67.2: Non-compete clauses are void for non-C-suite employees. The system will automatically substitute enhanced non-solicitation provisions.</div>}
          </div>
        </div>
      );

      case "emp-ip": return (
        <div className="space-y-6">
          <StepHeader title="IP Assignment" subtitle="Intellectual property ownership and moral rights provisions." />
          <div className="grid grid-cols-3 gap-4">
            {[{ id: "full-assignment", label: "Full Assignment", desc: "All IP created during employment assigned to employer" }, { id: "license-back", label: "License-Back", desc: "IP assigned but employee retains license for personal use" }, { id: "no-assignment", label: "No Assignment", desc: "Employee retains IP ownership" }].map((pos) => (
              <button key={pos.id} type="button" onClick={() => setEmployment({ ...employment, ipPosition: pos.id })} className={`card text-left p-5 transition-all duration-200 ${employment.ipPosition === pos.id ? "border-dark-950 border-2 shadow-md" : "hover:border-neutral-300"}`}>
                <p className="text-sm font-semibold text-dark-900">{pos.label}</p>
                <p className="text-[12px] text-neutral-400 mt-1 leading-relaxed">{pos.desc}</p>
              </button>
            ))}
          </div>
        </div>
      );

      case "corp-shareholders": return (
        <div className="space-y-6">
          <StepHeader title="Shareholder Structure" subtitle="Define shareholders, ownership percentages, and roles. Must total 100%." />
          {corporate.shareholders.map((sh, i) => (
            <div key={i} className="grid grid-cols-3 gap-4">
              <input placeholder="Shareholder name" value={sh.name} onChange={(e) => { const s = [...corporate.shareholders]; s[i] = { ...s[i], name: e.target.value }; setCorporate({ ...corporate, shareholders: s }); }} className={inputClass} />
              <input placeholder="Equity %" type="number" value={sh.equity} onChange={(e) => { const s = [...corporate.shareholders]; s[i] = { ...s[i], equity: e.target.value }; setCorporate({ ...corporate, shareholders: s }); }} className={inputClass} />
              <div className="flex gap-3">
                <input placeholder="Role" value={sh.role} onChange={(e) => { const s = [...corporate.shareholders]; s[i] = { ...s[i], role: e.target.value }; setCorporate({ ...corporate, shareholders: s }); }} className={`flex-1 ${inputClass}`} />
                {corporate.shareholders.length > 1 && <button type="button" onClick={() => setCorporate({ ...corporate, shareholders: corporate.shareholders.filter((_, j) => j !== i) })} className="text-neutral-400 hover:text-red-500 text-sm font-medium transition-colors mt-1.5">Remove</button>}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setCorporate({ ...corporate, shareholders: [...corporate.shareholders, { name: "", equity: "", role: "" }] })} className="text-[13px] text-dark-900 font-medium hover:text-ruby-700 transition-colors">+ Add Shareholder</button>
          {(() => { const total = corporate.shareholders.reduce((s, sh) => s + (parseFloat(sh.equity) || 0), 0); return total !== 100 && total > 0 ? <p className="text-[13px] text-amber-600">Total equity: {total}% (must equal 100%)</p> : null; })()}
        </div>
      );

      case "corp-governance": return (
        <div className="space-y-6">
          <StepHeader title="Governance Provisions" subtitle="Board composition, reserved matters, and voting thresholds." />
          <div className="grid grid-cols-2 gap-5">
            <label className="block"><span className={labelClass}>Board Size (directors)</span><input type="number" value={corporate.boardSize} onChange={(e) => setCorporate({ ...corporate, boardSize: e.target.value })} className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Voting Threshold (%)</span><input type="text" value={corporate.votingThreshold} onChange={(e) => setCorporate({ ...corporate, votingThreshold: e.target.value })} placeholder="66.67" className={inputClass} /></label>
          </div>
          <div><p className={`${labelClass} mb-3`}>Reserved Matters</p>
            <div className="grid grid-cols-2 gap-3">
              {RESERVED_MATTERS_OPTIONS.map((m) => (<label key={m} className="flex items-center gap-3 text-sm text-neutral-600 cursor-pointer"><input type="checkbox" checked={corporate.reservedMatters.includes(m)} onChange={(e) => setCorporate({ ...corporate, reservedMatters: e.target.checked ? [...corporate.reservedMatters, m] : corporate.reservedMatters.filter((r) => r !== m) })} className="rounded border-neutral-300 text-dark-950 focus:ring-dark-950/20" />{m}</label>))}
            </div>
          </div>
        </div>
      );

      case "corp-transfer": return (
        <div className="space-y-5">
          <StepHeader title="Transfer Restrictions" subtitle="Share transfer mechanisms and pre-emptive rights." />
          {[{ key: "rofr" as const, label: "Right of First Refusal (ROFR)", dur: "rofrDays" as const, durLabel: "Exercise Period (days)" }, { key: "tagAlong" as const, label: "Tag-Along Rights", dur: "tagAlongThreshold" as const, durLabel: "Threshold (%)" }, { key: "dragAlong" as const, label: "Drag-Along Rights", dur: "dragAlongThreshold" as const, durLabel: "Threshold (%)" }, { key: "preEmptive" as const, label: "Pre-Emptive Rights", dur: null, durLabel: "" }].map((item) => (
            <div key={item.key} className="rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-dark-900">{item.label}</p>
                <Toggle on={corporate[item.key]} onToggle={() => setCorporate({ ...corporate, [item.key]: !corporate[item.key] })} />
              </div>
              {corporate[item.key] && item.dur && <input type="number" value={corporate[item.dur]} onChange={(e) => setCorporate({ ...corporate, [item.dur!]: e.target.value })} placeholder={item.durLabel} className={`mt-3 w-48 ${inputClass}`} />}
            </div>
          ))}
        </div>
      );

      case "corp-deadlock": return (
        <div className="space-y-6">
          <StepHeader title="Deadlock & Exit" subtitle="Deadlock resolution method and exit mechanism." />
          <div><p className={`${labelClass} mb-3`}>Deadlock Resolution Method</p>
            <div className="space-y-2">{[{ id: "mediation-arbitration", label: "Mediation then Arbitration" }, { id: "shotgun", label: "Shotgun Buy-Sell" }, { id: "third-party", label: "Third-Party Referee" }].map((m) => (<label key={m.id} className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 ${corporate.deadlockMethod === m.id ? "border-dark-950 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300"}`}><input type="radio" name="deadlock" checked={corporate.deadlockMethod === m.id} onChange={() => setCorporate({ ...corporate, deadlockMethod: m.id })} className="text-dark-950 focus:ring-dark-950/20" /><span className="text-sm text-dark-900">{m.label}</span></label>))}</div>
          </div>
          <label className="block"><span className={labelClass}>Exit Mechanism</span>
            <select value={corporate.exitMechanism} onChange={(e) => setCorporate({ ...corporate, exitMechanism: e.target.value })} className={inputClass}>
              <option value="shotgun">Shotgun Buy-Sell</option><option value="put-call">Put/Call Options</option><option value="drag-along">Drag-Along Sale</option><option value="dissolution">Forced Dissolution</option>
            </select>
          </label>
        </div>
      );

      case "inv-terms": return (
        <div className="space-y-6">
          <StepHeader title="Investment Terms" subtitle="Core SAFE terms including investment amount and valuation." />
          <div className="grid grid-cols-2 gap-5">
            <label className="block"><span className={labelClass}>Investment Amount (CAD)</span><input type="text" value={investment.investmentAmount} onChange={(e) => setInvestment({ ...investment, investmentAmount: e.target.value })} placeholder="$250,000" className={inputClass} /></label>
            <label className="block"><span className={labelClass}>Valuation Cap (CAD)</span><input type="text" value={investment.valuationCap} onChange={(e) => setInvestment({ ...investment, valuationCap: e.target.value })} placeholder="$5,000,000" className={inputClass} /></label>
          </div>
          <label className="block"><span className={labelClass}>Discount Rate: {investment.discountRate}%</span><input type="range" min="10" max="30" step="1" value={investment.discountRate} onChange={(e) => setInvestment({ ...investment, discountRate: parseInt(e.target.value) })} className="mt-2 block w-full accent-dark-950" /></label>
        </div>
      );

      case "inv-conversion": return (
        <div className="space-y-6">
          <StepHeader title="Conversion Mechanics" subtitle="SAFE conversion triggers and MFN provisions." />
          <div><p className={`${labelClass} mb-3`}>Conversion Triggers</p>
            {[{ id: "equity-financing", label: "Equity Financing" }, { id: "liquidity-event", label: "Liquidity Event (M&A/IPO)" }, { id: "dissolution", label: "Dissolution" }].map((t) => (<label key={t.id} className="flex items-center gap-3 text-sm text-neutral-600 mb-3 cursor-pointer"><input type="checkbox" checked={investment.conversionTriggers.includes(t.id)} onChange={(e) => setInvestment({ ...investment, conversionTriggers: e.target.checked ? [...investment.conversionTriggers, t.id] : investment.conversionTriggers.filter((c) => c !== t.id) })} className="rounded border-neutral-300 text-dark-950 focus:ring-dark-950/20" />{t.label}</label>))}
          </div>
          <label className="block"><span className={labelClass}>MFN Clause Scope</span>
            <select value={investment.mfnClause} onChange={(e) => setInvestment({ ...investment, mfnClause: e.target.value })} className={inputClass}>
              <option value="valuation-cap">Valuation Cap Only</option><option value="discount">Discount Only</option><option value="both">Both</option>
            </select>
          </label>
          <label className="block"><span className={labelClass}>Pro Rata Threshold (%)</span><input type="text" value={investment.proRataThreshold} onChange={(e) => setInvestment({ ...investment, proRataThreshold: e.target.value })} className={inputClass} /></label>
        </div>
      );

      case "inv-info": return (
        <div className="space-y-6">
          <StepHeader title="Information Rights" subtitle="Reporting frequency, scope, and board observer rights." />
          <label className="block"><span className={labelClass}>Reporting Frequency</span>
            <select value={investment.infoFrequency} onChange={(e) => setInvestment({ ...investment, infoFrequency: e.target.value })} className={inputClass}>
              <option value="quarterly">Quarterly</option><option value="annual">Annual</option>
            </select>
          </label>
          <div><p className={`${labelClass} mb-3`}>Information Scope</p>
            {["P&L", "Balance sheet", "Cap table", "Material events"].map((s) => (<label key={s} className="flex items-center gap-3 text-sm text-neutral-600 mb-3 cursor-pointer"><input type="checkbox" checked={investment.infoScope.includes(s)} onChange={(e) => setInvestment({ ...investment, infoScope: e.target.checked ? [...investment.infoScope, s] : investment.infoScope.filter((i) => i !== s) })} className="rounded border-neutral-300 text-dark-950 focus:ring-dark-950/20" />{s}</label>))}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
            <p className="text-sm font-medium text-dark-900">Board Observer Rights</p>
            <Toggle on={investment.boardObserver} onToggle={() => setInvestment({ ...investment, boardObserver: !investment.boardObserver })} />
          </div>
        </div>
      );

      case "com-service": return (
        <div className="space-y-6">
          <StepHeader title="Service Definition" subtitle="Describe the services and deployment model." />
          <label className="block"><span className={labelClass}>Service Description</span><textarea value={commercial.serviceDescription} onChange={(e) => setCommercial({ ...commercial, serviceDescription: e.target.value })} placeholder="Describe the services being provided..." rows={4} className={inputClass} /></label>
          <div><p className={`${labelClass} mb-3`}>Deployment Model</p>
            <div className="grid grid-cols-3 gap-3">{[{ id: "cloud", label: "Cloud" }, { id: "on-premise", label: "On-Premise" }, { id: "hybrid", label: "Hybrid" }].map((m) => (<button key={m.id} type="button" onClick={() => setCommercial({ ...commercial, deploymentModel: m.id })} className={`rounded-xl border p-4 text-sm font-medium transition-all duration-200 ${commercial.deploymentModel === m.id ? "border-dark-950 bg-dark-950 text-white" : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400"}`}>{m.label}</button>))}</div>
          </div>
        </div>
      );

      case "com-sla": return (
        <div className="space-y-6">
          <StepHeader title="Service Levels" subtitle="Uptime commitments and response time SLOs." />
          <label className="block"><span className={labelClass}>Uptime Commitment: {commercial.uptimeCommitment}%</span><input type="range" min="99.5" max="99.99" step="0.01" value={commercial.uptimeCommitment} onChange={(e) => setCommercial({ ...commercial, uptimeCommitment: parseFloat(e.target.value) })} className="mt-2 block w-full accent-dark-950" /></label>
          <div><p className={`${labelClass} mb-3`}>Response Times (hours)</p>
            <div className="grid grid-cols-4 gap-4">{[{ key: "responseCritical" as const, label: "Critical" }, { key: "responseHigh" as const, label: "High" }, { key: "responseMedium" as const, label: "Medium" }, { key: "responseLow" as const, label: "Low" }].map((t) => (<label key={t.key} className="block"><span className="text-[12px] text-neutral-500">{t.label}</span><input type="number" value={commercial[t.key]} onChange={(e) => setCommercial({ ...commercial, [t.key]: e.target.value })} className={inputClass} /></label>))}</div>
          </div>
        </div>
      );

      case "com-data": return (
        <div className="space-y-5">
          <StepHeader title="Data & Privacy" subtitle="PIPEDA compliance, data residency, and CASL requirements." />
          {[{ key: "pipeda" as const, label: "PIPEDA Compliance", desc: "Federal privacy legislation for commercial activities" }, { key: "casl" as const, label: "CASL Compliance", desc: "Canada Anti-Spam Legislation for electronic messaging" }].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-5">
              <div><p className="text-sm font-medium text-dark-900">{item.label}</p><p className="text-[12px] text-neutral-400 mt-0.5">{item.desc}</p></div>
              <Toggle on={commercial[item.key]} onToggle={() => setCommercial({ ...commercial, [item.key]: !commercial[item.key] })} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-5">
            <label className="block"><span className={labelClass}>Data Residency</span>
              <select value={commercial.dataResidency} onChange={(e) => setCommercial({ ...commercial, dataResidency: e.target.value })} className={inputClass}>
                <option value="canada">Canada Only</option><option value="north-america">North America</option><option value="global">Global</option>
              </select>
            </label>
            <label className="block"><span className={labelClass}>Breach Notification (hours)</span><input type="number" value={commercial.breachNotification} onChange={(e) => setCommercial({ ...commercial, breachNotification: e.target.value })} className={inputClass} /></label>
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
              <p className="text-sm font-medium text-dark-900">{item.label}</p>
              <Toggle on={commercial[item.key]} onToggle={() => setCommercial({ ...commercial, [item.key]: !commercial[item.key] })} />
            </div>
          ))}
        </div>
      );

      case "review": return (
        <div className="space-y-6">
          <StepHeader title="Review & Generate" subtitle="Review your selections and generate the draft." />
          <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-6 space-y-4">
            {[
              ["Parties", `${party.partyA || "—"} / ${party.partyB || "—"}`],
              ["Jurisdiction", party.jurisdiction.replace("-", " ")],
              ["Agreements", `${items.length} selected`],
              ["Compliance Modules", `${activeModules.length} active`],
              ["Tier", tier.replace("-", " ")],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-neutral-500">{label}</span>
                <span className="text-dark-900 font-medium capitalize">{value}</span>
              </div>
            ))}
          </div>
          {warnings.length > 0 && <div className="space-y-2">{warnings.map((w, i) => <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-700">{w}</div>)}</div>}
          <div className="text-center pt-6">
            <button type="button" onClick={handleGenerate} disabled={isGenerating} className="btn-primary !px-10 !py-4 disabled:opacity-50">
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Generating Draft...
                </span>
              ) : "Generate Draft"}
            </button>
            {isGenerating && <p className="mt-4 text-[13px] text-neutral-400">This typically takes 15-30 seconds for complex agreements.</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        </div>
      );

      default: return <p>Unknown step</p>;
    }
  }

  return (
    <div className="container-wide max-w-5xl py-16">
      <div className="flex gap-10">
        {/* Sidebar */}
        <div className="w-60 shrink-0">
          <div className="sticky top-[96px]">
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-400 mb-4">Progress</p>
            <div className="space-y-0.5 mb-10">
              {steps.map((s, i) => (
                <button key={s.id} type="button" onClick={() => setStep(i)} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${i === step ? "bg-dark-950 text-white font-medium" : i < step ? "text-dark-900 hover:bg-neutral-100" : "text-neutral-400"}`}>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${i === step ? "bg-white text-dark-950" : i < step ? "bg-dark-950 text-white" : "bg-neutral-200 text-neutral-400"}`}>
                    {i < step ? <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : i + 1}
                  </span>
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
            {/* Complexity meter */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400 mb-3">Complexity</p>
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ease-smooth ${complexityScore > 15 ? "bg-red-500" : complexityScore > 8 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min((complexityScore / 20) * 100, 100)}%` }} />
              </div>
              <p className="text-[11px] text-neutral-400 mt-2">{complexityScore}/20</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="card p-10">
            {renderStep()}
          </div>
          <div className="mt-8 flex justify-between">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">Back</button>
            ) : <div />}
            {step < steps.length - 1 && (
              <button type="button" onClick={() => setStep(step + 1)} className="btn-primary">Continue</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
