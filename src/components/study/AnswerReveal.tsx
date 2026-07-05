import { useState } from 'react';
import type { Question, StudyAnswer } from '../../types';
import { useStudyStore } from '../../stores/studyStore';
import { Button } from '../shared/Button';

interface AnswerRevealProps {
  question: Question;
  userAnswer: StudyAnswer;
  onNext: () => void;
  isLast: boolean;
}

export function AnswerReveal({ question, userAnswer, onNext, isLast }: AnswerRevealProps) {
  const markSelfCheck = useStudyStore(s => s.markSelfCheck);
  const reviewMode = useStudyStore(s => s.reviewMode);
  const [selfChecked, setSelfChecked] = useState(false);
  const [revealChoice, setRevealChoice] = useState<boolean | null>(null); // 背题模式：null=未选, true=会了, false=还不会
  const isShortAnswer = question.type === 'short-answer';
  const isFillInBlank = question.type === 'fill-in-blank';
  const isCorrect = userAnswer.isCorrect;

  // 背题模式下无用户输入，不算对错
  const isRevealOnly = reviewMode && (isShortAnswer || isFillInBlank) &&
    !userAnswer.selectedIndices?.length && !userAnswer.textAnswer;

  const handleSelfCheck = (correct: boolean) => {
    setSelfChecked(true);
    markSelfCheck(correct);
  };

  const handleRevealChoice = (knew: boolean) => {
    setRevealChoice(knew);
    markSelfCheck(knew);
  };

  const handleNext = () => {
    onNext();
  };

  // 渲染正确答案区域
  const renderCorrectAnswer = () => {
    switch (question.type) {
      case 'single-choice':
        return (
          <div className="mt-2">
            <span className="text-sm text-slate-500">正确答案：</span>
            <span className="text-sm font-semibold text-green-700">
              {String.fromCharCode(65 + question.correctIndex)}. {question.options[question.correctIndex]}
            </span>
          </div>
        );
      case 'multi-choice':
        return (
          <div className="mt-2">
            <span className="text-sm text-slate-500">正确答案：</span>
            <span className="text-sm font-semibold text-green-700">
              {question.correctIndices
                .map(i => `${String.fromCharCode(65 + i)}. ${question.options[i]}`)
                .join('；')}
            </span>
          </div>
        );
      case 'fill-in-blank':
        return (
          <div className="mt-2">
            <span className="text-sm text-slate-500">可接受答案：</span>
            <span className="text-sm font-semibold text-green-700">
              {question.acceptableAnswers.join(' / ')}
              {question.caseSensitive && <span className="text-xs text-slate-400 ml-1">（大小写敏感）</span>}
            </span>
          </div>
        );
    }
  };

  // 渲染用户答案
  const renderUserAnswer = () => {
    switch (question.type) {
      case 'single-choice':
        return userAnswer.selectedIndices && userAnswer.selectedIndices.length > 0
          ? `${String.fromCharCode(65 + userAnswer.selectedIndices[0])}. ${question.options[userAnswer.selectedIndices[0]]}`
          : '未作答';
      case 'multi-choice':
        return userAnswer.selectedIndices && userAnswer.selectedIndices.length > 0
          ? userAnswer.selectedIndices
              .map(i => `${String.fromCharCode(65 + i)}. ${question.options[i]}`)
              .join('；')
          : '未作答';
      case 'fill-in-blank':
        return userAnswer.textAnswer || '未作答';
      case 'short-answer':
        return userAnswer.textAnswer || '未作答';
    }
  };

  return (
    <div className="space-y-5">
      {/* 结果标题 */}
      <div className="flex flex-col items-center py-4">
        {isRevealOnly ? (
          <>
            <span className="text-5xl mb-2">📖</span>
            <h3 className="text-lg font-bold text-slate-700">
              {revealChoice === null ? '回忆一下，能答对吗？' : '答案揭晓'}
            </h3>
          </>
        ) : isShortAnswer && !selfChecked ? (
          <>
            <span className="text-5xl mb-2">🤔</span>
            <h3 className="text-lg font-bold text-slate-800">请对照参考答案自行判断</h3>
          </>
        ) : isCorrect ? (
          <>
            <span className="text-5xl mb-2">✅</span>
            <h3 className="text-lg font-bold text-green-700">回答正确！</h3>
          </>
        ) : (
          <>
            <span className="text-5xl mb-2">❌</span>
            <h3 className="text-lg font-bold text-red-600">回答错误</h3>
          </>
        )}
      </div>

      {/* 你的答案 vs 正确答案（非简答题普通模式） */}
      {!isShortAnswer && !isRevealOnly && (
        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
          <div>
            <span className="text-sm text-slate-500">你的答案：</span>
            <span className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
              {renderUserAnswer()}
            </span>
          </div>
          {!isCorrect && renderCorrectAnswer()}
        </div>
      )}

      {/* 背题模式答案区（始终占位，选中后才显示内容） */}
      {isRevealOnly && (
        <div className="bg-slate-50 rounded-lg p-4 space-y-3 min-h-[60px]">
          {revealChoice === null ? (
            <p className="text-sm text-slate-400 text-center">点击下方按钮后揭晓答案</p>
          ) : isFillInBlank ? (
            <div>
              <span className="text-sm text-slate-500">正确答案：</span>
              <span className="text-sm font-semibold text-green-700">
                {question.acceptableAnswers.join(' / ')}
                {question.caseSensitive && <span className="text-xs text-slate-400 ml-1">（大小写敏感）</span>}
              </span>
            </div>
          ) : isShortAnswer ? (
            <>
              <div>
                <span className="text-sm text-slate-500">参考答案：</span>
                <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{question.modelAnswer}</p>
              </div>
              {question.keyPoints.length > 0 && (
                <div>
                  <span className="text-sm text-slate-500">关键得分点：</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {question.keyPoints.map((kp, i) => (
                      <li key={i} className="text-sm text-slate-700">{kp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* 简答题普通模式：参考答案 + 自查按钮 */}
      {isShortAnswer && !isRevealOnly && (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div>
              <span className="text-sm text-slate-500">你的答案：</span>
              <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{renderUserAnswer()}</p>
            </div>
            <div>
              <span className="text-sm text-slate-500">参考答案：</span>
              <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{question.modelAnswer}</p>
            </div>
            {question.keyPoints.length > 0 && (
              <div>
                <span className="text-sm text-slate-500">关键得分点：</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {question.keyPoints.map((kp, i) => (
                    <li key={i} className="text-sm text-slate-700">{kp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 自查按钮 */}
          {!selfChecked && (
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => handleSelfCheck(true)}>
                ✅ 我答对了
              </Button>
              <Button variant="danger" size="lg" className="flex-1" onClick={() => handleSelfCheck(false)}>
                ❌ 我答错了
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 解析（背题模式下选中后才显示） */}
      {(!isRevealOnly || revealChoice !== null) && (
        <div className="bg-blue-50 rounded-lg p-4">
          <span className="text-sm font-semibold text-blue-800">💡 解析</span>
          <p className="text-sm text-blue-900 mt-1 whitespace-pre-wrap">{question.explanation}</p>
        </div>
      )}

      {/* ===== 背题模式按钮区（始终同一位置） ===== */}
      {isRevealOnly && (
        <div className="space-y-3">
          {/* 选中后的确认条 */}
          {revealChoice !== null && (
            <div className={`rounded-lg p-2.5 text-center font-medium text-sm
              ${revealChoice ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {revealChoice ? '✅ 已标记：记住了' : '❌ 已标记：没记住'}
            </div>
          )}
          {/* 两个按钮始终在固定位置 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleRevealChoice(false)}
              className={`flex-1 py-3 px-3 rounded-xl text-sm font-semibold border-2 transition-colors min-h-[52px]
                ${revealChoice === false
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:bg-red-50'}`}
            >
              ❌ 没记住
            </button>
            <button
              type="button"
              onClick={() => handleRevealChoice(true)}
              className={`flex-1 py-3 px-3 rounded-xl text-sm font-semibold border-2 transition-colors min-h-[52px]
                ${revealChoice === true
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-green-50'}`}
            >
              ✅ 记住了
            </button>
          </div>
          {/* 下一题按钮（选中后才出现，在按钮下方不会挤走按钮） */}
          {revealChoice !== null && (
            <Button variant="primary" size="lg" className="w-full" onClick={() => onNext()}>
              {isLast ? '📊 查看结果' : '➡️ 下一题'}
            </Button>
          )}
        </div>
      )}

      {/* 普通模式：下一题 / 查看结果 按钮 */}
      {!isRevealOnly && (isShortAnswer ? selfChecked : true) && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleNext}
        >
          {isLast ? '查看结果' : '下一题'}
        </Button>
      )}
    </div>
  );
}
