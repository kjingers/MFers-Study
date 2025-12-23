import { UtensilsCrossed, MapPin, Clock, ChevronRight, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Upcoming dinner event interface.
 */
interface DinnerEvent {
  id: string;
  date: Date;
  host: string;
  location: string;
  time: string;
  isNextUp: boolean;
}

/**
 * Mock dinner events - in production these would come from an API.
 */
const MOCK_DINNERS: DinnerEvent[] = [
  {
    id: "1",
    date: new Date("2025-01-21"),
    host: "The Smiths",
    location: "123 Main St",
    time: "6:30 PM",
    isNextUp: true,
  },
  {
    id: "2",
    date: new Date("2025-01-28"),
    host: "The Johnsons",
    location: "456 Oak Ave",
    time: "6:30 PM",
    isNextUp: false,
  },
  {
    id: "3",
    date: new Date("2025-02-04"),
    host: "The Williams",
    location: "789 Pine Rd",
    time: "6:30 PM",
    isNextUp: false,
  },
];

/**
 * Format a date as "Tuesday, Jan 21".
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Individual dinner event card.
 */
function DinnerEventCard({ event }: { event: DinnerEvent }) {
  return (
    <Card
      className={cn(
        "p-4 transition-colors",
        event.isNextUp && "border-accent bg-accent/5"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Date indicator */}
        <div
          className={cn(
            "flex flex-col items-center justify-center",
            "w-14 h-14 rounded-xl",
            event.isNextUp ? "bg-accent text-accent-foreground" : "bg-muted"
          )}
        >
          <span className="text-xs font-medium uppercase">
            {event.date.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-xl font-bold">{event.date.getDate()}</span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {event.isNextUp && (
              <span className="px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full">
                Next Up
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {formatDate(event.date)}
            </span>
          </div>
          <h3 className="font-semibold text-foreground truncate">
            {event.host}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {event.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {event.time}
            </span>
          </div>
        </div>

        {/* Action indicator */}
        <ChevronRight
          className="h-5 w-5 text-muted-foreground flex-shrink-0 self-center"
          aria-hidden="true"
        />
      </div>
    </Card>
  );
}

/**
 * Dinner schedule page showing upcoming Tuesday dinners.
 *
 * @example
 * <DinnerSchedule />
 */
export function DinnerSchedule() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <UtensilsCrossed className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Dinner Schedule</h1>
              <p className="text-xs text-muted-foreground">
                Tuesday Fellowship Meals
              </p>
            </div>
          </div>
          <button
            className={cn(
              "flex items-center gap-1.5 px-3 py-2",
              "text-sm font-medium text-accent",
              "rounded-lg hover:bg-accent/10 transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            )}
            aria-label="View calendar"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Calendar
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="max-w-lg mx-auto">
          {/* Upcoming section */}
          <section aria-labelledby="upcoming-heading">
            <h2
              id="upcoming-heading"
              className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4"
            >
              Upcoming Dinners
            </h2>
            <div className="space-y-3">
              {MOCK_DINNERS.map((event) => (
                <DinnerEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>

          {/* Empty state placeholder for when no dinners are scheduled */}
          {MOCK_DINNERS.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <UtensilsCrossed
                  className="h-8 w-8 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Upcoming Dinners
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Check back later for the next Tuesday dinner schedule.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DinnerSchedule;
