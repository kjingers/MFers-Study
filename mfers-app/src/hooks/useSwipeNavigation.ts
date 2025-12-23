import { useCallback, useRef, useState } from "react";

/**
 * Configuration for swipe navigation behavior.
 */
export interface SwipeConfig {
  /** Minimum distance in pixels to trigger navigation (default: 50) */
  threshold?: number;
  /** Minimum velocity in px/ms to trigger navigation (default: 0.3) */
  velocityThreshold?: number;
  /** Maximum vertical/horizontal ratio to distinguish from scroll (default: 0.5) */
  maxVerticalRatio?: number;
}

/**
 * State returned by the useSwipeNavigation hook.
 */
export interface SwipeState {
  /** Current horizontal offset during active swipe (pixels) */
  offsetX: number;
  /** Whether a swipe is currently in progress */
  isSwiping: boolean;
  /** Direction of current swipe: 'left' | 'right' | null */
  direction: "left" | "right" | null;
  /** Whether the swipe would trigger navigation if released now */
  wouldNavigate: boolean;
}

/**
 * Handlers returned by the hook for attaching to elements.
 */
export interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * Return value of the useSwipeNavigation hook.
 */
export interface UseSwipeNavigationReturn {
  /** Current swipe state */
  state: SwipeState;
  /** Touch event handlers to attach to swipeable element */
  handlers: SwipeHandlers;
  /** CSS style for the transform animation */
  style: React.CSSProperties;
}

const DEFAULT_CONFIG: Required<SwipeConfig> = {
  threshold: 50,
  velocityThreshold: 0.3,
  maxVerticalRatio: 0.5,
};

/**
 * Custom hook for handling horizontal swipe navigation gestures.
 * Distinguishes horizontal swipes from vertical scrolling.
 *
 * @param onSwipeLeft - Callback when user swipes left (navigate next)
 * @param onSwipeRight - Callback when user swipes right (navigate previous)
 * @param canSwipeLeft - Whether left swipe is allowed (has next)
 * @param canSwipeRight - Whether right swipe is allowed (has previous)
 * @param config - Optional configuration overrides
 *
 * @example
 * const { state, handlers, style } = useSwipeNavigation(
 *   () => goNext(),
 *   () => goPrevious(),
 *   hasNext,
 *   hasPrevious
 * );
 *
 * return (
 *   <div {...handlers} style={style}>
 *     {content}
 *   </div>
 * );
 */
export function useSwipeNavigation(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  canSwipeLeft: boolean,
  canSwipeRight: boolean,
  config?: SwipeConfig
): UseSwipeNavigationReturn {
  const {
    threshold,
    velocityThreshold,
    maxVerticalRatio,
  } = { ...DEFAULT_CONFIG, ...config };

  // Touch tracking refs
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  // State for UI updates
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Check for reduced motion preference (lazy init to avoid SSR issues)
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Compute derived state
  const direction =
    offsetX > 0 ? "right" : offsetX < 0 ? "left" : null;
  
  const wouldNavigate =
    (direction === "left" && canSwipeLeft && Math.abs(offsetX) >= threshold) ||
    (direction === "right" && canSwipeRight && Math.abs(offsetX) >= threshold);

  // Apply resistance when swiping in a disabled direction
  const getResistance = useCallback(
    (offset: number): number => {
      if (offset > 0 && !canSwipeRight) {
        // Swiping right but can't go previous - apply strong resistance
        return Math.sqrt(Math.abs(offset)) * 2;
      }
      if (offset < 0 && !canSwipeLeft) {
        // Swiping left but can't go next - apply strong resistance
        return -Math.sqrt(Math.abs(offset)) * 2;
      }
      return offset;
    },
    [canSwipeLeft, canSwipeRight]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    startTime.current = Date.now();
    isHorizontalSwipe.current = null;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwiping) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = touch.clientY - startY.current;

      // Determine if this is a horizontal or vertical gesture
      if (isHorizontalSwipe.current === null) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Need enough movement to determine direction
        if (absX < 10 && absY < 10) return;

        // Check if primarily horizontal
        const ratio = absY / (absX || 1);
        isHorizontalSwipe.current = ratio < maxVerticalRatio;
      }

      // Only handle horizontal swipes
      if (isHorizontalSwipe.current) {
        // Prevent default scroll behavior for horizontal swipes
        e.preventDefault();
        setOffsetX(getResistance(deltaX));
      }
    },
    [isSwiping, maxVerticalRatio, getResistance]
  );

  const handleTouchEnd = useCallback(
    () => {
      if (!isSwiping) return;

      const endTime = Date.now();
      const duration = endTime - startTime.current;
      const velocity = Math.abs(offsetX) / (duration || 1);

      // Check if swipe qualifies for navigation
      const passesThreshold = Math.abs(offsetX) >= threshold;
      const passesVelocity = velocity >= velocityThreshold;
      const shouldNavigate = passesThreshold || passesVelocity;

      if (shouldNavigate && isHorizontalSwipe.current) {
        if (offsetX < 0 && canSwipeLeft) {
          onSwipeLeft();
        } else if (offsetX > 0 && canSwipeRight) {
          onSwipeRight();
        }
      }

      // Reset state
      setOffsetX(0);
      setIsSwiping(false);
      isHorizontalSwipe.current = null;
    },
    [
      isSwiping,
      offsetX,
      threshold,
      velocityThreshold,
      canSwipeLeft,
      canSwipeRight,
      onSwipeLeft,
      onSwipeRight,
    ]
  );

  // Build handlers object
  const handlers: SwipeHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  // Build style for transform
  const style: React.CSSProperties = {
    transform: isSwiping ? `translateX(${offsetX}px)` : "translateX(0)",
    transition: isSwiping
      ? "none"
      : prefersReducedMotion
        ? "transform 0ms"
        : "transform 200ms ease-out",
    touchAction: "pan-y", // Allow vertical scroll, handle horizontal
  };

  // Return state and handlers
  const state: SwipeState = {
    offsetX,
    isSwiping,
    direction,
    wouldNavigate,
  };

  return { state, handlers, style };
}
