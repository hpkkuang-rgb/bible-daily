// src/lib/records.ts
// DailyRecord v2 storage with migration from v1

const STORAGE_KEY_V2 = "bible_daily_records_v2";
const STORAGE_KEY_V1 = "bible_reading_progress";

export type DailyRecord = {
  date: string;
  checkedIn: boolean;
  response?: string;
  scriptureRef?: string;
  updatedAt: number;
};

type RecordsData = Record<string, DailyRecord>;

function loadRaw(): RecordsData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) return {};
    return JSON.parse(raw) as RecordsData;
  } catch {
    return {};
  }
}

function saveRaw(data: RecordsData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(data));
}

function migrateFromV1(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) return;
    const v1 = JSON.parse(raw) as {
      completedDates?: string[];
      completedChapters?: Record<string, number[]>;
    };
    const dates = v1.completedDates ?? [];
    if (dates.length === 0) return;

    const existing = loadRaw();
    let changed = false;
    for (const date of dates) {
      if (!existing[date]) {
        existing[date] = {
          date,
          checkedIn: true,
          updatedAt: Date.now(),
        };
        changed = true;
      }
    }
    if (changed) saveRaw(existing);
  } catch {
    // ignore migration errors
  }
}

export function getRecord(dateISO: string): DailyRecord | null {
  migrateFromV1();
  const data = loadRaw();
  return data[dateISO] ?? null;
}

export function getAllRecords(): DailyRecord[] {
  migrateFromV1();
  const data = loadRaw();
  return Object.values(data).sort((a, b) => b.date.localeCompare(a.date));
}

export function getCheckedInDates(): string[] {
  migrateFromV1();
  const data = loadRaw();
  return Object.values(data)
    .filter((r) => r.checkedIn)
    .map((r) => r.date)
    .sort();
}

export function saveRecord(record: Omit<DailyRecord, "updatedAt">): DailyRecord {
  migrateFromV1();
  const data = loadRaw();
  const full: DailyRecord = {
    ...record,
    updatedAt: Date.now(),
  };
  data[record.date] = full;
  saveRaw(data);
  return full;
}

export function isCheckedIn(dateISO: string): boolean {
  const r = getRecord(dateISO);
  return r?.checkedIn ?? false;
}
