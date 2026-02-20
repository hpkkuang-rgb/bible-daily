// src/lib/contentPack.ts
// 章节级别灵修内容包，按书卷加载 JSON

import EZK from "@/src/content/devotions/EZK.json";

export type DevotionPackEntry = {
  summary: string;
  reflection: string[];
};

type DevotionPack = Record<string, DevotionPackEntry>;

/**
 * 获取指定书卷、章节的灵修内容覆盖
 * @param bookKey 书卷短码，如 EZK、MAT
 * @param chapter 章号
 * @returns 若存在则返回 { summary, reflection }，否则 null
 */
export function getDevotionOverride(
  bookKey: string,
  chapter: number
): DevotionPackEntry | null {
  let pack: DevotionPack | null = null;

  switch (bookKey) {
    case "EZK":
      pack = EZK as DevotionPack;
      break;
    default:
      return null;
  }

  if (!pack) return null;

  const key = String(chapter);
  const entry = pack[key];
  if (!entry || typeof entry.summary !== "string" || !Array.isArray(entry.reflection)) {
    return null;
  }

  return {
    summary: entry.summary,
    reflection: entry.reflection,
  };
}
