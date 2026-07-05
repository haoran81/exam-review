import type { QuestionType } from '../../types';

interface QuestionTypeSelectorProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
}

const types = [
  { value: 'single-choice' as const, label: '单选题', icon: '🔘', desc: '从多个选项中选一个正确答案' },
  { value: 'multi-choice' as const, label: '多选题', icon: '☑️', desc: '从多个选项中选多个正确答案' },
  { value: 'fill-in-blank' as const, label: '填空题', icon: '✍️', desc: '输入答案，自动比对判分' },
  { value: 'short-answer' as const, label: '简答题', icon: '📝', desc: '手动输入，自查对照' },
] as const;

export function QuestionTypeSelector({ value, onChange }: QuestionTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {types.map(t => {
        const isSelected = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-colors text-center cursor-pointer
              ${isSelected
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
          >
            <span className="text-2xl">{t.icon}</span>
            <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
              {t.label}
            </span>
            <span className="text-xs text-slate-400 leading-tight">{t.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
