import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Active question store state interface.
 * Changed from multi-select (array) to single-select (string | null).
 */
interface ActiveQuestionState {
  /** Map of weekId to the active question ID (or null if none) */
  activeQuestionByWeek: Record<string, string | null>
  /** Set or toggle the active question for a week */
  setActiveQuestion: (weekId: string, questionId: string) => void
  /** Check if a question is the active one */
  isActive: (weekId: string, questionId: string) => boolean
  /** Get the active question ID for a week (or null) */
  getActiveQuestionId: (weekId: string) => string | null
  /** Clear the active question for a week */
  clearActiveQuestion: (weekId: string) => void
}

/**
 * Zustand store for managing the single active discussion question.
 * Only one question can be active (highlighted) at a time per week.
 * Clicking the active question toggles it off.
 * Persists to localStorage for offline access.
 */
export const useHighlightsStore = create<ActiveQuestionState>()(
  persist(
    (set, get) => ({
      activeQuestionByWeek: {},

      setActiveQuestion: (weekId: string, questionId: string) => {
        set((state) => {
          const currentActive = state.activeQuestionByWeek[weekId]
          
          // Toggle off if clicking the same question
          const newActive = currentActive === questionId ? null : questionId
          
          return {
            activeQuestionByWeek: {
              ...state.activeQuestionByWeek,
              [weekId]: newActive,
            },
          }
        })
      },

      isActive: (weekId: string, questionId: string) => {
        return get().activeQuestionByWeek[weekId] === questionId
      },

      getActiveQuestionId: (weekId: string) => {
        return get().activeQuestionByWeek[weekId] ?? null
      },

      clearActiveQuestion: (weekId: string) => {
        set((state) => ({
          activeQuestionByWeek: {
            ...state.activeQuestionByWeek,
            [weekId]: null,
          },
        }))
      },
    }),
    {
      name: "mfers-highlights",
    }
  )
)