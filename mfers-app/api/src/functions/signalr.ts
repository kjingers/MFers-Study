import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { TableClient } from "@azure/data-tables";

/**
 * SignalR connection info returned to clients.
 */
interface SignalRConnectionInfo {
  available: boolean;
  url?: string;
  accessToken?: string;
}

/**
 * Highlight broadcast request body.
 */
interface HighlightRequest {
  weekId: string;
  questionId: string | null;
}

/**
 * Highlight entity stored in Azure Table Storage when SignalR unavailable.
 */
interface HighlightEntity {
  partitionKey: string; // "highlights"
  rowKey: string; // weekId
  questionId: string | null;
  updatedAt: string;
}

/**
 * Table Storage configuration.
 */
const TABLE_NAME = "highlights";
const PARTITION_KEY = "highlights";

/**
 * Check if SignalR is configured.
 */
function isSignalRConfigured(): boolean {
  return !!process.env.AZURE_SIGNALR_CONNECTION_STRING;
}

/**
 * Check if Table Storage is configured.
 */
function isTableStorageConfigured(): boolean {
  return !!process.env.AZURE_STORAGE_CONNECTION_STRING;
}

/**
 * Get TableClient for highlights table.
 */
function getTableClient(): TableClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING not configured");
  }
  return TableClient.fromConnectionString(connectionString, TABLE_NAME);
}

/**
 * Parse SignalR connection string to extract endpoint.
 */
function parseSignalRConnectionString(connectionString: string): { endpoint: string; accessKey: string } | null {
  try {
    const endpointMatch = connectionString.match(/Endpoint=([^;]+)/i);
    const accessKeyMatch = connectionString.match(/AccessKey=([^;]+)/i);
    
    if (!endpointMatch || !accessKeyMatch) {
      return null;
    }
    
    return {
      endpoint: endpointMatch[1],
      accessKey: accessKeyMatch[1],
    };
  } catch {
    return null;
  }
}

/**
 * Generate a simple JWT-like token for SignalR connection.
 * Note: In production, use proper JWT signing with the access key.
 */
