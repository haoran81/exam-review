import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export interface OverallStats {
  totalQuestions: number;
  totalSessions: number;
  totalAnswers: number;
  totalCorrect: number;
  accuracy: number; // 0-100
  wrongCount: number;
}

export interface CategoryAccuracy {
  category: string;
  total: number;
  correct: number;
  accuracy: number;
}

export function useOverallStats() {
  return useLiveQuery(async (): Promise<OverallStats> => {
    const totalQuestions = await db.questions.count();
    const sessions = await db.studySessions.toArray();
    const totalSessions = sessions.length;

    let totalAnswers = 0;
    let totalCorrect = 0;
    const wrongSet = new Set<string>();

    for (const s of sessions) {
      totalAnswers += s.answers.length;
      for (const a of s.answers) {
        if (a.isCorrect) {
          totalCorrect++;
        } else {
          wrongSet.add(a.questionId);
        }
      }
    }

    const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

    return {
      totalQuestions,
      totalSessions,
      totalAnswers,
      totalCorrect,
      accuracy,
      wrongCount: wrongSet.size,
    };
  }, []) ?? { totalQuestions: 0, totalSessions: 0, totalAnswers: 0, totalCorrect: 0, accuracy: 0, wrongCount: 0 };
}

export function useCategoryAccuracy() {
  return useLiveQuery(async (): Promise<CategoryAccuracy[]> => {
    const questions = await db.questions.toArray();
    const sessions = await db.studySessions.toArray();

    // 收集每道题的正确情况
    const perQuestion = new Map<string, { correct: number; total: number }>();
    for (const s of sessions) {
      for (const a of s.answers) {
        const prev = perQuestion.get(a.questionId) ?? { correct: 0, total: 0 };
        perQuestion.set(a.questionId, {
          correct: prev.correct + (a.isCorrect ? 1 : 0),
          total: prev.total + 1,
        });
      }
    }

    // 按分类聚合
    const catMap = new Map<string, { correct: number; total: number }>();
    for (const q of questions) {
      const stats = perQuestion.get(q.id);
      if (!stats || stats.total === 0) continue;

      const cat = q.category || '未分类';
      const prev = catMap.get(cat) ?? { correct: 0, total: 0 };
      catMap.set(cat, {
        correct: prev.correct + stats.correct,
        total: prev.total + stats.total,
      });
    }

    return [...catMap.entries()]
      .map(([category, { correct, total }]) => ({
        category,
        total,
        correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy); // 按准确率升序（最差的在前面）
  }, []) ?? [];
}
