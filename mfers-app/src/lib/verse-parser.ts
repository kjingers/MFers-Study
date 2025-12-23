import type { BibleReference } from "../types/verse"

/**
 * Regular expression pattern for matching Bible verse references.
 * Matches formats like:
 * - "John 3:16" (single verse)
 * - "John 3:1-15" (verse range)
 * - "1 John 1:1-4" (numbered book)
 * - "2 Corinthians 4:7-18" (numbered book with range)
 */
const BIBLE_REFERENCE_REGEX = /\b(\d?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:[-–](\d+))?\b/g

/**
 * Normalizes a book name to proper capitalization.
 * Handles numbered books like "1 john" → "1 John"
 * 
 * @param book - The raw book name string
 * @returns Normalized book name with proper capitalization
 * 
 * @example
 * normalizeBook("john") // "John"
 * normalizeBook("1 john") // "1 John"
 * normalizeBook("1john") // "1 John"
 */
export function normalizeBook(book: string): string {
  return book.trim()
    .replace(/^(\d)\s*/, "$1 ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Parses a text string and extracts all Bible verse references.
 * 
 * @param text - The text to search for verse references
 * @returns Array of parsed BibleReference objects
 * 
 * @example
 * parseVerseReferences("Read John 3:16 and John 3:1-15")
 * // Returns two BibleReference objects
 */
export function parseVerseReferences(text: string): BibleReference[] {
  const matches: BibleReference[] = []
  let match: RegExpExecArray | null
  
  // Reset regex lastIndex for fresh search
  BIBLE_REFERENCE_REGEX.lastIndex = 0
  
  while ((match = BIBLE_REFERENCE_REGEX.exec(text)) !== null) {
    matches.push({
      book: normalizeBook(match[1]),
      chapter: parseInt(match[2], 10),
      verseStart: parseInt(match[3], 10),
      verseEnd: match[4] ? parseInt(match[4], 10) : null,
      raw: match[0]
    })
  }
  
  return matches
}

/**
 * Segment type for parsed text with references.
 */
export type TextSegment = 
  | { type: "text"; content: string }
  | { type: "reference"; reference: BibleReference }

/**
 * Parses text and returns an array of segments with text and references separated.
 * Useful for rendering text with clickable verse links.
 * 
 * @param text - The text to parse
 * @returns Array of TextSegment objects
 * 
 * @example
 * parseTextWithReferences("See John 3:16 for more")
 * // Returns [
 * //   { type: "text", content: "See " },
 * //   { type: "reference", reference: { book: "John", chapter: 3, ... } },
 * //   { type: "text", content: " for more" }
 * // ]
 */
export function parseTextWithReferences(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  
  // Reset regex lastIndex for fresh search
  BIBLE_REFERENCE_REGEX.lastIndex = 0
  
  while ((match = BIBLE_REFERENCE_REGEX.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex, match.index)
      })
    }
    
    // Add the reference
    segments.push({
      type: "reference",
      reference: {
        book: normalizeBook(match[1]),
        chapter: parseInt(match[2], 10),
        verseStart: parseInt(match[3], 10),
        verseEnd: match[4] ? parseInt(match[4], 10) : null,
        raw: match[0]
      }
    })
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text after last match
  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      content: text.slice(lastIndex)
    })
  }
  
  return segments
}

/**
 * Formats a BibleReference into a display string.
 * 
 * @param ref - The BibleReference to format
 * @returns Formatted string representation
 * 
 * @example
 * formatReference({ book: "John", chapter: 3, verseStart: 16, verseEnd: null })
 * // "John 3:16"
 * formatReference({ book: "John", chapter: 3, verseStart: 1, verseEnd: 15 })
 * // "John 3:1-15"
 */
export function formatReference(ref: BibleReference): string {
  const verseRange = ref.verseEnd 
    ? `${ref.verseStart}-${ref.verseEnd}` 
    : `${ref.verseStart}`
  return `${ref.book} ${ref.chapter}:${verseRange}`
}
