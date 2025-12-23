# Component Architecture

## Overview

This document defines the frontend component structure with pseudocode for the MFers Bible Study App. Components are organized by feature domain with clear interfaces and TDD anchors.

---

## Directory Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   └── skeleton.tsx
│   ├── layout/                # App-wide layout
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   └── BottomNav.tsx
│   ├── week/                  # Week feature
│   │   ├── WeekHeader.tsx
│   │   ├── WeekContent.tsx
│   │   ├── ReadingCard.tsx
│   │   └── DinnerCard.tsx
│   ├── questions/             # Questions feature
│   │   ├── QuestionList.tsx
│   │   └── QuestionCard.tsx
│   └── bible/                 # Bible verse feature
│       ├── RichText.tsx
│       ├── VerseLink.tsx
│       └── VerseModal.tsx
├── hooks/
│   ├── useWeek.ts
│   ├── useVerses.ts
│   └── useHighlights.ts
├── lib/
│   ├── api.ts
│   ├── bibleParser.ts
│   └── dateUtils.ts
├── types/
│   └── index.ts
└── pages/
    ├── WeekPage.tsx
    └── NotFound.tsx
```

---

## Core Types

```typescript
// types/index.ts

interface Week {
  weekId: string              // ISO date: "2025-12-23"
  weekDate: Date              // Tuesday anchor
  readingAssignment: string   // e.g., "John 3:1-21"
  dinnerFamily: string | null
  dinnerNotes: string | null
  questions: Question[]
}

interface Question {
  questionId: string
  order: number
  text: string
}

interface BibleReference {
  book: string                // e.g., "John", "1 John"
  chapter: number
  verseStart: number
  verseEnd: number | null     // null for single verse
  raw: string                 // original text match
}

interface Verse {
  number: number
  text: string
}

interface PassageResponse {
  reference: BibleReference
  translation: Translation
  verses: Verse[]
  copyright: string
}

type Translation = 'NIV' | 'KJV' | 'MSG' | 'ESV'
```

---

## Layout Components

### AppShell

**Purpose:** Root layout wrapper with navigation structure.

```typescript
interface AppShellProps {
  children: React.ReactNode
}

function AppShell(props):
  return (
    <div class="min-h-screen flex flex-col bg-background">
      <main class="flex-1 pb-16">
        {props.children}
      </main>
      <BottomNav />
    </div>
  )

// TDD Anchors
describe('AppShell', () => {
  it('should render children in main content area')
  it('should include BottomNav at bottom')
  it('should have safe area padding for mobile')
})
```

### BottomNav

**Purpose:** Persistent bottom navigation for mobile.

```typescript
interface NavItem {
  icon: IconName
  label: string
  path: string
}

