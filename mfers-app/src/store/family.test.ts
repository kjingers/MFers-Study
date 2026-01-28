/**
 * Tests for family Zustand store.
 * Tests cover family setup, persistence to localStorage, and modal state.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFamilyStore } from "./family";

describe("useFamilyStore", () => {
  // Reset store before each test
  beforeEach(() => {
    // Clear the store state
    useFamilyStore.setState({
      family: null,
      showSetupModal: false,
    });
    // Clear localStorage
    localStorage.clear();
  });

  describe("initial state", () => {
    it("should have null family initially", () => {
      const state = useFamilyStore.getState();
      expect(state.family).toBeNull();
    });

    it("should have showSetupModal as false initially", () => {
      const state = useFamilyStore.getState();
      expect(state.showSetupModal).toBe(false);
    });

    it("should return false for isSetUp when no family", () => {
      const { isSetUp } = useFamilyStore.getState();
      expect(isSetUp()).toBe(false);
    });
  });

  describe("setFamily", () => {
    it("should set family with generated UUID", () => {
      const { setFamily } = useFamilyStore.getState();

      setFamily("The Smith Family");

      const state = useFamilyStore.getState();
      expect(state.family).not.toBeNull();
      expect(state.family?.name).toBe("The Smith Family");
      expect(state.family?.familyId).toBeDefined();
      expect(state.family?.familyId.length).toBeGreaterThan(0);
    });

    it("should set createdAt timestamp", () => {
      const { setFamily } = useFamilyStore.getState();
      const beforeTime = new Date().toISOString();

      setFamily("The Jones Family");

      const state = useFamilyStore.getState();
      expect(state.family?.createdAt).toBeDefined();
      // createdAt should be after or equal to beforeTime
      expect(new Date(state.family!.createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeTime).getTime() - 1000
      );
    });

    it("should trim whitespace from family name", () => {
      const { setFamily } = useFamilyStore.getState();

      setFamily("  The Johnson Family  ");

      const state = useFamilyStore.getState();
      expect(state.family?.name).toBe("The Johnson Family");
    });

    it("should close setup modal when family is set", () => {
      useFamilyStore.setState({ showSetupModal: true });
      const { setFamily } = useFamilyStore.getState();

      setFamily("The Davis Family");

      const state = useFamilyStore.getState();
      expect(state.showSetupModal).toBe(false);
    });

    it("should return true for isSetUp after setting family", () => {
      const { setFamily, isSetUp } = useFamilyStore.getState();

      setFamily("Test Family");

      expect(useFamilyStore.getState().isSetUp()).toBe(true);
    });
  });

  describe("clearFamily", () => {
    it("should clear family data", () => {
      const { setFamily, clearFamily } = useFamilyStore.getState();

      setFamily("The Smith Family");
      expect(useFamilyStore.getState().family).not.toBeNull();

      clearFamily();

      expect(useFamilyStore.getState().family).toBeNull();
    });

    it("should return false for isSetUp after clearing", () => {
      const { setFamily, clearFamily } = useFamilyStore.getState();

      setFamily("Test Family");
      clearFamily();

      expect(useFamilyStore.getState().isSetUp()).toBe(false);
    });
  });

  describe("openSetupModal", () => {
    it("should set showSetupModal to true", () => {
      const { openSetupModal } = useFamilyStore.getState();

      openSetupModal();

      expect(useFamilyStore.getState().showSetupModal).toBe(true);
    });
  });

  describe("closeSetupModal", () => {
    it("should set showSetupModal to false", () => {
      useFamilyStore.setState({ showSetupModal: true });
      const { closeSetupModal } = useFamilyStore.getState();

      closeSetupModal();

      expect(useFamilyStore.getState().showSetupModal).toBe(false);
    });
  });

  describe("modal toggle behavior", () => {
    it("should toggle modal open and closed", () => {
      const { openSetupModal, closeSetupModal } = useFamilyStore.getState();

      expect(useFamilyStore.getState().showSetupModal).toBe(false);

      openSetupModal();
      expect(useFamilyStore.getState().showSetupModal).toBe(true);

      closeSetupModal();
      expect(useFamilyStore.getState().showSetupModal).toBe(false);
    });
  });

  describe("persistence", () => {
    it("should have correct storage key", () => {
      const { setFamily } = useFamilyStore.getState();

      setFamily("The Smith Family");

      // Check localStorage has the correct key
      const stored = localStorage.getItem("mfers-family");
      expect(stored).not.toBeNull();
    });

    it("should persist family to localStorage", () => {
      const { setFamily } = useFamilyStore.getState();

      setFamily("The Persistent Family");

      const stored = localStorage.getItem("mfers-family");
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.family.name).toBe("The Persistent Family");
    });

    it("should have stored data that can be read from localStorage", () => {
      const { setFamily } = useFamilyStore.getState();

      setFamily("The Test Family");

      // Check that data is in localStorage in expected format
      const stored = localStorage.getItem("mfers-family");
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state).toBeDefined();
      expect(parsed.state.family).toBeDefined();
      expect(parsed.state.family.name).toBe("The Test Family");
      expect(parsed.state.family.familyId).toBeDefined();
      expect(parsed.state.family.createdAt).toBeDefined();
    });

    it("should persist cleared family state", () => {
      const { setFamily, clearFamily } = useFamilyStore.getState();

      setFamily("Temporary Family");
      clearFamily();

      const stored = localStorage.getItem("mfers-family");
      const parsed = JSON.parse(stored!);
      expect(parsed.state.family).toBeNull();
    });
  });

  describe("unique IDs", () => {
    it("should generate different familyIds for different families", () => {
      const { setFamily, clearFamily } = useFamilyStore.getState();

      setFamily("Family One");
      const firstId = useFamilyStore.getState().family?.familyId;

      clearFamily();

      setFamily("Family Two");
      const secondId = useFamilyStore.getState().family?.familyId;

      expect(firstId).not.toBe(secondId);
    });
  });
});
