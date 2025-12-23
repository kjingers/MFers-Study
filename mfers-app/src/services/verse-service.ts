import type { BibleReference, PassageResponse, Translation, VerseRequest } from "../types/verse"

/**
 * API base URL - defaults to /api for Azure Static Web Apps.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api"

/**
 * Fetch verses from the API.
 * 
 * @param reference - The Bible reference to fetch
 * @param translation - The translation to use (defaults to NIV)
 * @returns Promise with the passage response
 * @throws Error if the fetch fails
 * 
 * @example
 * const passage = await fetchVerses(
 *   { book: "John", chapter: 3, verseStart: 16, verseEnd: null, raw: "John 3:16" },
 *   "NIV"
 * )
 */
export async function fetchVerses(
  reference: BibleReference,
  translation: Translation = "NIV"
): Promise<PassageResponse> {
  const url = `${API_BASE}/verses`
  
  const requestBody: VerseRequest = {
    book: reference.book,
    chapter: reference.chapter,
    verseStart: reference.verseStart,
    verseEnd: reference.verseEnd ?? undefined,
    translation,
  }
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`Failed to fetch verses: ${errorText}`)
  }
  
  return response.json()
}

/**
 * Build a cache key for verse queries.
 * Used by React Query for caching.
 * 
 * @param reference - The Bible reference
 * @param translation - The translation
 * @returns Array of query key parts
 */
export function buildVerseQueryKey(
  reference: BibleReference,
  translation: Translation
): readonly [string, string, Translation] {
  return ["verses", reference.raw, translation] as const
}
