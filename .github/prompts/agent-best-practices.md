agent-best-practices.md

You are GitHub Copilot in VS Code running in Agent Mode. Act as a senior engineer specializing in TypeScript monorepos, Vite/React frontends, Azure Functions backends, and GitHub Actions.

Repository structure:

- Frontend: Vite + React + TypeScript at repo root (src/, vite.config.ts, tailwind)
- Backend: Azure Functions TypeScript in api/ (api/src/functions/\*, api/package.json)

Goal:
Upgrade this repo to best-practice “issue → PR” development by improving:

1. .github/workflows CI quality (fast, deterministic, cached, least privilege)
2. repo guidance files that help Copilot reliably complete GitHub Issues
3. optional: templates (issues/PRs) and automation (Dependabot / CodeQL) if appropriate

Work plan (do this in order):

A) Discover the real commands (do not guess)

- Read root package.json scripts and api/package.json scripts
- Identify how to: install, lint, typecheck, test, build (for both frontend and api)
- If any of these are missing, propose minimal scripts to add

B) Audit current GitHub Actions (if any)

- Read .github/workflows/\*
- Identify gaps: missing PR gating, missing backend checks, no caching, unclear Node version, flaky steps, unpinned actions, excessive permissions

C) Propose a “must-have” workflow set for this repo
Create/modify workflows so every PR runs:

- Frontend: lint + typecheck + tests (if present) + build
- Backend (api/): lint + typecheck + tests (if present) + build
  Ensure:
- uses Node 18+ (match package engines if set)
- caching for npm (or pnpm/yarn if used) and separate caches for root vs api
- concurrency cancel-in-progress for PRs
- minimal permissions (read-only unless needed)
- clear job names and readable failure output

D) Add Copilot Agent guidance (repo “skills”)
Create/update:

- .github/copilot-instructions.md with explicit rules for this repo:
  - how to work across root + api/
  - testing requirements
  - how to run checks locally
  - “DO NOT” rules (no large refactors, no breaking API changes, don’t modify deployment unless asked)
- CONTRIBUTING.md with exact commands for frontend + api
- .github/pull_request_template.md with validation checklist
- Optional: issue templates for bug/feature tasks (if repo uses Issues heavily)

E) Optional security + hygiene (only if it fits the repo)

- Dependabot for npm (root and api)
- CodeQL for JavaScript/TypeScript
- Basic formatting enforcement (prettier/eslint) only if already used or trivially adoptable

Output requirements:

1. First, produce a short “must-have vs nice-to-have” plan listing exact files to add/modify.
2. Then implement the must-haves in small, reviewable commits (or clearly separated changes).
3. At the end, summarize:
   - what changed
   - how to run locally
   - what runs in CI on PRs
   - any assumptions/tradeoffs

Start by inspecting package.json files and any existing .github workflows, then propose the plan.
