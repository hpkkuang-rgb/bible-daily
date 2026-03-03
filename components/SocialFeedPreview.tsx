"use client";

import { useState } from "react";

export type SocialItem = {
  id: string;
  name: string;
  likes: number;
};

const MOCK_ITEMS: SocialItem[] = [
  { id: "1", name: "Anna", likes: 12 },
  { id: "2", name: "David", likes: 4 },
  { id: "3", name: "Grace", likes: 9 },
];

export default function SocialFeedPreview() {
  const [items, setItems] = useState<SocialItem[]>(MOCK_ITEMS);
  const [toast, setToast] = useState<string | null>(null);

  const handleLike = (item: SocialItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, likes: i.likes + 1 } : i
      )
    );
    setToast(`你鼓励了 ${item.name}！`);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-gray-700">
        今日完成打卡的朋友
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
          >
            <span className="text-base text-gray-800">{item.name}</span>
            <button
              type="button"
              onClick={() => handleLike(item)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-rose-500 hover:bg-rose-50"
            >
              <span>❤️</span>
              <span>{item.likes}</span>
            </button>
          </li>
        ))}
      </ul>
      {toast && (
        <p className="mt-3 text-center text-sm text-sky-600">{toast}</p>
      )}
    </section>
  );
}
