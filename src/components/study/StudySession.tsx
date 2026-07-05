import { useEffect } from 'react';
import { useStudyStore } from '../../stores/studyStore';
import type { SingleChoiceQuestion, MultiChoiceQuestion, FillInBlankQuestion, ShortAnswerQuestion } from '../../types';
import { StudyConfig } from './StudyConfig';
import { StudyProgress } from './StudyProgress';
import { MultipleChoice } from './MultipleChoice';
import { FillInBlank } from './FillInBlank';
import { ShortAnswer } from './ShortAnswer';
import { AnswerReveal } from './AnswerReveal';
import { SessionResults } from './SessionResults';

export function StudySession() {
  const phase = useStudyStore(s => s.phase);
  const questions = useStudyStore(s => s.questions);
  const currentIndex = useStudyStore(s => s.currentIndex);
  const session = useStudyStore(s => s.session);
  const reviewMode = useStudyStore(s => s.reviewMode);
  const submitAnswer = useStudyStore(s => s.submitAnswer);
  const revealAnswer = useStudyStore(s => s.revealAnswer);
  const nextQuestion = useStudyStore(s => s.nextQuestion);

  const currentQuestion = useStudyStore(s => s.currentQuestion());

  // 背题模式：填空和简答自动显示答案（必须在所有条件返回前调用）
  useEffect(() => {
    if (
      reviewMode &&
      phase === 'answering' &&
      currentQuestion &&
      (currentQuestion.type === 'fill-in-blank' || currentQuestion.type === 'short-answer')
    ) {
      revealAnswer();
    }
  }, [reviewMode, phase, currentQuestion, revealAnswer]);

  // Config 阶段
  if (phase === 'config') {
    return <StudyConfig />;
  }

  // Finished 阶段
  if (phase === 'finished') {
    return <SessionResults />;
  }

  // 无题目或 session 保护
  if (!currentQuestion || !session) {
    return <StudyConfig />;
  }

  const total = questions.length;
  const currentAnswer = session.answers[currentIndex] ?? null;

  // 根据当前 phase 和题目类型渲染对应组件
  const renderQuestionCard = () => {
    if (phase === 'reviewing' && currentAnswer) {
      return (
        <AnswerReveal
          question={currentQuestion}
          userAnswer={currentAnswer}
          onNext={() => {
            nextQuestion();
          }}
          isLast={currentIndex + 1 >= total}
        />
      );
    }

    if (phase === 'answering') {
      switch (currentQuestion.type) {
        case 'single-choice':
        case 'multi-choice':
          return (
            <MultipleChoice
              question={currentQuestion as SingleChoiceQuestion | MultiChoiceQuestion}
              disabled={false}
              onAnswer={(selectedIndices) => {
                submitAnswer({
                  questionId: currentQuestion.id,
                  selectedIndices,
                  questionType: currentQuestion.type,
                  textAnswer: undefined,
                });
              }}
            />
          );
        case 'fill-in-blank':
          return (
            <FillInBlank
              question={currentQuestion as FillInBlankQuestion}
              disabled={false}
              onAnswer={(text) => {
                submitAnswer({
                  questionId: currentQuestion.id,
                  textAnswer: text,
                  questionType: currentQuestion.type,
                  selectedIndices: undefined,
                });
              }}
            />
          );
        case 'short-answer':
          return (
            <ShortAnswer
              question={currentQuestion as ShortAnswerQuestion}
              disabled={false}
              onAnswer={(text) => {
                submitAnswer({
                  questionId: currentQuestion.id,
                  textAnswer: text,
                  questionType: currentQuestion.type,
                  selectedIndices: undefined,
                });
              }}
            />
          );
      }
    }

    return null;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <StudyProgress current={currentIndex} total={total} />

      {/* 题干卡片 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {currentQuestion.category}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
            {currentQuestion.type === 'single-choice' ? '单选题' :
             currentQuestion.type === 'multi-choice' ? '多选题' :
             currentQuestion.type === 'fill-in-blank' ? '填空题' : '简答题'}
          </span>
        </div>
        <h2 className="text-base font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap">
          {currentQuestion.prompt}
        </h2>
        {currentQuestion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {currentQuestion.tags.map((tag, idx) => (
              <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        {renderQuestionCard()}
      </div>
    </div>
  );
}
