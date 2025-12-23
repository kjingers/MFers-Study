import { Utensils } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card"

/**
 * Props for DinnerCard component.
 */
export interface DinnerCardProps {
  /** Family/person name assigned for dinner */
  familyName: string | null
  /** Additional notes about dinner (optional) */
  notes: string | null
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
    return null
  }

  return (
    <Card className="mx-4 mt-4">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Utensils className="h-5 w-5 text-accent" />
        <CardTitle className="text-base">Dinner</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg">{familyName}</p>
        {notes && (
          <p className="text-sm text-muted-foreground mt-1">{notes}</p>
        )}
      </CardContent>
    </Card>
  )
}
