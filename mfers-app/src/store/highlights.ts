import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Highlights store state interface.
 */
interface HighlightsState {
  /** Map of weekId to Set of highlighted questionIds */
  highlightsByWeek: Record<string, string[]>
  /** Toggle highlight for a question */
  toggleHighlight: (weekId: string, questionId: string) => void
  /** Check if a question is highlighted */
  isHighlighted: (weekId: string, questionId: string) => boolean
  /** Get all highlighted question IDs for a week */
  getHighlights: (weekId: string) => Set<string>
  /** Clear all highlights for a week */
  clearWeekHighlights: (weekId: string) => void
}

/**
 * Zustand store for managing question highlights.
 * Persists to localStorage for offline access.
 */
export const useHighlightsStore = create<HighlightsState>()(
  persist(
    (set, get) => ({
      highlightsByWeek: {},
      
      toggleHighlight: (weekId: string, questionId: string) => {
        set((state) => {
          const weekHighlights = state.highlightsByWeek[weekId] ?? []
          const index = weekHighlights.indexOf(questionId)
          
          let newHighlights: string[]
          if (index > -1) {
            // Remove if exists
            newHighlights = weekHighlights.filter((id) => id !== questionId)
          } else {
            // Add if doesn't exist
            newHighlights = [...weekHighlights, questionId]
          }
          
          return {
            highlightsByWeek: {
              ...state.highlightsByWeek,
              [weekId]: newHighlights,
            },
          }
        })
      },
      
      isHighlighted: (weekId: string, questionId: string) => {
        const weekHighlights = get().highlightsByWeek[weekId] ?? []
        return weekHighlights.includes(questionId)
      },
      
      getHighlights: (weekId: string) => {
        const weekHighlights = get().highlightsByWeek[weekId] ?? []
        return new Set(weekHighlights)
      },
      
      clearWeekHighlights: (weekId: string) => {
        set((state) => ({
          highlightsByWeek: {
            ...state.highlightsByWeek,
            [weekId]: [],
          },
        }))
      },
    }),
    {
      name: "mfers-highlights",
    }
  )
)
