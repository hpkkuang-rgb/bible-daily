# Hub1 V2 改动总览

## 一、改动总览（新增/修改文件）

### 新增
- `src/lib/records.ts` - DailyRecord v2 存储 + v1 迁移
- `src/hooks/useDailyRecords.ts` - 打卡记录 Hook
- `src/hooks/useFontPreference.ts` - 字号偏好 Hook
- `components/BottomNav.tsx` - 底部导航
- `components/Calendar.tsx` - 日历组件
- `components/DayDetail.tsx` - 日期详情
- `components/ResponseInput.tsx` - 我的回应输入
- `components/FontSizeControl.tsx` - 字号控制
- `components/SocialFeedPreview.tsx` - 今日完成打卡的朋友（mock）
- `app/records/page.tsx` - 记录页
- `app/me/page.tsx` - 我的页
- `app/read/[book]/[chapter]/ReadContentClient.tsx` - 内容页回应+完成+字号

### 修改
- `app/page.tsx` - 首页简化，移除统计，新增 SocialFeedPreview
- `app/layout.tsx` - 添加 BottomNav
- `app/read/[book]/[chapter]/page.tsx` - 移除 QuestionsClient，使用 ReadContentClient
- `app/read/[book]/[chapter]/ReaderShellClient.tsx` - 集成字号
- `app/history/page.tsx` - 重定向到 /records

### 可删除（可选）
- `app/read/[book]/[chapter]/CompleteButtonClient.tsx` - 已由 ReadContentClient 替代
- `app/read/[book]/[chapter]/QuestionsClient.tsx` - 已移除

---

## 二、分步实现顺序（建议 commit）

1. **Commit 1**: 存储层 + 迁移
   - `src/lib/records.ts`
   - `src/hooks/useDailyRecords.ts`
   - `src/hooks/useFontPreference.ts`

2. **Commit 2**: 内容页调整
   - `components/ResponseInput.tsx`
   - `components/FontSizeControl.tsx`
   - `app/read/[book]/[chapter]/ReadContentClient.tsx`
   - 修改 `ReaderShellClient.tsx`、`page.tsx`

3. **Commit 3**: 底部导航 + 布局
   - `components/BottomNav.tsx`
   - 修改 `app/layout.tsx`

4. **Commit 4**: 首页重构
   - 修改 `app/page.tsx`

5. **Commit 5**: 记录页
   - `components/Calendar.tsx`
   - `components/DayDetail.tsx`
   - `app/records/page.tsx`
   - 修改 `app/history/page.tsx` 重定向

6. **Commit 6**: 我的页
   - `app/me/page.tsx`

7. **Commit 7**: 社交预览
   - `components/SocialFeedPreview.tsx`
   - 首页引入

---

## 三、关键代码

### DailyRecord 结构
```ts
type DailyRecord = {
  date: string;           // YYYY-MM-DD
  checkedIn: boolean;
  response?: string;
  scriptureRef?: string;
  updatedAt: number;
};
```

### Storage Keys
- `bible_daily_records_v2` - 新记录
- `bible_font_pref` - 字号偏好 (small | medium | large)

### 路由
- `/` - 首页
- `/records` - 记录（原 /history 重定向至此）
- `/me` - 我的
- `/read/[book]/[chapter]` - 内容页

---

## 四、手动测试清单

- [ ] **首页**
  - [ ] 今日日期、本周计划、今日阅读两章显示正确
  - [ ] 点击章节进入内容页
  - [ ] 完成两章后「我已读完，打卡」可点
  - [ ] 打卡后显示「今日已完成」
  - [ ] 昨天补打正常
  - [ ] 底部「今日完成打卡的朋友」显示，点击 ❤️ 数字+1、提示出现

- [ ] **内容页**
  - [ ] 经文、摘要、灵修思考显示
  - [ ] 「我的回应」textarea 可输入
  - [ ] 点击「读完打卡」保存 response + scriptureRef
  - [ ] 字号 A- / A / A+ 切换生效
  - [ ] 字号偏好刷新后保持
  - [ ] 跳到第2章、跳回首页、补打昨天链接正常

- [ ] **底部导航**
  - [ ] 首页 / 记录 / 我的 高亮正确
  - [ ] 点击跳转正常

- [ ] **记录页 /records**
  - [ ] 日历显示，已完成日期实心、未完成空心
  - [ ] 点击日期显示详情（日期、经文、回应、是否完成）
  - [ ] 切换「仅已完成」「全部日期」列表正确

- [ ] **我的页 /me**
  - [ ] 有回应时按时间倒序显示
  - [ ] 无记录时显示「你还没有写下回应」

- [ ] **迁移**
  - [ ] 有 v1 数据时，首次加载自动迁移到 v2

---

## 五、创建分支

```bash
git checkout -b feature/hub1-v2
# 若遇 Xcode 许可，先执行: sudo xcodebuild -license
```
