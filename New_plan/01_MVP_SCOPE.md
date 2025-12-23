# MVP Scope Definition

## Overview

This document defines the precise boundaries of the Minimum Viable Product (MVP) for the MFers Bible Study App. Features are categorized as **MVP**, **Post-MVP**, or **Future Vision**.

---

## Feature Matrix

### ✅ MVP Features (Must Have)

#### 1. Week Navigation
| Feature | Description | Acceptance Criteria |
|---------|-------------|---------------------|
| Current Week Auto-Detection | App opens to the current study week (Tuesday-anchored) | User sees this week's content on launch |
| Previous/Next Navigation | Chevron buttons to move between weeks | Buttons work; disabled at boundaries |
| Week Header Display | Shows "Week of [Date]" in readable format | Date formatted as "Week of Dec 23, 2025" |

#### 2. Reading Assignment Display
| Feature | Description | Acceptance Criteria |
|---------|-------------|---------------------|
| Reading Card | Displays the week's Bible reading assignment | Shows reference (e.g., "John 3:1-15") |
| Verse Reference Detection | Auto-detects Bible references in text | Regex matches standard formats |
| Clickable References | Detected references become tappable links | Visual affordance (underline/color) |

#### 3. Discussion Questions
| Feature | Description | Acceptance Criteria |
|---------|-------------|---------------------|
| Question List | Numbered list of discussion questions | Questions display with numbers |
| Question Highlight | Tap question to highlight/bold it | Toggle state; visual feedback |
| Multiple Highlights | Allow multiple questions highlighted | No limit on selections |

#### 4. Bible Verse Modal
| Feature | Description | Acceptance Criteria |
|---------|-------------|---------------------|
| Modal Trigger | Clicking a verse reference opens modal | Modal opens with verse content |
| Translation Tabs | 4 tabs: NIV (default), KJV, MSG, ESV | Tab switching works; NIV is default |
| Verse Display | Readable typography with verse numbers | Clear, accessible text |
| Close Action | Dismiss modal via X button or backdrop | Both methods work |

#### 5. Dinner Tracker
| Feature | Description | Acceptance Criteria |
|---------|-------------|---------------------|
| Dinner Display | Shows who is bringing dinner this week | Family name visible on Week screen |
| Meal Notes | Optional notes (e.g., "Pizza night") | Notes display if present |

---

### 🔜 Post-MVP Features (Phase 2)

| Feature | Description | Priority |
|---------|-------------|----------|
| Week Selector Sheet | Bottom sheet with grouped week list | High |
| Attendance/Headcount | Simple count of attendees per week | High |
| Present Mode | Full-screen single question display | Medium |
| PWA Offline | Cache week data for offline access | Medium |
| Share Week Link | Generate shareable URL for a week | Medium |

---

### 🔮 Future Vision (Phase 3+)

| Feature | Description |
|---------|-------------|
| User Authentication | Optional access code or Azure AD B2C |
| Admin Edit Mode | In-app editing of weeks/questions |
| Study Management | Create, archive, and manage studies |
| Family Attendance | Per-family attendance tracking |
| Push Notifications | Reminders for upcoming meetings |
| Notes/Journaling | Personal notes on questions |
| Prayer Requests | Shared prayer request list |

---

## User Stories (MVP)

### US-001: View Current Week
```
AS A study group member
I WANT TO see the current week's content when I open the app
SO THAT I can quickly access today's study material
```

**Acceptance Criteria:**
- [ ] App loads to current week based on Tuesday anchor
- [ ] Reading assignment is visible
- [ ] Questions are listed below reading

---

### US-002: Navigate Between Weeks
```
AS A study group member
I WANT TO navigate to previous or next weeks
SO THAT I can review past content or prepare ahead
```

**Acceptance Criteria:**
- [ ] Previous button navigates to prior week
- [ ] Next button navigates to following week
- [ ] Buttons disabled at study boundaries

---

### US-003: Highlight Discussion Question
```
AS A study leader
I WANT TO tap a question to highlight it
SO THAT the group knows which question we're discussing
```

**Acceptance Criteria:**
- [ ] Tapping question toggles highlight state
- [ ] Highlighted question has bold/color treatment
- [ ] Multiple questions can be highlighted

---

### US-004: Read Bible Verse
```
AS A study group member
I WANT TO tap a verse reference to see the full text
SO THAT I can read the passage without leaving the app
```

**Acceptance Criteria:**
- [ ] Verse references are visually distinct (clickable)
- [ ] Clicking opens a modal with verse text
- [ ] Modal has translation tabs (NIV, KJV, MSG, ESV)
- [ ] NIV is the default translation

---

### US-005: See Dinner Assignment
```
AS A study group member
I WANT TO see who is bringing dinner this week
SO THAT I know what to expect for the meal
```

**Acceptance Criteria:**
- [ ] Dinner info visible on Week screen
- [ ] Shows family name and optional notes

---

## Non-Functional Requirements (MVP)

### Performance
| Requirement | Target |
|-------------|--------|
| Initial Load (4G) | < 2 seconds |
| Time to Interactive | < 3 seconds |
| Verse Modal Load | < 500ms |
| Bundle Size (gzipped) | < 200KB |

### Accessibility
| Requirement | Target |
|-------------|--------|
| Touch Target Size | ≥ 44px × 44px |
| Color Contrast | WCAG AA (4.5:1) |
| Keyboard Navigation | Full support |
| Screen Reader | Semantic HTML + ARIA |

### Compatibility
| Platform | Support |
|----------|---------|
| iOS Safari | Last 2 versions |
| Android Chrome | Last 2 versions |
| Desktop Chrome | Last 2 versions |
| Desktop Safari | Last 2 versions |
| Desktop Firefox | Last 2 versions |

---

## Out of Scope (Explicit Exclusions)

| Feature | Reason |
|---------|--------|
| User accounts/login | Adds complexity; not needed for small group |
| Real-time sync | Overkill for read-mostly app |
| Native mobile app | PWA provides sufficient experience |
| Comment/chat features | Out of scope for Bible study focus |
| Bible search | Use modal for specific references only |
| Bookmarking | Post-MVP enhancement |

---

## Data Requirements (MVP)

### Required Entities
1. **Week** — date, reading assignment, dinner info
2. **Question** — text, order, associated week

### Sample Week Data
```json
{
  "weekId": "2025-12-23",
  "weekDate": "2025-12-23T00:00:00Z",
  "readingAssignment": "John 3:1-21",
  "dinnerFamily": "Johnson",
  "dinnerNotes": "Bringing tacos",
  "questions": [
    { "order": 1, "text": "What does it mean to be born again?" },
    { "order": 2, "text": "How does John 3:16 summarize the gospel?" }
  ]
}
```

---

## Technical Constraints

| Constraint | Implication |
|------------|-------------|
| Azure-only infrastructure | Use SWA, Functions, Table Storage |
| No backend database admin | Data seeded via API or scripts |
| Mobile-first | Design for 375px width minimum |
| Bible API licensing | Use licensed provider or Foundry for parsing only |

---

## MVP Exit Criteria

The MVP is complete when:
- [ ] All US-001 through US-005 acceptance criteria pass
- [ ] Performance targets are met
- [ ] Accessibility audit scores > 90
- [ ] Deployed to Azure Static Web Apps
- [ ] Tested on iOS Safari and Android Chrome
