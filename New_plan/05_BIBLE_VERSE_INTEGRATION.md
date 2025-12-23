# Bible Verse Integration with Azure Foundry

## Overview

This document details how the MFers Bible Study App integrates with Azure Foundry (AI Services) to provide intelligent Bible verse parsing, retrieval, and multi-translation support.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Azure Function │────▶│  Azure Foundry  │
│   (React)       │     │  /api/verses    │     │  (GPT-4)        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        │               │  Response Cache │
        │               │  (Table Storage)│
        │               └─────────────────┘
        │
        ▼
┌─────────────────┐
│  TanStack Query │
│  (Client Cache) │
└─────────────────┘
```

---

## Azure Foundry Setup

### Resource Configuration

```typescript
// Environment configuration (from Azure Key Vault)
interface FoundryConfig {
  endpoint: string      // e.g., "https://mfers-foundry.openai.azure.com/"
  apiKey: string        // Stored in Key Vault
  deploymentName: string // e.g., "gpt-4"
  apiVersion: string    // e.g., "2024-02-15-preview"
}

// Configuration loaded from environment
function getFoundryConfig(): FoundryConfig
  return {
    endpoint: process.env.AZURE_FOUNDRY_ENDPOINT,
    apiKey: process.env.AZURE_FOUNDRY_API_KEY,
    deploymentName: process.env.AZURE_FOUNDRY_DEPLOYMENT ?? 'gpt-4',
    apiVersion: '2024-02-15-preview'
  }
```

### Client Initialization

```typescript
// api/src/shared/foundryClient.ts
import { OpenAIClient, AzureKeyCredential } from '@azure/openai'

let client: OpenAIClient | null = null

function getFoundryClient(): OpenAIClient
  if (!client)
    config = getFoundryConfig()
    client = new OpenAIClient(
      config.endpoint,
      new AzureKeyCredential(config.apiKey)
    )
  return client

// TDD Anchor
describe('getFoundryClient', () => {
  it('should create singleton client instance')
  it('should use environment configuration')
})
```

---

## API Endpoint: Get Verses

### Function Definition

```typescript
// api/src/functions/getVerse.ts
import { app, HttpRequest, HttpResponseInit } from '@azure/functions'
import { getVersePassage } from '../services/verseService'

app.http('getVerse', {
  methods: ['GET'],
  route: 'verses/{book}/{chapter}/{verseStart}/{verseEnd?}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    // Extract path parameters
    book = request.params.book           // e.g., "John"
    chapter = parseInt(request.params.chapter)
    verseStart = parseInt(request.params.verseStart)
    verseEnd = request.params.verseEnd 
      ? parseInt(request.params.verseEnd) 
      : null
    
    // Extract query parameters
    translation = request.query.get('translation') ?? 'NIV'
    
    // Validate translation
    validTranslations = ['NIV', 'KJV', 'MSG', 'ESV']
    if (!validTranslations.includes(translation))
      return { 
        status: 400, 
        body: `Invalid translation. Use: ${validTranslations.join(', ')}` 
      }
    
    // Build reference object
    reference: BibleReference = {
      book: decodeURIComponent(book),
      chapter,
      verseStart,
      verseEnd,
      raw: formatReferenceString(book, chapter, verseStart, verseEnd)
    }
    
    try
      passage = await getVersePassage(reference, translation)
      return { status: 200, jsonBody: passage }
    catch (error)
      console.error('Verse retrieval failed:', error)
      return { status: 500, body: 'Failed to retrieve verses' }
  }
})

function formatReferenceString(book, chapter, start, end): string
  base = `${book} ${chapter}:${start}`
  return end ? `${base}-${end}` : base

// TDD Anchors
describe('getVerse endpoint', () => {
  it('should return 400 for invalid translation')
  it('should return verses for valid reference')
  it('should handle single verse request')
  it('should handle verse range request')
  it('should return 500 on service error')
})
```

---

## Verse Service

### Service Implementation

```typescript
// api/src/services/verseService.ts

interface VerseServiceDependencies {
  foundryClient: OpenAIClient
  cacheClient: TableClient
}

async function getVersePassage(
  reference: BibleReference,
  translation: Translation,
  deps?: VerseServiceDependencies
): Promise<PassageResponse>
  
  // 1. Check cache first
  cacheKey = buildCacheKey(reference, translation)
  cached = await checkCache(cacheKey, deps?.cacheClient)
  if (cached) return cached
  
  // 2. Fetch from Foundry
  passage = await fetchFromFoundry(reference, translation, deps?.foundryClient)
  
  // 3. Cache result
  await cachePassage(cacheKey, passage, deps?.cacheClient)
  
  return passage

