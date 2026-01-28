import type { Week, WeekResponse } from "../types"

/**
 * Mock week data for development and testing.
 * Simulates the structure returned from the API.
 */
export const mockWeeks: Week[] = [
  {
    weekId: "2026-01-13",
    weekDate: "2026-01-13",
    readingAssignment: "John 6:41-71",
    dinnerFamily: "The Smith Family",
    dinnerNotes: "Please bring dessert",
    questions: [
      {
        questionId: "q1-2026-01-13",
        order: 1,
        text: "Why do the Jews grumble about Jesus claiming to be 'the bread that came down from heaven' (John 6:41-42)?"
      },
      {
        questionId: "q2-2026-01-13",
        order: 2,
        text: "What does Jesus mean when He says 'No one can come to me unless the Father draws him' (John 6:44)?"
      },
      {
        questionId: "q3-2026-01-13",
        order: 3,
        text: "How do you understand Jesus' teaching about eating His flesh and drinking His blood (John 6:53-58)?"
      },
      {
        questionId: "q4-2026-01-13",
        order: 4,
        text: "Why do many disciples turn away after this teaching? What does Peter's response reveal (John 6:66-69)?"
      }
    ]
  },
  {
    weekId: "2026-01-20",
    weekDate: "2026-01-20",
    readingAssignment: "John 7:1-24",
    dinnerFamily: "The Johnson Family",
    dinnerNotes: null,
    questions: [
      {
        questionId: "q1-2026-01-20",
        order: 1,
        text: "Why does Jesus initially refuse to go to the Feast of Tabernacles (John 7:1-9)?"
      },
      {
        questionId: "q2-2026-01-20",
        order: 2,
        text: "What do the divided opinions about Jesus reveal about people's expectations (John 7:10-13)?"
      },
      {
        questionId: "q3-2026-01-20",
        order: 3,
        text: "How does Jesus respond to those who question His teaching and authority (John 7:14-18)?"
      },
      {
        questionId: "q4-2026-01-20",
        order: 4,
        text: "What principle does Jesus teach about judging rightly in John 7:24?"
      }
    ]
  },
  {
    weekId: "2026-01-27",
    weekDate: "2026-01-27",
    readingAssignment: "John 7:25-52",
    dinnerFamily: "The Williams Family",
    dinnerNotes: "Potluck style - bring a main dish",
    questions: [
      {
        questionId: "q1-2026-01-27",
        order: 1,
        text: "Why are the people confused about whether Jesus is the Christ (John 7:25-31)?"
      },
      {
        questionId: "q2-2026-01-27",
        order: 2,
        text: "What does Jesus mean by 'rivers of living water' flowing from within believers (John 7:37-39)?"
      },
      {
        questionId: "q3-2026-01-27",
        order: 3,
        text: "How does the division among the people reflect different responses to Jesus today?"
      },
      {
        questionId: "q4-2026-01-27",
        order: 4,
        text: "What can we learn from Nicodemus' intervention in John 7:50-52?"
      }
    ]
  },
  {
    weekId: "2026-02-03",
    weekDate: "2026-02-03",
    readingAssignment: "John 8:1-30",
    dinnerFamily: null,
    dinnerNotes: null,
    questions: [
      {
        questionId: "q1-2026-02-03",
        order: 1,
        text: "What does Jesus' response to the woman caught in adultery teach us about grace and truth (John 8:1-11)?"
      },
      {
        questionId: "q2-2026-02-03",
        order: 2,
        text: "What does Jesus mean when He says 'I am the light of the world' (John 8:12)?"
      },
      {
        questionId: "q3-2026-02-03",
        order: 3,
        text: "How does Jesus validate His testimony in John 8:14-18?"
      },
      {
        questionId: "q4-2026-02-03",
        order: 4,
        text: "What is significant about Jesus' statement 'Before Abraham was, I am' (John 8:58)?"
      }
    ]
  },
  {
    weekId: "2026-02-10",
    weekDate: "2026-02-10",
    readingAssignment: "John 8:31-59",
    dinnerFamily: "The Garcia Family",
    dinnerNotes: "Taco night!",
    questions: [
      {
        questionId: "q1-2026-02-10",
        order: 1,
        text: "What does it mean to be 'truly free' according to Jesus in John 8:31-36?"
      },
      {
        questionId: "q2-2026-02-10",
        order: 2,
        text: "Why does Jesus say the Jews are children of the devil rather than Abraham (John 8:39-44)?"
      },
      {
        questionId: "q3-2026-02-10",
        order: 3,
        text: "How does this passage challenge us to examine our own spiritual heritage?"
      },
      {
        questionId: "q4-2026-02-10",
        order: 4,
        text: "What does the crowd's violent reaction reveal about their hearts?"
      }
    ]
  },
  {
    weekId: "2026-02-17",
    weekDate: "2026-02-17",
    readingAssignment: "John 9:1-41",
    dinnerFamily: "The Martinez Family",
    dinnerNotes: null,
    questions: [
      {
        questionId: "q1-2026-02-17",
        order: 1,
        text: "How does Jesus' answer about the blind man's condition challenge common assumptions about suffering (John 9:1-5)?"
      },
      {
        questionId: "q2-2026-02-17",
        order: 2,
        text: "What is significant about the Pharisees' reaction to this healing?"
      },
      {
        questionId: "q3-2026-02-17",
        order: 3,
        text: "How does the healed man's faith grow throughout the narrative?"
      },
      {
        questionId: "q4-2026-02-17",
        order: 4,
        text: "What does Jesus mean by spiritual blindness in John 9:39-41?"
      }
    ]
  },
  {
    weekId: "2026-02-24",
    weekDate: "2026-02-24",
    readingAssignment: "John 10:1-21",
    dinnerFamily: null,
    dinnerNotes: null,
    questions: [
      {
        questionId: "q1-2026-02-24",
        order: 1,
        text: "What does the imagery of the Good Shepherd teach us about Jesus' relationship with His followers?"
      },
      {
        questionId: "q2-2026-02-24",
        order: 2,
        text: "What does Jesus mean when He says 'I am the door' (John 10:7-9)?"
      },
      {
        questionId: "q3-2026-02-24",
        order: 3,
        text: "How does the Good Shepherd differ from hired hands (John 10:11-13)?"
      },
      {
        questionId: "q4-2026-02-24",
        order: 4,
        text: "What does Jesus mean by 'other sheep' in John 10:16?"
      }
    ]
  },
  {
    weekId: "2026-03-03",
    weekDate: "2026-03-03",
    readingAssignment: "John 10:22-42",
    dinnerFamily: "The Chen Family",
    dinnerNotes: "Bring an appetizer to share",
    questions: [
      {
        questionId: "q1-2026-03-03",
        order: 1,
        text: "Why do the Jews demand a plain answer about whether Jesus is the Christ (John 10:24)?"
      },
      {
        questionId: "q2-2026-03-03",
        order: 2,
        text: "What comfort can we find in Jesus' promise about His sheep in John 10:27-30?"
      },
      {
        questionId: "q3-2026-03-03",
        order: 3,
        text: "How does Jesus respond to the accusation of blasphemy (John 10:31-39)?"
      },
      {
        questionId: "q4-2026-03-03",
        order: 4,
        text: "Why is Jesus' unity with the Father central to understanding His identity?"
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
