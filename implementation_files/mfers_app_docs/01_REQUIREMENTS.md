# Requirements

## Core (MVP)
### Week-centric viewing
- Show a single **Week** page by default (the “current” week).
- Week navigation:
  - Previous / Next week
  - Week selector list (past/current/upcoming)
- Show:
  - Reading assignment text (e.g., `John 3:1–15`)
  - Discussion questions (numbered list; collapsible cards)

### Meal coordination
- For each week, display:
  - Meal volunteer (family name) + optional meal notes
  - Headcount (simple total for MVP; can evolve later)

## Study definition
- A **Study** is a date range (inclusive) that contains **all Tuesdays** in range.
- Study can include “no meeting” weeks (optional flag per week).

## Bible reference linking (Phase)
- Detect Bible references in:
  - Reading assignment
  - Question text
- Render references as clickable links.
- Clicking opens a **Bible passage modal/sheet** with:
  - Translation selector (default NIV; plus KJV, MSG)
  - Passage text (verse numbers + readable typography)

## Non-functional
- Mobile-first layout (readability, thumb reach, large tap targets)
- Fast load (cache week data; prefetch adjacent weeks)
- Accessibility: keyboard + screen-reader-friendly modals/dialogs
- Cost: fits comfortably within Azure monthly credits
