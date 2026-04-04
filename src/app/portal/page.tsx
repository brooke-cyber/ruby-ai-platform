"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ───
type DocStatus = "drafting" | "ready" | "in-review" | "approved" | "signed";
type MessageType = "update" | "question" | "document" | "approval";

interface PortalDocument {
  id: string;
  title: string;
  status: DocStatus;
  createdAt: string;
  updatedAt: string;
  tier: string;
  assignedLawyer?: string;
  province?: string;
}

interface Message {
  id: string;
  type: MessageType;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  read: boolean;
  documentId?: string;
}

// ─── Demo Data (replaced by real data when backend is connected) ───
const DEMO_DOCUMENTS: PortalDocument[] = [
  { id: "doc-1", title: "Shareholder Agreement — 2-Party", status: "in-review", createdAt: "2026-03-28", updatedAt: "2026-04-02", tier: "counsel", assignedLawyer: "Sarah Chen", province: "Ontario" },
  { id: "doc-2", title: "Standard Employment Agreement", status: "approved", createdAt: "2026-03-25", updatedAt: "2026-04-01", tier: "counsel", assignedLawyer: "Sarah Chen", province: "Ontario" },
  { id: "doc-3", title: "SAFE Agreement", status: "ready", createdAt: "2026-04-01", updatedAt: "2026-04-01", tier: "self-serve" },
  { id: "doc-4", title: "Privacy Policy (CASL Compliant)", status: "signed", createdAt: "2026-03-15", updatedAt: "2026-03-20", tier: "self-serve" },
  { id: "doc-5", title: "Influencer / Creator Agreement", status: "drafting", createdAt: "2026-04-03", updatedAt: "2026-04-03", tier: "counsel", assignedLawyer: "Marc Dubois", province: "Quebec" },
];

const DEMO_MESSAGES: Message[] = [
  { id: "msg-1", type: "approval", from: "Sarah Chen, Barrister & Solicitor", subject: "Shareholder Agreement — Ready for your review", preview: "I've completed the redline markup and attached my memo. Two clauses need your input before we finalize.", timestamp: "2 hours ago", read: false, documentId: "doc-1" },
  { id: "msg-2", type: "document", from: "Ruby Law", subject: "Employment Agreement — Approved & signed off", preview: "Your Standard Employment Agreement has been reviewed, approved, and is ready for execution. Download the final version below.", timestamp: "1 day ago", read: false, documentId: "doc-2" },
  { id: "msg-3", type: "update", from: "Marc Dubois, Avocat", subject: "Influencer Agreement — Quebec compliance note", preview: "Given the Quebec audience, I'm adding French-language disclosure addendum per Charter of the French Language requirements.", timestamp: "3 hours ago", read: false, documentId: "doc-5" },
  { id: "msg-4", type: "question", from: "Sarah Chen, Barrister & Solicitor", subject: "Quick question — drag-along threshold", preview: "Your shareholders agreement has a 75% drag-along threshold. Given your cap table, would you prefer 66.67% to give minority holders slightly more protection?", timestamp: "2 days ago", read: true, documentId: "doc-1" },
  { id: "msg-5", type: "document", from: "Ruby Law", subject: "Contract Customization — Submitted for Review", preview: "Your custom modification to the Convertible Note Agreement has been submitted for lawyer review. Expected turnaround: 3-5 business days.", timestamp: "4 hours ago", read: false, documentId: "doc-6" },
  { id: "msg-6", type: "approval", from: "Sarah Chen, Barrister & Solicitor", subject: "Customization Approved — Non-Compete Modification", preview: "Your modified non-compete clause has been reviewed and approved. The updated agreement is ready for download.", timestamp: "3 days ago", read: true, documentId: "doc-7" },
];

// ─── Helpers ───
const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string }> = {
  drafting: { label: "Drafting", color: "text-amber-700", bg: "bg-amber-50" },
  ready: { label: "Ready for Review", color: "text-blue-700", bg: "bg-blue-50" },
  "in-review": { label: "Lawyer Reviewing", color: "text-violet-700", bg: "bg-violet-50" },
  approved: { label: "Approved", color: "text-emerald-700", bg: "bg-emerald-50" },
  signed: { label: "Signed & Filed", color: "text-neutral-700", bg: "bg-neutral-100" },
};

const MESSAGE_TYPE_ICON: Record<MessageType, string> = {
  update: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  question: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  document: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  approval: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
};

