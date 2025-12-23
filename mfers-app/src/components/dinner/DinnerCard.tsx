import { Utensils } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { SectionHeader } from "../ui/section-header";

/**
 * Props for DinnerCard component.
 */
export interface DinnerCardProps {
  /** Family/person name assigned for dinner */
  familyName: string | null;
  /** Additional notes about dinner (optional) */
  notes: string | null;
}

/**
 * Simple card showing who's bringing dinner.
 * Returns null if no family is assigned.
 *
 * @example
 * <DinnerCard familyName="The Smith Family" notes="Bringing tacos" />
 */
export function DinnerCard({ familyName, notes }: DinnerCardProps) {
  // Don't render if no family assigned
  if (!familyName) {
    return null;
  }

  return (
    <section className="mx-4 mt-6">
      <SectionHeader icon={Utensils} title="Dinner" />
      <Card>
        <CardContent className="pt-4">
          <p className="text-lg font-medium">{familyName}</p>
          {notes && (
            <p className="text-sm text-muted-foreground mt-1">{notes}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
