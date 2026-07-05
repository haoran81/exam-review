import { useState } from 'react';
import type { SingleChoiceQuestion, MultiChoiceQuestion } from '../../types';
import { Button } from '../shared/Button';

interface MultipleChoiceProps {
  question: SingleChoiceQuestion | MultiChoiceQuestion;
  onAnswer: (selectedIndices: number[]) => void;
  disabled: boolean;
  revealedCorrect?: boolean;
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function MultipleChoice({
  question,
  onAnswer,
  disabled,
  revealedCorrect,
}: MultipleChoiceProps) {
  const isSingle = question.type === 'single-choice';
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (idx: number) => {
    if (disabled) return;
    if (isSingle) {
      setSelected([idx]);
      // 单选：点击即自动提交
      onAnswer([idx]);
      return;
    }
    // 多选：切换选中状态
    setSelected(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const isCorrectIndex = (idx: number) => {
    if (question.type === 'single-choice') return question.correctIndex === idx;
    return question.correctIndices.includes(idx);
  };

  const getOptionStyle = (idx: number) => {
    const isSelected = selected.includes(idx);

    if (disabled) {
      if (revealedCorrect && isCorrectIndex(idx)) {
        return 'border-green-500 bg-green-50';
      }
      if (isSelected && !isCorrectIndex(idx)) {
        return 'border-red-500 bg-red-50';
      }
      if (isSelected && isCorrectIndex(idx)) {
        return 'border-green-500 bg-green-50';
      }
      return 'border-slate-200 bg-white opacity-60';
    }

    if (isSelected) {
      return 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500';
    }
    return 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50';
  };

  const handleSubmit = () => {
    if (disabled || selected.length === 0) return;
    onAnswer(selected);
  };

  return (
    <div className="space-y-3">
      {question.options.map((opt, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => toggle(idx)}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg border-2 text-left
            transition-colors cursor-pointer min-h-[52px]
            ${getOptionStyle(idx)}
            ${disabled ? 'cursor-default' : ''}`}
        >
          <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold
            ${selected.includes(idx) && !disabled ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {LABELS[idx]}
          </span>
          <span className="text-slate-800 text-sm leading-snug flex-1">{opt}</span>
          {disabled && isCorrectIndex(idx) && (
            <span className="text-green-600 text-sm font-medium flex-shrink-0">✓ 正确</span>
          )}
          {disabled && selected.includes(idx) && !isCorrectIndex(idx) && (
            <span className="text-red-600 text-sm font-medium flex-shrink-0">✗</span>
          )}
        </button>
      ))}

      {/* 多选题的提交按钮 */}
      {!isSingle && !disabled && (
        <Button
          variant="primary"
          size="lg"
          className="w-full mt-4"
          disabled={selected.length === 0}
          onClick={handleSubmit}
        >
          提交答案
        </Button>
      )}
    </div>
  );
}
