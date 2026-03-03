"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "bible_font_pref";

export type FontSize = "small" | "medium" | "large";

const FONT_CLASSES: Record<FontSize, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
};

export function useFontPreference() {
  const [size, setSizeState] = useState<FontSize>("medium");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as FontSize | null;
      if (stored && ["small", "medium", "large"].includes(stored)) {
        setSizeState(stored);
      }
    } catch {
      // ignore
    }
  }, [mounted]);

  const setSize = useCallback((s: FontSize) => {
    setSizeState(s);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, s);
      } catch {
        // ignore
      }
    }
  }, []);

  const fontClass = FONT_CLASSES[size];

  return { size, setSize, fontClass, mounted };
}
