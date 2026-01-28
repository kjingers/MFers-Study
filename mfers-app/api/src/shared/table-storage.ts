/**
 * Azure Table Storage service for week data persistence.
 * Falls back to mock data when connection string is not configured.
 */
import { TableClient, TableServiceClient } from "@azure/data-tables";
import type { WeekEntity, QuestionEntity, RSVPEntity, RSVP, RSVPSummary, MealEntity, Meal } from "./types.js";

/**
 * Week data structure returned from storage.
 */
export interface Week {
  weekId: string;
  weekDate: string;
  readingAssignment: string;
  dinnerFamily: string | null;
  dinnerNotes: string | null;
  questions: Question[];
}

/**
 * Question structure.
 */
export interface Question {
  questionId: string;
  order: number;
  text: string;
}

/**
 * Table Storage configuration.
 */
const TABLE_NAMES = {
  WEEKS: "weeks",
  QUESTIONS: "questions",
  RSVPS: "rsvps",
  MEALS: "meals",
} as const;

const PARTITION_KEY = "mfers-study";

/**
 * Check if Table Storage is configured.
 */
function isTableStorageConfigured(): boolean {
  return !!process.env.AZURE_STORAGE_CONNECTION_STRING;
}

/**
 * Get TableClient for a specific table.
 */
function getTableClient(tableName: string): TableClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING not configured");
  }
  return TableClient.fromConnectionString(connectionString, tableName);
}

/**
 * Ensure tables exist (creates if not present).
 */
