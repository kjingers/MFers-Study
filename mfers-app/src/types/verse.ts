/**
 * Supported Bible translations.
 */
export type Translation = "NIV" | "KJV" | "MSG" | "ESV"

/**
 * A parsed Bible verse reference.
 */
export interface BibleReference {
  /** Book name (e.g., "John", "1 John") */
  book: string
  /** Chapter number */
  chapter: number
  /** Starting verse number */
  verseStart: number
  /** Ending verse number for ranges, or null for single verse */
  verseEnd: number | null
  /** Original matched text from source */
  raw: string
}

/**
 * A single verse with its number and text content.
 */
export interface Verse {
  /** Verse number within the chapter */
  number: number
  /** The verse text content */
  text: string
}

/**
 * API response for verse passage requests.
 */
export interface PassageResponse {
  /** The requested reference */
  reference: BibleReference
  /** The translation used */
  translation: Translation
  /** Array of verses in the passage */
  verses: Verse[]
  /** Copyright notice for the translation */
  copyright: string
}

/**
 * Request payload for fetching verses.
 */
export interface VerseRequest {
  /** Book name */
  book: string
  /** Chapter number */
  chapter: number
  /** Starting verse number */
  verseStart: number
  /** Ending verse number (optional, defaults to verseStart) */
  verseEnd?: number
  /** Desired translation (optional, defaults to NIV) */
  translation?: Translation
}
