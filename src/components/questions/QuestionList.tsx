import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuestionType } from '../../types';
import { useQuestions, useCategories, useQuestionActions } from '../../hooks/useQuestions';
import { Button } from '../shared/Button';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { EmptyState } from '../shared/EmptyState';
import { QuestionCard } from './QuestionCard';

const typeOptions: { value: QuestionType; label: string }[] = [
  { value: 'single-choice', label: '单选题' },
  { value: 'multi-choice', label: '多选题' },
  { value: 'fill-in-blank', label: '填空题' },
  { value: 'short-answer', label: '简答题' },
];

export function QuestionList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<QuestionType | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const questions = useQuestions({
    search: search || undefined,
    type: filterType || undefined,
    category: filterCategory || undefined,
  });
  const categories = useCategories();
  const { remove, removeAll } = useQuestionActions();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold text-slate-900">题库</h1>

      {/* 顶部操作栏 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索题目、分类或标签…"
            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        </div>
        <Button size="md" onClick={() => navigate('/questions/new')}>＋ 新建</Button>
        <Button variant="secondary" size="md" onClick={() => navigate('/questions/import')}>📥 导入</Button>
      </div>

      {/* 筛选栏（可折叠） */}
      <div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          {showFilters ? '收起筛选 ▲' : '展开筛选 ▼'}
        </button>
        {showFilters && (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">分类</label>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">全部分类</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">题型</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as QuestionType | '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="">全部题型</option>
                {typeOptions.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 题目列表 */}
      {questions.length === 0 ? (
        <EmptyState
          icon="📚"
          title="还没有题目"
          description="点击右上角新建或导入题目"
          action={{ label: '新建题目', onClick: () => navigate('/questions/new') }}
        />
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              onEdit={(id) => navigate(`/questions/${id}/edit`)}
              onDelete={(id) => remove(id)}
            />
          ))}
        </div>
      )}

      {/* 底部：清空题库 */}
      {questions.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <Button variant="danger" size="md" onClick={() => setConfirmClear(true)}>
            清空题库
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={removeAll}
        title="清空题库"
        message="此操作将删除所有题目和关联的统计记录，不可恢复。确定继续？"
        confirmLabel="清空"
        danger
      />
    </div>
  );
}
