# Data Structure for MVP

## Overview

This document defines the simplified data model for the MFers Bible Study App MVP. The model uses Azure Table Storage with a denormalized structure optimized for read performance.

---

## Entity Relationship

```
┌─────────────────┐
│     Study       │  (Future - not in MVP)
│  - studyId      │
│  - name         │
│  - startDate    │
│  - endDate      │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│      Week       │
│  - weekId       │
│  - weekDate     │
│  - reading      │
│  - dinner       │
│  - questions[]  │  ← Embedded for MVP
└─────────────────┘
```

---

## Azure Table Storage Schema

### Weeks Table

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `PartitionKey` | string | Study ID | `"study-2025"` |
| `RowKey` | string | Week ID (ISO date) | `"2025-12-23"` |
| `WeekDate` | datetime | Tuesday anchor | `2025-12-23T00:00:00Z` |
| `ReadingAssignment` | string | Bible reference | `"John 3:1-21"` |
| `DinnerFamily` | string? | Family name | `"Johnson"` |
| `DinnerNotes` | string? | Meal notes | `"Bringing tacos"` |
| `QuestionsJson` | string | Embedded JSON | `"[{\"order\":1,...}]"` |
| `IsNoMeeting` | boolean | Skip week flag | `false` |
| `CreatedAt` | datetime | Audit field | `2025-01-15T10:30:00Z` |
| `UpdatedAt` | datetime | Audit field | `2025-01-15T10:30:00Z` |

### Questions (Embedded in Week)

```typescript
interface EmbeddedQuestion {
  questionId: string   // UUID
  order: number        // 1-based
  text: string         // Question text (may contain verse refs)
}

// Stored as JSON string in Week.QuestionsJson
// Example:
[
  { "questionId": "q1", "order": 1, "text": "What does it mean to be born again?" },
  { "questionId": "q2", "order": 2, "text": "How does John 3:16 summarize the gospel?" }
]
```

### PassageCache Table

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `PartitionKey` | string | Translation | `"NIV"` |
| `RowKey` | string | Normalized reference | `"john:3:16:16"` |
| `VersesJson` | string | Cached verses | `"[{\"number\":16,...}]"` |
| `Copyright` | string | Attribution | `"NIV Copyright..."` |
| `CachedAt` | datetime | Cache timestamp | `2025-12-23T10:00:00Z` |
| `TtlSeconds` | int | Time to live | `604800` (7 days) |

---

## TypeScript Interfaces

### Domain Models

```typescript
// src/types/index.ts

// Week entity as stored
interface WeekEntity {
  partitionKey: string      // studyId
  rowKey: string            // weekId
  weekDate: Date
  readingAssignment: string
  dinnerFamily: string | null
  dinnerNotes: string | null
  questionsJson: string
  isNoMeeting: boolean
  createdAt: Date
  updatedAt: Date
}

// Week model for frontend
interface Week {
  weekId: string
  weekDate: Date
  readingAssignment: string
  dinnerFamily: string | null
  dinnerNotes: string | null
  questions: Question[]
  isNoMeeting: boolean
}

interface Question {
  questionId: string
  order: number
  text: string
}

// API response wrapper
interface WeekResponse {
  week: Week
  navigation: {
    previousWeekId: string | null
    nextWeekId: string | null
    studyId: string
  }
}
```

### Mapper Functions

```typescript
// api/src/shared/mappers.ts

function mapWeekEntityToWeek(entity: WeekEntity): Week
  return {
    weekId: entity.rowKey,
    weekDate: entity.weekDate,
    readingAssignment: entity.readingAssignment,
    dinnerFamily: entity.dinnerFamily,
    dinnerNotes: entity.dinnerNotes,
    questions: JSON.parse(entity.questionsJson),
    isNoMeeting: entity.isNoMeeting
  }

function mapWeekToEntity(week: Week, studyId: string): WeekEntity
  return {
    partitionKey: studyId,
    rowKey: week.weekId,
    weekDate: week.weekDate,
    readingAssignment: week.readingAssignment,
    dinnerFamily: week.dinnerFamily,
    dinnerNotes: week.dinnerNotes,
    questionsJson: JSON.stringify(week.questions),
    isNoMeeting: week.isNoMeeting,
    createdAt: new Date(),
    updatedAt: new Date()
  }

// TDD Anchors
describe('mapWeekEntityToWeek', () => {
  it('should parse questionsJson to array')
  it('should preserve null values for optional fields')
  it('should convert weekDate to Date object')
})
```

---

## API Data Transfer Objects

### GET /api/weeks/:weekId

```typescript
// Response
interface GetWeekResponse {
  week: Week
  navigation: {
    previousWeekId: string | null
    nextWeekId: string | null
  }
}

// Example response
{
  "week": {
    "weekId": "2025-12-23",
    "weekDate": "2025-12-23T00:00:00Z",
    "readingAssignment": "John 3:1-21",
    "dinnerFamily": "Johnson",
    "dinnerNotes": "Bringing tacos",
    "questions": [
      { "questionId": "q1", "order": 1, "text": "What does it mean to be born again?" },
      { "questionId": "q2", "order": 2, "text": "How does John 3:16 summarize the gospel?" }
    ],
    "isNoMeeting": false
  },
  "navigation": {
    "previousWeekId": "2025-12-16",
    "nextWeekId": "2025-12-30"
  }
}
```