type Tab = "documents" | "messages" | "activity";

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<Tab>("documents");
  const [documents] = useState<PortalDocument[]>(DEMO_DOCUMENTS);
  const [messages] = useState<Message[]>(DEMO_MESSAGES);

  const unreadCount = messages.filter((m) => !m.read).length;
  const activeCount = documents.filter((d) => d.status !== "signed").length;

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-8 sm:pt-28">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-rose-700 mb-2">Client Portal</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-900">Your Agreements</h1>
              <p className="text-neutral-500 mt-2">Track your documents, communicate with your lawyer, and download signed agreements.</p>
            </div>
            <Link href="/documents" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white text-sm font-medium rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Agreement
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
              <div className="text-2xl font-bold text-neutral-900">{documents.length}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Total Documents</div>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
              <div className="text-2xl font-bold text-neutral-900">{activeCount}</div>
              <div className="text-xs text-neutral-500 mt-0.5">In Progress</div>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
              <div className="text-2xl font-bold text-rose-700">{unreadCount}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Unread Messages</div>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
              <div className="text-2xl font-bold text-emerald-600">{documents.filter((d) => d.status === "approved" || d.status === "signed").length}</div>
              <div className="text-xs text-neutral-500 mt-0.5">Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-0">
            {([
              { id: "documents" as Tab, label: "Documents", count: documents.length },
              { id: "messages" as Tab, label: "Messages", count: unreadCount || undefined },
              { id: "activity" as Tab, label: "Activity" },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-rose-700 text-rose-700"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${activeTab === tab.id ? "bg-rose-100 text-rose-700" : "bg-neutral-100 text-neutral-500"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "documents" && (
          <div className="space-y-3">
            {documents.map((doc) => {
              const status = STATUS_CONFIG[doc.status];
              return (
                <div key={doc.id} className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="font-serif text-base font-semibold text-neutral-900 group-hover:text-rose-700 transition-colors truncate">{doc.title}</h3>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status.color} ${status.bg} flex-shrink-0`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[12px] text-neutral-400">
                        <span>Created {doc.createdAt}</span>
                        <span>Updated {doc.updatedAt}</span>
                        <span>{doc.tier === "counsel" ? "Expert Draft + Lawyer Review" : "Expert Draft"}</span>
                        {doc.assignedLawyer && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {doc.assignedLawyer}{doc.province ? ` (${doc.province})` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(doc.status === "approved" || doc.status === "signed") && (
                        <button className="px-3 py-1.5 text-[12px] font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download
                        </button>
                      )}
                      {doc.status === "ready" && (
                        <Link href="/preview" className="px-3 py-1.5 text-[12px] font-medium text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors">
                          Review Draft
                        </Link>
                      )}
                      {doc.status === "in-review" && (
                        <button className="px-3 py-1.5 text-[12px] font-medium text-violet-700 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                          Message Lawyer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`bg-white border rounded-xl p-5 transition-all cursor-pointer hover:border-neutral-300 ${msg.read ? "border-neutral-200" : "border-rose-200 bg-rose-50/30"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${msg.read ? "bg-neutral-100" : "bg-rose-100"}`}>
                    <svg className={`w-4 h-4 ${msg.read ? "text-neutral-500" : "text-rose-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={MESSAGE_TYPE_ICON[msg.type]} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className={`text-sm truncate ${msg.read ? "text-neutral-700" : "text-neutral-900 font-semibold"}`}>{msg.subject}</p>
                      <span className="text-[11px] text-neutral-400 flex-shrink-0">{msg.timestamp}</span>
                    </div>
                    <p className="text-[12px] text-neutral-500 mb-1">{msg.from}</p>
                    <p className="text-[13px] text-neutral-500 line-clamp-2">{msg.preview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="space-y-6">
              {[
                { time: "Today, 2:15 PM", action: "Memo & redline uploaded", doc: "Shareholder Agreement", who: "Sarah Chen" },
                { time: "Today, 11:30 AM", action: "Draft generation started", doc: "Influencer / Creator Agreement", who: "System" },
                { time: "Yesterday, 4:00 PM", action: "Agreement approved", doc: "Standard Employment Agreement", who: "Sarah Chen" },
                { time: "Apr 1, 10:00 AM", action: "Draft generated", doc: "SAFE Agreement", who: "System" },
                { time: "Mar 28, 3:30 PM", action: "Counsel review requested", doc: "Shareholder Agreement", who: "You" },
                { time: "Mar 20, 11:00 AM", action: "Signed and filed", doc: "Privacy Policy", who: "You" },
                { time: "Mar 15, 9:00 AM", action: "Draft generated", doc: "Privacy Policy", who: "System" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${i === 0 ? "bg-rose-700" : "bg-neutral-300"}`} />
                    {i < 6 && <div className="w-px flex-1 bg-neutral-200 mt-1" />}
                  </div>
                  <div className="pb-6">
                    <p className="text-[11px] text-neutral-400 mb-0.5">{item.time}</p>
                    <p className="text-sm text-neutral-900"><span className="font-medium">{item.action}</span> — {item.doc}</p>
                    <p className="text-[12px] text-neutral-400">by {item.who}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
