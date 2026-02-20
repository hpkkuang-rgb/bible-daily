// src/lib/bibleMeta.ts
// 阅读顺序：新约 -> 旧约（NT first, then OT）
// 元数据来源：src/data/bibleMeta.json

import bibleMetaJson from "@/src/data/bibleMeta.json";

export type BookMeta = {
  key: string;
  book: string;
  chapters: number;
  testament: "NT" | "OT";
};

export const BIBLE_META: BookMeta[] = bibleMetaJson as BookMeta[];

export const TOTAL_CHAPTERS = BIBLE_META.reduce((sum, b) => sum + b.chapters, 0);

/** 按中文书名查找书卷索引，未找到返回 -1 */
export function findBookIndexByName(book: string): number {
  return BIBLE_META.findIndex((b) => b.book === book);
}

/** 计算引用在全书序列中的 0-based 章偏移量 */
export function chapterOffsetOfRef(ref: {
  book: string;
  chapter: number;
}): number {
  let offset = 0;
  for (const b of BIBLE_META) {
    if (b.book === ref.book) {
      return offset + (ref.chapter - 1);
    }
    offset += b.chapters;
  }
  return -1;
}
