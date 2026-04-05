/**
 * Email infrastructure for Ruby AI Platform
 *
 * Provides a pluggable email provider interface with mock, Resend, and SendGrid
 * implementations. Includes branded HTML template generation for agreement delivery.
 */

// ---------------------------------------------------------------------------
// Types & interfaces
// ---------------------------------------------------------------------------

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  send(params: SendEmailParams): Promise<SendEmailResult>;
}

// ---------------------------------------------------------------------------
// Mock provider (development)
// ---------------------------------------------------------------------------

export class MockEmailProvider implements EmailProvider {
  async send(params: SendEmailParams): Promise<SendEmailResult> {
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    console.log(`[MockEmailProvider] ──────────────────────────────────`);
    console.log(`[MockEmailProvider] To:      ${params.to}`);
    console.log(`[MockEmailProvider] Subject: ${params.subject}`);
    console.log(`[MockEmailProvider] HTML:    ${params.html.length} chars`);
    console.log(`[MockEmailProvider] Text:    ${params.text.length} chars`);
    console.log(`[MockEmailProvider] ID:      ${messageId}`);
    console.log(`[MockEmailProvider] ──────────────────────────────────`);
    return { success: true, messageId };
  }
}

// ---------------------------------------------------------------------------
// Resend provider (uses fetch — no extra dependencies)
// ---------------------------------------------------------------------------

export class ResendEmailProvider implements EmailProvider {
  private apiKey: string;
  private from: string;

  constructor(apiKey: string, from = "Ruby Law <agreements@rubylegal.ai>") {
    this.apiKey = apiKey;
    this.from = from;
  }

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return { success: false, error: `Resend API ${res.status}: ${body}` };
      }

      const data = (await res.json()) as { id?: string };
      return { success: true, messageId: data.id };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Resend request failed",
      };
    }
  }
}

// ---------------------------------------------------------------------------
// SendGrid provider (uses fetch — no extra dependencies)
// ---------------------------------------------------------------------------

export class SendGridEmailProvider implements EmailProvider {
  private apiKey: string;
  private from: string;

  constructor(apiKey: string, from = "agreements@rubylegal.ai") {
    this.apiKey = apiKey;
    this.from = from;
  }

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: params.to }] }],
          from: { email: this.from, name: "Ruby Law" },
          subject: params.subject,
          content: [
            { type: "text/plain", value: params.text },
            { type: "text/html", value: params.html },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return { success: false, error: `SendGrid API ${res.status}: ${body}` };
      }

      const messageId = res.headers.get("x-message-id") ?? undefined;
      return { success: true, messageId };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "SendGrid request failed",
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createEmailProvider(): EmailProvider {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    console.log("[email] Using Resend provider");
    return new ResendEmailProvider(resendKey);
  }

  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey) {
    console.log("[email] Using SendGrid provider");
    return new SendGridEmailProvider(sendgridKey);
  }

  console.log("[email] No API key found — using MockEmailProvider");
  return new MockEmailProvider();
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export const VALID_TIERS = ["starter", "growth", "scale", "counsel"] as const;
export type Tier = (typeof VALID_TIERS)[number];

export function isValidTier(tier: string): tier is Tier {
  return (VALID_TIERS as readonly string[]).includes(tier);
}

// ---------------------------------------------------------------------------
// Email template generation
// ---------------------------------------------------------------------------

export function generateAgreementEmail(
  draft: string,
  agreementType: string,
  clientName: string,
  tier: string
): { subject: string; html: string; text: string } {
  const tierLabel = tier === "counsel" ? "Counsel-Reviewed " : "";
  const subject = `Your ${tierLabel}${agreementType || "Agreement"} Draft — Ruby Law`;

  // Escape HTML entities in the draft text
  const escapedDraft = draft
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f8f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;line-height:1.6;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8f8f8;">
    <tr><td style="padding:24px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;">

        <!-- Header -->
        <tr><td style="background-color:#be123c;border-radius:8px 8px 0 0;padding:24px 32px;text-align:center;">
          <!-- Logo placeholder: replace src with hosted logo URL -->
          <div style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
            &#9670; Ruby Law
          </div>
          <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">AI-Powered Legal for Founders</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:#ffffff;padding:32px;border-left:1px solid #e5e5e5;border-right:1px solid #e5e5e5;">
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1a1a1a;">
            Hi${clientName ? ` ${clientName}` : ""},
          </h1>
          <p style="margin:0 0 24px;font-size:15px;color:#525252;">
            Your <strong>${tierLabel.trim() || ""}</strong> ${agreementType || "agreement"} draft is ready for review.
            Please find the full text below.
          </p>

          <!-- Agreement card -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
            <tr><td style="background-color:#fdf2f4;border:1px solid #f3d1d7;border-left:4px solid #be123c;border-radius:4px;padding:20px 24px;">
              <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#be123c;margin-bottom:12px;">
                ${agreementType || "Agreement"} Draft
              </div>
              <div style="font-size:14px;color:#1a1a1a;white-space:pre-wrap;word-wrap:break-word;">
                ${escapedDraft}
              </div>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;font-size:14px;color:#525252;">
            <strong>Next steps:</strong>
          </p>
          <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#525252;">
            <li style="margin-bottom:4px;">Review the draft carefully with your team.</li>
            <li style="margin-bottom:4px;">Reply to this email with any requested changes.</li>
            <li>Once finalized, we will prepare the execution copy.</li>
          </ul>

          <p style="font-size:13px;color:#737373;margin:0;">
            This draft was generated by Ruby Law's AI platform and${tier === "counsel" ? " has been reviewed by licensed counsel." : " should be reviewed by qualified legal counsel before execution."}
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#fafafa;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px;padding:20px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#a3a3a3;">
            &copy; ${new Date().getFullYear()} Ruby Law &mdash; For Founders Law Professional Corporation
          </p>
          <p style="margin:0;font-size:12px;color:#a3a3a3;">
            Toronto, Canada &middot; <a href="https://rubylegal.ai" style="color:#be123c;text-decoration:none;">rubylegal.ai</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `RUBY LAW — AI-Powered Legal for Founders`,
    `${"=".repeat(48)}`,
    ``,
    `Hi${clientName ? ` ${clientName}` : ""},`,
    ``,
    `Your ${tierLabel}${agreementType || "agreement"} draft is ready for review.`,
    ``,
    `--- ${(agreementType || "Agreement").toUpperCase()} DRAFT ---`,
    ``,
    draft,
    ``,
    `--- END OF DRAFT ---`,
    ``,
    `Next steps:`,
    `  1. Review the draft carefully with your team.`,
    `  2. Reply to this email with any requested changes.`,
    `  3. Once finalized, we will prepare the execution copy.`,
    ``,
    tier === "counsel"
      ? `This draft has been reviewed by licensed counsel.`
      : `This draft should be reviewed by qualified legal counsel before execution.`,
    ``,
    `(c) ${new Date().getFullYear()} Ruby Law - For Founders Law Professional Corporation`,
    `Toronto, Canada | https://rubylegal.ai`,
  ].join("\n");

  return { subject, html, text };
}
