# MFers Bible Study App - GitHub Copilot Instructions

> These instructions guide GitHub Copilot when generating code for this project.
> Based on best practices from [github/awesome-copilot](https://github.com/github/awesome-copilot).

## Repository Structure

This is a monorepo with:
- **Frontend**: `mfers-app/` — Vite + React + TypeScript
- **Backend API**: `mfers-app/api/` — Azure Functions + TypeScript

When working on issues, always identify which part of the codebase is affected.

## Critical Rules (DO NOT)

1. **DO NOT** refactor unrelated code when fixing a specific issue
2. **DO NOT** change the API contract (request/response shapes) without explicit approval
3. **DO NOT** modify deployment workflows (`azure-static-web-apps.yml`) unless the issue specifically requests it
4. **DO NOT** add new dependencies without justification in the PR description
5. **DO NOT** remove existing tests or reduce test coverage
6. **DO NOT** use `any` type — always use proper TypeScript types
7. **DO NOT** commit directly to `main` — always use feature branches

## Local Development Commands

### Frontend (`mfers-app/`)

```bash
cd mfers-app
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run build        # Production build
```

### API (`mfers-app/api/`)

```bash
cd mfers-app/api
npm install          # Install dependencies
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run build        # Compile TypeScript
npm start            # Start Azure Functions locally (http://localhost:7071)
npm test             # Run Vitest tests
```

### Before Submitting a PR

Run these checks locally to match CI:

```bash
# Frontend
cd mfers-app && npm run lint && npm run typecheck && npm run build

# API
cd mfers-app/api && npm run lint && npm run typecheck && npm run build
```

## Project Context

- **React 19.x** with functional components and hooks
- **TypeScript 5.x** with strict mode enabled
- **Vite 7** as the build tool
- **Tailwind CSS 4** for styling
- **React Router 7** for client-side routing
- **TanStack React Query** for server state management
- **Zustand** for client state management
- **shadcn/ui** components with class-variance-authority

## Core Intent

- Respect the existing architecture and coding standards.
- Prefer readable, explicit solutions over clever shortcuts.
- Extend current abstractions before inventing new ones.
- Prioritize maintainability and clarity, short methods and classes, clean code.

## General Guardrails

- Target TypeScript 5.x / ES2022 and prefer native features over polyfills.
- Use pure ES modules; never emit `require`, `module.exports`, or CommonJS helpers.
- Rely on the project's build, lint, and test scripts unless asked otherwise.
- Note design trade-offs when intent is not obvious.

## Development Standards

### Architecture

- Use functional components with hooks as the primary pattern
- Implement component composition over inheritance
- Organize components by feature or domain for scalability
- Separate presentational and container components clearly
- Use custom hooks for reusable stateful logic
- Implement proper component hierarchies with clear data flow

### TypeScript Integration

- Use TypeScript interfaces for props, state, and component definitions
- Define proper types for event handlers and refs
- Implement generic components where appropriate
- Use strict mode in `tsconfig.json` for type safety
- Leverage React's built-in types (`React.FC`, `React.ComponentProps`, etc.)
- Create union types for component variants and states
- NEVER use `any` type - always use proper TypeScript types
- Avoid implicit `any`; prefer `unknown` plus narrowing

### Component Design

- Follow the single responsibility principle for components
- Use descriptive and consistent naming conventions
- Implement proper prop validation with TypeScript
- Design components to be testable and reusable
- Keep components small and focused on a single concern
- Use composition patterns (render props, children as functions)

### State Management

- Use `useState` for local component state
- Implement `useReducer` for complex state logic
- Use Zustand for global client state
- Use React Query for server state management
- Implement proper state normalization and data structures

### Hooks and Effects

- Use `useEffect` with proper dependency arrays to avoid infinite loops
- Implement cleanup functions in effects to prevent memory leaks
- Use `useMemo` and `useCallback` for performance optimization when needed
- Create custom hooks for reusable stateful logic
- Follow the rules of hooks (only call at the top level)
- Use `useRef` for accessing DOM elements and storing mutable values

### Styling with Tailwind CSS

- Use Tailwind CSS utility classes for all styling
- Implement responsive design with mobile-first approach
- Use the `cn()` utility from `@/lib/utils` for conditional classes
- Follow container queries best practices
- Maintain semantic HTML structure
- Use CSS custom properties (variables) for theming when needed

### UI Components (shadcn/ui)

- Always prefer shadcn/ui components over custom ones
- Use the `@/components/ui/` directory for UI components
- Follow the component patterns established by shadcn/ui
- Use class-variance-authority for component variants

```typescript
// Example component pattern
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

### Data Fetching

- Use React Query for data fetching and caching
- Implement proper loading, error, and success states
- Handle race conditions and request cancellation
- Use optimistic updates for better user experience
- Implement proper caching strategies

```typescript
// Example React Query usage
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchResource(id),
});
```

### Error Handling

- Implement Error Boundaries for component-level error handling
- Use proper error states in data fetching
- Implement fallback UI for error scenarios
- Log errors appropriately for debugging
- Handle async errors in effects and event handlers
- Provide meaningful error messages to users

### Routing

- Use React Router for client-side routing
- Implement nested routes and route protection
- Handle route parameters and query strings properly
- Implement lazy loading for route-based code splitting
- Use proper navigation patterns and back button handling

### Performance Optimization

- Use `React.memo` for component memoization when appropriate
- Implement code splitting with `React.lazy` and `Suspense`
- Optimize bundle size with tree shaking and dynamic imports
- Use `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders
- Implement virtual scrolling for large lists
- Profile components with React DevTools to identify performance bottlenecks