export async function ensureTablesExist(): Promise<void> {
  if (!isTableStorageConfigured()) {
    console.log("Table Storage not configured, skipping table creation");
    return;
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
  const serviceClient = TableServiceClient.fromConnectionString(connectionString);

  for (const tableName of Object.values(TABLE_NAMES)) {
    try {
      await serviceClient.createTable(tableName);
      console.log(`Created table: ${tableName}`);
    } catch (error: unknown) {
      // Table already exists - that's fine
      if (error instanceof Error && error.message.includes("TableAlreadyExists")) {
        console.log(`Table already exists: ${tableName}`);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Get all weeks from Table Storage.
 */
export async function getWeeksFromStorage(): Promise<Week[]> {
  if (!isTableStorageConfigured()) {
    return [];
  }

  const weeksClient = getTableClient(TABLE_NAMES.WEEKS);
  const questionsClient = getTableClient(TABLE_NAMES.QUESTIONS);

  const weeks: Week[] = [];
  
  // Get all weeks
  const weekEntities = weeksClient.listEntities<WeekEntity>({
    queryOptions: { filter: `PartitionKey eq '${PARTITION_KEY}'` }
  });

  for await (const entity of weekEntities) {
    // Get questions for this week
    const questions: Question[] = [];
    const questionEntities = questionsClient.listEntities<QuestionEntity>({
      queryOptions: { filter: `PartitionKey eq '${entity.rowKey}'` }
    });

    for await (const qEntity of questionEntities) {
      questions.push({
        questionId: `${qEntity.partitionKey}-${qEntity.rowKey}`,
        order: qEntity.order,
        text: qEntity.text,
      });
    }

    // Sort questions by order
    questions.sort((a, b) => a.order - b.order);

    weeks.push({
      weekId: entity.rowKey!,
      weekDate: entity.weekDate,
      readingAssignment: entity.readingAssignment,
      dinnerFamily: entity.dinnerFamily ?? null,
      dinnerNotes: entity.dinnerNotes ?? null,
      questions,
    });
  }

  // Sort weeks by date
  weeks.sort((a, b) => new Date(a.weekDate).getTime() - new Date(b.weekDate).getTime());

  return weeks;
}

/**
 * Get a specific week by ID from Table Storage.
 */
export async function getWeekFromStorage(weekId: string): Promise<Week | null> {
  if (!isTableStorageConfigured()) {
    return null;
  }

  const weeksClient = getTableClient(TABLE_NAMES.WEEKS);
  const questionsClient = getTableClient(TABLE_NAMES.QUESTIONS);

  try {
    const entity = await weeksClient.getEntity<WeekEntity>(PARTITION_KEY, weekId);

    // Get questions for this week
    const questions: Question[] = [];
    const questionEntities = questionsClient.listEntities<QuestionEntity>({
      queryOptions: { filter: `PartitionKey eq '${weekId}'` }
    });

    for await (const qEntity of questionEntities) {
      questions.push({
        questionId: `${qEntity.partitionKey}-${qEntity.rowKey}`,
        order: qEntity.order,
        text: qEntity.text,
      });
    }

    questions.sort((a, b) => a.order - b.order);

    return {
      weekId: entity.rowKey!,
      weekDate: entity.weekDate,
      readingAssignment: entity.readingAssignment,
      dinnerFamily: entity.dinnerFamily ?? null,
      dinnerNotes: entity.dinnerNotes ?? null,
      questions,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("ResourceNotFound")) {
      return null;
    }
    throw error;
  }
}

/**
 * Save a week to Table Storage.
 */
export async function saveWeekToStorage(week: Week): Promise<void> {
  if (!isTableStorageConfigured()) {
    throw new Error("Table Storage not configured");
  }

  const weeksClient = getTableClient(TABLE_NAMES.WEEKS);
  const questionsClient = getTableClient(TABLE_NAMES.QUESTIONS);

  // Save week entity
  const weekEntity: WeekEntity = {
    partitionKey: PARTITION_KEY,
    rowKey: week.weekId,
    weekDate: week.weekDate,
    readingAssignment: week.readingAssignment,
    dinnerFamily: week.dinnerFamily ?? undefined,
    dinnerNotes: week.dinnerNotes ?? undefined,
  };

  await weeksClient.upsertEntity(weekEntity, "Replace");

  // Save questions
  for (const question of week.questions) {
    const questionEntity: QuestionEntity = {
      partitionKey: week.weekId,
      rowKey: String(question.order).padStart(3, "0"),
      text: question.text,
      order: question.order,
    };
    await questionsClient.upsertEntity(questionEntity, "Replace");
  }
}

/**
 * In-memory RSVP storage for fallback when Table Storage not configured.
 */
const inMemoryRSVPs: Map<string, RSVP[]> = new Map();

/**
 * Get all RSVPs for a specific week.
 */
export async function getRSVPsForWeek(weekId: string): Promise<RSVPSummary> {
  if (!isTableStorageConfigured()) {
    // Return from in-memory storage
    const rsvps = inMemoryRSVPs.get(weekId) || [];
    const attendingRsvps = rsvps.filter(r => r.attending);
    return {
      weekId,
      totalFamilies: attendingRsvps.length,
      totalAdults: attendingRsvps.reduce((sum, r) => sum + r.adults, 0),
      totalKids: attendingRsvps.reduce((sum, r) => sum + r.kids, 0),
      totalPeople: attendingRsvps.reduce((sum, r) => sum + r.adults + r.kids, 0),
      rsvps,
    };
  }

  const rsvpsClient = getTableClient(TABLE_NAMES.RSVPS);
  const rsvps: RSVP[] = [];

  const entities = rsvpsClient.listEntities<RSVPEntity>({
    queryOptions: { filter: `PartitionKey eq '${weekId}'` }
  });

  for await (const entity of entities) {
    rsvps.push({
      weekId: entity.partitionKey!,
      familyId: entity.rowKey!,
      familyName: entity.familyName,
      attending: entity.attending,
      adults: entity.adults,
      kids: entity.kids,
      updatedAt: entity.updatedAt,
    });
  }

  const attendingRsvps = rsvps.filter(r => r.attending);
  return {
    weekId,
    totalFamilies: attendingRsvps.length,
    totalAdults: attendingRsvps.reduce((sum, r) => sum + r.adults, 0),
    totalKids: attendingRsvps.reduce((sum, r) => sum + r.kids, 0),
    totalPeople: attendingRsvps.reduce((sum, r) => sum + r.adults + r.kids, 0),
    rsvps,
  };
}

/**
 * Get a family's RSVP for a specific week.
 */
export async function getFamilyRSVP(weekId: string, familyId: string): Promise<RSVP | null> {
  if (!isTableStorageConfigured()) {
    const rsvps = inMemoryRSVPs.get(weekId) || [];
    return rsvps.find(r => r.familyId === familyId) || null;
  }

  const rsvpsClient = getTableClient(TABLE_NAMES.RSVPS);

  try {
    const entity = await rsvpsClient.getEntity<RSVPEntity>(weekId, familyId);
    return {
      weekId: entity.partitionKey!,
      familyId: entity.rowKey!,
      familyName: entity.familyName,
      attending: entity.attending,
      adults: entity.adults,
      kids: entity.kids,
      updatedAt: entity.updatedAt,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("ResourceNotFound")) {
      return null;
    }
    throw error;
  }
}

/**
 * Create or update an RSVP.
 */
export async function upsertRSVP(rsvp: RSVP): Promise<RSVP> {
  const updatedRsvp: RSVP = {
    ...rsvp,
    updatedAt: new Date().toISOString(),
  };

  if (!isTableStorageConfigured()) {
    // Store in memory
    const weekRsvps = inMemoryRSVPs.get(rsvp.weekId) || [];
    const existingIndex = weekRsvps.findIndex(r => r.familyId === rsvp.familyId);
    
    if (existingIndex >= 0) {
      weekRsvps[existingIndex] = updatedRsvp;
    } else {
      weekRsvps.push(updatedRsvp);
    }
    
    inMemoryRSVPs.set(rsvp.weekId, weekRsvps);
    return updatedRsvp;
  }

  const rsvpsClient = getTableClient(TABLE_NAMES.RSVPS);

  const entity: RSVPEntity = {
    partitionKey: rsvp.weekId,
    rowKey: rsvp.familyId,
    familyName: rsvp.familyName,
    attending: rsvp.attending,
    adults: rsvp.adults,
    kids: rsvp.kids,
    updatedAt: updatedRsvp.updatedAt,
  };

  await rsvpsClient.upsertEntity(entity, "Replace");
  return updatedRsvp;
}

/**
 * Partition key for meals table.
 */
const MEALS_PARTITION_KEY = "meals";

/**
 * In-memory meal storage for fallback when Table Storage not configured.
 */
const inMemoryMeals: Map<string, Meal> = new Map();

/**
 * Get meal signup for a specific week.
 */
export async function getMealForWeek(weekId: string): Promise<Meal | null> {
  if (!isTableStorageConfigured()) {
    return inMemoryMeals.get(weekId) || null;
  }

  const mealsClient = getTableClient(TABLE_NAMES.MEALS);

  try {
    const entity = await mealsClient.getEntity<MealEntity>(MEALS_PARTITION_KEY, weekId);
    return {
      weekId: entity.rowKey!,
      familyId: entity.familyId,
      familyName: entity.familyName,
      mealNotes: entity.mealNotes,
      claimedAt: entity.claimedAt,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("ResourceNotFound")) {
      return null;
    }
    throw error;
  }
}

/**
 * Claim a meal slot for a week.
 */
export async function claimMeal(meal: Meal): Promise<Meal> {
  const claimedMeal: Meal = {
    ...meal,
    claimedAt: new Date().toISOString(),
  };

  if (!isTableStorageConfigured()) {
    inMemoryMeals.set(meal.weekId, claimedMeal);
    return claimedMeal;
  }

  const mealsClient = getTableClient(TABLE_NAMES.MEALS);

  const entity: MealEntity = {
    partitionKey: MEALS_PARTITION_KEY,
    rowKey: meal.weekId,
    familyId: meal.familyId,
    familyName: meal.familyName,
    mealNotes: meal.mealNotes,
    claimedAt: claimedMeal.claimedAt,
  };

  await mealsClient.upsertEntity(entity, "Replace");
  return claimedMeal;
}

/**
 * Release a meal slot for a week.
 */
export async function releaseMeal(weekId: string, familyId: string): Promise<boolean> {
  if (!isTableStorageConfigured()) {
    const existing = inMemoryMeals.get(weekId);
    if (existing && existing.familyId === familyId) {
      inMemoryMeals.delete(weekId);
      return true;
    }
    return false;
  }

  const mealsClient = getTableClient(TABLE_NAMES.MEALS);

  try {
    // First check if the family owns this meal slot
    const entity = await mealsClient.getEntity<MealEntity>(MEALS_PARTITION_KEY, weekId);
    if (entity.familyId !== familyId) {
      return false;
    }
    
    await mealsClient.deleteEntity(MEALS_PARTITION_KEY, weekId);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("ResourceNotFound")) {
      return false;
    }
    throw error;
  }
}
