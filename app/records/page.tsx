"use client";

import { useState } from "react";
import { useDailyRecords } from "@/src/hooks/useDailyRecords";
import Calendar from "@/components/Calendar";
import DayDetail from "@/components/DayDetail";

export default function RecordsPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { checkedInDates, getRecordFor, mounted } = useDailyRecords();

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const selectedRecord = selectedDate ? getRecordFor(selectedDate) : null;

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 pb-24">
        <div className="mx-auto max-w-xl">
          <p className="text-gray-500">加载中…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-xl font-semibold">记录</h1>

        <Calendar
          year={year}
          month={month}
          completedDates={checkedInDates}
          onDayClick={setSelectedDate}
        />

        {selectedDate && (
          <DayDetail
            dateISO={selectedDate}
            record={selectedRecord}
          />
        )}
      </div>
    </main>
  );
}
