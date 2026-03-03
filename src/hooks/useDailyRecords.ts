"use client";

import { useCallback, useEffect, useState } from "react";
import { listMyEntriesAction, setCompletedForDateChaptersAction } from "@/app/actions";
import {
  dbEntryToReadingEntry,
  type ReadingEntry,
} from "@/src/lib/entries";
import { getReadingForDate } from "@/src/lib/plan";
import { cnBookToSlug } from "@/src/lib/bookMap";

export type { ReadingEntry };

export function useDailyRecords() {
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [checkedInDates, setCheckedInDates] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await listMyEntriesAction();
    setLoading(false);
    if (error) {
      setEntries([]);
      setCheckedInDates([]);
      return;
    }
    const readingEntries = (data ?? []).map(dbEntryToReadingEntry);
    setEntries(readingEntries);
    const dates = new Set<string>();
    for (const e of readingEntries) {
      if (e.checkedIn) {
        const reading = getReadingForDate(e.date);
        const dayEntries = readingEntries.filter((x) => x.date === e.date && x.checkedIn);
        const expectedCount = reading.items.length;
        if (dayEntries.length >= expectedCount) dates.add(e.date);
      }
      if (e.response?.trim()) dates.add(e.date);
    }
    setCheckedInDates(Array.from(dates).sort());
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) void refresh();
  }, [mounted, refresh]);

  const getRecordFor = useCallback(
    (dateISO: string): ReadingEntry | ReadingEntry[] | null => {
      const list = entries.filter(
        (e) =>
          e.date === dateISO &&
          (e.checkedIn || (e.response && e.response.trim().length > 0))
      );
      if (list.length === 0) return null;
      if (list.length === 1) return list[0];
      return list;
    },
    [entries]
  );

  const getEntryFor = useCallback(
    (dateISO: string, readingKey: string): ReadingEntry | null => {
      return entries.find((e) => e.date === dateISO && e.readingKey === readingKey) ?? null;
    },
    [entries]
  );

  const checkIn = useCallback(
    async (
      dateISO: string,
      opts?: { response?: string; scriptureRef?: string; readingKey?: string }
    ) => {
      const reading = getReadingForDate(dateISO);
      const items = reading.items;
      const { error } = await setCompletedForDateChaptersAction({
        entry_date: dateISO,
        items,
        completed: true,
      });
      if (!error) void refresh();
    },
    [refresh]
  );

  const isDateCheckedIn = useCallback(
    (dateISO: string): boolean => checkedInDates.includes(dateISO),
    [checkedInDates]
  );

  const markDateComplete = useCallback(
    async (dateISO: string) => {
      const reading = getReadingForDate(dateISO);
      const { error } = await setCompletedForDateChaptersAction({
        entry_date: dateISO,
        items: reading.items,
        completed: true,
      });
      if (!error) void refresh();
    },
    [refresh]
  );

  const isChapterCompleted = useCallback(
    (dateISO: string, idx: 1 | 2): boolean => {
      const reading = getReadingForDate(dateISO);
      const ref = reading.items[idx - 1];
      if (!ref) return false;
      const slug = cnBookToSlug(ref.book);
      const readingKey = slug ? `${slug}-${ref.chapter}` : `legacy-${ref.book}-${ref.chapter}`;
      const entry = entries.find((e) => e.date === dateISO && e.readingKey === readingKey);
      return entry?.checkedIn ?? false;
    },
    [entries]
  );

  const areAllChaptersCompleted = useCallback(
    (dateISO: string): boolean =>
      isChapterCompleted(dateISO, 1) && isChapterCompleted(dateISO, 2),
    [isChapterCompleted]
  );

  return {
    entries,
    records: entries,
    checkedInDates,
    getRecordFor,
    getEntryFor,
    checkIn,
    markDateComplete,
    isDateCheckedIn,
    isChapterCompleted,
    areAllChaptersCompleted,
    refresh,
    mounted,
    loading,
  };
}
