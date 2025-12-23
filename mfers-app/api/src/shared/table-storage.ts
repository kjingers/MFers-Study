/**
 * Azure Table Storage service for week data persistence.
 * Falls back to mock data when connection string is not configured.
 */
import { TableClient, TableServiceClient } from "@azure/data-tables";
import type { WeekEntity, QuestionEntity } from "./types.js";

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
