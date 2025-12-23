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
  /** Callback when title is clicked to open week selector */
  onTitleClick?: () => void;
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
  onTitleClick,
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

      {/* Tappable title to open week selector */}
      <button
        type="button"
        onClick={onTitleClick}
        className={cn(
          "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg",
          "transition-colors duration-150",
          "hover:bg-muted/50 active:bg-muted",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
          "min-h-[44px] justify-center"
        )}
        aria-label="Open week selector"
        aria-haspopup="dialog"
      >
        <div className="flex items-center gap-1">
          <h1 className="text-lg font-semibold">{weekTitle}</h1>
          <ChevronDown
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        {isCurrentWeek && (
          <span className="text-xs text-accent font-medium">This Week</span>
        )}
      </button>

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
