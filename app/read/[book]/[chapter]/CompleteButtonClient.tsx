"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { markCompleted, isCompleted } from "@/src/lib/progress";

type Props = {
  dateISO: string;
  jumpToCh2Href: string | null;
  yesterdayHref: string | null;
};

export default function CompleteButtonClient({
  dateISO,
  jumpToCh2Href,
  yesterdayHref,
}: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof dateISO === "string" && dateISO.length > 0) {
      setCompleted(isCompleted(dateISO));
    }
  }, [mounted, dateISO]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const handleClick = () => {
    if (completed) return;
    if (typeof dateISO !== "string" || dateISO.length === 0) return;
    markCompleted(dateISO);
    setCompleted(true);
    timerRef.current = setTimeout(() => {
      router.push("/");
    }, 500);
  };

  const noDate = typeof dateISO !== "string" || dateISO.length === 0;

  return (
    <section className="mt-6 pb-8">
      <button
        type="button"
        onClick={handleClick}
        disabled={completed || noDate}
        className={`w-full rounded-xl px-4 py-3 text-white ${
          completed
            ? "bg-green-600 cursor-default"
            : noDate
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-sky-500 hover:bg-sky-600"
        }`}
      >
        {noDate
          ? "缺少日期参数"
          : completed
            ? "🎉 今日已完成"
            : "✅ 读完打卡"}
      </button>
      {completed && (
        <p className="mt-2 text-center text-sm text-gray-500">
          即将返回首页…
        </p>
      )}

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
