import { BookOpen } from "lucide-react";
import type { Verse } from "../../types/verse";
import { EmptyState } from "../ui/empty-state";
import { VerseSkeleton } from "../ui/skeleton";

/**
 * Props for VerseDisplay component.
 */
export interface VerseDisplayProps {
  /** Array of verses to display */
  verses: Verse[] | undefined;
  /** Copyright notice for the translation */
  copyright: string | undefined;
  /** Whether verses are loading */
  isLoading: boolean;
  /** Error object if fetch failed */
  error: Error | null;
  /** Callback to retry failed fetch */
  onRetry?: () => void;
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
    return <VerseSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Unable to Load Verses"
        description="Something went wrong while fetching the passage."
        action={
          onRetry
            ? {
                label: "Try Again",
                onClick: onRetry,
                variant: "default",
              }
            : undefined
        }
        size="sm"
      />
    );
  }

  // No data state
  if (!verses || verses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Passage Not Found"
        description="We couldn't find verses for this reference. Please check the reference and try again."
        size="sm"
      />
    );
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
  );
}
