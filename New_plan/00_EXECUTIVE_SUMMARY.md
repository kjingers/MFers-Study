# MFers Bible Study App — Executive Summary

## Vision

A mobile-first, browser-based Bible study companion for small groups. Opens instantly to the current week's content—no login, no friction. Designed for thumb-friendly navigation and readable scripture on any device.

---

## Problem Statement

Small Bible study groups need a simple way to:
1. **Access weekly content** — reading assignments and discussion questions
2. **Track discussion progress** — highlight the current question being discussed
3. **Read scripture in context** — view verses in multiple translations without leaving the app
4. **Coordinate logistics** — know who's bringing dinner each week

Existing solutions are either too complex (full church management systems) or too basic (shared documents without interactive features).

---

## MVP Solution

A Progressive Web App (PWA) that delivers:

| Feature | User Value |
|---------|------------|
| **Week Navigation** | Navigate between study weeks with prev/next buttons |
| **Reading Assignment** | View the week's Bible reading at a glance |
| **Discussion Questions** | Numbered list; tap to highlight current question |
| **Bible Verse Modal** | Click any verse reference → modal with 4 translations |
| **Dinner Tracker** | See who's bringing dinner this week |

---

## Key Design Decisions

### Mobile-First Architecture
- **Bottom navigation** for thumb-friendly access
- **44px minimum touch targets** per accessibility guidelines
- **Card-based UI** with clear visual hierarchy
- **Bottom sheets** for modals on mobile (centered dialogs on desktop)

### Azure-Centric Stack
- **Azure Static Web Apps** — hosts React SPA with integrated API
- **Azure Functions** — serverless API for data and verse retrieval
- **Azure Foundry (AI)** — powers intelligent verse lookup and normalization
- **Azure Table Storage** — simple, cost-effective data persistence

### No Authentication (MVP)
- Public access during development
- Future: optional access code or Azure AD B2C

---

## Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Initial load time | < 2 seconds on 4G |
| Time to current week | 0 clicks (auto-detect) |
| Verse modal open time | < 500ms |
| Mobile usability score | > 90 (Lighthouse) |

---

## Scope Boundaries

### In Scope (MVP)
- Week viewer with navigation
- Reading assignment display
- Discussion questions with highlight feature
- Bible verse detection and linking
- Multi-translation verse modal (NIV, KJV, MSG, ESV)
- Dinner assignment display

### Out of Scope (Post-MVP)
- User authentication
- Admin editing interface
- Attendance tracking (headcount)
- Study management (create/archive studies)
- Offline mode (PWA caching)
- Push notifications

---

## Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 0: Setup | 1 week | Repo, CI/CD, component library |
| Phase 1: Week Viewer | 2 weeks | Core navigation and display |
| Phase 2: Bible Integration | 2 weeks | Verse detection + modal |
| Phase 3: Polish | 1 week | Testing, accessibility, deployment |

**Total MVP: ~6 weeks**

---

## Stakeholders

| Role | Responsibility |
|------|----------------|
| Product Owner | Define weekly content and priorities |
| Developer | Implementation and deployment |
| Study Group | End users and feedback providers |

---

## Document Index

| Document | Purpose |
|----------|---------|
| [01_MVP_SCOPE.md](./01_MVP_SCOPE.md) | Detailed feature breakdown |
| [02_MOBILE_FIRST_DESIGN.md](./02_MOBILE_FIRST_DESIGN.md) | UI/UX patterns and interactions |
| [03_TECH_STACK.md](./03_TECH_STACK.md) | Technology decisions |
| [04_COMPONENT_ARCHITECTURE.md](./04_COMPONENT_ARCHITECTURE.md) | Frontend component structure |
| [05_BIBLE_VERSE_INTEGRATION.md](./05_BIBLE_VERSE_INTEGRATION.md) | Azure Foundry integration |
| [06_DATA_STRUCTURE.md](./06_DATA_STRUCTURE.md) | Data model for MVP |
| [07_IMPLEMENTATION_PHASES.md](./07_IMPLEMENTATION_PHASES.md) | Step-by-step plan with TDD |

---

## Next Steps

1. Review and approve MVP scope
2. Set up Azure resources and GitHub repository
3. Begin Phase 0: Repository scaffolding
4. Implement Week Viewer (Phase 1)
