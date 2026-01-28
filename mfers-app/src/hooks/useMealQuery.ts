import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { MealSignupRequest, MealSignup } from "../types";
import { useFamilyStore } from "../store";

/**
 * Query key factory for meals.
 */
export const mealKeys = {
  all: ["meals"] as const,
  week: (weekId: string) => [...mealKeys.all, weekId] as const,
};

/**
 * Hook to fetch meal signup for a week.
 *
 * @param weekId - The week ID to fetch meal for
 * @returns Query result with meal data or null
 */
export function useMealQuery(weekId: string | undefined) {
  return useQuery({
    queryKey: mealKeys.week(weekId ?? ""),
    queryFn: () => api.fetchMeal(weekId!),
    enabled: !!weekId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to claim a meal slot.
 * Automatically invalidates the week's meal cache on success.
 */
export function useMealClaimMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: MealSignupRequest) => api.claimMeal(request),
    onSuccess: (data) => {
      // Update the cache with the new meal
      queryClient.setQueryData<MealSignup | null>(
        mealKeys.week(data.meal.weekId),
        data.meal
      );
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: mealKeys.week(data.meal.weekId),
      });
    },
  });
}

/**
 * Hook to release a meal slot.
 * Automatically invalidates the week's meal cache on success.
 */
export function useMealReleaseMutation() {
  const queryClient = useQueryClient();
  const { family } = useFamilyStore();

  return useMutation({
    mutationFn: (weekId: string) => {
      if (!family) {
        throw new Error("Family not set up");
      }
      return api.releaseMeal(weekId, family.familyId);
    },
    onSuccess: (_, weekId) => {
      // Clear the cache
      queryClient.setQueryData<MealSignup | null>(mealKeys.week(weekId), null);
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: mealKeys.week(weekId),
      });
    },
  });
}
