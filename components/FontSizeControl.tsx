"use client";

import type { FontSize } from "@/src/hooks/useFontPreference";

type Props = {
  size: FontSize;
  onSizeChange: (s: FontSize) => void;
};

export default function FontSizeControl({ size, onSizeChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">字号</span>
      <div className="flex gap-1">
        {(["small", "medium", "large"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSizeChange(s)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              size === s
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "small" ? "A-" : s === "medium" ? "A" : "A+"}
          </button>
        ))}
      </div>
    </div>
  );
}
