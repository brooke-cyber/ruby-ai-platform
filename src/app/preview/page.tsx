"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AGREEMENTS, calculatePricing } from "@/data/agreements";

function renderLegalText(text: string) {
  // Phase 1: Pre-process lines
  const rawLines = text.split('\n');
  const out: string[] = [];
  let blanks = 0;

  for (const raw of rawLines) {
    const t = raw.trim();
    if (!t) { blanks++; if (blanks <= 1) out.push(''); continue; }
    blanks = 0;
    // Strip dash/asterisk bullets — convert to indented text
    const bm = t.match(/^[-*]\s+(.+)$/);
    if (bm) { out.push(`<p style="padding-left:1.5em;margin:2px 0">${bm[1]}</p>`); continue; }
    out.push(raw);
  }

  // Phase 2: Regex transforms — ORDER MATTERS
  let html = out.join('\n');

  // Strip "## WHEREAS" or "## RECITALS" headings — just remove the ## prefix
  html = html.replace(/^##\s+(WHEREAS|RECITALS)\s*$/gm, '<p style="font-weight:700;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;margin:16px 0 6px">$1</p>');

  html = html
    // WHEREAS recitals (inline text starting with WHEREAS)
    .replace(/^(WHEREAS[,:]?\s+.+)$/gm, '<p style="padding-left:1.5em;margin:3px 0;font-style:italic">$1</p>')
    // NOW THEREFORE
    .replace(/^(NOW THEREFORE.+)$/gm, '<p style="font-weight:600;margin:12px 0 16px">$1</p>')
    // IN WITNESS WHEREOF
    .replace(/^(IN WITNESS WHEREOF.+)$/gm, '<div style="margin-top:24px;padding-top:12px;border-top:2px solid #1a1a1a"><p style="font-weight:600">$1</p></div>')
    // BETWEEN / AND
    .replace(/^(BETWEEN:)$/gm, '<p style="font-weight:700;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;margin:12px 0 2px">$1</p>')
    .replace(/^(AND:)$/gm, '<p style="font-weight:700;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;margin:8px 0 2px">$1</p>')
    // DATED
    .replace(/^(DATED as of.+)$/gm, '<p style="text-align:center;margin:8px 0 16px;color:#525252">$1</p>')
    // Headings (#### → ### → ## → #)
    .replace(/^#### (.+)$/gm, '<h4 style="font-size:13px;font-weight:600;margin:10px 0 3px">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13.5px;font-weight:700;margin:14px 0 4px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;margin:20px 0 6px;padding-bottom:4px;border-bottom:1px solid #262626">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;text-align:center;margin:8px 0 8px;padding-bottom:10px;border-bottom:1px solid #d4d4d4">$1</h1>')
    // SCHEDULE headers
    .replace(/^(SCHEDULE [A-Z](?:\s*[—–-]\s*.+)?)$/gm, '<h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;text-align:center;margin:28px 0 10px;padding-top:14px;border-top:2px solid #262626">$1</h2>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr style="margin:14px 0;border:none;border-top:1px solid #d4d4d4" />')
    // Signature lines
    .replace(/^(Per:\s*)________________/gm, '<div style="margin:16px 0 4px"><span style="font-size:13px;color:#525252">Per:</span> <span style="display:inline-block;width:14em;border-bottom:1px solid #a3a3a3;margin-left:4px">&nbsp;</span></div>')
    .replace(/^(Name:\s*)(.*)/gm, '<div style="margin:1px 0"><span style="font-size:13px;color:#737373">Name:</span> <span style="font-size:13px">$2</span></div>')
    .replace(/^(Title:\s*)(.*)/gm, '<div style="margin:1px 0"><span style="font-size:13px;color:#737373">Title:</span> <span style="font-size:13px">$2</span></div>')
    .replace(/^(Date:\s*)(.*)/gm, '<div style="margin:1px 0 8px"><span style="font-size:13px;color:#737373">Date:</span> <span style="font-size:13px">$2</span></div>')
    // Authority binding
    .replace(/^(I have authority to bind.+)$/gm, '<p style="font-size:11px;color:#a3a3a3;font-style:italic;margin:2px 0 14px">$1</p>')
    // Bold defined terms
    .replace(/\*\*"([^"]+)"\*\*/g, '<strong>\u201c$1\u201d</strong>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/(?<!=)\*([^*<]+)\*/g, '<em>$1</em>')
    // Lettered (a), (b), (c)
    .replace(/^\(([a-z])\)\s+(.+)$/gm, '<div style="display:flex;gap:6px;padding-left:1.2em;margin:2px 0"><span style="color:#737373;flex-shrink:0">($1)</span><span>$2</span></div>')
    // Roman (i), (ii), (iii)
    .replace(/^\((i{1,3}|iv|v|vi{0,3}|ix|x)\)\s+(.+)$/gm, '<div style="display:flex;gap:6px;padding-left:2.4em;margin:2px 0"><span style="color:#737373;flex-shrink:0">($1)</span><span>$2</span></div>')
    // Blank lines
    .replace(/________________/g, '<span style="display:inline-block;width:11em;border-bottom:1px solid #a3a3a3;vertical-align:bottom;margin:0 2px">&nbsp;</span>')
    // NOTICE
    .replace(/^\*\*NOTICE\*\*:\s*(.+)/gm, '<div style="margin-top:20px;padding:12px;border:1px solid #fbbf24;background:#fffbeb;font-size:12px;color:#92400e;line-height:1.5"><strong>NOTICE:</strong> $1</div>');

  // Phase 3: Wrap plain text
  const wrapped = html.split('\n').map(line => {
    const t = line.trim();
    if (!t) return '<div style="height:4px"></div>';
    if (t.startsWith('<')) return t;
    return `<p style="margin:2px 0">${t}</p>`;
  }).join('\n');

  return <div className="legal-document overflow-hidden" dangerouslySetInnerHTML={{ __html: wrapped }} />;
}

export default function PreviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<string>("");
  const [tier, setTier] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedDraft = sessionStorage.getItem("ruby-draft");
    const storedTier = sessionStorage.getItem("ruby-tier");
    const storedSelected = sessionStorage.getItem("ruby-selected");
    if (storedDraft) setDraft(storedDraft);
    if (storedTier) setTier(storedTier);
    if (storedSelected) setSelected(JSON.parse(storedSelected));
  }, []);

  const items = AGREEMENTS.filter((a) => selected.includes(a.id));
  const pricing = calculatePricing(selected, tier === "counsel" ? "counsel" : "self-serve");
  const lines = draft.split("\n");
  const isCounsel = tier === "counsel";

  if (!draft) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-8 py-32 text-center">
          <h1 className="font-serif text-3xl text-neutral-900 tracking-tight">No Draft Generated</h1>
          <p className="text-neutral-500 mt-4 text-[15px] leading-relaxed">
            Complete the wizard to generate your agreement draft.
          </p>
          <button
            onClick={() => router.push("/documents")}
            className="mt-10 px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium tracking-wide transition-colors"
          >
            Browse Agreements
          </button>
        </div>
      </div>
    );
  }

  function handleDownload() {
    // Clean markdown formatting for plain text download
    const cleanText = draft
      .replace(/^#{1,4}\s+/gm, '')  // Remove markdown headings
      .replace(/\*\*"([^"]+)"\*\*/g, '"$1"')  // Clean bold defined terms
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Clean bold
      .replace(/^---$/gm, '————————————————————————————————————————')  // Section dividers
      .replace(/________________/g, '________________');

    const filename = items.map((i) => i.title).join(" + ") || "Agreement";
    const header = `${"=".repeat(60)}\n${filename.toUpperCase()}\nGenerated by Ruby Law — rubylaw.ca\nDate: ${new Date().toLocaleDateString("en-CA")}\n${"=".repeat(60)}\n\n`;

    const disclaimer = !isCounsel ? `\n\n${"_".repeat(60)}\n\nNOTICE: This document was prepared using Ruby Law's Base Draft\ntechnology. It has not been reviewed by a licensed lawyer and does\nnot constitute legal advice or a legal opinion. No lawyer-client\nrelationship is created by the generation or use of this document.\nThe Law Society of Ontario requires this disclosure pursuant to\nits rules governing the unauthorized practice of law. You are\nstrongly encouraged to obtain independent legal advice before\nexecuting this agreement.\n` : '';

    const blob = new Blob([header + cleanText + disclaimer], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename} - Ruby Law Draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePurchase() {
    setShowPayment(true);
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPaymentProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));

    // Send agreement to email after payment
    if (email && draft) {
      try {
        await fetch("/api/send-agreement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            draft,
            agreements: items.map((i) => i.title),
            tier,
          }),
        });
      } catch (err) {
        console.error("Failed to send agreement email:", err);
      }
    }

    setPaymentProcessing(false);
    setPaymentComplete(true);
  }

  // ───────────────────────────────────────────────
  // Post-payment confirmation
  // ───────────────────────────────────────────────
  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-white">
        {/* Top bar */}
        <header className="border-b border-neutral-200">
          <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
            <span className="font-serif text-[15px] text-neutral-900 tracking-tight">Ruby Law</span>
            <span className="text-[12px] text-neutral-400 uppercase tracking-[0.15em]">Order Confirmed</span>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-8 py-16">
          {/* Success */}
          <div className="mb-14 text-center">
            <div className="mx-auto h-12 w-12 rounded-full border-2 border-neutral-900 flex items-center justify-center mb-6">
              <svg className="h-5 w-5 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl text-neutral-900 tracking-tight">
              {isCounsel ? "Order Confirmed" : "Your Agreement is Ready"}
            </h1>
            <p className="text-neutral-500 mt-4 text-[15px] leading-relaxed max-w-lg mx-auto">
              {isCounsel
                ? "Your draft has been submitted for legal review and sent to your email. A licensed Canadian lawyer will review your agreement and deliver a formal approval or specific advice to change, along with redline markup and an enforceability opinion within 48 hours."
                : "Your complete agreement draft has been sent to your email and is ready to download. Review all blank fields and fill in your specific details before execution."}
            </p>
          </div>

          {isCounsel ? (
            <div className="space-y-8">
              {/* Steps */}
              <div className="border border-neutral-200 p-8">
                <h2 className="font-serif text-lg text-neutral-900 mb-8">What Happens Next</h2>
                <div className="space-y-6">
                  {[
                    { step: "1", title: "Draft Review", desc: "A licensed Canadian lawyer reviews your Base Draft for legal accuracy, enforceability, and compliance.", time: "Within 24 hours" },
                    { step: "2", title: "Approval or Advice to Change", desc: "You will receive a formal approval to proceed or specific, actionable advice on what to change before signing.", time: "Within 36 hours" },
                    { step: "3", title: "Redline Markup & Opinion", desc: "A marked-up version with annotations, negotiation notes, and a brief enforceability opinion for your jurisdiction.", time: "Within 48 hours" },
                    { step: "4", title: "Direct Communication", desc: "A direct channel will be opened for any questions or follow-up amendments.", time: "Ongoing" },
                  ].map((item, idx) => (
                    <div key={item.step} className="flex gap-5">
                      <div className="relative flex flex-col items-center">
                        <div className="h-7 w-7 rounded-full border border-neutral-300 flex items-center justify-center shrink-0 text-[12px] font-medium text-neutral-600">
                          {item.step}
                        </div>
                        {idx < 3 && <div className="w-px flex-1 bg-neutral-200 mt-1" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                          <span className="text-[11px] text-neutral-400 ml-4">{item.time}</span>
                        </div>
                        <p className="text-[13px] text-neutral-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation email */}
              <div className="border border-neutral-200 p-6">
                <p className="text-[12px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Confirmation sent to</p>
                <p className="text-neutral-900 text-sm">{email}</p>
              </div>

              {/* Draft preview */}
              <div className="border border-neutral-200">
                <div className="px-8 py-4 border-b border-neutral-200 flex items-center justify-between">
                  <p className="text-[12px] uppercase tracking-[0.12em] text-neutral-400">Draft Preview (under review)</p>
                  <button
                    onClick={handleDownload}
                    className="text-[13px] text-neutral-900 hover:text-[#be123c] font-medium transition-colors"
                  >
                    Download Draft
                  </button>
                </div>
                <div className="px-5 sm:px-8 md:px-12 py-8 bg-white max-h-[60vh] overflow-y-auto" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '14px', lineHeight: '1.65', color: '#1a1a1a' }}>
                  {renderLegalText(draft)}
                </div>
              </div>

              {/* Customize CTA — Layer 2 */}
              <div className="border border-dashed border-neutral-300 p-6 text-center bg-neutral-50/50">
                <p className="text-sm font-medium text-neutral-900 mb-1">Customize This Contract</p>
                <p className="text-[13px] text-neutral-500 leading-relaxed max-w-md mx-auto">
                  Need something the standard options don&apos;t cover? Ruby will draft custom provisions for you, with optional lawyer review.
                </p>
                <button
                  onClick={() => router.push("/customize")}
                  className="mt-4 px-6 py-2.5 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white text-sm font-medium transition-all"
                >
                  Customize This Contract
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Confirmation email */}
              <div className="border border-neutral-200 p-6">
                <p className="text-[12px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Agreement sent to</p>
                <p className="text-neutral-900 text-sm">{email}</p>
              </div>

              {/* Download card */}
              <div className="border border-neutral-200 p-10 text-center">
                <h2 className="font-serif text-lg text-neutral-900 mb-2">Download Your Agreement</h2>
                <p className="text-[14px] text-neutral-500 mb-8 max-w-md mx-auto leading-relaxed">
                  Review all blank fields, fill in your specific values, and have all parties execute.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-10 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium tracking-wide transition-colors"
                >
                  Download Agreement (.txt)
                </button>
              </div>

              {/* Full draft */}
              <div className="border border-neutral-200">
                <div className="px-8 py-4 border-b border-neutral-200">
                  <p className="text-[12px] uppercase tracking-[0.12em] text-neutral-400">Complete Agreement</p>
                </div>
                <div className="px-5 sm:px-8 md:px-12 py-8 bg-white max-h-[60vh] overflow-y-auto" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '14px', lineHeight: '1.65', color: '#1a1a1a' }}>
                  {renderLegalText(draft)}
                  <div className="mt-10 pt-6 border-t border-neutral-300">
                    <p style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: '10.5px', lineHeight: '1.6', color: '#78716c', letterSpacing: '0.01em' }}>
                      This document was generated by Ruby Law&apos;s Base Draft engine and has not been reviewed by a licensed lawyer. It does not constitute legal advice, a legal opinion, or a lawyer-client relationship. For binding legal advice, consult a licensed lawyer before signing.
                    </p>
                  </div>
                </div>
              </div>

              {/* LSO Disclaimer — Base Draft (non-counsel-review) */}
              <div className="border border-amber-300 bg-amber-50/60 p-5">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[13px] text-amber-900 leading-relaxed">
                    <span className="font-semibold">IMPORTANT NOTICE</span> — This document was generated by Ruby Law&apos;s Base Draft engine and has not been reviewed by a licensed lawyer. It does not constitute legal advice, a legal opinion, or a lawyer-client relationship. The Law Society of Ontario requires this disclosure for documents not reviewed by licensed counsel. For binding legal advice, upgrade to Counsel Review or consult an independent lawyer before signing.
                  </p>
                </div>
              </div>

              {/* Counsel upsell */}
              <div className="border border-neutral-200 p-6 flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Want a lawyer to review this?</p>
                  <p className="text-[13px] text-neutral-500 mt-1">
                    Redline markup, enforceability opinion, and direct communication with a licensed Canadian lawyer
                  </p>
                </div>
                <button
                  onClick={() => router.push("/documents")}
                  className="px-5 py-2.5 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white text-sm font-medium transition-all shrink-0"
                >
                  Upgrade to Counsel
                </button>
              </div>

              {/* Customize CTA — Layer 2 */}
              <div className="border border-dashed border-neutral-300 p-6 text-center bg-neutral-50/50">
                <p className="text-sm font-medium text-neutral-900 mb-1">Customize This Contract</p>
                <p className="text-[13px] text-neutral-500 leading-relaxed max-w-md mx-auto">
                  Need something the standard options don&apos;t cover? Ruby will draft custom provisions for you, with optional lawyer review.
                </p>
                <button
                  onClick={() => router.push("/customize")}
                  className="mt-4 px-6 py-2.5 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white text-sm font-medium transition-all"
                >
                  Customize This Contract
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────
  // Payment form
  // ───────────────────────────────────────────────
  if (showPayment) {
    return (
      <div className="min-h-screen bg-white">
        {/* Top bar */}
        <header className="border-b border-neutral-200">
          <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
            <span className="font-serif text-[15px] text-neutral-900 tracking-tight">Ruby Law</span>
            <span className="text-[12px] text-neutral-400 uppercase tracking-[0.15em]">Payment</span>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-8 py-16">
          <button
            onClick={() => setShowPayment(false)}
            className="text-neutral-400 hover:text-neutral-900 text-sm mb-10 flex items-center gap-2 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to preview
          </button>

          <div className="border border-neutral-200 p-8">
            <h2 className="font-serif text-2xl text-neutral-900 mb-1">Complete Your Order</h2>
            <p className="text-neutral-500 text-sm mb-8">
              {isCounsel ? "Base Draft + Lawyer Review" : "Base Draft"} — {items.length} agreement{items.length > 1 ? "s" : ""}
            </p>

            {/* Order summary */}
            <div className="border border-neutral-200 p-5 mb-8">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-500">{item.title}</span>
                    <span className="text-neutral-900 font-medium">${isCounsel ? item.counselPrice : item.price}</span>
                  </div>
                ))}
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-sm pt-3 border-t border-neutral-200">
                    <span className="text-[#be123c]">Bundle discount ({pricing.discount * 100}%)</span>
                    <span className="text-[#be123c]">-${pricing.subtotal - pricing.total}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-neutral-200">
                  <span className="text-neutral-900 font-medium">Total</span>
                  <span className="text-neutral-900 font-semibold text-lg">${pricing.total} CAD</span>
                </div>
              </div>
            </div>

            {/* Payment form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              <label className="block">
                <span className="text-[13px] font-medium text-neutral-700">Email address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="mt-1.5 block w-full border border-neutral-300 bg-white rounded px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none transition-all"
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-neutral-700">Cardholder name</span>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="mt-1.5 block w-full border border-neutral-300 bg-white rounded px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none transition-all"
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-neutral-700">Card number</span>
                <input
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="mt-1.5 block w-full border border-neutral-300 bg-white rounded px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none transition-all font-mono"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[13px] font-medium text-neutral-700">Expiry</span>
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    maxLength={7}
                    className="mt-1.5 block w-full border border-neutral-300 bg-white rounded px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none transition-all font-mono"
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] font-medium text-neutral-700">CVC</span>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    maxLength={4}
                    className="mt-1.5 block w-full border border-neutral-300 bg-white rounded px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 outline-none transition-all font-mono"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={paymentProcessing}
                className="w-full mt-4 px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium tracking-wide transition-colors"
              >
                {paymentProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay $${pricing.total} CAD`
                )}
              </button>

              <p className="text-[11px] text-neutral-400 text-center mt-3">
                Secure payment processed by Stripe. Your card information is encrypted and never stored on our servers.
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────
  // Main preview — payment gate then full document
  // ───────────────────────────────────────────────
  const hasPaid = paymentComplete;
  const previewLines = lines.slice(0, 12).join("\n"); // Teaser: first ~12 lines

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <span className="font-serif text-[15px] text-neutral-900 tracking-tight">Ruby Law</span>
          <span className="text-[12px] text-neutral-400 uppercase tracking-[0.15em]">{hasPaid ? "Your Agreement" : "Preview & Purchase"}</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 tracking-tight">
              {hasPaid ? "Your Agreement Draft" : "Your Draft is Ready"}
            </h1>
            <p className="text-neutral-500 mt-2 text-[14px]">
              {isCounsel ? "Base Draft + Lawyer Review" : "Base Draft"} — {items.length} agreement{items.length > 1 ? "s" : ""}
            </p>
          </div>
          {hasPaid && (
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/wizard")}
                className="px-4 sm:px-5 py-2.5 border border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 text-sm font-medium transition-all"
              >
                Back to Wizard
              </button>
              <button
                onClick={handleDownload}
                className="px-4 sm:px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium tracking-wide transition-colors"
              >
                Download Draft
              </button>
            </div>
          )}
        </div>

        {/* ── PAYMENT GATE: Show teaser + purchase CTA when not paid ── */}
        {!hasPaid && (
          <>
            {/* Teaser preview — first few lines visible, rest blurred */}
            <div className="border border-neutral-200 relative">
              <div className="px-12 py-4 border-b border-neutral-200 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 uppercase tracking-[0.12em]">Ruby Law — Draft Preview</span>
                <span className="text-[11px] text-emerald-600 uppercase tracking-[0.1em] font-medium">Generated Successfully</span>
              </div>
              <div className="px-5 sm:px-8 md:px-12 py-8 bg-white" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '14px', lineHeight: '1.65', color: '#1a1a1a' }}>
                {renderLegalText(previewLines)}
              </div>
              {/* Blur overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-6">
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Complete purchase to view full agreement
                </div>
              </div>
            </div>

            {/* Order summary + purchase */}
            <div className="mt-8 border border-neutral-200 p-8">
              <h2 className="font-serif text-xl text-neutral-900 mb-1">Complete Your Purchase</h2>
              <p className="text-neutral-500 text-[14px] mb-6">Your {items.length} agreement{items.length > 1 ? "s have" : " has"} been generated and {items.length > 1 ? "are" : "is"} ready to download.</p>

              {/* Line items */}
              <div className="border border-neutral-100 rounded-lg p-5 mb-6 bg-neutral-50/50">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-neutral-600">{item.title}</span>
                      <span className="text-neutral-900 font-medium">${isCounsel ? item.counselPrice : item.price} CAD</span>
                    </div>
                  ))}
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-sm pt-3 border-t border-neutral-200">
                      <span className="text-[#be123c]">Bundle discount ({pricing.discount * 100}%)</span>
                      <span className="text-[#be123c] font-medium">-${pricing.subtotal - pricing.total} CAD</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-neutral-200">
                    <span className="text-neutral-900 font-semibold">Total</span>
                    <span className="text-neutral-900 font-bold text-lg">${pricing.total} CAD</span>
                  </div>
                </div>
              </div>

              {/* Two CTAs: Pay or Demo Skip */}
              <div className="space-y-3">
                <button
                  onClick={handlePurchase}
                  className="w-full py-3.5 bg-[#be123c] hover:bg-[#9f1239] text-white text-sm font-semibold tracking-wide transition-colors rounded-lg shadow-lg shadow-[#be123c]/20"
                >
                  Purchase & View Full Agreement — ${pricing.total} CAD
                </button>
                <button
                  onClick={() => setPaymentComplete(true)}
                  className="w-full py-3 border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 text-sm font-medium transition-all rounded-lg"
                >
                  Demo Mode — Skip Payment
                </button>
                <p className="text-[11px] text-neutral-400 text-center">Secure payment processed by Stripe. Demo mode lets you preview the full draft without payment.</p>
              </div>
            </div>

            {/* What's included */}
            <div className="mt-6 border border-neutral-200 p-6">
              <p className="text-[12px] uppercase tracking-[0.12em] text-neutral-400 mb-4">What&apos;s Included</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Complete legal agreement draft" },
                  { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "Province-specific compliance" },
                  { icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4", label: "Instant download (.txt)" },
                  { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Copy sent to your email" },
                  ...(isCounsel ? [
                    { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Licensed lawyer review (48hr)" },
                    { icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", label: "Redline markup & opinion" },
                  ] : []),
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm text-neutral-600">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── FULL DOCUMENT: Shown only after payment ── */}
        {hasPaid && (
          <>
            {/* Document */}
            <div className="border border-neutral-200">
              <div className="px-12 py-4 border-b border-neutral-200 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 uppercase tracking-[0.12em]">Ruby Law — Draft Document</span>
                <span className="text-[11px] text-neutral-300 uppercase tracking-[0.1em]">Confidential</span>
              </div>
              <div className="px-5 sm:px-8 md:px-12 py-8 sm:py-10 bg-white max-h-[75vh] overflow-y-auto" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '14px', lineHeight: '1.65', color: '#1a1a1a' }}>
                {renderLegalText(lines.join("\n"))}
                {!isCounsel && (
                  <div className="mt-8 pt-4 border-t border-neutral-300">
                    <p style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: '10.5px', lineHeight: '1.5', color: '#78716c' }}>
                      This document was generated by Ruby Law&apos;s Base Draft engine and has not been reviewed by a licensed lawyer. It does not constitute legal advice, a legal opinion, or a lawyer-client relationship. For binding legal advice, consult a licensed lawyer before signing.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* LSO Disclaimer */}
            {!isCounsel && (
              <div className="mt-6 border border-amber-300 bg-amber-50/60 p-5">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[13px] text-amber-900 leading-relaxed">
                    <span className="font-semibold">IMPORTANT NOTICE</span> — This document was generated by Ruby Law&apos;s Base Draft engine and has not been reviewed by a licensed lawyer. It does not constitute legal advice, a legal opinion, or a lawyer-client relationship. The Law Society of Ontario requires this disclosure for documents not reviewed by licensed counsel. For binding legal advice, upgrade to Counsel Review or consult an independent lawyer before signing.
                  </p>
                </div>
              </div>
            )}

            {/* Customize CTA */}
            <div className="mt-8 border border-neutral-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-900 mb-1">Customize This Contract</p>
                <p className="text-[13px] text-neutral-500">Need changes? Ruby drafts custom provisions, with optional lawyer review.</p>
              </div>
              <button
                onClick={() => router.push("/customize")}
                className="px-5 py-2.5 bg-[#be123c] hover:bg-[#9f1239] text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                Customize This Contract
              </button>
            </div>

            {/* Draft metadata */}
            <div className="mt-4 border border-neutral-200 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Agreements</p>
                  <p className="text-sm text-neutral-900">{items.map((i) => i.title).join(", ")}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Service Tier</p>
                  <p className="text-sm text-neutral-900">{isCounsel ? "Base Draft + Lawyer Review" : "Base Draft"}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Draft Length</p>
                  <p className="text-sm text-neutral-900">{lines.length} lines</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
