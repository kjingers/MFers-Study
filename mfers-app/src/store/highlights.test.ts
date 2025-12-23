/**
 * Unit tests for highlights Zustand store.
 * Tests cover all state management operations.
 */
import { beforeEach, describe, expect, it } from "vitest"
import { useHighlightsStore } from "./highlights"

describe("useHighlightsStore", () => {
  // Reset store before each test
  beforeEach(() => {
    // Clear the store state
    useHighlightsStore.setState({
      highlightsByWeek: {},
    })
    // Clear localStorage
    localStorage.clear()
  })

  describe("initial state", () => {
    it("should have empty highlightsByWeek", () => {
      const state = useHighlightsStore.getState()
      expect(state.highlightsByWeek).toEqual({})
    })
  })

  describe("toggleHighlight", () => {
    it("should add a highlight when not present", () => {
      const { toggleHighlight, isHighlighted } = useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      
      expect(isHighlighted("week-1", "question-1")).toBe(true)
    })

    it("should remove a highlight when already present", () => {
      const { toggleHighlight, isHighlighted } = useHighlightsStore.getState()
      
      // Add
      toggleHighlight("week-1", "question-1")
      expect(isHighlighted("week-1", "question-1")).toBe(true)
      
      // Remove
      toggleHighlight("week-1", "question-1")
      expect(isHighlighted("week-1", "question-1")).toBe(false)
    })

    it("should handle multiple questions in same week", () => {
      const { toggleHighlight, isHighlighted } = useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      toggleHighlight("week-1", "question-2")
      toggleHighlight("week-1", "question-3")
      
      expect(isHighlighted("week-1", "question-1")).toBe(true)
      expect(isHighlighted("week-1", "question-2")).toBe(true)
      expect(isHighlighted("week-1", "question-3")).toBe(true)
    })

    it("should handle highlights across different weeks", () => {
      const { toggleHighlight, isHighlighted } = useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      toggleHighlight("week-2", "question-1")
      
      expect(isHighlighted("week-1", "question-1")).toBe(true)
      expect(isHighlighted("week-2", "question-1")).toBe(true)
    })

    it("should not affect other questions when toggling", () => {
      const { toggleHighlight, isHighlighted } = useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      toggleHighlight("week-1", "question-2")
      
      // Toggle off question-1
      toggleHighlight("week-1", "question-1")
      
      expect(isHighlighted("week-1", "question-1")).toBe(false)
      expect(isHighlighted("week-1", "question-2")).toBe(true)
    })
  })

  describe("isHighlighted", () => {
    it("should return false for non-existent week", () => {
      const { isHighlighted } = useHighlightsStore.getState()
      
      expect(isHighlighted("non-existent-week", "question-1")).toBe(false)
    })

    it("should return false for non-highlighted question", () => {
      const { toggleHighlight, isHighlighted } = useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      
      expect(isHighlighted("week-1", "question-2")).toBe(false)
    })

    it("should return true for highlighted question", () => {
      const { toggleHighlight, isHighlighted } = useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      
      expect(isHighlighted("week-1", "question-1")).toBe(true)
    })
  })

  describe("getHighlights", () => {
    it("should return empty Set for non-existent week", () => {
      const { getHighlights } = useHighlightsStore.getState()
      
      const highlights = getHighlights("non-existent-week")
      
      expect(highlights).toBeInstanceOf(Set)
      expect(highlights.size).toBe(0)
    })

    it("should return Set with all highlighted questions", () => {
      const { toggleHighlight, getHighlights } = useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      toggleHighlight("week-1", "question-2")
      toggleHighlight("week-1", "question-3")
      
      const highlights = getHighlights("week-1")
      
      expect(highlights.size).toBe(3)
      expect(highlights.has("question-1")).toBe(true)
      expect(highlights.has("question-2")).toBe(true)
      expect(highlights.has("question-3")).toBe(true)
    })

    it("should only return highlights for specified week", () => {
      const { toggleHighlight, getHighlights } = useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      toggleHighlight("week-2", "question-2")
      
      const week1Highlights = getHighlights("week-1")
      const week2Highlights = getHighlights("week-2")
      
      expect(week1Highlights.has("question-1")).toBe(true)
      expect(week1Highlights.has("question-2")).toBe(false)
      expect(week2Highlights.has("question-2")).toBe(true)
      expect(week2Highlights.has("question-1")).toBe(false)
    })
  })

  describe("clearWeekHighlights", () => {
    it("should clear all highlights for a week", () => {
      const { toggleHighlight, clearWeekHighlights, getHighlights } =
        useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      toggleHighlight("week-1", "question-2")
      toggleHighlight("week-1", "question-3")
      
      clearWeekHighlights("week-1")
      
      const highlights = getHighlights("week-1")
      expect(highlights.size).toBe(0)
    })

    it("should not affect other weeks when clearing", () => {
      const { toggleHighlight, clearWeekHighlights, isHighlighted } =
        useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      toggleHighlight("week-2", "question-1")
      
      clearWeekHighlights("week-1")
      
      expect(isHighlighted("week-1", "question-1")).toBe(false)
      expect(isHighlighted("week-2", "question-1")).toBe(true)
    })

    it("should handle clearing non-existent week gracefully", () => {
      const { clearWeekHighlights, getHighlights } =
        useHighlightsStore.getState()
      
      // Should not throw
      clearWeekHighlights("non-existent-week")
      
      expect(getHighlights("non-existent-week").size).toBe(0)
    })
  })

  describe("persistence", () => {
    it("should have correct storage key", () => {
      const { toggleHighlight } = useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      
      // Check localStorage has the correct key
      const stored = localStorage.getItem("mfers-highlights")
      expect(stored).not.toBeNull()
    })

    it("should persist state to localStorage", () => {
      const { toggleHighlight } = useHighlightsStore.getState()
      
      toggleHighlight("week-1", "question-1")
      toggleHighlight("week-1", "question-2")
      
      const stored = localStorage.getItem("mfers-highlights")
      expect(stored).not.toBeNull()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.state.highlightsByWeek["week-1"]).toContain("question-1")
      expect(parsed.state.highlightsByWeek["week-1"]).toContain("question-2")
    })
  })
})
