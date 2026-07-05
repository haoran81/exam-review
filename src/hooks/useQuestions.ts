import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Question, QuestionFilters } from '../types';
import { generateId } from '../utils/idGenerator';
import { db } from '../db';

export function useQuestions(filters?: QuestionFilters) {
  const questions = useLiveQuery(async () => {
    let collection = db.questions.orderBy('createdAt').reverse();

    const arr = await collection.toArray();

    let result = arr;
    if (filters?.category) {
      result = result.filter(q => q.category === filters.category);
    }
    if (filters?.type) {
      result = result.filter(q => q.type === filters.type);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(q =>
        q.prompt.toLowerCase().includes(s) ||
        q.category.toLowerCase().includes(s) ||
        q.tags.some(t => t.toLowerCase().includes(s))
      );
    }
    return result;
  }, [filters?.category, filters?.type, filters?.search]);

  return questions ?? [];
}

export function useQuestion(id: string) {
  return useLiveQuery(() => db.questions.get(id), [id]);
}

export function useCategories() {
  return useLiveQuery(async () => {
    const all = await db.questions.toArray();
    const cats = new Set<string>();
    for (const q of all) {
      if (q.category) cats.add(q.category);
    }
    return [...cats].sort();
  }, []) ?? [];
}

export function useQuestionActions() {
  const create = useCallback(async (data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const question = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as Question;
    await db.questions.add(question);
    return question;
  }, []);

  const update = useCallback(async (id: string, data: Partial<Question>) => {
    const now = Date.now();
    await db.questions.update(id, { ...data, updatedAt: now });
  }, []);

  const remove = useCallback(async (id: string) => {
    await db.questions.delete(id);
    // 同时清理关联的统计
    await db.questionStats.delete(id);
  }, []);

  const bulkAdd = useCallback(async (questions: Question[]) => {
    await db.questions.bulkAdd(questions);
  }, []);

  const removeAll = useCallback(async () => {
    await db.questions.clear();
    await db.questionStats.clear();
  }, []);

  return { create, update, remove, bulkAdd, removeAll };
}
