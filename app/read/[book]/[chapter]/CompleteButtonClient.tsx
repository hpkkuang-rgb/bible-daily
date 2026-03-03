"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { setCompletedForDateChaptersAction } from "@/app/actions";
import { getReadingForDate } from "@/src/lib/plan";
import { useDailyRecords } from "@/src/hooks/useDailyRecords";

type Props = {
  dateISO: string;
  idx: 1 | 2;
  jumpToCh2Href: string | null;
  yesterdayHref: string | null;
};

export default function CompleteButtonClient({
  dateISO,
  idx,
  jumpToCh2Href,
  yesterdayHref,
}: Props) {
  const { isChapterCompleted, refresh } = useDailyRecords();
  const [completed, setCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const optimisticCompleteRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof dateISO !== "string" || dateISO.length === 0) return;
    const fromServer = isChapterCompleted(dateISO, idx);
    if (optimisticCompleteRef.current && !fromServer) return;
    optimisticCompleteRef.current = false;
    setCompleted(fromServer);
  }, [mounted, dateISO, idx, isChapterCompleted]);

  const handleClick = async () => {
    if (completed) return;
    if (typeof dateISO !== "string" || dateISO.length === 0) return;
    optimisticCompleteRef.current = true;
    setCompleted(true);
    setSaving(true);
    try {
      const reading = getReadingForDate(dateISO);
      await setCompletedForDateChaptersAction({
        entry_date: dateISO,
        items: reading.items,
        completed: true,
      });
      void refresh();
    } finally {
      setSaving(false);
    }
  };

  const noDate = typeof dateISO !== "string" || dateISO.length === 0;

  return (
    <section className="mt-6 pb-8">
      <button
        type="button"
        onClick={handleClick}
        disabled={completed || noDate || saving}
        className={`w-full rounded-xl px-4 py-3 text-white ${
          completed
            ? "bg-emerald-600 cursor-default"
            : noDate
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-sky-500 hover:bg-sky-600"
        }`}
      >
        {noDate
          ? "缺少日期参数"
          : saving
            ? "保存中…"
            : completed
              ? "🎉 今日已完成"
              : "✅ 读完打卡"}
      </button>

      <div className="mt-4 flex flex-wrap gap-3">
        {jumpToCh2Href && (
          <Link
            href={jumpToCh2Href}
            className="rounded-xl border border-sky-400 bg-sky-50 px-4 py-2.5 text-sm text-sky-700 hover:bg-sky-100"
          >
            跳到第2章
          </Link>
        )}
        <Link
          href="/"
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          跳回首页
        </Link>
      </div>

      {yesterdayHref && (
        <div className="mt-3">
          <Link
            href={yesterdayHref}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            补打昨天 →
          </Link>
        </div>
      )}
    </section>
  );
}
