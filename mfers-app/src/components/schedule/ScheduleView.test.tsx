/**
 * Tests for ScheduleView component.
 * Tests cover loading, error, and data states, as well as week selection.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ScheduleView } from "./ScheduleView";
import type { Week } from "../../types";

// Mock the useWeeksQuery hook
vi.mock("../../hooks/useWeekQuery", () => ({
  useWeeksQuery: vi.fn(),
}));

// Import the mocked function for type-safe manipulation
import { useWeeksQuery } from "../../hooks/useWeekQuery";

// Type the mocked function
const mockUseWeeksQuery = useWeeksQuery as ReturnType<typeof vi.fn>;

describe("ScheduleView", () => {
  const defaultProps = {
    onSelectWeek: vi.fn(),
  };

  // Helper to create mock weeks
  const createMockWeek = (overrides: Partial<Week> = {}): Week => ({
    weekId: "2025-01-28",
    weekDate: "2025-01-28",
    readingAssignment: "John 3:1-21",
    dinnerFamily: "The Smith Family",
    dinnerNotes: null,
    questions: [],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("should render loading skeleton when loading", () => {
      mockUseWeeksQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<ScheduleView {...defaultProps} />);

      // Should show skeleton loaders (animate-shimmer is used by Skeleton component)
      const skeletons = document.querySelectorAll(".animate-shimmer, .rounded-lg");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should not render week content when loading", () => {
      mockUseWeeksQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.queryByText("Upcoming Weeks")).not.toBeInTheDocument();
      expect(screen.queryByText("Past Weeks")).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("should render error state when there is an error", () => {
      mockUseWeeksQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("Failed to fetch"),
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.getByText("Error loading schedule")).toBeInTheDocument();
      expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
    });

    it("should handle non-Error error objects", () => {
      mockUseWeeksQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: "Some string error",
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.getByText("Error loading schedule")).toBeInTheDocument();
      expect(screen.getByText("Unknown error")).toBeInTheDocument();
    });
  });

  describe("with data", () => {
    it("should render Upcoming Weeks section", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      mockUseWeeksQuery.mockReturnValue({
        data: [
          createMockWeek({
            weekId: futureDateStr,
            weekDate: futureDateStr,
            readingAssignment: "Romans 1:1-17",
          }),
        ],
        isLoading: false,
        error: null,
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.getByText("Upcoming Weeks")).toBeInTheDocument();
      expect(screen.getByText("Romans 1:1-17")).toBeInTheDocument();
    });

    it("should render Past Weeks section for past weeks", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const pastDateStr = pastDate.toISOString().split("T")[0];

      mockUseWeeksQuery.mockReturnValue({
        data: [
          createMockWeek({
            weekId: pastDateStr,
            weekDate: pastDateStr,
            readingAssignment: "Matthew 5:1-16",
          }),
        ],
        isLoading: false,
        error: null,
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.getByText("Past Weeks")).toBeInTheDocument();
      expect(screen.getByText("Matthew 5:1-16")).toBeInTheDocument();
    });

    it("should render both Upcoming and Past weeks sections", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const pastDateStr = pastDate.toISOString().split("T")[0];

      mockUseWeeksQuery.mockReturnValue({
        data: [
          createMockWeek({
            weekId: futureDateStr,
            weekDate: futureDateStr,
            readingAssignment: "Luke 15:1-10",
          }),
          createMockWeek({
            weekId: pastDateStr,
            weekDate: pastDateStr,
            readingAssignment: "Acts 2:1-21",
          }),
        ],
        isLoading: false,
        error: null,
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.getByText("Upcoming Weeks")).toBeInTheDocument();
      expect(screen.getByText("Past Weeks")).toBeInTheDocument();
      expect(screen.getByText("Luke 15:1-10")).toBeInTheDocument();
      expect(screen.getByText("Acts 2:1-21")).toBeInTheDocument();
    });
  });

  describe("week selection", () => {
    it("should call onSelectWeek when a week is clicked", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const onSelectWeek = vi.fn();
      mockUseWeeksQuery.mockReturnValue({
        data: [
          createMockWeek({
            weekId: futureDateStr,
            weekDate: futureDateStr,
            readingAssignment: "Genesis 1:1-31",
          }),
        ],
        isLoading: false,
        error: null,
      });

      render(<ScheduleView onSelectWeek={onSelectWeek} />);

      const weekButton = screen.getByRole("button", { name: /Genesis 1:1-31/i });
      fireEvent.click(weekButton);

      expect(onSelectWeek).toHaveBeenCalledWith(futureDateStr);
    });
  });

  describe("Needs host indicator", () => {
    it("should show 'Needs host' for weeks without dinner family", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      mockUseWeeksQuery.mockReturnValue({
        data: [
          createMockWeek({
            weekId: futureDateStr,
            weekDate: futureDateStr,
            dinnerFamily: null,
          }),
        ],
        isLoading: false,
        error: null,
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.getByText("Needs host")).toBeInTheDocument();
    });

    it("should show dinner family name when assigned", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      mockUseWeeksQuery.mockReturnValue({
        data: [
          createMockWeek({
            weekId: futureDateStr,
            weekDate: futureDateStr,
            dinnerFamily: "The Johnson Family",
          }),
        ],
        isLoading: false,
        error: null,
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.getByText("The Johnson Family")).toBeInTheDocument();
      expect(screen.queryByText("Needs host")).not.toBeInTheDocument();
    });

    it("should show needs host count in header", () => {
      const futureDate1 = new Date();
      futureDate1.setDate(futureDate1.getDate() + 7);
      const futureDateStr1 = futureDate1.toISOString().split("T")[0];

      const futureDate2 = new Date();
      futureDate2.setDate(futureDate2.getDate() + 14);
      const futureDateStr2 = futureDate2.toISOString().split("T")[0];

      mockUseWeeksQuery.mockReturnValue({
        data: [
          createMockWeek({
            weekId: futureDateStr1,
            weekDate: futureDateStr1,
            dinnerFamily: null,
          }),
          createMockWeek({
            weekId: futureDateStr2,
            weekDate: futureDateStr2,
            dinnerFamily: null,
          }),
        ],
        isLoading: false,
        error: null,
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.getByText("2 needs host")).toBeInTheDocument();
    });
  });

  describe("empty states", () => {
    it("should show message when no upcoming weeks", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const pastDateStr = pastDate.toISOString().split("T")[0];

      mockUseWeeksQuery.mockReturnValue({
        data: [
          createMockWeek({
            weekId: pastDateStr,
            weekDate: pastDateStr,
          }),
        ],
        isLoading: false,
        error: null,
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.getByText("No upcoming weeks scheduled")).toBeInTheDocument();
    });

    it("should handle empty weeks array", () => {
      mockUseWeeksQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.getByText("Schedule")).toBeInTheDocument();
      expect(screen.getByText("No upcoming weeks scheduled")).toBeInTheDocument();
    });
  });

  describe("header", () => {
    it("should render the Schedule header", () => {
      mockUseWeeksQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<ScheduleView {...defaultProps} />);

      expect(screen.getByRole("heading", { name: "Schedule" })).toBeInTheDocument();
    });
  });
});
