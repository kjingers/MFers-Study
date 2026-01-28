import { Minus, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useRSVPsQuery, useSubmitRSVP } from "../../hooks/useRSVPQuery";
import { useFamilyStore } from "../../store";
import type { RSVP } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

/**
 * Props for RSVPSection component.
 */
export interface RSVPSectionProps {
  /** Week ID to manage RSVPs for */
  weekId: string;
}

/**
 * Counter component for adults/kids.
 */
function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center font-medium">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Internal form state for RSVP.
 */
interface RSVPFormState {
  attending: boolean | null;
  adults: number;
  kids: number;
  /** Track the RSVP ID we initialized from (to detect when to reset) */
  initializedFrom: string | null;
}

/**
 * Get initial form state from existing RSVP or defaults.
 */
function getInitialFormState(existingRSVP: RSVP | undefined): RSVPFormState {
  if (existingRSVP) {
    return {
      attending: existingRSVP.attending,
      adults: existingRSVP.adults,
      kids: existingRSVP.kids,
      initializedFrom: existingRSVP.familyId + existingRSVP.updatedAt,
    };
  }
  return {
    attending: null,
    adults: 1,
    kids: 0,
    initializedFrom: null,
  };
}

/**
 * RSVP form for the current family.
 */
function RSVPForm({ weekId }: { weekId: string }) {
  const { family, openSetupModal } = useFamilyStore();
  const { data: summary } = useRSVPsQuery(weekId);
  const submitRSVP = useSubmitRSVP();

  // Find existing RSVP for this family
  const existingRSVP = summary?.rsvps.find(
    (r) => r.familyId === family?.familyId
  );

  // Form state - reset when existingRSVP changes (via key)
  const existingKey = existingRSVP 
    ? existingRSVP.familyId + existingRSVP.updatedAt 
    : "new";
  const initialState = useMemo(
    () => getInitialFormState(existingRSVP),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingKey]
  );

  const [attending, setAttending] = useState<boolean | null>(initialState.attending);
  const [adults, setAdults] = useState(initialState.adults);
  const [kids, setKids] = useState(initialState.kids);
  const [stateKey, setStateKey] = useState(existingKey);

  // Reset state when existingRSVP changes (key pattern without useEffect)
  if (stateKey !== existingKey) {
    setStateKey(existingKey);
    setAttending(initialState.attending);
    setAdults(initialState.adults);
    setKids(initialState.kids);
  }

  // Derive hasChanges from current state vs existing (no useEffect needed)
  const hasChanges = useMemo(() => {
    if (existingRSVP) {
      return (
        attending !== existingRSVP.attending ||
        adults !== existingRSVP.adults ||
        kids !== existingRSVP.kids
      );
    }
    return attending !== null;
  }, [attending, adults, kids, existingRSVP]);

  // If no family is set, prompt to set up
  if (!family) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground mb-2">
          Set up your family to RSVP
        </p>
        <Button onClick={openSetupModal} size="sm">
          Set Up Family
        </Button>
      </div>
    );
  }

  const handleSubmit = () => {
    if (attending === null) return;

    submitRSVP.mutate({
      weekId,
      familyId: family.familyId,
      familyName: family.name,
      attending,
      adults: attending ? adults : 0,
      kids: attending ? kids : 0,
    });
    // hasChanges is derived and will update automatically after mutation success
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">{family.name}</span>
        {existingRSVP && (
          <span className="text-xs text-muted-foreground">
            {existingRSVP.attending ? "Attending" : "Not attending"}
          </span>
        )}
      </div>

      {/* Attending toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={attending === true ? "default" : "outline"}
          className="flex-1"
          onClick={() => setAttending(true)}
        >
          Yes, we're coming!
        </Button>
        <Button
          type="button"
          variant={attending === false ? "secondary" : "outline"}
          className="flex-1"
          onClick={() => setAttending(false)}
        >
          Can't make it
        </Button>
      </div>

      {/* Head count */}
      {attending && (
        <div className="space-y-3 pt-2">
          <Counter label="Adults" value={adults} onChange={setAdults} min={1} />
          <Counter label="Kids" value={kids} onChange={setKids} />
        </div>
      )}

      {/* Submit button */}
      {hasChanges && attending !== null && (
        <Button
          onClick={handleSubmit}
          className="w-full"
          isLoading={submitRSVP.isPending}
        >
          {existingRSVP ? "Update RSVP" : "Submit RSVP"}
        </Button>
      )}
    </div>
  );
}

/**
 * Attendance summary showing who's coming.
 */
function AttendanceSummary({ weekId }: { weekId: string }) {
  const { data: summary, isLoading } = useRSVPsQuery(weekId);

  if (isLoading) {
    return (
      <div className="text-center py-2 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (!summary || summary.rsvps.length === 0) {
    return (
      <div className="text-center py-2 text-muted-foreground text-sm">
        No RSVPs yet. Be the first!
      </div>
    );
  }

  const attendingFamilies = summary.rsvps.filter((r) => r.attending);
  const notAttending = summary.rsvps.filter((r) => !r.attending);

  return (
    <div className="space-y-3">
      {/* Summary stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Expected attendance:</span>
        <span className="font-medium">
          {summary.totalAdults} adults, {summary.totalKids} kids
        </span>
      </div>

      {/* Attending list */}
      {attendingFamilies.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Coming ({attendingFamilies.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {attendingFamilies.map((rsvp) => (
              <AttendanceBadge key={rsvp.familyId} rsvp={rsvp} />
            ))}
          </div>
        </div>
      )}

      {/* Not attending */}
      {notAttending.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Not coming ({notAttending.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {notAttending.map((rsvp) => (
              <span
                key={rsvp.familyId}
                className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs"
              >
                {rsvp.familyName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Badge showing a family's attendance.
 */
function AttendanceBadge({ rsvp }: { rsvp: RSVP }) {
  const count = rsvp.adults + rsvp.kids;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">
      <span>{rsvp.familyName}</span>
      {count > 0 && (
        <span className="text-accent/70">({count})</span>
      )}
    </span>
  );
}

/**
 * Complete RSVP section with form and summary.
 */
export function RSVPSection({ weekId }: RSVPSectionProps) {
  return (
    <Card className="mx-4 mt-4">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Users className="h-5 w-5 text-accent" aria-hidden="true" />
        <CardTitle className="text-base">Who's Coming?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RSVPForm weekId={weekId} />
        <div className="border-t border-border pt-4">
          <AttendanceSummary weekId={weekId} />
        </div>
      </CardContent>
    </Card>
  );
}
