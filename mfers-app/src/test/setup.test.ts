/**
 * Simple test to verify Vitest setup works correctly.
 */
import { describe, expect, it } from "vitest"

describe("Vitest Setup", () => {
  it("should run a basic test", () => {
    expect(1 + 1).toBe(2)
  })

  it("should have access to DOM APIs", () => {
    const div = document.createElement("div")
    div.textContent = "Hello"
    expect(div.textContent).toBe("Hello")
  })

  it("should have jest-dom matchers available", () => {
    const div = document.createElement("div")
    div.textContent = "Hello World"
    document.body.appendChild(div)
    expect(div).toBeInTheDocument()
    document.body.removeChild(div)
  })

  it("should have localStorage available", () => {
    localStorage.setItem("test", "value")
    expect(localStorage.getItem("test")).toBe("value")
  })
})
