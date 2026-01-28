import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { RSVPRequest, RSVPSummary } from "../types";
import { useFamilyStore } from "../store";

/**
 * Query key factory for RSVPs.
 */
export const rsvpKeys = {
  all: ["rsvps"] as const,
  week: (weekId: string) => [...rsvpKeys.all, weekId] as const,
  family: (weekId: string, familyId: string) =>
    [...rsvpKeys.week(weekId), familyId] as const,
};

/**
 * Hook to fetch all RSVPs for a week.
 *
 * @param weekId - The week ID to fetch RSVPs for
 * @returns Query result with RSVP summary
 */
export function useRSVPsQuery(weekId: string | undefined) {
  return useQuery({
    queryKey: rsvpKeys.week(weekId ?? ""),
    queryFn: () => api.fetchRSVPs(weekId!),
    enabled: !!weekId,
    staleTime: 30 * 1000, // 30 seconds - RSVPs should refresh more often
  });
}

/**
 * Hook to fetch current family's RSVP for a week.
 *
 * @param weekId - The week ID
 * @returns Query result with family's RSVP or null
 */
export function useFamilyRSVPQuery(weekId: string | undefined) {
  const { family } = useFamilyStore();
  const familyId = family?.familyId;

  return useQuery({
    queryKey: rsvpKeys.family(weekId ?? "", familyId ?? ""),
    queryFn: () => api.fetchFamilyRSVP(weekId!, familyId!),
    enabled: !!weekId && !!familyId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to submit an RSVP.
 * Automatically invalidates the week's RSVPs cache on success.
 */
export function useSubmitRSVP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rsvp: RSVPRequest) => api.submitRSVP(rsvp),
    onSuccess: (data) => {
      // Update the cache with the new summary
      queryClient.setQueryData<RSVPSummary>(
        rsvpKeys.week(data.summary.weekId),
        data.summary
      );
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: rsvpKeys.week(data.summary.weekId),
      });
    },
  });
}
