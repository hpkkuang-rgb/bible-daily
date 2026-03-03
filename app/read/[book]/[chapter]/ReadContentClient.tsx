"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  upsertEntryAction,
  setCompletedForDateChaptersAction,
} from "@/app/actions";
import { getReadingKeyForIdx } from "@/src/lib/entries";
import { getReadingForDate } from "@/src/lib/plan";
import ResponseInput from "@/components/ResponseInput";
import FontSizeControl from "@/components/FontSizeControl";
import { useFontSizeContext } from "@/src/contexts/FontSizeContext";
import { useDailyRecords } from "@/src/hooks/useDailyRecords";

type Props = {
  dateISO: string;
  idx: 1 | 2;
  jumpToCh2Href: string | null;
  yesterdayHref: string | null;
};

export default function ReadContentClient({
  dateISO,
  idx,
  jumpToCh2Href,
  yesterdayHref,
}: Props) {
  const { size, setSize, mounted } = useFontSizeContext();
  const { getEntryFor, isChapterCompleted, refresh } = useDailyRecords();
  const [response, setResponse] = useState("");
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const optimisticCompleteRef = useRef(false);

  const reading = getReadingForDate(dateISO);
  const readingKey = getReadingKeyForIdx(dateISO, idx, reading.items);
  const ref = reading.items[idx - 1];

  useEffect(() => {
    if (!mounted) return;
    const fromServer = isChapterCompleted(dateISO, idx);
    if (optimisticCompleteRef.current && !fromServer) return;
    optimisticCompleteRef.current = false;
    setCompleted(fromServer);
    const entry = getEntryFor(dateISO, readingKey);
    setResponse(entry?.response ?? "");
  }, [mounted, dateISO, idx, readingKey, isChapterCompleted, getEntryFor]);

  const saveResponse = useCallback(
    async (text: string) => {
      if (!ref) return;
      const trimmed = text.trim();
      if (!trimmed && !completed) return;
      setSaving(true);
      await upsertEntryAction({
        entry_date: dateISO,
        book: ref.book,
        chapter: ref.chapter,
        response_text: trimmed || null,
        completed: completed || undefined,
      });
      setSaving(false);
      void refresh();
    },
    [dateISO, ref, completed, refresh]
  );

  const handleComplete = async () => {
    if (completed || submittingRef.current || !ref) return;
    submittingRef.current = true;
    setSaving(true);
    setError(null);
    optimisticCompleteRef.current = true;
    setCompleted(true);

    try {
      const trimmed = response.trim();
      if (trimmed) {
        const r = await upsertEntryAction({
          entry_date: dateISO,
          book: ref.book,
          chapter: ref.chapter,
          response_text: trimmed,
          completed: true,
        });
        if (r.error) throw r.error;
      }
      const result = await setCompletedForDateChaptersAction({
        entry_date: dateISO,
        items: reading.items,
        completed: true,
      });
      if (!result.ok) throw result.error ?? new Error("保存失败");
      void refresh();
    } catch (e) {
      setCompleted(false);
      optimisticCompleteRef.current = false;
      setError(e instanceof Error ? e.message : "保存失败，请重试");
    } finally {
      setSaving(false);
      submittingRef.current = false;
    }
  };

  const handleBlur = () => {
    if (response.trim()) void saveResponse(response);
  };

  return (
    <>
      <ResponseInput
        value={response}
        onChange={setResponse}
        onBlur={handleBlur}
        disabled={completed}
      />

      <section className="mt-6 pb-8">
        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}
        <button
          type="button"
          onClick={handleComplete}
          disabled={completed || saving}
          className={`w-full rounded-xl px-4 py-3 text-white ${
            completed
              ? "bg-emerald-600 cursor-default"
              : "bg-sky-500 hover:bg-sky-600"
          }`}
        >
          {saving ? "保存中…" : completed ? "🎉 今日已完成" : "✅ 读完打卡"}
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

        <div className="mt-6 pt-4 border-t border-gray-200">
          <FontSizeControl size={size} onSizeChange={setSize} />
        </div>
      </section>
    </>
  );
}
