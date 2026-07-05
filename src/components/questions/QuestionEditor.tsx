import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Question, QuestionType, SingleChoiceQuestion, MultiChoiceQuestion, FillInBlankQuestion, ShortAnswerQuestion } from '../../types';
import { useQuestion, useQuestionActions } from '../../hooks/useQuestions';

import { Button } from '../shared/Button';
import { TagInput } from '../shared/TagInput';
import { QuestionTypeSelector } from './QuestionTypeSelector';

export function QuestionEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const existing = useQuestion(id ?? '');
  const { create, update } = useQuestionActions();

  const isEdit = Boolean(id && existing);

  // 核心状态
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

  // 编辑模式：用已有题目填充表单
  useEffect(() => {
    if (!existing || !isEdit) return;
    setType(existing.type);
    setCategory(existing.category);
    setTags(existing.tags);
    setPrompt(existing.prompt);
    setExplanation(existing.explanation);
    switch (existing.type) {
      case 'single-choice': {
        const q = existing as SingleChoiceQuestion;
        setOptions(q.options);
        setCorrectIndex(q.correctIndex);
        break;
      }
      case 'multi-choice': {
        const q = existing as MultiChoiceQuestion;
        setOptions(q.options);
        setCorrectIndices(q.correctIndices);
        break;
      }
      case 'fill-in-blank': {
        const q = existing as FillInBlankQuestion;
        setAcceptableAnswers(q.acceptableAnswers);
        setCaseSensitive(q.caseSensitive);
        break;
      }
      case 'short-answer': {
        const q = existing as ShortAnswerQuestion;
        setModelAnswer(q.modelAnswer);
        setKeyPoints(q.keyPoints);
        break;
      }
    }
  }, [existing, isEdit]);

  // 切换题型时重置选项类状态
  const handleTypeChange = (newType: QuestionType) => {
    if (newType === type) return;
    setType(newType);
    // 重置题型特有字段
    setOptions(['', '']);
    setCorrectIndex(0);
    setCorrectIndices([]);
    setAcceptableAnswers(['']);
    setCaseSensitive(false);
    setModelAnswer('');
    setKeyPoints([]);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const base = {
      category: category.trim(),
      tags,
      prompt: prompt.trim(),
      explanation: explanation.trim(),
    };

    const buildData = () => {
      switch (type) {
        case 'single-choice':
          return { ...base, type: 'single-choice' as const, options, correctIndex };
        case 'multi-choice':
          return { ...base, type: 'multi-choice' as const, options, correctIndices };
        case 'fill-in-blank':
          return { ...base, type: 'fill-in-blank' as const, acceptableAnswers: acceptableAnswers.filter(a => a.trim()), caseSensitive };
        case 'short-answer':
          return { ...base, type: 'short-answer' as const, modelAnswer: modelAnswer.trim(), keyPoints: keyPoints.filter(k => k.trim()) };
      }
    };

    const data = buildData() as Omit<Question, 'id' | 'createdAt' | 'updatedAt'>;

    if (isEdit && id) {
      await update(id, data);
    } else {
      await create(data);
    }
    navigate('/questions');
  };

  const addOption = () => setOptions([...options, '']);
  const updateOption = (i: number, val: string) => {
    const next = [...options];
    next[i] = val;
    setOptions(next);
  };
  const removeOption = (i: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
    if (type === 'single-choice') {
      if (correctIndex === i) setCorrectIndex(0);
      else if (correctIndex > i) setCorrectIndex(correctIndex - 1);
    } else {
      setCorrectIndices(correctIndices.filter(idx => idx !== i).map(idx => (idx > i ? idx - 1 : idx)));
    }
  };

  const toggleCorrectIndex = (i: number) => {
    if (correctIndices.includes(i)) {
      setCorrectIndices(correctIndices.filter(idx => idx !== i));
    } else {
      setCorrectIndices([...correctIndices, i]);
    }
  };

  const addAnswer = () => setAcceptableAnswers([...acceptableAnswers, '']);
  const updateAnswer = (i: number, val: string) => {
    const next = [...acceptableAnswers];
    next[i] = val;
    setAcceptableAnswers(next);
  };
  const removeAnswer = (i: number) => {
    if (acceptableAnswers.length <= 1) return;
    setAcceptableAnswers(acceptableAnswers.filter((_, idx) => idx !== i));
  };

  const removeKeyPoint = (i: number) => {
    setKeyPoints(keyPoints.filter((_, idx) => idx !== i));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-slate-900">
        {isEdit ? '编辑题目' : '新建题目'}
      </h1>

      {/* 题型选择 */}
      <section>
        <label className="block text-sm font-medium text-slate-700 mb-2">题型</label>
        <QuestionTypeSelector value={type} onChange={handleTypeChange} />
      </section>

      {/* 分类 + 标签 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="如 JavaScript、操作系统"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">标签</label>
          <TagInput tags={tags} onChange={setTags} placeholder="输入标签后回车" />
        </div>
      </section>

      {/* 题干 */}
      <section>
        <label className="block text-sm font-medium text-slate-700 mb-1">题干</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="输入题目内容…"
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
        />
      </section>

      {/* 根据 type 渲染不同选项区 */}
      {(type === 'single-choice' || type === 'multi-choice') && (
        <section>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {type === 'single-choice' ? '选项（点击单选按钮标记正确答案）' : '选项（勾选所有正确答案）'}
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                {type === 'single-choice' ? (
                  <input
                    type="radio"
                    name="correct"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                    className="w-4 h-4 text-indigo-600 accent-indigo-600"
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={correctIndices.includes(i)}
                    onChange={() => toggleCorrectIndex(i)}
                    className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded"
                  />
                )}
                <input
                  type="text"
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  placeholder={`选项 ${String.fromCharCode(65 + i)}`}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  disabled={options.length <= 2}
                  className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + 添加选项
          </button>
        </section>
      )}

      {type === 'fill-in-blank' && (
        <section>
          <label className="block text-sm font-medium text-slate-700 mb-2">可接受答案</label>
          <div className="space-y-2">
            {acceptableAnswers.map((ans, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ans}
                  onChange={e => updateAnswer(i, e.target.value)}
                  placeholder={`可接受答案 ${i + 1}`}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeAnswer(i)}
                  disabled={acceptableAnswers.length <= 1}
                  className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAnswer}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + 添加答案
          </button>

          {/* 大小写敏感开关 */}
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={e => setCaseSensitive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded"
            />
            <span className="text-sm text-slate-700">区分大小写</span>
          </label>
        </section>
      )}

      {type === 'short-answer' && (
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">参考答案</label>
            <textarea
              value={modelAnswer}
              onChange={e => setModelAnswer(e.target.value)}
              placeholder="输入参考答案…"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">关键得分点</label>
            <div className="space-y-2">
              {keyPoints.map((kp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={kp}
                    onChange={e => {
                      const next = [...keyPoints];
                      next[i] = e.target.value;
                      setKeyPoints(next);
                    }}
                    placeholder={`得分点 ${i + 1}`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeKeyPoint(i)}
                    className="p-2 text-slate-400 hover:text-red-500 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setKeyPoints([...keyPoints, ''])}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + 添加得分点
            </button>
          </div>
        </section>
      )}

      {/* 解析 */}
      <section>
        <label className="block text-sm font-medium text-slate-700 mb-1">解析</label>
        <textarea
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          placeholder="答完题后显示的讲解…"
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
        />
      </section>

      {/* 保存按钮 */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" size="lg" onClick={() => navigate('/questions')}>
          取消
        </Button>
        <Button variant="primary" size="lg" onClick={handleSubmit} disabled={!prompt.trim()}>
          {isEdit ? '保存修改' : '创建题目'}
        </Button>
      </div>
    </div>
  );
}
