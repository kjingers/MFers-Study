/**
 * Meal signup types for dinner scheduling.
 */

/**
 * Represents a meal signup for a specific week.
 */
export interface MealSignup {
  /** The week this meal signup is for */
  weekId: string;
  /** Unique family identifier */
  familyId: string;
  /** Display name of the family */
  familyName: string;
  /** Notes about what they're bringing (optional) */
  mealNotes?: string;
  /** When this signup was created */
  claimedAt: string;
}

/**
 * Request body for claiming a meal slot.
 */
export interface MealSignupRequest {
  weekId: string;
  familyId: string;
  familyName: string;
  mealNotes?: string;
}

/**
 * Response from meal claim/update.
 */
export interface MealSignupResponse {
  meal: MealSignup;
}
