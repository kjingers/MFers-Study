import { RefreshCw } from "lucide-react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

/**
 * Props for PullRefreshIndicator component.
 */
export interface PullRefreshIndicatorProps {
  /** Whether currently refreshing */
  isRefreshing: boolean;
  /** Current pull distance in pixels */
  pullDistance: number;
  /** Threshold distance for activation */
  threshold?: number;
}

/**
 * Visual indicator for pull-to-refresh state.
 * Shows spinner that rotates based on pull distance and spins during refresh.
 *
 * @example
 * <PullRefreshIndicator
 *   isRefreshing={isRefreshing}
 *   pullDistance={pullDistance}
 *   threshold={80}
 * />
 */
export function PullRefreshIndicator({
  isRefreshing,
  pullDistance,
  threshold = 80,
}: PullRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;
  const opacity = Math.min(progress * 1.5, 1);
  const scale = 0.5 + progress * 0.5;

  // Don't show if no pull and not refreshing
  if (pullDistance === 0 && !isRefreshing) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center h-12 overflow-hidden transition-all duration-150"
      style={{
        height: isRefreshing ? 48 : pullDistance * 0.6,
        opacity: isRefreshing ? 1 : opacity,
      }}
      role="status"
      aria-label={isRefreshing ? "Refreshing content" : "Pull to refresh"}
    >
      <RefreshCw
        className={cn(
          "h-6 w-6 text-accent transition-transform",
          isRefreshing && "animate-spin"
        )}
        style={{
          transform: isRefreshing
            ? undefined
            : `rotate(${rotation}deg) scale(${scale})`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Props for PullRefreshContainer component.
 */
export interface PullRefreshContainerProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Whether currently refreshing */
  isRefreshing?: boolean;
  /** Current pull distance in pixels */
  pullDistance?: number;
  /** Threshold distance for activation */
  threshold?: number;
  /** Container children */
  children: ReactNode;
}

/**
 * Container component for pull-to-refresh functionality.
 * Wraps content and shows refresh indicator.
 *
 * @example
 * <PullRefreshContainer
 *   ref={containerRef}
 *   isRefreshing={isRefreshing}
 *   pullDistance={pullDistance}
 * >
 *   <YourContent />
 * </PullRefreshContainer>
 */
export const PullRefreshContainer = forwardRef<
  HTMLDivElement,
  PullRefreshContainerProps
>(
  (
    {
      isRefreshing = false,
      pullDistance = 0,
      threshold = 80,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen overflow-y-auto overscroll-contain",
          className
        )}
        {...props}
      >
        <PullRefreshIndicator
          isRefreshing={isRefreshing}
          pullDistance={pullDistance}
          threshold={threshold}
        />
        {children}
      </div>
    );
  }
);
PullRefreshContainer.displayName = "PullRefreshContainer";
