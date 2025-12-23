# Information Architecture & Navigation

## Recommended top-level navigation
Use a **bottom tab bar** (thumb-friendly) with 2–3 destinations:
1. **Week** (default) — “Study” content (reading + questions)
2. **Meal** — volunteer + attendance/headcount
3. *(Optional later)* **Archive** or **Studies**

This pattern maps to well-known mobile UX guidance for persistent tab bars and clear, limited destinations. (NN/g discussion of tab bars and persistence.) 

## Week navigation inside the Week screen
- **Week header** with:
  - Prev / Next chevrons
  - Center title: “Week of Dec 23, 2025”
  - Tapping title opens a **Week Selector** (bottom sheet on mobile; dialog/sidebar on desktop)

## Week Selector (recommended)
A bottom sheet list grouped into:
- Upcoming
- Current (highlighted)
- Past

Include a short secondary line per item (reading reference or topic).

## Content layout for the Week screen
Order matters on mobile:
1. Reading card (compact, tappable to expand/show passage)
2. Questions list (accordion cards)

Add a “**Present mode**” button (optional) to show one question full-screen during discussion.

## Desktop enhancements
- Two-column layout (reading left, questions right) when width >= ~900px
- Week selector can be a sidebar instead of a bottom sheet
