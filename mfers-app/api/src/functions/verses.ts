import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import {
  fetchVersesFromFoundry,
  isFoundryConfigured,
} from "../shared/azure-foundry.js";
import { cachePassage, getCachedPassage } from "../shared/verse-cache.js";

/**
 * Supported Bible translations.
 */
type Translation = "NIV" | "KJV" | "MSG" | "ESV";

/**
 * Verse structure.
 */
interface Verse {
  number: number;
  text: string;
}

/**
 * Verse request body structure.
 */
interface VerseRequest {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  translation?: Translation;
}

/**
 * Verse response structure.
 */
interface PassageResponse {
  reference: {
    book: string;
    chapter: number;
    verseStart: number;
    verseEnd: number | null;
    raw: string;
  };
  translation: Translation;
  verses: Verse[];
  copyright: string;
}

/**
 * POST /api/verses - Get Bible verses
 *
 * Accepts a JSON body with book, chapter, verseStart, verseEnd, and translation.
 * Returns the requested verses with copyright information.
 *
 * When Azure Foundry is configured, fetches real verse text from GPT-4.
 * Otherwise, returns mock placeholder text for development.
 */
async function getVerses(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Processing verses request: ${request.url}`);

  try {
    const body = (await request.json()) as VerseRequest;

    // Validate required fields
    if (!body.book || !body.chapter || !body.verseStart) {
      return {
        status: 400,
        jsonBody: {
          error: "Missing required fields: book, chapter, verseStart",
        },
      };
    }

    const translation = body.translation ?? "NIV";
    const verseEnd = body.verseEnd ?? null;

    // Validate translation
    const validTranslations: Translation[] = ["NIV", "KJV", "MSG", "ESV"];
    if (!validTranslations.includes(translation)) {
      return {
        status: 400,
        jsonBody: {
          error: `Invalid translation. Must be one of: ${validTranslations.join(
            ", "
          )}`,
        },
      };
    }

    // Try to get from cache first
    const cached = await getCachedPassage(
      body.book,
      body.chapter,
      body.verseStart,
      verseEnd,
      translation
    );
    if (cached) {
      context.log("Cache hit - returning cached verses");
      const response: PassageResponse = {
        reference: {
          book: body.book,
          chapter: body.chapter,
          verseStart: body.verseStart,
          verseEnd: verseEnd,
          raw: formatReferenceString(
            body.book,
            body.chapter,
            body.verseStart,
            verseEnd
          ),
        },
        translation,
        verses: cached.verses,
        copyright: cached.copyright,
      };
      return { status: 200, jsonBody: response };
    }

    context.log("Cache miss - fetching verses");

    // Fetch verses from Azure Foundry or use mock data
    let verses: Verse[];
    let copyright: string;

    if (isFoundryConfigured()) {
      context.log("Fetching verses from Azure Foundry");
      try {
        const foundryResponse = await fetchVersesFromFoundry(
          body.book,
          body.chapter,
          body.verseStart,
          verseEnd,
          translation
        );
        verses = foundryResponse.verses;
        copyright = getCopyrightNotice(translation);

        // Cache the result for future requests
        await cachePassage(
          body.book,
          body.chapter,
          body.verseStart,
          verseEnd,
          translation,
          verses,
          copyright
        );
      } catch (foundryError) {
        context.error("Azure Foundry error:", foundryError);
        // Fall back to mock data on error
        verses = generateMockVerses(body.verseStart, verseEnd, translation);
        copyright = getCopyrightNotice(translation);
      }
    } else {
      context.log("Azure Foundry not configured, using mock data");
      verses = generateMockVerses(body.verseStart, verseEnd, translation);
      copyright = getCopyrightNotice(translation);
    }

    const response: PassageResponse = {
      reference: {
        book: body.book,
        chapter: body.chapter,
        verseStart: body.verseStart,
        verseEnd: verseEnd,
        raw: formatReferenceString(
          body.book,
          body.chapter,
          body.verseStart,
          verseEnd
        ),
      },
      translation,
      verses,
      copyright,
    };

    return {
      status: 200,
      jsonBody: response,
    };
  } catch (error) {
    context.error("Error processing verses request:", error);
    return {
      status: 500,
      jsonBody: {
        error: "Internal server error",
      },
    };
  }
}

/**
 * Format a reference string from its components.
 */
function formatReferenceString(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number | null
): string {
  const base = `${book} ${chapter}:${verseStart}`;
  return verseEnd ? `${base}-${verseEnd}` : base;
}

/**
 * Generate mock verse data for development/testing.
 */
function generateMockVerses(
  verseStart: number,
  verseEnd: number | null,
  translation: Translation
): Verse[] {
  const end = verseEnd ?? verseStart;
  const verses: Verse[] = [];

  for (let i = verseStart; i <= end; i++) {
    verses.push({
      number: i,
      text: getMockVerseText(i, translation),
    });
  }

  return verses;
}

/**
 * Get mock verse text for a specific verse number.
 * Returns realistic-looking placeholder text.
 */
function getMockVerseText(
  verseNumber: number,
  translation: Translation
): string {
  // Some sample mock verses for common references
  const mockTexts: Record<string, string> = {
    NIV: `[NIV v${verseNumber}] For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.`,
    KJV: `[KJV v${verseNumber}] For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.`,
    MSG: `[MSG v${verseNumber}] This is how much God loved the world: He gave his Son, his one and only Son. And this is why: so that no one need be destroyed; by believing in him, anyone can have a whole and lasting life.`,
    ESV: `[ESV v${verseNumber}] For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.`,
  };

  return (
    mockTexts[translation] ??
    `[${translation} v${verseNumber}] Mock verse text placeholder.`
  );
}

/**
 * Get copyright notice for a translation.
 */
function getCopyrightNotice(translation: Translation): string {
  const copyrights: Record<Translation, string> = {
    NIV: "Scripture quotations taken from The Holy Bible, New International Version® NIV®. Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.™",
    KJV: "Scripture quotations from The Authorized (King James) Version. Rights in the Authorized Version in the United Kingdom are vested in the Crown.",
    MSG: "Scripture taken from The Message. Copyright © 1993, 1994, 1995, 1996, 2000, 2001, 2002. Used by permission of NavPress Publishing Group.",
    ESV: "Scripture quotations are from The ESV® Bible (The Holy Bible, English Standard Version®), copyright © 2001 by Crossway.",
  };

  return copyrights[translation];
}

// Register the HTTP function
app.http("verses", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "verses",
  handler: getVerses,
});

export { getVerses };
