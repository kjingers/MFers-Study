/**
 * Unit tests for Bible verse reference parser.
 * Tests cover all functions in verse-parser.ts
 */
import type { BibleReference } from "@/types/verse"
import { describe, expect, it } from "vitest"
import {
    formatReference,
    normalizeBook,
    parseTextWithReferences,
    parseVerseReferences,
} from "./verse-parser"

describe("normalizeBook", () => {
  it("should capitalize a single word book name", () => {
    expect(normalizeBook("john")).toBe("John")
    expect(normalizeBook("JOHN")).toBe("John")
    expect(normalizeBook("JoHn")).toBe("John")
  })

  it("should handle numbered books with space", () => {
    expect(normalizeBook("1 john")).toBe("1 John")
    expect(normalizeBook("2 corinthians")).toBe("2 Corinthians")
    expect(normalizeBook("3 john")).toBe("3 John")
  })

  it("should handle numbered books without space", () => {
    expect(normalizeBook("1john")).toBe("1 John")
    expect(normalizeBook("2corinthians")).toBe("2 Corinthians")
  })

  it("should preserve proper capitalization", () => {
    expect(normalizeBook("John")).toBe("John")
    expect(normalizeBook("1 John")).toBe("1 John")
  })

  it("should trim whitespace", () => {
    expect(normalizeBook("  john  ")).toBe("John")
    expect(normalizeBook(" 1 john ")).toBe("1 John")
  })
})

describe("parseVerseReferences", () => {
  describe("single verse references", () => {
    it("should parse a single verse reference", () => {
      const result = parseVerseReferences("John 3:16")
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        book: "John",
        chapter: 3,
        verseStart: 16,
        verseEnd: null,
        raw: "John 3:16",
      })
    })

    it("should parse a numbered book", () => {
      const result = parseVerseReferences("1 John 1:9")
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        book: "1 John",
        chapter: 1,
        verseStart: 9,
        verseEnd: null,
        raw: "1 John 1:9",
      })
    })

    it("should parse 2 Timothy", () => {
      const result = parseVerseReferences("2 Timothy 3:16")
      expect(result).toHaveLength(1)
      expect(result[0].book).toBe("2 Timothy")
    })
  })

  describe("verse range references", () => {
    it("should parse a verse range with hyphen", () => {
      const result = parseVerseReferences("Romans 8:28-30")
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        book: "Romans",
        chapter: 8,
        verseStart: 28,
        verseEnd: 30,
        raw: "Romans 8:28-30",
      })
    })

    it("should parse a verse range with en-dash", () => {
      const result = parseVerseReferences("Romans 8:28–30")
      expect(result).toHaveLength(1)
      expect(result[0].verseEnd).toBe(30)
    })

    it("should parse 1 Corinthians verse range", () => {
      const result = parseVerseReferences("1 Corinthians 13:4-7")
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        book: "1 Corinthians",
        chapter: 13,
        verseStart: 4,
        verseEnd: 7,
        raw: "1 Corinthians 13:4-7",
      })
    })
  })

  describe("multiple references", () => {
    it("should parse multiple references in text", () => {
      const result = parseVerseReferences(
        "Read John 3:16 and Romans 8:28 today"
      )
      expect(result).toHaveLength(2)
      expect(result[0].book).toBe("John")
      expect(result[1].book).toBe("Romans")
    })

    it("should parse mixed single and range references", () => {
      const result = parseVerseReferences(
        "John 3:16 is popular, but also read John 3:1-15"
      )
      expect(result).toHaveLength(2)
      expect(result[0].verseEnd).toBeNull()
      expect(result[1].verseEnd).toBe(15)
    })
  })

  describe("edge cases", () => {
    it("should return empty array for text without references", () => {
      const result = parseVerseReferences("Hello world, no verses here")
      expect(result).toHaveLength(0)
    })

    it("should handle empty string", () => {
      const result = parseVerseReferences("")
      expect(result).toHaveLength(0)
    })

    it("should handle references at start of text", () => {
      const result = parseVerseReferences("John 3:16 is a famous verse")
      expect(result).toHaveLength(1)
      expect(result[0].raw).toBe("John 3:16")
    })

    it("should handle references at end of text", () => {
      const result = parseVerseReferences("A famous verse is John 3:16")
      expect(result).toHaveLength(1)
      expect(result[0].book).toBe("John")
      expect(result[0].chapter).toBe(3)
      expect(result[0].verseStart).toBe(16)
    })
  })
})

describe("parseTextWithReferences", () => {
  it("should parse text with single reference", () => {
    const result = parseTextWithReferences("Read John 3:16 today")
    expect(result).toHaveLength(3)
    // Note: regex captures space before reference, so "Read" not "Read "
    expect(result[0].type).toBe("text")
    expect(result[1].type).toBe("reference")
    expect(result[2].type).toBe("text")
  })

  it("should parse text starting with a reference", () => {
    const result = parseTextWithReferences("John 3:16 is important")
    expect(result).toHaveLength(2)
    expect(result[0].type).toBe("reference")
    expect(result[1]).toEqual({ type: "text", content: " is important" })
  })

  it("should parse text ending with a reference", () => {
    const result = parseTextWithReferences("Important verse: John 3:16")
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ type: "text", content: "Important verse: " })
    expect(result[1].type).toBe("reference")
  })

  it("should handle text with no references", () => {
    const result = parseTextWithReferences("No verses here")
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ type: "text", content: "No verses here" })
  })

  it("should handle empty string", () => {
    const result = parseTextWithReferences("")
    expect(result).toHaveLength(0)
  })

  it("should parse multiple references correctly", () => {
    const result = parseTextWithReferences(
      "Compare John 3:16 with Romans 5:8"
    )
    expect(result).toHaveLength(4)
    expect(result[0].type).toBe("text")
    expect(result[1].type).toBe("reference")
    expect(result[2].type).toBe("text")
    expect(result[3].type).toBe("reference")
  })

  it("should include reference data in reference segments", () => {
    const result = parseTextWithReferences("Read John 3:16-17")
    const refSegment = result.find((s) => s.type === "reference")
    expect(refSegment).toBeDefined()
    if (refSegment && refSegment.type === "reference") {
      expect(refSegment.reference.book).toBe("John")
      expect(refSegment.reference.chapter).toBe(3)
      expect(refSegment.reference.verseStart).toBe(16)
      expect(refSegment.reference.verseEnd).toBe(17)
    }
  })
})

describe("formatReference", () => {
  it("should format single verse reference", () => {
    const ref: BibleReference = {
      book: "John",
      chapter: 3,
      verseStart: 16,
      verseEnd: null,
      raw: "John 3:16",
    }
    expect(formatReference(ref)).toBe("John 3:16")
  })

  it("should format verse range reference", () => {
    const ref: BibleReference = {
      book: "Romans",
      chapter: 8,
      verseStart: 28,
      verseEnd: 30,
      raw: "Romans 8:28-30",
    }
    expect(formatReference(ref)).toBe("Romans 8:28-30")
  })

  it("should format numbered book reference", () => {
    const ref: BibleReference = {
      book: "1 John",
      chapter: 1,
      verseStart: 9,
      verseEnd: null,
      raw: "1 John 1:9",
    }
    expect(formatReference(ref)).toBe("1 John 1:9")
  })

  it("should format numbered book with verse range", () => {
    const ref: BibleReference = {
      book: "1 Corinthians",
      chapter: 13,
      verseStart: 4,
      verseEnd: 7,
      raw: "1 Corinthians 13:4-7",
    }
    expect(formatReference(ref)).toBe("1 Corinthians 13:4-7")
  })
})
