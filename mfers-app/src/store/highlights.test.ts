/**
 * Unit tests for active question Zustand store.
 * Tests cover single-active behavior with toggle-off.
 */
import { beforeEach, describe, expect, it } from "vitest"
import { useHighlightsStore } from "./highlights"

describe("useHighlightsStore", () => {
  // Reset store before each test
  beforeEach(() => {
    // Clear the store state
    useHighlightsStore.setState({
      activeQuestionByWeek: {},
    })
    // Clear localStorage
    localStorage.clear()
  })

  describe("initial state", () => {
    it("should have empty activeQuestionByWeek", () => {
      const state = useHighlightsStore.getState()
      expect(state.activeQuestionByWeek).toEqual({})
    })
  })

  describe("setActiveQuestion", () => {
    it("should set a question as active", () => {
      const { setActiveQuestion, isActive } = useHighlightsStore.getState()

      setActiveQuestion("week-1", "question-1")

      expect(isActive("week-1", "question-1")).toBe(true)
    })

    it("should toggle OFF when clicking the same question (single-select behavior)", () => {
      const { setActiveQuestion, isActive, getActiveQuestionId } =
        useHighlightsStore.getState()

      // Set active
      setActiveQuestion("week-1", "question-1")
      expect(isActive("week-1", "question-1")).toBe(true)

      // Click same question - should toggle off
      setActiveQuestion("week-1", "question-1")
      expect(isActive("week-1", "question-1")).toBe(false)
      expect(getActiveQuestionId("week-1")).toBe(null)
    })

    it("should switch to new question when clicking different question", () => {
      const { setActiveQuestion, isActive, getActiveQuestionId } =
        useHighlightsStore.getState()

      // Set Q1 active
      setActiveQuestion("week-1", "question-1")
      expect(isActive("week-1", "question-1")).toBe(true)

      // Click Q2 - should switch to Q2, Q1 becomes inactive
      setActiveQuestion("week-1", "question-2")
      expect(isActive("week-1", "question-1")).toBe(false)
      expect(isActive("week-1", "question-2")).toBe(true)
      expect(getActiveQuestionId("week-1")).toBe("question-2")
    })

    it("should only allow one active question at a time (not multiple)", () => {
      const { setActiveQuestion, isActive, getActiveQuestionId } =
        useHighlightsStore.getState()

      setActiveQuestion("week-1", "question-1")
      setActiveQuestion("week-1", "question-2")
      setActiveQuestion("week-1", "question-3")

      // Only Q3 should be active
      expect(isActive("week-1", "question-1")).toBe(false)
      expect(isActive("week-1", "question-2")).toBe(false)
      expect(isActive("week-1", "question-3")).toBe(true)
      expect(getActiveQuestionId("week-1")).toBe("question-3")
    })

    it("should handle active questions across different weeks independently", () => {
      const { setActiveQuestion, isActive, getActiveQuestionId } =
        useHighlightsStore.getState()

      setActiveQuestion("week-1", "question-1")
      setActiveQuestion("week-2", "question-2")

      expect(isActive("week-1", "question-1")).toBe(true)
      expect(isActive("week-2", "question-2")).toBe(true)
      expect(getActiveQuestionId("week-1")).toBe("question-1")
      expect(getActiveQuestionId("week-2")).toBe("question-2")
    })
  })

  describe("isActive", () => {
    it("should return false for non-existent week", () => {
      const { isActive } = useHighlightsStore.getState()

      expect(isActive("non-existent-week", "question-1")).toBe(false)
    })

    it("should return false for non-active question", () => {
      const { setActiveQuestion, isActive } = useHighlightsStore.getState()

      setActiveQuestion("week-1", "question-1")

      expect(isActive("week-1", "question-2")).toBe(false)
    })

    it("should return true only for the active question", () => {
      const { setActiveQuestion, isActive } = useHighlightsStore.getState()

      setActiveQuestion("week-1", "question-1")

      expect(isActive("week-1", "question-1")).toBe(true)
      expect(isActive("week-1", "question-2")).toBe(false)
      expect(isActive("week-1", "question-3")).toBe(false)
    })
  })

  describe("getActiveQuestionId", () => {
    it("should return null for non-existent week", () => {
      const { getActiveQuestionId } = useHighlightsStore.getState()

      expect(getActiveQuestionId("non-existent-week")).toBe(null)
    })

    it("should return null when no question is active", () => {
      const { setActiveQuestion, getActiveQuestionId } =
        useHighlightsStore.getState()

      // Set and then toggle off
      setActiveQuestion("week-1", "question-1")
      setActiveQuestion("week-1", "question-1")

      expect(getActiveQuestionId("week-1")).toBe(null)
    })

    it("should return the active question ID", () => {
      const { setActiveQuestion, getActiveQuestionId } =
        useHighlightsStore.getState()

      setActiveQuestion("week-1", "question-2")

      expect(getActiveQuestionId("week-1")).toBe("question-2")
    })
  })

  describe("clearActiveQuestion", () => {
    it("should clear the active question for a week", () => {
      const { setActiveQuestion, clearActiveQuestion, getActiveQuestionId } =
        useHighlightsStore.getState()

      setActiveQuestion("week-1", "question-1")
      clearActiveQuestion("week-1")

      expect(getActiveQuestionId("week-1")).toBe(null)
    })

    it("should not affect other weeks when clearing", () => {
      const {
        setActiveQuestion,
        clearActiveQuestion,
        isActive,
        getActiveQuestionId,
      } = useHighlightsStore.getState()

      setActiveQuestion("week-1", "question-1")
      setActiveQuestion("week-2", "question-1")

      clearActiveQuestion("week-1")

      expect(getActiveQuestionId("week-1")).toBe(null)
      expect(isActive("week-2", "question-1")).toBe(true)
    })

    it("should handle clearing non-existent week gracefully", () => {
      const { clearActiveQuestion, getActiveQuestionId } =
        useHighlightsStore.getState()

      // Should not throw
      clearActiveQuestion("non-existent-week")

      expect(getActiveQuestionId("non-existent-week")).toBe(null)
    })
  })

  describe("persistence", () => {
    it("should have correct storage key", () => {
      const { setActiveQuestion } = useHighlightsStore.getState()

      setActiveQuestion("week-1", "question-1")

      // Check localStorage has the correct key
      const stored = localStorage.getItem("mfers-highlights")
      expect(stored).not.toBeNull()
    })

    it("should persist state to localStorage", () => {
      const { setActiveQuestion } = useHighlightsStore.getState()

      setActiveQuestion("week-1", "question-1")
      setActiveQuestion("week-2", "question-3")

      const stored = localStorage.getItem("mfers-highlights")
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.activeQuestionByWeek["week-1"]).toBe("question-1")
      expect(parsed.state.activeQuestionByWeek["week-2"]).toBe("question-3")
    })
  })
})