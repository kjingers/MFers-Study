# Implementation Phases with TDD Anchors

## Overview

This document outlines the step-by-step implementation plan for the MFers Bible Study App MVP. Each phase includes specific tasks, TDD anchors, and acceptance criteria.

---

## Phase Summary

| Phase | Duration | Focus Area |
|-------|----------|------------|
| **Phase 0** | 1 week | Repository scaffolding, CI/CD setup |
| **Phase 1** | 2 weeks | Week viewer and navigation |
| **Phase 2** | 2 weeks | Bible verse integration |
| **Phase 3** | 1 week | Polish, testing, deployment |

**Total MVP: ~6 weeks**

---

## Phase 0: Repository Scaffolding

### Status: ✅ COMPLETE

### Objectives
- Set up monorepo structure
- Configure TypeScript, linting, formatting
- Initialize Azure Static Web Apps with Functions
- Set up CI/CD pipeline
- Set up testing framework

### Tasks

#### 0.1 Initialize Monorepo
```
☑ Create GitHub repository
☑ Initialize npm workspace
☑ Create directory structure:
    /src (React frontend)
    /api (Azure Functions)
    /shared (shared types)
```

**TDD Anchor:**
```typescript
describe('project structure', () => {
  it('should have src directory for frontend')
  it('should have api directory for functions')
  it('should have shared types accessible from both')
})
```

#### 0.2 Configure Frontend
```
☑ Initialize Vite + React + TypeScript
☑ Configure Tailwind CSS
☑ Install shadcn/ui CLI
☑ Add base components (button, card, sheet, tabs)
☑ Configure TanStack Query
☑ Configure React Router
```

**TDD Anchor:**
```typescript
describe('frontend setup', () => {
  it('should render App component')
  it('should have QueryClient provider')
  it('should have Router provider')
})
```

#### 0.3 Configure Backend
```
☑ Initialize Azure Functions (Node.js v4)
☑ Configure TypeScript for Functions
□ Add Azure Table Storage client (NOT DONE)
☑ Create shared types package
```

**TDD Anchor:**
```typescript
describe('functions setup', () => {
  it('should respond to health check endpoint')
  it('should connect to Table Storage')
})
```

#### 0.4 Setup CI/CD
```
☑ Create GitHub Actions workflow
☑ Configure lint, typecheck, test, build steps
☑ Set up Vitest testing framework (61 tests)
□ Configure Azure SWA deployment (NOT DONE)
□ Add environment secrets (NOT DONE)
□ Configure branch protection (NOT DONE)
```

**Workflow Created:**
```yaml
# .github/workflows/ci.yml - NOW IMPLEMENTED
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  frontend:
    # lint, typecheck, test, build
  api:
    # lint, typecheck, build
```

### Phase 0 Exit Criteria
- [x] `npm run dev` starts local development
- [x] `npm run build` produces production build
- [x] `npm test` runs test suite (61 tests passing)
- [x] PR triggers CI pipeline (GitHub Actions)
- [ ] Main branch auto-deploys to Azure (pending)

---

## Phase 1: Week Viewer

### Status: ⚠️ PARTIALLY COMPLETE (UI done, API stub only)

### Objectives
- Display current week with reading and questions
- Navigate between weeks (prev/next)
- Highlight discussion questions
- Show dinner assignment

### Tasks

#### 1.1 Data Layer
```
☑ Define Week and Question types
□ Create weekRepository (NOT DONE - using mock data)
□ Create seed data script (NOT DONE)
⚠ Implement getWeek API endpoint (STUB ONLY)
⚠ Implement getWeeks API endpoint (STUB ONLY)
```

**TDD Anchors:**
```typescript
describe('weekRepository', () => {
  it('should return null for non-existent week')
  it('should return week with embedded questions')
  it('should list weeks sorted by date')
})

describe('GET /api/weeks/:weekId', () => {
  it('should return 404 for unknown week')
  it('should return week with navigation')
  it('should include questions array')
})
```

#### 1.2 Week Header Component
```
☑ Create WeekHeader component (WeekNavigation.tsx)
☑ Implement date formatting
☑ Add prev/next navigation buttons
☑ Wire up navigation to router
```

**TDD Anchors:**
```typescript
describe('WeekHeader', () => {
  it('should display "Week of Dec 23, 2025"')
  it('should call onPrevious when prev clicked')
  it('should disable prev button at first week')
  it('should have 44px touch targets')
})
```

#### 1.3 Reading Card Component
```
☑ Create ReadingCard component (ReadingContent.tsx)
☑ Display reading assignment text
☑ Parse verse references (no linking yet)
```

**TDD Anchors:**
```typescript
describe('ReadingCard', () => {
  it('should display reading assignment')
  it('should render book icon')
  it('should have card styling')
})
```

#### 1.4 Question List Component
```
☑ Create QuestionList component
☑ Create QuestionCard component (QuestionItem.tsx)
☑ Implement highlight toggle
☑ Persist highlights to localStorage (Zustand + persist)
```

