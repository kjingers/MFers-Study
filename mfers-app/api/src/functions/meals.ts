import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import {
  getMealForWeek,
  claimMeal,
  releaseMeal,
} from "../shared/table-storage.js";
import type { Meal } from "../shared/types.js";

/**
 * Request body for claiming a meal slot.
 */
interface MealClaimRequest {
  weekId: string;
  familyId: string;
  familyName: string;
  mealNotes?: string;
}

/**
 * Validate meal claim request body.
 */
function validateMealClaimRequest(body: unknown): body is MealClaimRequest {
  if (!body || typeof body !== "object") return false;

  const req = body as Record<string, unknown>;

  return (
    typeof req.weekId === "string" &&
    req.weekId.length > 0 &&
    typeof req.familyId === "string" &&
    req.familyId.length > 0 &&
    typeof req.familyName === "string" &&
    req.familyName.length > 0 &&
    (req.mealNotes === undefined || typeof req.mealNotes === "string")
  );
}

/**
 * GET /api/meals/{weekId} - Get meal assignment for a week
 * POST /api/meals - Claim a meal slot (with optional notes)
 * DELETE /api/meals/{weekId}?familyId={familyId} - Release a claimed slot
 */
async function handleMeals(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Processing meals request: ${request.method} ${request.url}`);

  try {
    if (request.method === "GET") {
      const weekId = request.params.weekId;

      if (!weekId) {
        return {
          status: 400,
          jsonBody: { error: "weekId is required" },
        };
      }

      const meal = await getMealForWeek(weekId);

      if (!meal) {
        return {
          status: 200,
          jsonBody: { meal: null },
        };
      }

      return {
        status: 200,
        jsonBody: { meal },
      };
    }

    if (request.method === "POST") {
      const body = await request.json();

      if (!validateMealClaimRequest(body)) {
        return {
          status: 400,
          jsonBody: {
            error: "Invalid request body",
            details: "Required fields: weekId, familyId, familyName. Optional: mealNotes",
          },
        };
      }

      // Check if slot is already claimed by someone else
      const existingMeal = await getMealForWeek(body.weekId);
      if (existingMeal && existingMeal.familyId !== body.familyId) {
        return {
          status: 409,
          jsonBody: {
            error: "Meal slot already claimed",
            details: `This week's meal is already claimed by ${existingMeal.familyName}`,
          },
        };
      }

      const meal: Meal = {
        weekId: body.weekId,
        familyId: body.familyId,
        familyName: body.familyName,
        mealNotes: body.mealNotes,
        claimedAt: new Date().toISOString(),
      };

      const savedMeal = await claimMeal(meal);

      return {
        status: 200,
        jsonBody: { meal: savedMeal },
      };
    }

    if (request.method === "DELETE") {
      const weekId = request.params.weekId;
      const familyId = request.query.get("familyId");

      if (!weekId) {
        return {
          status: 400,
          jsonBody: { error: "weekId is required" },
        };
      }

      if (!familyId) {
        return {
          status: 400,
          jsonBody: { error: "familyId query parameter is required" },
        };
      }

      const released = await releaseMeal(weekId, familyId);

      if (!released) {
        return {
          status: 403,
          jsonBody: {
            error: "Cannot release meal slot",
            details: "Either the slot is not claimed or you are not the owner",
          },
        };
      }

      return {
        status: 200,
        jsonBody: { success: true },
      };
    }

    return {
      status: 405,
      jsonBody: { error: "Method not allowed" },
    };
  } catch (error) {
    context.error("Meals error:", error);
    return {
      status: 500,
      jsonBody: {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

// Register the HTTP function
app.http("meals", {
  methods: ["GET", "POST", "DELETE"],
  authLevel: "anonymous",
  route: "meals/{weekId?}",
  handler: handleMeals,
});

export { handleMeals };