function BottomNav():
  location = useLocation()
  
  items: NavItem[] = [
    { icon: 'book-open', label: 'Week', path: '/' },
    { icon: 'utensils', label: 'Dinner', path: '/dinner' }
  ]
  
  return (
    <nav class="fixed bottom-0 inset-x-0 h-16 border-t bg-surface safe-area-bottom">
      <div class="flex justify-around items-center h-full">
        {items.map(item => (
          <NavLink 
            to={item.path}
            class={cn(
              "flex flex-col items-center gap-1 p-2 min-w-[64px] min-h-[44px]",
              isActive(location, item.path) && "text-accent"
            )}
          >
            <Icon name={item.icon} size={24} />
            <span class="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )

// TDD Anchors
describe('BottomNav', () => {
  it('should render nav items with icons and labels')
  it('should highlight active route')
  it('should have touch targets >= 44px')
})
```

---

## Week Components

### WeekHeader

**Purpose:** Week navigation with prev/next and title.

```typescript
interface WeekHeaderProps {
  week: Week
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

function WeekHeader(props):
  return (
    <header class="sticky top-0 z-10 h-14 flex items-center justify-between px-4 bg-surface border-b">
      <IconButton
        icon="chevron-left"
        onClick={props.onPrevious}
        disabled={!props.hasPrevious}
        aria-label="Previous week"
        class="min-w-[44px] min-h-[44px]"
      />
      
      <h1 class="text-lg font-semibold">
        Week of {formatWeekDate(props.week.weekDate)}
      </h1>
      
      <IconButton
        icon="chevron-right"
        onClick={props.onNext}
        disabled={!props.hasNext}
        aria-label="Next week"
        class="min-w-[44px] min-h-[44px]"
      />
    </header>
  )

function formatWeekDate(date: Date): string
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })

// TDD Anchors
describe('WeekHeader', () => {
  it('should format date as "Dec 23, 2025"')
  it('should disable prev button when hasPrevious is false')
  it('should disable next button when hasNext is false')
  it('should call onPrevious when prev clicked')
  it('should call onNext when next clicked')
})
```

### ReadingCard

**Purpose:** Display reading assignment with parsed verse links.

```typescript
interface ReadingCardProps {
  readingAssignment: string
  onVerseClick: (ref: BibleReference) => void
}

function ReadingCard(props):
  return (
    <Card class="mx-4 mt-4">
      <CardHeader class="flex items-center gap-2 pb-2">
        <BookOpenIcon class="w-5 h-5 text-accent" />
        <span class="font-medium">Reading</span>
      </CardHeader>
      <CardContent>
        <RichText 
          text={props.readingAssignment}
          onReferenceClick={props.onVerseClick}
        />
      </CardContent>
    </Card>
  )

// TDD Anchors
describe('ReadingCard', () => {
  it('should display reading assignment text')
  it('should render verse references as clickable links')
  it('should call onVerseClick with parsed reference')
})
```

### DinnerCard

**Purpose:** Display dinner assignment for the week.

```typescript
interface DinnerCardProps {
  familyName: string | null
  notes: string | null
}

function DinnerCard(props):
  if (!props.familyName) return null
  
  return (
    <Card class="mx-4 mt-4">
      <CardHeader class="flex items-center gap-2 pb-2">
        <UtensilsIcon class="w-5 h-5 text-accent" />
        <span class="font-medium">Dinner</span>
      </CardHeader>
      <CardContent>
        <p class="text-lg">{props.familyName}</p>
        {props.notes && (
          <p class="text-sm text-muted mt-1">{props.notes}</p>
        )}
      </CardContent>
    </Card>
  )

// TDD Anchors
describe('DinnerCard', () => {
  it('should display family name')
  it('should display notes when present')
  it('should return null when no family assigned')
})
```

---

## Questions Components

### QuestionList

**Purpose:** Render list of discussion questions.

```typescript
interface QuestionListProps {
  questions: Question[]
  highlightedIds: Set<string>
  onToggleHighlight: (questionId: string) => void
  onVerseClick: (ref: BibleReference) => void
}

function QuestionList(props):
  return (
    <section class="px-4 mt-6">
      <h2 class="font-semibold text-lg mb-3">Discussion Questions</h2>
      <div class="space-y-3">
        {props.questions
          .sort((a, b) => a.order - b.order)
          .map(question => (
            <QuestionCard
              key={question.questionId}
              question={question}
              isHighlighted={props.highlightedIds.has(question.questionId)}
              onToggle={() => props.onToggleHighlight(question.questionId)}
              onVerseClick={props.onVerseClick}
            />
          ))}
      </div>
    </section>
  )

// TDD Anchors
describe('QuestionList', () => {
  it('should render questions in order')
  it('should pass highlight state to each card')
  it('should call onToggleHighlight with correct id')
})
```

### QuestionCard

**Purpose:** Individual question with highlight toggle.

```typescript
interface QuestionCardProps {
  question: Question
  isHighlighted: boolean
  onToggle: () => void
  onVerseClick: (ref: BibleReference) => void
}

function QuestionCard(props):
  return (
    <Card
      class={cn(
        "p-4 cursor-pointer transition-all duration-150",
        "hover:shadow-md active:scale-[0.98]",
        props.isHighlighted && "border-2 border-accent bg-accent/5"
      )}
      onClick={props.onToggle}
      role="button"
      aria-pressed={props.isHighlighted}
    >
      <div class="flex gap-3">
        <span class={cn(
          "text-lg font-medium min-w-[24px]",
          props.isHighlighted ? "text-accent" : "text-muted"
        )}>
          {props.question.order}.
        </span>
        <div class={cn(
          "flex-1",
          props.isHighlighted && "font-semibold"
        )}>
          <RichText 
            text={props.question.text}
            onReferenceClick={(ref) => {
              // Prevent toggle when clicking verse link
              event.stopPropagation()
              props.onVerseClick(ref)
            }}
          />
        </div>
      </div>
    </Card>
  )

// TDD Anchors
describe('QuestionCard', () => {
  it('should display question number and text')
  it('should toggle highlight on click')
  it('should show visual highlight when isHighlighted')
  it('should not toggle when clicking verse link')
})
```

---

## Bible Components

### RichText

**Purpose:** Parse text and render verse references as links.

```typescript
interface RichTextProps {
  text: string
  onReferenceClick: (ref: BibleReference) => void
}

function RichText(props):
  segments = parseTextWithReferences(props.text)
  
  return (
    <span>
      {segments.map((segment, i) => 
        segment.type === 'text' ? (
          <span key={i}>{segment.content}</span>
        ) : (
          <VerseLink
            key={i}
            reference={segment.reference}
            onClick={() => props.onReferenceClick(segment.reference)}
          />
        )
      )}
    </span>
  )

type TextSegment = 
  | { type: 'text', content: string }
  | { type: 'reference', reference: BibleReference }

function parseTextWithReferences(text: string): TextSegment[]
  // See lib/bibleParser.ts for implementation
  // Returns array of text and reference segments

// TDD Anchors
describe('RichText', () => {
  it('should render plain text without references')
  it('should detect and link "John 3:16"')
  it('should detect and link "John 3:1-15"')
  it('should detect and link "1 John 1:1-4"')
  it('should handle multiple references in text')
})
```

### VerseLink

**Purpose:** Clickable verse reference with styling.

```typescript
interface VerseLinkProps {
  reference: BibleReference
  onClick: () => void
}

function VerseLink(props):
  return (
    <button
      onClick={props.onClick}
      class="text-accent underline hover:text-accent/80 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
    >
      {props.reference.raw}
    </button>
  )

// TDD Anchors
describe('VerseLink', () => {
  it('should display reference text')
  it('should call onClick when clicked')
  it('should have accessible focus styles')
})
```

### VerseModal

**Purpose:** Bottom sheet/dialog showing verse content.

```typescript
interface VerseModalProps {
  reference: BibleReference | null
  isOpen: boolean
  onClose: () => void
}

function VerseModal(props):
  [translation, setTranslation] = useState<Translation>('NIV')
  
  verseQuery = useVerses(props.reference, translation, {
    enabled: props.isOpen && props.reference !== null
  })
  
  return (
    <Sheet open={props.isOpen} onOpenChange={props.onClose}>
      <SheetContent side="bottom" class="max-h-[85vh] rounded-t-xl">
        <SheetHeader class="border-b pb-3">
          <SheetTitle>
            {props.reference && formatReference(props.reference)}
          </SheetTitle>
        </SheetHeader>
        
        <Tabs value={translation} onValueChange={setTranslation} class="mt-4">
          <TabsList class="grid grid-cols-4 w-full">
            <TabsTrigger value="NIV">NIV</TabsTrigger>
            <TabsTrigger value="KJV">KJV</TabsTrigger>
            <TabsTrigger value="MSG">MSG</TabsTrigger>
            <TabsTrigger value="ESV">ESV</TabsTrigger>
          </TabsList>
          
          <div class="mt-4 max-h-[50vh] overflow-y-auto">
            {verseQuery.isLoading ? (
              <VerseSkeleton />
            ) : verseQuery.isError ? (
              <ErrorMessage message="Failed to load verses" />
            ) : (
              <VerseContent 
                verses={verseQuery.data.verses}
                copyright={verseQuery.data.copyright}
              />
            )}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )

function VerseContent(props: { verses: Verse[], copyright: string }):
  return (
    <div class="prose prose-lg">
      {props.verses.map(verse => (
        <span key={verse.number}>
          <sup class="text-xs text-muted mr-1">{verse.number}</sup>
          {verse.text}{' '}
        </span>
      ))}
      <p class="text-xs text-muted mt-4">{props.copyright}</p>
    </div>
  )

// TDD Anchors
describe('VerseModal', () => {
  it('should not fetch when closed')
  it('should fetch verses when opened')
  it('should default to NIV translation')
  it('should switch translations on tab click')
  it('should show loading skeleton while fetching')
  it('should display copyright notice')
})
```

---

## Custom Hooks

### useWeek

```typescript
function useWeek(weekId: string | undefined):
  return useQuery({
    queryKey: ['week', weekId],
    queryFn: () => api.getWeek(weekId!),
    enabled: !!weekId,
    staleTime: 5 * 60 * 1000
  })

// TDD Anchors
describe('useWeek', () => {
  it('should not fetch when weekId is undefined')
  it('should return week data on success')
  it('should cache results for 5 minutes')
})
```

### useHighlights

```typescript
function useHighlights(weekId: string):
  [highlights, setHighlights] = useState<Set<string>>(new Set())
  
  // Persist to localStorage per week
  useEffect(() => {
    stored = localStorage.getItem(`highlights-${weekId}`)
    if (stored) setHighlights(new Set(JSON.parse(stored)))
  }, [weekId])
  
  useEffect(() => {
    localStorage.setItem(`highlights-${weekId}`, JSON.stringify([...highlights]))
  }, [highlights, weekId])
  
  toggle = useCallback((questionId: string) => {
    setHighlights(prev => {
      next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }, [])
  
  return { highlights, toggle }

// TDD Anchors
describe('useHighlights', () => {
  it('should toggle question highlight')
  it('should persist highlights to localStorage')
  it('should load highlights from localStorage')
  it('should reset on week change')
})
```

### useVerses

```typescript
function useVerses(
  reference: BibleReference | null,
  translation: Translation,
  options?: { enabled?: boolean }
):
  return useQuery({
    queryKey: ['verses', reference?.raw, translation],
    queryFn: () => api.getVerses(reference!, translation),
    enabled: options?.enabled && reference !== null,
    staleTime: 30 * 60 * 1000,  // Cache verses longer
    gcTime: 60 * 60 * 1000
  })

// TDD Anchors
describe('useVerses', () => {
  it('should not fetch when reference is null')
  it('should fetch with reference and translation')
  it('should cache results for 30 minutes')
})
```

---

## Page Components

### WeekPage

```typescript
function WeekPage():
  { weekId } = useParams()
  navigate = useNavigate()
  
  // Determine current week if no weekId
  effectiveWeekId = weekId ?? getCurrentWeekId()
  
  weekQuery = useWeek(effectiveWeekId)
  { highlights, toggle } = useHighlights(effectiveWeekId)
  [selectedRef, setSelectedRef] = useState<BibleReference | null>(null)
  
  // Navigation
  { hasPrevious, hasNext, previousId, nextId } = useWeekNavigation(effectiveWeekId)
  
  goToPrevious = () => navigate(`/week/${previousId}`)
  goToNext = () => navigate(`/week/${nextId}`)
  
  if (weekQuery.isLoading) return <WeekSkeleton />
  if (weekQuery.isError) return <ErrorPage />
  
  week = weekQuery.data
  
  return (
    <>
      <WeekHeader
        week={week}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />
      
      <ReadingCard
        readingAssignment={week.readingAssignment}
        onVerseClick={setSelectedRef}
      />
      
      <DinnerCard
        familyName={week.dinnerFamily}
        notes={week.dinnerNotes}
      />
      
      <QuestionList
        questions={week.questions}
        highlightedIds={highlights}
        onToggleHighlight={toggle}
        onVerseClick={setSelectedRef}
      />
      
      <VerseModal
        reference={selectedRef}
        isOpen={selectedRef !== null}
        onClose={() => setSelectedRef(null)}
      />
    </>
  )

// TDD Anchors
describe('WeekPage', () => {
  it('should load week data on mount')
  it('should show skeleton while loading')
  it('should navigate to previous week')
  it('should navigate to next week')
  it('should open verse modal when reference clicked')
})
```

---

## Utility Functions

### lib/bibleParser.ts

```typescript
const BIBLE_REFERENCE_REGEX = /\b(\d?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:[-–](\d+))?\b/g

function parseVerseReferences(text: string): BibleReference[]
  matches = []
  while (match = BIBLE_REFERENCE_REGEX.exec(text)):
    matches.push({
      book: normalizeBook(match[1]),
      chapter: parseInt(match[2]),
      verseStart: parseInt(match[3]),
      verseEnd: match[4] ? parseInt(match[4]) : null,
      raw: match[0]
    })
  return matches

function normalizeBook(book: string): string
  // Normalize "1 john" → "1 John", "john" → "John"
  return book.trim()
    .replace(/^(\d)\s*/, '$1 ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

// TDD Anchors
describe('parseVerseReferences', () => {
  it('should parse "John 3:16" correctly')
  it('should parse "John 3:1-15" with range')
  it('should parse "1 John 1:1-4" with numbered book')
  it('should handle lowercase "john 3:16"')
  it('should find multiple references in text')
})
```

### lib/dateUtils.ts

```typescript
function getCurrentWeekId(): string
  // Get the most recent Tuesday (or today if Tuesday)
  today = new Date()
  dayOfWeek = today.getDay()
  daysToSubtract = (dayOfWeek + 5) % 7  // Days since last Tuesday
  tuesday = new Date(today)
  tuesday.setDate(today.getDate() - daysToSubtract)
  return formatWeekId(tuesday)

function formatWeekId(date: Date): string
  return date.toISOString().split('T')[0]  // "2025-12-23"

function getAdjacentWeekIds(weekId: string): { previous: string, next: string }
  date = new Date(weekId)
  previous = new Date(date)
  previous.setDate(date.getDate() - 7)
  next = new Date(date)
  next.setDate(date.getDate() + 7)
  return {
    previous: formatWeekId(previous),
    next: formatWeekId(next)
  }

// TDD Anchors
describe('getCurrentWeekId', () => {
  it('should return current Tuesday if today is Tuesday')
  it('should return last Tuesday if today is Wednesday')
  it('should return last Tuesday if today is Monday')
})
```
