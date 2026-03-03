"use client";

type Props = {
  year: number;
  month: number;
  completedDates: string[];
  onDayClick: (dateISO: string) => void;
};

export default function Calendar({
  year,
  month,
  completedDates,
  onDayClick,
}: Props) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];
  const completedSet = new Set(completedDates);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-gray-700">
        {year} 年 {month + 1} 月
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {weekDays.map((w) => (
          <div key={w} className="text-xs text-gray-500">
            {w}
          </div>
        ))}
        {calendarDays.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isCompleted = completedSet.has(iso);
          return (
            <div key={iso} className="flex h-8 items-center justify-center">
              <button
                type="button"
                onClick={() => onDayClick(iso)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  isCompleted
                    ? "bg-green-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {d}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
