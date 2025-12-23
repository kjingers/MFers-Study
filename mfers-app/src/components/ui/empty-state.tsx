import type { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

/**
 * Action configuration for empty state.
 */
export interface EmptyStateAction {
  /** Button label text */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: "default" | "outline" | "ghost";
}

/**
 * Props for EmptyState component.
 */
export interface EmptyStateProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button */
  action?: EmptyStateAction;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

/**
 * Empty state component for displaying when there is no data.
 * Provides visual feedback with icon, message, and optional action.
 *
 * @example
 * <EmptyState
 *   icon={Calendar}
 *   title="No study weeks yet"
 *   description="Check back soon for new content!"
 *   action={{ label: "Refresh", onClick: () => refetch() }}
 * />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-6",
      iconWrapper: "w-12 h-12",
      icon: "h-6 w-6",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-10",
      iconWrapper: "w-16 h-16",
      icon: "h-8 w-8",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      iconWrapper: "w-20 h-20",
      icon: "h-10 w-10",
      title: "text-xl",
      description: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
      role="status"
      aria-label={title}
    >
      {/* Icon container */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted mb-4",
          sizes.iconWrapper
        )}
      >
        <Icon
          className={cn("text-muted-foreground", sizes.icon)}
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h3 className={cn("font-medium text-foreground mb-1", sizes.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "text-muted-foreground max-w-xs mx-auto",
            sizes.description
          )}
        >
          {description}
        </p>
      )}

      {/* Action button */}
      {action && (
        <Button
          variant={action.variant ?? "outline"}
          onClick={action.onClick}
          className="mt-4 min-h-[44px]"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
