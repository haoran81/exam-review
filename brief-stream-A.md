# Stream A 施工图纸：题库管理（CRUD）

> 复制本指令的全部内容，粘贴到新 Claude Code 窗口中执行。

## 任务

创建题目编辑器（新建/编辑）和题目列表页面。完成后替换 `src/App.tsx` 中的占位组件。

## 你的输出（共 3 个文件）

1. `src/components/questions/QuestionTypeSelector.tsx`
2. `src/components/questions/QuestionEditor.tsx`
3. `src/components/questions/QuestionList.tsx`

## 公共接口速查（已存在，直接 import）

```ts
// 类型
import type { Question, QuestionType, SingleChoiceQuestion, MultiChoiceQuestion, FillInBlankQuestion, ShortAnswerQuestion } from '../../types';

// 数据库操作
import { useQuestions, useQuestion, useCategories, useQuestionActions } from '../../hooks/useQuestions';

// ID 生成
import { generateId } from '../../utils/idGenerator';

// 共享组件（已存在）
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { EmptyState } from '../shared/EmptyState';
import { TagInput } from '../shared/TagInput';
import { QuestionCard } from '../questions/QuestionCard'; // 已存在
```

## 文件 1: QuestionTypeSelector.tsx

选择题目类型的组件。

```tsx
// 显示 4 个卡片：单选题、多选题、填空题、简答题
// Props:
interface QuestionTypeSelectorProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
}

// 4 个选项的配置数组：
const types = [
  { value: 'single-choice', label: '单选题', icon: '🔘', desc: '从多个选项中选一个正确答案' },
  { value: 'multi-choice',  label: '多选题', icon: '☑️', desc: '从多个选项中选多个正确答案' },
  { value: 'fill-in-blank', label: '填空题', icon: '✍️', desc: '输入答案，自动比对判分' },
  { value: 'short-answer',  label: '简答题', icon: '📝', desc: '手动输入，自查对照' },
] as const;

// 渲染为横向排列的卡片（移动端 2x2 网格），选中态用 indigo 边框 + 浅 indigo 背景
```

## 文件 2: QuestionEditor.tsx

创建/编辑题目表单。根据 `questionType` 动态渲染不同字段。

```tsx
// 从 URL 获取编辑模式：如果路径是 /questions/:id/edit，则用 useParams 获取 id
// 如果是 /questions/new，则为新建模式

// 核心状态：
const [type, setType] = useState<QuestionType>('single-choice');
const [category, setCategory] = useState('');
const [tags, setTags] = useState<string[]>([]);
const [prompt, setPrompt] = useState('');
const [explanation, setExplanation] = useState('');
// 选择题特有
const [options, setOptions] = useState<string[]>(['', '']);
const [correctIndex, setCorrectIndex] = useState<number>(0);
const [correctIndices, setCorrectIndices] = useState<number[]>([]);
// 填空题特有
const [acceptableAnswers, setAcceptableAnswers] = useState<string[]>(['']);
const [caseSensitive, setCaseSensitive] = useState(false);
// 简答题特有
const [modelAnswer, setModelAnswer] = useState('');
const [keyPoints, setKeyPoints] = useState<string[]>([]);

// 编辑模式：用 useQuestion(id) 获取已有题目，填充表单
// 新增/编辑提交：用 useQuestionActions().create(data) 或 .update(id, data)
// 提交后用 useNavigate 跳转到 /questions

// 表单布局（Tailwind）：
// - 顶部：QuestionTypeSelector
// - 输入：分类（input）+ 标签（TagInput）
// - 输入：题干（textarea, 至少3行）
// - 根据 type 渲染不同选项区：
//   single-choice/multi-choice:
//     每个选项一行: [单选按钮/复选框] [选项文本输入] [删除按钮]
//     "添加选项" 按钮
//   fill-in-blank:
//     每个可接受答案一行: [输入框] [删除按钮]
//     "添加答案" 按钮
//     大小写敏感开关（toggle）
//   short-answer:
//     参考答案（textarea, 3行）
//     关键得分点（类似 TagInput, 每行一个, 回车添加）
// - 输入：解析（textarea, 2行, 答完题后显示的讲解）
// - 底部：保存按钮（Button variant="primary" size="lg"）
```

## 文件 3: QuestionList.tsx

题目列表页面，支持筛选和搜索。

```tsx
// 状态：
const [search, setSearch] = useState('');
const [filterType, setFilterType] = useState<QuestionType | ''>('');
const [filterCategory, setFilterCategory] = useState('');

// 数据：
const questions = useQuestions({
  search: search || undefined,
  type: filterType || undefined,
  category: filterCategory || undefined,
});
const categories = useCategories();
const { remove, removeAll } = useQuestionActions();
const navigate = useNavigate();

// 布局（Tailwind，移动优先）：
// - 顶部操作栏：
//   [搜索输入框] [新建按钮 → /questions/new] [导入按钮 → /questions/import]
// - 筛选栏（可选，用 collapsible）：
//   分类下拉（从 useCategories() 获取） + 题型下拉（4 种）
// - 题目列表（如果空则显示 EmptyState）：
//   每道题显示为一张卡片（QuestionCard）：
//     左侧：题型图标
//     中间：题干（最多2行截断）+ 分类标签 + 题型标签
//     右侧：编辑按钮 → /questions/:id/edit
// - 底部：清空题库按钮（危险操作，用 ConfirmDialog 确认）

// 如果没有任何题目，显示：
//   EmptyState icon="📚" title="还没有题目" description="点击右上角新建或导入题目" action={label: "新建题目", onClick: → /questions/new}
```

## 收尾：更新 App.tsx

编辑 `src/App.tsx`，把占位组件替换为真实组件：

```tsx
// 在文件顶部添加 import
import { QuestionList } from './components/questions/QuestionList';
import { QuestionEditor } from './components/questions/QuestionEditor';
// ...

// 替换路由中的占位：
// <Route path="/questions" element={<QuestionList />} />
// <Route path="/questions/new" element={<QuestionEditor />} />
// <Route path="/questions/:id/edit" element={<QuestionEditor />} />
```

## 验证

完成后运行 `npx tsc -b` 确认无类型错误，然后运行 `npm run dev` 在浏览器查看效果。
