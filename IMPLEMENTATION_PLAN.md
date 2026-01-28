# Bible Study App - Implementation Plan

## Overview

Transform the existing Bible study app into a fully functional, polished mobile-first PWA for a small Tuesday evening study group.

## Phase 1: Core Features (P0)

### 1A. Fix Current Week Auto-Navigation
**Status:** In Progress
**Effort:** 2h

- [x] Fix `getCurrentWeekId()` to return next Tuesday (not last)
- [x] Add `findCurrentWeek()` helper for smart week selection
- [ ] Update WeekViewer to properly sync on data load
- [ ] Add "Current Week" badge in navigation

### 1B. Family Identity System
**Status:** Pending
**Effort:** 4h

Simple localStorage-based family identity:
- First visit: Modal asks for family name
- Stored in localStorage + Zustand
- No codes, no auth (trusted small group)

```typescript
interface Family {
  familyId: string      // UUID
  name: string          // "The Smith Family"
  createdAt: string     // ISO date
}
```

### 1C. RSVP System with Head Count
**Status:** Pending
**Effort:** 8h

Data model:
```typescript
interface RSVP {
  partitionKey: string  // weekId
  rowKey: string        // familyId
  familyName: string
  attending: boolean
  adults: number
  kids: number
  updatedAt: string
}
```

Features:
- RSVP form (attending?, adults count, kids count)
- Total head count display
- List of attending families
- Azure Table Storage persistence

API endpoints:
- `GET /api/rsvp/{weekId}` - Get all RSVPs for a week
- `POST /api/rsvp` - Create/update RSVP

### 1D. Live Question Sync (Azure SignalR)
**Status:** Pending
**Effort:** 12h

Architecture:
```
User taps question → POST /api/highlight → SignalR broadcast → All devices update
```

Implementation:
1. Azure SignalR Service (free tier: 20K msg/day)
2. Negotiation endpoint: `POST /api/negotiate`
3. Broadcast endpoint: `POST /api/highlight`
4. React SignalR client with auto-reconnect
5. Fallback to localStorage if SignalR unavailable

---

## Phase 2: Polish & UX (P1)

### 2A. Unified Week View Redesign
**Status:** Pending
**Effort:** 8h

Single-page layout showing:
1. Header with week navigation + current week indicator
2. Reading assignment card with clickable verses
3. Discussion questions with live highlight sync
4. Dinner section with RSVP summary

Design principles:
- Dark theme with warm amber accents
- Card-based layout
- Large touch targets (44px+)
- Smooth animations

### 2B. Functional Bottom Navigation
**Status:** Pending
**Effort:** 2h

Two tabs:
- **Study** - Current week content (default)
- **Schedule** - Week picker + meal calendar

### 2C. Meal Signup
**Status:** Pending
**Effort:** 4h

Let families volunteer to bring dinner:
- Show available weeks
- Signup with optional meal notes
- Admin can assign if needed

### 2D. Mobile UX Polish
**Status:** Pending
**Effort:** 8h

- Horizontal swipe between weeks
- Pull-to-refresh
- Haptic feedback on interactions
- Smooth transitions and animations
- Better loading states

---

## Phase 3: PWA & Offline (P2)

### 3A. Service Worker
**Status:** Pending
**Effort:** 4h

- Cache app shell
- Cache verse lookups
- Offline indicator
- Background sync for RSVPs

---

## Phase 4: Final Polish

### 4A. Testing & Verification
- Run all unit tests
- Manual mobile testing
- Verify deployment

### 4B. Documentation
- Update README
- Add user guide

---

## Technical Decisions

### Why SignalR over alternatives?
- Native Azure integration (already using Azure SWA)
- Free tier sufficient (20K messages/day)
- Simple client API
- Auto-reconnect built-in

### Why no auth?
- Small trusted group (8-12 people)
- Complexity not worth it
- Family name in localStorage sufficient

### Why unified view over tabs?
- Everything needed is on one screen
- Reduces navigation friction
- Better for quick phone glances during study

---

## Mock Data Updates Needed

Current mock weeks end at 2026-01-06. Need to add more weeks for testing:
- 2026-01-13
- 2026-01-20
- 2026-01-27
- 2026-02-03
- etc.

---

## Files to Create/Modify

### New Files
- `src/store/family.ts` - Family identity store
- `src/store/rsvp.ts` - RSVP state
- `src/components/family/FamilyModal.tsx` - First-time setup
- `src/components/rsvp/RSVPForm.tsx` - RSVP form
- `src/components/rsvp/AttendanceList.tsx` - Who's coming
- `src/hooks/useSignalR.ts` - SignalR client hook
- `src/hooks/useRSVPQuery.ts` - RSVP data fetching
- `api/src/functions/rsvp.ts` - RSVP API
- `api/src/functions/negotiate.ts` - SignalR negotiation
- `api/src/functions/highlight.ts` - Broadcast highlights

### Modified Files
- `src/hooks/useWeekQuery.ts` - Fixed current week logic
- `src/components/week/WeekViewer.tsx` - Unified view
- `src/components/dinner/DinnerCard.tsx` - Add RSVP display
- `src/store/highlights.ts` - Add SignalR sync
- `src/App.tsx` - Add family modal, routing
- `api/src/functions/weeks.ts` - Add more mock data
