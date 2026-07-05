import { create } from 'zustand';
import type { Question, StudySession, StudyAnswer } from '../types';
import { generateId } from '../utils/idGenerator';
import { checkAnswer } from '../utils/studyLogic';
import { db } from '../db';

type StudyPhase = 'config' | 'answering' | 'reviewing' | 'finished';

interface StudyState {
  // 会话配置
  phase: StudyPhase;
  session: StudySession | null;
  currentIndex: number;
  questions: Question[]; // 当前会话的题目列表（已排序）
  reviewMode: boolean; // 背题模式：填空/简答直接显示答案

  // 动作
  initSession: (questions: Question[], source?: 'all' | 'wrong', category?: string, reviewMode?: boolean) => void;
  submitAnswer: (answer: Omit<StudyAnswer, 'isCorrect' | 'answeredAt'> & { questionType: string }) => void;
  markSelfCheck: (correct: boolean) => void;
  nextQuestion: () => void;
  finishSession: () => void;
  reset: () => void;
  revealAnswer: () => void;

  // 当前题目
  currentQuestion: () => Question | null;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  phase: 'config',
  session: null,
  currentIndex: 0,
  questions: [],
  reviewMode: false,

  initSession: (questions, source = 'all', category, reviewMode = false) => {
    const session: StudySession = {
      id: generateId(),
      startedAt: Date.now(),
      questionIds: questions.map(q => q.id),
      answers: [],
      category,
      source,
    };
    set({ session, questions, currentIndex: 0, phase: 'answering', reviewMode });
  },

  submitAnswer: (answer) => {
    const { questions, currentIndex, session } = get();
    if (!session) return;

    const question = questions[currentIndex];
    if (!question) return;

    const isCorrect = checkAnswer(question, {
      ...answer,
      isCorrect: false, // placeholder
      answeredAt: Date.now(),
    });

    const studyAnswer: StudyAnswer = {
      ...answer,
      isCorrect,
      answeredAt: Date.now(),
    };

    // 更新 stats
    db.questionStats.get(question.id).then(stats => {
      if (stats) {
        db.questionStats.update(question.id, {
          timesSeen: stats.timesSeen + 1,
          timesCorrect: stats.timesCorrect + (isCorrect ? 1 : 0),
          lastAnsweredAt: Date.now(),
          streakCorrect: isCorrect ? stats.streakCorrect + 1 : 0,
        });
      } else {
        db.questionStats.add({
          questionId: question.id,
          timesSeen: 1,
          timesCorrect: isCorrect ? 1 : 0,
          lastAnsweredAt: Date.now(),
          streakCorrect: isCorrect ? 1 : 0,
        });
      }
    });

    set({
      session: {
        ...session,
        answers: [...session.answers, studyAnswer],
      },
      phase: 'reviewing',
    });
  },

  // 背题模式：跳过输入直接显示答案
  revealAnswer: () => {
    const { session, currentIndex, questions } = get();
    if (!session || !questions[currentIndex]) return;

    const question = questions[currentIndex];
    // 不记录 stats（背题模式不算答题）
    const studyAnswer: StudyAnswer = {
      questionId: question.id,
      isCorrect: false, // 背题模式无对错
      answeredAt: Date.now(),
    };

    set({
      session: {
        ...session,
        answers: [...session.answers, studyAnswer],
      },
      phase: 'reviewing',
    });
  },

  markSelfCheck: (correct) => {
    const { session, currentIndex, questions } = get();
    if (!session || !questions[currentIndex]) return;

    const question = questions[currentIndex];
    // 更新当前题目已有答案的 isCorrect，不是追加新记录
    const answers = [...session.answers];
    if (answers[currentIndex]) {
      answers[currentIndex] = { ...answers[currentIndex], isCorrect: correct };
    }

    // 更新 stats
    db.questionStats.get(question.id).then(stats => {
      if (stats) {
        db.questionStats.update(question.id, {
          timesSeen: stats.timesSeen + 1,
          timesCorrect: stats.timesCorrect + (correct ? 1 : 0),
          lastAnsweredAt: Date.now(),
          streakCorrect: correct ? stats.streakCorrect + 1 : 0,
        });
      } else {
        db.questionStats.add({
          questionId: question.id,
          timesSeen: 1,
          timesCorrect: correct ? 1 : 0,
          lastAnsweredAt: Date.now(),
          streakCorrect: correct ? 1 : 0,
        });
      }
    });

    set({
      session: { ...session, answers },
      phase: 'reviewing',
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex + 1 >= questions.length) {
      get().finishSession();
      return;
    }
    set({ currentIndex: currentIndex + 1, phase: 'answering' });
  },

  finishSession: () => {
    const { session } = get();
    if (!session) return;
    const completedSession: StudySession = {
      ...session,
      completedAt: Date.now(),
    };
    db.studySessions.add(completedSession);
    set({ session: completedSession, phase: 'finished' });
  },

  reset: () => {
    set({ phase: 'config', session: null, currentIndex: 0, questions: [] });
  },

  currentQuestion: () => {
    const { questions, currentIndex } = get();
    return questions[currentIndex] ?? null;
  },
}));
