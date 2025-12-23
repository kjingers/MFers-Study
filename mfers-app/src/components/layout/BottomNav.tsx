import { BookOpen, Utensils } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

/**
 * Navigation item configuration.
 */
interface NavItem {
  to: string;
  icon: typeof BookOpen;
  label: string;
  ariaLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    icon: BookOpen,
    label: "Week",
    ariaLabel: "View weekly study content",
  },
  {
    to: "/dinner",
    icon: Utensils,
    label: "Dinner",
    ariaLabel: "View dinner schedule",
  },
];

/**
 * Bottom navigation bar for primary app navigation.
 * Uses React Router NavLink for active state management.
 *
 * @example
 * <BottomNav />
 */
export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 h-16 border-t border-border bg-surface safe-area-bottom z-40"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          // Check if this route is active
          const isActive =
            item.to === "/"
              ? location.pathname === "/" || location.pathname.startsWith("/week")
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                "min-w-[64px] min-h-[44px] px-3 py-2",
                "rounded-lg transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-transform duration-150",
                  isActive && "scale-110"
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-accent"
                  aria-hidden="true"
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
