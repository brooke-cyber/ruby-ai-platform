import { NextResponse } from "next/server";
import {
  evaluateCompliance,
  JURISDICTIONS,
  TRIGGER_QUESTIONS,
  getModulesByPriority,
  getComplianceSummary,
  getQuestionsForCategories,
} from "@/data/compliance";
import type { Category } from "@/data/agreements";

const VALID_CATEGORIES: Category[] = [
  "employment",
  "corporate",
  "investment",
  "commercial",
  "platform",
  "creator",
];

interface FieldError {
  field: string;
  message: string;
}

function validateRequest(body: unknown): { errors: FieldError[]; valid: false } | {
  valid: true;
  categories: Category[];
  jurisdiction: string;
  triggerAnswers: Record<string, boolean>;
} {
  const errors: FieldError[] = [];

  if (!body || typeof body !== "object") {
    return { errors: [{ field: "body", message: "Request body must be a JSON object" }], valid: false };
  }

  const { categories, jurisdiction, triggerAnswers } = body as Record<string, unknown>;

  // Validate categories
  if (!categories || !Array.isArray(categories)) {
    errors.push({ field: "categories", message: "categories must be an array" });
  } else if (categories.length === 0) {
    errors.push({ field: "categories", message: "categories array must not be empty" });
  } else {
    for (const cat of categories) {
      if (typeof cat !== "string" || !VALID_CATEGORIES.includes(cat as Category)) {
        errors.push({
          field: "categories",
          message: `Invalid category "${String(cat)}". Must be one of: ${VALID_CATEGORIES.join(", ")}`,
        });
        break;
      }
    }
  }

  // Validate jurisdiction
  if (jurisdiction !== undefined && jurisdiction !== null) {
    if (typeof jurisdiction !== "string") {
      errors.push({ field: "jurisdiction", message: "jurisdiction must be a string" });
    } else if (!JURISDICTIONS.find((j) => j.id === jurisdiction)) {
      errors.push({
        field: "jurisdiction",
        message: `Invalid jurisdiction "${jurisdiction}". Must be one of: ${JURISDICTIONS.map((j) => j.id).join(", ")}`,
      });
    }
  }

  // Validate triggerAnswers
  if (triggerAnswers !== undefined && triggerAnswers !== null) {
    if (typeof triggerAnswers !== "object" || Array.isArray(triggerAnswers)) {
      errors.push({ field: "triggerAnswers", message: "triggerAnswers must be an object" });
    } else {
      for (const [key, value] of Object.entries(triggerAnswers as Record<string, unknown>)) {
        if (typeof value !== "boolean") {
          errors.push({
            field: `triggerAnswers.${key}`,
            message: `triggerAnswers values must be booleans, got ${typeof value} for "${key}"`,
          });
          break;
        }
      }
    }
  }

  if (errors.length > 0) {
    return { errors, valid: false };
  }

  return {
    valid: true,
    categories: categories as Category[],
    jurisdiction: (jurisdiction as string) || "ontario",
    triggerAnswers: (triggerAnswers as Record<string, boolean>) || {},
  };
}

export async function POST(request: Request) {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      console.error(`[compliance][${requestId}] Invalid JSON in request body`);
      return NextResponse.json(
        { error: "Invalid JSON in request body", requestId },
        { status: 400 }
      );
    }

    const validation = validateRequest(body);
    if (!validation.valid) {
      const elapsed = (performance.now() - startTime).toFixed(1);
      console.warn(`[compliance][${requestId}] Validation failed (${elapsed}ms):`, validation.errors);
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: validation.errors, requestId },
        { status: 400 }
      );
    }

    const { categories, jurisdiction, triggerAnswers } = validation;

    console.log(
      `[compliance][${requestId}] Evaluating: categories=[${categories.join(",")}] jurisdiction=${jurisdiction} triggers=${Object.keys(triggerAnswers).length}`
    );

    const jurisdictionData = JURISDICTIONS.find((j) => j.id === jurisdiction) || JURISDICTIONS[0];
    const { activeModules, warnings } = evaluateCompliance(categories, jurisdiction, triggerAnswers);

    // Sort active modules by severity priority
    const sortedModules = getModulesByPriority(activeModules);

    // Calculate confidence score based on how many relevant triggers were answered
    const relevantQuestions = getQuestionsForCategories(categories);
    const totalRelevant = relevantQuestions.length;
    const answeredCount = relevantQuestions.filter((q) => q.id in triggerAnswers).length;
    const confidenceScore = totalRelevant > 0 ? Math.round((answeredCount / totalRelevant) * 100) : 0;

    // Build enriched module response
    const enrichedModules = sortedModules.map((m) => ({
      id: m.id,
      name: m.name,
      shortName: m.shortName,
      category: m.category,
      description: m.description,
      severity: m.severity,
      riskDescription: m.riskDescription,
      alwaysOn: m.alwaysOn,
      guidance: m.alwaysOn
        ? `${m.shortName} is automatically applied for ${m.category} agreements. Review the ${m.name} requirements before finalizing.`
        : `${m.shortName} was activated by trigger responses. Ensure all ${m.name} obligations are addressed in the agreement.`,
    }));

    // Build summary
    const summary = getComplianceSummary(activeModules);

    const elapsed = (performance.now() - startTime).toFixed(1);
    console.log(
      `[compliance][${requestId}] Complete: ${activeModules.length} modules active, ${warnings.length} warnings, confidence=${confidenceScore}% (${elapsed}ms)`
    );

    return NextResponse.json({
      activeModules: enrichedModules,
      jurisdiction: jurisdictionData,
      warnings,
      summary,
      confidenceScore,
      meta: {
        requestId,
        evaluatedAt: new Date().toISOString(),
        durationMs: parseFloat(elapsed),
        totalRelevantQuestions: totalRelevant,
        answeredQuestions: answeredCount,
      },
    });
  } catch (err) {
    const elapsed = (performance.now() - startTime).toFixed(1);
    console.error(`[compliance][${requestId}] Unhandled error (${elapsed}ms):`, err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", message, requestId },
      { status: 500 }
    );
  }
}