### Security

- Sanitize user inputs to prevent XSS attacks
- Validate and escape data before rendering
- Use HTTPS for all external API calls
- Implement proper authentication and authorization patterns
- Avoid storing sensitive data in localStorage or sessionStorage
- Use Content Security Policy (CSP) headers

### Accessibility

- Use semantic HTML elements appropriately
- Implement proper ARIA attributes and roles
- Ensure keyboard navigation works for all interactive elements
- Provide alt text for images and descriptive text for icons
- Implement proper color contrast ratios
- Test with screen readers and accessibility tools

## File Organization

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   └── [feature]/    # Feature-specific components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and helpers
├── pages/            # Page components
├── stores/           # Zustand stores
├── types/            # TypeScript type definitions
└── services/         # API and data services
```

## Naming & Style

- Use PascalCase for components, interfaces, enums, and type aliases
- Use camelCase for functions, variables, and hooks
- Skip interface prefixes like `I`; rely on descriptive names
- Name things for their behavior or domain meaning, not implementation
- Use kebab-case for filenames (e.g., `user-session.ts`, `bible-verse.tsx`)

## Import Standards

Use `@/` alias for all internal imports:

```typescript
// ✅ Good
import { Button } from '@/components/ui/button';
import { useBibleStore } from '@/stores/bible-store';

// ❌ Bad
import { Button } from '../../../components/ui/button';
```

## Common Patterns

- Custom hooks for reusable logic extraction
- Compound components for related functionality
- Provider pattern for context-based state sharing
- Container/Presentational component separation

## Testing Expectations

- Write unit tests for components using React Testing Library
- Test component behavior, not implementation details
- Implement integration tests for complex component interactions
- Mock external dependencies and API calls appropriately
- Test accessibility features and keyboard navigation

## Documentation & Comments

- Add JSDoc to public APIs; include `@remarks` or `@example` when helpful
- Write comments that capture intent, and remove stale notes during refactors
- Document complex components and custom hooks with JSDoc

## Personal Preferences

- Be concise in all interactions and commit messages. Sacrifice grammar for brevity.

### GitHub

- Primary method for GitHub interaction: `gh` CLI
- When tagging Claude in issues: use `@claude`

### Git

- Branch prefix: `kjinger/` (e.g., `kjinger/feature-name`)
- Commit messages: concise, present tense

### PR Comments

When adding TODO comments to PRs, use checkbox markdown:

```md
- [ ] Description of the todo
```

### Plans

- End each plan with unresolved questions (concise, grammar optional)

### Phase Planning

When planning features or phases, structure as:

```md
## Phase N: [Phase Name]

### Goals
- Goal 1
- Goal 2

### Tasks
- [ ] Task 1
- [ ] Task 2

### Acceptance Criteria
- Criteria 1
- Criteria 2

### Unresolved Questions
- Question?
```

### Feature Development Flow

1. Create issue with clear acceptance criteria
2. Branch: `kjinger/issue-XX-short-description`
3. Implement with tests
4. Run CI checks locally
5. Open PR linking issue
6. Merge after CI passes

### Copilot Coding Agent

To use coding agent for this repo:
1. Create detailed GitHub issue
2. Assign to Copilot OR use `#github-pull-request_copilot-coding-agent` in chat
3. Agent creates branch, implements, opens PR