**TDD Anchors:**
```typescript
describe('QuestionCard', () => {
  it('should display question number and text')
  it('should toggle highlight on click')
  it('should show bold styling when highlighted')
  it('should have aria-pressed attribute')
})

describe('useHighlights', () => {
  it('should toggle question in set')
  it('should persist to localStorage')
  it('should load from localStorage on mount')
})
```

#### 1.5 Dinner Card Component
```
☑ Create DinnerCard component
☑ Display family name and notes
☑ Handle null dinner assignment
```

**TDD Anchors:**
```typescript
describe('DinnerCard', () => {
  it('should display family name')
  it('should display notes when present')
  it('should return null when no family')
})
```

#### 1.6 Week Page Integration
```
☑ Create WeekPage component (WeekViewer.tsx)
⚠ Wire up useWeek hook (USING MOCK DATA DIRECTLY)
☑ Implement loading skeleton
☑ Implement error state
☑ Connect all child components
```

**TDD Anchors:**
```typescript
describe('WeekPage', () => {
  it('should show skeleton while loading')
  it('should display week content on success')
  it('should show error message on failure')
  it('should navigate to adjacent weeks')
})
```

### Phase 1 Exit Criteria
- [x] Opening app shows current week
- [x] Prev/Next navigation works
- [x] Questions can be highlighted
- [x] Dinner info displays correctly
- [ ] All tests pass (NO TESTS WRITTEN)

---

## Phase 2: Bible Verse Integration

### Status: ✅ MOSTLY COMPLETE

### Objectives
- Detect verse references in text
- Render clickable verse links
- Display verse modal with translations
- Integrate Azure Foundry for verse retrieval

### Tasks

#### 2.1 Bible Reference Parser
```
☑ Create regex pattern for verse references
☑ Implement parseVerseReferences function
☑ Implement parseTextWithReferences function
☑ Handle edge cases (1 John, verse ranges)
```

**TDD Anchors:**
```typescript
describe('parseVerseReferences', () => {
  it('should parse "John 3:16"', () => {
    result = parseVerseReferences('See John 3:16')
    expect(result[0]).toEqual({
      book: 'John', chapter: 3, verseStart: 16, verseEnd: null, raw: 'John 3:16'
    })
  })
  
  it('should parse "John 3:1-15"', () => {
    result = parseVerseReferences('Read John 3:1-15')
    expect(result[0].verseEnd).toBe(15)
  })
  
  it('should parse "1 John 1:1-4"')
  it('should handle lowercase')
  it('should find multiple references')
})
```

#### 2.2 RichText Component
```
☑ Create RichText component (ReadingContent.tsx handles this)
☑ Render text segments and verse links
☑ Create VerseLink component
☑ Handle click events
```

**TDD Anchors:**
```typescript
describe('RichText', () => {
  it('should render plain text without links')
  it('should render verse references as buttons')
  it('should call onReferenceClick with parsed ref')
})
```

#### 2.3 Verse Modal Component
```
☑ Create VerseModal component
☑ Implement bottom sheet on mobile
☑ Add translation tabs (NIV, KJV, MSG, ESV)
☑ Display loading/error states
☑ Show copyright attribution
```

**TDD Anchors:**
```typescript
describe('VerseModal', () => {
  it('should not render when closed')
  it('should default to NIV tab')
  it('should switch translations')
  it('should show loading spinner')
  it('should display verses with numbers')
  it('should show copyright notice')
})
```

#### 2.4 Azure Foundry Integration
```
☑ Set up Foundry client
☑ Create verse retrieval service
☑ Implement prompt engineering
☑ Add response parsing and validation
```

**TDD Anchors:**
```typescript
describe('verseService', () => {
  it('should build correct prompt for verse')
  it('should parse Foundry response')
  it('should include copyright')
  it('should throw on invalid response')
})
```

#### 2.5 Verse Caching
```
□ Create PassageCache table (NOT DONE - client-side only)
□ Implement cache check on request (NOT DONE)
□ Implement cache write on success (NOT DONE)
□ Add TTL expiration logic (NOT DONE)
Note: Client-side caching via React Query is implemented
```

**TDD Anchors:**
```typescript
describe('cacheService', () => {
  it('should return null on cache miss')
  it('should return cached passage on hit')
  it('should not return expired cache')
  it('should write new passages to cache')
})
```

#### 2.6 API Endpoint
```
☑ Create /api/verses endpoint
☑ Validate request parameters
☑ Handle errors gracefully
☑ Return formatted response
```

**TDD Anchors:**
```typescript
describe('GET /api/verses/:book/:chapter/:verse', () => {
  it('should return 400 for invalid translation')
  it('should return verse content')
  it('should include copyright')
  it('should cache responses')
})
```

### Phase 2 Exit Criteria
- [x] Verse references are clickable
- [x] Modal opens with verse text
- [x] Translation switching works
- [x] Verses are cached (client-side only)
- [ ] All tests pass (NO TESTS WRITTEN)

---

## Phase 3: Polish and Deployment

### Status: ❌ NOT STARTED

### Objectives
- Complete accessibility audit
- Optimize performance
- Final testing and bug fixes
- Production deployment

### Tasks

#### 3.1 Accessibility Audit
```
□ Run Lighthouse accessibility audit
□ Fix any contrast issues
□ Verify keyboard navigation
□ Test with screen reader
□ Ensure all touch targets ≥ 44px
```

