/**
 * Tests for RSVPSection component.
 * Tests cover RSVP form, attendance toggle, counters, and summary display.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { RSVPSection } from "./RSVPSection";
import type { RSVP, RSVPSummary } from "../../types";

// Mock the hooks
vi.mock("../../hooks/useRSVPQuery", () => ({
  useRSVPsQuery: vi.fn(),
  useSubmitRSVP: vi.fn(),
}));

vi.mock("../../store", () => ({
  useFamilyStore: vi.fn(),
}));

// Import mocked functions
import { useRSVPsQuery, useSubmitRSVP } from "../../hooks/useRSVPQuery";
import { useFamilyStore } from "../../store";

const mockUseRSVPsQuery = useRSVPsQuery as ReturnType<typeof vi.fn>;
const mockUseSubmitRSVP = useSubmitRSVP as ReturnType<typeof vi.fn>;
const mockUseFamilyStore = useFamilyStore as ReturnType<typeof vi.fn>;

describe("RSVPSection", () => {
  const mockFamily = {
    familyId: "family-123",
    name: "The Smith Family",
    createdAt: "2025-01-01T00:00:00.000Z",
  };

  const mockRSVP: RSVP = {
    weekId: "2025-01-28",
    familyId: "family-123",
    familyName: "The Smith Family",
    attending: true,
    adults: 2,
    kids: 3,
    updatedAt: "2025-01-20T00:00:00.000Z",
  };

  const mockSummary: RSVPSummary = {
    weekId: "2025-01-28",
    totalFamilies: 2,
    totalAdults: 4,
    totalKids: 5,
    totalPeople: 9,
    rsvps: [
      mockRSVP,
      {
        weekId: "2025-01-28",
        familyId: "family-456",
        familyName: "The Jones Family",
        attending: true,
        adults: 2,
        kids: 2,
        updatedAt: "2025-01-19T00:00:00.000Z",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseFamilyStore.mockReturnValue({
      family: mockFamily,
      openSetupModal: vi.fn(),
    });

    mockUseSubmitRSVP.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    mockUseRSVPsQuery.mockReturnValue({
      data: mockSummary,
      isLoading: false,
    });
  });

  describe("when family is set", () => {
    it("should render RSVP form with family name", () => {
      render(<RSVPSection weekId="2025-01-28" />);

      // Family name appears in the form and potentially in summary, use getAllByText
      const familyNameElements = screen.getAllByText("The Smith Family");
      expect(familyNameElements.length).toBeGreaterThan(0);
    });

    it("should render attendance toggle buttons", () => {
      mockUseRSVPsQuery.mockReturnValue({
        data: { ...mockSummary, rsvps: [] },
        isLoading: false,
      });

      render(<RSVPSection weekId="2025-01-28" />);

      expect(screen.getByRole("button", { name: /yes, we're coming/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /can't make it/i })).toBeInTheDocument();
    });

    it("should show adults/kids counters when attending is selected", () => {
      mockUseRSVPsQuery.mockReturnValue({
        data: { ...mockSummary, rsvps: [] },
        isLoading: false,
      });

      render(<RSVPSection weekId="2025-01-28" />);

      // Click "Yes" to attend
      const yesButton = screen.getByRole("button", { name: /yes, we're coming/i });
      fireEvent.click(yesButton);

      expect(screen.getByText("Adults")).toBeInTheDocument();
      expect(screen.getByText("Kids")).toBeInTheDocument();
    });

    it("should allow incrementing and decrementing adults count", () => {
      mockUseRSVPsQuery.mockReturnValue({
        data: { ...mockSummary, rsvps: [] },
        isLoading: false,
      });

      render(<RSVPSection weekId="2025-01-28" />);

      // Click "Yes" to attend
      fireEvent.click(screen.getByRole("button", { name: /yes, we're coming/i }));

      // Find the increase adults button and click it
      const increaseAdultsButton = screen.getByRole("button", { name: /increase adults/i });
      fireEvent.click(increaseAdultsButton);

      // Adults count should be visible (starts at 1, now 2)
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should call submit mutation on form submission", async () => {
      const mockMutate = vi.fn();
      mockUseSubmitRSVP.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      mockUseRSVPsQuery.mockReturnValue({
        data: { ...mockSummary, rsvps: [] },
        isLoading: false,
      });

      render(<RSVPSection weekId="2025-01-28" />);

      // Click "Yes" to attend
      fireEvent.click(screen.getByRole("button", { name: /yes, we're coming/i }));

      // Find and click submit button
      const submitButton = screen.getByRole("button", { name: /submit rsvp/i });
      fireEvent.click(submitButton);

      expect(mockMutate).toHaveBeenCalledWith({
        weekId: "2025-01-28",
        familyId: "family-123",
        familyName: "The Smith Family",
        attending: true,
        adults: 1,
        kids: 0,
      });
    });
  });

  describe("when family is not set", () => {
    it("should show setup prompt", () => {
      mockUseFamilyStore.mockReturnValue({
        family: null,
        openSetupModal: vi.fn(),
      });

      render(<RSVPSection weekId="2025-01-28" />);

      expect(screen.getByText(/set up your family to rsvp/i)).toBeInTheDocument();
    });

    it("should have button to open setup modal", () => {
      const mockOpenSetupModal = vi.fn();
      mockUseFamilyStore.mockReturnValue({
        family: null,
        openSetupModal: mockOpenSetupModal,
      });

      render(<RSVPSection weekId="2025-01-28" />);

      const setupButton = screen.getByRole("button", { name: /set up family/i });
      fireEvent.click(setupButton);

      expect(mockOpenSetupModal).toHaveBeenCalled();
    });
  });

  describe("attendance summary", () => {
    it("should display expected attendance counts", () => {
      render(<RSVPSection weekId="2025-01-28" />);

      expect(screen.getByText(/expected attendance/i)).toBeInTheDocument();
      expect(screen.getByText("4 adults, 5 kids")).toBeInTheDocument();
    });

    it("should display attending families", () => {
      render(<RSVPSection weekId="2025-01-28" />);

      expect(screen.getByText(/coming \(2\)/i)).toBeInTheDocument();
    });

    it("should display not attending families", () => {
      mockUseRSVPsQuery.mockReturnValue({
        data: {
          ...mockSummary,
          rsvps: [
            ...mockSummary.rsvps,
            {
              weekId: "2025-01-28",
              familyId: "family-789",
              familyName: "The Davis Family",
              attending: false,
              adults: 0,
              kids: 0,
              updatedAt: "2025-01-18T00:00:00.000Z",
            },
          ],
        },
        isLoading: false,
      });

      render(<RSVPSection weekId="2025-01-28" />);

      expect(screen.getByText(/not coming \(1\)/i)).toBeInTheDocument();
      expect(screen.getByText("The Davis Family")).toBeInTheDocument();
    });

    it("should show 'No RSVPs yet' when there are no RSVPs", () => {
      mockUseRSVPsQuery.mockReturnValue({
        data: { ...mockSummary, rsvps: [] },
        isLoading: false,
      });

      render(<RSVPSection weekId="2025-01-28" />);

      expect(screen.getByText(/no rsvps yet/i)).toBeInTheDocument();
    });

    it("should show loading state for summary", () => {
      mockUseRSVPsQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<RSVPSection weekId="2025-01-28" />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("existing RSVP", () => {
    it("should show current RSVP status", () => {
      render(<RSVPSection weekId="2025-01-28" />);

      // Should show that they're attending
      expect(screen.getByText("Attending")).toBeInTheDocument();
    });

    it("should show Update RSVP button when changes are made", () => {
      render(<RSVPSection weekId="2025-01-28" />);

      // Click "Can't make it" to change attendance
      fireEvent.click(screen.getByRole("button", { name: /can't make it/i }));

      expect(screen.getByRole("button", { name: /update rsvp/i })).toBeInTheDocument();
    });
  });

  describe("section header", () => {
    it("should render the section title", () => {
      render(<RSVPSection weekId="2025-01-28" />);

      expect(screen.getByText("Who's Coming?")).toBeInTheDocument();
    });
  });
});
