"use client";

import Link from "next/link";
import type { ReadingEntry } from "@/src/lib/entries";
import { getReadingForDate } from "@/src/lib/plan";
import { cnBookToSlug } from "@/src/lib/bookMap";

type Props = {
  dateISO: string;
  record: ReadingEntry | ReadingEntry[] | null;
};

function getHrefForEntry(dateISO: string, readingKey: string): string | null {
  if (readingKey === "legacy") {
    const reading = getReadingForDate(dateISO);
    const ref1 = reading.items[0];
    const slug = ref1 ? cnBookToSlug(ref1.book) : null;
    return slug && ref1 ? `/read/${slug}/${ref1.chapter}?date=${dateISO}&idx=1` : null;
  }
  const parts = readingKey.split("-");
  const chapter = parseInt(parts[parts.length - 1], 10);
  const slug = parts.slice(0, -1).join("-");
  if (!slug || isNaN(chapter)) return null;
  const reading = getReadingForDate(dateISO);
  const idx = reading.items.findIndex(
    (r) => cnBookToSlug(r.book) === slug && r.chapter === chapter
  );
  const idxNum = idx >= 0 ? idx + 1 : 1;
  return `/read/${slug}/${chapter}?date=${dateISO}&idx=${idxNum}`;
}

export default function DayDetail({ dateISO, record }: Props) {
  const raw = Array.isArray(record)
    ? record
    : record
      ? [record]
      : [];
  const entries = raw.filter(
    (e) => e.checkedIn || (e.response && e.response.trim().length > 0)
  );
  const reading = getReadingForDate(dateISO);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">日期</div>
      <div className="mt-1 text-lg font-medium">{dateISO}</div>

      <div className="mt-4 text-sm text-gray-500">当日记录</div>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">该日暂无记录</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {entries.map((e) => {
            const href = getHrefForEntry(dateISO, e.readingKey);
            const responsePreview =
              e.response && e.response.length > 40
                ? e.response.slice(0, 40) + "…"
                : e.response;
            return (
              <li
                key={e.id}
                className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {e.scriptureRef}
                  </span>
                  {e.checkedIn && (
                    <span className="text-xs text-emerald-600">✓ 已完成</span>
                  )}
                </div>
                {e.response && (
                  <div className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {responsePreview}
                  </div>
                )}
                {href && (
                  <Link
                    href={href}
                    className="mt-2 inline-block text-sm text-sky-600 hover:underline"
                  >
                    查看当天内容 →
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {reading.items.length > 0 && entries.length === 0 && (() => {
        const ref1 = reading.items[0];
        const slug = ref1 ? cnBookToSlug(ref1.book) : null;
        const href = slug && ref1 ? `/read/${slug}/${ref1.chapter}?date=${dateISO}&idx=1` : null;
        return href ? (
          <Link
            href={href}
            className="mt-3 inline-flex rounded-xl border border-sky-500 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100"
          >
            查看当天内容 →
          </Link>
        ) : null;
      })()}
    </section>
  );
}
