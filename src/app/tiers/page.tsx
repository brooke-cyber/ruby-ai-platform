"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AGREEMENTS, calculatePricing } from "@/data/agreements";

function TiersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    // Read from URL param first (single agreement from library card click)
    const urlAgreement = searchParams.get("agreement");
    if (urlAgreement) {
      const ids = [urlAgreement];
      setSelected(ids);
      sessionStorage.setItem("ruby-selected", JSON.stringify(ids));
      return;
    }
    // Fallback to sessionStorage (multi-select or returning)
    const stored = sessionStorage.getItem("ruby-selected");
    if (stored) setSelected(JSON.parse(stored));
  }, [searchParams]);

  const selfServe = calculatePricing(selected, "self-serve");
  const counsel = calculatePricing(selected, "counsel");
  const items = AGREEMENTS.filter((a) => selected.includes(a.id));

  function selectTier(tier: "self-serve" | "counsel") {
    sessionStorage.setItem("ruby-tier", tier);
    router.push("/wizard");
  }

  if (selected.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-6 py-40 text-center">
          <h1 className="font-serif text-3xl text-neutral-900 tracking-tight">
            No agreements selected
          </h1>
          <p className="text-neutral-500 mt-4 text-[15px] leading-relaxed">
            Return to the agreement library to make your selection.
          </p>
          <button
            onClick={() => router.push("/agreements")}
            className="mt-10 px-10 py-3.5 bg-neutral-900 text-white text-sm font-medium tracking-wide rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Browse Agreements
          </button>
        </div>
      </div>
    );
  }

  const selfServeFeatures = [
    "Lawyer-engineered, AI-drafted agreement",
    "Built from the same clause library used by top Canadian firms",
    "Full provincial compliance analysis",
    "Clause position selection (client-favorable, balanced, or counter-party)",
    "Instant delivery — download in minutes",
  ];

  const counselFeatures = [
    "Everything in Base Draft",
    "Licensed Canadian lawyer in your province reviews your agreement",
    "Plain-language memo: what's in it and what it means for you",
    "Redline markup flagging anything that needs attention",
    "Specific legal advice on enforceability and risk",
    "Formal approval or clear guidance on what to change",
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-20 max-w-xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-neutral-400 mb-5">
            Service Tier
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 tracking-tight leading-[1.1]">
            Choose your level
            <br />
            of service
          </h1>
          <p className="text-neutral-500 mt-6 text-[15px] leading-relaxed">
            {items.length} agreement{items.length > 1 ? "s" : ""} selected
            <span className="mx-2 text-neutral-300">|</span>
            <span className="text-neutral-700">
              {items.map((a) => a.title).join(", ")}
            </span>
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Base Draft */}
          <div className="border border-neutral-200 p-10 md:p-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Base Draft
            </p>

            <div className="mt-8 pb-8 border-b border-neutral-100">
              <div className="flex items-baseline gap-2">
                {selfServe.discount > 0 && (
                  <span className="text-sm text-neutral-300 line-through">
                    ${selfServe.subtotal}
                  </span>
                )}
                <span className="font-serif text-4xl text-neutral-900">
                  ${selfServe.total}
                </span>
                <span className="text-[13px] text-neutral-400 ml-1">CAD</span>
              </div>
            </div>

            <ul className="mt-8 space-y-4">
              {selfServeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-2 block h-1 w-1 rounded-full bg-neutral-300 shrink-0" />
                  <span className="text-[14px] text-neutral-500 leading-relaxed">
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => selectTier("self-serve")}
              className="w-full mt-12 px-6 py-3.5 border border-neutral-300 text-neutral-700 text-sm font-medium tracking-wide hover:border-neutral-900 hover:text-neutral-900 transition-colors"
            >
              Continue
            </button>
          </div>

          {/* Base Draft + Lawyer Review */}
          <div className="border border-[#be123c] p-10 md:p-12 relative">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#be123c] mb-1">
              Recommended
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Base Draft + Lawyer Review
            </p>

            <div className="mt-8 pb-8 border-b border-neutral-100">
              <div className="flex items-baseline gap-2">
                {counsel.discount > 0 && (
                  <span className="text-sm text-neutral-300 line-through">
                    ${counsel.subtotal}
                  </span>
                )}
                <span className="font-serif text-4xl text-neutral-900">
                  ${counsel.total}
                </span>
                <span className="text-[13px] text-neutral-400 ml-1">CAD</span>
              </div>
            </div>

            <ul className="mt-8 space-y-4">
              {counselFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-2 block h-1 w-1 rounded-full bg-neutral-300 shrink-0" />
                  <span className="text-[14px] text-neutral-500 leading-relaxed">
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => selectTier("counsel")}
              className="w-full mt-12 px-6 py-3.5 bg-neutral-900 text-white text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>


        {/* Customization note */}
        <div className="mt-16 max-w-lg mx-auto text-center">
          <p className="text-[13px] text-neutral-500 leading-relaxed">
            After receiving your base contract, you can optionally customize it further through the Ruby Customization Wizard. Customization pricing starts at $49 per modification.
          </p>
          <Link href="/pricing" className="inline-block mt-3 text-[13px] text-[#be123c] font-medium hover:underline">
            Learn about customization &rarr;
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-center text-[13px] text-neutral-400 mt-10 max-w-md mx-auto leading-relaxed">
          All prices in Canadian dollars. Bundle discounts applied automatically
          when selecting multiple agreements.
        </p>
      </div>
    </div>
  );
}

export default function TiersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <TiersContent />
    </Suspense>
  );
}
