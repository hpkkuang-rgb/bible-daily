"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HistoryRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/records");
  }, [router]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">跳转中…</p>
    </main>
  );
}