**Acceptance Criteria:**
- [ ] Lighthouse accessibility score ≥ 90
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces content correctly

#### 3.2 Performance Optimization
```
□ Analyze bundle size
□ Implement code splitting (lazy routes)
□ Optimize image assets
□ Verify caching headers
□ Test on slow 3G connection
```

**Acceptance Criteria:**
- [ ] Initial load < 2s on 4G
- [ ] Bundle size < 200KB gzipped
- [ ] Lighthouse performance score ≥ 80

#### 3.3 Mobile Testing
```
□ Test on iOS Safari (iPhone SE, iPhone 14)
□ Test on Android Chrome (Pixel 7)
□ Verify bottom nav safe areas
□ Test swipe gestures (if implemented)
□ Test orientation changes
```

**Acceptance Criteria:**
- [ ] No layout issues on tested devices
- [ ] Touch interactions work smoothly
- [ ] No content obscured by notches/home indicator

#### 3.4 Final Bug Fixes
```
□ Review all open issues
□ Fix critical/high priority bugs
□ Update documentation
□ Create release notes
```

#### 3.5 Production Deployment
```
□ Configure production environment variables
□ Set up Azure Key Vault references
□ Configure custom domain (optional)
□ Enable HTTPS
□ Verify deployment pipeline
□ Perform smoke test
```

**Deployment Checklist:**
```
□ Environment variables configured in Azure Portal
□ Key Vault secrets referenced (not hardcoded)
□ SWA deployed and accessible
□ API endpoints responding
□ Seed data populated
□ Verse retrieval working
```

### Phase 3 Exit Criteria
- [ ] Accessibility audit passed
- [ ] Performance targets met
- [ ] Mobile testing completed
- [ ] Production deployment successful
- [ ] MVP ready for user feedback

---

## Testing Strategy

### Test Pyramid

```
          ┌───────────────┐
          │     E2E       │  (Post-MVP)
          │   Playwright  │
          ├───────────────┤
          │  Integration  │  API + React Testing Library
          │     Tests     │
          ├───────────────┤
          │     Unit      │  Vitest
          │     Tests     │
          └───────────────┘
```

### Coverage Targets

| Area | Target |
|------|--------|
| Utility functions | 90% |
| React hooks | 80% |
| Components | 70% |
| API functions | 80% |

### Key Test Files

```
src/
├── lib/
│   ├── bibleParser.test.ts     # Parser unit tests
│   └── dateUtils.test.ts       # Date utility tests
├── hooks/
│   ├── useWeek.test.ts         # Week query hook tests
│   └── useHighlights.test.ts   # Highlight state tests
├── components/
│   ├── week/
│   │   └── WeekHeader.test.tsx
│   ├── questions/
│   │   └── QuestionCard.test.tsx
│   └── bible/
│       ├── RichText.test.tsx
│       └── VerseModal.test.tsx
api/
├── src/
│   ├── functions/
│   │   ├── getWeek.test.ts
│   │   └── getVerse.test.ts
│   └── services/
│       ├── weekService.test.ts
│       └── verseService.test.ts
```

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|------------|
| Azure Foundry rate limits | Implement aggressive caching; add fallback |
| Bible translation copyright | Use proper attribution; consider API.Bible |
| Table Storage limits | Monitor usage; design for future migration |

### Schedule Risks

| Risk | Mitigation |
|------|------------|
| Scope creep | Strict MVP boundaries; defer to post-MVP |
| Integration delays | Start Azure setup early; use mocks |
| Testing bottleneck | TDD approach; automate from start |

---

## Post-MVP Roadmap

### Phase 4: Enhanced Navigation (2 weeks)
- Week selector bottom sheet
- Swipe gesture navigation
- Deep linking support

### Phase 5: Attendance Tracking (2 weeks)
- Headcount input modal
- Family attendance tracking
- Attendance history

### Phase 6: PWA Features (1 week)
- Service worker for offline
- Push notifications
- Install prompt

### Phase 7: Admin Features (3 weeks)
- Authentication (Azure AD B2C)
- Week/question editing
- Study management

---

## Definition of Done

A task is complete when:

1. **Code Complete**
   - Implementation matches spec
   - TypeScript compiles without errors
   - No lint warnings

2. **Tested**
   - Unit tests written and passing
   - Manual testing on mobile device
   - Edge cases handled

3. **Reviewed**
   - Code reviewed by peer (if applicable)
   - Documentation updated
   - Accessibility checked

4. **Deployed**
   - Changes deployed to staging
   - Smoke test passed
   - No regressions

---

## Sprint Planning Template

### Sprint N (2 weeks)

**Goal:** [Clear, measurable objective]

**Stories:**
| Story | Points | Owner | Status |
|-------|--------|-------|--------|
| As a user, I want to... | 3 | - | Todo |
| As a user, I want to... | 5 | - | Todo |

**Risks:**
- [Risk 1 and mitigation]

**Definition of Done:**
- [ ] All stories complete
- [ ] Tests passing
- [ ] Deployed to staging
- [ ] Demo ready
