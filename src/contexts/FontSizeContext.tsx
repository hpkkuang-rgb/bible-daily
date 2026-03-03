"use client";

import { createContext, useContext } from "react";
import { useFontPreference } from "@/src/hooks/useFontPreference";

type FontSizeContextValue = ReturnType<typeof useFontPreference>;

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const value = useFontPreference();
  return (
    <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>
  );
}

export function useFontSizeContext(): FontSizeContextValue {
  const ctx = useContext(FontSizeContext);
  if (!ctx) {
    throw new Error("useFontSizeContext must be used within FontSizeProvider");
  }
  return ctx;
}
