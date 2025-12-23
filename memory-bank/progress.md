# Progress: MFers Bible Study App

## GitHub Issues Tracker

### ✅ Completed Issues (Closed)

| Issue | Title                                            | Status                 |
| ----- | ------------------------------------------------ | ---------------------- |
| #1    | Fix 4 ESLint errors                              | ✅ Complete            |
| #2    | Set up Vitest testing framework                  | ✅ Complete            |
| #3    | Write unit tests for verse-parser                | ✅ Complete (28 tests) |
| #4    | Write unit tests for highlights store            | ✅ Complete (17 tests) |
| #5    | Set up GitHub Actions CI workflow                | ✅ Complete            |
| #6    | Connect frontend to weeks API                    | ✅ Complete            |
| #7    | Write component tests                            | ✅ Complete (12 tests) |
| #8    | Add error boundaries to App                      | ✅ Complete            |
| #15   | feat: Run Lighthouse accessibility audit         | ✅ Complete            |
| #16   | feat: Configure Azure Static Web Apps deployment | ✅ Complete            |
| #13   | feat: Implement Azure Table Storage for weeks    | ✅ Complete            |
| #14   | feat: Implement server-side verse caching        | ✅ Complete            |

### 🔄 Open Issues (In Progress)

| Issue | Title                                              | Priority    | Status         |
| ----- | -------------------------------------------------- | ----------- | -------------- |
| #17   | test: Mobile device testing                        | 🟡 High     | ⏳ Not Started |
| #18   | perf: Performance optimization and bundle analysis | 🟢 Medium   | ⏳ Not Started |
| #19   | docs: Update project documentation                 | 🟢 Medium   | ⏳ Not Started |

### Priority Order for Remaining Work

1. **#17** - Mobile testing (QA, 2h)
2. **#18** - Performance optimization (2h)
3. **#19** - Documentation update (2h)

---

## What Works

### ✅ Deployment Pipeline

- GitHub Actions CI/CD workflow configured and working
- Automatic deployment on push to `main` branch
- Frontend deploys to Azure Static Web Apps
- API (Azure Functions) deploys alongside frontend
- Live at: https://lively-sand-015fd1b0f.4.azurestaticapps.net
- **NEW:** CI workflow with lint, typecheck, test, build steps

### ✅ Testing Infrastructure

- **Vitest 4.0.16** configured with React Testing Library
- **61 tests passing** across the codebase:
  - 28 verse-parser tests
  - 17 highlights store tests
  - 12 component tests (VerseLink, QuestionList)
  - 4 setup tests
- Test coverage for critical utilities

### ✅ Frontend Structure

- React 19 + Vite 7 application scaffolded
- Component architecture established:
  - `WeekViewer` - Main week display with API integration
  - `ReadingContent` - Bible reading passages
  - `DinnerCard` - Dinner host/meal info
  - `QuestionList` - Discussion questions
  - `VerseModal` - Verse lookup modal with translations
  - **NEW:** `ErrorBoundary` - Error handling wrapper
- Tailwind CSS configured for styling
- React Router for navigation
- React Query for server state
- Zustand for client state
- **NEW:** ARIA labels and accessibility improvements

### ✅ API Structure

- Azure Functions v4 project configured
- Two function endpoints:
  - `POST /api/verses` - Get Bible verse text
  - `GET /api/weeks` - List week data (full mock data)
- Azure Foundry integration prepared (optional)
- Mock data fallback when Foundry not configured

### ✅ Development Infrastructure

- GitHub repository connected
- Memory bank documentation system set up
- TypeScript throughout (frontend and API)
- ESLint configured (0 errors)
- **NEW:** GitHub Actions CI workflow

## What's Left to Build

### 🔲 High Priority (Issues #13-16)

- [ ] Run Lighthouse accessibility audit (#15)
- [ ] Configure Azure SWA deployment (#16)
- [ ] Implement Azure Table Storage for weeks (#13)
- [ ] Implement server-side verse caching (#14)

### 🔲 Medium Priority (Issues #17-19)

- [ ] Mobile device testing (#17)
- [ ] Performance optimization (#18)
- [ ] Documentation update (#19)

### 🔲 Lower Priority (Future)

- [ ] PWA service worker for offline support
- [ ] Admin interface for content management
- [ ] User preferences persistence
- [ ] Share functionality

## Current Status

| Component      | Status           | Notes                            |
| -------------- | ---------------- | -------------------------------- |
| Deployment     | ✅ Complete      | Auto-deploy working              |
| CI/CD          | ✅ Complete      | Lint, typecheck, test, build     |
| Testing        | ✅ Complete      | 61 tests passing                 |
| Error Handling | ✅ Complete      | Error boundaries added           |
| Frontend UI    | ✅ Scaffolded    | Components built, API connected  |
| API Endpoints  | ✅ Deployed      | Mock data, need persistence      |
| Verse Lookup   | 🟡 Partial       | API works, mock text returned    |
| Week Data      | 🟡 Mock          | Hardcoded, need Table Storage    |
| Bible Data     | ❌ Not connected | Foundry optional, not configured |
| PWA            | ❌ Not started   | manifest.json exists, no SW      |
| Admin UI       | ❌ Not started   | No content management            |

## Known Issues

1. **Mock Data Only**

   - API returns placeholder verse text
   - Week content needs Azure Table Storage
   - Need real data sources

2. **No Offline Support**
   - manifest.json exists but no service worker
   - App won't work offline

## Evolution of Project Decisions

### December 23, 2025

- **Initial deployment achieved**
- Fixed Azure SWA deployment issues:
  - Job name must be `build_and_deploy_job`
  - API main field must match TypeScript output path
  - Must prune dev dependencies to avoid size limit
- Set up memory bank for project continuity

### Earlier (Based on existing code)

- Chose React + Vite for modern, fast frontend
- Selected Azure Static Web Apps for integrated hosting
- Designed component hierarchy around weekly content structure
- Implemented verse modal with translation tabs
- Prepared Azure Foundry integration for AI-powered verse lookup

## Milestones

| Milestone           | Target       | Status      |
| ------------------- | ------------ | ----------- |
| Project Setup       | -            | ✅ Complete |
| Basic UI Components | -            | ✅ Complete |
| API Endpoints       | -            | ✅ Complete |
| First Deployment    | Dec 23, 2025 | ✅ Complete |
| Real Verse Data     | TBD          | Not started |
| Real Week Content   | TBD          | Not started |
| PWA Support         | TBD          | Not started |
| Admin Interface     | TBD          | Not started |
| Production Ready    | TBD          | Not started |
