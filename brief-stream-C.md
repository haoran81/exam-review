# Stream C 施工图纸：刷题引擎

> 复制本指令的全部内容，粘贴到新 Claude Code 窗口中执行。

## 任务

创建完整的刷题流程：配置 → 答题 → 看解析 → 下一题 → 结果页。支持 4 种题型的答题交互。

## 你的输出（共 7 个文件）

1. `src/components/study/StudyConfig.tsx`
2. `src/components/study/StudyProgress.tsx`
3. `src/components/study/MultipleChoice.tsx`
4. `src/components/study/FillInBlank.tsx`
5. `src/components/study/ShortAnswer.tsx`
6. `src/components/study/AnswerReveal.tsx`
7. `src/components/study/SessionResults.tsx`

修改: `src/components/study/StudySession.tsx`（主控制器，组合以上所有组件）

## 公共接口速查

```ts
// Store — 刷题会话状态（最重要）
import { useStudyStore } from '../../stores/studyStore';
// 可用方法:
//   useStudyStore(s => s.phase)          → 'config' | 'answering' | 'reviewing' | 'finished'
//   useStudyStore(s => s.currentIndex)    → 当前第几题
//   useStudyStore(s => s.questions)       → 题目数组
//   useStudyStore(s => s.session)         → StudySession 对象
//   useStudyStore(s => s.currentQuestion()) → 当前题目对象
//   initSession(questions, source, category)
//   submitAnswer(answer)    → 判分 + 记录 + 切到 reviewing
//   markSelfCheck(correct)  → 简答题自查标记
//   nextQuestion()          → 下一题或完成
//   finishSession()
//   reset()

// Hooks
import { useStartStudy } from '../../hooks/useStudy';

// 判分逻辑
import { checkAnswer, isAutoGraded } from '../../utils/studyLogic';

// 类型
import type { Question, StudyAnswer } from '../../types';

// 共享组件
import { Button } from '../shared/Button';
import { EmptyState } from '../shared/EmptyState';
```

## 核心概念：StudyStore 的 phase 状态机

```
config → answering → reviewing → answering → reviewing → ... → finished
  ↑        ↑            ↑                                    (最后一题后)
  │        │            └─ 显示解析，用户点"下一题"后
  │        └─ 用户提交答案后
  └─ 用户选好配置点"开始"
```

## 文件 1: StudyConfig.tsx

刷题前的配置页面。

```tsx
// 功能：
// - 选择刷题范围：全部题目 / 按分类筛选 / 只刷错题
// - 如果选"按分类"，显示下拉选择框（从 db.questions 获取所有不重复的分类）
// - "开始刷题" 按钮

// 交互：
// - 点击开始后，调用 useStartStudy() 返回的函数
// - 如果题库为空，显示 EmptyState
// - 错题本为空时，"只刷错题"不可选（disabled）

// Props: 无（自包含，用 useStartStudy hook）
// 布局：居中卡片，选项用大按钮/卡片选择，移动端友好
```

## 文件 2: StudyProgress.tsx

答题进度条。

```tsx
// Props:
interface StudyProgressProps {
  current: number;   // 当前第几题（0-based）
  total: number;     // 总题数
}

// 渲染：细长进度条 + "第 3/20 题" 文字
// 样式：bg-slate-200 背景条 + bg-indigo-600 填充条，h-1.5 rounded
```

## 文件 3: MultipleChoice.tsx

单选/多选题答题组件。

```tsx
// Props:
interface MultipleChoiceProps {
  question: SingleChoiceQuestion | MultiChoiceQuestion;
  onAnswer: (selectedIndices: number[]) => void;
  disabled: boolean; // 已提交后禁用
  revealedCorrect?: boolean; // 复习模式：显示正确答案
}

// 单选：点击某个选项 → 高亮 → 自动提交（或加"确认"按钮）
// 多选：点击切换选中状态，加"提交"按钮（至少选1个才能提交）
// 样式：
//   - 每个选项一个大的可点击卡片，满宽
//   - 未选中：border-slate-200 bg-white
//   - 选中：border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500
//   - disabled 时正确项：border-green-500 bg-green-50
//   - disabled 时错误选中：border-red-500 bg-red-50
//   - 最小高度 52px，文字左对齐，左侧显示 A/B/C/D 圆形编号
```

