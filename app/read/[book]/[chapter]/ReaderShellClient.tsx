"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useFontSizeContext } from "@/src/contexts/FontSizeContext";

type NavTarget = {
  slug: string;
  chapter: number;
  dateISO: string;
  idx: 1 | 2;
};

type Props = {
  dateISO: string;
  idx: 1 | 2;
  slug: string;
  cnBook: string;
  chapter: number;
  prev: NavTarget | null;
  next: NavTarget | null;
  children: React.ReactNode;
};

const SWIPE_THRESHOLD = 60;
const SWIPE_RATIO = 1.5;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const el = target.closest("textarea, input, [contenteditable=true]");
  return !!el;
}

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
  const { fontClass } = useFontSizeContext();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [swipeHint, setSwipeHint] = useState<string | null>(null);

  const goPrev = useCallback(() => {
    if (!prev) return;
    router.push(`/read/${prev.slug}/${prev.chapter}?date=${prev.dateISO}&idx=${prev.idx}`);
  }, [prev, router]);

  const goNext = useCallback(() => {
    if (!next) return;
    router.push(`/read/${next.slug}/${next.chapter}?date=${next.dateISO}&idx=${next.idx}`);
  }, [next, router]);

  const handleStart = (clientX: number, clientY: number, target: EventTarget | null) => {
    if (isEditableTarget(target)) return;
    touchStart.current = { x: clientX, y: clientY };
    setSwipeHint(null);
  };

  const handleEnd = (clientX: number, clientY: number) => {
    if (touchStart.current === null) return;
    const deltaX = clientX - touchStart.current.x;
    const deltaY = clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY) * SWIPE_RATIO) return;

    if (deltaX > 0) {
      if (prev) goPrev();
      else setSwipeHint("已是第一章");
    } else {
      if (next) goNext();
      else setSwipeHint("已是最后一章");
    }
  };

  const handleCancel = () => {
    touchStart.current = null;
  };

  return (
    <section
      className="select-none rounded-2xl bg-white p-5 shadow-sm sm:p-6"
      onPointerDown={(e) => handleStart(e.clientX, e.clientY, e.target)}
      onPointerUp={(e) => handleEnd(e.clientX, e.clientY)}
      onPointerLeave={handleCancel}
      onPointerCancel={handleCancel}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY, e.target)}
      onTouchEnd={(e) => {
        if (e.changedTouches[0]) handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }}
      onTouchCancel={handleCancel}
    >
      <h2 className="mb-3 text-lg font-semibold">
        {cnBook} 第 {chapter} 章
      </h2>

      <div className={`min-h-[120px] border-b border-gray-100 pb-4 ${fontClass}`}>
        {children}
      </div>

      {next && (
        <p className="mb-2 text-center text-xs text-gray-400">← 左滑下一章</p>
      )}
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
