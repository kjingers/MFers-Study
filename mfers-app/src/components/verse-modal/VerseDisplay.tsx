import type { Verse } from "../../types/verse"
import { VerseSkeleton } from "../ui/skeleton"

/**
 * Props for VerseDisplay component.
 */
export interface VerseDisplayProps {
  /** Array of verses to display */
  verses: Verse[] | undefined
  /** Copyright notice for the translation */
  copyright: string | undefined
  /** Whether verses are loading */
  isLoading: boolean
  /** Error object if fetch failed */
  error: Error | null
  /** Callback to retry failed fetch */
  onRetry?: () => void
}

/**
 * Displays verse text with proper typography.
 * Handles loading, error, and success states.
 * 
 * @example
 * <VerseDisplay
 *   verses={data?.verses}
 *   copyright={data?.copyright}
 *   isLoading={isLoading}
 *   error={error}
 *   onRetry={refetch}
 * />
 */
export function VerseDisplay({
  verses,
  copyright,
  isLoading,
  error,
  onRetry,
}: VerseDisplayProps) {
  // Loading state
  if (isLoading) {
    return <VerseSkeleton />
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-6" role="alert">
        <p className="text-destructive mb-4">
          Unable to load verses. Please try again.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Retry loading verses"
          >
            Retry
          </button>
        )}
      </div>
    )
  }
  
  // No data state
  if (!verses || verses.length === 0) {
    return (
      <p className="text-muted-foreground italic">
        No verses found for this reference.
      </p>
    )
  }
  
  // Success state - render verses
  return (
    <div className="prose prose-lg">
      <div className="space-y-2">
        {verses.map((verse) => (
          <p key={verse.number} className="text-foreground leading-relaxed">
            <sup className="text-accent font-semibold mr-1 text-sm">
              {verse.number}
            </sup>
            {verse.text}
          </p>
        ))}
      </div>
      
      {copyright && (
        <p className="text-xs text-muted-foreground mt-6 border-t border-border pt-4">
          {copyright}
        </p>
      )}
    </div>
  )
}
