import { Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../ui/empty-state";

/**
 * Props for DinnerCard component.
 */
export interface DinnerCardProps {
  /** Family/person name assigned for dinner */
  familyName: string | null;
  /** Additional notes about dinner (optional) */
  notes: string | null;
  /** Whether to show empty state when no family assigned */
  showEmpty?: boolean;
}

/**
 * Simple card showing who's bringing dinner.
 * Can show empty state or hide completely when no family assigned.
 *
 * @example
 * <DinnerCard familyName="The Smith Family" notes="Bringing tacos" />
 */
export function DinnerCard({ familyName, notes, showEmpty = false }: DinnerCardProps) {
  // Show empty state or nothing if no family assigned
  if (!familyName) {
    if (showEmpty) {
      return (
        <div className="mx-4 mt-4">
          <EmptyState
            icon={Utensils}
            title="No Dinner Assigned"
            description="No one is assigned to bring dinner this week."
            size="sm"
          />
        </div>
      );
    }
    return null;
  }

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
