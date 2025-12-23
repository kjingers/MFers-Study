import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/**
 * Props for SectionHeader component.
 */
export interface SectionHeaderProps {
  /** Icon to display before the title */
  icon: LucideIcon;
  /** Section title text */
  title: string;
  /** Optional action element (button, link, etc.) */
  action?: ReactNode;
  /** Whether to show the divider line below */
  showDivider?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Standardized section header with icon, title, and optional action.
 * Provides consistent visual hierarchy across all content sections.
 *
 * @example
 * <SectionHeader
 *   icon={BookOpen}
 *   title="Reading"
 *   action={<Button variant="ghost" size="sm">Edit</Button>}
 * />
 */
export function SectionHeader({
  icon: Icon,
  title,
  action,
  showDivider = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
            <Icon
              className="h-5 w-5 text-accent"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {title}
          </h2>
        </div>
        {action && (
          <div className="flex-shrink-0">{action}</div>
        )}
      </div>
      {showDivider && (
        <div
          className="mt-3 border-b border-border"
          role="presentation"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
