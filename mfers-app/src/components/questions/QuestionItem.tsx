import { cn } from "../../lib/utils";
import { parseTextWithReferences } from "../../lib/verse-parser";
import type { BibleReference } from "../../types/verse";
import type { Question } from "../../types/week";
import { VerseLink } from "../reading/VerseLink";
import { Card } from "../ui/card";

/**
 * Props for QuestionItem component.
 */
export interface QuestionItemProps {
  /** The question data */
  question: Question;
  /** Whether the question is highlighted */
  isHighlighted: boolean;
  /** Callback to toggle highlight state */
  onToggle: () => void;
  /** Callback when a verse reference in the question is clicked */
  onVerseClick: (reference: BibleReference) => void;
}

/**
 * Individual question card with highlight toggle.
 * Displays question text with number, tap to toggle bold/highlight state.
 * Verse references in questions are clickable.
 *
 * @example
 * <QuestionItem
 *   question={{ questionId: "q1", order: 1, text: "What does John 3:16 mean?" }}
 *   isHighlighted={false}
 *   onToggle={() => toggleHighlight("q1")}
 *   onVerseClick={(ref) => openVerseModal(ref)}
 * />
 */
export function QuestionItem({
  question,
  isHighlighted,
  onToggle,
  onVerseClick,
}: QuestionItemProps) {
  const segments = parseTextWithReferences(question.text);

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-150",
        "hover:shadow-md active:scale-[0.98]",
        isHighlighted && "border-2 border-accent bg-accent/5"
      )}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-pressed={isHighlighted}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "text-lg font-medium min-w-[24px] flex-shrink-0",
            isHighlighted ? "text-accent" : "text-muted-foreground"
          )}
        >
          {question.order}.
        </span>
        <div className={cn("flex-1", isHighlighted && "font-semibold")}>
          {segments.map((segment, index) =>
            segment.type === "text" ? (
              <span key={index}>{segment.content}</span>
            ) : (
              <VerseLink
                key={index}
                reference={segment.reference}
                onClick={() => onVerseClick(segment.reference)}
              />
            )
          )}
        </div>
      </div>
    </Card>
  );
}
