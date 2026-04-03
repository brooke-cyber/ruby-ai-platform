import { NextResponse } from "next/server";
import { evaluateCompliance } from "@/data/compliance";
import { JURISDICTIONS } from "@/data/compliance";
import type { Category } from "@/data/agreements";

export async function POST(request: Request) {
  try {
    const { categories, jurisdiction, triggerAnswers } = await request.json();

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: "categories array required" }, { status: 400 });
    }

    const jurisdictionData = JURISDICTIONS.find((j) => j.id === jurisdiction) || JURISDICTIONS[0];
    const { activeModules, warnings } = evaluateCompliance(
      categories as Category[],
      jurisdiction || "ontario",
      triggerAnswers || {}
    );

    return NextResponse.json({
      activeModules,
      jurisdiction: jurisdictionData,
      warnings,
    });
  } catch (err) {
    console.error("Compliance API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
