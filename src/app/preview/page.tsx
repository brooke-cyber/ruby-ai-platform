"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PreviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<string>("");
  const [tier, setTier] = useState<string>("");

  useEffect(() => {
    const storedDraft = sessionStorage.getItem("ruby-draft");
    const storedTier = sessionStorage.getItem("ruby-tier");
    if (storedDraft) setDraft(storedDraft);
    if (storedTier) setTier(storedTier);
  }, []);

  if (!draft) {
    return (
      <div className="container-wide py-32 text-center">
        <h1 className="font-display text-display-sm text-dark-900">No draft generated</h1>
        <p className="text-neutral-500 mt-3">Complete the wizard to generate your agreement draft.</p>
        <button onClick={() => router.push("/agreements")} className="btn-primary mt-8">Browse Agreements</button>
      </div>
    );
  }

  const lines = draft.split("\n");
  const visibleLines = lines.slice(0, 20);
  const blurredLines = lines.slice(20, 60);

  function handleDownload() {
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "founders-law-draft-agreement.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container-wide max-w-4xl py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-ruby-700 mb-3">Preview</p>
          <h1 className="font-display text-display-sm text-dark-900">Agreement Draft</h1>
          <p className="text-neutral-500 mt-2 text-sm">
            {tier === "counsel" ? "With Counsel Review" : "Self-Serve"} — full draft available after purchase
          </p>
        </div>
        <button onClick={() => router.push("/wizard")} className="btn-secondary">Back to Wizard</button>
      </div>

      {/* Preview container */}
      <div className="card overflow-hidden">
        <div className="p-10 font-serif text-[15px] leading-[1.85] text-dark-800 whitespace-pre-wrap">
          {visibleLines.join("\n")}
        </div>

        <div className="relative">
          <div className="px-10 pb-10 font-serif text-[15px] leading-[1.85] text-dark-800 whitespace-pre-wrap blur-sm select-none pointer-events-none">
            {blurredLines.join("\n") || "Additional agreement content continues below..."}
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/80 to-white flex flex-col items-center justify-center">
            <div className="card border-neutral-200 shadow-xl p-12 text-center max-w-md">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-dark-950 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="font-display text-[1.5rem] text-dark-900">Full Draft Locked</h3>
              <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
                Purchase to unlock the complete agreement with all clauses, compliance modules, and jurisdiction-specific provisions.
              </p>
              <button onClick={handleDownload} className="btn-primary w-full mt-8">
                Purchase &amp; Download
              </button>
              {tier === "counsel" && (
                <p className="text-[12px] text-neutral-400 mt-4">
                  Includes review by Brooke Ash, J.D. within 48 hours
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Draft info */}
      <div className="mt-8 card p-6">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">Service Tier</p>
            <p className="text-sm font-medium text-dark-900 mt-1 capitalize">{tier === "counsel" ? "With Counsel Review" : "Self-Serve"}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">Total Lines</p>
            <p className="text-sm font-medium text-dark-900 mt-1">{lines.length}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">Preview</p>
            <p className="text-sm font-medium text-dark-900 mt-1">{visibleLines.length} of {lines.length} lines</p>
          </div>
        </div>
      </div>
    </div>
  );
}
