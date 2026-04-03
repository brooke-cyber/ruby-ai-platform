"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AGREEMENTS,
  COMPLEXITY_COLORS,
  calculatePricing,
  type Category,
} from "@/data/agreements";

const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "employment", label: "Employment" },
  { id: "corporate", label: "Corporate" },
  { id: "investment", label: "Investment" },
  { id: "commercial", label: "Commercial" },
];

function AgreementsContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as Category | null) || "all";
  const [activeCategory, setActiveCategory] = useState<Category | "all">(initialCategory);
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
    persist(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  const filtered =
    activeCategory === "all"
      ? AGREEMENTS
      : AGREEMENTS.filter((a) => a.category === activeCategory);

  const pricing = calculatePricing(selected, "self-serve");

  return (
    <div className="container-wide py-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-ruby-700 mb-3">
          Agreement Library
        </p>
        <h1 className="font-display text-display-md text-dark-900">
          Select your agreements
        </h1>
        <p className="text-neutral-500 mt-3 max-w-lg">
          Choose one or more agreements to continue. Bundle pricing applies
          automatically — 10% off for 2, 15% off for 3+.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-5 py-2.5 text-[13px] font-medium transition-all duration-200 ${
              activeCategory === cat.id
                ? "bg-dark-950 text-white"
                : "bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-400 hover:text-dark-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => {
          const isSelected = selected.includes(a.id);
          const dot = COMPLEXITY_COLORS[a.complexity];
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle(a.id)}
              className={`card relative text-left p-7 transition-all duration-300 ease-smooth ${
                isSelected
                  ? "border-dark-950 shadow-lg shadow-neutral-200/50 -translate-y-0.5"
                  : "card-hover"
              }`}
            >
              {/* Checkbox */}
              <div className="absolute top-6 right-6">
                <div
                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? "bg-dark-950 border-dark-950 scale-110"
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                {a.category === "corporate" ? "Corporate" : a.category.charAt(0).toUpperCase() + a.category.slice(1)}
              </span>

              <h3 className="mt-3 text-[15px] font-semibold text-dark-900 pr-8 leading-snug">{a.title}</h3>
              <p className="mt-2 text-[13px] text-neutral-500 leading-relaxed line-clamp-2">{a.description}</p>

              <div className="mt-5 flex items-center justify-between pt-5 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                  <span className="text-[11px] font-medium text-neutral-400 capitalize">
                    {a.complexity.replace("-", " ")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-dark-900">
                  ${a.price}
                  <span className="text-[11px] font-normal text-neutral-400 ml-1">CAD</span>
                </span>
              </div>

              <p className="mt-3 text-[11px] text-neutral-400 italic">{a.caseRef}</p>
            </button>
          );
        })}
      </div>

      {/* Selection bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-neutral-200/60 z-40">
          <div className="container-wide py-5 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="text-sm font-medium text-dark-900">
                {selected.length} agreement{selected.length > 1 ? "s" : ""} selected
              </span>
              {pricing.discount > 0 && (
                <span className="text-[13px] text-ruby-700 font-medium">
                  {pricing.discount * 100}% bundle discount
                </span>
              )}
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                {pricing.discount > 0 && (
                  <span className="text-[13px] text-neutral-400 line-through mr-2">
                    ${pricing.subtotal}
                  </span>
                )}
                <span className="text-xl font-semibold text-dark-900">
                  ${pricing.total}
                </span>
                <span className="text-[13px] text-neutral-400 ml-1">CAD</span>
              </div>
              <Link href="/tiers" className="btn-primary">
                Continue
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
        <div className="container-wide py-16">
          <div className="h-8 w-48 bg-neutral-100 rounded animate-pulse" />
        </div>
      }
    >
      <AgreementsContent />
    </Suspense>
  );
}
