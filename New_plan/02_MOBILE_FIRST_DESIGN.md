# Mobile-First Design Specification

## Design Philosophy

Build for the **smallest screen first**, then enhance for larger viewports. The primary user experience is a phone held in one hand during Bible study.

---

## Core Principles

### 1. Thumb-Friendly Navigation
- **Bottom navigation bar** for primary actions
- **Interactive elements in thumb zone** (bottom 60% of screen)
- **Avoid top corners** for frequent actions

### 2. Touch-First Interactions
- **Minimum touch target: 44px × 44px** (Apple HIG / WCAG)
- **Adequate spacing** between targets (8px minimum)
- **Visual feedback** on all tappable elements

### 3. Content Hierarchy
- **Progressive disclosure** — summary first, details on demand
- **Single-column layout** on mobile
- **Cards** to group related content

### 4. Readable Typography
- **Base font size: 16px** (prevents zoom on iOS)
- **Line height: 1.5** for body text
- **Scripture: 18-20px** for comfortable reading

---

## Screen Layouts

### Mobile Layout (< 768px)

```
┌─────────────────────────────────┐
│  ← Week of Dec 23, 2025 →       │  ← Header (sticky)
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ 📖 Reading                  ││
│  │ John 3:1-21                 ││  ← Reading Card
│  │ [clickable verse ref]       ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 1. What does it mean...     ││
│  │    [tap to highlight]       ││  ← Question Cards
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ 2. How does John 3:16...    ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🍽️ Dinner: Johnson Family   ││  ← Dinner Card
│  │    "Bringing tacos"         ││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  [Week]     [Questions]         │  ← Bottom Nav (sticky)
└─────────────────────────────────┘
```

### Tablet Layout (768px - 1024px)

```
┌─────────────────────────────────────────────────┐
│  ← Week of Dec 23, 2025 →                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────┐  ┌──────────────────────┐ │
│  │ 📖 Reading       │  │ Questions            │ │
│  │ John 3:1-21      │  │ 1. What does it...   │ │
│  │                  │  │ 2. How does John...  │ │
│  │ 🍽️ Dinner:       │  │ 3. ...               │ │
│  │ Johnson Family   │  │                      │ │
│  └──────────────────┘  └──────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Desktop Layout (> 1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│  MFers Bible Study          Week of Dec 23, 2025   [← prev|next →]
├─────────────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌─────────────────────┐ ┌──────────────────────┐ │
│ │ Week List  │ │ 📖 Reading          │ │ Questions            │ │
│ │            │ │ John 3:1-21         │ │ 1. What does it...   │ │
│ │ Dec 23 ●   │ │                     │ │ 2. How does John...  │ │
│ │ Dec 16     │ │ 🍽️ Dinner:          │ │ 3. ...               │ │
│ │ Dec 9      │ │ Johnson Family      │ │                      │ │
│ └────────────┘ └─────────────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Header (Sticky)

```
Height: 56px
Background: surface color
Content:
  - Left: Previous week button (IconButton, 44px)
  - Center: Week title (tappable → opens week selector)
  - Right: Next week button (IconButton, 44px)
```

**Pseudocode:**
```typescript
interface WeekHeaderProps {
  currentWeek: Week
  onPrevious: () => void
  onNext: () => void
  onSelectWeek: () => void
  hasPrevious: boolean
  hasNext: boolean
}

function WeekHeader(props):
  return (
    <header class="sticky top-0 h-14 flex items-center justify-between px-4">
      <IconButton 
        icon="chevron-left" 
        onClick={props.onPrevious}
        disabled={!props.hasPrevious}
        aria-label="Previous week"
      />
      <button 
        onClick={props.onSelectWeek}
        class="text-lg font-medium"
        aria-label="Select week"
      >
        Week of {formatDate(props.currentWeek.weekDate)}
      </button>
      <IconButton 
        icon="chevron-right" 
        onClick={props.onNext}
        disabled={!props.hasNext}
        aria-label="Next week"
      />
    </header>
  )
```

### Reading Card

**Pseudocode:**
```typescript
interface ReadingCardProps {
  readingAssignment: string  // e.g., "John 3:1-21"
  onVerseClick: (ref: BibleReference) => void
}

function ReadingCard(props):
  parsedContent = parseVerseReferences(props.readingAssignment)
  
  return (
    <Card class="p-4">
      <CardHeader>
        <BookIcon />
        <span>Reading</span>
      </CardHeader>
      <CardContent>
        <RichText 
          content={parsedContent}
          onReferenceClick={props.onVerseClick}
        />
      </CardContent>
    </Card>
  )
```

### Question Card

**Pseudocode:**
```typescript
interface QuestionCardProps {
  question: Question
  isHighlighted: boolean
  onToggleHighlight: () => void
}

function QuestionCard(props):
  return (
    <Card 
      class={cn(
        "p-4 cursor-pointer transition-all",
        props.isHighlighted && "border-accent font-bold bg-accent/10"
      )}
      onClick={props.onToggleHighlight}
      role="button"
      aria-pressed={props.isHighlighted}
    >
      <span class="text-muted mr-2">{props.question.order}.</span>
      <RichText 
        content={parseVerseReferences(props.question.text)}
      />
    </Card>
  )
