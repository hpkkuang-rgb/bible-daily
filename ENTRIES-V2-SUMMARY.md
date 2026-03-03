# 数据模型升级 v2.1：ReadingEntry 按章存储

## 1. 修改/新增文件清单

| 路径 | 说明 |
|-----|------|
| `src/lib/entries.ts` | **新增** ReadingEntry 类型、localStorage 读写、迁移逻辑、readingKey 生成 |
| `src/hooks/useDailyRecords.ts` | 改为使用 entries，新增 `markDateComplete`、`getEntryFor` |
| `app/read/[book]/[chapter]/ReadContentClient.tsx` | 按 readingKey 绑定 entry，独立保存每章回应 |
| `app/me/page.tsx` | 按 entry 列表展示：日期 + 经文 + 我的回应 |
| `components/DayDetail.tsx` | 展示当日多条 entries，每条有「查看当天内容」链接 |
| `app/page.tsx` | 使用 `markDateComplete` 替代 `saveRecord` |

## 2. 关键代码片段

### 数据类型与 localStorage schema

```ts
// ReadingEntry
type ReadingEntry = {
  id: string;           // `${date}__${readingKey}`
  date: string;         // YYYY-MM-DD
  readingKey: string;   // e.g. "ezekiel-37"
  scriptureRef: string; // e.g. "以西结书 37 章"
  checkedIn: boolean;
  response?: string;
  updatedAt: number;
};

// StorageKey: "bible_daily_entries_v1"
// 结构: Record<id, ReadingEntry>
```

### 迁移逻辑（旧 date 记录 -> entries）

```ts
// 从 bible_daily_records_v2 迁移
// 每条旧记录 -> 1 条 entry，readingKey="legacy"，保留 response/scriptureRef
```

### readingKey 生成方法

```ts
export function toReadingKey(ref: ReadingRef): string {
  const slug = cnBookToSlug(ref.book);
  return slug ? `${slug}-${ref.chapter}` : `legacy-${ref.book}-${ref.chapter}`;
}

export function getReadingKeyForIdx(dateISO: string, idx: 1|2, items: ReadingRef[]): string {
  const i = idx - 1;
  if (i >= 0 && i < items.length) return toReadingKey(items[i]);
  return `legacy-${dateISO}-${idx}`;
}
```

### 内容页绑定 entry

```ts
// ReadContentClient
const reading = getReadingForDate(dateISO);
const readingKey = getReadingKeyForIdx(dateISO, idx, reading.items);

useEffect(() => {
  const entry = getEntry(dateISO, readingKey);
  setResponse(entry?.response ?? "");
}, [mounted, dateISO, idx, readingKey]);

const handleComplete = () => {
  saveEntry({ date: dateISO, readingKey, scriptureRef, checkedIn: true, response: ... });
  markChapterCompleted(dateISO, idx);
};
```

### /me 页面渲染 entries

```ts
// 按 entry 列表展示，date 倒序
const entriesWithContent = entries.filter((e) => e.checkedIn);
{entriesWithContent.map((e) => (
  <article>
    <span>{e.date}</span>
    <div>{e.scriptureRef}</div>
    <div>{e.response || "（未填写）"}</div>
    <Link href={getHrefForEntry(e.date, e.readingKey)}>查看当日阅读 →</Link>
  </article>
))}
```

## 3. 手动测试 checklist

- [ ] 同一天两章分别填写回应 → 都能保存
- [ ] 刷新后两条都存在
- [ ] /me 页面显示两条不覆盖
- [ ] /records 点击日期能看到两条（仅已完成默认）
- [ ] 旧数据迁移后不丢（legacy entry 保留）
- [ ] 首页「今日已完成」打卡正常
- [ ] DayDetail 每条 entry 的「查看当天内容」跳转正确（带 date + idx）
