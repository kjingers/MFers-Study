# Active Context: MFers Bible Study App

## Current Work Focus
The app has been successfully deployed to Azure Static Web Apps. The primary focus now shifts to feature development and content management.

## Recent Changes (December 23, 2025)

### Deployment Fixed and Completed
1. **GitHub Actions Workflow**
   - Created workflow at `.github/workflows/azure-static-web-apps.yml`
   - Fixed job name to `build_and_deploy_job` (required by SWA CLI)
   - Added step to remove dev dependencies before deployment (fixes size limit issue)

2. **API Package Configuration**
   - Fixed `main` field in `mfers-app/api/package.json`
   - Changed from `dist/functions/*.js` to `dist/src/functions/*.js` to match TypeScript output

3. **GitHub Repository Setup**
   - Connected local repo to `https://github.com/kjingers/MFers-Study`
   - Added `AZURE_STATIC_WEB_APPS_API_TOKEN` secret
   - Re-authenticated with `workflow` scope for pushing workflow files

4. **Memory Bank Setup**
   - Created `.clinerules` file with memory bank configuration
   - Initialized `memory-bank/` folder with core documentation files

## Live Deployment
- **URL**: https://salmon-sky-01fd35c1e.1.azurestaticapps.net
- **Auto-deploy**: Enabled on push to `main` branch

## Next Steps

### Immediate (High Priority)
1. Test the deployed app and verify verse lookup works
2. Check if API endpoints are accessible
3. Verify mobile responsiveness

### Short-term
1. Connect Azure Foundry for real Bible verse text (currently returns mock data)
2. Add real week content data (replace mock data)
3. Implement admin interface for content management

### Medium-term
1. Add PWA service worker for offline support
2. Implement verse highlighting feature
3. Add navigation to specific weeks by date

## Active Decisions and Considerations

### API Data Source
- Currently using **mock verse data** (placeholder text)
- Azure Foundry integration is optional but prepared in code
- Need to decide: Use Azure Foundry or integrate a Bible API

### Content Management
- Week data is currently **hardcoded in mock-weeks.ts**
- Options: Azure Table Storage, JSON files, or headless CMS
- No admin UI yet

### Deployment Strategy
- Workflow file exists in **two locations**:
  - `.github/workflows/` (active - GitHub uses this)
  - `mfers-app/.github/workflows/` (backup/reference)
- Consider removing the duplicate to avoid confusion

## Important Patterns and Preferences

### Code Organization
- Components organized by feature (week, verse-modal, reading, etc.)
- Shared UI components in `components/ui/`
- Services layer for API calls

### Deployment
- Always remove dev dependencies before API deployment
- Use `skip_app_build: true` since we build manually in workflow
- GitHub Actions is the primary deployment method

## Learnings and Project Insights

### Azure SWA Quirks
1. **Job naming matters**: SWA CLI specifically looks for `build_and_deploy_job`
2. **Size limits**: 500MB limit includes node_modules - must prune
3. **Functions v4**: Output path must match package.json main field exactly

### GitHub Actions
1. Need `workflow` scope to push workflow files
2. Secrets must be added before first workflow run
3. Workflow file must be in repository root `.github/workflows/`
