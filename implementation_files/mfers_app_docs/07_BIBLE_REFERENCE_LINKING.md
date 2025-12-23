# Bible Reference Linking & Passage Viewer

## What we need
1. Detect references like:
   - `John 3:1-15`
   - `John 3:16`
   - `1 John 1:1–4`
2. Turn references into clickable spans/links.
3. On click, open a modal/sheet and fetch passage text.

## Parsing approach (frontend)
- Build a small parser:
  - Regex to find candidates
  - Normalize to a structured object: `{ book, chapter, verseStart, verseEnd }`
  - Support common punctuation: `:`, `-`, `–`, whitespace
- Render as a “rich text” component:
  - Split string into runs
  - Runs are either plain text or `{type:'ref', ref:...}`

## Passage modal UX
- Mobile: bottom sheet
- Desktop: centered dialog
- Features:
  - Translation selector: NIV default; KJV; MSG
  - Scrollable content
  - Copy/share reference (optional)

## Backend: passage retrieval
**Important:** many translations (e.g., NIV, MSG) have licensing/copyright constraints.
Best practice is to use a Bible text provider API that licenses these translations, and show required attribution.

Two safe options:
- Use a licensed Bible API provider (e.g., API.Bible) for text retrieval.
- If you use an LLM (Foundry model), limit it to **parsing/normalization** and metadata, not generating copyrighted verse text.

## Caching
- Cache per: `{translation, reference}` in:
  - TanStack Query cache (memory)
  - Optional localStorage for recent passages
