import Dexie, { type Table } from 'dexie';
import type { Question, StudySession, QuestionStats } from '../types';

export class ExamReviewDB extends Dexie {
  questions!: Table<Question, string>;
  studySessions!: Table<StudySession, string>;
  questionStats!: Table<QuestionStats, string>;

  constructor() {
    super('ExamReviewDB');
    this.version(1).stores({
      questions: 'id, type, category, createdAt',
      studySessions: 'id, startedAt, category',
      questionStats: 'questionId, timesSeen, lastAnsweredAt',
    });
  }
}

export const db = new ExamReviewDB();
