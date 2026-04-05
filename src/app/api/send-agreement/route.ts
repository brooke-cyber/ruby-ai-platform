import { NextResponse } from "next/server";
import {
  createEmailProvider,
  generateAgreementEmail,
  isValidEmail,
  isValidTier,
  VALID_TIERS,
} from "@/lib/email";

// ---------------------------------------------------------------------------
// Structured logging
// ---------------------------------------------------------------------------

function log(
  level: "info" | "warn" | "error",
  requestId: string,
  message: string,
  meta?: Record<string, unknown>
) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    requestId,
    message,
    ...meta,
  };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per-email, 3 sends / hour)
// ---------------------------------------------------------------------------

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const key = email.toLowerCase();
  let entry = rateLimitMap.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitMap.set(key, entry);
  }

  // Prune expired timestamps
  entry.timestamps = entry.timestamps.filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (entry.timestamps.length >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.timestamps.push(now);
  return false;
}

// Periodic cleanup of stale rate-limit entries (every 10 min)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    entry.timestamps = entry.timestamps.filter(
      (t) => now - t < RATE_LIMIT_WINDOW_MS
    );
    if (entry.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000).unref?.();

// ---------------------------------------------------------------------------
// Delivery queue (in-memory with status tracking)
// ---------------------------------------------------------------------------

export type DeliveryStatus =
  | "pending"
  | "processing"
  | "delivered"
  | "failed";

export interface DeliveryRecord {
  requestId: string;
  email: string;
  agreementType: string;
  tier: string;
  status: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
  messageId?: string;
}

const deliveryQueue = new Map<string, DeliveryRecord>();

// Cleanup old records after 24 hours
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [id, record] of deliveryQueue) {
    if (new Date(record.createdAt).getTime() < cutoff) {
      deliveryQueue.delete(id);
    }
  }
}, 30 * 60 * 1000).unref?.();

// ---------------------------------------------------------------------------
// Email provider singleton
// ---------------------------------------------------------------------------

let emailProvider: ReturnType<typeof createEmailProvider> | null = null;

function getEmailProvider() {
  if (!emailProvider) {
    emailProvider = createEmailProvider();
  }
  return emailProvider;
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

interface ValidatedInput {
  email: string;
  draft: string;
  agreements: string[];
  tier: string;
  clientName: string;
}

function validateInput(body: unknown): {
  ok: true;
  data: ValidatedInput;
} | {
  ok: false;
  errors: string[];
} {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    return { ok: false, errors: ["Request body must be a JSON object"] };
  }

  const { email, draft, agreements, tier, clientName } = body as Record<
    string,
    unknown
  >;

  // email — required, valid format
  if (!email || typeof email !== "string") {
    errors.push("email is required and must be a string");
  } else if (!isValidEmail(email.trim())) {
    errors.push("email format is invalid");
  }

  // draft — required, non-empty string
  if (!draft || typeof draft !== "string" || draft.trim().length === 0) {
    errors.push("draft is required and must be a non-empty string");
  }

  // agreements — optional, but if present must be string[]
  if (agreements !== undefined && agreements !== null) {
    if (!Array.isArray(agreements)) {
      errors.push("agreements must be an array of strings");
    } else if (!agreements.every((a: unknown) => typeof a === "string")) {
      errors.push("each item in agreements must be a string");
    }
  }

  // tier — required, must be one of the valid values
  if (!tier || typeof tier !== "string") {
    errors.push("tier is required and must be a string");
  } else if (!isValidTier(tier)) {
    errors.push(
      `tier must be one of: ${VALID_TIERS.join(", ")}`
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      email: (email as string).trim(),
      draft: (draft as string).trim(),
      agreements: (agreements as string[] | undefined) ?? [],
      tier: tier as string,
      clientName:
        typeof clientName === "string" ? clientName.trim() : "",
    },
  };
}

// ---------------------------------------------------------------------------
// POST — send / queue an agreement email
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const requestId = generateRequestId();

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      log("warn", requestId, "Invalid JSON in request body");
      return NextResponse.json(
        { error: "Request body must be valid JSON", requestId },
        { status: 400 }
      );
    }

    // Validate input
    const validation = validateInput(body);
    if (!validation.ok) {
      log("warn", requestId, "Validation failed", {
        errors: validation.errors,
      });
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors, requestId },
        { status: 422 }
      );
    }

    const { email, draft, agreements, tier, clientName } = validation.data;

    // Rate limit check
    if (isRateLimited(email)) {
      log("warn", requestId, "Rate limit exceeded", { email });
      return NextResponse.json(
        {
          error: `Rate limit exceeded: maximum ${RATE_LIMIT_MAX} sends per email per hour`,
          requestId,
        },
        { status: 429 }
      );
    }

    log("info", requestId, "Agreement send requested", {
      email,
      tier,
      agreements,
      draftLength: draft.length,
    });

    // Create delivery record
    const now = new Date().toISOString();
    const record: DeliveryRecord = {
      requestId,
      email,
      agreementType: agreements.length > 0 ? agreements.join(", ") : "General Agreement",
      tier,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    deliveryQueue.set(requestId, record);

    // Generate email content
    const agreementLabel =
      agreements.length > 0 ? agreements.join(" + ") : "Agreement";
    const { subject, html, text } = generateAgreementEmail(
      draft,
      agreementLabel,
      clientName,
      tier
    );

    // Send via provider (async but we await so caller gets status)
    record.status = "processing";
    record.updatedAt = new Date().toISOString();

    const provider = getEmailProvider();
    const result = await provider.send({ to: email, subject, html, text });

    if (result.success) {
      record.status = "delivered";
      record.messageId = result.messageId;
      record.updatedAt = new Date().toISOString();

      log("info", requestId, "Agreement delivered", {
        email,
        messageId: result.messageId,
      });

      return NextResponse.json(
        {
          success: true,
          message: `Agreement delivered to ${email}`,
          requestId,
          messageId: result.messageId,
        },
        { status: 200 }
      );
    } else {
      record.status = "failed";
      record.error = result.error;
      record.updatedAt = new Date().toISOString();

      log("error", requestId, "Email delivery failed", {
        email,
        error: result.error,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Email delivery failed",
          detail: result.error,
          requestId,
        },
        { status: 502 }
      );
    }
  } catch (err) {
    log("error", requestId, "Unhandled error in send-agreement", {
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        requestId,
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET — query delivery status by requestId
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("requestId");

  if (!requestId) {
    return NextResponse.json(
      { error: "requestId query parameter is required" },
      { status: 400 }
    );
  }

  const record = deliveryQueue.get(requestId);

  if (!record) {
    return NextResponse.json(
      { error: "No delivery found for the given requestId", requestId },
      { status: 404 }
    );
  }

  return NextResponse.json({
    requestId: record.requestId,
    email: record.email,
    agreementType: record.agreementType,
    tier: record.tier,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    messageId: record.messageId ?? null,
    error: record.error ?? null,
  });
}
