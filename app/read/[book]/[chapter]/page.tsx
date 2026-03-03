// app/read/[book]/[chapter]/page.tsx
import Link from "next/link";
import {
  slugToCnBook,
  slugToApiName,
  slugToBookId,
  cnBookToSlug,
  buildBibleGatewayUrl,
} from "@/src/lib/bookMap";
import {
  getReadingForDate,
  getNextReadingDateISO,
  getPrevReadingDateISO,
} from "@/src/lib/plan";
import { getPrevChapter, getNextChapter } from "@/src/lib/navigation";
import { fetchPassageCuv } from "@/src/lib/passage";
import {
  generateDevotionFromText,
  generateFallbackDevotion,
} from "@/src/lib/devotionFromText";
import ReaderShellClient from "./ReaderShellClient";
import ReadContentClient from "./ReadContentClient";
import { FontSizeProvider } from "@/src/contexts/FontSizeContext";

type Props = {
  params: Promise<{ book: string; chapter: string }>;
  searchParams: Promise<{ date?: string; idx?: string }>;
};

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function ReadPage({ params, searchParams }: Props) {
  const { book: bookSlug, chapter } = await params;
  const { date, idx } = await searchParams;

  const cnBook = slugToCnBook(bookSlug);
  const apiBook = slugToApiName(bookSlug);
  const bookId = slugToBookId(bookSlug);
  const chapterNum = parseInt(chapter, 10) || 1;
  const idxNum = idx === "2" ? 2 : 1;

  const dateISO = date ?? toISODate(new Date());
  const todayISO = toISODate(new Date());
  const readingForDate = getReadingForDate(dateISO);
  const ref1 = readingForDate.items[0];
  const ref2 = readingForDate.items[1];
  const slug2 = ref2 ? cnBookToSlug(ref2.book) : null;
  const jumpToCh2Href =
    ref2 && slug2 && idxNum !== 2
      ? `/read/${slug2}/${ref2.chapter}?date=${dateISO}&idx=2`
      : null;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = toISODate(yesterday);
  const yesterdayReading = getReadingForDate(yesterdayISO);
  const yesterdayRef1 = yesterdayReading.items[0];
  const yesterdaySlug = yesterdayRef1 ? cnBookToSlug(yesterdayRef1.book) : null;
  const yesterdayHref =
    yesterdaySlug && yesterdayRef1
      ? `/read/${yesterdaySlug}/${yesterdayRef1.chapter}?date=${yesterdayISO}&idx=1`
      : null;

  const bibleGatewayUrl = cnBook
    ? buildBibleGatewayUrl(cnBook, chapterNum)
    : "https://www.biblegateway.com/";

  if (!cnBook || !apiBook || !bookId) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 pb-24">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回首页
          </Link>
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-gray-600">
              未找到该书卷：{bookSlug}，请返回首页或前往 BibleGateway 阅读。
            </p>
            <a
              href="https://www.biblegateway.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              前往 BibleGateway →
            </a>
          </div>
        </div>
      </main>
    );
  }

  let passage: Awaited<ReturnType<typeof fetchPassageCuv>> | null = null;
  let fetchError: string | null = null;
  let devotion: { summary: string; reflection: string | string[] };

  try {
    passage = await fetchPassageCuv(bookId, chapterNum);
    devotion = generateDevotionFromText({
      cnBook,
      chapter: chapterNum,
      text: passage.rawText || "本章经文",
      bookKey: bookId,
    });
  } catch (e) {
    passage = null;
    fetchError = e instanceof Error ? e.message : String(e);
    devotion = generateFallbackDevotion({
      cnBook,
      chapter: chapterNum,
      bookKey: bookId,
    });
  }

  const prevTarget = getPrevChapter(bookSlug, chapterNum);
  const nextTarget = getNextChapter(bookSlug, chapterNum);
  const slug1 = ref1 ? cnBookToSlug(ref1.book) : null;
  const prevIsRef1 =
    prevTarget && ref1 &&
    cnBookToSlug(ref1.book) === prevTarget.slug &&
    ref1.chapter === prevTarget.chapter;
  const prevIsRef2 =
    prevTarget && ref2 &&
    cnBookToSlug(ref2.book) === prevTarget.slug &&
    ref2.chapter === prevTarget.chapter;
  const nextIsRef2 =
    nextTarget && ref2 && slug2 &&
    nextTarget.slug === slug2 &&
    nextTarget.chapter === ref2.chapter;
  const nextIsRef1 =
    nextTarget && ref1 && slug1 &&
    nextTarget.slug === slug1 &&
    nextTarget.chapter === ref1.chapter;

  const prevDateISO = prevIsRef1 || prevIsRef2 ? dateISO : getPrevReadingDateISO(dateISO);
  const nextDateISO = nextIsRef1 || nextIsRef2 ? dateISO : getNextReadingDateISO(dateISO);
  const prevIdx: 1 | 2 = prevIsRef1 ? 1 : prevIsRef2 ? 2 : 1;
  const nextIdx: 1 | 2 = nextIsRef2 ? 2 : nextIsRef1 ? 1 : 1;

  const prev =
    prevTarget
      ? {
          slug: prevTarget.slug,
          chapter: prevTarget.chapter,
          dateISO: prevDateISO,
          idx: prevIdx,
        }
      : null;
  const next =
    nextTarget
      ? {
          slug: nextTarget.slug,
          chapter: nextTarget.chapter,
          dateISO: nextDateISO,
          idx: nextIdx,
        }
      : null;

  const passageContent =
    passage && passage.verses.length > 0 ? (
      <div className="space-y-2 py-4">
        {passage.verses.map((v) => (
          <p key={v.verse} className="leading-relaxed text-gray-800 [font-size:inherit]">
            <strong className="font-semibold text-gray-900">{v.verse}</strong>{" "}
            {v.text}
          </p>
        ))}
      </div>
    ) : passage && passage.rawText ? (
      <div className="whitespace-pre-wrap py-4 leading-relaxed text-gray-800 [font-size:inherit]">
        {passage.rawText}
      </div>
    ) : (
      <div className="rounded-xl bg-amber-50 p-6 text-amber-800">
        <p className="mb-4">正文暂时无法加载</p>
        {fetchError && (
          <details className="mb-4 text-sm">
            <summary className="cursor-pointer">调试信息</summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-xs">
              {fetchError}
            </pre>
          </details>
        )}
        <a
          href={bibleGatewayUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-xl bg-amber-200 px-4 py-2 text-sm hover:bg-amber-300"
        >
          打开 BibleGateway 和合本 ↗
        </a>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-32 sm:p-6 sm:pb-24">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回首页
          </Link>
          <span className="text-sm text-gray-500">
            今天阅读进度（2 章）：第 {idxNum}/2 章
          </span>
        </div>

        <FontSizeProvider>
          <ReaderShellClient
            dateISO={dateISO}
            idx={idxNum as 1 | 2}
            slug={bookSlug}
            cnBook={cnBook}
            chapter={chapterNum}
            prev={prev}
            next={next}
          >
            {passageContent}
          </ReaderShellClient>

          <section className="rounded-2xl bg-white p-5 shadow-sm space-y-3 sm:p-6">
            <div className="text-sm text-gray-500">今日经文摘要</div>
            <p className="text-base">{devotion.summary}</p>
            <div className="text-sm text-gray-500 pt-2">信徒灵修思考</div>
            {Array.isArray(devotion.reflection) ? (
              <div className="space-y-2">
                {devotion.reflection.map((line, i) => (
                  <p key={i} className="text-base text-gray-700">
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-base text-gray-700">{devotion.reflection}</p>
            )}
          </section>

          <ReadContentClient
            dateISO={dateISO}
            idx={idxNum as 1 | 2}
            jumpToCh2Href={jumpToCh2Href}
            yesterdayHref={dateISO === todayISO ? yesterdayHref : null}
          />
        </FontSizeProvider>
      </div>
    </main>
  );
}
