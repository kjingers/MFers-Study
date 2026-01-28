/**
 * RSVP data types for attendance tracking.
 */

/**
 * Represents a family's RSVP for a specific week.
 */
export interface RSVP {
  /** The week this RSVP is for */
  weekId: string;
  /** Unique family identifier */
  familyId: string;
  /** Display name of the family */
  familyName: string;
  /** Whether the family is attending */
  attending: boolean;
  /** Number of adults attending */
  adults: number;
  /** Number of kids attending */
  kids: number;
  /** When this RSVP was last updated */
  updatedAt: string;
}

/**
 * Summary of RSVPs for a week.
 */
export interface RSVPSummary {
  /** The week ID */
  weekId: string;
  /** Total number of families attending */
  totalFamilies: number;
  /** Total number of adults attending */
  totalAdults: number;
  /** Total number of kids attending */
  totalKids: number;
  /** Total people (adults + kids) */
  totalPeople: number;
  /** All RSVPs for this week */
  rsvps: RSVP[];
}

/**
 * Request body for creating/updating an RSVP.
 */
export interface RSVPRequest {
  weekId: string;
  familyId: string;
  familyName: string;
  attending: boolean;
  adults: number;
  kids: number;
}

/**
 * Response from RSVP creation/update.
 */
export interface RSVPResponse {
  rsvp: RSVP;
  summary: RSVPSummary;
}
