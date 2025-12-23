/**
 * Tests for VerseLink component.
 */
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { VerseLink } from "./VerseLink"
import type { BibleReference } from "@/types/verse"

describe("VerseLink", () => {
  const mockReference: BibleReference = {
    book: "John",
    chapter: 3,
    verseStart: 16,
    verseEnd: null,
    raw: "John 3:16",
  }

  it("should render the verse reference text", () => {
    render(<VerseLink reference={mockReference} onClick={() => {}} />)
    
    expect(screen.getByText("John 3:16")).toBeInTheDocument()
  })

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn()
    render(<VerseLink reference={mockReference} onClick={handleClick} />)
    
    fireEvent.click(screen.getByText("John 3:16"))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("should have accessible aria-label", () => {
    render(<VerseLink reference={mockReference} onClick={() => {}} />)
    
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("aria-label", "Open verse John 3:16")
  })

  it("should render as a button element", () => {
    render(<VerseLink reference={mockReference} onClick={() => {}} />)
    
    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
  })

  it("should stop event propagation on click", () => {
    const handleClick = vi.fn()
    const handleParentClick = vi.fn()
    
    render(
      <div onClick={handleParentClick}>
        <VerseLink reference={mockReference} onClick={handleClick} />
      </div>
    )
    
    fireEvent.click(screen.getByText("John 3:16"))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleParentClick).not.toHaveBeenCalled()
  })

  it("should render verse range references correctly", () => {
    const rangeReference: BibleReference = {
      book: "Romans",
      chapter: 8,
      verseStart: 28,
      verseEnd: 30,
      raw: "Romans 8:28-30",
    }
    
    render(<VerseLink reference={rangeReference} onClick={() => {}} />)
    
    expect(screen.getByText("Romans 8:28-30")).toBeInTheDocument()
  })
})
