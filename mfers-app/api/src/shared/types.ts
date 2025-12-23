/**
 * Shared types for the MFers Bible Study API.
 * These types are used across multiple functions and services.
 */

/**
 * Week entity stored in Azure Table Storage.
 */
export interface WeekEntity {
  partitionKey: string  // StudyId (e.g., "study-2025")
  rowKey: string        // WeekId (e.g., "2025-12-23")
  weekDate: string
  readingAssignment: string
  dinnerFamily?: string
  dinnerNotes?: string
}

/**
 * Question entity stored in Azure Table Storage.
 */
export interface QuestionEntity {
  partitionKey: string  // WeekId
  rowKey: string        // QuestionOrder (e.g., "001")
  text: string
  order: number
}

/**
 * Passage cache entity for storing retrieved verses.
 */
export interface PassageCacheEntity {
  partitionKey: string  // Translation
  rowKey: string        // Normalized reference (e.g., "john_3_1-15")
  verses: string        // JSON stringified verses array
  copyright: string
  cachedAt: string      // ISO date string
  expiresAt: string     // ISO date string
}

/**
 * API error response structure.
 */
export interface ApiError {
  error: string
  details?: string
  code?: string
}

/**
 * Pagination parameters for list endpoints.
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  cursor?: string
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  hasMore: boolean
  nextCursor?: string
}
