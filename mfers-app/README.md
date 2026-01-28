# MFers Bible Study App

A Progressive Web App (PWA) for weekly Bible study tracking with verse lookup and multiple translation support.

**Live Demo:** https://lively-sand-015fd1b0f.4.azurestaticapps.net

## ✨ Features

- **Week Navigation**: Browse through weekly Bible study content
- **Bible Verse Modal**: Click any verse reference to view full text
- **4 Translation Tabs**: NIV, ESV, KJV, and MSG translations
- **Azure OpenAI Integration**: GPT-4o powered verse retrieval
- **Server-Side Caching**: 7-day verse cache for cost optimization
- **PWA Support**: Install to homescreen on mobile devices
- **Mobile-First Design**: Dark theme with 44px touch targets
- **Live Question Sync**: Real-time sync via Azure SignalR across all devices
- **Meal Signup**: Claim/release dinner hosting slots with family selection
- **RSVP Attendance**: Track who's coming each week
- **Swipe Navigation**: Horizontal swipe gestures for mobile week navigation
- **Bottom Tab Navigation**: Study/Schedule tabs for quick access
- **Accessibility**: WCAG 2.1 AA compliant with skip links and ARIA labels

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript 5 + Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand + TanStack Query
- **Backend**: Azure Functions v4 (Node.js 20)
- **AI Integration**: Azure OpenAI (GPT-4o)
- **Hosting**: Azure Static Web Apps
- **Testing**: Vitest + React Testing Library (166 unit tests) + Playwright (20 e2e tests)
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
mfers-app/
├── api/                        # Azure Functions backend
│   ├── src/
│   │   ├── functions/
│   │   │   ├── verses.ts       # Verse lookup API
│   │   │   └── weeks.ts        # Week content API
│   │   └── shared/
│   │       ├── azure-foundry.ts # Azure OpenAI client
│   │       └── types.ts        # Shared TypeScript types
│   ├── host.json
│   ├── package.json
│   └── tsconfig.json
├── public/
│   ├── icons/                  # PWA icons
│   └── manifest.json           # PWA manifest
├── src/
│   ├── components/
│   │   ├── dinner/             # Dinner card components
│   │   ├── questions/          # Discussion questions
│   │   ├── reading/            # Reading content & verse links
│   │   ├── ui/                 # Reusable UI components
│   │   ├── verse-modal/        # Verse display modal
│   │   └── week/               # Week navigation & viewer
│   ├── data/                   # Mock data for development
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   ├── services/               # API service layer
│   ├── store/                  # Zustand stores
│   └── types/                  # TypeScript type definitions
├── .env.example                # Environment variables template

├── index.html                  # Entry HTML with PWA tags
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Azure account (for deployment)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/mfers-study.git
   cd mfers-study/mfers-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd api && npm install && cd ..
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Azure credentials:

   ```env
   VITE_API_URL=http://localhost:7071/api
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
   AZURE_OPENAI_API_KEY=your-api-key
   AZURE_OPENAI_DEPLOYMENT=gpt-4
   ```

4. **Start development servers**

   ```bash
   # Start Vite dev server
   npm run dev

   # In a separate terminal, start Azure Functions
   cd api && npm start
   ```

5. **Open the app**
   Navigate to `http://localhost:5173`

### Available Scripts

#### Frontend (`mfers-app/`)

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start Vite development server |
| `npm run build`     | Build for production          |
| `npm run preview`   | Preview production build      |
| `npm run lint`      | Run ESLint                    |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm test`          | Run Vitest tests              |

#### Backend (`mfers-app/api/`)

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `npm start`         | Start Azure Functions locally |
| `npm run build`     | Compile TypeScript            |
| `npm run lint`      | Run ESLint                    |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm test`          | Run Vitest tests              |

## ☁️ Azure Deployment

### Option 1: GitHub Actions (Recommended)

1. Create an Azure Static Web App in the Azure Portal
2. Copy the deployment token from Azure
3. Add `AZURE_STATIC_WEB_APPS_API_TOKEN` secret to your GitHub repository
4. Push to `main` branch - deployment is automatic

### Option 2: Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name mfers-rg --location eastus

# Create Static Web App
az staticwebapp create \
  --name mfers-bible-study \
  --resource-group mfers-rg \
  --source https://github.com/your-username/mfers-study \
  --location "East US 2" \
  --branch main \
  --app-location "/mfers-app" \
  --api-location "/mfers-app/api" \
  --output-location "dist"
```

### Azure OpenAI Setup

1. Create an Azure OpenAI resource in the Azure Portal
2. Deploy a GPT-4 model
3. Configure the following environment variables in your Static Web App:
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_DEPLOYMENT`

## 🔧 Environment Variables

### Frontend (Vite)

| Variable       | Description  | Required |
| -------------- | ------------ | -------- |
| `VITE_API_URL` | API base URL | Yes      |

### Backend (Azure Functions)

| Variable                  | Description               | Required |
| ------------------------- | ------------------------- | -------- |
| `AZURE_OPENAI_ENDPOINT`   | Azure OpenAI endpoint URL | Yes      |
| `AZURE_OPENAI_API_KEY`    | Azure OpenAI API key      | Yes      |
| `AZURE_OPENAI_DEPLOYMENT` | Model deployment name     | Yes      |

## 📱 PWA Installation

### Mobile (iOS/Android)

1. Open the app in your mobile browser
2. Tap "Add to Home Screen" or "Install"
3. The app will be available as a standalone application

### Desktop (Chrome/Edge)

1. Look for the install icon in the address bar
2. Click "Install" to add to your desktop

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### E2E Visual Tests (Playwright)

```bash
# Run e2e tests against deployed URL
PLAYWRIGHT_BASE_URL="https://lively-sand-015fd1b0f.4.azurestaticapps.net" npm run test:e2e

# Run with UI mode for debugging
PLAYWRIGHT_BASE_URL="https://lively-sand-015fd1b0f.4.azurestaticapps.net" npm run test:e2e:ui

# Update visual snapshots
PLAYWRIGHT_BASE_URL="https://lively-sand-015fd1b0f.4.azurestaticapps.net" npm run test:e2e:update
```

**Visual Tests Cover:**

- Dark theme verification
- Header and navigation styling
- 44px touch target accessibility (WCAG 2.1 AA)
- Mobile responsiveness (Mobile Chrome viewport)
- Visual regression screenshots

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Bible verse data sourced via Azure OpenAI
- Icons designed with accessibility in mind
- Built with ❤️ for the MFers Bible study group
