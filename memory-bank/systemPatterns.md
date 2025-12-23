# System Patterns: MFers Bible Study App

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Azure Static Web Apps                     │
├─────────────────────────────────┬───────────────────────────┤
│         Frontend (React)         │     API (Azure Functions) │
│                                  │                           │
│  ┌─────────────────────────┐    │  ┌─────────────────────┐  │
│  │      WeekViewer         │    │  │   /api/verses       │  │
│  │  ┌─────────────────┐    │    │  │   POST: Get verse   │  │
│  │  │ ReadingContent  │────┼────┼──│   text by reference │  │
│  │  │ DinnerCard      │    │    │  └─────────────────────┘  │
│  │  │ QuestionList    │    │    │                           │
│  │  └─────────────────┘    │    │  ┌─────────────────────┐  │
│  └─────────────────────────┘    │  │   /api/weeks        │  │
│                                  │  │   GET: List weeks   │  │
│  ┌─────────────────────────┐    │  └─────────────────────┘  │
│  │      VerseModal         │    │                           │
│  │  - Translation tabs     │    │  ┌─────────────────────┐  │
│  │  - Verse display        │    │  │   Azure Foundry     │  │
│  │  - React Query caching  │    │  │   (Optional GPT-4)  │  │
│  └─────────────────────────┘    │  └─────────────────────┘  │
└─────────────────────────────────┴───────────────────────────┘
```

## Key Technical Decisions

### 1. Monorepo Structure
- Frontend and API in same repo (`mfers-app/` and `mfers-app/api/`)
- Allows coordinated deployments via GitHub Actions
- Shared TypeScript types possible (though not yet implemented)

### 2. Azure Functions v4 Programming Model
- Uses `app.http()` for HTTP triggers
- Functions registered via decorators/registration pattern
- Compiled output at `dist/src/functions/*.js`

### 3. React Query for Server State
- Caches verse lookups to avoid redundant API calls
- Automatic background refetching
- Loading/error states handled declaratively

### 4. Zustand for Client State
- Simple store for user preferences (translation selection)
- Potential for verse highlights feature

### 5. Mobile-First Component Design
- Cards for content sections
- Modal for verse display
- Tab navigation for translations

## Design Patterns in Use

### Component Composition
```
WeekViewer
├── WeekNavigation (prev/next controls)
├── ReadingContent
│   └── VerseLink (clickable references)
├── DinnerCard
└── QuestionList
    └── QuestionItem
```

### Verse Modal Pattern
```
VerseModal (container)
├── TranslationTabs (NIV, KJV, MSG, ESV)
└── VerseDisplay (content area)
    ├── Loading skeleton (while fetching)
    ├── Verse text (on success)
    └── Error message (on failure)
```

### API Service Layer
- `verse-service.ts` - Handles verse API calls
- `api.ts` - Base API configuration
- Separates HTTP concerns from components

## Component Relationships

### Data Flow
1. `WeekViewer` loads week data (currently mock data)
2. `ReadingContent` renders Bible references as `VerseLink` components
3. User taps `VerseLink` → opens `VerseModal`
4. `VerseModal` uses `useVerseQuery` hook
5. Hook calls verse service → API → returns verse text
6. React Query caches result for future lookups

### State Management
- **Server State** (React Query): Verse data, week data
- **Client State** (Zustand): Selected translation, verse highlights
- **Local State** (useState): Modal open/close, active tab

## Critical Implementation Paths

### Verse Lookup Flow
```
User taps verse → VerseLink onClick → 
Open VerseModal → useVerseQuery(reference) →
verseService.getVerses() → POST /api/verses →
Azure Function handler → (Optional: Azure Foundry) →
Return PassageResponse → Display in VerseDisplay
```

### Deployment Flow
```
Push to main → GitHub Actions triggers →
Build frontend (npm run build) →
Build API (npm run build) →
Clean API node_modules → Install prod only →
SWA Deploy action uploads to Azure
```

## Configuration Files

| File | Purpose |
|------|---------|
| `staticwebapp.config.json` | SWA routing, security headers, API runtime |
| `host.json` | Azure Functions configuration |
| `tsconfig.json` (x3) | TypeScript config for app, API, and node |
| `vite.config.ts` | Vite build configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
