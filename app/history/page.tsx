"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress } from "@/src/lib/progress";
import { getReadingForDate } from "@/src/lib/plan";
import { cnBookToSlug } from "@/src/lib/bookMap";

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function HistoryPage() {
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setToday(new Date());
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      const progress = getProgress();
      setCompletedDates(progress?.completedDates ?? []);
    }
  }, [mounted]);

  const year = today?.getFullYear() ?? 2020;
  const month = today?.getMonth() ?? 0;

  // 当月第一天
  const firstDay = new Date(year, month, 1);
  // 当月最后一天
  const lastDay = new Date(year, month + 1, 0);
  // 当月第一天是周几（0=Sun, 1=Mon, ...），调整为 Mon=0
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  const completedSet = new Set(completedDates);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回首页
          </Link>
          <h1 className="text-xl font-semibold">打卡记录</h1>
          <div className="w-16" />
        </div>

        {/* 当月日历 */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-700">
            {year} 年 {month + 1} 月
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {weekDays.map((w) => (
              <div key={w} className="text-xs text-gray-500">
                {w}
              </div>
            ))}
            {calendarDays.map((d, i) => {
              if (d === null) {
                return <div key={`empty-${i}`} />;
              }
              const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const isCompleted = completedSet.has(iso);
              return (
                <div key={iso} className="flex h-8 items-center justify-center">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : "border border-gray-300 text-gray-700"
                    }`}
                  >
                    {d}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 列表 */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-700">已完成日期</div>
          {completedDates.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">暂无打卡记录</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {[...completedDates].reverse().map((dateISO) => {
                const reading = getReadingForDate(dateISO);
                const ref1 = reading.items[0];
                const slug = ref1 ? cnBookToSlug(ref1.book) : null;
                const href =
                  slug && ref1
                    ? `/read/${slug}/${ref1.chapter}?date=${dateISO}&idx=1`
                    : null;
                return (
                  <li key={dateISO}>
                    {href ? (
                      <Link
                        href={href}
                        className="block rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                      >
                        {dateISO}
                        {ref1 && (
                          <span className="ml-2 text-gray-500">
                            {ref1.book} {ref1.chapter} 章
                            {reading.items[1]
                              ? `、${reading.items[1].book} ${reading.items[1].chapter} 章`
                              : ""}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <div className="rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800">
                        {dateISO}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
