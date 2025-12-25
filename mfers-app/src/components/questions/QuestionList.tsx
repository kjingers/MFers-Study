import type { BibleReference } from "../../types/verse";
import type { Question } from "../../types/week";
import { QuestionItem } from "./QuestionItem";

/**
 * Props for QuestionList component.
 */
export interface QuestionListProps {
  /** Array of questions to display */
  questions: Question[];
  /** ID of the currently active (highlighted) question, or null if none */
  activeQuestionId: string | null;
  /** Callback when a question is clicked to select/deselect it */
  onSelectQuestion: (questionId: string) => void;
  /** Callback when a verse reference is clicked */
  onVerseClick: (reference: BibleReference) => void;
}

/**
 * Renders a numbered list of discussion questions.
 * Only one question can be active (highlighted) at a time.
 * Tapping the active question deselects it.
 *
 * @example
 * <QuestionList
 *   questions={week.questions}
 *   activeQuestionId={activeId}
 *   onSelectQuestion={(id) => setActiveQuestion(weekId, id)}
 *   onVerseClick={(ref) => openVerseModal(ref)}
 * />
 */
export function QuestionList({
  questions,
  activeQuestionId,
  onSelectQuestion,
  onVerseClick,
}: QuestionListProps) {
  // Sort questions by order
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  return (
    <section className="px-4 mt-6">
      <h2 className="font-semibold text-lg mb-3">Discussion Questions</h2>
      <div className="space-y-3">
        {sortedQuestions.map((question) => (
          <QuestionItem
            key={question.questionId}
            question={question}
            isHighlighted={question.questionId === activeQuestionId}
            onToggle={() => onSelectQuestion(question.questionId)}
            onVerseClick={onVerseClick}
          />
        ))}
      </div>
    </section>
  );
}