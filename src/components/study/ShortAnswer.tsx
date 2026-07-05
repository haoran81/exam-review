import { useState, useRef, useEffect } from 'react';
import type { ShortAnswerQuestion } from '../../types';
import { Button } from '../shared/Button';

interface ShortAnswerProps {
  question: ShortAnswerQuestion;
  onAnswer: (text: string) => void;
  disabled: boolean;
}

export function ShortAnswer({ question, onAnswer, disabled }: ShortAnswerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
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

  return (
    <div className="space-y-4">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={disabled}
        placeholder="输入你的答案..."
        rows={4}
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg
          text-slate-800 placeholder-slate-400 resize-y
          focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none
          disabled:bg-slate-50 disabled:text-slate-500
          transition-colors"
        style={{ fontSize: 16, minHeight: 100 }}
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
