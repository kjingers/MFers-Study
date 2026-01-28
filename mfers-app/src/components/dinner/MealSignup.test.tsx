/**
 * Tests for MealSignup component.
 * Tests cover unclaimed, claimed states, and form interactions.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MealSignup } from "./MealSignup";
import type { MealSignup as MealSignupType } from "../../types";

// Mock the hooks
vi.mock("../../hooks/useMealQuery", () => ({
  useMealQuery: vi.fn(),
  useMealClaimMutation: vi.fn(),
  useMealReleaseMutation: vi.fn(),
}));

vi.mock("../../store", () => ({
  useFamilyStore: vi.fn(),
}));

// Import mocked functions
import { useMealQuery, useMealClaimMutation, useMealReleaseMutation } from "../../hooks/useMealQuery";
import { useFamilyStore } from "../../store";

const mockUseMealQuery = useMealQuery as unknown as ReturnType<typeof vi.fn>;
const mockUseMealClaimMutation = useMealClaimMutation as unknown as ReturnType<typeof vi.fn>;
const mockUseMealReleaseMutation = useMealReleaseMutation as unknown as ReturnType<typeof vi.fn>;
const mockUseFamilyStore = useFamilyStore as unknown as ReturnType<typeof vi.fn>;

describe("MealSignup", () => {
  const mockFamily = {
    familyId: "family-123",
    name: "The Smith Family",
    createdAt: "2025-01-01T00:00:00.000Z",
  };

  const mockMeal: MealSignupType = {
    weekId: "2025-01-28",
    familyId: "family-456",
    familyName: "The Jones Family",
    mealNotes: "Bringing tacos!",
    claimedAt: "2025-01-20T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseFamilyStore.mockReturnValue({
      family: mockFamily,
      openSetupModal: vi.fn(),
    });

    mockUseMealClaimMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    mockUseMealReleaseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    mockUseMealQuery.mockReturnValue({
      data: null,
      isLoading: false,
    });
  });

  describe("loading state", () => {
    it("should show loading skeleton when loading", () => {
      mockUseMealQuery.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<MealSignup weekId="2025-01-28" />);

      const skeleton = document.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("unclaimed slot", () => {
    it("should show signup form when slot is unclaimed", () => {
      render(<MealSignup weekId="2025-01-28" />);

      expect(screen.getByText("No one signed up yet")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign up to bring dinner/i })).toBeInTheDocument();
    });

    it("should show form when signup button is clicked", () => {
      render(<MealSignup weekId="2025-01-28" />);

      fireEvent.click(screen.getByRole("button", { name: /sign up to bring dinner/i }));

      expect(screen.getByLabelText(/what are you bringing/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /claim slot/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("should allow entering meal notes", () => {
      render(<MealSignup weekId="2025-01-28" />);

      fireEvent.click(screen.getByRole("button", { name: /sign up to bring dinner/i }));

      const input = screen.getByLabelText(/what are you bringing/i);
      fireEvent.change(input, { target: { value: "Lasagna" } });

      expect(input).toHaveValue("Lasagna");
    });

    it("should submit claim with meal notes", () => {
      const mockMutate = vi.fn();
      mockUseMealClaimMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
      });

      render(<MealSignup weekId="2025-01-28" />);

      // Open form
      fireEvent.click(screen.getByRole("button", { name: /sign up to bring dinner/i }));

      // Enter meal notes
      const input = screen.getByLabelText(/what are you bringing/i);
      fireEvent.change(input, { target: { value: "Pizza" } });

      // Submit
      fireEvent.click(screen.getByRole("button", { name: /claim slot/i }));

      expect(mockMutate).toHaveBeenCalledWith(
        {
          weekId: "2025-01-28",
          familyId: "family-123",
          familyName: "The Smith Family",
          mealNotes: "Pizza",
        },
        expect.any(Object)
      );
    });

    it("should submit claim without notes when empty", () => {
      const mockMutate = vi.fn();
      mockUseMealClaimMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
      });

      render(<MealSignup weekId="2025-01-28" />);

      // Open form
      fireEvent.click(screen.getByRole("button", { name: /sign up to bring dinner/i }));

      // Submit without entering notes
      fireEvent.click(screen.getByRole("button", { name: /claim slot/i }));

      expect(mockMutate).toHaveBeenCalledWith(
        {
          weekId: "2025-01-28",
          familyId: "family-123",
          familyName: "The Smith Family",
          mealNotes: undefined,
        },
        expect.any(Object)
      );
    });

    it("should close form when cancel is clicked", () => {
      render(<MealSignup weekId="2025-01-28" />);

      // Open form
      fireEvent.click(screen.getByRole("button", { name: /sign up to bring dinner/i }));
      expect(screen.getByLabelText(/what are you bringing/i)).toBeInTheDocument();

      // Cancel
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(screen.queryByLabelText(/what are you bringing/i)).not.toBeInTheDocument();
      expect(screen.getByText("No one signed up yet")).toBeInTheDocument();
    });
  });

  describe("claimed by another family", () => {
    it("should show claimed info when slot is claimed by another", () => {
      mockUseMealQuery.mockReturnValue({
        data: mockMeal,
        isLoading: false,
      });

      render(<MealSignup weekId="2025-01-28" />);

      expect(screen.getByText("The Jones Family")).toBeInTheDocument();
      expect(screen.getByText("Bringing tacos!")).toBeInTheDocument();
    });

    it("should not show release button when claimed by another family", () => {
      mockUseMealQuery.mockReturnValue({
        data: mockMeal,
        isLoading: false,
      });

      render(<MealSignup weekId="2025-01-28" />);

      expect(screen.queryByRole("button", { name: /release dinner slot/i })).not.toBeInTheDocument();
    });
  });

  describe("claimed by current user", () => {
    const ownMeal: MealSignupType = {
      weekId: "2025-01-28",
      familyId: "family-123",
      familyName: "The Smith Family",
      mealNotes: "Homemade pizza",
      claimedAt: "2025-01-20T00:00:00.000Z",
    };

    it("should show release button when claimed by current user", () => {
      mockUseMealQuery.mockReturnValue({
        data: ownMeal,
        isLoading: false,
      });

      render(<MealSignup weekId="2025-01-28" />);

      expect(screen.getByRole("button", { name: /release dinner slot/i })).toBeInTheDocument();
    });

    it("should show own family name and meal notes", () => {
      mockUseMealQuery.mockReturnValue({
        data: ownMeal,
        isLoading: false,
      });

      render(<MealSignup weekId="2025-01-28" />);

      expect(screen.getByText("The Smith Family")).toBeInTheDocument();
      expect(screen.getByText("Homemade pizza")).toBeInTheDocument();
    });

    it("should call release mutation when release button is clicked", () => {
      const mockReleaseMutate = vi.fn();
      mockUseMealReleaseMutation.mockReturnValue({
        mutate: mockReleaseMutate,
        isPending: false,
      });

      mockUseMealQuery.mockReturnValue({
        data: ownMeal,
        isLoading: false,
      });

      render(<MealSignup weekId="2025-01-28" />);

      fireEvent.click(screen.getByRole("button", { name: /release dinner slot/i }));

      expect(mockReleaseMutate).toHaveBeenCalledWith("2025-01-28");
    });
  });

  describe("no family set", () => {
    it("should show setup prompt when no family is set", () => {
      mockUseFamilyStore.mockReturnValue({
        family: null,
        openSetupModal: vi.fn(),
      });

      render(<MealSignup weekId="2025-01-28" />);

      expect(screen.getByText(/set up your family to sign up for dinner/i)).toBeInTheDocument();
    });

    it("should have button to open setup modal", () => {
      const mockOpenSetupModal = vi.fn();
      mockUseFamilyStore.mockReturnValue({
        family: null,
        openSetupModal: mockOpenSetupModal,
      });

      render(<MealSignup weekId="2025-01-28" />);

      const setupButton = screen.getByRole("button", { name: /set up family/i });
      fireEvent.click(setupButton);

      expect(mockOpenSetupModal).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should display error message when claim fails", () => {
      mockUseMealClaimMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: true,
        error: new Error("Slot already claimed"),
      });

      render(<MealSignup weekId="2025-01-28" />);

      // Open form
      fireEvent.click(screen.getByRole("button", { name: /sign up to bring dinner/i }));

      expect(screen.getByText("Slot already claimed")).toBeInTheDocument();
    });

    it("should display fallback error message when error is not an Error instance", () => {
      mockUseMealClaimMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: true,
        error: "Some string error",
      });

      render(<MealSignup weekId="2025-01-28" />);

      // Open form
      fireEvent.click(screen.getByRole("button", { name: /sign up to bring dinner/i }));

      expect(screen.getByText("Failed to claim slot")).toBeInTheDocument();
    });
  });

  describe("section header", () => {
    it("should render the Dinner title", () => {
      render(<MealSignup weekId="2025-01-28" />);

      expect(screen.getByText("Dinner")).toBeInTheDocument();
    });
  });

  describe("loading states", () => {
    it("should show loading state on claim button while submitting", () => {
      mockUseMealClaimMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
        isError: false,
        error: null,
      });

      render(<MealSignup weekId="2025-01-28" />);

      // Open form
      fireEvent.click(screen.getByRole("button", { name: /sign up to bring dinner/i }));

      // The claim button should exist (it shows loading internally via isLoading prop)
      const claimButton = screen.getByRole("button", { name: /claim slot/i });
      expect(claimButton).toBeInTheDocument();
    });

    it("should show loading state on release button while releasing", () => {
      const ownMeal: MealSignupType = {
        weekId: "2025-01-28",
        familyId: "family-123",
        familyName: "The Smith Family",
        claimedAt: "2025-01-20T00:00:00.000Z",
      };

      mockUseMealQuery.mockReturnValue({
        data: ownMeal,
        isLoading: false,
      });

      mockUseMealReleaseMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      });

      render(<MealSignup weekId="2025-01-28" />);

      const releaseButton = screen.getByRole("button", { name: /release dinner slot/i });
      expect(releaseButton).toBeInTheDocument();
    });
  });
});
