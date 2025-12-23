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
 * Get the current week ID based on today's date.
 * Returns the most recent Tuesday's date in YYYY-MM-DD format.
 *
 * @returns Week ID string
 */
export function getCurrentWeekId(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Calculate days since last Tuesday (Tuesday = 2)
  // If today is Tuesday (2), daysSinceTuesday = 0
  // If today is Wednesday (3), daysSinceTuesday = 1
  // If today is Monday (1), daysSinceTuesday = 6
  const daysSinceTuesday = (dayOfWeek + 5) % 7;

  const lastTuesday = new Date(today);
  lastTuesday.setDate(today.getDate() - daysSinceTuesday);

  return lastTuesday.toISOString().split("T")[0];
}

/**
 * Response type for weeks list.
 */
export interface WeeksListResponse {
  weeks: Week[];
  totalCount: number;
}
