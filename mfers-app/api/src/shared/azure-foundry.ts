/**
 * Azure Foundry (Azure OpenAI) client for Bible verse retrieval.
 * 
 * This module provides a configured client for communicating with Azure OpenAI
 * to retrieve accurate Bible verse text across multiple translations.
 */

/**
 * Azure Foundry configuration from environment variables.
 */
interface FoundryConfig {
  /** Azure OpenAI endpoint URL */
  endpoint: string
  /** API key for authentication */
  apiKey: string
  /** Deployment name (model name) */
  deploymentName: string
  /** API version */
  apiVersion: string
}

/**
 * Verse structure for API responses.
 */
interface Verse {
  number: number
  text: string
}

/**
 * Response structure from Azure Foundry.
 */
interface FoundryVerseResponse {
  verses: Verse[]
  copyright?: string
}

/**
 * Azure OpenAI Chat Completion response structure.
 */
interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>
}

/**
 * Get Azure Foundry configuration from environment.
 * 
 * @throws Error if required environment variables are missing
 */
function getFoundryConfig(): FoundryConfig {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? "gpt-4"
  
  if (!endpoint || !apiKey) {
    throw new Error(
      "Missing required Azure OpenAI configuration. " +
      "Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY environment variables."
    )
  }
  
  return {
    endpoint,
    apiKey,
    deploymentName,
    apiVersion: "2024-02-15-preview",
  }
}

/**
 * System prompt for Bible verse retrieval.
 */
const SYSTEM_PROMPT = `You are a Bible verse retrieval assistant. When given a Bible reference and translation, return the exact verse text from that translation.

Return only valid JSON in this exact format:
{
  "verses": [
    { "number": 1, "text": "The verse text here..." }
  ]
}

For verse ranges (e.g., John 3:1-5), include all verses in the range.
Be accurate to the specified translation.
Only return valid JSON, no additional text or markdown.`

/**
 * Build user prompt for verse retrieval.
 */
function buildUserPrompt(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number | null,
  translation: string
): string {
  const verseRange = verseEnd 
    ? `verses ${verseStart}-${verseEnd}`
    : `verse ${verseStart}`
  
  return `Retrieve ${book} chapter ${chapter}, ${verseRange} in the ${translation} translation.`
}

/**
 * Fetch verses from Azure Foundry (Azure OpenAI).
 * 
 * @param book - Bible book name
 * @param chapter - Chapter number
 * @param verseStart - Starting verse number
 * @param verseEnd - Ending verse number (null for single verse)
 * @param translation - Bible translation (NIV, KJV, MSG, ESV)
 * @returns Array of verses with numbers and text
 * @throws Error if API call fails
 */
export async function fetchVersesFromFoundry(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number | null,
  translation: string
): Promise<FoundryVerseResponse> {
  const config = getFoundryConfig()
  
  const url = `${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": config.apiKey,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: buildUserPrompt(book, chapter, verseStart, verseEnd, translation)
        },
      ],
      temperature: 0,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json() as ChatCompletionResponse
  const content = data.choices?.[0]?.message?.content
  
  if (!content) {
    throw new Error("Empty response from Azure OpenAI")
  }
  
  try {
    const parsed = JSON.parse(content) as FoundryVerseResponse
    
    if (!parsed.verses || !Array.isArray(parsed.verses)) {
      throw new Error("Invalid response structure: missing verses array")
    }
    
    return parsed
  } catch {
    throw new Error(`Failed to parse Azure OpenAI response: ${content}`)
  }
}

/**
 * Check if Azure Foundry is configured.
 * Useful for determining whether to use real API or mock data.
 */
export function isFoundryConfigured(): boolean {
  return !!(
    process.env.AZURE_OPENAI_ENDPOINT && 
    process.env.AZURE_OPENAI_API_KEY
  )
}
