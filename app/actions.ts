"use server";

import {
  upsertEntry as dbUpsertEntry,
  setCompletedForDateChapters as dbSetCompleted,
  listMyEntries as dbListMyEntries,
} from "@/src/lib/entriesDb";
import type { ReadingRef } from "@/src/lib/plan";

export async function upsertEntryAction(params: {
  entry_date: string;
  book: string;
  chapter: number;
  response_text?: string | null;
  completed?: boolean;
}) {
  return dbUpsertEntry(params);
}

export async function setCompletedForDateChaptersAction(params: {
  entry_date: string;
  items: ReadingRef[];
  completed: boolean;
}) {
  return dbSetCompleted(params);
}

export async function listMyEntriesAction(params?: {
  fromDate?: string;
  toDate?: string;
  limit?: number;
}) {
  return dbListMyEntries(params);
}
