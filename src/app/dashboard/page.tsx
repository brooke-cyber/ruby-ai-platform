"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUEUE_ITEMS, STATUS_COLORS, type QueueStatus } from "@/data/queue";
import { type Category } from "@/data/agreements";

const CATEGORY_FILTERS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "employment", label: "Employment" },
  { id: "corporate", label: "Corporate" },
  { id: "investment", label: "Investment" },
  { id: "commercial", label: "Commercial" },
];

const STATUS_FILTERS: { id: QueueStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "review", label: "In Review" },
  { id: "approved", label: "Approved" },
  { id: "flagged", label: "Flagged" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [statusFilter, setStatusFilter] = useState<QueueStatus | "all">("all");

  useEffect(() => {
    const hasCookie = document.cookie.includes("ruby-auth=");
    if (!hasCookie) {
      router.replace("/login");
    } else {
      setAuthed(true);
    }
  }, [router]);

  if (!authed) return null;

  const filtered = QUEUE_ITEMS.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: QUEUE_ITEMS.length,
    pending: QUEUE_ITEMS.filter((i) => i.status === "pending").length,
    review: QUEUE_ITEMS.filter((i) => i.status === "review").length,
    flagged: QUEUE_ITEMS.filter((i) => i.status === "flagged").length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-blue-400 mb-3">Dashboard</p>
            <h1 className="text-4xl font-bold text-white">Review Queue</h1>
            <p className="text-gray-400 mt-2 text-sm">Counsel tier agreements awaiting review</p>
          </div>
          <button
            onClick={() => { document.cookie = "ruby-auth=; max-age=0; path=/"; router.replace("/login"); }}
            className="text-[13px] text-gray-500 hover:text-white transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Matters", value: stats.total, color: "text-white" },
            { label: "Pending", value: stats.pending, color: "text-amber-400" },
            { label: "In Review", value: stats.review, color: "text-blue-400" },
            { label: "Flagged", value: stats.flagged, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900 border border-gray-800 rounded-lg p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-5 mb-8">
          <div className="flex gap-1.5">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-full px-4 py-2 text-[12px] font-medium transition-all duration-200 ${
                  categoryFilter === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-900 text-gray-400 border border-gray-700 hover:border-gray-500"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="h-5 w-px bg-gray-800" />
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`rounded-full px-4 py-2 text-[12px] font-medium transition-all duration-200 ${
                  statusFilter === s.id
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-900 text-gray-400 border border-gray-700 hover:border-gray-500"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Queue table */}
        <div className="bg-zinc-900 border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.1em] text-gray-500 px-6 py-4">Matter</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.1em] text-gray-500 px-6 py-4">Client</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.1em] text-gray-500 px-6 py-4">Category</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.1em] text-gray-500 px-6 py-4">Type</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.1em] text-gray-500 px-6 py-4">Status</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-[0.1em] text-gray-500 px-6 py-4">Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const statusColor = STATUS_COLORS[item.status];
                return (
                  <tr key={item.matter} className="border-b border-gray-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-mono font-medium text-white">{item.matter}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-gray-300">{item.client}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-500">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-gray-400">{item.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-medium ${statusColor.bg} ${statusColor.text}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-gray-500">{item.due}</span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500">
                    No matters match the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-[12px] text-gray-500 mt-4 text-right">
          {filtered.length} of {QUEUE_ITEMS.length} matters
        </p>
      </div>
    </div>
  );
}