## 文件 4: FillInBlank.tsx

填空题答题组件。

```tsx
// Props:
interface FillInBlankProps {
  question: FillInBlankQuestion;
  onAnswer: (text: string) => void;
  disabled: boolean;
}

// 一个大输入框（type="text", 自动聚焦）
// 输入后点"提交"或按回车提交
// 移动端：inputMode="text", autoComplete="off", 字号16px防iOS缩放
```

## 文件 5: ShortAnswer.tsx

简答题组件。

```tsx
// Props:
interface ShortAnswerProps {
  question: ShortAnswerQuestion;
  onAnswer: (text: string) => void;
  disabled: boolean;
}

// 大文本输入框（textarea, 至少4行）
// 提交按钮
// disabled 时显示 modelAnswer 和 keyPoints（在 AnswerReveal 中处理也可以）
```

## 文件 6: AnswerReveal.tsx

答完题后显示结果和解析。

```tsx
// Props:
interface AnswerRevealProps {
  question: Question;
  userAnswer: StudyAnswer;
  onNext: () => void;
  isLast: boolean;
}

// 顶部：✅ 正确 / ❌ 错误 大图标 + 文字
// 显示正确答案 vs 你的答案
// 显示 explanation（解析）
// 如果是简答题：显示 modelAnswer 和 keyPoints
//   额外：两个大按钮 "我答对了" ✅  /  "我答错了" ❌（markSelfCheck 但这里叫 onNext 前触发）
// 底部按钮：isLast ? "查看结果" : "下一题"
```

## 文件 7: SessionResults.tsx

完成所有题目后的结果页。

```tsx
// Props: 无（从 useStudyStore 获取数据）

// 显示：
// - 🎉 完成！
// - 正确率：X/Y (百分比)
// - 可视化的进度环：用 CSS 画一个圆形进度（border + conic-gradient 或简单的 bar）
// - 题目列表：每道题的缩略卡片（正确/错误标记 + 题干截断），点击可展开看详情
// - 底部按钮：
//   "再刷一次" → reset() → 回到 config
//   "错题复习" → 用 initSession 重新开始错题
//   "返回首页" → navigate('/')
```

## 文件（修改）: StudySession.tsx

主控制器——把以上组件串起来。

```tsx
// 从 useStudyStore 读取 phase
// phase === 'config'     → 渲染 <StudyConfig />
// phase === 'answering'  → 渲染 <StudyProgress /> + 根据 question.type 渲染对应答题组件
// phase === 'reviewing'  → 渲染 <AnswerReveal />
// phase === 'finished'   → 渲染 <SessionResults />

// 关键逻辑：
// - MultipleChoice 的 onAnswer 回调:
//     submitAnswer({ questionId, selectedIndices, questionType: question.type, textAnswer: undefined })
// - FillInBlank/ShortAnswer 的 onAnswer 回调:
//     submitAnswer({ questionId, textAnswer, questionType: question.type, selectedIndices: undefined })
// - AnswerReveal 的 onNext 回调:
//     如果是简答题, 先调 markSelfCheck(correct)
//     然后 nextQuestion()
//     （简答题在 AnswerReveal 中先让用户自己判断对错，点"下一题"前触发 markSelfCheck）

// 注意：phase !== 'config' 时，如果页面刷新 session 会丢失（store 在内存中）。
// 这是正常行为，刷新后回到 config 页面重新配置。
```

## 收尾：更新 App.tsx

编辑 `src/App.tsx`：

```tsx
import { StudySession } from './components/study/StudySession';
// 替换：
// <Route path="/study" element={<StudySession />} />
// <Route path="/review/study" element={<StudySession />} />
```

## 验证

完成后运行 `npx tsc -b` 确认无类型错误，然后 `npm run dev` 体验完整刷题流程。
