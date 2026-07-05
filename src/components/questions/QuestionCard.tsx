import type { Question } from '../../types';

const typeIcons: Record<string, string> = {
  'single-choice': '🔘',
  'multi-choice': '☑️',
  'fill-in-blank': '✍️',
  'short-answer': '📝',
};

const typeLabels: Record<string, string> = {
  'single-choice': '单选',
  'multi-choice': '多选',
  'fill-in-blank': '填空',
  'short-answer': '简答',
};

interface QuestionCardProps {
  question: Question;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  onClick?: (id: string) => void;
}

export function QuestionCard({ question, onEdit, onDelete, showActions = true, onClick }: QuestionCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-colors
        hover:border-slate-300 cursor-pointer"
      onClick={() => onClick?.(question.id)}
    >
      {/* 头部：图标 + 标签 + 操作按钮 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{typeIcons[question.type] ?? '📄'}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {typeLabels[question.type] ?? question.type}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
            {question.category || '未分类'}
          </span>
        </div>
        {showActions && (
          <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            {onEdit && (
              <button
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center text-sm"
                onClick={() => onEdit(question.id)}
              >
                编辑
              </button>
            )}
            {onDelete && (
              <button
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center text-sm"
                onClick={() => onDelete(question.id)}
              >
                删除
              </button>
            )}
          </div>
        )}
      </div>

      {/* 题干 */}
      <p className="text-sm text-slate-800 line-clamp-2 mb-2">{question.prompt}</p>

      {/* 标签 */}
      {question.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {question.tags.map(tag => (
            <span key={tag} className="text-xs px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
