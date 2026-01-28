/**
 * Tests for SyncStatus component.
 * Tests cover all sync states: live, polling, connecting, and local.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SyncStatus } from "./SyncStatus";

describe("SyncStatus", () => {
  describe("live mode", () => {
    it("should render 'Live' with green indicator when connected", () => {
      render(<SyncStatus mode="live" />);

      expect(screen.getByText("Live")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveAttribute(
        "aria-label",
        "Sync status: Live"
      );
    });

    it("should have green dot color when live", () => {
      const { container } = render(<SyncStatus mode="live" />);

      const dot = container.querySelector("[aria-hidden='true']");
      expect(dot).toHaveClass("bg-emerald-400");
    });
  });

  describe("connecting state", () => {
    it("should render 'Connecting' with yellow indicator when connecting", () => {
      render(<SyncStatus mode="live" isConnecting />);

      expect(screen.getByText("Connecting")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveAttribute(
        "aria-label",
        "Sync status: Connecting"
      );
    });

    it("should have yellow/amber dot color when connecting", () => {
      const { container } = render(<SyncStatus mode="live" isConnecting />);

      const dot = container.querySelector("[aria-hidden='true']");
      expect(dot).toHaveClass("bg-amber-400");
    });

    it("should have pulsing animation when connecting", () => {
      const { container } = render(<SyncStatus mode="live" isConnecting />);

      const dot = container.querySelector("[aria-hidden='true']");
      expect(dot).toHaveClass("animate-pulse");
    });

    it("should show connecting state regardless of mode", () => {
      render(<SyncStatus mode="polling" isConnecting />);

      expect(screen.getByText("Connecting")).toBeInTheDocument();
    });
  });

  describe("polling mode", () => {
    it("should render 'Syncing' with blue indicator when polling", () => {
      render(<SyncStatus mode="polling" />);

      expect(screen.getByText("Syncing")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveAttribute(
        "aria-label",
        "Sync status: Syncing"
      );
    });

    it("should have blue dot color when polling", () => {
      const { container } = render(<SyncStatus mode="polling" />);

      const dot = container.querySelector("[aria-hidden='true']");
      expect(dot).toHaveClass("bg-sky-400");
    });

    it("should not have pulsing animation when polling", () => {
      const { container } = render(<SyncStatus mode="polling" />);

      const dot = container.querySelector("[aria-hidden='true']");
      expect(dot).not.toHaveClass("animate-pulse");
    });
  });

  describe("local mode", () => {
    it("should render 'Local' with gray indicator when local-only", () => {
      render(<SyncStatus mode="local" />);

      expect(screen.getByText("Local")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveAttribute(
        "aria-label",
        "Sync status: Local"
      );
    });

    it("should have gray dot color when local", () => {
      const { container } = render(<SyncStatus mode="local" />);

      const dot = container.querySelector("[aria-hidden='true']");
      expect(dot).toHaveClass("bg-zinc-400");
    });
  });

  describe("accessibility", () => {
    it("should have status role", () => {
      render(<SyncStatus mode="live" />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should have aria-live polite for screen reader announcements", () => {
      render(<SyncStatus mode="live" />);

      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });

    it("should have descriptive aria-label", () => {
      render(<SyncStatus mode="polling" />);

      expect(screen.getByRole("status")).toHaveAttribute(
        "aria-label",
        "Sync status: Syncing"
      );
    });

    it("should hide decorative dot from screen readers", () => {
      const { container } = render(<SyncStatus mode="live" />);

      const dot = container.querySelector("[aria-hidden='true']");
      expect(dot).toBeInTheDocument();
    });
  });

  describe("custom className", () => {
    it("should accept additional class names", () => {
      render(<SyncStatus mode="live" className="my-custom-class" />);

      const status = screen.getByRole("status");
      expect(status).toHaveClass("my-custom-class");
    });

    it("should merge custom classes with default classes", () => {
      render(<SyncStatus mode="live" className="my-custom-class" />);

      const status = screen.getByRole("status");
      expect(status).toHaveClass("inline-flex");
      expect(status).toHaveClass("my-custom-class");
    });
  });

  describe("visual styling", () => {
    it("should have pill-shaped styling", () => {
      render(<SyncStatus mode="live" />);

      const status = screen.getByRole("status");
      expect(status).toHaveClass("rounded-full");
    });

    it("should have proper padding", () => {
      render(<SyncStatus mode="live" />);

      const status = screen.getByRole("status");
      expect(status).toHaveClass("px-2");
      expect(status).toHaveClass("py-0.5");
    });

    it("should have text styling", () => {
      render(<SyncStatus mode="live" />);

      const status = screen.getByRole("status");
      expect(status).toHaveClass("text-xs");
      expect(status).toHaveClass("font-medium");
    });
  });

  describe("state transitions", () => {
    it("should correctly update when mode changes", () => {
      const { rerender } = render(<SyncStatus mode="local" />);
      
      expect(screen.getByText("Local")).toBeInTheDocument();

      rerender(<SyncStatus mode="polling" />);
      
      expect(screen.getByText("Syncing")).toBeInTheDocument();
      expect(screen.queryByText("Local")).not.toBeInTheDocument();

      rerender(<SyncStatus mode="live" />);
      
      expect(screen.getByText("Live")).toBeInTheDocument();
      expect(screen.queryByText("Syncing")).not.toBeInTheDocument();
    });

    it("should correctly update when connecting state changes", () => {
      const { rerender } = render(<SyncStatus mode="live" isConnecting />);
      
      expect(screen.getByText("Connecting")).toBeInTheDocument();

      rerender(<SyncStatus mode="live" isConnecting={false} />);
      
      expect(screen.getByText("Live")).toBeInTheDocument();
      expect(screen.queryByText("Connecting")).not.toBeInTheDocument();
    });
  });
});
