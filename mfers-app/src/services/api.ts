import type { Week, WeekResponse, PassageResponse, Translation, BibleReference, RSVPSummary, RSVPRequest, RSVPResponse, RSVP } from "../types"

/**
 * API base URL from environment variable.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"

/**
 * Generic fetch wrapper with error handling.
 * 
 * @param endpoint - API endpoint path
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws Error if request fails
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `API error: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Fetch all weeks.
 * 
 * @returns Array of weeks
 */
export async function fetchWeeks(): Promise<Week[]> {
  const data = await fetchApi<{ weeks: Week[] }>("/weeks")
  return data.weeks
}

/**
 * Fetch a specific week by ID.
 * 
 * @param weekId - The week ID to fetch
 * @returns Week response with navigation
 */
export async function fetchWeek(weekId: string): Promise<WeekResponse> {
  return fetchApi<WeekResponse>(`/weeks/${weekId}`)
}

/**
 * Fetch Bible verses for a reference.
 * 
 * @param reference - The Bible reference
 * @param translation - The desired translation
 * @returns Passage response with verses
 */
export async function fetchVerses(
  reference: BibleReference,
  translation: Translation = "NIV"
): Promise<PassageResponse> {
  return fetchApi<PassageResponse>("/verses", {
    method: "POST",
    body: JSON.stringify({
      book: reference.book,
      chapter: reference.chapter,
      verseStart: reference.verseStart,
      verseEnd: reference.verseEnd ?? reference.verseStart,
      translation,
    }),
  })
}

/**
 * Fetch all RSVPs for a week.
 * 
 * @param weekId - The week ID
 * @returns RSVP summary with all responses
 */
export async function fetchRSVPs(weekId: string): Promise<RSVPSummary> {
  return fetchApi<RSVPSummary>(`/rsvp/${weekId}`)
}

/**
 * Fetch a specific family's RSVP.
 * 
 * @param weekId - The week ID
 * @param familyId - The family ID
 * @returns The RSVP or null if not found
 */
export async function fetchFamilyRSVP(weekId: string, familyId: string): Promise<RSVP | null> {
  try {
    return await fetchApi<RSVP>(`/rsvp/${weekId}/${familyId}`)
  } catch {
    return null
  }
}

/**
 * Create or update an RSVP.
 * 
 * @param rsvp - The RSVP data
 * @returns The saved RSVP and updated summary
 */
export async function submitRSVP(rsvp: RSVPRequest): Promise<RSVPResponse> {
  return fetchApi<RSVPResponse>("/rsvp", {
    method: "POST",
    body: JSON.stringify(rsvp),
  })
}

/**
 * API client object with all methods.
 */
export const api = {
  fetchWeeks,
  fetchWeek,
  fetchVerses,
  fetchRSVPs,
  fetchFamilyRSVP,
  submitRSVP,
}