### GET /api/weeks

```typescript
// Query parameters
interface GetWeeksQuery {
  studyId?: string    // Filter by study (default: current)
  limit?: number      // Max results (default: 20)
  cursor?: string     // Pagination cursor
}

// Response
interface GetWeeksResponse {
  weeks: WeekSummary[]
  nextCursor: string | null
}

interface WeekSummary {
  weekId: string
  weekDate: Date
  readingAssignment: string
  questionCount: number
  isNoMeeting: boolean
}

// Example response
{
  "weeks": [
    {
      "weekId": "2025-12-23",
      "weekDate": "2025-12-23T00:00:00Z",
      "readingAssignment": "John 3:1-21",
      "questionCount": 5,
      "isNoMeeting": false
    },
    {
      "weekId": "2025-12-16",
      "weekDate": "2025-12-16T00:00:00Z",
      "readingAssignment": "John 2:1-25",
      "questionCount": 4,
      "isNoMeeting": false
    }
  ],
  "nextCursor": null
}
```

### GET /api/weeks/current

```typescript
// Response: same as GET /api/weeks/:weekId
// Returns the week for the current Tuesday

// Example
GET /api/weeks/current
→ Redirects to GET /api/weeks/2025-12-23 (if today is Dec 23-29)
```

---

## Data Access Layer

### Week Repository

```typescript
// api/src/repositories/weekRepository.ts

interface WeekRepository {
  getById(studyId: string, weekId: string): Promise<Week | null>
  getByStudy(studyId: string, limit?: number): Promise<Week[]>
  getCurrentWeek(studyId: string): Promise<Week | null>
  getNavigation(studyId: string, weekId: string): Promise<WeekNavigation>
}

interface WeekNavigation {
  previousWeekId: string | null
  nextWeekId: string | null
}

class TableStorageWeekRepository implements WeekRepository
  constructor(private tableClient: TableClient)
  
  async getById(studyId: string, weekId: string): Promise<Week | null>
    try
      entity = await this.tableClient.getEntity<WeekEntity>(studyId, weekId)
      return mapWeekEntityToWeek(entity)
    catch (error)
      if (error.statusCode === 404) return null
      throw error
  
  async getByStudy(studyId: string, limit = 20): Promise<Week[]>
    query = this.tableClient.listEntities<WeekEntity>({
      queryOptions: {
        filter: `PartitionKey eq '${studyId}'`
      }
    })
    
    weeks: Week[] = []
    for await (entity of query)
      weeks.push(mapWeekEntityToWeek(entity))
      if (weeks.length >= limit) break
    
    return weeks.sort((a, b) => 
      b.weekDate.getTime() - a.weekDate.getTime()
    )
  
  async getCurrentWeek(studyId: string): Promise<Week | null>
    currentWeekId = getCurrentWeekId()
    return this.getById(studyId, currentWeekId)
  
  async getNavigation(studyId: string, weekId: string): Promise<WeekNavigation>
    weeks = await this.getByStudy(studyId, 100)
    weekIds = weeks.map(w => w.weekId).sort()
    
    currentIndex = weekIds.indexOf(weekId)
    
    return {
      previousWeekId: currentIndex > 0 ? weekIds[currentIndex - 1] : null,
      nextWeekId: currentIndex < weekIds.length - 1 ? weekIds[currentIndex + 1] : null
    }

// TDD Anchors
describe('TableStorageWeekRepository', () => {
  it('should return null for non-existent week')
  it('should return week with parsed questions')
  it('should list weeks sorted by date descending')
  it('should calculate navigation for middle week')
  it('should return null previous for first week')
  it('should return null next for last week')
})
```

---

## Seed Data

### MVP Seed Script

