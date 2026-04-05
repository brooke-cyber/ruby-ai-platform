import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";

// ---------------------------------------------------------------------------
// In-memory rate limiter (per-IP, 5 attempts per 60-second window)
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Periodically prune stale entries so the map doesn't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

function isRateLimited(ip: string): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, retryAfterSec: 0 };
  }

  entry.count += 1;

  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { limited: true, retryAfterSec };
  }

  return { limited: false, retryAfterSec: 0 };
}

// ---------------------------------------------------------------------------
// Constant-time password comparison
// ---------------------------------------------------------------------------
function safeCompare(a: string, b: string): boolean {
  // Hash both values to ensure equal length buffers for timingSafeEqual,
  // regardless of the actual password lengths.
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

function logAuthEvent(level: "info" | "warn" | "error", message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    service: "ruby-auth",
    level,
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

// ---------------------------------------------------------------------------
// POST /api/auth — login
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    // --- Rate limit check ---------------------------------------------------
    const { limited, retryAfterSec } = isRateLimited(ip);
    if (limited) {
      logAuthEvent("warn", "Rate limit exceeded", { ip });
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "X-Content-Type-Options": "nosniff",
          },
        }
      );
    }

    // --- Parse body ---------------------------------------------------------
    const body = await request.json().catch(() => null);
    if (!body || typeof body.password !== "string") {
      logAuthEvent("warn", "Malformed login request", { ip });
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400, headers: { "X-Content-Type-Options": "nosniff" } }
      );
    }

    const { password } = body;
    const expected = process.env.DASHBOARD_PASSWORD;

    if (!expected) {
      logAuthEvent("error", "DASHBOARD_PASSWORD env var is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500, headers: { "X-Content-Type-Options": "nosniff" } }
      );
    }

    // --- Constant-time comparison -------------------------------------------
    if (safeCompare(password, expected)) {
      logAuthEvent("info", "Successful login", { ip });

      const response = NextResponse.json(
        { success: true },
        {
          headers: {
            "X-Content-Type-Options": "nosniff",
          },
        }
      );

      response.cookies.set("ruby-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return response;
    }

    // --- Failed attempt -----------------------------------------------------
    logAuthEvent("warn", "Failed login attempt", { ip });
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401, headers: { "X-Content-Type-Options": "nosniff" } }
    );
  } catch (err) {
    logAuthEvent("error", "Unhandled auth error", {
      ip,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500, headers: { "X-Content-Type-Options": "nosniff" } }
    );
  }
}
