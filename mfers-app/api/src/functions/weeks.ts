import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"

/**
 * Week data structure returned from the API.
 */
interface Week {
  weekId: string
  weekDate: string
  readingAssignment: string
  dinnerFamily: string | null
  dinnerNotes: string | null
  questions: Question[]
}

/**
 * Question structure.
 */
interface Question {
  questionId: string
  order: number
  text: string
}

/**
 * Navigation metadata for pagination.
 */
interface WeekNavigation {
  previousWeekId: string | null
  nextWeekId: string | null
  hasPrevious: boolean
  hasNext: boolean
}

/**
 * GET /api/weeks - List all weeks
 * GET /api/weeks/{weekId} - Get a specific week
 * 
 * @param request - The HTTP request
 * @param context - The invocation context
 * @returns HTTP response with week data
 */
async function getWeeks(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Processing weeks request: ${request.url}`)
  
  const weekId = request.params.weekId
  
  if (weekId) {
    // Return specific week (stub response)
    return {
      status: 200,
      jsonBody: {
        week: {
          weekId,
          weekDate: weekId,
          readingAssignment: "John 3:1-21",
          dinnerFamily: "The Smith Family",
          dinnerNotes: "Please bring dessert",
          questions: [
            {
              questionId: `q1-${weekId}`,
              order: 1,
              text: "What does it mean to be 'born again'?"
            }
          ]
        } as Week,
        navigation: {
          previousWeekId: null,
          nextWeekId: null,
          hasPrevious: false,
          hasNext: false
        } as WeekNavigation
      }
    }
  }
  
  // Return list of weeks (stub response)
  return {
    status: 200,
    jsonBody: {
      weeks: [] as Week[],
      totalCount: 0
    }
  }
}

// Register the HTTP function
app.http("weeks", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "weeks/{weekId?}",
  handler: getWeeks
})

export { getWeeks }
