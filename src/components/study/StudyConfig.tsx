import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useStartStudy } from '../../hooks/useStudy';
import { useCategories } from '../../hooks/useQuestions';
import { Button } from '../shared/Button';
import { EmptyState } from '../shared/EmptyState';
import type { QuestionType } from '../../types';

const TYPE_OPTIONS: { value: QuestionType; label: string; icon: string }[] = [
  { value: 'single-choice', label: '单选', icon: '🔘' },
  { value: 'multi-choice', label: '多选', icon: '☑️' },
  { value: 'fill-in-blank', label: '填空', icon: '✍️' },
  { value: 'short-answer', label: '简答', icon: '📝' },
];

type StudyRange = 'all' | 'category' | 'wrong';

export function StudyConfig() {
  const navigate = useNavigate();
  const startStudy = useStartStudy();

  const [range, setRange] = useState<StudyRange>('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([]);

  const categories = useCategories();

  // 检查题库是否为空
  const totalQuestions = useLiveQuery(() => db.questions.count(), []) ?? 0;

  // 检查是否有错题
  const wrongCount = useLiveQuery(async () => {
    const sessions = await db.studySessions.toArray();
    const wrongIds = new Set<string>();
    for (const s of sessions) {
      for (const a of s.answers) {
        if (!a.isCorrect) wrongIds.add(a.questionId);
      }
    }
    return wrongIds.size;
  }, []) ?? 0;

  const hasWrongQuestions = wrongCount > 0;

  // 切换范围时清理分类选择
  useEffect(() => {
    if (range !== 'category') {
      setSelectedCategory('');
    }
  }, [range]);

  const toggleType = (type: QuestionType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const success = await startStudy({
        source: range === 'wrong' ? 'wrong' : 'all',
        category: range === 'category' ? selectedCategory : undefined,
        reviewMode,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
      });
      if (!success) {
        // startStudy 内部已处理空题库情况，但 false 表示没题目
        // 这个情况理论上不会走到（UI 已禁用），但做个兜底
      }
    } finally {
      setIsStarting(false);
    }
  };

  if (totalQuestions === 0) {
    return (
      <EmptyState
        icon="📚"
        title="还没有题目"
        description="先创建或导入题目才能开始刷题"
        action={{
          label: '新建题目',
          onClick: () => navigate('/questions/new'),
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
          开始刷题
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8">
          选择刷题范围，定制你的练习计划
        </p>

        {/* 范围选择 */}
        <div className="space-y-3 mb-8">
          <button
            type="button"
            onClick={() => setRange('all')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-colors cursor-pointer
              ${range === 'all'
                ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
          >
            <div className="font-semibold text-slate-800 text-base">📦 全部题目</div>
            <div className="text-sm text-slate-500 mt-0.5">题库中所有 {totalQuestions} 道题</div>
          </button>

          <button
            type="button"
            onClick={() => setRange('category')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-colors cursor-pointer
              ${range === 'category'
                ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
          >
            <div className="font-semibold text-slate-800 text-base">🏷️ 按分类筛选</div>
            <div className="text-sm text-slate-500 mt-0.5">选择特定分类进行针对性练习</div>
          </button>

          {/* 分类下拉 */}
          {range === 'category' && (
            <div className="pl-2 animate-in fade-in">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg
                  text-slate-800 bg-white
                  focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none
                  transition-colors"
              >
                <option value="">选择分类...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            disabled={!hasWrongQuestions}
            onClick={() => setRange('wrong')}
            className={`w-full p-4 rounded-xl border-2 text-left transition-colors
              ${!hasWrongQuestions ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${range === 'wrong'
                ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
          >
            <div className="font-semibold text-slate-800 text-base">
              🔄 只刷错题
              {!hasWrongQuestions && (
                <span className="text-xs text-slate-400 ml-2">（暂无错题）</span>
              )}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">
              {hasWrongQuestions ? `${wrongCount} 道待复习的错题` : '错题本为空'}
            </div>
          </button>
        </div>

        {/* 题型筛选 */}
        <div className="mb-6 p-4 rounded-xl border-2 border-slate-200 bg-white">
          <div className="font-semibold text-slate-800 text-sm mb-3">📋 题型筛选（不选=全部）</div>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleType(t.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors min-h-[40px]
                  ${selectedTypes.includes(t.value)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 背题模式开关 */}
        <div className="mb-6 p-4 rounded-xl border-2 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800 text-sm">📖 背题模式</div>
              <div className="text-xs text-slate-500 mt-0.5">填空和简答题直接显示答案，无需输入</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reviewMode}
              onClick={() => setReviewMode(!reviewMode)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors
                ${reviewMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition-transform
                  ${reviewMode ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* 开始按钮 */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={
            isStarting ||
            (range === 'category' && !selectedCategory) ||
            (range === 'wrong' && !hasWrongQuestions)
          }
          onClick={handleStart}
        >
          {isStarting ? '加载中...' : '开始刷题'}
        </Button>
      </div>
    </div>
  );
}
