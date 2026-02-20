"use client";

import { getDynamicQuestions } from "@/src/lib/questions";

type Props = {
  dateISO: string;
  cnBook: string;
  chapter: number;
  passageText?: string;
};

export default function QuestionsClient({
  dateISO,
  cnBook,
  chapter,
  passageText,
}: Props) {
  const refs = [{ book: cnBook, chapter }];
  const questions = getDynamicQuestions(dateISO, refs, passageText);

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="text-sm text-gray-500">今日灵修问题</div>
      {questions.length > 0 ? (
        <ol className="mt-2 list-decimal space-y-3 pl-5">
          {questions.map((q, i) => (
            <li key={`${q.aspect}-${i}`} className="text-base">
              {q.text}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-sm text-gray-500">今日无阅读安排</p>
      )}
    </section>
  );
}
