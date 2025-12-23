import type { Week, WeekResponse } from "../types"

/**
 * Mock week data for development and testing.
 * Simulates the structure returned from the API.
 */
export const mockWeeks: Week[] = [
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
        text: "What does it mean to be 'born again' as Jesus describes in John 3:3-7?"
      },
      {
        questionId: "q2-2025-12-16",
        order: 2,
        text: "Why did Nicodemus come to Jesus at night? What might this tell us about him?"
      },
      {
        questionId: "q3-2025-12-16",
        order: 3,
        text: "How does John 3:16 summarize the gospel message?"
      },
      {
        questionId: "q4-2025-12-16",
        order: 4,
        text: "What is the significance of the comparison to Moses lifting up the serpent in John 3:14-15?"
      }
    ]
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
        text: "Why was it significant that Jesus spoke with the Samaritan woman at the well?"
      },
      {
        questionId: "q2-2025-12-23",
        order: 2,
        text: "What does Jesus mean by 'living water' in John 4:10-14?"
      },
      {
        questionId: "q3-2025-12-23",
        order: 3,
        text: "How does Jesus address the woman's past in John 4:16-18? What does this reveal?"
      },
      {
        questionId: "q4-2025-12-23",
        order: 4,
        text: "What does it mean to worship 'in spirit and truth' (John 4:23-24)?"
      },
      {
        questionId: "q5-2025-12-23",
        order: 5,
        text: "How does this passage challenge our assumptions about who can receive God's grace?"
      }
    ]
  },
  {
    weekId: "2025-12-30",
    weekDate: "2025-12-30",
    readingAssignment: "John 5:1-18",
    dinnerFamily: "The Williams Family",
    dinnerNotes: "Potluck style - bring a main dish",
    questions: [
      {
        questionId: "q1-2025-12-30",
        order: 1,
        text: "Why did Jesus ask the man at the pool of Bethesda if he wanted to be healed (John 5:6)?"
      },
      {
        questionId: "q2-2025-12-30",
        order: 2,
        text: "What is significant about Jesus healing on the Sabbath?"
      },
      {
        questionId: "q3-2025-12-30",
        order: 3,
        text: "How does Jesus respond to the religious leaders' criticism in John 5:17?"
      },
      {
        questionId: "q4-2025-12-30",
        order: 4,
        text: "What does this passage teach us about Jesus' relationship with the Father?"
      }
    ]
  },
  {
    weekId: "2026-01-06",
    weekDate: "2026-01-06",
    readingAssignment: "John 6:1-15, John 6:25-40",
    dinnerFamily: null,
    dinnerNotes: null,
    questions: [
      {
        questionId: "q1-2026-01-06",
        order: 1,
        text: "What can we learn from how Jesus tests Philip in John 6:5-6?"
      },
      {
        questionId: "q2-2026-01-06",
        order: 2,
        text: "What is the significance of the twelve baskets of leftovers (John 6:12-13)?"
      },
      {
        questionId: "q3-2026-01-06",
        order: 3,
        text: "Why does Jesus say 'I am the bread of life' in John 6:35? What does this mean?"
      },
      {
        questionId: "q4-2026-01-06",
        order: 4,
        text: "How does Jesus describe the will of the Father in John 6:38-40?"
      }
    ]
  }
]

/**
 * Get a mock week by ID.
 * 
 * @param weekId - The week ID to find
 * @returns The week data or undefined if not found
 */
export function getMockWeek(weekId: string): Week | undefined {
  return mockWeeks.find((week) => week.weekId === weekId)
}

/**
 * Get mock week with navigation data.
 * 
 * @param weekId - The week ID to find
 * @returns WeekResponse with navigation or null if not found
 */
export function getMockWeekResponse(weekId: string): WeekResponse | null {
  const weekIndex = mockWeeks.findIndex((week) => week.weekId === weekId)
  
  if (weekIndex === -1) return null
  
  const week = mockWeeks[weekIndex]
  const previousWeek = weekIndex > 0 ? mockWeeks[weekIndex - 1] : null
  const nextWeek = weekIndex < mockWeeks.length - 1 ? mockWeeks[weekIndex + 1] : null
  
  return {
    week,
    navigation: {
      previousWeekId: previousWeek?.weekId ?? null,
      nextWeekId: nextWeek?.weekId ?? null,
      hasPrevious: previousWeek !== null,
      hasNext: nextWeek !== null
    }
  }
}

/**
 * Get all mock weeks sorted by date.
 * 
 * @returns Array of all weeks
 */
export function getAllMockWeeks(): Week[] {
  return [...mockWeeks].sort(
    (a, b) => new Date(a.weekDate).getTime() - new Date(b.weekDate).getTime()
  )
}

/**
 * Get the current week based on today's date.
 * Returns the most recent week that has started.
 * 
 * @returns The current week or the first week if none match
 */
export function getCurrentMockWeek(): Week {
  const today = new Date()
  const sortedWeeks = getAllMockWeeks()
  
  // Find the most recent week that has started
  const currentWeek = sortedWeeks
    .filter((week) => new Date(week.weekDate) <= today)
    .pop()
  
  return currentWeek ?? sortedWeeks[0]
}
