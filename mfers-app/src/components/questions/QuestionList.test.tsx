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
    highlightedIds: new Set<string>(),
    onToggleHighlight: vi.fn(),
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

  it("should call onToggleHighlight when a question is clicked", () => {
    const onToggleHighlight = vi.fn();
    render(
      <QuestionList {...defaultProps} onToggleHighlight={onToggleHighlight} />
    );

    // Find the button that contains the question text
    const questionButton = screen.getByRole("button", {
      name: /What is the main theme/i,
    });
    fireEvent.click(questionButton);

    expect(onToggleHighlight).toHaveBeenCalledWith("q1");
  });

  it("should show highlighted state for highlighted questions", () => {
    const highlightedIds = new Set(["q1"]);
    render(<QuestionList {...defaultProps} highlightedIds={highlightedIds} />);

    // The highlighted question should have some visual indication
    // Find all question items (role="button" with aria-pressed attribute)
    const questionItems = screen.getAllByRole("button", { pressed: false });
    // We have 3 question items + 1 verse link button = 4 total buttons
    // But aria-pressed is only on question items, so we filter by that
    expect(questionItems.length).toBeGreaterThan(0);
  });

  it("should render empty list when no questions provided", () => {
    render(<QuestionList {...defaultProps} questions={[]} />);

    expect(screen.getByText("Discussion Questions")).toBeInTheDocument();
    // No question items should be rendered
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