```typescript
// scripts/seedData.ts

const STUDY_ID = 'study-2025'

const seedWeeks: Week[] = [
  {
    weekId: '2025-12-16',
    weekDate: new Date('2025-12-16'),
    readingAssignment: 'John 2:1-25',
    dinnerFamily: 'Smith',
    dinnerNotes: 'Potluck style',
    questions: [
      { questionId: 'w1q1', order: 1, text: 'What was significant about the wedding at Cana?' },
      { questionId: 'w1q2', order: 2, text: 'Why did Jesus cleanse the temple?' },
      { questionId: 'w1q3', order: 3, text: 'What does John 2:19 reveal about Jesus?' }
    ],
    isNoMeeting: false
  },
  {
    weekId: '2025-12-23',
    weekDate: new Date('2025-12-23'),
    readingAssignment: 'John 3:1-21',
    dinnerFamily: 'Johnson',
    dinnerNotes: 'Bringing tacos',
    questions: [
      { questionId: 'w2q1', order: 1, text: 'What does it mean to be born again?' },
      { questionId: 'w2q2', order: 2, text: 'How does John 3:16 summarize the gospel?' },
      { questionId: 'w2q3', order: 3, text: 'What does it mean that God sent His Son not to condemn?' },
      { questionId: 'w2q4', order: 4, text: 'Why do people love darkness rather than light (v.19)?' }
    ],
    isNoMeeting: false
  },
  {
    weekId: '2025-12-30',
    weekDate: new Date('2025-12-30'),
    readingAssignment: 'John 3:22-36',
    dinnerFamily: 'Williams',
    dinnerNotes: null,
    questions: [
      { questionId: 'w3q1', order: 1, text: 'How does John the Baptist respond to his decreasing popularity?' },
      { questionId: 'w3q2', order: 2, text: 'What does "He must increase, I must decrease" mean for us?' }
    ],
    isNoMeeting: false
  }
]

async function seed()
  tableClient = TableClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING,
    'Weeks'
  )
  
  for (week of seedWeeks)
    entity = mapWeekToEntity(week, STUDY_ID)
    await tableClient.upsertEntity(entity)
    console.log(`Seeded week: ${week.weekId}`)
  
  console.log('Seeding complete!')

// Run: npx ts-node scripts/seedData.ts
```

---

## Data Validation

### Week Validation

```typescript
// api/src/shared/validation.ts

import { z } from 'zod'

const QuestionSchema = z.object({
  questionId: z.string().min(1),
  order: z.number().int().positive(),
  text: z.string().min(1).max(1000)
})

const WeekSchema = z.object({
  weekId: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weekDate: z.date(),
  readingAssignment: z.string().min(1).max(500),
  dinnerFamily: z.string().max(100).nullable(),
  dinnerNotes: z.string().max(500).nullable(),
  questions: z.array(QuestionSchema).max(20),
  isNoMeeting: z.boolean()
})

function validateWeek(data: unknown): Week
  return WeekSchema.parse(data)

function validateWeekId(weekId: string): boolean
  return /^\d{4}-\d{2}-\d{2}$/.test(weekId)

// TDD Anchors
describe('validateWeek', () => {
  it('should accept valid week data')
  it('should reject invalid weekId format')
  it('should reject questions over 20')
  it('should reject empty reading assignment')
})
```

---

## Query Patterns

### Common Queries

```typescript
// Get current week with navigation
async function getCurrentWeekWithNav(studyId: string)
  currentWeekId = getCurrentWeekId()
  
  [week, navigation] = await Promise.all([
    weekRepo.getById(studyId, currentWeekId),
    weekRepo.getNavigation(studyId, currentWeekId)
  ])
  
  return { week, navigation }

// Get week list for selector
async function getWeekList(studyId: string)
  weeks = await weekRepo.getByStudy(studyId, 52)  // ~1 year
  
  return weeks.map(w => ({
    weekId: w.weekId,
    weekDate: w.weekDate,
    readingAssignment: w.readingAssignment,
    isCurrent: w.weekId === getCurrentWeekId()
  }))

// Prefetch adjacent weeks
async function prefetchAdjacentWeeks(studyId: string, weekId: string)
  { previousWeekId, nextWeekId } = await weekRepo.getNavigation(studyId, weekId)
  
  prefetches = []
  if (previousWeekId) prefetches.push(weekRepo.getById(studyId, previousWeekId))
  if (nextWeekId) prefetches.push(weekRepo.getById(studyId, nextWeekId))
  
  return Promise.all(prefetches)
```

---

## Migration Strategy

### From MVP to Post-MVP

When adding features like attendance or study management:

1. **Add new tables** — Don't modify existing Weeks table structure
2. **Create migration scripts** — Backfill any derived data
3. **Version API responses** — Add new fields without breaking clients

```typescript
// Future: Attendance table
interface AttendanceEntity {
  partitionKey: string  // weekId
  rowKey: string        // attendanceId
  familyName: string
  adultCount: number
  childCount: number
  updatedAt: Date
}

// Future: Studies table (when multi-study support added)
interface StudyEntity {
  partitionKey: string  // "studies"
  rowKey: string        // studyId
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
}
```

---

## Performance Considerations

### Indexing Strategy

Azure Table Storage uses PartitionKey + RowKey for fast lookups:

| Query Pattern | PartitionKey | RowKey | Performance |
|---------------|--------------|--------|-------------|
| Get week by ID | `studyId` | `weekId` | O(1) - Direct lookup |
| List weeks in study | `studyId` | * | O(n) - Partition scan |
| Get current week | `studyId` | `currentWeekId` | O(1) - Direct lookup |

### Caching Strategy

```typescript
// TanStack Query cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 30 * 60 * 1000     // 30 minutes
    }
  }
})

// Week data rarely changes, can be more aggressive
useQuery({
  queryKey: ['week', weekId],
  staleTime: 10 * 60 * 1000  // 10 minutes for week data
})
```
