// src/lib/bookMap.ts
import { BIBLE_META } from "./bibleMeta";

export type BookSlugMap = {
  cn: string;
  slug: string;
  apiName: string;
  bookId: string;
  cuvBook: string;
};

// bookId -> slug (for routing)
const BOOK_ID_TO_SLUG: Record<string, string> = {
  MAT: "matthew",
  MRK: "mark",
  LUK: "luke",
  JHN: "john",
  ACT: "acts",
  ROM: "romans",
  "1CO": "1corinthians",
  "2CO": "2corinthians",
  GAL: "galatians",
  EPH: "ephesians",
  PHP: "philippians",
  COL: "colossians",
  "1TH": "1thessalonians",
  "2TH": "2thessalonians",
  "1TI": "1timothy",
  "2TI": "2timothy",
  TIT: "titus",
  PHM: "philemon",
  HEB: "hebrews",
  JAS: "james",
  "1PE": "1peter",
  "2PE": "2peter",
  "1JN": "1john",
  "2JN": "2john",
  "3JN": "3john",
  JUD: "jude",
  REV: "revelation",
  GEN: "genesis",
  EXO: "exodus",
  LEV: "leviticus",
  NUM: "numbers",
  DEU: "deuteronomy",
  JOS: "joshua",
  JDG: "judges",
  RUT: "ruth",
  "1SA": "1samuel",
  "2SA": "2samuel",
  "1KI": "1kings",
  "2KI": "2kings",
  "1CH": "1chronicles",
  "2CH": "2chronicles",
  EZR: "ezra",
  NEH: "nehemiah",
  EST: "esther",
  JOB: "job",
  PSA: "psalms",
  PRO: "proverbs",
  ECC: "ecclesiastes",
  SNG: "songofsolomon",
  ISA: "isaiah",
  JER: "jeremiah",
  LAM: "lamentations",
  EZK: "ezekiel",
  DAN: "daniel",
  HOS: "hosea",
  JOL: "joel",
  AMO: "amos",
  OBA: "obadiah",
  JON: "jonah",
  MIC: "micah",
  NAM: "nahum",
  HAB: "habakkuk",
  ZEP: "zephaniah",
  HAG: "haggai",
  ZEC: "zechariah",
  MAL: "malachi",
};

// CUV API uses Traditional Chinese
const CN_TO_CUV: Record<string, string> = {
  马太福音: "馬太福音",
  马可福音: "馬可福音",
  路加福音: "路加福音",
  约翰福音: "約翰福音",
  使徒行传: "使徒行傳",
  罗马书: "羅馬書",
  哥林多前书: "哥林多前書",
  哥林多后书: "哥林多後書",
  加拉太书: "加拉太書",
  以弗所书: "以弗所書",
  腓立比书: "腓利比書",
  歌罗西书: "歌羅西書",
  帖撒罗尼迦前书: "帖撒羅尼迦前書",
  帖撒罗尼迦后书: "帖撒羅尼迦後書",
  提摩太前书: "提摩太前書",
  提摩太后书: "提摩太後書",
  提多书: "提多書",
  腓利门书: "腓利門書",
  希伯来书: "希伯來書",
  雅各书: "雅各書",
  彼得前书: "彼得前書",
  彼得后书: "彼得後書",
  约翰一书: "約翰壹書",
  约翰二书: "約翰貳書",
  约翰三书: "約翰參書",
  犹大书: "猶大書",
  启示录: "啟示錄",
  创世记: "創世紀",
  出埃及记: "出埃及記",
  利未记: "利未記",
  民数记: "民數記",
  申命记: "申命記",
  约书亚记: "約書亞記",
  士师记: "士師記",
  路得记: "路得記",
  撒母耳记上: "撒母耳記上",
  撒母耳记下: "撒母耳記下",
  列王纪上: "列王紀上",
  列王纪下: "列王紀下",
  历代志上: "歷代志上",
  历代志下: "歷代志下",
  以斯拉记: "以斯拉記",
  尼希米记: "尼希米記",
  以斯帖记: "以斯帖記",
  约伯记: "約伯記",
  诗篇: "詩篇",
  箴言: "箴言",
  传道书: "傳道書",
  雅歌: "雅歌",
  以赛亚书: "以賽亞書",
  耶利米书: "耶利米書",
  耶利米哀歌: "耶利米哀歌",
  以西结书: "以西結書",
  但以理书: "但以理書",
  何西阿书: "何西阿書",
  约珥书: "約珥書",
  阿摩司书: "阿摩司書",
  俄巴底亚书: "俄巴底亞書",
  约拿书: "約拿書",
  弥迦书: "彌迦書",
  那鸿书: "那鴻書",
  哈巴谷书: "哈巴谷書",
  西番雅书: "西番雅書",
  哈该书: "哈該書",
  撒迦利亚书: "撒迦利亞書",
  玛拉基书: "瑪拉基書",
};

