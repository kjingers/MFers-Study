/**
 * Tests for useSwipeGesture hook.
 * Tests cover horizontal swipe detection, threshold handling, and vertical swipe ignoring.
 */
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSwipeGesture, type SwipeGestureHandlers } from "./useSwipeGesture";

/**
 * Helper to create a mock TouchEvent with specified coordinates.
 */
function createTouchEvent(
  type: "touchstart" | "touchmove" | "touchend",
  clientX: number,
  clientY: number
): React.TouchEvent {
  const touch = { clientX, clientY };
  return {
    touches: type === "touchend" ? [] : [touch],
    changedTouches: [touch],
    preventDefault: vi.fn(),
  } as unknown as React.TouchEvent;
}

describe("useSwipeGesture", () => {
  describe("swipe left detection", () => {
    it("should call onSwipeLeft when swiping left past threshold", () => {
      const onSwipeLeft = vi.fn();
      const onSwipeRight = vi.fn();

      const { result } = renderHook(() =>
        useSwipeGesture({ threshold: 50, onSwipeLeft, onSwipeRight })
      );

      // Simulate touch start
      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 200, 100));
      });

      // Simulate horizontal movement (more X than Y to be recognized as horizontal)
      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", 180, 102));
      });

      // Simulate touch end (swipe left by 80px)
      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", 120, 105));
      });

      expect(onSwipeLeft).toHaveBeenCalledTimes(1);
      expect(onSwipeRight).not.toHaveBeenCalled();
    });

    it("should not call onSwipeLeft if swipe is shorter than threshold", () => {
      const onSwipeLeft = vi.fn();

      const { result } = renderHook(() =>
        useSwipeGesture({ threshold: 50, onSwipeLeft })
      );

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 200, 100));
      });

      // Horizontal movement to establish direction
      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", 185, 102));
      });

      // Only swipe 30px (less than 50px threshold)
      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", 170, 104));
      });

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });
  });

  describe("swipe right detection", () => {
    it("should call onSwipeRight when swiping right past threshold", () => {
      const onSwipeLeft = vi.fn();
      const onSwipeRight = vi.fn();

      const { result } = renderHook(() =>
        useSwipeGesture({ threshold: 50, onSwipeLeft, onSwipeRight })
      );

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 100, 100));
      });

      // Horizontal movement
      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", 120, 102));
      });

      // Swipe right by 80px
      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", 180, 105));
      });

      expect(onSwipeRight).toHaveBeenCalledTimes(1);
      expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it("should not call onSwipeRight if swipe is shorter than threshold", () => {
      const onSwipeRight = vi.fn();

      const { result } = renderHook(() =>
        useSwipeGesture({ threshold: 50, onSwipeRight })
      );

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 100, 100));
      });

      // Horizontal movement
      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", 115, 102));
      });

      // Only swipe 30px
      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", 130, 104));
      });

      expect(onSwipeRight).not.toHaveBeenCalled();
    });
  });

  describe("vertical swipe ignoring", () => {
    it("should not trigger callbacks for vertical swipes", () => {
      const onSwipeLeft = vi.fn();
      const onSwipeRight = vi.fn();

      const { result } = renderHook(() =>
        useSwipeGesture({ threshold: 50, onSwipeLeft, onSwipeRight })
      );

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 100, 100));
      });

      // Vertical movement (more Y than X)
      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", 102, 130));
      });

      // End with significant Y movement
      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", 105, 200));
      });

      expect(onSwipeLeft).not.toHaveBeenCalled();
      expect(onSwipeRight).not.toHaveBeenCalled();
    });

    it("should allow vertical scrolling by not preventing default on vertical swipes", () => {
      const { result } = renderHook(() =>
        useSwipeGesture({ onSwipeLeft: vi.fn() })
      );

      const moveEvent = createTouchEvent("touchmove", 102, 150);

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 100, 100));
      });

      act(() => {
        result.current.onTouchMove(moveEvent);
      });

      // preventDefault should NOT be called for vertical swipes
      expect(moveEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("threshold behavior", () => {
    it("should use default threshold of 50 when not specified", () => {
      const onSwipeLeft = vi.fn();

      const { result } = renderHook(() =>
        useSwipeGesture({ onSwipeLeft })
      );

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 200, 100));
      });

      // Horizontal movement
      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", 180, 102));
      });

      // Swipe exactly 49px (just under default threshold)
      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", 151, 104));
      });

      expect(onSwipeLeft).not.toHaveBeenCalled();

      // Reset with fresh hook
      const { result: result2 } = renderHook(() =>
        useSwipeGesture({ onSwipeLeft })
      );

      act(() => {
        result2.current.onTouchStart(createTouchEvent("touchstart", 200, 100));
      });

      act(() => {
        result2.current.onTouchMove(createTouchEvent("touchmove", 180, 102));
      });

      // Swipe 51px (just over default threshold)
      act(() => {
        result2.current.onTouchEnd(createTouchEvent("touchend", 149, 104));
      });

      expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    });

    it("should respect custom threshold value", () => {
      const onSwipeLeft = vi.fn();

      const { result } = renderHook(() =>
        useSwipeGesture({ threshold: 100, onSwipeLeft })
      );

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 200, 100));
      });

      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", 150, 102));
      });

      // Swipe 80px (under 100px custom threshold)
      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", 120, 104));
      });

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });
  });

  describe("state reset", () => {
    it("should reset state after each swipe gesture", () => {
      const onSwipeLeft = vi.fn();

      const { result } = renderHook(() =>
        useSwipeGesture({ threshold: 50, onSwipeLeft })
      );

      // First swipe
      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 200, 100));
        result.current.onTouchMove(createTouchEvent("touchmove", 180, 102));
        result.current.onTouchEnd(createTouchEvent("touchend", 100, 104));
      });

      expect(onSwipeLeft).toHaveBeenCalledTimes(1);

      // Second swipe should work independently
      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 200, 100));
        result.current.onTouchMove(createTouchEvent("touchmove", 180, 102));
        result.current.onTouchEnd(createTouchEvent("touchend", 100, 104));
      });

      expect(onSwipeLeft).toHaveBeenCalledTimes(2);
    });
  });

  describe("edge cases", () => {
    it("should handle touchEnd without touchStart gracefully", () => {
      const onSwipeLeft = vi.fn();

      const { result } = renderHook(() =>
        useSwipeGesture({ onSwipeLeft })
      );

      // Should not throw
      act(() => {
        result.current.onTouchEnd(createTouchEvent("touchend", 100, 100));
      });

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it("should handle touchMove without touchStart gracefully", () => {
      const { result } = renderHook(() =>
        useSwipeGesture({ onSwipeLeft: vi.fn() })
      );

      // Should not throw
      act(() => {
        result.current.onTouchMove(createTouchEvent("touchmove", 100, 100));
      });
    });

    it("should work when only onSwipeLeft callback is provided", () => {
      const onSwipeLeft = vi.fn();

      const { result } = renderHook(() =>
        useSwipeGesture({ onSwipeLeft })
      );

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 200, 100));
        result.current.onTouchMove(createTouchEvent("touchmove", 180, 102));
        result.current.onTouchEnd(createTouchEvent("touchend", 100, 104));
      });

      expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    });

    it("should work when only onSwipeRight callback is provided", () => {
      const onSwipeRight = vi.fn();

      const { result } = renderHook(() =>
        useSwipeGesture({ onSwipeRight })
      );

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 100, 100));
        result.current.onTouchMove(createTouchEvent("touchmove", 120, 102));
        result.current.onTouchEnd(createTouchEvent("touchend", 200, 104));
      });

      expect(onSwipeRight).toHaveBeenCalledTimes(1);
    });

    it("should prevent default on horizontal swipes to avoid scrolling", () => {
      const { result } = renderHook(() =>
        useSwipeGesture({ onSwipeLeft: vi.fn() })
      );

      const moveEvent = createTouchEvent("touchmove", 150, 102);

      act(() => {
        result.current.onTouchStart(createTouchEvent("touchstart", 200, 100));
      });

      act(() => {
        result.current.onTouchMove(moveEvent);
      });

      expect(moveEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe("return value", () => {
    it("should return all required touch handlers", () => {
      const { result } = renderHook(() =>
        useSwipeGesture({ onSwipeLeft: vi.fn() })
      );

      expect(result.current).toHaveProperty("onTouchStart");
      expect(result.current).toHaveProperty("onTouchMove");
      expect(result.current).toHaveProperty("onTouchEnd");
      expect(typeof result.current.onTouchStart).toBe("function");
      expect(typeof result.current.onTouchMove).toBe("function");
      expect(typeof result.current.onTouchEnd).toBe("function");
    });
  });
});
