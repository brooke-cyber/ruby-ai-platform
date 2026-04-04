"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AGREEMENTS,
  calculatePricing,
  type Category,
} from "@/data/agreements";

const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All Agreements" },
  { id: "employment", label: "Hiring & Team" },
  { id: "corporate", label: "Equity & Governance" },
  { id: "investment", label: "Financing" },
  { id: "commercial", label: "SaaS & Services" },
  { id: "platform", label: "Platform & Business" },
];

function AgreementsContent() {
  const searchParams = useSearchParams();
  const initialCategory =
    (searchParams.get("category") as Category | null) || "all";
  const [activeCategory, setActiveCategory] =
    useState<Category | "all">(initialCategory);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("ruby-selected");
    if (stored) setSelected(JSON.parse(stored));
  }, []);

  const persist = useCallback((ids: string[]) => {
    setSelected(ids);
    sessionStorage.setItem("ruby-selected", JSON.stringify(ids));
  }, []);

  function toggle(id: string) {
    persist(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  }

  const filtered =
    activeCategory === "all"
      ? AGREEMENTS
      : AGREEMENTS.filter((a) => a.category === activeCategory);

  const pricing = calculatePricing(selected, "self-serve");

  return (
    <div className="bg-white min-h-screen">
      {/* Hero header */}
      <div className="pt-[120px] pb-[80px] px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#be123c] mb-6">
            Agreement Library
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-neutral-900 tracking-tight leading-[1.1] max-w-2xl">
            Select your agreements
          </h1>
          <p className="text-neutral-500 mt-6 max-w-lg text-[15px] leading-relaxed">
            Choose one or more agreements to continue. Bundle pricing applies
            automatically — 10% off for two, 15% off for three or more.
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="px-6 mb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-8 border-b border-neutral-100">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative pb-4 text-[13px] tracking-wide transition-colors duration-200 ${
                  activeCategory === cat.id
                    ? "text-neutral-900"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {cat.label}
                {activeCategory === cat.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#be123c]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agreement grid */}
      <div className="px-6 pb-[160px]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => {
              const isSelected = selected.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggle(a.id)}
                  className={`group relative text-left p-8 rounded-xl border transition-all duration-300 ${
                    isSelected
                      ? "border-[#be123c] bg-[rgba(190,18,60,0.03)]"
                      : "border-neutral-100 bg-white hover:border-neutral-200"
                  }`}
                >
                  {/* Selection indicator */}
                  <div className="absolute top-7 right-7">
                    <div
                      className={`h-5 w-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? "bg-[#be123c] border-[#be123c]"
                          : "border-neutral-200 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="h-2.5 w-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Category label */}
                  <p className="text-[11px] uppercase tracking-[0.25em] text-[#be123c]">
                    {CATEGORIES.find(c => c.id === a.category)?.label || a.category}
                  </p>

                  {/* Title */}
                  <h3 className="mt-4 font-serif text-[18px] text-neutral-900 pr-8 leading-snug">
                    {a.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-[13px] text-neutral-500 leading-relaxed line-clamp-2">
                    {a.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-8 flex items-end justify-between pt-6 border-t border-neutral-100">
                    <span className="text-[11px] text-neutral-400 tracking-wide">
                      Counsel from ${a.counselPrice}
                    </span>
                    <span className="text-[15px] text-neutral-900">
                      ${a.price}
                      <span className="text-[11px] text-neutral-400 ml-1 tracking-wide">
                        CAD
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-40">
          <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="text-[13px] text-neutral-900">
                {selected.length} agreement{selected.length > 1 ? "s" : ""}{" "}
                selected
              </span>
              {pricing.discount > 0 && (
                <span className="text-[11px] uppercase tracking-[0.15em] text-[#be123c]">
                  {pricing.discount * 100}% bundle discount
                </span>
              )}
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                {pricing.discount > 0 && (
                  <span className="text-[13px] text-neutral-400 line-through mr-3">
                    ${pricing.subtotal}
                  </span>
                )}
                <span className="text-lg text-neutral-900">
                  ${pricing.total}
                </span>
                <span className="text-[11px] text-neutral-400 ml-1 tracking-wide">
                  CAD
                </span>
              </div>
              <Link
                href="/tiers"
                className="inline-flex items-center gap-2 bg-[#be123c] text-white text-[13px] tracking-wide px-8 py-3 rounded-lg hover:bg-[#9f1239] transition-colors duration-200"
              >
                Continue
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgreementsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen pt-[120px] px-6">
          <div className="max-w-5xl mx-auto">
            <div className="h-4 w-32 bg-neutral-50 rounded mb-6" />
            <div className="h-12 w-96 bg-neutral-50 rounded" />
          </div>
        </div>
      }
    >
      <AgreementsContent />
    </Suspense>
  );
}
