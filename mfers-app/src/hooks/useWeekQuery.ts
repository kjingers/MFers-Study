import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { Week } from "../types";

/**
 * Query key factory for weeks.
 */
export const weekKeys = {
  all: ["weeks"] as const,
  lists: () => [...weekKeys.all, "list"] as const,
  list: () => [...weekKeys.lists()] as const,
  details: () => [...weekKeys.all, "detail"] as const,
  detail: (weekId: string) => [...weekKeys.details(), weekId] as const,
};

/**
 * Hook to fetch all weeks.
 *
 * @returns Query result with weeks array
 *
 * @example
 * const { data: weeks, isLoading, error } = useWeeksQuery()
 */
export function useWeeksQuery() {
  return useQuery({
    queryKey: weekKeys.list(),
    queryFn: api.fetchWeeks,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a specific week by ID.
 *
 * @param weekId - The week ID to fetch
 * @returns Query result with week data and navigation
 *
 * @example
 * const { data, isLoading, error } = useWeekQuery('2025-12-23')
 */
export function useWeekQuery(weekId: string | undefined) {
  return useQuery({
    queryKey: weekKeys.detail(weekId ?? ""),
    queryFn: () => api.fetchWeek(weekId!),
    enabled: !!weekId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get the next Tuesday date (including today if it's Tuesday).
 * This represents the "current week" for Bible study purposes.
 *
 * @returns Date object for next Tuesday
 */
export function getNextTuesday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Tuesday = 2
  // Calculate days until next Tuesday
  // If today is Tuesday (2), daysUntilTuesday = 0
  // If today is Wednesday (3), daysUntilTuesday = 6
  // If today is Monday (1), daysUntilTuesday = 1
  const daysUntilTuesday = (9 - dayOfWeek) % 7;

  const nextTuesday = new Date(today);
  nextTuesday.setDate(today.getDate() + daysUntilTuesday);
  nextTuesday.setHours(0, 0, 0, 0);

  return nextTuesday;
}

/**
 * Get the current week ID based on today's date.
 * Returns the next upcoming Tuesday's date in YYYY-MM-DD format.
 * If today is Tuesday, returns today.
 *
 * @returns Week ID string (YYYY-MM-DD format)
 */
export function getCurrentWeekId(): string {
  return getNextTuesday().toISOString().split("T")[0];
}

/**
 * Find the best matching week from available weeks.
 * Priority:
 * 1. Exact match for next Tuesday
 * 2. Closest future week
 * 3. Most recent past week
 *
 * @param weeks - Array of available weeks
 * @returns Best matching week or null
 */
export function findCurrentWeek(weeks: Week[]): Week | null {
  if (!weeks.length) return null;

  const nextTuesday = getNextTuesday().getTime();
  
  // Sort by date
  const sortedWeeks = [...weeks].sort(
    (a, b) => new Date(a.weekDate).getTime() - new Date(b.weekDate).getTime()
  );

  // Try exact match first
  const exactMatch = sortedWeeks.find(
    (w) => new Date(w.weekDate).getTime() === nextTuesday
  );
  if (exactMatch) return exactMatch;

  // Find closest future week
  const futureWeeks = sortedWeeks.filter(
    (w) => new Date(w.weekDate).getTime() > nextTuesday
  );
  if (futureWeeks.length) return futureWeeks[0];

  // Fall back to most recent past week
  return sortedWeeks[sortedWeeks.length - 1];
}

/**
 * Response type for weeks list.
 */
export interface WeeksListResponse {
  weeks: Week[];
  totalCount: number;
}
