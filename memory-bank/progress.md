# Progress: MFers Bible Study App

## What Works

### ✅ Deployment Pipeline
- GitHub Actions CI/CD workflow configured and working
- Automatic deployment on push to `main` branch
- Frontend deploys to Azure Static Web Apps
- API (Azure Functions) deploys alongside frontend
- Live at: https://lively-sand-015fd1b0f.4.azurestaticapps.net

### ✅ Frontend Structure
- React 19 + Vite 7 application scaffolded
- Component architecture established:
  - `WeekViewer` - Main week display component
  - `ReadingContent` - Bible reading passages
  - `DinnerCard` - Dinner host/meal info
  - `QuestionList` - Discussion questions
  - `VerseModal` - Verse lookup modal with translations
- Tailwind CSS configured for styling
- React Router for navigation
- React Query for server state
- Zustand for client state

### ✅ API Structure
- Azure Functions v4 project configured
- Two function endpoints:
  - `POST /api/verses` - Get Bible verse text
  - `GET /api/weeks` - List week data (stub)
- Azure Foundry integration prepared (optional)
- Mock data fallback when Foundry not configured

### ✅ Development Infrastructure
- GitHub repository connected
- Memory bank documentation system set up
- TypeScript throughout (frontend and API)
- ESLint configured

## What's Left to Build

### 🔲 High Priority
- [ ] Test deployed app functionality
- [ ] Verify verse lookup API works in production
- [ ] Connect real Bible verse data source (Foundry or Bible API)
- [ ] Replace mock week data with real content

### 🔲 Medium Priority
- [ ] PWA service worker for offline support
- [ ] Admin interface for content management
- [ ] Verse highlighting feature (save favorites)
- [ ] Week navigation by date picker

### 🔲 Lower Priority
- [ ] User preferences persistence (local storage)
- [ ] Share functionality
- [ ] Print/export week content
- [ ] Search across weeks

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Deployment | ✅ Complete | Auto-deploy working |
| Frontend UI | ✅ Scaffolded | Components built, needs polish |
| API Endpoints | ✅ Deployed | Mock data only |
| Verse Lookup | 🟡 Partial | API works, mock text returned |
| Week Data | 🟡 Mock | Hardcoded in `mock-weeks.ts` |
| Bible Data | ❌ Not connected | Foundry optional, not configured |
| PWA | ❌ Not started | manifest.json exists, no SW |
| Admin UI | ❌ Not started | No content management |

## Known Issues

1. **Duplicate Workflow Files**
   - Workflow exists in both `.github/workflows/` and `mfers-app/.github/workflows/`
   - Only the root one is used; mfers-app version is stale

2. **Mock Data Only**
   - API returns placeholder verse text
   - Week content is hardcoded
   - Need real data sources

3. **No Offline Support**
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

| Milestone | Target | Status |
|-----------|--------|--------|
| Project Setup | - | ✅ Complete |
| Basic UI Components | - | ✅ Complete |
| API Endpoints | - | ✅ Complete |
| First Deployment | Dec 23, 2025 | ✅ Complete |
| Real Verse Data | TBD | Not started |
| Real Week Content | TBD | Not started |
| PWA Support | TBD | Not started |
| Admin Interface | TBD | Not started |
| Production Ready | TBD | Not started |
