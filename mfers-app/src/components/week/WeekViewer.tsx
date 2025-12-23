import { useState, useCallback, useMemo } from "react"
import type { BibleReference } from "../../types/verse"
import { mockWeeks, getCurrentMockWeek } from "../../data/mock-weeks"
import { useHighlightsStore } from "../../store"
import { WeekNavigation } from "./WeekNavigation"
import { ReadingContent } from "../reading/ReadingContent"
import { DinnerCard } from "../dinner/DinnerCard"
import { QuestionList } from "../questions/QuestionList"

/**
 * Format a date string for display in the week header.
 */
function formatWeekDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Main container component that orchestrates all week viewer components.
 * Manages week navigation state and verse click handling.
 * 
 * @example
 * <WeekViewer onVerseClick={(ref) => openVerseModal(ref)} />
 */
export interface WeekViewerProps {
  /** Optional callback when a verse reference is clicked */
  onVerseClick?: (reference: BibleReference) => void
}

export function WeekViewer({ onVerseClick }: WeekViewerProps) {
  // Get sorted weeks for navigation
  const sortedWeeks = useMemo(
    () =>
      [...mockWeeks].sort(
        (a, b) => new Date(a.weekDate).getTime() - new Date(b.weekDate).getTime()
      ),
    []
  )

  // Find current week index
  const currentWeek = getCurrentMockWeek()
  const initialIndex = sortedWeeks.findIndex(
    (w) => w.weekId === currentWeek.weekId
  )

  const [weekIndex, setWeekIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  )

  // Current week data
  const week = sortedWeeks[weekIndex]
  const hasPrevious = weekIndex > 0
  const hasNext = weekIndex < sortedWeeks.length - 1
  const isCurrentWeek = week.weekId === currentWeek.weekId

  // Highlights from store
  const { getHighlights, toggleHighlight } = useHighlightsStore()
  const highlights = getHighlights(week.weekId)

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      setWeekIndex((prev) => prev - 1)
    }
  }, [hasPrevious])

  const handleNext = useCallback(() => {
    if (hasNext) {
      setWeekIndex((prev) => prev + 1)
    }
  }, [hasNext])

  // Verse click handler - logs to console for Phase 1, modal integration in Phase 2
  const handleVerseClick = useCallback(
    (reference: BibleReference) => {
      console.log("Verse clicked:", reference)
      if (onVerseClick) {
        onVerseClick(reference)
      }
    },
    [onVerseClick]
  )

  // Toggle highlight handler
  const handleToggleHighlight = useCallback(
    (questionId: string) => {
      toggleHighlight(week.weekId, questionId)
    },
    [week.weekId, toggleHighlight]
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <WeekNavigation
        weekTitle={`Week of ${formatWeekDate(week.weekDate)}`}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={handlePrevious}
        onNext={handleNext}
        isCurrentWeek={isCurrentWeek}
      />

      <main>
        <ReadingContent
          text={week.readingAssignment}
          onVerseClick={handleVerseClick}
        />

        <DinnerCard
          familyName={week.dinnerFamily}
          notes={week.dinnerNotes}
        />

        <QuestionList
          questions={week.questions}
          highlightedIds={highlights}
          onToggleHighlight={handleToggleHighlight}
          onVerseClick={handleVerseClick}
        />
      </main>
    </div>
  )
}
