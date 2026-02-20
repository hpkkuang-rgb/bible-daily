// src/lib/plan.ts
import { BIBLE_META } from "./bibleMeta";

export type ReadingRef = { book: string; chapter: number };

export const PLAN_CONFIG = {
  startDateISO: "2026-02-16",
  calibration: {
    anchorDateISO: "2026-02-19",
    anchorRefA: { book: "以西结书", chapter: 25 },
    anchorRefB: { book: "以西结书", chapter: 26 },
  },
};

function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

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

function getLastWeekday(d: Date): Date {
  const cur = new Date(d);
  while (isWeekend(cur)) {
    cur.setDate(cur.getDate() - 1);
  }
  return cur;
}

function getWeekMonday(d: Date): Date {
  const ref = isWeekend(d) ? getLastWeekday(d) : new Date(d);
  const daysBack = (ref.getDay() + 6) % 7;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - daysBack);
  return monday;
}

/**
 * 从 startDate 到 targetDate（含）经历的阅读日数量 - 1
 * 即 dayIndex（0-based）
 */
export function getDayIndex(startDateISO: string, targetDateISO: string): number {
  const start = parseISODate(startDateISO);
  const target = parseISODate(targetDateISO);

  if (target < start) return 0;

  let count = 0;
  let cur = new Date(start);

  while (cur <= target) {
    if (!isWeekend(cur)) count += 1;
    cur.setDate(cur.getDate() + 1);
  }

  return Math.max(0, count - 1);
}

function refToOffset(book: string, chapter: number): number {
  let offset = 0;
  for (const b of BIBLE_META) {
    if (b.book === book) {
      return offset + (chapter - 1);
    }
    offset += b.chapters;
  }
  return -1;
}

function offsetToRef(offset: number): ReadingRef | null {
  if (offset < 0) return null;
  let remaining = offset;
  for (const b of BIBLE_META) {
    if (remaining < b.chapters) {
      return { book: b.book, chapter: remaining + 1 };
    }
    remaining -= b.chapters;
  }
  return null;
}

function computeStartOffset(): number {
  const { anchorDateISO, anchorRefA } = PLAN_CONFIG.calibration;
  const { startDateISO } = PLAN_CONFIG;

  const effectiveDate = parseISODate(anchorDateISO);
  const eff = isWeekend(effectiveDate) ? getLastWeekday(effectiveDate) : effectiveDate;
  const dayIndex = getDayIndex(startDateISO, toISODate(eff));

  const anchorOffset = refToOffset(anchorRefA.book, anchorRefA.chapter);
  if (anchorOffset < 0) throw new Error("Invalid anchor ref");

  return anchorOffset - dayIndex * 2;
}

let _startOffset: number | null = null;

function getStartOffset(): number {
  if (_startOffset === null) {
    _startOffset = computeStartOffset();
  }
  return _startOffset;
}

/**
 * 计算某天应读的两章（校准后）
 * 周末：effectiveDate=上一个工作日，items 与周五一致
 */
export function getReadingForDate(targetDateISO: string): {
  isWeekend: boolean;
  isReadingDay: boolean;
  items: ReadingRef[];
  dateISO: string;
  dayIndex: number;
  effectiveDateISO: string;
} {
  const date = parseISODate(targetDateISO);
  const dateISO = toISODate(date);
  const weekend = isWeekend(date);

  const effectiveDate = weekend ? getLastWeekday(date) : date;
  const effectiveDateISO = toISODate(effectiveDate);
  const dayIndex = getDayIndex(PLAN_CONFIG.startDateISO, effectiveDateISO);
  const startOffset = getStartOffset();

  const items: ReadingRef[] = [];
  for (let i = 0; i < 2; i++) {
    const offset = startOffset + dayIndex * 2 + i;
    const ref = offsetToRef(offset);
    if (ref) items.push(ref);
  }

  return {
    isWeekend: weekend,
    isReadingDay: !weekend,
    items,
    dateISO,
    dayIndex,
    effectiveDateISO,
  };
}

/**
 * 获取“本周”读经计划范围（周一第一章 ~ 周五第二章）
 * 基于自然周：周一到周五
 */
export function getWeekRange(targetDateISO: string): {
  weekStartISO: string;
  weekEndISO: string;
  startRef: ReadingRef;
  endRef: ReadingRef;
} {
  const target = parseISODate(targetDateISO);
  const monday = getWeekMonday(target);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const weekStartISO = toISODate(monday);
  const weekEndISO = toISODate(friday);

  const dayIndexMon = getDayIndex(PLAN_CONFIG.startDateISO, weekStartISO);
  const dayIndexFri = getDayIndex(PLAN_CONFIG.startDateISO, weekEndISO);
  const startOffset = getStartOffset();

  const startRef = offsetToRef(dayIndexMon * 2 + startOffset);
  const endRef = offsetToRef(dayIndexFri * 2 + 1 + startOffset);

  if (!startRef || !endRef) {
    throw new Error("getWeekRange: invalid chapter offset");
  }

  return {
    weekStartISO,
    weekEndISO,
    startRef,
    endRef,
  };
}
