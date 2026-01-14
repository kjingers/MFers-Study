import { useCallback, useRef, useState, useEffect, type RefObject } from "react";

/**
 * Pull-to-refresh hook configuration.
 */
export interface UsePullToRefreshOptions {
  /** Callback to execute on refresh */
  onRefresh: () => Promise<void>;
  /** Pull distance threshold to trigger refresh (default: 80px) */
  threshold?: number;
  /** Whether pull-to-refresh is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Pull-to-refresh hook return value.
 */
export interface UsePullToRefreshReturn {
  /** Ref to attach to the scrollable container */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Whether currently refreshing */
  isRefreshing: boolean;
  /** Current pull distance (for UI feedback) */
  pullDistance: number;
  /** Whether pull threshold is reached */
  isThresholdReached: boolean;
}

/**
 * Custom hook for pull-to-refresh functionality.
 * Implements touch gesture detection with proper scroll handling.
 * Respects reduced motion preferences.
 *
 * @example
 * const { containerRef, isRefreshing, pullDistance } = usePullToRefresh({
 *   onRefresh: async () => await refetch(),
 *   threshold: 80,
 * });
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  enabled = true,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Track touch state
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const isThresholdReached = pullDistance >= threshold;

  // Check if user prefers reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, isRefreshing]);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull when scrolled to top
      if (container.scrollTop > 0) return;
      
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;
      
      // Only track if still at top of scroll
      if (container.scrollTop > 0) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }

      const touchY = e.touches[0].clientY;
      const distance = Math.max(0, touchY - touchStartY.current);
      
      // Apply resistance (logarithmic feel)
      const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
      
      if (resistedDistance > 0) {
        // Prevent default scroll when pulling down
        e.preventDefault();
        setPullDistance(resistedDistance);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current) return;
      
      isPulling.current = false;
      
      if (isThresholdReached && !isRefreshing) {
        handleRefresh();
      } else {
        // Animate back to 0 if reduced motion is not preferred
        if (prefersReducedMotion) {
          setPullDistance(0);
        } else {
          // Simple spring back (could be improved with animation frame)
          setPullDistance(0);
        }
      }
    };

    // Passive: false needed to call preventDefault on touchmove
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, isRefreshing, isThresholdReached, handleRefresh, threshold, prefersReducedMotion]);

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    isThresholdReached,
  };
}
