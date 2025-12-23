# Tech Context: MFers Bible Study App

## Technologies Used

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router DOM 7** - Client-side routing
- **TanStack React Query 5** - Server state management
- **Zustand 5** - Client state management
- **Lucide React** - Icon library

### Backend (Azure Functions)
- **Azure Functions v4** - Serverless compute
- **Node.js 18** - Runtime
- **TypeScript** - Type-safe code
- **@azure/functions** - Azure Functions SDK
- **@azure/data-tables** - Azure Table Storage client (for future data persistence)

### Infrastructure
- **Azure Static Web Apps** - Hosting for frontend + API
- **GitHub Actions** - CI/CD pipeline
- **Azure Foundry** (optional) - GPT-4 for fetching verse text

## Development Setup

### Prerequisites
- Node.js 18+
- npm
- Azure CLI (for deployment)
- GitHub CLI (for secrets management)

### Local Development
```bash
# Frontend
cd mfers-app
npm install
npm run dev

# API (in separate terminal)
cd mfers-app/api
npm install
npm run start
```

### Environment Variables
- `AZURE_FOUNDRY_ENDPOINT` - (Optional) Azure OpenAI endpoint for verse fetching
- `AZURE_FOUNDRY_DEPLOYMENT` - (Optional) Deployment name
- `AZURE_FOUNDRY_API_KEY` - (Optional) API key

## Technical Constraints

1. **Azure SWA Limits**
   - App content size limit: 500MB
   - Must remove dev dependencies before API deployment
   - Functions must be in Node.js v4 programming model

2. **TypeScript Output Structure**
   - API compiles from `src/` to `dist/src/`
   - Main entry in package.json: `dist/src/functions/*.js`

3. **PWA Requirements**
   - Must have manifest.json
   - Service worker for offline support (to be implemented)

## Dependencies

### Frontend (package.json)
- Production: React, React Router, TanStack Query, Zustand, Tailwind, Lucide
- Dev: Vite, TypeScript, ESLint

### API (api/package.json)
- Production: @azure/functions, @azure/data-tables
- Dev: TypeScript, azure-functions-core-tools, vitest

## Tool Usage Patterns

### GitHub CLI (gh)
- `gh secret set` - Add repository secrets
- `gh run list` - View workflow runs
- `gh run watch` - Monitor running workflow
- `gh auth login --scopes workflow` - Authenticate with workflow scope

### Azure CLI (az)
- `az staticwebapp secrets list` - Get SWA deployment token
- `az staticwebapp show` - Get SWA details including hostname

### Git
- Remote: https://github.com/kjingers/MFers-Study
- Main branch: `main`
- Auto-deploy on push to main

## File Structure
```
MFers-Study/
├── .github/workflows/     # GitHub Actions workflows
├── memory-bank/           # Cline memory bank files
├── mfers-app/             # Main application
│   ├── api/               # Azure Functions API
│   │   ├── src/functions/ # Function handlers
│   │   ├── src/shared/    # Shared utilities
│   │   ├── host.json      # Functions host config
│   │   └── package.json   # API dependencies
│   ├── src/               # React frontend source
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand stores
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
└── .clinerules            # Cline memory bank config
