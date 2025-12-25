/**
 * Tests for QuestionList component.
 */
import type { Question } from "@/types/week";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestionList } from "./QuestionList";

describe("QuestionList", () => {
  const mockQuestions: Question[] = [
    { questionId: "q1", order: 1, text: "What is the main theme?" },
    { questionId: "q2", order: 2, text: "Read John 3:16 and discuss." },
    { questionId: "q3", order: 3, text: "How does this apply to us?" },
  ];

  const defaultProps = {
    questions: mockQuestions,
    activeQuestionId: null as string | null,
    onSelectQuestion: vi.fn(),
    onVerseClick: vi.fn(),
  };

  it("should render all questions", () => {
    render(<QuestionList {...defaultProps} />);

    expect(screen.getByText("What is the main theme?")).toBeInTheDocument();
    // Text with verse reference is split across multiple elements
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText(/and discuss/)).toBeInTheDocument();
    expect(screen.getByText("How does this apply to us?")).toBeInTheDocument();
  });

  it("should render the section heading", () => {
    render(<QuestionList {...defaultProps} />);

    expect(screen.getByText("Discussion Questions")).toBeInTheDocument();
  });

  it("should sort questions by order", () => {
    const unorderedQuestions: Question[] = [
      { questionId: "q3", order: 3, text: "Third question" },
      { questionId: "q1", order: 1, text: "First question" },
      { questionId: "q2", order: 2, text: "Second question" },
    ];

    render(<QuestionList {...defaultProps} questions={unorderedQuestions} />);

    const items = screen.getAllByRole("button");
    // Questions should appear in order
    expect(items[0]).toHaveTextContent("First question");
    expect(items[1]).toHaveTextContent("Second question");
    expect(items[2]).toHaveTextContent("Third question");
  });

  it("should call onSelectQuestion when a question is clicked", () => {
    const onSelectQuestion = vi.fn();
    render(
      <QuestionList {...defaultProps} onSelectQuestion={onSelectQuestion} />
    );

    // Find the button that contains the question text
    const questionButton = screen.getByRole("button", {
      name: /What is the main theme/i,
    });
    fireEvent.click(questionButton);

    expect(onSelectQuestion).toHaveBeenCalledWith("q1");
  });

  it("should show highlighted state only for the active question", () => {
    render(<QuestionList {...defaultProps} activeQuestionId="q1" />);

    // The active question should have aria-pressed="true"
    const activeQuestion = screen.getByRole("button", {
      name: /What is the main theme/i,
    });
    expect(activeQuestion).toHaveAttribute("aria-pressed", "true");

    // Other questions should have aria-pressed="false"
    const inactiveQuestion = screen.getByRole("button", {
      name: /How does this apply to us/i,
    });
    expect(inactiveQuestion).toHaveAttribute("aria-pressed", "false");
  });

  it("should not highlight any question when activeQuestionId is null", () => {
    render(<QuestionList {...defaultProps} activeQuestionId={null} />);

    // All questions should have aria-pressed="false"
    const questionButtons = screen.getAllByRole("button");
    questionButtons.forEach((button) => {
      // Only check question items (not verse links which don't have aria-pressed)
      if (button.hasAttribute("aria-pressed")) {
        expect(button).toHaveAttribute("aria-pressed", "false");
      }
    });
  });

  it("should render empty list when no questions provided", () => {
    render(<QuestionList {...defaultProps} questions={[]} />);

    expect(screen.getByText("Discussion Questions")).toBeInTheDocument();
    // No question items should be rendered
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("should only allow one question to be highlighted at a time", () => {
    // This tests the visual behavior - only activeQuestionId should be highlighted
    render(<QuestionList {...defaultProps} activeQuestionId="q2" />);

    // Q1 should NOT be highlighted
    const q1 = screen.getByRole("button", { name: /What is the main theme/i });
    expect(q1).toHaveAttribute("aria-pressed", "false");

    // Q2 should be highlighted (it has verse reference so check parent)
    // Note: Q2 has "Read John 3:16 and discuss." which includes a verse link
    const q2 = screen.getByRole("button", { name: /Read.*and discuss/i });
    expect(q2).toHaveAttribute("aria-pressed", "true");

    // Q3 should NOT be highlighted
    const q3 = screen.getByRole("button", {
      name: /How does this apply to us/i,
    });
    expect(q3).toHaveAttribute("aria-pressed", "false");
  });
});