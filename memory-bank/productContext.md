# Product Context: MFers Bible Study App

## Why This Project Exists
The MFers Bible Study group meets weekly to study the Bible together and share fellowship over dinner. This app centralizes all the information needed for each week's gathering in one accessible place, replacing scattered communications and making it easy for members to prepare.

## Problems It Solves
1. **Information Fragmentation** - Weekly study details (readings, dinner info, questions) are often shared across multiple channels
2. **Bible Verse Access** - Members need quick access to referenced verses without switching apps or websites
3. **Preparation Convenience** - Members want to review content on their phones before/during the study session
4. **Translation Preferences** - Different members prefer different Bible translations

## How It Should Work

### Weekly Flow
1. Admin uploads or configures weekly content (readings, dinner host, questions)
2. Members open the app to see the current week's information
3. Members can tap Bible references to view verse text in their preferred translation
4. Members navigate between weeks to review past or upcoming content

### Key Interactions
- **Week Navigation**: Simple prev/next buttons to move between weeks
- **Verse Lookup**: Tap any verse reference → modal opens with verse text
- **Translation Toggle**: Switch between NIV, KJV, MSG, ESV in the verse modal
- **Content Sections**: Clear separation of Readings, Dinner, and Questions

## User Experience Goals
1. **Instant Understanding** - Users should immediately know what's happening this week
2. **Zero Friction** - Opening a verse should be one tap, no searching required
3. **Mobile Optimized** - Designed for phone use during meetings and on-the-go prep
4. **Reliable Access** - PWA ensures the app works even with spotty connectivity
5. **Familiar Patterns** - Uses standard mobile UI conventions (cards, modals, tabs)

## Target Users
- **Bible Study Members**: Primary users viewing weekly content and looking up verses
- **Admin/Host**: (Future) User who inputs weekly content

## Non-Goals (Current Scope)
- User authentication/login
- Social features (comments, sharing)
- Real-time collaboration
- Admin interface for content management (data is mock/static for MVP)
