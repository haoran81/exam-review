import { useState, useRef, useEffect } from 'react';
import type { FillInBlankQuestion } from '../../types';
import { Button } from '../shared/Button';

interface FillInBlankProps {
  question: FillInBlankQuestion;
  onAnswer: (text: string) => void;
  disabled: boolean;
}

export function FillInBlank({ question, onAnswer, disabled }: FillInBlankProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // 每次题目切换时清空输入
  useEffect(() => {
    setValue('');
  }, [question.id]);

  const handleSubmit = () => {
    if (disabled || !value.trim()) return;
    onAnswer(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="输入你的答案..."
        inputMode="text"
        autoComplete="off"
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg
          text-slate-800 placeholder-slate-400
          focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none
          disabled:bg-slate-50 disabled:text-slate-500
          transition-colors"
        style={{ fontSize: 16 }}
      />
      {!disabled && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!value.trim()}
          onClick={handleSubmit}
        >
          提交答案
        </Button>
      )}
    </div>
  );
}
