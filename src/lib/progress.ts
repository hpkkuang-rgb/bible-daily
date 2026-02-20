// src/lib/progress.ts

const STORAGE_KEY = "bible_reading_progress";

export type ProgressData = {
  startDateISO: string;
  completedDates: string[];
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
  if (!completedDates.includes(dateISO)) {
    completedDates.push(dateISO);
    completedDates.sort();
  }
  const start = existing?.startDateISO ?? startDateISO ?? dateISO;
  const data: ProgressData = {
    startDateISO: start,
    completedDates,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
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