```

### Bottom Navigation

**Pseudocode:**
```typescript
function BottomNav(props):
  return (
    <nav class="fixed bottom-0 left-0 right-0 h-16 border-t bg-surface">
      <div class="flex justify-around items-center h-full pb-safe">
        <NavItem 
          icon="home" 
          label="Week" 
          active={props.currentTab === 'week'}
          onClick={() => props.onTabChange('week')}
        />
        <NavItem 
          icon="utensils" 
          label="Dinner" 
          active={props.currentTab === 'dinner'}
          onClick={() => props.onTabChange('dinner')}
        />
      </div>
    </nav>
  )
```

### Bible Verse Modal (Mobile: Bottom Sheet)

**Pseudocode:**
```typescript
interface VerseModalProps {
  reference: BibleReference
  isOpen: boolean
  onClose: () => void
}

function VerseModal(props):
  [translation, setTranslation] = useState('NIV')
  verseQuery = useVerseQuery(props.reference, translation)
  
  return (
    <Sheet open={props.isOpen} onOpenChange={props.onClose}>
      <SheetContent side="bottom" class="max-h-[90vh]">
        <SheetHeader>
          <SheetTitle>{formatReference(props.reference)}</SheetTitle>
        </SheetHeader>
        
        <Tabs value={translation} onValueChange={setTranslation}>
          <TabsList class="grid grid-cols-4">
            <TabsTrigger value="NIV">NIV</TabsTrigger>
            <TabsTrigger value="KJV">KJV</TabsTrigger>
            <TabsTrigger value="MSG">MSG</TabsTrigger>
            <TabsTrigger value="ESV">ESV</TabsTrigger>
          </TabsList>
          
          <TabsContent>
            {verseQuery.isLoading ? <LoadingSpinner /> : <VerseText verses={verseQuery.data} />}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
```

---

## Touch Interactions

### Gesture Support

| Gesture | Action | Implementation |
|---------|--------|----------------|
| Tap | Select/activate | Native click events |
| Swipe left/right | Navigate weeks | Optional; framer-motion |
| Pull down | Refresh data | Native pull-to-refresh |

### Touch Feedback

```css
.touchable {
  -webkit-tap-highlight-color: transparent;
  transition: transform 100ms ease, opacity 100ms ease;
}
.touchable:active {
  transform: scale(0.98);
  opacity: 0.9;
}
```

---

## Typography Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (Screen title) | 24px | 600 | 1.2 |
| H2 (Card title) | 18px | 600 | 1.3 |
| Body | 16px | 400 | 1.5 |
| Scripture | 18px | 400 | 1.6 |
| Caption | 14px | 400 | 1.4 |
| Button | 16px | 500 | 1.0 |

---

## Color Palette

```css
:root {
  --background: #FFFFFF;
  --surface: #F8F9FA;
  --text-primary: #1A1A1A;
  --text-secondary: #6B7280;
  --accent: #2563EB;
  --accent-light: #DBEAFE;
  --border: #E5E7EB;
  --highlight: #FEF3C7;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0F172A;
    --surface: #1E293B;
    --text-primary: #F8FAFC;
    --text-secondary: #94A3B8;
    --accent: #3B82F6;
    --accent-light: #1E3A5F;
    --border: #334155;
    --highlight: #78350F;
  }
}
```

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight spacing |
| space-2 | 8px | Icon gaps |
| space-3 | 12px | Card internal |
| space-4 | 16px | Card padding |
| space-5 | 20px | Section gaps |
| space-6 | 24px | Screen padding |
| space-8 | 32px | Large gaps |

---

## Responsive Breakpoints

```css
/* Mobile first - base styles for < 768px */
@media (min-width: 768px) { /* Tablet - Two-column layouts */ }
@media (min-width: 1024px) { /* Desktop - Three-column, sidebar */ }
@media (min-width: 1280px) { /* Large desktop - Max-width containers */ }
```

---

## Accessibility Checklist

- [ ] All interactive elements ≥ 44px × 44px
- [ ] Spacing between targets ≥ 8px
- [ ] Color contrast ≥ 4.5:1 (text)
- [ ] Focus indicators visible
- [ ] Semantic HTML structure
- [ ] ARIA labels on icon buttons
- [ ] Modal focus trapping
- [ ] Respect prefers-reduced-motion

---

## PWA Considerations

### iOS Safe Areas
```css
.bottom-nav { padding-bottom: env(safe-area-inset-bottom); }
.header { padding-top: env(safe-area-inset-top); }
```

### Manifest Essentials
```json
{
  "name": "MFers Bible Study",
  "short_name": "MFers",
  "display": "standalone",
  "theme_color": "#2563EB"
}
```

---

## TDD Anchors for UI

```typescript
describe('WeekHeader', () => {
  it('should display formatted week date')
  it('should disable previous button when at first week')
  it('should have touch targets >= 44px')
})

describe('QuestionCard', () => {
  it('should toggle highlight state on click')
  it('should show visual highlight when selected')
  it('should parse verse references in text')
})

describe('VerseModal', () => {
  it('should open as bottom sheet on mobile')
  it('should default to NIV translation')
  it('should switch translations when tab clicked')
})
```