// bookId -> apiName (English for some APIs)
const BOOK_ID_TO_API: Record<string, string> = {
  MAT: "Matthew",
  MRK: "Mark",
  LUK: "Luke",
  JHN: "John",
  ACT: "Acts",
  ROM: "Romans",
  "1CO": "1 Corinthians",
  "2CO": "2 Corinthians",
  GAL: "Galatians",
  EPH: "Ephesians",
  PHP: "Philippians",
  COL: "Colossians",
  "1TH": "1 Thessalonians",
  "2TH": "2 Thessalonians",
  "1TI": "1 Timothy",
  "2TI": "2 Timothy",
  TIT: "Titus",
  PHM: "Philemon",
  HEB: "Hebrews",
  JAS: "James",
  "1PE": "1 Peter",
  "2PE": "2 Peter",
  "1JN": "1 John",
  "2JN": "2 John",
  "3JN": "3 John",
  JUD: "Jude",
  REV: "Revelation",
  GEN: "Genesis",
  EXO: "Exodus",
  LEV: "Leviticus",
  NUM: "Numbers",
  DEU: "Deuteronomy",
  JOS: "Joshua",
  JDG: "Judges",
  RUT: "Ruth",
  "1SA": "1 Samuel",
  "2SA": "2 Samuel",
  "1KI": "1 Kings",
  "2KI": "2 Kings",
  "1CH": "1 Chronicles",
  "2CH": "2 Chronicles",
  EZR: "Ezra",
  NEH: "Nehemiah",
  EST: "Esther",
  JOB: "Job",
  PSA: "Psalms",
  PRO: "Proverbs",
  ECC: "Ecclesiastes",
  SNG: "Song of Solomon",
  ISA: "Isaiah",
  JER: "Jeremiah",
  LAM: "Lamentations",
  EZK: "Ezekiel",
  DAN: "Daniel",
  HOS: "Hosea",
  JOL: "Joel",
  AMO: "Amos",
  OBA: "Obadiah",
  JON: "Jonah",
  MIC: "Micah",
  NAM: "Nahum",
  HAB: "Habakkuk",
  ZEP: "Zephaniah",
  HAG: "Haggai",
  ZEC: "Zechariah",
  MAL: "Malachi",
};

export const BOOKS: BookSlugMap[] = BIBLE_META.map((m) => ({
  cn: m.book,
  slug: BOOK_ID_TO_SLUG[m.key] ?? m.key.toLowerCase(),
  apiName: BOOK_ID_TO_API[m.key] ?? m.book,
  bookId: m.key,
  cuvBook: CN_TO_CUV[m.book] ?? m.book,
}));

export function cnBookToSlug(cn: string): string | null {
  const found = BOOKS.find((b) => b.cn === cn);
  return found?.slug ?? null;
}

export function slugToApiName(slug: string): string | null {
  const found = BOOKS.find((b) => b.slug === slug);
  return found?.apiName ?? null;
}

export function slugToCnBook(slug: string): string | null {
  const found = BOOKS.find((b) => b.slug === slug);
  return found?.cn ?? null;
}

export function slugToBookId(slug: string): string | null {
  const found = BOOKS.find((b) => b.slug === slug);
  return found?.bookId ?? null;
}

/** CUV API 需繁体书名，用于 bible-api.com user-input API（备用） */
export function slugToCuvBook(slug: string): string | null {
  const found = BOOKS.find((b) => b.slug === slug);
  return found?.cuvBook ?? null;
}

export function buildBibleGatewayUrl(cnBook: string, chapter: number): string {
  const search = `${cnBook} ${chapter}`;
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(search)}&version=CUVS`;
}
