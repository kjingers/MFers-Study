import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import {
  getRSVPsForWeek,
  getFamilyRSVP,
  upsertRSVP,
} from "../shared/table-storage.js";
import type { RSVP } from "../shared/types.js";

/**
 * Request body for creating/updating an RSVP.
 */
interface RSVPRequest {
  weekId: string;
  familyId: string;
  familyName: string;
  attending: boolean;
  adults: number;
  kids: number;
}

/**
 * Validate RSVP request body.
 */
function validateRSVPRequest(body: unknown): body is RSVPRequest {
  if (!body || typeof body !== "object") return false;
  
  const req = body as Record<string, unknown>;
  
  return (
    typeof req.weekId === "string" &&
    typeof req.familyId === "string" &&
    typeof req.familyName === "string" &&
    typeof req.attending === "boolean" &&
    typeof req.adults === "number" &&
    typeof req.kids === "number" &&
    req.adults >= 0 &&
    req.kids >= 0
  );
}

/**
 * GET /api/rsvp/{weekId} - Get all RSVPs for a week
 * GET /api/rsvp/{weekId}/{familyId} - Get a specific family's RSVP
 * POST /api/rsvp - Create or update an RSVP
 */
async function handleRSVP(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Processing RSVP request: ${request.method} ${request.url}`);

  try {
    if (request.method === "GET") {
      const weekId = request.params.weekId;
      const familyId = request.params.familyId;

      if (!weekId) {
        return {
          status: 400,
          jsonBody: { error: "weekId is required" },
        };
      }

      // Get specific family's RSVP
      if (familyId) {
        const rsvp = await getFamilyRSVP(weekId, familyId);
        if (!rsvp) {
          return {
            status: 404,
            jsonBody: { error: "RSVP not found" },
          };
        }
        return {
          status: 200,
          jsonBody: rsvp,
        };
      }

      // Get all RSVPs for the week
      const summary = await getRSVPsForWeek(weekId);
      return {
        status: 200,
        jsonBody: summary,
      };
    }

    if (request.method === "POST") {
      const body = await request.json();

      if (!validateRSVPRequest(body)) {
        return {
          status: 400,
          jsonBody: {
            error: "Invalid request body",
            details: "Required fields: weekId, familyId, familyName, attending, adults, kids",
          },
        };
      }

      const rsvp: RSVP = {
        weekId: body.weekId,
        familyId: body.familyId,
        familyName: body.familyName,
        attending: body.attending,
        adults: body.adults,
        kids: body.kids,
        updatedAt: new Date().toISOString(),
      };

      const savedRsvp = await upsertRSVP(rsvp);
      
      // Return the updated summary along with the saved RSVP
      const summary = await getRSVPsForWeek(body.weekId);

      return {
        status: 200,
        jsonBody: {
          rsvp: savedRsvp,
          summary,
        },
      };
    }

    return {
      status: 405,
      jsonBody: { error: "Method not allowed" },
    };
  } catch (error) {
    context.error("RSVP error:", error);
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
app.http("rsvp", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "rsvp/{weekId?}/{familyId?}",
  handler: handleRSVP,
});

export { handleRSVP };
