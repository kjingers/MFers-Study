import type { BibleReference } from "../../types/verse"

/**
 * Props for VerseLink component.
 */
export interface VerseLinkProps {
  /** The Bible reference to display */
  reference: BibleReference
  /** Callback when the link is clicked */
  onClick: () => void
}

/**
 * Styled inline link for Bible verse references.
 * Accessible button with keyboard support and distinct styling.
 * 
 * @example
 * <VerseLink
 *   reference={{ book: "John", chapter: 3, verseStart: 16, verseEnd: null, raw: "John 3:16" }}
 *   onClick={() => handleVerseClick(reference)}
 * />
 */
export function VerseLink({ reference, onClick }: VerseLinkProps) {
  return (
    <>
      {" "}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation() // Prevent parent click handlers (e.g., question highlight)
          onClick()
        }}
        className="text-accent underline underline-offset-2 hover:text-accent/80 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-1 rounded px-0.5 transition-colors"
        aria-label={`Open verse ${reference.raw}`}
      >
        {reference.raw}
      </button>
      {" "}
    </>
  )
}
