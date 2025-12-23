import { MessageCircle } from "lucide-react";
import type { BibleReference } from "../../types/verse";
import type { Question } from "../../types/week";
import { SectionHeader } from "../ui/section-header";
import { QuestionItem } from "./QuestionItem";

/**
 * Props for QuestionList component.
 */
export interface QuestionListProps {
  /** Array of questions to display */
  questions: Question[];
  /** Set of highlighted question IDs */
  highlightedIds: Set<string>;
  /** Callback to toggle highlight for a question */
  onToggleHighlight: (questionId: string) => void;
  /** Callback when a verse reference is clicked */
  onVerseClick: (reference: BibleReference) => void;
}

/**
 * Renders a numbered list of discussion questions.
 * Each question can be highlighted by tapping.
 *
 * @example
 * <QuestionList
 *   questions={week.questions}
 *   highlightedIds={highlights}
 *   onToggleHighlight={(id) => toggleHighlight(id)}
 *   onVerseClick={(ref) => openVerseModal(ref)}
 * />
 */
export function QuestionList({
  questions,
  highlightedIds,
  onToggleHighlight,
  onVerseClick,
}: QuestionListProps) {
  // Sort questions by order
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  return (
    <section className="px-4 mt-6">
      <SectionHeader icon={MessageCircle} title="Discussion Questions" />
      <div className="space-y-3">
        {sortedQuestions.map((question) => (
          <QuestionItem
            key={question.questionId}
            question={question}
            isHighlighted={highlightedIds.has(question.questionId)}
            onToggle={() => onToggleHighlight(question.questionId)}
            onVerseClick={onVerseClick}
          />
        ))}
      </div>
    </section>
  );
}
