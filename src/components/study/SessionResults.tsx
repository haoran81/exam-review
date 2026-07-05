import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudyStore } from '../../stores/studyStore';
import { calcSessionScore } from '../../utils/studyLogic';
import { Button } from '../shared/Button';
import type { Question } from '../../types';

export function SessionResults() {
  const navigate = useNavigate();
  const session = useStudyStore(s => s.session);
  const questions = useStudyStore(s => s.questions);
  const reset = useStudyStore(s => s.reset);
  const initSession = useStudyStore(s => s.initSession);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!session) return null;

  const { total, correct } = calcSessionScore(session.answers);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // 颜色判定
  const ringColor = accuracy >= 80 ? '#16a34a' : accuracy >= 50 ? '#4f46e5' : '#d97706';

  // 构建 questionId → answer 映射
  const answerMap = new Map(session.answers.map(a => [a.questionId, a]));

  // 获取每道题的答题情况
  const questionResults = session.questionIds.map(qid => {
    const question = questions.find(q => q.id === qid);
    const answer = answerMap.get(qid);
    return {
      question,
      answer,
      isCorrect: answer?.isCorrect ?? false,
    };
  });

  const handleRetry = () => {
    reset();
  };

  const handleReviewWrong = () => {
    const wrongQuestions = questionResults
      .filter(r => !r.isCorrect && r.question)
      .map(r => r.question!) as Question[];
    if (wrongQuestions.length > 0) {
      initSession(wrongQuestions, 'wrong');
    }
  };

  const handleGoHome = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* 完成标题 */}
      <div className="text-center">
        <span className="text-6xl block mb-3">🎉</span>
        <h2 className="text-2xl font-bold text-slate-800">练习完成！</h2>
        <p className="text-sm text-slate-500 mt-1">
          {session.source === 'wrong' ? '错题复习' : '全部题目'} · {total} 题
        </p>
      </div>

      {/* 正确率环形图 */}
      <div className="flex justify-center">
        <div
          className="relative flex items-center justify-center"
          style={{ width: 160, height: 160 }}
        >
          {/* 环形背景 + 进度 */}
          <svg width="160" height="160" viewBox="0 0 160 160" className="absolute inset-0">
            <circle cx="80" cy="80" r="68" fill="none" stroke="#e2e8f0" strokeWidth="16" />
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke={ringColor}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${(accuracy / 100) * 428} 428`}
              transform="rotate(-90 80 80)"
              className="transition-all duration-700"
            />
          </svg>
          {/* 中间文字 */}
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-800">{accuracy}%</div>
            <div className="text-xs text-slate-500">{correct}/{total}</div>
          </div>
        </div>
      </div>

      {/* 题目缩略列表 */}
      {questionResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-600">答题详情</h3>
          <div className="space-y-2">
            {questionResults.map((result, idx) => (
              <div key={result.question?.id ?? idx}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === (result.question?.id ?? '') ? null : (result.question?.id ?? ''))}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200
                    hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <span className="flex-shrink-0 text-lg">
                    {result.isCorrect ? '✅' : '❌'}
                  </span>
                  <span className="flex-1 text-sm text-slate-700 truncate">
                    {idx + 1}. {result.question?.prompt ?? '(题目已删除)'}
                  </span>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {result.question?.type === 'single-choice' ? '单选' :
                     result.question?.type === 'multi-choice' ? '多选' :
                     result.question?.type === 'fill-in-blank' ? '填空' : '简答'}
                  </span>
                </button>

                {/* 展开详情 */}
                {expandedId === (result.question?.id ?? '') && result.question && (
                  <div className="ml-10 mt-1 p-3 bg-slate-50 rounded-lg text-sm space-y-1">
                    <p className="text-slate-600 whitespace-pre-wrap">{result.question.prompt}</p>
                    {result.answer?.textAnswer && (
                      <p className="text-slate-500">你的答案：{result.answer.textAnswer}</p>
                    )}
                    <p className="text-slate-500">{result.question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部按钮 */}
      <div className="space-y-3 pt-4">
        <Button variant="primary" size="lg" className="w-full" onClick={handleRetry}>
          再刷一次
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={questionResults.filter(r => !r.isCorrect).length === 0}
          onClick={handleReviewWrong}
        >
          错题复习
        </Button>
        <Button variant="ghost" size="lg" className="w-full" onClick={handleGoHome}>
          返回首页
        </Button>
      </div>
    </div>
  );
}
