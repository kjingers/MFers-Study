# Technology Stack

## Overview

This document defines the technology choices for the MFers Bible Study App MVP. All infrastructure uses Azure services to leverage existing credits and maintain a unified ecosystem.

---

## Stack Summary

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 + TypeScript | Type safety, component model, ecosystem |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first, accessible components |
| **Routing** | React Router v6 | Standard SPA routing |
| **State/Fetch** | TanStack Query v5 | Caching, prefetching, optimistic updates |
| **Backend** | Azure Functions (Node.js) | Serverless, scales to zero |
| **AI/LLM** | Azure Foundry (GPT-4) | Verse parsing and retrieval |
| **Database** | Azure Table Storage | Simple, cost-effective NoSQL |
| **Hosting** | Azure Static Web Apps | Integrated SPA + Functions hosting |
| **CI/CD** | GitHub Actions | Native Azure SWA integration |

---

## Frontend Stack

### React 18 + TypeScript

**Why React:**
- Component-based architecture fits card/modal UI
- Large ecosystem and community support
- Excellent TypeScript integration

**Key Configuration:**
```typescript
// tsconfig.json essentials
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler"
  }
}
```

### Vite

**Why Vite:**
- Fast development server with HMR
- Optimized production builds
- Native TypeScript support

### Tailwind CSS + shadcn/ui

**Core Components Needed:**
```
shadcn/ui components:
├── button
├── card
├── dialog (desktop verse modal)
├── sheet (mobile bottom sheet)
├── tabs (translation selector)
├── skeleton (loading states)
└── toast (feedback)
```

### TanStack Query v5

**Query Patterns:**
```typescript
// Week data with prefetching
function useWeek(weekId: string) {
  return useQuery({
    queryKey: ['week', weekId],
    queryFn: () => fetchWeek(weekId),
    staleTime: 5 * 60 * 1000
  })
}

function prefetchAdjacentWeeks(currentWeekId: string) {
  queryClient.prefetchQuery({
    queryKey: ['week', getPreviousWeekId(currentWeekId)],
    queryFn: () => fetchWeek(getPreviousWeekId(currentWeekId))
  })
}
```

### React Router v6

**Route Structure:**
```typescript
const routes = [
  { path: '/', element: <WeekRedirect /> },
  { path: '/week/:weekId', element: <WeekPage /> },
  { path: '*', element: <NotFound /> }
]
```

---

## Backend Stack

### Azure Functions (Node.js + TypeScript)

**Function Structure:**
```
api/
├── src/
│   ├── functions/
│   │   ├── getWeek.ts
│   │   ├── getWeeks.ts
│   │   └── getVerse.ts
│   ├── services/
│   │   ├── weekService.ts
│   │   └── verseService.ts
│   └── shared/
│       ├── tableClient.ts
│       └── foundryClient.ts
├── package.json
└── host.json
```

**Function Example:**
```typescript
// api/src/functions/getWeek.ts
app.http('getWeek', {
  methods: ['GET'],
  route: 'weeks/{weekId}',
  handler: async (request) => {
    const weekId = request.params.weekId
    if (!weekId) return { status: 400, body: 'weekId required' }
    
    const week = await getWeekById(weekId)
    if (!week) return { status: 404, body: 'Week not found' }
    
    return { status: 200, jsonBody: week }
  }
})
```

### Azure Table Storage

**Table Design:**
```
Table: Weeks
  PartitionKey: StudyId (e.g., "study-2025")
  RowKey: WeekId (e.g., "2025-12-23")
  Properties: WeekDate, ReadingAssignment, DinnerFamily, DinnerNotes

Table: Questions
  PartitionKey: WeekId (e.g., "2025-12-23")
  RowKey: QuestionOrder (e.g., "001", "002")
  Properties: Text, Order
```

### Azure Foundry (AI Services)

**Use Cases:**
1. **Reference Normalization** — Parse "John 3:1-15" → structured object
2. **Verse Retrieval** — Fetch verse text with proper attribution
3. **Translation Switching** — Handle multiple Bible translations

---

## Infrastructure

### Azure Static Web Apps

**Configuration:**
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*"]
  },
  "platform": {
    "apiRuntime": "node:18"
  }
}
```

### GitHub Actions CI/CD

```yaml
name: Deploy to Azure SWA
on:
  push:
    branches: [main]
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_SWA_TOKEN }}
          app_location: "/"
          api_location: "api"
          output_location: "dist"
```

---

## Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20 LTS | Runtime |
| Azure Functions Core Tools | 4.x | Local Functions dev |
| Azure CLI | Latest | Resource management |

### Local Development

```bash
# Frontend dev server
npm run dev

# Azure Functions (from /api)
cd api && func start

# Or use SWA CLI for integrated dev
swa start http://localhost:5173 --api-location ./api
```

---

## Environment Configuration

**Frontend (.env):**
```env
VITE_API_BASE_URL=/api
```

**Backend (local.settings.json):**
```json
{
  "Values": {
    "AZURE_STORAGE_CONNECTION_STRING": "<from-key-vault>",
    "AZURE_FOUNDRY_ENDPOINT": "<from-key-vault>",
    "AZURE_FOUNDRY_API_KEY": "<from-key-vault>"
  }
}
```

---

## Package Dependencies

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.12.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "tailwindcss": "^3.3.6"
  }
}
```

### Backend
```json
{
  "dependencies": {
    "@azure/functions": "^4.0.0",
    "@azure/data-tables": "^13.2.0",
    "@azure/openai": "^1.0.0"
  }
}
```

---

## Testing Strategy

| Layer | Tool | Coverage |
|-------|------|----------|
| Frontend Unit | Vitest + RTL | Components, hooks |
| Backend Unit | Vitest | Services, utilities |
| E2E | Playwright | Post-MVP |

---

## Cost Estimation (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Azure Static Web Apps | Free | $0 |
| Azure Functions | Consumption | ~$0 |
| Azure Table Storage | Pay-as-you-go | < $1 |
| Azure Foundry (AI) | Pay-as-you-go | ~$5-10 |
| **Total** | | **< $15/month** |
