"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { getReadingForDate, getWeekRange } from "@/src/lib/plan";
import { cnBookToSlug, buildBibleGatewayUrl } from "@/src/lib/bookMap";
import type { ReadingRef } from "@/src/lib/plan";
import { useDailyRecords } from "@/src/hooks/useDailyRecords";
import SocialFeedPreview from "@/components/SocialFeedPreview";

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatWeekRange(startRef: ReadingRef, endRef: ReadingRef): string {
  if (startRef.book === endRef.book) {
    return `${startRef.book} ${startRef.chapter}–${endRef.chapter} 章`;
  }
  return `${startRef.book} ${startRef.chapter} 章 – ${endRef.book} ${endRef.chapter} 章`;
}

export default function Home() {
  const today = new Date();
  const todayISO = toISODate(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = toISODate(yesterday);

  const [mounted, setMounted] = useState(false);
  const [allChaptersDone, setAllChaptersDone] = useState(false);
  const [yesterdayCompleted, setYesterdayCompleted] = useState(false);
  const [chapterDoneMap, setChapterDoneMap] = useState<Record<number, boolean>>({});

  const {
    isDateCheckedIn,
    refresh,
    markDateComplete,
    isChapterCompleted,
    areAllChaptersCompleted,
  } = useDailyRecords();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setAllChaptersDone(areAllChaptersCompleted(todayISO));
    setYesterdayCompleted(isDateCheckedIn(yesterdayISO));
    const map: Record<number, boolean> = {};
    [1, 2].forEach((idx) => {
      map[idx] = isChapterCompleted(todayISO, idx as 1 | 2);
    });
    setChapterDoneMap(map);
  }, [mounted, todayISO, yesterdayISO, areAllChaptersCompleted, isChapterCompleted, isDateCheckedIn]);

  const result = getReadingForDate(todayISO);
  const week = getWeekRange(todayISO);
  const reading = result.items;

  const yesterdayResult = getReadingForDate(yesterdayISO);
  const yesterdayReading = yesterdayResult.items;

  const todayCheckedIn = mounted ? isDateCheckedIn(todayISO) : false;

  const handleMarkToday = () => {
    if (todayCheckedIn || !allChaptersDone) return;
    void markDateComplete(todayISO);
    void refresh();
  };

  const handleMarkYesterday = () => {
    if (yesterdayCompleted) return;
    void markDateComplete(yesterdayISO);
    void refresh();
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 pb-24">
        <div className="mx-auto max-w-xl space-y-4">
          <h1 className="text-2xl font-semibold">每日读经</h1>
          <div className="rounded-2xl bg-white p-8 text-center">
            <p className="text-gray-500">加载中…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold">每日读经</h1>

        <div className="text-sm text-gray-600">
          本周读经计划：{formatWeekRange(week.startRef, week.endRef)}
        </div>

        {/* 今日 */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">今日日期</div>
          <div className="mt-1 text-lg font-medium">
            {format(today, "yyyy-MM-dd")}（{todayISO}）
          </div>

          <div className="mt-4 text-sm text-gray-500">今日阅读</div>
          {result.isWeekend && (
            <div className="mt-2 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              今天是周末：可打卡，但阅读进度不推进（仍显示本周最后一个阅读日内容）。
            </div>
          )}
          <ul className="mt-2 space-y-2">
            {reading.map((r, i) => {
              const slug = cnBookToSlug(r.book);
              const idx = (i + 1) as 1 | 2;
              const chapterDone = mounted ? (chapterDoneMap[idx] ?? false) : false;
              const href = slug
                ? `/read/${slug}/${r.chapter}?date=${todayISO}&idx=${idx}`
                : null;
              return (
                <li
                  key={`${r.book}-${r.chapter}`}
                  className={`rounded-xl px-4 py-3 ${
                    chapterDone ? "bg-emerald-100" : "bg-sky-50"
                  }`}
                >
                  {href ? (
                    <Link
                      href={href}
                      className={`block text-base font-medium ${
                        chapterDone
                          ? "text-emerald-700 hover:text-emerald-800"
                          : "text-sky-600 hover:text-sky-700"
                      }`}
                    >
                      {r.book} {r.chapter} 章
                      {chapterDone && " ✓"}
                    </Link>
                  ) : (
                    <a
                      href={buildBibleGatewayUrl(r.book, r.chapter)}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-base font-medium text-sky-600 hover:text-sky-700"
                    >
                      {r.book} {r.chapter} 章 ↗
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          <button
            onClick={handleMarkToday}
            disabled={todayCheckedIn || !allChaptersDone}
            className={`mt-5 w-full rounded-xl px-4 py-3 text-white transition-colors disabled:cursor-default disabled:opacity-70 ${
              todayCheckedIn
                ? "bg-emerald-600"
                : allChaptersDone
                  ? "bg-black hover:opacity-90"
                  : "bg-gray-400"
            }`}
          >
            {todayCheckedIn
              ? "🎉 今日已完成"
              : allChaptersDone
                ? "✅ 我已读完，打卡"
                : "✅ 我已读完，打卡（需先完成两章阅读）"}
          </button>
        </section>

        {/* 昨天补打 */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">昨天</div>
          <div className="mt-1 text-base font-medium">{yesterdayISO}</div>
          {yesterdayReading.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {yesterdayReading.map((r) => `${r.book} ${r.chapter} 章`).join("、")}
            </div>
          )}
          <button
            className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-default disabled:opacity-70"
            onClick={handleMarkYesterday}
            disabled={yesterdayCompleted}
          >
            {yesterdayCompleted ? "昨天已完成 ✅" : "补打昨天"}
          </button>
        </section>

        {/* 今日完成打卡的朋友 */}
        <SocialFeedPreview />
      </div>
    </main>
  );
}
