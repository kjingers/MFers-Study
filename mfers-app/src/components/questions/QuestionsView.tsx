import { useCallback, useMemo, useState } from "react";
import { getCurrentWeekId, useWeeksQuery } from "../../hooks/useWeekQuery";
import { useHighlightsStore } from "../../store";
import type { BibleReference } from "../../types/verse";
import { Skeleton } from "../ui/skeleton";
import { QuestionList } from "./QuestionList";

/**
 * Format a date string for display in the header.
 */
function formatWeekDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Find the best week index for a given week ID or closest date.
 */
function findBestWeekIndex(
  weeks: { weekId: string; weekDate: string }[],
  targetWeekId: string
): number {
  if (!weeks.length) return 0;
  const idx = weeks.findIndex((w) => w.weekId === targetWeekId);
  if (idx !== -1) return idx;

  // Find closest week to current date
  const today = new Date().getTime();
  let closestIdx = 0;
  let closestDiff = Infinity;
  weeks.forEach((w, i) => {
    const diff = Math.abs(new Date(w.weekDate).getTime() - today);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIdx = i;
    }
  });
  return closestIdx;
}

/**
 * Props for QuestionsView component.
 */
export interface QuestionsViewProps {
  /** Optional callback when a verse reference is clicked */
  onVerseClick?: (reference: BibleReference) => void;
}

/**
 * Standalone view showing only the discussion questions for the current week.
 * Provides a focused interface for reviewing questions.
 *
 * @example
 * <QuestionsView onVerseClick={(ref) => openVerseModal(ref)} />
 */
export function QuestionsView({ onVerseClick }: QuestionsViewProps) {
  // Fetch weeks from API
  const { data: weeks, isLoading, error } = useWeeksQuery();

  // Get sorted weeks for navigation
  const sortedWeeks = useMemo(
    () =>
      weeks
        ? [...weeks].sort(
            (a, b) =>
              new Date(a.weekDate).getTime() - new Date(b.weekDate).getTime()
          )
        : [],
    [weeks]
  );

  // Find current week index
  const currentWeekId = getCurrentWeekId();
  const initialIndex = useMemo(
    () => findBestWeekIndex(sortedWeeks, currentWeekId),
    [sortedWeeks, currentWeekId]
  );

  const [weekIndex] = useState(initialIndex);
  const safeWeekIndex = Math.min(
    weekIndex,
    Math.max(0, sortedWeeks.length - 1)
  );
  const week = sortedWeeks[safeWeekIndex];

  // Active question from store (single-select with toggle-off)
  const { getActiveQuestionId, setActiveQuestion } = useHighlightsStore();
  const activeQuestionId = week ? getActiveQuestionId(week.weekId) : null;

  // Select/deselect question handler
  const handleSelectQuestion = useCallback(
    (questionId: string) => {
      if (week) {
        setActiveQuestion(week.weekId, questionId);
      }
    },
    [week, setActiveQuestion]
  );

  // Verse click handler
  const handleVerseClick = useCallback(
    (reference: BibleReference) => {
      console.log("Verse clicked:", reference);
      if (onVerseClick) {
        onVerseClick(reference);
      }
    },
    [onVerseClick]
  );

  // Loading state
  if (isLoading) {
    return <QuestionsViewSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <h2 className="text-lg font-semibold text-destructive">
              Error loading questions
            </h2>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!week) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="rounded-lg border p-4 text-center">
            <p className="text-muted-foreground">No questions available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-center p-4">
          <h1 className="text-lg font-semibold">
            Questions - Week of {formatWeekDate(week.weekDate)}
          </h1>
        </div>
      </header>

      <main>
        <QuestionList
          questions={week.questions}
          activeQuestionId={activeQuestionId}
          onSelectQuestion={handleSelectQuestion}
          onVerseClick={handleVerseClick}
        />
      </main>
    </div>
  );
}

/**
 * Skeleton loading state for QuestionsView.
 */
function QuestionsViewSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-center p-4">
          <Skeleton className="h-6 w-56" />
        </div>
      </div>

      {/* Questions skeleton */}
      <div className="space-y-3 px-4 mt-6">
        <Skeleton className="h-5 w-40 mb-3" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}