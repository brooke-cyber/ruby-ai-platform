"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AGREEMENTS, calculatePricing } from "@/data/agreements";

export default function TiersPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("ruby-selected");
    if (stored) setSelected(JSON.parse(stored));
  }, []);

  const selfServe = calculatePricing(selected, "self-serve");
  const counsel = calculatePricing(selected, "counsel");
  const items = AGREEMENTS.filter((a) => selected.includes(a.id));

  function selectTier(tier: "self-serve" | "counsel") {
    sessionStorage.setItem("ruby-tier", tier);
    router.push("/wizard");
  }

  if (selected.length === 0) {
    return (
      <div className="container-wide py-32 text-center">
        <h1 className="font-display text-display-sm text-dark-900">No agreements selected</h1>
        <p className="text-neutral-500 mt-3">
          Go back to the agreement library to select your agreements.
        </p>
        <button onClick={() => router.push("/agreements")} className="btn-primary mt-8">
          Browse Agreements
        </button>
      </div>
    );
  }

  return (
    <div className="container-wide max-w-5xl py-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-ruby-700 mb-3">
          Service Tier
        </p>
        <h1 className="font-display text-display-md text-dark-900">
          Choose your service level
        </h1>
        <p className="text-neutral-500 mt-3">
          {items.length} agreement{items.length > 1 ? "s" : ""} selected:{" "}
          <span className="text-dark-800">
            {items.map((a) => a.title).join(", ")}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Self-Serve */}
        <div className="card p-10">
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-400">
            Self-Serve
          </span>
          <div className="mt-6">
            {selfServe.discount > 0 && (
              <span className="text-sm text-neutral-400 line-through mr-2">
                ${selfServe.subtotal}
              </span>
            )}
            <span className="font-display text-display-sm text-dark-900">
              ${selfServe.total}
            </span>
            <span className="text-sm text-neutral-400 ml-2">CAD</span>
          </div>
          <div className="mt-8 space-y-4">
            {[
              "AI-generated draft agreement",
              "Full compliance module analysis",
              "Clause position selection",
              "Instant delivery",
              "Unlimited regeneration",
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-neutral-100 flex items-center justify-center mt-0.5 shrink-0">
                  <svg className="h-3 w-3 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-neutral-600">{f}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => selectTier("self-serve")}
            className="btn-secondary w-full mt-10"
          >
            Select Self-Serve
          </button>
        </div>

        {/* With Counsel */}
        <div className="card border-dark-950 border-2 p-10 relative">
          <div className="absolute -top-3 left-8 bg-dark-950 text-white text-[10px] font-medium uppercase tracking-[0.15em] px-4 py-1.5 rounded-full">
            Recommended
          </div>
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-400">
            With Counsel Review
          </span>
          <div className="mt-6">
            {counsel.discount > 0 && (
              <span className="text-sm text-neutral-400 line-through mr-2">
                ${counsel.subtotal}
              </span>
            )}
            <span className="font-display text-display-sm text-dark-900">
              ${counsel.total}
            </span>
            <span className="text-sm text-neutral-400 ml-2">CAD</span>
          </div>
          <div className="mt-8 space-y-4">
            {[
              "Everything in Self-Serve",
              "Personal review by Brooke Ash, J.D.",
              "Redline markup and annotations",
              "48-hour turnaround",
              "Direct communication channel",
              "Enforceability opinion letter",
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-dark-950 flex items-center justify-center mt-0.5 shrink-0">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-neutral-600">{f}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => selectTier("counsel")}
            className="btn-primary w-full mt-10"
          >
            Select With Counsel
          </button>
        </div>
      </div>
    </div>
  );
}
