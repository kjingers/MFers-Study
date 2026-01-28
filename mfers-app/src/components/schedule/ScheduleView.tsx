import { Calendar, ChevronRight, Users, Utensils } from "lucide-react";
import { useWeeksQuery } from "../../hooks/useWeekQuery";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

/**
 * Format date for display.
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Check if a date is in the past.
 */
function isPastWeek(dateString: string): boolean {
  const weekDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  weekDate.setHours(0, 0, 0, 0);
  return weekDate < today;
}

/**
 * Check if a date is the current week.
 */
function isCurrentWeek(dateString: string): boolean {
  const weekDate = new Date(dateString);
  const today = new Date();
  // Get Tuesday of current week
  const dayOfWeek = today.getDay();
  const daysUntilTuesday = (2 - dayOfWeek + 7) % 7;
  const nextTuesday = new Date(today);
  nextTuesday.setDate(today.getDate() + daysUntilTuesday);
  nextTuesday.setHours(0, 0, 0, 0);
  weekDate.setHours(0, 0, 0, 0);
  return weekDate.getTime() === nextTuesday.getTime();
}

/**
 * Props for WeekRow component.
 */
interface WeekRowProps {
  weekId: string;
  weekDate: string;
  readingAssignment: string;
  dinnerFamily: string | null;
  onSelect: (weekId: string) => void;
}

/**
 * Single week row in the schedule list.
 */
function WeekRow({
  weekId,
  weekDate,
  readingAssignment,
  dinnerFamily,
  onSelect,
}: WeekRowProps) {
  const isPast = isPastWeek(weekDate);
  const isCurrent = isCurrentWeek(weekDate);

  return (
    <button
      onClick={() => onSelect(weekId)}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
        isPast
          ? "opacity-50"
          : isCurrent
          ? "bg-accent/10 border border-accent/30"
          : "bg-muted/50 hover:bg-muted"
      }`}
    >
      {/* Date */}
      <div className="flex-shrink-0 w-16 text-center">
        <div className={`text-sm font-medium ${isCurrent ? "text-accent" : ""}`}>
          {formatDate(weekDate).split(", ")[0]}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(weekDate).split(", ")[1]}
        </div>
        {isCurrent && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent text-background mt-1">
            Today
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{readingAssignment}</div>
        <div className="flex items-center gap-2 mt-1">
          {dinnerFamily ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Utensils className="h-3 w-3" aria-hidden="true" />
              {dinnerFamily}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-warning">
              <Utensils className="h-3 w-3" aria-hidden="true" />
              Needs host
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
    </button>
  );
}

/**
 * Schedule view showing all weeks and meal assignments.
 */
export interface ScheduleViewProps {
  /** Callback when a week is selected */
  onSelectWeek: (weekId: string) => void;
}

export function ScheduleView({ onSelectWeek }: ScheduleViewProps) {
  const { data: weeks, isLoading, error } = useWeeksQuery();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-4">
        <div className="px-4 space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-4">
        <div className="px-4">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <h2 className="text-lg font-semibold text-destructive">
              Error loading schedule
            </h2>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sort weeks by date
  const sortedWeeks = weeks
    ? [...weeks].sort(
        (a, b) => new Date(a.weekDate).getTime() - new Date(b.weekDate).getTime()
      )
    : [];

  // Separate upcoming and past weeks
  const upcomingWeeks = sortedWeeks.filter((w) => !isPastWeek(w.weekDate));
  const pastWeeks = sortedWeeks.filter((w) => isPastWeek(w.weekDate)).reverse();

  // Count weeks without dinner host
  const needsHostCount = upcomingWeeks.filter((w) => !w.dinnerFamily).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 h-14 flex items-center justify-between px-4 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-accent" aria-hidden="true" />
          <h1 className="text-lg font-semibold">Schedule</h1>
        </div>
        {needsHostCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
            <Users className="h-3 w-3" aria-hidden="true" />
            {needsHostCount} needs host
          </span>
        )}
      </header>

      <main className="p-4 space-y-6">
        {/* Upcoming weeks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Upcoming Weeks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingWeeks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming weeks scheduled
              </p>
            ) : (
              upcomingWeeks.map((week) => (
                <WeekRow
                  key={week.weekId}
                  weekId={week.weekId}
                  weekDate={week.weekDate}
                  readingAssignment={week.readingAssignment}
                  dinnerFamily={week.dinnerFamily}
                  onSelect={onSelectWeek}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Past weeks */}
        {pastWeeks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">
                Past Weeks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pastWeeks.slice(0, 5).map((week) => (
                <WeekRow
                  key={week.weekId}
                  weekId={week.weekId}
                  weekDate={week.weekDate}
                  readingAssignment={week.readingAssignment}
                  dinnerFamily={week.dinnerFamily}
                  onSelect={onSelectWeek}
                />
              ))}
              {pastWeeks.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {pastWeeks.length - 5} more past weeks
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
