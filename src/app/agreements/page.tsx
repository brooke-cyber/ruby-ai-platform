"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AGREEMENTS,
  COMPLEXITY_COLORS,
  CATEGORY_BADGE_COLORS,
  type Category,
  type Complexity,
} from "@/data/agreements";

const CATEGORIES: { id: Category | "all"; label: string; subtitle?: string }[] = [
  { id: "all", label: "All Agreements" },
  { id: "corporate", label: "Start & Structure", subtitle: "Incorporation, governance, shareholders" },
  { id: "employment", label: "Hire & Protect", subtitle: "Employment, contractors, IP, non-competes" },
  { id: "investment", label: "Raise Capital", subtitle: "SAFEs, term sheets, financing rounds" },
  { id: "commercial", label: "Close Deals", subtitle: "SaaS, licensing, vendor, MSA" },
  { id: "platform", label: "Launch & Comply", subtitle: "Terms, privacy, cookies, data" },
  { id: "creator", label: "Create & License", subtitle: "Influencer, content, talent, music" },
];

const COMPLEXITY_LABELS: Record<Complexity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  "very-high": "Very High",
};

function AgreementsContent() {
  const searchParams = useSearchParams();
  const initialCategory =
    (searchParams.get("category") as Category | null) || "all";
  const [activeCategory, setActiveCategory] =
    useState<Category | "all">(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let results =
      activeCategory === "all"
        ? AGREEMENTS
        : AGREEMENTS.filter((a) => a.category === activeCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return results;
  }, [activeCategory, searchQuery]);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero header */}
      <div className="pt-[120px] pb-[60px] px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#be123c] mb-6">
            Agreement Library
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-neutral-900 tracking-tight leading-[1.1] max-w-2xl">
            What do you need<br />drafted today?
          </h1>
          <p className="text-neutral-500 mt-6 max-w-lg text-[15px] leading-relaxed">
            65+ Canadian legal agreements. Pick one, answer a few questions, get your draft in minutes.
          </p>

          {/* 3-step process indicator */}
          <div className="mt-8 flex items-center gap-3">
            {[
              { num: "1", label: "Pick agreement" },
              { num: "2", label: "Answer questions" },
              { num: "3", label: "Get your draft" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#be123c]/10 text-[#be123c] text-[11px] font-bold">{s.num}</span>
                  <span className="text-[13px] text-neutral-500">{s.label}</span>
                </div>
                {i < 2 && (
                  <svg className="h-3 w-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-6 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or tag..."
              className="w-full pl-11 pr-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#be123c] focus:ring-1 focus:ring-[#be123c] transition-colors duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="px-6 mb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-x-1 gap-y-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative px-4 py-2.5 rounded-lg text-[13px] tracking-wide transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                  }`}
                >
                  {cat.label}
                  {cat.id !== "all" && (
                    <span className={`block text-[10px] tracking-normal mt-0.5 ${isActive ? "text-neutral-400" : "text-neutral-400"}`}>
                      {cat.subtitle}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agreement grid */}
      <div className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Result count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[13px] text-neutral-400">
              {filtered.length} agreement{filtered.length !== 1 ? "s" : ""}
              {searchQuery.trim() ? ` matching "${searchQuery.trim()}"` : ""}
            </p>
          </div>
          {filtered.length === 0 && (
            <p className="text-neutral-400 text-[14px] text-center py-12">
              No agreements match your search. Try a different term or browse by category above.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => {
              const complexityColor = COMPLEXITY_COLORS[a.complexity];
              const categoryColors = CATEGORY_BADGE_COLORS[a.category];
              return (
                <Link
                  key={a.id}
                  href={`/tiers?agreement=${a.id}`}
                  className="group relative text-left p-8 rounded-xl border border-neutral-100 bg-white hover:border-[#be123c]/30 hover:shadow-lg transition-all duration-300 flex flex-col min-w-0 overflow-visible cursor-pointer no-underline block"
                >
                  {/* Arrow indicator */}
                  <div className="absolute top-7 right-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="h-4 w-4 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Category label + complexity badge */}
                  <div className="flex items-center gap-2 flex-wrap pr-8">
                    <span className={`inline-block text-[10px] font-medium uppercase tracking-[0.15em] px-2 py-0.5 rounded ${categoryColors.bg} ${categoryColors.text}`}>
                      {CATEGORIES.find((c) => c.id === a.category)?.label || a.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-neutral-600 uppercase tracking-[0.15em]">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${complexityColor}`} />
                      {COMPLEXITY_LABELS[a.complexity]}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 font-serif text-[18px] text-neutral-900 pr-8 leading-snug group-hover:text-[#be123c] transition-colors duration-200">
                    {a.title}
                  </h3>

                  {/* Full description */}
                  <p className="mt-3 text-[13px] text-neutral-500 leading-relaxed break-words">
                    {a.description}
                  </p>

                  {/* Typical use case */}
                  <p className="mt-3 text-[12px] text-neutral-400 leading-relaxed break-words">
                    <span className="font-medium text-neutral-500">Typical use:</span>{" "}
                    {a.typicalUseCase}
                  </p>

                  {/* Case reference */}
                  <p className="mt-2 text-[11px] text-neutral-400 italic">
                    {a.caseRef}
                  </p>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {a.tags.slice(0, 6).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500"
                      >
                        {tag}
                      </span>
                    ))}
                    {a.tags.length > 6 && (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-neutral-50 text-neutral-400">
                        +{a.tags.length - 6}
                      </span>
                    )}
                  </div>

                  {/* Spacer to push footer to bottom */}
                  <div className="flex-1" />

                  {/* Price footer */}
                  <div className="mt-6 pt-5 border-t border-neutral-100">
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[15px] font-medium text-neutral-900">
                          ${a.price}
                          <span className="text-[11px] text-neutral-400 ml-1 tracking-wide font-normal">
                            CAD
                          </span>
                        </span>
                        <span className="text-[11px] text-neutral-400 tracking-wide">
                          Base Draft
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                        <span className="text-[14px] text-neutral-600">
                          ${a.counselPrice}
                          <span className="text-[11px] text-neutral-400 ml-1 tracking-wide">
                            CAD
                          </span>
                        </span>
                        <span className="text-[11px] text-neutral-400 tracking-wide">
                          + Lawyer Review
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
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
