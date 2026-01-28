import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Family data structure.
 */
export interface Family {
  /** Unique identifier (UUID) */
  familyId: string;
  /** Display name (e.g., "The Smith Family") */
  name: string;
  /** When the family was registered */
  createdAt: string;
}

/**
 * Family store state interface.
 */
interface FamilyState {
  /** Current family data, or null if not set */
  family: Family | null;
  /** Whether the family setup modal should be shown */
  showSetupModal: boolean;
  /** Set the family data */
  setFamily: (name: string) => void;
  /** Clear family data (for testing/reset) */
  clearFamily: () => void;
  /** Open the setup modal */
  openSetupModal: () => void;
  /** Close the setup modal */
  closeSetupModal: () => void;
  /** Check if family is set up */
  isSetUp: () => boolean;
}

/**
 * Generate a UUID v4.
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Zustand store for family identity.
 * Persists to localStorage so users don't have to re-enter their family name.
 * No authentication - just simple trusted identification for a small group.
 */
export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      family: null,
      showSetupModal: false,

      setFamily: (name: string) => {
        const family: Family = {
          familyId: generateUUID(),
          name: name.trim(),
          createdAt: new Date().toISOString(),
        };
        set({ family, showSetupModal: false });
      },

      clearFamily: () => {
        set({ family: null });
      },

      openSetupModal: () => {
        set({ showSetupModal: true });
      },

      closeSetupModal: () => {
        set({ showSetupModal: false });
      },

      isSetUp: () => {
        return get().family !== null;
      },
    }),
    {
      name: "mfers-family",
    }
  )
);
