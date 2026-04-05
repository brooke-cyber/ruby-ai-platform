import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/health — system health check
// ---------------------------------------------------------------------------

interface HealthCheck {
  name: string;
  status: "pass" | "fail";
  message: string;
}

export async function GET() {
  const start = performance.now();

  const checks: HealthCheck[] = [
    checkEnvVar("ANTHROPIC_API_KEY", "Anthropic API key"),
    checkEnvVar("CLAUDE_MODEL", "Claude model"),
    checkEnvVar("DASHBOARD_PASSWORD", "Dashboard password"),
  ];

  const failCount = checks.filter((c) => c.status === "fail").length;

  let status: "healthy" | "degraded" | "unhealthy";
  if (failCount === 0) {
    status = "healthy";
  } else if (failCount < checks.length) {
    status = "degraded";
  } else {
    status = "unhealthy";
  }

  const responseTimeMs = Math.round((performance.now() - start) * 100) / 100;

  const body = {
    status,
    checks: checks.reduce(
      (acc, c) => {
        acc[c.name] = { status: c.status, message: c.message };
        return acc;
      },
      {} as Record<string, { status: string; message: string }>,
    ),
    uptime: process.uptime(),
    version: process.env.npm_package_version ?? "0.1.0",
    timestamp: new Date().toISOString(),
    responseTimeMs,
  };

  return NextResponse.json(body, {
    status: status === "unhealthy" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function checkEnvVar(envName: string, label: string): HealthCheck {
  const value = process.env[envName];
  const isSet = typeof value === "string" && value.length > 0;
  return {
    name: label,
    status: isSet ? "pass" : "fail",
    message: isSet ? `${label} is configured` : `${label} is not set`,
  };
}
