# Implementation Plan (Updated)

## Phase 0 — Repo scaffolding
- Create SWA + Functions monorepo
- Add lint/format: ESLint + Prettier
- Add CI: typecheck + unit tests
- Add a basic component library (shadcn/ui) and Tailwind
- Add TanStack Query + React Router

## Phase 1 — Week viewer (must be excellent)
- Route: `/` => current week
- Week header with:
  - Prev/Next
  - Week selector sheet
- Reading card
  - Detect and link references
  - “View passage” opens modal/sheet
- Questions list (accordion cards)
  - “Present mode” optional (full-screen question)

## Phase 2 — Meal + attendance
- Meal tab
- Headcount modal (simple stepper)
- Optional: family breakdown later

## Phase 3 — Study management
- Create/Archive studies
- Generate Tuesdays in range (server-side)
- Handle “no meeting” weeks explicitly

## Phase 4 — Polish
- PWA offline caching
- Share link to a specific week
- Admin edit mode + audit fields
