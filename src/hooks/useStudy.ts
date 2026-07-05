import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Question, QuestionType, StudySession } from '../types';
import { db } from '../db';
import { useStudyStore } from '../stores/studyStore';

/** 获取所有会话历史 */
export function useSessionHistory(limit = 10) {
  return useLiveQuery(async () => {
    const sessions = await db.studySessions
      .orderBy('startedAt')
      .reverse()
      .limit(limit)
      .toArray();

    // 给每个 session 附带题目详情
    const result: { session: StudySession; questions: Question[] }[] = [];
    for (const s of sessions) {
      const questions = await db.questions.bulkGet(s.questionIds);
      result.push({ session: s, questions: questions.filter(Boolean) as Question[] });
    }
    return result;
  }, [limit]) ?? [];
}

/** 获取错题列表（所有历史会话中答错的题，去重） */
export function useWrongQuestions() {
  return useLiveQuery(async () => {
    const sessions = await db.studySessions.toArray();
    const wrongIds = new Set<string>();
    for (const s of sessions) {
      for (const a of s.answers) {
        if (!a.isCorrect) wrongIds.add(a.questionId);
      }
    }
    const questions = await db.questions.bulkGet([...wrongIds]);
    return questions.filter(Boolean) as Question[];
  }, []) ?? [];
}

/** 启动刷题 */
export function useStartStudy() {
  const initSession = useStudyStore(s => s.initSession);

  return useCallback(async (options?: { category?: string; source?: 'all' | 'wrong'; reviewMode?: boolean; types?: QuestionType[] }) => {
    let questions: Question[];

    if (options?.source === 'wrong') {
      const sessions = await db.studySessions.toArray();
      const wrongIds = new Set<string>();
      for (const s of sessions) {
        for (const a of s.answers) {
          if (!a.isCorrect) wrongIds.add(a.questionId);
        }
      }
      const arr = await db.questions.bulkGet([...wrongIds]);
      questions = arr.filter(Boolean) as Question[];
    } else if (options?.category) {
      questions = await db.questions.where('category').equals(options.category).toArray();
    } else {
      questions = await db.questions.toArray();
    }

    // 按题型筛选
    if (options?.types && options.types.length > 0) {
      questions = questions.filter(q => options.types!.includes(q.type));
    }

    if (questions.length === 0) return false;

    initSession(questions, options?.source ?? 'all', options?.category, options?.reviewMode ?? false);
    return true;
  }, [initSession]);
}
