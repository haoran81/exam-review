# Stream D 施工图纸：统计面板 + 错题本 + 导入

> 复制本指令的全部内容，粘贴到新 Claude Code 窗口中执行。

## 任务

创建统计面板首页、错题本、导入页面。连同 Stream A/C 完成后一起集成到 App.tsx。

## 你的输出（共 5 个文件）

1. `src/components/stats/StatsDashboard.tsx`
2. `src/components/stats/ProgressChart.tsx`
3. `src/components/stats/CategoryBreakdown.tsx`
4. `src/components/review/WrongAnswerList.tsx`
5. `src/components/questions/QuestionImporter.tsx`

注：`QuestionCard` 已存在于 `src/components/questions/QuestionCard.tsx`，直接 import 即可。

## 公共接口速查

```ts
// 统计 hooks
import { useOverallStats, useCategoryAccuracy } from '../../hooks/useStats';
// useOverallStats() → { totalQuestions, totalSessions, totalAnswers, totalCorrect, accuracy, wrongCount }
// useCategoryAccuracy() → { category, total, correct, accuracy }[]

// 错题 hook
import { useWrongQuestions, useSessionHistory } from '../../hooks/useStudy';
// useWrongQuestions() → Question[] （所有答错的题，去重）
// useSessionHistory(limit) → { session, questions }[]

// 题库 hooks
import { useQuestions, useQuestionActions } from '../../hooks/useQuestions';

// 导入工具
import { parseImportJSON } from '../../utils/importParser';
import { exportAllQuestions, downloadJSON } from '../../utils/exportUtils';

// 类型
import type { Question, ImportResult } from '../../types';

// 共享组件
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { QuestionCard } from '../questions/QuestionCard'; // 已存在
```

## 文件 1: StatsDashboard.tsx

首页统计面板。

```tsx
// 从 useOverallStats() 获取数据
// 从 useCategoryAccuracy() 获取分类数据

// 布局（Tailwind，移动优先）：
// - 顶部：问候语 "👋 今天也要加油！"
// - 4 个统计卡片（2x2 网格）：
//   题目总数 | 练习次数 | 正确率 | 错题数
//   每个卡片：数字大号字体 + 标签小字，indigo 背景
// - 正确率条：ProgressChart 组件（大号进度环）
// - 分类准确率：CategoryBreakdown 组件
// - 最近练习历史：从 useSessionHistory(5) 获取
//   每条：时间 + 题数 + 正确数
// - 底部：快捷操作按钮
//   "开始刷题" → navigate('/study')
//   "导入题库" → navigate('/questions/import')
//   "备份导出" → exportAllQuestions() → downloadJSON()

// 空状态（无题目时）：
//   显示 EmptyState: "还没有题目，先导入或创建题目开始学习吧"
//   按钮：新建题目 / 导入题目
```

## 文件 3: ProgressChart.tsx

正确率可视化。

```tsx
// Props:
interface ProgressChartProps {
  accuracy: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

// 用纯 CSS 画圆环进度：
// - 两个半圆 + 旋转，或直接用 conic-gradient
// - 最简单：一个圆形 div，border，用 conic-gradient
//   例: background: conic-gradient(#4f46e5 ${accuracy}%, #e2e8f0 0)
//   中间镂空显示百分比数字
// - size sm=80px, md=120px, lg=160px
// - 颜色：accuracy >= 80 green, >= 50 indigo, < 50 amber
```

## 文件 4: CategoryBreakdown.tsx

各分类的正确率排行。

```tsx
// Props:
interface CategoryBreakdownProps {
  data: { category: string; total: number; correct: number; accuracy: number }[];
}

// 按 accuracy 升序排列（最差的在最上面）
// 每个分类一行：[分类名] [正确率进度条] [百分比]
// 进度条颜色同上：>=80 green, >=50 indigo, <50 amber
// 空状态：显示 "暂无练习数据"
```

## 文件 5: WrongAnswerList.tsx

错题本列表。

```tsx
// 从 useWrongQuestions() 获取错题
// 如果为空：EmptyState icon="🎉" title="没有错题" description="继续保持！"
// 列表：每个错题用 QuestionCard 渲染（showActions=false）
// 顶部操作栏：
//   "复习错题" 按钮 → navigate('/review/study')
//   "清空记录" 按钮（删除所有 studySessions，让错题变空）→ ConfirmDialog

// 复习按钮在错题为空时 disabled
```

## 文件 6: QuestionImporter.tsx

JSON 导入页面。

```tsx
// 状态：
const [jsonText, setJsonText] = useState('');
const [result, setResult] = useState<ImportResult | null>(null);
const { bulkAdd } = useQuestionActions();
const navigate = useNavigate();

// 布局（Tailwind）：
// - 说明文字：支持 JSON 格式导入，格式参考下方示例
// - 大文本域（textarea, 至少 10 行, font-mono）
// - "解析验证" 按钮
// - 验证结果区：
//   成功：显示 "检测到 N 道题目，格式正确" + 题目预览列表
//   失败：红色错误列表，显示具体哪些题有什么问题
// - "确认导入" 按钮（验证通过后才可用）
//   导入后跳转到 /questions

// 导入示例（放在可折叠的 details/summary 中）：
{
  "version": 1,
  "exportedAt": 1700000000000,
  "questions": [
    {
      "id": "abc123",
      "type": "single-choice",
      "category": "JavaScript",
      "tags": ["闭包"],
      "prompt": "以下关于闭包的描述正确的是？",
      "explanation": "闭包是指函数能访问其外部作用域中的变量...",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctIndex": 2,
      "createdAt": 1700000000000,
      "updatedAt": 1700000000000
    }
  ]
}

// 也支持从文件导入：
// <input type="file" accept=".json" onChange={读取文件内容到 jsonText} />
```

## 收尾：更新 App.tsx

编辑 `src/App.tsx`：

```tsx
import { StatsDashboard } from './components/stats/StatsDashboard';
import { WrongAnswerList } from './components/review/WrongAnswerList';
import { QuestionImporter } from './components/questions/QuestionImporter';

// 替换路由占位：
// <Route path="/" element={<StatsDashboard />} />
// <Route path="/questions/import" element={<QuestionImporter />} />
// <Route path="/review" element={<WrongAnswerList />} />
```

## 验证

完成后运行 `npx tsc -b` 确认无类型错误。
