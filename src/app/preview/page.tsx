"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AGREEMENTS, calculatePricing } from "@/data/agreements";

function renderLegalText(text: string) {
  // Convert markdown to premium legal document HTML
  const html = text
    // Headings: # H1 (Agreement Title), ## H2 (Articles), ### H3 (Sub-sections)
    .replace(/^### (.+)$/gm, '<h3 class="text-[13px] font-bold text-neutral-900 mt-8 mb-3 font-sans tracking-[0.05em] uppercase border-b border-neutral-100 pb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-[15px] font-bold text-neutral-900 mt-12 mb-4 font-sans tracking-[0.08em] uppercase border-b-2 border-neutral-900 pb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-[22px] font-bold text-neutral-900 mt-10 mb-2 font-sans tracking-[0.15em] uppercase text-center leading-tight">$1</h1>')
    // Horizontal rules — elegant thin line
    .replace(/^---$/gm, '<hr class="my-10 border-t border-neutral-300 mx-16" />')
    // Bold defined terms with quotes
    .replace(/\*\*"([^"]+)"\*\*/g, '<strong class="font-semibold">"$1"</strong>')
    // Bold text
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Blank fill-in lines
    .replace(/________________/g, '<span class="inline-block w-52 border-b-2 border-neutral-400 align-bottom mx-1">&nbsp;</span>');
  return (
    <div className="legal-document" dangerouslySetInnerHTML={{ __html: html }} />
  );
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
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${items.map((i) => i.title).join(" + ") || "agreement"}-draft.txt`;
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
                    { step: "1", title: "Draft Review", desc: "A licensed Canadian lawyer reviews your AI-generated draft for legal accuracy, enforceability, and compliance.", time: "Within 24 hours" },
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
                <div className="px-16 py-14 bg-white" style={{ fontFamily: "'Cormorant Garamond', 'Georgia', 'Times New Roman', serif", fontSize: '14.5px', lineHeight: '2', color: '#1a1a1a', letterSpacing: '0.01em' }}>
                  {renderLegalText(draft)}
                </div>
              </div>

              {/* Customize CTA — Layer 2 */}
              <div className="border border-dashed border-neutral-300 p-6 text-center bg-neutral-50/50">
                <p className="text-sm font-medium text-neutral-900 mb-1">Customize This Contract</p>
                <p className="text-[13px] text-neutral-500 leading-relaxed max-w-md mx-auto">
                  Need something the standard options don&apos;t cover? Our AI will draft custom provisions for you, with optional lawyer review.
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
                <div className="px-16 py-14 bg-white max-h-[600px] overflow-y-auto" style={{ fontFamily: "'Cormorant Garamond', 'Georgia', 'Times New Roman', serif", fontSize: '14.5px', lineHeight: '2', color: '#1a1a1a', letterSpacing: '0.01em' }}>
                  {renderLegalText(draft)}
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
                  Need something the standard options don&apos;t cover? Our AI will draft custom provisions for you, with optional lawyer review.
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
              {isCounsel ? "Expert Draft + Lawyer Review" : "Expert Draft"} — {items.length} agreement{items.length > 1 ? "s" : ""}
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
  // Main preview — legal document
  // ───────────────────────────────────────────────
  const visibleLines = lines.slice(0, 25);
  const blurredLines = lines.slice(25, 70);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <span className="font-serif text-[15px] text-neutral-900 tracking-tight">Ruby Law</span>
          <span className="text-[12px] text-neutral-400 uppercase tracking-[0.15em]">Draft Preview</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-14">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="font-serif text-3xl text-neutral-900 tracking-tight">Your Agreement Draft</h1>
            <p className="text-neutral-500 mt-2 text-[14px]">
              {isCounsel ? "Expert Draft + Lawyer Review" : "Expert Draft"} — {items.length} agreement{items.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => router.push("/wizard")}
            className="px-5 py-2.5 border border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 text-sm font-medium transition-all"
          >
            Back to Wizard
          </button>
        </div>

        {/* Document */}
        <div className="border border-neutral-200">
          {/* Document header */}
          <div className="px-12 py-4 border-b border-neutral-200 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400 uppercase tracking-[0.12em]">Ruby Law — Draft Document</span>
            <span className="text-[11px] text-neutral-300 uppercase tracking-[0.1em]">Confidential</span>
          </div>

          {/* Visible draft — clean legal typography */}
          <div className="px-12 py-10 bg-white">
            {renderLegalText(visibleLines.join("\n"))}
          </div>

          {/* Blurred section with paywall */}
          <div className="relative">
            <div className="px-12 pb-10 bg-white blur-sm select-none pointer-events-none">
              {renderLegalText(blurredLines.join("\n") || "Additional agreement content continues below...")}
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/80 to-white flex flex-col items-center justify-center">
              <div className="bg-white border border-neutral-200 p-10 text-center max-w-md">
                <svg className="mx-auto h-6 w-6 text-neutral-400 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <h3 className="font-serif text-xl text-neutral-900">
                  {isCounsel ? "Purchase & Get Lawyer Review" : "Purchase & Download"}
                </h3>
                <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
                  {isCounsel
                    ? "Unlock the complete agreement and receive a professional review with redline markup from a licensed Canadian lawyer within 48 hours."
                    : "Unlock the complete agreement with all clauses and jurisdiction-specific provisions. Download instantly."}
                </p>
                <div className="mt-5 mb-6">
                  <span className="text-3xl font-semibold text-neutral-900">${pricing.total}</span>
                  <span className="text-sm text-neutral-400 ml-1">CAD</span>
                  {pricing.discount > 0 && (
                    <span className="ml-2 text-sm text-neutral-400 line-through">${pricing.subtotal}</span>
                  )}
                </div>
                <button
                  onClick={handlePurchase}
                  className="w-full px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium tracking-wide transition-colors"
                >
                  {isCounsel ? "Purchase with Counsel Review" : "Purchase & Download"}
                </button>
                {isCounsel && (
                  <p className="text-[11px] text-neutral-400 mt-3">
                    Includes review by a licensed Canadian lawyer within 48 hours
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Draft metadata */}
        <div className="mt-8 border border-neutral-200 p-6">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Agreements</p>
              <p className="text-sm text-neutral-900">{items.map((i) => i.title).join(", ")}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Service Tier</p>
              <p className="text-sm text-neutral-900">{isCounsel ? "Expert Draft + Lawyer Review" : "Expert Draft"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Draft Length</p>
              <p className="text-sm text-neutral-900">{lines.length} lines</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-400 mb-1">Preview</p>
              <p className="text-sm text-neutral-900">{visibleLines.length} of {lines.length} lines visible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