function buildCacheKey(ref: BibleReference, translation: Translation): string
  // Normalize for consistent caching
  return `${ref.book}:${ref.chapter}:${ref.verseStart}:${ref.verseEnd ?? ref.verseStart}:${translation}`
    .toLowerCase()
    .replace(/\s+/g, '')

// TDD Anchors
describe('getVersePassage', () => {
  it('should return cached result if available')
  it('should fetch from Foundry if not cached')
  it('should cache successful responses')
  it('should not cache on Foundry error')
})
```

### Foundry Integration

```typescript
// api/src/services/verseService.ts (continued)

async function fetchFromFoundry(
  reference: BibleReference,
  translation: Translation,
  client?: OpenAIClient
): Promise<PassageResponse>
  
  foundryClient = client ?? getFoundryClient()
  config = getFoundryConfig()
  
  // Build prompt for verse retrieval
  prompt = buildVersePrompt(reference, translation)
  
  // Call Foundry
  response = await foundryClient.getChatCompletions(
    config.deploymentName,
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    {
      temperature: 0,  // Deterministic output
      maxTokens: 2000,
      responseFormat: { type: 'json_object' }
    }
  )
  
  // Parse response
  content = response.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from Foundry')
  
  parsed = JSON.parse(content)
  return validateAndTransform(parsed, reference, translation)

const SYSTEM_PROMPT = `
You are a Bible verse assistant. When given a reference and translation, 
return the verse text in valid JSON format.

Rules:
1. Return accurate verse text for the specified translation
2. Include verse numbers
3. Include proper copyright/attribution
4. Format: { "verses": [{ "number": 1, "text": "..." }], "copyright": "..." }

For NIV: Include "Scripture quotations taken from The Holy Bible, New International Version® NIV®"
For KJV: Include "Public Domain"
For MSG: Include "Scripture taken from The Message®"
For ESV: Include "Scripture quotations are from the ESV® Bible"
`

function buildVersePrompt(ref: BibleReference, translation: Translation): string
  verses = ref.verseEnd 
    ? `verses ${ref.verseStart}-${ref.verseEnd}`
    : `verse ${ref.verseStart}`
  
  return `
    Retrieve ${ref.book} chapter ${ref.chapter}, ${verses}
    Translation: ${translation}
    
    Return JSON with verses array and copyright notice.
  `

function validateAndTransform(
  parsed: unknown, 
  reference: BibleReference,
  translation: Translation
): PassageResponse
  // Validate structure
  if (!parsed.verses || !Array.isArray(parsed.verses))
    throw new Error('Invalid response structure')
  
  return {
    reference,
    translation,
    verses: parsed.verses.map(v => ({
      number: v.number,
      text: v.text.trim()
    })),
    copyright: parsed.copyright ?? getDefaultCopyright(translation)
  }

function getDefaultCopyright(translation: Translation): string
  switch translation
    case 'NIV': return 'NIV® Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.®'
    case 'KJV': return 'Public Domain'
    case 'MSG': return 'Copyright © 1993, 2002, 2018 by Eugene H. Peterson'
    case 'ESV': return 'Copyright © 2001 by Crossway'

// TDD Anchors
describe('fetchFromFoundry', () => {
  it('should build correct prompt for single verse')
  it('should build correct prompt for verse range')
  it('should parse JSON response correctly')
  it('should include copyright notice')
  it('should throw on invalid response structure')
})
```

---

## Caching Layer

### Table Storage Cache

```typescript
// api/src/services/cacheService.ts

interface CachedPassage extends PassageResponse {
  partitionKey: string  // Translation
  rowKey: string        // Normalized reference
  timestamp: Date
  ttlSeconds: number
}

const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60  // 7 days

async function checkCache(
  cacheKey: string,
  client?: TableClient
): Promise<PassageResponse | null>
  
  tableClient = client ?? getPassageCacheTable()
  [translation, reference] = parseCacheKey(cacheKey)
  
  try
    entity = await tableClient.getEntity(translation, reference)
    
    // Check if expired
    if (isExpired(entity.timestamp, entity.ttlSeconds))
      await tableClient.deleteEntity(translation, reference)
      return null
    
    return transformFromCache(entity)
  catch (error)
    if (error.statusCode === 404) return null
    throw error

