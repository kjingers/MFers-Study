import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { BibleReference, PassageResponse, Translation } from "../types/verse"
import { fetchVerses, buildVerseQueryKey } from "../services/verse-service"

/**
 * Available translations for prefetching.
 */
const ALL_TRANSLATIONS: Translation[] = ["NIV", "KJV", "MSG", "ESV"]

/**
 * Cache configuration for verse queries.
 */
const VERSE_CACHE_CONFIG = {
  /** Verses don't change often - cache for 24 hours */
  staleTime: 24 * 60 * 60 * 1000,
  /** Keep in memory for 1 hour after last use */
  gcTime: 60 * 60 * 1000,
  /** Retry failed requests twice */
  retry: 2,
  /** Exponential backoff: 1s, 2s, 4s... capped at 10s */
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
}

/**
 * Hook options for useVerseQuery.
 */
export interface UseVerseQueryOptions {
  /** Whether the query is enabled */
  enabled?: boolean
  /** Whether to prefetch other translations in background */
  prefetchOthers?: boolean
}

/**
 * React Query hook for fetching Bible verses.
 * 
 * Features:
 * - Aggressive caching (24 hour stale time)
 * - Automatic prefetching of other translations
 * - Proper loading and error states
 * - Retry logic with exponential backoff
 * 
 * @param reference - The Bible reference to fetch (null to disable)
 * @param translation - The translation to use
 * @param options - Optional configuration
 * @returns Query result with data, loading, and error states
 * 
 * @example
 * const { data, isLoading, error, refetch } = useVerseQuery(
 *   { book: "John", chapter: 3, verseStart: 16, verseEnd: null, raw: "John 3:16" },
 *   "NIV"
 * )
 */
export function useVerseQuery(
  reference: BibleReference | null,
  translation: Translation,
  options: UseVerseQueryOptions = {}
) {
  const { enabled = true, prefetchOthers = true } = options
  const queryClient = useQueryClient()
  
  const query = useQuery<PassageResponse, Error>({
    queryKey: reference ? buildVerseQueryKey(reference, translation) : ["verses", "disabled"],
    queryFn: () => {
      if (!reference) {
        throw new Error("No reference provided")
      }
      return fetchVerses(reference, translation)
    },
    enabled: enabled && reference !== null,
    staleTime: VERSE_CACHE_CONFIG.staleTime,
    gcTime: VERSE_CACHE_CONFIG.gcTime,
    retry: VERSE_CACHE_CONFIG.retry,
    retryDelay: VERSE_CACHE_CONFIG.retryDelay,
  })
  
  // Prefetch other translations when the current one loads successfully
  if (query.isSuccess && reference && prefetchOthers) {
    const otherTranslations = ALL_TRANSLATIONS.filter(t => t !== translation)
    
    for (const otherTranslation of otherTranslations) {
      const queryKey = buildVerseQueryKey(reference, otherTranslation)
      
      // Only prefetch if not already in cache
      const existingData = queryClient.getQueryData(queryKey)
      if (!existingData) {
        queryClient.prefetchQuery({
          queryKey,
          queryFn: () => fetchVerses(reference, otherTranslation),
          staleTime: VERSE_CACHE_CONFIG.staleTime,
        })
      }
    }
  }
  
  return query
}

/**
 * Hook to manually prefetch verses for a reference.
 * Useful for prefetching on hover or other anticipatory loading.
 * 
 * @returns Function to prefetch verses
 * 
 * @example
 * const prefetchVerse = usePrefetchVerse()
 * 
 * <button onMouseEnter={() => prefetchVerse(reference, "NIV")}>
 *   View Verse
 * </button>
 */
export function usePrefetchVerse() {
  const queryClient = useQueryClient()
  
  return (reference: BibleReference, translation: Translation = "NIV") => {
    const queryKey = buildVerseQueryKey(reference, translation)
    
    queryClient.prefetchQuery({
      queryKey,
      queryFn: () => fetchVerses(reference, translation),
      staleTime: VERSE_CACHE_CONFIG.staleTime,
    })
  }
}
