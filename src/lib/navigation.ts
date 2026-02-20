// src/lib/navigation.ts
import { BIBLE_META } from "./bibleMeta";
import { BOOKS } from "./bookMap";

export type NavTarget = {
  slug: string;
  cnBook: string;
  chapter: number;
} | null;

function getBookIndexBySlug(slug: string): number {
  const idx = BOOKS.findIndex((b) => b.slug === slug);
  if (idx < 0) return -1;
  const cnBook = BOOKS[idx].cn;
  const metaIdx = BIBLE_META.findIndex((m) => m.book === cnBook);
  return metaIdx >= 0 ? metaIdx : -1;
}

function getChaptersForSlug(slug: string): number {
  const cnBook = BOOKS.find((b) => b.slug === slug)?.cn;
  if (!cnBook) return 0;
  const meta = BIBLE_META.find((m) => m.book === cnBook);
  return meta?.chapters ?? 0;
}

export function getPrevChapter(slug: string, chapter: number): NavTarget {
  const bookIdx = getBookIndexBySlug(slug);
  if (bookIdx < 0) return null;

  const cnBook = BOOKS.find((b) => b.slug === slug)?.cn;
  if (!cnBook) return null;

  if (chapter > 1) {
    return { slug, cnBook, chapter: chapter - 1 };
  }
  if (bookIdx === 0) return null;
  const prevMeta = BIBLE_META[bookIdx - 1];
  const prevBook = BOOKS.find((b) => b.cn === prevMeta.book);
  if (!prevBook) return null;
  return {
    slug: prevBook.slug,
    cnBook: prevMeta.book,
    chapter: prevMeta.chapters,
  };
}

export function getNextChapter(slug: string, chapter: number): NavTarget {
  const bookIdx = getBookIndexBySlug(slug);
  if (bookIdx < 0) return null;

  const cnBook = BOOKS.find((b) => b.slug === slug)?.cn;
  if (!cnBook) return null;

  const totalChapters = getChaptersForSlug(slug);
  if (chapter < totalChapters) {
    return { slug, cnBook, chapter: chapter + 1 };
  }
  if (bookIdx >= BIBLE_META.length - 1) return null;
  const nextMeta = BIBLE_META[bookIdx + 1];
  const nextBook = BOOKS.find((b) => b.cn === nextMeta.book);
  if (!nextBook) return null;
  return {
    slug: nextBook.slug,
    cnBook: nextMeta.book,
    chapter: 1,
  };
}
