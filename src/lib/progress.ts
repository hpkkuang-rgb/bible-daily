// src/lib/progress.ts

const STORAGE_KEY = "bible_reading_progress";

export type ProgressData = {
  startDateISO: string;
  completedDates: string[];
  /** Per-date chapter completion: { "2026-02-23": [1, 2] } = both chapters done */
  completedChapters?: Record<string, number[]>;
};

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isWeekend(d: Date) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function getProgress(): ProgressData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ProgressData;
    if (!data.completedDates || !Array.isArray(data.completedDates)) return null;
    return {
      startDateISO: data.startDateISO ?? "",
      completedDates: data.completedDates,
      completedChapters: data.completedChapters ?? {},
    };
  } catch {
    return null;
  }
}

export function markCompleted(
  dateISO: string,
  startDateISO?: string
): ProgressData {
  const existing = getProgress();
  const completedDates = existing?.completedDates ?? [];
  const completedChapters = { ...(existing?.completedChapters ?? {}) };
  if (!completedDates.includes(dateISO)) {
    completedDates.push(dateISO);
    completedDates.sort();
  }
  const existingCh = completedChapters[dateISO] ?? [];
  if (!existingCh.includes(1)) existingCh.push(1);
  if (!existingCh.includes(2)) existingCh.push(2);
  existingCh.sort((a, b) => a - b);
  completedChapters[dateISO] = existingCh;
  const start = existing?.startDateISO ?? startDateISO ?? dateISO;
  const data: ProgressData = {
    startDateISO: start,
    completedDates,
    completedChapters,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
}

/** Mark a specific chapter (idx 1 or 2) as completed for a date. Auto-marks date when both done. */
export function markChapterCompleted(dateISO: string, idx: 1 | 2): ProgressData {
  const existing = getProgress();
  const completedChapters = { ...(existing?.completedChapters ?? {}) };
  const list = completedChapters[dateISO] ?? [];
  if (!list.includes(idx)) {
    list.push(idx);
    list.sort((a, b) => a - b);
    completedChapters[dateISO] = list;
  }
  const data: ProgressData = {
    startDateISO: existing?.startDateISO ?? dateISO,
    completedDates: existing?.completedDates ?? [],
    completedChapters,
  };
  if (list.length >= 2) {
    if (!data.completedDates.includes(dateISO)) {
      data.completedDates.push(dateISO);
      data.completedDates.sort();
    }
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
}

/** Check if a specific chapter is completed. Backward compat: if date in completedDates but not in completedChapters, treat both done. */
export function isChapterCompleted(dateISO: string, idx: 1 | 2): boolean {
  const progress = getProgress();
  const chapters = progress?.completedChapters?.[dateISO];
  if (chapters?.includes(idx)) return true;
  if (progress?.completedDates?.includes(dateISO) && !chapters) return true;
  return false;
}

/** Check if all chapters (1 and 2) for a date are completed */
export function areAllChaptersCompleted(dateISO: string): boolean {
  return isChapterCompleted(dateISO, 1) && isChapterCompleted(dateISO, 2);
}

export function isCompleted(dateISO: string): boolean {
  const progress = getProgress();
  return progress?.completedDates.includes(dateISO) ?? false;
}

export function getStats(): { streak: number; totalCompleted: number } {
  const progress = getProgress();
  const completedDates = new Set(progress?.completedDates ?? []);
  const totalCompleted = completedDates.size;

  const today = new Date();
  let cur = new Date(today);
  let streak = 0;

  while (true) {
    if (isWeekend(cur)) {
      cur.setDate(cur.getDate() - 1);
      continue;
    }
    const iso = toISODate(cur);
    if (!completedDates.has(iso)) break;
    streak += 1;
    cur.setDate(cur.getDate() - 1);
  }

  return { streak, totalCompleted };
}
