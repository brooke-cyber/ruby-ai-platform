import type { Category, Complexity } from "./agreements";

export type QueueStatus = "pending" | "review" | "approved" | "flagged";

export interface QueueItem {
  matter: string;
  client: string;
  category: Category;
  type: string;
  complexity: Complexity;
  status: QueueStatus;
  due: string;
}

export const STATUS_COLORS: Record<QueueStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  review: { bg: "bg-blue-100", text: "text-blue-800" },
  approved: { bg: "bg-emerald-100", text: "text-emerald-800" },
  flagged: { bg: "bg-red-100", text: "text-red-800" },
};

export const QUEUE_ITEMS: QueueItem[] = [
  // Employment (12)
  { matter: "Ruby-2026-0401", client: "TechCo Solutions Inc.", category: "employment", type: "Executive Employment Agreement", complexity: "high", status: "pending", due: "2026-04-05" },
  { matter: "Ruby-2026-0402", client: "Maple Ventures Ltd.", category: "employment", type: "Standard Employment Agreement", complexity: "low", status: "review", due: "2026-04-04" },
  { matter: "Ruby-2026-0403", client: "Northern Data Corp.", category: "employment", type: "Fixed-Term Employment Agreement", complexity: "medium", status: "approved", due: "2026-04-03" },
  { matter: "Ruby-2026-0404", client: "Prairie Innovations Inc.", category: "employment", type: "Independent Contractor Agreement", complexity: "medium", status: "pending", due: "2026-04-06" },
  { matter: "Ruby-2026-0405", client: "West Coast AI Ltd.", category: "employment", type: "Non-Compete / Non-Solicit Agreement", complexity: "high", status: "flagged", due: "2026-04-04" },
  { matter: "Ruby-2026-0406", client: "Aurora Systems Corp.", category: "employment", type: "Confidentiality & IP Assignment", complexity: "medium", status: "review", due: "2026-04-05" },
  { matter: "Ruby-2026-0407", client: "Summit Health Inc.", category: "employment", type: "Executive Employment Agreement", complexity: "high", status: "pending", due: "2026-04-07" },
  { matter: "Ruby-2026-0408", client: "Glacier Tech Ltd.", category: "employment", type: "Standard Employment Agreement", complexity: "low", status: "approved", due: "2026-04-03" },
  { matter: "Ruby-2026-0409", client: "Harbour Digital Inc.", category: "employment", type: "Offer of Employment", complexity: "low", status: "review", due: "2026-04-05" },
  { matter: "Ruby-2026-0410", client: "Quantum Labs Corp.", category: "employment", type: "Fixed-Term Employment Agreement", complexity: "medium", status: "pending", due: "2026-04-08" },
  { matter: "Ruby-2026-0411", client: "Pacific Edge Software", category: "employment", type: "Independent Contractor Agreement", complexity: "medium", status: "approved", due: "2026-04-04" },
  { matter: "Ruby-2026-0412", client: "Boreal Consulting Group", category: "employment", type: "Non-Compete / Non-Solicit Agreement", complexity: "high", status: "flagged", due: "2026-04-06" },
  // Corporate (2)
  { matter: "Ruby-2026-0413", client: "Founders Collective Inc.", category: "corporate", type: "Two-Party Shareholder Agreement", complexity: "high", status: "pending", due: "2026-04-07" },
  { matter: "Ruby-2026-0414", client: "Atlas Ventures Corp.", category: "corporate", type: "Emerging Corporation USA", complexity: "medium", status: "review", due: "2026-04-06" },
  // Investment (2)
  { matter: "Ruby-2026-0415", client: "Seed Capital Partners", category: "investment", type: "Seed SAFE", complexity: "medium", status: "pending", due: "2026-04-08" },
  { matter: "Ruby-2026-0416", client: "Bridge Funding Inc.", category: "investment", type: "Bridge SAFE", complexity: "high", status: "flagged", due: "2026-04-05" },
  // Commercial (2)
  { matter: "Ruby-2026-0417", client: "CloudNine SaaS Ltd.", category: "commercial", type: "SaaS Service Level Agreement", complexity: "medium", status: "review", due: "2026-04-06" },
  { matter: "Ruby-2026-0418", client: "Enterprise Solutions Corp.", category: "commercial", type: "Enterprise Licensing SLA", complexity: "high", status: "pending", due: "2026-04-09" },
];