async function cachePassage(
  cacheKey: string,
  passage: PassageResponse,
  client?: TableClient
): Promise<void>
  
  tableClient = client ?? getPassageCacheTable()
  [translation, reference] = parseCacheKey(cacheKey)
  
  entity = {
    partitionKey: translation,
    rowKey: reference,
    verses: JSON.stringify(passage.verses),
    copyright: passage.copyright,
    timestamp: new Date(),
    ttlSeconds: CACHE_TTL_SECONDS
  }
  
  await tableClient.upsertEntity(entity)

function getPassageCacheTable(): TableClient
  connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  return TableClient.fromConnectionString(connectionString, 'PassageCache')

// TDD Anchors
describe('cacheService', () => {
  it('should return null for cache miss')
  it('should return cached passage on hit')
  it('should delete expired entries')
  it('should upsert new passages')
})
```

---

## Frontend Integration

### API Client

```typescript
// src/lib/api.ts

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function getVerses(
  reference: BibleReference,
  translation: Translation
): Promise<PassageResponse>
  
  // Build URL path
  path = `/verses/${encodeURIComponent(reference.book)}/${reference.chapter}/${reference.verseStart}`
  if (reference.verseEnd)
    path += `/${reference.verseEnd}`
  
  url = `${API_BASE}${path}?translation=${translation}`
  
  response = await fetch(url)
  
  if (!response.ok)
    error = await response.text()
    throw new Error(`Failed to fetch verses: ${error}`)
  
  return response.json()

// TDD Anchors
describe('api.getVerses', () => {
  it('should build correct URL for single verse')
  it('should build correct URL for verse range')
  it('should include translation query param')
  it('should throw on non-ok response')
})
```

### React Query Hook

```typescript
// src/hooks/useVerses.ts