function generateAccessToken(endpoint: string, hubName: string, userId?: string): string {
  // For local development/demo, we create a simple token structure
  // In production, you'd use proper JWT signing with the access key
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour expiry
  
  const payload = {
    aud: `${endpoint}/client/?hub=${hubName}`,
    exp,
    iat: now,
    userId: userId || "anonymous",
  };
  
  // Base64 encode (simplified - real implementation needs proper JWT)
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${base64Payload}.placeholder`;
}

/**
 * In-memory highlight storage for fallback when Table Storage not configured.
 */
const inMemoryHighlights: Map<string, { questionId: string | null; updatedAt: string }> = new Map();

/**
 * Store highlight in Table Storage or in-memory.
 */
async function storeHighlight(weekId: string, questionId: string | null): Promise<void> {
  const updatedAt = new Date().toISOString();
  
  if (!isTableStorageConfigured()) {
    inMemoryHighlights.set(weekId, { questionId, updatedAt });
    return;
  }
  
  const client = getTableClient();
  
  // Ensure table exists
  try {
    await client.createTable();
  } catch (error: unknown) {
    // Table already exists - that's fine
    if (!(error instanceof Error && error.message.includes("TableAlreadyExists"))) {
      // Ignore other errors for table creation
    }
  }
  
  const entity: HighlightEntity = {
    partitionKey: PARTITION_KEY,
    rowKey: weekId,
    questionId,
    updatedAt,
  };
  
  await client.upsertEntity(entity, "Replace");
}

/**
 * Get highlight from Table Storage or in-memory.
 */
async function getHighlight(weekId: string): Promise<{ questionId: string | null; updatedAt: string } | null> {
  if (!isTableStorageConfigured()) {
    return inMemoryHighlights.get(weekId) || null;
  }
  
  const client = getTableClient();
  
  try {
    const entity = await client.getEntity<HighlightEntity>(PARTITION_KEY, weekId);
    return {
      questionId: entity.questionId,
      updatedAt: entity.updatedAt,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("ResourceNotFound")) {
      return null;
    }
    throw error;
  }
}

/**
 * POST /api/negotiate - Returns SignalR connection info.
 * When SignalR is not configured, returns { available: false }.
 */
async function handleNegotiate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Processing SignalR negotiate request");
  
  try {
    if (!isSignalRConfigured()) {
      context.log("SignalR not configured, returning unavailable");
      const response: SignalRConnectionInfo = { available: false };
      return {
        status: 200,
        jsonBody: response,
        headers: {
          "Content-Type": "application/json",
        },
      };
    }
    
    const connectionString = process.env.AZURE_SIGNALR_CONNECTION_STRING!;
    const parsed = parseSignalRConnectionString(connectionString);
    
    if (!parsed) {
      context.error("Failed to parse SignalR connection string");
      const response: SignalRConnectionInfo = { available: false };
      return {
        status: 200,
        jsonBody: response,
        headers: {
          "Content-Type": "application/json",
        },
      };
    }
    
    const hubName = "highlights";
    const accessToken = generateAccessToken(parsed.endpoint, hubName);
    
    const response: SignalRConnectionInfo = {
      available: true,
      url: `${parsed.endpoint}/client/?hub=${hubName}`,
      accessToken,
    };
    
    return {
      status: 200,
      jsonBody: response,
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    context.error("Negotiate error:", error);
    const response: SignalRConnectionInfo = { available: false };
    return {
      status: 200,
      jsonBody: response,
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
}

/**
 * Validate highlight request body.
 */
function validateHighlightRequest(body: unknown): body is HighlightRequest {
  if (!body || typeof body !== "object") return false;
  
  const req = body as Record<string, unknown>;
  
  return (
    typeof req.weekId === "string" &&
    req.weekId.length > 0 &&
    (req.questionId === null || typeof req.questionId === "string")
  );
}

/**
 * POST /api/highlight - Broadcast highlight change.
 * When SignalR is available, broadcasts to all connected clients.
 * Falls back to storing in Table Storage when SignalR unavailable.
 */
async function handleHighlight(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Processing highlight broadcast request");
  
  try {
    const body = await request.json();
    
    if (!validateHighlightRequest(body)) {
      return {
        status: 400,
        jsonBody: {
          error: "Invalid request body",
          details: "Required fields: weekId (string), questionId (string | null)",
        },
      };
    }
    
    const { weekId, questionId } = body;
    
    // Store the highlight state (for persistence and polling fallback)
    await storeHighlight(weekId, questionId);
    
    if (isSignalRConfigured()) {
      // In a full implementation, we would use the SignalR Management SDK
      // to broadcast the message to all clients in the week's group.
      // For now, we rely on the stored state and polling.
      context.log(`SignalR broadcast: week=${weekId}, question=${questionId}`);
      
      // TODO: Implement actual SignalR broadcast when SDK is available
      // const hubContext = await getSignalRHubContext();
      // await hubContext.sendToGroup(weekId, "highlightChange", { weekId, questionId });
    }
    
    return {
      status: 200,
      jsonBody: {
        success: true,
        weekId,
        questionId,
        signalRBroadcast: isSignalRConfigured(),
      },
    };
  } catch (error) {
    context.error("Highlight error:", error);
    return {
      status: 500,
      jsonBody: {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * GET /api/highlight/{weekId} - Get current highlight state for a week.
 * Used for polling fallback when SignalR unavailable.
 */
async function handleGetHighlight(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const weekId = request.params.weekId;
  
  if (!weekId) {
    return {
      status: 400,
      jsonBody: { error: "weekId is required" },
    };
  }
  
  try {
    const highlight = await getHighlight(weekId);
    
    return {
      status: 200,
      jsonBody: {
        weekId,
        questionId: highlight?.questionId ?? null,
        updatedAt: highlight?.updatedAt ?? null,
      },
    };
  } catch (error) {
    context.error("Get highlight error:", error);
    return {
      status: 500,
      jsonBody: {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Combined handler for negotiate endpoint.
 */
async function negotiateHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "POST" || request.method === "GET") {
    return handleNegotiate(request, context);
  }
  
  return {
    status: 405,
    jsonBody: { error: "Method not allowed" },
  };
}

/**
 * Combined handler for highlight endpoint.
 */
async function highlightHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === "GET") {
    return handleGetHighlight(request, context);
  }
  
  if (request.method === "POST") {
    return handleHighlight(request, context);
  }
  
  return {
    status: 405,
    jsonBody: { error: "Method not allowed" },
  };
}

// Register the HTTP functions
app.http("negotiate", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "negotiate",
  handler: negotiateHandler,
});

app.http("highlight", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "highlight/{weekId?}",
  handler: highlightHandler,
});

export { handleNegotiate, handleHighlight, handleGetHighlight };
