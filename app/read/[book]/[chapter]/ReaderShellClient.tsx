"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

type Props = {
  dateISO: string;
  idx: 1 | 2;
  slug: string;
  cnBook: string;
  chapter: number;
  prev: { slug: string; chapter: number } | null;
  next: { slug: string; chapter: number } | null;
  children: React.ReactNode;
};

const SWIPE_THRESHOLD = 60;

export default function ReaderShellClient({
  dateISO,
  idx,
  cnBook,
  chapter,
  prev,
  next,
  children,
}: Props) {
  const router = useRouter();
  const touchStart = useRef<number | null>(null);
  const [swipeHint, setSwipeHint] = useState<string | null>(null);

  const buildUrl = useCallback(
    (s: string, ch: number) => {
      return `/read/${s}/${ch}?date=${dateISO}&idx=${idx}`;
    },
    [dateISO, idx]
  );

  const goPrev = useCallback(() => {
    if (!prev) return;
    router.push(buildUrl(prev.slug, prev.chapter));
  }, [prev, router, buildUrl]);

  const goNext = useCallback(() => {
    if (!next) return;
    router.push(buildUrl(next.slug, next.chapter));
  }, [next, router, buildUrl]);

  const handleStart = (clientX: number) => {
    touchStart.current = clientX;
    setSwipeHint(null);
  };

  const handleEnd = (clientX: number) => {
    if (touchStart.current === null) return;
    const delta = clientX - touchStart.current;
    touchStart.current = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD) return;

    if (delta > 0) {
      if (prev) {
        goPrev();
      } else {
        setSwipeHint("已是第一章");
      }
    } else {
      if (next) {
        goNext();
      } else {
        setSwipeHint("已是最后一章");
      }
    }
  };

  return (
    <section
      className="select-none rounded-2xl bg-white p-5 shadow-sm sm:p-6"
      onPointerDown={(e) => handleStart(e.clientX)}
      onPointerUp={(e) => handleEnd(e.clientX)}
      onPointerLeave={() => {
        touchStart.current = null;
      }}
    >
      <h2 className="mb-3 text-lg font-semibold">
        {cnBook} 第 {chapter} 章
      </h2>

      <div className="min-h-[120px] border-b border-gray-100 pb-4">
        {children}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        {prev ? (
          <button
            type="button"
            onClick={goPrev}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            ← 上一章
          </button>
        ) : (
          <span className="text-sm text-gray-400">已是第一章</span>
        )}
        {next ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            下一章 →
          </button>
        ) : (
          <span className="text-sm text-gray-400">已是最后一章</span>
        )}
      </div>

      {swipeHint && (
        <p className="mt-2 text-center text-sm text-amber-600">{swipeHint}</p>
      )}
    </section>
  );
}
