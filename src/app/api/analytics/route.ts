import { NextRequest, NextResponse } from "next/server";
import { analytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/analytics — returns analytics dashboard data (auth-protected)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // Require authenticated session via ruby-auth cookie
  const authCookie = request.cookies.get("ruby-auth");
  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.json(
      { error: "Unauthorized — please log in to view analytics." },
      { status: 401 },
    );
  }

  const stats = analytics.getStats();

  return NextResponse.json(
    {
      totalGenerations: stats.totalGenerations,
      totalErrors: stats.totalErrors,
      totalPageViews: stats.totalPageViews,
      averageGenerationTimeMs: stats.averageGenerationTimeMs,
      errorRate: Math.round(stats.errorRate * 10000) / 100, // percentage with 2 decimals
      popularAgreements: stats.popularAgreements,
      hourlyActivity: stats.hourlyActivity,
      uptimeMs: stats.uptimeMs,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
