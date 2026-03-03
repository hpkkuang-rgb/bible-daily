/**
 * Entries types and helpers.
 * Data lives in Supabase public.entries; use app/actions.ts for mutations.
 */
import type { ReadingRef } from "./plan";
import { cnBookToSlug } from "./bookMap";
import type { DbEntry } from "./entriesDb";

export type ReadingEntry = {
  id: string;
  date: string;
  readingKey: string;
  scriptureRef: string;
  checkedIn: boolean;
  response?: string;
  updatedAt: number;
};

/** Generate stable readingKey from ReadingRef */
export function toReadingKey(ref: ReadingRef): string {
  const slug = cnBookToSlug(ref.book);
  return slug ? `${slug}-${ref.chapter}` : `legacy-${ref.book}-${ref.chapter}`;
}

/** Get readingKey for idx (1-based) from getReadingForDate items */
export function getReadingKeyForIdx(
  dateISO: string,
  idx: 1 | 2,
  items: ReadingRef[]
): string {
  const i = idx - 1;
  if (i >= 0 && i < items.length) {
    return toReadingKey(items[i]);
  }
  return `legacy-${dateISO}-${idx}`;
}

/** Convert DbEntry to ReadingEntry for UI */
export function dbEntryToReadingEntry(e: DbEntry): ReadingEntry {
  return {
    id: e.id,
    date: e.entry_date,
    readingKey: `${cnBookToSlug(e.book) ?? e.book}-${e.chapter}`,
    scriptureRef: `${e.book} ${e.chapter} 章`,
    checkedIn: e.completed,
    response: e.response_text ?? undefined,
    updatedAt: new Date(e.updated_at).getTime(),
  };
}
