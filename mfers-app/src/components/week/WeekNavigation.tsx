import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

/**
 * Props for WeekNavigation component.
 */
export interface WeekNavigationProps {
  /** Display text for the week (e.g., "Week of Dec 23, 2025") */
  weekTitle: string;
  /** Whether a previous week exists */
  hasPrevious: boolean;
  /** Whether a next week exists */
  hasNext: boolean;
  /** Callback when previous button clicked */
  onPrevious: () => void;
  /** Callback when next button clicked */
  onNext: () => void;
  /** Whether this is the current week */
  isCurrentWeek?: boolean;
}

/**
 * Week navigation header with prev/next controls.
 * Mobile-optimized with 44px touch targets.
 *
 * @example
 * <WeekNavigation
 *   weekTitle="Week of Dec 23, 2025"
 *   hasPrevious={true}
 *   hasNext={false}
 *   onPrevious={() => setWeekIndex(i - 1)}
 *   onNext={() => setWeekIndex(i + 1)}
 *   isCurrentWeek={true}
 * />
 */
export function WeekNavigation({
  weekTitle,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  isCurrentWeek = false,
}: WeekNavigationProps) {
  return (
    <header className="sticky top-0 z-10 h-14 flex items-center justify-between px-4 bg-surface border-b border-border">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label="Go to previous week"
        className="min-w-[44px] min-h-[44px]"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </Button>

      <div className="flex flex-col items-center">
        <h1 className="text-lg font-semibold">{weekTitle}</h1>
        {isCurrentWeek && (
          <span
            className="w-2 h-2 rounded-full bg-accent mt-1"
            role="img"
            aria-label="This is the current week"
          />
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Go to next week"
        className="min-w-[44px] min-h-[44px]"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </Button>
    </header>
  );
}
