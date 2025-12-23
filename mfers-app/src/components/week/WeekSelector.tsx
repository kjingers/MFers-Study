import { Calendar, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { Sheet } from "../ui/sheet";
import type { Week } from "../../types/week";

/**
 * Format a date for display in the week list.
 */
function formatWeekListDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Check if a date is in the current week.
 */
function isCurrentWeek(dateString: string): boolean {
  const weekDate = new Date(dateString);
  const today = new Date();
  
  // Get start of the week (Sunday) for both dates
  const getWeekStart = (d: Date) => {
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  };
  
  return getWeekStart(weekDate).getTime() === getWeekStart(today).getTime();
}

/**
 * Check if a date is in the past.
 */
function isPastWeek(dateString: string): boolean {
  const weekDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  weekDate.setHours(0, 0, 0, 0);
  return weekDate < today && !isCurrentWeek(dateString);
}

/**
 * Props for WeekSelector component.
 */
export interface WeekSelectorProps {
  /** Whether the selector is open */
  isOpen: boolean;
  /** Callback when selector should close */
  onClose: () => void;
  /** List of all weeks */
  weeks: Week[];
  /** Currently selected week ID */
  selectedWeekId: string;
  /** Current week ID (today's week) */
  currentWeekId: string;
  /** Callback when a week is selected */
  onSelectWeek: (weekId: string) => void;
}

/**
 * Week selector bottom sheet with list of all study weeks.
 * Shows current week indicator and allows quick navigation.
 *
 * @example
 * <WeekSelector
 *   isOpen={showSelector}
 *   onClose={() => setShowSelector(false)}
 *   weeks={sortedWeeks}
 *   selectedWeekId={currentWeek.weekId}
 *   currentWeekId={todayWeekId}
 *   onSelectWeek={(id) => navigateToWeek(id)}
 * />
 */
export function WeekSelector({
  isOpen,
  onClose,
  weeks,
  selectedWeekId,
  currentWeekId,
  onSelectWeek,
}: WeekSelectorProps) {
  const handleSelect = (weekId: string) => {
    onSelectWeek(weekId);
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Select Study Week">
      <div className="py-2">
        {weeks.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No study weeks available</p>
          </div>
        ) : (
          <ul role="listbox" aria-label="Study weeks">
            {weeks.map((week) => {
              const isSelected = week.weekId === selectedWeekId;
              const isCurrent = week.weekId === currentWeekId;
              const isPast = isPastWeek(week.weekDate);

              return (
                <li key={week.weekId}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(week.weekId)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3",
                      "min-h-[56px] text-left",
                      "transition-colors duration-150",
                      "hover:bg-muted/50 active:bg-muted",
                      "focus:outline-none focus:bg-muted",
                      isSelected && "bg-accent/10",
                      isPast && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Selection indicator */}
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center",
                          "border-2 transition-colors",
                          isSelected
                            ? "border-accent bg-accent"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-accent-foreground" />
                        )}
                      </div>

                      {/* Week info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-medium",
                              isSelected && "text-accent"
                            )}
                          >
                            {formatWeekListDate(week.weekDate)}
                          </span>
                          {isCurrent && (
                            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                              This Week
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-[250px]">
                          {week.readingAssignment}
                        </p>
                      </div>
                    </div>

                    {/* Calendar icon for current */}
                    {isCurrent && (
                      <Calendar className="h-4 w-4 text-accent flex-shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
