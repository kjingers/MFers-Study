/**
 * Represents a study week with reading assignments and questions.
 */
export interface Week {
  /** ISO date string identifier (e.g., "2025-12-23") */
  weekId: string
  /** The Tuesday anchor date for this week */
  weekDate: string
  /** The reading assignment text (e.g., "John 3:1-21") */
  readingAssignment: string
  /** Family name assigned for dinner, or null if none */
  dinnerFamily: string | null
  /** Additional dinner notes, or null if none */
  dinnerNotes: string | null
  /** List of discussion questions for this week */
  questions: Question[]
}

/**
 * Represents a discussion question for a study week.
 */
export interface Question {
  /** Unique identifier for the question */
  questionId: string
  /** Display order (1-based) */
  order: number
  /** The question text */
  text: string
}

/**
 * API response for week data including navigation info.
 */
export interface WeekResponse {
  /** The week data */
  week: Week
  /** Navigation metadata */
  navigation: WeekNavigation
}

/**
 * Navigation metadata for week pagination.
 */
export interface WeekNavigation {
  /** Previous week ID if available */
  previousWeekId: string | null
  /** Next week ID if available */
  nextWeekId: string | null
  /** Whether there is a previous week */
  hasPrevious: boolean
  /** Whether there is a next week */
  hasNext: boolean
}
