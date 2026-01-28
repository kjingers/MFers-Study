import { useState } from "react";
import { Utensils } from "lucide-react";
import { useMealQuery, useMealClaimMutation, useMealReleaseMutation } from "../../hooks/useMealQuery";
import { useFamilyStore } from "../../store";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

/**
 * Props for MealSignup component.
 */
export interface MealSignupProps {
  /** Week ID for meal signup */
  weekId: string;
}

/**
 * Meal signup component for claiming/releasing dinner slots.
 * Shows current assignment or signup form based on state.
 */
export function MealSignup({ weekId }: MealSignupProps) {
  const { family, openSetupModal } = useFamilyStore();
  const { data: meal, isLoading } = useMealQuery(weekId);
  const claimMutation = useMealClaimMutation();
  const releaseMutation = useMealReleaseMutation();

  const [mealNotes, setMealNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Check if current user owns the meal slot
  const isOwner = meal && family && meal.familyId === family.familyId;

  // Handle claiming the meal slot
  const handleClaim = () => {
    if (!family) return;

    claimMutation.mutate(
      {
        weekId,
        familyId: family.familyId,
        familyName: family.name,
        mealNotes: mealNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setMealNotes("");
        },
      }
    );
  };

  // Handle releasing the meal slot
  const handleRelease = () => {
    releaseMutation.mutate(weekId);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="mx-4 mt-4">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Utensils className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle className="text-base">Dinner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-12 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // Slot is claimed
  if (meal) {
    return (
      <Card className="mx-4 mt-4">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Utensils className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle className="text-base">Dinner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-lg">{meal.familyName}</p>
            {meal.mealNotes && (
              <p className="text-sm text-muted-foreground mt-1">{meal.mealNotes}</p>
            )}
          </div>

          {/* Release button for owner */}
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRelease}
              isLoading={releaseMutation.isPending}
              className="w-full min-h-[44px]"
            >
              Release Dinner Slot
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Slot is unclaimed - show signup UI
  return (
    <Card className="mx-4 mt-4">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Utensils className="h-5 w-5 text-accent" aria-hidden="true" />
        <CardTitle className="text-base">Dinner</CardTitle>
      </CardHeader>
      <CardContent>
        {/* No family set up */}
        {!family && (
          <div className="text-center py-2">
            <p className="text-muted-foreground mb-3 text-sm">
              Set up your family to sign up for dinner
            </p>
            <Button onClick={openSetupModal} size="sm" className="min-h-[44px]">
              Set Up Family
            </Button>
          </div>
        )}

        {/* Family set up but form not shown */}
        {family && !showForm && (
          <div className="text-center py-2">
            <p className="text-muted-foreground mb-3 text-sm">
              No one signed up yet
            </p>
            <Button 
              onClick={() => setShowForm(true)} 
              className="min-h-[44px]"
            >
              Sign Up to Bring Dinner
            </Button>
          </div>
        )}

        {/* Signup form */}
        {family && showForm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{family.name}</span>
            </div>

            {/* Meal notes input */}
            <div className="space-y-2">
              <label 
                htmlFor="mealNotes" 
                className="text-sm font-medium"
              >
                What are you bringing? (optional)
              </label>
              <input
                id="mealNotes"
                type="text"
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                placeholder="e.g., Tacos, Lasagna, Pizza"
                className="w-full min-h-[44px] px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setMealNotes("");
                }}
                className="flex-1 min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClaim}
                isLoading={claimMutation.isPending}
                className="flex-1 min-h-[44px]"
              >
                Claim Slot
              </Button>
            </div>

            {/* Error display */}
            {claimMutation.isError && (
              <p className="text-sm text-destructive text-center">
                {claimMutation.error instanceof Error 
                  ? claimMutation.error.message 
                  : "Failed to claim slot"}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
