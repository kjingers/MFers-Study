import { Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MealSignup } from "./MealSignup";

/**
 * Props for DinnerCard component.
 */
export interface DinnerCardProps {
  /** Week ID for meal signup functionality */
  weekId: string;
  /** Family/person name assigned for dinner (from mock data) */
  familyName: string | null;
  /** Additional notes about dinner (optional) */
  notes: string | null;
}

/**
 * Card showing who's bringing dinner.
 * If no family is assigned from mock data, shows MealSignup for dynamic signups.
 *
 * @example
 * // Pre-assigned dinner
 * <DinnerCard weekId="2025-01-28" familyName="The Smith Family" notes="Bringing tacos" />
 * 
 * // Dynamic signup
 * <DinnerCard weekId="2025-01-28" familyName={null} notes={null} />
 */
export function DinnerCard({ weekId, familyName, notes }: DinnerCardProps) {
  // If no family assigned from mock data, show dynamic signup
  if (!familyName) {
    return <MealSignup weekId={weekId} />;
  }

  // Show static dinner assignment from mock data
  return (
    <Card className="mx-4 mt-4">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Utensils className="h-5 w-5 text-accent" aria-hidden="true" />
        <CardTitle className="text-base">Dinner</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg">{familyName}</p>
        {notes && <p className="text-sm text-muted-foreground mt-1">{notes}</p>}
      </CardContent>
    </Card>
  );
}
