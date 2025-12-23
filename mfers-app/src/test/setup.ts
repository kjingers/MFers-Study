/**
 * Vitest setup file for React Testing Library.
 * This file runs before each test file.
 */
import "@testing-library/jest-dom/vitest"

// Mock matchMedia for components that use media queries
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock ResizeObserver for components that use it
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver for lazy loading components
window.IntersectionObserver = class IntersectionObserver {
  root = null
  rootMargin = ""
  thresholds: readonly number[] = []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks()
  
  // Clear localStorage
  localStorage.clear()
})
