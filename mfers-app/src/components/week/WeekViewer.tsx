import { useCallback, useMemo, useState } from "react";
import { getCurrentWeekId, useWeeksQuery } from "../../hooks/useWeekQuery";
import { useHighlightsStore } from "../../store";
import type { BibleReference } from "../../types/verse";
import { DinnerCard } from "../dinner/DinnerCard";
import { QuestionList } from "../questions/QuestionList";
import { ReadingContent } from "../reading/ReadingContent";
import { Skeleton } from "../ui/skeleton";
import { WeekNavigation } from "./WeekNavigation";
import { WeekSelector } from "./WeekSelector";

/**
 * Format a date string for display in the week header.
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
 * Main container component that orchestrates all week viewer components.
 * Manages week navigation state and verse click handling.
 *
 * @example
 * <WeekViewer onVerseClick={(ref) => openVerseModal(ref)} />
 */
export interface WeekViewerProps {
  /** Optional callback when a verse reference is clicked */
  onVerseClick?: (reference: BibleReference) => void;
}

export function WeekViewer({ onVerseClick }: WeekViewerProps) {
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

  // Track the week index - derive initial value when data changes
  // We use a key pattern: reset index when sortedWeeks changes
  const initialIndex = useMemo(
    () => findBestWeekIndex(sortedWeeks, currentWeekId),
    [sortedWeeks, currentWeekId]
  );

  // Use a ref to track if we've initialized with data
  const [weekIndex, setWeekIndex] = useState(initialIndex);

  // Keep weekIndex in sync when initialIndex changes (data loads)
  const effectiveWeekIndex = sortedWeeks.length > 0 ? weekIndex : 0;
  const safeWeekIndex = Math.min(
    effectiveWeekIndex,
    Math.max(0, sortedWeeks.length - 1)
  );

  // Current week data - safe access with fallback
  const week = sortedWeeks[safeWeekIndex];
  const hasPrevious = safeWeekIndex > 0;
  const hasNext = safeWeekIndex < sortedWeeks.length - 1;
  const isCurrentWeek = week?.weekId === currentWeekId;

  // Week selector state
  const [showWeekSelector, setShowWeekSelector] = useState(false);

  // Highlights from store - must be called before any returns
  const { getHighlights, toggleHighlight } = useHighlightsStore();
  const highlights = week ? getHighlights(week.weekId) : new Set<string>();

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      setWeekIndex((prev) => prev - 1);
    }
  }, [hasPrevious]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setWeekIndex((prev) => prev + 1);
    }
  }, [hasNext]);

  // Week selector handler
  const handleSelectWeek = useCallback(
    (weekId: string) => {
      const idx = sortedWeeks.findIndex((w) => w.weekId === weekId);
      if (idx !== -1) {
        setWeekIndex(idx);
      }
    },
    [sortedWeeks]
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

  // Toggle highlight handler
  const handleToggleHighlight = useCallback(
    (questionId: string) => {
      if (week) {
        toggleHighlight(week.weekId, questionId);
      }
    },
    [week, toggleHighlight]
  );

  // Loading state
  if (isLoading) {
    return <WeekViewerSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <h2 className="text-lg font-semibold text-destructive">
              Error loading week data
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
            <p className="text-muted-foreground">No weeks available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <WeekNavigation
        weekTitle={`Week of ${formatWeekDate(week.weekDate)}`}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={handlePrevious}
        onNext={handleNext}
        isCurrentWeek={isCurrentWeek}
        onTitleClick={() => setShowWeekSelector(true)}
      />

      <main>
        <ReadingContent
          text={week.readingAssignment}
          onVerseClick={handleVerseClick}
        />

        <DinnerCard familyName={week.dinnerFamily} notes={week.dinnerNotes} />

        <QuestionList
          questions={week.questions}
          highlightedIds={highlights}
          onToggleHighlight={handleToggleHighlight}
          onVerseClick={handleVerseClick}
        />
      </main>

      {/* Week Selector Bottom Sheet */}
      <WeekSelector
        isOpen={showWeekSelector}
        onClose={() => setShowWeekSelector(false)}
        weeks={sortedWeeks}
        selectedWeekId={week.weekId}
        currentWeekId={currentWeekId}
        onSelectWeek={handleSelectWeek}
      />
    </div>
  );
}

/**
 * Skeleton loading state for WeekViewer.
 */
function WeekViewerSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Reading card skeleton */}
      <div className="p-4">
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      {/* Dinner card skeleton */}
      <div className="px-4 pb-4">
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>

      {/* Questions skeleton */}
      <div className="space-y-3 px-4">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}
