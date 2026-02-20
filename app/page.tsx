"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { getReadingForDate, getWeekRange } from "@/src/lib/plan";
import { cnBookToSlug, buildBibleGatewayUrl } from "@/src/lib/bookMap";
import type { ReadingRef } from "@/src/lib/plan";
import {
  markCompleted,
  isCompleted,
  getStats,
} from "@/src/lib/progress";

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

  const [completed, setCompleted] = useState(false);
  const [yesterdayCompleted, setYesterdayCompleted] = useState(false);
  const [stats, setStats] = useState({ streak: 0, totalCompleted: 0 });

  useEffect(() => {
    setCompleted(isCompleted(todayISO));
    setYesterdayCompleted(isCompleted(yesterdayISO));
    setStats(getStats());
  }, [todayISO, yesterdayISO]);

  const result = getReadingForDate(todayISO);
  const week = getWeekRange(todayISO);
  const reading = result.items;

  const yesterdayResult = getReadingForDate(yesterdayISO);
  const yesterdayReading = yesterdayResult.items;

  const handleMarkYesterday = () => {
    if (yesterdayCompleted) return;
    markCompleted(yesterdayISO);
    setYesterdayCompleted(true);
    setStats(getStats());
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">每日读经</h1>
          <Link
            href="/history"
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            查看打卡记录
          </Link>
        </div>

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
              const idx = i + 1;
              const href = slug
                ? `/read/${slug}/${r.chapter}?date=${todayISO}&idx=${idx}`
                : null;
              return (
                <li
                  key={`${r.book}-${r.chapter}`}
                  className="rounded-xl bg-gray-100 px-4 py-3"
                >
                  {href ? (
                    <Link
                      href={href}
                      className="block text-base font-medium text-gray-900 hover:text-gray-600"
                    >
                      {r.book} {r.chapter} 章
                    </Link>
                  ) : (
                    <a
                      href={buildBibleGatewayUrl(r.book, r.chapter)}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-base font-medium text-gray-900 hover:text-gray-600"
                    >
                      {r.book} {r.chapter} 章 ↗
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex items-center gap-4 text-sm text-gray-600">
            <span>🔥 连续 {stats.streak} 天</span>
            <span>✅ 累计完成 {stats.totalCompleted} 次</span>
          </div>

          <button
            className="mt-5 w-full rounded-xl bg-black px-4 py-3 text-white hover:opacity-90 disabled:cursor-default disabled:opacity-70"
            onClick={() => {
              if (!completed) {
                markCompleted(todayISO);
                setCompleted(true);
                setStats(getStats());
              }
            }}
            disabled={completed}
          >
            {completed ? "🎉 今日已完成" : "✅ 我已读完，打卡"}
          </button>
        </section>

        <div className="text-center">
          <Link
            href="/history"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            查看打卡记录 →
          </Link>
        </div>

        {/* 昨天补打 - 页面最下方 */}
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
      </div>
    </main>
  );
}
