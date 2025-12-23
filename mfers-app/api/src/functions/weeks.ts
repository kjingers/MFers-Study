import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import {
  getWeekFromStorage,
  getWeeksFromStorage,
  type Week,
} from "../shared/table-storage.js";

/**
 * Navigation metadata for pagination.
 */
interface WeekNavigation {
  previousWeekId: string | null;
  nextWeekId: string | null;
  hasPrevious: boolean;
  hasNext: boolean;
}

/**
 * Mock week data - used as fallback when Table Storage is not configured.
 */
const mockWeeks: Week[] = [
  {
    weekId: "2025-12-16",
    weekDate: "2025-12-16",
    readingAssignment: "John 3:1-21",
    dinnerFamily: "The Smith Family",
    dinnerNotes: "Please bring dessert",
    questions: [
      {
        questionId: "q1-2025-12-16",
        order: 1,
        text: "What does it mean to be 'born again' as Jesus describes in John 3:3-7?",
      },
      {
        questionId: "q2-2025-12-16",
        order: 2,
        text: "Why did Nicodemus come to Jesus at night? What might this tell us about him?",
      },
      {
        questionId: "q3-2025-12-16",
        order: 3,
        text: "How does John 3:16 summarize the gospel message?",
      },
      {
        questionId: "q4-2025-12-16",
        order: 4,
        text: "What is the significance of the comparison to Moses lifting up the serpent in John 3:14-15?",
      },
    ],
  },
  {
    weekId: "2025-12-23",
    weekDate: "2025-12-23",
    readingAssignment: "John 4:1-26",
    dinnerFamily: "The Johnson Family",
    dinnerNotes: null,
    questions: [
      {
        questionId: "q1-2025-12-23",
        order: 1,
        text: "Why was it significant that Jesus spoke with the Samaritan woman at the well?",
      },
      {
        questionId: "q2-2025-12-23",
        order: 2,
        text: "What does Jesus mean by 'living water' in John 4:10-14?",
      },
      {
        questionId: "q3-2025-12-23",
        order: 3,
        text: "How does Jesus address the woman's past in John 4:16-18? What does this reveal?",
      },
      {
        questionId: "q4-2025-12-23",
        order: 4,
        text: "What does it mean to worship God 'in spirit and in truth' (John 4:23-24)?",
      },
    ],
  },
  {
    weekId: "2025-12-30",
    weekDate: "2025-12-30",
    readingAssignment: "John 4:27-54",
    dinnerFamily: "The Williams Family",
    dinnerNotes: "Potluck style - bring your favorite dish",
    questions: [
      {
        questionId: "q1-2025-12-30",
        order: 1,
        text: "How did the woman's testimony affect her town (John 4:28-30, 39-42)?",
      },
      {
        questionId: "q2-2025-12-30",
        order: 2,
        text: "What does Jesus mean by 'my food is to do the will of him who sent me' (John 4:34)?",
      },
      {
        questionId: "q3-2025-12-30",
        order: 3,
        text: "What can we learn from the royal official's faith in John 4:46-53?",
      },
    ],
  },
  {
    weekId: "2026-01-06",
    weekDate: "2026-01-06",
    readingAssignment: "John 5:1-18",
    dinnerFamily: null,
    dinnerNotes: null,
    questions: [
      {
        questionId: "q1-2026-01-06",
        order: 1,
        text: "Why did Jesus ask the man at the pool of Bethesda 'Do you want to get well?' (John 5:6)?",
      },
      {
        questionId: "q2-2026-01-06",
        order: 2,
        text: "Why were the Jewish leaders upset about the healing on the Sabbath?",
      },
      {
        questionId: "q3-2026-01-06",
        order: 3,
        text: "What does Jesus' statement 'My Father is always at his work' (John 5:17) reveal about his identity?",
      },
    ],
  },
];

/**
 * Get weeks data - tries Table Storage first, falls back to mock data.
 */
async function getWeeksData(context: InvocationContext): Promise<Week[]> {
  try {
    const storageWeeks = await getWeeksFromStorage();
    if (storageWeeks.length > 0) {
      context.log("Loaded weeks from Azure Table Storage");
      return storageWeeks;
    }
  } catch (error) {
    context.log("Table Storage error, falling back to mock data:", error);
  }

  context.log("Using mock week data");
  return [...mockWeeks].sort(
    (a, b) => new Date(a.weekDate).getTime() - new Date(b.weekDate).getTime()
  );
}

/**
 * Get a specific week - tries Table Storage first, falls back to mock data.
 */
async function getWeekData(
  weekId: string,
  context: InvocationContext
): Promise<Week | null> {
  try {
    const storageWeek = await getWeekFromStorage(weekId);
    if (storageWeek) {
      context.log(`Loaded week ${weekId} from Azure Table Storage`);
      return storageWeek;
    }
  } catch (error) {
    context.log("Table Storage error, falling back to mock data:", error);
  }

  // Fall back to mock data
  const week = mockWeeks.find((w) => w.weekId === weekId);
  if (week) {
    context.log(`Loaded week ${weekId} from mock data`);
  }
  return week ?? null;
}

/**
 * GET /api/weeks - List all weeks
 * GET /api/weeks/{weekId} - Get a specific week
 */
async function getWeeks(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Processing weeks request: ${request.url}`);

  const weekId = request.params.weekId;

  if (weekId) {
    // Get specific week
    const sortedWeeks = await getWeeksData(context);
    const week = await getWeekData(weekId, context);

    if (!week) {
      return {
        status: 404,
        jsonBody: { error: `Week not found: ${weekId}` },
      };
    }

    const weekIndex = sortedWeeks.findIndex((w) => w.weekId === weekId);
    const navigation: WeekNavigation = {
      previousWeekId: weekIndex > 0 ? sortedWeeks[weekIndex - 1].weekId : null,
      nextWeekId:
        weekIndex < sortedWeeks.length - 1
          ? sortedWeeks[weekIndex + 1].weekId
          : null,
      hasPrevious: weekIndex > 0,
      hasNext: weekIndex < sortedWeeks.length - 1,
    };

    return {
      status: 200,
      jsonBody: { week, navigation },
    };
  }

  // Return list of all weeks
  const sortedWeeks = await getWeeksData(context);
  return {
    status: 200,
    jsonBody: {
      weeks: sortedWeeks,
      totalCount: sortedWeeks.length,
    },
  };
}

// Register the HTTP function
app.http("weeks", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "weeks/{weekId?}",
  handler: getWeeks,
});

export { getWeeks };
