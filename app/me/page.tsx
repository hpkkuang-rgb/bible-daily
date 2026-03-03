"use client";

import { useDailyRecords } from "@/src/hooks/useDailyRecords";
import Link from "next/link";
import { cnBookToSlug } from "@/src/lib/bookMap";
import { getReadingForDate } from "@/src/lib/plan";

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

export default function MePage() {
  const { entries, mounted } = useDailyRecords();

  const entriesWithContent = entries.filter(
    (entry) => entry.response && entry.response.trim().length > 0
  );

  const byDate = new Map<string, typeof entriesWithContent>();
  for (const e of entriesWithContent) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }
  for (const list of byDate.values()) {
    list.sort((a, b) => a.readingKey.localeCompare(b.readingKey));
  }
  const sortedDates = Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a));

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 pb-24">
        <div className="mx-auto max-w-xl">
          <p className="text-gray-500">加载中…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">我的</h1>
          <Link
            href="/logout"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            退出登录
          </Link>
        </div>

        {entriesWithContent.length === 0 ? (
          <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">你还没有写下回应</p>
          </section>
        ) : (
          <ul className="space-y-4">
            {sortedDates.map((dateISO) => {
              const dayEntries = byDate.get(dateISO) ?? [];
              return (
                <li key={dateISO}>
                  <article className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="text-sm font-medium text-gray-700">{dateISO}</div>
                    <ul className="mt-3 space-y-3">
                      {dayEntries.map((e) => {
                        const href = getHrefForEntry(e.date, e.readingKey);
                        return (
                          <li key={e.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">
                                {e.scriptureRef}
                              </span>
                              <span className="text-xs text-gray-400" suppressHydrationWarning>
                                {new Date(e.updatedAt).toLocaleString("zh-CN")}
                              </span>
                            </div>
                            <div className="mt-2 whitespace-pre-wrap text-base text-gray-800">
                              {e.response}
                            </div>
                            {href && (
                              <Link
                                href={href}
                                className="mt-2 inline-block text-sm text-sky-600 hover:underline"
                              >
                                查看当日阅读 →
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