function useVerses(
  reference: BibleReference | null,
  translation: Translation,
  options?: { enabled?: boolean }
)
  return useQuery({
    queryKey: ['verses', reference?.raw, translation],
    queryFn: () => getVerses(reference!, translation),
    enabled: (options?.enabled ?? true) && reference !== null,
    staleTime: 30 * 60 * 1000,  // 30 minutes
    gcTime: 60 * 60 * 1000,     // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

// TDD Anchors
describe('useVerses', () => {
  it('should not fetch when reference is null')
  it('should not fetch when enabled is false')
  it('should cache results for 30 minutes')
  it('should retry failed requests twice')
})
```

---

## Reference Parsing

### Parser Implementation

```typescript
// src/lib/bibleParser.ts

// Regex pattern for Bible references
// Matches: "John 3:16", "1 John 1:1-4", "Genesis 1:1-31"
const REFERENCE_PATTERN = /\b(\d?\s*[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d{1,3}):(\d{1,3})(?:[-–](\d{1,3}))?\b/g

// Book name normalization map
const BOOK_ALIASES: Record<string, string> = {
  'gen': 'Genesis',
  'ex': 'Exodus',
  'exod': 'Exodus',
  'lev': 'Leviticus',
  // ... abbreviated for brevity
  'jn': 'John',
  'jhn': 'John',
  '1jn': '1 John',
  '2jn': '2 John',
  '3jn': '3 John',
  'rev': 'Revelation'
}

function parseVerseReferences(text: string): BibleReference[]
  references: BibleReference[] = []
  
  // Reset regex state
  REFERENCE_PATTERN.lastIndex = 0
  
  while (match = REFERENCE_PATTERN.exec(text))
    [fullMatch, bookRaw, chapterStr, startStr, endStr] = match
    
    book = normalizeBookName(bookRaw)
    chapter = parseInt(chapterStr, 10)
    verseStart = parseInt(startStr, 10)
    verseEnd = endStr ? parseInt(endStr, 10) : null
    
    // Validate ranges
    if (chapter < 1 || chapter > 150) continue
    if (verseStart < 1 || verseStart > 176) continue
    if (verseEnd !== null && verseEnd < verseStart) continue
    
    references.push({
      book,
      chapter,
      verseStart,
      verseEnd,
      raw: fullMatch
    })
  
  return references

function normalizeBookName(raw: string): string
  // Clean up input
  cleaned = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  
  // Check alias map
  if (BOOK_ALIASES[cleaned.replace(/\s/g, '')])
    return BOOK_ALIASES[cleaned.replace(/\s/g, '')]
  
  // Title case the input
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

function parseTextWithReferences(text: string): TextSegment[]
  references = parseVerseReferences(text)
  segments: TextSegment[] = []
  lastIndex = 0
  
  // Reset regex state
  REFERENCE_PATTERN.lastIndex = 0
  
  while (match = REFERENCE_PATTERN.exec(text))
    // Add text before match
    if (match.index > lastIndex)
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      })
    
    // Add reference
    ref = references.find(r => r.raw === match[0])
    if (ref)
      segments.push({ type: 'reference', reference: ref })
    
    lastIndex = match.index + match[0].length
  
  // Add remaining text
  if (lastIndex < text.length)
    segments.push({
      type: 'text',
      content: text.slice(lastIndex)
    })
  
  return segments

// TDD Anchors
describe('parseVerseReferences', () => {
  it('should parse "John 3:16"')
  it('should parse "John 3:1-15"')
  it('should parse "1 John 1:1-4"')
  it('should parse "Genesis 1:1-31"')
  it('should handle lowercase input')
  it('should reject invalid chapter numbers')
  it('should reject invalid verse ranges')
})

describe('parseTextWithReferences', () => {
  it('should return text segments and references')
  it('should handle text with no references')
  it('should handle multiple references')
  it('should preserve text between references')
})
```

---

## Error Handling

### Error Types

```typescript
// Shared error types
class VerseNotFoundError extends Error
  constructor(reference: BibleReference)
    super(`Verse not found: ${reference.raw}`)
    this.name = 'VerseNotFoundError'

class TranslationNotAvailableError extends Error
  constructor(translation: string)
    super(`Translation not available: ${translation}`)
    this.name = 'TranslationNotAvailableError'

class FoundryQuotaExceededError extends Error
  constructor()
    super('Azure Foundry quota exceeded')
    this.name = 'FoundryQuotaExceededError'
```

### Error Recovery

```typescript
// In verseService.ts
async function fetchFromFoundry(...)
  try
    // ... existing logic
  catch (error)
    if (error.code === 'RateLimitExceeded')
      throw new FoundryQuotaExceededError()
    
    if (error.code === 'ContentFilter')
      // Retry with modified prompt
      return fetchWithFallback(reference, translation)
    
    throw error

// In frontend
function VerseModal(props)
  verseQuery = useVerses(...)
  
  if (verseQuery.error instanceof FoundryQuotaExceededError)
    return <QuotaExceededMessage />
  
  if (verseQuery.error)
    return <ErrorMessage message="Unable to load verses. Please try again." />
```

---

## Cost Optimization

### Strategies

1. **Aggressive Caching**
   - Client-side: 30-minute stale time
   - Server-side: 7-day TTL in Table Storage

2. **Token Optimization**
   - Use `temperature: 0` for deterministic responses
   - Limit `maxTokens` to expected response size
   - Use JSON mode for structured output

3. **Request Batching** (Future)
   - Batch multiple verse requests in one API call
   - Prefetch common passages during off-peak

### Monitoring

```typescript
// Track API usage
function trackFoundryUsage(tokens: number)
  // Log for cost monitoring
  console.log(`Foundry usage: ${tokens} tokens`)
  
  // Emit metric to Azure Monitor
  appInsights.trackMetric({
    name: 'FoundryTokensUsed',
    value: tokens
  })
```

---

## Testing Strategy

### Unit Tests

```typescript
// Mock Foundry client for tests
const mockFoundryClient = {
  getChatCompletions: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          verses: [{ number: 16, text: 'For God so loved...' }],
          copyright: 'NIV Copyright...'
        })
      }
    }]
  })
}

describe('verseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should return cached verses without calling Foundry', async () => {
    // Setup cache hit
    mockCacheClient.getEntity.mockResolvedValue(cachedPassage)
    
    result = await getVersePassage(reference, 'NIV', {
      foundryClient: mockFoundryClient,
      cacheClient: mockCacheClient
    })
    
    expect(mockFoundryClient.getChatCompletions).not.toHaveBeenCalled()
    expect(result.verses).toEqual(cachedPassage.verses)
  })
})
```

### Integration Tests

```typescript
describe('verses API integration', () => {
  it('should return John 3:16 in NIV', async () => {
    response = await request(app)
      .get('/api/verses/John/3/16')
      .query({ translation: 'NIV' })
    
    expect(response.status).toBe(200)
    expect(response.body.verses).toHaveLength(1)
    expect(response.body.verses[0].number).toBe(16)
  })
})
```
