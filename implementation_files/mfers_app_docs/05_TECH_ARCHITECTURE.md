# Technical Architecture (Azure)

## Recommended stack
- **Frontend:** React + TypeScript
- **Styling/UI:** Tailwind + shadcn/ui (Radix primitives under the hood)
- **Routing:** React Router
- **Data fetching:** TanStack Query (cache + prefetch adjacent weeks)
- **Backend:** Azure Functions (Node/TS)
- **Data:** Azure Table Storage initially (easy; can move to Cosmos DB later)
- **Hosting:** Azure Static Web Apps (SWA)

## Why this works
- Mobile-first SPA, fast static delivery, simple serverless APIs
- Cheap to run in your VS Azure credits

> Source: MFers App - Technical Architecture (uploaded)
