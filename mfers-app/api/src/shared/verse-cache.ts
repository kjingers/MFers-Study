/**
 * Server-side verse caching using Azure Table Storage.
 * Caches fetched verses to reduce API calls and improve response time.
 */
import { TableClient } from "@azure/data-tables";
import type { PassageCacheEntity } from "./types.js";

/**
 * Verse structure.
 */
export interface CachedVerse {
  number: number;
  text: string;
}

/**
 * Cached passage data.
 */
export interface CachedPassage {
  verses: CachedVerse[];
  copyright: string;
  cachedAt: Date;
}

/**
 * Cache configuration.
 */
const TABLE_NAME = "versecache";
const CACHE_TTL_HOURS = 24 * 7; // 7 days

/**
 * Check if caching is configured.
 */
function isCacheConfigured(): boolean {
  return !!process.env.AZURE_STORAGE_CONNECTION_STRING;
}

/**
 * Get TableClient for the verse cache table.
 */
function getTableClient(): TableClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING not configured");
  }
  return TableClient.fromConnectionString(connectionString, TABLE_NAME);
}

/**
 * Normalize a reference for use as a row key.
 * E.g., "John 3:16-17" -> "john_3_16-17"
 */
function normalizeReference(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number | null
): string {
  const base = `${book.toLowerCase().replace(/\s+/g, "_")}_${chapter}_${verseStart}`;
  return verseEnd ? `${base}-${verseEnd}` : base;
}

/**
 * Get a cached passage from Table Storage.
 * Returns null if not cached or cache is expired.
 */
export async function getCachedPassage(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number | null,
  translation: string
): Promise<CachedPassage | null> {
  if (!isCacheConfigured()) {
    return null;
  }

  try {
    const client = getTableClient();
    const rowKey = normalizeReference(book, chapter, verseStart, verseEnd);
    
    const entity = await client.getEntity<PassageCacheEntity>(translation, rowKey);
    
    // Check if cache is expired
    const expiresAt = new Date(entity.expiresAt);
    if (expiresAt < new Date()) {
      console.log(`Cache expired for ${translation}/${rowKey}`);
      return null;
    }
    
    return {
      verses: JSON.parse(entity.verses) as CachedVerse[],
      copyright: entity.copyright,
      cachedAt: new Date(entity.cachedAt),
    };
  } catch (error: unknown) {
    // Entity not found - cache miss
    if (error instanceof Error && error.message.includes("ResourceNotFound")) {
      return null;
    }
    // Log other errors but don't throw - just return cache miss
    console.error("Cache read error:", error);
    return null;
  }
}

/**
 * Store a passage in the cache.
 */
export async function cachePassage(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number | null,
  translation: string,
  verses: CachedVerse[],
  copyright: string
): Promise<void> {
  if (!isCacheConfigured()) {
    return;
  }

  try {
    const client = getTableClient();
    const rowKey = normalizeReference(book, chapter, verseStart, verseEnd);
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000);
    
    const entity: PassageCacheEntity = {
      partitionKey: translation,
      rowKey,
      verses: JSON.stringify(verses),
      copyright,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    
    await client.upsertEntity(entity, "Replace");
    console.log(`Cached passage: ${translation}/${rowKey}`);
  } catch (error) {
    // Log error but don't throw - caching is non-critical
    console.error("Cache write error:", error);
  }
}

/**
 * Ensure the cache table exists.
 */
export async function ensureCacheTableExists(): Promise<void> {
  if (!isCacheConfigured()) {
    console.log("Verse cache not configured, skipping table creation");
    return;
  }

  try {
    const client = getTableClient();
    await client.createTable();
    console.log(`Created table: ${TABLE_NAME}`);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("TableAlreadyExists")) {
      console.log(`Table already exists: ${TABLE_NAME}`);
    } else {
      throw error;
    }
  }
}
