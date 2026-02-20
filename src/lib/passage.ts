// src/lib/passage.ts

export type Verse = { verse: number; text: string };

export type Passage = {
  reference: string;
  verses: Verse[];
  rawText: string;
};

type BibleApiVerse = { verse?: number; text?: string };
type BibleApiResponse = {
  reference?: string;
  verses?: BibleApiVerse[];
  text?: string;
  error?: string;
};

/**
 * CUV 经文拉取：使用 bible-api.com parameterized API
 * @param bookId - 书卷 ID（MAT, MRK, LUK, JHN, ACT）
 * @param chapter - 章号
 */
export async function fetchPassageCuv(
  bookId: string,
  chapter: number
): Promise<Passage> {
  const url = `https://bible-api.com/data/cuv/${bookId}/${chapter}`;

  const res = await fetch(url, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    const status = res.status;
    const body = await res.text();
    const bodyPreview = body.slice(0, 300);
    throw new Error(`bible-api error ${status}: ${bodyPreview}`);
  }

  let data: BibleApiResponse;
  try {
    data = (await res.json()) as BibleApiResponse;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`JSON 解析失败: ${msg}`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  const verses: Verse[] = Array.isArray(data.verses)
    ? data.verses
        .map((v) => ({
          verse: v.verse ?? 0,
          text: (v.text ?? "").trim(),
        }))
        .filter((v) => v.text || v.verse)
    : [];

  let rawText: string;
  if (data.text && data.text.trim()) {
    rawText = data.text.trim();
  } else if (verses.length > 0) {
    rawText = verses.map((v) => (v.text ?? "").trim()).filter(Boolean).join("\n");
  } else {
    throw new Error("Empty passage text");
  }

  return {
    reference: data.reference ?? `${bookId} ${chapter}`,
    verses,
    rawText,
  };
}
