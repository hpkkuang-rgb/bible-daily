# Bug 修复总结 (feature/hub1-v2)

## 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `app/read/[book]/[chapter]/page.tsx` | 经文区域移除硬编码 text-base，改用 font-size:inherit；main 增加 pb-32 |
| `app/read/[book]/[chapter]/ReadContentClient.tsx` | response 按 dateISO+idx 初始化；idx=2 时清空；FontSizeControl 保留在底部 |
| `app/read/[book]/[chapter]/ReaderShellClient.tsx` | 增加 touch 手势；排除 textarea/input；阈值 60px |
| `components/DayDetail.tsx` | 链接改为按钮样式「查看当天内容」；无读经时显示提示 |
| `app/records/page.tsx` | 默认只看已完成；showAll 时不渲染全量日期列表 |

---

## 关键代码片段

### Bug 1：字号
```tsx
// page.tsx - 经文继承父级字号
<p className="leading-relaxed text-gray-800 [font-size:inherit]">

// ReadContentClient - FontSizeControl 在「我的回应」下方
<div className="mt-6 pt-4 border-t border-gray-200">
  <FontSizeControl size={size} onSizeChange={setSize} />
</div>
```

### Bug 2：日期跳转
```tsx
// DayDetail.tsx
{ref1 && slug ? (
  <Link href={`/read/${slug}/${ref1.chapter}?date=${dateISO}&idx=1`}
    className="mt-3 inline-flex items-center rounded-xl border border-sky-500 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100">
    查看当天内容 →
  </Link>
) : (
  <p className="mt-3 text-sm text-amber-600">该日暂无读经计划</p>
)}
```

### Bug 3：textarea 初始化
```tsx
// ReadContentClient.tsx
useEffect(() => {
  if (!mounted) return;
  setCompleted(isChapterCompleted(dateISO, idx));
  const r = getRecord(dateISO);
  setResponse(idx === 1 ? (r?.response ?? "") : "");
}, [mounted, dateISO, idx]);
```

### Bug 4：records 过滤
```tsx
// app/records/page.tsx
const listDates = showAll
  ? []  // 全部：不渲染列表，仅通过日历点选
  : checkedInDates.filter((d) => d.startsWith(monthPrefix));
```

### Bug 5：swipe 手势
```tsx
// ReaderShellClient.tsx
const SWIPE_THRESHOLD = 60;
const SWIPE_RATIO = 1.5;

function isEditableTarget(target) {
  return !!target?.closest?.("textarea, input, [contenteditable=true]");
}

// 同时监听 pointer + touch
onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY, e.target)}
onTouchEnd={(e) => { if (e.changedTouches[0]) handleEnd(...); }}
```

---

## 手动测试清单

### Bug 1：字号
- [ ] 内容页底部可见「字号」及 A- / A / A+ 按钮
- [ ] 切换 A- / A / A+ 时经文大小变化
- [ ] 刷新后字号偏好保持
- [ ] 移动端字号不被底部导航遮挡

### Bug 2：日期跳转
- [ ] /records 中点击某日期，DayDetail 显示「查看当天内容」按钮
- [ ] 点击后跳转到对应日期内容页（如 `/read/ezekiel/25?date=2026-02-19&idx=1`）
- [ ] 内容页展示该日期的读经内容

### Bug 3：回应初始化
- [ ] 第 1 章填写回应并完成，切换到第 2 章时 textarea 为空
- [ ] 切换日期（上一天/下一天）时，textarea 显示该日期的记录或为空

### Bug 4：records 过滤
- [ ] 默认显示「只看已完成」且列表仅包含已完成日期
- [ ] 切换「全部」时，列表不渲染全量日期（仅通过日历点选）

### Bug 5：swipe
- [ ] 在经文区域左滑可进入下一章
- [ ] 右滑可进入上一章
- [ ] 在 textarea 内滑动不会触发翻页
- [ ] iOS Safari 上手势可用
