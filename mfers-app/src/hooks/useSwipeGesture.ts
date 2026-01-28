import { useCallback, useRef } from "react";

/**
 * Configuration options for swipe gesture detection.
 */
export interface SwipeGestureOptions {
  /** Minimum distance in pixels to trigger a swipe (default: 50) */
  threshold?: number;
  /** Callback when user swipes left */
  onSwipeLeft?: () => void;
  /** Callback when user swipes right */
  onSwipeRight?: () => void;
}

/**
 * Return type for useSwipeGesture hook.
 */
export interface SwipeGestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * Custom hook for detecting horizontal swipe gestures.
 * Uses native touch events for optimal performance on mobile.
 *
 * @example
 * const swipeHandlers = useSwipeGesture({
 *   threshold: 50,
 *   onSwipeLeft: () => goToNextWeek(),
 *   onSwipeRight: () => goToPreviousWeek(),
 * });
 *
 * return <div {...swipeHandlers}>Content</div>;
 */
export function useSwipeGesture(
  options: SwipeGestureOptions
): SwipeGestureHandlers {
  const { threshold = 50, onSwipeLeft, onSwipeRight } = options;

  // Track touch state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isHorizontalSwipe.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Determine if this is a horizontal or vertical swipe on first significant movement
    if (isHorizontalSwipe.current === null) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Wait for significant movement before deciding
      if (absX > 10 || absY > 10) {
        // Horizontal if X movement is greater than Y movement
        isHorizontalSwipe.current = absX > absY;
      }
    }

    // Prevent default only for horizontal swipes to allow vertical scrolling
    if (isHorizontalSwipe.current === true) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;

      // Only process if this was a horizontal swipe
      if (isHorizontalSwipe.current === true && Math.abs(deltaX) >= threshold) {
        if (deltaX < 0 && onSwipeLeft) {
          // Swiped left (go to next)
          onSwipeLeft();
        } else if (deltaX > 0 && onSwipeRight) {
          // Swiped right (go to previous)
          onSwipeRight();
        }
      }

      // Reset state
      touchStartX.current = null;
      touchStartY.current = null;
      isHorizontalSwipe.current = null;
    },
    [threshold, onSwipeLeft, onSwipeRight]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
